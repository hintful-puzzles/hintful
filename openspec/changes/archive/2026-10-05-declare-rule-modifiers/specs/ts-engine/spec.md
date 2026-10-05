## ADDED Requirements

### Requirement: A game declares its rule modifiers with modifierItem

A params field that adds, removes or bounds one rule of the game, and that holds together with the game's other such fields, SHALL be declared with `modifierItem` in `paramConfig` (`engine/modifier.ts`): the value at which its rule applies, the words a params label says for a board the rule applies to, and the rule as a sentence. From the declaration the engine SHALL build the field's entry in the help's Parameters section, stating the value the rule applies at, and the field's label words, said exactly when the rule applies.

Fields of one game that cannot all be set together are not modifiers: they SHALL be one ruleset field. Whether a game's candidates combine SHALL be settled by dealing a board for every combination of them.

Each game had written these as ordinary fields, with a doc, label words and help prose composed separately, and two games' rules were stated only in the Parameters section.

#### Scenario: A modifier's rule applies

- **WHEN** a params label is composed for a board at the value a checkbox
  modifier's rule applies
- **THEN** the label carries the modifier's words, and at the other value it
  does not

#### Scenario: A rule is reworded

- **WHEN** a game changes a modifier's `rule`
- **THEN** the field's entry in the Parameters section and its line of the
  page's list of modifiers both say the new words

#### Scenario: Two candidates exclude each other

- **WHEN** some combination of a game's candidate fields is refused or cannot
  be dealt
- **THEN** those fields are declared as rulesets and not as modifiers
