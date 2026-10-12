# crossing Specification

## Purpose
Crossing (Nansuke), the puzzle of writing a list of numbers into a grid
crossword-fashion, so that each appears exactly once reading across or down.
Entry places whole numbers and follows the one being filled, generation leaves
no cell a clue cannot reach, and the hint explains one deduction at a time.

## Requirements

### Requirement: Rules: A full run that reads as no clue number is flagged live

Crossing SHALL flag a completed run that matches no clue number with a live
error highlight, independently of `findMistakes`.

#### Scenario: A run filled with an unlisted number is framed at once

- **WHEN** the last empty cell of a run is filled so that the run reads as a
  number the list does not hold
- **THEN** the run carries the error highlight without Check & Save being
  invoked

### Requirement: Rules: Crossing's findMistakes compares the board with the unique solution

`findMistakes` SHALL flag every placed digit that contradicts the board's one
answer and every empty cell whose pencil notes have crossed out its solution
digit.

#### Scenario: Entering the wrong digit is caught by Check & Save

- **WHEN** the player places a digit that contradicts the unique solution and
  invokes Check & Save
- **THEN** the cell is flagged as a mistake and the save is refused

### Requirement: Rules: Crossing is complete when every clue is placed exactly once

The game SHALL be reported complete when every run matches exactly one clue
number and each clue number is used once.

#### Scenario: Placing every clue exactly once wins

- **WHEN** a move fills the grid so every run matches exactly one clue number and
  each clue number is used once
- **THEN** the game is reported solved

### Requirement: Params: A Crossing params string may leave out its height and its difficulty

Crossing's params, a size, a symmetric-walls flag and a difficulty, SHALL be
bounded and encoded as its `paramConfig` and its declared codec give
(`engine-params`, "A game declares its params encoding once, and both codec
halves are derived"), and its menu SHALL be what `presets` builds. A params
string that omits the height SHALL decode as a square board, and one with no
difficulty letter SHALL decode as Easy.

#### Scenario: A string that leaves a field out

- **WHEN** `7x4S`, written before the game had tiers, is decoded
- **THEN** it decodes as Easy
- **AND** a string omitting the height is read as a square board

### Requirement: Params: Crossing refuses a board with no side of 4

`validateParams` SHALL refuse a board whose width and height are both below
4, whether it is to be dealt or comes with its description.

#### Scenario: Both sides below the minimum

- **WHEN** parameters are validated with both width and height below 4
- **THEN** `validateParams` refuses them with "Width or height must be at
  least 4."

### Requirement: Params: Crossing rejects board sizes it cannot generate

Parameter validation SHALL reject, when validating for generation, any board
whose area is larger than the generable maximum, giving a reason. A board two,
three or four squares on its shorter side SHALL be held to a smaller maximum
of its own, since its long runs give out sooner.

#### Scenario: An ungenerable size is refused with a reason

- **WHEN** parameters larger than the generable maximum are validated for
  generation
- **THEN** validation fails with a message naming the maximum

#### Scenario: A thin board is refused where none is dealt

- **WHEN** a 2×41, a 61×3 and a 4×46 board are validated for generation at
  either difficulty
- **THEN** each is refused with a message naming its shorter side and that
  side's maximum area, and a 2×40 board is admitted

### Requirement: Params: Unreasonable is bounded on its own measurements

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

### Requirement: Description: Crossing descriptions use the upstream run-length encoding

A Crossing description SHALL encode the walls in row-major order as alternating
runs, a decimal count for a run of open cells and a letter `a` to `z` for a run
of 1 to 26 wall cells, followed by a comma and the list of clue numbers as
decimal digits separated by commas. The clue numbers SHALL be stored sorted by
length and then lexicographically, the order the description emits.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board and re-encoded
- **THEN** the resulting description is identical

### Requirement: Description: A Crossing description is validated against its board

Reading a description SHALL reject a character its place cannot hold, in the
wall section or in a clue number, whose digits are `1` to `9`. It SHALL reject
wall data that covers more cells than the board holds or fewer, a clue number
shorter than 2 digits or longer than 9, and a duplicate clue number. It SHALL
reject a clue list whose lengths do not match the lengths of the board's runs
one for one.

#### Scenario: A description with an unknown wall character is rejected

- **WHEN** a description whose wall section contains a character outside the
  digit and `a` to `z` runs is validated
- **THEN** it is rejected as containing an invalid character

#### Scenario: A description with a duplicate clue number is rejected

- **WHEN** a description whose clue list repeats a number is validated
- **THEN** it is rejected as containing a duplicate number

#### Scenario: A description cut short is rejected

- **WHEN** a description ends before its wall section has covered the board
- **THEN** it is rejected as too short

### Requirement: Generation: Crossing's generator keeps every board uniquely solvable

At Easy the generator SHALL accept a board only when the solver reports it
valid, so that the board has one solution and deduction alone reaches it, and
SHALL retry otherwise. On a generated board no 2×2 block SHALL be fully closed
and the open cells SHALL be connected. An Easy deal SHALL keep a board that
needs the solver's third deduction, which upstream's generator throws away, so
a seed need not deal the board upstream deals from it.

#### Scenario: A recorded seed deals upstream's board unless an earlier draw is kept

- **WHEN** each seed recorded from upstream whose board has no cell out of a
  clue's reach is dealt
- **THEN** it deals the recorded board, or, for a seed named as dealing an
  earlier draw, another board that the solver finishes

### Requirement: Generation: Crossing never generates a cell no clue can reach

Generation SHALL reject a candidate board containing an open cell that belongs
to no run, since no clue number can reach it: it would stay blank on a finished
board, and, the completion check inspecting only runs, would accept any digit
the player put there.

#### Scenario: Every open cell of a generated board lies in a run

- **WHEN** a board is generated for any preset or legal size
- **THEN** every cell that is not a wall belongs to at least one horizontal or
  vertical run

### Requirement: Generation: An Unreasonable Crossing board keeps the shape an Easy one has

Crossing's Unreasonable boards SHALL be dealt by the engine's deal
(`engine-difficulty`, "The engine deals the Unreasonable board of a game that
searches"), from the candidates an Easy deal draws. Such a board SHALL keep
what an Easy one keeps: no 2×2 block fully closed, the open cells connected,
and no cell that no clue can reach.

#### Scenario: A dealt Unreasonable board leaves no cell out of a run

- **WHEN** `newDesc` produces Unreasonable boards from 4×2 to 9×9, with
  symmetric walls and without
- **THEN** every open cell of each lies in a run

#### Scenario: The smallest boards carry the tier

- **WHEN** an Unreasonable 4×2, 2×4 or 4×3 board is dealt
- **THEN** it is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Generation: A Crossing board is Easy where the solver and the hint both finish it

A board SHALL count as Easy where the solver and the hint finish it, and as
Unreasonable where it has exactly one answer that they do not reach.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the solver does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

### Requirement: Solver: Crossing's solver propagates what the fitting numbers allow

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

### Requirement: Solver: Crossing's search assumes each candidate digit of an empty cell in turn

Crossing's search for a board's answers SHALL run over the solver's
deductions, assuming each candidate digit of an empty cell in turn where they
stop. Its budget SHALL be 2,000 positions, and SHALL NOT be lowered: a board
already dealt, which a saved game holds, loads only within it.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a board the solver finishes, on one with one
  answer that it does not reach, on two four-cell runs that share no cell with
  two numbers to hold, and on an across run and a down run from one cell whose
  numbers start with different digits
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** the walls of dealt boards from 4×3 to 6×6 are given the numbers of
  a fresh random fill, and the same with one number changed, and each board's
  answers are counted by writing whole numbers into its runs
- **THEN** the search reports one answer exactly where one way fits, several
  where more do and none where none does

### Requirement: Solver: Crossing's solver says when a cell is left with no digit

The solver SHALL report a position in which an empty cell has no candidate
digit left as contradictory, and not as one it merely cannot finish.

#### Scenario: Two runs that cannot share their cell

- **WHEN** the solver runs on an across run and a down run from one cell
  whose only numbers start with different digits
- **THEN** it reports the board contradictory
- **AND** it reports a board of two separate runs that two numbers fit either
  way as not fully determined

### Requirement: Controls: Crossing is played by selecting a cell and entering a digit

Crossing SHALL be played by selecting an open cell and entering a digit, with a
separate pencil-mark mode for candidate notes. A press on a cell SHALL be the
engine's note-taking cell's (`engine-notes`, "The note-taking cell is one
shared mechanic"), but for the repeat click that turns the fill direction and
the clicks a held clue takes, which the requirements below state.

#### Scenario: A right click is the way into pencil marks

- **WHEN** an empty open cell is right-clicked while digit entry is the mode
- **THEN** pencil mode is on and the cell is selected for a note

### Requirement: Controls: A digit key enters, and Backspace, Space or 0 clears

With a cell selected, a digit key `1` to `9` SHALL place that digit, or in
pencil mode toggle that note, and Backspace, Space or `0` SHALL clear. Walls
SHALL NOT be editable.

#### Scenario: A no-op entry makes no move

- **WHEN** the player edits a wall cell
- **THEN** no move is made and the history is unchanged

### Requirement: Controls: Crossing advances the selection along the number being filled

Entering a digit SHALL move the selection to the next cell of the run being
filled, also where the cell already held that digit and no move is made. The
behavior SHALL be the `auto-advance` preference, on by default. The selection
SHALL NOT advance after clearing a cell or after a pencil mark. After the
run's last digit the cursor SHALL stay in the run, and a highlight the pointer
placed SHALL be put away, as after any pointer entry; a keyboard cursor stays
shown.

#### Scenario: A number typed over a cell that already holds its digit

- **WHEN** a run's first cell holds a 4 and the player selects it and types 4
  and then 7
- **THEN** the 4 makes no move and the selection steps on, and the 7 goes in
  the second cell

#### Scenario: A whole number is typed after one selection

- **WHEN** a cell at the start of a run is selected and digits are typed
- **THEN** each digit fills the next cell of that run in turn, and the selection
  remains visible throughout

#### Scenario: The selection stops at the end of the run

- **WHEN** the first cell of a run is clicked and every digit of the run is
  typed
- **THEN** the cursor does not leave the run, and after the last digit no cell
  is highlighted, no run is marked and no clue is colored

#### Scenario: Auto-advance switched off

- **WHEN** `auto-advance` is off, a run's first cell is selected with the
  keyboard cursor and `4` and then `7` are typed
- **THEN** the cell holds 7 and the cursor has not moved

### Requirement: Controls: The fill direction is remembered and set by three gestures

The direction the selection advances in SHALL be remembered between entries. It
SHALL be set by the arrow key last used, by selecting a cell that belongs to
only one run, which snaps it to that run, and by clicking an already-selected
cell that belongs to both a horizontal and a vertical run, which toggles it.
Where a repeat click has no direction to toggle, it SHALL deselect the cell.

#### Scenario: Clicking a crossing cell again changes direction

- **WHEN** the already-selected cell lies in both a horizontal and a vertical run
  and is clicked again
- **THEN** the fill direction changes between across and down and the cell stays
  selected

### Requirement: Controls: Crossing places whole clue numbers from the list

The clue list SHALL be interactive. Clicking a clue SHALL pick it up, and
clicking a run that can still take it SHALL write the whole clue in as a single
move. With a cell already selected for digit entry, clicking a clue that can go
in a run through it SHALL place it immediately.

#### Scenario: A clue is placed into the selected cell's run

- **WHEN** a cell is selected and a clue that can go in its run is clicked
- **THEN** the whole clue is written into that run as one move

### Requirement: Controls: A clue that fits both runs goes to the more written-in one

Where both runs through the selected cell can take the clue, it SHALL be placed
in the run whose squares are already the more written-in, and only a tie SHALL
be settled by the current fill direction: a blank run admits every unused clue
of its length and so is no evidence of which run the player meant. The clue
list SHALL be colored by the same rule, so that the color a clue is written in
always names the run a click would send it to.

#### Scenario: A clue completes the partly-written run rather than the blank one

- **WHEN** one run through the selected cell already carries digits the clue
  agrees with, the crossing run is blank, and both could take the clue
- **THEN** the clue is written into the partly-written run, whichever way the
  fill direction happens to be pointing, and the clue list shows it in that
  run's color

### Requirement: Controls: A clue's availability is decided from the player's entries alone

A clue can go in a run when it is the run's length, agrees with every digit
already entered there, and is not already written into another run.
Availability SHALL be decided from the player's own entries alone, and SHALL
NOT take the solution or the satisfiability of crossing runs into account, so
that the aid does not perform the puzzle's deduction.

#### Scenario: A clue used elsewhere is not offered again

- **WHEN** a clue has been written into one run
- **THEN** no other run offers or accepts it

### Requirement: Controls: A held clue is put down by a second click, a click where it cannot go, or an entry

Clicking the held clue again SHALL put it down, and clicking another clue
SHALL act on that one as on any clue. Clicking an open square none of whose runs
can take the held clue SHALL put it down and select the square as any click
does. A digit or a clearing key pressed with a cell selected SHALL put it
down. A clue dropped into a run SHALL leave the clicked square selected. A click on
a wall, a right-click, an arrow and Enter SHALL leave the clue held.

#### Scenario: A click where the clue cannot go

- **WHEN** a three-digit clue is held and a square whose runs are both of
  other lengths is clicked
- **THEN** no clue is held, nothing is written, and that square is selected

#### Scenario: A click on a wall

- **WHEN** 871 is held on `2d2a1a1a5a2a3,16,18,64,88,94,871,893,4687,6633`,
  a `5x5` board whose top row is two open squares and then three walls, and
  the third square of that row is clicked
- **THEN** 871 is still held, and it is still held after a right-click on the
  first square and after an arrow

#### Scenario: A drop leaves the square selected

- **WHEN** a clue is held with no cell selected and a square of a run that can
  take it is clicked
- **THEN** the clue is written into the run and that square is selected

### Requirement: Preferences: The board marking and the list coloring are separate preferences

Marking the runs through the selected cell on the board (`highlight-runs`)
and coloring the clue list by where each clue fits (`fit-highlight`) SHALL be
separately available as preferences, both on by default.

#### Scenario: The board marking and the list coloring are independent

- **WHEN** the preference for marking runs on the board is turned off
- **THEN** the board is no longer marked, and the clue list is still colored

### Requirement: Hint: The hint names the technique, not the candidate elimination

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

#### Scenario: A run determined by a single remaining number is offered whole

- **WHEN** exactly one unplaced listed number matches a run's length and agrees
  with the digits and notes already in it
- **THEN** the hint offers that number as a single placement filling the whole
  run, and the explanation states that only one number still fits

#### Scenario: A number with one run left is offered whole

- **WHEN** a listed number not yet written in still fits exactly one run as the
  board shows it, and that run still fits other numbers
- **THEN** the hint offers that number as a single placement filling the run,
  and the explanation states that it still fits only that run

### Requirement: Hint: A number still fits a run only as the board shows it

A listed number SHALL count as still fitting a run only as the board shows it:
the number is the run's length, is not written into another run, and agrees
with every square of the run, with the square's entered digit, or else with its
pencil notes when it has any. Every step's premise SHALL hold under that
reading of the board it is shown on.

#### Scenario: A note rules a number out of the fitting set

- **WHEN** a square of a run carries pencil notes that leave out the digit a
  listed number would put there
- **THEN** the hint does not count that number among those still fitting the run

### Requirement: Hint: A placement the board does not yet support waits for its notes

Where the solver's propagation reaches a placement that no premise read off the
board yet supports, the hint SHALL NOT assert it. It SHALL instead place, as
note steps ahead of it, the rule-outs the placement rests on: writing into a
square without notes the digits one run's still-fitting numbers leave there, or
striking from a square's notes the digits they leave out. Each such step SHALL
be narrated by the run whose still-fitting numbers decide it.

#### Scenario: A placement the board does not yet support is preceded by the notes it needs

- **WHEN** the solver's propagation forces a placement, but a player checking the
  clue list against the board's digits and notes would still see several numbers
  fitting
- **THEN** the hint first offers note steps, each naming the run whose
  still-fitting numbers leave those digits in that square, and offers the
  placement only once the notes on the board support it

### Requirement: Hint: The narration states the elimination that does the work

Where one named technique can be forced by more than one kind of elimination,
the narration SHALL state the one that actually rules the other candidates out,
and SHALL NOT cite entries the board does not carry.

#### Scenario: A placement whose premise lives in the notes says so

- **WHEN** only one listed number fits a run because the notes in its squares rule
  the others out
- **THEN** the explanation states that it is the notes in the run that only one
  number fits

### Requirement: Hint: Crossing's marks are its legend's, on the clue list as on the grid

Every step's explanation SHALL name the run its deduction reasons over. A
role of `hintMarks` SHALL mark a number in the clue list below the grid as it
marks a square, so a premise about which listed numbers still fit a run is
visible where the numbers are.

#### Scenario: The evidence includes the numbers the deduction reasons over

- **WHEN** a hint is displayed whose premise is which listed numbers still fit a
  run
- **THEN** those numbers are highlighted in the clue list as well as the run
  being highlighted on the grid

### Requirement: Hint: One deduction is one hint

A single deduction that forces several cells SHALL be presented as one hint and
not as one hint per cell, most importantly a whole run determined by the single
remaining number that fits it. Notes that one run's still-fitting numbers
decide in several of its squares are one deduction with different digits per
square, and SHALL be presented as one journey with a sentence per square.

#### Scenario: A run filled by one deduction is a single hint

- **WHEN** a deduction determines every cell of a run at once
- **THEN** one hint is presented covering the whole run, not one hint per cell

#### Scenario: One run's notes in several squares are one journey

- **WHEN** the plan writes notes that one run's still-fitting numbers decide into
  two or more of its squares in a row
- **THEN** the later squares continue the first one's journey, each with its own
  sentence

### Requirement: Hint: Each kind of hinted action has its own mark

The four kinds of action Crossing admits, placing a whole number into a run,
entering a single digit, writing notes into a cell, and ruling a candidate out
of a cell's notes, SHALL each be marked in the shape of the action it
represents, so that one hint color cannot stand for two different actions. A
ruled-out candidate SHALL be marked on the candidate itself and not on the
whole cell.

#### Scenario: A ruled-out note is struck where it stands

- **WHEN** a hint rules a digit out of a cell's pencil notes
- **THEN** a line is drawn through that digit among the cell's notes

### Requirement: Hint: A displayed hint gives the board back as soon as the player acts

A displayed hint SHALL be dismissed, and the board's ordinary coloring
restored, by any interaction that changes the display without making a move:
selecting a square, moving the cursor, switching to pencil marks, or picking a
clue up from the list. The exception is an interaction that leaves the
selection on one of the squares the hint is about, after which the hint SHALL
remain displayed, so that selecting a hinted square to type its number in by
hand does not delete the explanation.

#### Scenario: Clicking away from the hint puts it away

- **WHEN** a hint is displayed and the player selects a square the hint does not mark
- **THEN** the hint is dismissed and the board returns to showing the runs through
  the selected square

### Requirement: Hint: A displayed hint owns the board's coloring

While a hint is displayed, the wash that marks the runs through the selected
square SHALL be suppressed, so that a washed square never means two things at
once. A selection on a square the hint marks SHALL still be shown by a cue that
remains legible against the hint's own colors.

#### Scenario: Clicking into the hint keeps it, and shows where the cursor is

- **WHEN** a hint is displayed and the player selects one of the squares it marks, in
  order to enter the answer by hand
- **THEN** the hint remains displayed, and the selected square shows a cursor cue
  that is legible against the hint's highlight

### Requirement: Hint: Crossing's hint finishes an Unreasonable board from digits tried rightly

On an Unreasonable board the hint's steps SHALL be those its deductions force
from the player's digits and notes, and with a digit entered as the solution
has it wherever the hint stops, the hint SHALL finish the board.

#### Scenario: The hint goes on from a digit tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses, and
  a digit is entered as the solution has it wherever the hint stops
- **THEN** the hint finishes the board

### Requirement: Hint: A number's one run is shown by the squares that rule it out elsewhere

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

### Requirement: Hint: Crossing's hint looks for a whole run first and a note last

Each firing SHALL be the first the board shows of: a run only one listed
number still fits; a number that still fits only one run; a square all of a
run's still-fitting numbers agree on; a square whose across and down numbers
share one digit. Where the board shows none, it SHALL be the earliest note
step that a placement the solver's propagation reaches rests on. Where that
reaches none, it SHALL strike a note no number still fitting one of the
square's runs supports, or the plan ends.

#### Scenario: A whole run before a single square

- **WHEN** the board shows both a run that only one number still fits and, in
  another run, a square every still-fitting number agrees on
- **THEN** the plan's first step writes the number into its run

#### Scenario: A note nothing supports, where deduction has run out

- **WHEN** no placement follows on an Unreasonable board even by propagation,
  and a square's notes hold a digit that no number still fitting its across
  run has in that place
- **THEN** the hint's step strikes that digit from the square's notes

### Requirement: Hint: A Crossing step about both runs through a square stripes both

A step that reasons from the across run and the down run through one square
SHALL stripe both runs, which cross at the ringed square, and SHALL name each
by its direction.

#### Scenario: Two runs crossing at the square

- **WHEN** the numbers still fitting a square's across run and those still
  fitting its down run share exactly one digit there
- **THEN** the step rings the square and stripes both runs
- **AND** its sentence names one as the across run and the other as the down
  run

### Requirement: Look: Selecting a cell shows which clues fit its runs

Selecting a cell SHALL mark the runs through it on the board. Selecting it for
digit entry SHALL also indicate which clues can still go in either run, since
clicking one places it there; selecting it for pencil marks SHALL leave the
clues uncolored. A clue already written into the grid SHALL remain
distinguishable from one that merely cannot go in the selected run.

#### Scenario: Both runs through the selected cell are answered for

- **WHEN** a cell lying in both a horizontal and a vertical run is selected
- **THEN** both runs are marked on the board, each in its direction's color,
  and each clue is written in the color of the run it fits, or dimmed when it
  fits neither

#### Scenario: A clue on the board stays distinguishable from an unavailable one

- **WHEN** one clue has been written into the grid and another simply cannot go
  in the selected run
- **THEN** the two are shown differently

#### Scenario: The same cell selected for pencil marks

- **WHEN** a cell lying in both a horizontal and a vertical run is selected
  while pencil mode is on
- **THEN** the other cells of both runs are marked, each in its direction's
  color, the selected cell carries the pencil selection on its own surface, and
  every clue not yet written into the grid is in the plain ink

### Requirement: Look: Pencil marks and the pencil selection stay visible on a marked run

Pencil marks in a cell of a marked run SHALL remain legible, and a cell
selected for pencil marks SHALL show that selection whether or not it holds a
digit.

#### Scenario: Candidates in a marked run can be read

- **WHEN** a run is marked and one of its empty cells holds pencil marks
- **THEN** those marks are drawn in the ink a placed digit takes on the run's
  color, not in the pencil ink

#### Scenario: A filled cell selected for pencil marks

- **WHEN** a cell holding a digit is selected while pencil mode is on
- **THEN** the cell shows the pencil selection

### Requirement: Look: Across and down each have one color, on the board and in the list

Horizontal and vertical runs SHALL be distinguished by color, and the same two
colors SHALL be used both to mark a run on the board and to write the clues
that fit it, so that the correspondence needs no legend. The color SHALL denote
the run's direction and not whether it is the one being filled, so that
changing the fill direction does not change what any color means.

#### Scenario: Changing the fill direction leaves each run its color

- **WHEN** a cell lying in both runs is selected and the fill direction is
  toggled
- **THEN** the horizontal run is still marked in the across color and the
  vertical run in the down color

### Requirement: Look: The two direction colors are of equal strength

The two direction colors SHALL be of equal strength, so that neither direction
reads as more important: equal in perceived lightness and colorfulness, not
merely in their color components, and judged on the colors actually rendered.

#### Scenario: Neither direction's color is stronger than the other's

- **WHEN** the colors the renderer emits for the two directions are measured
  perceptually
- **THEN** they have the same lightness and the same colorfulness

### Requirement: Look: A held clue shows every run it could go in

A held clue SHALL be previewed by indicating every run that can still take it.
The preview SHALL distinguish what it knows from what it is guessing: the
clue's digits SHALL be shown in place only when exactly one such run remains. A
clue already written into the board SHALL indicate the run it occupies.

#### Scenario: A picked-up clue shows every run it could go in

- **WHEN** a clue is clicked with no cell selected
- **THEN** it is shown as held, and every run that could still take it is
  indicated, without its digits being written into any of them

#### Scenario: A clue with one remaining run is previewed in place

- **WHEN** only one run can still take the held clue
- **THEN** its digits are previewed in that run's empty cells

#### Scenario: A clue already on the board shows where it is

- **WHEN** a clue that has been written into a run is clicked
- **THEN** the run it occupies is indicated

### Requirement: Look: Crossing draws flat squares on a quiet surface

`redraw` SHALL draw the board without a bevel: nothing on it is a thing the
player moves. An empty square SHALL be the collection's cell surface, a square
holding a digit SHALL be the collection's lifted surface with the digit in ink,
so "placed" is told by the square under the digit, and a wall SHALL be one
flat, strong fill that is told from both surfaces in both schemes.

#### Scenario: Nothing on the board is beveled

- **WHEN** a board holding walls and digits is drawn
- **THEN** each wall is one flat fill and each square holding a digit is one
  flat fill of the lifted surface
- **AND** no filled polygon is drawn

#### Scenario: Placed is told by the square under the digit

- **WHEN** a digit is entered into an empty square
- **THEN** the square changes from the cell surface to the lifted surface

### Requirement: Look: A wash replaces a square's surface, empty or filled

A run's direction wash SHALL replace the surface of an empty square and of a
square holding a digit alike. A digit on it SHALL be drawn in the paper color,
which reads on that wash in both schemes where ink does not. The keyboard
cursor on a wall SHALL be corner brackets in a color that stands off the wall
in both schemes.

#### Scenario: A filled square in a marked run takes the run's wash

- **WHEN** a cell is selected for digit entry with the board marking on and no
  hint displayed, and another square of one of its runs holds a digit
- **THEN** that square is filled with the run's direction color in place of the
  lifted surface

### Requirement: Look: The completion flash lights the squares holding digits and never a wall

The elements the completion flash lights SHALL be the squares holding digits,
each at the position of its place in the grid (`ts-engine`, "A game gives
each element a position, and the route is which position it gives"). A wall
SHALL never be lit. The selection SHALL be hidden while the flash runs.

#### Scenario: A wall takes no part in the flash

- **WHEN** the completion flash runs
- **THEN** each square holding a digit is filled with the flash colors for one
  stretch of frames and is on the lifted surface otherwise, and each wall keeps
  its fill

### Requirement: Look: The number list sits below the grid and shows how often each clue is placed

`redraw` SHALL draw pencil marks in an empty square and a number-list panel
below the grid, with each clue colored by how many times it is placed. A clue
that is used up, or fits nowhere in the selection, SHALL be drawn in the
collection's color for a clue that is used up.

#### Scenario: A clue written into the grid is drawn as used up

- **WHEN** exactly one run on the board reads as a listed number
- **THEN** that number is drawn in the list in the used-up color
