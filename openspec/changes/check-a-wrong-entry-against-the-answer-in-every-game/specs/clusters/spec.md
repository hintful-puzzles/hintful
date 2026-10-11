## MODIFIED Requirements

### Requirement: The cluster rules decide when a board is solved

Every cell of a finished board SHALL hold one of two colors. A tile given as a
dot SHALL touch exactly one orthogonally adjacent tile of its own color, and
every other tile SHALL touch at least two. The board SHALL be solved when every
cell is filled and no rule is broken. A cell that breaks a rule as the board
stands SHALL be framed in the error color as the player plays.

#### Scenario: A rule-breaking cell is reported as a mistake

- **WHEN** the board contains a cell that violates a cluster rule and mistakes
  are checked
- **THEN** a mistake is reported, and Check & Save declines to save

#### Scenario: Completing the grid wins

- **WHEN** a move fills the last cell so every cell satisfies the cluster rules
- **THEN** the game is reported solved

### Requirement: A Clusters hint is refused where it cannot deduce

A hint SHALL be refused, and SHALL NOT deduce onward, when the deduction runs
into a contradiction from the player's position. `findMistakes` names a wrong
tile wherever the solver finishes the board from its givens, so that refusal
is reached only on a description the solver cannot finish, as is
`DEDUCTION_EXHAUSTED`.

#### Scenario: A hint is refused on a doomed board

- **WHEN** a hint is requested on a board whose placed tiles contradict the
  unique solution without yet breaking a local rule
- **THEN** no move is hinted and an explanatory banner is shown

#### Scenario: Several wrong tiles, none flagged

- **WHEN** a dealt board holds several tiles that disagree with its solution,
  none of them breaking a local rule, and a hint is asked for
- **THEN** the banner asks for the highlighted mistakes to be fixed, and each
  of those tiles is highlighted

## ADDED Requirements

### Requirement: Clusters' findMistakes reports each tile the answer contradicts

On a board the solver finishes from its givens, `findMistakes` SHALL report
every tile the player placed in the color that answer does not give it, whether
or not it breaks a rule, and nothing else. On any other board it SHALL report
the cells that break a rule. The surface under a reported tile SHALL be drawn
in the error wash when the check hands `redraw` its mistakes.

#### Scenario: A wrong tile that breaks no rule

- **WHEN** one tile is placed in the color the answer does not give it, no rule
  is broken, and Check & Save is pressed
- **THEN** one mistake is reported, that tile's surface is repainted in the
  error wash on a board already drawn, and the board is not saved

#### Scenario: The next move puts the wash away

- **WHEN** a move is made after the check
- **THEN** the tile's surface is drawn as any other cell's
