# Prompts: Design Refresh

> Each section is a discrete, self-contained prompt. Run in order. Depends on feature 002
> being complete (Astro app rendering the ported current design).

---

## P-01: Define the design system

**Context files to load:**
- `features/005-design-refresh/SPEC.md`
- `features/005-design-refresh/DESIGN.md`
- `features/002-astro-frontend/DESIGN.md` (existing component/layout structure)

**Prompt:**

```
Create the design-token system for the BrisJS redesign per DESIGN.md: a tokens stylesheet
(color, typography scale, spacing, radius, shadow, breakpoints) and a base stylesheet
(reset + element/typography defaults) consuming the tokens. Resolve the styling-stack Open
Question first (CSS+tokens vs Tailwind vs UnoCSS) and note the choice. Do not change routes,
the data layer, or content types — presentation only.
```

**Expected output:** Documented tokens + base styles, ready to apply to components.

---

## P-02: Restyle components & layouts; remove Semantic UI

**Context files to load:**
- The tokens from P-01
- `features/002-astro-frontend` components/layouts

**Prompt:**

```
Restyle the feature-002 components and BaseLayout against the new design system (TalkCard,
SpeakerCard, EventBanner, ResourceButtons, Nav, Footer, hero). Remove the Semantic UI
dependency and the ported legacy styles. Ensure WCAG 2.1 AA contrast, visible focus states,
keyboard navigation, reduced-motion support, and responsive breakpoints. Keep all content
states graceful (missing video/slides/speaker, long titles). Do not regress Lighthouse vs the
feature-002 baseline.
```

**Expected output:** All pages restyled with the new system; Semantic UI removed.

---

## P-03: Verify

**Context files to load:**
- `features/005-design-refresh/TEST_CASES.md`

**Prompt:**

```
Verify per TEST_CASES.md: tokens applied consistently (TC-01), all pages render under the new
styling (TC-02), a11y contrast/focus pass (TC-03), graceful content states (TC-04), no
Lighthouse regression (TC-05), reduced motion respected (TC-06). Record results and capture
before/after screenshots for stakeholder sign-off.
```

**Expected output:** A verification report + before/after visuals for sign-off.
