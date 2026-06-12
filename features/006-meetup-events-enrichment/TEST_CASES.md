# Test Cases: Meetup Past-Events Enrichment

> Backlog feature — flesh out when picked up. Non-functional testing lives in
> `docs/NON_FUNCTIONAL_TESTING.md`; acceptance criteria in `REQUIREMENTS.md`.

## TC-01: Backfill imports missing past events as drafts (Happy path)

**User story ref:** US-01
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Run the enrichment job against a sample of Meetup past events, some predating the archive | Job completes |
| 2 | Inspect the CMS | Missing events created as **drafts**; none auto-published |

**Pass criteria:** Earlier-than-archive events appear as reviewable drafts.
**Fail criteria:** Nothing imported, or imported as published.

---

## TC-02: Idempotent — no duplicates on re-run (Edge Case)

**User story ref:** US-02
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Run the job twice | Second run creates no duplicate events |
| 2 | Inspect counts | Stable across runs |

**Pass criteria:** Re-run adds nothing already present.
**Fail criteria:** Duplicates created.

---

## TC-03: Existing migrated content is preserved (Error/Safety)

**User story ref:** US-02
**Type:** Integration

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | Run against events overlapping already-migrated talks/events | Existing records untouched (no overwrite/delete) |

**Pass criteria:** Curated content preserved; only gaps filled.
**Fail criteria:** Existing content modified or removed.

---

## Coverage Checklist

- [ ] Happy path: backfill as drafts
- [ ] Idempotency / dedup
- [ ] Non-destructive to existing content
- [ ] Acquisition-method-specific failure handled (API unavailable / scrape markup change)
