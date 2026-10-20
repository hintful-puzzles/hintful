# Design: plan-permutation-puzzles-by-stage

Measurements here are dated 2026-10-20; re-measure before relying on one.

## 1. The engine's shape

`src/engine/permutation-planner.ts`, `planByStage`. A game hands over:

- its **generator moves** as `Effect`s: which cell's piece lands on each cell,
  and how many steps it turns. `effectOf` runs the game's own move function
  on an identity board, so the game writes no permutation by hand. Move `2i`
  is generator `i` and `2i + 1` undoes it, which is Twiddle's old numbering
  of anticlockwise and clockwise turns;
- `spins`, how many ways a piece faces (1 where pieces only move);
- the board and the finished board. Pieces of one value are interchangeable,
  which is all "identical pieces" needs (§ 3).

It returns segments with roles, as Twiddle's planner did. The stage order is
reading order; no consumer has wanted another.

The library is keyed by the move set itself, so two games, or two shapes of
one game, never share a library by accident.

**Parity, derived instead of declared.** Twiddle's planner decided whether
to build the parity products by its block size (`n` odd, or 2 mod 4). The
engine asks the moves: it splits the cells into the orbits the moves keep
to themselves, and builds the products when some move is an odd permutation
of some orbit. A commutator is even on every orbit, so this is exactly when
the products are needed. Over the 140 Twiddle shapes up to 8×8 the two rules
differ on five, and the engine's is the right one on each: a block as large as
the board (4×4 n4, 8×8 n8) is odd on the orbits it makes alone, and a block of
7 makes six four-cycles on each square color, which is even.

**Twiddle moved without a change to its plans.** Before anything else
changed, the old and new planners were run on every position of a recomputed
walk over thirteen shapes (every preset and the custom shapes the hint test
walks): 2,836 positions, identical plans, the same time.

## 2. Twiddle's known limit: odd blocks with orientation

What was missing, measured on 4×4 n3 orientable:

- **No small sequence at all.** Every block contains the other blocks'
  centers, and a turn spins a center where it stands. So every commutator
  of two turns changes 8 to 12 cells, and the second commutators, chosen by
  the cells they change, found nothing narrow to pair.
- **No twist across the two square colors**, so the last two cells of the
  last row could not be turned right.
- **No parity product.** An odd block's turn is odd on each square color,
  and it also changes that color's spin sum, so a product that keeps the
  finished cells needs its factors turned *just so*. The shortest 48 factors
  never are.

The fixes are all in the shared library, so any game with turning pieces has
them:

1. **Second commutators are chosen by the pieces they move**, not the cells
   they change. A commutator's turns cancel on every cell neither part moves
   a piece off, so the pair is still a three-piece cycle, with turns only on
   those three cells.
2. **Twists from every placing.** Two placings of one permutation that turn
   the pieces differently differ by a twist. Only the twists of one or two
   pieces are kept: they are what a stage needs (the piece it places, and one
   after it that a later stage turns right), and keeping all four-cell twists
   made the library twenty times larger.
3. **Parity products search the factors' permutations first**, and try every
   way of turning two factors only where their product moves few pieces.
   A product that also turns a piece or two where they stand (the block's
   center) takes a twist that turns them back.
4. **Twists from those cleaned products**, each beside its placings one move
   away: two that move the same pieces differ by a twist no commutator gives.
   That is the cross-color twist. Without the placings, one board of four on
   4×4 n3 still refused.
5. **The cleaned products are closed one per permutation**: the twists turn
   them after, and keeping every turned placing made 5×5 n3's library
   450,000 sequences and its first hint a minute.

**Measured**, four boards each, a fresh hint per turn to solved:

| Shape (orientable) | Before | After | First hint (library) |
| --- | --- | --- | --- |
| 4×4 n3 | 4 of 4 refused, last row | 4 of 4 solved, 386–478 turns | 0.3 s |
| 5×5 n3 | 4 of 4 refused, last row | 4 of 4 solved, 283–335 turns | 5 s |
| 5×4 n3 | 4 of 4 refused | 4 of 4 solved, 226–553 turns | 1.6 s |
| 6×6 n3 | 4 of 4 refused | 4 of 4 solved, 246–325 turns | 38 s |

Every later hint is milliseconds. The plans are long: a twist of one piece
by a half turn is 130 turns on 4×4 n3, against about 50 a board on 4×4 n3
without orientation. They are custom shapes only, and a long honest plan
beats a refusal. 4×4 n3 and 5×5 n3 orientable join `twiddle-hint.test.ts`'s
custom walks (2.4 s and 6.4 s).

**The presets are unchanged.** Every preset and custom shape without
orientation plans exactly as before: 2,958 positions of recomputed walks over
thirteen shapes, compared plan for plan. The orientable preset (3×3 n2) and
4×4 n2 and 5×3 orientable plan whole from the opening on 30 of 30 boards,
as before, at plan lengths within 3% of the old planner's. Without turning
pieces, items 1–3 choose what they chose before and items 2, 4 and 5 do not
run. Items 4 and 5 apply only to products that needed a twist to turn a
center back; even blocks have no center, so their products close with every
turned placing, as before. Closing those one per permutation too was tried,
and the preset then planned whole on only 14 of 30 boards.

**Still a limit: a block within a cell or two of the board's size** (5×5 n4,
6×6 n5, 7×7 n5, 7×7 n6, with or without orientation; custom only, and so
before this change). Two such blocks overlap in nearly every cell, so every
commutator moves 15 to 43 pieces and no two share only one: the library has
no small sequence, and learning runs out partway, an honest
`SEARCH_OUT_OF_REACH`. Pairing the commutators that share fewest, again and
again, was tried: three levels gave 5×5 n4 and 7×7 n5 their three-piece
cycles, but 5×5 n4 then wandered past 3,000 turns without arriving and 7×7
n5 still refused, and eight levels ran out of memory. It is not filed: no
preset reaches it.

**Also measured, not changed:** 4×4 n2 orientable (custom) builds its
library in 12.6 s on the first hint, and 5×3 orientable in 8 s; the old
planner took 17–22 s and 11 s.

## 3. The other permutation games

Measured on four boards of every preset: the current hint's whole plan from
the opening, a walk with a fresh hint per move, and the staged plan to the
finished board (Sixteen's unit steps merged into its slides).

| Game, preset | Current plan | Staged plan | Staged first request |
| --- | --- | --- | --- |
| Sixteen 3×3 | 5–7 | 9–13 | 0.2 s |
| Sixteen 4×4 | 17–19 | 29–48 | 3.9 s |
| Sixteen 4×5 | 22–28 | 52–65 | 11.9 s |
| Sixteen 5×5 | 28–37 | 70–77 | 13.3 s |
| Netslide 3×3 (three presets) | 3–7 | 9–17, 3 of 12 stop short | 0 s |
| Netslide 4×4 (three presets) | 10–19 | 20–49 | 1.1 s |
| Netslide 5×5 (three presets) | 20–32 | 55–85, 4 of 12 stop short | 4.7 s |

No current walk refused on these boards. The current hint's requests take at
most 0.8 s.

- **Sixteen stays on `planSlides`.** The staged plan is twice as long, and
  its first request on 5×5 builds a library for 13 s. What it would buy is
  reach: it never refused, where Sixteen's tangled 5×5 endgames can pass the
  search's. That is a trade a player sees in every hint for a refusal few
  see, and Sixteen's hint is settled by the owner's decision (its
  `SEARCH_REACH` entry), so it stays, and stays in `SEARCH_REACH`.
- **Netslide stays on `planSlides`.** It finishes on any arrangement that
  powers every tile, which a search reaches in a third of the moves the
  staged plan needs to rebuild the generator's own arrangement. And its
  source's row and column never move, so reading order can reach a cell
  whose piece no move may bring: 7 of 36 staged plans stopped short.
- **Fifteen does not fit.** Its move slides a tile into the gap, so what a
  move does depends on where the gap is: it is no fixed permutation of the
  cells. Its hint is upstream's human-style solver, which already places
  tiles in order.

So Twiddle is the planner's one consumer, and nothing here would move
another game onto it.
