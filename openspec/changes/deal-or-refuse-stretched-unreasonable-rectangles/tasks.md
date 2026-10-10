# Tasks

## 1. Measure

- [x] 1.1 The sweep, with factors of 0.25, 1 and 4 added: 4,000 draws a
  shape, 400,000 where under four were found (`design.md`, Decision 1).
- [x] 1.2 Absent, at both shapes: every placement on every division drawn.
- [x] 1.3 Tabulated against the base grid. No rule is borne out, and no
  refusal is written.

## 2. Build

- [x] 2.1 Not done: with no refusal, nothing but `division` reads the base
  grid's size.
- [x] 2.2 Neither a refusal nor a deal: the engine's answer stands.
- [x] 2.3 A board dealt solved is dealt again, in `generate`
  (`src/engine/deal.ts`), with tests on a fake game, on Rectangles at 3x3 and
  at 9x9 with a factor of 2, and on Netslide at 3x3 with one move.
- [x] 2.4 In the running app: Rectangles at 3x3 Easy dealt forty times, none
  solved; and 5x5 at 0.5 and Unreasonable, for the engine's sentence.

## 3. Close

- [x] 3.1 The spec delta, on `engine-difficulty`, and `skip_specs` removed.
- [x] 3.2 `help/games/rect.md` names no limit of the expansion factor.
- [x] 3.3 Commit, push, archive.
