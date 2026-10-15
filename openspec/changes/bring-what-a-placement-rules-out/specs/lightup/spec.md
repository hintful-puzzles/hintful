## ADDED Requirements

### Requirement: Preferences: A bulb can bring the crosses a full wall rules out

Light Up SHALL declare what a bulb rules out, for the engine's `auto-cross`
preference. Where a new bulb gives a numbered wall beside it all its lights,
the wall's other squares that hold neither a bulb nor a cross get a cross.

#### Scenario: The last light of a 2

- **WHEN** the preference is on and a bulb is placed that is the second
  beside a wall numbered 2
- **THEN** the wall's other free squares get a cross, and one Undo takes
  them back with the bulb
