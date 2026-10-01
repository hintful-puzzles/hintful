# own-the-hint-refusals

**Status: scaffolded, not started (2026-10-01).** Follows
`own-the-player-facing-messages`, which typed Solve's failures and the
description errors and left the hint's refusals as the one player-facing
message still guarded by a sweep. Read that change's `design.md` § "The shape:
types, not sweeps" first.

## Why

Two things, with one design.

**The finished-board refusal is every game's to write.** Measured 2026-10-01 at
`834875fb`: 31 games' sources call `commonHintRefusal(completed, mistakes)`,
whose first half refuses a solved board, and 10 import `ALREADY_SOLVED` to say
it themselves, while `candidate-hint.ts` says it for the candidate games. The
board's status already knows: `own-the-player-facing-messages` made the midend
refuse Solve on a solved board before asking the game, and a hint is the same
question. Re-take the population from the registry (the games with `hint`)
before designing against these counts.

**`HintResult`'s error is a free `string`.** What holds it to
`hint-refusal.ts`'s list is `hint-refusal.test.ts`, a sweep with an exceptions
ledger. Solve's failures and description errors are now types a game cannot
write around; the hint is the last of the three. The ledger holds two entries,
both Inertia's (the dead ball, the stranded gems), which is exactly the shape
`desc-error.ts`'s named escape has.

## What changes

- The midend refuses a hint on a board whose status is solved, with
  `ALREADY_SOLVED`, before calling `hint`. `commonHintRefusal` keeps only the
  mistakes half, or goes, if every caller is left calling it for that alone
  (decide by reading the callers).
- `HintResult`'s error becomes a `HintRefusal`: the union of the approved
  refusals' literal types, plus one named escape for a game-shaped dead end
  whose words are the substance of the hint. Decide between a union with a
  branded escape (as `DescError`) and a union alone (as `SolveFailure`) by
  whether a second game needs the escape.
- `hint-refusal.test.ts` shrinks to what a type cannot see: the escape's
  sentences, by the shape of its calls.

## Task 0

Re-take both populations by shape, not by name: every hinted game's first
refusal (including `candidate-hint.ts` and any other engine builder), and every
`{ ok: false, error }` on a hint path. **Falsifier:** if a hinted game's status
does not say solved when its hint refuses as solved (as Slide's typed desc did
for Solve), list each one; the midend refusal must not take a case the game
alone can see.

## Hints to pull in

None. Pegs is `add-pegs-hint`'s, and its refusal is already a Solve kind.
