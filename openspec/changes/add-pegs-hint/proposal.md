# add-pegs-hint

**Status: scaffolded, not started (2026-09-30).** Pulled in by
`own-the-player-facing-messages`, whose check this game was. Pegs is a draft
twice over: it has no `hint`, and no `solve` either, because upstream had no
solver (its `notApplicable` names only `findMistakes`).

## Why

Every game has a hint, and a game without one is a draft (AGENTS.md § "Hint
quality bar"). Pegs is a search game: a jump is never *forced*, so the hint
cannot teach a deduction. It is the non-deductive case, and the bar for that is
Inertia's (docs/games/hints.md § "Non-deductive (heuristic) hints"): find the
one thing the game can prove, lead with it, and narrate each jump by the
consequence it actually has.

## What the messages change settled

The refusal a Pegs hint needs, "no sequence of jumps from here leaves one peg",
is `NO_SOLUTION_FROM_HERE` (`solve-failure.ts`). It is already approved for
hints, and Inertia's hint and Solve both say it for the same fact. A Pegs
`solve` built from the same search refuses with the same constant. Nothing here
needs a new message kind; if the hint finds it does, that is a finding for the
messages, not a sentence for Pegs.

The search cannot promise to be exhaustive on the larger boards (9×9 Cross,
9×9 Random), so past its bound it says `SEARCH_OUT_OF_REACH`, as Sixteen's
does, and never `NO_SOLUTION_FROM_HERE`, which claims the search looked
everywhere.

## Design pass: what can a Pegs hint prove?

Task 0 answers this before any plan is written. The candidates, each to be
measured on real positions rather than assumed:

- **A peg nothing can ever reach.** A peg with no other peg within jumping
  distance, and no hole a peg could arrive in beside it, can never be jumped or
  jump. Any such peg besides the last is a proof the position is lost, and
  pointing at it is Inertia's unreachable gem.
- **Pagoda functions.** A weighting of the holes that no jump increases gives a
  certificate: if the position's weight is below the weight of every one-peg
  finish, it cannot finish. Conway's pagodas for the English board are
  published, but a player cannot check one on the board, so this can only back
  a refusal, never a step's sentence (AGENTS.md hint bar rule 6).
- **The rule of three.** Peg positions fall into classes that jumps preserve,
  which constrain where the last peg can finish. Whether that ever *refuses* a
  real position, as opposed to narrowing a goal, is the measurement.
- **The exhaustive search itself**, bounded and memoized on a bitboard, for
  boards small enough (7×7 Cross has 33 holes, and a solver with symmetry
  reduction is well within a browser's reach). A search may certify a position
  but never teach one, so the narration says what a step *does* (which pegs it
  clears the way to, which area it empties), never "the solver found this".

**Falsifier:** if no candidate proves anything on more than a handful of
positions a player reaches, the hint is a search with honest refusals and
consequence-only narration, and the change says so rather than dressing the
search up as reasoning.

## Out of scope

The other search games in `hintless-games-in-reserve` (Cube, Same Game, Slide,
Sokoban) each get their own change. Whatever this one extracts is offered to
them, not built for them.
