# show-loopy-segment-connectivity — tasks

Read `proposal.md`, then `docs/games/rendering.md` on the redraw doctrine and the
palette's three layers, and `docs/games/input.md` § "An aid extends the move, at the one
place the move is built" — this aid is the other kind, a `Ui` field rather than extra
ops, and the contrast is worth reading before starting.

> **Open for the owner before §2**: whether the focus highlight alone is enough, or a
> global "pair the loose ends" view is wanted beside it (`proposal.md`, "Open, for the
> owner"). §1 is safe either way; do not build the global form on spec.

## 1. The connectivity, and the focused run

- [ ] 1.1 Read the run containing an edge off the same dsf `checkCompletion` builds
      over drawn edges (`state.ts`), rather than a second traversal. If that means
      lifting the dsf construction into a named helper both call, do that — one notion
      of connectivity, two readers.
- [ ] 1.2 `LoopyUi.focusEdge`, set by the pointer arm and the keyboard arm at the same
      place they already agree (`setEdge` and the cursor), so the aid cannot diverge
      between input methods — the Slide rule, `docs/games/input.md` § "Giving a drag
      game a keyboard".
- [ ] 1.3 The focus is cleared, or simply finds no run, when the last action was an
      exclusion or an erase. A `Ui` change with no move repaints as `UI_UPDATE`.

## 2. Drawing it

- [ ] 2.1 Pick the highlight from the existing palette rather than adding a color, and
      check it against the loop-error highlight and `COL_HINT` in **both** color
      schemes — three highlights on one board is where a palette stops reading
      (`docs/games/rendering.md`, the palette's three layers).
- [ ] 2.2 A tier-2.5 render scenario: draw a line joining two runs, assert the ops
      highlight exactly that run's edges and no other, and snapshot the frame.
- [ ] 2.3 Check the redraw stays incremental — the highlight moves with the player's
      focus, so a naive implementation repaints the board on every move.

## 3. Accept

- [ ] 3.1 Run it on a 10×10 Hard board with a dozen fragments, which is the position
      that prompted this. A screenshot of one fragment highlighted among the rest is
      the evidence; the aid either makes the answer obvious at a glance or it has
      missed.
- [ ] 3.2 Owner acceptance, and the decision on the global view.

## 4. Not here

- [~] 4.1 Hover. There is no hover plumbing in the app — `view-interactive.ts`'s
      `pointermove` handler acts only while a pointer is tracked — so it needs a new
      path from the view through the worker into `Ui`, and it would be mouse-only on a
      board that is hardest to read on a phone. Revisit only if the focus highlight
      proves to want a preview that does not commit a move.
- [~] 4.2 A color per segment. Cluttered, and worse, unstable: identity changes on
      every join, so the board reshuffles as the player draws.
