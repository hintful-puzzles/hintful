## MODIFIED Requirements

### Requirement: The engine SHALL own the hint mark roles and the words for them

The engine SHALL define the roles a hint mark plays, each meaning the same in
every game: a ring marks what the step decides, an outline what it reasons
from, stripes the line or region whose contents it reasons from, and a strike
a note it rules out. A fact of the layout that holds in every position SHALL
take no role: the step says it in words. The engine SHALL own each role's
words ("ringed", "outlined", "striped", "struck"). A game SHALL add a role only
when none fits, saying why.

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

#### Scenario: A line that never moves takes no mark

- **WHEN** a step's reasoning rests on a line of the layout that no move can
  change, as Netslide's row or column through the source
- **THEN** the sentence may say so, but the line is neither striped nor
  outlined, so the first beat shows what the step decides
