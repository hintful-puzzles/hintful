# Verdicts: separate

## keep `separate`: The hint refuses a board its solver cannot finish

The arm is reachable, so it is not a defensive branch. `engine-params` "A
board loads only if the game's own solver solves it" holds a game with a
difficulty contract, and "An untiered game's board loads unless
finishesByDeduction refuses it" holds the rest. Separate has neither a
contract nor a `finishesByDeduction`, and its `solve` fails with
`PUZZLE_NOT_REASONABLE`, which `answerVerdict` in `src/engine/desc-error.ts`
lets through. A pasted game ID whose letters the solver cannot divide loads,
and this refusal is what its player meets.

## keep `separate`: The solved flash lifts every cell

A decision about the game's look, made when the boards took the quiet surface
(`openspec/changes/archive/2026-10-08-give-the-boards-a-visual-identity/proposal.md`:
"The completion flash lifts every cell"), and stated at the assignment in
`src/games/separate/render.ts` as `engine-colors` "A departure from a shared
role is stated at the assignment" asks. It is not one sentence of the surface
requirement: that one says no cell is lifted, and this is the one moment every
cell is.

## keep `separate`: Separate runs its solver as a declared ladder that its hint shares

The two names are worth their words. `runDeductionFixpoint` tells a session
that the ladder is on the shared runner, and so under `engine-helpers` "A
shared deduction-fixpoint scaffold" and its neighbors, where Palisade's solver
beside it is not. The border-grid bytes are why the generator and the hint can
run on one state: the hint seeds the player's borders straight into it.

## keep `separate`: Separate refuses a letter count the grid cannot be divided by

The question was whether to state the refusals of a `k` of 1 and a `k` above
26. The regrouped requirement states both, with a scenario, and
`validateParams` in `src/games/separate/state.ts` does both under `full`.

## note the word for the two cut "changes no board and no frame" requirements

"Sharing the mechanic changes no board and no frame" and "Sharing the layer
SHALL change no Palisade frame" are in no regrouped spec, `border-grid`
included, so there is nothing to settle. `obsolete` is the right word: each was
a promise about a move of code that is finished, and the games' own copies are
gone (`src/games/separate/` and `src/games/palisade/` hold no hit test, toggle
or error model; both import `src/engine/border-grid.ts`).

## note `engine-colors` "The solved flash is one role" does not cover a lifted flash

It says a flash drawn as a fill takes the shared `FLASH` role, and excuses a
flash that is an animation. Separate's and Palisade's flash is a fill, of the
given's surface, and takes neither path. The departure is recorded in the two
games' specs and at the two assignments; the shared requirement reads as if no
game departed.
