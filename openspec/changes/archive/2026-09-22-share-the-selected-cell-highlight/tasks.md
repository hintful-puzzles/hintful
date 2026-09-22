# share-the-selected-cell-highlight — tasks

## 1. Take the population by shape, before designing

- [x] 1.1 Find every game that draws a selection highlight. The name key the
      proposal counted (`COL_HIGHLIGHT` and `pencilMode` in one `render.ts`)
      finds thirteen files, not fifteen (fifteen counted two test files): the
      eleven games on `pressNoteTakingCell`, plus Rome and Loopy. The shape
      key, a `pencilMode` in the `Ui`, finds sixteen games, adding **Map**,
      **Slant** and **Guess**. Classified: Rome and Map carry a cell cursor
      and notes but press through their own drag gestures; Loopy's and
      Slant's notes are edge marks and their selection is not a cell; Guess's
      `pencilMode` cursor walks peg slots.
- [x] 1.2 Read the geometry and color of each of the eleven. Six drew the
      wash (`highlightWash` of the background) for both halves: Solo, Keen,
      Group, Towers, Undead, Unequal. Five did not, and none for a reason
      about its puzzle:
      - **Mathrax**: wash cell, `COL_LOWLIGHT` triangle.
      - **Seismic**: mkhighlight's near-white cell, lowlight triangle.
      - **Abcd**: mkhighlight's near-white for both.
      - **Salad**: lowlight for both, while its own balls already used the
        wash behind the same cursor; it also dropped the fill on a hinted
        square, a leftover from before hints moved to the border
        (`886ba3ed`).
      - **Crossing**: wash on an empty square, an inverted bevel on a digit,
        a lowlight triangle, and corner brackets for any *keyboard* cursor.
        The brackets came from upstream's `crossing.c`; they are kept only on
        a wall, the one square the keyboard can reach and the mouse cannot,
        and which has no background to wash.
      Geometry agreed everywhere but in origin: Solo, Keen and Group take the
      legs from their painted rect (which reaches into the block gutter),
      the rest from the tile.
- [x] 1.3 Cells that are not cells: **Map** (a region of half-cell
      triangles). Loopy's and Slant's selections are edges and vertices and
      carry no cell highlight to share; Guess's is a peg slot.

## 2. Decide the contract

- [x] 2.1 **A cell.** `drawCellBackground(dr, rect, highlight, wash,
      background)` takes the rect the game paints, which is what kept Solo,
      Keen and Group byte-identical. A shape parameter would cost every caller
      an argument for one game, and what Map needs is not the triangle drawn
      on a different outline (§3.2).
- [x] 2.2 The triangle's legs are half the **painted rect**, from its corner:
      a non-square rect gets a right triangle in proportion. It is background,
      drawn before content, so an occupied corner (Keen's cage label, the
      top-left pencil slot, Group's dividers) sits on top of it.
- [x] 2.3 It is drawn inside the tile repaint, so the game packs
      `cellHighlight` (two bits) into its tile key. The guard proves each
      member does by repainting on one draw state: a key without it repaints
      nothing and fails the "put away" frame. No member clears less than its
      cell, so the Spokes exception does not arise.

## 3. Extend the pair to the games that have neither

- [x] 3.1 **Rome and Map: behavior.** Both tie the right button to a *drag*
      (a pencil drag; a right-drag laying a mark), and in both a right *tap*
      was a no-op that selected. The tap was free, so the mechanic took it:
      the release that commits nothing calls `pressNoteTakingCell` with the
      button the gesture used, and the drags keep their buttons. No exemption
      and no roster. Both games gained the mechanic's `Ui` fields and both
      pencil preferences, so they are members by derivation and every guard
      over the mechanic now holds them. Known shape, recorded in both games:
      the press takes the highlight down to begin a possible drag, so a
      repeat tap re-selects rather than putting it away.
- [x] 3.2 **Map's picture** — owner's choice, 2026-09-22, between an outline, a
      wash and keeping the ring: *outline*. A `CURSOR` band just inside the
      region's whole boundary in both modes, and in notes mode the corner
      triangle in the region's first cell. The fill never changes, because in
      Map the fill is the answer. Upstream's ring survives only as the carried
      blob, still at the centroid of the triangle a keyboard drop will land in.
      Excused from the cell guard by a one-entry `NOT_A_CELL` ledger the guard
      holds exactly right; `map.test.ts` says what a band is (inside the
      region, on every boundary cell, under half its area) and each of those
      was seen to fail against a planted defect.
- [x] 3.3 **Rome's picture**: the pair. Its keyboard *arm* (Enter or Space,
      then a direction) had been told apart only by the fill; it now adds a
      `?` in the ink of the arrow or mark to come.

## 4. Prove it changed nothing where nothing should change

- [x] 4.1 `note-taking-cell-render.test.ts` recorded every member's entry,
      keyboard, notes and put-away repaints **before** the refactor. After it:
      Solo, Keen, Group, Towers and Unequal byte-identical; Undead's triangle
      one pixel shorter in each leg (its painted rect is `ts − 1`); Mathrax,
      Seismic, Abcd, Salad and Crossing moved to the wash.
- [x] 4.2 By shape: every changed line in the five moved snapshots is a color
      becoming `rgb(164, 164, 164)` (the wash on the test background) or a
      triangle vertex re-anchored on the painted rect; Salad's also loses its
      second rect. Crossing's sample moved from `(1, 1)`, a wall, to the
      first open square.
- [x] 4.3 Watched it fail: a triangle with legs a third of the rect fails
      every member's snapshot and the unit test; a triangle drawn in the
      background fails every member's notes assertion by name; a game that
      drops the highlight from its tile key (Keen, planted) fails that game's
      four cases alone.
- [x] 4.4 Ran the app in Chrome (2026-09-22): Map's band and notes triangle,
      Rome resting, armed and in notes mode, Crossing's wall brackets, Abcd's
      and Seismic's new wash, and Map and Solo in dark mode. At Map's default
      tile size its notes triangle is small, since the band takes three of its
      twelve pixels; it reads, and is the thing to look at in acceptance.

## 5. Record

- [x] 5.1 `docs/games/rendering.md` § "The note-taking cell's picture".
- [x] 5.2 `docs/games/engine-catalog.md`: the entry covers the picture.
- [x] 5.3 The spec deltas: `ts-engine` gains the picture and the rule for a
      game whose press starts a drag; `map` and `rome` modify their tap
      requirements (and Map's rendering list, which named a cursor blob).
      Help pages for both say what a right-click without a drag now does.
