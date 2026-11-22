## ADDED Requirements

### Requirement: Controls: Range's controls are its description's

Range's buttons, keys and drag SHALL be those the fill engine derives from
its description (`described-fill-game`): a click round blank, shaded and
crossed out, a right click the other way; `S` and `X`; a sweeping drag;
Shift-arrow crossing out. A numbered square SHALL be dealt clear and fixed.
Every move SHALL be an engine `Edit`, and a hand-written Range's save is
not read (the owner's decision, 2026-11-22).

#### Scenario: Two left clicks

- **WHEN** a blank square is clicked twice with the left button
- **THEN** it is shaded after the first click and crossed out after the
  second

#### Scenario: A numbered square

- **WHEN** a board is dealt
- **THEN** each numbered square holds clear and is fixed

### Requirement: Look: A Range number is plain

A Range number SHALL be drawn on its square and SHALL NOT turn faint, and
the status bar SHALL count no numbers left: a number sees along its row and
its column as far as the shaded squares let it, which is no block of
squares (`play.plain`). A step's outline SHALL take a number it passes
through as one of its squares, and SHALL circle none.

#### Scenario: A step outlines a square with a number

- **WHEN** a pinned step of each kind that reads a number is drawn
- **THEN** no number on the board is circled

## MODIFIED Requirements

### Requirement: Params: Range params are refused outside their bounds

Range's description SHALL refuse a `w + h` above 128, which overflows the
cell encoding, and a grid with both dimensions at most 2 (1×1, 1×2, 2×1 and
2×2), which admits no good puzzle (`play.bounds`). It SHALL refuse no size
for the time its deal takes, at either difficulty: a player can stop a deal.

#### Scenario: Invalid params are rejected

- **WHEN** a 2×2 grid's params are checked
- **THEN** they are refused

#### Scenario: The largest boards are asked for at both difficulties

- **WHEN** a 64×64, a 2×126 and an 18×18 board are checked for dealing at
  Easy and at Unreasonable
- **THEN** none is refused
- **AND** a 64×65 board is refused for its width plus height

### Requirement: Generation: An Unreasonable Range board is an Easy one stripped further, a symmetric pair at a time

At Unreasonable the deal SHALL strip a board of the lowest tier further, the
search tier's deal (`engine/fill/search.ts`): each symmetric pair of numbers
still showing SHALL go while the search still proves one answer, so its
numbers SHALL stay two-way rotationally symmetric (`deal.symmetric`).

#### Scenario: A dealt Unreasonable board needs search and has one answer

- **WHEN** a 6×9 board is dealt at Easy and at Unreasonable
- **THEN** each square with a number has a number on the square a half turn
  takes it to
- **AND** the Unreasonable board's ladder stops short of it, and the search
  proves it has one answer

#### Scenario: The smallest boards and the largest preset carry the tier

- **WHEN** an Unreasonable 2×3 board, a 3×4 board and an 11×16 board is dealt
- **THEN** each is dealt, and the lowest difficulty that solves it is
  Unreasonable

### Requirement: Look: A Range cell in error keeps its content

A cell in error SHALL keep its content. Two shaded squares side by side
SHALL take a diamond on the side they share, and a broken number a badge in
the error color. A shaded piece SHALL keep its own color.

#### Scenario: A shaded cell in error is still a shaded piece

- **WHEN** two orthogonally adjacent squares are both shaded
- **THEN** each holds a piece in the shaded color
- **AND** a diamond in the error color sits on the side they share

### Requirement: Hint: A shaded premise of a Range hint takes a doubled outline

The cited shaded square of a `besideShaded` deduction SHALL be outlined as
the step's evidence, and keep its piece; the square it forces SHALL be
ringed.

#### Scenario: A cited black square is outlined apart from the forced cell

- **WHEN** a `besideShaded` hint is displayed (a shaded square forces an
  adjacent square to be clear)
- **THEN** the cited shaded square is outlined and the forced square is
  ringed

## REMOVED Requirements

### Requirement: Rules: Range's move is a list of cell-sets

**Reason**: Range is born from its description, and its moves are the fill
engine's `Edit`s.

**Migration**: "Controls: Range's controls are its description's".

### Requirement: Controls: Range's two verbs cycle a cell's three states in opposite directions

**Reason**: The cycle is the fill engine's `play.click: cycle`.

**Migration**: "Controls: Range's controls are its description's".

### Requirement: Controls: Range's keyboard cursor marks white with shift

**Reason**: The Shift stroke is the fill engine's.

**Migration**: "Controls: Range's controls are its description's".

### Requirement: Solver: Range's Solve is one move that sets every non-clue cell

**Reason**: Solve is the fill engine's, the same for every born game.

**Migration**: `described-fill-game`.
