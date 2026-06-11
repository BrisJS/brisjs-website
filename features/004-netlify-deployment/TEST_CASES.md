# Test Cases: Netlify Deployment & Hosting

> Feature-scoped functional test scenarios. Non-functional testing lives in `docs/NON_FUNCTIONAL_TESTING.md`.
> Acceptance criteria (EARS) live in `REQUIREMENTS.md`.

## TC-01: Push triggers a successful deploy (Happy path)

**User story ref:** US-01
**Type:** E2E (deploy)

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Push a commit to the default branch | Netlify starts a build |
| 2 | Wait for completion | Build succeeds; `dist/` published; site updated |

**Pass criteria:** Push results in a live, updated deploy.
**Fail criteria:** No build, or failed build replaces good deploy.

---

## TC-02: Content publish triggers rebuild (Happy path)

**User story ref:** US-02
**Type:** E2E

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Publish/update an entry in Strapi | Strapi webhook hits the build hook |
| 2 | Observe Netlify | A new build runs and deploys |

**Pass criteria:** Publishing rebuilds the site.
**Fail criteria:** No rebuild triggered.

---

## TC-03: Build fails safely when content is unavailable (Error State)

**User story ref:** US-01 (edge)
**Type:** E2E

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Temporarily break `STRAPI_API_URL`/token and trigger a build | Build fails |
| 2 | Visit the site | Previous good deploy still live |

**Pass criteria:** Bad build does not replace the live site; failure visible.
**Fail criteria:** Site goes blank/half-empty.

---

## TC-04: Legacy hash URL resolves (Edge Case)

**User story ref:** US-04
**Type:** E2E

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Visit `https://brisjs.org/#talk-<knownId>` | Client shim redirects to `/talks/<slug>` |
| 2 | Visit `#talk-<unknownId>` | Falls back to `/talks` (no hard error) |

**Pass criteria:** Known legacy ids land on the right page; unknown fall back gracefully.
**Fail criteria:** Broken page or dead end.

---

## TC-05: Canonical domain over HTTPS (Happy path)

**User story ref:** US-03
**Type:** E2E

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Visit `http://brisjs.org` | Redirects to HTTPS |
| 2 | Inspect cert + domain | Valid cert; canonical `brisjs.org`; no `bris.js.org` split-brain |

**Pass criteria:** HTTPS works; single canonical domain.
**Fail criteria:** Cert error or inconsistent domain.

---

## TC-06: No secrets committed; env present (Security)

**User story ref:** US-05
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Grep repo for `STRAPI_API_TOKEN` value | Not present |
| 2 | Confirm Netlify env has `STRAPI_API_URL` + `STRAPI_API_TOKEN` | Present in Netlify only |

**Pass criteria:** Secrets only in Netlify env.
**Fail criteria:** Any secret in the repo.

---

## TC-07: PR deploy preview (Happy path)

**User story ref:** US-06
**Type:** E2E

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Open a PR | Netlify publishes a deploy preview with a unique URL |

**Pass criteria:** Preview URL builds and renders the PR's changes.
**Fail criteria:** No preview produced.

---

## Test Data Summary

| Dataset | Description | Location |
| ------- | ----------- | -------- |
| Known/unknown legacy talk ids | For redirect shim tests | from migrated content |
| Broken env values | For fail-safe build test | Netlify build context (temporary) |

## Coverage Checklist

- [ ] Happy path covered (push deploy, publish rebuild, domain/HTTPS, preview)
- [ ] Edge cases covered (legacy hash URL known/unknown)
- [ ] Error/security states covered (fail-safe build, no committed secrets)
- [ ] `CNAME`/DNS reconciliation verified
