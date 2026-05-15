# My Dream House - Design System

## Project Style

Modern premium real estate platform.

Style keywords:
- modern
- premium
- elegant
- clean
- minimal
- luxury
- soft glassmorphism
- smooth animations
- spacious layout

Avoid:
- clutter
- aggressive gradients
- neon colors
- excessive blur
- over-animation

---

# Color Palette

## Primary Colors

Primary:
- #2563EB

Secondary:
- #0F172A

Accent:
- #F59E0B

Background:
- #F8FAFC

Surface:
- #FFFFFF

Muted:
- #64748B

Success:
- #10B981

Error:
- #EF4444

---

# Typography

Font style:
- modern sans-serif
- clean
- readable

Preferred fonts:
- Inter
- Geist
- Manrope

Rules:
- large headings
- comfortable spacing
- avoid dense text blocks

---

# Border Radius

Cards:
- rounded-2xl

Buttons:
- rounded-xl

Inputs:
- rounded-xl

Modals:
- rounded-3xl

---

# Shadows

Use soft shadows only.

Preferred:
- shadow-md
- shadow-lg

Avoid:
- harsh dark shadows
- excessive glow

---

# Layout Rules

Spacing:
- generous whitespace
- clean grid alignment

Container:
- max-width 1440px

Preferred layouts:
- grid
- card-based UI
- responsive dashboard sections

Avoid:
- cramped layouts
- long horizontal sections

---

# Animations

Use motion/react.

Animation style:
- smooth
- subtle
- premium

Preferred:
- fade-in
- slight scale
- soft slide-up

Animation duration:
- 0.2s to 0.5s

Avoid:
- bouncing
- aggressive movement
- constant infinite animations

---

# Buttons

Primary buttons:
- filled
- medium shadow
- animated hover

Secondary buttons:
- outline or soft background

Hover:
- slight scale
- subtle brightness

---

# Cards

Property cards should include:
- large image
- clean typography
- soft shadow
- hover animation
- favorite button
- price emphasis

Card style:
- modern SaaS
- premium real estate aesthetic

---

# Forms

Inputs:
- large click area
- clean borders
- strong focus state

Validation:
- simple
- non-intrusive

---

# Map UI

Leaflet panels should:
- feel modern
- use glass effect carefully
- avoid blocking map visibility

Map interactions:
- smooth
- responsive

---

# Accessibility

Always:
- maintain contrast
- keyboard accessibility
- visible focus states

Avoid:
- low contrast text
- tiny clickable elements

---

# Mobile UX

Prioritize:
- thumb-friendly interactions
- large tap areas (minimum 44×44px)
- bottom spacing
- responsive cards

Rules (enforced in CLAUDE.md):
- No hover-only open/close — all interactions must work via tap
- Dropdowns close via pointerdown outside (useRef pattern)
- Layout switching via Tailwind breakpoints only (no JS resize listeners)
- Mobile menu hidden with `pointer-events-none`, not invisible width tricks
- Absolute panels: max-w-[90vw], no viewport overflow
- Radio/checkbox inputs: wrapped in label with py-2 padding

---

# AI Instructions

When generating UI:
- use TailwindCSS
- use motion/react
- use modern SaaS patterns
- prioritize clean spacing
- prioritize readability
- avoid over-engineering
- keep components reusable