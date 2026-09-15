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

Enter and Space SHALL be the left and right pointer buttons on the chosen edge,
and the erase key the middle one; the keyboard has all three and needs no
three-state cycle, which remains a touch affordance. A select SHALL NOT move
the cursor — it is already at the far end of the edge it walked — so a loop is
traced with one arrow and one Enter per edge, and walking back over a drawn
edge and pressing Enter undraws it. A pointer press SHALL hide the cursor;
Escape SHALL hide it too.

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

With a mouse, each button SHALL cycle between its own line state and unknown.
With a stylus, each button SHALL cycle through all three states, so that a single
tap can reach every state without a second button.

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

### Requirement: Loopy explains the next deduction

`hint(state)` SHALL refuse through `commonHintRefusal` when the board is solved or
`findMistakes` reports a mistake, and otherwise return the lines the solver can
decide from the player's own board as an ordered plan, each step narrating why its
lines are forced from premises the sentence itself states. Because the mistake
check vouches for every mark, the plan SHALL take the player's lines and ruled-out
edges as facts.

The plan SHALL be the solver's own rungs, run with a recorder that names the
premise behind each change and returns at the first premise that changed a line,
so that one firing is one step. It SHALL try the rungs of the easiest tier to
exhaustion before those of the next, whatever tier the board was generated at,
since a game ID need not carry one. The generator SHALL NOT build a recorder, so no
generated board changes.

From Normal, the solver reasons about facts the board cannot show: a *corner*, two
edges meeting at a dot around one face, known to carry at least one line or at
most one; and a *pair*, two edges known to match or to be opposites. A step SHALL
draw every such fact it rests on: a corner as a wedge in its face's angle, filled
for at least one line and outlined for at most one, and a pair as a connector
between its two edges marked `=` or `≠`. A step whose facts its sentence can carry
in words (a count leaning only on corners whose dots show why, or one corner read
off one clue) SHALL draw them unnumbered; every other step SHALL number each fact
in the order it was found and name the facts it concludes from by number.

Each step SHALL mark the edges it sets with a band in the hint's action color,
solid for a line and broken for an edge that cannot be one, outline the clues its
sentence names, and ring the dot its sentence names.

#### Scenario: A clue decides a corner and its dot settles the edges

- **WHEN** a 3's other edges can give it at most 2, and the dot at one of its
  corners has no line and only that corner's two edges open, and a hint is
  requested
- **THEN** the step draws both edges as lines in one move, outlines the 3, fills a
  wedge at that corner, rings the dot, and says the 3 needs a line at the marked
  corner and the dot takes both or neither

#### Scenario: A longer deduction numbers its hidden facts

- **WHEN** the next line rests on a chain of corners and pairs no single sentence
  can carry
- **THEN** every fact in the chain is drawn once, the facts are numbered 1 to n in
  the order they were found with each number used once, and the sentence names the
  facts it concludes from by those numbers

#### Scenario: Following the plan finishes the board on every tiling

- **WHEN** a board of any tiling and any tier is generated and its hints are
  followed one step at a time from the empty board
- **THEN** every step sets only lines that agree with the solution, and the board
  ends solved

#### Scenario: A wrong mark refuses the hint

- **WHEN** the player has drawn a line the solution does not use and asks for a
  hint
- **THEN** the hint refuses with the collection's mistake refusal and the mistaken
  edge is highlighted
