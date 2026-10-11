## ADDED Requirements

### Requirement: L numbers the colors

`L` or `l` SHALL switch the color numbers on and off: with them on, every peg
on the board, the revealed answer's included, and every block of the answer
row carries the digit of its color's key, the tenth color `0`. The key SHALL
act after the game is over as well as during it. The setting is not a
preference and SHALL NOT be carried in a save: a board opens with the numbers
off.

#### Scenario: The numbers after a loss

- **WHEN** the rows are exhausted, the answer is revealed and `L` is pressed
- **THEN** the pegs of every row and of the revealed answer show their digits,
  and no move is made

### Requirement: Guess's status bar counts the guesses and says how the game ended

While the game is in play the status bar SHALL read `Guess N of M`, N being
the row being composed and M the rows allowed, followed by `: ready to
submit.` when the working row can be submitted. A won game's own words SHALL
be `Solved in N guesses.`, or `Solved in 1 guess.`, which follow the engine's
completion words, and a lost game SHALL read `Out of guesses: the answer is
revealed.`

#### Scenario: A fresh Standard board

- **WHEN** a board is opened under `c6p4g10Bm`
- **THEN** the status bar reads `Guess 1 of 10`

#### Scenario: The answer is the third row

- **WHEN** two wrong rows and then the answer are submitted
- **THEN** the status bar reads `COMPLETED! Solved in 3 guesses.`

#### Scenario: Solve on a fresh board

- **WHEN** Solve plays the answer as the first row
- **THEN** the status bar reads `Auto-solved. Solved in 1 guess.`

#### Scenario: The rows run out

- **WHEN** the last row allowed is submitted and is not the answer
- **THEN** the status bar reads `Out of guesses: the answer is revealed.`,
  with no word of the engine's before it

### Requirement: Standard and Super are Guess's two named boards

The preset titled Standard SHALL be six colors, four pegs and ten guesses,
with no blanks and with repeats allowed, and the preset titled Super eight
colors, five pegs and twelve guesses on the same terms. Any other board SHALL
be titled by its params.

#### Scenario: The two names

- **WHEN** the presets are listed
- **THEN** `c6p4g10Bm` is titled `Standard` and `c8p5g12Bm` is titled `Super`
- **AND** `c6p4g10BM`, Standard without repeats, is titled `4x10, 6 colors, no
  duplicates`

### Requirement: Three readings come from one scored row alone

The hint SHALL rule every color of a row that scored nothing out of every
slot, saying none of its colors can be in the answer. It SHALL rule each
color of a row that scored no black pegs out of the slot it was guessed in,
saying none can be where it was guessed. It SHALL rule every color a row does
not hold out of every slot when every peg of the row scored, saying the
answer can only use its colors. Each SHALL stripe the row and frame the
colors it rules out.

#### Scenario: A row that scored nothing

- **WHEN** the only scored row is `1, 1, 2, 2` with no black and no white pegs
- **THEN** the first step rules colors 1 and 2 out of all four answer slots,
  and says the striped row scored nothing

### Requirement: A score the settled slots account for rules out the rest

A slot is settled when the rows prove it can hold one color only. Where the
slots settled on a row's own pegs number as many as its black pegs, the hint
SHALL rule the row's other pegs out of the slots they were guessed in. Where
settled slots account for a row's whole score, it SHALL rule each color the
row holds more of than they do out of every slot not settled on it. Each
SHALL stripe the row and outline the settled slots.

#### Scenario: A settled slot holds the row's one black

- **WHEN** a row scored one black peg and a slot is already settled on the
  color that row guessed there
- **THEN** a step says the outlined slot accounts for the striped row's black
  peg, so its other pegs are misplaced

### Requirement: A settled color is out of the other slots, and forced blacks settle theirs

Where repeats are off, the hint SHALL rule a settled slot's color out of
every other slot, outlining the slot and reading no row. Where a row has
exactly as many pegs still possible in the slots they were guessed in as it
scored black, the hint SHALL settle each of those slots on its peg's color,
outlining them and striping the row.

#### Scenario: One black and one peg that can still be right

- **WHEN** a row scored one black peg, and what the rows already prove leaves
  only one of its pegs possible in the slot it was guessed in
- **THEN** a step says the striped row's 1 black can only be in the outlined
  slot, so that peg is right, and rules the slot's other remaining colors out
  of it

#### Scenario: The player's own marks are not leaned on

- **WHEN** the player has ruled colors out of the answer row that the scored
  rows do not prove are out
- **THEN** no reading counts a slot as settled because of them

### Requirement: Guess's readings are tried in one order

The hint SHALL take, until none applies, the first reading in this order: a
row that scored nothing, a row with no black pegs, a row whose every peg
scored; then a settled color under no repeats; then blacks that can only be
in certain slots, blacks already accounted for, and a whole score already
accounted for. Within a reading it SHALL read the rows oldest first. Only
when no reading applies SHALL it choose the guess.

#### Scenario: Two rows, each with a reading

- **WHEN** the first scored row has no black pegs and the second scored
  nothing at all
- **THEN** the first step reads the second row, since a row that scored
  nothing is read before a row with no black pegs

### Requirement: The suggested guess is said in one of four ways

When one answer fits the scores, the step SHALL say so and give it as forced.
With no row scored it SHALL say so and the most the guess can leave; with
repeats on, that guess is two pegs of each color in turn from four pegs up,
one of each below. Otherwise it SHALL say how many answers fit, that the
framed colors are one, and the most the guess can leave. Answers too many to
count, even on the first row, SHALL get the first guess that fits, offered
only as one of those that can win.

#### Scenario: The opening of a Standard board

- **WHEN** a hint is asked on a fresh board under `c6p4g10Bm`
- **THEN** its one step is the guess `1, 1, 2, 2`, and it reads `Nothing is
  scored yet. Guess the framed colors: whatever they score, at most 256 of the
  1296 answers will be left.`

#### Scenario: A fresh board with too many answers to count

- **WHEN** a hint is asked on a fresh board of ten colors and five pegs with
  repeats allowed
- **THEN** its one step is the guess `1, 1, 1, 1, 1`, and it reads `Only
  guesses that fit every score so far can win. One of them: guess the framed
  colors.`
