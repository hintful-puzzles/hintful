# path Specification Delta — faster-harder-path

## MODIFIED Requirements

### Requirement: Params: Path's params are its declared codec's

The params SHALL be the width, the height and the tier, written `<w>x<h>d<tier letter>` with the tier letters `e`, `n` and `t`. The tier SHALL be written only in the full form; a string without it SHALL decode to Normal. Width and height SHALL each be at least 3, and their product at most 400.

#### Scenario: A params string round-trips

- **WHEN** `6x4de` is decoded and encoded in full
- **THEN** the result is `6x4de`

#### Scenario: Tricky round-trips

- **WHEN** `10x10dt` is decoded and encoded in full
- **THEN** the result is `10x10dt`

### Requirement: Generation: A tier is the rung a board needs

A board SHALL be dealt only where the ladder finishes it, which proves it has exactly one answer. An Easy board SHALL be finished by the Easy rung alone; a Normal board SHALL need the lookahead at least once; a Tricky board SHALL need the long lookahead at least once. No path of a dealt board's answer SHALL be a straight line of four squares or more, and none SHALL touch itself except along its own line.

#### Scenario: A Normal board needs the lookahead

- **WHEN** a board is dealt at Normal
- **THEN** the Easy rungs alone do not finish it, and with the lookahead they do

#### Scenario: A Tricky board needs the long lookahead

- **WHEN** a board is dealt at Tricky
- **THEN** the ladder capped at Normal does not finish it, and uncapped it does

### Requirement: Solver: The ladder and its lookahead

The Easy rung SHALL be: a square whose open edges are as many as the lines it still needs takes a line on each. Normal's rung SHALL suppose a line or a cross on an open edge, run the Easy rung from there until the board breaks, and give the edge the other mark where the firings the break needs number at most six; Tricky's, the long lookahead, where they number at most twelve.

#### Scenario: The lookahead settles an edge

- **WHEN** supposing a cross on an edge leads, by the Easy rungs, to a square with no way left for its line
- **THEN** the edge takes a line

#### Scenario: A walk is counted by what its break needs

- **WHEN** a supposition's walk fires squares its break never reads
- **THEN** those firings count toward neither rung's limit, and the hint numbers none of them
