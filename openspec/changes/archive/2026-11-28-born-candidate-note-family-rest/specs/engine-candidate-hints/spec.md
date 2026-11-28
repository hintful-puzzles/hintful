## MODIFIED Requirements

### Requirement: A strike's conclusion names the struck values, even after its premise

The conclusion SHALL refer to the struck notes the way the premise says: by
`where` for a strike that reaches beyond the cell it is about, and by `struck`
where a word names the notes better than a list of their values. Otherwise it
SHALL name their values, even where the premise has just named them, a value
struck from several cells and the only one struck in its plural, but a
lower-case letter, which has no plural that reads as the letter.

#### Scenario: A premise that names the values is followed by them

- **WHEN** a strike's premise says "puts 2 in this cell"
- **THEN** its conclusion reads "so the 2 must go", and not "so it must go"

#### Scenario: One value struck from a whole line

- **WHEN** a strike takes A from every cell of a row that shows it
- **THEN** its conclusion reads "so the As must go"

### Requirement: The walk owns the setup

The walk SHALL set the notes up, from the words the plan gives for it: under
the populate reading a lazy populate and then the obvious-candidate clean, and
under the implicit reading the clean alone. A plan has no setup of its own.

#### Scenario: Nothing is penciled in until it is needed

- **WHEN** a populate-reading plan starts on a board with no notes and a rung
  of the game's own has a firing that needs none
- **THEN** that firing comes before the fill, and the fill and the clean follow
  once the opening has nothing left

### Requirement: A shared candidate-elimination hint plan

The engine SHALL provide the whole candidate-elimination hint plan walk
(`runCandidatePlan`) for every pencil-notes game whose hint sets and strikes
candidate notes and places a value when a cell's notes collapse to one. Such a
game's `buildSteps` SHALL hand its plan to it, and SHALL NOT walk, build or
apply steps itself. The walk is hint-plan plumbing only: the solvers and the
generate and solve paths SHALL NOT change because of it.

#### Scenario: A game's steps are built by the walk

- **WHEN** any game that walks its plan with the shared candidate-plan walk
  emits a placement or a strike
- **THEN** the step's move is the game's own placement or strike move, its `targets`
  are the cells that move acts on, each once, and its `marks` are the candidates it
  strikes

### Requirement: A candidate strike SHALL end in the walk's conclusion

A candidate-elimination game on the shared plan walk SHALL give a strike's words
as a premise (`Premise`): the clause saying why the struck values go, without a
conclusion. The walk SHALL end every strike's sentence with the plan's
`conclude` words for the move its step makes: a strike ("so 2 and 4 must go"),
a placement ("so this cell must be 3") or a note of the values left ("so this
cell can only be 1 or 5"). Every plan SHALL supply its own `conclude`.

#### Scenario: A game writes no strike conclusion

- **WHEN** a game on the walk narrates any strike
- **THEN** its words carry a premise and no explanation, and the step's sentence
  is that premise followed by the walk's conclusion for the step's move

#### Scenario: The reference is the struck values

- **WHEN** a strike's step ends "so 2 and 4 must go"
- **THEN** its reference to the struck notes says "2 and 4", and "must go" is
  outside it

## REMOVED Requirements

### Requirement: A rung list holds only the rungs of the readings its plan walks

**Reason**: No plan has given a setup of its own since Salad's flip, so every
plan walks both readings and may speak every rung of the walk; the
populate-only plan this narrowed is retired with its typing (task 3.4).
**Migration**: None. A game's list is the walk's rungs and its reasons' kinds.

### Requirement: A plan's setup declares the reading it walks

**Reason**: The plan's own setup is retired (task 3.4): every plan takes the
walk's, from its `notes` words, which a plan must now give.
**Migration**: None; no plan gave a setup.

### Requirement: A row/column Latin square answers no question its regions already settle

**Reason**: Every row/column Latin game is born from its description, and
the fill board walks its plan through `runCandidatePlan` with the regions,
singles and words it builds from the compiled module; the preset
(`runLatinCandidatePlan`) has no caller left and is retired.
**Migration**: A hand-written game calls `runCandidatePlan`, with
`rowColRegions` and `singleReasonOf` from `latin-hint.ts` where its regions
are a row and a column.

### Requirement: The fields the row/column preset supplies

**Reason**: The preset is retired with its last caller; the born board
supplies these fields from the compiled module.
**Migration**: None; no game takes the preset.

### Requirement: A game reasoning over other regions cannot take the preset

**Reason**: The preset is retired, so there is nothing for such a game to be
turned back from.
**Migration**: None; every game calls `runCandidatePlan`.
