## ADDED Requirements

### Requirement: Params: Netslide's game modes are Bordered and Wrapping

Netslide SHALL offer wrapping as a ruleset, Bordered or Wrapping
(`wrappingRulesetItem`, `engine/ruleset.ts`), each a section of the Type
menu, with the encoding's `w` unchanged.

#### Scenario: The Type menu's sections

- **WHEN** the preset menu is read
- **THEN** it has a Bordered section opening with "3x3 easy" and a Wrapping
  section opening with "3x3 hard"
