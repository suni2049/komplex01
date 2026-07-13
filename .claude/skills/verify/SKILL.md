---
name: verify
description: Build, launch, and drive the KOMPLEX01 PWA to verify changes at the UI surface.
---

# Verifying KOMPLEX01 changes

## Build / launch

- `npm install` (fresh container), then `npm run dev` → Vite on http://localhost:5173
- `npm run build` = `tsc -b && vite build`; `npm run lint` (note: repo has ~13 pre-existing lint errors outside `src/components/stickfigure/`)

## Driving the app (Playwright)

Use `playwright-core` (install in scratchpad, project doesn't depend on it) with
`chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })`. Viewport 420×900
matches the mobile-first layout.

Key flows:
- **Exercise animations**: `/exercises` shows ~130 static 44px `StickFigure` thumbnails;
  type in the search box (`input[type="text"]`), click `button.card-base` to open the
  animated 180px detail. The figure SVG is `svg[viewBox="0 0 200 200"]`.
- **Workout flow**: `/` → click "GENERATE PROGRAM" → preview with 24px static figures →
  "COMMENCE" → ActiveWorkoutPage with 140px animated figure. Pause button:
  `button:has(path[d^="M6 19h4"])`; resume: `button:has(path[d^="M8 5v14"])`.
  "SKIP" advances to the next exercise.

## Gotchas

- The animation container has `animate-glow-pulse-inset` — full-page screenshots of a
  "frozen" figure still differ byte-wise because of the CSS glow; compare visually.
- Element screenshots of the figure SVG can fail with "element is not stable" during
  framer-motion page transitions; screenshot the page with a `clip` instead.
- Exercise names in the browser: "Standard Push-Up", "Plank", "Jumping Jack" etc.
  (no exercise named "air squat" — use "bodyweight squat").
