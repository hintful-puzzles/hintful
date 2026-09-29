## MODIFIED Requirements

### Requirement: The engine SHALL own the hint mark roles and the words for them

The engine SHALL define the roles a hint mark plays, each with one meaning in
every game: a **ring** marks what the step decides, an **outline** marks what
the step reasons from, and **stripes** mark the line or region the sentence
names. The engine SHALL own each role's noun and adjective ("ringed",
"outlined", "striped"). A game MAY add a role only when none of the three fits,
and the change adding it SHALL say why.

A mark is drawn on an element of a **kind** (a cell, a note, an edge, a game's
own such as Signpost's arrow). A kind SHALL key its elements so that two names
for one element compare equal, and SHALL say what a noun about them counts, so
"this cage" stays singular over its cells. An element drawn inside another (a
note in its cell) SHALL mark and name that one with it.

A clue drawn recolored is a glyph for a role, not a role of its own: a clue the
step reasons from SHALL be an outline reference, whatever color the game paints
it.

#### Scenario: A literal says a mark's word

- **WHEN** a hint sentence is built with a literal "this", "these", a role's
  adjective, or a retired mark word ("hatched", "highlighted") outside a
  reference to a mark
- **THEN** building the sentence throws, naming the word

#### Scenario: A reference uses another role's word

- **WHEN** a reference to a ring says "the striped row"
- **THEN** building the sentence throws, because the words and the mark disagree

#### Scenario: A shading genre says its rules' word

- **WHEN** a hint sentence in a game whose rules shade cells says a cell "must
  be shaded"
- **THEN** the sentence builds, because "shaded" is the cell's state there and
  not a mark's word

## ADDED Requirements

### Requirement: Every hinted game SHALL be bound

Every game that declares a `hint` SHALL declare the `hintMarks` section, so
every hint step in the collection names exactly the marks it draws, and every
hinted game's help page SHALL list its marks from its legend.

#### Scenario: A hinted game without a legend

- **WHEN** a registered game declares `hint` and not `hintMarks`
- **THEN** the hint-quality suite fails, naming the game
