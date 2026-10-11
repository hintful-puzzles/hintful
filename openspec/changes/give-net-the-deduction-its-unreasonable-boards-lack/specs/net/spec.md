## REMOVED Requirements

### Requirement: A way of turning is ruled out for three reasons only

**Reason**: The hint has a fourth reason, a tile beside the one turned that is
left no way to turn.

**Migration**: "A way of turning is ruled out for four reasons only".

### Requirement: An Unreasonable Net board has one answer that the solver does not reach

**Reason**: The hint now finishes boards the solver stops on, and a board is
Unreasonable where the hint stops.

**Migration**: "An Unreasonable Net board has one answer that the hint does
not reach".

### Requirement: Net's menu offers each size at both difficulties

**Reason**: An Unreasonable 5×5 board without wrapping is too rare to deal,
so the menu offers that size at Easy alone.

**Migration**: "Net's menu offers each size at the difficulties it deals".

## ADDED Requirements

### Requirement: A way of turning is ruled out for four reasons only

In Net's hint a way of turning a tile SHALL be ruled out only by a known side
it contradicts, a loop it would close through wires already known, a group of
tiles it would seal off from the rest of the grid, or a tile beside it that it
would leave no way to turn. The step's words SHALL name each reason it rests
on.

#### Scenario: A tile against the wall

- **WHEN** a straight on the edge of a bounded grid is turned into the wall, and the player asks for a hint
- **THEN** the step rings the straight, says it must fit the wall so only one way fits, turns it, and then locks it

### Requirement: A turning that leaves the tile beside it no way is ruled out

Where no step follows from the facts as recorded, a way of turning a tile
SHALL be ruled out when, with the tile held that way, every way of a tile
beside it contradicts a known side or closes a loop through known wires, the
held tile's sides and wires among the known. A way of the tile beside it SHALL
NOT be ruled out there by a group it would seal off. The step SHALL outline
the tile beside it and stripe the squares the loops run through.

#### Scenario: A T that leaves a straight no way

- **WHEN** the hint is followed on `5x5:81924a3be3be5731bb848cca2` to the T at
  column 2 of row 3, whose ways but two contradict locked tiles
- **THEN** the step rings the T and says that, pointing up, down and left, it
  would leave the outlined straight no way to fit it without closing a loop
  through the striped squares
- **AND** the straight beside it is outlined, and the four squares the loop
  runs through are striped

### Requirement: An Unreasonable Net board has one answer that the hint does not reach

At Unreasonable the generator SHALL stop the perturbing of the wiring at the
first network the solver cannot settle that the search proves has one answer,
within the engine's dealing budget, and SHALL draw another network where the
solver settles one. The board SHALL be kept only when, as dealt with its walls
drawn, the solver stops short of it and so does the hint's engine, asked from
the tiles the solver settled.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards at 3×4 and 4×4 wrapping, at
  5×6 and 6×6, and at 5×5 wrapping with a barrier probability of 0.2
- **THEN** the solver leaves each unfinished, and so does the hint's engine
- **AND** exactly one turning fits each, by a count that has no search in it
- **AND** that answer is the network the board was drawn as

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 3×4 wrapping board, a 5×6 board and an 11×13 board
  is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Net refuses Unreasonable without wrapping where it is too rare

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board without wrapping whose shorter side is under five squares, and a 5×5
one, each as too rare to deal. The hint finishes nearly every such board the
solver stops on. The same board SHALL still be asked for at Easy, and with
wrapping at Unreasonable.

#### Scenario: The small boards without wrapping

- **WHEN** a 5×5, a 4×30, a 3×5 and a 2×7 board are asked for at Unreasonable
- **THEN** each is refused as too rare to deal
- **AND** a 5×6 and a 7×7 board are admitted, and so are a 5×5 and a 4×4
  wrapping board

### Requirement: Net's menu offers each size at the difficulties it deals

Net's presets SHALL offer 5×5 as Easy, each of 7×7, 9×9, 11×11 and 11×13 as
Easy and as Unreasonable, then one wrapping 7×7 board at Easy, and the default
SHALL be the Easy 5×5.

#### Scenario: Every size from 7×7 is offered at both difficulties

- **WHEN** Net's preset menu is read
- **THEN** 5×5 appears as Easy alone, the four larger sizes each appear as
  Easy and then as Unreasonable, and the wrapping board comes last

## MODIFIED Requirements

### Requirement: Net refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide, wrapping or not, and without wrapping one two wide and
up to six long, a 3×3 one and a 3×4 one. The solver settles every board of
those shapes that has one answer.

#### Scenario: The small boards are not dealt at Unreasonable

- **WHEN** a 1×9, a 2×6 and a 4×3 board are asked for at Unreasonable
- **THEN** each is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** a 2×6 board is still dealt at Easy, and a 3×4 wrapping board is
  admitted at Unreasonable

#### Scenario: Every board of a refused shape is tried

- **WHEN** every network on a 2×2 to 2×6, a 3×3 and a 3×4 board, with every
  set of walls on the sides it leaves unwired, is given to the solver, and
  those it leaves unfinished are counted
- **THEN** none of them has exactly one answer
- **AND** the same walk over a 3×4 wrapping board finds one that does

### Requirement: Unreasonable Net is bounded on its own measurements

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board of more than 900 squares, one without wrapping under seven squares wide
and over 40 long, a wrapping one longer than 80 squares, or longer than 30
where it is four squares wide, and one with a barrier probability over 0.2,
each with a reason naming the difficulty. The same board SHALL still be asked
for at Easy.

#### Scenario: A board past a bound is refused at Unreasonable only

- **WHEN** a 31×30 board, a 6×41 board, a 10×81 wrapping board, a 31×4
  wrapping board and a 7×7 board with a barrier probability of 0.21 are
  checked for dealing at each difficulty
- **THEN** each is refused at Unreasonable and not at Easy
- **AND** a 30×30, a 7×128, a 6×40, a 10×80 wrapping, a 4×30 wrapping and a
  7×7 board with a barrier probability of 0.2 are admitted at Unreasonable


### Requirement: Net's hint follows a wire through tiles not settled yet

A way of turning a tile SHALL count as sealing a group off when each of its
wires stops within a bounded run of tiles and together they reach fewer tiles
than the grid holds. The run past a side SHALL be bounded over every way the
tiles it enters can turn, among the ways that contradict no known side and
close no loop through wires already known. A side whose wire could lead on, or
come back round, SHALL bound nothing. Where no step follows from the facts as
recorded, the run SHALL be bounded again with the tile held as turned, its
sides and wires among the known.

#### Scenario: Two dead ends and two straights in one column

- **WHEN** the hint is asked on the wrapping board `5x5w:19d7aaae8449d5636cad43c44`
- **THEN** the plan finishes the board, every step agreeing with the solver's answer, and one step locks a straight lying across because, standing upright, it would lead only into the striped squares

#### Scenario: Upstream's boards are hinted to the end

- **WHEN** the generator is run on a seed whose board from upstream's generator is recorded
- **THEN** the hint's engine finishes upstream's board for that seed, and the generator returns that board

#### Scenario: A group sealed only once the tile's own wires count

- **WHEN** the hint is followed on `5x5:64432a4be63e6364eb7815332`, which the
  solver stops short of
- **THEN** the plan finishes the board, every step agreeing with its one
  answer, and no step rests on a tile beside the one it turns

### Requirement: A pasted Net board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the hint finishes
it, whether or not the solver does, and as Unreasonable where it has exactly
one answer that the hint does not reach, whatever lower difficulty its ID
states. A board with several answers SHALL be refused as having more than one
solution, and a board with none as one whose clues contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 3×4 wrapping ID whose board has one answer the hint does not
  reach is entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `3x4wdu`

#### Scenario: A board the hint finishes past the solver opens as Easy

- **WHEN** `5x5:81924a3be3be5731bb848cca2`, which the solver stops short of
  and the hint finishes, is entered with no difficulty letter
- **THEN** it opens, and the board's params read `5x5de`

#### Scenario: A board with several answers or none is refused

- **WHEN** a network as first drawn that other turnings join up too, and a
  board with one wire end too many, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Net's hint stops where its deductions do

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the notes and locks its four reasons force from the player's locks,
notes and the walls, and no others, and where none is forced it SHALL refuse
with the collection's sentence that deduction has run out. It SHALL go on
from the squares the player then locks.

#### Scenario: The hint stops, and goes on from a square locked rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** with a square locked as the solution has it wherever the hint stops,
  the hint finishes the board
