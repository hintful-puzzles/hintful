# loopy

## ADDED Requirements

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
