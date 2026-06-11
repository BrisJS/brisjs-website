# Spec: Design Refresh

> **Status:** planning
> **Feature folder:** `features/005-design-refresh/`
> **Depends on:** feature 002 (Astro frontend that first ports the current design as-is)

## Overview

Once the site has been migrated to Astro with the **current design ported faithfully**
(feature 002), this feature introduces a deliberate **redesign** — a new visual identity,
design system, and component styling — replacing the legacy Semantic-UI look. It is kept
separate from the migration so the platform change and the visual change can be reviewed and
shipped independently, reducing risk.

## Goals

- A small, documented **design system**: tokens (color, type scale, spacing, radii), layout
  primitives, and restyled components (talk card, speaker card, event banner, buttons, nav).
- Replace the Semantic-UI dependency/look with the new system.
- Improve responsiveness and accessibility beyond a like-for-like port (WCAG 2.1 AA, ideally
  better contrast/focus states than today).
- A cohesive brand expression for BrisJS (logo usage, hero treatment, color).
- No change to content structure or the CMS model — purely presentation.

## Non-Goals

- Content modelling (feature 001), the Astro app structure/data layer (feature 002),
  Strapi (003), or Netlify (004) — those are unchanged.
- New pages or features (this is a restyle, not new functionality).
- Backend/API changes.

## Functional Requirements

### FR-01: Design tokens

Define and document tokens (CSS custom properties or equivalent) for color, typography,
spacing, radius, and shadow, applied site-wide.

### FR-02: Component restyle

Restyle the feature-002 components (TalkCard, SpeakerCard, EventBanner, ResourceButtons, nav,
footer, layout) against the new system; remove Semantic UI.

### FR-03: Responsive + accessible

Meet WCAG 2.1 AA: contrast, visible focus states, keyboard navigation, reduced-motion respect,
and sensible responsive breakpoints (improving on the current single 700px breakpoint).

### FR-04: Brand & hero

A refreshed hero/landing treatment and consistent brand usage (logo, color, imagery).

### FR-05: Visual parity of content

All existing content/pages still render correctly with the new styling (no missing states;
empty/missing fields still handled gracefully).

## Constraints

- Presentation-only: no changes to routes, data layer, or content types.
- Keep performance budgets from `docs/NON_FUNCTIONAL_TESTING.md` (don't regress Lighthouse).
- Minimal client JS — prefer CSS; islands only where genuinely interactive.

## Success Criteria

- [ ] Documented design system (tokens + components) applied across all pages.
- [ ] Semantic UI removed; no visual regressions in content/states.
- [ ] WCAG 2.1 AA checks pass (contrast, focus, keyboard).
- [ ] Lighthouse Performance/SEO not regressed vs the ported (feature 002) baseline.
- [ ] Stakeholder sign-off on the new look.

## Open Questions

| # | Question | Owner | Resolution |
|---|----------|-------|------------|
| 1 | Styling approach — hand-rolled CSS + tokens, Tailwind, or UnoCSS? | — | — |
| 2 | Is there an existing/desired brand palette and typography, or do we design one? | — | — |
| 3 | Dark mode in scope? | — | — |
| 4 | Do we want a component preview/storybook for the design system? | — | — |
