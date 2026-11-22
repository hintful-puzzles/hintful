## MODIFIED Requirements

### Requirement: Rules: Light Up ships findMistakes

`findMistakes` SHALL report every square the player filled with what the
answer does not give it: a bulb where the answer has none, and a cross where
it has a bulb. A square the player left open SHALL never be reported. A
reported square SHALL be outlined when the check hands `redraw` its mistakes.

#### Scenario: Check & Save flags a wrong bulb

- **WHEN** `findMistakes` runs on a board with a bulb where the unique
  solution has none
- **THEN** that square is returned as a mistake and outlined on the next
  redraw

#### Scenario: A merely-unhelpful mark is not flagged

- **WHEN** a cross sits on a square the solution leaves without a bulb
- **THEN** it is not reported as a mistake

### Requirement: Rules: Light Up renders with live error feedback

The live errors SHALL be where the board breaks a rule, as the fill engine
marks them (`described-fill-game`). An open square a bulb lights SHALL be read
as holding no bulb, whether or not it is crossed. A numbered wall that can no
longer have its bulbs SHALL take the red badge. A bulb another bulb lights
SHALL be a disc in the full error color. A cross on a square nothing can
light any more SHALL be drawn in the error color.

#### Scenario: Overlapping bulbs render as errors

- **WHEN** two bulbs light each other
- **THEN** both are drawn in the error color

#### Scenario: A wrong clue reads on its wall in the dark scheme

- **WHEN** a numbered wall has more adjacent bulbs than its clue
- **THEN** its number sits on a disc in the full error color, not that color's
  wash

#### Scenario: A lit square starves a number

- **WHEN** a numbered 2 has two open neighbors, and a bulb elsewhere lights one
  of them
- **THEN** the 2 takes the red badge, though neither square is crossed

#### Scenario: A square nothing can light

- **WHEN** a square and every square that could light it hold a cross
- **THEN** its cross is drawn in the error color

### Requirement: Params: Light Up's parameters

Params SHALL be the fill engine's (`described-fill-game`): `w`, `h`, the
tier, and the description's two options, the percentage of walls (`b`) and
the symmetry (`s`: none, 2-way mirror, 2-way rotational, 4-way mirror or
4-way rotational, in that order). They SHALL be encoded `{w}x{h}b{walls}s{symmetry}d{tier}`
in full, the tier `0`, `1` or `2`, and `{w}x{h}` in the short form.

#### Scenario: Params round-trip

- **WHEN** the params of a 10×10 Normal board with 20% walls and 2-way
  rotational symmetry are encoded in full
- **THEN** the result is `10x10b20s2d1` and decoding it round-trips the params

### Requirement: Params: Light Up's params are validated

Validation SHALL refuse, of full params, a share of walls outside 5 to 100,
4-way rotational symmetry on a grid that is not square, either 4-way
symmetry on a grid whose longer side is below 3, and a board on which no
puzzle of the tier is dealt: above Easy a 2×2; at Normal a board whose
longer side is below 4 under a 4-way symmetry; and at Unreasonable a board of
fewer than 9 squares, or one whose longer side is below 4 under any
symmetry.

#### Scenario: Invalid params are rejected

- **WHEN** full params carry a share of walls outside 5 to 100, or 4-way
  rotational symmetry on a non-square grid
- **THEN** they are refused with a non-null error string

#### Scenario: 4-way mirror symmetry on a non-square grid

- **WHEN** a 5×7 grid with 4-way mirror symmetry is validated
- **THEN** the symmetry is not refused

#### Scenario: A board too small for its tier

- **WHEN** full params ask for a 2×2 above Easy, a 3×3 or 2×3 at Normal under
  a 4-way symmetry, or at Unreasonable a board of fewer than 9 squares or a
  3×3 under any symmetry
- **THEN** they are refused, saying that no such puzzle is of that tier

#### Scenario: A 4×4 turned four ways is dealt at Unreasonable

- **WHEN** full params ask for an Unreasonable 4×4 with 4-way rotational
  symmetry
- **THEN** they are not refused, and a board is dealt

#### Scenario: A board too small for its tier arrives written

- **WHEN** a game ID carries a 2×2 Normal board with its description
- **THEN** the params are accepted and the board loads

### Requirement: Params: A Light Up label names its walls and symmetry only when they are unusual

The label of a set of params SHALL add `N% walls` after the tier only when
the share of walls is not 20. It SHALL add the symmetry only when it is not
the usual one for the size: a preset board's own, and 2-way rotational on
any other board. The symmetry SHALL read as its name in the Custom dialog,
and as `no symmetry` for none.

#### Scenario: A board with more walls and no symmetry

- **WHEN** the params `7x7b30s0d0` are labeled
- **THEN** the label reads "7x7 Easy, 30% walls, no symmetry"

#### Scenario: The usual symmetry depends on the size

- **WHEN** the params `7x7b20s4d0` and `10x10b20s2d1` are labeled
- **THEN** they read "7x7 Easy" and "10x10 Normal"
- **AND** `10x10b20s4d1` reads "10x10 Normal, 4-way rotational"

### Requirement: Description: Light Up descriptions use the upstream run-length encoding

The desc SHALL be the fill engine's `digits` segment with letters
(`described-fill-game`) over the grid row-major: a digit `0` to `4` a
numbered wall, `B` a wall with no number, and a letter a run of open
squares, upstream's encoding. `validateDesc` SHALL reject unknown characters,
short descs and over-long descs.

#### Scenario: Upstream's description is read

- **WHEN** `Ba1f0a0` is read for `3x4`
- **THEN** the corners are walls, the top right numbered 1 and the bottom two
  numbered 0, and the other squares are open

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with an invalid character or a
  length not matching `w × h`
- **THEN** it returns a non-null error string

### Requirement: Generation: Light Up generates solver-gated boards

A board SHALL be dealt by the fill engine from the description
(`described-fill-game`): walls placed first at the share and symmetry asked
for, then bulbs, each on a random square no bulb lights, with what the ladder
decides from them, until every square is decided; every wall then numbered.
The numbers SHALL be hidden, each kept hidden only while the ladder still
finishes the board, at Easy first and then at each tier up to the board's,
and a board the tier below finishes SHALL be dealt again.

#### Scenario: A removal that breaks the puzzle is put back

- **WHEN** hiding a number leaves the board one the ladder does not finish at
  the tier being hidden at
- **THEN** the number is shown again

### Requirement: Generation: The generator adds walls when no board turns up

After every 20 draws the deal refuses, the share of walls SHALL go up 5,
to at most 90, and once past it SHALL start again from the share asked for:
the description's `ramp` (`described-fill-game`).

#### Scenario: A ramp from 20% reaches the top

- **WHEN** a deal asked for at 20% walls has refused every draw up to 90%
- **THEN** the next draws are at 20% again

### Requirement: Look: Light Up draws walls, bulbs and light on the collection's quiet surface

`redraw` SHALL draw an open square no bulb lights as the collection's cell
surface. A square a bulb lights, its own included, SHALL be washed yellow,
under a bulb or a cross. A wall SHALL be a solid block in the collection's
wall color over its whole tile, grid lines included, so that adjacent walls
read as one block, and a number on it SHALL be white in both schemes.

#### Scenario: An unlit square is surface and a lit one is washed

- **WHEN** a board with one bulb is drawn
- **THEN** the bulb's square and the squares it lights are washed
- **AND** every other open square is the cell surface

### Requirement: Look: Light Up's cursor and completion flash

The keyboard cursor and the completion flash SHALL be the fill engine's
(`described-fill-game`): brackets at the corners of the cursor's square, and
a sweep from the bottom left. A wall SHALL be drawn as on any other frame
while the flash passes.

#### Scenario: The cursor on a bulb

- **WHEN** the cursor is on a square that holds a bulb
- **THEN** the brackets are drawn at the square's corners and the bulb's disc
  is not overdrawn

#### Scenario: A wall in the bottom-left corner

- **WHEN** a board whose bottom-left square is a wall is won
- **THEN** the wall is drawn as on any other frame

## ADDED Requirements

### Requirement: Controls: Light Up's controls are the fill engine's

Light Up's controls SHALL be the fill engine's (`described-fill-game`): a
left click SHALL toggle a bulb and a right click a cross, a click on a square
holding the other SHALL empty it, and `L` SHALL place a bulb and `X` or `I` a
cross. A right drag SHALL cross the squares it passes; a left drag SHALL
place one bulb, where it began. A wall SHALL never change. A hand-written
Light Up's save is not read (the owner's decision, 2026-11-22).

#### Scenario: Left-click places and toggles a bulb

- **WHEN** the player left-clicks an empty open square, then left-clicks it
  again
- **THEN** a bulb appears, lighting its row and column to the nearest walls,
  and then disappears

#### Scenario: A click on the other's mark empties the square

- **WHEN** the player left-clicks a square carrying a cross
- **THEN** the square is empty, and holds neither a bulb nor a cross

#### Scenario: A right-drag crosses a row

- **WHEN** the player right-drags across three empty open squares
- **THEN** all three carry a cross
- **AND WHEN** the player left-drags across three empty open squares
- **THEN** only the first holds a bulb

### Requirement: Hint: Light Up draws a hint's evidence with the fill engine's marks

A step SHALL ring the squares it decides and draw its evidence with the fill
engine's hint marks (`described-fill-game`): the number or the dark square
the step is about outlined apart, in the color of the words that name it,
and the other squares its reason rests on outlined.

#### Scenario: A forced light

- **WHEN** a step puts a bulb on the only square left that can light a dark
  square
- **THEN** the dark square is outlined apart, and the other squares that
  could light it are outlined

#### Scenario: A hint step's marks stay inside its evidence

- **WHEN** any grouped clue step is displayed
- **THEN** every target square lies within the narrated clue's neighbor set

### Requirement: Hint: The Light Up hint carries on from its last step, then column by column

The hint SHALL take, of the firings the ladder could make, the one that
carries on from the squares its last step read and decided, and otherwise
the first in the ladder's order: the squares column by column from the left,
each column from the top. A square a bulb lights SHALL never be a step's: the
wash already shows it holds no bulb.

#### Scenario: The 1 beside the 4

- **WHEN** a hint is asked for on the 7×7 board `c2mBc2a1a4aBc2m1c` with
  nothing placed, whose fourth row reads 2, open, 1, open, 4, open, wall
- **THEN** the first step puts a bulb on each of the 4's four neighbors
- **AND** the second step is the 1 to its left, which now has its bulb and
  crosses out its other free neighbors

### Requirement: Params: Light Up reads a params string that leaves a field out as the defaults

A params string with no `d` SHALL decode as Easy, one with no `b` as 20%
walls, and one with no `s` as 2-way rotational symmetry. The legacy `r` flag
SHALL decode as Unreasonable.

#### Scenario: Lenient decode

- **WHEN** `18x10` is decoded
- **THEN** it is an Easy board with 20% walls and 2-way rotational symmetry
- **AND** `7x7b20s4r` decodes as Unreasonable

## REMOVED Requirements

### Requirement: Params: Light Up reads a params string that leaves a field out, and the legacy r

**Reason**: Light Up's params are the fill engine's codec; a missing symmetry
is the default 2-way rotational on every grid, where it was 4-way rotational
demoted on a grid that is not square. Stated in "Params: Light Up reads a
params string that leaves a field out as the defaults".

**Migration**: A params string with no `s` on a square grid deals 2-way
rotational walls.

### Requirement: Controls: Light Up accepts pointer and cursor input

**Reason**: The controls are the fill engine's, in which a click on a square
holding the other mark empties it; stated in "Controls: Light Up's controls
are the fill engine's".

**Migration**: None.

### Requirement: Hint: Light Up draws a hint's evidence by what it is

**Reason**: A step's marks are the fill engine's outlines; stated in "Hint:
Light Up draws a hint's evidence with the fill engine's marks".

**Migration**: None.

### Requirement: Hint: The Light Up hint carries on from its last step, by the rules in order

**Reason**: The order is the description's, column by column, the discounts
among the rest by tier; stated in "Hint: The Light Up hint carries on from
its last step, then column by column".

**Migration**: None.

### Requirement: Controls: Completing a Light Up board hides the cursor

**Reason**: The cursor is the fill engine's, which leaves it shown on a
finished board, as in every born game.

**Migration**: None.

### Requirement: Generation: Normal adds the overlapping-set discount

**Reason**: Normal's techniques are the description's (`darkSet` and
`clueSet`), stated in "Generation: Light Up grades boards with a tiered
deductive solver" and checked sound from their statements.

**Migration**: None.

### Requirement: Hint: A Light Up hint target is ringed with no bulb or mark previewed

**Reason**: A step's ring is the fill engine's (`described-fill-game`), stated
in "Hint: Light Up draws a hint's evidence by what it is".

**Migration**: None.
