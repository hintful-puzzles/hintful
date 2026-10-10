# crossing Specification

## Purpose
Crossing (Nansuke), the puzzle of writing a list of numbers into a grid
crossword-fashion, so that each appears exactly once reading across or down.
Entry places whole numbers and follows the one being filled, generation leaves
no cell a clue cannot reach, and the hint explains one deduction at a time.

## Requirements

### Requirement: Crossing's parameters

Parameters SHALL be a width, a height, a symmetric-walls flag and a
difficulty, Easy or Unreasonable. Each dimension SHALL be declared with a
lower bound of 2, and `validateParams` SHALL refuse a board whose width and
height are both below 4. The encoding SHALL carry the width and height, and
one that omits the height SHALL decode as a square board. The
symmetry and the difficulty SHALL appear only in the full encoding, as `S`
and then `de` or `du`, and no difficulty letter SHALL decode as Easy.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded in full and decoded
- **THEN** the same width, height, symmetric-walls flag and difficulty are
  recovered, and a string omitting the height is read as a square board

#### Scenario: A dimension below the minimum is rejected

- **WHEN** parameters are validated with both width and height below 4
- **THEN** `validateParams` refuses them with "Width or height must be at
  least 4."
- **AND** a width or a height below 2 is refused by the field's declared bound

#### Scenario: The difficulty is in the full encoding only

- **WHEN** an Unreasonable 7×4 board with symmetric walls is encoded
- **THEN** the full encoding is `7x4Sdu` and the shared one `7x4`
- **AND** `7x4S`, written before the game had tiers, decodes as Easy

### Requirement: Crossing descriptions use the upstream run-length encoding

A Crossing description SHALL encode the walls in row-major order as alternating
runs, a decimal count for a run of open cells and a letter `a` to `z` for a run
of 1 to 26 wall cells, followed by a comma and the list of clue numbers as
decimal digits separated by commas. The clue numbers SHALL be stored sorted by
length and then lexicographically, the order the description emits.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board and re-encoded
- **THEN** the resulting description is identical

### Requirement: A Crossing description is validated against its board

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

### Requirement: Crossing's solver propagates what the fitting numbers allow

Crossing SHALL provide a solver that determines the unique solution, or reports
that the board is not fully determined or is contradictory. It SHALL propagate
constraints over the grid's maximal horizontal and vertical runs of length at
least 2: for each run it SHALL intersect each open cell's candidate digits with
the digits some still-fitting clue number places there, then confirm any cell
whose candidates collapse to a single digit, iterating to a fixpoint.

#### Scenario: The solver finds the unique solution

- **WHEN** a generated board is solved
- **THEN** the solver fills every open cell so that each clue number appears
  exactly once across the runs, and reports the board valid

### Requirement: Crossing's generator keeps every board uniquely solvable

At Easy the generator SHALL accept a board only when the solver reports it
valid, so that the board has one solution and deduction alone reaches it, and
SHALL retry otherwise. On a generated board no 2×2 block SHALL be fully closed
and the open cells SHALL be connected. Generation from a given seed SHALL be
reproducible, and an Easy board SHALL be the board upstream's generator deals
from the same seed, save where it would leave a cell no clue can reach.

#### Scenario: Every preset produces a uniquely-solvable board

- **WHEN** a new Easy game is generated for any preset or legal size
- **THEN** a board is produced whose walls and number list admit exactly one
  solution reachable by the deductive solver

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed and parameters are used twice to generate a game
- **THEN** both runs produce the identical description

### Requirement: Crossing never generates a cell no clue can reach

Generation SHALL reject a candidate board containing an open cell that belongs
to no run, since no clue number can reach it: it would stay blank on a finished
board, and, the completion check inspecting only runs, would accept any digit
the player put there.

#### Scenario: Every open cell of a generated board lies in a run

- **WHEN** a board is generated for any preset or legal size
- **THEN** every cell that is not a wall belongs to at least one horizontal or
  vertical run

### Requirement: Crossing rejects board sizes it cannot generate

Parameter validation SHALL reject, when validating for generation, any board
whose area is larger than the generable maximum, giving a reason. A board two,
three or four squares on its shorter side SHALL be held to a smaller maximum
of its own, since its long runs give out sooner. The generator's retry cap
SHALL be sized to the rarest board validation admits. Validation SHALL NOT
apply a ceiling when a description is already supplied, so an existing puzzle
of any size remains playable.

#### Scenario: An ungenerable size is refused with a reason

- **WHEN** parameters larger than the generable maximum are validated for
  generation
- **THEN** validation fails with a message naming the maximum

#### Scenario: A thin board is refused where none is dealt

- **WHEN** a 2×41, a 61×3 and a 4×46 board are validated for generation at
  either difficulty
- **THEN** each is refused with a message naming its shorter side and that
  side's maximum area, and a 2×40 board is admitted

#### Scenario: An existing large description still loads

- **WHEN** parameters larger than the generable maximum accompany a supplied
  description
- **THEN** validation succeeds

### Requirement: Crossing is played by selecting a cell and entering a digit

Crossing SHALL be played by selecting an open cell and entering a digit, with a
separate pencil-mark mode for candidate notes. A press on a cell SHALL be the
engine's note-taking cell's: with the sticky pencil preference off, a left
click selects for digit entry and a right click for pencil marking, and with it
on, a left click selects in the current mode and a right click toggles pencil
mode.

#### Scenario: A right click is the way into pencil marks

- **WHEN** an empty open cell is right-clicked while digit entry is the mode
- **THEN** pencil mode is on and the cell is selected for a note

### Requirement: The arrow keys move a cursor and Enter switches the entry mode

The arrow keys SHALL move a keyboard cursor, and Enter SHALL toggle between
digit and pencil entry.

#### Scenario: Enter switches a selected cell to pencil marks

- **WHEN** the keyboard cursor is on an empty open cell in digit entry and
  Enter is pressed
- **THEN** the next digit key toggles a note in that cell and places no digit

### Requirement: A digit key enters, and Backspace, Space or 0 clears

With a cell selected, a digit key `1` to `9` SHALL place that digit, or in
pencil mode toggle that note, and Backspace, Space or `0` SHALL clear. The
on-screen keypad SHALL offer the digits 1 to 9. Walls SHALL NOT be editable,
and a move that changes nothing SHALL produce no history entry.

#### Scenario: The keypad offers the digits

- **WHEN** the game's on-screen keys are requested
- **THEN** the digits 1 to 9 are among them

#### Scenario: A no-op entry makes no move

- **WHEN** the player enters into a cell the digit it already holds, or edits a
  wall cell
- **THEN** no move is made and the history is unchanged

### Requirement: A full run that reads as no clue number is flagged live

Crossing SHALL flag a completed run that matches no clue number with a live
error highlight, independently of `findMistakes`.

#### Scenario: A run filled with an unlisted number is framed at once

- **WHEN** the last empty cell of a run is filled so that the run reads as a
  number the list does not hold
- **THEN** the run carries the error highlight without Check & Save being
  invoked

### Requirement: Crossing's findMistakes compares the board with the unique solution

`findMistakes` SHALL take the board's one answer from the search that counts
its answers, at either difficulty, and flag every placed digit that
contradicts it and every empty cell whose pencil notes have crossed out its
solution digit. It SHALL return nothing when the search did not prove the
board has exactly one answer.

#### Scenario: Entering the wrong digit is caught by Check & Save

- **WHEN** the player places a digit that contradicts the unique solution and
  invokes Check & Save
- **THEN** the cell is flagged as a mistake and the save is refused

### Requirement: Crossing is complete when every clue is placed exactly once

The game SHALL be reported complete when every run matches exactly one clue
number and each clue number is used once, and SHALL flash on that completion.

#### Scenario: Placing every clue exactly once wins

- **WHEN** a move fills the grid so every run matches exactly one clue number and
  each clue number is used once
- **THEN** the game is reported solved and flashes

### Requirement: Crossing advances the selection along the number being filled

Entering a digit SHALL move the selection to the next cell of the run being
filled, also where the cell already held that digit and no move is made. The
behavior SHALL be a preference, enabled by default. The selection SHALL NOT
advance after clearing a cell or after a pencil mark. After the run's last
digit the cursor SHALL stay in the run, and a highlight the pointer placed
SHALL be put away, as after any pointer entry; a keyboard cursor stays shown.

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

### Requirement: The fill direction is remembered and set by three gestures

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

### Requirement: Crossing places whole clue numbers from the list

The clue list SHALL be interactive. Clicking a clue SHALL pick it up, and
clicking a run that can still take it SHALL write the whole clue in as a single
move. With a cell already selected for digit entry, clicking a clue that can go
in a run through it SHALL place it immediately.

#### Scenario: A clue is placed into the selected cell's run

- **WHEN** a cell is selected and a clue that can go in its run is clicked
- **THEN** the whole clue is written into that run as one move

### Requirement: A clue that fits both runs goes to the more written-in one

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

### Requirement: A clue's availability is decided from the player's entries alone

A clue can go in a run when it is the run's length, agrees with every digit
already entered there, and is not already written into another run.
Availability SHALL be decided from the player's own entries alone, and SHALL
NOT take the solution or the satisfiability of crossing runs into account, so
that the aid does not perform the puzzle's deduction.

#### Scenario: A clue used elsewhere is not offered again

- **WHEN** a clue has been written into one run
- **THEN** no other run offers or accepts it

### Requirement: Selecting a cell shows which clues fit its runs

Selecting a cell SHALL mark the runs through it on the board. Selecting it for
digit entry SHALL also indicate which clues can still go in either run, since
clicking one places it there; selecting it for pencil marks SHALL leave the
clues uncolored. Each of the two aids is a preference, on by default. A clue
already written into the grid SHALL remain distinguishable from one that merely
cannot go in the selected run.

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

### Requirement: Pencil marks and the pencil selection stay visible on a marked run

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

### Requirement: Across and down each have one color, on the board and in the list

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

### Requirement: The two direction colors are of equal strength

The two direction colors SHALL be of equal strength, so that neither direction
reads as more important: equal in perceived lightness and colorfulness, not
merely in their color components, and judged on the colors actually rendered.

#### Scenario: Neither direction's color is stronger than the other's

- **WHEN** the colors the renderer emits for the two directions are measured
  perceptually
- **THEN** they have the same lightness and the same colorfulness

### Requirement: The board marking and the list coloring are separate preferences

Marking the runs on the board and coloring the clue list by where each clue
fits SHALL be separately available as preferences, both enabled by default.

#### Scenario: The board marking and the list coloring are independent

- **WHEN** the preference for marking runs on the board is turned off
- **THEN** the board is no longer marked, and the clue list is still colored

### Requirement: A held clue shows every run it could go in

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

### Requirement: Crossing explains its next deduction from the board

Crossing SHALL provide an explained hint that computes a plan of forced moves
from the player's current board and narrates each one by the deduction that
forces it, meeting the project's hint quality bar: the narration SHALL state
why the move is forced, the premise that singles out this conclusion, and not
merely what to enter.

#### Scenario: A run determined by a single remaining number is offered whole

- **WHEN** exactly one unplaced listed number matches a run's length and agrees
  with the digits and notes already in it
- **THEN** the hint offers that number as a single placement filling the whole
  run, and the explanation states that only one number still fits

### Requirement: The hint replays the solver's deduction

The hint SHALL be derived from the same deduction engine as the solver,
replayed one firing at a time.

#### Scenario: Following the hint solves the board

- **WHEN** hints are requested and followed, one plan after another, from a
  generated board with nothing entered
- **THEN** the board reaches the solution the solver finds

### Requirement: The hint names the technique, not the candidate elimination

The solver reports which candidates a run's still-fitting numbers rule out and
carries no name for the technique. The hint SHALL re-derive the named
technique: that only one listed number still fits the run, that every
still-fitting number agrees on a digit in this position, or that the across and
down numbers crossing in a square admit only one digit in common. It SHALL NOT
narrate the bare candidate elimination.

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

### Requirement: A number still fits a run only as the board shows it

A listed number SHALL count as still fitting a run only as the board shows it:
the number is the run's length, is not written into another run, and agrees
with every square of the run, with the square's entered digit, or else with its
pencil notes when it has any. Every step's premise SHALL hold under that
reading of the board it is shown on.

#### Scenario: A note rules a number out of the fitting set

- **WHEN** a square of a run carries pencil notes that leave out the digit a
  listed number would put there
- **THEN** the hint does not count that number among those still fitting the run

### Requirement: A placement the board does not yet support waits for its notes

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

### Requirement: The narration states the elimination that does the work

Where one named technique can be forced by more than one kind of elimination,
the narration SHALL state the one that actually rules the other candidates out,
and SHALL NOT cite entries the board does not carry.

#### Scenario: A placement whose premise lives in the notes says so

- **WHEN** only one listed number fits a run because the notes in its squares rule
  the others out
- **THEN** the explanation states that it is the notes in the run that only one
  number fits

### Requirement: Every Crossing hint step is narrated

Every step of a Crossing hint plan SHALL carry an explanation that names the
run its deduction reasons over.

#### Scenario: Every step of a plan has its deduction

- **WHEN** a plan is computed for a board the solver can finish
- **THEN** every step carries an explanation that names the run its deduction
  reasons over

### Requirement: The hint's evidence includes the listed numbers it reasons over

A hint whose premise is which listed numbers still fit a run SHALL highlight
those numbers in the clue list as well as the run on the grid, so the premise
the narration cites is visible.

#### Scenario: The evidence includes the numbers the deduction reasons over

- **WHEN** a hint is displayed whose premise is which listed numbers still fit a
  run
- **THEN** those numbers are highlighted in the clue list as well as the run
  being highlighted on the grid

### Requirement: One deduction is one hint

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

### Requirement: Each kind of hinted action has its own mark

The four kinds of action Crossing admits, placing a whole number into a run,
entering a single digit, writing notes into a cell, and ruling a candidate out
of a cell's notes, SHALL each be marked in the shape of the action it
represents, so that one hint color cannot stand for two different actions. A
ruled-out candidate SHALL be marked on the candidate itself and not on the
whole cell.

#### Scenario: A ruled-out note is struck where it stands

- **WHEN** a hint rules a digit out of a cell's pencil notes
- **THEN** a line is drawn through that digit among the cell's notes

### Requirement: A displayed hint gives the board back as soon as the player acts

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

### Requirement: A displayed hint owns the board's coloring

While a hint is displayed, the wash that marks the runs through the selected
square SHALL be suppressed, so that a washed square never means two things at
once. A selection on a square the hint marks SHALL still be shown by a cue that
remains legible against the hint's own colors.

#### Scenario: Clicking into the hint keeps it, and shows where the cursor is

- **WHEN** a hint is displayed and the player selects one of the squares it marks, in
  order to enter the answer by hand
- **THEN** the hint remains displayed, and the selected square shows a cursor cue
  that is legible against the hint's highlight

### Requirement: Crossing refuses to hint a board it cannot honestly advise

A hint request SHALL be refused, with a reason, when the board is already
solved, when the player has entered a digit or ruled out a candidate that
contradicts the puzzle's unique solution, or when no further deduction is
available. On the mistake refusal the offending cells SHALL be surfaced through
the mistake overlay. A note set that excludes the solution's digit is such a
mistake, so the hint SHALL NOT reason onward from a position the player's notes
have made unsolvable.

#### Scenario: A note that rules out the right digit is refused rather than reasoned from

- **WHEN** a hint is requested on a board where a cell's pencil notes exclude the
  digit the unique solution places there
- **THEN** the hint refuses and the offending cell is highlighted, rather than a
  plan being computed from the contradicted position

### Requirement: Crossing draws flat squares on a quiet surface

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

### Requirement: The grid lines are the collection's surface grid line

The line between squares and the frame round the grid SHALL be the collection's
surface grid line.

#### Scenario: The frame and the inner lines are one color

- **WHEN** a board is drawn
- **THEN** the outline of every square, on the grid's edge and inside it, is
  drawn in the surface grid line's color

### Requirement: A wash replaces a square's surface, empty or filled

The selected square's wash SHALL replace the surface of an empty square and of
a square holding a digit alike, and a run's direction wash SHALL do the same. A
digit on a run's direction wash SHALL be drawn in the paper color, which reads
on that wash in both schemes where ink does not. The keyboard cursor on a wall
SHALL be corner brackets in a color that stands off the wall in both schemes.

#### Scenario: A filled square in a marked run takes the run's wash

- **WHEN** a cell is selected for digit entry with the board marking on and no
  hint displayed, and another square of one of its runs holds a digit
- **THEN** that square is filled with the run's direction color in place of the
  lifted surface

### Requirement: The completion flash sweeps the squares holding digits

The completion flash SHALL sweep a bright beat and a dim beat across the
squares holding digits.

#### Scenario: A wall takes no part in the flash

- **WHEN** the completion flash runs
- **THEN** the squares holding digits change between the bright beat, the dim
  beat and the lifted surface, and each wall keeps its fill

### Requirement: The number list sits below the grid and shows how often each clue is placed

`redraw` SHALL draw pencil marks in an empty square and a number-list panel
below the grid, with each clue colored by how many times it is placed. A clue
that is used up, or fits nowhere in the selection, SHALL be drawn in the
collection's color for a clue that is used up.

#### Scenario: A clue written into the grid is drawn as used up

- **WHEN** exactly one run on the board reads as a listed number
- **THEN** that number is drawn in the list in the used-up color

### Requirement: Crossing counts a board's answers by a bounded search

The game SHALL count a board's answers up to two by trial and error over the
solver's two deductions, assuming each candidate digit of an empty cell in
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

### Requirement: Crossing's solver says when a cell is left with no digit

The solver SHALL report a position in which an empty cell has no candidate
digit left as contradictory, and not as one it merely cannot finish.

#### Scenario: Two runs that cannot share their cell

- **WHEN** the solver runs on an across run and a down run from one cell
  whose only numbers start with different digits
- **THEN** it reports the board contradictory
- **AND** it reports a board of two separate runs that two numbers fit either
  way as not fully determined

### Requirement: An Unreasonable Crossing board has one answer that the solver does not reach

At Unreasonable the generator SHALL accept a board only when the solver stops
short on it and the search proves it has exactly one answer. Such a board
SHALL keep what an Easy one keeps: no 2×2 block fully closed, the open cells
connected, and no cell that no clue can reach.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 4×2 to 9×9, with
  symmetric walls and without
- **THEN** the solver leaves each unfinished
- **AND** exactly one way of writing the numbers into the runs fits each, by
  a count that has no search in it
- **AND** every open cell of each lies in a run

#### Scenario: The smallest boards carry the tier

- **WHEN** an Unreasonable 4×2, 2×4 or 4×3 board is dealt
- **THEN** it is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Unreasonable is bounded on its own measurements

The bound on the Unreasonable boards that are dealt SHALL be its own, tighter
than the Easy one, since at every shape such a board is found several times
more seldom. A size past it SHALL be refused with a reason naming the
difficulty, and SHALL still be dealt at Easy where the Easy bound admits it.

#### Scenario: A size dealt at Easy is refused at Unreasonable

- **WHEN** a 14×14 board, a 15×15 board with symmetric walls and a 5×40 board
  are checked for dealing at each difficulty
- **THEN** each is admitted at Easy and refused at Unreasonable

#### Scenario: The largest admitted boards are dealt

- **WHEN** an Unreasonable 13×13, 12×15, 4×45 and 2×40 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Crossing's menu offers each size at both difficulties

Crossing's presets SHALL offer each of five square sizes from 5×5 to 13×13 at
both difficulties, and after them two Easy boards with symmetric walls: a 9×9,
and the largest board there is, 15×15, which symmetric walls make quick to
deal.

#### Scenario: Every size is offered at both difficulties

- **WHEN** Crossing's preset menu is read
- **THEN** its 5×5, 7×7, 9×9, 11×11 and 13×13 boards each appear as Easy and
  as Unreasonable, followed by a symmetric 9×9 and a symmetric 15×15

### Requirement: A pasted Crossing board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the solver and the
hint finish it, and as Unreasonable where it has exactly one answer that they
do not reach, whatever lower difficulty its ID states. A board with several
answers SHALL be refused with the collection's sentence that it has more than
one solution, and a board with none with the sentence that its clues
contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the solver does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

#### Scenario: A board with several answers or none is refused

- **WHEN** a 4×3 ID of two separate runs that two numbers fit either way, and
  a 4×2 ID whose two runs cannot share their cell, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Crossing's hint stops where the solver does

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the steps its deductions force from the player's digits and notes and no
others, and where none forces anything it SHALL refuse with the collection's
sentence that deduction has run out. It SHALL go on from the digits the player
then enters, as it does from any position.

#### Scenario: The hint stops, and goes on from a digit tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** a digit entered wrongly there is reported by the mistake check
- **AND** with a digit entered as the solution has it wherever the hint stops,
  the hint finishes the board
