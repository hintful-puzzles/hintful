## MODIFIED Requirements

### Requirement: A bound hint step's words SHALL name exactly the marks it draws

A game MAY declare the `hintMarks` section of its contract: what each role marks
in that game. A game that declares it is **bound**, and every one of its hint
steps SHALL carry its sentence as words built from references to marks, with
the explanation equal to their text.

A bound game's renderer SHALL paint every hint mark from the step's words, by
role and kind (`stepMarks`), and from nothing else. A highlight field MAY carry
data that is not a mark, painted only where a named mark is. The glyph a role
takes on a kind remains the game's.

For every step of a bound game, measured on the frame its renderer paints from a
fresh draw state: removing any one element the words name from them SHALL
change the frame; removing every reference SHALL leave the frame the game paints
with no hint shown; and every role the words name SHALL be listed in the game's
legend. The hint-quality walk SHALL check this on every step it visits, through
whole games and under each candidate reading a game offers, and on each step as
a refresh returns it.

Where a shared mechanic paints for several games, it SHALL read the words: the
candidate games' overlay and the border grid's marks are the references the
sentence makes.

#### Scenario: A step draws a mark its words never name

- **WHEN** a bound game's step rings an edge its sentence does not name
- **THEN** the walk fails, naming the step and the unnamed mark

#### Scenario: A continuation leg keeps showing evidence

- **WHEN** a later leg of a multi-edge firing still shows the evidence the first
  leg reasoned from
- **THEN** its sentence names that evidence ("for the same striped region") as
  well as the edges it rings

#### Scenario: The words name a mark the renderer does not paint

- **WHEN** a bound game's words call a square outlined and its renderer paints
  no outline there, because a ring wins that square
- **THEN** the walk fails, naming the outline as not drawn, because removing it
  from the words leaves the frame unchanged

#### Scenario: A renderer still paints a mark from a highlight field

- **WHEN** a bound game's renderer outlines squares listed in its highlights
  rather than the squares its words outline
- **THEN** the walk fails, because the frame with every reference removed still
  shows the outline
