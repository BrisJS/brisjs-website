# Live-site baseline (BUILD_WORKFLOW T0.2)

> **Captured:** 2026-06-12 from https://brisjs.org (legacy site, pre-migration)
> **Purpose:** visual-parity reference for feature 002 (the Astro port) and the
> "before" benchmark for feature 005 / NON_FUNCTIONAL_TESTING.

Contents: full-page screenshots of the key pages (desktop, 1440×900 viewport) and
Lighthouse scores. The feature-002 gate is "recognisably the same design" against these.

## Screenshots (legacy hash routes → captured file)

| Page | Legacy route | File |
| ---- | ------------ | ---- |
| Home | `#home` | `01-home.png` |
| Talks archive | `#talks` | `02-talks.png` |
| Talk detail | `#talk-219` | `03-talk-detail.png` |
| Jobs | `#jobs` | `04-jobs.png` |
| Contact / organizers | `#contact` | `05-contact.png` |
| Find Us | `#findus` | `06-findus.png` |
| Talk requests ("Present") | `#present` | `07-present-talkrequests.png` |
| Code of Conduct | `#conduct` | `08-conduct.png` |

## Lighthouse — home page (desktop, navigation mode, 2026-06-12)

| Category | Score |
| -------- | ----- |
| Accessibility | **48** |
| Best Practices | 96 |
| SEO | 82 |
| Agentic Browsing | 14 |

> The MCP Lighthouse audit excludes the Performance category (needs a separate perf trace —
> follow-up). The low **Accessibility (48)** and middling **SEO (82)** quantify the current
> site's weaknesses and are the "before" numbers for feature 005 / NON_FUNCTIONAL_TESTING.
> Targets: improve a11y toward WCAG AA, SEO ≥ 95 with the Astro SSG rebuild (feature 002).

