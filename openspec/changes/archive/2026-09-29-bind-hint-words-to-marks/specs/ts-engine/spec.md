## ADDED Requirements

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

#### Scenario: A literal says a mark's word

- **WHEN** a hint sentence is built with a literal "this", "these", a role's
  adjective, or a retired mark word ("hatched", "shaded", "highlighted")
  outside a reference to a mark
- **THEN** building the sentence throws, naming the word

#### Scenario: A reference uses another role's word

- **WHEN** a reference to a ring says "the striped row"
- **THEN** building the sentence throws, because the words and the mark disagree

### Requirement: A bound hint step's words SHALL name exactly the marks it draws

A game MAY declare the `hintMarks` section of its contract: what each role marks
in that game, and the marks a step's highlights draw. A game that declares it is
**bound**, and every one of its hint steps SHALL carry its sentence as words
built from references to marks, with the explanation equal to their text.

For every step of a bound game, every mark its words name SHALL be one it draws,
every mark it draws SHALL be named by its words, and every role it draws SHALL
be listed in the game's legend. The hint-quality walk SHALL check this on every
step it visits, through whole games and under each candidate reading a game
offers, and on each step as a refresh returns it.

Where a shared mechanic builds the steps, it SHALL derive what it can from the
words rather than take it beside them: the candidate walk's outlined and striped
cells, and the border grid's, are the references the sentence makes.

#### Scenario: A step draws a mark its words never name

- **WHEN** a bound game's step rings an edge its sentence does not name
- **THEN** the walk fails, naming the step and the unnamed mark

#### Scenario: A continuation leg keeps showing evidence

- **WHEN** a later leg of a multi-edge firing still shows the evidence the first
  leg reasoned from
- **THEN** its sentence names that evidence ("for the same striped region") as
  well as the edges it rings

### Requirement: A refresh that shrinks a hint step SHALL rewrite its words

When a stored step's marks shrink, because some of what it strikes is already
gone, the step's words SHALL be narrowed to the marks that remain and re-rendered,
so the sentence never names a note the step no longer strikes.

#### Scenario: One of two struck notes is already gone

- **WHEN** a stored step reads "…so we must cross out 1 and 2" and the 1 has
  been struck by the time it is shown
- **THEN** the refreshed step reads "…so we must cross out 2" and rings only the 2

### Requirement: A bound game's help SHALL list its marks from its legend

A bound game's help page SHALL mark where its list of marks goes, and the help
build SHALL replace that mark with one entry per role in the game's legend, led
by the engine's words for the role. A bound game's page without the mark, or an
unbound game's page with one, SHALL fail the build.

#### Scenario: A game binds its hint

- **WHEN** a game declares `hintMarks`
- **THEN** its help page's Hints section lists "A ring marks …", "An outline
  marks …" and "Stripes mark …" for the roles its legend lists, in the game's
  own words for what each marks there
