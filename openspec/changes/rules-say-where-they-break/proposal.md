## Why

`architectural-review-blue-sky` stage 2 (owner, 2026-11-21). A compiled
description answers only `isAnswer(...): boolean`
(`src/describe/compile.ts`), whether the whole board is right. So each game
re-derives its rules for the live red marks: Tents' `findErrors`
(`tents/render.ts`) restates its description's `shape`, its `count` clue and
its `pairs` rule. Measured at `717626277`: 965 lines in 23 fill games,
name-keyed, about 300 of them in `render.ts` (the review's design.md §
"Declared facts, restated by hand"). pzprjs keeps the same thing as a
declared checklist whose every check carries the error it highlights.

## What Changes

- Each rule, shape constraint and clue `means` compiles, beside `isAnswer`,
  to where it is broken on a partial board: the elements of each violation,
  and which statement it breaks. "Can no longer be met" on a partial board
  is defined per statement form and checked sound.
- Live errors are drawn from it through one engine path; the games'
  `findErrors`/`markErrors` and the State caches built for them go.
- Where games drew the same violation differently, they now draw it the
  same way (pre-approved for consistency, owner 2026-11-21).
- This is the first capability of the end state in `docs/doctrine.md` §
  "Where the engine is heading: a game is its description".

## Capabilities

### Modified Capabilities

`latin-solver` ("A game's answer check is compiled from its rules") or its
successor, `engine-drawing`, and the game specs that state error marks.

## Impact

`src/describe/compile*.ts`, `src/engine/solve/describe-runtime/`,
`src/engine/render/`, the games' `render.ts`, `state.ts` and `solver.ts`.
