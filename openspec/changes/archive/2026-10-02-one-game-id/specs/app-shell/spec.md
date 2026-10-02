## MODIFIED Requirements

### Requirement: A puzzle page reopens on the board it was last showing

Opening a puzzle SHALL show the board that puzzle last dealt, rather than
generating a new one, whenever nothing more specific applies. The order of
preference SHALL be: a game ID supplied in the URL, then the most recent autosave,
then the last board this puzzle dealt, then a new game.

The last dealt board SHALL be recorded as a game ID in the puzzle's settings
record, and SHALL NOT be recorded as an autosave. The autosave table is what the
home screen reads to badge a puzzle as having a game in progress, so a row written
for a board the player has not touched would make that badge true for every puzzle
they have merely opened.

The recorded game ID SHALL be the board's one game ID, which carries the full
params encoding, difficulty included. Re-dealing a remembered board therefore
restores the tier the player chose; the midend only checks that the board solves
there, and raises a tier a mislabeling build recorded too low (ts-engine,
Requirement: A loaded board carries the tier it needs).

A recorded game ID that this build can no longer deal SHALL be discarded and
replaced by a new game, without interrupting the player — they did not ask for
that board, so its loss is not a decision to put in front of them. A game ID
supplied in the URL is unaffected by this and continues to report its failure.

#### Scenario: An untouched board survives a reload

- **WHEN** a puzzle is opened, no move is made, and the page is reloaded
- **THEN** the same board is shown, and no autosave record exists for that puzzle

#### Scenario: A reopened board keeps the difficulty it was dealt at

- **WHEN** a tiered puzzle is dealt at a non-default difficulty, no move is made,
  and the page is reloaded
- **THEN** the same board is shown **and** the puzzle still reports that
  difficulty, so the next new game is dealt at it
- **AND** the type control names that difficulty rather than the default one

#### Scenario: A started game still restores from its autosave

- **WHEN** a puzzle is opened, moves are made, and the page is reloaded
- **THEN** the board and the moves are restored from the autosave, not re-dealt
  from the recorded game ID

#### Scenario: Browsing puzzles does not badge them as in progress

- **WHEN** a puzzle is opened and left without a move
- **THEN** the home screen does not show that puzzle as having a game in progress

#### Scenario: A remembered board this build cannot deal is dropped quietly

- **WHEN** a puzzle is opened whose recorded game ID no longer validates
- **THEN** a new game is dealt, the recorded ID is cleared, and no alert is shown

### Requirement: The params a puzzle reports are the full params of the board on screen

The params a puzzle reports for display SHALL be the **full** encoding of the
board currently on screen, difficulty included. They label the type control,
describe the type in the share dialog, and key the keypad and view re-renders,
and every one of those is wrong if the difficulty is missing. They SHALL be read
from the board's game ID, which carries the full encoding.

#### Scenario: A board with no seed still reports its difficulty

- **WHEN** a board is restored from a descriptive game ID
- **THEN** the params it reports carry the difficulty the board was dealt at

#### Scenario: The reported params follow a re-deal

- **WHEN** a new board is dealt at a different difficulty
- **THEN** the params reported change with it rather than keeping the first
  value seen

### Requirement: The app hands out boards, never seeds

Everything the app shows a player as naming a game, or lets them copy or share, SHALL name the board itself as its game ID (`params:desc`, full params), never a random seed. A seed names a board only through a generator, and this project's generators change, both against upstream and between versions of this app, so a seed handed out today can name a different board tomorrow. The midend's game-ID notification SHALL carry the board's one game ID and no seed, so that no part of the app can hand one out. The same ID SHALL serve showing, sharing, saving and reopening the board. A `#seed` ID arriving from a link, a paste or another collection SHALL still deal a game, the one the current generator deals for it.

#### Scenario: The link to this specific game

- **WHEN** the Share dialog is shown for a board dealt by New Game
- **THEN** its "This specific game" link carries the board's game ID
- **AND** the dialog shows no random seed

#### Scenario: Links to Simon Tatham's site

- **WHEN** the Share dialog is shown for a puzzle Simon Tatham's site carries
- **THEN** it links that site by the board's game ID and by its puzzle type, and by nothing else

#### Scenario: A puzzle upstream does not carry

- **WHEN** the Share dialog is shown for a puzzle outside Simon Tatham's collection
- **THEN** it offers no link to Simon Tatham's site

#### Scenario: The notification carries no seed

- **WHEN** the midend deals a board from a fresh seed or a `#seed` ID
- **THEN** its game-ID notification carries exactly the board's game ID

#### Scenario: A seed ID still opens

- **WHEN** a player opens a `params#seed` ID
- **THEN** the app deals the board the current generator deals for that seed
