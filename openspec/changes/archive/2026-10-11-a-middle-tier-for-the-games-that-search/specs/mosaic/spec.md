## MODIFIED Requirements

### Requirement: Mosaic's parameters and their encoding

Params SHALL be `width`, `height`, `aggressive`, which asks for harder
generation by clue minimization and defaults to true, and a difficulty, Easy,
Normal or Unreasonable. They SHALL encode as `{w}x{h}`, and in the full
encoding only an `h{0|1}` suffix when `aggressive` differs from its default,
then the difficulty as `de`, `dn` or `du`. A string with no difficulty letter
SHALL decode as Easy.

#### Scenario: Params round-trip

- **WHEN** params `{ width: 10, height: 8, aggressive: true }` at Easy are
  encoded in full
- **THEN** the result is `10x8de` (default aggressiveness elided)
- **AND** an Unreasonable 50×50 board with `aggressive` false encodes to
  `50x50h0du`
- **AND** decoding each string round-trips the params

#### Scenario: A string from before the tiers reads as Easy

- **WHEN** `10x8` and `50x50h0` are decoded
- **THEN** each is an Easy board, the second with `aggressive` false

#### Scenario: The middle difficulty has a letter of its own

- **WHEN** a Normal 10×8 board's params are encoded in full
- **THEN** the result is `10x8dn`, and `10x8du` still decodes as Unreasonable

### Requirement: Mosaic rejects board shapes it cannot generate

`validateParams` SHALL refuse, when a board is to be dealt at any difficulty,
a board longer than the longest that is dealt at its shorter side, with a
reason naming both. A board 20 or more across SHALL be dealt at any length
within the tile limit. A description that is supplied SHALL NOT be held to the
bound.

#### Scenario: A long thin board is refused with a reason

- **WHEN** a 3×21, a 5×31, an 8×51, a 101×12 and a 19×201 board are validated
  for generation
- **THEN** each is refused with a message naming its shorter side and that
  side's greatest length
- **AND** a 3×20, a 5×30, a 9×50, a 10×100, a 15×200 and a 20×500 board are
  admitted

#### Scenario: An existing long description still loads

- **WHEN** a 3×400 board's params accompany a supplied description
- **THEN** validation succeeds

## REMOVED Requirements

### Requirement: Aggressive Unreasonable generation is bounded on its own measurements

**Reason**: The bound holds at Normal as well, where hiding asks the deduction
about every clue.

**Migration**: "Aggressive generation above Easy is bounded on its own
measurements".

### Requirement: Mosaic's menu offers each size at both difficulties

**Reason**: Six sizes at three difficulties are more lines than a section of
a menu holds.

**Migration**: "Mosaic's menu offers its middle sizes at every difficulty".

### Requirement: A pasted Mosaic board opens at the difficulty it needs

**Reason**: A board the comparison finishes is Normal, where it was Easy.

**Migration**: "A pasted Mosaic board opens at the lowest difficulty that
solves it".

## ADDED Requirements

### Requirement: A Normal Mosaic board needs a comparison and no search

At Normal the generator SHALL hide clues of an Easy board while the deduction,
two numbers compared included, still finishes it, and SHALL keep the board
only where one number at a time does not. With aggressive generation it SHALL
try every clue. Without, it SHALL try a part of them, so the board keeps most
of its numbers.

#### Scenario: A dealt Normal board is finished by comparing

- **WHEN** `newDesc` produces Normal boards from 3×3 to 10×10, with aggressive
  generation on and off
- **THEN** the deduction finishes each, and compares two numbers on the way
- **AND** exactly one picture fits each, by a count that has no search in it

#### Scenario: A Normal board shows fewer numbers than an Easy one

- **WHEN** 10×10 boards are dealt from the same seeds at Easy and at Normal
- **THEN** the Normal boards show fewer numbers
- **AND** Normal boards dealt without aggressive generation show more than
  those dealt with it

#### Scenario: The hint finishes a Normal board

- **WHEN** the hint is followed on a dealt Normal board
- **THEN** it reaches the solution without refusing, and some of its steps
  compare two numbers

### Requirement: Aggressive generation above Easy is bounded on its own measurements

`validateParams` SHALL refuse, when a board is to be dealt, a Normal or an
Unreasonable board of more than 900 squares with aggressive generation on,
with a reason that names the difficulty and says to turn it off. The same size
SHALL be dealt at Easy, and at either higher difficulty with aggressive
generation off.

#### Scenario: A size dealt at Easy is refused above it with aggressive generation

- **WHEN** a 31×30 board is checked for dealing at Normal and at Unreasonable,
  and a 50×50 board at Unreasonable
- **THEN** each is refused with aggressive generation on
- **AND** each is admitted at Easy, and at its own difficulty with it off

### Requirement: Mosaic's menu offers its middle sizes at every difficulty

Mosaic's presets SHALL offer 10×10, 15×15 and 25×25 as Easy, Normal and
Unreasonable, and 3×3, 5×5 and 50×50 as Easy alone, so that the menu is one
section. The default SHALL be an Easy 10×10. Every size SHALL be dealt at
every difficulty from the Custom dialog.

#### Scenario: The smallest board is on the menu once

- **WHEN** Mosaic's preset menu is read
- **THEN** 3×3 appears as Easy and at no other difficulty
- **AND** a Normal and an Unreasonable 3×3 board are each dealt when asked for

### Requirement: A pasted Mosaic board opens at the lowest difficulty that solves it

A board that arrives as a game ID SHALL open as Easy where one number at a
time finishes it, as Normal where two numbers compared do, and as
Unreasonable where it has exactly one answer that the deduction does not
reach, whatever lower difficulty its ID states. A higher difficulty its ID
states SHALL be kept. A board with several answers SHALL be refused as having
more than one solution, and a board with none as one whose clues contradict
each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the deduction does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

#### Scenario: A board with several answers or none is refused

- **WHEN** a 3×3 board with a lone 5, and a 3×3 board whose corner counts
  none and whose middle counts nine, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

#### Scenario: A board the comparison finishes opens as Normal

- **WHEN** a 5×5 board that one number at a time does not finish and two
  numbers compared do is entered with no difficulty letter, with `de`, and
  with `du`
- **THEN** the first two open as Normal, and the third keeps the difficulty
  it was saved at
