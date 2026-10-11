## ADDED Requirements

### Requirement: Mosaic's deduction compares two numbers whose blocks overlap

Where no number decides a square alone, the board-side solver SHALL compare
each two numbers whose blocks overlap. Where one still needs as many more
shaded squares than the other as it has empty squares outside the other's
block, those squares SHALL be shaded. Where the two need the same and the
first has no empty square outside the other's block, the other's empty squares
outside the first's SHALL be clear. A number SHALL be compared only where no
number decides anything alone.

#### Scenario: A number needs more than its neighbor by all it has outside

- **WHEN** the deduction runs on the 3×3 board `13g`, a corner 1 beside a 3
- **THEN** it shades the 3's two squares outside the 1's block, and stops

#### Scenario: A number inside another's block needs as many

- **WHEN** the deduction runs on the 3×3 board `22g`, a corner 2 beside a 2
- **THEN** it clears the second 2's two squares outside the corner's block

#### Scenario: A board one number at a time does not finish

- **WHEN** the 5×5 board `0b4c4b4a6a3d3a2c` is solved
- **THEN** the solver finishes it, where upstream's rule alone stops short

### Requirement: Mosaic's hint says a comparison of two numbers

A hint step that compares two numbers SHALL name both by their values, the
second as "the other" where the values are equal, outline each number's block
whole, and ring the squares it decides, which only one of the two counts. A
step that shades SHALL say how many more the first needs than the other and
that it has only that many empty squares outside the other's block. A step
that clears SHALL say that both need the same.

#### Scenario: The ringed squares belong to one block only

- **WHEN** a step that shades by comparison is shown
- **THEN** every ringed square is in the first number's block and outside the
  other's, and both blocks' perimeters are drawn

## MODIFIED Requirements

### Requirement: Mosaic counts a board's answers by a bounded search

The game SHALL count a board's answers up to two by trial and error over its
deduction, assuming an undecided square shaded and then clear where the
deduction stops. It SHALL report one answer, several, none, or that it stopped
at its budget, which SHALL be counted in positions and never in time. A square
no number counts is free, so a board with one has several answers.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 3×3 board the rule finishes, on a 5×5 with
  one answer that the deduction does not reach, on a 3×3 with a lone 5 in the
  middle and on a 3×3 whose corner counts none and whose middle counts nine
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: A spent budget is neither answer

- **WHEN** the search is given fewer positions than a board needs
- **THEN** it reports that it stopped, and neither one answer nor several

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 3×3 to 5×5, the same with clues taken away and
  the same with one clue changed are each counted by shading or clearing one
  square at a time
- **THEN** the search reports one answer exactly where one picture fits,
  several where more do and none where none does

### Requirement: Mosaic's rule says when a block cannot meet its number

The deduction SHALL report a contradiction as soon as a number's block holds
more shaded squares than the number, or too few squares that are not clear to
reach it, whether or not every square of the block is decided. It SHALL report
one as well where a number needs more shaded squares beyond another's need
than it has empty squares outside the other's block.

#### Scenario: A block goes wrong with squares still undecided

- **WHEN** the search is given one position to try on a 3×3 board whose
  corner is 4 and whose middle is 3, and on one whose corner is 0 and whose
  middle is 6
- **THEN** it reports no answer for each
- **AND** on a 3×3 board with a lone 5 it reports that it stopped

#### Scenario: Two numbers are wrong only together

- **WHEN** the search is given one position to try on the 3×3 board `14g`, a
  corner 1 beside a 4
- **THEN** it reports no answer

### Requirement: An Unreasonable Mosaic board has one answer that the rule does not reach

At Unreasonable the generator SHALL hide clues while the search still proves
one answer within a budget of its own, and SHALL keep the board only when the
deduction, two numbers compared included, stops short on it. With aggressive
generation it SHALL try every clue. Without, it SHALL stop at the first clue
whose loss stops the deduction. It SHALL start from an Easy board, and on some
tries from every clue showing, which the smallest boards are dealt from.

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** `newDesc` produces Unreasonable boards from 3×3 to 6×5, with
  aggressive generation on and off
- **THEN** the deduction leaves each unfinished
- **AND** exactly one picture fits each, by a count that has no search in it

#### Scenario: A board keeps its numbers where generation is not aggressive

- **WHEN** an Unreasonable 10×10 board is dealt from one seed with aggressive
  generation off and on
- **THEN** the first shows more numbers than the second

#### Scenario: The smallest and the largest boards carry the tier

- **WHEN** an Unreasonable 3×3, 3×20, 30×30, and without aggressive
  generation 50×50 and 100×100 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: A pasted Mosaic board opens at the difficulty it needs

A board that arrives as a game ID SHALL open as Easy where the deduction, the
comparison of two numbers included, finishes it, and as Unreasonable where it
has exactly one answer that the deduction does not reach, whatever lower
difficulty its ID states. A board with several answers SHALL be refused as
having more than one solution, and a board with none as one whose clues
contradict each other.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 5×5 ID whose board has one answer the deduction does not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `5x5du`

#### Scenario: A board with several answers or none is refused

- **WHEN** a 3×3 board with a lone 5, and a 3×3 board whose corner counts
  none and whose middle counts nine, are entered
- **THEN** the first is refused as having more than one solution and the
  second as contradictory

#### Scenario: A board the comparison finishes opens as Easy

- **WHEN** a 5×5 board that one number at a time does not finish and two
  numbers compared do is entered with no difficulty letter, and with `du`
- **THEN** the first opens as Easy, and the second keeps the difficulty it
  was saved at

### Requirement: Mosaic's hint stops where the rule does

The hint SHALL never run the search. Its plan SHALL hold the steps the
deduction forces from the player's marks, one number at a time and then two
numbers compared, and no others, and where nothing is forced it SHALL refuse
with the collection's sentence that deduction has run out. It SHALL go on from
the squares the player then marks.

#### Scenario: The hint stops, and goes on from a square tried rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** the board is unfinished and holds no mistake, and the refusal is the
  collection's sentence that deduction has run out
- **AND** a square marked wrongly there is reported by the mistake check
- **AND** with a square marked as the solution has it wherever the hint
  stops, the hint finishes the board
