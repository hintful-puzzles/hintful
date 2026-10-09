# spokes Specification

## Purpose
Spokes, the puzzle of drawing lines between numbered hubs, never crossing, so
that each hub starts as many lines as its number and all hubs join one connected
group. This capability specifies the game: its parameters and descriptions, its
honestly graded tiers, diagonals that rule out their crossing, and a hint that
explains why each move is forced, stops at bounded reasoning, and refuses a
position it cannot vouch for.

## Requirements

### Requirement: Spokes explains why each hinted move is forced

Spokes SHALL implement the hint hooks, and each hint SHALL narrate the argument
that forces the move, not merely the move. The narration SHALL state the premises
it rests on before its conclusion, and every claim it makes SHALL be one the
implementation has checked.

#### Scenario: The two-ones rule names the connectivity constraint

- **WHEN** two adjacent hubs each still need exactly one line and the spoke
  between them must be ruled out
- **THEN** the hint states that joining them would finish both and seal them off
  from the rest of the board, which the one-connected-group rule forbids
- **AND** concludes that the spoke between them is ruled out

#### Scenario: A contradiction hint states its hypothesis

- **WHEN** a spoke is forced only because the opposite value leads to an
  impossible board
- **THEN** the hint states the hypothesis it is refuting and the impossibility it
  reaches, naming the hub that would over-fill, the diagonals that would cross,
  or the hubs that would be stranded, and only then the conclusion

### Requirement: Spokes' hint is a projection of its solver

The hint SHALL be derived from the same deduction engine as the solver, so that
no hinted move is reachable by reasoning the solver does not perform. No shipped
board SHALL require a step the hint cannot explain, except a step of the
unbounded rung, which "Spokes' hint stops at bounded reasoning" withholds.

#### Scenario: A hinted move agrees with the solver's solution

- **WHEN** a hint step is offered on a board that carries no mistake
- **THEN** a spoke it draws as a line is a line of the solver's unique solution,
  and a spoke it rules out is not

### Requirement: A deduction that forces several spokes is one journey

Where a single deduction forces several spokes at once, a hub with exactly as
many free spokes as it still needs lines, or one that already has all of them,
those SHALL be emitted as one multi-leg journey rather than as separate hints,
and all of its legs SHALL be rendered in the same color, because they share a
fate.

#### Scenario: A saturated hub is explained by the count that forces it

- **WHEN** a hub still needs as many lines as it has spokes left that could carry
  one, and the player asks for a hint
- **THEN** the hint states that the hub's remaining count and its remaining places
  are equal, and concludes that every one of those spokes is a line
- **AND** all of those spokes are presented as one hint in one color

### Requirement: A Spokes hint plan is stable across recomputation

A hint plan SHALL be stable across recomputation: re-requesting a hint after the
player has followed a step SHALL continue the same line of reasoning rather than
propose a different or contradictory one.

#### Scenario: A journey resumes where the player left it

- **WHEN** the player follows the first leg of a saturated hub's journey and the
  plan is computed again
- **THEN** the plan still holds that hub's remaining spokes as lines, and nothing
  in it contradicts the step followed

### Requirement: A Spokes hint prefers a connection and never hints a useless rule-out

A hint SHALL be goal-oriented: it SHALL prefer a forced connection (a line) over
a rule-out, and it SHALL NOT propose ruling out a spoke unless doing so helps a
hub that still needs lines. A forced rule-out whose two hubs are both already
satisfied advances nothing and SHALL NOT be hinted.

#### Scenario: A useless rule-out is never hinted

- **WHEN** a spoke could be ruled out but both of its hubs already have all the
  lines they need
- **THEN** the hint does not propose ruling it out, because it advances nothing

#### Scenario: A forced line comes before a forced rule-out

- **WHEN** one hub's count forces its free spokes to be lines and another hub's
  met count forces a helpful rule-out
- **THEN** the hint offers the lines first

### Requirement: Spokes refuses to hint from a position it cannot vouch for

Spokes SHALL refuse a hint, with an explanation, when the board is already solved,
when the board contradicts the unique solution, when the board already breaks a
rule the game marks, or when no deduction applies. It SHALL NOT present a move as
forced when that move follows only from a mistake the player has made.

#### Scenario: A wrong board is corrected rather than hinted

- **WHEN** the player asks for a hint on a board carrying a line the solution
  forbids
- **THEN** no hint step is offered, the offending lines are highlighted, and the
  player is told to resolve them first

### Requirement: A diagonal line automatically rules out its crossing

Spokes SHALL rule out a diagonal's crossing automatically, because a drawn
diagonal visibly blocks the other diagonal of the same square. Drawing a diagonal
line SHALL mark its crossing spoke; erasing that line SHALL clear the mark it
placed; and a crossing so blocked SHALL be inert to input while the line stands.
The rule-out SHALL be a real mark, so the solver and the hint count it, and the
hint SHALL therefore never propose it.

#### Scenario: Drawing a diagonal blocks its crossing, erasing it unblocks

- **WHEN** the player draws a diagonal line across a square
- **THEN** the crossing diagonal of that square becomes ruled out without any
  further action, and the player cannot toggle that mark while the line remains
- **AND WHEN** the player erases the diagonal line
- **THEN** the automatic mark on the crossing is removed

### Requirement: Spokes game implements the Game interface

The engine SHALL provide `src/games/spokes/` implementing the `Game`
interface for Spokes, registered so the puzzle is served by the TypeScript engine.
Spokes SHALL be a uniquely-solvable line-drawing puzzle and SHALL declare a
`findMistakes` hook, so that Check & Save flags a wrong board rather than saving it
silently.

#### Scenario: Every preset produces a soluble board

- **WHEN** a new game is generated for any preset or legal size
- **THEN** a board is produced whose hubs can be connected into one satisfied,
  fully connected group, deducible at the requested difficulty

### Requirement: Spokes' parameters

Parameters SHALL be a width, a height, and a difficulty: Easy, Normal or
`Unreasonable`. Validation SHALL require width and height each at least 2, with
no upper bound. A game ID SHALL encode the width, height and difficulty and
round-trip through decode.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height and difficulty are recovered

### Requirement: Spokes' top tier is named Unreasonable

The top tier SHALL be named `Unreasonable`, because its look-ahead runs an
unbounded sub-solve from a hypothesis. Its internal key SHALL be `hard` and its
encoded difficulty character SHALL be `h`, so that a game ID carrying that
character names the same board whatever the tier is called.

#### Scenario: The top tier keeps its difficulty character

- **WHEN** a parameter set at `Unreasonable` is encoded to a game ID
- **THEN** its difficulty is written with the character `h`

### Requirement: Spokes descriptions use one clue character per cell

A Spokes description SHALL encode the board as exactly width times height
characters in row-major order: each character is a clue digit from `0` to `8` (the
number of lines that hub must carry, where `0` marks a cell that holds no hub), or
`X`, the marker for a hand-authored hole. The description SHALL NOT use run-length
abbreviation.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

### Requirement: A Spokes description is validated against the board's cells

Validation SHALL reject a description that carries fewer characters than the board
has cells, that carries more, or that contains a character that is neither a clue
digit nor the hole marker, distinguishing a too-short description from a too-long
one.

#### Scenario: A description with the wrong number of characters is rejected

- **WHEN** a description carrying more or fewer characters than the board has cells
  is validated
- **THEN** it is rejected with a message distinguishing too short from too long

### Requirement: Spokes solves with a tiered deductive solver

Spokes SHALL provide a solver that draws the forced lines and marks for a board, or
reports the board invalid or incomplete, at a requested difficulty of Easy, Normal
or `Unreasonable`. The solver SHALL apply hub saturation and exhaustion,
diagonal-crossing marks, and the two-ones rule; the two harder tiers SHALL
additionally apply contradiction look-ahead.

#### Scenario: The solver deduces the unique solution

- **WHEN** a generated board is solved at its difficulty
- **THEN** the solver reaches a single fully connected, fully satisfied
  configuration of lines and marks

### Requirement: Spokes' solver decides validity by connectivity

The solver SHALL determine board validity by connectivity, treating a set of hubs
that can draw no further line to the rest of the board as invalid and a fully
connected, fully satisfied board as solved.

#### Scenario: A sealed-off pair makes the board invalid

- **WHEN** two hubs that each need one line are joined to each other on a board
  with other hubs
- **THEN** the solver reports the board invalid

### Requirement: The contradiction look-ahead never guesses

The contradiction look-ahead SHALL be deterministic and exhaustive, not a guessing
tier: a value is committed only when the opposite value provably leads to an
invalid board.

#### Scenario: A hypothesis that is not refuted commits nothing

- **WHEN** the look-ahead tries a value on a spoke and the board that follows is
  not shown to be invalid
- **THEN** the opposite value is not committed on that account

### Requirement: The look-ahead runs at two strengths, which are two rungs

The contradiction look-ahead SHALL be applied at two distinct strengths, and they
are two rungs rather than one. At Normal, the sub-solve that tests the hypothesis
SHALL be bounded by a fixed deduction limit, so the reasoning is a chain a player
could follow. At `Unreasonable`, the sub-solve SHALL be unbounded, which is what
the tier's name reports.

#### Scenario: A refutation past the limit belongs to the top tier alone

- **WHEN** a hypothesis is refuted only by more of the Easy deductions than the
  limit allows
- **THEN** the solver at Normal does not commit the opposite value on that account
- **AND** the solver at `Unreasonable` does

### Requirement: The look-ahead's bound has one definition

The bound on the Normal sub-solve SHALL have a single definition in the solver,
and it SHALL be documented as load-bearing for the tier names rather than as a
performance dial, since lifting it would silently make the middle tier a search.

#### Scenario: The solver and the hint read the same bound

- **WHEN** the solver's Normal look-ahead and the hint's look-ahead each test a
  hypothesis
- **THEN** both sub-solves stop at the one limit the solver defines

### Requirement: Spokes' generator keeps every board uniquely soluble

The generator SHALL use the solver to keep every board uniquely soluble: it SHALL
start from every horizontal and vertical line plus a random diagonal per cell,
then remove lines in a randomized order, keeping a removal only while every hub
retains at least one line and the board stays uniquely soluble at the target
difficulty. Generation from a given seed SHALL be reproducible.

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

### Requirement: Spokes marks hubs whose spoke count is met

Rendering SHALL distinguish a hub that already carries as many lines as its clue
requires from one that does not, by the surface of its face. A hub with lines
still to take SHALL have the collection's cell surface, and a hub whose count is
met SHALL have the collection's lifted surface, the one a given sits on
elsewhere, since such a hub is settled. The two SHALL be a pair the collection
names, separated in both light and dark presentation, and SHALL NOT be a step of
gray of the game's own.

#### Scenario: Meeting a clue marks the hub

- **WHEN** a hub's drawn lines reach the number its clue requires
- **THEN** that hub is filled in the satisfied color, and hubs that have not
  reached their clue are not

### Requirement: The satisfied-hub marking is visual only and can be turned off

The distinction between a hub whose count is met and one with lines still to take
SHALL be visual only: a marked hub remains fully editable. A preference SHALL let
the player turn the marking off, and with it off every hub SHALL have the cell
surface.

#### Scenario: The marking can be switched off

- **WHEN** the satisfied-hub preference is turned off
- **THEN** no hub is filled in the satisfied color, whatever its line count

#### Scenario: A marked hub is still editable

- **WHEN** the player erases a line of a hub whose count is met
- **THEN** the line is removed and the hub returns to the cell surface

### Requirement: Spokes is played by dragging between hubs or with a keyboard cursor

Spokes SHALL be played by dragging between two adjacent hubs, or with a keyboard
cursor. A left drag SHALL toggle a line between the hubs, and a right drag SHALL
toggle a ruled-out mark; a keyboard cursor on the half-grid SHALL draw a line on
select and place a mark on the alternate select. Either gesture on a spoke that
already holds a line or a mark SHALL clear it, except a crossing a diagonal line
blocks. A drag or key that resolves to no valid change SHALL leave the board
unchanged.

#### Scenario: Dragging between two hubs draws a line

- **WHEN** the player left-drags from one hub to an adjacent hub with a free spoke
- **THEN** a line is drawn between them, or removed if one was already present

#### Scenario: A left drag over a ruled-out spoke clears the mark

- **WHEN** the player left-drags along a horizontal spoke that holds a ruled-out
  mark
- **THEN** the mark is cleared and no line is drawn

### Requirement: A line cannot cross a diagonal line

A line SHALL NOT be drawable along a diagonal that would cross an existing
diagonal line.

#### Scenario: A crossing diagonal line is refused

- **WHEN** the player tries to draw a diagonal line whose crossing diagonal already
  carries a line
- **THEN** no line is drawn and the board is unchanged

### Requirement: What Spokes draws

Rendering SHALL draw each hub as a circle carrying its available spokes and clue,
SHALL draw lines between connected hubs, SHALL highlight the hub being dragged
from, SHALL color an over-filled or isolated hub as an error, and SHALL flash on
completion. There SHALL be no interpolated line-drawing animation.

#### Scenario: Completing the connected, satisfied board wins

- **WHEN** every hub carries exactly its clue's lines and all hubs form one connected
  group with no crossing lines
- **THEN** the game is reported solved and flashes

### Requirement: Spokes' findMistakes compares the board with its one solution

`findMistakes` SHALL flag every line the player has drawn that the unique solution
forbids, and every mark the player has placed where the solution requires a line; a
line the solution requires but the player has not yet drawn SHALL NOT be flagged.

#### Scenario: A wrongly drawn line is flagged as a mistake

- **WHEN** the player has drawn a line the unique solution does not contain and asks
  to check the board
- **THEN** that line is reported as a mistake, while lines merely not yet drawn are
  not

### Requirement: Spokes' hint stops at bounded reasoning

The Spokes hint SHALL narrate the contradiction look-ahead only at its bounded
strength. The unbounded rung, the one the `Unreasonable` tier is named for, SHALL
NOT contribute a firing to a hint plan on any tier, including boards generated
below that tier. Where deduction and the bounded look-ahead run out, the hint
SHALL refuse with a message saying no further move can be deduced.

#### Scenario: Planning at the top tier buys the plan nothing

- **WHEN** a hint plan is computed for the same board at the top tier and at
  Normal
- **THEN** the two plans are the same sequence of firings

### Requirement: Spokes' solver keeps the unbounded rung

The solver SHALL retain the unbounded rung the hint withholds, so that generation
and grading are unchanged by what the hint narrates.

#### Scenario: A board the hint gives up on is still solved

- **WHEN** the hint refuses a board generated at `Unreasonable` because bounded
  reasoning has run out
- **THEN** the solver at `Unreasonable` still reaches that board's solution

### Requirement: The bounded-hint guarantee is asserted structurally

The guarantee that the unbounded rung contributes no firing SHALL be structural
rather than a check on the wording: both rungs are the same function and produce
the same narration, so a vocabulary guard cannot tell them apart. The game's tests
SHALL therefore assert the property directly, with a control that prevents it
holding vacuously.

#### Scenario: The equality of the plans is not vacuous

- **WHEN** hint plans are computed for sampled boards at Easy, at Normal and at the
  top tier
- **THEN** the Normal plan and the top tier's are the same on every board
- **AND** on at least one sampled board the Normal plan is longer than the Easy
  one, so the equality is a fact about the top tier rather than about every tier
  producing the same plan

### Requirement: Spokes' difficulty tiers bind the boards they generate

A Spokes board generated at a difficulty above the easiest SHALL NOT be soluble at
the tier below it. The acceptance check that decides this SHALL run from an empty
position, so that its verdict describes the board being offered rather than any
state left over from an earlier candidate.

#### Scenario: An Unreasonable board genuinely needs its own tier

- **WHEN** a board generated at `Unreasonable` is solved at Normal
- **THEN** the solver does not reach a solution
- **AND** solving the same board at `Unreasonable` does reach one
