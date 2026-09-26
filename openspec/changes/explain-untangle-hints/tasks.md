# Tasks: explain-untangle-hints

## 1. A solver from the edges
- [x] 1.1 `planar.ts`: LR-planarity embedding, triangulation, canonical
  ordering, shift drawing; every walk bounded.
- [x] 1.2 `planar.test.ts`: 120 generated boards (n = 4–60) plus sparse,
  disconnected and edgeless graphs laid out with zero exact crossings and
  distinct points; K5 and K3,3 refused. Planted defects in the side resolution
  and the nesting depth both fail it.
- [x] 1.3 `solution.ts`: one exact, verified, box-filling layout per board
  (`aux` when present, else relaxed planar layout), cached per edge list;
  `closestOrientation`.

## 2. Solve
- [x] 2.1 Solve uses `solvedLayout` + `closestOrientation`; refuses only a
  non-planar graph. `dihedralSolvedUnits` deleted.
- [x] 2.2 Tests: Solve without aux, Solve after a midend load, K5 refused.

## 3. The hint
- [x] 3.1 `hint.ts`: most-crossings-removed search, exact recount, stall
  fallback to the solved layout, placed points frozen, six-step plans.
- [x] 3.2 `hint-text.ts`: the clearing and rearranging sentences.
- [x] 3.3 `render.ts`: rings on the removed crossings; the moved point in the
  hint color.
- [x] 3.4 `untangle-hint.test.ts`: every narrated count, both sentence kinds and
  the payoff clause, checked against the board's own count; 48 boards (with
  aux from the circle, without aux from a fine random scatter, with aux from a
  snap-grid scatter) followed to solved; the stall fallback asserted to have
  run; K5 ends in `NO_MOVE_WORTH_MAKING`. Removing the freeze fails it, and so
  does testing crossing pairs in the other argument order.
- [x] 3.5 Render scenario asserts two ring strokes per removed crossing;
  snapshot re-baselined.
- [x] 3.6 Owner review: sentences reworded (numerals, whole sentences, nothing
  about the unseen layout); spacing as fractions of point spacing with a frame
  margin and a tighter second search (design D3a).

## 4. Cross-game ledgers and docs
- [x] 4.1 `hint-quality` ledger reason; dead `hint-refusal` exceptions removed.
- [x] 4.2 Comments in `game.ts`, `midend.ts`, `hint-text-convention.test.ts`.
- [x] 4.3 `docs/games/hints.md` § "Non-deductive (heuristic) hints" rewritten
  for the new pattern.
- [x] 4.4 Spec deltas for `untangle` and `ts-engine`.

## 5. Verification
- [x] 5.1 In Chrome: hint rings and narration at n = 25; a resumed (no-aux) game
  solved by hints alone.
- [ ] 5.2 Owner acceptance of the wording, the rings and the path length (the
  full hint walk takes 43–73 moves at n = 25).
