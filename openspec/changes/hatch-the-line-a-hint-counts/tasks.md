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

- [x] 3.1 Census, 2026-09-23: every hinting game's plans walked on every leaf
      preset, two seeds each, collecting the sentences that name a row, column
      or line (keyed on the words, then read and classified by hand, because
      "line" is also a drawn segment in Loopy, Spokes, Sticks and Slant).
      - **Name one line as the thing reasoned about**: the row/column Latin
        games through the shared preset (Keen, Mathrax, Unequal, Group, Towers,
        Salad) and Solo's own rows, columns and diagonals; Towers' and Salad's
        clue lines; Pattern; Boats ("Row 3 still needs"); Tracks; Unruly's
        line counts; Singles ("shares a line with"); Guess ("the outlined
        row"); Netslide's "Column 2 never slides".
      - **Name two lines** ("in this row and column", "its row, column or
        block", Seismic's "in its row or column", Singles' pair in one row and
        the next): no hatch, by the rule.
      - **A destination, not a reason**: Sixteen and Netslide's "take it to
        row 3". Left for a separate decision.
- [ ] 3.2 Per game: hatch the named line (and its clue slot where the game has
      one) in place of any line outline; keep outlines for particular cells; a
      second line named by where it lies. *Done: the shared sidecar lane and
      `CandidateHighlights.hatch`, the Latin preset, Keen, Towers (clue lines
      through both clue slots), Unequal, Group, Mathrax, Salad (count lines, and
      a border clue's row with its run outlined), Solo (rows, columns and
      diagonals; a block keeps its outline), Pattern (its wash retired, clue
      strip hatched); then Boats (line counts, a center segment's line, the
      shared-diagonal line and a refutation's unmet line, number slot
      included), Tracks (every clue-line technique, clue slot included; the
      counted squares stay outlined), Unruly (its wash retired; "the ringed
      row" named by its mark), Singles (a touching pair's line, and "shares a
      line with" when every target shares the one line), Guess ("the outlined
      row" becomes "the striped row", pegs, gaps and score box hatched) and
      Netslide's "never slides". The evidence wash is down to Light Up.*
- [ ] 3.3 A guard that every step naming a line draws a hatch and no other step
      does, over every hinting game on a full repaint
      (`puzzle/hatch-contrast.test.ts`). *Written; it found Pattern unconverted
      and, once, its own falsy-zero bug.*
- [ ] 3.4 Run each converted game in Chrome, light and dark. *Keen, Towers,
      Pattern, Unruly and Guess checked in dark. Each game without a line step
      in an existing frame gained a test reaching one (Boats, Tracks, Singles,
      Netslide), each seen to fail with its hatch removed.*

## 4. Close out

- [ ] 4.1 Spec deltas per converted game; archive.
