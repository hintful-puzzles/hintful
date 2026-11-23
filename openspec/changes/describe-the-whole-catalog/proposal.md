## Why

The owner's hard decision of 2026-11-23 (`docs/doctrine.md` § "Where the
engine is heading: a game is its description"): all of every game's
imperative code becomes engine capabilities another game could adopt. Three
changes have moved the plain-cell fill games onto `engine/fill/`, and
Kakurasu was born with no TypeScript of its own. The rest of the catalog
is still hand-written, and its games are of kinds the fill board does not
carry: candidate notes, edge and partition answers, positions and moves,
hidden information.

The rest is too large and too varied for one change to plan. What worked
for the plain-cell family was a gap list per game, read against the engine
as it stood when the work began. So this change is the route: the groups,
their order, what each needs from the engine, and the rules every group's
change follows. Each group is filed as its own change when it is reached.

## What Changes

- **The route** (design.md): the hand-written games in groups by what the
  engine lacks to carry them, the order the groups go in, and what each
  needs first.
- **The rules every group's change follows** (design.md § "What every
  group does").
- **Filing as the route is walked**: this change's tasks file each group's
  change when the one before it is archived, never ahead, since a change
  filed months ahead plans against an engine that has moved
  (`one-model-for-moving-pieces` predates everything the fill board
  taught).
- `measure-cost-by-instructions` goes first, so every group is judged by
  its criteria and its instrument.

## Capabilities

### New Capabilities

(none: each group's change carries its own deltas)

### Modified Capabilities

(none)

## Impact

`openspec/changes/` only, until each group's change is filed. Over the
route: `src/engine/`, `src/describe/`, every hand-written game under
`src/games/`, their help pages and specs. Saves of every moved game break,
pre-approved by the owner (`docs/descriptions.md`).
