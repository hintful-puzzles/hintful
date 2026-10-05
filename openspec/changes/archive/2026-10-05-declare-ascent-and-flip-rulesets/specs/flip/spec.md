## ADDED Requirements

### Requirement: Flip's rulesets are Crosses and Random

Flip SHALL declare Crosses and Random as its two rulesets, each with the rule for which squares a press flips, so the Type menu holds a section for each, a params label starts with the ruleset's name, and the help page states each one's rule in its opening list. The params encoding SHALL be unchanged.

#### Scenario: The menu keeps the two apart

- **WHEN** the player opens Flip's Type menu
- **THEN** the Crosses presets and the Random presets are in separate sections

#### Scenario: The help says what Random changes

- **WHEN** a player reads Flip's help page
- **THEN** its rules say which squares a press flips in Crosses and which in
  Random
