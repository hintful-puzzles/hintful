# strengthen-the-sokoban-solver

**Status: scaffolded, not started (2026-10-03).** A follow-up from
`judge-rivals-for-search-hints`.

## Why

Sokoban's search (`src/games/sokoban/solver.ts`) has a reach, and it ends at
congested positions: barrels near the finish, packed so that most pushes
undo each other, where the search spends its whole budget inside positions
already lost. Measured when the hint was written (2026-10-03,
`judge-rivals-for-search-hints` design D1): 20 of 24 generated openings within
300,000 positions, and the four it missed were of that kind. Three things
follow from the reach today:

- **The generator rejects levels** the search cannot finish, so a 16×20 board
  takes 0.6 s to deal on average and up to 1.9 s, and 7 of 20 such levels
  were rejected.
- **A position the player reaches** can still be past the search, and so can a
  level typed or shared by game ID, which the generator never checked. The
  hint then says it is out of reach.
- **A hint request** on 12×16 took up to about 1 s where the plan's first push
  failed the potential check and the rivals had to be searched for one that
  passed it.

## What Changes

Prune lost positions the search cannot recognize today, and measure each step
against the population above before keeping it. The candidates, in the order
a Sokoban solver usually needs them:

- **Corral pruning** (PI-corrals): a region the player cannot reach, fenced by
  barrels that can only be pushed into it, decides whether the board is lost
  from the fence alone. Today's `fenced` check is a narrow case of this (at
  most eight barrels, searched with every other barrel removed).
- **Tunnel and goal-room macros**, which shorten the search where a barrel can
  only go one way.
- **Incremental position keys** (the search rebuilds a string per position).

## What would show it worked

The generator's rejection rate and deal time at 16×20, the openings solved
within `PLAN_BUDGET`, and the worst hint request on each preset, each measured
on an idle machine against today's figures. The hint's potential check
(`hint.ts`) depends on the search being deterministic, which any change here
must keep.
