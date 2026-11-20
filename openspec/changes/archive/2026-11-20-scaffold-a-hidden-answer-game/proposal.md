## Why

Filed on the owner's word, 2026-11-19, from the review of the Wordguess and
Wordtrail session logs.

`scripts/new-game.sh` offers two skeletons, `grid` and `edges`, both
deduction puzzles with a visible board. `docs/new-game.md` § "The route by
kind of game" has four kinds, none of them a game whose answer is hidden and
found by guessing against feedback (Guess, Wordguess). On 2026-11-18 the
agent scaffolded Wordguess with `grid` and then:

- deleted `generator.ts`, `solver.ts`, `hint.ts`, the plants file and two
  test files, and reverted the scaffold's `soundness.json` entry;
- rewrote the catalog entry, which said "Shading puzzle", family `shading`;
- replaced `state.ts`, `index.ts` and `render.ts` wholesale;
- took its route through the guides from reading Guess, since the kinds
  table named no exemplar for it.

The first verdict, about three minutes, was spent mostly on the wrong game.
The vision is dozens of new games, and code-breaking and word games are a
family the owner asked for by name (`add-word-list-puzzles`).

## What Changes

- A third skeleton, `code`, for a game whose answer is hidden: rows of
  guesses scored against the answer, built on `src/engine/code-rows.ts`, with
  the parts such a game has (params, the desc as the answer, keypad input,
  submit and refuse, the feedback marks, the reference panel hook, a hint
  built on the guess search) and none it lacks.
- A row in the kinds table: "Hidden answer and feedback", exemplar the
  `code` skeleton and Guess, with the sections of the guides its kind reads
  and those it skips (a solver ladder, the soundness check).
- `new-game.sh` writes catalog wording that fits the kind it was given, or
  leaves a placeholder the first verdict names, rather than another kind's.

## Impact

`src/skeleton/code/` (new), `src/skeleton/README.md`, `scripts/new-game.sh`,
`docs/new-game.md` § "The route by kind of game".
