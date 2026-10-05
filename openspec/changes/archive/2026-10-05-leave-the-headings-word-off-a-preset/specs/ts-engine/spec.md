## MODIFIED Requirements

### Requirement: One describer labels every params set

A set of params SHALL be named for a player by one engine function,
`describeParams(game, p)`, composing the items' label words in the order
`[ruleset: ]size[ kind…][ tier][, tail…]`, the ruleset being the name of the
game's declared ruleset when it has them. The preset menu's titles, the type
header of a board matching no preset, and every test reading a title SHALL go
through it — a preset leaf is its params, and its name is their label.

A leaf of `presetMenu(game)` SHALL carry that name as its `label`, and the
menu's line as its `title`. The two SHALL be the same except under a ruleset's
heading, where the title SHALL be the label without the ruleset's name. The
type header of a board dealt from a preset SHALL read the label.

A leaf MAY keep a declared title only for a name upstream gave it that no field
says (Guess's "Standard"). Such a name SHALL differ from the leaf's label, no
two presets of a game SHALL share a label, and no two lines under one heading
SHALL read the same.

The slot order is the collection's convention and the words are each game's:
two games could want different words for a field, but not the tier in a
different place.

#### Scenario: A tier renders as its declared name

- **WHEN** a label is composed for params at any tier of any tiered game
- **THEN** the text contains that tier's declared name

#### Scenario: Two presets read the same

- **WHEN** two leaves of a game's preset menu get one label, or a named leaf's
  title is its label
- **THEN** `params-declared.test.ts` fails, naming the game and the title

#### Scenario: The menu and the header name one board one way

- **WHEN** a player opens a preset, and later reaches the same params through
  the Custom dialog
- **THEN** the type header reads the same both times, because both are the one
  label

#### Scenario: A line under a ruleset's heading

- **WHEN** a game's presets hold more than one ruleset
- **THEN** each line under a ruleset's heading reads as its label without that
  ruleset's name, and the header of a board dealt from it reads the whole label

#### Scenario: A menu of one ruleset

- **WHEN** every preset of a game with rulesets belongs to one of them
- **THEN** the menu has no headings and each line reads as its whole label
