## ADDED Requirements

### Requirement: Every default and preset draws no wider than tall

Every registered game's default params and every preset leaf SHALL draw no wider than tall (within 2%), judged by the game's own `computeSize` and never by its params' field names. A board whose shape is the puzzle's own SHALL be recorded, with its reason, in a ledger the guard holds exactly right, so an entry nothing needs also fails.

A phone held upright is the main way this app is played, and a landscape board on it is drawn at the width of the screen with most of its height wasted. A census of `w > h` counts a clue margin, a panel along one side or a tiling's cell shape wrong, which is why the measure is the drawn size.

#### Scenario: A landscape preset is refused

- **WHEN** a game offers a preset whose `computeSize` is wider than tall by more than 2%
- **AND** the ledger does not name that game and encoding
- **THEN** `orientation.test.ts` fails, naming it

#### Scenario: A board wide by nature is excused by name

- **WHEN** Cube's non-cube solids or Ascent's hexagon mode draw wider than tall
- **THEN** the guard accepts them because the ledger names each with its reason

### Requirement: A game may turn its params, and a new board is dealt to fit

A game MAY declare `transposeParams(p)`, returning the same board turned on its side (width and height exchanged, together with anything laid out on the grid) or `null` for params that cannot turn. When it does, the midend's `newGame(fitTo)` SHALL deal the chosen params turned whenever the turned board draws at a strictly larger tile size in `fitTo`, the board area, and as chosen otherwise, so a square board and a tie keep the chosen orientation. Without `fitTo`, the chosen params SHALL be dealt as they stand.

The decision SHALL be made at deal time only. The params chosen for the next game SHALL stay as chosen, so the next deal on a screen held the other way round turns back, and a board started from an id, a save or an autosave SHALL never be turned. The Custom dialog SHALL show the chosen params turned the way the board on screen was dealt.

A game SHALL leave `transposeParams` out only when a tall board is a different game from a wide one. Every game whose Custom dialog asks for a width and a height SHALL either declare it or be named, with that reason, in the guard's `NOT_TURNED` ledger. Every implementation SHALL turn valid params into valid params, turn them back exactly, and draw the turned board with its width and height exchanged, checked on non-square boards built through the game's own width item; a game that draws something along one side only SHALL be named in `UNEVEN_FRAME` instead of meeting the last.

#### Scenario: A portrait preset is dealt turned on a wide screen

- **WHEN** Magnets' 5×6 preset is chosen and a new game is dealt to fit a 1200×700 area
- **THEN** the board on screen is 6×5
- **AND** `getParams` still reports 5×6, and a deal to fit a 390×640 area is 5×6

#### Scenario: A game that cannot turn is dealt as chosen

- **WHEN** a Same Game board is dealt to fit a wide area
- **THEN** it is dealt at the size chosen

#### Scenario: A board loaded from an id is never turned

- **WHEN** a game id is loaded after a deal to fit a wide area
- **THEN** the board has exactly the id's params

#### Scenario: A width-and-height game that neither turns nor says why fails the guard

- **WHEN** a game's Custom dialog has width and height items, it declares no `transposeParams`, and `NOT_TURNED` does not name it
- **THEN** `orientation.test.ts` fails, naming the game
