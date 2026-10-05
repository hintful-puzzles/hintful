## ADDED Requirements

### Requirement: A help page names a field's choice through a placeholder

Where a game's help page names a choice of one of its `"choices"` fields, it SHALL write `{{choice:<kw>:<index>}}`, the field's keyword and the choice's zero-based index, and the help build SHALL replace it with that choice's name from the game's `paramConfig`. A placeholder that names no choices field of the game, or an index the field does not have, SHALL fail the build, naming the page.

A page SHALL NOT type such a name out. `src/help-coverage.test.ts` scans each page for every choice name of the game as a whole, case-matched word. Two kinds of name are outside the scan: the game's own name, which a page says as the game far more often than as a mode, and the difficulty tiers, which are ordinary words explained once for every game.

The name typed into prose was a copy nothing held to the dialog: Salad's page said "ABC End View" where its menu said "Letters".

#### Scenario: A mode is renamed

- **WHEN** a game changes a name in a field's `choices`
- **THEN** the Custom dialog, the params label, the menu section and every
  sentence of its help page that names the choice change with it, with no edit
  to the page

#### Scenario: A page types a choice's name

- **WHEN** a game page spells out the name of a choice the game offers
- **THEN** `src/help-coverage.test.ts` fails, naming the page and the
  placeholder to write

#### Scenario: A placeholder names no choice

- **WHEN** a page writes `{{choice:mode:2}}` and the field has two choices
- **THEN** `src/help-coverage.test.ts` fails and the help build refuses the page
