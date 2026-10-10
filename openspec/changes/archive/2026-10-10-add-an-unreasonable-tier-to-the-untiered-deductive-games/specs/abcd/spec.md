## MODIFIED Requirements

### Requirement: ABCD's parameters

Parameters SHALL be a width, a height, a letter count, a "disallow diagonal
adjacency" flag, a "remove clues" flag, and a difficulty, Easy or
Unreasonable. Validation SHALL refuse a width or a height under 2, and a
letter count over 9, under 3, or under 5 when diagonal adjacency is
disallowed. A game ID SHALL encode the width, height, letter count and the
diagonal flag and round-trip through decode. The "remove clues" flag and the
difficulty are generation-time settings and SHALL appear only in the full
parameter encoding, the flag as `R` and the difficulty after it as `de` or
`du`. A string with no difficulty letter SHALL decode as Easy, so that an ID
written before the game had tiers reads as it did.

A board's label SHALL say its difficulty by the tier's name, and SHALL say
"clues hidden" after the letter count when the "remove clues" flag is set and
nothing when it is not, since the two are independent and a board is offered
at every pairing.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height, letter count and diagonal flag are recovered

#### Scenario: Invalid letter counts are rejected

- **WHEN** parameters request fewer than 3 letters in normal mode, fewer than 5
  letters with diagonal adjacency disallowed, or more than 9 letters
- **THEN** validation rejects them with a message naming the offending bound

#### Scenario: The difficulty is in the full encoding only

- **WHEN** an Unreasonable 5×5 board of five letters, diagonal adjacency
  disallowed and clues removed, is encoded
- **THEN** the full encoding is `5x5n5DRdu` and the shared one `5x5n5D`
- **AND** `5x5n5DR`, written before the game had tiers, decodes as Easy

#### Scenario: The label names the tier and the hidden clues apart

- **WHEN** an Easy 4×4 board of four letters with clues removed is labeled
- **THEN** the label is "4x4 Easy, 4 letters, clues hidden"

### Requirement: ABCD's Solve does not claim a second answer it has not found

The game's `solve` SHALL take a clue set's answer from the search that counts
its answers. It SHALL say the puzzle has more than one solution only where the
search found a second, that it has none only where the search proved that, and
SHALL refuse with `PUZZLE_NOT_REASONABLE` where the search stopped at its
budget, which proves neither. The ladder stopping short is none of these: it
is what the search starts from.

#### Scenario: A game ID the ladder cannot finish

- **WHEN** a hand-built 10×10 ABCD game ID whose clues the ladder stops short
  on is opened, and its clues repeat and so fit many grids
- **THEN** it is refused with `DESC_NOT_UNIQUE`, the search having found a
  second

### Requirement: ABCD's generator accepts only a uniquely solvable fill

The generator SHALL fill the grid with random letters that respect the
no-touch rule, count the resulting clues, and at Easy accept the puzzle only
when the solver reports it uniquely solvable, retrying otherwise. When "remove
clues" is set, it SHALL then hide clues in a randomized order, keeping each
removal only while the puzzle stays uniquely solvable by the solver.
Generation from a given seed SHALL be reproducible, and an Easy board SHALL be
the board upstream's generator deals from the same seed.

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical description

#### Scenario: A board with clues removed still has one solution

- **WHEN** an Easy board is generated with "remove clues" set
- **THEN** the solver reports its description, hidden clues included, uniquely
  solvable

### Requirement: ABCD's menu offers a board under each of its rules

ABCD's presets SHALL offer each of four sizes at both difficulties, and after
them one Easy board for each thing that is neither a size nor a difficulty: a
board with clues hidden, a board with diagonal touching disallowed, and a
board of three letters. The rule against diagonal touching needs five letters,
which no other preset has, so writing the one field onto another preset is
refused and nothing but a preset reaches it from the menu.

#### Scenario: The rule against diagonal touching is on the menu

- **WHEN** ABCD's preset menu is read
- **THEN** it holds a 6x6 board with five letters and diagonal touching
  disallowed, after the boards offered at both difficulties, titled with the
  words the label gives that rule

#### Scenario: The board deals at once and the hint finishes it

- **WHEN** that preset is dealt
- **THEN** the deal is immediate, and following the hint solves the board

#### Scenario: Every size is offered at both difficulties

- **WHEN** ABCD's preset menu is read
- **THEN** its 4x4, 5x5, 6x6 and 7x7 boards of four letters each appear as
  Easy and as Unreasonable

### Requirement: The generator's retry cap is sized to what the bound admits

The Easy generator's retry cap SHALL be sized to what the bound on generable
boards admits, so that exhausting it continues to signal a defect rather than
an ordinary player request. The Unreasonable generator's cap SHALL be counted
in squares filled, so that a small board is given more fills than a large one,
and SHALL leave the rarest size the Unreasonable bound admits many times the
fills it needs. Exhausting it is not a defect: between the sizes proved to
have no Unreasonable board and the ones that deal at once are small sizes
nobody has enumerated at every letter count.

#### Scenario: Exhausting the cap on an admitted board is an error

- **WHEN** the generator spends its whole retry cap on a configuration that
  validation admits for generation
- **THEN** it throws `RetryLimitExceeded` and deals no fallback board, and the player is shown the engine's sentence that no board was found

## ADDED Requirements

### Requirement: ABCD counts a clue set's answers by a bounded search

The game SHALL count a clue set's answers up to two by trial and error over
the solver's ladder, assuming each candidate of an empty cell in turn where
the ladder stops. It SHALL report one answer, several, none, or that it
stopped at its budget, which SHALL be counted in positions tried and never in
time. Solve and the mistake check SHALL take the board's answer from it at
either difficulty.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a board the ladder finishes, on one with one
  answer that it does not reach, on a 3×3 board with every clue hidden, and on
  a board whose top row may hold none of its letters
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given fewer positions than a board needs
- **THEN** it reports that it stopped, and neither one answer nor several

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** the clue set of every 3×3 fill of three letters is searched, whole
  and with each third of its clues hidden, and its grids are counted by
  writing letters in reading order
- **THEN** the search reports one answer exactly where one grid fits

### Requirement: An Unreasonable ABCD board has one answer that the ladder does not reach

At Unreasonable with every clue showing, the generator SHALL accept a fill
only when the ladder stops short on its clues and the search proves they have
exactly one answer. With "remove clues" set it SHALL start from a fill whose
clues have one answer, hide clues in a randomized order while the search still
proves one answer within a budget far under the one a pasted board is allowed,
and keep the board only if the ladder then stops short.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 4×4 to 6×6, with every
  clue showing and with clues removed, with diagonal touching allowed and not
- **THEN** the ladder leaves each unfinished
- **AND** exactly one grid fits each board's clues, by a count that has no
  search in it
- **AND** a board has a hidden clue exactly when "remove clues" was set

### Requirement: ABCD refuses Unreasonable where none of a size's boards needs it

When a board is to be dealt with every clue showing, `validateParams` SHALL
refuse Unreasonable for any grid of nine squares or fewer, as a size with no
such puzzle, and for a grid two squares wide with diagonal touching
disallowed, as one whose such puzzles are too rare to deal. With "remove
clues" set neither refusal applies. A board of a refused size that arrives
with its description SHALL still load.

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

### Requirement: Unreasonable is bounded on its own measurements

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

### Requirement: A pasted ABCD board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the ladder and the
hint finish it, and as Unreasonable where it has exactly one answer that they
do not reach, whatever difficulty its ID states below that. A board with
several answers SHALL be refused with the collection's sentence that it has
more than one solution, and a board with none with the sentence that its clues
contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 4×4 ID whose board has one answer the ladder does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `4x4n4du`

#### Scenario: A board with several answers or none is refused

- **WHEN** a 3×3 ID with every clue hidden, and a 2×2 ID whose top row may
  hold none of its letters, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: ABCD's hint stops where the ladder does

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the steps the three techniques force from the player's marks and no
others, and where none forces anything it SHALL refuse with the collection's
sentence that deduction has run out. It SHALL go on from the letters the
player then enters, as it does from any position.

#### Scenario: The hint stops, and goes on from a letter tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** a letter entered wrongly there is reported by the mistake check
- **AND** with a letter entered as the solution has it wherever the hint
  stops, the hint finishes the board
