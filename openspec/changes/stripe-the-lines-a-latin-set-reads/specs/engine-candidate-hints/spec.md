## MODIFIED Requirements

### Requirement: A shared narrator for generic Latin placements and strike premises

The shared hint-text module (`src/engine/hint-text.ts`) SHALL provide
`narrateLatinReason(reason, n, vocab?)`, which renders the generic Latin
placement reasons (`single`, `regionsFull`, `hiddenSingle`), and
`latinPremise(reason, ns, vocab?)`, which renders the premise of the generic
Latin strike reasons (`dup`, `set`, `forcing`) for the candidate walk to
conclude. A row/column game (Keen, Unequal, Group, Mathrax, Salad) SHALL
delegate those arms to them and keep its game-specific arms local. Each SHALL
refuse a reason of the other half rather than narrate it.

A game whose generic-arm wording legitimately diverges SHALL keep its own
narration rather than carry overrides into the shared narrator: **Solo** (its
arms name a block or diagonal region) and **Towers** (it narrates in "height"
vocabulary with a single value) are conformingly left local, and share only the
forcing-chain premise (`forcingChainPremise`) and the premise of a value
confined across lines (`confinedPremise`).

#### Scenario: A delegated placement arm narrates the shared sentence

- **WHEN** a row/column game places a value for a generic single
- **THEN** its sentence is the shared narrator's, in the game's value vocabulary

#### Scenario: A narrator refuses the other half

- **WHEN** `narrateLatinReason` is handed a strike reason, or `latinPremise` a
  placement reason
- **THEN** it throws, naming the function that narrates that reason

## ADDED Requirements

### Requirement: A value confined across several lines shows the lines

A candidate hint step that strikes a value because it is confined, across
several parallel rows or columns, to cells lying in as many lines the other
way SHALL stripe every cell of the confining lines and outline the cells of
them the value can still take. Its premise SHALL be the one sentence
`confinedPremise` writes, which names the lines as rows or columns, points at
both marks, and gives the count of lines each way. No game SHALL write its own
words for this step.

The solver that records the firing SHALL say which lines confine the value.
Where a firing can be read two ways, as some columns confined to as many rows
or as the remaining rows confined to the remaining columns, a solver without
repeated values SHALL record whichever is fewer lines.

#### Scenario: The lines are on the frame

- **WHEN** a hint shows a step that confines one value across several lines
- **THEN** each of those lines is striped whole
- **AND** the outlined cells all lie in the striped lines
- **AND** every struck cell lies outside them

#### Scenario: The premise the step marks is the premise the firing needs

- **WHEN** the premise audit replays such a firing from only the cells its
  step marks
- **THEN** the firing strikes the same candidates

#### Scenario: The fewer lines are named

- **WHEN** the shared Latin solver confines a value in two columns of a board
  five cells wide, which is also three rows confined to three columns
- **THEN** the recorded reason names the two columns
