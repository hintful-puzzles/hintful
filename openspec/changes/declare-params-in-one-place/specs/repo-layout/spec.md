## ADDED Requirements

### Requirement: A game's parameters section is generated from its paramConfig

A page's `## <Name> parameters` section SHALL write `{{parameters}}` where its
list of fields goes, and the help build SHALL replace it with a list generated
from the game's `paramConfig`: each field's dialog label, its `doc`, and a
sentence stating its declared `bounds`, with the difficulty field's standard
text linking to what the tier names mean. Prose around the placeholder stays
hand-written.

The list was a hand-written copy of the dialog, checked only for mentioning each
field's name; its ranges were stated in prose nothing checked, and nine tiered
games' pages did not link what their tier names mean.

#### Scenario: A page without the placeholder

- **WHEN** a game page's parameters section does not carry `{{parameters}}`
- **THEN** `src/help-coverage.test.ts` fails, naming the page
- **AND** the help build refuses it too

#### Scenario: A game gains a field

- **WHEN** a game adds a `paramConfig` field
- **THEN** its page lists the field with no edit to the page, and the field's
  `doc` is what the page says of it

## REMOVED Requirements

### Requirement: A game's parameters section names every field its Custom dialog offers

**Reason**: The section is generated from `paramConfig`, so it names every field
by construction. The half of the check that still says something — a choices
field's word choices are each explained — moves to the field's own `doc`.

**Migration**: "A game's parameters section is generated from its paramConfig",
and `ts-engine` "A params field declares what it means, its range and its words"
(scenario "A mode the help never names").
