## ADDED Requirements

### Requirement: The app hands out boards, never seeds

Everything the app shows a player as naming a game, or lets them copy or share, SHALL name the board itself as its game ID (`params:desc`), never a random seed. A seed names a board only through a generator, and this project's generators change, both against upstream and between versions of this app, so a seed handed out today can name a different board tomorrow. The midend's game-ID notification SHALL carry the sharing ID and the restoring ID and no seed, so that no part of the app can hand one out. A `#seed` ID arriving from a link, a paste or another collection SHALL still deal a game, the one the current generator deals for it.

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
- **THEN** its game-ID notification carries exactly the sharing ID and the restoring ID

#### Scenario: A seed ID still opens

- **WHEN** a player opens a `params#seed` ID
- **THEN** the app deals the board the current generator deals for that seed

## MODIFIED Requirements

### Requirement: The params a puzzle reports are the full params of the board on screen

The params a puzzle reports for display SHALL be the **full** encoding of the
board currently on screen, difficulty included — the same encoding a restore
uses, never the lossy sharing form. They label the type control, describe the
type in the share dialog, and key the keypad and view re-renders, and every one
of those is wrong if the difficulty is missing.

They SHALL be read from the restoring ID, and never from the sharing ID, whose
params omit the difficulty by design. Unruly at 10x10 Normal, reopened and
labeled from the sharing ID, came back as "10x10 Trivial", a type its preset
menu does not offer.

#### Scenario: A board with no seed still reports its difficulty

- **WHEN** a board is restored from a descriptive game ID
- **THEN** the params it reports carry the difficulty the board was dealt at

#### Scenario: The reported params follow a re-deal

- **WHEN** a new board is dealt at a different difficulty
- **THEN** the params reported change with it rather than keeping the first
  value seen

## REMOVED Requirements

### Requirement: The Share dialog links a game on Simon Tatham's site by its game ID only

**Reason**: Folded into "The app hands out boards, never seeds", which holds the
same rule for every surface rather than for the upstream links alone. Its
sentence describing a Random seed field no longer applies, since the dialog
shows no seed.

**Migration**: Both of its scenarios survive under the new requirement.
