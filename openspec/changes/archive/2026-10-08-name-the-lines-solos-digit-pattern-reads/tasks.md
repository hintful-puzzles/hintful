## 1. Verify first

- [x] 1.1 On the pinned board, walk the hint to the `digit-set` firing and list
      by hand what it read: the squares it names, and the squares a replay
      needs beyond them. Say whether the shortfall is the confined lines'
      other squares and nothing else.
      **Found (2026-10-08):** the firing is on 6, confined in columns 3, 7 and
      8 to rows 3, 5 and 7. The step named the six squares 6 is left with and
      the three it is struck from. Of the eleven squares the replay returned to
      the start, two decide it: the top square of column 8 and the bottom
      square of column 7, both in the confined columns and both squares an
      earlier step struck 6 from. Keeping the three columns whole and
      returning everything else, the firing follows. Nothing outside the lines
      is needed.
- [x] 1.2 Rule out the `GATED` reading: that the extra reads only decide
      whether the rung fires and the conclusion rests on the named squares.
      **Ruled out:** with 6 back in column 8's top square, that column may
      hold its 6 in row 1, so row 3 no longer owes its 6 to the pattern and
      the strike is false, not merely unfired.
- [x] 1.3 Read the Solo spec's "The locked pattern shows its own cells" and the
      archived change that wrote it. Record whether marking only the pattern
      was decided against marking the lines, and why.
      **Not decided.** `mark-the-cells-solo-points-at` met a frame that marked
      nothing under "these lines", and fixed it by recording the pattern's
      cells and rewording to point at them. It never weighed marking the lines
      as well; the premise audit that shows the need did not exist yet.
- [x] 1.4 Open the pinned board in the app and look at the step as a player
      sees it today.

## 2. Build

- [x] 2.1 The `set` reason of a region-less firing carries the lines it read
      (`solver.ts`'s `confinedLines`). Each firing is two facts, columns
      confined to rows and the other rows confined to the other columns, and
      either alone gives the strikes (checked on the pinned board by replay);
      the one over fewer lines is recorded.
- [x] 2.2 The step stripes them and outlines the cells the digit is left with,
      and the sentence points at both (`hint-text.ts`'s `say.confined`).
- [x] 2.3 The sentence fits the length limit, on the pinned board and on a
      firing confined the other way round (rows to columns): 106 and 109
      characters at the two pins in `solo-hint.test.ts`. The rows pin is kept
      by hand, since the scan's 48 boards hold none.
- [x] 2.4 The `SHORT` entry and its pin are removed, and the premise audit
      passes the firing. The board stays in the sweep as an `EXTRA_BOARDS`
      entry. Planted: striping only the pattern's cells turned both of Solo's
      sweeps red on `solo: set @ digit-set`.

## 3. Close

- [x] 3.1 The Solo spec's locked-pattern scenario.
- [x] 3.2 Solo's help page: its hint section describes no single step, and its
      legend is `hintMarks`, whose outline and stripes entries now cover this
      one.
- [x] 3.3 Run the app on the pinned board: the step's marks and words, in light
      and dark, at a phone width.
- [x] 3.4 `docs/games/hints.md`: § "Hatch the line the sentence names" (several
      lines as one counted set) and § "A premise names everything its
      deduction reads" (a read the player must check is drawn; a fish has two
      readings).
