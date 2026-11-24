## Why

The 2026-11-24 review of the migration sessions found the description
compiler's meaning depending on how a rule is spelled, and its bugs staying
silent until a real game used the path:

- **Spelling changes meaning.** A named set made the rule-violation check
  wait until the board was decided, while the same set written inline was
  bounded (99b14db8). The cycle rules are recognized by their written form
  (`cycleOf`, `pointCycleOf`). A rule false everywhere hangs the generator
  instead of failing a check.
- **Silent compiler and dealer bugs, each found by flipping a game**:
  `range(1,w)` emitted `_sp` and read `sp` (bb059f0a); `x in range(lo,hi)`
  dropped values of 32 and above, biasing every Keen deal (2247a3bf); the
  dealer discarded a clue kind before the higher tier could use it, so no
  Normal board could be dealt on `ordering` (1107fb58); clue numbers read
  out as letters ("sum to g").
- **A fixture that cannot see the bug**: `hideFirst`'s fix was tried on the
  `cornering` fixture, whose Easy tier reads no corner clue, saw nothing
  move, was reverted and recorded wrongly; the next session met the defect
  on Mathrax (5fe72592, 7a9797d2).

## What Changes

- **Rules are normalized before they are analyzed**: a named set is
  inlined, and a cycle, a count, a reach is recognized by its structure, so
  two spellings of one rule compile to one analysis.
- **A rule that can never hold is refused at compile time**, or bounded at
  the deal with a refusal that names it, never a hang.
- **Property tests for the compiler's primitives**: ranges over their full
  domain (past 31), names a binding emits and reads, numerals in wording,
  the deal's per-tier clue kinds; differential where an interpreter of the
  same expression exists.
- **An engine fix is verified on a born game that reaches it**, as well as
  on its fixture: `docs/testing.md` says so, and the fixture's guard asks
  that each fixture's capability is read by the tier it is tested at.

## Capabilities

### Modified Capabilities

- `described-fill-game`: two spellings of a rule are one analysis; a rule
  that cannot hold is refused.

## Impact

`src/describe/compile-expr.ts`, `compile-violations.ts`,
`compile-fill.ts`, the deal, their tests, `docs/descriptions.md`,
`docs/testing.md`. Player-visible: deals may change where a fixed bug
biased them (pre-approved).
