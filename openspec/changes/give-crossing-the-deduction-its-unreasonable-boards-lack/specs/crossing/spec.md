## MODIFIED Requirements

### Requirement: Crossing's solver propagates what the fitting numbers allow

Crossing SHALL provide a solver that determines the unique solution, or reports
that the board is not fully determined or is contradictory. For each run it
SHALL intersect each open cell's candidate digits with the digits some
still-fitting clue number places there, and confirm any cell left one digit.
Where that settles nothing more it SHALL give a clue number that still fits one
run only that run's cells, and iterate all three to a fixpoint.

#### Scenario: The solver finds the unique solution

- **WHEN** a generated board is solved
- **THEN** the solver fills every open cell so that each clue number appears
  exactly once across the runs, and reports the board valid

#### Scenario: A number with one run left takes it

- **WHEN** the solver runs on the 4×2 board `a5a1,26,41,46,414`, where with
  414 written in every run still fits two numbers or three and 26 fits the
  across run alone
- **THEN** it writes 26 into that run and reports the board valid

### Requirement: Crossing's generator keeps every board uniquely solvable

At Easy the generator SHALL accept a board only when the solver reports it
valid, so that the board has one solution and deduction alone reaches it, and
SHALL retry otherwise. On a generated board no 2×2 block SHALL be fully closed
and the open cells SHALL be connected. An Easy deal SHALL keep a board that
needs the solver's third deduction, which upstream's generator throws away, so
a seed need not deal the board upstream deals from it.

#### Scenario: Every preset produces a uniquely-solvable board

- **WHEN** a new Easy game is generated for any preset or legal size
- **THEN** a board is produced whose walls and number list admit exactly one
  solution reachable by the deductive solver

#### Scenario: A recorded seed deals upstream's board unless an earlier draw is kept

- **WHEN** each seed recorded from upstream whose board has no cell out of a
  clue's reach is dealt
- **THEN** it deals the recorded board, or, for a seed named as dealing an
  earlier draw, another board that the solver finishes

### Requirement: The hint names the technique, not the candidate elimination

The solver reports which candidates a run's still-fitting numbers rule out and
carries no name for the technique. The hint SHALL re-derive the named
technique: that only one listed number still fits the run, that a listed
number still fits one run only, that every still-fitting number agrees on a
digit in this position, or that the across and down numbers crossing in a
square admit only one digit in common. It SHALL NOT narrate the bare candidate
elimination.

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

#### Scenario: A number with one run left is offered whole

- **WHEN** a listed number not yet written in still fits exactly one run as the
  board shows it, and that run still fits other numbers
- **THEN** the hint offers that number as a single placement filling the run,
  and the explanation states that it still fits only that run

### Requirement: Crossing counts a board's answers by a bounded search

The game SHALL count a board's answers up to two by trial and error over the
solver's deductions, assuming each candidate digit of an empty cell in
turn where they stop. It SHALL report one answer, several, none, or that it
stopped at its budget, which SHALL be counted in positions tried and never in
time. Solve SHALL take the board's answer from it at either difficulty, and
SHALL say that a board has more than one solution or none only where the
search proved it.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a board the solver finishes, on one with one
  answer that it does not reach, on two four-cell runs that share no cell with
  two numbers to hold, and on an across run and a down run from one cell whose
  numbers start with different digits
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given fewer positions than a board needs
- **THEN** it reports that it stopped, and neither one answer nor several

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** the walls of dealt boards from 4×3 to 6×6 are given the numbers of
  a fresh random fill, and the same with one number changed, and each board's
  answers are counted by writing whole numbers into its runs
- **THEN** the search reports one answer exactly where one way fits, several
  where more do and none where none does

### Requirement: Unreasonable is bounded on its own measurements

The bound on the Unreasonable boards that are dealt SHALL be its own, tighter
than the Easy one, since at every shape such a board is found many times more
seldom. A size past it SHALL be refused with a reason naming the
difficulty, and SHALL still be dealt at Easy where the Easy bound admits it.

#### Scenario: A size dealt at Easy is refused at Unreasonable

- **WHEN** a 13×13 board, with symmetric walls and without, a 10×15 board and
  a 5×30 board are checked for dealing at each difficulty
- **THEN** each is admitted at Easy and refused at Unreasonable

#### Scenario: The largest admitted boards are dealt

- **WHEN** an Unreasonable 12×12, 8×18, 4×36 and 2×40 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

## ADDED Requirements

### Requirement: A number's one run is shown by the squares that rule it out elsewhere

A step that gives a listed number the one run it still fits SHALL mark that
number in the clue list and the run's empty squares as what it decides, the
run as the one its sentence names, and, as its evidence, the squares of every
other unfilled run of that length whose digit or pencil notes the number
disagrees with. Its premise SHALL hold as the board shows it: the number SHALL
fit no other run under the reading every step is held to.

#### Scenario: The squares that keep a number out are outlined

- **WHEN** the hint is asked on the 4×2 board `a5a1,26,41,46,414` with 414
  written in
- **THEN** it offers 26 for the two-square across run, and its evidence is the
  two squares holding a 4 at the head of the down runs

#### Scenario: A number's one run waits for the notes that show it

- **WHEN** the hint is followed on a board the solver's first two deductions
  stop on, where each number still fits several runs as the board is dealt
- **THEN** note steps come before the step that gives a number its one run,
  and at that step the number fits no other run as the board then shows it

### Requirement: Crossing's menu offers each size at the difficulties it is dealt at

Crossing's presets SHALL offer each of five square sizes from 5×5 to 13×13 at
Easy, and at Unreasonable each of them the Unreasonable bound admits. After
them SHALL come two Easy boards with symmetric walls: a 9×9, and the largest
board there is, 15×15, which symmetric walls make quick to deal.

#### Scenario: The largest size is offered at Easy alone

- **WHEN** Crossing's preset menu is read
- **THEN** its 5×5, 7×7, 9×9 and 11×11 boards each appear as Easy and as
  Unreasonable and its 13×13 board as Easy, followed by a symmetric 9×9 and a
  symmetric 15×15

## REMOVED Requirements

### Requirement: Crossing's menu offers each size at both difficulties

**Reason**: The solver's third deduction finishes five in six of the boards
its first two stop on, so an Unreasonable board is that much rarer and a 13×13
one takes about two seconds to find. The bound on the tier fell from 182
squares to 144, and the menu offers no size past it at that tier.

**Migration**: "Crossing's menu offers each size at the difficulties it is
dealt at" replaces it. An Unreasonable board already dealt at 13×13 still
opens: no bound applies to a board that arrives with its description.
