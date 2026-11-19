## ADDED Requirements

### Requirement: A technique's sentence may say a word its game supplies

A technique's `says` SHALL be able to declare a term the game supplies from the firing's bindings, said as it is, as a planner's `word` term is. The compiled code SHALL refuse to narrate a step whose game supplies no value for it, and the soundness checker SHALL read nothing of it.

#### Scenario: Wordtrail names the only word of a length

- **WHEN** Wordtrail's hint fires `onlyLength` on a board where one trail still fits the one six-letter word, FRIDGE
- **THEN** its sentence names FRIDGE
