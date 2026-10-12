# spokes Specification

## Purpose
Spokes, the puzzle of drawing lines between numbered hubs, never crossing, so
that each hub starts as many lines as its number and all hubs join one connected
group. This capability specifies what is the game's own: the params it refuses
and what a short params string means, its descriptions, its honestly graded
tiers, diagonals that rule out their crossing, and a hint that
explains why each move is forced, stops at bounded reasoning, and refuses a
position it cannot vouch for.

## Requirements

### Requirement: Rules: A diagonal line automatically rules out its crossing

Spokes SHALL rule out a diagonal's crossing automatically, because a drawn
diagonal visibly blocks the other diagonal of the same square. Drawing a diagonal
line SHALL mark its crossing spoke; erasing that line SHALL clear the mark it
placed, and SHALL leave a mark the player had made there before the line; and a
crossing so blocked SHALL be inert to input while the line stands. The rule-out
SHALL be a real mark, so the solver and the hint count it, and the hint SHALL
therefore never propose it.

#### Scenario: Drawing a diagonal blocks its crossing, erasing it unblocks

- **WHEN** the player draws a diagonal line across a square
- **THEN** the crossing diagonal of that square becomes ruled out without any
  further action, and the player cannot toggle that mark while the line remains
- **AND WHEN** the player erases the diagonal line
- **THEN** the automatic mark on the crossing is removed

#### Scenario: The player's own mark outlives the line drawn over it

- **WHEN** the player rules out one diagonal of a square, draws the other
  diagonal as a line, and erases that line
- **THEN** the first diagonal is still ruled out

### Requirement: Rules: A line cannot cross a diagonal line

A line SHALL NOT be drawable along a diagonal that would cross an existing
diagonal line.

#### Scenario: A crossing diagonal line is refused

- **WHEN** the player tries to draw a diagonal line whose crossing diagonal already
  carries a line
- **THEN** no line is drawn and the board is unchanged

### Requirement: Rules: A Spokes mistake is a line the solution forbids or a mark where it needs a line

`findMistakes` SHALL flag every line the player has drawn that the unique solution
forbids, and every mark the player has placed where the solution requires a line; a
line the solution requires but the player has not yet drawn SHALL NOT be flagged.

#### Scenario: A wrongly drawn line is flagged as a mistake

- **WHEN** the player has drawn a line the unique solution does not contain and asks
  to check the board
- **THEN** that line is reported as a mistake, while lines merely not yet drawn are
  not

### Requirement: Params: Spokes refuses Unreasonable on a board too small or too narrow to have one

When a board is to be dealt, `validateParams` SHALL refuse `Unreasonable` on a
board of eight squares or fewer, which has no such board, and on a board two
squares wide, where one is too rare to deal. It SHALL set no upper bound on
the width or the height.

#### Scenario: A narrow board at the top tier

- **WHEN** a 2×6 board is asked for at `Unreasonable`
- **THEN** the parameters are refused, and the same size at Normal is not

### Requirement: Params: Spokes' top tier is named Unreasonable

The top tier SHALL be named `Unreasonable`, because its look-ahead runs an
unbounded sub-solve from a hypothesis. Its internal key SHALL be `hard` and its
encoded difficulty character SHALL be `h`, so that a game ID carrying that
character names the same board whatever the tier is called.

#### Scenario: The top tier keeps its difficulty character

- **WHEN** a parameter set at `Unreasonable` is encoded to a game ID
- **THEN** its difficulty is written with the character `h`

### Requirement: Params: A Spokes params string with no difficulty is Easy

Spokes' params (a size and a tier), their bounds and their encoding SHALL be
those its `paramConfig` and its declared codec give (`engine-params`, "A game
declares its params encoding once, and both codec halves are derived"), and
its menu what `presets` builds. A string with no `d` SHALL decode as Easy.

#### Scenario: A Normal preset and its short form

- **WHEN** `4x4dt` is decoded
- **THEN** the board is 4 by 4 at Normal
- **AND** its short form `4x4` decodes to a 4 by 4 board at Easy

### Requirement: Description: Spokes descriptions use one clue character per cell

A Spokes description SHALL encode the board as exactly width times height
characters in row-major order: each character is a clue digit from `0` to `8` (the
number of lines that hub must carry, where `0` marks a cell that holds no hub), or
`X`, the marker for a hand-authored hole. The description SHALL NOT use run-length
abbreviation.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

### Requirement: Description: A Spokes description is validated against the board's cells

Validation SHALL reject a description that carries fewer characters than the board
has cells, that carries more, or that contains a character that is neither a clue
digit nor the hole marker, distinguishing a too-short description from a too-long
one.

#### Scenario: A description with the wrong number of characters is rejected

- **WHEN** a description carrying more or fewer characters than the board has cells
  is validated
- **THEN** it is rejected with a message distinguishing too short from too long

### Requirement: Description: An X hole also blocks the diagonals that pass its corners

A cell written `0` SHALL hold no hub and take away every spoke that points at
it. A cell written `X` SHALL do the same and SHALL also take away the four
diagonals that pass its corners, each joining a cell beside it to the cell
above or below it. Either cell's clue SHALL read as 0 afterwards.

#### Scenario: A hole in the top row

- **WHEN** `0X0111111` is loaded on a 3 by 3 board
- **THEN** the top row holds no hub, and the hub in the middle of the board
  has spokes to its sides and downward only
- **AND** were the two top corners hubs, the `X` would still leave the middle
  hub no spoke toward either, where a `0` in its place would leave both

### Requirement: Generation: The look-ahead runs at two strengths, which are two rungs

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

### Requirement: Generation: Every hub of a dealt Spokes board carries a line

Every hub of a generated board SHALL carry at least one line.

#### Scenario: A hub's last line is never stripped

- **WHEN** the generator comes to strip a line that is the only one left at
  either of its hubs
- **THEN** the line stays, whether or not the board would solve uniquely
  without it

### Requirement: Solver: Spokes solves with a tiered deductive solver

Spokes SHALL provide a solver that draws the forced lines and marks for a board, or
reports the board invalid or incomplete, at a requested difficulty of Easy, Normal
or `Unreasonable`. The solver SHALL apply hub saturation and exhaustion,
diagonal-crossing marks, and the two-ones rule; the two harder tiers SHALL
additionally apply contradiction look-ahead.

#### Scenario: The solver deduces the unique solution

- **WHEN** a generated board is solved at its difficulty
- **THEN** the solver reaches a single fully connected, fully satisfied
  configuration of lines and marks

### Requirement: Solver: Spokes' solver decides validity by connectivity

The solver SHALL determine board validity by connectivity, treating a set of hubs
that can draw no further line to the rest of the board as invalid and a fully
connected, fully satisfied board as solved.

#### Scenario: A sealed-off pair makes the board invalid

- **WHEN** two hubs that each need one line are joined to each other on a board
  with other hubs
- **THEN** the solver reports the board invalid

### Requirement: Solver: The contradiction look-ahead never guesses

The contradiction look-ahead SHALL be deterministic and exhaustive, not a guessing
tier: a value is committed only when the opposite value provably leads to an
invalid board.

#### Scenario: A hypothesis that is not refuted commits nothing

- **WHEN** the look-ahead tries a value on a spoke and the board that follows is
  not shown to be invalid
- **THEN** the opposite value is not committed on that account

### Requirement: Solver: The look-ahead's bound has one definition

The bound on the Normal sub-solve SHALL have a single definition in the solver,
and it SHALL be documented as load-bearing for the tier names rather than as a
performance dial, since lifting it would silently make the middle tier a search.

#### Scenario: The solver and the hint read the same bound

- **WHEN** the solver's Normal look-ahead and the hint's look-ahead each test a
  hypothesis
- **THEN** both sub-solves stop at the one limit the solver defines

### Requirement: Controls: Spokes is played by dragging between hubs or with a keyboard cursor

Spokes' two verbs, a line and a ruled-out mark, SHALL be applied by a drag
between two adjacent hubs or by the select keys on a cursor that walks the
dots' half-grid. Either verb on a spoke that already holds a line or a mark
SHALL clear it, except a crossing a diagonal line blocks. A drag or key that
resolves to no valid change SHALL leave the board unchanged.

#### Scenario: A left drag over a ruled-out spoke clears the mark

- **WHEN** the player left-drags along a horizontal spoke that holds a ruled-out
  mark
- **THEN** the mark is cleared and no line is drawn

### Requirement: Controls: A press on a hub aims at the dot it points toward

A press on a hub's square, and a drag from it, SHALL aim by the direction
from that hub's center to the pointer, snapped to the nearest of the eight
directions, and the release SHALL apply its button's verb to the spoke aimed
at then. A pointer still close to the center, or aiming off the board, SHALL
aim at nothing, and its release SHALL change nothing.

#### Scenario: A click on a dot

- **WHEN** the player clicks the dot on a hub's right-hand rim and lets go
  without moving
- **THEN** the spoke to the hub on its right is toggled, as a drag to that
  hub toggles it

#### Scenario: A drag that overshoots

- **WHEN** a drag from a hub runs on past the hub to its right before it is
  let go
- **THEN** the spoke toggled is the one to the hub next to where the drag
  began, since only the direction is read

### Requirement: Preferences: The satisfied-hub marking is visual only and can be turned off

The distinction between a hub whose count is met and one with lines still to take
SHALL be visual only: a marked hub remains fully editable. The
`mark-satisfied` preference SHALL start on and SHALL let the player turn the
marking off, and with it off every hub SHALL have the cell surface.

#### Scenario: The marking can be switched off

- **WHEN** the satisfied-hub preference is turned off
- **THEN** no hub is filled in the satisfied color, whatever its line count

#### Scenario: A marked hub is still editable

- **WHEN** the player erases a line of a hub whose count is met
- **THEN** the line is removed and the hub returns to the cell surface

#### Scenario: A player who has changed no preference

- **WHEN** a player who has changed no preference draws the last line a hub's
  number asks for
- **THEN** that hub takes the lifted surface

### Requirement: Hint: Spokes explains why each hinted move is forced

Each hint SHALL narrate the argument that forces the move, not merely the
move. The narration SHALL state the premises it rests on before its
conclusion, and every claim it makes SHALL be one the implementation has
checked.

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

#### Scenario: A saturated hub is explained by the count that forces it

- **WHEN** a hub still needs as many lines as it has spokes left that could carry
  one, and the player asks for a hint
- **THEN** the hint states that the hub's remaining count and its remaining places
  are equal, and concludes that every one of those spokes is a line

### Requirement: Hint: A Spokes hint plan is stable across recomputation

A hint plan SHALL be stable across recomputation: re-requesting a hint after the
player has followed a step SHALL continue the same line of reasoning rather than
propose a different or contradictory one.

#### Scenario: A journey resumes where the player left it

- **WHEN** the player follows the first leg of a saturated hub's journey and the
  plan is computed again
- **THEN** the plan still holds that hub's remaining spokes as lines, and nothing
  in it contradicts the step followed

### Requirement: Hint: A Spokes hint prefers a connection and never hints a useless rule-out

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

### Requirement: Hint: Spokes' hint stops at bounded reasoning

The Spokes hint SHALL narrate the contradiction look-ahead only at its bounded
strength. The unbounded rung, the one the `Unreasonable` tier is named for, SHALL
NOT contribute a firing to a hint plan on any tier, including boards generated
below that tier. Where deduction and the bounded look-ahead run out, the hint
SHALL refuse with a message saying no further move can be deduced.

#### Scenario: Planning at the top tier buys the plan nothing

- **WHEN** a hint plan is computed for the same board at the top tier and at
  Normal
- **THEN** the two plans are the same sequence of firings

### Requirement: Hint: Spokes' hint tries its techniques in one order

The plan's next step SHALL be the first of these that the board gives: a hub
with exactly as many free spokes as lines it still needs; two neighboring
1-hubs that both still need their line; a hub with all its lines, for those
of its free spokes that reach a hub still needing one; and last the bounded
look-ahead, which reads the free spokes hub by hub and tries each as a forced
line before a forced rule-out.

#### Scenario: Two 1-hubs come before a finished hub

- **WHEN** no hub's count forces a line, two neighboring 1-hubs both still
  need their line, and a finished hub elsewhere has a free spoke toward an
  unfinished one
- **THEN** the plan's next step rules out the spoke between the 1-hubs

### Requirement: Hint: A Spokes hint shows a line to draw and marks a dot to rule out

A displayed step SHALL mark each spoke it has still to decide and the hubs its
words name. The dot of a spoke the step rules out SHALL itself be left as an
unmarked one inside the step's ring, and a hub's outline SHALL sit just
outside its rim. A spoke that an earlier leg of the journey settled
SHALL carry no hint mark.

#### Scenario: The second leg of a saturated hub

- **WHEN** a hub's count forces three lines and the player has drawn the
  first
- **THEN** the step shows the two lines still to draw in the hint color and
  the hub with its outline, and the line already drawn is drawn as any line is

### Requirement: Look: Spokes marks hubs whose spoke count is met

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

### Requirement: Look: What Spokes draws

Rendering SHALL draw each hub as a circle carrying its available spokes and clue,
SHALL draw lines between connected hubs, SHALL highlight the hub being dragged
from, SHALL color an over-filled or isolated hub as an error, and SHALL flash on
completion.

#### Scenario: Completing the connected, satisfied board wins

- **WHEN** every hub carries exactly its clue's lines and all hubs form one connected
  group with no crossing lines
- **THEN** the game is reported solved and flashes
