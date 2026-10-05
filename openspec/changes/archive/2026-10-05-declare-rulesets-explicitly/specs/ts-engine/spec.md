## REMOVED Requirements

### Requirement: A game's ruleset is declared, named once and sectioned by the engine

**Reason**: It had the engine find a ruleset by the `lead` label slot its field asked for, a position standing in for a declaration. The slot is gone.

**Migration**: "A game declares its rulesets with rulesetItem" below, which keeps the one name and the menu sections and adds the dialog field and each ruleset's rule.

## ADDED Requirements

### Requirement: A game declares its rulesets with rulesetItem

A game whose params choose between different puzzles on the same board SHALL declare them with `rulesetItem(rulesets, field)` in its `paramConfig` (`engine/ruleset.ts`), each ruleset a `name` and the `rule` that sets it apart. The item SHALL be a `"choices"` field with the keyword `ruleset`, labeled "Game mode" in every game, offering each ruleset by its name. No label slot SHALL put a word in front of a params label: only a declared ruleset does.

From the declaration the engine SHALL build the name in front of a params label and the sections of the preset menu. `presetMenu` SHALL place the presets of each ruleset in a section of their own, titled with the ruleset's name and ordered as declared, keeping each ruleset's presets in the order the game wrote them. A game with rulesets SHALL list its presets flat, and a menu whose presets all hold one ruleset SHALL stay flat.

Three games spelled this field three ways, and two of them interleaved two puzzles' boards in one list.

#### Scenario: A game gains a ruleset

- **WHEN** a game adds an entry to the list it passes `rulesetItem`
- **THEN** the Custom dialog offers it, a params label holding it starts with
  its name, and its presets get a section of the Type menu

#### Scenario: Presets of two rulesets are written interleaved

- **WHEN** a game's flat preset list alternates between two rulesets
- **THEN** its Type menu shows one section per ruleset, each holding only that
  ruleset's presets

#### Scenario: A ruleset game writes a section of its own

- **WHEN** a game with rulesets returns a preset menu containing a submenu
- **THEN** `presetMenu` throws

#### Scenario: A field asks to lead a label

- **WHEN** a `paramConfig` item declares the label slot `lead`
- **THEN** the typechecker refuses it

## MODIFIED Requirements

### Requirement: One describer labels every params set

A set of params SHALL be named for a player by one engine function,
`describeParams(game, p)`, composing the items' label words in the order
`[ruleset: ]size[ kind…][ tier][, tail…]`, the ruleset being the name of the
game's declared ruleset when it has them. The preset menu's titles, the type
header of a board matching no preset, and every test reading a title SHALL go
through it — a preset leaf is its params, and its title is their label.

A leaf MAY keep a declared title only for a name upstream gave it that no field
says (Guess's "Standard"). Such a name SHALL differ from the leaf's label, and no
two presets of a game SHALL share a label.

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
