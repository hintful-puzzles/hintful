# Design

Written 2026-10-09 when the change was filed. Nothing here has been tried
beyond the reproduction in `proposal.md`.

## Context

`loadDesc` gives a pasted description three verdicts: its shape, its answer
(`answerVerdict`, which refuses no solution and several), and its solver
(`solverVerdict`). A tiered game is held by its difficulty contract. An
untiered one is held by `Game.finishesByDeduction`, and where the game
declares none the engine assumes yes.

Read `docs/games/solver-and-generator.md` and `docs/games/mechanics.md` on the
load path first, and the specs `engine-params` and `engine-difficulty`.

## Decisions

### Decision 1: the population is derived, and counted first

Before any fix, list every registered game with no `difficulty` and no
`finishesByDeduction`, and for each say which of three kinds it is: its hint
or Solve deduces and can run out (the defect); it never deduces (a movement
game, a search, an `aux` walk), so the question does not arise; or its
generator and solver already guarantee the answer some other way. The list is
a test's output and not a table in this file.

### Decision 2: the generator is checked before a board is refused

The fix refuses boards. For each game of the first kind, deal boards across
its presets and its Custom dialog's values (`dealt` and the shared slice of
`src/engine/testing/`) and assert that the new verdict accepts every one. A
game whose own generator deals a board the verdict would refuse is a finding
about that game, and it stops the change for that game until settled: the
board a player already holds must keep opening.

### Decision 3: the absence of the hook stops meaning yes

Preferred, to be confirmed against Decision 1's list: an untiered game
declares `finishesByDeduction`, or declares why the question does not apply,
in the way `notApplicable` already works for a contract section
(`ts-engine`, "A not-applicable reason is a fact about the puzzle"). A game
with neither does not compile or fails registration. This is the declaration
the engine consumes, in place of a guard that sweeps for the gap.

Alternative: derive it. A game with a `hint` that can return the
deduction-exhausted refusal is asked to prove at load that it will not. That
needs no declaration, and costs a hint walk on every pasted ID.

### Decision 4: the throw stays

`Midend.computeHintPlan` throwing on a deduction-exhausted refusal from a
game with no tier that allows search is right: it is the defect's alarm. The
fix is that no loaded board reaches it.

## Risks

- A game's solver is weaker than its generator's acceptance test, so the
  verdict refuses dealt boards → Decision 2 finds it before a player does.
- The check is slow on a large pasted board → measure `loadDesc` before and
  after on each game's largest preset.

## The order of work

`tasks.md` has it.
