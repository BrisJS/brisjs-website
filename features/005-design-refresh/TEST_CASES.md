# Test Cases: Design Refresh

> Feature-scoped functional test scenarios. Non-functional testing lives in `docs/NON_FUNCTIONAL_TESTING.md`.
> Acceptance criteria (EARS) live in `REQUIREMENTS.md`.

## TC-01: Tokens applied consistently (Happy path)

**User story ref:** US-03
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Build the site with the new design system | Build succeeds |
| 2 | Inspect components for hardcoded colors/spacing | Values come from tokens, not ad-hoc literals |

**Pass criteria:** Components reference tokens; no stray hardcoded design values.
**Fail criteria:** Ad-hoc colors/spacing scattered across components.

---

## TC-02: All pages render under new styling (Happy path)

**User story ref:** US-04
**Type:** E2E / visual

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Visit every page (home, talks, talk detail, jobs, talk-requests, contact, code-of-conduct, find-us) | All render with the new look, no broken layout |

**Pass criteria:** Every page styled correctly; no missing/broken states.
**Fail criteria:** Any page unstyled or visually broken.

---

## TC-03: Accessibility — contrast & focus (Happy path)

**User story ref:** US-02
**Type:** Integration (a11y audit)

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Run an a11y audit (e.g. axe/Lighthouse) on key pages | No AA contrast violations |
| 2 | Tab through interactive elements | Visible focus indicator on each |

**Pass criteria:** Passes WCAG 2.1 AA contrast + visible focus everywhere.
**Fail criteria:** Contrast failures or invisible focus.

---

## TC-04: Graceful content states (Edge Case)

**User story ref:** US-04
**Type:** E2E

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | View a talk with no video/slides/speaker | Styled placeholder(s); no broken card |
| 2 | View a very long title / bio | Wraps/truncates cleanly |

**Pass criteria:** Missing/overflow content handled within the new design.
**Fail criteria:** Overflow or broken layout.

---

## TC-05: No performance regression (Non-functional link)

**User story ref:** US-01
**Type:** Integration (Lighthouse)

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Run Lighthouse on key pages | Performance/SEO not below the feature-002 baseline |

**Pass criteria:** Scores hold or improve vs the ported baseline.
**Fail criteria:** Notable regression.

---

## TC-06: Reduced motion respected (Edge Case)

**User story ref:** US-02
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Enable `prefers-reduced-motion` and load pages | Non-essential animation suppressed |

**Pass criteria:** Honors reduced-motion preference.
**Fail criteria:** Animations play regardless.

---

## Test Data Summary

| Dataset | Description | Location |
| ------- | ----------- | -------- |
| Existing content | Same feature-001/002 content | local/cloud Strapi |
| Edge content (long title, no media) | For overflow/placeholder tests | fixtures |

## Coverage Checklist

- [ ] Happy path covered (tokens applied, all pages styled)
- [ ] Accessibility covered (contrast, focus, reduced motion)
- [ ] Edge cases covered (missing/overflow content)
- [ ] Performance baseline not regressed
