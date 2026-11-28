## MODIFIED Requirements

### Requirement: Params: A Subsets preset is titled by its board and its tier

There SHALL be one preset for each tier, titled `4x4`, the tier's name and
the number of letters the sets are drawn from.

#### Scenario: The Type menu

- **WHEN** the presets are listed
- **THEN** they read "4x4 Easy, 4 letters" and "4x4 Normal, 4 letters", for
  the params `4x4n4de` and `4x4n4dt`

### Requirement: Params: Subsets accepts only the 4×4 board over four letters

Parameters SHALL be a width, a height, a number of letters `n` and a
difficulty tier. Validation SHALL accept only `4×4` with `n = 4`, refusing
any other by the field it breaks.

#### Scenario: Unsupported parameters are rejected

- **WHEN** `6x6n5` and `4x4n3` are validated
- **THEN** they are rejected: "Width must be at most 4." and "Letters must be
  at least 4."

### Requirement: Description: A Subsets set number adds up its letters, and an arrow is written on the bigger set's cell

A given cell's number SHALL be the sum of its set's letters, A as 1, B as 2, C
as 4 and D as 8, so that 0 is the empty set. An arrow letter SHALL be written
on the cell whose set contains its neighbor's, and SHALL name the side that
neighbor is on. A cell's arrow letters SHALL come in the order `U`, `R`, `D`,
`L`, each at most once. `newState` SHALL refuse arrow letters in another
order, and a board giving one set to two cells, which no answer fits.

#### Scenario: A dealt board is read

- **WHEN** `13RD,_,6R,_,_,_,_D,_UL,_R,12D,_,_DL,_UR,_,3U,10` is read
- **THEN** the top-left cell is given the set {A,C,D}, which contains the set
  of the cell to its right and the set of the cell below it
- **AND** the third cell is given {B,C} and the last cell {B,D}

#### Scenario: Letters out of order, and a set given twice

- **WHEN** the `13RD` of that description is changed to `13DR`, or a board
  gives the set 3 to its first two cells
- **THEN** the first is refused as having an `R` where it cannot have one, and
  the second as clues that contradict each other

### Requirement: Controls: Subsets offers a two-way placement reference aid

Subsets SHALL let the player explore where sets and cells can go, judged from
the visible board and never from a solver or the solution: each cell's sets
are those its notes still hold, which the player's letters and rule-outs
narrow and every placed set leaves.

#### Scenario: A rule-out leaves the cell's list

- **WHEN** the player rules a set out of the cell in focus
- **THEN** that set is struck in the tally while the cell is in focus, and no
  longer spotlights the cell

#### Scenario: A placed set leaves every other cell

- **WHEN** a set is placed in a cell
- **THEN** no other cell's notes hold it, and a spotlight of it shows the
  cell holding it alone

### Requirement: Controls: Selecting a set shows where it can go

Selecting a **set** from the tally band, with no cell in focus, SHALL
spotlight every cell whose notes still hold it, and the cell holding it where
it is placed.

#### Scenario: Spotlighting a set's placements

- **WHEN** the player clicks an unplaced set in the tally band
- **THEN** every cell where that set can still go is spotlit, and clicking it
  again clears the spotlight

#### Scenario: A placed set shows where it sits

- **WHEN** the player clicks a set that is already placed
- **THEN** the cell holding it is spotlit, and no other, since every other
  cell's notes have lost it

### Requirement: Controls: Focusing a cell shows the sets it can hold

Focusing a **cell** SHALL strike in the tally every set the cell can no
longer hold. A cell SHALL be focused by its dedicated inspect icon, a
touch-sized badge in the margin above the cell block, or by moving the
keyboard cursor down from it into the tally; the badge SHALL do nothing but
focus, never editing.

#### Scenario: A cell shows the sets it can still hold

- **WHEN** the player taps an undecided cell's inspect icon
- **THEN** every set it can no longer hold is struck in the tally band, and
  nothing about the cell is edited

### Requirement: Look: The tally strikes through what is ruled out of its cell

While a cell is in focus, the tally SHALL draw every set its notes no longer
hold struck through; while a hint step is shown, it SHALL cross out each set
the step rules out.

#### Scenario: A rule-out is struck through while its cell is in focus

- **WHEN** a set is ruled out of the open cell in focus
- **THEN** the set's tally entry is drawn struck through while the cell is in
  focus

## ADDED Requirements

### Requirement: Controls: A set is ruled out of a square from the tally

The game SHALL let the player rule any set out of any open square, as a
strike of the square's notes. With an open square in focus, a press on a
tally entry SHALL rule that set out of the square, or give it back; with no
square in focus, or a placed one, it SHALL spotlight the set. A square left
one set SHALL hold it. A save of the hand-written game's moves is not read.

#### Scenario: A tally press rules a set out of the square in focus

- **WHEN** an open square is in focus and a tally entry is pressed
- **THEN** the move rules that set out of the square, and pressing it again
  gives it back

### Requirement: Hint: The Subsets hint is the candidate walk, worded in letters and sets

`hint` SHALL be the described game's candidate walk over each cell's notes,
each step one cell's strike or placement, said by its technique: a letter a
horseshoe carries in or out, a set ruled out beside a missing horseshoe, a
set with no smaller or bigger partner across one, and a set's only cell. A
strike SHALL be said as letters "present" or "crossed out" where it can,
else as its sets ({A,C}). A board of either tier SHALL be walked to its end.

#### Scenario: A carried letter

- **WHEN** a hint step carries into a horseshoe's open end the letters B and
  C, which every set its closed end can hold has
- **THEN** it says "This square's set holds its neighbor's, whose sets all
  contain {B,C}, so B and C must be present.", and crosses out in the tally
  each set it strikes

#### Scenario: A preset's board walked to its end

- **WHEN** a hint plan is computed from the opening position of each preset's
  first board
- **THEN** the plan solves the board

## REMOVED Requirements

### Requirement: Controls: Subsets players can rule a set out of a cell

**Reason**: Replaced by "Controls: A set is ruled out of a square from the
tally": a rule-out is a strike of the square's notes, which the born game's
move log writes, and the hand-written game's `rule` moves are not read
(the born-game initiative may break saves).

**Migration**: A game in progress saved by the hand-written game starts
again.

### Requirement: Hint: Touching the reference aid dismisses a displayed hint

**Reason**: A born hint keeps or puts away its step by the engine's rules
for every game, which the hand-written game's own dismissal did not follow.

**Migration**: None.

### Requirement: Generation: The higher tier adds the mirror half of the advanced arrow rule

**Reason**: Subsets is born from its description: its Normal tier adds the
`bigger` technique, and every technique is checked sound by the soundness
check.

**Migration**: None.

### Requirement: Generation: Subsets generates uniqueness-gated boards

**Reason**: The born deal's (described-fill-game): every set shuffled into
the cells, every horseshoe read off, and sets hidden while the board stays
at its tier.

**Migration**: None.

### Requirement: Generation: A Subsets candidate the tier below solves is redrawn whole

**Reason**: The born deal's tier test (described-fill-game).

**Migration**: None.

### Requirement: Solver: Subsets solves by candidate elimination

**Reason**: The description's ladder, run by the engine, is the solver.

**Migration**: None.

### Requirement: Solver: The solver takes an explicit difficulty cap

**Reason**: No Subsets solver remains; the engine's ladder runs Solve, the
mistake check and the hint at the top tier for every born game.

**Migration**: None.

### Requirement: Solver: The mirror elimination is sound

**Reason**: Every technique of the description is checked sound by
research/technique-check, recorded in `src/describe/soundness.json`.

**Migration**: None.

### Requirement: Hint: The hint narrates every deduction the solver may use

**Reason**: Replaced by "The Subsets hint is the candidate walk, worded in
letters and sets", which walks every preset's board to its end.

**Migration**: None.

### Requirement: Hint: The hint reaches for the higher rules last

**Reason**: The candidate walk's ladder order, the engine's for every born
game.

**Migration**: None.

### Requirement: Hint: A hint step rests only on what the board shows

**Reason**: The candidate walk reads only the cells' notes and the placed
sets, for every born game.

**Migration**: None.

### Requirement: Hint: A firing's rule-outs are placed before it

**Reason**: The hand-written plan's journeys; the walk strikes a cell's sets
as its own steps.

**Migration**: None.

### Requirement: Hint: The Subsets hint carries a letter across a horseshoe

**Reason**: Replaced by "The Subsets hint is the candidate walk, worded in
letters and sets", whose `carryIn` and `carryOut` say it.

**Migration**: None.

### Requirement: Hint: The Subsets hint walks its ladder from its last step

**Reason**: Replaced by "The Subsets hint is the candidate walk, worded in
letters and sets".

**Migration**: None.
