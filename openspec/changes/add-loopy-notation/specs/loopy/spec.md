## ADDED Requirements

### Requirement: Loopy notes corners and pairs

Loopy SHALL let the player note, on every tiling and with pointer, touch and
keyboard, the two kinds of fact its deductions from Normal upward rest on: a
*corner* (two edges adjacent around a dot) carrying at least one line, at most one,
or exactly one; and a *pair* of any two edges that match (both lines or neither) or
are opposites (exactly one is a line). Notes SHALL be state and absolute-set moves
beside the lines, so undo covers them and a save replays them, and a save holding
only line moves SHALL still load.

Notes mode SHALL be `ui.pencilMode`, off on a new game, toggled by the collection's
shared pencil-mode toggle rather than by anything of Loopy's own, and shown by the
collection's pencil glyph in a strip below the board. With the mode off, input SHALL
be unchanged.

In notes mode a tap SHALL cycle the corner it lands in: the angle, around the nearest
dot, between the two adjacent edges either side of it, with which of a corner's two
angles is meant read off the face the corner belongs to. A drag from one edge to
another SHALL cycle their pair, whatever button class the drag and release arrive as,
and a release off the board SHALL note nothing. The left button SHALL cycle a corner
through none, at least one, at most one and exactly one, and a pair through none,
match and opposites; the right button, and a held finger, the other way; the middle
button SHALL clear.

From the keyboard in notes mode, Enter SHALL cycle the corner that follows the chosen
edge in the cursor dot's edge order, outlined in the cursor color while the mode is
on, and the erase key SHALL clear it. Space SHALL pin the chosen edge, and Space on a
second edge SHALL cycle the pair between them and release the pin. Escape SHALL
release a pin before it hides the cursor.

A corner note SHALL be drawn as a band across its angle in the pencil color, filled
for at least one line and outlined for at most one, and a pair note as a connector
between its edges' midpoints marked `=` or `≠`.

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

#### Scenario: Enter notes the corner a tap would

- **WHEN** notes mode is on and Enter is pressed with an edge chosen
- **THEN** the move is the one a tap inside the outlined corner makes, and every
  corner of every tiling is the one Enter notes from one of its edges

#### Scenario: Notes survive a save

- **WHEN** a game with lines, a corner note and a pair note is saved and loaded
- **THEN** the loaded game holds the same notes, and a save holding only line moves
  loads too

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

`hint(state)` SHALL refuse through `commonHintRefusal` when the board is solved or
`findMistakes` reports a mistake, and otherwise return the lines the solver can
decide from the player's own board as an ordered plan, each step narrating why its
move is forced from premises the sentence itself states. Because the mistake check
vouches for every mark, the plan SHALL take the player's lines, ruled-out edges and
notes as facts.

The plan SHALL be the solver's own rungs, run with a recorder that names the
premise behind each change and returns at the first premise that changed a line,
so that one firing is one step. It SHALL try the rungs of the easiest tier to
exhaustion before those of the next, whatever tier the board was generated at,
since a game ID need not carry one. The generator SHALL NOT build a recorder, so no
generated board changes.

From Normal, the solver reasons about corners and pairs. Every such fact a line in
the plan rests on SHALL first be placed as a note by a step of its own, narrated by
that fact's premise, at the point in the plan where the fact was found; a fact no
line rests on SHALL NOT be placed. A step SHALL cite only notes already on the board
when it is shown, and SHALL cite at most two pairs: a pair that follows from a chain
of pairs SHALL be placed one link at a time. A step placing a note SHALL draw it in
the hint's action color, and the notes a step cites SHALL be redrawn in its evidence
color.

Each step SHALL mark the edges it sets with a band in the hint's action color,
solid for a line and broken for an edge that cannot be one, outline the clues its
sentence names, and ring the dot its sentence names.

#### Scenario: A clue decides a corner and its dot settles the edges

- **WHEN** a 3's other edges can give it at most 2, and the dot at one of its
  corners has no line and only that corner's two edges open, and hints are
  followed
- **THEN** one step notes that corner as needing a line and outlines the 3, and the
  next draws both edges as lines in one move, citing the marked corner and ringing
  the dot

#### Scenario: A chain of pairs is noted a link at a time

- **WHEN** the next line rests on a chain of pairs
- **THEN** each pair in the chain is placed as a note, each composed pair is placed
  by a step citing the two pairs it joins and the edge they share, and no step cites
  more than two pairs

#### Scenario: A step cites only notes on the board

- **WHEN** a plan is followed one step at a time from the empty board, on any tiling
- **THEN** every corner and pair a step cites is already noted on the board when that
  step is shown

#### Scenario: Following the plan finishes the board on every tiling

- **WHEN** a board of any tiling and any tier is generated and its hints are
  followed one step at a time from the empty board
- **THEN** every step sets only lines and notes that agree with the solution, and
  the board ends solved

#### Scenario: A wrong mark refuses the hint

- **WHEN** the player has drawn a line the solution does not use and asks for a
  hint
- **THEN** the hint refuses with the collection's mistake refusal and the mistaken
  edge is highlighted

## MODIFIED Requirements

### Requirement: Loopy is playable from the keyboard alone

Loopy SHALL accept keyboard input that can select any edge and set it to any of
its three states, so that a player with no pointer can play a board to
completion. This holds for **every** tiling Loopy offers, including the aperiodic
ones.

The cursor SHALL be a **dot**. A plain arrow SHALL **walk** it one dot along
the edge that best continues in the arrow's direction — the nearest in angle,
and only within 90° of the arrow, so an arrow never moves the cursor against
itself — and the edge just walked SHALL become the chosen edge. Ties SHALL break
in opposite rotational senses for opposite arrows (Up and Right clockwise,
Down and Left counter-clockwise), which is what makes every edge of the
triangular grid walkable: an edge tied at one end is the mirror tie for the
opposite arrow at the other end, resolved the other way.

A walk can only choose the edge it walked, so a Shift+arrow SHALL **aim**
without moving: the first press chooses the dot's nearest edge in that
direction and a repeat of the same arrow the next one round, wrapping, so every
incident edge is reachable in at most `degree` presses. Coverage SHALL be
proven mechanically over every preset, in two halves: the walk alone SHALL
reach every edge of every preset except Penrose kite/dart, whose degree-5 dots
leave a small residue that no tie-break reaches, and walk plus aim SHALL reach
every edge of that one, with the residue pinned so it cannot grow.

Outside notes mode, Enter and Space SHALL be the left and right pointer buttons on
the chosen edge, and the erase key the middle one; the keyboard has all three and
needs no three-state cycle, which remains a touch affordance. In notes mode they
note corners and pairs instead, as "Loopy notes corners and pairs" describes. A
select SHALL NOT move the cursor — it is already at the far end of the edge it
walked — so a loop is traced with one arrow and one Enter per edge, and walking back
over a drawn edge and pressing Enter again undraws it. A pointer press SHALL hide
the cursor; Escape SHALL hide it too.

The keyboard SHALL reach an edge through the same code path a click uses, so that
the auto-follow preference — which extends a click along a forced path of edges —
applies identically to a keyboard selection. A parallel path would be a second
input model, and the two would drift.

The cursor SHALL be drawn from grid geometry rather than from a lattice, since
Loopy's renderer has no lattice to draw from on an irregular tiling: a disc
under the cursor's dot and a halo under its chosen edge, both in the
collection's cursor color, each painted *beneath* the mark it highlights so the
edge's own state stays legible.

The cursor SHALL be held under `ui.cursor`, the collection's one name for it,
in a Loopy-specific shape (dot, chosen edge, the arrow that chose it, visible)
rather than the engine's grid-cell shape: its position is a dot index, not a
cell, and an arrow press chooses an edge rather than moving the cursor. This is
the collection's first cursor that is not a cell, and the cross-game cursor
guard — which finds cursors structurally by the grid-cell shape — does not see
it; `loopy-keyboard.test.ts` guards it instead.

#### Scenario: A keyboard-only player completes a board

- **WHEN** a player uses only the keyboard, on any of Loopy's tilings
- **THEN** every edge is reachable, each can be set to line, cross or unknown,
  and the board can be brought to a solved state

#### Scenario: Every edge is walkable, or aimable where the walk cannot reach

- **WHEN** the walk rule is applied from every dot of every preset's grid
- **THEN** every edge of every preset except Penrose kite/dart is the edge some
  arrow walks from one of its endpoints, every dot is reachable by walking
  from the cursor's start, no walk moves against its arrow — and on Penrose
  kite/dart the unwalkable edges number at most nine and each is aimable from
  an endpoint, with `degree` aim presses of one arrow visiting each incident
  edge exactly once

#### Scenario: Auto-follow applies to a keyboard selection

- **WHEN** the auto-follow preference is on and an edge is set from the keyboard
- **THEN** the forced path is extended exactly as it would be for a click on that
  edge, and the move produced is identical to the click's

#### Scenario: Enter marks the edge behind you and stays put

- **WHEN** an arrow walks the cursor along an edge and Enter is pressed
- **THEN** that edge becomes a line and the cursor stays on the dot it reached,
  and walking back over the edge and pressing Enter again clears it

#### Scenario: Loopy leaves the keyboard-exemption list

- **WHEN** the collection-wide keyboard-reachability guard runs
- **THEN** Loopy is not on the exemption list, and a keyboard-only sequence
  changes its board

### Requirement: Loopy pointer and keyboard input, and rendering

Loopy SHALL be played with mouse, stylus, touch or keyboard. A pointer reaches
an edge by nearest-edge hit testing; the keyboard reaches one through the
cursor described in "Loopy is playable from the keyboard alone"; both then set
it through the same code. A click SHALL set an edge to an absolute state rather
than toggling relative to an unknown one, so that replaying a move is
idempotent.

Outside notes mode, with a mouse, each button SHALL cycle between its own line state
and unknown. With a stylus, each button SHALL cycle through all three states, so that
a single tap can reach every state without a second button. In notes mode a press
notes corners and pairs instead, as "Loopy notes corners and pairs" describes.

Loopy SHALL provide an auto-follow preference (off / grid-only / grid-and-state)
which extends a click along a forced path of edges, and a preference for drawing
excluded lines faintly.

Rendering SHALL draw edges in a fixed color order so that mistaken edges paint
over all others, SHALL place clue text at each face's incenter, SHALL highlight
the edges of every closed loop but the largest when more than one exists, and
SHALL flash on completion. Clue text positions depend on tile size and SHALL be
recomputed when it changes.

#### Scenario: A click sets the edge nearest the pointer

- **WHEN** the board is clicked near an edge
- **THEN** that edge changes to the state the button and its current state
  determine

#### Scenario: A keyboard select sets the chosen edge

- **WHEN** Enter, Space or the erase key is pressed with an edge chosen
- **THEN** that edge changes exactly as a left, right or middle click on it would

#### Scenario: Completing a single loop wins

- **WHEN** the drawn lines form exactly one closed loop with no stray paths and
  every clue is satisfied
- **THEN** the game is reported solved and flashes

#### Scenario: Clue positions survive a resize

- **WHEN** the drawing surface is resized after the board has been drawn
- **THEN** clue text is drawn at the correct position for the new tile size

## REMOVED Requirements

### Requirement: Loopy explains the next deduction

**Reason**: It required a step to draw corners and pairs the player had no way to
mark, numbered in the order found, which breaks the rule that a hint relies only on
marks the player can make (owner, 2026-09-15).

**Migration**: "Loopy explains the next deduction from notes the player can make"
keeps its refusal, plan, tier-order and marking rules and its two surviving
scenarios, and places each fact as a note the player can make.
