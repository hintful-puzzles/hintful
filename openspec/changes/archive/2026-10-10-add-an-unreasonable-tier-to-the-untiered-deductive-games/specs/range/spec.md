## MODIFIED Requirements

### Requirement: Range params are a width and a height

Params SHALL be `w`, `h` and the difficulty, encoded `{w}x{h}d{e|u}`: the
difficulty, Easy as `de` or Unreasonable as `du`, only in the full encoding.
A bare number SHALL decode as a square board of that size, and an ID with no
difficulty letter SHALL decode as Easy.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 13, h: 9 }` at Easy are encoded
- **THEN** the full encoding is `13x9de` and the shared one `13x9`
- **AND** decoding `13x9`, written before the game had tiers, yields the same
  params
- **AND** decoding the bare `12` yields a 12×12 board

### Requirement: Range's Solve searches where deduction stalls

`solve` SHALL take the board's answer from the search that counts its
answers, at either difficulty. It SHALL return one move, carrying the solve
flag, that sets every non-clue cell, or an error when the clues admit no
completion or more than one.

#### Scenario: Solve completes a generated board

- **WHEN** the Solve command runs on a generated board
- **THEN** it returns a move whose cell-sets paint every undecided cell, after
  which `status` returns `"solved"` and `findErrors` reports no error

### Requirement: Range checks mistakes against the solution

`findMistakes` SHALL take the board's one answer from the search that counts
its answers, at either difficulty, and return every player-marked non-clue
cell whose mark contradicts it: black where the solution is white, or marked
white where the solution is black. It SHALL return none when the marks are
consistent or undecided, and none where the search did not prove exactly one
answer.

#### Scenario: findMistakes flags a wrong black

- **WHEN** the player paints black a cell that is white in the unique solution
  and Check & Save runs
- **THEN** `findMistakes` returns that cell
- **AND** a board whose marks all agree with the solution returns no mistakes

## REMOVED Requirements

### Requirement: Range generates uniquely solvable symmetric boards

**Reason**: A board dealt at Unreasonable is one the three rules do not
finish.

**Migration**: "Every Easy Range board is uniquely solvable without search"
keeps the rule for the tier it is still true of, and "An Unreasonable Range
board has one answer that the rules do not reach" states the other.

### Requirement: Range loads only a board its three rules finish

**Reason**: Range has two tiers and is held to them. A board its rules do not
finish loads where it has exactly one answer, as Unreasonable.

**Migration**: "A pasted Range board opens at the difficulty it needs" states
what loads at each difficulty and what is refused.

## ADDED Requirements

### Requirement: Every Easy Range board is uniquely solvable without search

Every board `newDesc` generates at Easy SHALL be uniquely solvable by the
deductive solver without search and SHALL have two-way rotationally symmetric
clues, none of them opposite a black square of the solution, and no symmetric
pair of them removable without the board then needing search. On a grid at
least two squares each way it SHALL contain at least one black square.

#### Scenario: Generated boards are valid and solvable

- **WHEN** `newDesc` runs for a seeded RNG across all four presets at Easy
- **THEN** every desc is accepted as a valid description
- **AND** the deductive solver, without search, solves every resulting board
  from its visible clues alone to a state with no errors

#### Scenario: A removal that needs search is put back

- **WHEN** removing a symmetric pair of clues leaves a board the deductive
  solver cannot finish without search
- **THEN** both clues are restored and the next pair is tried

### Requirement: Range counts a board's answers by a bounded search

The game SHALL count a board's answers up to two by trial and error over the
three rules: where they stop, it SHALL take the first undecided cell and
assume it shaded, and then clear. It SHALL report one answer, several, none,
or that it stopped at its budget, which SHALL be counted in positions and
never in time.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 4×4 board the rules finish, on one with one
  answer that they do not reach, on one with no number, and on one with a 7
  in one corner and a 1 in the opposite one
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given eight positions on a board that needs nine
- **THEN** it reports that it stopped, and with nine it reports one answer

#### Scenario: An Easy board takes one position

- **WHEN** the search is given one position on a dealt Easy board
- **THEN** it reports one answer

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 2×3 to 5×5, the same with a number taken away
  and the same with one number changed are each counted by shading every set
  of squares with no two side by side and reading it against the numbers
- **THEN** the search reports one answer exactly where one shading fits,
  several where more do and none where none does

### Requirement: Range's search sees a position no answer fits before it is full

The search SHALL call a position impossible as soon as the live error check
flags a cell in it: a number that cannot see its count however the undecided
cells go, or already sees too many, two shaded cells side by side, or clear
cells cut off from the rest. It SHALL NOT wait for every cell to be decided.

#### Scenario: A board that takes three positions

- **WHEN** the search is given two positions on a 4×4 board that takes five
  when an impossible position is seen only once full
- **THEN** it reports that it stopped, and with three it reports one answer

### Requirement: An Unreasonable Range board has one answer that the rules do not reach

At Unreasonable the generator SHALL strip an Easy board further: each
symmetric pair of clues still showing SHALL go while the search still proves
one answer within a budget of its own, well under the search's. It SHALL keep
the board only when the three rules then stop short, and its clues SHALL stay
two-way rotationally symmetric.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 2×3 to 6×9
- **THEN** the three rules leave each unfinished and its clues are symmetric
- **AND** exactly one shading fits each board of up to 25 squares, by a count
  that has no search in it

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 2×3 board, a 3×4 board and an 11×16 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Range refuses Unreasonable where no board needs it

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board one square wide. On a strip a shaded square anywhere but an end cuts the
clear squares in two, and the rules settle every strip that has one answer. A
3×3 board SHALL NOT be refused: boards of it have the tier, though none with
symmetric clues, so the generator gives up on it.

#### Scenario: A strip is not dealt at Unreasonable

- **WHEN** a 1×6 board and a 40×1 board are asked for at Unreasonable
- **THEN** each is refused with the sentence that no puzzle of that kind is
  Unreasonable
- **AND** a 1×6 board is still dealt at Easy, and a 2×3 and a 3×3 board are
  admitted at Unreasonable

#### Scenario: Every board of a strip is tried

- **WHEN** every allowed shading of a 1×3, a 1×5 and a 1×8 board, with every
  set of its clear squares showing its number, is given to the rules, and
  those they leave unfinished are counted
- **THEN** none of them has exactly one answer
- **AND** the same walk over a 2×3 board finds some that do, and over a 3×3
  board 176, none with symmetric clues

### Requirement: Unreasonable Range is bounded on its own measurements

`validateParams` SHALL refuse, when a board is to be dealt, an Unreasonable
board of more than 300 squares, with a reason naming the difficulty. The same
size SHALL still be asked for at Easy.

#### Scenario: A size past the bound is refused at Unreasonable only

- **WHEN** an 18×18 board and a 3×125 board are checked for dealing at each
  difficulty
- **THEN** each is refused at Unreasonable and not at Easy
- **AND** a 15×20, a 5×60 and a 2×126 board are admitted at Unreasonable

### Requirement: Range's menu offers each size at both difficulties

Range's presets SHALL offer each of 6×9, 8×12, 9×13 and 11×16 as Easy and as
Unreasonable, and the default SHALL be the Easy 6×9.

#### Scenario: Every size is offered at both difficulties

- **WHEN** Range's preset menu is read
- **THEN** its four sizes each appear as Easy and then as Unreasonable

### Requirement: A pasted Range board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the three rules
finish it, and as Unreasonable where it has exactly one answer that they do
not reach, whatever lower difficulty its ID states. A board with several
answers SHALL be refused as having more than one solution, and a board with
none as one whose clues contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 4×4 ID whose board has one answer the rules do not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `4x4du`

#### Scenario: A board with several answers or none is refused

- **WHEN** the description `c6h3_6b` of a 4×4 board, which has three answers,
  and one with a 7 in one corner and a 1 in the opposite one, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

### Requirement: Range's hint stops where its rules do

The hint SHALL never run the search. On an Unreasonable board its plan SHALL
hold the cells the three rules force from the player's marks and no others,
and where none is forced it SHALL refuse with the collection's sentence that
deduction has run out. It SHALL go on from the cells the player then fills.

#### Scenario: The hint stops, and goes on from a cell filled rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** a cell filled wrongly there is reported by the mistake check
- **AND** with a cell filled as the solution has it wherever the hint stops,
  the hint finishes the board
