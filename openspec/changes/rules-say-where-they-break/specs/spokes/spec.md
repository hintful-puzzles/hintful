## MODIFIED Requirements

### Requirement: Look: What Spokes draws

Rendering SHALL draw each hub as a circle carrying its available spokes and clue,
SHALL draw lines between connected hubs, SHALL highlight the hub being dragged
from, SHALL draw in the error color where the board breaks a rule
(`Game.rules`): the number of a hub that can no longer carry its count, and the
rim of each hub of a group with every line drawn and cut off from the other
hubs; and SHALL flash on completion.

#### Scenario: Completing the connected, satisfied board wins

- **WHEN** every hub carries exactly its clue's lines and all hubs form one connected
  group with no crossing lines
- **THEN** the game is reported solved and flashes

#### Scenario: Two 1-hubs joined

- **WHEN** two 1-hubs are joined by a line on a board with other hubs
- **THEN** both hubs' rims are drawn in the error color

#### Scenario: A hub over its number

- **WHEN** a hub carries more lines than its number
- **THEN** its number is drawn in the error color
