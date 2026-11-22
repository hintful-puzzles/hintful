## MODIFIED Requirements

### Requirement: Rules: Loopy flags the lines at a dot the loop cannot pass

The board SHALL flag, as drawn and without the solution (`Game.rules`),
every line at a dot that carries three or more lines, and the one line at a
dot whose every other edge is ruled out or reads as none. A dot with one line
and an edge still undecided SHALL NOT be flagged, since the loop can go on
from it.

#### Scenario: Three lines meet

- **WHEN** a dot of a Squares board carries three lines, and one of them runs
  on to a further line
- **THEN** the three lines at the dot are flagged and the line beyond is not

#### Scenario: A dead end with one way left

- **WHEN** a line ends at a dot with three other edges, two of them ruled out
  and one undecided
- **THEN** nothing is flagged, and ruling out the third flags the line

### Requirement: Rules: Loopy checks the board against its solution

`findMistakes(state)` SHALL report every edge the player has marked against the
board's unique solution: a line the loop does not run along, and an edge ruled
out that the loop does run along. The solution SHALL be solved from the clues
alone at the top tier. The live error marks, of a rule broken on the board as
drawn without knowing the answer, are distinct and SHALL remain.

#### Scenario: A line the loop does not use is a mistake

- **WHEN** the player draws a line on an edge the solution leaves empty and Check
  is requested
- **THEN** that edge is reported and drawn in the mistake color, and no edge the
  player marked in agreement with the solution is reported

#### Scenario: A broken rule is flagged without the answer

- **WHEN** a dot carries three lines, or the lines close a loop with other
  lines apart from it
- **THEN** it is flagged on the board as drawn, whether or not Check has been
  requested

## REMOVED Requirements

### Requirement: Rules: Once a loop is closed, Loopy flags all but the largest piece

**Reason**: which piece is wrong is a guess the rules do not make; the
pieces that can no longer join are each as much to blame.
**Migration**: "Rules: Once a loop is closed, Loopy flags every piece".

## ADDED Requirements

### Requirement: Rules: Once a loop is closed, Loopy flags every piece

Once the lines close a loop, every edge not yet decided SHALL be read as
none, the closed loop being the only one the answer can hold. Where lines lie
apart from that loop, each piece of lines with no edge left undecided SHALL
be flagged, the loop included; with no loop closed, a piece SHALL be flagged
only once every edge round it is decided, however many paths lie apart. A
clue SHALL be drawn in the error color once it can no longer be met, which
it is the moment a loop closes short of it.

#### Scenario: A line left apart from a loop

- **WHEN** a loop round one square is closed and one line stands elsewhere
- **THEN** the loop's four lines and the lone line are all flagged

#### Scenario: Two loops

- **WHEN** a loop round one square and a loop round four are both closed
- **THEN** the lines of both are flagged

#### Scenario: Paths apart with no loop closed

- **WHEN** two paths lie apart and each still has an undecided edge at an end
- **THEN** nothing is flagged

#### Scenario: A clue the closed loop leaves short

- **WHEN** a loop closes with a clued face elsewhere short of its count, and no
  edge round that face ruled out
- **THEN** the clue is drawn in the error color
