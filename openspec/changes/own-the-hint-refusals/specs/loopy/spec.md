## MODIFIED Requirements

### Requirement: Loopy explains the next deduction from notes the player can make

A hint SHALL be refused when the board is solved or `findMistakes` reports a
mistake, by the midend before it asks the game, and `hint(state)` SHALL otherwise
return the lines the solver can decide from the player's own board as an ordered
plan, each step narrating why its move is forced from premises the sentence
itself states. Because the mistake check vouches for every mark, the plan SHALL
take the player's lines, ruled-out edges and notes as facts.

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
