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

UI text is stored in two JS objects:
- `src/contents/allUaTexts.js`
- `src/contents/allEnTexts.js`

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

Tailwind CSS (v3) + SCSS (`src/components/footer.style.scss`) + plain CSS per component. Some components inject styles via `document.createElement('style')` at module level (e.g. `ImageUpLoader.tsx`).

## Rules for interacting with Git via Claude Code
### Verification commands (run after changes)

- `pnpm run typecheck` — TypeScript verification

- `pnpm run test` — all tests

- `pnpm run lint` — ESLint

### Rule

- All three commands must pass before any commit.
- If there are errors, fix them before committing.

## Git

Commit messages — Conventional Commits: feat/fix/chore/refactor/test/docs.
No period at the end of the title. Commit body - if the change is not obvious.

## PR Rules

- Always from feature branch, never directly to main

- PR title — Conventional Commits format

- Description: what was done, how to test, screenshot if UI changes

- After push, check that CI passed