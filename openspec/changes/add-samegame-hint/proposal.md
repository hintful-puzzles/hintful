# add-samegame-hint

**Status: filed 2026-10-16 at the owner's word, split out of
`hintless-games-in-reserve`** (to be picked off one by one, and used as a
source of engine improvements and refactoring).

## Why

Same Game has no hint, so it is a draft.

## What is already there (read 2026-10-16; re-check before relying on it)

- The generator (`src/games/samegame/state.ts`, upstream `gen_grid`) builds a
  soluble board by playing the game backwards, so a clearing exists from the
  deal. Nothing records it in the state.
- A board can become stuck: tiles left and no group of two or more
  (`state.ts`, the stuck test).
- Removing `n` tiles scores `(n - scoresub)²`; the score is shown but the
  game is solved by clearing the board.

## What the hint has to settle

`docs/hints-search.md` is the route; Inertia's unreachable gem is the shape
of a claim a search can prove.

1. **What a step can prove.** The claim the player can check is about
   clearing: "after this removal the board can still be cleared", and, for a
   tempting rival, "after that one it cannot" (a proof by search). Decide
   whether the hint also speaks of score; the bar is that it only says what
   it can prove (§ "Narrate a measurement or a proof").
2. **The search**: depth-first over removals with memoized positions,
   budgeted in positions. Measure its reach on the default 5×5, 3 colors,
   and on the largest preset, before designing on it.
3. **Recover the answer from the board** (§ "Recover the answer from the
   board"): the deal's clearing is not kept, so the hint searches from the
   player's position.
4. **A stuck or unclearable position**: the hint says so and names the
   removal that made it so, if it can find it cheaply.

## Engine questions to carry

- A "can this position still be finished?" search with a proof of no is the
  shape Inertia and Pegs have too. If a third copy appears, the engine should
  own it (`search-outcome`).

## Impact

- `src/games/samegame/`: `solver.ts`, `hint.ts`, `hintGesture`, marks, help
  page `## Hints`.
