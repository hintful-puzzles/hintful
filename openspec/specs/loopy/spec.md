# loopy Specification

## Purpose
Loopy (Slitherlink), the puzzle of drawing one closed loop along grid edges so
that each numbered face has that many of its edges on the loop, on the square
grid and many other tilings. This capability specifies its port to the TS
engine, with the graded solver, recovery from a degenerate patch of an aperiodic
tiling, and full play from the keyboard alone.

## Requirements

### Requirement: Loopy game implements the Game interface

The engine SHALL provide `src/games/loopy/` implementing the `Game`
interface for Loopy, registered so the puzzle is served by the TypeScript
engine.

Loopy SHALL support all **18** grid types over its own grid ordering, which is
distinct from `grid.ts`'s `GRIDGEN_LIST` ordering and is **frozen into saved
game IDs**. Both orderings SHALL survive, with an explicit mapping between them;
entries MAY be appended to Loopy's ordering but SHALL NOT be reordered or
inserted, because the index is the wire format.

Per-grid-type **minimum** sizes (both dimensions at least `amin`; at least one
dimension at least `omin`) SHALL be enforced by Loopy, not by the geometry
layer, which deliberately implements only maximum-size guards.

Loopy SHALL declare that it uses the stylus modifier, because its input handling
genuinely distinguishes stylus from mouse (see the input requirement).

#### Scenario: Every grid type produces a playable board

- **WHEN** a new game is generated for any of the 18 grid types at a legal size
  and any difficulty
- **THEN** a board is produced whose clues admit exactly one solution at that
  difficulty

#### Scenario: A game ID round-trips through Loopy's own grid ordering

- **WHEN** a game ID naming a grid type is encoded and decoded
- **THEN** the same grid type is selected, by Loopy's ordering rather than the
  geometry module's

### Requirement: Loopy descriptions use the upstream run-length encoding

A Loopy description SHALL encode one entry per face in face order: a clue as a
digit `0`–`9` or a letter `A`–`Z` for values 10 and above, and a run of 1–26
unclued faces as a single letter `a`–`z`. Runs longer than 26 SHALL be split.
Where the grid type carries its own description, the game description SHALL be
the grid description, a separator, and the clue string.

Validation SHALL reject a description whose entry count does not equal the
grid's face count, distinguishing "too short" from "too long", and SHALL reject
unknown characters. Validation SHALL NOT be required to detect a description
that is syntactically valid but geometrically impossible or unsolvable.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded
- **THEN** the resulting clues are identical, and re-encoding yields the same
  description

#### Scenario: A description of the wrong length is rejected

- **WHEN** a description carrying more or fewer entries than the grid has faces
  is validated
- **THEN** it is rejected with a message distinguishing which

### Requirement: Loopy generation recovers from a degenerate grid patch

Loopy SHALL recover from a degenerate grid patch: where building a grid from a
generated description fails because the patch contains no landlocked dots, it
SHALL discard that description, generate a fresh one, and retry, within a
bounded number of attempts. It SHALL NOT raise the per-type minimum sizes to
avoid the condition, because the condition depends on the random draw rather
than on the size.

Retrying SHALL be deterministic, so that a given seed always produces the same
board and shared game IDs remain reproducible. Exhausting the bound SHALL raise
an error rather than return a fallback board.

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

### Requirement: Loopy grades boards with a four-tier deductive solver

Loopy SHALL provide a solver with four difficulty tiers — Easy, Normal, Tricky,
Hard — implemented as deduction rungs run to a fixpoint. The solver SHALL NOT
backtrack or guess at any tier; Tricky SHALL NOT be a separate rung but SHALL
unlock additional inferences within the dline rung.

The dline machinery SHALL index a pair of edges adjacent around a common dot
consistently whether that pair is reached from the dot or from the face, and
this consistency SHALL be verified for every grid type, because a mismatch
weakens the solver silently rather than failing.

#### Scenario: The solver grades a board at the intended difficulty

- **WHEN** a board generated at a given difficulty is solved
- **THEN** it is solvable at that difficulty and not at the tier below

#### Scenario: The dline index is consistent from both directions

- **WHEN** a dline is addressed via its dot and via its face, for any face and
  corner of any grid type
- **THEN** both address the same pair of edges

### Requirement: Loopy checks the board against its solution

`findMistakes(state)` SHALL report every edge the player has marked against the
board's unique solution: a line the loop does not run along, and an edge ruled out
that the loop does run along. The solution SHALL be solved from the clues alone at
the top tier; a board whose clues admit no solution the solver can prove unique
SHALL report no mistakes.

This is distinct from the rule highlighting `checkCompletion` already does, which
flags a broken rule on the board as drawn (a dot with three lines, a loop that is
not the only one) without knowing the answer, and which SHALL remain.

The renderer SHALL draw a mistaken line in the mistake color and a mistakenly
ruled-out edge as a cross in the mistake color, whether or not excluded lines are
drawn faintly.

#### Scenario: A line the loop does not use is a mistake

- **WHEN** the player draws a line on an edge the solution leaves empty and Check
  is requested
- **THEN** that edge is reported and drawn in the mistake color, and no edge the
  player marked in agreement with the solution is reported

#### Scenario: A ruled-out edge the loop needs is a mistake

- **WHEN** the player rules out an edge the solution's loop runs along
- **THEN** that edge is reported and drawn with a cross in the mistake color, even
  with faint lines turned off

### Requirement: Loopy rules out the edges counting has settled

Loopy SHALL provide a preference that, while it is on, extends a move that draws a
line so that the move also marks as excluded every edge the drawn line has settled by
counting alone: the remaining edges at a dot that now carries two lines, and the
remaining edges of a face whose clue is now met exactly.

The excluded edges SHALL be part of the drawing move rather than a move of their own,
so that a single undo restores the board to the position before the line was drawn.

Only a drawn line SHALL trigger this. Excluding an edge and erasing a line can neither
give a dot its second line nor complete a clue's count, so neither extends a move, and
no edge excluded this way can settle a further one.

An edge the player has already set SHALL NOT be changed — only an edge still unknown
is marked.

Both facts are exact counts rather than deductions, so the player who is not asked to
mark them has not been told anything they could have worked out; they have been spared
bookkeeping. The preference exists because a player may still prefer to keep their own
board, and it defaults **on** — a divergence from the collection's aids-default-off
posture, which is justified where an aid discards nothing and removes no decision.

#### Scenario: A dot's second line rules out its other edges

- **WHEN** the preference is on and a drawn line gives a dot its second line
- **THEN** every still-unknown edge at that dot is marked excluded by the same move,
  and one undo restores all of it

#### Scenario: A satisfied clue rules out its other edges

- **WHEN** the preference is on and a drawn line brings a face's line count up to its
  clue
- **THEN** every still-unknown edge of that face is marked excluded by the same move

#### Scenario: Excluding an edge settles nothing further

- **WHEN** the preference is on and the player marks an edge excluded, or erases a line
- **THEN** the move sets that edge alone

#### Scenario: The preference off leaves the move alone

- **WHEN** the preference is off and a drawn line gives a dot its second line
- **THEN** the move sets only the edges the click itself asked for

### Requirement: Loopy shows which lines are joined to the one under the pointer

Loopy SHALL highlight the connected run of drawn lines containing the edge under the
mouse pointer, so that "are these two ends the same run?" can be answered without
tracing the board by eye. An edge carrying no line has no run, and hovering it SHALL
highlight nothing. When the pointer leaves the board the highlight SHALL clear.

The highlight SHALL be derived from the board and the pointer alone, never from a
per-segment identity. Segment identity changes whenever two runs join, so a scheme that
colors segments reshuffles the board as the player draws; keying on the pointer means
the picture changes when, and only when, the player moves it.

A hover SHALL never make a move, alter history, or change what a later move does. It
shows the player something the board already contains, so **nothing may depend on
it** — a touch screen has no hover, and the game must be exactly as playable without
one.

This is a **second reader of the connectivity the game already computes** for its
completion check, not a second notion of it.

The existing highlight of every closed loop but the largest is unaffected: that one
reports a loop already closed, and this one is what lets the player see the closure
coming.

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

#### Scenario: a hover that changes nothing repaints nothing

- **WHEN** the pointer moves but stays nearest the same edge
- **THEN** the board is not repainted, so a pointer sweep costs one repaint per edge
  crossed rather than one per event

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
collection's pencil glyph in the collection's place for it. With the mode off, input
SHALL be unchanged.

The gutter around the board SHALL be wide enough for a corner note on a rim dot, so
that no note is clipped by the edge of the canvas; half of a board's corners are at
its rim, and the gutter that fitted the keyboard cursor clipped all of them.

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

### Requirement: Loopy settles a blocked corner pair in one deduction

Loopy's solver SHALL recognize, as a single deduction at its easiest tier, a clued
face needing all but one of its still-open edges where two dots adjacent around it
each already carry a line: the edge between those two dots SHALL be ruled out and
every other open edge of the face SHALL be drawn, in one firing.

The deduction SHALL be stated over the clue rather than over any one digit or any
one tiling — a square clued 3 and a triangle clued 2 are the same deduction — and
SHALL rest on the same guard as the one-dot deduction it strengthens, so that a
face already carrying some of its lines is covered without a second rule.

The conclusions this deduction reaches SHALL already be reachable by the tier's
existing rungs, so that no board changes the tier it is graded at and no generated
description changes. A future strengthening that is *not* conclusion-preserving
SHALL be measured against a corpus graded both ways before it is written, because
a board labeled at a tier a player no longer needs is a dishonest difficulty.

`hint(state)` SHALL narrate this firing as one step that rings both dots, outlines
the clue, and bands every edge it settles — solid for the lines, broken for the
edge it rules out — and SHALL name the excluded edge as the one joining the two
dots rather than by any direction, since most of Loopy's tilings have no top. The
sentence SHALL NOT describe the loop's path around the clue, because the same
firing covers faces where the loop goes round nothing.

#### Scenario: Two blocked dots settle the whole clue at once

- **WHEN** a clue needs all but one of its open edges and two dots next to each
  other around it already have a line
- **THEN** one firing rules out the edge between those dots and draws every other
  open edge of the clue, and the hint shows it as a single step with both dots
  ringed

#### Scenario: The same deduction on a face that is not a square

- **WHEN** the face is a triangle clued 2, or any other face clued one short of
  its order
- **THEN** the same deduction fires and its sentence reads the same with that
  clue's digit throughout

#### Scenario: Teaching the solver the pattern regrades no board

- **WHEN** every board of the frozen differential is generated and graded
- **THEN** each description is unchanged byte for byte and each board still needs
  the difficulty it was recorded at, rather than becoming solvable one tier lower

### Requirement: Loopy's presets draw tall, read width first, and turn where the tiling allows

Every Loopy preset SHALL draw no wider than tall. A tiling that turns keeps upstream's size, turned where it was landscape; a tiling that cannot turn SHALL take a size of its own that draws taller than wide, chosen to keep about the drawn area of upstream's preset (Triangular 9×14, Kites 4×6, Great-Hexagonal 4×5, Kagome 3×6, Dodecagonal 3×6, Great-Dodecagonal 3×6, Great-Great-Dodecagonal 3×5, Compass-Dodecagonal 4×5, Hats 9×11). Preset titles SHALL print the width first, as every other game's titles and the Custom dialog do, rather than upstream's height first.

Each row of `LOOPY_GRIDS` SHALL state whether its tiling `turns`, and `transposeParams` SHALL turn exactly those. A tiling turns when a patch `h` wide and `w` tall is the same tiling on its side: the square-lattice tilings (Squares, Snub-Square, Cairo, Octagonal, Compass-Dodecagonal) and the aperiodic tilings whose patch fills its box alike both ways (both Penroses, Spectres). A triangle or hexagon lattice turned is another tiling, and a Hats patch is not the same shape turned, so those SHALL NOT turn.

#### Scenario: Titles read width first

- **WHEN** the preset menu is walked
- **THEN** every leaf's title begins with its params' `{w}x{h}`

#### Scenario: A hexagonal tiling is dealt as chosen

- **WHEN** a Honeycomb board is dealt to fit a wide area
- **THEN** it is dealt at the size chosen, because Honeycomb does not turn
