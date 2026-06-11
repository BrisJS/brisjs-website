# Test Cases: <Feature Name>

> Feature-scoped functional test scenarios. Non-functional testing lives in `docs/NON_FUNCTIONAL_TESTING.md`.
> Acceptance criteria (EARS) live in `REQUIREMENTS.md` — this file covers explicit scenarios and test data.

## TC-01: <Scenario title>

**User story ref:** US-01
**Type:** Unit | Integration | E2E

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | _action_ | _outcome_ |
| 2 | _action_ | _outcome_ |

**Test data:**
```
<seed data / fixtures / preconditions>
```

**Pass criteria:** _what constitutes a pass_
**Fail criteria:** _what constitutes a fail_

---

## TC-02: <Scenario title> (Edge Case)

**User story ref:** US-01
**Type:** Unit | Integration | E2E

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | _action_ | _outcome_ |

**Pass criteria:** _pass condition_
**Fail criteria:** _fail condition_

---

## TC-03: <Scenario title> (Error State)

**User story ref:** US-02
**Type:** Unit | Integration | E2E

| Step | Action | Expected result |
| ---- | ------ | --------------- |
| 1 | _trigger error_ | _graceful handling / recovery_ |

**Pass criteria:** _pass condition_
**Fail criteria:** _fail condition_

---

## Test Data Summary

| Dataset | Description | Location |
| ------- | ----------- | -------- |
| _name_ | _what it represents_ | `e2e/fixtures/` or inline |

## Coverage Checklist

- [ ] Happy path covered
- [ ] Edge cases from `REQUIREMENTS.md` covered
- [ ] Error states from `REQUIREMENTS.md` covered
- [ ] _Any project-critical cross-cutting scenario (e.g. offline, concurrency) covered_
