# Design: what the six files' sweeps cost, and what each catches

Everything here was measured 2026-10-07 on the development box: 8 logical
cores, 16 GB. The box was not idle. Load average ran 2.7 to 4.8 across the
session, with 8.7 to 8.9 GB of a 9 to 10 GB swap file in use and 230 to 880 MB
free, so every figure in seconds is an upper bound and the ratios are the
usable part. Each table is one vitest run, timed per test or per board inside
it, so the rows of a table share their conditions
(`docs/games/testing.md` § "Timing anything under vitest").

## D1. Where the time was

Summed per-test time for the six files, one run, before any edit: 97.2 s over
166 tests. Tests under a second are left out.

| file | file sum | test | s |
| --- | --- | --- | --- |
| `untangle-hint` | 24.0 | narrates true counts and solves every board it is followed on | 20.4 |
| `spokes-hint` | 19.7 | planning at the top tier gives the same plan as planning at Normal | 11.6 |
| | | never marks a spoke whose both hubs are already satisfied | 8.0 |
| `netslide-hint` | 15.5 | says what every slide is *for* (builds the shared corpus) | 4.1 |
| | | never opens by undoing a slide it has just talked the player into | 3.5 |
| | | only claims a tile belongs somewhere the finished board wants its wires | 2.3 |
| | | 5x5 wrapping convergence, with the generator's answer | 2.2 |
| | | 5x5 wrapping convergence, with no answer to work from | 2.0 |
| `solo-hint` | 15.3 | Killer board walks to solved on recomputed hints | 6.2 |
| | | a naked-single narration only on a one-candidate cell | 2.4 |
| | | a deductive strike step's marks | 2.2 |
| | | a killer single's cage is filled in | 1.7 |
| `sixteen` | 12.9 | pins | 2.1 |
| | | never highlights a tile off the moved line | 1.4 |
| `netslide-reconstruct` | 9.8 | finishes any board on any preset | 9.0 |

Sixteen has no sweep: about fifteen tests each read one plan on a board of
their own, for one search of 0.5 to 1 s apiece.

## D2. The method

For each costly test: time its items inside one run; plant a defect in the
code it is about, switched by an environment variable so one run under the
plant reports every board; record which boards and which other tests see it.
A plant's reach beyond the file was read from the game's whole directory plus
`hint-resume.test.ts` and `hint-quality.test.ts` run under
`GATE_PRECOMMIT=1 GATE_GAME_SCOPE=<game>`.

That invocation had a control, and the control failed: `hint-quality`'s
"met every form it checks on real steps" is a floor over the whole sweep and
sat in a plain `it`, so any hook run narrowed to one game would have gone red
on it. It is `itOverWholeSweep` now, and the control is green.

## D3. Spokes: the cost was dealing, and the sample missed a filter

Both tests dealt 4x4 boards at the top tier and then planned on them. Per
board, dealing an Unreasonable board took 70 to 2,440 ms and a plan about
5 ms. Dealing was 9.4 s of the top-tier test's 11.6 s, and about 5.5 s of the
rule-out test's 8 s.

**The rule-out walk.** Two filters keep a useless rule-out out of a plan, one
in the exhausted-hub rung and one in the look-ahead. Each was lifted in turn
and the walk run at the slow tier's 60 seeds a tier:

| filter lifted | Easy | Normal | Unreasonable |
| --- | --- | --- | --- |
| exhausted hub | 51 of 60 | 36 of 60 | 4 of 60 |
| look-ahead | 0 | 10 of 60, first at seed 9 | 0 |

The gate walked seeds 0 to 7. So the gate caught the first and **was blind to
the second**, which the comment at the site ruled out by argument ("a rule
that emitted useless rule-outs would do so on nearly every board"). The
Unreasonable boards, most of the cost, saw 4 and 0.

Decision: the Easy and Normal boards are still dealt (milliseconds); three
Normal boards on which the look-ahead's filter binds are written down, and the
twelve top-tier boards are written down too. Re-planted against the new test:
both filters go red, the look-ahead's on the first written-down board. Nothing
else in Spokes' directory or the two cross-game guards sees either. The slow
tier still deals 60 of every tier.

**The top-tier test.** Planted: the unbounded trial run after the bounded
one, at the top tier only. The plan grew by 7 to 28 firings on every one of
the twelve boards, and every one is also a board where the Normal rung adds
firings over Easy. So the boards need not be dealt. They are the same twelve
descriptions, and the control is now held on each board, with a second one:
the Normal plan stops short of solved, which is the condition under which a
rung above it has anything to add.

A recomputed walk and a single replayed plan gave the same firings on all 24
boards compared, at a tenth of the cost; the walk was left recomputing because
with no dealing it is 1.3 s.

## D4. Untangle: n=25 is the cost, and a second seed repeats the first

Four sizes, two seeds, three kinds of start. Per walk, n=6 and n=10 are 1 to
110 ms, n=15 is 80 to 1,300 ms, n=25 is 710 to 5,000 ms: the six n=25 walks
were 14.7 s of the test.

Planted, over four seeds of each size (48 walks):

| plant | n=6 | n=10 | n=15 | n=25 |
| --- | --- | --- | --- | --- |
| a rearranging step promises a move that does not repay it | 0 | 0 | 1 | 8 of 12 |
| a placed point may be moved again | 0 | 1 | 1 | 9 of 12 |
| a spot is not moved to where the pointer can land | 0 | 0 | 0 | 0 |
| a journey is kept whether or not it does what it says | 0 | 0 | 0 | 0 |

Every n=25 seed showed the first two on at least one start. Both also turn
the pinned 25-point position red. The third is caught by
`untangle-landing.test.ts`. The fourth survived every test run against it,
and was not pursued: whether the check it removes can fail at all was not
established.

Decision: the gate walks n=25 at one seed, the one on which both plants showed
from a scatter and from a snapped board, and the other sizes at two. The slow
tier walks four of each, as before.

## D5. Netslide

Five plants, read across both files and `hint-resume`:

| plant | every-preset walk (reconstruct) | hint file's convergence walks | other |
| --- | --- | --- | --- |
| search budget cut to 60 states | all six 5x5 boards | both 5x5 walks | pins |
| no exact search | one board: 5x5, no wrapping, no barriers | none | pins |
| the pick ignores reachability | none | none | none |
| the opening may undo the last slide | none | none | none |
| the goal is the aux arrangement, not "powers everything" | none | none | none |

**The every-preset walk stays as it is.** The three 5x5 presets are nine
tenths of it. It is the only test that follows a hint to the end on a 5x5 that
is not wrapping, `hint-resume.test.ts` names it as the cover for the board
size its own slice leaves out, and it alone saw the missing exact search as a
walk that does not finish.

**The hint file's no-answer convergence arm is removed.** It was the same loop
on two presets the walk above already covers with no answer, and it failed
only where that one failed.

**Two tests were green with their rule deleted.** Each sampled boards on which
the rule decides nothing:

- *The no-undo test* followed a hint and asked again. With the rule lifted,
  the hint opened by undoing none of 108 slides it had asked for itself, and 3
  of 96 slides a player made of their own on a fresh 5x5. The test now makes a
  player's slide on two such boards, written down. Lifted again, it reads
  `[true, true]`.
- *The reachability pick.* 14 of 900 dealt 3x3 boards have a first finished
  grid that is out of reach, all of them wrapping; the test dealt nine boards.
  Two are written down, and the test holds each to being such a board.

**The narration corpus** was 18 boards, six a size, and the six 5x5 boards
were most of its 4 s. Planted, "center" in the frozen-row sentence showed on
14 of 18 boards and a second "belongs" on 7, each at every size. The 5x5 takes
two boards now.

The last plant survived everything. A test stops walking when the board is
complete, so a plan that runs on past it is not seen, and the midend refuses
a hint on a finished board. Not pursued.

## D6. Solo: two walks that asked again after every move

The Killer board's first plan is its whole solution: 221 moves from one ask in
61 ms. The test asked 220 times, 5.6 s. Planted (the culls reading no cage),
the throw comes at the first ask, and four other tests in the file see it,
among them one that already follows that same plan on that same board. The
recomputing walk is retired, and that test now also holds the board to ending
solved. Asking from every reached position is `hint-resume`'s walk, which
deals Killer boards.

The naked-single check walked four boards the same way: about 400 ms a board
recomputing, 12 ms following. Planted (every placement classified as a naked
single), following showed it on three of the four boards and recomputing on
two. It follows the plan now.

The two remaining tests over a second each ask one plan per board over 18 and
14 boards. They were left.

## D7. Sixteen: left

Planted (a tile leaving one edge given a target short of the other), twelve
tests went red, the geometry sweep among them. There is no sweep to narrow and
the two deep-search walks are already in the slow tier.

## D8. After

One run of the six files, compared test by test with the run in D1. The tests
this change did not touch are the control for the box: they summed 35.3 s
before and 30.0 s after, a ratio of 0.85.

| file | before | after |
| --- | --- | --- |
| `untangle-hint` | 24.0 | 11.7 |
| `spokes-hint` | 19.7 | 1.6 |
| `netslide-hint` | 15.5 | 7.3 |
| `solo-hint` | 15.3 | 5.8 |
| `sixteen` | 12.9 | 10.8 |
| `netslide-reconstruct` | 9.8 | 8.9 |
| all six | 97.2 | 46.0 |

The tests this change edited summed 60.9 s before and 15.1 s after, which is
17.8 s at the first run's conditions. So about 43 s of the 97 s is gone. The
gate also sees three defects it did not: the look-ahead's rule-out filter, the
no-undo rule and the reachability pick. And a hook run narrowed to one game no
longer fails on `hint-quality`'s floor.
