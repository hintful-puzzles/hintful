## MODIFIED Requirements

### Requirement: Generation: Salad has two difficulties, over the Latin deductions and its border clue's

Salad SHALL offer two tiers. To the shared Latin deductions its solver SHALL
add the border-clue deduction, in ABC End View mode. Easy SHALL be that
deduction and the shared positional and numeric eliminations, and Normal
SHALL add the shared set elimination and the wing, over the letters alone.
Salad SHALL follow no forcing chain at either tier, since a chain is a search
and Salad has no Unreasonable.

#### Scenario: A Normal board genuinely needs the Normal tier

- **WHEN** a board generated at Normal is solved at Easy
- **THEN** the solver does not reach a solution
- **AND** solving the same board at Normal does

#### Scenario: A 4×4 of three letters at Normal deals

- **WHEN** a board is to be dealt from the params `4n3Ldx`
- **THEN** it is not refused, and the board dealt needs Normal

## REMOVED Requirements

### Requirement: Params: Salad refuses a 4×4 of three letters at Normal

**Reason**: Its boards need a wing, which Normal now holds; the cell deals.

**Migration**: None. A board that arrived with its description already opened.
