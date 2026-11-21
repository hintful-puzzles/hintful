## Why

The owner asked on 2026-11-21, in their words: "when you're done with this
change, please do another architecture review pass in the next session". The
first review (`archive/2026-11-20-architectural-review`) gave eleven items,
and every one has since been made as its own change, the last
`state-each-guide-rule-once`. The tree is in a different shape from the one
that review measured, so its findings and ranking no longer say where the
maintenance cost is at dozens to hundreds of games (`docs/doctrine.md` §
"The goal").

## What Changes

- A second review of the tree's architecture, on the first one's lines: what
  games still repeat, the engine and its contract with a game, how the
  cross-game guards find their population, the describe compiler and the
  ladder runtime, the app shell and worker, and the tests, tooling and
  guides.
- For each of the first review's items, what its change left: whether the
  shape it named is gone, and what remains of it.
- A prioritized list, in `design.md`, of architectural refactorings. Each
  item says what it is, where in the tree it applies, what it would make
  easier, what it costs, and the evidence: counts taken by a query written
  down beside them, dated to a commit. Ranked by payoff at dozens to
  hundreds of games.
- No refactoring is made here. The owner picks from the list; each pick
  becomes its own change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None: a review changes no requirement.

## Impact

Nothing outside `openspec/changes/architectural-review-second-pass/`. The
changes the owner picks will name their own impact.
