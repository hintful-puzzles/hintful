## ADDED Requirements

### Requirement: Singles' keyboard cursor wraps at the grid's edges

The arrow keys SHALL carry the cursor round the grid: left from the first
column to the last, up from the first row to the last, and the same the other
way.

#### Scenario: Left from the first column

- **WHEN** the cursor is on the top-left square of a 6×6 board and Left is
  pressed
- **THEN** the cursor is on the last square of the top row

### Requirement: Three or four matching numbers at a Singles corner are shaded

In the 2×2 block at a corner of the grid the hint SHALL shade: the corner
square and the one diagonally inside it, as one step, where all four numbers
match; the corner square, where it matches both its neighbors; and the square
diagonally inside, where it matches both of the corner's neighbors. The
sentence SHALL say that keeping the square unshaded would shade both
neighbors and box the corner in.

#### Scenario: Four matching numbers

- **WHEN** the four squares at a corner all hold 5
- **THEN** one step shades the corner and the square diagonally inside it, and
  says "This corner 5 matches both its outlined neighbors; keeping it *not
  shaded* would make both *shaded* and box it in, so it and the 5 diagonally
  inside must be *shaded*.", each italic word being the collection's word for
  that state

#### Scenario: The inner square matches the corner's neighbors

- **WHEN** a corner holds 6, both its neighbors hold 3 and the square
  diagonally inside holds 3
- **THEN** the step shades the inner square and says "This inner 3 matches
  both outlined 3s flanking the outlined corner 6; keeping it *not shaded*
  would make both *shaded* and box the corner in, so it must be *shaded*."

### Requirement: Two pairs in neighboring Singles lines force two squares unshaded

Where two equal numbers share a row or column, and the next row down or column
to the right holds an equal pair of its own, one of them beside a number of
the first pair and the other diagonally beside the first pair's other number,
the hint SHALL circle, as one step, the two squares that each touch both of
those last two numbers: shading either would force two shaded squares side by
side.

#### Scenario: Pairs of different numbers, one square still undecided

- **WHEN** a pair of 3s in one column and a pair of 6s in the next are lined
  up so, and one of the two squares is already circled
- **THEN** the step circles the other, which holds a 3, and says "There's a pair of 3s in one
  column and a pair of 6s in the next, lined up so that shading the ringed 3
  would force one of the 3s and one of the 6s to be *shaded* next to each
  other, and *shaded* squares can't touch, so it must be *not shaded*."

### Requirement: Singles' hint takes the number patterns once and the joining rules last

The hint SHALL use every technique whatever the board's difficulty. Its plan
SHALL open with what the player's own shaded and circled squares force, then
take every sandwich, touching pair, corner and neighboring-line pair the
numbers show, in that order, then what each square so decided forces in turn.
An unshaded square's last way out SHALL be taken only when none of those is
left, and a square whose shading would split the unshaded squares only when
no last way out is left either.

#### Scenario: A fresh board opens on its number patterns

- **WHEN** a plan is asked for on the fresh 6×6 board
  `146214162623436526534361613462465334`
- **THEN** it opens with four sandwiches, a corner and four neighboring-line
  pairs, before any step that reasons from a square already decided

#### Scenario: An Easy board is taught a neighboring-line pair

- **WHEN** a plan is asked for on a dealt Easy board whose numbers show a
  neighboring-line pair
- **THEN** the plan holds that step, though the solver certifies an Easy board
  without it
