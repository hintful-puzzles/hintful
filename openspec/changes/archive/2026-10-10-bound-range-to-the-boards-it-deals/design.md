# Design

Everything measured here was measured 2026-10-10, under vitest in Node, on a
machine doing other work. The times are that machine's.

## The decision: no size is refused, and two defects are fixed

The proposal asked for a bound in `validateParams` that refuses a board Range
"does not deal in a few seconds". This change draws no such bound, and takes
away the one Range had at Unreasonable.

The rule was settled before the proposal was filed
(`docs/games/solver-and-generator.md` § "Bound a generator by its tail, not
its median", from `bound-custom-sizes-by-their-deal` and
`let-a-player-stop-a-deal`, 2026-10-06): **a Custom size is not refused for
its wait.** A deal runs beside the board in play and the player can stop it.
A bound is for what a wait does not fix: a deal that takes the worker down, a
size no board exists at, a deal that hands over something other than what was
asked for.

Range had one failure of the first kind and none of the others:

- **The stack overflow is a crash, and it is fixed and not bounded.** A bound
  would have had to sit under wherever the browser's stack ends, which the
  proposal notes was not measured and differs by engine. With the walk on its
  own stack there is no such place.
- **Nothing else fails.** Every Easy deal measured took one draw. Every
  Unreasonable deal past the old 300-square bound returned a board with one
  answer that the rules stop short of (18 boards from 18x18 to 30x30, 3x125
  and 8x60 among them), so the time goes on the board that arrives.

So the three things the proposal said to settle first come out as:

1. **A pasted 64x64 board did fail**, in the same walk: loading grades a
   board by running the rules. `applyRules` on an open 64x64 grid threw
   "Maximum call stack size exceeded" before the change and is a test now.
2. **Nothing that deals today is refused**, since nothing is refused.
3. **The strip was made cheaper**, by about 2.4 times at Easy, without moving
   a board. See below.

## The connectedness walk

`ruleConnectedness` keeps the path from its start in an array, and the
direction each square tries next in another. A square's parent is the entry
before it on the path, and its depth is its place on it, so the `parent`
array went and `depth` marks a square visited.

It reaches the same squares in the same order and reports each cut vertex at
the same moment: when the walk comes back from a child that reaches nothing
above the parent. That order is not free. `stripClues` keeps or puts back a
pair by what the rules fill, so it decides which board a seed deals, and the
hint narrates the fills in the order they fire.

**Checked by recording first.** 219 boards (eleven sizes from 6x9 to 25x25,
both tiers, twelve seeds a cell and three at 20x20 and 25x25) with the hint
plan of each: 20,094 steps, 443 of them by connectedness. After the change
none moved. With `low >= depth` planted as `low > depth`, 70 of the 219 moved,
so the comparison sees this rule.

## The strip met every removed pair twice

`stripClues` walks `order`, which holds both squares of every symmetric pair.
A pair removed at its first square is met again at its second, with both
squares already blank. Upstream blanks them again, adds two to the count of
clues removed, and runs the solver, asking it to fill two squares more than
are undecided. It cannot, so the pair is "put back" as blanks and the count
restored. The run is a whole solve of a board the rules finish, the dearest
kind, and its answer is known before it starts.

The strip now passes over a square that is already blank. The count of clues
removed equals the number of undecided squares at every step, so the skipped
run could never have passed, and no board moves: the same 219 boards and
20,094 steps compare equal.

Mean time for a deal, before and after (the walk on its own stack in both):

| Board | Tier | Before | After |
| --- | --- | --- | --- |
| 11x16 | Easy | 0.06 s | 0.03 s |
| 20x20 | Easy | 0.54 s | 0.26 s |
| 25x25 | Easy | 1.6 s | 0.71 s |
| 30x30 | Easy | 4.1 s | 2.0 s |
| 40x40 | Easy | 25 s | 10 s |
| 2x126 | Easy | 0.23 s | 0.13 s |
| 10x118 | Easy | 8.0 s | 3.9 s |
| 15x20 | Unreasonable | 0.98 s | 0.82 s |
| 18x18 | Unreasonable | 1.3 s | 1.0 s |
| 20x20 | Unreasonable | 2.4 s | 2.0 s |
| 3x125 | Unreasonable | 1.3 s | 1.1 s |
| 25x25 | Unreasonable | 6.8 s | 5.3 s |
| 8x60 | Unreasonable | 3.2 s | 2.6 s |
| 30x30 | Unreasonable | 12 s | 9.3 s |

Five deals a cell up to 20x20, two or three above, one at 40x40 and 10x118.
An Unreasonable deal gains less because its time is in `stripFurther`, which
already passes over a blank pair and whose cost is the search.

## What was not done

**The strip still reruns the rules from the clues for each pair.** Carrying
the fills over from one pair to the next would need the rules to be monotone,
so that a fixpoint does not depend on the order it is reached in, and the
not-too-big rule is a port whose monotonicity nobody has shown
(`docs/games/solver-and-generator.md` § "A fixpoint is order-independent only
if every rule is monotone"). With no bound for it to move, and the largest
preset at 0.03 s, it was left.

## The other `bound-*-to-the-boards-it-deals` changes

Six were filed the same day on the same premise. Each should be read against
the rule above before a bound is drawn: what does the deal do at the size in
question other than take long? Palisade's gives up after 10,000 divisions,
which is a failure and not a wait. A table of times alone convicts nothing.
