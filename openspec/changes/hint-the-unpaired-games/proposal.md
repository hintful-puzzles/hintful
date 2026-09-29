# hint-the-unpaired-games

**Status: scaffolded, not started (2026-09-29).** Each game below gets its
own change when it is taken up; this one holds the decision point.

## Why

The owner's approach (2026-09-29) is framework first, with hintless games
pulled in one at a time as a check on the framework's ergonomics. The open
framework changes each name the hintless games that check them:

- `derive-target-verb-input`: Net, Mines, Black Box, Flip, Twiddle.
- `own-the-player-facing-messages`: Pegs, Same Game.
- `draw-hint-marks-from-roles`: Rect.
- `declare-params-in-one-place`: none (Mosaic may ride along for pace).

**Cube, Slide and Sokoban** are paired with no phase. All three are search
games whose hints are heuristic, and none of their mechanics is one a
scaffolded change builds. They still owe a hint: a game without one is a
draft, and the goal is every game hinted by the end of October 2026
(AGENTS.md § "Hint quality bar").

## The decision point

**By mid-October, compare the hintless games left against the weeks left.**
Twelve were hintless on 2026-09-29. If the framework phases have not reached a
game's pairing by then, write its hint regardless, rather than let the target
slip for want of an assessment: say in that game's change that it was written
for the target, not as a check.

Cube, Slide and Sokoban are taken then at the latest, or earlier whenever a
framework change turns out to press on them (a heuristic-plan helper would, if
one is proposed). Each starts with a short design pass on what its hint can
*prove* (docs/games/hints.md § "Non-deductive (heuristic) hints": Inertia's
unreachable gem is the shape), because a search may certify a position but
never teach one.

Re-take the hintless population from the registry (games without `hint`, as
`HINT_GAMES` derives the hinted ones) rather than trusting this list.
