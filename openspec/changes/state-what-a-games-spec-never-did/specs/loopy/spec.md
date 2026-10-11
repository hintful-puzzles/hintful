## ADDED Requirements

### Requirement: Loopy's params are a size, t with a grid index, and d with a tier letter

`encodeParams` SHALL write the width, `x`, the height, `t` and the tiling's
index in `LOOPY_GRIDS`, then in the full form `d` and the tier's letter: `e`
Easy, `n` Normal, `t` Tricky, `h` Hard. The short form SHALL leave the tier
out. `decodeParams` SHALL read a lone size as both sides, and SHALL keep
Squares where `t` is absent and Easy where `d` is absent or its letter is none
of the four.

#### Scenario: The Hats preset

- **WHEN** `9x11t16dh` is decoded
- **THEN** the board is 9 wide and 11 tall on row 16 of `LOOPY_GRIDS`, Hats,
  at Hard, and its short form is `9x11t16`

#### Scenario: Hard is h, and Tricky is t

- **WHEN** `7x7t0dt` and `7x7t0dh` are decoded
- **THEN** the first is the 7x7 Squares Tricky preset and the second the 7x7
  Squares Hard one

#### Scenario: A part left out keeps its default

- **WHEN** `7x7t0dh` is given with its `t0` removed, as `7x7dh`, or `7` is
  given alone
- **THEN** the first decodes to Squares at Hard and encodes in full as
  `7x7t0dh`, and the second to 7 by 7 Squares at Easy, `7x7t0de`

### Requirement: A Loopy description's grid part ends at the first underscore

A description holding `_` SHALL be read as the grid description, everything
before the first `_`, then the clue string; one holding none SHALL be read as
clues alone, with no grid description. `newState` SHALL refuse a grid
description the tiling does not take, a missing one where the tiling takes
one, and one whose patch has no face left, the last in the words "This game ID
describes a patch of tiling with no faces left in it."

#### Scenario: A Hats description carries its patch

- **WHEN** `1,1,10,10,4,H_bDaBa0b2c0fB5a9c93a8aAb0a3a6a460c96Bb3c` is loaded
  under `9x11t16dh`
- **THEN** the grid description is `1,1,10,10,4,H`, the patch has 56 faces,
  and the clues begin with two unclued faces, a 13 (`D`), an unclued face, an
  11 (`B`), an unclued face and a 0

#### Scenario: A Squares description has no grid part

- **WHEN** `e233a3a1c2b222c2122a21a2a2b22022a22a3a3` is loaded under `7x7t0de`
- **THEN** it is read as the clues of 49 faces, five unclued and then 2, 3, 3,
  and the same string with `_` put before its first character is refused

### Requirement: Auto-follow goes on while one edge leads on in the clicked edge's state

From each end of the clicked edge, auto-follow SHALL go on through a dot while
exactly one other edge there counts and that edge holds the state the clicked
edge held before the click, and SHALL stop on coming back to the clicked edge.
Under "Based on grid only" every other edge at the dot counts. Under "Based on
grid and game state" a ruled-out edge does not count, unless the clicked edge
was itself ruled out.

#### Scenario: A ruled-out branch is followed past only with the game state

- **WHEN** an undecided edge is clicked whose far dot has three edges, the
  third ruled out and the second undecided
- **THEN** under "Based on grid only" the move sets the clicked edge alone, and
  under "Based on grid and game state" it sets the second edge too

### Requirement: A drag outside notes mode repeats the press along the edges it passes

Loopy's `targetVerbs` SHALL declare a sweep over an edge's state, for both
buttons: a drag on from a press gives the pressed button's verb to each
further edge that holds what the pressed edge held. An edge SHALL be taken
only where the pointer passes within three tenths of that edge's own drawn
length of its midpoint, since a tiling's edges are not one size and several
meet at every dot.

#### Scenario: A drag through a dot takes only the edges it runs along

- **WHEN** a line is drawn by pressing an undecided edge of the board's rim
  and dragging along the next two edges of the rim, through the dots between
  them
- **THEN** the three edges become lines, and the edge that branches off at
  each of those dots is not drawn: it is ruled out by the dot's second line
  where `auto-rule-out` is on, and left undecided where it is off

### Requirement: A notes-mode key with no edge chosen only shows the cursor

In notes mode Enter, Space or the erase key pressed while the cursor is hidden
SHALL show it, and with no edge yet chosen SHALL do nothing more. Space on the
pinned edge itself SHALL release the pin and note nothing. A pair noted from
the keyboard SHALL cycle as the left button cycles it. Switching notes mode on
or off SHALL release a pin.

#### Scenario: Space twice on one edge notes nothing

- **WHEN** notes mode is on, an edge is chosen, and Space is pressed twice
  without moving the cursor
- **THEN** the edge is pinned and then let go, and no pair is noted

#### Scenario: Cycling a pair takes a pin each time

- **WHEN** two edges have been noted as matching from the keyboard, and Space
  is pressed again on the second edge
- **THEN** that edge is pinned, and the pair becomes opposites only when Space
  is next pressed on the first

### Requirement: A submenu titled More... holds the presets of further tilings

Loopy's preset menu SHALL be two levels: the Squares presets and one preset of
each of a few other tilings at the top, and a submenu titled "More..." holding
one preset of each of some further tilings. A tiling in neither SHALL be
reached through the Custom dialog's "Grid type".

#### Scenario: Honeycomb is under More...

- **WHEN** the preset menu is walked
- **THEN** `7x7t0de`, 7x7 Squares Easy, is at the top level and `10x10t2dh`,
  10x10 Honeycomb Hard, is inside "More..."

### Requirement: A clue's count settles its open edges

The hint SHALL rule out every open edge of a clue that already has its lines,
and SHALL draw every open edge of a clue with only as many edges not ruled out
as it needs. Where a clue needs all but one of its open edges, of which there
are more than two, and two adjacent ones meet at a dot that has a line, it
SHALL draw the rest. Each step outlines the clue, and the last marks that dot.

#### Scenario: A 0 is said in its own words

- **WHEN** a 0 has open edges
- **THEN** the step reads "This 0 takes no lines, so its edges can't be
  lines." and rules them all out

#### Scenario: A 1 with one edge left

- **WHEN** all but one of a 1's edges are ruled out
- **THEN** the step reads "Only one of this 1's edges isn't ruled out, so it
  must be a line."

#### Scenario: A clue that must spare its edge at a dot

- **WHEN** a 3 in a square has four open edges and one of its dots has a line
- **THEN** the step draws the two edges that do not meet at that dot, saying
  the 3 "can spare one open edge and must spare it at the outlined dot, which
  has a line"

### Requirement: A dot's count settles its open edges

The hint SHALL rule out the one open edge of a dot that has no line, since "a
line here would dead-end", SHALL draw the one open edge of a dot that has one
line, and SHALL rule out every open edge of a dot that has two lines. Each
step marks the dot its sentence calls "the outlined dot".

#### Scenario: A line with one way on

- **WHEN** a dot has one line and one open edge
- **THEN** the step reads "The line at the outlined dot has no other way to go
  on, so this edge must be a line."

#### Scenario: A full dot with one edge left

- **WHEN** a dot has two lines and one open edge
- **THEN** the step reads "The outlined dot already has its two lines, so this
  edge can't be a line."

### Requirement: An edge that would close a loop is settled by what the loop leaves out

Where an open edge joins two dots the drawn lines already connect, the hint
SHALL draw it if the loop it closes takes in every drawn line and meets every
clue, and otherwise SHALL rule it out, saying the loop "leaves other lines
out" or, where it takes in every line, outlining the clues it would leave
unmet. Either step bands the drawn lines the edge would close.

#### Scenario: The last edge

- **WHEN** one open edge would close every drawn line into a loop with every
  clue met
- **THEN** the step reads "This edge closes the marked lines into one loop
  that meets every clue, so it must be a line."

#### Scenario: A loop that takes every line and misses one clue

- **WHEN** an edge would close every drawn line into a loop while one clue
  elsewhere is short of its count
- **THEN** the step reads "This edge would close the marked lines into a loop
  with the outlined clue still unmet, so it can't be a line."

### Requirement: From Normal, a clue's other edges decide an edge

From Normal the hint SHALL count, for an open edge of a clue, the most and the
fewest lines the clue's other edges can hold, a corner noted as taking one at
most or as needing one counting as one line between its two edges. Where the
fewest already equals the clue it SHALL rule the edge out, and where the most
is one short of the clue it SHALL draw it. The step outlines the clue and
cites each corner note it counted.

#### Scenario: A corner counted as one

- **WHEN** a 3 in a square has four open edges, and one of its corners is
  noted as taking one line at most
- **THEN** the step on an edge outside that corner reads "This 3's other edges can give
  it only 2, counting the marked corner as one, so this edge must be a line."

#### Scenario: A 1 already supplied by a corner

- **WHEN** a corner of a 1 is noted as needing a line
- **THEN** the step on each other open edge of the 1 reads "This 1 already has
  its line, counting the marked corner as one, so this edge can't be a line."

### Requirement: A noted corner settles its edges against its dot's lines

From Normal the hint SHALL settle a noted corner's edges: where it needs a
line and one edge is ruled out, the other is drawn; where it takes one at most
and one edge is a line, the other is ruled out; and where its two edges are
the only open ones at a dot with no line, both are drawn or both ruled out.
From Tricky, at a dot with no line and three open edges, a corner taking
exactly one line SHALL draw the third edge.

#### Scenario: Both or neither

- **WHEN** a corner noted as needing a line has the only two open edges of a
  dot with no line
- **THEN** the step reads "The marked corner needs a line; the outlined dot
  takes both or neither, so both must be lines."

#### Scenario: The loop leaves by the third edge

- **WHEN** a dot with no line has three open edges and the corner of two of
  them is noted as exactly one line
- **THEN** the step reads "The marked corner takes exactly one line; the
  outlined dot has no line yet, so this edge must be its second."

### Requirement: The hint notes a corner from its dot, from a clue, or from the corner across

From Normal the hint SHALL note a corner of two open edges as taking one line
at most where its dot has a line elsewhere, and as needing one too where they
are the dot's only open edges. From Tricky it SHALL note a clue's corner from
the count of the clue's other edges; a corner sharing no edge with one that
needs a line, at the same dot, as taking one at most; and, at a dot with no
line and four open edges, the corner across from one taking exactly one line
as needing one.

#### Scenario: A line's only way on is one note

- **WHEN** a dot has one line and two open edges, adjacent around it, and a
  later line rests on their corner
- **THEN** one step notes that corner as exactly one line, reading "The line
  at the outlined dot can only go on through this corner, so it takes exactly
  one line."

#### Scenario: Any corner of a 1

- **WHEN** a corner of a 1 with both edges open is noted from the clue alone
- **THEN** the step reads "This 1 takes one line, so this corner can take one
  at most."

#### Scenario: A 3 in a square

- **WHEN** a 3 in a square has all four edges open and one of its corners is
  noted
- **THEN** the step reads "This 3's other edges can give it 2 at most, so this
  corner needs a line."

### Requirement: At Hard, a noted pair settles an edge

At Hard the hint SHALL settle edges from pairs. Two matching open edges of a
clue are both ruled out where the clue needs one more line, and both drawn
where it can spare one more edge. Where a clue or a dot has three open edges
and two are a pair, the count it still needs decides the third. An open edge
paired with a line or a ruled-out edge takes the state the pair gives it. Each
step cites the pair, which is on the board.

#### Scenario: The opposite of a ruled-out edge

- **WHEN** an open edge is noted as the opposite of an edge that is ruled out
- **THEN** the step reads "The marked pair makes this edge the opposite of the
  marked ruled-out edge, so it must be a line."

#### Scenario: A dot's third edge

- **WHEN** a dot has one line and three open edges, two of them noted as
  matching
- **THEN** the step reads "The outlined dot has one line; the marked pair
  makes two of its open edges give 0 or 2, so this edge must be a line."

### Requirement: The hint notes a pair from a count that leaves two edges, or four with a pair among them

At Hard the hint SHALL note the only two open edges of a clue or of a dot as
matching where the lines it still takes are even in number and as opposites
where odd. Where a clue or a dot has four open edges and two are a pair, the
other two SHALL be noted the same way from what the pair leaves. Two pairs
sharing an edge SHALL give the pair of their other edges: a match where the
two are alike, opposites where they differ.

#### Scenario: Two edges of a 3

- **WHEN** a 3 has two lines and two open edges
- **THEN** the step reads "Only these two of this 3's edges are still open,
  and it needs 1 more, so they must be opposites."

#### Scenario: A match and an opposite chained

- **WHEN** one edge matches a shared edge and another is that edge's opposite,
  both pairs being on the board
- **THEN** the step reads "One of these edges matches the edge the marked
  pairs share and the other is its opposite, so they must be opposites."

### Requirement: A corner of exactly one line and a pair of opposites are noted from each other

At Hard, where two open edges adjacent around a dot are a pair of opposites,
the hint SHALL note their corner as taking exactly one line, and where a
corner of two open edges takes exactly one line it SHALL note the two edges as
opposites.

#### Scenario: A corner from a pair

- **WHEN** the two edges of a corner are noted as opposites and a later line
  rests on the corner
- **THEN** a step reads "The marked pair makes this corner's edges opposites,
  so it takes exactly one line."

#### Scenario: A pair from a corner

- **WHEN** a corner is noted as exactly one line and a later line rests on its
  edges being opposites
- **THEN** a step reads "The marked corner takes exactly one line, so these
  two edges must be opposites."

### Requirement: Within a tier the hint counts first and closes loops last

Within a tier the hint SHALL try each clue in face order (its lines all
there, only the edges it needs, the blocked pair, the spared edge at a dot),
then each dot, then from Normal the corners, at Hard the pairs, and last the
loop-closing deductions, and SHALL take the first line any of them sets. Easy
holds the counting and loop-closing techniques; Normal adds a clue's bounds and
corners read at a dot; Tricky adds corners read from a clue or across a dot;
Hard adds pairs.

#### Scenario: A full dot is shown before an early loop

- **WHEN** a dot with two lines still has an open edge, and another open edge
  would close a loop that leaves lines out
- **THEN** the step shown is the dot's

#### Scenario: A clue is shown before a dot

- **WHEN** a clue that has its lines and a dot that has its two lines each
  still have an open edge
- **THEN** the step shown is the clue's

### Requirement: A move that takes a hint step with the aids on still follows it

`hintKeepTrack` SHALL count a line move as following a step where each edge it
sets beyond the step's own is one auto-follow would add from the step's edges,
in the step's state, or an edge ruled out that `auto-rule-out` settles from
them, and SHALL call any other extra edge off the step. A note move SHALL
follow a note step while it cycles that same note, and SHALL complete it once
the note holds what the step places.

#### Scenario: The hinted line arrives with its rule-outs

- **WHEN** `auto-rule-out` is on and the player draws a hinted line that gives
  a dot its second line
- **THEN** the move, which also rules out that dot's other edges, completes the
  step

#### Scenario: A corner cycled past the step's note

- **WHEN** a step places a corner as needing a line and the player's press
  brings that corner to exactly one line
- **THEN** the step is completed, since the note holds what the step places

## MODIFIED Requirements

### Requirement: Loopy offers auto-follow and faint-line preferences

Loopy SHALL provide an auto-follow preference (off / grid-only /
grid-and-state) which extends a click along a forced path of edges, and a
preference for drawing excluded lines faintly. Their keys SHALL be
`auto-follow`, off by default, and `draw-faint-lines`, on by default; with it
off an excluded edge is not drawn. `prefs` SHALL hold these two and
`auto-rule-out`, and none of the collection's pencil preferences, since the
right button rules an edge out and never switches notes mode.

#### Scenario: Auto-follow extends a click along a corridor

- **WHEN** auto-follow is set to grid-only and an edge is clicked whose
  neighbor along the path is forced by the grid alone and is in the state the
  clicked edge was in
- **THEN** the one move sets the clicked edge and the forced edges after it to
  the same state

#### Scenario: The preferences of a new game

- **WHEN** the preferences of a new game are read
- **THEN** `auto-follow` offers "No", "Based on grid only" and "Based on grid
  and game state" and is "No", `draw-faint-lines` and `auto-rule-out` are on,
  and no sticky-pencil, keep-highlight or hint-notes preference is offered

#### Scenario: A new game follows nothing and rules out what counting settles

- **WHEN** no preference has been changed and a line is drawn that gives a dot
  its second line
- **THEN** the move sets that one edge as a line and the dot's other open
  edges as ruled out, and those are drawn faintly

### Requirement: A fact a hinted line rests on is first placed as a note

From Normal, the solver reasons about corners and pairs. Every such fact a line
in the plan rests on SHALL first be placed as a note by a step of its own,
narrated by that fact's premise. A fact no line rests on SHALL NOT be placed.

#### Scenario: A clue decides a corner and its dot settles the edges

- **WHEN** a 3's other edges can give it at most 2, and the dot at one of its
  corners has no line and only that corner's two edges open, and hints are
  followed
- **THEN** one step notes that corner as needing a line and outlines the 3, and the
  next draws both edges as lines in one move, citing the marked corner and ringing
  the dot
