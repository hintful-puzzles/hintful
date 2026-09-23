## ADDED Requirements

### Requirement: A Magnets hint hatches the line its sentence names

A Magnets hint step whose sentence names a row or column SHALL hatch that line,
its squares and both clue slots, and SHALL hatch no other: a line premise hatches
the line it counts, and a step about a single domino hatches the one line it
names as "its row" or "its column" when it names exactly one. A met line the step
cites only as a reason SHALL be marked by its clue digit in the evidence color,
never by an outline, and the step's outlines SHALL each join a square only to its
own domino's other half. A domino step's sentence SHALL give each pole the reason
that rules that pole out at that end.

#### Scenario: A count premise hatches its own column only

- **WHEN** the hint is asked of the 5x6 board
  `..31.,...2..,.0...,.2..3.,LRLRTTLRTBBLRBTLRLRBTTTTTBBBBB` with its second
  column's bottom domino neutral
- **THEN** its first step hatches the third column and its clue slots, and no
  other line, and colors the second column's − clue as a reason

#### Scenario: One end of a domino, both facts read through its partner

- **WHEN** a domino's end touches a + and lies in a column whose − clue is met,
  and the domino is concluded neutral
- **THEN** the step says the end touches a + and a − there would overfill its
  column, and hatches that column
