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

### Requirement: A born game's piece may hide its number

A value named by `play.covers` SHALL hide its cell's number, and its
preference SHALL show it smaller; a press in the half tile round the grid
SHALL flip the preference and make no move. `play.wrap` SHALL carry the
cursor over the grid's edge.

#### Scenario: A press off Singles' grid

- **WHEN** the player presses outside the grid with the preference off
- **THEN** it is on, and `interpretMove` returns `UI_UPDATE`

### Requirement: A born game may deal one kind of clue an element, of the kinds switched on

`deal.oneKind` with `pick: first` SHALL keep, at each element, the clue
of the first of its kinds the answer makes there, and no other. A `set` setting SHALL give each of its members a check box
in Custom and a letter after the tier in a full ID, written only where some
member is off and read in the letters' order; a board SHALL deal no clue of
a kind switched off, a board with none on SHALL be refused, and a board's
name SHALL say the shorter of the kinds on and the kinds off.

#### Scenario: A parity where a sum holds

- **WHEN** the answer's four squares round a corner are all odd and their
  pairs are the same, and the precedence puts the same before parity
- **THEN** the corner is dealt the same, and not a parity

#### Scenario: Kinds switched off

- **WHEN** a board is read from `5dnAO`
- **THEN** it deals sums and parities alone, its name says "only sum/parity"
  where it says the kinds, and it is written back as `5dnAO`, and as `5dn`
  with every kind on

### Requirement: A born game's deal setting is a param by its letter

A `flag` setting with `written: off` SHALL be written as its letter and
`0` only where it is off and read as on where it is absent, so an upstream
ID reads as upstream reads it. A menu board SHALL have it on where it is
narrower than the setting's `onBelow`. `deal.thorough` MAY name such a flag.

#### Scenario: Mosaic's largest board is dealt quickly

- **WHEN** Mosaic's menu boards are encoded in full
- **THEN** the 50×50 board carries `h0` and no other board an `h`

### Requirement: A born game's dealt cells and modifiers are its description's

A clue kind `play.dealt` names, meaning `value(at) = v`, SHALL be dealt as
fixed values in its cells, which no button changes. A `flag` setting with
`gives: variation` SHALL put the variation of its name in the params by its
letter, and the params SHALL refuse a board its `most` or `bounds` bound or
one off `sizes.step`.

#### Scenario: Unruly's unique boards are bounded

- **WHEN** the params of a 6×16 Unruly board with unique rows and columns are
  checked
- **THEN** they are refused, and the same board without the rule, and a 6×14
  one with it, are not

### Requirement: A born game's params may give a size beyond the grid's

A size the rules read that the grid is not measured in SHALL be given by
the params, as a `choice` setting with `gives: size` declares it: its
letter, and a ruleset for each choice, which the Custom dialog offers as
the game mode and the help's `{{rulesets}}` lists. A choice's `least` SHALL
refuse a narrower board, naming the ruleset. A preset board SHALL give the
size after its `WxH` by its letter. Every technique and rule that reads the
size SHALL get it.

#### Scenario: Star Battle's stars

- **WHEN** Star Battle's params `10s2dn` are read, and a 7x7 grid of two
  stars is checked
- **THEN** the board is 10x10 with two stars to a row at Normal, and the
  grid is refused with "Two stars: the grid size must be at least 8."

### Requirement: A born game's deal may take options

A setting with no `gives` is the deal's alone: a `number` in a range, or a
`choice` of named choices, each with a default, and a choice with the size
bounds it alone binds, a tier's among them. The Custom dialog SHALL offer
each and the params SHALL write each after the size. A label SHALL name one
only where it is not a preset board's own (`7x7s4`), or the default on any
other board. A `tierFlag` letter MAY stand for a tier.

#### Scenario: Light Up's options

- **WHEN** Light Up's Custom dialog is opened
- **THEN** it offers the share of walls and the symmetry, and a 3×3 under
  2-way rotational symmetry at Unreasonable is refused, naming the symmetry

### Requirement: A born game's params may give a tally of pieces

A `tally` setting SHALL name a clue at the board of two fields, a length
and its count, that the params give: a size by its letter after the grid's
and the counts after a comma at the end, one of the longest and one more of
each shorter by default. Params SHALL be refused where the size is not
smaller than a side, no piece is counted, or the pieces cannot be laid.

#### Scenario: Boats' fleet

- **WHEN** `6x6f3dhS,3,2,1` is decoded and encoded without the tier
- **THEN** it is `6x6f3,3,2,1`, and `4x4f3de,9,9,9` is refused as not fitting
