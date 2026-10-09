# loopy Specification

## Purpose
Loopy (Slitherlink), the puzzle of drawing one closed loop along grid edges so
that each numbered face has that many of its edges on the loop, on the square
grid and many other tilings. This capability specifies what is Loopy's own:
its description and grid-ordering formats, its graded solver, its deals on the
aperiodic tilings, its pointer and keyboard controls, its play aids, its
corner and pair notes, its hint, and its presets.

## Requirements

### Requirement: Loopy offers every tiling the geometry module provides

Loopy SHALL support every grid type the geometry module provides, each a row
of `LOOPY_GRIDS`.

#### Scenario: Every grid type produces a playable board

- **WHEN** a new game is generated for any grid type at a legal size and any
  difficulty
- **THEN** a board is produced whose clues admit exactly one solution at that
  difficulty

### Requirement: Loopy's grid ordering is the wire format

Loopy SHALL keep its own grid ordering, `LOOPY_GRIDS`, which is distinct from
the geometry module's `GRIDGEN_LIST` ordering, and both orderings SHALL
survive, with an explicit mapping from each Loopy entry to its grid type. The
index in Loopy's ordering is frozen into saved game IDs: a new entry SHALL be
appended at the end, and entries SHALL NOT be reordered or inserted.

#### Scenario: A game ID round-trips through Loopy's own grid ordering

- **WHEN** a game ID naming a grid type is encoded and decoded
- **THEN** the same grid type is selected, by Loopy's ordering rather than the
  geometry module's

### Requirement: Loopy enforces each tiling's minimum size

Per-grid-type minimum sizes (both dimensions at least `amin`; at least one
dimension at least `omin`) SHALL be enforced by Loopy, not by the geometry
layer, which refuses only a size that is not positive or is too large to
build. `validateParams` SHALL also
refuse a Penrose (kite/dart) board narrower than 4, at any height, since every
patch drawn at that width is degenerate and no redraw recovers it.

#### Scenario: A Cairo board needs one side of four

- **WHEN** Cairo params of 3 by 3 and of 3 by 4 are validated
- **THEN** the first is refused by Loopy's `validateParams`, since neither side
  reaches the tiling's `omin`, and the second is accepted

#### Scenario: A narrow kite/dart board is refused by its width alone

- **WHEN** Penrose (kite/dart) params of 3 by 8 and of 4 by 3 are validated
- **THEN** the first is refused with "Width for Penrose (kite/dart) must be at
  least 4." and the second is accepted

### Requirement: Loopy descriptions use the upstream run-length encoding

A Loopy description SHALL encode one entry per face in face order: a clue as a
digit `0`–`9` or a letter `A`–`Z` for values 10 and above, and a run of 1–26
unclued faces as a single letter `a`–`z`. Runs longer than 26 SHALL be split.
Where the grid type carries its own description, the game description SHALL be
the grid description, a separator, and the clue string.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded
- **THEN** the resulting clues are identical, and re-encoding yields the same
  description

### Requirement: Loopy validates a description against the grid's face count

Validation SHALL reject a description whose entry count does not equal the
grid's face count, distinguishing "too short" from "too long", and SHALL reject
unknown characters. Validation SHALL NOT be required to detect a description
that is syntactically valid but geometrically impossible or unsolvable.

#### Scenario: A description of the wrong length is rejected

- **WHEN** a description carrying more or fewer entries than the grid has faces
  is validated
- **THEN** it is rejected with a message distinguishing which

### Requirement: Loopy generation recovers from a degenerate grid patch

Where building a grid from a generated description fails because the patch
contains no landlocked dots, Loopy SHALL discard that description, generate a
fresh one, and retry, within a bounded number of attempts. It SHALL NOT raise
the per-type minimum sizes to avoid the condition, which depends on the random
draw and not on the size. Retrying SHALL be deterministic, so that a seed
always produces the same board. Exhausting the bound SHALL raise an error
rather than return a fallback board.

#### Scenario: A degenerate patch yields a playable board rather than an error

- **WHEN** a grid type, size and seed that produce a degenerate patch on the
  first attempt are used to generate a game
- **THEN** a valid board is produced

#### Scenario: Generation remains reproducible across retries

- **WHEN** the same seed is used twice for a case that requires a retry
- **THEN** both runs produce the same board

### Requirement: Loopy is playable from the keyboard alone

Loopy SHALL accept keyboard input that can select any edge and set it to any of
its three states, so that a player with no pointer can play a board to
completion. This SHALL hold for every tiling Loopy offers, including the
aperiodic ones. Loopy SHALL NOT be exempt from the collection's
keyboard-reachability guard.

#### Scenario: A keyboard-only player completes a board

- **WHEN** a player uses only the keyboard, on any of Loopy's tilings
- **THEN** every edge is reachable, each can be set to line, cross or unknown,
  and the board can be brought to a solved state

#### Scenario: Loopy is not on the keyboard-exemption list

- **WHEN** the collection-wide keyboard-reachability guard runs
- **THEN** Loopy is not on the exemption list, and a keyboard-only sequence
  changes its board

### Requirement: A plain arrow walks Loopy's cursor along an edge

The cursor SHALL be a dot. A plain arrow SHALL walk it one dot along the edge
that best continues in the arrow's direction: the nearest in angle, and only
within 90° of the arrow, so an arrow never moves the cursor against itself. The
edge just walked SHALL become the chosen edge. Ties SHALL break in opposite
rotational senses for opposite arrows (Up and Right clockwise, Down and Left
counter-clockwise), which is what makes every edge of the triangular grid
walkable.

#### Scenario: A tied edge is walked from its other end

- **WHEN** an edge of the triangular grid ties with another for an arrow at one
  of its dots and loses the tie
- **THEN** it is the mirror tie for the opposite arrow at its other dot, where
  the tie breaks the other way and that arrow walks it

### Requirement: A Shift+arrow aims Loopy's cursor without moving it

A walk can only choose the edge it walked, so a Shift+arrow SHALL aim without
moving the cursor: the first press SHALL choose the dot's nearest edge in that
direction and a repeat of the same arrow the next one round, wrapping, so every
incident edge is reachable in at most `degree` presses.

#### Scenario: Repeating one arrow visits every edge at the dot

- **WHEN** Shift and one arrow are pressed `degree` times at a dot
- **THEN** each incident edge is chosen exactly once and the cursor stays on
  that dot

### Requirement: Loopy's keyboard coverage is proven over every preset

Coverage SHALL be proven mechanically over every preset, in two halves. The
walk alone SHALL reach every edge of every preset except Penrose kite/dart,
whose degree-5 dots leave a small residue that no tie-break reaches. Walk plus
aim SHALL reach every edge of that one, with the residue pinned so that it
cannot grow.

#### Scenario: Every edge is walkable, or aimable where the walk cannot reach

- **WHEN** the walk rule is applied from every dot of every preset's grid
- **THEN** every edge of every preset except Penrose kite/dart is the edge some
  arrow walks from one of its endpoints, every dot is reachable by walking
  from the cursor's start, and no walk moves against its arrow
- **AND** on Penrose kite/dart the unwalkable edges number no more than the
  pinned residue and each is aimable from an endpoint, with `degree` aim
  presses of one arrow visiting each incident edge exactly once

### Requirement: Enter, Space and the erase key act on Loopy's chosen edge

Outside notes mode, Enter and Space SHALL be the left and right pointer buttons
on the chosen edge, and the erase key SHALL clear it. In notes mode they note
corners and pairs instead, as "The keyboard notes corners and pairs at the
cursor" describes. A select SHALL NOT move the cursor, which is already at the
far end of the edge it walked. A pointer press SHALL hide the cursor, and
Escape SHALL hide it too.

#### Scenario: Enter marks the edge behind you and stays put

- **WHEN** an arrow walks the cursor along an edge and Enter is pressed
- **THEN** that edge becomes a line and the cursor stays on the dot it reached,
  and walking back over the edge and pressing Enter again clears it

#### Scenario: A loop is traced with one arrow and one Enter per edge

- **WHEN** a player draws a run of lines from the keyboard, outside notes mode
- **THEN** each edge takes one arrow press and one Enter

### Requirement: The keyboard sets an edge through the code a click uses

The keyboard SHALL reach an edge through the same code path a click uses, so
that the auto-follow preference, which extends a click along a forced path of
edges, applies identically to a keyboard selection. Loopy SHALL NOT keep a
parallel path for the keyboard, since a second input model would drift from the
first.

#### Scenario: Auto-follow applies to a keyboard selection

- **WHEN** the auto-follow preference is on and an edge is set from the keyboard
- **THEN** the forced path is extended exactly as it would be for a click on that
  edge, and the move produced is identical to the click's

### Requirement: Loopy's cursor is drawn from grid geometry

The cursor SHALL be drawn from grid geometry rather than from a lattice, since
an irregular tiling has no lattice to draw from: a disc under the cursor's dot
and a halo under its chosen edge, both in the collection's cursor color, each
painted beneath the mark it highlights so that the edge's own state stays
legible.

#### Scenario: The chosen edge keeps its own color

- **WHEN** the cursor is visible with a drawn line as its chosen edge
- **THEN** a halo in the cursor color lies under that edge, a disc in the
  cursor color lies under the cursor's dot, and the line and the dot are
  painted over them in their own colors

### Requirement: Loopy's cursor is held under ui.cursor in its own shape

The cursor SHALL be held under `ui.cursor`, the collection's one name for it,
in a Loopy-specific shape (dot, chosen edge, the arrow that chose it, visible)
rather than the engine's grid-cell shape: its position is a dot index, not a
cell, and a Shift+arrow chooses an edge without moving it. The cross-game
cursor guard finds cursors by the grid-cell shape and does not see this one, so
Loopy's own tests SHALL guard it.

#### Scenario: A new game's cursor is a hidden dot with no edge chosen

- **WHEN** a new game's UI is created
- **THEN** `ui.cursor` holds a dot index, no chosen edge, no arrow, and is not
  visible

### Requirement: A click sets the nearest edge to an absolute state

A pointer SHALL reach an edge by nearest-edge hit testing. A click SHALL set
an edge to an absolute state rather than toggling relative to an unknown one,
so that replaying a move is idempotent.

#### Scenario: A click sets the edge nearest the pointer

- **WHEN** the board is clicked near an edge
- **THEN** that edge changes to the state the button and its current state
  determine

### Requirement: Each button sets its own state and clears a decided edge

Outside notes mode, the left button (a tap) SHALL set an undecided edge to a
line and the right button (a long press) to a cross, and either SHALL return a
decided edge to unknown. A finger and a mouse SHALL behave the same. In notes
mode a press notes corners and pairs instead, as "A tap cycles a corner note
and a drag cycles a pair note" describes.

#### Scenario: Either button clears a decided edge

- **WHEN** an edge is a line and the right button is pressed on it, outside
  notes mode
- **THEN** the edge returns to unknown, and is not set to a cross

### Requirement: Loopy offers auto-follow and faint-line preferences

Loopy SHALL provide an auto-follow preference (off / grid-only /
grid-and-state) which extends a click along a forced path of edges, and a
preference for drawing excluded lines faintly.

#### Scenario: Auto-follow extends a click along a corridor

- **WHEN** auto-follow is set to grid-only and an edge is clicked whose
  neighbor along the path is forced by the grid alone and is in the state the
  clicked edge was in
- **THEN** the one move sets the clicked edge and the forced edges after it to
  the same state

### Requirement: Loopy draws edges in a fixed color order with clues at the incenter

Rendering SHALL draw edges in a fixed color order so that mistaken edges paint
over all others, SHALL place clue text at each face's incenter, SHALL highlight
the edges of every closed loop but the largest when more than one exists, and
SHALL flash on completion.

#### Scenario: Completing a single loop wins

- **WHEN** the drawn lines form exactly one closed loop with no stray paths and
  every clue is satisfied
- **THEN** the game is reported solved and flashes

### Requirement: Loopy grades boards with a four-tier deductive solver

Loopy SHALL provide a solver with four difficulty tiers (Easy, Normal, Tricky,
Hard), implemented as deduction rungs run to a fixpoint. The solver SHALL NOT
backtrack or guess at any tier. Tricky SHALL NOT be a separate rung but SHALL
unlock additional inferences within the dline rung.

#### Scenario: The solver grades a board at the intended difficulty

- **WHEN** a board generated at a given difficulty is solved
- **THEN** it is solvable at that difficulty and not at the tier below

### Requirement: The dline index is the same from the dot and from the face

The dline machinery SHALL index a pair of edges adjacent around a common dot
consistently whether that pair is reached from the dot or from the face. This
consistency SHALL be verified for every grid type, because a mismatch weakens
the solver silently rather than failing.

#### Scenario: The dline index is consistent from both directions

- **WHEN** a dline is addressed via its dot and via its face, for any face and
  corner of any grid type
- **THEN** both address the same pair of edges

### Requirement: Loopy checks the board against its solution

`findMistakes(state)` SHALL report every edge the player has marked against the
board's unique solution: a line the loop does not run along, and an edge ruled
out that the loop does run along. The solution SHALL be solved from the clues
alone at the top tier, and a board whose clues admit no solution the solver can
prove unique SHALL report no mistakes. The highlighting `checkCompletion`
does, of a rule broken on the board as drawn without knowing the answer, is
distinct and SHALL remain.

#### Scenario: A line the loop does not use is a mistake

- **WHEN** the player draws a line on an edge the solution leaves empty and Check
  is requested
- **THEN** that edge is reported and drawn in the mistake color, and no edge the
  player marked in agreement with the solution is reported

#### Scenario: A broken rule is flagged without the answer

- **WHEN** a dot carries three lines, or the lines close a loop that is not the
  only one
- **THEN** `checkCompletion` flags it on the board as drawn, whether or not Check
  has been requested

### Requirement: Loopy draws a mistaken edge in the mistake color

The renderer SHALL draw a mistaken line in the mistake color and a mistakenly
ruled-out edge as a cross in the mistake color, whether or not excluded lines
are drawn faintly.

#### Scenario: A ruled-out edge the loop needs is a mistake

- **WHEN** the player rules out an edge the solution's loop runs along
- **THEN** that edge is reported and drawn with a cross in the mistake color, even
  with faint lines turned off

### Requirement: Loopy rules out the edges counting has settled

Loopy SHALL provide a preference that, while it is on, extends a move that
draws a line so that the move also marks as excluded every edge the drawn line
has settled by counting alone: the remaining edges at a dot that now carries
two lines, and the remaining edges of a face whose clue is now met exactly. The
preference SHALL default on, a divergence from the collection's aids-default-off
posture that is justified where an aid discards nothing and removes no decision.

#### Scenario: A satisfied clue rules out its other edges

- **WHEN** the preference is on and a drawn line brings a face's line count up to its
  clue
- **THEN** every still-unknown edge of that face is marked excluded by the same move

#### Scenario: The preference off leaves the move alone

- **WHEN** the preference is off and a drawn line gives a dot its second line
- **THEN** the move sets only the edges the click itself asked for

### Requirement: The ruled-out edges are part of the drawing move

The excluded edges SHALL be part of the drawing move rather than a move of
their own, so that a single undo restores the board to the position before the
line was drawn. An edge the player has already set SHALL NOT be changed: only
an edge still unknown is marked.

#### Scenario: A dot's second line rules out its other edges

- **WHEN** the preference is on and a drawn line gives a dot its second line
- **THEN** every still-unknown edge at that dot is marked excluded by the same move,
  and one undo restores all of it

### Requirement: Only a drawn line rules out further edges

While the preference is on, only a drawn line SHALL trigger the ruling out. Excluding an edge and erasing a
line can neither give a dot its second line nor complete a clue's count, so
neither SHALL extend a move, and no edge excluded this way SHALL settle a
further one.

#### Scenario: Excluding an edge settles nothing further

- **WHEN** the preference is on and the player marks an edge excluded, or erases a line
- **THEN** the move sets that edge alone

### Requirement: Loopy shows which lines are joined to the one under the pointer

Loopy SHALL highlight the connected run of drawn lines containing the edge
under the mouse pointer. An edge carrying no line has no run, and hovering it
SHALL highlight nothing. When the pointer leaves the board the highlight SHALL
clear. The highlight of every closed loop but the largest SHALL be unaffected:
that one reports a loop already closed, and this one lets the player see the
closure coming.

#### Scenario: hovering a line lights its run and no other

- **WHEN** the board carries two runs of lines that share no dot, and the pointer rests
  on a line of one of them
- **THEN** every line of that run is highlighted and no line of the other is

#### Scenario: the pointer leaves

- **WHEN** the pointer moves off the board while a run is highlighted
- **THEN** the highlight clears

#### Scenario: an edge with no line on it

- **WHEN** the pointer rests on an edge that is undecided or ruled out
- **THEN** no run is highlighted

### Requirement: The hover highlight is derived from the board and the pointer alone

The hover highlight SHALL be derived from the board and the pointer alone, never from
a per-segment identity, which changes whenever two runs join and would
reshuffle the board as the player draws. It SHALL be a second reader of the
connectivity the game already computes for its completion check, not a second
notion of it.

#### Scenario: A joined run is highlighted whole

- **WHEN** a line drawn from the keyboard joins two runs while the pointer
  rests on an edge carrying no line, and the pointer then moves onto any line
  of the joined run
- **THEN** nothing is highlighted before the pointer moves, and every line of
  the joined run is highlighted after

### Requirement: A hover makes no move and nothing depends on it

A hover SHALL never make a move, alter history, or change what a later move
does. Nothing SHALL depend on it: a touch screen has no hover, and the game
SHALL be exactly as playable without one.

#### Scenario: a hover that changes nothing repaints nothing

- **WHEN** the pointer moves but stays nearest the same edge
- **THEN** the board is not repainted, so a pointer sweep costs one repaint per edge
  crossed rather than one per event

### Requirement: Loopy notes corners and pairs

Loopy SHALL let the player note, on every tiling and with pointer, touch and
keyboard, the two kinds of fact its deductions from Normal up rest on: a corner
(two edges adjacent around a dot) carrying at least one line, at most one, or
exactly one; and a pair of any two edges that match (both lines or neither) or
are opposites (exactly one is a line). Notes mode SHALL be the collection's
pencil mode, `ui.pencilMode`, off on a new game.

#### Scenario: A corner takes each of its three notes on any tiling

- **WHEN** a corner of any tiling is noted with the pointer or from the
  keyboard
- **THEN** it can be brought to at least one line, to at most one and to
  exactly one, and any two edges can be noted as a match or as opposites

### Requirement: Loopy's notes are state, set by absolute moves

Notes SHALL be state and absolute-set moves beside the lines, so undo covers
them and a save replays them. A save holding only line moves SHALL still load.

#### Scenario: Notes survive a save

- **WHEN** a game with lines, a corner note and a pair note is saved and loaded
- **THEN** the loaded game holds the same notes, and a save holding only line moves
  loads too

### Requirement: Loopy's gutter fits a corner note on a rim dot

The gutter around the board SHALL be wide enough for a corner note on a rim
dot, so that no note is clipped by the edge of the canvas. A gutter sized for
the keyboard cursor alone is not enough.

#### Scenario: A note at the rim is drawn whole

- **WHEN** a corner at a dot on the board's rim is noted
- **THEN** the note's band and its outline lie inside the canvas

### Requirement: A tap cycles a corner note and a drag cycles a pair note

In notes mode a tap SHALL cycle the corner it lands in: the angle, around the
nearest dot, between the two adjacent edges either side of it, with which of a
corner's two angles is meant read off the face the corner belongs to. A drag
from one edge to another SHALL cycle their pair, whatever button class the drag
and release arrive as, and a release off the board SHALL note nothing.

#### Scenario: A tap in a face's corner notes that corner

- **WHEN** notes mode is on and the player taps a point inside a face near one of
  its dots, on any tiling
- **THEN** the corner of that face at that dot, as the solver indexes it, is noted
  as needing a line, and further taps cycle it through at most one, exactly one and
  none

#### Scenario: A drag from one edge to another notes their pair

- **WHEN** notes mode is on and the player drags from one edge to another
- **THEN** the two edges are noted as matching, a second drag notes them as
  opposites, a drag arriving as the right button cycles the other way, and a press
  released off the board notes nothing

### Requirement: Each button cycles a note its own way

In notes mode the left button SHALL cycle a corner through none, at least one,
at most one and exactly one, and a pair through none, match and opposites. The
right button, and a held finger, SHALL cycle each the other way. Each cycle
passes through none, so the pointer clears a note by cycling it.

#### Scenario: The right button reaches exactly one first

- **WHEN** notes mode is on and an unnoted corner is pressed with the right
  button
- **THEN** it is noted as exactly one line, and a second such press notes it as
  at most one

### Requirement: The keyboard notes corners and pairs at the cursor

From the keyboard in notes mode, Enter SHALL cycle the corner that follows the
chosen edge in the cursor dot's edge order, and the erase key SHALL clear it.
That corner SHALL be outlined in the cursor color while the mode is on. Space
SHALL pin the chosen edge, and Space on a second edge SHALL cycle the pair
between them and release the pin. Escape SHALL release a pin before it hides
the cursor.

#### Scenario: Enter notes the corner a tap would

- **WHEN** notes mode is on and Enter is pressed with an edge chosen
- **THEN** the move is the one a tap inside the outlined corner makes, and every
  corner of every tiling is the one Enter notes from one of its edges

### Requirement: Loopy draws a corner note as a band and a pair note as a connector

A corner note SHALL be drawn as a band across its angle in the pencil color,
filled for at least one line and outlined for at most one, and a pair note as a
connector between its edges' midpoints marked `=` or `≠`.

#### Scenario: Exactly one line is both filled and outlined

- **WHEN** a corner is noted as carrying exactly one line
- **THEN** it is drawn with both the fill of at least one line and the outline
  of at most one, in the pencil color

### Requirement: Loopy checks notes against its solution

`findMistakes(state)` SHALL report, beside the edges it reports, every corner note
the solution breaks (at least one line where the solution has neither edge, at most
one where it has both) and every pair note it breaks (a match where the solution's
two edges differ, opposites where they agree), and SHALL report none on a board with
no provably unique solution. The renderer SHALL draw a mistaken note in the mistake
color, and the hint SHALL refuse while one stands.

#### Scenario: A wrong note is a mistake

- **WHEN** the player notes a corner the loop passes by as needing a line, or two
  edges the loop treats differently as matching, and Check is requested
- **THEN** each note is reported and drawn in the mistake color, and a hint asks
  for the mistakes to be fixed first

### Requirement: Loopy explains the next deduction from notes the player can make

`hint(state)` SHALL return the lines the solver can decide from the player's
own board as an ordered plan, each step narrating why its move is forced from
premises the sentence itself states. Because the mistake check vouches for
every mark before the game is asked, the plan SHALL take the player's lines,
ruled-out edges and notes as facts.

#### Scenario: Following the plan finishes the board on every tiling

- **WHEN** a board of any tiling and any tier is generated and its hints are
  followed one step at a time from the empty board
- **THEN** every step sets only lines and notes that agree with the solution, and
  the board ends solved

### Requirement: The hint plan is the solver's own rungs, easiest tier first

The plan SHALL be the solver's own rungs, run with a recorder that names the
premise behind each change and returns at the first premise that changed a
line, so that one firing is one step. It SHALL try the rungs of the easiest
tier to exhaustion before those of the next, whatever tier the board was
generated at, since a game ID need not carry one. The generator SHALL NOT build
a recorder, so no generated board changes.

#### Scenario: A Hard board's first hints are Easy deductions

- **WHEN** a hint is asked on a board generated at Hard while an Easy rung can
  still decide a line
- **THEN** the step shown is that Easy rung's firing

### Requirement: A fact a hinted line rests on is first placed as a note

From Normal, the solver reasons about corners and pairs. Every such fact a line
in the plan rests on SHALL first be placed as a note by a step of its own,
narrated by that fact's premise, at the point in the plan where the fact was
found. A fact no line rests on SHALL NOT be placed.

#### Scenario: A clue decides a corner and its dot settles the edges

- **WHEN** a 3's other edges can give it at most 2, and the dot at one of its
  corners has no line and only that corner's two edges open, and hints are
  followed
- **THEN** one step notes that corner as needing a line and outlines the 3, and the
  next draws both edges as lines in one move, citing the marked corner and ringing
  the dot

### Requirement: A hint step cites only notes on the board, and at most two pairs

A step SHALL cite only notes already on the board when it is shown, and SHALL
cite at most two pairs: a pair that follows from a chain of pairs SHALL be
placed one link at a time.

#### Scenario: A chain of pairs is noted a link at a time

- **WHEN** the next line rests on a chain of pairs
- **THEN** each pair in the chain is placed as a note, each composed pair is placed
  by a step citing the two pairs it joins and the edge they share, and no step cites
  more than two pairs

#### Scenario: A step cites only notes on the board

- **WHEN** a plan is followed one step at a time from the empty board, on any tiling
- **THEN** every corner and pair a step cites is already noted on the board when that
  step is shown

### Requirement: A hint step marks what it sets and what its sentence names

Each step SHALL mark the edges it sets with a band in the hint's action color,
solid for a line and broken for an edge that cannot be one, outline the clues
its sentence names, and ring the dot its sentence names. A step placing a note
SHALL draw it in the hint's action color, and the notes a step cites SHALL be
redrawn in its evidence color.

#### Scenario: A step that rules an edge out bands it broken

- **WHEN** a step draws one edge as a line and rules another out
- **THEN** the first carries a solid band and the second a broken one, both in
  the hint's action color

### Requirement: Loopy settles a blocked corner pair in one deduction

Loopy's solver SHALL recognize, as a single deduction at its easiest tier, a
clued face needing all but one of its still-open edges where two dots adjacent
around it each already carry a line: the edge between those two dots SHALL be
ruled out and every other open edge of the face SHALL be drawn, in one firing.

#### Scenario: Two blocked dots settle the whole clue at once

- **WHEN** a clue needs all but one of its open edges and two dots next to each
  other around it already have a line
- **THEN** one firing rules out the edge between those dots and draws every other
  open edge of the clue, and the hint shows it as a single step with both dots
  ringed

### Requirement: The blocked-pair deduction is stated over the clue

The blocked-pair deduction SHALL be stated over the clue rather than over any one digit or
any one tiling: a square clued 3 and a triangle clued 2 are the same deduction.
It SHALL rest on the same guard as the one-dot deduction it strengthens, so
that a face already carrying some of its lines is covered without a second
rule.

#### Scenario: The same deduction on a face that is not a square

- **WHEN** the face is a triangle clued 2, or any other face clued one short of
  its order
- **THEN** the same deduction fires and its sentence reads the same with that
  clue's digit throughout

### Requirement: The blocked-pair deduction regrades no board

The conclusions the blocked-pair deduction reaches SHALL already be reachable by the tier's
existing rungs, so that no board changes the tier it is graded at and no
generated description changes. A later strengthening that is not
conclusion-preserving SHALL be measured against a corpus graded both ways
before it is written, because a board labeled at a tier a player no longer
needs is a dishonest difficulty.

#### Scenario: Teaching the solver the pattern regrades no board

- **WHEN** every board of the frozen differential is generated and graded
- **THEN** each description is unchanged byte for byte and each board still needs
  the difficulty it was recorded at, rather than becoming solvable one tier lower

### Requirement: The hint narrates a blocked pair as one step

`hint(state)` SHALL narrate the blocked-pair firing as one step that rings both dots,
outlines the clue, and bands every edge it settles, solid for the lines and
broken for the edge it rules out. It SHALL name the excluded edge as the one
joining the two dots rather than by any direction, since most of Loopy's
tilings have no top. The sentence SHALL NOT describe the loop's path around the
clue, because the same firing covers faces where the loop goes round nothing.

#### Scenario: The excluded edge is named by its dots

- **WHEN** the blocked-pair step is shown on a tiling with no upright faces
- **THEN** its sentence names the edge joining the two ringed dots, and names
  no direction and no path round the clue

### Requirement: Loopy's presets draw tall, read width first, and turn where the tiling allows

A tiling that turns SHALL keep upstream's preset size, turned where it was landscape. Preset titles SHALL
print the width first, as every other game's titles and the Custom dialog do.

#### Scenario: Titles read width first

- **WHEN** the preset menu is walked
- **THEN** every leaf's title begins with its params' `{w}x{h}`

### Requirement: A tiling that cannot turn takes a preset size of its own

A preset of a tiling that cannot turn SHALL take a size of its own that draws
taller than wide where upstream's preset is landscape, chosen to keep about the
drawn area of upstream's preset.

#### Scenario: The Triangular preset is taller than wide

- **WHEN** the Triangular preset is drawn
- **THEN** it is 9 wide and 14 tall, and draws no wider than tall

### Requirement: Each row of LOOPY_GRIDS states whether its tiling turns

Each row of `LOOPY_GRIDS` SHALL state whether its tiling `turns`, and
`transposeParams` SHALL turn exactly those. A tiling turns when a patch `h`
wide and `w` tall is the same tiling on its side: the square-lattice ones
(Squares, Snub-Square, Cairo, Octagonal, Compass-Dodecagonal) and the aperiodic
tilings whose patch fills its box alike both ways (both Penroses, Spectres). A
triangle or hexagon lattice turned is another tiling and a Hats patch is not
the same shape turned: those SHALL NOT turn.

#### Scenario: A hexagonal tiling is dealt as chosen

- **WHEN** a Honeycomb board is dealt to fit a wide area
- **THEN** it is dealt at the size chosen, because Honeycomb does not turn

### Requirement: Loopy draws an aperiodic patch again when it is far under its size

On an aperiodic tiling, Loopy SHALL NOT deal a patch that has half or fewer of
the faces its size usually gives while a larger one can be drawn. The usual
count SHALL be a function of the width and height alone, the same for every
aperiodic tiling, and not a table of sizes. Loopy SHALL draw a fresh
description, within a bounded number of draws, until a patch has more than half
of it.

#### Scenario: A size that usually fills its box is not dealt three faces

- **WHEN** a 5x5 Penrose (rhombs) board is dealt, where some patches are three
  rhombs around a point and the rest are larger
- **THEN** the board has more than half the faces a 5x5 usually gives

### Requirement: Where no patch reaches its size, Loopy deals the largest drawn

Where no patch drawn has more than half the usual count, Loopy SHALL deal the
largest patch it drew. A size SHALL NOT be refused because its patches are
small. A tier SHALL be refused at such a size, in the words of `noSuchTier`,
only where its faces have no puzzle of it: Normal on the Penrose (rhombs)
sizes whose every patch is three rhombs round a point. A deal that runs its
bound on patches out SHALL throw `RetryLimitExceeded`, as any generator does.

#### Scenario: A size no patch fills deals the largest patch drawn

- **WHEN** a 3x14 Penrose (rhombs) board is dealt, where no patch has more than
  half the usual count and the patches are of two sizes
- **THEN** the board is a patch of the larger size

#### Scenario: A size whose every patch is three faces deals them

- **WHEN** a 3x3 Penrose (rhombs) board is dealt at Easy, Tricky or Hard
- **THEN** a board of three faces is produced, and the deal does not give up

#### Scenario: The three rhombs have no Normal puzzle

- **WHEN** a 3x3, 3x4, 3x5 or 4x3 Penrose (rhombs) board is asked for at Normal
- **THEN** `validateParams` refuses the tier and names the size, and 5x3 at
  Normal is dealt

#### Scenario: Every patch drawn is one that cannot carry the tier

- **WHEN** the generator is asked directly for a 3x3 Penrose (rhombs) board at
  Normal, past `validateParams`
- **THEN** it throws `RetryLimitExceeded` once its patches are spent, and the
  engine's `generate` answers that there is no board

### Requirement: A redraw changes only which description is drawn

The redraw of an aperiodic patch SHALL change only which description is drawn.
The grid a description builds SHALL NOT change, since saved games and shared
game IDs carry descriptions. The draws SHALL come from the deal's own random
stream, so that a given seed always produces the same board.

#### Scenario: A redrawn deal is reproducible

- **WHEN** the same seed deals twice at a size where the first patch drawn is
  far under its size
- **THEN** both deals produce the same board, and the description dealt builds
  the same grid when the game is loaded from it
