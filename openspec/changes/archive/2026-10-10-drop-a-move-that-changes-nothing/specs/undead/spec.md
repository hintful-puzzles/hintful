## ADDED Requirements

### Requirement: Undead refuses edits to fixed cells

Fixed cells SHALL reject monster, clear and pencil edits.

#### Scenario: A given monster cannot be edited

- **WHEN** the player tries to place a monster in, or clear, a fixed (given)
  monster cell
- **THEN** both edits are rejected

## REMOVED Requirements

### Requirement: Undead refuses edits to fixed cells and records no empty move

**Reason**: Restated as "Undead refuses edits to fixed cells", with the scenario "A given monster cannot be edited" word for word. That a move which would not change the state makes no history entry is `ts-engine`, "A move that leaves the board as it was is no step of the history". The second half of the title and the scenario "Typing what is already there" said only that, so the title changes and the scenario goes.
