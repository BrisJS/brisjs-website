# Test Cases: Strapi Backend Integration

> Feature-scoped functional test scenarios. Non-functional testing lives in `docs/NON_FUNCTIONAL_TESTING.md`.
> Acceptance criteria (EARS) live in `REQUIREMENTS.md`.

## TC-01: Public API returns only published entries (Happy path)

**User story ref:** US-02
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Create one published and one draft Talk | Both stored |
| 2 | `GET /api/talks` with the public/build token | Only the published talk returned |

**Pass criteria:** Draft excluded; published included.
**Fail criteria:** Draft leaks into the response.

---

## TC-02: Public role cannot write (Error State / Security)

**User story ref:** US-02
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | `POST /api/talks` with the public/build token | 403 / 405 — write denied |
| 2 | `DELETE /api/talks/:id` with the token | Denied |

**Pass criteria:** All write verbs denied to the public/build token.
**Fail criteria:** Any write succeeds.

---

## TC-03: Publish triggers a Netlify rebuild (Happy path)

**User story ref:** US-01
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Publish a content entry in Strapi | Webhook fires |
| 2 | Observe Netlify | A build is triggered via the build hook |

**Pass criteria:** A new Netlify build starts after publish.
**Fail criteria:** No build triggered.

---

## TC-04: Webhook failure is handled (Error State)

**User story ref:** US-01 (edge)
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Point the webhook at an invalid URL and publish | Strapi logs the failure |
| 2 | Verify content state | Entry still saved/published; manual rebuild still possible |

**Pass criteria:** Failure logged, content intact, fallback available.
**Fail criteria:** Content lost or failure silently swallowed with no log.

---

## TC-05: Migration is idempotent (Integration)

**User story ref:** US-04
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Run the legacy importer | Entries created (talks/speakers/events/etc.) |
| 2 | Run it again | No duplicates created; existing entries upserted |
| 3 | Spot-check a few talks vs the live old site | Title/date/speakers/links match |

**Test data:**
```
Legacy Google Sheet TSV + data/twitter.json + data/contact.json
```

**Pass criteria:** Second run adds no duplicates; sampled content matches source.
**Fail criteria:** Duplicates created or content mismatched.

---

## TC-06: No secret committed to the repo (Security)

**User story ref:** US-03
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Grep the repo for the token / admin credentials | None present |
| 2 | Confirm env vars are read from Netlify, not files in the repo | Confirmed |

**Pass criteria:** No secrets in version control.
**Fail criteria:** Any token/credential found committed.

---

## Test Data Summary

| Dataset | Description | Location |
| ------- | ----------- | -------- |
| Legacy content | Source for migration | Google Sheet / `data/*.json` |
| Published + draft fixtures | For permission/draft tests | local Strapi |

## Coverage Checklist

- [ ] Happy path covered (published-only read, publish→rebuild)
- [ ] Edge cases covered (webhook failure, free-plan limit reporting)
- [ ] Error/security states covered (no public writes, no committed secrets)
- [ ] Migration idempotency + content parity spot-checked
