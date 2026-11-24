## ADDED Requirements

### Requirement: A setting the params give is stated one way

A description SHALL state every setting its params give (a flag, a number or a choice, with its letter, its Custom field and what it gates) through one settings concept, and the description language SHALL NOT offer a second key for a setting of the same kind.

#### Scenario: A variation and a deal option

- **WHEN** one description has a modifier that adds a rule and an option that changes only the deal
- **THEN** both are stated as settings, differing in what they gate

### Requirement: A game ID is read and written by one codec

The params and description of a born game SHALL be encoded and decoded by one codec whose segment kinds are named for what they encode, and a byte layout upstream's IDs need SHALL be a property of a segment kind, never a segment kind of its own.

#### Scenario: An upstream ID with a quirk

- **WHEN** an upstream game ID with a layout only one game uses is loaded
- **THEN** it reads through a segment kind other games also use, with the quirk stated as that kind's property
