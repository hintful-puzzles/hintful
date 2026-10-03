## 1. Decide

- [x] 1.1 Owner (2026-10-02): Check & Save is an answer check in every game,
      hidden answers included; a saved board must always be finishable; boards
      with several answers are refused, upstream's included; the rule lives in
      the engine where it can.

## 2. Engine

- [x] 2.1 `loadDesc` refuses a board the game's `solve` proves has several
      answers (`DESC_NOT_UNIQUE`) or none, for games with `findMistakes`,
      honoring `nonUniqueTiers`.
- [x] 2.2 `upstream-descs.test.ts` places every fixture field or fails;
      translate Boats', Keen's and Tracks' renamed fields and numbered tiers.
- [x] 2.3 The mistake invariant starts a board Solve calls `NOT_STARTED`.

## 3. Black Box

- [x] 3.1 Count answers with the hint's search over every laser fired, with
      propagation; cross-check against every layout.
- [x] 3.2 Deal a ball at a time (measured against scatter-and-redeal); the
      generation-only ball limit (measured).
- [x] 3.3 `solve` says `MULTIPLE_SOLUTIONS`; `findMistakes`; the mistake frame
      with a paint-twice test.
- [x] 3.4 The hint loses its undo steps; its layout search keeps the marks.

## 4. Mines

- [x] 4.1 `findMistakes` for a flag with no mine; the mistake frame with a
      paint-twice test.
- [x] 4.2 The hint loses its "flag must come off" leg.

## 5. Docs, record and acceptance

- [x] 5.1 Help pages, `docs/games/hints.md`, `docs/games/solver-and-generator.md`.
- [x] 5.2 Spec deltas; scaffold `count-a-check-as-help`.
- [x] 5.3 Run both games in the app: Check & Save on a wrong mark, and a dealt
      board played through. (Chromium, 2026-10-02: a wrong Black Box guess and
      a wrong Mines flag each framed and the save refused; the 3×3 corners ID
      refused from the URL; an 8×8 3–6 deal auto-solved to completion.)
- [x] 5.4 Owner acceptance on how both checks look and read (accepted
      2026-10-03 after a phone playtest of the deploy).
