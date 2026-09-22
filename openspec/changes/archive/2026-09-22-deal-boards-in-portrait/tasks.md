# deal-boards-in-portrait — tasks

## 1. Measure the right thing first

- [x] 1.1 Re-take the census on `computeSize` aspect, not on param names, for
      every registered game's default and every preset leaf. Give it a known
      positive (Magnets 6x5 must read as landscape) and a vacuity count.
      *Done as `src/engine/orientation.test.ts` (57 games, ≥400 boards). It
      found what the param-name census missed: Dominosa is landscape at every
      order ((n+2)×(n+1), no `w`/`h` in its params), Loopy's tilings disagree
      with their numbers both ways, and Cube's solids draw ~1.12 wide at every
      size.*
- [x] 1.2 For every landscape entry, write down whether the transpose is simply
      the same game on its side (most rectangular grids), or not (gravity,
      directed tilings, fixed-side goals or clues). Read each game's rules; do
      not guess from its family. *Not turned: Bricks and Same Game (gravity),
      Slide (key block top-left, exit on the right), Ascent's hexagonal modes,
      and Loopy's triangle/hexagon tilings plus Hats (whose patch is not the
      same shape turned). Measured: the Loopy tilings whose drawn size exchanges
      exactly are Squares, Snub-Square, Cairo, Octagonal, both Penroses,
      Compass-Dodecagonal and Spectres. Wide by nature: Cube's solids, Ascent's
      Hexagon.*
- [x] 1.3 Raise the two owner points in the proposal (preset titles, and
      remembered sizes under auto-orientation) before building part 3.
      *Owner, 2026-09-22: a turned board keeps its preset's title as written;
      a remembered size is dealt turned to fit.*

## 2. Portrait defaults and presets

- [x] 2.1 Flip each landscape default and preset to portrait, game by game, with
      preset titles following. Check the Custom dialog still round-trips.
      *19 games. Tilings that cannot turn got portrait sizes of their own
      keeping upstream's drawn area; Loopy's titles now print width first.
      Dominosa gained a `tall` param: an id without its `t` decodes as the old
      wide board, so every shared id and save keeps loading (pinned in
      `dominosa.test.ts`). Slide's 6x8 costs ~3.8 s a board against the 8x6
      it replaces at ~4.3 s (eight seeds each).*
- [x] 2.2 Help pages: any that name a default size or describe a board's shape
      follow. *No game page named a moved size. `features.md` gains "Boards
      that fit your screen", and `differences.md` a bullet.*
- [x] 2.3 Tests that pin a default or a preset list are re-read and updated for
      the reason they exist; the frozen differentials keep their sizes.
      *Bricks' tier list, Palisade's preset list and Loopy's title format (now
      asserting width-first for every leaf). Dominosa's tests are pinned to
      `tall: false`, the board their descs were written for, and its grading
      test runs both orientations. The params-stability snapshot moved only in
      corpus membership; Dominosa's is the only codec that changed.*
- [x] 2.4 A guard: no default draws wider than tall on a game that has no
      recorded reason to, keyed on `computeSize`. *`orientation.test.ts`,
      with the `WIDE_BY_NATURE` ledger held exactly right.*

## 3. Deal to fit the viewport

- [x] 3.1 Decide which games may be dealt either way round (task 1.2), derived
      where possible, with a ledger of the reason for each exception.
      *`Game.transposeParams`: having it is the enrollment. Every game whose
      Custom dialog has width and height either has it or is in `NOT_TURNED`
      with its reason; implementations must invert, validate, and exchange the
      drawn size exactly on non-square boards built through the game's own
      width item (`UNEVEN_FRAME` names the four that draw a panel on one side).
      Proved to fail by planting Loopy's Hats and Honeycomb as turning.*
- [x] 3.2 At deal time only: choose `w×h` or `h×w` by which gives the larger tile
      in the current board area. Never re-deal or reorient a game in progress,
      a restored autosave, or a shared ID. *`Midend.newGame(fitTo)`; the view
      reports the area before its `maxScale` cap and when it first gets a
      `Puzzle`.*
- [x] 3.3 `Puzzle.currentParams` and the type menu match presets up to
      transposition; the Custom dialog shows the dealt size.
- [x] 3.4 Tier-3 tests for the deal decision (upright, landscape, square board,
      an excluded game), and a Chrome check on a phone-sized viewport both ways
      round. *`midend-deal-orientation.test.ts` and
      `puzzle-deal-orientation.test.ts` (each seen to fail under a plant). Chrome
      at 390×844 and 1280×800: Magnets 5x6 upright and 6x5 on desktop, header
      "5x6 Normal" both ways; Dominosa's first-ever board dealt 8×7 on desktop,
      7×8 on the phone, played and hinted there.*

## 4. Close out

- [x] 4.1 Spec deltas on each affected game's params requirement, and on the
      app-shell spec for the deal-time orientation. *Also corrects Net's spec,
      which said its 13×11 presets were excluded while the code offered them.*
- [x] 4.2 `docs/games/mechanics.md` § params/presets: new games default to
      portrait, and how a game opts out of orientation-free dealing.
- [x] 4.3 Owner acceptance: this is player-visible and was asked for by name.
      *Owner, 2026-09-22, after playing it live on a phone.*
