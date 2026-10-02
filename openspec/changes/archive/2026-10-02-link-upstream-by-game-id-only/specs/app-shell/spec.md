## ADDED Requirements

### Requirement: The Share dialog links a game on Simon Tatham's site by its game ID only

For a puzzle that Simon Tatham's online collection carries, the Share dialog SHALL link the board on screen there by its game ID and its type by its params, and SHALL NOT link it by random seed. A seed names a board only through a generator, and this project's generators deliberately diverge from upstream's, so a seed link can open a board different from the player's. The dialog SHALL describe the Game ID as playable in any compatible app and the random seed as dealing the same game in this app.

#### Scenario: An upstream puzzle dealt from a seed

- **WHEN** the Share dialog is shown for a puzzle Simon Tatham's site carries, on a board dealt from a random seed
- **THEN** it links that site by the board's game ID and by its puzzle type
- **AND** no link to that site carries the seed

#### Scenario: A puzzle upstream does not carry

- **WHEN** the Share dialog is shown for a puzzle outside Simon Tatham's collection
- **THEN** it offers no link to Simon Tatham's site
