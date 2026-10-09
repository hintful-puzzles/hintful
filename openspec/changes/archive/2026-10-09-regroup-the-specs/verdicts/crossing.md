# Verdicts: crossing

## reword `crossing`: The hint replays the solver's deduction and leaves the solver alone

The clause that the hint SHALL NOT alter the solver, the generator or the
description codec goes as `how`, and the title loses the half that named it.
It was the scope of the change that added the hint, not a standing rule: the
header of `src/games/crossing/hint-solver.ts` records it as a choice of where
the recording pass sits ("beside the untouched `solveCrossing` ... so keeping
the recording pass in its own module makes 'the solver didn't move' checkable
from the file list"). Whether the solver is frozen against later hint work is
an internal design decision, so it is decided here: it is not, and a later
change that folds the two into one engine breaks no promise. What a board is
promised stays in "Crossing's generator keeps every board uniquely solvable",
and the description format in its own two requirements.

### Requirement: The hint replays the solver's deduction

The hint SHALL be derived from the same deduction engine as the solver,
replayed one firing at a time.

#### Scenario: Following the hint solves the board

- **WHEN** hints are requested and followed, one plan after another, from a
  generated board with nothing entered
- **THEN** the board reaches the solution the solver finds

## reword `crossing`: Every Crossing hint step is narrated

The body restated `engine-hints` "A hint step always names a technique, with
no un-narrated fallback", which covers Crossing with no departure
(the header of `src/games/crossing/hint-solver.ts` lists five techniques, each
named, and a placement no premise supports waits for its notes under "A placement the board does not yet support
waits for its notes"). That part goes as `collection`. What is Crossing's own
was only in the scenario: every step names the run its deduction reasons over.
The body now says that, in the scenario's words, and the scenario is unchanged.

### Requirement: Every Crossing hint step is narrated

Every step of a Crossing hint plan SHALL carry an explanation that names the
run its deduction reasons over.

#### Scenario: Every step of a plan has its deduction

- **WHEN** a plan is computed for a board the solver can finish
- **THEN** every step carries an explanation that names the run its deduction
  reasons over

## keep `crossing`: Crossing's generator keeps every board uniquely solvable

No shared requirement states that a seed deals one board, and the app still
deals from a `params#seed` ID (`app-shell` "A seed ID still deals a game"), so
the sentence stays here until one does. `verdicts/spokes.md` carries the note
proposing the shared requirement.

## cut `crossing`: The solver calls a board valid only when every clue is used once

duplicate: they are one rule and one function. `status` in `src/games/crossing/state.ts` and the solver in `solver.ts` both return the verdict of `validateBoard`, so "Crossing is complete when every clue is placed exactly once" states this requirement's condition (every run matches exactly one clue number and each clue number is used once), and its scenario, that a fixpoint with an open cell undecided is not valid, is in "Crossing's solver propagates what the fitting numbers allow" ("or reports that the board is not fully determined or is contradictory"). The generator's use of the verdict is in "Crossing's generator keeps every board uniquely solvable".

## keep `crossing`: The grid lines are the collection's surface grid line

It is the game's own decision about how it looks, which stays, and no shared
requirement makes it for Crossing: I read `engine-colors` and `engine-drawing`
for a rule that a board on the quiet surface draws its lines in the surface
grid line, and there is none; each game says which line it uses. That the
frame is the same line as the inner lines is the part a session redrawing the
board would check.

## keep `crossing`: Crossing's solver propagates what the fitting numbers allow

The reading is right and the decision is this pass's to make: the per-run
intersection to a fixpoint is the whole of the deduction a generated board is
promised to yield to (the generator accepts a board only when this solver
finishes it), so it defines what a Crossing board is, as a tier's rung list
does for a tiered game. It also fixes what the hint may replay.

## note Crossing loads a board its solver cannot finish

`engine-params` "A board loads only if the game's own solver solves it" is not
true of Crossing as the code stands: it has no difficulty contract and no
`finishesByDeduction`, and its `solve` answers a board the propagation cannot
finish with `PUZZLE_NOT_REASONABLE`, which `loadDesc` does not refuse. So the
sentence of "Crossing's findMistakes compares the board with the unique
solution" that it returns nothing on such a board is reachable and stays. The
full note is in `verdicts/signpost.md`.
