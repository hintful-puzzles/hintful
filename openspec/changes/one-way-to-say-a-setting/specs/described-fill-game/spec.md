## ADDED Requirements

### Requirement: A setting the params give is stated one way

A description SHALL state every setting its params give (a flag, a number or a choice, with its letter, its Custom field and what it gates) through one settings concept, and the description language SHALL NOT offer a second key for a setting of the same kind.

#### Scenario: A variation and a deal option

- **WHEN** one description has a modifier that adds a rule and an option that changes only the deal
- **THEN** both are stated as settings, differing in what they gate

### Requirement: A game ID is read and written by one codec

The params and description of a born game SHALL be encoded and decoded by one codec whose segment kinds are named for what they encode, and a byte layout upstream's IDs need SHALL be a property of a segment kind, never a segment kind of its own.

#### Scenario: An upstream ID with a quirk

- **WHEN** an upstream game ID with a layout only one game uses is loaded
- **THEN** it reads through a segment kind other games also use, with the quirk stated as that kind's property

## MODIFIED Requirements

### Requirement: A born game's run code may write a clue after a letter

A run-letter stream's code MAY name a kind whose digit follows it, written
straight after the code for a clue of that kind on its cell, absent where
it has none, and the reading SHALL refuse a digit past the kind's largest.

#### Scenario: Sticks' numbered block

- **WHEN** `4x1:B2_1_3a` is read
- **THEN** the first square is a block numbered 2, and the next two hold the
  numbers 1 and 3

### Requirement: A born game's run code may write another kind as a number

A run-letter stream's code MAY be a number, past the segment's own kind's
largest, that SHALL be read as a clue of another kind at its cell, and
written for one there.

#### Scenario: Bricks' 7

- **WHEN** `4x4:2b1c7c2_2b1` is read
- **THEN** the cell the 7 stands on is a hole, clear and fixed, and holds no
  number

### Requirement: A born game's ID may close and hide numbers and name values by letters

`numbers` SHALL write `hidden`'s character for a clue not shown and, where
`closed`, a comma after each. A run-letter stream SHALL write a cell kind's
values by codes, runs of empty cells `a` to `z` between them, and with
`lastRun: false` the last run dropped but for its whole runs of 26.

#### Scenario: An upstream Boats ID

- **WHEN** `6x6f3deS,3,2,1:2,2,1,1,0,4,1,-,3,1,-,1,WaWWgTLqWaW` is opened
- **THEN** its desc is written back the same

### Requirement: A born game may hide several kinds of clue

`deal.hide` MAY name several kinds, whose clues SHALL be hidden in one random
order across them, each kept hidden while the ladder finishes the board.
`deal.hide` SHALL be one kind, a list of them, or by kind how it is hidden,
in the deal's order. A kind hidden `first` SHALL have every clue tried at
each tier before any clue of a kind without, each side in a random order.
`deal.stripFrom: everyClue` SHALL start every search-tier draw from every
clue.

#### Scenario: Sticks hides lengths and block numbers together

- **WHEN** a Sticks board is dealt at Easy
- **THEN** both its line numbers and its block numbers are among those hidden

#### Scenario: Squares go before sums

- **WHEN** a `flanking` board is dealt at Normal, its givens hidden
  first (`hide: { given: { first: true }, flank: … }`)
- **THEN** it shows fewer givens and more sums than the same deal in one
  random order

#### Scenario: Squares go first at the lowest tier too

- **WHEN** a `flanking` board is dealt at Easy hiding its sums too, its
  givens hidden first
- **THEN** it shows fewer givens than sums, where the givens alone would
  finish it

### Requirement: A born game may order a kind's hide by a formula

With a hidden kind's `by`, its clues SHALL take the places the shuffle gave
that kind in the order of the stated formula of `at`, the higher first,
those alike in a random order; the kinds stay mixed as the shuffle put them.

#### Scenario: Larger givens go first

- **WHEN** `ordering` boards are dealt at Normal, its givens ranked by
  their numbers (`hide: { given: { by: "clue(given, at)" }, greater }`)
- **THEN** the givens they keep are smaller than the same deals hiding at
  random keep

### Requirement: A born game's kind may be read and never dealt

A kind `deal.never` names whole SHALL never be dealt, and SHALL be read from
an ID that holds it; values it names of a kind at cells SHALL never be
derived, and SHALL be read from an ID. A `dots` segment with `before` SHALL
be read only after that text, and SHALL write nothing where no cell holds
its kind.

#### Scenario: Pattern's given squares

- **WHEN** `2x2:1/1/1/1,aBb` is opened
- **THEN** its first cell is fixed clear and its third fixed shaded

### Requirement: A born game's hide may be the player's setting

A hidden kind's `when` SHALL name a flag setting, written after the tier by
its letter, under which alone the deal hides the kind, in one random order
with the others, and refuses a board that hides none of it.

#### Scenario: Remove numbers

- **WHEN** a Boats board is dealt with Remove numbers on
- **THEN** at least one row's or column's number is hidden, and no given
  square is a segment of unknown shape

### Requirement: A born game may hide a kind only from a tier up

A hidden kind's `from` MAY name a tier: a board below that tier SHALL show
every clue of the kind.

#### Scenario: Every sum at Easy

- **WHEN** a `flanking` board is dealt at Easy, its sums hidden from Normal
- **THEN** it shows the sum at every slot

### Requirement: A born game may hide a kind whole on a small board below a tier

A hidden kind's `whole` MAY name a tier other than the lowest, a variation,
and size bounds in `play.bounds`' measures: a board below that tier, with
that variation on and within those bounds, each where named, SHALL show no
clue of the kind, its answer drawn again until the board finishes without
them. Elsewhere the kind SHALL be hidden as without it. The compiler SHALL
refuse a tier the game lacks or its lowest, a variation it lacks, and a
measure it does not know.

#### Scenario: Towers' small Easy boards

- **WHEN** a Towers board of 4×4 or 5×5 is dealt at Easy
- **THEN** no square holds a given
- **AND** a 6×6 Easy board may keep some
