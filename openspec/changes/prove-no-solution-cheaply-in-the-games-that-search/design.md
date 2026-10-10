# Design

Written and settled 2026-10-10 by the session that built it. The figures are
that day's, from a scratch test run under `nice`, and are the order of
magnitude and no more.

## Context

`Game.hasNoSolution` was a boolean asked by `loadDesc` alone. Pegs, Sokoban
and Inertia each opened their `hint` with the same proof, worded as a
`markedDeadEnd`, and were not asked it at load.

## Decisions

### Decision 1: the three hints' proofs are cheap, so they are load's too

Timed on five dealt boards of each preset named and on every one-edit mutant
of each that reads as an unfinished board (`descMutants`):

| Game | Preset | Dealt, slowest | Mutants read | Proof held | Mutant, slowest |
| --- | --- | --- | --- | --- | --- |
| Pegs | 9x9 Cross | 0.07 ms | 580 | 80 | 0.62 ms |
| Pegs | 9x9 Random | 0.02 ms | 570 | 84 | 0.09 ms |
| Sokoban | 16x20 | 0.79 ms | 883 | 70 | 1.35 ms |
| Inertia | 16x20 | 0.18 ms | 2,555 | 88 | 0.54 ms |

The measure to beat was 155 ms. None held for a dealt board. What each proves
and what it misses:

- **Pegs** (`PegsBoard.frozen`): a peg no jump can ever involve, with another
  peg on the board. It misses every loss that needs the search, which the
  pinned `LOST` position in `pegs-hint.test.ts` is one of.
- **Sokoban** (`SokobanBoard.stuck`): a barrel off a target that is in a dead
  square or frozen, and only on a board where every barrel is needed
  (`tight`). It misses a loss that takes two barrels' order to see.
- **Inertia** (`unreachableGems`): a gem no sequence of moves passes over. It
  misses a gem the ball can reach and not come back from.

### Decision 2: the hook answers with what proves it, and the midend refuses the hint

`hasNoSolution` returns `boolean | MarkedDeadEnd`. `Midend.askHint` asks it
before `Game.hint`, on a Hint press and on Check & save, and a `MarkedDeadEnd`
is the hint's refusal. The three hints lost their opening branch and kept
nothing of the refusal; the words and the marks moved, unchanged, into each
game's `hasNoSolution`.

Why this and not a boolean with the hints left alone: the proof would be
stated twice in each game, once for load and once in `hint`, and a game that
states it only once gets a board that will not load beside a hint that
searches a dead position to its budget. With one statement the engine cannot
be told two things.

Why the game still writes the `markedDeadEnd` itself: `hint-refusal.test.ts`
reads each call's `phrase` template at the call, to hold a dead end's sentence
to one game and to the word Undo. A hook that returned bare words for the
midend to wrap would hide them from it.

### Decision 3: a bare `true` is not a hint's refusal

Flood's proof holds on every board flooded past its limit, and the owner's
decision there stands: the board plays on and its hint leads home
(`hint-refusal.ts`, `GAME_OVER`). So the midend refuses only with a proof
that names its cause. For Cube, Fifteen, Sixteen, Flip, Untangle, Netslide and
Twiddle the difference is never met: what their moves keep cannot change in
play, so a board that loaded is never proved dead later.

### Decision 4: Solve is not refused by the midend

Pegs' and Sokoban's Solve finishes from the board as dealt when the player's
position is lost (`solveBySearch`), which is what makes the hint's
out-of-reach advice to use it honest. A midend refusal on a proved position
would take that answer away. Inertia's Solve draws a route from where the ball
is, has none to draw, and says `NO_SOLUTION_FROM_HERE` as before.

### Decision 5: three more proofs, each sound and none complete

- **Flood**: every color with a square outside the corner's region costs a
  fill. Checked against the fewest fills found by trying every line on thirty
  4x4 boards (`flood.test.ts`).
- **Netslide**: a tile with no arm, or fewer than `2(n - 1)` arm ends.
- **Twiddle**: checkerboard color under a block of odd side; color and turns
  together under one of even side, where tiles show their turns; the
  arrangement's parity unless `n` is two more than a multiple of four; the
  turns' sum modulo four under a block of even side. Each is checked against
  every board a small one reaches (`twiddle-no-solution.test.ts`). 3x2 with a
  block of 2 reaches 120 of its 720 arrangements, so the proof is far from
  complete there, and Solve still says "Auto-solved" on the other 600.

### Decision 6: Slide stays, and Same Game takes the half that breaks nothing

Slide has no known invariant, and its entry in `LET_THROUGH` says so.

The proposal named two proofs for Same Game and held both for the owner,
because upstream's legacy generator deals boards that may not be clearable.
Reading that generator (`gen_grid_random`, `samegame.c`) splits them: it
places two tiles of every color before it scatters the rest. So a tile that
is the only one of its color is a board neither upstream generator writes,
refusing it breaks nothing, and Same Game has that proof now. A board with no
move at all is one the legacy generator can write, and that question is filed
as `refuse-a-same-game-board-with-no-move`.
