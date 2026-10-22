# Tasks — color-path-pairs

## 1. The free palette

- [x] 1.1 Design the set of semantically free colors (design D1): measured in
      both schemes, against the marks drawn over pieces, with its tests.
- [x] 1.2 `scripts/checks/color-collide.test.ts` before and after; the set's size and worst pair
      recorded in `design.md`.

## 2. Path

- [x] 2.1 Discs and the lines reaching them in their pair's color, a piece
      reaching no number in ink, colors repeating past the set (D2).
- [x] 2.2 Broken lines and mistakes, the joined pair and the drag preview
      decided (D3), with captures in both schemes shown to the owner.
- [x] 2.3 Hint marks read on colored lines in both schemes; snapshots
      re-baselined with every moved line explained; help page's look updated.

- [x] 2.4 A drag along a line and on past its end carries the line on rather
      than taking it up (owner, 2026-10-21, found playing the colored board).

## 3. The other free-color games

- [x] 3.1 Flood, Guess and Samegame onto the free set where it serves, and
      any other game coloring pieces that mean nothing (D4); each that cannot,
      with its reason; `TEN` retired if nothing uses it. (None moves: D4.)
- [x] 3.2 Captures of each moved game in both schemes, for the owner. (None
      moved.)

## 4. One set of ten (design D5; owner, 2026-10-21)

Sections 1 and 3 shipped a four-color `FREE` and kept `TEN`. The owner
replaced that outcome with D5. Read D5 whole before starting.

- [x] 4.1 The engine set: `FREE` becomes D5's ten, in its order, each with
      its word through `named`/`wordOf` and its number color (white on the
      light brown). Its names replace `TEN_NAMES`. Note `YELLOW` and the
      set's yellow differ in the dark scheme: decide whether the set's yellow
      is `YELLOW` retuned or a color of its own, against
      `colors.test.ts` "names each color once".
- [x] 4.2 Its tests: the set's worst pair for the first 3, 4, 6, 9 and 10 in
      both schemes in `colors.test.ts`, with the bars D5 measured; word
      extents for magenta, olive and mint; `palette.test.ts`'s free-colors
      test re-derived to D5's held and relaxed marks, and the edged-line
      contrast. Re-measure every number in D5 before pinning it, and see
      each new bar fail on a planted value.
- [x] 4.3 Path: the first 9 members, pair lines, rings and discs edged 1px
      in `BLACK` underneath, and each disc's number in its member's number
      color. Re-baseline snapshots, explaining every moved line. Play a 9x9
      and a 15x10 in the app, light and dark, with a hint, a chain, a
      mistake and a drag on the board.
- [x] 4.4 Flood, Guess and Samegame onto the set, with `TEN` retired:
      renderers, `COLOR_NAMES`/`colorName`, Guess's cursor comment (weigh
      `CURSOR` now that no peg is green), `palette-source.test.ts`'s comment,
      and `colors.ts`'s header on why the set is its size. Specs whose
      requirement names a color or "the collection's ten" (`flood` §
      "Look: Flood draws a flat field of colored tiles", the "Fill with
      yellow" scenario) get deltas. Help pages that name a color are
      updated. Each game is played in the app, light and dark, at its
      largest color count, with its hint and cursor shown.
- [x] 4.5 `scripts/checks/color-collide.test.ts` before and after; `docs/rendering.md`
      § "The palette: three layers, meaning first" says there is one set
      that means nothing.

## 5. Close-out

- [x] 5.1 `npm run game -- path` (and `flood`, `guess`, `samegame`) green;
      commit, push; the owner accepts the look; archive.
