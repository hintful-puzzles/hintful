## Why

The owner asked on 2026-11-20, in their words: "please start a new change in
a new session, to do a more general architectural review of the codebase,
and get me a prioritized list of potential architectural-level refactorings
that could help our maintainability". The catalog is to grow to dozens or
hundreds of games (`docs/doctrine.md` § "The goal"), so a shape every game or
every guard repeats costs more with each one added; a review says where that
cost is, measured, before more games pay it.

## What Changes

- A review of the tree's architecture: the engine and its contract with a
  game, what games still repeat, the cross-game guards and how they find
  their population, the describe compiler, the app shell and worker, the
  tooling and the guides.
- A prioritized list, in `design.md`, of architectural refactorings. Each
  item says what it is, where in the tree it applies, what it would make
  easier, what it costs, and the evidence: counts taken by a query written
  down beside them. Ranked by payoff for maintainability at the scale of
  dozens to hundreds of games.
- `derive-hidden-answer-exemptions` is folded in as one item, beside every
  other hand-kept, game-keyed list the review finds of the same shape.
- No refactoring is made here. The owner picks from the list; each pick
  becomes its own change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None: a review changes no requirement.

## Impact

Nothing outside `openspec/changes/architectural-review/`. The changes the
owner picks will name their own impact.
