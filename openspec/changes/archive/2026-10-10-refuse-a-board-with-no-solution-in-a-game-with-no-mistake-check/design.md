# Design

Written and settled 2026-10-10 by the session that built it. The figures are
that day's, from a scratch test run under `nice`, and are the order of
magnitude and no more.

## Context

`answerVerdict` in `src/engine/desc-error.ts` asks a game's `solve` about a
board only where the game has `findMistakes`. A game with none was never
asked anything, so a board nobody can finish loaded.

## Decisions

### Decision 1: the population is every game with no mistake check

Thirteen, derived by `no-solution-load.test.ts` on every run: Cube, Fifteen,
Flip, Flood, Inertia, Netslide, Pegs, Same Game, Sixteen, Slide, Sokoban,
Twiddle and Untangle. The proposal named three, found by searching for the
constant `NO_SOLUTION`. That search missed Pegs and Sokoban, which say it
through `solveBySearch`, and could not find a game whose `solve` is
`() => ok` (Fifteen, Sixteen, Twiddle) or that has no `solve` at all (Cube,
Same Game). Every one of the thirteen loaded a board with no solution, and the
test pins one for each.

### Decision 2: the engine asks a question of its own, not `solve`

The first build did what the proposal said: `answerVerdict` asked `solve` of
every game that had one. It was withdrawn after measuring it.

What loading a dealt board cost before this change, the slowest preset of each
game: 155 ms in Galaxies, and under 50 ms in every other game. What `solve`
cost at the opening:

| Game | A dealt board, slowest preset | A board one edit from a dealt one |
| --- | --- | --- |
| Flip | under 1 ms | under 1 ms |
| Untangle | 62 ms (25 points) | 62 ms |
| Pegs | 83 ms (9x9 Random) | up to 4.1 s |
| Sokoban | 85 ms (16x20) | up to 1.5 s |
| Slide | 1.3 s (6x8) | 0.8 s |

- Pegs and Sokoban spend a whole budget of positions on a board they settle
  neither way. Such a board would load, and cost that each time its save
  opened.
- Slide's search has no budget, and costs a second on a board its own
  generator dealt.
- Netslide's `solve` rebuilds the answer by a search when it has no `aux`.
  One upstream fixture took 300 ms, and `upstream-descs.test.ts` did not
  finish in ten minutes.
- Flip's `solve` finds the shortest answer, which doubles with every free
  square of the matrix, though whether there is an answer is settled before
  that starts.

`solve` answers "what is the answer", and loading needs "is there one". So a
game with no mistake check says what it can prove through
`Game.hasNoSolution(state)`, a proof that costs the same on any board, and
`loadDesc` refuses a board it holds for. A game joins by having it. The first
build's opt-out flag for the three searching games is gone with it: a game
with no cheap proof has nothing to declare. `registerGame` refuses the hook on
a game with `findMistakes`, which already says a board has no answer through
`solve`, so that there is one way to say it.

### Decision 3: five games have a cheap proof, and three were not in the proposal

- Flip: the elimination alone (`hasAnswer`, split out of `shortestAnswer`).
- Untangle: the planarity test, through the layout it already keeps for the
  hint and Solve.
- Fifteen: the permutation's parity against the gap's square, which its
  generator already computes.
- Sixteen: the permutation's parity, claimed only where both sides are odd.
- Cube: a roll moves paint and never makes any, so the paint on the board and
  the solid must come to exactly one square a face.

Two tests opened a Cube board with no painted squares, which could never be
finished, and now use one with six.

### Decision 4: the sentence

`DESC_CONTRADICTORY` reads "The clues in this game ID contradict each other",
and none of these games has clues. The refusal is `DESC_NO_SOLUTION`: "This
game ID's puzzle has no solution, so it can't be played here."

## What is left, and where it went

Eight of the thirteen still load a board with no solution, and
`no-solution-load.test.ts` holds one such board for each, under `LET_THROUGH`:
Flood, Inertia, Netslide, Pegs, Same Game, Slide, Sokoban and Twiddle. The
hints of Pegs, Sokoban and Inertia already hold a cheap proof of a dead
position each (pegs cut off, a jammed barrel, a gem out of reach), privately.
That work, and what the engine should own of it, is filed as
`prove-no-solution-cheaply-in-the-games-that-search`.
