# hatch-the-line-a-hint-counts — tasks

## 1. The mark

- [x] 1.1 `engine/hatch.ts` (`hatchBands`, `HATCH_OPACITY`, `hatchPeriod`);
      `GameDrawing.drawHatch`; the canvas, recording and SVG drawings; every
      hand-built test double.
- [x] 1.2 Measure before choosing the opacity, on the palettes the app paints
      (`puzzle/scheme-palettes.ts`). At 0.3 on Magnets: stripe 1.16–1.44 light,
      1.13–1.44 dark; the weakest symbol, the `?`, 1.97 → 1.56 light and
      1.80 → 1.55 dark.
- [x] 1.3 Guards, each seen to fail under a plant: stripes visible per hatching
      game (plant 0.1 → 1.12 < 1.25); bands continuous across tiles (plant a
      rect-anchored band); Magnets' symbols legible (plant 0.45 → 1.40 < 1.48).

## 2. Magnets

- [x] 2.1 Highlights carry `line` and `reasonClues`; every line premise hatches
      its line; the rest-of-the-line outline is gone; a met line cited as a
      reason is its clue.
- [x] 2.2 Outlines join a square only to its own domino.
- [x] 2.3 "the column beside it" / "this column" / "a row" for a partner's met
      line; the worst case stays within the ledger's 300.
- [x] 2.4 The swapped poles in `oneEndNeither` (owner's second board, pinned by
      desc and moves); a domino step naming one line hatches it.
- [x] 2.5 Chrome, light and dark, on the owner's board; owner accepted
      2026-09-23.

## 3. Every other game whose hints name a row or column

- [ ] 3.1 Census the population by what the narration says (a sentence naming
      "this row", "this column", "this line" or "its row/column"), keyed on the
      shape, read the result, and record it here.
- [ ] 3.2 Per game: hatch the named line (and its clue slot where the game has
      one) in place of any line outline; keep outlines for particular cells; a
      second line named by where it lies.
- [ ] 3.3 Per game, a render-scenario assertion that the hatch covers exactly the
      named line; the contrast guard picks each game up by its `drawHatch` call.
- [ ] 3.4 Run each converted game in Chrome, light and dark.

## 4. Close out

- [ ] 4.1 Spec deltas per converted game; archive.
