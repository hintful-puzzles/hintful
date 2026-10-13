# Tasks

## 1. The engine's half

- [x] 1.1 `src/engine/region-fill.ts`: `regionFills` gives each region of a
      division a fill number, regions sharing a side differing, the fills
      spread, with no random draw. Tests on drawn divisions at four, six and
      eight fills, seen to fail with the constraint planted off.
- [x] 1.2 `FOUR_FILLS_QUIET` in `src/engine/color/colors.ts`: the set a
      region's fill is drawn from. `colors.test.ts` holds every pair of it
      to the neighbor floor in both schemes, and `palette.test.ts` holds
      each mark the collection draws on a cell to a bar on every member.
- [x] 1.3 **One walk for Map and Star Battle** (the owner, 2026-10-13: "the
      same exact engine mechanism"). Map's generator held the same walk as
      `fourcolorRecurse`: fewest colors left goes next, take back a dead
      end. It is `colorRegions` now, with what differs passed in: Map draws
      (its coloring is the answer, and a seed deals its own), a renderer
      does not. Map's frozen differential matches byte for byte, and was
      seen to fail with the order of its draws planted wrong.

## 2. Star Battle

- [x] 2.1 A square's surface is its region's fill
      (`src/games/starbattle/render.ts`); the frame snapshot is re-baselined
      and its diff is color indices alone.
- [x] 2.2 `neighbor-contrast.test.ts`: the two upper fills beside the
      board's margin are in the ledger, with what is between them.
- [x] 2.3 The help page says what the colors are, and the icons are captured
      again from the colored board.

## 3. The questions the session settled

Each by what was on the board, in both schemes (2026-10-13).

- [x] 3.1 **How faded (3).** A step of its own. The washes as they stand are
      uneven as a whole board in the light scheme (teal's is above the board,
      red's well under it) and too light in the dark for a star to read on.
      Made fainter again at the owner's word on seeing it.
- [x] 3.2 **Eight or four (4).** Four, in Map's hues, at the owner's word on
      seeing six: "the same 4 colors in each". They sit at two steps of
      lightness taken in turn round the hue circle, since four hues this
      faint do not clear the neighbor floor at one lightness.
- [x] 3.3 **A mistake and a hint on a fill (5).** Red is in the set, as it is
      in Map's, at a strength the mistake's wash is told from: 0.10 apart in
      both schemes, measured, and held by `palette.test.ts`. The hint's ring
      and stripes are measured on every member.
- [x] 3.4 **A region the puzzle finishes (6).** Star Battle has no finished
      region, so nothing gives way here. The next game that takes the fills
      and has `REGION_DONE` settles it on its own board.

## 4. Docs and specs

- [x] 4.1 `docs/rendering.md` § "What a board looks like: pieces on a quiet
      surface" and `docs/engine-catalog.md` say what a region's fill is and
      how a game takes it.
- [x] 4.2 Deltas: `engine-colors`, `engine-helpers`, `starbattle`.

## 5. The owner's look

- [x] 5.1 The owner saw six fills in both schemes (2026-10-13): "I love it!
      Maybe just a bit fainter", and asked for Map's four and Map's
      mechanism. Both done above.
- [ ] 5.2 Show the owner the four fainter fills, and beside them Map drawn
      with the same quiet four, for the one question left: **does Map keep
      its own strength, or take the quiet four too?** The hues are the same
      either way. As built Map keeps its washes: its color is the player's
      answer and has to stand off a region with no color yet, which in the
      dark scheme the quiet four barely do. Committed and **not pushed**
      until the owner has seen the four.
- [ ] 5.3 On the owner's word: push, and archive.
