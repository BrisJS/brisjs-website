# Design: Design Refresh

> **Status:** draft
> **Last updated:** 2026-06-11
> **Depends on:** feature 002 (Astro app + ported design as the starting point)

## Architecture Overview

A presentation-only layer over the feature-002 Astro app. It introduces a design-token system
and restyles existing components/layouts; it touches no routes, data layer, or content types.
Semantic UI is removed in favour of the new system.

## Data Model

None — this feature changes no persistent data. It consumes the same feature-001 content via
the same feature-002 data layer.

## Component Structure

```
src/
├── styles/
│   ├── tokens.css           # design tokens: --color-*, --space-*, --font-*, --radius-*, --shadow-*
│   ├── base.css             # resets, element defaults, typography scale
│   └── (replaces the ported global.css from feature 002)
├── components/              # restyled in place (no structural change)
│   ├── TalkCard.astro
│   ├── SpeakerCard.astro
│   ├── EventBanner.astro
│   ├── ResourceButtons.astro
│   ├── Nav.astro
│   └── Footer.astro
└── layouts/
    └── BaseLayout.astro     # applies tokens/base; refreshed hero treatment
```

## Design System

| Token group | Examples |
| ----------- | -------- |
| Color | brand primary/secondary, surface, text, link, focus-ring, semantic (success/warn) |
| Typography | font families, modular type scale, weights, line-heights |
| Spacing | spacing scale (e.g. 4/8px base) |
| Radius & shadow | corner radii, elevation shadows |
| Breakpoints | mobile / tablet / desktop (improve on the single 700px breakpoint) |

## Data Flow

No runtime data flow change. Styling is applied at build time via CSS; any interactive bits
remain isolated Astro islands.

## State Management

None beyond existing islands (e.g. mobile nav toggle).

## Key Design Decisions

| Decision | Alternatives Considered | Rationale |
| -------- | ----------------------- | --------- |
| Separate redesign feature (not folded into feature 002) | Redesign during the migration | De-risk: ship the platform migration first, then the visual change independently |
| Token-driven CSS | Inline/ad-hoc styles | Consistency + easy future iteration |
| Remove Semantic UI | Keep + override | Smaller footprint, full control over the look |
| Styling stack TBD (CSS+tokens / Tailwind / UnoCSS) | — | Decide in Open Q1 with the team |

## Diagrams

_Add visual mockups / a token sheet / component gallery here as the design is produced._

## Open Design Questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | Styling stack (hand-rolled CSS + tokens vs Tailwind vs UnoCSS)? | — | — |
| 2 | Source of the brand palette/typography (existing assets vs new)? | — | — |
| 3 | Dark mode in scope? | — | — |
