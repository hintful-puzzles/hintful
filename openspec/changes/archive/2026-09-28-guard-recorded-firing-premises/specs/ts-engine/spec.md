## ADDED Requirements

### Requirement: A recorded firing's premise SHALL name every cell its deduction reads

The premise of every recorded firing a candidate hint plan offers SHALL name every cell
whose candidates or placed value its deduction reads, including a cell read for what it
does not hold: a hidden set or a fish reads the rest of its lines, and a claim that
only one mark leads somewhere reads every mark that could. Where the game's words for a
step do not name such cells, the recorded reason SHALL carry them as `reads`, and the
walk SHALL add them to the step's premise as it adds the game's own. The cells a
placement leaves out of its premise SHALL be the cells its legs act on, never the cells
a note leg writes because the firing reads them.

The engine SHALL hold this with an audit (`src/engine/firing-replay.ts`), idle in
production, that takes the solver's state at each firing the walk offers, returns every
cell outside the premise to the state the recording started from, and runs the firing's
own technique again, making the changes of any earlier firing that technique finds first
on returned cells, and SHALL report a firing that no longer follows. It SHALL first
replay the firing from the recorded state and report one it cannot reproduce as a fault
of the instrument, not of the premise. It SHALL report a recording that offered it no
replay, and SHALL count the cells it actually tested.

A guard SHALL run the audit over every game whose hint is the candidate walk, derived
from the games' sources, under every reading of an unmarked cell the game offers, on
one board per leaf preset and any board a game adds for a rung those boards leave
untested. A game whose recording offers no replay, whose replay tests no cell, or whose
plan records nothing SHALL be named in a ledger, with why, that the guard holds exactly.
A technique flagged because it reads more to decide whether to fire than its conclusion
rests on SHALL be named in a ledger, with why, and pinned to a board that still shows
it; a fix such an entry could hide SHALL be held by a test of its own.

#### Scenario: a fish names the rest of its lines

- **WHEN** a set in the value slice strikes a value because, in some columns, the value
  can only sit in cells of certain rows
- **THEN** the step's premise holds every other cell of those columns, and the walk does
  not offer it while one of them still shows the value

#### Scenario: a premise cut short turns the guard red

- **WHEN** a game's words for a clue deduction stop naming the line the clue reads
- **THEN** the guard reports the firings that no longer follow from their premise

#### Scenario: a note leg does not remove a premise cell

- **WHEN** under the implicit reading a placement rests on a cell the board has not
  filled, so the firing writes that cell's notes first
- **THEN** the cell is still in the placement's premise, and the placement is not offered
  while the solver's value there is one the board has not placed

#### Scenario: a solver that offers no replay is reported

- **WHEN** a candidate walk records firings through a solver that offers the audit no
  replay
- **THEN** the guard fails for that game unless the ledger names it with why
