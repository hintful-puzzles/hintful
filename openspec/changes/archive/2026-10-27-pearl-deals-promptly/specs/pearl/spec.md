# pearl Specification Delta — pearl-deals-promptly

## ADDED Requirements

### Requirement: Generation: Pearl's menu boards deal promptly

Every board on Pearl's preset menu SHALL deal near a second at its slowest, measured over a dozen deals at each tier it is offered at, and at least half of the menu's sizes SHALL be upright rectangles. A size that the generator cannot deal that promptly SHALL be left to the Custom dialog.

#### Scenario: A slow size is left off the menu

- **WHEN** a dozen deals of a size at a tier include one that takes several seconds
- **THEN** the menu does not offer that size at that tier, and the Custom dialog still deals it
