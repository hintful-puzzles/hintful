# abcd Specification

## Purpose
ABCD, the puzzle of writing a letter in every cell so that no two identical
letters touch horizontally or vertically and each edge number counts one letter
in its row or column, with a solver-gated generator, a refusal of the board
sizes that generator cannot produce, and an explained hint.

## Requirements

### Requirement: Rules: ABCD is solved when the grid is full and every rule holds

The game SHALL be reported solved when every cell is filled, every clue is
satisfied, and no two identical letters are adjacent under the active adjacency
rule.

#### Scenario: Completing the grid correctly wins

- **WHEN** the final cell is filled so that every clue is met and no identical
  letters are adjacent
- **THEN** the game is reported solved

### Requirement: Rules: ABCD checks letters and notes against the one answer its clues fix

ABCD's `findMistakes` SHALL report what the collection's check reports of
entries and of notes (`ts-engine`, "A mistake check compares with the one
answer, hidden or not" and "A candidate note that excludes the answer is a
mistake"), against the one answer the search proves from the clues
(`engine-difficulty`, "One search answers a board for everything that asks").

#### Scenario: A mark that has crossed out the answer is a mistake

- **WHEN** the mistake check runs on an empty cell whose pencil marks leave out the
  letter the unique solution puts there
- **THEN** that cell is reported as a mistake

### Requirement: Params: ABCD needs five letters where diagonal touching is disallowed

`validateParams` SHALL refuse a letter count under 5 when diagonal touching
is disallowed.

#### Scenario: Four letters and no diagonal touching

- **WHEN** parameters request four letters with diagonal touching disallowed
- **THEN** validation rejects them with "Letters must be at least 5 when
  diagonal touching is not allowed."

### Requirement: Params: An ABCD params string is its declared codec's, and one with no difficulty letter is Easy

ABCD's params (a width, a height, a letter count, whether diagonal touching
is disallowed, whether clues are removed, and a difficulty), their bounds and
their encoding SHALL be those its `paramConfig` and its declared codec give
(`engine-params`, "A game declares its params encoding once, and both codec
halves are derived"), with no departure from the codec grammar. A string with
no difficulty letter SHALL decode as Easy.

#### Scenario: The difficulty is in the full encoding only

- **WHEN** an Unreasonable 5×5 board of five letters, diagonal adjacency
  disallowed and clues removed, is encoded
- **THEN** the full encoding is `5x5n5DRdu` and the shared one `5x5n5D`
- **AND** `5x5n5DR`, written before the game had tiers, decodes as Easy

#### Scenario: The preset that disallows diagonal touching

- **WHEN** `6x6n5Dde` is decoded
- **THEN** it is a 6×6 Easy board of five letters with diagonal touching
  disallowed and every clue showing
- **AND** its shared encoding is `6x6n5D`

### Requirement: Params: ABCD refuses board sizes it cannot generate

Parameter validation SHALL reject, when validating for generation at Easy,
any combination of grid size and letter count whose measured
generation-success rate is too low to produce a board in an acceptable time,
giving a reason, rather than retrying until an attempt budget is exhausted.

#### Scenario: An un-generable configuration is refused immediately

- **WHEN** a configuration below the measured rate is entered in the Custom
  dialog
- **THEN** it is refused with a reason, without the generator being run

### Requirement: Params: The bound is measured across size, shape and letter count

The bound on generable boards SHALL be derived from measurement across grid
size, grid shape and letter count, since none of them alone determines the
rate: two boards of equal area, or of equal clue-to-cell ratio, can differ
widely in acceptance rate. Diagonal mode SHALL be bounded separately, being
markedly more generable rather than less.

#### Scenario: A board of the same area as a refused one is still offered

- **WHEN** a long thin board is entered whose area equals that of a refused
  squarer board
- **THEN** it is accepted, because its generation rate is measured to be high

#### Scenario: Diagonal mode is bounded on its own measurements

- **WHEN** a board is entered that is un-generable with diagonal touching
  allowed but generable without it
- **THEN** it is refused in the first mode and accepted in the second

### Requirement: Params: ABCD's bound is asserted in both directions

The bound on generable boards SHALL be asserted in both directions: that it
admits configurations measured generable as well as refusing those measured
un-generable.

#### Scenario: A tightened bound cannot bar a generable board

- **WHEN** a configuration measured generable is validated for generation
- **THEN** it is accepted, so a bound drawn tighter than the measurements
  fails as one drawn looser does

### Requirement: Params: ABCD's board without diagonal touching is a preset of its own

The rule against diagonal touching needs five letters, which no other preset
has, so writing the one field onto another preset is refused and nothing but
a preset SHALL reach it from the menu.

#### Scenario: The rule against diagonal touching is on the menu

- **WHEN** ABCD's preset menu is read
- **THEN** it holds a 6x6 board with five letters and diagonal touching
  disallowed, after the boards offered at both difficulties, titled with the
  words the label gives that rule

#### Scenario: The board deals at once and the hint finishes it

- **WHEN** that preset is dealt
- **THEN** the deal is immediate, and following the hint solves the board

### Requirement: Params: ABCD refuses Unreasonable where none of a size's boards needs it

When a board is to be dealt with every clue showing, `validateParams` SHALL
refuse Unreasonable for any grid of nine squares or fewer, as a size with no
such puzzle, and for a grid two squares wide with diagonal touching
disallowed, as one whose such puzzles are too rare to deal. With "remove
clues" set neither refusal applies.

#### Scenario: A 3x3 Unreasonable board with every clue showing is not dealt

- **WHEN** the params of an Unreasonable 3×3, 2×4 or 2×2 board with every clue
  showing are checked for dealing
- **THEN** each is refused
- **AND** the same params are accepted for a board that arrives with its
  description

#### Scenario: No fill of a refused size needs search

- **WHEN** every fill of three and of four letters of every grid of up to nine
  squares is given to the ladder
- **THEN** wherever the ladder stops short, a second grid fits the same clues

#### Scenario: Hidden clues give the smallest boards the tier

- **WHEN** an Unreasonable 3×3 or 2×2 board is dealt with "remove clues" set
- **THEN** it is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Params: Unreasonable is bounded on its own measurements

The bound on the Unreasonable boards that are dealt SHALL be its own, measured
per letter count and adjacency rule as the Easy bound is, since what limits it
is the cost of the search and not how often the ladder finishes a fill. It
SHALL apply to thin boards as to square ones. A size past it SHALL be refused
with a reason naming the difficulty, and SHALL still be dealt at Easy where
the Easy bound admits it.

#### Scenario: A size dealt at Easy is refused at Unreasonable

- **WHEN** an 8×9 board of four letters is checked for dealing at each
  difficulty
- **THEN** it is admitted at Easy and refused at Unreasonable

#### Scenario: The largest admitted board of each kind is dealt

- **WHEN** the largest Unreasonable board the bound admits is dealt for three
  letters, for four, for eight, and with diagonal touching disallowed
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Description: ABCD descriptions use the edge-clue encoding

An ABCD description SHALL encode the puzzle as a comma-terminated list of
`(width + height) × letters` clue numbers: the row clues followed by the column
clues, each row's or column's clues in letter order, with a bare `-` standing
for a hidden clue. Encoding and decoding SHALL be exact inverses.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a state
- **THEN** re-encoding that state's clue numbers yields the identical description

### Requirement: Description: An ABCD description is validated against its clue count and its lines

Validation SHALL reject a description whose clue count is not exactly
`(width + height) × letters`, distinguishing too few clues from too many. It
SHALL reject one whose row clue exceeds `1 + width / 2` or whose column clue
exceeds `1 + height / 2`, the half rounded down, and one that contains an
unrecognized character.

#### Scenario: A description with the wrong number of clues is rejected

- **WHEN** a description carrying more or fewer clue entries than
  `(width + height) × letters` is validated
- **THEN** it is rejected with a message distinguishing too few from too many

### Requirement: Generation: ABCD's generator accepts only a uniquely solvable fill

The generator SHALL fill the grid with random letters that respect the no-touch
rule, count the resulting clues, and at Easy accept the puzzle only when the
solver reports it uniquely solvable, retrying otherwise. When "remove clues" is
set, it SHALL then hide clues in a randomized order, keeping each removal only
while the solver still solves the puzzle. An Easy board SHALL be the board
upstream's generator deals from the same seed.

#### Scenario: A board with clues removed still has one solution

- **WHEN** an Easy board is generated with "remove clues" set
- **THEN** the solver reports its description, hidden clues included, uniquely
  solvable

### Requirement: Generation: An Unreasonable ABCD board has one answer that the ladder does not reach

ABCD's Unreasonable boards SHALL be dealt by the engine's deal
(`engine-difficulty`, "The engine deals the Unreasonable board of a game that
searches"), a candidate being the clues of a random fill. With "remove clues"
set, ABCD's strip SHALL hide clues in a randomized order, each only while the
search still proves one answer.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 4×4 to 6×6, with every
  clue showing and with clues removed, with diagonal touching allowed and not
- **THEN** the ladder leaves each unfinished
- **AND** exactly one grid fits each board's clues, by a count that has no
  search in it
- **AND** a board has a hidden clue exactly when "remove clues" was set

### Requirement: Generation: An ABCD board is Easy where the ladder and the hint both finish it

A board SHALL count as Easy where the ladder and the hint finish it, and as
Unreasonable where it has exactly one answer that they do not reach.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 4×4 ID whose board has one answer the ladder does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `4x4n4du`

### Requirement: Solver: ABCD's solver classifies a clue set by deduction alone

ABCD's solver SHALL report a clue set uniquely solvable, ambiguous or
contradictory. It SHALL apply, to a fixpoint and without backtracking, three
techniques: satisfied clue, striking a letter from a line whose count is met;
single possibility, placing a cell's one remaining candidate; and runs,
forcing letters when the most a line can still take equals the count it needs.
The boards of its firing census SHALL be ones generated at every preset on the
menu, and every technique SHALL fire on them.

#### Scenario: The solver classifies a puzzle

- **WHEN** the solver is run on a clue set
- **THEN** it reports uniquely solvable, ambiguous, or contradictory, and for a
  uniquely solvable set it yields the solution grid

#### Scenario: A preset is added to the menu

- **WHEN** a preset is added to ABCD's preset list
- **THEN** the census walks boards generated at it with no edit to the census

### Requirement: Solver: ABCD counts a clue set's answers by a bounded search

ABCD's search SHALL be the engine's (`engine-difficulty`, "The engine counts
a searching game's answers up to two, within a budget of positions") over the
solver's ladder, assuming each candidate of an empty cell in turn where the
ladder stops. Its budget SHALL be 2,000 positions, and SHALL NOT be lowered:
a board already dealt, which a saved game holds, loads only within it.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a board the ladder finishes, on one with one
  answer that it does not reach, on a 3×3 board with every clue hidden, and on
  a board whose top row may hold none of its letters
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** the clue set of every 3×3 fill of three letters is searched, whole
  and with each third of its clues hidden, and its grids are counted by
  writing letters in reading order
- **THEN** the search reports one answer exactly where one grid fits

### Requirement: Controls: ABCD enters a letter into the selected cell

ABCD SHALL be played on the collection's note-taking cell (`engine-notes`,
"The note-taking cell is one shared mechanic"): a click or the arrow keys
select a cell, and a key enters a letter there or, in pencil mode, a mark.
Entering a letter SHALL accept the letter keys and the bare digit keys `1` to
`9` up to the letter count. Clearing SHALL accept Backspace, Space, and `0`.

#### Scenario: Entering a letter fills the selected cell

- **WHEN** a cell is selected and a letter key (or its digit) within the letter
  count is pressed
- **THEN** that letter is placed in the cell

### Requirement: Controls: ABCD's obvious marks are a touching letter and a letter its line has in full

The obvious candidates ABCD's fill-all-marks command strikes SHALL be each mark
whose letter a touching cell already holds (diagonally too when that is
disallowed), and each mark whose letter its row or column already holds its
clue's count of.

#### Scenario: A row that has all of its letter

- **WHEN** every empty cell carries marks, a row's clue for `A` is 1, one cell
  of that row holds `A`, and the command is used
- **THEN** the `A` mark is struck from every other cell of that row that carries
  another mark

### Requirement: Controls: Clearing an ABCD cell that holds only marks is a move

Clearing an empty cell that carries marks SHALL be a real move, because it
wipes them.

#### Scenario: Clearing a cell that holds only marks is a real move

- **WHEN** an empty cell carrying pencil marks is cleared
- **THEN** a move is produced, and undoing it restores the marks

### Requirement: Controls: ABCD's keypad offers the board's letters and Clear

`requestKeys` SHALL offer one key for each of the board's letters, labeled
with the letter and in order from `A`, and then the Clear key.

#### Scenario: A board of five letters

- **WHEN** the keypad of a board of five letters is read
- **THEN** its keys are `A`, `B`, `C`, `D`, `E` and Clear, in that order

### Requirement: Hint: ABCD offers an explained hint

ABCD SHALL declare a `hint` built on the shared candidate-elimination plan
walk, reasoning from the player's pencil marks and placed letters, with the
no-touch rule as the walk's reach: a letter rules itself out of its orthogonal
neighbors, and of its diagonal ones when diagonal touching is disallowed.
Besides the walk's own steps, its rungs SHALL be one line's firing of the
solver's satisfied-clue and runs techniques.

#### Scenario: A letter placed where diagonal touching is disallowed

- **WHEN** the hint places a letter on a board that disallows diagonal
  touching, in a cell away from the grid's edge
- **THEN** the cull after it strikes that letter from the marks of the eight
  cells round it that still show it

### Requirement: Hint: The satisfied-clue rung strikes a letter from a line that has its count

For a row or column that already holds its count of a letter, or whose count is
0, the hint's satisfied-clue rung SHALL strike that letter from the line's
other cells' marks, naming the line, hatching it and drawing the count it reads
in the hint color.

#### Scenario: A row that holds its one A

- **WHEN** the hint shows a satisfied-clue step for a row whose clue for A is 1
  and that holds an A
- **THEN** it strikes A from the marks of the row's other cells that still
  show it, names and hatches the row, and draws the clue's 1 in the hint color

### Requirement: Hint: The runs rung places the letters a line's open cells force

For a row or column whose cells that can still take a letter fit, with no two
touching, exactly as many as the line still needs, the hint's runs rung SHALL
place every letter that forces, as one journey, outlining those cells where
there are several, hatching the line and drawing its count in the hint color. The arithmetic SHALL be the
solver's own, so the hint and the solver cannot disagree about a line.

#### Scenario: A runs step names the line and the count

- **WHEN** the hint shows the first step of a runs journey on a line with more
  open cells than letters to place
- **THEN** its sentence says how many of the letter the line needs and that the
  outlined cells fit only that many apart, the line is hatched through its clue slots,
  its count for that letter is drawn in the hint color, and the cell to fill is ringed

#### Scenario: The runs claim holds for every line shape

- **WHEN** the runs arithmetic forces positions in a line
- **THEN** every way of placing that many letters in the line's open cells with no
  two touching puts a letter on each forced position

### Requirement: Hint: The runs rung is the hint's last resort

The hint's runs rung SHALL be offered only when no other rung has a firing, as
the solver tries the runs technique only when the cheaper techniques are spent.

#### Scenario: A satisfied clue is spoken before a run

- **WHEN** a board has both a line whose count is met with marks left to strike
  and a line the runs arithmetic forces
- **THEN** the hint's next step is not a runs step

### Requirement: Hint: ABCD's hint stops where the ladder does

On an Unreasonable board as on any other, the steps of ABCD's hint SHALL be
those the three techniques force from the player's marks.

#### Scenario: The hint stops, and goes on from a letter tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** with a letter entered as the solution has it wherever the hint
  stops, the hint finishes the board

### Requirement: Hint: ABCD's hint reads a line only once the notes are set up

The hint's satisfied-clue and runs rungs SHALL fire only once the notes are
set up: after the fill-all and its clean where the `hint-notes` preference
is "Every candidate first", and after the clean where it is "Only as needed".
Until then the hint SHALL offer only the walk's own singles.

#### Scenario: A row that may hold no A, on a board just dealt

- **WHEN** a hint is asked on `0,2,1,1,1,0,1,2,1,1,1,1,0,2,1,1,1,1,0,2,0,1,1,2,1,1,2,0,0,2,1,1,`,
  a 4×4 board of four letters whose top and bottom rows' numbers for A are
  0, under "Every candidate first"
- **THEN** the first step pencils every letter into each empty cell, and
  only the step after it crosses A out of a row that may hold none

### Requirement: Look: What ABCD draws

Rendering SHALL draw the letter grid with edge clues and corner letters, and
SHALL show pencil marks in empty cells and the cursor highlight. It SHALL
color red a clue its line exceeds or can no longer reach, and a letter with
an identical letter adjacent: orthogonally, and diagonally when that is
disallowed.

#### Scenario: A clue its line can still reach is not red

- **WHEN** a row holds fewer of a letter than its clue asks and has empty cells
  enough to make up the difference
- **THEN** the clue is drawn in the ordinary clue color
- **AND** it turns red once the row's empty cells are too few

### Requirement: Look: ABCD draws its letters on a quiet surface

`redraw` SHALL draw every cell of the letter grid on the collection's cell
surface, with the collection's surface grid line between cells and as the frame
round the grid. No cell SHALL take the lifted surface of a given, since the
grid holds no given letters, and the clues SHALL stay on the board, outside the
surface. The corner marks that show diagonal touching is disallowed are a rule
and SHALL keep their own color.

#### Scenario: The grid recedes

- **WHEN** a board is drawn
- **THEN** every cell of the letter grid is the cell surface
- **AND** every cell's border is the surface grid line
