# examine-implicit-candidates — tasks

## 1. Read the code

- [x] 1.1 List every place the candidate walk and its helpers treat empty notes
      as "no candidates", and what each would do under "derive them" (design D1).
- [x] 1.2 Read Group's `visibleCandidates` and decide whether it is the
      implicit reading in miniature (it is; the engine owns it now, design D2).
- [x] 1.3 Sketch the option on `runCandidatePlan`: what populate, the obvious
      clean and the dup culls become under it (design D1).

## 2. Measure, per candidate game

- [x] 2.1 Share of plan steps that are populate or clean, over every preset.
- [x] 2.2 How much of the board the implicit reading ends up noting anyway.
- [x] 2.3 Steps under each reading.
- [x] 2.4 For Map, why it keeps the implicit reading (design D6).

## 3. Decide and build

- [x] 3.1 Player preference with a per-game default the engine owns: owner's
      direction, defaults from the measurement (design D5).
- [x] 3.2 The walk's `reading` option, `impliedNotes`, the note legs and
      `pencilAdd`, the `regionsFull` single, `reads` on a step's words.
- [x] 3.3 The seven walk games: the `Ui` field, the `hint-notes` preference,
      `pencilAdd` in their moves, their defaults; Group's `visibleCandidates`
      retired.
- [x] 3.4 Latin `set` records and outlines its cells (`genericLatinArea`).
- [x] 3.5 Guards: `candidate-reading.test.ts` (derived population, both
      readings), the walk's and the helpers' unit tests, Solo's no-note boards.
- [x] 3.6 Spec deltas (ts-engine), `docs/games/hints.md` § "Two readings of an
      unmarked cell", the engine catalog, `help/features.md` § "How a hint uses
      pencil marks".
- [x] 3.7 Run the app: the preference, a Solo hint with no notes, a Keen hint
      penciling in first, a note leg in a switched game.
