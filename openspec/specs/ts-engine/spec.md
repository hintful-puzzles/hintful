# ts-engine Specification

## Purpose
The core of the native-TypeScript puzzle engine every game runs on: the
idiomatic `Game` interface each game implements, the `Midend` that drives one
behind the worker's Comlink surface, the registry, the save format,
preferences, a board's history, status and timer, Solve and mistake-checking,
and the rule that a game joins a shared mechanic by having it.

The shared layer's subjects each have a capability of their own beside this
one: `engine-hints` and `engine-candidate-hints`, `engine-input`,
`engine-params`, `engine-difficulty`, `engine-notes`, `engine-colors`,
`engine-drawing` and `engine-helpers`. A requirement about one of those
subjects belongs there, and this capability holds what is about no one of them.

## Requirements

### Requirement: The native engine defines one idiomatic `Game` interface that every port implements

The engine SHALL define a single `Game` interface that every game implements,
generic over the game's parameter, state, move, UI and draw-state types. The
interface SHALL NOT require manual duplicate or free of game values, SHALL NOT
pass opaque handles, and SHALL use union and boolean types in place of integer
sentinels: a game-status union, not the sign of an int.

#### Scenario: Game status is a typed union

- **WHEN** the engine asks a game for its status
- **THEN** the answer is a member of the shared game-status union (`ongoing`,
  `solved`, `solved-with-help` or `lost`), not an integer whose sign encodes
  win or loss

### Requirement: Applying a move returns a new state

The `Game` interface SHALL use immutable state transitions: applying a move
SHALL return a new state value and SHALL NOT mutate the state in place.

#### Scenario: A move is applied

- **WHEN** a game's `executeMove` is applied to a state
- **THEN** it returns a new state value, with no in-place mutation and no
  explicit free of the prior state

### Requirement: A game depends on the `Game` interface and never on the midend

A game SHALL depend on the `Game` interface only and SHALL NOT call the midend
directly. The interface is the sole contract between a game and the engine.

#### Scenario: A game is written against the interface

- **WHEN** a game is implemented
- **THEN** it implements `Game` with its own parameter, state and move types
- **AND** it does not reference the midend implementation

### Requirement: The TS midend orchestrates a game behind the existing Comlink surface

The engine SHALL provide a midend that owns, per live game: the selected
`Game`, its parameters, the move, undo and redo history, the UI and draw state,
the random source its deals draw from, timer bookkeeping, and preset and
configuration handling.

#### Scenario: A move is made, undone and redone

- **WHEN** a player makes a move, undoes it and redoes it
- **THEN** the midend's history supplies each position, and the game is handed
  the state, the UI and the draw state on each call

### Requirement: The midend provides the app-facing surface and its notifications

The midend SHALL provide the app-facing Comlink surface, whose shape
`PuzzleEngineSurface` states: new game, new game from ID, restart, key and
mouse input, undo, redo, solve, redraw, presets, status, serialize and
deserialize, and timer. It SHALL emit the change notifications the app
consumes. The app shell, screen, dialog, drawing-canvas and store code SHALL
NOT require changes to drive a game.

#### Scenario: A game is driven through the app surface

- **WHEN** the app opens a game
- **THEN** it drives it through the Comlink surface and the change
  notifications
- **AND** no app-shell, screen, dialog, drawing-canvas or store code changes to
  make that so

### Requirement: Per-game engine selection is a runtime registry, not a build flag

The engine SHALL resolve a game's implementation at runtime through a registry
keyed by `puzzleId`, populated by `registerGame(...)` side effects, never
through a build flag and never per game at build time. A `puzzleId` absent from
the registry is unplayable: the worker SHALL fail explicitly for it and SHALL
NOT fall through to another implementation.

#### Scenario: An unregistered puzzle id fails explicitly

- **WHEN** the worker is asked for a `puzzleId` with no registered `Game`
- **THEN** it raises an error naming the id
- **AND** no fallback implementation is attempted

### Requirement: The registry and the catalog hold the same games

The registry SHALL agree with the catalog exactly, in both directions: every
cataloged game is registered, and every registered game is cataloged. A test
SHALL assert it, because the registry is the only answer to which games exist.

#### Scenario: Catalog and registry cannot drift

- **WHEN** a game is added to the catalog but not registered, or registered but
  not cataloged
- **THEN** the gate fails

### Requirement: The engine uses a clean TS-native save format

The midend SHALL serialize and restore a game in a versioned TypeScript-native
envelope carrying the puzzle id, the parameters, the board's description, the
move list, the cursor in it and the timer's elapsed time. Restoration SHALL
rebuild the history by replaying the saved moves, and a restored game SHALL
have the same state and history as the saved one. The format SHALL NOT be
required to match upstream's `midend_serialise` format, and a save in that
format SHALL NOT be required to load.

#### Scenario: Save/restore round-trips

- **WHEN** a game is saved and then restored from that data
- **THEN** the restored game has identical state, move history, and redo
  availability
- **AND** the saved payload carries a format version field

#### Scenario: C-format save is not required to load

- **WHEN** a payload in upstream's serialization format is presented to the
  midend
- **THEN** the midend is not required to load it
- **AND** this is not treated as a defect

### Requirement: The save envelope records the solver's use and not the solve

The envelope SHALL carry the midend's record that the solver was used, as
`cheated`, and SHALL NOT carry whether the board was solved, which the restored
position says ("A game's status is judged from the board alone"). A key an
older envelope carries that the current shape does not read, such as
`timerStopped`, SHALL be ignored and SHALL NOT cause the envelope to be
rejected.

#### Scenario: An older save carries a key no longer read

- **WHEN** an envelope that is otherwise of the current shape carries
  `timerStopped`
- **THEN** it loads, and the key has no effect

### Requirement: A save version bump comes with an upgrade, not a rejection

Whenever an older envelope version carries the same facts, the decoder SHALL
lift it to the current shape before validating it, so an existing save keeps
working. The validator SHALL then describe only the current shape, so it cannot
drift into blessing both. An envelope the decoder cannot lift, a future version
or an older one whose fields are missing or malformed, SHALL be rejected.

#### Scenario: An older envelope is upgraded, not discarded

- **WHEN** a save written under an earlier envelope version is loaded
- **THEN** it is lifted to the current shape and restores normally
- **AND** a retired field name is gone from the result, not carried alongside
  the new one

#### Scenario: An envelope that cannot be lifted is still rejected

- **WHEN** the payload names a version the decoder does not know, or an older
  version whose fields are missing or of the wrong type
- **THEN** decoding fails

### Requirement: Midend correctness is established by behavioral tests, not a corpus

Midend correctness SHALL be established by behavioral and property tests driven
by a small in-repo fake `Game`, and SHALL NOT be established by a
byte-identical characterization corpus. The suite SHALL cover undo and redo
invariants, history truncation after a move following an undo, status
transitions, change-notification emission, timer accumulation, preset-tree
parsing, and save and restore round-tripping.

#### Scenario: The midend is validated without a golden corpus

- **WHEN** the engine layer is tested
- **THEN** its tests drive a fake `Game` and assert behavioral invariants,
  including `undo` after a move restoring the prior state
- **AND** no characterization corpus is required for the midend to be accepted

### Requirement: The `Game` drawing, color, and input-feedback contract is fully specified

The engine SHALL specify in full the drawing surface, the UI-only input
feedback and the color derivation of the `Game` contract. `GameDrawing` SHALL
expose the full puzzle drawing API: filled rectangle, line, polygon, circle,
text, clip and unclip, start and end draw, draw-update, and the blitter
save/restore quartet, with the coordinate and palette-index semantics the
canvas drawing surface honors. The canvas `Drawing` SHALL satisfy `GameDrawing`
structurally without modification.

#### Scenario: A game draws through the full surface

- **WHEN** a registered game's `redraw` runs
- **THEN** it can use rectangles, lines, polygons, circles, text, clipping and
  blitters through `GameDrawing`
- **AND** the canvas drawing implementation services them with no change to
  that implementation

### Requirement: The engine imposes no redraw policy

The engine SHALL NOT impose a full-versus-incremental redraw policy. Redraw
optimization, such as per-element diffing and first-draw-only setup, is the
game's own concern.

#### Scenario: A game diffs its own frame

- **WHEN** a game's `redraw` repaints only the elements that changed since its
  last frame
- **THEN** the engine neither requires nor prevents it

### Requirement: A UI-only input redraws without a history entry

`interpretMove` SHALL be able to report a UI-only change, cursor or other UI
state changed in place, distinctly from a move and from nothing having
happened. On a UI-only result the midend SHALL redraw and notify without
creating a history entry; on nothing having happened it SHALL do nothing; on a
move it SHALL apply the move to the history.

#### Scenario: A UI-only input redraws without a history entry

- **WHEN** input changes only UI state, such as moving a keyboard cursor
- **THEN** the engine redraws and emits a state notification
- **AND** undo offers no extra step for that input

### Requirement: A game derives its palette from the host background

A game's `colors` SHALL receive the frontend's default background, as the
engine hands it to every game, and the engine SHALL thread that default from
the worker surface through the midend to the game, so a game can derive its
palette from the host background.

#### Scenario: Palette is derived from the host background

- **WHEN** the app requests the color palette with its default background
- **THEN** the game is handed a background derived from it and returns a
  palette derived from that, not from a hardcoded background

### Requirement: The worker exposes one shared puzzle-engine surface

The worker SHALL expose exactly one puzzle-engine implementation, the
TS-midend-backed puzzle, behind the `PuzzleEngineSurface` interface the app
drives over Comlink, and its dispatch SHALL always construct that engine and
SHALL NOT choose between implementations. The worker SHALL hold no
C/WASM-backed implementation, no WASM-instantiation path and no leaf-bridge
coherence check. `PuzzleEngineSurface` SHALL state the shape of the app-facing
remote puzzle type.

#### Scenario: The worker constructs the TS engine unconditionally

- **WHEN** the worker opens any game
- **THEN** it constructs the TS-midend-backed puzzle
- **AND** there is no C/WASM implementation or WASM-coherence check to select
  between

### Requirement: The midend reconciles persisted Ui across state transitions

The `Game` interface SHALL provide an optional
`changedState(ui, oldState, newState)` hook, by which a game derives any
persisted Ui that tracks the current state. The midend SHALL invoke it,
mutating the live `ui` in place, after every real state transition it
processes (a move, undo, redo, solve and restart), and once at new-game setup
with `oldState = null`. For a game that omits the hook, the midend SHALL treat
it as a no-op.

#### Scenario: The hook fires on undo and redo

- **WHEN** the midend processes an undo or a redo
- **THEN** it calls `changedState(ui, prevState, restoredState)`, so a Ui that
  tracks state is rebuilt for the restored position

### Requirement: `changedState` runs before the animation is timed and the frame is painted

The midend SHALL invoke `changedState` before computing the animation and
flash durations of the transition and before the post-transition repaint, so
the reconciled Ui is what the frame and the next input see.

#### Scenario: The hook fires on a move and reconciles the Ui

- **WHEN** the midend applies a move that produces a new state
- **THEN** it calls `changedState(ui, prevState, newState)` before the repaint,
  and the mutated `ui` is the one passed to `redraw`

### Requirement: `changedState` is not called on a UI-only update

The midend SHALL NOT invoke `changedState` on a bare `UI_UPDATE`: no state
changed, and the player is mid-edit.

#### Scenario: The hook does not fire on a UI-only update

- **WHEN** `interpretMove` returns `UI_UPDATE`
- **THEN** the midend repaints without calling `changedState`, and the
  persisted Ui is left exactly as `interpretMove` mutated it

### Requirement: The engine supports per-game user preferences

The `Game` interface SHALL define an optional declarative `prefs` member: an
ordered list of preference items, each carrying a stable keyword (`kw`), a
human-readable `name`, a discriminated `type` (`"boolean"`, or `"choices"`
with its ordered choice labels in `choices`), and `get` and `set` accessors
that read and write the value on the game's `Ui`, so `interpretMove` and
`redraw` see it. A game with no preferences SHALL omit `prefs`.

#### Scenario: A game declares preferences and the app drives them unchanged

- **WHEN** a registered game declares a `prefs` list and the player opens the
  puzzle preferences form
- **THEN** `getPreferencesConfig()` returns a `ConfigDescription` whose items
  reflect the declared keywords, names, types and choice labels
- **AND** `getPreferences()` returns the current value of each preference, read
  from the live `Ui`

### Requirement: A game with no preferences of its own reports only the engine's

For a game that omits `prefs`, the engine SHALL report no preference but its
own `show-timer` ("Every game has a solve timer, and it runs while the board is
undecided"), with no error.

#### Scenario: A game with no preferences of its own

- **WHEN** the engine is asked for the preferences of a started game that omits
  `prefs`, such as Flip
- **THEN** `getPreferencesConfig()` returns the one item `show-timer`, and
  `getPreferences()` returns its value alone

### Requirement: The midend translates preferences to the app's config shapes

The `Midend`, and the `EngineCore` surface it implements, SHALL expose
`getPreferencesConfig()`, `getPreferences()` and `setPreferences(values)`,
translating `prefs` to and from the app's `ConfigDescription` and
`ConfigValues`: a `boolean` item is a boolean value, and a `choices` item is
the selected zero-based index. `TsWorkerPuzzle` SHALL delegate the three to
the engine, so the app's `puzzle-preferences-form` and per-puzzle persistence
drive a game's preferences with no app-shell change.

#### Scenario: A choice preference crosses the surface as an index

- **WHEN** the app reads a game's `choices` preference whose second label is
  selected
- **THEN** `getPreferences()` reports it as `1`

### Requirement: `setPreferences` applies the keys it is given and repaints in full

`setPreferences` SHALL apply only the keys present in the supplied values,
leaving the others unchanged, SHALL coerce each value to its item's type, and
SHALL force a full repaint, dropping the per-frame draw cache as for a palette
or font change, since a preference changes rendering without moving the board.

#### Scenario: A preference change repaints even when no board state moved

- **WHEN** the player toggles a preference that affects only rendering, such as
  Untangle's vertex style, changing no vertex position
- **THEN** the new value is written onto the `Ui` and the new appearance shows
  at once, not skipped by the game's redraw early-out

### Requirement: A preference survives a new board

The midend SHALL retain the last-applied preference values and SHALL re-apply
them after each recreation of the `Ui`, which `newUi` rebuilds on every new
game, load and game from ID.

#### Scenario: A preference survives a new game

- **WHEN** the player changes a preference and then starts a new game of the
  same puzzle
- **THEN** the freshly created `Ui` carries the player's chosen values, not
  just the `newUi` defaults

### Requirement: Preferences are not part of a save

Preferences SHALL NOT be written into the save file: they are app-level,
persisted per puzzle by the settings store. The engine SHALL NOT carry a
binary `savePreferences`/`loadPreferences` surface, and an import or export
feature SHALL choose its own wire format.

#### Scenario: A save is loaded under other preferences

- **WHEN** a game is saved, a preference is changed and the save is loaded
- **THEN** the loaded board is shown under the preference as it now stands

### Requirement: The midend retains generator aux info for Solve

The `Midend` SHALL retain the solver-shortcut `aux` a game's `newDesc` returns
and pass it to the game's `solve(orig, curr, aux)`. The `aux` SHALL be retained
for a freshly generated game: both `newGame` and a random `<params>#<seed>` id.
It SHALL be cleared for a descriptive `<params>:<desc>` id and for a loaded
save, where none is available, so a game whose solver requires aux reports the
solution as unknown for those.

#### Scenario: Solve uses the generator's aux on a freshly generated game

- **WHEN** a game is started from `newGame` or a `#seed` id and the player
  invokes Solve
- **THEN** the midend passes the retained `aux` to the game's `solve`, and a
  game that uses it solves the board

#### Scenario: Solve is unavailable on a loaded game

- **WHEN** a game requiring aux for Solve is loaded from a save and the player
  invokes Solve
- **THEN** the midend passes no aux and the game reports the solution is not
  known, leaving the board unchanged

### Requirement: The Untangle port exposes its three preferences via the hook

Untangle SHALL expose three preferences through `prefs`, under the keywords
`snap-to-grid` (boolean), `show-crossed-edges` (boolean) and `vertex-style` (a
two-way choice, Circles or Numbers). Its `newUi` SHALL set the defaults:
show-crossed-edges on, since it doubles as the built-in mistake feedback,
snap-to-grid off, and vertex-style Circles.

#### Scenario: Untangle preferences round-trip through the engine

- **WHEN** `getPreferencesConfig()` is called for Untangle
- **THEN** it returns two booleans and one two-way choice of the game's own,
  beside the engine's `show-timer`, and `getPreferences()` reports
  show-crossed-edges true by default
- **AND** `setPreferences({ "show-crossed-edges": false })` turns off the
  crossed-edge highlight and repaints, leaving the others unchanged

### Requirement: The app shell shows a non-blocking, responsive reference panel

The app shell SHALL render a reference control in the same toolbar button group
as Hint, shown only when `hasReference` is true. Activating it SHALL toggle a
`<reference-panel>` open and closed like a disclosure, not a one-shot modal.
The panel SHALL be non-blocking and SHALL keep the board visible and
interactive while open, in both of its layouts.

#### Scenario: The control appears only for a reference-bearing game

- **WHEN** the active game reports `hasReference` true
- **THEN** a reference toggle button is shown next to Hint; for a game
  reporting false, no such button is shown

#### Scenario: The panel keeps the board interactive and updates live

- **WHEN** the panel is open and the player places or removes a piece on the
  board
- **THEN** the board input is unaffected by the panel, and the panel's
  checklist status reflects the new board without being reopened

### Requirement: The reference panel docks beside the board or presents as a bottom sheet

Where there is room to dock, a wide viewport that is not in the app's
short-landscape "horizontal" orientation, the panel SHALL dock beside the
board, the board reflowing to make room, with no scrim over the board. On a
narrow viewport, or in the "horizontal" orientation, where a side dock would
push the board off-center against the toolbar column, the panel SHALL present
as a bottom sheet, leaving the board visible and centered above it, with an
explicit close affordance and no scrim.

#### Scenario: A short landscape screen

- **WHEN** the panel is opened in the app's "horizontal" orientation, however
  wide the viewport
- **THEN** it is a bottom sheet with a close affordance, and the board stays
  centered above it

### Requirement: The reference panel renders each item and selects on a click

The panel SHALL render each `ReferenceItem` with status-distinct styling,
drawing `pips` as piece faces when present and `label` otherwise, and SHALL
reflect found status live as the board changes. A click on an item SHALL toggle
its selection and call `selectReference` with the item's `key`, or `null` when
deselecting. Selection feedback in the list SHALL be immediate and SHALL NOT
wait on the asynchronous model refresh.

#### Scenario: Clicking an item spotlights it on the still-visible board

- **WHEN** the player clicks an outstanding item in the open panel
- **THEN** the item shows as selected immediately, and the board, still visible
  beside or above the panel, highlights that item's occurrences
- **AND** clicking it again clears the highlight

### Requirement: The board spotlight persists when the reference panel is closed

Closing the panel SHALL NOT clear the board spotlight. Acting on the board
SHALL clear it: a game clears it in `interpretMove` on any board tap. The
Escape key SHALL clear it whether the panel is open, which stays open, or
closed, and clicking the selected item again SHALL clear it.

#### Scenario: The spotlight persists after close

- **WHEN** a reference item is spotlighted and the player closes the panel
- **THEN** the board spotlight remains, so the player can act on it with the
  panel out of the way

#### Scenario: Escape clears the spotlight

- **WHEN** a reference item is spotlighted and the player presses Escape, with
  the panel open or closed
- **THEN** the spotlight is cleared, and an open panel deselects its item and
  stays open

### Requirement: The engine serializes Ui state a move-log replay cannot reconstruct

The engine SHALL support optional `encodeUi(ui): string` and
`decodeUi(ui, encoded): void` hooks on `Game`. The midend SHALL write
`encodeUi(ui)` into the save envelope's `ui` field when the hook is present,
and SHALL restore it through `decodeUi` after rebuilding state 0 and replaying
the move log on load: replay goes through `executeMove` and never
`interpretMove`. A game without the hooks SHALL save no `ui` field, and its
`Ui` SHALL be rebuilt from `newUi` and the replay alone.

#### Scenario: A persistent Ui counter survives a save

- **WHEN** a game with `encodeUi` and `decodeUi` accumulates ui-only state,
  such as Mines' death count, is saved and is reloaded
- **THEN** the reloaded game shows the same ui-only state, though the move log
  alone does not hold it

### Requirement: The midend reports a game's saveable Ui with every state change

The midend SHALL report the game's current `encodeUi` encoding to the app on
the `game-state-change` notification, as `uiState`, for a game that has the
hook and not otherwise. It SHALL report the encoding and not a flag that the
Ui changed, so the value the app compares is the part of the save that would
differ: the app saves when something it watches changes, and a `Ui` edit is
not a move.

#### Scenario: A game's saveable Ui is reported with every state change

- **WHEN** a game declaring `encodeUi` reaches any state change
- **THEN** the `game-state-change` notification carries that game's current
  encoding, and a game declaring no `encodeUi` carries none

#### Scenario: A Ui edit that is not a move is reported

- **WHEN** a player composes part of a Guess row, which is a `UI_UPDATE` and
  not a move
- **THEN** the reported encoding changes, while moving the keyboard cursor,
  which the save does not record, leaves it unchanged

### Requirement: The engine owns its type vocabulary and depends on nothing above it

The engine's shared puzzle vocabulary SHALL live under `src/engine/` and SHALL
be imported from there by the app; it SHALL NOT live in the app layer and be
imported upward by the engine and the games. The vocabulary is `Color`,
`Point`, `Size`, `Rect`, `KeyLabel`, `PresetMenuEntry`, `DrawTextOptions`,
`ConfigDescription` and the change notifications the engine emits.

#### Scenario: The app consumes the engine's vocabulary

- **WHEN** a Lit component or the main-thread `Puzzle` needs `Rect` or
  `PresetMenuEntry`
- **THEN** it imports them from the engine, the dependency running from the app
  to the engine

### Requirement: The Comlink adapter lives on the app side of the seam

The Comlink-facing adapter, `TsWorkerPuzzle`, which implements
`PuzzleEngineSurface`, SHALL live in `src/puzzle/` and SHALL NOT live inside
`src/engine/`. It presents the engine in the shape the app's `Puzzle` expects,
and an adapter belongs with what it adapts to.

#### Scenario: The adapter needs an app type

- **WHEN** `TsWorkerPuzzle` imports the app's drawing canvas
- **THEN** no module under `src/engine/` imports upward on its account

### Requirement: The engine and the games import nothing above them, with no exception

The layering invariant of the `repo-layout` capability, that the engine and the
games import nothing under `src/` outside their own two directories, SHALL hold
with no exceptions and no allowlist, and SHALL be checked automatically, not
kept by convention.

#### Scenario: A game imports the drawing vocabulary

- **WHEN** a game's renderer needs the `Color` type for its `colors()`
- **THEN** it imports it from the engine
- **AND** no module under `src/engine/` or `src/games/` imports from
  `src/puzzle/`, `src/utils/`, `src/store/` or any other app directory

### Requirement: A game rejects a move it cannot play, rather than guessing

`Game.executeMove` SHALL reject a move that its dispatch does not recognize, by
throwing an error naming the game and the move. It SHALL NOT return a state it
did not compute from that move, SHALL NOT return a non-state, and SHALL NOT
treat the move as a no-op. A move reaching `executeMove` is not guaranteed to
be a member of the game's move union: a save's moves are cast on replay, not
parsed.

#### Scenario: A move from another build is refused, not misread

- **WHEN** a saved game is replayed whose move log holds a move this build's
  dispatch does not recognize
- **THEN** `executeMove` throws an error naming the game, the midend refuses
  the save, and the board is left playable
- **AND** the save is never loaded as a board differing from the one saved

### Requirement: An unhandled member of a move union is a compile-time error

Where a game's move type is a discriminated union, the dispatch SHALL be
written so that an unhandled union member is a compile-time error: a `switch`
whose catch-all binds the move to `never` (`assertNever`). A bare `default`
that throws SHALL NOT be taken to meet this, because its presence makes the
function total for the type checker and gives up the exhaustiveness check.

#### Scenario: Adding a move type without handling it fails to compile

- **WHEN** a member is added to a game's move union and no dispatch arm handles
  it
- **THEN** the type checker reports the error at that game's `executeMove`

### Requirement: A move that is not a union has its fields validated

Where a game's move is not a union, `executeMove` SHALL validate the fields its
dispatch depends on, and SHALL throw in the same form, naming the game and the
move.

#### Scenario: A single-shape move arrives without a field

- **WHEN** a game whose move is one object shape replays a move lacking a field
  its dispatch reads
- **THEN** `executeMove` throws an error naming the game and the move

### Requirement: The Game contract carries no capability without a consumer

Every optional member of the `Game` interface SHALL have at least one game
implementing it and at least one consumer reading it. The two SHALL be checked
separately, because they fail differently: no implementer is dead weight in the
interface, and no consumer means every implementer wrote code that never runs.

#### Scenario: An optional hook nothing invokes is reported

- **WHEN** a member of the `Game` interface is implemented by one or more games
  but read by no engine or app-shell call site
- **THEN** the check reports it, naming the number of implementers whose code
  cannot run

#### Scenario: An optional hook no game implements is reported

- **WHEN** an optional member of the `Game` interface has no implementer
- **THEN** the check reports it as surface to remove

#### Scenario: The check states how much it inspected

- **WHEN** the check runs
- **THEN** it asserts the number of interface members it examined, the number
  of modules it scanned for consumers, and the size of the registry it read
  implementers from, so a sweep that matched nothing cannot report success

### Requirement: A `Game` member read only by a guard, or by nothing, is recorded

A member whose only consumer is a cross-game guard is allowed, since such a
guard is a real reader, and SHALL be recorded as such with its argument. A
member with no consumer SHALL be recorded with the change that owns the
decision to wire it up or remove it. An entry with no owning change SHALL NOT
stand.

#### Scenario: A recorded exception that has stopped being true is reported

- **WHEN** a member recorded as having no consumer acquires one
- **THEN** the check fails, so the record is corrected and not left describing
  a finding that no longer exists

### Requirement: A consumer of a `Game` member is read from the syntax tree

Consumers SHALL be derived from the source's syntax tree and SHALL NOT be found
by matching text, because a comment is not a consumer. A value copied into a
field of the same name SHALL NOT count as a consumer: relaying is not reading.

#### Scenario: A member is named only in a comment

- **WHEN** a member's only mention outside the games is a commented-out line
  proposing to read it
- **THEN** the check reports the member as having no consumer

### Requirement: The static-attributes relay carries no field the app does not read

Every field of `PuzzleStaticAttributes` SHALL be read by the app shell, and a
check SHALL assert it. A field with no app reader SHALL be removed, or recorded
with the change that owns the decision to give it one. The check SHALL count
only reads from outside the engine, because the two contracts share field
names: `canMarkAll` is also a `Game` member, so an engine read of
`game.canMarkAll` would otherwise vouch for an app field nothing touches.

#### Scenario: A relayed field the app never reads is reported

- **WHEN** a `PuzzleStaticAttributes` field has no app-shell reader
- **THEN** the check reports it by name, so the midend stops computing and
  shipping a value for nobody

#### Scenario: The check states how much it inspected

- **WHEN** the check runs
- **THEN** it asserts the number of fields it examined and the number of
  app-shell modules it scanned, so a sweep that matched nothing cannot report
  success

### Requirement: A shared mechanic is joined by having it, not by declaring it

A game SHALL join a shared engine mechanic by having it: registering the
object, carrying the `Ui` fields, declaring the method, calling the arm. A
cross-game guard SHALL derive its population from what the game is and SHALL
NOT take it from a roster of opted-in names. A game SHALL NOT be required to
add itself to a list in order to be guarded.

#### Scenario: A newly ported game joins every guard for its capabilities

- **WHEN** a game is registered that declares `hint()`
- **THEN** it is covered by every cross-game hint guard, including the
  necessity-voice rule, without any list being edited

### Requirement: An enrollment fact is read off the game, through the shared helper

The enrollment fact SHALL be one of: the registered game object (a member's
presence, a flag's value, a contract section's state), the `Ui` its `newUi`
returns, or the game's own source with comments removed.
`src/engine/testing/enrollment.ts` SHALL be the shared way to ask those
questions, and a guard needing one of them SHALL use it and SHALL NOT re-derive
the population.

#### Scenario: A guard asks which games carry a Ui field

- **WHEN** a cross-game guard needs the games whose `Ui` carries a given field
- **THEN** it asks the shared helper, which reads the `Ui` each game's `newUi`
  returns

### Requirement: A derived sweep puts a floor under the population it drew from

Every derived sweep SHALL assert a floor on the population it drew from, not
only on the set it filtered out of that population.

#### Scenario: A derived sweep that found nothing fails rather than passing

- **WHEN** the registry a cross-game guard draws from is empty or short
- **THEN** the guard fails on the population floor and does not report health
  over an empty set

### Requirement: A guard's exemptions are a ledger held equal to the derivation

Where the derived set holds members the guard's rule must not apply to, the
guard SHALL record them as a ledger in the guard, one entry per member, each
carrying its reason, and SHALL assert that the ledger equals what the
derivation found. A ledger entry SHALL NOT be the enrollment key: the
derivation says which games are members, and the ledger says only why a member
is excused. An empty ledger is a valid and meaningful assertion.

#### Scenario: A ledger entry that has stopped being true fails

- **WHEN** a guard's exemption ledger names a game the derivation no longer
  places in the exempt set
- **THEN** the guard fails, naming the stale entry

### Requirement: An absent contract section is excused by the game's reason, not by a ledger

An excuse that says the game has no such contract section SHALL NOT be a ledger
entry in a guard: it is the game's `notApplicable` reason, which the help page
shows and the guard reads.

#### Scenario: A guard's ledger of absences reads the game's reasons

- **WHEN** a cross-game guard would excuse a game for having no such section:
  no mistakes to check, no solver to cheat with, no turn
- **THEN** it derives the excuse from the game's section state and not from a
  ledger entry in the guard

### Requirement: A cross-game sweep SHALL take its boards from the shared slice, not build them

A test that walks the collection SHALL obtain the boards it walks from the one
shared preset enumeration, and SHALL NOT construct a population of its own out
of a game's parts, such as a game's first preset or a tier written onto it.

#### Scenario: A sweep is written that walks the collection

- **WHEN** a new cross-game test needs a board per game
- **THEN** it calls the shared slice, and gains every game's every mode with no
  key of its own to maintain

#### Scenario: A guard's own population is synthesized from a base preset

- **WHEN** a cross-game guard builds its boards by writing a tier onto one
  preset's params
- **THEN** that is the tell of a population the games did not offer, and the
  guard is re-keyed on the presets menu, unless its subject is what a params
  record does and not what a board carries, which it SHALL say at the site

#### Scenario: A hand-maintained roster patches the narrow population

- **WHEN** a guard carries a per-game entry naming a bigger or different preset
  to use, because the population it built is too small to reach the behavior
- **THEN** reading the presets menu retires the roster, because the board the
  entry named by hand is the board the derivation picks

### Requirement: The sweeps that build their own boards are derived and ledgered

Which sweeps still build their own boards SHALL be derived and ledgered, and
SHALL NOT be counted in prose. A scan of the suite's own comment-stripped
sources for calls of `firstLeaf` and `withTier` SHALL name the files, and each
SHALL be held to an entry saying which behavior needs a params record the
presets menu does not offer.

#### Scenario: A sweep is written that builds its own boards anyway

- **WHEN** a test file calls `firstLeaf` or `withTier` and is not in the ledger
- **THEN** the suite scan fails, naming the file and the guide section, and the
  author either calls the slice or writes down which behavior needs the record
- **AND** an entry left behind by a file that stopped doing it fails the same
  check from the other side

#### Scenario: A guard needs a configuration the presets menu does not offer

- **WHEN** the behavior a guard observes needs a params combination no preset
  carries, such as a small grid at a hard tier, which a menu never pairs
- **THEN** the guard walks the slice and that combination, and says which
  behavior needs it

### Requirement: The shared slice holds the cost discipline of a searching hint

A hint that plans by searching pays for board size in each search and in the
number of moves to make. The shared enumeration SHALL give such games every
mode on the smallest board offering it and no large board at all, derived from
the same axes as every other game's slice. It SHALL NOT be a count of presets
to keep.

#### Scenario: A slice is taken for a game whose hint searches

- **WHEN** the shared enumeration slices the presets of a game whose hint plans
  by searching
- **THEN** the slice holds every mode, each on the smallest board offering it,
  and no large board, with no count of presets to raise when a mode is added

### Requirement: Widening a sweep does not widen what it asserts

A sweep widened to more boards SHALL run the same assertions over them. A rule
that then fails has found either a defect or a vocabulary its own subject uses
and it had never heard, and both SHALL be treated as findings.

#### Scenario: A lexical narration rule meets a construction it has never heard

- **WHEN** a rule that recognizes narration by vocabulary is run over the modes
  and tiers for the first time
- **THEN** a phrasing the collection has used all along can fail it, and the
  vocabulary is extended with the reason, the sentence not being flattened to
  fit: "can take one line at most" is a proved bound, and "none of its
  remaining edges can be walls" is a negated possibility
- **AND** where the wording is owner-endorsed, it is recorded as a declared
  idiom and not rewritten

### Requirement: The engine supports an ephemeral, opt-in mistake-checking hook

The engine SHALL support a UI-only, ephemeral mistake-checking facility. The
`Game` interface SHALL define an optional `findMistakes(state)` method
returning the cells of the current state that contradict the puzzle's unique
solution, as game-specific highlight data; an empty result means no detectable
mistakes. The method SHALL be pure, with no state mutation.

#### Scenario: Checking a clean board

- **WHEN** `findMistakes()` is invoked and no cell contradicts the solution
- **THEN** the count returned is 0 and nothing is highlighted

### Requirement: A candidate note that excludes the answer is a mistake

Where a game whose state carries candidate or pencil notes reports them as
mistakes, a non-empty candidate set that excludes the cell's unique-solution
value SHALL be the contradiction it reports, and a set that merely holds extra,
non-solution candidates SHALL NOT be reported. The solution such a game checks
against SHALL be derived from the committed placements only, never from the
notes themselves, which are what is being checked.

#### Scenario: A candidate annotation that excludes the solution is a mistake

- **WHEN** such a game reports mistakes on a state where an undecided cell's
  non-empty candidate set excludes that cell's unique-solution value
- **THEN** `findMistakes` includes that cell
- **AND** a cell whose candidate set still holds the solution value, with or
  without extra candidates, is not included
- **AND** Check & save refuses to quick-save the board while such a cell
  exists, as it refuses a wrong placed value

### Requirement: The midend shows mistakes until the next transition

On `findMistakes()` the midend SHALL call the game's hook, hold the result in
the midend only, never in game state and never persisted, pass it to the game's
`redraw`, and return the count of flagged cells. The display SHALL last until
the next transition the midend processes and SHALL be cleared by it: a player
move, undo, redo, restart, new game, solve, and a UI-only update.

#### Scenario: Checking a board with mistakes

- **WHEN** `findMistakes()` is invoked on a game that implements the hook and
  the current state has cells contradicting the solution
- **THEN** the midend holds those cells, schedules a repaint that draws them
  highlighted, and returns a count above 0

#### Scenario: A transition clears the mistake display

- **WHEN** mistakes are displayed and the player makes a move, undoes, redoes,
  restarts, starts a new game, or solves
- **THEN** the midend clears them and the next repaint draws no mistake
  highlights

### Requirement: `canCheck` and `check()` reach the mistake hook

The engine surface SHALL expose `canCheck` in its static attributes, true if
and only if the game implements `findMistakes` or has a hint, and SHALL reach
the hook through `check()`, which asks it first. For a game that does not
implement the hook, the midend's `findMistakes()` SHALL return 0, and `check()`
SHALL report that no mistakes were checked.

#### Scenario: A game without the hook reports no capability

- **WHEN** the active game does not implement `findMistakes`
- **THEN** `findMistakes()` returns 0, `check()` reports no mistakes checked,
  and `canCheck` is true only if the game has a hint to ask

### Requirement: The engine surface exposes an opt-in per-game reference-aid capability

The engine surface SHALL expose an optional per-game reference aid: a read-only
checklist of a puzzle's fixed inventory of pieces with found or outstanding
status, and a way to spotlight one item on the board. The `Game` interface
SHALL define two optional hooks: `reference(state, ui): ReferenceModel`, and
`selectReference(ui, key): boolean`, which spotlights the item `key`, or clears
the spotlight when `key` is null, by mutating `Ui`, and returns whether
anything changed.

#### Scenario: A game exposing a reference is discoverable through the surface

- **WHEN** the active game defines `reference` and the app queries static
  attributes
- **THEN** `hasReference` is true and `getReference()` returns the game's
  model, whose `items` reflect the current board and whose `selected` matches
  the spotlighted key

### Requirement: The reference model is plain, serializable data

`ReferenceModel` SHALL be
`{ items: ReferenceItem[]; selected: string | null; columns?: number }`, and
`ReferenceItem` SHALL be `{ key: string; label: string; pips?: readonly
number[]; status: "outstanding" | "placed" | "conflict" }`. `key` is a stable
id, `pips` is optional face-value data for a game whose pieces render as pips,
and `selected` echoes the spotlighted key, or null.

#### Scenario: A model crosses the worker boundary

- **WHEN** `getReference()` answers the app across the worker
- **THEN** the model arrives whole, since it holds plain data only

### Requirement: The midend surfaces the reference aid without touching the history

The `Midend` SHALL report `hasReference` in its static attributes, true when
the game defines `reference`, and SHALL provide `getReference()`, returning
`game.reference(state, ui)` or null, and `selectReference(key)`.
`selectReference` SHALL call `game.selectReference(ui, key)` and, on a `true`
return, take the repaint path of a `UI_UPDATE`: it SHALL NOT create a move, add
an undo entry, alter the move log, or be serialized into a save.

#### Scenario: Selecting a reference item repaints without a history entry

- **WHEN** the app calls `selectReference(key)` on a game whose
  `selectReference` reports a change
- **THEN** the board repaints with that item spotlighted, and no move is added:
  the move log, undo and redo availability, and any later save are
  byte-for-byte what they were before the call

### Requirement: The reference aid is reached through the shared engine surface

`hasReference`, `getReference` and `selectReference` SHALL be part of the
shared `PuzzleEngineSurface`, so the app reaches them through the same surface
as every other engine call. For a game that does not define `reference`,
`hasReference` SHALL be false, `getReference()` SHALL return null, and
`selectReference()` SHALL be a no-op.

#### Scenario: A game without a reference aid reports none

- **WHEN** the active game does not define `reference`
- **THEN** `hasReference` is false, `getReference()` returns null,
  `selectReference()` does nothing, and no reference control is shown

### Requirement: Absence has one spelling

A value this tree declares as possibly absent SHALL be typed `T | null`.
`undefined` SHALL NOT be written as a member of a union type in any tracked
TypeScript file: not in a return, parameter, member, variable, alias or type
argument. A parameter or member that may be left out SHALL be written `?`. A
cast (`as`, `satisfies`, a type assertion) describes a value and does not
declare one, and is exempt.

#### Scenario: A helper that may find nothing

- **WHEN** a new helper returns a lookup that may miss
- **THEN** it declares `T | null`, and a declared `T | undefined` fails the
  gate's absence check, naming its file and line

### Requirement: A value the language produced as undefined is converted where it enters a declared type

A value the language produced as `undefined` (`?.` over an optional member,
`Map.get`, `Array.find`, an index read) SHALL be converted with `?? null` where
it enters a declared type.

#### Scenario: A map lookup feeds a declared type

- **WHEN** the result of `Map.get` is returned from a function declared to
  return `T | null`
- **THEN** it is written with `?? null`

### Requirement: Two kinds of nothing are two named states

Where one value has two distinct kinds of nothing, each SHALL be a named state,
a string literal or a unique symbol, and the two SHALL NOT be told apart by the
language's two words.

#### Scenario: A key with two kinds of nothing

- **WHEN** Crossing reads a key while its cursor is shown
- **THEN** it reads the digit for `1` to `9`, `"clear"` for Backspace, Delete,
  `0` or the secondary select, and `null` for any other key
- **AND** a `?? fallback` written against the result cannot merge a clear into
  an ignored key

#### Scenario: A stored null is not an unset setting

- **WHEN** a common setting stores `null` as its value
- **THEN** the settings store reads it back as `null`, and gives the default
  only to a key nobody stored, which it reads as a named unset state

### Requirement: A function that can fail returns its reason or a discriminated result

A function that can fail and has nothing to return on success SHALL return its
reason or `null`. A function that returns a value on success SHALL return a
discriminated result, `{ ok: true; … } | { ok: false; error: string }`, so that
a refusal cannot hide inside the value.

#### Scenario: The engine surface reports a refusal

- **WHEN** the app calls `setParams`, `setCustomParams`, `newGameFromId`,
  `loadGame`, `solve`, `hint` or `executeHint` through the worker
- **THEN** the answer is the refusal's text or `null`
- **AND** `setPreferences`, which cannot fail, returns nothing

#### Scenario: A preview whose answer is itself a string

- **WHEN** the Custom dialog asks `encodeCustomParams` for the params its
  values describe
- **THEN** it receives `{ ok: true, params }` or `{ ok: false, error }`, and no
  refusal is carried inside a params string

### Requirement: The absence rule changes no stored meaning

What a save or a stored setting means SHALL NOT change to satisfy the rule that
absence has one spelling.

#### Scenario: A save key is optional on disk

- **WHEN** a save envelope leaves an optional key out
- **THEN** the key stays absent on disk, and is not written as `null` to
  satisfy the rule

### Requirement: A refused Solve is shown in the help banner

A Solve the engine refuses SHALL show the refusal's own text in the same
transient banner a refused Hint uses, whichever control asked for it, in every
game that offers Solve, including a game with no hint: the banner SHALL NOT
depend on the hint controls being rendered. A Solve that lands SHALL add no
message of its own. The app SHALL NOT rewrite the refusal's wording, which is
the collection's ("Solve failures are worded once for the whole collection").

#### Scenario: Solve on an unstarted Mines board

- **WHEN** the player presses Solve on a fresh Mines board, before the first
  click
- **THEN** the banner says there is nothing to solve until the first move lays
  the board out, and the board is unchanged

#### Scenario: A Solve that lands shows no banner

- **WHEN** the player presses Solve and the game's solver solves the board
- **THEN** the board shows the solution and no banner message is added

### Requirement: Solve is ordered with the other queued input

Solve applies a move, so it SHALL be ordered with the other queued input: a
Solve pressed while an Auto-Hint step is being applied SHALL land after that
step, never inside it.

#### Scenario: Solve waits behind a step in flight

- **WHEN** Solve is pressed while a hint step is still being applied
- **THEN** the worker receives the solve only after that step has finished

### Requirement: Solve, the status bar and text export follow from the game's methods

The `Midend` SHALL derive `canSolve` from the presence of `Game.solve` and
`wantsStatusbar` from the presence of `Game.statusbarText`, and SHALL offer a
text rendering exactly when `Game.textFormat` is present and returns one. The
`Game` contract SHALL carry no flag restating any of the three, so a game
cannot advertise a capability it has no method behind.

#### Scenario: A game without the methods offers neither Solve nor a status bar

- **WHEN** a game provides neither `solve` nor `statusbarText`
- **THEN** its static properties report `canSolve` and `wantsStatusbar` false
- **AND** `Midend.solve()` refuses with "This game does not support solving"

#### Scenario: A game with the methods offers both

- **WHEN** a game provides `solve` and `statusbarText`
- **THEN** its static properties report `canSolve` and `wantsStatusbar` true

### Requirement: A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft

The engine SHALL name the contract sections whose absence makes a game a draft
(`src/engine/sections.ts`): `hint`, `findMistakes`, `solve` and
`transposeParams`. Each section of a game SHALL be in exactly one of three
states: implemented (the member is present), not applicable (the game gives the
reason in `Game.notApplicable`), or absent. A game with any absent section
SHALL be a draft. Draft SHALL be computed from these states and never declared
by a game about itself.

#### Scenario: A hintless game is a draft

- **WHEN** a registered game declares no `hint`
- **THEN** its draft sections include "Hints", whatever else it declares

### Requirement: A not-applicable reason is a fact about the puzzle

A reason SHALL state a fact about the puzzle that a player could check against
its rules, written as a sentence for the game's help page. That nobody has
written the section yet SHALL NOT be a reason; that absence is what draft
means. A hint SHALL never be not applicable, and the type SHALL NOT admit
`hint` as a key of `Game.notApplicable`.

#### Scenario: A reason excuses a section

- **WHEN** Fifteen declares `findMistakes` not applicable, because every
  arrangement of its tiles is a step on the way to the answer
- **THEN** its `findMistakes` section is not applicable, not absent, and the
  reason is shown on its help page

### Requirement: A section both implemented and excused is refused

A game that both implements a section and declares it not applicable SHALL be
refused wherever the section state is read, including the production build.

#### Scenario: A game cannot both have a section and excuse it

- **WHEN** a game implements `solve` and also gives a `solve` reason
- **THEN** reading its section state throws, naming the game and the section

### Requirement: A member joins the sections only when its absences can be told apart

A member SHALL join the sections only when its absences can be told apart
without reading intent that no reason states. Members whose absence says
nothing either way (`difficulty`, `textFormat`, and affordances such as
`hover`, `reference` and `prefs`) SHALL stay optional and outside the draft
computation.

#### Scenario: A game without a text rendering

- **WHEN** a game declares no `textFormat` and gives no reason for it
- **THEN** it is not a draft on that account

### Requirement: A boolean capability flag is held to the behavior it claims

The `Game` interface SHALL carry a boolean capability flag only where a
production consumer needs the answer synchronously and cannot observe it. Every
such flag SHALL be asserted equal to a derivation of the fact it declares, so a
flag that is forgotten, left behind by a changed game, or wrong fails a test. A
flag whose effect is to disable a guard or a frontend behavior SHALL carry such
a check, because nothing else observes it when it lies.

#### Scenario: A flag declared against the behavior fails

- **WHEN** a game sets `ignoresSecondaryButton` but a right-button press
  changes its board somewhere
- **THEN** the cross-game guard fails, naming the game

### Requirement: Each flag of the contract is held to its derivation

`ignoresSecondaryButton` SHALL be set if and only if the game consumes no
`RIGHT_BUTTON` press anywhere on its board. `canMarkAll` SHALL be set if and
only if the game's `interpretMove` returns a move for an `M` press. A source
scan standing in for a derivation SHALL read the game's code with comments
removed: a mention in prose is not a use.

#### Scenario: A flag the behavior calls for but the game omits fails

- **WHEN** a game's `interpretMove` answers an `M` press with a move but the
  game does not set `canMarkAll`
- **THEN** the cross-game guard fails, naming the game

### Requirement: Solve failures are worded once for the whole collection

A refused `Game.solve` SHALL return one of the collection's Solve failures, and
its type SHALL admit no other string, so that a game cannot word one itself.
The set SHALL distinguish, at minimum: the board is finished; the solver could
not settle the puzzle; the puzzle provably has no solution; it provably has
more than one; no finish can be found from the player's position; the game ID
carries no solution and the game has no solver; and the board is not dealt
until the first move.

#### Scenario: Two games fail to solve for the same reason

- **WHEN** two games' solvers each prove a typed game ID has no solution
- **THEN** both refusals read the same

#### Scenario: A game's own sentence does not compile

- **WHEN** a game's `solve` returns `{ ok: false, error: "Sorry, I can't" }`
- **THEN** the typecheck fails

### Requirement: A solver claims only what it established

A failure claiming the puzzle has no solution, or more than one, SHALL be
returned only where the solver established it. Where a solver's verdict does
not tell impossible from gave-up, the failure SHALL be the one that says the
solution cannot be determined, which is true either way.

#### Scenario: A solver gives up on a typed board

- **WHEN** a game's solver stops on a typed game ID without proving that it has
  no solution
- **THEN** the refusal says the solution cannot be determined, and does not say
  the puzzle has none

### Requirement: A fact a hint and Solve both meet is worded once

A fact a hint can also meet SHALL be worded the same for both: the finished
board, the puzzle that cannot be settled, the position nothing finishes from,
and the game ID with no solution are each one message whichever control asked.

#### Scenario: A hint and Solve name one dead end alike

- **WHEN** Inertia's ball can no longer collect every gem, and the player asks
  for a hint and then for the solution
- **THEN** both refusals are the same message

### Requirement: The status bar's completion words come from the engine

A status bar that says the board is finished, or that the solver was used,
SHALL take those words from the engine's one helper, which distinguishes four
states: neither; finished by the player; finished by the solver; and helped by
the solver but no longer finished. The midend SHALL prefix them to whatever the
game's `statusbarText` returns, from the board's status now and its own record
that the solver was used.

#### Scenario: A helped board the player has moved off

- **WHEN** a player uses Solve and then moves the board off its solution
- **THEN** the status bar says the solver was used, not that the board is
  solved

#### Scenario: Nothing follows the words

- **WHEN** a finished board's status bar has nothing else to say
- **THEN** it reads the completion words with no trailing space

### Requirement: No game writes the completion words itself

A game SHALL NOT write the status bar's completion words itself. This SHALL be
asserted by scanning the strings games write for what the words say, not for a
constant's name.

#### Scenario: A game spells the words in a string of its own

- **WHEN** a game's source holds a string saying the board is completed
- **THEN** the scan fails, whatever the string is named

### Requirement: A game's status is judged from the board alone

A game's `status(state)` SHALL report won, lost or ongoing from the position in
`state` alone, never from how it was reached, and SHALL NOT write into the
state. A fact the board shows (a revealed arena, a dead ball, a killed cell)
SHALL count as part of the position, which `status` reads.

#### Scenario: A board typed in already solved

- **WHEN** a game ID describes a board that is already solved
- **THEN** its status is solved at move 0, and the hint refuses it as already
  solved

### Requirement: No game's state records a solve or the solver's use

No game's state SHALL record that the board was solved, or that the solver was
used: the midend owns that history and derives it from the positions it holds.

#### Scenario: A record of completion on the state fails the build

- **WHEN** a game's state carries a field recording that the board was solved
  or that the solver was used
- **THEN** the cross-game guard fails, naming the game and the field

### Requirement: A board's status follows the board on display

A board typed in already solved SHALL be solved at move 0, a Solve move SHALL
complete the board because the board it leaves is solved, and a solved board
the player breaks SHALL read ongoing again. The rule SHALL be one for every
consumer, with no record of an earlier solve.

#### Scenario: A broken solved board

- **WHEN** the player makes a move that takes a solved board off its solution
- **THEN** the status is ongoing, and a board with a mistake on it is never
  reported solved

### Requirement: The engine derives a board's history from its position

The midend SHALL ask a game's `status` once per position and SHALL derive from
its own history everything about how the board got there: whether the solver
was used on this board, reported as solved-with-help on a solved board, when
the win flash plays, and the status bar's completion words.

#### Scenario: An expensive status is asked once per position

- **WHEN** the midend reads the status of a position many times, on every timer
  tick and every refusal
- **THEN** the game's `status` was called once for that position

### Requirement: The win flash plays on a forward move that solves the board

The win flash SHALL play on a forward move, other than the Solve command, that
leaves the board solved when it was not, for the duration the game's
`solvedFlash` gives. A game's `flashLength` SHALL be only for a flash the
status does not show, and a nonzero answer from it SHALL replace the win flash.

#### Scenario: The Solve command does not celebrate

- **WHEN** the Solve command completes the board
- **THEN** no flash plays, and the status is solved-with-help

#### Scenario: A hand solve after a Solve celebrates

- **WHEN** a player uses Solve, moves off the solution and completes the board
  by hand
- **THEN** the flash plays, and the status is still solved-with-help

#### Scenario: A broken solved board solved again celebrates again

- **WHEN** a player breaks a solved board and solves it again by hand
- **THEN** the flash plays again; undoing the break does not flash

### Requirement: Every game has a solve timer, and it runs while the board is undecided

The midend SHALL offer a `show-timer` boolean preference ("Show timer") in
every game, beside the game's own `prefs`, on by default; no game declares
anything to have it. While it is on, the midend SHALL count elapsed time only
while the player is solving: after the first move of the board, while the
board's status is `ongoing`, while the game's optional `timerHolds(state)` is
not true, and while the frontend has not paused it (`setTimerPaused`, which the
app sets while the page is hidden).

#### Scenario: A game that does not ask for a timer offers one

- **WHEN** a game with no `prefs` of its own, and nothing about a clock, is
  started
- **THEN** its preferences include `show-timer`, on, and the timer reports zero
  seconds

#### Scenario: The timer counts from the first move

- **WHEN** the timer is on and a new board is dealt
- **THEN** it does not count until the player's first move, and counts during
  play after it

#### Scenario: A hidden page does not count

- **WHEN** the frontend pauses the timer and later resumes it
- **THEN** no time is counted in between, and counting continues from where it
  stopped

### Requirement: The solve timer follows the board on display

Being decided is a fact about the board on display: a solved board the player
breaks, or undoes out of, SHALL count again. A new board SHALL reset the time.

#### Scenario: A solve stops the clock while the board stays solved

- **WHEN** a timed board is solved
- **THEN** the timer stops, and counts again once the board is broken or the
  solve is undone

### Requirement: The timer is reported when its readout changes

The midend SHALL report the timer as a `timer-change` notification carrying
either `null`, when the timer is off, or the whole seconds elapsed and whether
help was taken on the board. It SHALL send the notification only when that
readout changes.

#### Scenario: A helped time says so

- **WHEN** a hint is shown on a timed board
- **THEN** the timer's readout reports the board as assisted, until a new board
  is dealt

### Requirement: Help is the app doing some of the solving

The midend SHALL count as help: a hint step shown, the solver used, and the app
finding something wrong with the position, which is mistakes highlighted or a
dead end named. The last SHALL count alike whether Check, Check & save or the
Hint button asked, and in every game: it is one rule in the midend and no game
declares anything about it. A check that finds nothing, and a refusal that is
not a dead end, SHALL NOT count, so saving a sound board never marks it.

#### Scenario: A peek at the solution stays assisted

- **WHEN** a player uses Solve on a timed board and undoes it
- **THEN** the timer counts again, and its readout reports the board as
  assisted

#### Scenario: A check that finds something is help

- **WHEN** a check, or a press of Hint, highlights mistakes or names a dead end
- **THEN** the timer's readout reports the board as assisted

#### Scenario: A check that finds nothing is not

- **WHEN** a check passes a board, or cannot settle it past the search's reach
- **THEN** the readout does not report the board as assisted on that account

### Requirement: Solve leaves a solved board

Solve SHALL mean one thing in every game: it shows the finished board, or it
refuses with a reason. The midend SHALL hold every game to it. Without asking
the game, it SHALL refuse Solve on a board whose status is solved, with the
finished-board failure, and on one whose status is lost, with the game-over
refusal a hint gives there. When the game's solve move would leave a board
whose status is anything but solved, it SHALL throw before the move enters the
history, as a defect in the game.

#### Scenario: Solve finishes the board

- **WHEN** Solve lands in any game
- **THEN** the board's status is solved, and the midend reports it
  solved-with-help

#### Scenario: A Solve move that leaves the board unsolved is a defect

- **WHEN** a game's solve move would leave a board whose status is ongoing or
  lost
- **THEN** the midend throws, and the history is unchanged

#### Scenario: A lost board is refused

- **WHEN** Solve is invoked on a board whose status is lost
- **THEN** it is refused with the message a hint gives there, and the game's
  solver is not asked

#### Scenario: Solve on a finished board leaves the win alone

- **WHEN** the player's own moves have solved the board and Solve is invoked
- **THEN** it is refused as already solved, the game's solver is not asked, and
  the status stays solved and does not become solved-with-help

### Requirement: A Solve installs no route and reveals no loss

A Solve SHALL never install a route or marks for the player to follow, nor
reveal an answer as a loss. A game whose solver finds no finish from the
player's position SHALL refuse. A game whose answer is fixed SHALL replace the
player's mistakes with it, as it replaces a wrong entry.

#### Scenario: No finish within the rules is a refusal

- **WHEN** Flood's solver would finish only past the move limit, from moves the
  player has already spent
- **THEN** Solve refuses, saying no solution can be found from this position

### Requirement: Every game with Solve is solved by a test

Every game with Solve SHALL be solved, by a test, from its deal and from
positions reached by playing its own input into it.

#### Scenario: A solver fails from a played position

- **WHEN** a game's `solve` leaves an unsolved board from a position its own
  input reaches
- **THEN** the test fails for that game

### Requirement: A cross-game sweep SHALL deal every choice the Custom dialog offers

The shared preset enumeration a cross-game sweep takes its boards from SHALL
deal, beside the slice of the menu, a board for every value of a `"boolean"` or
`"choices"` param that no preset holds. A game is dealt on everything its
dialog offers by having a `paramConfig`, and no list of games or values SHALL
be kept anywhere.

#### Scenario: A game's dialog offers a tier its menu stops short of

- **WHEN** a game's difficulty item lists a tier and none of its presets is at
  that tier
- **THEN** every cross-game sweep that takes its boards from the shared
  enumeration deals a board at that tier, on the first preset that accepts it,
  per commit and in the slow tier
- **AND** a throw planted in a hint arm only that tier reaches turns those
  sweeps red

#### Scenario: A game gains a choice

- **WHEN** a game's `paramConfig` gains a checkbox or a choice, or a list of
  choices gains a member, and no preset is changed
- **THEN** the new value is dealt from that commit, with no line added anywhere
  to enroll it

#### Scenario: A sweep reads the menu by itself

- **WHEN** a cross-game sweep slices or lists a game's presets directly
- **THEN** it deals nothing the menu leaves out, which is right only for a
  sweep whose subject is the menu or the slicing rule

### Requirement: A value no preset holds is dealt on the first preset that accepts it

Each such value SHALL be written onto the first preset, in menu order, that the
params check accepts it on, so a value costs what the game's cheapest board
costs. Writing one field onto a preset SHALL NOT be used instead of reading the
menu: here it is dealt beside the slice, for a value the menu has no board to
read. A tier written onto a small grid is a board the dialog deals and need not
be a hard one, so it SHALL NOT stand in for a preset at that tier.

#### Scenario: Several presets accept a value

- **WHEN** a value no preset holds is accepted on more than one preset
- **THEN** it is dealt on the first of them in menu order

### Requirement: Every value is dealt, the generator's choices included

Every value SHALL be dealt, the generator's own choices, such as symmetry and
density, included. A ledger excusing the values a hint is unlikely to read
SHALL NOT be kept: it would be a second copy to keep true.

#### Scenario: A generator choice no preset holds

- **WHEN** a game's dialog offers a symmetry that no preset holds
- **THEN** a board is dealt at it, as for a tier or a rule

### Requirement: A value no preset accepts is held to a ledger

A value no preset accepts has no board, and SHALL be held to a ledger with a
reason for each entry, asserted equal to what the derivation finds. A free
scalar (`"string"`) SHALL NOT be walked this way: it has no list of values to
hold a menu against, and its ends are the slice's.

#### Scenario: A value depends on another field

- **WHEN** every preset refuses a value, because the field is valid only with
  another field at a value no preset holds
- **THEN** the census fails naming the game, the field and the value, and the
  author gives the menu a board that carries it, or writes a ledger entry
  saying what does deal it

### Requirement: Whether every value is dealt is asserted apart from the derivation

Whether every value is dealt SHALL be asserted from `paramConfig` and the dealt
boards alone, not through the derivation that deals them, and the assertion
SHALL name known boards by the params they carry.

#### Scenario: The derivation drops a value

- **WHEN** the derivation that deals the boards stops dealing a value a
  dialog offers
- **THEN** the assertion, reading `paramConfig` and the dealt boards, fails

### Requirement: The next board is dealt ahead and kept

The app SHALL deal the board the next New game would deal before it is asked
for, off the thread that serves the board in play, and SHALL keep it until that
New game comes. A New game that finds a board kept for the params it deals at
SHALL play that board without running the generator, and SHALL otherwise wait
for one as "A deal a player waits for runs off the board's thread and can be
stopped" requires.

#### Scenario: The second deal of a slow type arrives at once

- **WHEN** a type whose boards take seconds to find has been dealt once, and
  the board dealt ahead has been found
- **THEN** New game plays the kept board without running the generator
- **AND** another board of that type is dealt ahead

### Requirement: Every type is dealt ahead, and a quick one keeps one board

A board SHALL be dealt ahead for every type, whatever its deal costs, and one
board SHALL be kept for a type whose deals are quick: a New game that finds
none kept there waits milliseconds.

#### Scenario: A quick type keeps one board

- **WHEN** a type's deal ahead took less than the time that makes a deal slow
- **THEN** one board is kept for it, and no further board is dealt ahead until
  that one is played

### Requirement: A type whose deal was slow keeps three boards

A type SHALL keep three boards once a deal of it was slow, so that a board
passed over, by New game pressed again straight away, is followed by one
already found. The boards SHALL be dealt one at a time, and of several kept for
a type New game SHALL play the one kept longest.

#### Scenario: Boards of a slow type passed over are each followed by a kept one

- **WHEN** three boards are kept for a type whose deal ahead was slow, and New
  game is pressed three times running
- **THEN** each press plays a kept board, the one kept longest first, and none
  runs the generator
- **AND** boards of that type are dealt ahead until three are kept again

### Requirement: A deal is slow by its generator's time alone

A deal is slow where its generator ran for as long as a New game may go
unanswered before the app says it is looking for a board. The time SHALL be the
generator's alone, and SHALL NOT count starting the thread it ran on. One slow
deal SHALL make the type slow for the rest of the visit, and for a later visit
while a board that was slow to find is still kept: a search for a rare board
ends at the first one it meets, so one quick deal says little about the next.

#### Scenario: A slow type's next deal is quick

- **WHEN** a type had a slow deal and its next deal ahead is found quickly
- **THEN** the type still keeps three boards for the rest of the visit

### Requirement: A kept board is keyed by its puzzle and its full params

A kept board SHALL be keyed by its puzzle and by the full encoding of the
params it was dealt at, which are the params the deal would use after turning
the board to fit the screen. It SHALL be kept across visits, apart from the
player's saved games and settings, and SHALL be handed to one deal only.

#### Scenario: A kept board is for the board as it will be dealt

- **WHEN** the chosen type would be dealt turned on its side to fit the screen
- **THEN** the board dealt ahead is dealt at the turned params
- **AND** a kept board of the unturned params is not played in its place

### Requirement: A kept board is played only by the build that dealt it

A kept board SHALL be played as its generator wrote it: its tier is taken on
trust and its `aux` is retained for Solve, as for a board dealt on the spot. It
SHALL therefore be played only by the build that dealt it, and a board another
build kept SHALL read as absent.

#### Scenario: A kept board survives a visit and not a build

- **WHEN** the page is reopened by the build that kept a board
- **THEN** New game plays that board
- **AND** a build with another version stamp finds no board kept and deals

### Requirement: A deal ahead is abandoned when its type is no longer wanted

A deal ahead SHALL be abandoned when the type it is for stops being the one the
next New game deals, unless a player is waiting for its board. A type whose
deal found no board, whose params the game refuses to deal, or whose deal the
player stopped SHALL NOT be dealt ahead again until a board of it is asked for.

#### Scenario: Choosing another type abandons the deal ahead

- **WHEN** a board is being dealt ahead and the player chooses another type
- **THEN** that deal is stopped and one for the new type begins

### Requirement: A deal a player waits for runs off the board's thread and can be stopped

A New game that finds no board kept SHALL wait on a deal run off the thread
that serves the board in play, and SHALL hand the board that deal finds to the
engine to play as a kept board is played. The engine's own thread SHALL NOT run
a generator for a New game. Where a deal ahead is already under way for the
type, the New game SHALL wait on that deal and SHALL NOT start a second, and
the board it finds SHALL be played and not kept as well.

#### Scenario: The board in play is played through a wait

- **WHEN** a New game finds no board kept for a type whose deal takes many
  seconds
- **THEN** the board in play stays on screen and takes moves and hints
- **AND** the board the deal finds replaces it when it arrives

#### Scenario: One deal serves the type just chosen

- **WHEN** a type is chosen, its deal ahead begins, and New game is asked for
  before that deal ends
- **THEN** the New game waits on that deal and plays its board
- **AND** no second deal is started and the board is not kept

### Requirement: A search for a board offers a way to stop it

While the app says it is looking for a board it SHALL offer a control that
stops the search, reachable by touch, by keyboard and by mouse. The words and
the control SHALL stand apart from the place a hint's words are shown, so that
a hint asked of the board in play does not remove the way out.

#### Scenario: A slow deal with no board kept says what it is doing

- **WHEN** New game finds no board kept and no board has been found within a
  second
- **THEN** the app says it is looking for a board until one is dealt, the
  generator gives up, or the player stops the search

#### Scenario: A hint during the wait leaves the way out

- **WHEN** the app is looking for a board and the player asks the board in play
  for a hint
- **THEN** the hint's words are shown and the control that stops the search is
  still offered

### Requirement: Stopping a search leaves the board in play as it was

Stopping SHALL end the deal at once, leave the board in play and its moves as
they were, and put the type chosen back to that board's, as a deal that found
no board does. A stopped deal SHALL say nothing further.

#### Scenario: A player stops the search

- **WHEN** the app says it is looking for a board and the player uses the
  control beside those words
- **THEN** the deal ends at once and the board in play is as it was, with its
  moves
- **AND** the type chosen is that board's again
- **AND** the type left is not dealt ahead until a New game asks for it

#### Scenario: Asking again deals again

- **WHEN** a search was stopped and the player asks for the same type again
- **THEN** a deal for it begins and the app waits on it

### Requirement: A deal that finds no board says so in the engine's sentence

A deal that found no board SHALL answer with the sentence the engine gives for
a generator that gave up, and SHALL leave the board in play and put the type
chosen back to its type.

#### Scenario: A deal that finds nothing says so

- **WHEN** the deal a New game waits on runs its retry bound out
- **THEN** the player is told no board of the type was found, in the engine's
  sentence, and the board in play and its type stay

### Requirement: A wait for a board ends when another board is opened

A wait SHALL end, without a board, when the player opens another board by its
id or from a save, and SHALL give way to a later New game. Where the type
chosen changes during a wait and no New game follows, the board found for the
type left SHALL NOT be handed to the engine; the wait SHALL go on for the type
now chosen.

#### Scenario: A save is opened during a wait

- **WHEN** the app is looking for a board and the player loads a saved game
- **THEN** the wait ends, and the board the search finds does not replace the
  loaded one

### Requirement: Stopping a search with no board in play deals the first preset

Where no board is in play, stopping SHALL fall back as a deal that found no
board does there: the app deals the game's first preset. That deal, having
nothing to go back to, SHALL offer no control to stop it.

#### Scenario: Stopping with no board in play

- **WHEN** a page opens on a type whose deal is slow, with no board to show,
  and the player stops the search
- **THEN** the game's first preset is dealt, and that deal offers no control to
  stop it

### Requirement: A restart is a step of the history

`restartGame` SHALL enter the board as it started as the next step of the
history, after the cursor, keeping every step before it. Undo SHALL cross the
step back to the board as it was played and Redo SHALL cross it forward again,
as any other step; a step made after undoing a restart SHALL drop it, as it
drops any step ahead of the cursor.

#### Scenario: Undo after a restart returns the moves

- **WHEN** a player makes moves, restarts and presses Undo
- **THEN** the board is as it was before the restart, and further Undo walks
  back through the moves
- **AND** Redo restarts again

### Requirement: A restart returns to the board as it started

The board as it started SHALL be state 0, and for a game that has superseded
its description the board its public description builds ("A game can supersede
its game description mid-play").

#### Scenario: A plain board is restarted

- **WHEN** a game that never supersedes its description is restarted
- **THEN** the step the restart enters is state 0

### Requirement: A restart with nothing played does nothing

A restart SHALL do nothing where nothing has been played since the board
started or was last restarted: at the first position, and at a position a
restart reached. A step there would change nothing on screen and would cost the
steps ahead of the cursor.

#### Scenario: A restart with nothing played does nothing

- **WHEN** a restart is asked for at the first position, with moves ahead of
  the cursor
- **THEN** the history is unchanged and Redo still reaches those moves

### Requirement: The solver record belongs to a stretch of play

Whether the solver was used is one flag of the midend and no part of a state,
and a restart is where it begins again. Each restart in the history SHALL keep
the record of the play on the far side of it from the cursor, and the two SHALL
be exchanged whenever the cursor crosses the restart, so that a board solved
with help reads so again when its restart is undone, and a board solved by hand
after a restart is not marked by a solve made before it.

#### Scenario: The solver record returns with the moves it belongs to

- **WHEN** a board solved by the Solve command is restarted and solved by hand
- **THEN** its status is solved
- **AND** undoing back across the restart shows it solved-with-help

### Requirement: A restart leaves the timer running and plays no animation

A restart SHALL NOT reset the solve timer and SHALL NOT hold it: the time is
the time spent on the board. Crossing a restart in either direction SHALL play
no move animation, since the two boards are not one move apart.

#### Scenario: A timed board is restarted

- **WHEN** a board with time on its clock is restarted
- **THEN** the readout keeps that time, and the board appears without a move
  animation

### Requirement: The state notification lists the restarts

The state notification SHALL list the positions restarts reached, as
`restarts`.

#### Scenario: A board is restarted after three moves

- **WHEN** a player makes three moves and restarts
- **THEN** the state notification's `restarts` lists the position that restart
  reached, the fourth after the start

### Requirement: The save envelope carries a restart

A restart's entry in the envelope's `moves` SHALL be `null`, and the envelope
SHALL list each restart apart from the moves, as its index and the solver
record it keeps (`restarts`), because a move is the game's own shape and no
marker inside the list could be told from one. The envelope version SHALL be 3.
A version 2 envelope holds no restart and SHALL be lifted by its version alone.

#### Scenario: A save holding a restart round-trips on either side of it

- **WHEN** a game with a restart in its history is saved with the cursor after
  the restart, or before it, and restored
- **THEN** the restored game has the same position, the same steps each way,
  and the same solver record on each side of the restart

#### Scenario: A save written before a restart was a step opens

- **WHEN** a version 2 envelope is loaded
- **THEN** it restores as it did, with no restart in its history

### Requirement: A restart is replayed on load to the board it reached

On load a restart SHALL be replayed to the board a restart made at that point
of play reached: one logged before the description was superseded goes to state
0.

#### Scenario: A restart logged before the board was laid out

- **WHEN** a save holds a restart made before the game superseded its
  description, and moves after it that did
- **THEN** replaying that restart reaches state 0, and not the board the
  public description builds

### Requirement: The board a new one replaces is kept, one deep

When a board in play is replaced, by a deal, an id or a loaded save, the midend
SHALL keep it as a save of itself, and SHALL bring it back when Undo is asked
for at the new board's first position. The board undone from SHALL be kept the
same way, and brought back when Redo is asked for at the last position of the
board Undo returned. The board SHALL be kept in the midend and not by the app,
because every way a board is replaced ends in one function there.

#### Scenario: Redo returns to the new board

- **WHEN** Undo has brought a board back and Redo is pressed past its last move
- **THEN** the board undone from is in play, and Undo there returns again

#### Scenario: A deal that finds no board keeps nothing new

- **WHEN** a New game finds no board
- **THEN** the board in play, and the board kept before it, are as they were

### Requirement: A kept board returns as it was left

A board brought back SHALL return as it was left: its history and cursor, its
time, its help and solver records, and its type as the type chosen.

#### Scenario: Undo on an unplayed new board returns the old one

- **WHEN** a board with moves on it is replaced and Undo is pressed
- **THEN** the old board is in play at the position it was left in, with its
  moves ahead of and behind the cursor, and its time

### Requirement: Undo and Redo keep one meaning

A step of the board in play SHALL be taken first in each direction; the other
board lies beyond the first position and beyond the last. No press SHALL mean
either of two things.

#### Scenario: Undo with a step behind the cursor

- **WHEN** a loaded save replaces a board, its cursor after its first position,
  and Undo is pressed
- **THEN** the cursor steps back on the loaded board, and the board it replaced
  stays kept

### Requirement: A kept board is dropped at the first step made on the board in play

Both kept boards SHALL be dropped at the first step made on the board in play,
a move or a restart, and SHALL NOT be dropped by Undo or Redo. One board SHALL
be kept each way: replacing a board drops the board kept before it. Neither
SHALL be written to a save or survive the page.

#### Scenario: The first move drops the other board

- **WHEN** a move is made on a board that replaced another
- **THEN** undoing that move leaves nothing further to undo

### Requirement: An unplayed copy of the replacing board is not kept

An unplayed copy of the board that replaces it SHALL NOT be kept: nothing of it
is missing. That is what a deterministic deal leaves, and what a page leaves
when it opens a board by id and then that board's autosave.

#### Scenario: A page opens a board and then its autosave

- **WHEN** a board is opened by its id, unplayed, and the same board's save is
  then loaded
- **THEN** Undo at the loaded board's first position brings no board back

### Requirement: The state notification reports the kept boards and numbers the board in play

The state notification SHALL report whether a board is kept each way
(`boardBefore`, `boardAfter`), SHALL count them in `canUndo` and `canRedo`, and
SHALL number the board in play (`board`). The number SHALL change when the
board is replaced, and a board brought back SHALL return under the number it
had, so that what the app holds per board can follow it.

#### Scenario: A board is brought back by Undo

- **WHEN** a board is replaced and Undo at the new board's first position
  brings it back
- **THEN** `canUndo` was true there, and the returned board's notification
  carries the number it had before it was replaced

### Requirement: A load reports the board once

While the midend replays a save's log it SHALL send no change notification.
When the board is as the save holds it, it SHALL send the board's id, its
params, its state and its status, once each. A replayed step is made as a
player's and is not one: a state reported midway carries a position the player
never sees, and the app keeps what it holds per board by the states it is told
of.

#### Scenario: A long save is one state

- **WHEN** a save of many moves is loaded
- **THEN** one state notification is sent, at the saved position

### Requirement: A cross-game sweep deals each board once

A cross-game sweep that needs a board of given params SHALL take it from
`dealt(game, params, n)` in `src/engine/testing/dealt.ts`, and a sweep that
drives a `Midend` SHALL begin it with `beginDealt`, which hands the midend the
same board by the route New game takes with a board dealt ahead, the
generator's `aux` included. The dealer SHALL keep each board for the life of
the worker, so every sweep in a worker reads one deal of it. A deal that throws
SHALL be kept and thrown again.

#### Scenario: Two sweeps walk the same preset

- **WHEN** two cross-game sweeps in one worker each walk Group's 8x8 at Hard
- **THEN** the board is dealt once and both walk it

#### Scenario: A sweep drives a midend

- **WHEN** a sweep begins a midend on a dealt board
- **THEN** the midend holds the generator's `aux` for it, as it does for a
  board a player was dealt

#### Scenario: A board cannot be dealt

- **WHEN** the generator runs out its retries on a params set
- **THEN** every sweep asking for that board gets the same refusal, and the
  generator runs once

### Requirement: A sweep does not seed a deal from its own name

A cross-game sweep SHALL NOT seed a deal from its own name. Where a property
needs more than one board of the same params, the sweep SHALL take the later
ones by `n`. Where it needs a particular board, the board SHALL be pinned by
its description and not reached through the dealer. A game's own tests are not
bound by this: the requirement is on the sweeps that walk every game.

#### Scenario: A property needs two boards of one preset

- **WHEN** a cross-game sweep needs a second board of the same params
- **THEN** it asks the dealer for `n` of 1, and seeds nothing itself
