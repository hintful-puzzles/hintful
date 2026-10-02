# Design: reach-every-declared-mark

## Census (task 0.1), 2026-10-02

Instrument: for every hinted game, the declared legend roles and `role|kind`
pairs set against what `repaintDifferential`'s frames painted. The population
was checked against an independent walk: each game's hint plan, followed to
its end on three other deals at default params, recording the pairs its steps
named.

**The instrument was checked first.** With the opening's three steps as the
only hint frames, it reported Pegs' `stripes|jump`, `outline|jump`,
`ring|jump` and `outline|peg`. Those are the marks `share-marks-across-tiles` found the run
never painted.

**The seeded run, as it was:** 21 of 50 hinted games never painted at least
one role their legend lists, and 11 more painted a role only on some of the
kinds the walk used. The run also passed `redraw` no `deadEnd`, and its check
event called `findMistakes` rather than `check`, so Pegs' and Inertia's
dead-end marks were compared by nothing.

**After adding the walk of the plan (D1):** 9 games were still missing a pair.
The walk also convicted Guess: a win kept its "current move" marker beside the
winning row, because the marker was erased only when `nextGo` moved, and a
win does not move it. That is now fixed in `guess/render.ts`. The walk census
also found Mines' hint refusing its own winning step (D4).

## D1. Walk the hint's plan on a draw state of its own

The opening's three steps show only a deal's first deductions. Rarer rungs,
marks on other kinds of element, marked dead ends and the frame a plan wins
on come later. The walk is a second pass on the same board with a fresh draw
state, so the random-input pass still plays on an unsolved board.

The walk paints only where each event starts and settles. The first pass
already requires animations painted part-way. Painting each slow-motion step
frame by frame cost Fifteen 29 s against 7.6 s, and the Guess conviction
survives the jump: re-planted, it still fails on the same frame.

Cost, measured with memory under swap (so read as upper bounds): the file
took 41 s before, 73 s with the walk, and 86 s with the walk and pins.

## D2. The population is what the renderer asks for

Task 0.2 asked whether to key on role or on role and kind. **On role and
kind**: 11 of 50 games had a reached role hiding an unreached kind. Examples
are Pegs' arrows (`outline|jump`) behind its outlined pegs, Loopy's
`outline|edge` behind `outline|clue`, and Slant's `alike` marks.

The legend declares roles but not kinds, so it cannot be the whole
population. The kinds are also not worth declaring by hand: nothing would
consume that declaration except this check. A bound game's renderer reads its
marks only through `StepMarks.of(role, kind)`, and it reads every pair on
every frame, whether or not the step has any. So the differential records
those reads (`RepaintReach.asked`), and that set is the population.

Checked against the independent walk: **every pair any step named was among
the pairs the renderer asked for, in all 50 games**. The renderer's reads also
found 15 pairs, across 10 games, that the 3-deal walk had missed, such as
Loopy's corners and pairs and Galaxies' outlined walls.

A pair whose role the legend does not list is exempt. The binding walk
already forbids a step naming such a role, so this exemption comes from a
declaration the game already makes. Undead is the case: the shared
`HintSidecar` asks for striped cells, and Undead's legend lists no stripes.
The legend also gets the converse check: every role it lists must be one the
renderer asks for, since the help page describes each one.

## D3. Pins are inputs, and the ledgers are exact

Every gap but two closed with a pinned board, found by walking deals across
each game's presets until the plan painted the pair. Loopy and Solo need two
boards each, and the rest need one. Each board is pinned as its
`params:desc`. A pin must paint something the seeded run does not, so a pin
the run has caught up with fails. Pegs' own pinned repaint cases became
redundant with the walk, and were removed. With the arrows or the stripes
planted out of Pegs' tile key, `warm-repaint.test.ts` fails on its own.

`UNREACHED` holds the two that no board reaches:

- **Crossing `outline|cell`.** The shared sidecar reads it, and Crossing's
  hint outlines only listed numbers.
- **Rect `ring|line`.** The last rung fired on none of 37,785 firings over
  6,000 deals with a unique solution, and on 3 of 315 deals without one. On
  those boards the midend then throws when deduction runs out, which is
  `let-a-board-waive-the-deduction-promise`. That change pins
  `4x4a:b4a2a2a2b2a2_2a` and removes this entry.

## D4. What the census found along the way

- **Mines' hint refused its own last step.** On some boards the plan proves
  every safe square without proving every mine. The winning open then flags
  the mines still covered (`index.ts`), and `minesHintKeepTrack` judged those
  flags off the step. So Auto-Hint and the hint gesture threw on the move that
  finishes the board (deal `census-2`, default params). The fix accepts flags
  that a win placed, and `mines-hint.test.ts` pins the board.
- **Tracks 15x15 Tricky fails to deal** on 7 of 100 seeds. Scaffolded as
  `deal-every-tracks-board`.
- **A hint on a board without a uniqueness promise throws** when deduction
  runs out. Scaffolded as `let-a-board-waive-the-deduction-promise`.
