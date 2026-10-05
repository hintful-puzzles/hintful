## ADDED Requirements

### Requirement: A game's ruleset is declared, named once and sectioned by the engine

A game whose params choose between different puzzles on the same board SHALL declare that choice as a `"choices"` item in the `lead` label slot, which is the game's **ruleset** field (`rulesetItem`). A lead item SHALL NOT carry label `words`, so each ruleset has one name, the choice's own, and the Custom dialog, a params label and a menu section say the same word.

`presetMenu` SHALL place the presets of each ruleset in a section of their own, titled with the choice's name and ordered as the field lists its choices, keeping each ruleset's presets in the order the game wrote them. A game with a ruleset field SHALL list its presets flat, and a menu whose presets all hold one ruleset SHALL stay flat.

Each game used to decide this for itself: Salad named its modes one way in the dialog and another in its titles, and Seismic and Unequal interleaved two puzzles' boards in one list.

#### Scenario: A lead is given a second word

- **WHEN** a `"choices"` item in the `lead` slot declares label `words`
- **THEN** the typechecker refuses it

#### Scenario: Presets of two rulesets are written interleaved

- **WHEN** a game's flat preset list alternates between two rulesets
- **THEN** its Type menu shows one section per ruleset, each holding only that
  ruleset's presets

#### Scenario: A ruleset game writes a section of its own

- **WHEN** a game with a ruleset field returns a preset menu containing a submenu
- **THEN** `presetMenu` throws
