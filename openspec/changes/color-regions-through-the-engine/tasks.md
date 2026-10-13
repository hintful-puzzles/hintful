# Tasks

## 1. The engine's half

- [x] 1.1 `src/engine/region-fill.ts`: `regionFills` gives each region of a
      division a fill number, regions sharing a side differing, the fills
      spread, with no random draw. Tests on drawn divisions at four, six and
      eight fills, seen to fail with the constraint planted off.
- [x] 1.2 `SIX_FILLS` in `src/engine/color/colors.ts`: the set a region's
      fill is drawn from. `colors.test.ts` holds every pair of it to the
      neighbor floor in both schemes, and `palette.test.ts` holds each mark
      the collection draws on a cell to a bar on every member.

## 2. Star Battle

- [x] 2.1 A square's surface is its region's fill
      (`src/games/starbattle/render.ts`); the frame snapshot is re-baselined
      and its diff is color indices alone.
- [x] 2.2 `neighbor-contrast.test.ts`: the three upper fills beside the
      board's margin are in the ledger, with what is between them.
- [x] 2.3 The help page says what the colors are, and the icons are captured
      again from the colored board.

## 3. The questions the session settled

Each by what was on the board, in both schemes (2026-10-13).

- [x] 3.1 **How faded (3).** A step of its own. The washes as they stand are
      uneven as a whole board in the light scheme (teal's is above the board,
      green's well under it) and too light in the dark for a star to read on.
- [x] 3.2 **Eight or four (4).** Six, at two steps of lightness taken in turn
      round the hue circle. Six hues at one lightness looked the most even
      and left purple and pink 0.036 apart, half the floor two neighbors are
      held to; four gave a board of ten regions too few colors to look like
      the reference.
- [x] 3.3 **A mistake and a hint on a fill (5).** Red is left out of the
      set, since its wash is the mistake's. Blue stays in: the hint's ring
      and stripes are measured on it, and on every other member.
- [x] 3.4 **A region the puzzle finishes (6).** Star Battle has no finished
      region, so nothing gives way here. The next game that takes the fills
      and has `REGION_DONE` settles it on its own board.

## 4. Docs and specs

- [x] 4.1 `docs/rendering.md` § "What a board looks like: pieces on a quiet
      surface" and `docs/engine-catalog.md` say what a region's fill is and
      how a game takes it.
- [x] 4.2 Deltas: `engine-colors`, `engine-helpers`, `starbattle`.

## 5. The owner's look

- [ ] 5.1 Show the owner the colored board in both schemes and wait for
      their word on the look. Committed and **not pushed** until then.
- [ ] 5.2 On approval: push, and archive.
