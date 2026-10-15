## MODIFIED Requirements

### Requirement: A declared verb is held to what its buttons and keys do

A cross-game guard SHALL hold a `targetVerbs` declaration to the behavior: for
every declaring game, at every cursor position the arrows reach where a shown
cursor rests on a target, a select key SHALL leave the board its button leaves
when pressed at that target's `pointAt`, since the generated paragraph tells
the player a key acts on the square under the cursor. A position resting on no
target belongs to an arm and is walked through without being pressed at.

#### Scenario: Enter does what the click does

- **WHEN** a declaring game is probed from its opening position
- **THEN** at every reachable cursor position resting on a target, Enter
  leaves the board a left-click at that target's `pointAt` leaves, and Space
  that of the right-click, or of the left-click when there is no right verb

#### Scenario: A key acting beside the cursor fails

- **WHEN** a declaring game's key applies its verb to a target next to the
  one under the cursor
- **THEN** the guard fails, though a press on that neighbor leaves the same
  board

#### Scenario: A key-only verb reaches the board

- **WHEN** a declaring game has a verb reached only by keys
- **THEN** each of its keys changes some board from a primed position, and at
  every position leaves a board its pointer route, pressed at the same target,
  passes through, or the guard fails
