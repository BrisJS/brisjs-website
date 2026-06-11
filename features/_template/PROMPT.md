# Prompts: <Feature Name>

> Each section is a discrete, self-contained prompt to be fed to the agent.
> Run them in order unless noted otherwise. Reference prior outputs where indicated.

---

## P-01: <Task title>

**Context files to load:**
- `features/NNN-<slug>/SPEC.md`
- `features/NNN-<slug>/DESIGN.md`
- _(add relevant source files)_

**Prompt:**

```
<Full prompt. Be explicit about: what to build, which files to create/modify,
which conventions to follow (see CLAUDE.md), the expected output, and constraints.>
```

**Expected output:** _what this prompt should produce._

---

## P-02: Tests

**Context files to load:**
- _(files produced by earlier prompts)_

**Prompt:**

```
Write tests for the code produced in P-01.
Cover: happy path, edge cases from REQUIREMENTS.md, and error states.
Follow existing test patterns in the project.
```

**Expected output:** Test files alongside the implementation.
