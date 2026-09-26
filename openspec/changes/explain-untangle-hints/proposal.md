# explain-untangle-hints

## Why

An owner screenshot (2026-09-26) showed Untangle's hint refusing on a
25-point board with two crossings left: *"No single move reduces the
crossings, so try moving a tangled vertex."* That refusal tells the player to
do the very thing the hint exists to do for them.

The cause was two layers deep:

- **The good hint needed `aux`, and a resumed game has none.** The midend never
  saves the generator's `aux` (the board was at "Move 17 of 17", reopened from
  its autosave), so the hint dropped to its fallback heuristic — and Solve
  refused outright ("Solution not known"), on every resumed game and every
  shared game ID.
- **The fallback could not see a move.** It tried five spots per point (the
  neighbor centroid and four pushes outward), so it stalled on boards where an
  obvious move existed. Measured from realistic mid-game positions, a dense
  search stalls too: greedy single moves ran out on 20–40% of boards scattered
  at random or left by the old heuristic, and a two-move lookahead was slow and
  still incomplete. Greedy play needs a guaranteed way out.

The owner also asked what an *explained* Untangle hint could look like —
"moving nodes that would remove the most collisions". Untangle has no forced
move, but it does have a measurable one, and a count of crossings is something
the player can check on the board.

## What changes

1. **A solver that needs no `aux`** (`untangle/planar.ts`): left-right
   planarity embedding, triangulation, and a de Fraysseix–Pach–Pollack grid
   drawing. `untangle/solution.ts` turns it (or `aux`, when present) into one
   exact layout per board: spread by a planarity-preserving relaxation,
   filling the box, and checked crossing-free with the game's own `cross()`
   before use.
2. **Solve works on every board**: a resumed save, a shared ID, a fresh game.
   It refuses only a hand-typed graph that is not planar.
3. **The hint speaks.** Each step moves the point that removes the most
   crossings, found by trying every point in a crossing against a grid of spots
   over the whole board, and says *"This point's lines make 16 crossings. Moved
   here, they make only four."* The point and its destination are drawn in the
   hint color and every crossing the move removes gets a ring, so the claim can
   be counted on the board.
4. **When no single move helps, the step moves a point to its place in the
   solved layout** and says so. Points in place are never moved again, which
   makes the walk terminate and keeps it recompute-stable.
5. The hint's refusals become the collection's shared wording
   (`ALREADY_SOLVED`, and `NO_MOVE_WORTH_MAKING` for a non-planar graph once
   greedy runs out). Untangle's bespoke refusal leaves the exception ledger.

## Impact

- Player-visible: new narration, rings and a highlighted point; Solve on
  resumed and shared games. No save format or ID changes.
- `untangle` spec: the Game-interface, Solve and hint requirements are
  rewritten. `ts-engine`: the aux requirement stops naming Untangle as a game
  that needs `aux`.
