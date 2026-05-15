# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start dev server (Vite HMR)
pnpm build        # TypeScript check + production build
pnpm lint         # ESLint
pnpm preview      # preview production build locally
```

No test suite is configured.

## Required environment variables

Create a `.env` file in the project root (Vite `VITE_` prefix required):

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL (default: `http://localhost:5000`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `VITE_GOOGLE_AI_API_KEY_OLD` | Google Gemini API key (used by `RealEstateEstimator`) |
| `VITE_CLOUD_NAME` | Cloudinary cloud name |
| `VITE_UPLOAD_PRESET_NAME` | Cloudinary upload preset param name |
| `VITE_PRESET_VALUE` | Cloudinary upload preset value |

The app expects a separate backend running (Node/Express assumed) at `VITE_API_URL` for listings, auth, agents, notifications, and LiqPay endpoints.

## Architecture

### Routing and page structure

`src/App.tsx` — root component that wraps everything in `GoogleOAuthProvider` → `LanguageProvider` → `BrowserRouter`. All routes are flat and defined here.

- **Pages** (`src/pages/`) — full-page views: `Home`, `Listings`, `About`, `Services`, `Agents`, `AddAgent`, `RegistrationForm`, `Notification`, `Agreement`, `ForgotPassword`, `ResetPassword`
- **Components** (`src/components/`) — both shared UI (Header, Footer) and feature-specific components embedded in pages (Details, LeafletMaps, MyListings, MyComments, LiqPayButton, RealEstateEstimator, etc.)

The `Listings` page is reused for both creating (`/listings/new/:listingType`) and editing (`/listings/edit/:listingId?`) listings.

### State management (Redux Toolkit)

Store is configured in `src/app/store.ts`. Always use typed hooks from `src/app/hooks.ts`:

```ts
import { useAppDispatch, useAppSelector } from '../app/hooks';
```

Slices:
- `auth` — `isLogin` flag (`authSlice`)
- `registration` — `isRegistered`, `userName`, `userId`; **auto-persisted to `localStorage`** via `registrationMiddleware`
- `filter` — listing search filters (listingType, price range, propertyType, novelty)
- `filterMap` — map-specific filter (destination, range, listingType, propertyType)
- `notification` — criteria for email notification alerts
- `upLoadImages` — image upload state
- `scroll` — scroll position

### Authentication

`src/services/useAuth.ts` — centralised auth hook used across Login, RegistrationForm, and any component needing session info. It handles:
- `handleAuthSuccess()` — writes user to Redux + localStorage, then redirects
- `handleLogout()` — calls `POST /logout` on the backend, clears localStorage + Redux
- `checkAuth()` — calls `GET /check-auth` with `credentials: 'include'` to verify server session

Sessions are cookie-based (`credentials: 'include'` on all API calls). Registration state is separately persisted in `localStorage` as `registrationState`.

### Localisation

`src/context/LanguageContext.tsx` — provides `language` (`'uk' | 'en' | 'ru'`) and `setLanguage` via `useLanguage()` hook. Default language is `'uk'`.

UI text is stored in two TypeScript objects:
- `src/contents/allUaTexts.ts` — Ukrainian (source of truth)
- `src/contents/allEnTexts.ts` — English translations

Pattern used throughout components:
```ts
const contents = language === "en" ? allEnTexts : allUaTexts;
```

The `src/locales/` folder exists but contains only a minimal stub — the main i18n source is `allUaTexts`/`allEnTexts`.

### Map (Leaflet + Nominatim)

`src/components/LeafletMaps.tsx` — receives `listings` and `formMapFilter` props; geocodes addresses using Nominatim (`nominatim.openstreetmap.org`) with results cached in `localStorage` under `"coordsCache"`. Default map center is Kharkiv (50.006, 36.23). Distance filtering uses Haversine formula.

### Media uploads

Images → **Cloudinary** via direct `axios.post` in `ImageUploader` component (no backend proxy).  
Videos → `VideoUploader` component (same Cloudinary pattern).

### AI property estimator

`src/components/RealEstateEstimator.tsx` — calls Google Gemini (`gemini-2.5-flash`) directly from the client using `@google/genai`. API key is `VITE_GOOGLE_AI_API_KEY_OLD`.

### Payments

`src/components/LiqPayButton.tsx` — fetches signed LiqPay params from `GET /api/liqpay-params` on the backend, then submits a hidden form to `https://www.liqpay.ua/api/3/checkout`.

### Styling

Tailwind CSS (v3) + plain CSS per component. Some components inject styles via `document.createElement('style')` at module level (e.g. `ImageUpLoader.tsx`).

> **Note:** `index.css` contains a global `button { }` rule (lines 66–84) that sets `background-color: #1a1a1a` and `box-shadow: inset ...` on all buttons. Override it with Tailwind `!`-prefix utilities (`!bg-[color]`, `!shadow-none`, `!border-0`) on any button that needs custom styling.

## i18n Rule — mandatory for every component and page

**All visible UI text must be localised.** No hardcoded strings in JSX or logic.

### Where to put text

| File | Content |
|---|---|
| `src/contents/allUaTexts.ts` | Ukrainian — **source of truth**, written first |
| `src/contents/allEnTexts.ts` | English translation of the same keys |

Both files export a plain object. Text is grouped by feature (e.g. `login`, `footer`, `services`). Inside each group items are indexed arrays `{id, text, href?}` or named object keys (e.g. `loginErrors`, `registrationErrors`).

### Rules

1. **Ukrainian first.** Write the Ukrainian text in `allUaTexts.ts` first, then add the English translation to `allEnTexts.ts`.
2. **No hardcoded strings in components.** Every user-visible string — labels, placeholders, error messages, button text, section headings, tooltips — must come from `contents.*`.
3. **Exceptions** (may stay hardcoded): brand names (`My Dream House`), universal placeholders (`name@example.com`, `••••••••`), numeric literals (`24/7`, `98%`), icon `aria-label` values that duplicate a visible label.
4. **Access pattern** — use the standard hook at the top of every component:
   ```ts
   const { language } = useLanguage();
   const contents = language === 'en' ? allEnTexts : allUaTexts;
   ```
5. **Adding new text.** When creating or modifying a component, always add new entries to **both** files in the same PR. Leave no key missing in either file.
6. **Error messages** are not exempt. Even dynamic error strings set via `setErrorMessage(...)` must reference `contents.*` (e.g. `contents.loginErrors.wrongPassword`), not hardcoded Ukrainian or English literals.
7. **Array index naming.** Prefer named object keys (`loginErrors.wrongPassword`) over high array indices (`login[47]`) for readability when adding new groups of strings.

### Checklist before committing a component

- [ ] Zero hardcoded Ukrainian strings in JSX and handlers
- [ ] Zero hardcoded English strings that should be translated
- [ ] Matching keys exist in both `allUaTexts.ts` and `allEnTexts.ts`
- [ ] Component uses `useLanguage()` + `const contents = language === 'en' ? allEnTexts : allUaTexts`

## Rules for interacting with Git via Claude Code
### Verification commands (run after changes)

- `pnpm run typecheck` — TypeScript verification

- `pnpm run test` — all tests

- `pnpm run lint` — ESLint

### Rule

- All three commands must pass before any commit.
- If there are errors, fix them before committing.

## Mobile-First UX Rules — mandatory for every component and page

**All interactive elements must work correctly on touch (phone) screens.**

### Rules

1. **Minimum tap target:** Every clickable/tappable element must be at least 44×44px (use `min-h-[44px] min-w-[44px]` or `py-3 px-4`).
2. **No hover-only interactions:** `onMouseEnter` / `onMouseLeave` must never be the sole trigger for showing/hiding content. They can be used as a visual bonus on desktop, but the primary open/close mechanism must work via click/tap.
3. **Dropdowns and popups — click-outside pattern:** Open on `onClick`. Close by clicking outside using `useRef` + `document.addEventListener('pointerdown', handler)`. The `pointerdown` event fires on both mouse and touch.
4. **Tailwind breakpoints only — no JS for layout switching:** Use `hidden md:flex`, `flex md:hidden`, etc. Do not use `useState` + `window.innerWidth` + `resize` listeners to toggle layout. Tailwind breakpoints: `sm:` 640px, `md:` 768px, `lg:` 1024px, `xl:` 1280px.
5. **Mobile menu visibility:** Use `opacity-0 pointer-events-none` (not `opacity-0 w-2`) to hide off-screen menus. The `w-2` trick creates invisible touch-blocking elements.
6. **Form inputs and radio buttons:** Wrap `<input type="radio">` + `<label>` in a `<label>` with at least `py-2` padding to enlarge tap area. Inputs must have `min-h-[44px]`.
7. **Absolute-positioned panels on mobile:** Add `max-w-[90vw]` and ensure no overflow outside viewport. Test on 375px viewport width.
8. **Tooltips / hints:** Must be dismissible by tap (not only by `mouseleave`). Use the click-outside pattern or a close button.

### Click-outside pattern (canonical)

```ts
const ref = useRef<HTMLDivElement>(null);
useEffect(() => {
  const handler = (e: PointerEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };
  document.addEventListener('pointerdown', handler);
  return () => document.removeEventListener('pointerdown', handler);
}, []);
// Wrap the dropdown trigger + panel in <div ref={ref}>
```

### Checklist before committing a component with interactive elements

- [ ] All tap targets ≥ 44×44px
- [ ] No hover-only open/close logic
- [ ] Dropdowns use click-outside (pointerdown) to close
- [ ] Layout breakpoints use Tailwind classes, not JS resize listeners
- [ ] Tested visually at 375px viewport width

---

## Git

Commit messages — Conventional Commits: feat/fix/chore/refactor/test/docs.
No period at the end of the title. Commit body - if the change is not obvious.

## PR Rules

- Always from feature branch, never directly to main

- PR title — Conventional Commits format

- Description: what was done, how to test, screenshot if UI changes

- After push, check that CI passed