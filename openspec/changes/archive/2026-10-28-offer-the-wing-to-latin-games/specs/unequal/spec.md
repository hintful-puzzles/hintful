## REMOVED Requirements

### Requirement: Params: Unequal refuses the parameters it cannot deal

**Reason**: A 3×3 at Hard needs a wing and deals again, and a 3×3 at
Unreasonable has no board; the requirement's scenario said the opposite.

**Migration**: Replaced by "Params: Unequal refuses small Adjacent boards and
the 3×3 tiers no board needs".

## ADDED Requirements

### Requirement: Params: Unequal refuses small Adjacent boards and the 3×3 tiers no board needs

`validateParams` SHALL refuse an Adjacent puzzle of Tricky difficulty or
harder below order 5, and SHALL refuse, when a board is to be dealt, an order
of 3 at Tricky or Unreasonable, which no 3×3 board needs.

#### Scenario: A small Adjacent puzzle has no upper tiers

- **WHEN** `validateParams` is called with an Adjacent puzzle below order 5 at
  Tricky or harder
- **THEN** it returns a non-null error string

#### Scenario: A 3×3 at Hard deals

- **WHEN** a board is to be dealt from the params `3dx`
- **THEN** it is not refused, and the board dealt needs Hard

#### Scenario: A 3×3 at Unreasonable is refused

- **WHEN** a board is to be dealt from the params `3dr`
- **THEN** it is refused with "No 3x3 puzzle is Unreasonable."
- **AND** a board that arrives with its description under those params opens
