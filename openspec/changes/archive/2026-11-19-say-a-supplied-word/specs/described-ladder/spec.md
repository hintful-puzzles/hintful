## ADDED Requirements

### Requirement: A technique's sentence may say words its game supplies

A technique's `says` SHALL be able to declare a term `{ supplied: words }`, a list of words the game's hook for the technique supplies, said as they are: as a list (`{term}`), as alternatives (`{either term}`), or by how many (`{term: one | several}`). The soundness checker SHALL read nothing of it.

#### Scenario: Wordtrail names the only word of a length

- **WHEN** Wordtrail's hint fires `onlyLength` where one trail still fits the one six-letter word, FRIDGE
- **THEN** its sentence reads "The striped letters spell FRIDGE, the only 6-letter word that still fits, so these edges must be as shown."

### Requirement: A game's hook supplies a technique's terms from what the firing states

A game's hook for a technique that declares a supplied term SHALL be told the firing's stated terms, so it can make words of a set the description states. The compiled module SHALL type what each hook returns, so a game that leaves a supplied term out does not compile.

#### Scenario: A game that leaves the words out does not compile

- **WHEN** Wordtrail's hint supplies no hook for `onlyLength`
- **THEN** the typecheck fails, naming the hook as missing
