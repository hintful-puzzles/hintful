## MODIFIED Requirements

### Requirement: Net's params and their encoding

Params SHALL be `w`, `h`, `wrapping`, `barrierProbability` and the difficulty,
encoded `{w}x{h}[w][b{prob}]d{e|u}`: `w` for wrapping, and the `b` suffix and
the difficulty, Easy as `de` or Unreasonable as `du`, only in the full
encoding. An ID with no difficulty letter SHALL decode as Easy. Decoding SHALL
skip the letter `a`, which elsewhere asks for a board with no promised single
answer, and encoding SHALL never write it. `validateParams` SHALL reject a
`wrapping` board with a side of length 2.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 7, h: 9, wrapping: true, barrierProbability: 0.25 }` at
  Unreasonable are encoded in full
- **THEN** the result is `7x9wb0.25du`, the shared encoding is `7x9w`, and
  decoding the full one round-trips the params

#### Scenario: A string from before the tiers

- **WHEN** `7x9wb0.25`, written before the game had tiers, is decoded
- **THEN** the params are Easy, and their full encoding is `7x9wb0.25de`

#### Scenario: The unchecked-board letter

- **WHEN** `7x9wb0.25a` is decoded
- **THEN** the params are those of `7x9wb0.25`

### Requirement: Net flags wrong locks and notes

Net SHALL implement `findMistakes`, taking the board's one answer from the
search that counts its answers, at either difficulty, and flagging a locked
tile the answer turns differently and a side note the answer contradicts. A
tile turned wrong but unlocked SHALL NOT be flagged. Where the search did not
prove exactly one answer it SHALL flag nothing. A flagged note SHALL be drawn
in the error color, and a flagged lock SHALL be ringed in it.

#### Scenario: A wrong note is flagged

- **WHEN** the player notes a wire across a side the solution leaves empty, and checks the board
- **THEN** that note is the one mistake reported, and it is drawn in the error color

#### Scenario: A wrong lock on an Unreasonable board is flagged

- **WHEN** the hint has stopped on an Unreasonable board and the player locks
  a square a quarter turn from where the answer has it
- **THEN** the mistake check reports it

## REMOVED Requirements

### Requirement: Net loads only a board its hint finishes

**Reason**: Net has two tiers and is held to them. A board its hint does not
finish loads where it has exactly one answer, as Unreasonable.

**Migration**: "A pasted Net board opens at the difficulty it needs" states
what loads at each difficulty and what is refused.

### Requirement: Generated boards are uniquely solvable without guessing

**Reason**: A board dealt at Unreasonable is one the solver does not reach.

**Migration**: "Every Easy Net board is uniquely solvable without guessing"
keeps the rule for the tier it is still true of, and "An Unreasonable Net
board has one answer that the solver does not reach" states the other.

## ADDED Requirements

### Requirement: Every Easy Net board is uniquely solvable without guessing

At Easy the generator SHALL gate every board through its own solver,
perturbing the wiring until the board has exactly one solution reachable by
pure deduction, and SHALL then keep the board only if the hint's engine
finishes it from the opening position, dealing another otherwise. The boards
it deals for a seed SHALL be upstream's, draw for draw.

#### Scenario: A generated board has one deducible solution

- **WHEN** a board is generated at Easy
- **THEN** the solver reports it uniquely solvable, and no guess is required to reach the
  solution

#### Scenario: A generated board is hinted to the end

- **WHEN** a board is generated at Easy and the player follows the hint from the opening position
- **THEN** every step agrees with the solution and the board ends solved

### Requirement: A board two squares wide is dealt

The generator SHALL deal a board with a side of two squares without fail. Its
shuffle reads the grid as a torus when it looks for loops, where two tiles
side by side on such a board can be joined twice, and SHALL take the two
joins as a loop.

#### Scenario: Forty deals of each two-wide board

- **WHEN** 2×5, 5×2 and 2×9 boards are dealt from forty seeds each
- **THEN** every deal returns a board

### Requirement: Net counts a board's answers by a bounded search

The game SHALL count a board's answers up to two by trial and error over the
solver: where the solver stops, it SHALL take the first tile with the fewest
turnings left and assume each in turn. It SHALL report one answer, several,
none, or that it stopped at its budget, which SHALL be counted in positions
and never in time. Solve SHALL take the answer from it at either difficulty,
or from the network a dealt board was drawn as.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 3×4 wrapping board the solver finishes, on one
  with one answer that it does not reach, on a network as first drawn that
  other turnings join up too, and on a board with one wire end too many
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given four positions on a board that needs five
- **THEN** it reports that it stopped, and with five it reports one answer
- **AND** the same holds however the board's tiles are turned when it is asked

#### Scenario: An Easy board takes one position

- **WHEN** the search is given one position on a dealt Easy board
- **THEN** it reports one answer

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×4 to 5×5, networks as first drawn, the same
  boards with two tiles swapped and with one wall changed are each counted by
  turning the tiles one at a time in reading order and reading each finished
  grid for one network
- **THEN** the search reports one answer exactly where one turning fits,
  several where more do and none where none does

### Requirement: A Net answer is one network with no loop

An answer SHALL be a turning of every tile in which every wire end meets
another across a side with no wall, the wires join every tile, and no loop is
closed. A board whose tiles can be joined up only with a loop SHALL have no
answer.

#### Scenario: A loop is no answer

- **WHEN** a 2×2 board of four corners, which join up only as a loop, is
  entered
- **THEN** it is refused as contradictory

### Requirement: An Unreasonable Net board has one answer that the solver does not reach

At Unreasonable the generator SHALL stop the perturbing of the wiring at the
first network the solver cannot settle that the search proves has one answer,
within a budget of its own well under the search's, and SHALL draw another
network where the solver settles one. It SHALL keep a board with walls only
when the solver still stops short with the walls drawn. It SHALL give up once
it has drawn two million squares of network.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards at 3×4 and 4×4 wrapping, at
  5×5 and 4×6, and at 5×5 with a barrier probability of 0.3 wrapping and not
- **THEN** the solver leaves each unfinished
- **AND** exactly one turning fits each, by a count that has no search in it
- **AND** that answer is the network the board was drawn as

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 3×4 wrapping board, a 5×5 board and an 11×13 board
  is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Net refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide, wrapping or not, and without wrapping one two wide and
up to six long, a 3×3 one and a 3×4 one. The solver settles every board of
those shapes that has one answer.

#### Scenario: The small boards are not dealt at Unreasonable

- **WHEN** a 1×9, a 2×6 and a 4×3 board are asked for at Unreasonable
- **THEN** each is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** a 2×6 board is still dealt at Easy, and a 2×7, a 3×5, a 4×4 and a
  3×4 wrapping board are admitted at Unreasonable

#### Scenario: Every board of a refused shape is tried

- **WHEN** every network on a 2×2 to 2×6, a 3×3 and a 3×4 board, with every
  set of walls on the sides it leaves unwired, is given to the solver, and
  those it leaves unfinished are counted
- **THEN** none of them has exactly one answer
- **AND** the same walk over a 3×4 wrapping board finds one that does

### Requirement: Unreasonable Net is bounded on its own measurements

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board of more than 900 squares, a wrapping one longer than 80 squares, or
longer than 30 where it is four squares wide, and one with a barrier
probability over 0.3, each with a reason naming the difficulty. The same
board SHALL still be asked for at Easy.

#### Scenario: A board past a bound is refused at Unreasonable only

- **WHEN** a 31×30 board, a 10×81 wrapping board, a 31×4 wrapping board and a
  5×5 board with a barrier probability of 0.31 are checked for dealing at each
  difficulty
- **THEN** each is refused at Unreasonable and not at Easy
- **AND** a 30×30, a 3×300, a 10×80 wrapping, a 4×30 wrapping and a 5×5 board
  with a barrier probability of 0.3 are admitted at Unreasonable

### Requirement: Net's menu offers each size at both difficulties

Net's presets SHALL offer each of 5×5, 7×7, 9×9, 11×11 and 11×13 as Easy and
as Unreasonable, then one wrapping 7×7 board at Easy, and the default SHALL be
the Easy 5×5.

#### Scenario: Every size is offered at both difficulties

- **WHEN** Net's preset menu is read
- **THEN** its five sizes each appear as Easy and then as Unreasonable, and
  the wrapping board comes last

### Requirement: A pasted Net board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the solver and the
hint finish it, and as Unreasonable where it has exactly one answer that they
do not reach, whatever lower difficulty its ID states. A board with several
answers SHALL be refused as having more than one solution, and a board with
none as one whose clues contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 3×4 wrapping ID whose board has one answer the solver does not
  reach is entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `3x4wdu`

#### Scenario: A board with several answers or none is refused

- **WHEN** a network as first drawn that other turnings join up too, and a
  board with one wire end too many, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Net's hint stops where its deductions do

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the notes and locks its three reasons force from the player's locks,
notes and the walls, and no others, and where none is forced it SHALL refuse
with the collection's sentence that deduction has run out. It SHALL go on
from the squares the player then locks.

#### Scenario: The hint stops, and goes on from a square locked rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** with a square locked as the solution has it wherever the hint stops,
  the hint finishes the board
