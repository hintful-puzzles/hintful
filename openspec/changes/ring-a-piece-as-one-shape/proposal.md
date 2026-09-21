# ring-a-piece-as-one-shape

**Status: scaffolded, not started.** Owner-requested, 2026-09-21, from
`add-magnets-hint`.

## Why

`engine/hint-mark.ts`'s `HintMarks.paint` rings every target square on its own,
on all four sides. That is right for a cell and wrong for a **piece** that
spans several squares, and two games decide pieces today (read 2026-09-21):

- **Dominosa** places a domino with `targets: [a, b]`, so a placement hint
  draws two boxes with a double bar across the middle of the domino it is
  asking the player to place.
- **Magnets** decides whole dominoes (a neutral one, or a `?` on one). It could
  not use the shared painter for that, so `magnets/render.ts` draws its own
  pass with `outlineSides` and a predicate that joins a square only to its
  domino partner, packing the sides into its tile word so a changed outline
  repaints.

Two games, and every future game with multi-square pieces (Dominosa-likes,
polyomino placement), would each write the second one. The only thing a game
knows that the painter does not is **which squares belong together**.

## What changes

1. **`HintMarks.paint` takes an optional piece relation**, something like
   `samePiece(a, b)`, and draws a target's side only where the neighbor across
   it is not in the same piece. Without it, behavior is exactly today's (a ring
   per square), so no other game's frame moves.
2. **Dominosa passes its domino relation**, so a placement is one ring around
   the domino. Its hint render snapshots move, and that is the intended change.
3. **Magnets drops its own pass** for the shared one. Check first that the
   shared painter's erase-and-repaint model covers what Magnets' post-pass
   handles: a domino's body reaches a pixel into its partner's box, which is
   why Magnets repaints its marks every frame (`render.ts`).
4. **A shape guard**: `engine/testing/mark-shape.ts` gains an assertion for a
   piece ring (six sides for a domino, not eight), and both games use it.

## What this does not do

- It does not change the evidence outline, which already draws one contour
  around a region.
- It is player-visible (Dominosa's placement hint changes shape), but it is one
  answer plainly better than the other, so it is this change's to decide
  (`AGENTS.md` § "Work management"); run both games in Chrome before calling it
  done.
