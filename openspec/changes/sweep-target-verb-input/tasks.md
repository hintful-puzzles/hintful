## 1. Net and the square-grid members

- [x] 1.1 Net: Space follows the convention; `keyOnly` verbs (F); the `Ui` in
      `pointerTarget`; the jumble RNG out of `NetUi` (design.md § "Net").
- [x] 1.2 Flood, Flip, Twiddle declare `targetVerbs`; `squareGrid`'s `border`
      reads the state.
- [x] 1.3 Guard covers key-only verbs; proven red on a dead F.

## 2. Second target kinds

- [x] 2.0 The model: `apply` sees the `Ui` and may return `UI_UPDATE`; the
      model reads only `cursor.visible`; the guard presses keys only on
      targets (design.md § "What the rest of the members needed").
- [x] 2.1 Magnets: the clue ring as targets the cursor reaches; cursor drawn on
      a clue (tier 2.5).
- [x] 2.2 Subsets: the tally band stays an arm; the slots are the model's.

## 3. The half-cell geometry

- [x] 3.1 Palisade and Separate: `borderGridGeometry` + `borderGridVerbs`
      replace `interpretBorderGridInput`.
- [x] 3.2 Dominosa: its own pair geometry on the same half-grid idea.

## 4. The rest of the members

- [x] 4.1 Slant (notes mode an arm, swapped buttons through `apply`'s `ui`).
- [x] 4.2 Mines, Black Box, Loopy: no release hook; each keeps a release arm
      calling the declared verbs. Probe memoizes state digests (Loopy 18 s →
      11 s).
- [x] 4.3 The drag games' click half: it does not need resolve-on-release
      (Mines' release arm calling its verbs is the shape). Converting the nine
      is scaffolded as `declare-drag-games-click-half`.

## 5. Net's hint

- [ ] 5.1 Hint spelled through the declared verbs; `hintMarks`; help § Hints.

## 6. Close

- [x] 6.1 Docs (`input.md`, `engine-catalog.md`) and the `ts-engine` delta.
- [x] 6.2 Ran the app (2026-09-30): Net's help paragraph; Net's Space rotates
      clockwise and S locks; Magnets' cursor reaches a clue and Enter grays it;
      Loopy's walk-and-Enter traces a line.
- [ ] 6.3 Archive, after Net's hint (`add-net-hint`) reports what it found
      about the model.
