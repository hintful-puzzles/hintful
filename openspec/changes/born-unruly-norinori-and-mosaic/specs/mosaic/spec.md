## ADDED Requirements

### Requirement: Rules: A Mosaic click cycles a square, and a right click cycles it back

A click SHALL take a cell around the cycle undecided, shaded, clear, and a
right click round the other way, clear first, as the description's `play`
says. A drag
SHALL sweep the value the pressed cell took over the cells it crosses. Every
move SHALL be an engine `Edit`; a saved game's `paint` or `toggle` move is
not read, since the born game breaks Mosaic's saves (the owner's decision,
2026-11-22).

#### Scenario: Clicking cycles a cell

- **WHEN** an undecided cell is clicked three times
- **THEN** it passes shaded → clear → undecided

#### Scenario: A right click goes the other way

- **WHEN** an undecided cell is right-clicked twice
- **THEN** it passes clear → shaded

### Requirement: Controls: Mosaic's controls are its description's, and a finished board takes them

Mosaic's buttons, keys and drag SHALL be those the fill engine derives from
its description (`described-fill-game`). A finished board SHALL take input
as any other game's does: a move may take it off its solution, and its status
follows (`ts-engine`, "A game's status is judged from the board alone").

#### Scenario: A finished board takes a click

- **WHEN** the board is solved and the player clicks a cell
- **THEN** the cell changes, and the board is no longer solved

## REMOVED Requirements

### Requirement: Rules: A Mosaic toggle cycles a mark and a paint fills only unmarked cells

**Reason**: Mosaic is born from its description: every move is an engine
`Edit`, and the hand-written `toggle` and `paint` moves are gone with the
saves that held them (the owner's decision, 2026-11-22).

**Migration**: "Rules: A Mosaic click cycles a square, and a right click
cycles it back".

### Requirement: Controls: Mosaic takes its buttons, keys and drag from its verbs, and a finished board takes none

**Reason**: Mosaic alone of every game froze its input once solved; the
born game takes input as every game does (consistency, pre-approved
2026-11-21).

**Migration**: "Controls: Mosaic's controls are its description's, and a
finished board takes them".

## MODIFIED Requirements

### Requirement: Hint: Mosaic's hint says a comparison of two numbers

A hint step that compares two numbers SHALL name both by their values, and by
where each sits where the values are equal. The squares it rings SHALL be
squares only one of the two counts. A step that shades SHALL say how many more
the first needs than the second, and which ringed squares that makes shaded
and which clear. A step that clears SHALL say that both need the same and that
one's squares all lie in the other's block.

#### Scenario: The ringed squares belong to one block only

- **WHEN** a step that shades by comparison is shown
- **THEN** every ringed square is outside one of the two blocks, both numbers
  are circled and both blocks are outlined

#### Scenario: Two 7s side by side

- **WHEN** a step that shades compares two 7s in one row
- **THEN** it opens "The left 7 needs 2 more shaded squares than the right
  7", or the same with left and right exchanged, and names the block each
  ringed square lies outside of as the left or the right 7's

### Requirement: Hint: One Mosaic number alone settles its block

A number whose block already holds as many shaded squares as it counts SHALL
make every open square of the block clear. A number whose block holds only
as many open squares as it still needs SHALL make every open square of the
block shaded.

#### Scenario: The three sentences of a small board

- **WHEN** the hint is followed on the 3×3 board `d7a2a4`
- **THEN** it says "This 4 needs 4 shaded squares and has only 4 open
  squares, so each ringed square must be shaded.", then "This 2 already has
  its 2 shaded squares, so each ringed square must be clear.", then "This 7
  needs 3 more shaded squares and has only 3 open squares, so each ringed
  square must be shaded."

#### Scenario: A number on a shaded square

- **WHEN** the number a step names sits on a shaded square
- **THEN** its circle is drawn in the color of the number

### Requirement: Hint: Mosaic's hint asks the numbers in reading order, and the nearest pair first

The plan SHALL take its steps in the order the description's ladder fires
them: one number alone before two compared (`described-fill-game`).

#### Scenario: The first number that decides is not the first number

- **WHEN** the hint is asked on the 3×3 board `d7a2a4`, whose 7 and 2 come
  before its 4 in reading order and decide nothing as dealt
- **THEN** the first step is the 4's

### Requirement: Generation: An Unreasonable Mosaic board is an Easy one with clues the search can spare hidden

At Unreasonable the generator SHALL start from an Easy board, and on one try
in eight from every clue showing, which the smallest boards are dealt from.
It SHALL hide clues while the search still proves one answer. With aggressive
generation it SHALL try every clue. Without, it SHALL stop at the first clue
whose loss stops the deduction, two numbers compared included.

#### Scenario: A board keeps its numbers where generation is not aggressive

- **WHEN** an Unreasonable 10×10 board is dealt from one seed with aggressive
  generation off and on
- **THEN** the first shows more numbers than the second

#### Scenario: The smallest and the largest boards carry the tier

- **WHEN** an Unreasonable 3×3, 3×20, 30×30, and without aggressive
  generation 50×50 and 100×100 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable
