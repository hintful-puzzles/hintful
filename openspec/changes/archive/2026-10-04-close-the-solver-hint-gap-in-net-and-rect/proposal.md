# close-the-solver-hint-gap-in-net-and-rect

**Status: implemented (2026-10-04).** Found by `retire-the-unchecked-board-options`, while deciding what its
load check may ask. `design.md` has what was found and built: Net's gap is
closed on every board sampled, and Rectangles' is down from 20 boards in 2,260
to 3, and both games now refuse at load a board their hint cannot finish
(owner, 2026-10-04).

## Why

Net's and Rectangles' solvers settle boards their hints cannot finish. Each
generator deals only boards the hint finishes (`finishes` in `net/deduce.ts`,
`rungsFinish` in `rect/hint.ts`), so no board dealt here is in the gap. A board
upstream dealt is another matter: upstream gates on its solver alone, and that
solver is the one ported here.

Measured 2026-10-04, on boards built with the generator's checks off and then
asked both questions (solver settles it / hint finishes it):

| Game, params | Solver settles | of which the hint cannot finish |
|---|---|---|
| Net 5x5 | 382 | 0 |
| Net 5x5 wrapping | 261 | 62 |
| Net 7x7 wrapping | 120 | 14 |
| Rectangles 4x4 | 152 | 0 |
| Rectangles 7x7 | 142 | 0 |
| Rectangles 9x9, expansion 0.5 | 84 | 2 |

So about a quarter of the wrapping 5x5 Net boards upstream deals load here,
play, and then crash the hint: it returns `DEDUCTION_EXHAUSTED`, no tier
permits search, and `Midend.computeHintPlan` throws. A pinned case each:
`5x5w:19d7aaae8449d5636cad43c44` (upstream's fixture `net-trace-4`) and
`10x10e0.5:a3c4b3g2_3f16_12n4i4c5b3g21m8h4a4e4c`. `net.test.ts` and
`rect.test.ts` pin that both load.

The measurement ran the other way twice as well: 2 of 400 Rectangles 7x7
boards were finished by the rungs and not by the solver.

## What

**Direction: strengthen the hints.** That was the recommendation put to the
owner with these measurements, and `retire-the-unchecked-board-options` was
accepted with it standing (2026-10-04); the owner then asked for this change
to be scaffolded. It is a recommendation not objected to, not a separate
ruling. Refusing at load stays available and is the owner's call.

The two ways to close it, which are not exclusive:

- **Strengthen the hint to the solver** (`docs/games/solver-and-generator.md`
  § "One engine, two projections"). Find what `net_solver` deduces on a wrapping
  board that `deduce.ts` does not, and what `rect_solver` does that the rungs do
  not, and give each a narratable rung. No compatibility cost, and the
  generators stop dealing again for boards that were fine.
- **Refuse at load what the hint cannot finish**, by having
  `finishesByDeduction` ask the hint. One line per game. It is a compatibility
  break with IDs upstream's generator writes with its checks on, at the rates
  above, so it is the owner's call (`AGENTS.md` § "Upstream policy").

Rectangles' `line` rung belongs here too. It has fired only on boards the rungs
do not finish (3 of 315 unchecked deals, 0 of 6,000 checked), so today no board
that loads and finishes reaches it, and `warm-repaint.test.ts` excuses its mark
in `UNREACHED`. Stronger rungs change which boards finish; decide then whether
the rung is reachable or dead.

## Hints to pull in

None.
