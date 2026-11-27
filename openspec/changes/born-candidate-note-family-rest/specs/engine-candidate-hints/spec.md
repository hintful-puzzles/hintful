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
