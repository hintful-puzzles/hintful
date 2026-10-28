## MODIFIED Requirements

### Requirement: Params: Path's params are its declared codec's

The params SHALL be the width, the height, the ruleset and the tier, written `<w>x<h>[z]d<tier letter>`: `z` for the Path ruleset and nothing for Pairs, so a string written before the game had rulesets decodes to Pairs, and the tier letters `e`, `n`, `t` and `u`. The tier SHALL be written only in the full form; a string without it SHALL decode to Normal. Width and height SHALL each be at least 3, and their product at most 400.

#### Scenario: A params string round-trips

- **WHEN** `6x4de` is decoded and encoded in full
- **THEN** the result is `6x4de`

#### Scenario: Tricky round-trips

- **WHEN** `10x10dt` is decoded and encoded in full
- **THEN** the result is `10x10dt`

#### Scenario: The Path ruleset round-trips

- **WHEN** `6x6zdt` is decoded and encoded in full
- **THEN** the result is `6x6zdt`, and `6x6dt` decodes to Pairs

### Requirement: Generation: A Path board is one path, its numbers and walls stripped

A Path board SHALL be dealt only where it needs exactly the tier asked for. The 1 and the highest number SHALL sit on the ends of a path through every square, and every wall SHALL lie on an edge that path does not take, and be one the board needs at its tier with the numbers it has.

#### Scenario: A dealt Path board has one answer

- **WHEN** a 5x5 board is dealt under Path
- **THEN** a search that walks every path from the 1 finds exactly one answer

### Requirement: Solver: Solve plays the answer the ladder finds

Solve SHALL draw the answer's lines over the whole board, from the numbers as dealt, and take every other mark off. Where the ladder stops short, the answer SHALL come from a search over the ladder, so an Unreasonable board, and one dealt at Normal or Tricky before their rungs became Checks, has Solve and the mistake check.

#### Scenario: Solve finishes a board

- **WHEN** Solve is pressed on any dealt board
- **THEN** the game's status is solved

#### Scenario: A board dealt before the Checks opens at Unreasonable

- **WHEN** `6x6zdt:b3d5g2e4d1c6e,nzpb`, dealt at Tricky by the lookahead, is opened
- **THEN** it opens as Path: 6x6 Unreasonable, and Solve finishes it

### Requirement: Hint: A step rings the edges it decides and outlines what it reads

A step SHALL ring the edges it decides, drawn as the line or cross it asks for, and outline what it reads: the square of a forced step; the edges a Check tries lines on, drawn thin as lines, and where they break. A weighed step SHALL outline the edges it weighs or the square, and say what the ruled-out pairs would do. No step SHALL ask for a cross on an edge the ladder counts as closed.

#### Scenario: A forced step names its square

- **WHEN** a square with one line has one open edge left
- **THEN** the step says "The outlined square has only one edge left for its second line, so this edge must be a line." and outlines that square

## REMOVED Requirements

### Requirement: Generation: A tier is the rung a board needs

**Reason**: Normal and Tricky named the lookaheads, which retired, and the game gained Unreasonable.
**Migration**: "Generation: A tier is the rung, or the search, a board needs" replaces it.

### Requirement: Solver: The ladder and its lookahead

**Reason**: The lookahead was a supposition followed by the Easy rung, which the owner ruled is Search (`retire-hint-ordinals` D4).
**Migration**: "Solver: The ladder and its Checks" replaces it; a board that needed it opens at Unreasonable.

## ADDED Requirements

### Requirement: Generation: A tier is the rung, or the search, a board needs

A board below Unreasonable SHALL be dealt only where the ladder finishes it. An Easy board SHALL be finished by the Easy rung alone; a Normal board SHALL need the Normal rung, and a Tricky board the Tricky rung, at least once. An Unreasonable board SHALL be one the ladder does not finish and a search proves has one answer. Under Pairs, no path of a dealt answer SHALL be a straight line of four squares or more, or touch itself except along its line.

#### Scenario: A Normal board needs the Normal rung

- **WHEN** a board is dealt at Normal
- **THEN** the Easy rung alone does not finish it, and with the Normal rung it does

#### Scenario: A Tricky board needs the Tricky rung

- **WHEN** a board is dealt at Tricky
- **THEN** the ladder capped at Normal does not finish it, and uncapped it does

#### Scenario: An Unreasonable board needs a search

- **WHEN** a board is dealt at Unreasonable
- **THEN** the ladder does not finish it, and the search finds exactly one answer

### Requirement: Solver: The ladder and its Checks

The Easy rung SHALL be: a square whose open edges are as many as the lines it still needs takes a line on each. Normal's rung SHALL cross out an edge whose line would break the board at once, and give a square needing two lines with three edges left the third where lines on the other two would. Tricky's SHALL weigh a square needing two lines with four edges left: what every pair that does not break shares is drawn, and an edge none takes is crossed out.

#### Scenario: A pair that breaks settles the third edge

- **WHEN** a square needs two lines from three open edges, and lines on two of them would join the 4 to the 1
- **THEN** the third edge takes a line

#### Scenario: Nothing is followed from a tried line

- **WHEN** a line would break the board only after the Easy rung fires from it
- **THEN** no rung below Unreasonable decides that edge from it

### Requirement: Description: A Pairs size too small for a tier is refused

A Pairs board SHALL be refused when dealt at a tier no board the generator lays at that size needs: Normal on a 3x3, 3x4 or 3x5; Tricky up to 4x5; Unreasonable on a 3x3, 3x4, 3x5 or 4x4. A board arriving with its desc at such a tier SHALL still open.

#### Scenario: A 4x4 Unreasonable deal is refused

- **WHEN** a Pairs board is dealt at 4x4 Unreasonable
- **THEN** it is refused, saying no 4x4 puzzle is Unreasonable
