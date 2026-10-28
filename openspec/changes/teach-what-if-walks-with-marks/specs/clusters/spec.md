## MODIFIED Requirements

### Requirement: Params: A Clusters params string is its declared codec's, and one with no difficulty is Easy

Clusters' params and their encoding SHALL be those its `paramConfig` and its
declared codec give (`engine-params`, "A game declares its params encoding
once, and both codec halves are derived"), with no departure from the codec
grammar. A params string that carries no difficulty SHALL decode to Easy. The
tier letters SHALL be `e`, `t` and `u`.

#### Scenario: The Normal preset's two forms

- **WHEN** `7x7dt` is decoded
- **THEN** it is a 7×7 board at Normal, whose short form is `7x7`
- **AND** `7x7` decoded and encoded in full is `7x7de`

### Requirement: Hint: Solve and the hint use the deeper rung at every tier

`solve` and `hint` SHALL use the deeper rung whatever tier the board was
generated at: they are "try as hard as you can", and the rung costs nothing on
a board that does not need it. Solve SHALL take the answer the search proves.
The hint of a board dealt at Easy SHALL nonetheless need no count step at all.

#### Scenario: Solving an Easy board

- **WHEN** a board generated at Easy is solved
- **THEN** the solver runs with the count available and fills the board to
  its unique solution

#### Scenario: An Easy board is hinted to the end without a chain

- **WHEN** a board generated at Easy is followed hint by hint from its start
- **THEN** every step is a single-cell deduction and the board ends solved

### Requirement: Hint: The tile the other color would break is outlined, in a hue the error frame does not use

What the ring and the outline of a step stand for SHALL be the legend's
(`hintMarks`). When the contradiction lands on a tile other than the target,
that tile SHALL carry a second mark, the outline, as a frame in a hue the
live-error frame does not use, and a count step SHALL outline both tiles it
reads the same way. When the contradiction lands on the target itself, the
step SHALL outline no tile for it.

#### Scenario: The word and the ring go together

- **WHEN** a hint step is displayed
- **THEN** its sentence says "outlined" of a tile exactly when a tile other
  than the target carries the second mark

### Requirement: Hint: A Clusters hint is refused where it cannot deduce

A hint SHALL be refused, and SHALL NOT deduce onward, when the deduction runs
into a contradiction from the player's position. `findMistakes` names a wrong
tile wherever the board has one answer, so that refusal is reached only on a
description without one. Where the deduction stops short, as on an
Unreasonable board, the hint SHALL give the steps it has, and refuse with
`DEDUCTION_EXHAUSTED` only where it has none.

#### Scenario: Several wrong tiles, none flagged

- **WHEN** a dealt board holds several tiles that disagree with its solution,
  none of them breaking a local rule, and a hint is asked for
- **THEN** the banner asks for the highlighted mistakes to be fixed, and each
  of those tiles is highlighted

## REMOVED Requirements

### Requirement: Generation: Clusters offers difficulty tiers over its two deduction levels

**Reason**: Normal was the single-cell rule run from a supposed color, which the owner ruled is Search (`retire-hint-ordinals` D4), and Clusters gained Unreasonable.
**Migration**: "Generation: Clusters' tiers are the single-cell rule, the count, and a search" replaces it.

### Requirement: Hint: A lookahead deduction is one step showing its whole forcing chain

**Reason**: No hint shows a supposition below Unreasonable.
**Migration**: "Hint: A count step names both tiles it reads" replaces it.

### Requirement: Hint: A lookahead stall takes the shortest forcing chain

**Reason**: The lookahead is gone.
**Migration**: None.

## ADDED Requirements

### Requirement: Generation: Clusters' tiers are the single-cell rule, the count, and a search

**Easy** SHALL be the single-cell proof by contradiction. **Normal** SHALL add the count: tile B's count over the squares it shares with tile A bounds how many of them take A's color, which settles A's other empty neighbors. **Unreasonable** SHALL be a board the two do not finish that a search proves has one answer; a board dealt at Normal before 2026-10-28 that needs the old supposition opens there.

#### Scenario: The harder tier needs the deeper reasoning

- **WHEN** a board generated at Normal is solved using only the single-cell rule
- **THEN** the solver does not reach a solution
- **AND** solving the same board with the count completes it

#### Scenario: An Unreasonable board needs a search

- **WHEN** a board is generated at Unreasonable
- **THEN** the count does not finish it, and the search finds exactly one answer

### Requirement: Hint: A count step names both tiles it reads

A count step SHALL ring the cell it colors and outline the two tiles it reads, named by color and kind, or by order where those agree, and SHALL say where the first tile's color must or may only be among the squares both touch.

#### Scenario: A dot's last color is among the shared squares

- **WHEN** a yellow dot that needs one more yellow shares squares with a purple dot that leaves at least one of them yellow
- **THEN** the step says "The outlined yellow dot's last yellow must also touch the outlined purple dot, so this cell must be purple." of the dot's other empty neighbor
