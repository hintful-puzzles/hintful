## ADDED Requirements

### Requirement: The first-open card shows a solved board

Beside the rules, the first-open card SHALL let the player see a solved board of the game, at the size of the board being opened or the game's first preset. The solved board SHALL be shown, never played: it SHALL NOT flash a win, set the game's status or timer, or be remembered as the player's board.

#### Scenario: A newcomer sees a finished board

- **WHEN** a player opens a game they have never opened here
- **THEN** the first-open card shows that game's rules and a solved board of it

#### Scenario: Closing the card

- **WHEN** the player closes the card, by Play or any other way
- **THEN** the board in front of them is unsolved, with no move made on it, and reopening the game later shows that board, not the solved one

### Requirement: A board the player brought is not spent on the first-open card

When the first-open card opens over a board the player brought, from a shared link or remembered from an earlier visit, that board SHALL stay the player's: closing the card SHALL leave it as it was, with its moves.

#### Scenario: A shared link to a board

- **WHEN** a player opens a link to a board of a game they have never opened, and closes the card
- **THEN** the linked board is in front of them, unsolved, as the link gave it
