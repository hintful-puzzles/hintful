# draw-pearl-arms-whole

## Why

The owner found Pearl's hint wasteful of moves (2026-09-27): a black pearl's
line always runs straight through the next square, yet the hint asked for the
pearl's own edge in one step ("This black pearl must turn, and the board's edge
is opposite, so this edge must be a line") and for its run-on in the next ("A
black pearl's line runs straight through the next square, …"). The second step
teaches nothing the first did not. It is the game's rule, already in the help.

Measured over 40 generated boards (6x6 to 10x10, both tiers, five seeds each),
following the hint took 2,931 steps before this change and 2,431 after. The 500
steps saved are 468 black pearls' arms: 218 at the board's edge and 250 against a
ruled-out edge.

## What changes

- A step that draws a line leaving a black pearl also draws that line on through
  the next square, when that edge is still open. The run-on is drawn in the same
  step, in the same color, and made by the same move.
- The black pearl's sentence says so: "…, so its line must run this way through
  the next square."
- The census showed that only a black pearl's own square firing leaves a run-on
  open. Every other rung that draws a line beside a black pearl draws the run-on
  too, or would contradict the solution. The narration throws if any other step
  draws one, so the sentence can never be silent about an edge it asks for.
- The `blackRunsOn` rung is unchanged. It still speaks when the player drew the
  pearl's edge themselves.
