# Tasks

## 1. Build

- [ ] 1.1 A pale yellow for the clear square in the palette, with a dark
  value chosen in the running app, and a color for the faint cross that reads
  on it in both schemes (`design.md`, "What the drawing found").
- [ ] 1.2 One engine helper that draws the clear square, surface and faint
  cross, beside `drawRuledOutCross` in `engine/piece.ts`.
- [ ] 1.3 Mosaic: a clear square is the pale square; the faint cross where it
  has no number, and no cross where it has one. The corner cross goes.
- [ ] 1.4 Pattern: a clear square is the pale square with the faint cross.
- [ ] 1.5 Tests, at the lowest tier that fits, each seen to fail on a planted
  defect: a clear Mosaic square with a number draws no cross; one without
  draws the cross; the surface is drawn in both games.

## 2. Look

- [ ] 2.1 In the running app, both schemes, Mosaic: a part-solved board with
  a hint showing (the circled number on a clear square, a ring on one), a
  satisfied number on a clear square, a mistake outline, the completion flash.
- [ ] 2.2 In the running app, both schemes, Pattern: part solved, finished,
  with a hint's hatched line over clear squares, and a drag that clears.
- [ ] 2.3 Read the other games that draw the cross against the rule
  (`design.md`, "The rule for the engine") and put any that fits to the
  owner.

## 3. Words

- [ ] 3.1 `help/games/mosaic.md` and `help/games/pattern.md`, where they
  describe a clear square; any legend or Controls verb that names the cross.
- [ ] 3.2 `docs/games/rendering.md`: the rule, and which games take it by a
  query.

## 4. Conclude

- [ ] 4.1 Spec deltas for `pattern` and the engine capability that holds the
  ruled-out mark; the `mosaic` delta is drafted, and its two scenarios keep
  titles the validator would not let go ("without a fill", "its cross and its
  number"), so rename them with a RENAMED delta or reword. Read all three
  against the code.
- [ ] 4.2 Gate, commit, push. The owner accepts by eye on the deployed app;
  archive on their word.
