## ADDED Requirements

### Requirement: A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft

The engine SHALL name the contract sections whose absence makes a game a
draft (`src/engine/sections.ts`): `hint`, `findMistakes`, `solve` and
`transposeParams`. Each section of a game SHALL be in exactly one of three
states: implemented (the member is present), not applicable (the game gives the
reason in `Game.notApplicable`), or absent. A game with any absent section SHALL
be a draft. Draft SHALL be computed from these states and never declared by a
game about itself.

A reason SHALL state a fact about the puzzle that a player could check against
its rules, written as a sentence for the game's help page. That nobody has
written the section yet SHALL NOT be a reason; that absence is what draft means.
A hint SHALL never be not applicable, and the type SHALL NOT admit `hint` as a
key of `Game.notApplicable`.

A game that both implements a section and declares it not applicable SHALL be
refused wherever the section state is read, including the production build.

A member SHALL join the sections only when its absences can be told apart
without reading intent that no reason states. Members whose absence says nothing
either way (`difficulty`, `textFormat`, and affordances such as `hover`,
`reference` and `prefs`) SHALL stay optional and outside the draft computation.

#### Scenario: A hintless game is a draft

- **WHEN** a registered game declares no `hint`
- **THEN** its draft sections include "Hints", whatever else it declares

#### Scenario: A reason excuses a section

- **WHEN** Fifteen declares `findMistakes` not applicable, because every
  arrangement of its tiles is a step on the way to the answer
- **THEN** its `findMistakes` section is not applicable, not absent, and the
  reason is shown on its help page

#### Scenario: A game cannot both have a section and excuse it

- **WHEN** a game implements `solve` and also gives a `solve` reason
- **THEN** reading its section state throws, naming the game and the section

#### Scenario: A guard's ledger of absences reads the game's reasons

- **WHEN** a cross-game guard would excuse a game for having no such section
  (no mistakes to check, no solver to cheat with, no turn)
- **THEN** it derives the excuse from the game's section state rather than
  from a ledger entry in the guard

### Requirement: A game may turn its params, says why not, or is a draft

A game MAY declare `transposeParams(p)`, returning the same board turned on its side (width and height exchanged, together with anything laid out on the grid) or `null` for params that cannot turn. When it does, the midend's `newGame(fitTo)` SHALL deal the chosen params turned whenever the turned board draws at a strictly larger tile size in `fitTo`, the board area, and as chosen otherwise, so a square board and a tie keep the chosen orientation. Without `fitTo`, the chosen params SHALL be dealt as they stand.

The decision SHALL be made at deal time only. The params chosen for the next game SHALL stay as chosen, so the next deal on a screen held the other way round turns back, and a board started from an id, a save or an autosave SHALL never be turned. The Custom dialog SHALL show the chosen params turned the way the board on screen was dealt.

`transposeParams` SHALL be a contract section: a game that leaves it out SHALL give the reason in `notApplicable` — a tall board of it is a different game, or the board is the same shape either way round — or be a draft. A game whose reason is that its grid is square (`SQUARE_GRID`) SHALL draw every default and preset board square. Every implementation SHALL turn valid params into valid params, turn them back exactly, and draw the turned board with its width and height exchanged, checked on non-square boards built through the game's own width item; a game that draws something along one side only SHALL be named in `UNEVEN_FRAME` instead of meeting the last.

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

#### Scenario: A game that neither turns nor says why is a draft

- **WHEN** a game declares no `transposeParams` and gives no `transposeParams` reason
- **THEN** it is a draft, and the catalog labels it so

#### Scenario: A square-grid reason is held to the drawn board

- **WHEN** a game gives `SQUARE_GRID` as its reason and a preset of it draws wider than tall
- **THEN** `orientation.test.ts` fails, naming the game and the preset

## REMOVED Requirements

### Requirement: A game may turn its params, and a new board is dealt to fit

**Reason**: Its guard required every game with a width and a height to turn or
be named in the `NOT_TURNED` ledger. The reasons now live on the games as
`notApplicable.transposeParams`, and a game with neither is a draft rather than
a gate failure.

**Migration**: "A game may turn its params, says why not, or is a draft"
carries every surviving rule and scenario; the three `NOT_TURNED` entries are
the `notApplicable` reasons of Bricks, Same Game and Slide.

## MODIFIED Requirements

### Requirement: A shared mechanic is joined by having it, not by declaring it

A game SHALL join a shared engine mechanic by **having** it — registering the
object, carrying the `Ui` fields, declaring the method, calling the arm — and a
cross-game guard SHALL derive its population from what the game *is* rather than
from a roster of opted-in names. A game SHALL NOT be required to add itself to a
list in order to be guarded.

The enrollment fact SHALL be one of: the registered game object (a member's
presence, a flag's value, a contract section's state), the `Ui` its `newUi`
returns, or the game's own source with comments removed.
`src/engine/testing/enrollment.ts` SHALL be the shared way to ask those
questions, and a guard needing one of them SHALL use it rather than re-deriving
the population.

Every derived sweep SHALL assert a floor on **the population it drew from**, not
only on the set it filtered out of that population.

Where the derived set legitimately contains members the guard's rule must not
apply to, the guard SHALL record them as a **ledger in the guard** — one entry
per member, each carrying its reason — and SHALL assert that the ledger equals
what the derivation found. A ledger entry SHALL NOT be the enrollment key: the
derivation says which games are members, and the ledger says only why a member
is excused. An empty ledger is a valid and meaningful assertion. An excuse
that says the game has no such contract section SHALL NOT be a ledger entry: it
is the game's `notApplicable` reason, which the help page shows and the guard
reads.

#### Scenario: A newly ported game joins every guard for its capabilities

- **WHEN** a game is registered that declares `hint()`
- **THEN** it is covered by every cross-game hint guard, including the
  necessity-voice rule, without any list being edited

#### Scenario: A derived sweep that found nothing fails rather than passing

- **WHEN** the registry a cross-game guard draws from is empty or short
- **THEN** the guard fails on the population floor rather than reporting health
  over an empty set

#### Scenario: A ledger entry that has stopped being true fails

- **WHEN** a guard's exemption ledger names a game the derivation no longer
  places in the exempt set
- **THEN** the guard fails, naming the stale entry

### Requirement: The capability snapshot records the draw state its constructor builds

The derived capability snapshot SHALL record the field names of a game's **draw
state** as well as of its `Ui`, so that a divergence in either is a reviewable
line in a text diff rather than something a reader must go looking for.

It SHALL record names only — not sizes, values or types — so that the snapshot
moves when a game's vocabulary moves and at no other time. A snapshot that moves
for unrelated reasons trains its readers to re-baseline without reading.

The snapshot SHALL continue to assert nothing about *which* names a game may
use. An approved vocabulary would be a list that only this check reads, and no
mechanism consumes; a game can be written without it and nothing would notice.
The snapshot's whole job is to make a change visible, not to permit or forbid
one.

It SHALL read the draw state **as `newDrawState` returns it** at the game's
preferred tile size, before any `redraw`. A draw state is built at its size and
no step of the `Game` contract assigns into it afterwards, so that is the only
reading there is: no later step can put a field back that the constructor lost
before its names are taken.

#### Scenario: a shared mechanic is added to several games at once

- **GIVEN** a mechanic that several games remember in their draw state
- **WHEN** the snapshot is next taken
- **THEN** the field appears against each of those games in one place
- **AND** no assertion is made about what it should be called

#### Scenario: a game's draw state loses a field

- **GIVEN** a change that removes a field from one game's draw state
- **WHEN** the suite runs
- **THEN** the snapshot moves, and the loss is visible in the diff
- **AND** this holds for every field the game's `newDrawState` builds,
  including those it derives from the tile size
