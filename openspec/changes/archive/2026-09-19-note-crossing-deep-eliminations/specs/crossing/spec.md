## REMOVED Requirements

### Requirement: Crossing explains its next deduction

**Reason**: It let a step rest on candidates the constraint propagation had ruled
out of squares where the board showed no such rule-out, and required the narration
to say so ("once the crossing numbers rule the others out"). The player cannot
check that premise, which the hint quality bar's rule 6 forbids: a hint relies only
on marks the player can make.

**Migration**: Replaced by "Crossing explains its next deduction from the board",
which keeps every other clause and scenario and requires the hint to place, as
notes, the rule-outs such a step rests on.

## ADDED Requirements

### Requirement: Crossing explains its next deduction from the board

Crossing SHALL provide an explained hint that computes a plan of forced moves
from the player's current board and narrates each one by the deduction that
forces it, meeting the project's hint quality bar: the narration SHALL state
*why* the move is forced — the premise that singles out this conclusion — and not
merely what to enter.

The hint SHALL be derived from the same deduction engine as the solver, replayed
one firing at a time, and SHALL NOT alter the solver, the generator or the
description codec.

Because the solver reports *which* candidates a run's still-fitting numbers rule
out but carries no name for the technique that did so, the hint SHALL re-derive
the named technique — that only one listed number still fits the run, that every
still-fitting number agrees on a digit in this position, or that the across and
down numbers crossing in a square admit only one digit in common — rather than
narrating the bare candidate elimination.

A listed number SHALL count as still fitting a run only as the board shows it: the
number is the run's length, is not written into another run, and agrees with every
square of the run — with the square's entered digit, or else with its pencil notes
when it has any. Every step's premise SHALL hold under that reading of the board it
is shown on.

Where the solver's constraint propagation reaches a placement that no premise read
off the board yet supports, the hint SHALL NOT assert it. It SHALL instead place,
as note steps ahead of it, the rule-outs that placement rests on: writing into a
square without notes the digits one run's still-fitting numbers leave there, or
striking from a square's notes the digits they leave out. Each such step SHALL be
narrated by the run whose still-fitting numbers decide it.

Where one named technique can be forced by more than one kind of elimination, the
narration SHALL state the one that actually rules the other candidates out, and
SHALL NOT cite entries the board does not carry.

Crossing admits no guessing at any difficulty, so every step SHALL be narratable
and the hint SHALL NOT fall back on an unexplained "this is the only possibility"
step.

#### Scenario: A run determined by a single remaining number is offered whole

- **WHEN** exactly one unplaced listed number matches a run's length and agrees
  with the digits and notes already in it
- **THEN** the hint offers that number as a single placement filling the whole
  run, and the explanation states that only one number still fits

#### Scenario: A positional deduction names what the fitting numbers agree on

- **WHEN** every listed number that still fits a run carries the same digit at
  one position
- **THEN** that cell is offered as that digit, and the explanation states that
  every number still fitting the run agrees on it

#### Scenario: Two crossing numbers agreeing on one digit is offered as its own deduction

- **WHEN** the numbers that can still go in a square's across run admit one set of
  digits there, the numbers that can still go in its down run admit another, and
  the two sets share exactly one digit
- **THEN** that square is offered as that digit, and the explanation names what
  each of the two runs allows

#### Scenario: A placement the board does not yet support is preceded by the notes it needs

- **WHEN** the solver's propagation forces a placement, but a player checking the
  clue list against the board's digits and notes would still see several numbers
  fitting
- **THEN** the hint first offers note steps, each naming the run whose
  still-fitting numbers leave those digits in that square, and offers the
  placement only once the notes on the board support it

#### Scenario: A placement whose premise lives in the notes says so

- **WHEN** only one listed number fits a run because the notes in its squares rule
  the others out
- **THEN** the explanation states that it is the notes in the run that only one
  number fits

#### Scenario: The evidence includes the numbers the deduction reasons over

- **WHEN** a hint is displayed whose premise is which listed numbers still fit a
  run
- **THEN** those numbers are highlighted in the clue list as well as the run
  being highlighted on the grid, so the premise the narration cites is visible

## MODIFIED Requirements

### Requirement: One deduction is one hint

A single deduction that forces several cells SHALL be presented as **one** hint
rather than as one hint per cell — most importantly a whole run determined by the
single remaining number that fits it. Notes that one run's still-fitting numbers
decide in several of its squares are one deduction with different digits per
square, and SHALL be presented as one journey with a sentence per square.

The four kinds of action Crossing admits — placing a whole number into a run,
entering a single digit, writing notes into a cell, and ruling a candidate out of
a cell's notes — SHALL each be marked in the shape of the action it represents, so
that one hint color cannot stand for two different actions. A ruled-out candidate
SHALL be marked on the candidate itself rather than on the whole cell.

#### Scenario: A run filled by one deduction is a single hint

- **WHEN** a deduction determines every cell of a run at once
- **THEN** one hint is presented covering the whole run, not one hint per cell

#### Scenario: One run's notes in several squares are one journey

- **WHEN** the plan writes notes that one run's still-fitting numbers decide into
  two or more of its squares in a row
- **THEN** the later squares continue the first one's journey, each with its own
  sentence
