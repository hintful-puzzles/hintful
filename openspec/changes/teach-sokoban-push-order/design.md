# Design: teach-sokoban-push-order

Measured 2026-10-04 on boards dealt from the seeds `order-o1`, `order-o2`, …
of each preset, walked as the resume guard walks them: ask, make the first
step's push, ask again. The machine was at load 4 and paging, so the request
times below are upper bounds; the counts do not depend on it.

## D1. The walk cycled before anything was measured

The first walk never finished. On the second 10×12 board the hint pushed one
barrel right, then left, for ever, seven pushes from the end
(`sokoban-hint.test.ts`'s `CYCLED_BACK`).

`judge-rivals-for-search-hints` design D3 says every hinted push lowers the
length of the line the search finds, "measured over 36 boards: never without a
push that lowers the potential". That is not so. Over 57 boards (40, 12 and 5
of the three presets; 1,668 pushes) six positions had no push that lowers it,
one in about three hundred, on five boards. There the hint offered the plan's
own first push, which nothing bounds. Five of the six walked on; one came
back.

The one that came back has a shape. From P the search's line is six pushes
and opens with a push to Q. From Q the search finds seven, and they open by
pushing straight back to P. So the line found from Q passes through Q's own
predecessor, and its remainder is a line from P; P's line passes through Q,
and its remainder is a line of five from Q that the search from Q did not
find.

**The rule added (`hint.ts`'s `planAt`)**: where the line found after the
plan's first push opens by undoing that push, and its remainder is shorter
than the plan, the remainder is the plan. At Q that gives five, and the hint
goes on. It costs nothing, since that second search was already made for the
potential check. After it: the same 57 boards, no cycle, five positions with
no lowering push, all walked through.

**What this is not.** It is not a proof. A proof needs a line whose every
suffix is the line the search finds from there, which a search that is not
shortest cannot give, and no rule that reads one or two positions around the
player closes every case: a position with no lowering push can in principle
be re-entered by a longer way round. What is claimed now is what is checked:
the hinted push shortens the plan wherever some push does, the one cycle
found is pinned, and the comments, the resume guard's ledger and the spec no
longer say "cannot cycle". A search that returns shortest lines would make
the claim true, and belongs to `strengthen-the-sokoban-solver`.

Considered and not built: returning the whole line as the plan, so the midend
carries it (docs/games/hints.md § "Recompute-stable plans" rules it out: it
hides the cycle from a player who follows and hands it to one who does not);
judging every push on every request for the one with the shortest line (some
thirty searches a request on 16×20, and still no proof); refusing where no
push lowers the plan (a refusal on a board the search has a line for, on one
board in ten).

## D2. What the candidates measured

24 boards (12, 8 and 4), 818 pushes, with D1's rule in place.

What the hint said before this change: *puts it on a target* 495 (61%), the
bare push 170 (21%), a trap 141 (17%), *lets you out* 10, a judged claim 2.
That agrees with the 60/19/20 the proposal quotes.

| candidate | the check | fires |
|---|---|---|
| Fill this target first | an empty target that, with a barrel on it, leaves no square to push a barrel onto this one from | 13 steps (1.6%), on 11 of 24 boards |
| Clear the way | another barrel that cannot be pushed to an empty target alone, and can after this push | 123 steps (15%), on all 24 boards |
| A barrel's run | the walk went on pushing this barrel until it stood on a target | 91 of the 170 bare pushes |

All three are kept. The first is rare and is the purest order lesson there
is, the far target of a corridor. In all 13 the walk did fill the outlined
target later, as "first" says it will.

## D3. The checks

**Fill that one first (`shutBy`).** A push onto a target needs the square the
barrel comes from and the square the player stands on. The check takes an
empty target as a wall and asks whether a barrel alone on the board can be
pushed onto this target from anywhere (`pushDistances` with a square shut).
Taking barrels away only makes room, so where the answer is no it is no on
the real board too, for as long as a barrel stands there. Said only on a
board where every target must be filled (`SokobanBoard.exact`), since
otherwise the other target need never be.

**Keeps the outlined barrel from reaching a target (`clearedBy`).** The first
cut asked only "no way before, a way after", and it fired on every step that
let a boxed-in player out, because a player who cannot move can push nothing
anywhere. So the claim is three checks, each an exact search over the pushes
of the one barrel with every other barrel standing still
(`SokobanBoard.routes`): it reaches no empty target now; it would with this
barrel lifted off the board; it does after the push. And it gives way to
*lets you out* where that applies.

Read on the board, the ringed barrel is sometimes on the other's path and
sometimes on the square the player must push it from. "Stands in its way"
was true of the first only, so the words say *keeps it from reaching a
target*, which is what was checked.

It is a statement about the board as it stands. Another barrel moving could
open a way too, so the sentence does not say this push is needed, only what
it does.

**A run (`runHome`).** The plan's opening pushes while they move one barrel,
up to the push that lands it on a target: two to five of them, each
shortening the line the search finds, so a leg is a push the potential rule
would have offered. Told as one journey, as Pegs tells a package. It takes
the last place in the order, so a step with a trap or an order claim keeps
its one push and its own sentence.

## D4. What the hint says now

Over the same 818 pushes: *puts it on a target* 426 (52%), a trap 141 (17%),
*keeps … from reaching a target* 83 (10%), a run's first leg 79 (10%), the
bare push 64 (8%), *fill that one first* 13 (1.6%), *lets you out* 10, a
judged claim 2. The bare push fell from 21% to 8%.

Of the 79 journeys, asking again after each leg offered the journey's next
leg in 75. In the app the journey is carried, so the other four are seen only
by a player who asks afresh mid-run.

The worst request was 958 ms, 902 ms and 1,762 ms on the three presets,
against 945, 1,079 and 2,098 before: the order checks run only where nothing
else was said, and the worst requests are the ones that search the rivals.

## D5. Marks

One kind is added, a target (`GOAL`), outlined: the target to leave empty.
The ringed target is the square the ringed push goes into, so "the ringed
one" names it with no second mark.
