## MODIFIED Requirements

### Requirement: Netslide can be solved from any position

Following Netslide's hint SHALL finish the board from any position a player
can reach, on any preset, whether or not the game came with a known answer,
and SHALL never walk the player in circles. The hint's searches are bounded:
where they return no plan the hint SHALL refuse as out of reach, and SHALL NOT
narrate a move it cannot justify.

#### Scenario: Following the hint finishes a board that came with no answer

- **WHEN** a hint is requested on any preset, with no `aux` available, and its
  plan is followed to the end, repeatedly, as the midend does
- **THEN** a finished board is reached

### Requirement: Netslide solves from the generator's grid when it has one

The game has no deduction solver. `newDesc` SHALL save the unshuffled grid as
`aux`, and `solve` SHALL replay it when the game came with one. On a board
that carries no `aux`, a game created from a `params:desc` id such as a shared
link or a bookmark, `solve` SHALL recover the finished grid from the board
itself, and SHALL NOT refuse it as upstream does. Only a board with no finished
grid its tiles can be slid into, which no generator writes, SHALL be refused.

#### Scenario: Solve on a freshly generated game

- **WHEN** Solve is invoked on a game created from a random seed
- **THEN** the board is restored to the generator's unshuffled grid and is
  reported solved-with-help

#### Scenario: Solving a game built from a descriptive id

- **WHEN** Solve is used on a game created from a `params:desc` id
- **THEN** the board is completed, and Solve is not refused as having no
  solution to give

#### Scenario: A hand-typed board with no wires

- **WHEN** Solve is used on a game created from a hand-typed id whose tiles
  carry no wires at all
- **THEN** the board is dealt and Solve is refused with "This game ID doesn't
  include its solution, and this puzzle has no solver to work one out."
