## MODIFIED Requirements

### Requirement: Escape reaches the puzzle when there is no gesture to cancel

Escape SHALL be delivered to the running puzzle as button `27` whenever no
pointer gesture is in flight, which is what a game's `interpretMove` tests to
put a piece back down. When a pointer is down, Escape SHALL instead cancel
that gesture, as a canceled pointer does (`engine-input`, "A canceled press
leaves the game as it was before the press"), and SHALL NOT also arrive as a
keypress, so a game never sees one Escape as two events.

#### Scenario: Escape with no pointer down reaches the puzzle

- **WHEN** the player presses Escape while no pointer gesture is in flight
- **THEN** the puzzle receives button `27`

#### Scenario: Escape with a pointer down cancels the gesture only

- **WHEN** the player presses Escape while a pointer is down
- **THEN** the puzzle receives a cancel of the press, and no drag or release
- **AND** it does not additionally receive button `27`

## ADDED Requirements

### Requirement: A canceled pointer cancels its press

When the browser cancels a pointer whose press a puzzle claimed, the
interactive puzzle view SHALL tell the puzzle the press is canceled, once, and
SHALL NOT send a drag or a release for it at any position. A cancel that
arrives while its press is still in flight SHALL be retained and delivered once
the press has been acknowledged.

#### Scenario: A touch is taken over mid-press

- **WHEN** a finger is down on the board and the browser reports
  `pointercancel` for it
- **THEN** the puzzle receives the press and then its cancel, and nothing else
