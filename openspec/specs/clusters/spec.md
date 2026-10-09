# clusters Specification

## Purpose
Clusters, the puzzle of two-coloring a grid so that exactly the dotted tiles
have a single same-colored neighbor and every other tile has at least two. This
capability specifies the game on the TS engine: its contradiction-based solver
and generator, an explained deduction hint, and difficulty tiers laid over the
solver's two levels of deduction.

## Requirements

### Requirement: Clusters game implements the Game interface

The engine SHALL provide `src/games/clusters/` implementing the `Game`
interface for Clusters, registered so the puzzle is served by the TypeScript
engine.

Because Clusters is a unique-solution logic puzzle with a built-in rule checker,
it SHALL declare a `findMistakes` hook so Check & Save can flag rule-violating
cells.

#### Scenario: Every preset produces a uniquely solvable board

- **WHEN** a new game is generated for any preset or legal size
- **THEN** a board is produced whose blank cells can be filled to satisfy the
  cluster rules in exactly one way, and the solver completes it

### Requirement: Clusters' parameters are a width, a height and a difficulty

Parameters SHALL be a width, a height and a difficulty. A game ID SHALL encode
the width and height (a bare single number read as a square board) and, in its
full form, the difficulty, and SHALL round-trip through decode. The difficulty
SHALL be offered by the preset menu and by the Custom dialog.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height and difficulty are recovered, and a bare single
  number is read as a square board

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
runs chain. The accumulated position SHALL total the board area plus one.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

### Requirement: A Clusters description is validated against the board area

Validation SHALL reject a description whose accumulated position is short of or
past the board area plus one, distinguishing "too short" from "too long", and
SHALL reject any character outside the letter alphabet.

#### Scenario: A description with the wrong number of cells is rejected

- **WHEN** a description whose accumulated position differs from the board area
  plus one is validated
- **THEN** it is rejected with a message distinguishing too short from too long

### Requirement: Clusters' solver deduces by contradiction at two rungs

Clusters SHALL provide a solver that classifies a board as complete, unfinished
or invalid and marks the cells that break a rule. The solver SHALL fill forced
cells by contradiction, tentatively setting each color in an empty cell and
taking the other color when one makes the board invalid, and SHALL apply one
level of hypothetical lookahead when asked for it. Those two rungs are the two
difficulty tiers.

#### Scenario: The solver completes a uniquely solvable board

- **WHEN** a generated board is solved
- **THEN** the solver fills every blank cell to the unique solution and reports
  the board complete

### Requirement: Clusters' generator is gated by its solver

The generator SHALL use the solver to keep every board uniquely solvable: it
SHALL two-color the grid at random, flip isolated cells until none remains,
reduce the board to dot clues, prune adjacent equal dots, and retry until the
solver completes the board at the requested tier and, above the easiest tier,
the tier below cannot.

#### Scenario: A kept board is completed by the solver at its tier

- **WHEN** the generator returns a description at a requested tier
- **THEN** the solver, run at that tier on the board the description decodes
  to, reports it complete

### Requirement: Clusters generation is reproducible and bounded

Generation from a given seed SHALL be reproducible. The retry loop SHALL be
bounded, so that a parameter set admitting no board fails rather than spinning.

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

#### Scenario: A parameter set with no board gives up rather than hanging

- **WHEN** generation is asked for a board that cannot exist at the requested
  tier
- **THEN** the generator exhausts a finite retry budget and reports failure

### Requirement: A completed candidate that is rejected is perturbed

Rejecting a candidate the generator has completed SHALL perturb the grid before
retrying. The retry loop carries deduced cells between attempts and
re-randomizes only blank ones, so a completed grid would otherwise re-derive
itself, draw no randomness, and never terminate. The perturbation SHOULD be
small rather than a reset, because the loop is a hill-climb that a reset
discards.

#### Scenario: A Normal candidate the single-cell rule finishes

- **WHEN** a candidate generated for Normal is completed by the single-cell
  rule alone
- **THEN** it is rejected, and a cell of the grid is changed before the next
  attempt

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

### Requirement: Clusters input, mistakes and completion

The game SHALL report the cells that break a cluster rule through `findMistakes`
so Check & Save can hard-block on them. Solving SHALL fill the board to the
unique solution. Completion SHALL be reached when every cell is filled and no
rule is broken, and the board SHALL flash on completion. There SHALL be no
interpolated move animation.

#### Scenario: A rule-breaking cell is reported as a mistake

- **WHEN** the board contains a cell that violates a cluster rule and mistakes
  are checked
- **THEN** that cell is reported, and Check & Save declines to save

#### Scenario: Completing the grid wins

- **WHEN** a move fills the last cell so every cell satisfies the cluster rules
- **THEN** the game is reported solved and flashes

### Requirement: Clusters provides an explained deduction hint

Clusters SHALL implement the `hint` and `hintKeepTrack` hooks so a player can ask
why the next move is forced. A hint SHALL be computed from the game's own
contradiction solver, the solver and the hint being two projections of one
deduction engine, so that every hinted move corresponds to a deduction the
solver can make from the player's current position.

#### Scenario: A hinted move is one the solver makes

- **WHEN** a hint is requested on a solvable, mistake-free board
- **THEN** the step's move colors one empty cell the color the solver's
  deduction forces from that position

### Requirement: A Clusters hint plan is recompute-stable

The hint plan SHALL be recompute-stable: its scan order SHALL be deterministic,
so that a hint recomputed after a followed move continues where the previous
plan left off.

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
- **THEN** the forced cell is highlighted, and the explanation names the rule
  (sealed off, dot overcount, or cannot-touch-two) that the opposite color
  would violate, ringing the endangered tile when it is not the target itself

### Requirement: A Clusters hint shows its reasoning on the board

The forced cell SHALL be highlighted as the hint target. When the contradiction
lands on a tile other than the target, that tile SHALL be marked with a ring
distinct from the live-error frame in both hue and thickness, which the
narration's "outlined" refers to uniquely, so the reasoning is visible on the
board and not only in prose. The hint SHALL NOT pre-place the forced color.

#### Scenario: The target stays empty under its hint

- **WHEN** a hint step is displayed for an empty cell
- **THEN** the cell is marked as the target and holds no piece until the player
  or the hint's apply colors it

#### Scenario: The word and the ring go together

- **WHEN** a hint step is displayed
- **THEN** its sentence says "outlined" exactly when the contradiction lands on
  a tile other than the target, and that tile carries the ring

### Requirement: A lookahead deduction is one step showing its whole forcing chain

A deduction that forces a move only through the solver's one-level lookahead
SHALL be presented as one step that displays the whole forcing chain statically
on the board: the hypothesis cell as the hint target, each cell the hypothesis
would force marked with the color it would be forced to, in a form visually
distinct from a placed tile, and the tile where the contradiction lands ringed.
It SHALL NOT fall back to an un-narrated "only one option fits".

#### Scenario: A lookahead deduction shows its whole forcing chain

- **WHEN** the next forced move follows only from the one-level lookahead
- **THEN** it is presented as one hint step whose narration states the
  hypothesis and the contradiction, with every cell of the forcing chain marked
  on the board with the color the hypothesis would force it to

### Requirement: A lookahead stall takes the shortest forcing chain

At each lookahead stall the hint plan SHALL select the candidate firing with
the shortest forcing chain, deterministically tie-broken, keeping the displayed
chain short.

#### Scenario: Two firings of different lengths

- **WHEN** the single-cell rule stalls and two cells can each be decided by a
  lookahead, one through a shorter chain of forced cells than the other
- **THEN** the plan's next step is the one with the shorter chain

### Requirement: Every generated Clusters board is solvable by narratable deduction

No tier gates a board on more than the depth-one solver, whose hypothetical
propagation is itself deduction only. Every board the shipped generator can
emit SHALL therefore be solvable by the narratable deduction of the hint with
no nested speculation, and an Easy board SHALL additionally need no lookahead
step at all.

#### Scenario: An Easy board is hinted to the end without a chain

- **WHEN** a board generated at Easy is followed hint by hint from its start
- **THEN** every step is a single-cell deduction and the board ends solved

### Requirement: A Clusters hint is refused where it cannot deduce

A hint SHALL be refused, with an explanatory banner, when the board is already
solved, when the board contains a rule violation (as reported by
`findMistakes`), or when the deduction runs into a contradiction from the
player's position (a wrong tile that no local rule yet flags). In the last case
the banner SHALL say a placed tile must be wrong, and the hint SHALL NOT deduce
onward from a doomed position.

#### Scenario: A hint is refused on an unsolvable or mistaken board

- **WHEN** a hint is requested on a board that is solved, that contains a
  rule-violating tile, or whose placed tiles contradict the unique solution
  without yet breaking a local rule
- **THEN** no move is hinted and an explanatory banner is shown

### Requirement: Clusters offers difficulty tiers over its two deduction levels

Clusters SHALL offer a difficulty parameter with two tiers, corresponding to the
two deduction levels its solver implements: the single-cell proof by
contradiction (**Easy**), and the same reasoning applied one hypothetical level
deep (**Normal**).

A board generated at Normal SHALL require that second level: it SHALL NOT be
soluble by the single-cell reasoning alone. A board generated at Easy SHALL be
soluble by it.

#### Scenario: The harder tier needs the deeper reasoning

- **WHEN** a board generated at the harder tier is solved using only the
  single-cell contradiction rule
- **THEN** the solver does not reach a solution
- **AND** solving the same board with the lookahead completes it

#### Scenario: The easier tier needs only the single-cell rule

- **WHEN** a board generated at the easier tier is solved using only the
  single-cell contradiction rule
- **THEN** the solver completes it

### Requirement: Clusters' difficulty is carried in the game ID

The difficulty SHALL be encoded in the game ID, and an ID that carries no
difficulty SHALL decode to Easy. A tier letter the game does not know SHALL be
rejected when the parameters are validated, and SHALL NOT be silently played as
some other tier.

#### Scenario: An older game ID still resolves

- **WHEN** a game ID that carries no difficulty is opened
- **THEN** it loads and is playable, and its parameters read as the easier tier

#### Scenario: An unknown tier letter

- **WHEN** a game ID whose difficulty letter names no Clusters tier is opened
- **THEN** it is refused with a reason, and no board is dealt at another tier

### Requirement: Clusters refuses to generate Normal on a board too small for it

Clusters SHALL refuse to generate at Normal on a board too small to admit one,
reporting it through parameter validation with `full` set, so that a saved game
or a game ID carrying its own description still loads at any size.

#### Scenario: A board too small for the harder tier refuses it

- **WHEN** a full, generation-capable parameter set requests the harder tier on a
  board admitting no such puzzle
- **THEN** parameter validation rejects it, naming the constraint
- **AND** the same parameters are accepted when a description is supplied instead

### Requirement: Solve and the hint use the deeper rung at every tier

`solve` and `hint` SHALL use the deeper rung whatever tier the board was
generated at: they are "try as hard as you can", and the rung costs nothing on
a board that does not need it. `findMistakes` SHALL report the cells that break
a rule as the board stands, which is the same at every tier.

#### Scenario: Solving an Easy board

- **WHEN** a board generated at Easy is solved
- **THEN** the solver runs with the lookahead available and fills the board to
  its unique solution

### Requirement: Clusters draws its two colors as the collection's two-state pair

`redraw` SHALL draw the board as pieces on a quiet surface. The two colors a
cell can take (the ones the description and the input requirements call red
and blue, after upstream) SHALL be the two members of the collection's
two-state pair: the color the primary button gives is the first member and the
other is the second, each drawn in that member's color and shape, inset on its
cell. A given SHALL sit on a lifted surface and carry its dot on its piece.

#### Scenario: The primary button's color is the pair's first member

- **WHEN** an empty cell is clicked once with the primary button
- **THEN** the cell holds a piece in the color and the shape of the first
  member of the two-state pair

### Requirement: Clusters names no hue of its own

The game SHALL name no hue of its own for either color: its hint sentences and
its control words SHALL say the two-state pair's words, and its help page SHALL
name the two colors by placeholder.

#### Scenario: A hint names the color the piece is drawn in

- **WHEN** a hint step concludes that a cell must take one of the two colors
- **THEN** its sentence says that member's word from the pair
- **AND** applying the step draws that member's piece in the cell

### Requirement: A Clusters hint is marked in colors no piece is drawn in

The cell a hint acts on SHALL be ringed in the collection's hint-action color,
which neither piece is drawn in. A what-if cell of a chain SHALL carry a piece
of the color it would be forced to, smaller than any placed piece.

#### Scenario: A what-if piece cannot be taken for a placed one

- **WHEN** a chain hint is displayed
- **THEN** each what-if cell holds a piece less than half as wide as a placed
  piece
