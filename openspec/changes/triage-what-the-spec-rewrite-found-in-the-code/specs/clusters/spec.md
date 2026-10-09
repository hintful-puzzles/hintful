## MODIFIED Requirements

### Requirement: A Clusters hint step names the rule the other color would break

Each hint step SHALL explain why the move is forced, not merely which cell to
color. It SHALL name the rule that the opposite coloring would violate: a tile
wholly sealed off from its own color, a given dot that would touch a second
same-color tile, or a plain tile that could no longer touch two tiles of its
own color. It SHALL state the premise, the contradiction and the conclusion in
the necessity voice.

#### Scenario: A forced move is explained by the rule it would break

- **WHEN** a hint is requested on a solvable, mistake-free board
- **THEN** the forced cell is ringed, and the explanation names the rule
  (sealed off, dot overcount, or cannot-touch-two) that the opposite color
  would violate, outlining the endangered tile when it is not the target itself

### Requirement: A Clusters hint shows its reasoning on the board

The forced cell SHALL be marked as the hint target, which the narration calls
ringed. When the contradiction lands on a tile other than the target, that tile
SHALL carry a second mark, a frame in a hue the live-error frame does not use,
which the narration's "outlined" refers to uniquely, so the
reasoning is visible on the board and not only in prose. The hint SHALL NOT
pre-place the forced color.

#### Scenario: The target stays empty under its hint

- **WHEN** a hint step is displayed for an empty cell
- **THEN** the cell is marked as the target and holds no piece until the player
  or the hint's apply colors it

#### Scenario: The word and the ring go together

- **WHEN** a hint step is displayed
- **THEN** its sentence says "outlined" of a tile exactly when the contradiction
  lands on a tile other than the target, and that tile carries the second mark

### Requirement: A lookahead deduction is one step showing its whole forcing chain

A deduction that forces a move only through the solver's one-level lookahead
SHALL be presented as one step that displays the whole forcing chain statically
on the board: the hypothesis cell as the hint target, each cell the hypothesis
would force numbered in order and holding a piece of the color it would be
forced to, smaller than any placed piece, and the tile where the contradiction
lands marked as in a single-cell step.

#### Scenario: A lookahead deduction shows its whole forcing chain

- **WHEN** the next forced move follows only from the one-level lookahead
- **THEN** it is presented as one hint step whose narration states the
  hypothesis and the contradiction, with every cell of the forcing chain marked
  on the board with the color the hypothesis would force it to

#### Scenario: A what-if piece cannot be taken for a placed one

- **WHEN** a chain hint is displayed
- **THEN** each what-if cell holds a piece less than half as wide as a placed
  piece

### Requirement: A Clusters hint is refused where it cannot deduce

A hint SHALL be refused when the deduction runs into a contradiction from the
player's position: a wrong tile that no local rule yet flags. The banner SHALL
say a placed tile must be wrong, and the hint SHALL NOT deduce onward from a
doomed position. On a dealt board a wrong tile always ends in that
contradiction and never in a stall, so `hint` answers `DEDUCTION_EXHAUSTED`
only for a description the deduction cannot finish from its givens.

#### Scenario: A hint is refused on a doomed board

- **WHEN** a hint is requested on a board whose placed tiles contradict the
  unique solution without yet breaking a local rule
- **THEN** no move is hinted and an explanatory banner is shown

#### Scenario: Several wrong tiles, none flagged

- **WHEN** a dealt board holds several tiles that disagree with its solution,
  none of them breaking a local rule, and a hint is asked for
- **THEN** the banner says a placed tile must be wrong, as it does for one
