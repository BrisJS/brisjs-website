# Design: <Feature Name>

> **Status:** draft | reviewed | approved
> **Last updated:** <YYYY-MM-DD>

## Architecture Overview

_How this feature fits into the overall architecture. Reference the relevant layers._

## Data Model

### New / Modified Data Structures

```
<schema excerpt — keep the authoritative definition in its source-of-truth location>
```

### Derived Validation / Types

_List any generated or derived schemas/types this feature uses. Note how they are produced._

## Component Structure

```
<dir>/
└── <component or module tree this feature adds>
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant <Component>
    participant <Component>
    User->><Component>: action
    <Component>->><Component>: step
```

## State Management

_Which stores/queries/collections this feature uses, and why._

## API Surface (if applicable)

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET`  | `/...` | _description_ |

## Key Design Decisions

| Decision | Alternatives Considered | Rationale |
| -------- | ----------------------- | --------- |
| _Decision_ | _Alt A, Alt B_ | _Why this approach_ |

## Diagrams

_Add ER, state-machine, or component-tree diagrams as needed._
