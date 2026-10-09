# engine-input Specification

## Purpose
Pointer, keyboard and touch input: the shared button, key and digit
vocabulary, the two-button pointer and its touch gesture layer, the on-screen
key panel, the keyboard cursor, the grid drag, the declarative
targets-and-verbs form of a click game with its drag sweeps, and the rules the
collection-wide input guards hold every game to.

## Requirements

### Requirement: The engine provides shared pointer button constants

The engine SHALL export the button codes (`LEFT_BUTTON`, `RIGHT_BUTTON`, the
drags and releases, the cursor keys and the rest) from `pointer.ts`, equal to
the values of `PuzzleButton` in the engine's own `types.ts`, with the keyboard
modifier masks (`MOD_MASK`, `MOD_NUM_KEYPAD`, `MOD_SHFT`, `MOD_CTRL`) and
`stripModifiers(button)`, which clears the `MOD_MASK` bits and nothing else. A
game SHALL compare a button against these and SHALL NOT declare a button code
or a modifier mask of its own.

#### Scenario: A game imports shared button constants

- **WHEN** a game's `interpretMove` function receives a button number
- **THEN** it compares against the shared constants from `pointer.ts` instead
  of locally-declared values
- **AND** no game file contains duplicate button code declarations

#### Scenario: A game strips modifier bits from a button

- **WHEN** a game's `interpretMove` receives a button with modifier bits set
  and calls `stripModifiers(button)`
- **THEN** the result has the `MOD_MASK` bits cleared and the base button code
  and any unrelated high bits preserved

### Requirement: gridCursorMove moves a position on a bounded grid

The engine SHALL provide `gridCursorMove(button, x, y, w, h, wrap?)` in
`pointer.ts`, returning the coordinates after applying the button's delta on
an axis-aligned grid: clamped to `[0, w) × [0, h)` when `wrap` is false, the
default, and wrapped toroidally when it is true. It SHALL return `null` when
the button is not a cursor key or the move is a no-op against a clamped edge.
It SHALL be position-only: it returns coordinates and never owns or mutates a
game's `ui`.

#### Scenario: A bounded-grid cursor move clamps at the edge

- **WHEN** a game calls `gridCursorMove(CURSOR_LEFT, 0, 3, w, h)` with the
  cursor already at the left edge and `wrap` defaulting to false
- **THEN** it receives `null` (no-op at the clamped edge), and the game makes
  no cursor change
- **AND** the same call one column in (`x = 1`) returns `{ x: 0, y: 3 }`

#### Scenario: A toroidal cursor move wraps

- **WHEN** a toroidal game calls `gridCursorMove(CURSOR_LEFT, 0, 3, w, h, true)`
- **THEN** it receives `{ x: w - 1, y: 3 }`

### Requirement: A bounded-grid cursor is driven through moveCursor

A game holding an ordinary bounded-grid cursor SHALL drive it through
`moveCursor`, which owns the position, the reveal and the changed-tracking
together, and SHALL NOT carry a bounded or toroidal clamp of its own.
`gridCursorMove` is the primitive beneath the shared cursor: it and
`cursorDelta` are for a traversal that is not a bounded clamp
(obstacle-skipping, lock modes, half-cell coordinates, non-positional rolling
cursors) and for whatever a game does while the cursor moves.

#### Scenario: A positional-cursor game carries no clamp of its own

- **WHEN** a game moves a positional cursor over a bounded or toroidal grid
- **THEN** the clamp or the wrap is the engine helper's
- **AND** the game declares no clamp helper of its own

### Requirement: Games may expose on-screen key labels

The engine SHALL support an optional `Game.requestKeys(params)` hook returning
an ordered list of `KeyLabel` (`{ button, label }`): the on-screen keypad
buttons for that game. The hook SHALL depend only on `params`, not on `state`
or `ui`, because the app's key panel reloads its labels only when params
change. Each entry's `button` SHALL be the key code, processed exactly as the
equivalent physical keypress.

#### Scenario: An on-screen key enters what the physical key enters

- **WHEN** the app renders a game's key labels and the player presses one
- **THEN** the game receives that entry's `button`, as it would from the
  keyboard

### Requirement: A key label carries its resolved text

Each `KeyLabel`'s `label` SHALL be the resolved display text: the digit or
letter character, or `"Clear"` for the clear key, which the app's icon mapping
renders. The engine SHALL NOT re-derive a label from a button code.

#### Scenario: The clear key is labeled by name

- **WHEN** a game builds its keypad with `digitKeys(3)`
- **THEN** the entries are labeled `"1"`, `"2"`, `"3"` and `"Clear"`, the last
  with `CLEAR_BUTTON` as its button

### Requirement: The midend serves a game's key labels

The `EngineCore` surface SHALL expose `requestKeys(): KeyLabel[]`. The midend
SHALL return `game.requestKeys(params)` for the current params when the hook
is present and an empty list when it is absent, in either case with the Marks
key appended for a note-taking game that does not list it. The app SHALL show the keypad
the midend returns.

#### Scenario: A keypad game's labels are served

- **WHEN** the app requests the key labels for a game that implements
  `requestKeys`
- **THEN** the midend returns that game's `KeyLabel[]` for the current params
- **AND** the app renders one on-screen button per label, each entering the
  key when pressed

#### Scenario: A game without the hook shows no keypad

- **WHEN** the app requests the key labels for a game that does not implement
  `requestKeys` and takes no notes
- **THEN** the midend returns an empty list and no keypad is shown

### Requirement: A game with no secondary meaning is not given a synthetic one

A game in which the secondary button means nothing observable SHALL declare
`Game.ignoresSecondaryButton`. For such a game the interactive view SHALL make
no secondary-button detection: neither a long press nor a two-finger tap
promotes the press, and the press is delivered at once, not held for the
detection window. Without the flag a held press becomes `RIGHT_BUTTON`, the
game tests no such button, and a press-and-drag gesture is lost, only on
touch, whenever the player pauses to aim.

#### Scenario: A held touch press still plays a drag game

- **WHEN** a touch press is held past the long-press window and then dragged,
  in a game that declares `ignoresSecondaryButton`
- **THEN** the gesture is delivered as a left-button press, drag and release,
  and completes as it would have without the pause

### Requirement: The secondary-button declaration is held to the behavior

A guard SHALL assert the biconditional for every registered game: the game
declares `ignoresSecondaryButton` if and only if the secondary button means
nothing observable on a real board. The flag is not upstream's
`REQUIRE_RBUTTON` inverted and SHALL NOT be derived from it: a game can use the
secondary button without needing it, and suppressing its promotion would break
a gesture it handles.

#### Scenario: The declaration cannot drift from the behavior

- **WHEN** a registered game's secondary button means something observable
- **THEN** the guard fails if that game declares `ignoresSecondaryButton`
- **AND** when it means nothing observable, the guard fails if it does not

### Requirement: A secondary meaning is derived from what the player can perceive

What counts as a secondary meaning SHALL be derived, never declared, by one
question: did the secondary gesture change anything the player can perceive,
now or next? The guard SHALL credit a gesture that commits a move, one that
changes what the next input does, and one that folds onto the primary button.
Consumption alone SHALL NOT satisfy the biconditional: a game that answers
`RIGHT_BUTTON` with a bare repaint has no secondary meaning.

#### Scenario: A repaint is not a secondary meaning

- **WHEN** a game answers `RIGHT_BUTTON` but the gesture leaves the same frame
  and the same save, and changes nothing about what the next input does
- **THEN** the guard demands `ignoresSecondaryButton`, even though the button
  was consumed

#### Scenario: A meaning reached through a shared helper counts

- **WHEN** a game's secondary meaning is supplied by `pressNoteTakingCell` or
  another shared helper, with no `RIGHT_BUTTON` branch of its own
- **THEN** the guard credits it, because the derivation reads behavior and not
  source

### Requirement: The secondary-button probe observes the frame and the save

The observation SHALL be the painted frame together with the save, not the
save alone, since a game can keep a secondary meaning in UI state it does not
serialize. A change SHALL be read only as a sufficient sign that the button
means something: a game is reported meaningless only when it is invisible
under every observation, and an unchanged board SHALL NOT by itself convict
one. The guard's priming SHALL include a two-press and a drag setup.

#### Scenario: A meaning kept only in the Ui is seen

- **WHEN** a secondary press changes only what is drawn, such as a pencil-mode
  highlight or a drag highlight, and the save is unchanged
- **THEN** the guard credits the game with a secondary meaning

#### Scenario: An eraser on a fresh board is not convicted

- **WHEN** a game's secondary gesture erases and the board holds nothing yet
- **THEN** the guard reports it meaningless only if the primed boards show
  nothing either

### Requirement: An incidental secondary effect is the guard's stated bound

The guard credits a secondary press whose only effect is incidental, one
shared with the primary press such as hiding the keyboard cursor on any
mouse-down, and that is its stated bound. The bound SHALL stand until a
derivation exists that does not convict a game that deliberately folds the
secondary button onto the primary: a comparison asking whether the secondary
does something the primary does not would fail that game.

#### Scenario: A game left with only the incidental effect stays green

- **WHEN** a game's real secondary arms are removed and its secondary press
  still hides the keyboard cursor as its primary press does
- **THEN** the guard still credits it with a secondary meaning

### Requirement: The gesture layer's own decisions are tested

`detectSecondaryButton` SHALL have direct tests, separate from the per-game
sweeps: a guard that hands a game a synthetic `RIGHT_BUTTON` shows the game
copes with the decision, not that the decision was right. They SHALL cover its
timings and `unhandledEvent`, which the view replays: without it a tap faster
than the detection round trip loses its release entirely, and any state the
puzzle shows only while a press is held stays on screen.

#### Scenario: A stationary finger past the hold window is secondary

- **WHEN** a touch press stays within the drag threshold for longer than the
  hold time
- **THEN** the detector reports the secondary button

#### Scenario: A finger that moves is not secondary

- **WHEN** a touch press moves beyond the drag threshold before the hold time
- **THEN** the detector reports the primary button, and hands back the move
  event it consumed so the view can replay it

### Requirement: Keyboard reachability is a recorded decision for every game

Every registered game SHALL either handle keyboard cursor input, or appear on
an explicit exemption list whose entry states why, and the exemption's reason
SHALL be in that game's spec, not only in a comment or a test fixture. "This
game has no keyboard" is thereby a decision somebody made and wrote down, not
a condition nobody noticed.

#### Scenario: A game with no keyboard handling must be on the list

- **WHEN** a registered game handles no cursor input
- **THEN** the guard fails unless that game is on the exemption list
- **AND** the exemption names the reason, which is also stated in the game's
  spec

### Requirement: A keyboard commits a move

The keyboard-reachability guard SHALL also assert that some keyboard-only
sequence commits a move, because a cursor that goes everywhere and does
nothing is not a keyboard. That probe SHALL allow multi-step sequences, since
a game can pick a piece up with one select and put it down with a second, and
a single-keypress probe scores every such game deaf.

#### Scenario: A cursor that cannot act is not a keyboard

- **WHEN** a game moves a cursor in response to the arrow keys but no
  keyboard-only sequence changes the board
- **THEN** the guard fails

#### Scenario: A two-step game is heard

- **WHEN** a game picks a piece up with a select, moves, and puts it down with
  a second select
- **THEN** the probe finds that sequence and the game passes

### Requirement: Every on-screen key a game offers reaches that game

For every game declaring `requestKeys`, the suite SHALL assert that each
returned button is one the game's `interpretMove` consumes somewhere on a real
board: on touch the key panel is the only character-entry route, so a panel
key that reaches nothing is an input a touch player cannot make. This is the
reverse direction of the emittable-key scan and neither substitutes for the
other: that scan asks whether a code a game tests can be sent, this whether a
code the frontend sends is received.

#### Scenario: A panel key the game ignores fails the suite

- **WHEN** a game's `requestKeys` returns a button its `interpretMove` never
  consumes
- **THEN** the guard fails, naming the key and the game

### Requirement: The on-screen key probe primes the board

The on-screen key probe SHALL prime the board before convicting a key: a
"Clear" key on an already-empty cell is a legitimate no-op. A key that is
genuinely unreachable SHALL be recorded in the guard as a finding under
management, naming the change that owns it, and SHALL NOT be silently
excluded.

#### Scenario: A clear key on an empty board is not a finding

- **WHEN** the probe tests a key whose only effect is to erase
- **THEN** it first writes something for that key to erase, and does not
  report the key as unreachable

### Requirement: The on-screen key panel is a second key emitter

A guard reasoning about which button codes this frontend can deliver SHALL
account for both emitters: `puzzleKeyMap` in the interactive view, and the
buttons a game's own `requestKeys` puts on the on-screen panel, which
`puzzle-keys` sends straight to `Puzzle.processKey`. The set SHALL be computed
per game, not as a union over the collection: the clear key's button is `8`,
which `puzzleKeyMap` never sends, so it is reachable only in a game that
offers it on its keypad.

#### Scenario: The clear key is emittable only where it is offered

- **WHEN** the scan evaluates a comparison against button `8`
- **THEN** it is accepted in a game whose `requestKeys` includes the clear
  key, and reported in a game that declares no keypad

### Requirement: One keyboard-cursor vocabulary across games

A game with a keyboard cursor SHALL hold it in the engine's shared cursor
shape, a position and a visibility flag, under the one canonical `Ui` field,
`cursor`, and SHALL NOT name either itself. The engine SHALL provide that shape
and the verbs for it: constructing one, moving it, revealing it and hiding it.

#### Scenario: A game's cursor is the shared shape

- **WHEN** a game has a keyboard cursor
- **THEN** its `Ui` holds a position and a visibility flag under `cursor`,
  and under no field of the game's own naming

### Requirement: One arrow press reveals the cursor and moves it

A plain arrow press SHALL reveal the cursor and move it, so a keyboard player
never spends a keypress on the reveal. A pointer press SHALL hide it. An arrow
that is itself an action on the board (a modified arrow that marks, a mode in
which the arrow slides the grid) SHALL NOT be required to act on a first press
on a hidden cursor, where the player cannot see where the action would land:
it reveals instead, and the plain arrow beside it SHALL still reveal and move.

#### Scenario: One arrow press both reveals and moves

- **WHEN** a player presses an arrow key on a board whose cursor is hidden
- **THEN** the cursor becomes visible and has moved one cell

#### Scenario: An arrow that acts on the board still reveals first

- **WHEN** a player presses a modified arrow that would mark or slide, on a
  board whose cursor is hidden, in a game that reveals before acting
- **THEN** the cursor becomes visible and the board is unchanged

### Requirement: What a game does while its cursor moves stays its own

What a game does while the cursor moves (painting, filling a line, refusing a
step) SHALL remain its own, and the shared shape SHALL NOT grow to cover it. A
different traversal (half-cell coordinates, corner-skipping, a lock mode)
SHALL stay per game, and a helper for one SHALL be named apart from the shared
verb so neither shadows the other. A game SHALL carry a flag beside the cursor
only for a real distinction the shared shape does not draw: which device
revealed it, what it is armed for.

#### Scenario: A game keeps what it does while moving

- **WHEN** a game paints or fills as its cursor traverses
- **THEN** that behavior is unchanged by the shared cursor shape, which
  reports only where the cursor is and whether it is visible

### Requirement: A cursor outside the canonical field fails the build

The engine SHALL fail the build for a cursor held anywhere but the canonical
field. That check SHALL find it structurally, by the shape read off the
engine's own constructor, over every game's real `newUi` output, and not by
matching names. A game SHALL NOT re-declare an engine cursor helper, which is
enforced from `pointer.ts`'s own export list.

#### Scenario: A cursor under any other field fails the build

- **WHEN** a game holds a cursor-shaped object under a field of its own naming
- **THEN** the guard fails, naming the game and the field, without having been
  told that name in advance

### Requirement: A game declines a button it did not act on

`interpretMove` SHALL return `null` for a button it did not act on, and the
suite SHALL assert that across every registered game by sending button codes
nothing in the vocabulary can mean. The collection-wide input guards ask their
questions by that return value, and the view raises `puzzle-key-unhandled`
exactly when a game declines a key, so a game that answers everything passes
those guards vacuously and takes the app's bare-letter shortcuts away from its
own players.

#### Scenario: A game answering a meaningless code is caught

- **WHEN** a registered game returns non-`null` for a button code the
  vocabulary cannot express
- **THEN** the guard fails and names the code, unless that game is on the
  ledger

#### Scenario: The keyboard-reachability guard stays sensitive

- **WHEN** a game that declines what it does not act on has its cursor-key
  handling removed
- **THEN** the keyboard-reachability guard fails for that game

### Requirement: A game claiming an unactionable code is on an exact ledger

A game that claims an unactionable code SHALL appear on an explicit ledger
whose entry states why, and the ledger SHALL be asserted exactly equal to the
set the sweep finds, so an entry cannot outlive the behavior it excuses.

#### Scenario: A fixed game cannot stay on the ledger

- **WHEN** a game on the ledger stops claiming unactionable codes
- **THEN** the guard fails until its entry is deleted

### Requirement: The collection's input guards share one behavioral probe

The questions the collection-wide input guards ask of a game SHALL live in one
shared module (`src/engine/testing/input-probe.ts`), and each guard SHALL ask
them through it and SHALL NOT carry its own copy. Every probe SHALL be
behavioral: it drives a real `Midend` over a real board through the same path
the frontend uses. No probe SHALL read a game's source, and none SHALL read a
declaration about a game: a game joins a population by having the behavior.

#### Scenario: A new guard inherits the probes

- **WHEN** a new collection-wide input guard is written
- **THEN** it obtains its board, probe points and questions from the shared
  module, and does not restate them

### Requirement: A probe sweeps what could differ

A probe whose answer depends on where a cursor happens to land SHALL walk the
cursor and SHALL NOT test one cell. A sweep of the board SHALL be dense enough
to land on a game's live targets, including targets that sit at arbitrary
points and not on a grid, and SHALL fail, not pass vacuously, when no probe
reaches one.

#### Scenario: A probe does not depend on the deal

- **WHEN** a probe's answer would differ according to which board a seed dealt
- **THEN** it sweeps the positions that could differ and does not assert from
  one

#### Scenario: Targets off the grid are reached

- **WHEN** a game's targets are vertices at arbitrary points of the board
- **THEN** the sweep's points land on them, where a coarse grid would miss
  every one

### Requirement: The engine answers which key is a digit, once

The engine SHALL provide `digitOf(button: number): number | null` in
`pointer.ts`: the digit `0`–`9` a button stands for, or `null` for any other
button. It SHALL look through the keyboard modifier bits, so a numpad digit
with Num Lock on (`MOD_NUM_KEYPAD | '7'`) reads as that digit: the keypad is a
convenience route to the same key, never a different one.

#### Scenario: A numpad digit enters the same value as the bare key

- **WHEN** a game reads `digitOf(MOD_NUM_KEYPAD | '5')`
- **THEN** it receives `5`, exactly as for the bare `'5'`

### Requirement: A game does not spell the digit keys itself

A game SHALL NOT spell the digit range itself: not as a comparison or
subtraction against the button (`48`, `0x39`, `button - 48`), not as a numeric
`case` in a `switch` on the button, and not as a local constant holding a
digit code that is then compared against the button.

#### Scenario: A hand-parsed digit fails the build

- **WHEN** a game source compares or offsets any value against a digit code,
  labels a `case` with one, or compares a character against a one-digit
  string with a relational operator
- **THEN** the guard reports the game and line, whatever the game named the
  value and wherever in its sources the line sits

### Requirement: The meaning of a digit key stays with the game

What a game does with the digit `digitOf` returns SHALL remain the game's: the
bound it accepts and the meaning it gives `0` (a clear, the value zero, ten,
sixteen, one more typed digit, a command) are answers about the puzzle,
written beside the call. A game that gives the numpad's digits another meaning
(a direction pad) SHALL resolve those before asking, as a
`MOD_NUM_KEYPAD | <digit>` binding does.

#### Scenario: The bound and the meaning of zero stay with the game

- **WHEN** two games read the same digit key
- **THEN** each applies its own bound and its own reading of `0` (Guess the
  tenth color, Bridges sixteen, Seismic a clear), with no such policy in the
  helper

### Requirement: A pointer drag over a grid has one name across the collection

A game whose `Ui` remembers where a pointer drag started and where it is now,
as a pair of integer coordinates, SHALL hold that in the engine's `GridDrag`
and not in fields of its own naming, the convention `GridCursor` carries for
the keyboard cursor. The engine SHALL own the anchor, the current position,
whether a drag is running, and the helpers that start, move and end one.

#### Scenario: a game asks whether a drag is running

- **GIVEN** a game that carries a `GridDrag`
- **WHEN** it needs to know whether a drag is in progress
- **THEN** it reads one field whose meaning is the same in every game
- **AND** it does not test a coordinate against a sentinel value of its own
  choosing

### Requirement: A drag's coordinate space and meaning stay with the game

A game carrying a `GridDrag` SHALL keep its own coordinate space, since a game
can legitimately work in cells, half-cells or any other unit, and SHALL keep
everything its drag means: what the press picked, what the release commits,
and its own `Move` type.

#### Scenario: two games with different coordinate spaces

- **GIVEN** one game whose drag is in grid cells and another whose drag is in
  half-grid coordinates
- **WHEN** both carry a `GridDrag`
- **THEN** neither is asked to change the space it works in

### Requirement: The engine cancels a drag the board changed under

The midend SHALL end every `GridDrag` on a game's `Ui` when it replaces the
game state, so a drag cannot act on a board that no longer holds what it was
aimed at. Membership SHALL be derived: the midend finds a drag by what the
`Ui` carries, never by a declaration a game makes about itself. A game that
needs a drag to survive a state change SHALL say so in its own `changedState`,
with its reason recorded; the engine's cancel runs first, so the game's hook
has the last word.

#### Scenario: an undo lands while a drag is live

- **GIVEN** a live drag on a game that declares no `changedState`
- **WHEN** the player undoes a move
- **THEN** the drag is no longer running
- **AND** the game needed to declare nothing to get that

### Requirement: Every committing path of a drag is gated on drag.live

A game carrying a `GridDrag` SHALL gate every committing path on `drag.live`,
and not on a secondary flag of its own, including any click path a release
falls through to when the drag half declines it. The engine can end only the
drag it can see: a release that keys off which button started the gesture, or
whether the drag has left its anchor, does not hear the cancel and commits a
move from a board that no longer exists.

#### Scenario: a release arriving after the board changed

- **GIVEN** a game whose drag is live, and a state replacement between the
  press and the release
- **WHEN** the player releases
- **THEN** no move is committed, by any path the release can take

### Requirement: The engine answers which character is a digit, once

The engine SHALL provide, in `decimal.ts`, `isDigit(c: string): boolean` and
`digitValue(c: string): number | null`: the value `0`–`9` a decimal digit
character stands for, or `null` for any other character. The absent case SHALL
sit outside the number domain, so no caller can use the result without
discriminating it. `digitValue` on a character, `c2n` on a desc character and
`digitOf` on a key SHALL agree on every digit, and a test SHALL hold them
equal.

#### Scenario: A character that is no digit has no value

- **WHEN** a caller reads `digitValue("7")` and `digitValue("x")`
- **THEN** it receives `7` and `null`

### Requirement: A game reads and writes a digit character through the engine

A game SHALL read a digit character through `isDigit` and `digitValue` and
SHALL write a single digit as `String(n)`. It SHALL NOT declare its own
`isDigit`, compare a character against a one-digit string with a relational
operator, subtract a digit code from a character code, or add one to build a
character. A hex nibble read case-insensitively (a bitmap of mines or lit
cells) is not a decimal digit and is read with `Number.parseInt(c, 16)`.

#### Scenario: A private copy fails the build

- **WHEN** a game source declares an `isDigit`, `digitValue`,
  `parseLeadingInt`, `n2c`, `c2n`, `n2cUpper`, `c2nUpper`, `scanRunLength` or
  `encodeRunLength` of its own
- **THEN** a guard reports it, the reserved names being read from the fact
  modules' own export lists

### Requirement: The meaning of a digit character stays with the game

What a digit character's value means SHALL stay with the game: the bound it
accepts and what an out-of-range value does (an error message, a sentinel, a
rejected desc) are written beside the call. A write into a typed array SHALL
name that array's own absent constant (`?? EMPTY`, `?? -1`) and SHALL NOT
inherit a codec's, and a write that is safe only because `validateDesc`
screened the character SHALL say so at the write.

#### Scenario: A run-length game reads a bounded clue

- **WHEN** Slant's `validateDesc` meets a value token
- **THEN** it reads `digitValue(tok.value)` and applies its own bound of `4`,
  rejecting `5` with its own message and a letter with its own message

#### Scenario: A stray character cannot be stored without a decision

- **WHEN** Filling's `newState` writes a clue into its `Uint8Array`, whose
  absent value is `0`
- **THEN** the write names `EMPTY` for a character that is not a digit, and a
  non-digit can never be stored as `255`

### Requirement: An on-screen key may name a palette color

The engine SHALL support an optional `swatch` on a `KeyLabel`: an index into
the palette of the game that returned it. The app SHALL paint such a key in
that color, resolved against the same palette the canvas is painted from, so a
key and the board cannot disagree under any color scheme. A key without a
`swatch` SHALL carry no color of its own. The `label` SHALL still carry the
character the key sends, so the swatch teaches the keyboard binding and does
not replace it.

#### Scenario: A color key is painted from the board's own palette

- **WHEN** a game returns a `KeyLabel` with a `swatch`
- **THEN** the on-screen key is painted in the color that palette index holds,
  and follows it when the color scheme changes

### Requirement: A swatch key is painted from the published palette

The resolved palette SHALL be published from the single point that hands it to
the drawing, and SHALL NOT be recomputed for the panel: a second derivation
fails silently, as a key in the last scheme's color. The label's ink on a
swatch key SHALL be chosen from the fill's own lightness and SHALL NOT be
fixed, since a fill light enough to take black text in one scheme is not in
the other.

#### Scenario: A swatch key stays legible in both schemes

- **WHEN** a palette index holds a light fill in one color scheme and a dark
  fill in the other
- **THEN** the key's label is inked to contrast with whichever fill it has

### Requirement: A color keypad is built by the shared builder

A keypad of color keys SHALL be built by the shared builder beside
`digitKeys`, `colorKeys`, and SHALL NOT be spelled out in the game: the button
codes are the decimal-digit fact, which the engine states exactly once and no
game restates.

#### Scenario: A four-color game builds its keypad

- **WHEN** a game builds its keypad with `colorKeys(4, firstColor)`
- **THEN** the keys send `'1'`–`'4'`, each carrying the swatch of its color in
  turn, and the clear key after them carries none

### Requirement: A color keypad may spell its tenth value zero

The engine SHALL offer a color keypad whose tenth key is `'0'`
(`colorKeysZeroIsTen`) alongside the one whose tenth key is `'a'`, and a game
SHALL choose between them and SHALL NOT spell either set of button codes
itself. A game that can go past ten values reads `'a'`; one whose colors stop
at ten reads `'0'`, which `digitOf` answers as zero. The builder SHALL be keyed
on there being a tenth value, not on the tenth entry existing: at nine values
that entry is the clear key.

#### Scenario: Ten values put zero last and keep Clear

- **WHEN** a zero-is-ten color keypad is built for ten values
- **THEN** its tenth key sends `'0'` and the clear key is still the last entry

#### Scenario: Nine values are the ordinary keypad

- **WHEN** the same builder is asked for nine values
- **THEN** the keys are `'1'`–`'9'` and the clear key is untouched

### Requirement: The engine owns the select-or-drag gesture, and the game supplies only what is about its puzzle

The note-taking cell SHALL provide the two arms a gesture ends in, so a game
whose press can become a drag writes no selection logic. A release that
committed nothing SHALL resolve through the tap arm, which maps the release
button back to its press and applies the rules a click-select game's press
applies, as the same code, not the same intent. A release that
committed a move SHALL resolve through the drag-entry arm, which moves the
highlight to the cell the pointer acted on and puts it away.

#### Scenario: Every member answers one gesture one way

- **WHEN** the collection is swept for the games carrying the mechanic's `Ui`
  fields, and each is driven through its own `interpretMove` with a pointer
  press and release
- **THEN** a repeat tap puts the highlight away in every one of them, unless
  the game answers the re-press some other way and records it, and a sticky
  right tap hides a showing highlight in none of them
- **AND** the sweep reports how many of its taps reached the sticky
  mode-switch branch, so a rule asserted over a sweep that never exercised it
  fails

### Requirement: The identity of a selection comes from the game

The identity of what is selected SHALL come from the game, as a convention
with a first-class override: the tap arm SHALL answer "is the highlight
already on the thing being tapped?" for itself when the game's selection is a
cell, and SHALL accept the game's own answer when it is not. A game whose
selection is a region SHALL NOT be a special case in the engine. Whether a
gesture committed SHALL stay the game's, as a question about the puzzle.

#### Scenario: A region selection is compared as a region

- **WHEN** two taps land on different cells of one region in a game whose
  selection is a region
- **THEN** they read as a repeat tap on one selection

#### Scenario: Two drag games decide differently whether a gesture committed

- **WHEN** Rome's drag returns to the square it grabbed, and Map's drop
  changes nothing
- **THEN** Rome reads a cancel, by direction, and Map a tap on the region it
  was released over, by effect, each by its own rule

### Requirement: A game offers a keypad exactly when touch play needs one to type

A game whose board carries a `pencil` array (the board arm of `takesNotes`,
exported as `hasPencilArray`) SHALL offer a non-empty `requestKeys`: its notes
are written by typing a symbol, and on touch the keypad is the only way to
type. A game that offers a keypad without such an array SHALL be named, with
the reason, in the input-parity guard's ledger. The guard SHALL check this per
game, as a biconditional, and SHALL NOT rely on a floor under the number of
keypad games.

#### Scenario: A keypad without a pencil array must be ledgered

- **WHEN** a game with no `pencil` array offers a keypad and is not on the
  ledger
- **THEN** that game's input-parity case fails and asks for a ledger entry
  with the reason

#### Scenario: A note-taking game that loses its keypad fails its own case

- **WHEN** a game whose board has a `pencil` array stops implementing
  `requestKeys`
- **THEN** that game's input-parity case fails, naming the pencil array as the
  reason it needs a keypad

### Requirement: Backspace clears wherever the panel's Clear does

Wherever a game's keypad offers the Clear key (`CLEAR_BUTTON`), the keyboard's
Backspace (`DELETE`) SHALL also reach that game.

#### Scenario: Backspace clears wherever the panel's Clear does

- **WHEN** a game's keypad offers the Clear key
- **THEN** a `DELETE` keypress is consumed by that game under the same probe
  that reaches its panel keys

### Requirement: Click-game input is declared as targets and verbs

The engine SHALL support an optional `Game.targetVerbs` declaration for a game
whose input is: aim at a target, and each button applies a verb there. It
holds a geometry (which target a press addresses, which one the cursor rests
on, how the arrows move the cursor) and a verb per button, each a function
from the state, a target and the player's `Ui` to the game's own `Move`, a
UI-only update, or nothing, with the words the help uses for it.

#### Scenario: A verb that means nothing on a target

- **WHEN** a button's verb is asked for a target it does not apply to, such as
  a clue square
- **THEN** the verb's function returns nothing, and the press makes no move

### Requirement: A declaring game hands its buttons to the engine

A game declaring `targetVerbs` SHALL hand the buttons it does not handle
itself to the engine's `interpretTargetVerbs`, and its help page SHALL carry
the Controls paragraph generated from the declaration.

#### Scenario: The help cannot describe a key the game does not bind

- **WHEN** a declaring game's help page is built
- **THEN** its Controls section carries the paragraph generated from its
  verbs, and a page carrying the placeholder for a game that declares none
  fails the build

### Requirement: A target and its cursor belong to the geometry

A target is whatever the game aims at: a square, an edge between two cells, a
clue beside the grid. Where the cursor is, and how the arrows move it, SHALL
belong to the geometry, and the engine SHALL read only whether the cursor
shows. The declaration SHALL also admit a verb reached only by keys, with no
button.

#### Scenario: A game aims at an edge

- **WHEN** a declaring game's target is an edge between two cells
- **THEN** its geometry says which edge a press addresses and which the cursor
  rests on, and the engine reads from the `Ui` only whether the cursor shows

### Requirement: The engine owns a declaring game's press and select keys

For every `targetVerbs` game the engine SHALL own that: a pointer press
parks the cursor, hidden, on the target it pressed; the first select key
on a hidden cursor only shows it; a press that applies nothing is a repaint
only when it hid a shown cursor; Enter applies the left-click verb, Space the
right-click verb, or the left-click verb when the game has no second one; and
a verb's own keys apply that verb. Space SHALL NOT be bound to another verb: a
verb that wants a key is given its own.

#### Scenario: The first select only shows the cursor

- **WHEN** Enter is pressed in a declaring game whose cursor is hidden
- **THEN** the cursor shows and no verb is applied, and the next Enter applies
  the left-click verb at the cursor

### Requirement: A verb is the game's function, and other input is the game's own arm

A verb's semantics SHALL be the game's function, never a flag on the model.
Input beyond the verbs SHALL be an arm of the game's own `interpretMove`,
tried before the hand-off to `interpretTargetVerbs`. An arm that resolves a
press on its release SHALL call the same verb functions the model calls, so
the model owns no release hook.

#### Scenario: An arm that disagrees with its verb fails

- **WHEN** a declaring game handles Space in an arm of its own that applies a
  different verb from its right-click
- **THEN** the guard fails for that game

### Requirement: A declared verb is held to what its buttons and keys do

A cross-game guard SHALL hold a `targetVerbs` declaration to the behavior: for
every declaring game, the boards a select key reaches at every cursor position
the arrows reach that rests on a target SHALL equal the boards its button
reaches at every point on the board, since that is what the generated
paragraph tells the player. A position resting on no target belongs to an arm
and is walked through without being pressed at.

#### Scenario: Enter does what the click does

- **WHEN** a declaring game is probed from its opening position
- **THEN** Enter at every reachable cursor position resting on a target
  reaches exactly the boards a left-click at every board point reaches, and
  Space those of the right-click, or of the left-click when there is no right
  verb

#### Scenario: A key-only verb reaches the board

- **WHEN** a declaring game has a verb reached only by keys
- **THEN** each of its keys reaches some board from a primed position, or the
  guard fails

### Requirement: A game reads one pointer with two buttons

The frontend SHALL deliver a pointer to a game as a left button and a right
button only, the same from a mouse, a finger and a pen: a click or a tap is
`LEFT_BUTTON`, a right-click or a long press is `RIGHT_BUTTON`, and a drag
from either is that button's drag and release. Nothing a game receives SHALL
say which device pressed. The frontend's tests SHALL assert this on the codes
a game receives.

#### Scenario: A tap sends what a click sends

- **WHEN** the board is pressed and released by a mouse, a finger or a pen
- **THEN** the game receives `LEFT_BUTTON` and `LEFT_RELEASE` in each case,
  with no other bits

### Requirement: The engine has no middle button

The engine SHALL NOT export middle-button codes, and the frontend SHALL drop a
middle-button press: many touchpads cannot send one and a finger has nothing
like it.

#### Scenario: The middle button does nothing

- **WHEN** the middle mouse button is pressed on the board
- **THEN** the game receives nothing

### Requirement: A key held with a press changes nothing

The frontend SHALL send a pointer press, drag and release with no modifier
bits, and SHALL NOT turn a press into another button because a key is held.
Modifiers on keys (Shift+arrow, Ctrl+arrow) are keyboard gestures and are
unaffected.

#### Scenario: A held key changes nothing

- **WHEN** a left or right press is made with Shift, Ctrl or Command held
- **THEN** the game receives exactly what it receives for the same press with
  no key held

### Requirement: No bit marks a press as a finger's

No bit SHALL mark a press as a finger's or a pen's, and `Game` SHALL carry no
flag asking for one. A game therefore cannot give touch a control scheme of
its own, and cannot compare a raw button that a finger's press would fail to
match.

#### Scenario: A touch press reaches every game as the mouse's

- **WHEN** a finger presses the board of any registered game
- **THEN** the game's `interpretMove` receives the button code a mouse press
  sends, with nothing to strip before comparing it against `LEFT_BUTTON`

### Requirement: Every action is reachable with the two buttons alone

Every action a game offers SHALL be reachable with the two buttons alone, by
clicks and drags, as well as from the keyboard. Where a game has more actions
than buttons, the extra one SHALL go into a mode the player turns on or onto
the on-screen keypad. A clear or a reset that a button cycle already passes
through needs no control of its own; a key kept for it is a keyboard
convenience.

#### Scenario: A third action has a pointer's way to it

- **WHEN** a game offers an action beyond what its two buttons do
- **THEN** a player with only a pointer reaches it through a mode they turn on
  or through a key on the on-screen keypad

### Requirement: A pointer route is a repeat, a cycle or a notes-mode press

A target-verb game's key-only verb SHALL declare how a pointer alone reaches
the same move, as a `pointer` route its type requires. The route SHALL be one
of: the verb's target pressed
with a button a stated number of times (`repeat`); pressed with a button until
its cycle reaches the verb's result (`cycle`); or pressed with a button in
notes mode, at a stated place on the target where the game reads where the
press lands (`notes`).

#### Scenario: Net declares a repeat and a notes-mode press

- **WHEN** Net declares its half turn and its lock as key-only verbs
- **THEN** the half turn's route is the left button pressed twice, and the
  lock's is a left press in notes mode on the middle of the square

### Requirement: The Controls paragraph states a key-only verb's route

The Controls paragraph generated from a `targetVerbs` declaration SHALL state
each key-only verb's route beside its keys, so the help cannot describe a key
without the pointer's way to the same move.

#### Scenario: The paragraph names the route

- **WHEN** a declaring game's Controls paragraph is generated
- **THEN** each key-only verb's sentence ends with its route, such as "or
  click it twice" for Net's half turn

### Requirement: A declared route is held to its keys

A guard SHALL hold every declared `pointer` route to its keys, comparing
boards by what the player sees and not by the state, since a state can record
what a move leaves invisible. For `repeat`, the boards the keys reach at every
cursor target SHALL equal those the route reaches at every board point; for
`cycle` and `notes`, every board the keys reach SHALL be one the route passes
through. An arm of a game's own, outside the model, is not
covered: its keys and gestures are the game's to match.

#### Scenario: A route that does not make the key's move fails

- **WHEN** Net's half turn declares three presses instead of two, or its lock
  declares a button cycle instead of a notes-mode press
- **THEN** the guard fails for Net, naming the verb

### Requirement: A target geometry can say where to press for a target

Every `TargetGeometry` SHALL provide `pointAt(state, ds, target, ui)`, a point
whose press addresses `target`, so a hint's gesture can aim at a target of the
model. A guard SHALL hold, for every declaring game and every target a press
on its default board reaches, that a press at the target's `pointAt` addresses
that same target.

#### Scenario: A point that presses a neighbor fails

- **WHEN** a geometry's `pointAt` returns a point inside a neighboring target
- **THEN** the guard fails for that game, naming the target and the point

### Requirement: A drag on from a press repeats the press

A `Game.targetVerbs` declaration SHALL admit an optional sweep: what a target
holds, as a value the engine compares. For such a game a drag on from a press
SHALL repeat that press: each further target the pointer passes over that
holds what the pressed target held before its press SHALL get the pressed
button's verb, and a target that holds anything else SHALL be passed over, so
a drag paints the press's result and never toggles along a row. A press whose verb made no move SHALL open no drag.

#### Scenario: A drag paints and does not toggle

- **WHEN** the player presses an empty square of a declaring game, which marks
  it, and drags across an empty square, a marked square and another empty
  square
- **THEN** the two empty squares take the same mark and the marked square is
  left as it was

### Requirement: A sweep honors its declared limits and skips no target

The engine SHALL honor a sweep declaration that limits the drag to some
buttons, to some targets given the first, and to targets the pointer passes
within a stated distance of the point that addresses them, which keeps a drag
along a line of edges from taking the edges that meet it at each corner. The
engine SHALL take every target between two pointer events, so a fast drag
skips none.

#### Scenario: A fast drag takes what it passed over

- **WHEN** one pointer event of a drag arrives several targets on from the
  last
- **THEN** every target between them that held what the first held gets the
  verb

### Requirement: A game whose own arm takes the press reaches the same drag

A game that declares a sweep and whose own arm takes the press SHALL reach the
same drag through the engine's helpers, and where its click acts on the
release, the pressed target's verb SHALL be applied when the drag reaches a
second target.

#### Scenario: A click that acts on the release still drags

- **WHEN** a game whose click acts on the release is pressed on a target and
  dragged to a second target holding the same thing
- **THEN** both targets get the pressed button's verb

### Requirement: One drag is one step of Undo

The midend SHALL treat the moves of one drag as one step: one Undo takes all
of them back and one Redo replays all of them. The grouping is not saved; a
reloaded game undoes such a drag a move at a time.

#### Scenario: One Undo takes a drag back

- **WHEN** a drag has marked four targets and the player presses Undo once
- **THEN** all four are as they were before the press
- **AND** one Redo marks all four again

### Requirement: A declared sweep is held to what a drag does

The generated Controls paragraph SHALL say the drag for a game that declares a
sweep. A cross-game guard SHALL hold the declaration to the behavior: for
every game declaring a sweep, and each button it names, a drag between two
targets that hold the same thing leaves both holding the press's result, and
one Undo returns the board to where the press found it. A draggable mark
declared outside `targetVerbs` SHALL be held to the same check.

#### Scenario: A game that drops its drags fails

- **WHEN** a game declares a sweep and its `interpretMove` never hands a drag
  event to the engine
- **THEN** the guard fails for that game

#### Scenario: A drag-mark declaration that does not drag fails

- **WHEN** a mark declared with `dragMarkVerbs` is dragged between two targets
  that hold the same thing
- **THEN** the check fails unless both hold the mark and one Undo takes both
  back

### Requirement: A mark a player wants on several targets can be dragged

A button whose verb is a mark (a shade, a cross, a flag, a wall, a line, a
note, a clue marked done) SHALL be repeated by a drag wherever a drag on that
kind of target is not already another gesture of the game. A game SHALL
declare this and SHALL NOT write a drag of its own for it.

#### Scenario: A flag is dragged and a square is not opened

- **WHEN** the player right-drags across three covered squares in Mines
- **THEN** all three are flagged, and one Undo unflags all three
- **AND WHEN** the player left-drags across covered squares
- **THEN** no square is opened by the drag

### Requirement: A draggable mark is declared as a sweep or as drag-mark verbs

A game SHALL declare a draggable mark as its `targetVerbs.sweep`, or, where
its input is not target-verb or the mark exists beside it (a clue marked done
beside cells that take a keypad, a mark of notes mode, the one button a drag
game's own drag does not use), as the engine's verbs for one draggable mark
(`dragMarkVerbs`), opened and continued through the same helpers. A drag
opened on one declaration SHALL NOT be carried on with another.

#### Scenario: A clue marked done is dragged

- **WHEN** the player presses a clue beside a Towers grid, marking it done,
  and drags along the clues beside it
- **THEN** each clue passed that was not done is marked done

### Requirement: A drag does not repeat a move

A drag SHALL NOT repeat a verb that is a move (a rotation, a slide, a beam
fired, a square opened) or a mark never wanted in a row (Light Up's bulb).
Where a game's drag is its own gesture on that target (Rect's rectangle,
Bridges' bridge, Spokes' spoke, Map's color, Rome's arrow, Loopy's pair note
in notes mode, Tents' link on the left button), the click SHALL stay one mark
a press.

#### Scenario: A drag that is the game's own gesture leaves the click alone

- **WHEN** a drag on a kind of target is already a gesture of the game's own
- **THEN** a click on such a target makes one mark, and the engine repeats
  nothing along the drag
