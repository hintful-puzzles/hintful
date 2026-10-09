# clusters Specification

## Purpose
Clusters, the puzzle of two-coloring a grid so that exactly the dotted tiles
have a single same-colored neighbor and every other tile has at least two. This
capability states what is the game's own: its rules and what Check & Save
reports, its params and description encodings, its two difficulty tiers and
what each promises of a board, its controls, its explained hint, and how its
two colors are drawn.

## Requirements

### Requirement: The cluster rules decide when a board is solved

Every cell of a finished board SHALL hold one of two colors. A tile given as a
dot SHALL touch exactly one orthogonally adjacent tile of its own color, and
every other tile SHALL touch at least two. The board SHALL be solved when every
cell is filled and no rule is broken. `findMistakes` SHALL report the cells
that break a rule as the board stands, which is the same at every tier, so
that Check & Save refuses while one stands.

#### Scenario: A rule-breaking cell is reported as a mistake

- **WHEN** the board contains a cell that violates a cluster rule and mistakes
  are checked
- **THEN** that cell is reported, and Check & Save declines to save

#### Scenario: Completing the grid wins

- **WHEN** a move fills the last cell so every cell satisfies the cluster rules
- **THEN** the game is reported solved

### Requirement: Clusters' parameters are a width, a height and a difficulty

Parameters SHALL be a width, a height and a difficulty. A game ID SHALL encode
the width and height (a bare single number read as a square board) and, in its
full form, the difficulty, and SHALL round-trip through decode. An ID that
carries no difficulty SHALL decode to Easy. A tier letter the game does not
know SHALL be rejected when the parameters are validated, and SHALL NOT be
silently played as some other tier.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height and difficulty are recovered, and a bare single
  number is read as a square board

#### Scenario: An older game ID still resolves

- **WHEN** a game ID that carries no difficulty is opened
- **THEN** it loads and is playable, and its parameters read as the easier tier

#### Scenario: An unknown tier letter

- **WHEN** a game ID whose difficulty letter names no Clusters tier is opened
- **THEN** it is refused with a reason, and no board is dealt at another tier

### Requirement: Clusters refuses a board size that has no puzzle

Validation SHALL reject a board whose area is at least 10000 as too large and
one whose area is less than 2 as too small. It SHALL additionally reject a
board no larger than 2×2 in both dimensions, which has no Clusters puzzle at
any difficulty.

#### Scenario: A board with no puzzle at all is rejected

- **WHEN** a board of 1×2 or 2×2 is validated
- **THEN** it is rejected, naming the constraint, rather than accepted and
  generated for ever

### Requirement: Clusters descriptions use the upstream run-length dot encoding

A Clusters description SHALL encode only the given dot clues, in row-major order:
a lowercase letter SHALL denote a red dot preceded by a run of blank cells, an
uppercase letter SHALL denote a blue dot preceded by a run of blank cells, and
`z` or `Z` SHALL denote a pure skip of twenty-five blank cells so that longer
runs chain. The accumulated position SHALL total the board area plus one; a
description short of or past that total, or holding any other character, SHALL
be refused.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

#### Scenario: A description with the wrong number of cells is rejected

- **WHEN** a description whose accumulated position differs from the board area
  plus one is validated
- **THEN** it is rejected with a message distinguishing too short from too long

### Requirement: Clusters offers difficulty tiers over its two deduction levels

Clusters SHALL offer two tiers, the two levels of deduction its solver has.
**Easy** is the single-cell proof by contradiction: a color is tried in an
empty cell, and where it makes the board invalid the cell takes the other.
**Normal** is the same reasoning one hypothetical level deep. Every board
dealt SHALL have exactly one solution. A board dealt at Easy SHALL be soluble
by the single-cell reasoning alone, and a board dealt at Normal SHALL NOT be.

#### Scenario: The harder tier needs the deeper reasoning

- **WHEN** a board generated at the harder tier is solved using only the
  single-cell contradiction rule
- **THEN** the solver does not reach a solution
- **AND** solving the same board with the lookahead completes it

#### Scenario: The easier tier needs only the single-cell rule

- **WHEN** a board generated at the easier tier is solved using only the
  single-cell contradiction rule
- **THEN** the solver completes it

### Requirement: Clusters refuses to generate Normal on a board too small for it

Clusters SHALL refuse to generate at Normal on a board of fewer than 12
squares, or one whose shorter side is less than two, which is too small to
admit one. It SHALL
report this through parameter validation with `full` set, so that a saved game
or a game ID carrying its own description still loads at any size.

#### Scenario: A board too small for the harder tier refuses it

- **WHEN** a full, generation-capable parameter set requests the harder tier on a
  board admitting no such puzzle
- **THEN** parameter validation rejects it, naming the constraint
- **AND** the same parameters are accepted when a description is supplied instead

### Requirement: Solve and the hint use the deeper rung at every tier

`solve` and `hint` SHALL use the deeper rung whatever tier the board was
generated at: they are "try as hard as you can", and the rung costs nothing on
a board that does not need it.

#### Scenario: Solving an Easy board

- **WHEN** a board generated at Easy is solved
- **THEN** the solver runs with the lookahead available and fills the board to
  its unique solution

### Requirement: Every generated Clusters board is solvable by narratable deduction

No tier gates a board on more than the depth-one solver, whose hypothetical
propagation is itself deduction only. Every board the shipped generator can
emit SHALL therefore be solvable by the narratable deduction of the hint with
no nested speculation, and an Easy board SHALL additionally need no lookahead
step at all.

#### Scenario: An Easy board is hinted to the end without a chain

- **WHEN** a board generated at Easy is followed hint by hint from its start
- **THEN** every step is a single-cell deduction and the board ends solved

### Requirement: Clusters is painted by click, drag and keyboard cursor

Clusters SHALL be played by clicking or dragging to paint cells and by a keyboard
cursor. A left click or drag SHALL cycle a cell toward blue and a right click or
drag toward red, each also able to clear a cell; a drag SHALL paint every cell it
passes. The keyboard cursor SHALL place blue, red or blank via dedicated keys.
Given dot cells SHALL never be overwritten. A move that changes no non-given cell
SHALL produce no history entry.

#### Scenario: Dragging paints a run of cells

- **WHEN** a drag is started and moved across several blank cells
- **THEN** every non-given cell it passes is painted the drag color on release

#### Scenario: A drag over a given leaves the given alone

- **WHEN** a drag passes over a given dot cell and is released
- **THEN** the given keeps its color and its dot

### Requirement: Clusters provides an explained deduction hint

A hint SHALL be computed from the game's own contradiction solver, the solver
and the hint being two projections of one deduction engine, so that every
hinted move is a deduction the solver can make from the player's current
position. The plan's scan order SHALL be deterministic, so that a hint
recomputed after a followed move continues where the previous plan left off.

#### Scenario: A hinted move is one the solver makes

- **WHEN** a hint is requested on a solvable, mistake-free board
- **THEN** the step's move colors one empty cell the color the solver's
  deduction forces from that position

#### Scenario: A plan recomputed after its first step

- **WHEN** the first step of a plan is followed and the hint is asked again
- **THEN** the new plan's first step is the earlier plan's second

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

### Requirement: A lookahead stall takes the shortest forcing chain

At each lookahead stall the hint plan SHALL select the candidate firing with
the shortest forcing chain, deterministically tie-broken, keeping the displayed
chain short.

#### Scenario: Two firings of different lengths

- **WHEN** the single-cell rule stalls and two cells can each be decided by a
  lookahead, one through a shorter chain of forced cells than the other
- **THEN** the plan's next step is the one with the shorter chain

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

### Requirement: Clusters draws its two colors as the collection's two-state pair

The board SHALL be drawn as pieces on a quiet surface. The two colors a cell
can take (which the description and input requirements call red and blue,
after upstream) SHALL be the two members of the collection's
two-state pair: the color the primary button gives is the first member and the
other is the second, each drawn in that member's color and shape, inset on its
cell. A given SHALL sit on a lifted surface and carry its dot on its piece.
There SHALL be no interpolated move animation.

#### Scenario: The primary button's color is the pair's first member

- **WHEN** an empty cell is clicked once with the primary button
- **THEN** the cell holds a piece in the color and the shape of the first
  member of the two-state pair
