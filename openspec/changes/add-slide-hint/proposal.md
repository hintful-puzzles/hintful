# add-slide-hint

**Status: filed 2026-10-16 at the owner's word, split out of
`hintless-games-in-reserve`** ("start picking off the remaining hints in
reserve … a series of individual hint implementations, to be easy to pick off
one by one, and to use as inspiration sources for new engine improvements and
overall refactoring"). The first of the four to take: its search exists.

## Why

Slide has no hint, so the home screen labels it a draft, and since
`let-the-engine-own-what-solve-shows` Solve shows only the finished board, so
the player has no step-by-step aid at all.

## What is already there (read 2026-10-16; re-check before relying on it)

- `src/games/slide/solver.ts` `solveBoard` is upstream's exhaustive
  breadth-first search: a shortest route from a position, bounded by the
  board's `maxmoves`. The header of `src/games/slide/index.ts` says a hint
  "would be a solver-path hint of its own".
- Every reachable position is legal, so there is no `findMistakes`; a hint is
  never refused for a mistake.

## What the hint has to settle

This is a search game: `docs/hints-search.md` § "What every game does" is the
route, `src/games/pegs/hint.ts` the file to read beside it, and Sokoban's
`judgeRivals` the nearest move puzzle.

1. **What a step can prove.** A BFS knows every first move's distance to the
   exit, so a step can say what a move gains against its rivals ("every other
   move leaves the main block at least N moves further away"). Decide whether
   to offer one block move per step or a short run serving one subgoal
   (§ "Hold a stable subgoal", § "A move puzzle teaches order").
2. **A non-negative integer every hinted move lowers** (§ "Recompute-stable
   plans"): the BFS distance is the obvious one; confirm ties are broken the
   same way on every recompute.
3. **The search's budget in positions**, and what the hint says past it
   (`searchRefusal`).

## Engine questions to carry

Weigh each at dozens of games (`docs/doctrine.md`), and file what qualifies
as the engine's:

- Fifteen, Sixteen, Netslide and Sokoban already narrate searched moves. If
  "this move is on a shortest route, and these rivals are longer by k" is said
  a third way here, it belongs in `rival-judging`.
- `solveBySearch` and the hint should share one search call; check whether
  the engine already makes that the one obvious way.

## Impact

- `src/games/slide/`: `hint.ts`, `hintGesture`, marks, help page `## Hints`.
- Possibly `src/engine/rival-judging.ts`, if a shape repeats.
