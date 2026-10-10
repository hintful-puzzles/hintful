# Tasks

## 1. Measure

- [x] 1.1 Time the layout, the solver and `rungsFinish` apart on twenty Easy
  deals at 30x30, 50x50 and 70x70. The solver and the replay share it about
  evenly; the layout is nothing. A pasted board grades by the same replay.
- [x] 1.2 Sweep both tiers over every shape from 1 to 6, 8 and 12 on the
  shorter side and up to 14 on the longer, at an expansion factor of 0, 0.5
  and 2, five to eight deals a shape, and the large sizes to 100x100 at Easy
  and 70x70 at Unreasonable. Count the draws a board takes and what each
  thrown-away draw was thrown away for.
- [x] 1.3 No bound: an Easy deal is a wait at every size, and Unreasonable was
  giving up for a reason that could be mended. Recorded in `design.md`.

## 2. Build

- [x] 2.1 The hint replay carries each clue's fits between steps, the move
  stops reading a box at its first wrong edge, and the solver's two passes and
  its winnowing stop counting over every number. No recorded board or plan
  moved.
- [x] 2.2 The Unreasonable deal moves a number off the second answer the
  search finds, and its bound of 400 squares goes. 2x9 to 2x11 are refused as
  too rare to deal. A strip with an expansion factor deals.
- [x] 2.3 Tests: every step of a plan is the firing its board gives afresh; a
  line inside a rectangle leaves it unfinished; a strip deals with an
  expansion factor; a 60x60 board deals and opens pasted; 30x30, 2x12 and 4x4
  deal at Unreasonable; the refusals. Each new guard seen to fail.
- [x] 2.4 In the running app: the Custom dialog's refusal of 2x9 at
  Unreasonable, and a 30x30 Unreasonable board, a 70x70 Easy board and a 1x7
  board at 50% expansion dealt.

## 3. Close

- [x] 3.1 The spec delta, and `skip_specs` removed from `.openspec.yaml`.
- [x] 3.2 `help/games/rect.md` and `help/differences.md` name no size bound
  and need no change. The guide has what this taught.
- [x] 3.3 Commit, push, archive.
