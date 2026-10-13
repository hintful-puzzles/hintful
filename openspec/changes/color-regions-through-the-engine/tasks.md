# Tasks

## 1. The engine's half

- [x] 1.1 `src/engine/region-fill.ts`: `regionFills` gives each region of a
      division a fill number, regions sharing a side differing, with no
      random draw, the fills spread by the cells each covers. Tests on drawn
      divisions at four, six and eight fills, seen to fail with the
      constraint planted off.
- [x] 1.2 **One walk for Map and Star Battle** (the owner, 2026-10-13: "the
      same exact engine mechanism"). Map's generator held the same walk as
      `fourcolorRecurse`: fewest colors left goes next, take back a dead
      end. It is `colorRegions` now, with what differs passed in: Map draws
      (its coloring is the answer, and a seed deals its own), a renderer
      does not. Map's frozen differential matches byte for byte, and was
      seen to fail with the order of its draws planted wrong.
- [x] 1.3 **The region palette** (the owner, 2026-10-13: "a relatively low
      saturation region palette that could work well as the background of
      regions across the entire catalog", designed with a designer
      subagent over two rounds, the second on screenshots of the app).
      `REGION_FILLS` in `src/engine/color/colors.ts`: eight faint fills, of
      which a board takes the first four, six or eight. `colors.test.ts`
      holds every pair to the neighbor floor in both schemes, and
      `palette.test.ts` holds each mark the collection draws on a cell to a
      bar on every member.

## 2. Star Battle

- [x] 2.1 A square's surface is its region's fill, from the palette's first
      four (`src/games/starbattle/render.ts`); the frame snapshot is
      re-baselined and its diff is color indices alone.
- [x] 2.2 `neighbor-contrast.test.ts`: the four fills beside the board's
      margin are in the ledger, with what is between them.
- [x] 2.3 The help page says what the colors are, and the icons are captured
      again from the colored board.

## 3. Map

- [x] 3.1 Map's four are the palette's first four (the owner, 2026-10-13:
      "I actually never liked the red in Maps"): pink where the red was,
      and yellow, teal and violet where they were, so a saved or shared
      board opens with its other three colors unchanged. Stronger in the
      dark scheme than Star Battle's, since there the fill is the answer.
- [x] 3.2 The hint and the help page say "pink"; the spec's order of the
      colors is modified; the icons are captured again.

## 4. The questions the first session settled

- [x] 4.1 **How faded (3).** A set of its own: the washes are uneven as a
      whole board and too light in the dark scheme for a star to read on.
- [x] 4.2 **Eight or four (4).** Four in Star Battle and in Map, at the
      owner's word, of a palette of eight.
- [x] 4.3 **A mistake and a hint on a fill (5).** No red in the palette. The
      hint's ring and stripes are measured on every member.
- [x] 4.4 **A region the puzzle finishes (6).** Star Battle has none. The
      next game that takes the fills and has `REGION_DONE` settles it on
      its own board; `docs/rendering.md` says what was measured.

## 5. Docs and specs

- [x] 5.1 `docs/rendering.md` § "What a board looks like: pieces on a quiet
      surface" and `docs/engine-catalog.md`.
- [x] 5.2 Deltas: `engine-colors`, `engine-helpers`, `starbattle`, `map`.

## 6. What the palette's design left for later

Measured by the designer on the palette, none of it in this change:

- **Signpost stays on `EIGHT_FILLS`.** Its chains past the eighth are
  midpoints of two fills, and midpoints of fills this faint stand 0.040
  apart at best. Moving it means reusing colors past the eighth chain, which
  a player sees. Its entries 10 and 15 are one color to the eye today
  (0.009 apart): a defect of its own.
- **Keen, Solo and the other cage games**: a pencil note and an entry read
  weaker on a dark fill than on a plain cell, and `REGION_DONE` is 0.030
  from the light violet.
- **Map's stipples** in the light scheme are faint dots of the fill on the
  gray surface, as three of the four were before. The designer would give
  them a thin ink edge.

## 7. The owner's look

- [x] 7.1 The owner saw six fills (2026-10-13): "I love it! Maybe just a bit
      fainter", then asked for Map's four and mechanism, then for the red
      to go and a palette for the catalog.
- [ ] 7.2 Show the owner Star Battle and Map on the region palette, in both
      schemes. Committed and **not pushed** until they have seen it.
- [ ] 7.3 On the owner's word: push, and archive.
