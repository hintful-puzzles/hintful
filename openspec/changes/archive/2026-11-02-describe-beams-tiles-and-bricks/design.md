# Design: Bricks described

## Sections

| Section | What it holds |
| --- | --- |
| The split | why this change takes Bricks alone |
| What Bricks needed of the language | nothing new: the brick wall and its holes |
| The ladder | upstream's one trial, stated as five breaks |
| Unreasonable is the engine's search | the recursion retired, and what it costs |
| Against HEAD | the boards, the walks, the deals |

## The split

Read at the start (2026-11-02), the three games share little: Magnets reads
P and tile marks, Light Up walls, beams and its scan's exception, and Bricks
a brick-wall space with holes and L. Each is a solver and hint of 500 to
1,500 lines to rewire (Magnets 597 + 894, Light Up 679, Bricks 538), and
Sticks alone was a session. So this change takes Bricks, the one that reads
only what the language has, and files Magnets and Light Up as
`describe-beams-and-tiles`, which files step 8, `describe-connectivity`.

## What Bricks needed of the language

Nothing new. The proposal named a brick-wall space and holes:

- **The space is a rectangle.** The hexagon is stored as upstream's padded
  parallelogram, and its six neighbors are `adj8` less the diagonal that runs
  with the shear: `around(c)` is `{p in adj8(c) where x(p) - x(c) != y(p) -
  y(c)}`, which is upstream's `bricks_steps` exactly, and `below(c)` its two
  squares in the row beneath. A geometry of its own would be a declaration
  only Bricks read; a hexagonal game that needs more (Ascent) can name one.
- **A hole is a clue whose meaning places a value**, as Sticks' blocks are
  (`descriptions.md` § "The runtime a ladder runs on"). The padding outside
  the hexagon is the `hole` kind, and so is a number upstream leaves unknown
  (`7`, `?`), which no deal writes but a desc may; a number's square is
  clear by the number's own meaning. A hole, a number and a clear square all
  hold the answer's value 2, since no rule tells them apart.

## The ladder

Upstream's Easy is one technique, `bricks_solver_try`: suppose a color in an
empty cell, validate once, and keep the other color where the board breaks.
On a board with no break, one changed cell can break it five ways, which the
old hint's classifier already listed, so the description states each as a
technique: a shaded brick above left nothing to rest on (`strandSupport`), a
number left too few squares (`undercount`), three in a row (`three`, a
`with` on the row's run), a brick with nothing beneath it (`unsupported`),
and a number given too many (`overcount`). The order is the classifier's
ranking, clearing first, as upstream tried it. Each break is monotone in the
marks, so the five together force exactly what the trial forced, and the
closure, and with it every Easy board dealt, is upstream's. Each technique
holds its rule on the marks as they stand, so a broken position is a
contradiction, as the validator found it.

A technique is bound by the number, brick or row it reasons from and
concludes every cell that one forces, so one firing is one argument; the
hint takes a firing's cells as consecutive steps of one cell each, which is
what its steps were.

All five are sound at orders 3 and 4, and each plant unsound
(`research/technique-check/results-describe-bricks.txt`). The `three` plant,
a run of two read as too long, is unsound only where the checker reads the
supposition.

**What retires**: `solverTry`, `solverRecurse`, `solveGame`, the trial
classifiers and `nextForcedMove`, and the `findingTechniques` and
`singleFirings` the hint ran on. The hint walks the compiled firings with
`ladderWalk`; its words, `hint-text.ts`, are as they were. `status` is the
compiled answer check, with an empty square read as clear, as the validator
read it. `bricksValidate` stays the live overlay and the mistake check's
rule pass (`descriptions.md` § "The answer check").

## Unreasonable is the engine's search

Upstream's Normal was a one-ply lookahead, `solverRecurse`: suppose a color,
solve at Easy, and keep the other color where that breaks. It was a search,
named Unreasonable here, but Bricks' own, and `answer-search.ts` named Bricks
as the exception to its tiers. It is now the engine's: `searchAnswers` over
the compiled marks, and `dealUnreasonable` with the shared strip budget.
Solve, the hint's
refusal and the mistake check go by the search at either tier, so Solve
finishes any board with one answer where it used to return a part-solved
one, and the difficulty contract is `searchTierContract`, so the guard that
search-tier games deal through the engine now covers Bricks. The `dt` letter
still loads, graded as Unreasonable.

**What the search assumes is upstream's lookahead.** The engine leaves the
assumption to the game, and asks only that the positions it returns hold
every answer between them. Where the ladder stops, the first open square in
which the ladder refutes one color takes the other, one position and no
split, since the refuted branch holds no answer; only where no color is
refuted is the first open square split, clear and then shaded. Splitting on
the first open square alone, as Sticks does, was tried first and measured
(2026-11-02) against boards HEAD deals beyond the presets, in a scratchpad
worktree of HEAD, 15 at each size: at 10×10 and 12×12 a median of 39 and 35
positions but 4,727 and 5,413 at worst, and at 15×15 a median of 1,251 and
611,629 at worst, so a saved custom board would have been refused. With the
lookahead as the assumption the same boards need 23, 33 and 45 at most.

**The budget**, 2,000 positions as Sticks', against what boards need with
the lookahead (2026-11-02): HEAD's preset Unreasonable boards 16 at 6×7 and
23 at 8×10 at most, HEAD's larger ones 45 at most, upstream's frozen Normal
and Tricky fixtures 13 at most, and boards dealt now 29 at 12×12 at most.

**The 2×2 refusal stands** on a proof where it rested on a sample: of the 55
2×2 boards, the two with one answer the ladder stops short of hold one brick
each, under the deal's 40%.

## Against HEAD

Measured on every preset and on 6×7 and 8×10 Unreasonable, at 40 seeds each
(160 boards, 2026-11-02, HEAD `6bb41792` against this change, back to back):

- **Every Easy desc is HEAD's** (80 of 80), and every Easy hint walk, played
  to the end by its first step, ends solved, and no square is ever given the
  other color. The order moved, as the plan allows: every walk takes its
  steps in another order, 194 of 3,653 squares are decided by another rule,
  and 29 walks end with a different set of clear squares unmarked, since a
  board is solved once every brick is placed.
- **Every Unreasonable desc is HEAD's** (80 of 80): the engine's strip,
  within its 30 positions of the lookahead search, keeps the numbers
  upstream's Normal kept. Every walk makes HEAD's moves, in another order,
  and stops at the same refusal; 101 of 2,282 squares are decided by another
  rule.
- **Deals cost less**: median and worst, in ms,

| Preset | HEAD | now |
| --- | --- | --- |
| 6×7 Easy | 13.0 / 22.4 | 3.7 / 12.0 |
| 8×10 Easy | 97.8 / 167.2 | 16.0 / 20.8 |
| 6×7 Unreasonable | 46.7 / 298.9 | 14.1 / 76.3 |
| 8×10 Unreasonable | 458.5 / 1,777.7 | 71.0 / 154.0 |

**No save or link stops loading** that the measurement reached: every HEAD
board above, HEAD's 45 larger ones, and every frozen upstream fixture is
solved at its tier, within a budget 40 times what the worst needs.
