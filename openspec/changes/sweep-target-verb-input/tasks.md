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
- [ ] 4.3 The drag games' click half: measure whether it needs
      resolve-on-release.

## 5. Net's hint

- [ ] 5.1 Hint spelled through the declared verbs; `hintMarks`; help § Hints.

## 6. Close

- [ ] 6.1 Docs, spec delta, run the app, archive.
