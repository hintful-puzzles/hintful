## ADDED Requirements

### Requirement: Params: Net's game modes are Bordered and Wrapping

Net SHALL offer wrapping as a ruleset, Bordered or Wrapping
(`wrappingRulesetItem`, `engine/ruleset.ts`), each a section of the Type
menu, with the encoding's `w` unchanged.

#### Scenario: A wrapping board's label

- **WHEN** a 7×9 wrapping board at Easy with a quarter of its places barred is
  labeled
- **THEN** the label reads "Wrapping: 7x9 Easy, 25% barriers"
