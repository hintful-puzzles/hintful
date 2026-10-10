## MODIFIED Requirements

### Requirement: Filling rejects board sizes it cannot generate

`validateParams` SHALL refuse, when a board is to be dealt at either
difficulty, a board of more than 300 squares, with a reason naming that
maximum. A description that is supplied SHALL NOT be held to the bound.

#### Scenario: A board past the bound is refused with a reason

- **WHEN** an 18×17, a 20×20 and a 1×301 board are validated for generation
- **THEN** each is refused with a message naming 300
- **AND** a 17×17, a 15×20 and a 1×300 board are admitted at either difficulty

#### Scenario: An existing large description still loads

- **WHEN** a 25×25 board's params accompany a supplied description
- **THEN** validation succeeds
