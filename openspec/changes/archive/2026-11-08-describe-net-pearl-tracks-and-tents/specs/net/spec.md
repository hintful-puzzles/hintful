## MODIFIED Requirements

### Requirement: Params: Net refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide, wrapping or not, and without wrapping one two wide and
up to six long, a 3×3 one and a 3×4 one. The ladder settles every board of
those shapes that has one answer.

#### Scenario: The small boards are not dealt at Unreasonable

- **WHEN** a 1×9, a 2×6 and a 4×3 board are asked for at Unreasonable
- **THEN** each is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** a 2×6 board is still dealt at Easy, and a 3×4 wrapping board is
  admitted at Unreasonable

#### Scenario: Every board of a refused shape is tried

- **WHEN** every network on a 2×2 to 2×6, a 3×3 and a 3×4 board, with every
  set of walls on the sides it leaves unwired, is given to the ladder, and
  those it leaves unfinished are counted
- **THEN** none of them has exactly one answer
- **AND** the same walk over a 3×4 wrapping board finds one that does

### Requirement: Generation: Every Easy Net board is uniquely solvable without guessing

At Easy the generator SHALL perturb the wiring of a network until the ladder
`net.description.yaml` states settles every side of it from no walls, and
SHALL keep that network. Walls only add to what the ladder knows, so the
board dealt with its walls drawn is settled too. The ladder is the hint's, so
the hint finishes every Easy board.

#### Scenario: A generated board has one deducible solution

- **WHEN** a board is generated at Easy
- **THEN** the ladder finishes it from its walls, with no guess

### Requirement: Generation: An Unreasonable Net board has one answer that the hint does not reach

At Unreasonable the generator SHALL stop the perturbing of the wiring at the
first network the ladder cannot settle that the search proves has one
answer, within the engine's dealing budget, and SHALL draw another network
where the ladder settles one. The board SHALL be kept only when, as dealt
with its walls drawn, the ladder still stops short of it.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards at 3×4 and 4×4 wrapping, at
  5×6 and 6×6, and at 5×5 wrapping with a barrier probability of 0.2
- **THEN** the ladder leaves each unfinished
- **AND** exactly one turning fits each, by a count that has no search in it
- **AND** that answer is the network the board was drawn as

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 3×4 wrapping board, a 5×6 board and an 11×13 board
  is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Solver: Net's search assumes each turning of the tile with the fewest left

Net's search SHALL count a board's answers by trial and error over the
ladder: where the ladder stops, it SHALL take an open side of the first tile
with the fewest open sides and assume it wired, then not. Solve on a board
Net dealt SHALL take the network the board was drawn as.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 3×4 wrapping board the ladder finishes, on
  one with one answer that it does not reach, on a network as first drawn
  that other turnings join up too, and on a board with one wire end too many
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: The search does not read how the tiles are turned

- **WHEN** the search is given four positions on a board that needs five
- **THEN** it reports that it stopped, and with five it reports one answer
- **AND** the same holds however the board's tiles are turned when it is asked

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×4 to 5×5, networks as first drawn, the same
  boards with two tiles swapped and with one wall changed are each counted by
  turning the tiles one at a time in reading order and reading each finished
  grid for one network
- **THEN** the search reports one answer exactly where one turning fits,
  several where more do and none where none does

### Requirement: Hint: Net's hint reasons from notes, locks and walls

Net's hint SHALL reason only from the facts a player records, side notes and
locked tiles, and the walls the board shows, treating an unlocked tile as
unknown however it is turned. Each step SHALL add one fact: a note on a side
every surviving way of turning a tile agrees on, or a lock on a tile only one
way of turning survives for. A tile whose every side is known, and which is
not locked, SHALL be locked as the one way its sides fit.

#### Scenario: A tile turned right but not locked

- **WHEN** a tile already shows the only way it can turn and is not locked
- **THEN** the step that settles it locks it without turning it, and no step
  before it rests on how that tile is turned

#### Scenario: Every square is locked by the end of an Easy plan

- **WHEN** the hint's plan is followed on an Easy board of each preset
- **THEN** every square ends locked, including those whose sides the squares
  beside them settled, and the board is solved

### Requirement: Hint: Net's hint takes the easiest step first

Each step SHALL be the easiest the recorded facts give, by the ideas in
order: the known sides alone, then a loop, then a sealed group, then a tile
beside it left no way. An idea SHALL be used only where every easier one
gives no step anywhere, and within an idea a lock SHALL come before a note.

#### Scenario: The walls come first

- **WHEN** the hint's plan is read on the 5×5 board
  `843886bbb66dae95ceda11112`
- **THEN** it opens "This straight must fit the wall, so only one way fits:
  turn it." and then locks that straight
- **AND** its first journey that cites a sealed group, a corner that would
  seal off the striped squares, comes after 21 steps that cite sides alone

## ADDED Requirements

### Requirement: Generation: A Net board is Easy where the ladder finishes it

A board SHALL count as Easy where the ladder finishes it, and as Unreasonable
where it has exactly one answer the ladder does not reach. The hint and Solve
read the same ladder, so no board is finished by one and not the other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 3×4 wrapping ID whose board has one answer the ladder does not
  reach is entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `3x4wdu`

#### Scenario: A board the ladder finishes only by its last idea opens as Easy

- **WHEN** `5x5:81924a3be3be5731bb848cca2`, which the ladder finishes only by
  a square that would leave the one beside it no way to turn, is entered
  with no difficulty letter
- **THEN** it opens, and the board's params read `5x5de`

### Requirement: Hint: Net's hint seals off what a wire could reach

A way of turning a tile SHALL count as sealing a group off when the squares
its wires could reach, with the tile, fall short of the grid. A wire
reaches the square it enters and leaves it only across a side that square
could carry it on to. Then it crosses any side two squares that are not dead
ends could both carry a wire across, never back across a side of the tile
or of the square it entered, and reaches the dead ends beside.

#### Scenario: A straight between two dead ends

- **WHEN** the hint is followed on `5x5wde:5196412d61c4dd89ee7392653`
- **THEN** the plan finishes the board, every step agreeing with its one
  answer, and one step turns a straight because, lying across, it would join
  the striped dead ends, one across the wrapped edge, closing all three off

## REMOVED Requirements

### Requirement: Generation: A Net board is Easy where the hint finishes it

**Reason**: The hint and the solver are one ladder now, so no board is
finished by the hint past the solver; "Generation: A Net board is Easy where
the ladder finishes it" states the tier.
**Migration**: None; the same boards open as Easy wherever the ladder
finishes them.

### Requirement: Hint: Net's hint follows a wire through tiles not settled yet

**Reason**: The seal follows a wire one square as that square could carry
it and then across the sides both squares could carry, as the description
states it, not over every way each square it enters can turn; "Hint: Net's
hint seals off what a wire could reach" states it. Upstream's boards are
held to one answer, not to the hint finishing them.
**Migration**: None; a board the ladder no longer finishes opens as
Unreasonable.

### Requirement: Hint: A hint says when a wire only leads into open tiles

**Reason**: A sealed group is now what a wire could reach across sides both
squares could carry, so "would seal off the striped squares" says it truly;
the sentence for a group reached through open squares opened no step on 180
dealt boards, and the "end or loop" case is no longer a reason.
**Migration**: None; a step that seals a group says that it seals it.
