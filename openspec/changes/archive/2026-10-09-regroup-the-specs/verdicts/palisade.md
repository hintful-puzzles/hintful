# Verdicts: palisade

## keep `palisade`: The solver concludes the same with or without the hint's recorder

Not `how`, and no shared requirement holds it. Palisade's solver is its own
loop (`runToFixpoint` in `src/games/palisade/solver.ts`), not the shared
runner, so `engine-helpers` "The record is the game's, and the generation path
allocates nothing" does not reach it, and `engine-hints` "The solver and the
hint are two projections of one deduction engine" says only that the generator
runs with the recorder off, not that recording changes no conclusion. The
solver's every rule tests `ctx.record`, so a session adding a hint-only branch
there checks its change against this.

## reword `palisade`: The hint is seeded from the player's own walls and marks

The DSF and the `DISABLED` bit are how the seeding is built
(`deduceForcedEdges` in `src/games/palisade/solver.ts`); what a reader needs is
that a hint starts from the player's walls and no-wall marks and does not hint
them again. "SHALL NOT mutate that state" goes as `collection`: `engine-hints`
"Requesting a hint never mutates the board" says `Game.hint` is pure on its
`state` argument, for every game, and Palisade departs in nothing. The six
deductions are counted in `PALISADE_RUNGS` and stay.

### Requirement: The hint is seeded from the player's own walls and marks

`hint(state)` SHALL start the solver from the player's current state: the
player's walls as walls already drawn, and every edge the player has marked
"no wall" as a join already made. It SHALL then run the six deductions to a
fixpoint.

#### Scenario: A player no-wall mark is not re-hinted

- **WHEN** the player has marked an edge "no wall" that the solver would also
  deduce as no-wall
- **THEN** that edge does not appear as a step in the returned plan, since its
  fact is part of what the solver starts from

## keep `palisade`: Palisade's clue layer stays its own

The doubt was about the sentence on the shared renderer taking palette indices
and a callback. The moves took that sentence to `border-grid` "The shared
renderer does not know which game is drawing"; what is left here names only
what is Palisade's.

## keep `palisade`: The hint refuses when the deductions force no edge

Not `collection`. `engine-hints` says which sentences a refusal may be and
that deduction may run out only where a tier permits search; it does not say
that Palisade's hint gives up here. The arm is reachable: Palisade has no
difficulty contract and no `finishesByDeduction`, and its `solve` fails with
`PUZZLE_NOT_REASONABLE`, which `loadDesc` (`src/engine/desc-error.ts`) lets
through, so a pasted game ID whose clues the deductions cannot finish loads.
See the note below on which sentence it then gives.

## keep `palisade`: Palisade refuses a region size the grid cannot be divided by

The bounds sentence is not a copy a reader can do without. `validateParams`
(`src/games/palisade/state.ts`) computes `wh % k` and relies on the declared
bound to have refused `k = 0` first: with `k = 0` the remainder is `NaN`, the
test is false, and the params would pass. The sentence says where that refusal
lives, and its scenario pins it.

## keep `palisade`: A hint sentence is advice that has not been applied

`engine-hints` "The necessity-voice rule applies to every hinting game not
ledgered as narrating moves" says which games the rule binds, not Palisade's
words. "must be a wall" and "can't be a wall", never "is a wall", are the
hint's own wording, which stays.

## keep `palisade`: Making the hinted edit completes the step

`border-grid` "Border-grid games share the hint's notation layer" says the
keep-track verdict comes from the engine. This says what the verdict is for a
player: the exact edge and the right button complete the step, a wrong button
on the same edge does not. Nothing in `border-grid` states that.

## keep `palisade`: The hint paints a firing's edges as one set

A hint's marks. `border-grid` says the highlight is drawn by the shared layer;
that a firing's unset edges share one color because they share a fate is said
only here.

## keep `palisade`: The hint marks the cells it reasons from inside the cell body

A hint's marks. `border-grid` names the striped region and the outlined
squares as shared drawing; which cells each Palisade deduction marks, and that
`equivalentEdges` marks the region and not the clue cell, is Palisade's.

## note `palisade` gives the deduction-exhausted sentence on a board with no tier

`hint` in `src/games/palisade/index.ts` returns `DEDUCTION_EXHAUSTED` when the
deductions force no edge. That sentence reads "This board's difficulty allows
positions that need trial and error", and Palisade has no difficulty.
`engine-hints` "Deduction runs out only where the tier permits search" says a
hinting game with no difficulty contract SHALL NOT be able to emit it. The
board that reaches it is a pasted game ID the solver cannot finish, which
loads because Palisade implements no `finishesByDeduction`. Separate, on the
same board, refuses up front with `PUZZLE_NOT_REASONABLE`. Either Palisade
takes Separate's refusal, or both games implement `finishesByDeduction` so the
board never loads and both arms go. Not verified by running the app; read off
`loadDesc`, `answerVerdict` and the two `hint` functions.

## note a comment in `src/games/palisade/index.ts` describes the midend

The doc comment on `hint` says it "Refuses on a solved board or one carrying a
mistake". The function does neither; the midend does, before asking it.
