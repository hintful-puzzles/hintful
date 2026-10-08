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

The TS engine SHALL define a single `Game` interface that every ported
game implements. The interface SHALL be an idiomatic TypeScript
rendering of upstream's `struct game` responsibilities — generic over a
game's parameter, state, move, UI, and draw-state types — and SHALL
use **immutable** state transitions: applying a move SHALL return a new
state value rather than mutating in place. The interface SHALL NOT
require manual duplicate/free of game values, SHALL NOT pass opaque
handles, and SHALL use union/boolean types in place of integer
sentinels (e.g. a game-status union, not the sign of an int).

Ports SHALL depend on this interface only; they SHALL NOT call the
midend directly. The interface is the sole contract between a game and
the engine.

#### Scenario: A port implements the interface without handle ceremony

- **WHEN** a game is ported to TS
- **THEN** it implements the `Game` interface with its own
  parameter/state/move types
- **AND** applying a move returns a new state value (no in-place
  mutation, no explicit free of the prior state)
- **AND** the port does not reference the midend implementation
  directly

#### Scenario: Game status is a typed union

- **WHEN** the engine asks a game for its status
- **THEN** the result is the shared game-status union
  (`ongoing`/`solved`/`solved-with-help`/`lost`), not an integer whose
  sign encodes win/loss

### Requirement: The TS midend orchestrates a game behind the existing Comlink surface

The engine SHALL provide a midend that owns, per live game: the
selected `Game`, its parameters, the move/undo/redo history, the UI
and draw state, the engine random source (the retained bit-identical
`random.ts`), timer bookkeeping, and preset/configuration handling.

The midend SHALL provide the app-facing Comlink surface (new game, new game from
ID, restart, process key/mouse, undo, redo, solve, redraw, presets, status,
serialize/deserialize, timer) and SHALL emit the change-notification shapes the
app consumes. The app shell, screen, dialog, drawing-canvas, and store code SHALL
NOT require changes to drive a game.

This requirement previously read "SHALL reproduce the existing Comlink
`WorkerPuzzle` API surface" — that class was the C/WASM implementation, and it
was deleted by `retire-c-engine`. The obligation is unchanged in substance; it is
simply no longer defined by reference to a second implementation, because there
is only one. `PuzzleEngineSurface` is where the shape is stated.

#### Scenario: A game is driven through the unchanged app surface

- **WHEN** the app opens a game
- **THEN** it drives it through the same Comlink surface and change
  notifications it used before the C engine was retired
- **AND** no app-shell, screen, dialog, drawing-canvas or store code changed to
  make that so

### Requirement: Per-game engine selection is a runtime registry, not a build flag

The engine SHALL resolve a game's implementation at runtime through a registry
keyed by `puzzleId`, populated by `registerGame(...)` side effects — never
through a build flag, and never per-game at build time.

The registry began as a *selection* mechanism: present meant "served by the TS
midend", absent meant "fall back to C/WASM", and it shipped empty so production
was unchanged until the first port registered itself. `retire-c-engine` removed
the alternative, so there is nothing left to select between: a `puzzleId` absent
from the registry is **unplayable**, not delegated. The worker SHALL fail
explicitly for an unregistered id rather than falling through.

Because the registry is now the *only* answer to "which games exist", it SHALL
agree with the catalog exactly, in both directions — every cataloged game is
registered, and every registered game is cataloged — and that SHALL be asserted
by a test rather than left to discipline.

#### Scenario: An unregistered puzzle id fails explicitly

- **WHEN** the worker is asked for a `puzzleId` with no registered `Game`
- **THEN** it raises an error naming the id
- **AND** no fallback implementation is attempted

#### Scenario: Catalog and registry cannot drift

- **WHEN** a game is added to the catalog but not registered, or registered but
  not cataloged
- **THEN** the gate fails

### Requirement: The engine uses a clean TS-native save format

The midend SHALL serialize and restore a game using a clean,
versioned TypeScript-native format (a version-tagged envelope carrying
the puzzle id, parameters, game id, the move list, timer elapsed, and
checkpoints). Restoration SHALL reconstruct history by replaying the
saved moves. The format SHALL NOT be required to be compatible with
the C `midend_serialise` format, and loading a pre-pivot C-format save
SHALL NOT be required (consistent with the `ts-migration` decision
that old saves and pre-pivot shared IDs are expendable). Saving and
restoring SHALL round-trip: a restored game SHALL have the same state
and history as the saved game.

The envelope SHALL carry the midend's record that the solver was used, as
`cheated`, and SHALL NOT carry whether the board was solved, which the restored
position says ("A game's status is judged from the board alone"). A key an older
envelope carries that the current shape does not read, such as `timerStopped`,
SHALL be ignored rather than rejected.

**A version bump SHALL come with an upgrade, not a rejection**, whenever the
older shape carries the same facts: the decoder SHALL lift an older envelope to
the current shape before validating it, so an existing save keeps working. The
validator SHALL then describe only the current shape, so it cannot drift into
blessing both. An envelope the decoder cannot lift — a *future* version, or an
older one whose fields are missing or malformed — SHALL still be rejected.

#### Scenario: Save/restore round-trips

- **WHEN** a TS-engine game is saved and then restored from that data
- **THEN** the restored game has identical state, move history, and
  redo availability
- **AND** the saved payload carries a format version field

#### Scenario: C-format save is not required to load

- **WHEN** a payload produced by the pre-pivot C-serialization path is
  presented to the TS midend
- **THEN** the midend is NOT required to load it
- **AND** this is not treated as a defect

#### Scenario: An older envelope is upgraded, not discarded

- **WHEN** a save written under the previous envelope version is loaded
- **THEN** it is lifted to the current shape and restores normally
- **AND** the retired field name is gone from the result rather than carried
  alongside the new one

#### Scenario: An envelope that cannot be lifted is still rejected

- **WHEN** the payload names a version the decoder does not know, or an older
  version whose fields are missing or of the wrong type
- **THEN** decoding fails

### Requirement: Midend correctness is established by behavioral tests, not a corpus

Midend correctness SHALL be established by behavioral and property
tests driven by a small in-repo fake `Game`, NOT by a byte-identical
characterization corpus. The suite SHALL cover undo/redo invariants,
history truncation after a move following an undo, status transitions,
change-notification emission, timer accumulation, preset-tree parsing,
and save/restore round-tripping. This applies the `ts-migration`
"accepted without a golden corpus" discipline to the engine itself.

#### Scenario: The midend is validated without a golden corpus

- **WHEN** the engine layer is implemented
- **THEN** its tests drive a fake `Game` and assert behavioral
  invariants (including `undo` after a move restoring the prior state)
- **AND** no characterization corpus captured from the C build is
  required for the midend to be accepted

### Requirement: The `Game` drawing, color, and input-feedback contract is fully specified

The engine SHALL fully specify the drawing surface, UI-only input
feedback, and color derivation that the keystone left as a minimal
placeholder for the first real port to fix, as follows.

- `GameDrawing` SHALL expose the full puzzle drawing API — filled
  rectangle, line, polygon, circle, text, clip/unclip,
  start/end-draw, draw-update, and the blitter save/restore quartet —
  with the same coordinate and palette-index semantics the existing
  canvas drawing surface already honors. The existing canvas
  `Drawing` SHALL satisfy `GameDrawing` structurally without
  modification. The engine SHALL NOT impose a full-vs-incremental
  redraw policy; redraw optimization (per-element diffing,
  first-draw-only setup) is the game's own concern, as in upstream.
- `interpretMove` SHALL be able to report a UI-only change (cursor or
  other UI state changed in place) distinctly from "a move" and from
  "nothing happened". The midend SHALL, on a UI-only result, redraw
  and notify without creating a history entry; on "nothing happened"
  it SHALL do nothing; on a move it SHALL apply it to history.
- A game's `colors` SHALL receive the frontend default background
  color, and the engine SHALL thread that default from the worker
  surface through the midend to the game, so a game can derive its
  palette from the host background exactly as upstream's
  `game_colours` does.

#### Scenario: A game draws through the full surface

- **WHEN** a registered TS game's `redraw` runs
- **THEN** it may use rectangles, lines, polygons, circles, text,
  clipping, and blitters through `GameDrawing`
- **AND** the existing canvas drawing implementation services them
  with no change to that implementation

#### Scenario: A UI-only input redraws without a history entry

- **WHEN** input changes only UI state (e.g. moving a keyboard cursor)
- **THEN** the engine redraws and emits a state notification
- **AND** undo offers no extra step for that input (no history entry
  was created)

#### Scenario: Palette is derived from the host background

- **WHEN** the app requests the color palette with its default
  background
- **THEN** the game receives that background and returns a palette
  derived from it (not a hardcoded background)

### Requirement: The worker exposes one shared puzzle-engine surface

The worker SHALL expose exactly one puzzle-engine implementation — the
TS-midend-backed puzzle — behind the `PuzzleEngineSurface` interface the app
drives over Comlink. With the C engine retired, the C/WASM-backed
implementation, the WASM-instantiation path, and the leaf-bridge coherence
check SHALL be removed, and the worker's dispatch SHALL always construct the TS
engine rather than choosing between two implementations.

`PuzzleEngineSurface` SHALL be retained (or inlined) so the app-facing remote
puzzle type keeps the same shape it had; removing the C implementation SHALL NOT
require changes to `src/screens/`, `src/dialogs/`, `src/puzzle/puzzle.ts`, the
drawing canvas, or `src/store/`.

#### Scenario: The worker constructs the TS engine unconditionally

- **WHEN** the worker opens any game
- **THEN** it constructs the TS-midend-backed puzzle
- **AND** there is no C/WASM implementation or WASM-coherence check to select
  between

#### Scenario: The app's remote type is unchanged by the removal

- **WHEN** the C implementation is removed
- **THEN** the app-side remote puzzle type keeps the same shape
- **AND** no `src/screens/`, `src/dialogs/`, `src/puzzle/puzzle.ts`,
  drawing-canvas, or `src/store/` code changes to consume it

### Requirement: The midend reconciles persisted Ui across state transitions

The `Game` interface SHALL provide an optional
`changedState(ui, oldState, newState)` hook — the idiomatic rendering of
upstream's `game_changed_state` — by which a game derives any persisted Ui that
tracks the current state (e.g. a working-input row reconstructed from the latest
move). The midend SHALL invoke it, mutating the live `ui` in place, after every
**real** state transition it processes — a move, undo, redo, solve, and restart —
and once at new-game setup with `oldState = null`, and SHALL invoke it **before**
computing animation/flash durations and before the post-transition repaint so the
reconciled Ui is what the frame and the next input see. The midend SHALL NOT
invoke it on a bare `UI_UPDATE` (no state changed; the user is mid-edit). A game
that omits the hook SHALL behave exactly as before (the midend treats the absent
hook as a no-op).

#### Scenario: The hook fires on a move and reconciles the Ui

- **WHEN** the midend applies a move that produces a new state
- **THEN** it calls `changedState(ui, prevState, newState)` before the repaint,
  and the mutated `ui` is the one passed to `redraw`

#### Scenario: The hook fires on undo and redo

- **WHEN** the midend processes an undo or a redo
- **THEN** it calls `changedState(ui, prevState, restoredState)` so a Ui that
  tracks state is reconstructed for the restored position

#### Scenario: The hook does not fire on a UI-only update

- **WHEN** `interpretMove` returns `UI_UPDATE`
- **THEN** the midend repaints without calling `changedState` (the persisted Ui
  is left exactly as `interpretMove` mutated it)

### Requirement: The engine supports per-game user preferences

The engine SHALL support per-game user preferences, the idiomatic-TS
realization of upstream's `get_prefs`/`set_prefs`. The `Game` interface
SHALL define an **optional** declarative `prefs` member: an ordered list
of preference items, each carrying a stable keyword (`kw`), a
human-readable `name`, a discriminated `type` (`"boolean"` or
`"choices"`, with `choices` items carrying the ordered choice labels),
and `get`/`set` accessors that read and write the preference's value on
the game's **`Ui`** value (preferences live on the `Ui`, exactly as
upstream stores them on `game_ui`, so `interpretMove` and `redraw` see
them). A game with no preferences SHALL omit `prefs`, and the engine
SHALL report an empty preferences set for it — the correct behavior for
the four-plus existing ports, not a stub.

The `Midend` (and the `EngineCore` surface it implements) SHALL expose
`getPreferencesConfig()`, `getPreferences()`, and `setPreferences(values)`
that translate the declarative `prefs` to and from the app's existing
`ConfigDescription`/`ConfigValues` shapes: a `boolean` item maps to a
boolean value, a `choices` item maps to the selected zero-based numeric
index. `setPreferences` SHALL apply only the keys present in the supplied
values (leaving others unchanged), coerce each value to its item's type,
and request a repaint (a preference such as "highlight crossed edges"
changes rendering). The `TsWorkerPuzzle` worker adapter SHALL delegate
these three methods to the engine, so the app's existing
`puzzle-preferences-form` and per-puzzle IndexedDB persistence drive a TS
game's preferences with no app-shell change.

Because the midend recreates the `Ui` (`newUi`) on every new game / load
/ game-from-id, the midend SHALL retain the last-applied preference
values and re-apply them after each `Ui` recreation, so a player's
preference survives starting a new game (upstream keeps one `game_ui`
across new games; this reproduces that effect). Preferences SHALL NOT be
written into the save file (they are app-level, persisted per puzzle by
the existing settings store). The engine SHALL NOT carry a binary
`savePreferences`/`loadPreferences` surface. It existed only to mirror
upstream's `midend_serialize_prefs` across the C/WASM boundary; the app has
never used it for persistence, and the TS adapter answered it with an empty
buffer — a method that silently returned nothing rather than refusing, which is
worse than its absence. If an import/export feature is ever wanted it SHALL
choose its own wire format rather than inherit the C's.

#### Scenario: A game declares preferences and the app drives them unchanged

- **WHEN** a registered TS game declares a `prefs` list and the user opens
  the puzzle preferences form
- **THEN** `getPreferencesConfig()` returns a `ConfigDescription` whose
  items reflect the declared keywords, names, types, and choice labels
- **AND** `getPreferences()` returns the current value of each preference
  (boolean, or the numeric index for a choice) read from the live `Ui`
- **AND** toggling a preference calls `setPreferences(...)`, which writes
  the new value onto the `Ui` and repaints

#### Scenario: A preference survives a new game

- **WHEN** the user changes a preference and then starts a new game of the
  same puzzle
- **THEN** the freshly created `Ui` carries the player's chosen
  preference values, not just the `newUi` defaults

#### Scenario: A game with no preferences reports an empty set

- **WHEN** the engine is asked for the preferences of a game that omits
  `prefs` (e.g. Flip, Galaxies)
- **THEN** `getPreferencesConfig()` returns an empty item set and
  `getPreferences()` returns an empty value map, with no error

#### Scenario: A preference change repaints even when no board state moved

- **WHEN** the user toggles a preference that affects only rendering
  (e.g. Untangle's vertex style or crossed-edge highlight), changing no
  vertex position
- **THEN** the midend forces a full repaint (dropping the per-frame draw
  cache, as for a palette/font change) so the new appearance shows
  immediately rather than being skipped by the game's redraw early-out

### Requirement: The midend retains generator aux info for Solve

The `Midend` SHALL retain the solver-shortcut `aux` info a game's
`newDesc` returns (upstream `aux_info`) and pass it to the game's
`solve(orig, curr, aux)`. The `aux` SHALL be retained for a freshly
*generated* game (both `newGame` and a random `<params>#<seed>` id). The
retained `aux` SHALL be cleared for
a descriptive `<params>:<desc>` id and for a loaded save (where no aux is
available), so a game whose solver requires aux correctly reports the
solution as unknown for those — faithful to upstream, where Solve is
available only for a game generated in the current session.

#### Scenario: Solve uses the generator's aux on a freshly generated game

- **WHEN** a game is started from `newGame` or a `#seed` id and the user
  invokes Solve
- **THEN** the midend passes the retained `aux` to the game's `solve`,
  and a game that uses it solves the board

#### Scenario: Solve is unavailable on a loaded game

- **WHEN** a game requiring aux for Solve is loaded from a save (no aux)
  and the user invokes Solve
- **THEN** the midend passes `undefined` aux and the game reports the
  solution is not known, leaving the board unchanged

### Requirement: The Untangle port exposes its three preferences via the hook

The Untangle port SHALL expose its three upstream preferences through the
`prefs` hook: **snap-to-grid** (boolean), **show-crossed-edges**
(boolean), and **vertex-style** (a two-way choice, Circles/Numbers).
Lacking an in-app default-divergence mechanism beyond `newUi`, the port's
`newUi` SHALL set the shipped defaults: **show-crossed-edges ON** (it
doubles as the built-in mistake feedback), snap-to-grid OFF, and
vertex-style Circles. The keywords SHALL match upstream
(`snap-to-grid`, `show-crossed-edges`, `vertex-style`) for tidiness.

#### Scenario: Untangle preferences round-trip through the engine

- **WHEN** `getPreferencesConfig()` is called for a registered Untangle
  game
- **THEN** it returns three items — two booleans and one two-choice — and
  `getPreferences()` reports show-crossed-edges true by default
- **AND** `setPreferences({ "show-crossed-edges": false })` turns off the
  crossed-edge highlight and repaints, leaving the other two unchanged

### Requirement: The app shell shows a non-blocking, responsive reference panel

The app shell SHALL render a reference control in the same toolbar button group as Hint,
shown only when `hasReference` is true. Activating it SHALL toggle a `<reference-panel>`
open and closed like a disclosure (not a one-shot modal).

The panel SHALL be **non-blocking** and keep the board visible and interactive while open,
in both layouts:

- When there is room to dock beside the board — a wide viewport that is **not** in the
  app's short-landscape "horizontal" orientation — the panel SHALL dock beside the board
  (the board reflowing to make room), with no scrim over the board.
- On a narrow viewport, **or** in the app's "horizontal" orientation (short landscape,
  where a side dock would shove the board off-center against the toolbar column), the panel
  SHALL present as a bottom sheet, leaving the board visible and centered above it, with an
  explicit close affordance and no scrim.

The panel SHALL render each `ReferenceItem` with status-distinct styling (drawing `pips` as
piece faces when present, else `label`), reflect found status **live** as the board changes,
and on clicking an item SHALL toggle its selection and call `selectReference` with that item's
`key` (or null when deselecting). Selection feedback in the list SHALL be immediate and SHALL
NOT wait on the asynchronous model refresh.

The board spotlight SHALL **persist when the panel is closed** — on a small screen the common
flow is to mark a piece, close the (large) panel to see the board, then act on the highlight,
so closing MUST NOT clear it. The primary dismiss is therefore a **board interaction**: acting
on the board clears the spotlight (a game clears it in `interpretMove` on any board tap — the
discoverable, touch-friendly clear). Additionally, the **Escape** key SHALL clear it whether the
panel is open (leaving the panel open) or closed, and re-clicking the selected item also clears
it.

#### Scenario: The control appears only for a reference-bearing game

- **WHEN** the active game reports `hasReference` true
- **THEN** a reference toggle button is shown next to Hint; for a game reporting false, no
  such button is shown

#### Scenario: The panel keeps the board interactive and updates live

- **WHEN** the panel is open and the player places or removes a piece on the board
- **THEN** the board input is unaffected by the panel and the panel's checklist status
  updates to reflect the new board state without being reopened

#### Scenario: Clicking an item spotlights it on the still-visible board

- **WHEN** the player clicks an outstanding item in the open panel
- **THEN** the item shows as selected immediately and the board (still visible beside or
  above the panel) highlights that item's occurrences; clicking it again clears the highlight

#### Scenario: The spotlight persists after close and clears on Escape

- **WHEN** a reference item is spotlighted and the player closes the panel
- **THEN** the board spotlight remains (so the player can act on it with the panel out of the way)
- **WHEN** a reference item is spotlighted and the player presses Escape (panel open or closed)
- **THEN** the spotlight is cleared — and if the panel is open its item is deselected and it stays open

### Requirement: The engine serializes Ui state a move-log replay cannot reconstruct

The engine SHALL support optional `encodeUi(ui): string` / `decodeUi(ui, encoded): void`
`Game` hooks (upstream `encode_ui`/`decode_ui`). The midend SHALL write `encodeUi(ui)` into
the save envelope's `ui` field when the hook is present, and — after rebuilding state 0 and
replaying the move log on load — SHALL restore it via `decodeUi`. A game without the hooks
SHALL save no `ui` field, and its `Ui` SHALL be reconstructed from `newUi` plus the replay
alone.

This exists because a `Ui` field that lives **outside** the undo history and is set by
`interpretMove` cannot be recovered by replaying the move log: replay goes through
`executeMove`, never `interpretMove`. Mines' persistent death counter is exactly such a
field — dying and then undoing removes the death from the move log — so without ui
serialization the count would reset on every save/restore. Guess's half-composed row and its
live holds are another: a row reaches the log only when it is submitted.

The midend SHALL also **report** that encoding to the app, on the `game-state-change`
notification, for a game that has the hook and not otherwise. Writing the hook is not enough
on its own, because the app takes a save when something it watches changes and a `Ui` edit is
not a move — it moves no move index, no game id and no checkpoint. Guess shipped a correct
`encodeUi` whose output nothing ever asked for: the bytes were right, a real page reload came
back with the composed row empty, and every test passed. Reporting the encoding rather than a
"the Ui changed" flag makes the value the app compares **be** the part of the save that would
differ, so nothing re-saves for a change the file would not record, and a game with no
persisted `Ui` reports nothing and costs nothing.

#### Scenario: A persistent Ui counter survives a save

- **WHEN** a game with `encodeUi`/`decodeUi` accumulates ui-only state (Mines' death count),
  is saved, and reloaded
- **THEN** the reloaded game shows the same ui-only state, even though the move log alone does
  not contain it

#### Scenario: A game's saveable Ui is reported with every state change

- **WHEN** a game declaring `encodeUi` reaches any state change
- **THEN** the `game-state-change` notification carries that game's current encoding, and a
  game declaring no `encodeUi` carries none

#### Scenario: A Ui edit that is not a move is reported

- **WHEN** a player composes part of a Guess row, which is a `UI_UPDATE` and not a move
- **THEN** the reported encoding changes, while moving the keyboard cursor — which the save
  does not record — leaves it unchanged

### Requirement: The engine owns its type vocabulary and depends on nothing above it

The engine's shared puzzle vocabulary SHALL live under `src/engine/` and SHALL be imported *from* there by the app; it SHALL NOT live in the app layer and be imported upward by the engine and the games.

The vocabulary is `Color`, `Point`, `Size`, `Rect`, `KeyLabel`,
`PresetMenuEntry`, `DrawTextOptions`, `ConfigDescription` and the change
notifications the engine emits.

These declarations are parts of contracts the engine states: `Color` is what a
game's `colors()` returns, and `Rect`/`Point`/`Size` are the drawing API's
coordinate records. They sat in `src/puzzle/types.ts` for a historical reason —
they were re-exported from the Emscripten-generated `emcc-runtime.d.ts`, so the
root of the type graph was a generated file in a gitignored assets directory, and
`retire-c-engine` hand-authored them in place precisely so that none of the 201
importers had to change while it proved nothing else moved.

The consequence, measured on 2026-08-02: **182 files under the engine and the
games imported the app layer**, and the layering check could not see it, because
its rule named `screens/`, `dialogs/` and `components/` and the imports went
through `src/puzzle/`.

Correspondingly, the Comlink-facing adapter (`TsWorkerPuzzle`, implementing
`PuzzleEngineSurface`) SHALL live on the app side of the seam, in `src/puzzle/`,
not inside `src/engine/`. It exists to present the engine in the shape the app's
`Puzzle` expects; an adapter belongs with the thing being adapted *to*, and it
was the only production module under the engine importing upward.

Together these two placements make the invariant in the `repo-layout` layering
requirement — the engine and games import nothing under `src/` outside their own
two directories — hold with **no exceptions and no allowlist**, which is what
makes it enforceable rather than aspirational.

#### Scenario: A game imports the drawing vocabulary

- **WHEN** a game's `render.ts` needs the `Color` type for its `colors()`
- **THEN** it imports it from the engine
- **AND** no module under `src/engine/` or `src/games/` imports from
  `src/puzzle/`, `src/utils/`, `src/store/` or any other app directory

#### Scenario: The app consumes the engine's vocabulary

- **WHEN** a Lit component or the main-thread `Puzzle` needs `Rect` or
  `PresetMenuEntry`
- **THEN** it imports them from the engine, the dependency running app → engine
- **AND** the direction is checked automatically, not by convention

### Requirement: A game rejects a move it cannot play, rather than guessing

`Game.executeMove` SHALL reject a move that its dispatch does not recognize, by
throwing an error naming the game and the move. It SHALL NOT return a state it
did not compute from that move, SHALL NOT return a non-state, and SHALL NOT
treat the move as a no-op.

The move reaching `executeMove` is not guaranteed to be a member of the game's
move union: `SaveEnvelope.moves` is `unknown[]` and is cast on replay, not
parsed, so a save written by another build supplies an off-union value that type
checking cannot exclude.

Where the game's move type is a discriminated union, the dispatch SHALL be
written so that an unhandled union member is a **compile-time** error — a
`switch` whose catch-all binds the move to `never` (`assertNever`). A bare
`default` that throws is insufficient, because its presence makes the function
total for the type checker and so surrenders the exhaustiveness guarantee it was
added to reinforce.

Where a game's move is not a union, it SHALL validate the fields its dispatch
depends on and throw in the same form.

#### Scenario: A move from another build is refused, not misread

- **WHEN** a saved game is replayed whose move log contains a move this build's
  dispatch does not recognize
- **THEN** `executeMove` throws an error naming the game, the midend refuses the
  save, and the board is left playable

#### Scenario: An unrecognized move is never silently ignored

- **WHEN** such a move is replayed in a game whose dispatch previously had a
  tolerant catch-all
- **THEN** the save is refused rather than loaded as a board differing from the
  one that was saved

#### Scenario: Adding a move type without handling it fails to compile

- **WHEN** a member is added to a game's move union and no dispatch arm handles it
- **THEN** the type checker reports the error at that game's `executeMove`

### Requirement: The Game contract carries no capability without a consumer

Every optional member of the `Game` interface SHALL have at least one game
implementing it and at least one consumer reading it, and the two SHALL be
checked separately, because they fail differently: no implementer means dead
weight in the interface, while no consumer means every implementer wrote code
that never runs.

A capability with no consumer is worse than absent: game code written against
the documented contract reads as protection while doing nothing, and the gap is
invisible until the day the capability is first genuinely needed.
`validateParams`'s `full` flag was passed a literal `true` by all four
production call sites while sixteen games gated a bound on it, three of them
with comments describing the behavior that was not happening — and it silently
refused game IDs a game had deliberately kept loadable.

A member whose only consumer is a cross-game guard is permitted, since such a
guard is a real reader — `Game.difficulty` exists precisely so a property about
difficulty tiers can be asserted for every tiered game at once — but SHALL be
recorded as such with its argument. A member with **no** consumer SHALL be
recorded with the change that owns the decision to wire it up or remove it; an
entry with no owning change is the accumulation this requirement exists to
prevent.

Consumers SHALL be derived from the source's syntax tree rather than by matching
text, because a comment is not a consumer: `needsRightButton`'s only mention
outside the games is a commented-out line proposing to read it. A value copied
into a field of the same name SHALL NOT count as a consumer, since relaying is
not reading.

#### Scenario: An optional hook nothing invokes is reported

- **WHEN** a member of the `Game` interface is implemented by one or more games
  but read by no engine or app-shell call site
- **THEN** the check reports it, naming the number of implementers whose code
  cannot run

#### Scenario: An optional hook no game implements is reported

- **WHEN** an optional member of the `Game` interface has no implementer
- **THEN** the check reports it as surface to remove

#### Scenario: A recorded exception that has stopped being true is reported

- **WHEN** a member recorded as having no consumer acquires one
- **THEN** the check fails, so the record is corrected rather than left
  describing a finding that no longer exists

#### Scenario: The check states how much it inspected

- **WHEN** the check runs
- **THEN** it asserts the number of interface members it examined, the number of
  modules it scanned for consumers, and the size of the registry it read
  implementers from, so a sweep that silently matched nothing cannot report
  success

### Requirement: The static-attributes relay carries no field the app does not read

Every field of `PuzzleStaticAttributes` SHALL be read by the app shell, and a
check SHALL assert it. A field with no app reader SHALL be removed, or recorded
with the change that owns the decision to give it one.

This is the sibling of the rule that the `Game` contract carries no capability
without a consumer, and it needs stating separately because the two contracts
fail independently: every field here is produced by `Midend.getStaticProperties`
and relayed under the same name into a `Puzzle` field, so the chain is easy to
extend and its far end is easy to forget. Two of the original nine fields turned
out to have no reader — `canConfigure`, which the midend answered with a literal
`true` while it gated the type menu's "Custom type…" entry, and `displayName`,
which `Puzzle` overrode from the catalog on every reachable path.

The check SHALL count only reads from outside the engine, because the two
contracts share field names: `canMarkAll` is also a `Game` member, so an engine read of `game.canMarkAll` would otherwise vouch for an app field nothing touches.

#### Scenario: A relayed field the app never reads is reported

- **WHEN** a `PuzzleStaticAttributes` field has no app-shell reader
- **THEN** the check reports it by name, so the midend stops computing and
  shipping a value for nobody

#### Scenario: The check states how much it inspected

- **WHEN** the check runs
- **THEN** it asserts the number of fields it examined and the number of
  app-shell modules it scanned, so a sweep that silently matched nothing cannot
  report success

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

### Requirement: A cross-game sweep SHALL take its boards from the shared slice, not build them

A test that walks the collection SHALL obtain the boards it walks from the one
shared preset enumeration, and SHALL NOT construct a population of its own out
of a game's parts.

The rule already said that any cross-game sweep over presets asks the same
question and derives the answer from the game. What it did not say is where the
answer comes from, and so **every such sweep but one answered it for itself, and
all of those answered it wrong**. They read `firstLeaf(game.presets())` — by
convention the smallest and easiest board a game offers — or synthesized params
from it with a `withTier` that writes the tier field and nothing else. Measured
2026-09-20 over the live registry: no board any of them had ever run on carried
a cage, a jigsaw block, an X diagonal, an Adjacent clue, a Tectonic region, a
multiplication-only Keen or any Loopy tiling but Squares. Three have *narration*
as their subject, while Killer alone adds four cage sentences.

Three of them sat inside the very file whose main walk had already been widened,
which is why the rule has to name the shared function rather than the finding: a
sweep that was fixed once is not a sweep that stays fixed.

**Which sweeps still build their own boards SHALL be derived and ledgered, not
counted in prose.** A scan of the suite's own comment-stripped sources for the
two calls names the files, and each is held to an entry saying which behavior
needs a params record the presets menu does not offer. A guide sentence could
not have stopped the next sweep, which is written by copying a neighbor.

**A shared decision keeps its cost discipline in one place too.** A hint that
plans by *searching* pays for board size twice over — one full search per move,
and more moves to make — so the shared function gives those games every mode on
the smallest board offering it and no large board at all, derived from the same
axes as everyone else's slice. The count it replaced was a number of presets to
keep, chosen because three happened to reach Netslide's three barrier modes,
which stops being true the day Netslide gains a fourth.

**Widening a sweep is not license to widen what it asserts.** The same
assertions run over more boards; a rule that then fails has found either a
defect or a vocabulary its own subject uses and it had never heard, and both are
findings.

#### Scenario: A sweep is written that walks the collection

- **WHEN** a new cross-game test needs a board per game
- **THEN** it calls the shared slice, and gains every game's every mode from
  that commit with no key of its own to maintain

#### Scenario: A sweep is written that builds its own boards anyway

- **WHEN** a test file calls `firstLeaf` or `withTier` and is not in the ledger
- **THEN** the suite scan fails, naming the file and the guide section, and the
  author either calls the slice or writes down which behavior needs the record
- **AND** an entry left behind by a file that stopped doing it fails the same
  check from the other side

#### Scenario: A guard's own population is synthesized from a base preset

- **WHEN** a cross-game guard builds its boards by writing a tier onto one
  preset's params
- **THEN** that is the tell of a population the games did not offer, and the
  guard is re-keyed on the presets menu — unless its subject is what a *params
  record* does rather than what a *board* carries, which it SHALL say at the
  site

#### Scenario: A hand-maintained roster patches the narrow population

- **WHEN** a guard carries a per-game entry naming a bigger or different preset
  to use, because the population it built is too small to reach the behavior
- **THEN** reading the presets menu retires the roster, because the board the
  entry named by hand is the board the derivation picks: `hint-ordinal`'s
  `{ solo: "3x3 Extreme" }` went that way, Extreme being a value of Solo's
  difficulty axis and `3x3 Extreme` the smallest preset offering it

#### Scenario: A lexical narration rule meets a construction it has never heard

- **WHEN** a rule that recognizes narration by vocabulary is run over the modes
  and tiers for the first time
- **THEN** a phrasing the collection has used all along may fail it, and the
  vocabulary is extended with the reason rather than the sentence being
  flattened to fit: *"can take one line at most"* is a proved bound and *"none
  of its remaining edges can be walls"* is a negated possibility, each written
  by five or more games
- **AND** where the wording is owner-endorsed, it is recorded as a declared
  idiom rather than rewritten

#### Scenario: A guard needs a configuration the presets menu does not offer

- **WHEN** the behavior a guard observes needs a params combination no preset
  carries — a small grid at a hard tier, which a menu never pairs because menus
  climb size and difficulty together
- **THEN** the guard walks the slice **and** that combination, and says which
  behavior needs it: Keen emits an ordered chain on none of its ten presets at
  eight seeds each, and readily on the 4x4 its first preset gives once the tier
  is turned up, a board the Custom dialog offers and `validateParams` accepts

### Requirement: The engine supports an ephemeral, opt-in mistake-checking hook

The engine SHALL support a UI-only, ephemeral mistake-checking facility,
shaped like the Hint System. The `Game` interface SHALL define an
optional `findMistakes(state)` method returning the cells of the current
state that contradict the puzzle's unique solution as game-specific
highlight data (an empty result means no detectable mistakes). The
method SHALL be pure (no state mutation).

A game whose state carries **candidate/pencil annotations** (e.g. Towers) MAY
report **annotation-level** contradictions as mistakes, consistently with how a
placed value is reported: a non-empty candidate set that **excludes** the cell's
unique-solution value (the player has crossed out the correct answer) is a
contradiction and MAY be returned, whereas a candidate set that merely holds
extra, non-solution candidates is ordinary mid-solve state and SHALL NOT be
reported. The solution such a game checks against SHALL be derived from the
committed placements only, never from the annotations themselves (an annotation
can be wrong — that is precisely what is being checked). This makes pencil notes
first-class markings, so the existing Check-&-Save gate (which refuses a save
while `findMistakes` is non-empty) refuses a board carrying an invalid note
exactly as it refuses a wrong placed value.

The `Midend` SHALL, on `findMistakes()`, call the game's hook, store the
result as `activeMistakes` (midend-only, never in game state, never
persisted), pass it to the game's `redraw`, and return the **count** of
flagged cells. `activeMistakes` SHALL be displayed until the next state
transition and SHALL be cleared on the same events that clear an active
hint (a player move, undo, redo, restart, new game, solve, and reaching
the solved state). A game that does not implement `findMistakes` SHALL
report it as unavailable.

The engine surface SHALL expose `canCheck` (true iff the game implements the
hook or has a hint) in its static attributes, and SHALL reach the hook through
`check()`, which asks it first. For a game that does not implement the hook,
the midend's `findMistakes()` SHALL return 0, and `check()` SHALL report that no
mistakes were checked.

#### Scenario: Checking a board with mistakes

- **WHEN** the user invokes `findMistakes()` on a game that implements
  the hook and the current state has cells contradicting the solution
- **THEN** the midend stores those cells as `activeMistakes`, schedules a
  repaint that draws them highlighted, and returns the count (> 0)
- **AND** the highlight remains until the next state transition

#### Scenario: Checking a clean board

- **WHEN** the user invokes `findMistakes()` and no cell contradicts the
  solution
- **THEN** the count returned is 0 and nothing is highlighted

#### Scenario: A transition clears the mistake display

- **WHEN** `activeMistakes` is displayed and the user makes a move,
  undoes, redoes, restarts, starts a new game, or solves
- **THEN** the midend clears `activeMistakes` and the next repaint draws
  no mistake highlights

#### Scenario: A game without the hook reports no capability

- **WHEN** the active game does not implement `findMistakes`
- **THEN** `findMistakes()` returns 0, `check()` reports no mistakes checked,
  and `canCheck` is true only if the game has a hint to ask

#### Scenario: A candidate annotation that excludes the solution is a mistake

- **WHEN** a game with pencil/candidate annotations reports mistakes on a state
  where an undecided cell's non-empty candidate set excludes that cell's
  unique-solution value
- **THEN** `findMistakes` includes that cell
- **AND** a cell whose candidate set still contains the solution value (with or
  without extra candidates) is not included
- **AND** Check-&-Save refuses to quick-save the board while such a cell exists

### Requirement: The engine surface exposes an opt-in per-game reference-aid capability

The engine surface SHALL expose an optional per-game "reference aid": a read-only
checklist of a puzzle's fixed inventory of pieces with found/outstanding status, plus a
way to spotlight one item on the board.

The `Game` interface SHALL define two optional hooks:

- `reference(state, ui): ReferenceModel` — returns a plain, serializable model of the
  inventory. `ReferenceModel` SHALL be `{ items: ReferenceItem[]; selected: string | null;
  columns?: number }`, and `ReferenceItem` SHALL be `{ key: string; label: string; pips?:
  readonly number[]; status: "outstanding" | "placed" | "conflict" }`. `key` is a stable id;
  `pips` is optional face-value data for games whose pieces render as pips; `selected`
  echoes the currently spotlighted key (or null).
- `selectReference(ui, key): boolean` — spotlights the item `key` (or clears it when `key`
  is null) by mutating `Ui`, and returns whether anything changed.

The `Midend` SHALL surface `hasReference = this.game.reference !== undefined` in its static
attributes, and SHALL provide `getReference(): ReferenceModel | null` (returning
`game.reference(state, ui)` or null) and `selectReference(key): void`. `selectReference`
SHALL call `game.selectReference(this.ui, key)` and, on a `true` return, take the same
repaint path as a `UI_UPDATE`: it SHALL NOT create a move, add an undo entry, alter the move
log, or be serialized into a save. For a game that does not define `reference`,
`hasReference` SHALL be false,
`getReference()` SHALL return null, and `selectReference()` SHALL be a no-op.

`hasReference`, `getReference`, and `selectReference` SHALL be part of the shared
`PuzzleEngineSurface`, so the app reaches them through the same surface as every other
engine call.

#### Scenario: A game exposing a reference is discoverable through the surface

- **WHEN** the active game defines `reference` and the app queries static attributes
- **THEN** `hasReference` is true and `getReference()` returns the game's model, whose
  `items` reflect current board state and whose `selected` matches the spotlighted key

#### Scenario: Selecting a reference item repaints without a history entry

- **WHEN** the app calls `selectReference(key)` on a game whose `selectReference` reports a
  change
- **THEN** the board repaints with that item spotlighted, and no move is added — the move
  log, undo/redo availability, and any subsequent save are byte-for-byte identical to before
  the call

#### Scenario: A game without a reference aid reports none

- **WHEN** the active game does not define `reference`
- **THEN** `hasReference` is false, `getReference()` returns null, `selectReference()` does
  nothing, and no reference control is shown

### Requirement: Absence has one spelling

A value this tree declares as possibly absent SHALL be typed `T | null`. `undefined` SHALL NOT be written as a member of a union type in any tracked TypeScript file — not in a return, parameter, member, variable, alias or type argument. A parameter or member that may be left out SHALL be written `?`, and a value the language produced as `undefined` (`?.` over an optional member, `Map.get`, `Array.find`, an index read) SHALL be converted with `?? null` where it enters a declared type. A cast (`as`, `satisfies`, a type assertion) describes a value rather than declaring one and is exempt.

Where one value has two distinct kinds of nothing, each SHALL be a named state — a string literal or a unique symbol — and SHALL NOT be told apart by the language's two words. A function that can fail and has nothing to return on success SHALL return its reason or `null`; a function that returns a value on success SHALL return a discriminated result, `{ ok: true; … } | { ok: false; error: string }`, so that a refusal cannot hide inside the value.

What a save or a stored setting means SHALL NOT change to satisfy this rule.

#### Scenario: A helper that may find nothing

- **WHEN** a new helper returns a lookup that may miss
- **THEN** it declares `T | null`, and a declared `T | undefined` fails `scripts/checks/absence-spelling.mjs` naming its file and line

#### Scenario: A key with two kinds of nothing

- **WHEN** Crossing reads a key while its cursor is shown
- **THEN** `keyDigit` returns the digit for `1`–`9`, `"clear"` for Backspace, Delete, `0` or the secondary select, and `null` for any other key
- **AND** a `?? fallback` written against the result cannot merge a clear into an ignored key

#### Scenario: The engine surface reports a refusal

- **WHEN** the app calls `setParams`, `setCustomParams`, `newGameFromId`, `loadGame`, `solve`, `hint` or `executeHint` through the worker
- **THEN** the answer is the refusal's text or `null`
- **AND** `setPreferences`, which cannot fail, returns nothing

#### Scenario: A preview whose answer is itself a string

- **WHEN** the Custom dialog asks `encodeCustomParams` for the params its values describe
- **THEN** it receives `{ ok: true, params }` or `{ ok: false, error }`, and no refusal is carried inside a params string

#### Scenario: A stored null is not an unset setting

- **WHEN** a common setting stores `null` as its value
- **THEN** the settings store reads it back as `null` and gives the default only to a key nobody stored, which it reads as `UNSET`

### Requirement: A refused Solve is shown in the help banner

A Solve the engine refuses SHALL show the refusal's own text in the same
transient banner a refused Hint uses, whichever control asked for it, and in every game
that offers Solve — including a game with no hint, whose banner therefore
cannot depend on the hint controls being rendered. A Solve that lands SHALL add
no message of its own.

Solve applies a move, so it SHALL be ordered with the other queued input: a
Solve pressed while an Auto-Hint step is being applied lands after that step,
never inside it.

The refusal's wording is the collection's (see "Solve failures are worded once
for the whole collection"), and is not rewritten by the app.

#### Scenario: Solve on an unstarted Mines board

- **WHEN** the player presses Solve on a fresh Mines board, before the first
  click
- **THEN** the banner says there is nothing to solve until the first move lays
  the board out, and the board is unchanged

#### Scenario: A Solve that lands shows no banner

- **WHEN** the player presses Solve and the game's solver solves the board
- **THEN** the board shows the solution and no banner message is added

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

### Requirement: A boolean capability flag is held to the behavior it claims
The `Game` interface MAY carry a boolean capability flag **only** where a production consumer needs the answer synchronously and cannot observe it. Every such flag SHALL be asserted equal to a derivation of the fact it declares, so a flag that is forgotten, left behind by a changed game, or simply wrong fails a test rather than going unnoticed.

The flags the contract carries SHALL be held as follows:

- `ignoresSecondaryButton` SHALL be set if and only if the game consumes no `RIGHT_BUTTON` press anywhere on its board.
- `canMarkAll` SHALL be set if and only if the game's `interpretMove` returns a move for an `M` press.

A flag whose effect is to **disable** a guard or a frontend behavior SHALL carry such a check, because nothing else observes it when it lies.

A source scan standing in for a derivation SHALL read the game's code with comments removed: a mention in prose is not a use.

#### Scenario: A flag declared against the behavior fails
- **WHEN** a game sets `ignoresSecondaryButton` but a right-button press changes its board somewhere
- **THEN** `input-parity.test.ts` fails, naming the game

#### Scenario: A flag the behavior calls for but the game omits fails
- **WHEN** a game's `interpretMove` answers an `M` press with a move but the game does not set `canMarkAll`
- **THEN** `mark-all.test.ts` fails, naming the game

### Requirement: Solve failures are worded once for the whole collection

A refused `Game.solve` SHALL return one of the collection's Solve failures, and
its type SHALL admit no other string, so that a game cannot word one itself. The
set SHALL distinguish, at minimum: the board is finished; the solver could not
settle the puzzle; the puzzle provably has no solution; it provably has more
than one; no finish can be found from the player's position; the game ID carries
no solution and the game has no solver; and the board is not dealt until the
first move.

A failure claiming the puzzle has no solution, or more than one, SHALL be
returned only where the solver established it. Where a solver's verdict does
not tell impossible from gave-up, the failure SHALL be the one that says the
solution cannot be determined, which is true either way.

A fact a hint can also meet SHALL be worded the same for both: the finished
board, the puzzle that cannot be settled, the position nothing finishes from,
and the game ID with no solution are each one message whichever control asked.

The midend SHALL refuse Solve on a board whose status is solved, with the
finished-board failure, and on a board whose status is lost, with the game-over
refusal a hint gives there, without asking the game.

#### Scenario: Two games fail to solve for the same reason

- **WHEN** two games' solvers each prove a typed game ID has no solution
- **THEN** both refusals read the same

#### Scenario: A game's own sentence does not compile

- **WHEN** a game's `solve` returns `{ ok: false, error: "Sorry, I can't" }`
- **THEN** the typecheck fails

#### Scenario: Solve on a finished board leaves the win alone

- **WHEN** the player's own moves have solved the board and Solve is invoked
- **THEN** it is refused as already solved, the game's solver is not asked,
  and the status stays solved rather than solved-with-help

#### Scenario: A hint and Solve name one dead end alike

- **WHEN** Inertia's ball can no longer collect every gem, and the player asks
  for a hint and then for the solution
- **THEN** both refusals are the same message

### Requirement: The status bar's completion words come from the engine

A status bar that says the board is finished, or that the solver was used, SHALL
take those words from the engine's one helper, which distinguishes four states:
neither; finished by the player; finished by the solver; and helped by the
solver but no longer finished. The midend SHALL prefix them to whatever the
game's `statusbarText` returns, from the board's status now and its own record
that the solver was used. A game SHALL NOT write the words itself, and this
SHALL be asserted by scanning the strings games write for what the words say,
not for a constant's name.

#### Scenario: A helped board the player has moved off

- **WHEN** a player uses Solve and then moves the board off its solution
- **THEN** the status bar says the solver was used, not that the board is
  solved

#### Scenario: Nothing follows the words

- **WHEN** a finished board's status bar has nothing else to say
- **THEN** it reads the completion words with no trailing space

### Requirement: A game's status is judged from the board alone

A game's `status(state)` SHALL report won, lost or ongoing from the position in
`state` alone, never from how it was reached, and SHALL NOT write into the
state. No game's state SHALL record that the board was solved, or that the
solver was used: the midend owns that history and derives it from the positions
it holds. A fact the board shows (a revealed arena, a dead ball, a killed cell)
is part of the position, and `status` MAY read it.

So a board typed in already solved SHALL be solved at move 0, a Solve move SHALL
complete the board because the board it leaves is solved, and a solved board the
player breaks SHALL read ongoing again (owner, 2026-10-01: one rule for every
consumer, with no record of an earlier solve).

#### Scenario: A board typed in already solved

- **WHEN** a game ID describes a board that is already solved
- **THEN** its status is solved at move 0, and the hint refuses it as already
  solved

#### Scenario: A broken solved board

- **WHEN** the player makes a move that takes a solved board off its solution
- **THEN** the status is ongoing, and a board with a mistake on it is never
  reported solved

#### Scenario: A record of completion on the state fails the build

- **WHEN** a game's state carries a field recording that the board was solved
  or that the solver was used
- **THEN** the cross-game guard fails, naming the game and the field

### Requirement: The engine derives a board's history from its position

The midend SHALL ask a game's `status` once per position and SHALL derive from
its own history everything about how the board got there: whether the solver
was used on this board (reported as solved-with-help on a solved board), when
the win flash plays, and the status bar's completion words. The win flash SHALL
play on a forward move, other than the Solve command, that leaves the board
solved when it was not, for the duration the game's `solvedFlash` gives; a
game's `flashLength` SHALL be only for a flash the status does not show, and a
nonzero answer from it SHALL replace the win flash.

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

#### Scenario: An expensive status is asked once per position

- **WHEN** the midend reads the status of a position many times (every timer
  tick, every refusal)
- **THEN** the game's `status` was called once for that position

### Requirement: Every game has a solve timer, and it runs while the board is undecided

The midend SHALL offer a `show-timer` boolean preference ("Show timer") in every
game, beside the game's own `prefs`, on by default; no game declares anything to
have it. While it is on, the midend SHALL count elapsed time only while the
player is solving: after the first move of the board, while the board's status
is `ongoing`, while the game's optional `timerHolds(state)` is not true, and
while the frontend has not paused it (`setTimerPaused`, which the app sets while
the page is hidden). Being decided is a fact about the board on display: a
solved board the player breaks, or undoes out of, SHALL count again (owner,
2026-10-01: a peek at the solution and then solving it oneself is a use of the
app the clock follows). A new board SHALL reset the time. The midend SHALL
report the timer as a `timer-change` notification carrying either `null` (the
timer is off) or the whole seconds elapsed and whether help was taken on the
board, sent only when that readout changes.

Help is the app doing some of the solving, and the midend SHALL count as help:
a hint step shown, the solver used, and the app finding something wrong with
the position, which is mistakes highlighted or a dead end named (owner,
2026-10-04: a check that finds something saves the player the time of finding
it). The last SHALL count alike whether Check, Check & save or the Hint button
asked, and in every game: it is one rule in the midend and no game declares
anything about it. A check that finds nothing, and a refusal that is not a dead
end, SHALL NOT count, so saving a sound board never marks it.

#### Scenario: A game that does not ask for a timer offers one

- **WHEN** a game with no `prefs` of its own, and nothing about a clock, is started
- **THEN** its preferences include `show-timer`, on, and the timer reports zero seconds

#### Scenario: The timer counts from the first move

- **WHEN** the timer is on and a new board is dealt
- **THEN** it does not count until the player's first move, and counts during play after it

#### Scenario: A solve stops the clock while the board stays solved

- **WHEN** a timed board is solved
- **THEN** the timer stops, and counts again once the board is broken or the
  solve is undone

#### Scenario: A peek at the solution stays assisted

- **WHEN** a player uses Solve on a timed board and undoes it
- **THEN** the timer counts again, and its readout reports the board as assisted

#### Scenario: A hidden page does not count

- **WHEN** the frontend pauses the timer and later resumes it
- **THEN** no time is counted in between, and counting continues from where it stopped

#### Scenario: A helped time says so

- **WHEN** a hint is shown on a timed board
- **THEN** the timer's readout reports the board as assisted, until a new board is dealt

#### Scenario: A check that finds something is help

- **WHEN** a check, or a press of Hint, highlights mistakes or names a dead end
- **THEN** the timer's readout reports the board as assisted

#### Scenario: A check that finds nothing is not

- **WHEN** a check passes a board, or cannot settle it past the search's reach
- **THEN** the readout does not report the board as assisted on that account

### Requirement: Solve leaves a solved board

Solve SHALL mean one thing in every game: it shows the finished board, or it
refuses with a reason. The midend SHALL hold every game to it rather than each
game choosing: it SHALL refuse Solve on a board whose status is solved or lost
without asking the game, and when the game's solve move would leave a board
whose status is anything but solved it SHALL throw before the move enters the
history, as a defect in the game.

A Solve SHALL therefore never install a route or marks for the player to
follow, nor reveal an answer as a loss. A game whose solver finds no finish
from the player's position SHALL refuse; a game whose answer is fixed SHALL
replace the player's mistakes with it, as it replaces a wrong entry.

Every game with Solve SHALL be solved, by a test, from its deal and from
positions reached by playing its own input into it.

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

#### Scenario: No finish within the rules is a refusal

- **WHEN** Flood's solver would finish only past the move limit, from moves the
  player has already spent
- **THEN** Solve refuses, saying no solution can be found from this position

### Requirement: A cross-game sweep SHALL deal every choice the Custom dialog offers

The shared preset enumeration a cross-game sweep takes its boards from SHALL deal, beside the slice of the menu, a board for every value of a `"boolean"` or `"choices"` param that no preset holds. A game is dealt on everything its dialog offers by having a `paramConfig`, with no list of games or values kept anywhere.

The slice walks one preset per value the presets vary, so a value the dialog
offers and no preset holds was dealt by no cross-game guard. Salad's hint threw
on 71 of 1,195 Normal boards while all eleven of its presets were Easy. Taken
2026-10-05 over the registry, 54 such values stood in 27 fields of 16 games: a
whole tier in Loopy, Mathrax, Unequal and Group, a rule or mode in ten games,
and the generator's choices of symmetry and density in four.

**Each value SHALL be written onto the first preset, in menu order, that the
params check accepts it on**, so a value costs what the game's cheapest board
costs. That is one field written onto a preset, the form a sweep SHALL NOT use
*instead of* reading the menu; here it is dealt beside the slice, for a value
the menu has no board to read. A tier written onto a small grid is a board the
dialog deals and may not be a hard one, so it is no substitute for a preset at
that tier.

**Every value is dealt, the generator's choices included.** A ledger excusing
the values a hint is unlikely to read was weighed and not built: Bridges, with
22 of the 54, cost 0.7 s across the nine guards that walk the slice before its
values were dealt and 0.9 s after, so the ledger would have saved nothing and
would have been a second copy to keep true.

**A value no preset accepts has no board, and SHALL be held to a ledger** with a
reason an entry, asserted equal to what the derivation finds. The ledger is
empty: ABCD's rule against diagonal touching needs five letters, no ABCD preset
had them, and its menu gained one. A free scalar (`"string"`) is not walked
this way: it has no list of values to hold a menu against, and its ends are the
slice's.

**Whether every value is dealt SHALL be asserted from `paramConfig` and the
dealt boards alone**, not through the derivation that deals them, and SHALL
name known boards by the params they carry.

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

#### Scenario: A value depends on another field

- **WHEN** every preset refuses a value, because the field is valid only with
  another field at a value no preset holds
- **THEN** the census fails naming the game, the field and the value, and the
  author gives the menu a board that carries it, or writes a ledger entry
  saying what does deal it

#### Scenario: A sweep reads the menu by itself

- **WHEN** a cross-game sweep slices or lists a game's presets directly
- **THEN** it deals nothing the menu leaves out, which is right only for a
  sweep whose subject is the menu or the slicing rule

### Requirement: The next board is dealt ahead and kept

The app SHALL deal the board the next New game would deal before it is asked
for, off the thread that serves the board in play, and SHALL keep it until that
New game comes. A New game that finds a board kept for the params it deals at
SHALL play that board without running the generator, and SHALL otherwise wait
for one as "A deal a player waits for runs off the board's thread and can be
stopped" requires.

A deal is slow once a board, and some types take seconds to find one. Kept
ahead, the wait is paid by the first board of a type and by no later one.

A board SHALL be dealt ahead for every type, whatever its deal costs, and one
board SHALL be kept for a type whose deals are quick: a New game that finds
none kept there waits milliseconds.

A type SHALL keep three boards once a deal of it was slow, so that a board
passed over, by New game pressed again straight away, is followed by one
already found. A deal is slow where its generator ran for as long as a New
game may go unanswered before the app says it is looking for a board; the time
SHALL be the generator's alone, and SHALL NOT count starting the thread it ran
on. One slow deal makes the type slow for the rest of the visit, and for a
later visit while a board that was slow to find is still kept: a search for a
rare board ends at the first one it meets, so one quick deal says little about
the next. The boards SHALL be dealt one at a time, and of several kept for a
type New game SHALL play the one kept longest.

A kept board SHALL be keyed by its puzzle and by the full encoding of the
params it was dealt at, which are the params the deal would use after turning
the board to fit the screen. It SHALL be kept across visits, apart from the
player's saved games and settings, and SHALL be handed to one deal only.

A kept board is played as its generator wrote it: its tier is taken on trust
and its `aux` is retained for Solve, as for a board dealt on the spot. It
SHALL therefore be played only by the build that dealt it, and a board another
build kept SHALL read as absent.

A deal ahead SHALL be abandoned when the type it is for stops being the one
the next New game deals, unless a player is waiting for its board. A type
whose deal found no board, whose params the game refuses to deal, or whose
deal the player stopped SHALL NOT be dealt ahead again until a board of it is
asked for.

#### Scenario: The second deal of a slow type arrives at once

- **WHEN** a type whose boards take seconds to find has been dealt once, and
  the board dealt ahead has been found
- **THEN** New game plays the kept board without running the generator
- **AND** another board of that type is dealt ahead

#### Scenario: Boards of a slow type passed over are each followed by a kept one

- **WHEN** three boards are kept for a type whose deal ahead was slow, and New
  game is pressed three times running
- **THEN** each press plays a kept board, the one kept longest first, and none
  runs the generator
- **AND** boards of that type are dealt ahead until three are kept again

#### Scenario: A quick type keeps one board

- **WHEN** a type's deal ahead took less than the time that makes a deal slow
- **THEN** one board is kept for it and no further board is dealt ahead until
  that one is played

#### Scenario: A kept board is for the board as it will be dealt

- **WHEN** the chosen type would be dealt turned on its side to fit the screen
- **THEN** the board dealt ahead is dealt at the turned params
- **AND** a kept board of the unturned params is not played in its place

#### Scenario: A kept board survives a visit and not a build

- **WHEN** the page is reopened by the build that kept a board
- **THEN** New game plays that board
- **AND** a build with another version stamp finds no board kept and deals

#### Scenario: Choosing another type abandons the deal ahead

- **WHEN** a board is being dealt ahead and the player chooses another type
- **THEN** that deal is stopped and one for the new type begins

#### Scenario: A slow deal with no board kept says what it is doing

- **WHEN** New game finds no board kept and no board has been found within a
  second
- **THEN** the app says it is looking for a board until one is dealt, the
  generator gives up, or the player stops the search

### Requirement: A deal a player waits for runs off the board's thread and can be stopped

A New game that finds no board kept SHALL wait on a deal run off the thread
that serves the board in play, and SHALL hand the board that deal finds to the
engine to play as a kept board is played. The engine's own thread SHALL NOT
run a generator for a New game. Where a deal ahead is already under way for the
type, the New game SHALL wait on that deal and SHALL NOT start a second, and
the board it finds SHALL be played and not kept as well.

A generator owns its thread until it returns, and at a Custom size that can be
minutes. Run beside the board, the search leaves the board in play answering
moves, hints and undo, and can be ended where a generator cannot.

While the app says it is looking for a board it SHALL offer a control that
stops the search, reachable by touch, by keyboard and by mouse. The words and
the control SHALL stand apart from the place a hint's words are shown, so that
a hint asked of the board in play does not remove the way out. Stopping SHALL
end the deal at once, leave the board in play and its moves as they were, and
put the type chosen back to that board's, as a deal that found no board does.
A stopped deal SHALL say nothing further.

A deal that found no board SHALL answer with the sentence the engine gives
for a generator that gave up, and SHALL leave the board in play and put the
type chosen back to its type.

A wait SHALL end, without a board, when the player opens another board by its
id or from a save, and SHALL give way to a later New game. Where the type
chosen changes during a wait and no New game follows, the board found for the
type left SHALL NOT be handed to the engine; the wait SHALL go on for the type
now chosen.

Where no board is in play, stopping SHALL fall back as a deal that found no
board does there: the app deals the game's first preset. That deal, having
nothing to go back to, SHALL offer no control to stop it.

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

#### Scenario: A hint during the wait leaves the way out

- **WHEN** the app is looking for a board and the player asks the board in
  play for a hint
- **THEN** the hint's words are shown and the control that stops the search
  is still offered

#### Scenario: A deal that finds nothing says so

- **WHEN** the deal a New game waits on runs its retry bound out
- **THEN** the player is told no board of the type was found, in the engine's
  sentence, and the board in play and its type stay

#### Scenario: Stopping with no board in play

- **WHEN** a page opens on a type whose deal is slow, with no board to show,
  and the player stops the search
- **THEN** the game's first preset is dealt, and that deal offers no control
  to stop it

### Requirement: A restart is a step of the history

`restartGame` SHALL enter the board as it started as the next step of the
history, after the cursor, keeping every step before it. Undo SHALL cross the
step back to the board as it was played and Redo SHALL cross it forward again,
as any other step; a step made after undoing a restart SHALL drop it, as it
drops any step ahead of the cursor. This is upstream's restart
(`midend.c`, `movetype = RESTART`). The port had replaced the history with its
first state since its first midend, with no reason recorded.

The board as it started SHALL be state 0, and for a game that has superseded
its description the board its public description builds ("A game can supersede
its game description mid-play").

A restart SHALL do nothing where nothing has been played since the board
started or was last restarted: at the first position, and at a position a
restart reached. A step there would change nothing on screen and would cost
the steps ahead of the cursor.

**The solver record belongs to a stretch of play.** Whether the solver was used
is one flag of the midend and no part of a state, and a restart is where it
begins again. Each restart in the history SHALL keep the record of the play on
the far side of it from the cursor, and the two SHALL be exchanged whenever
the cursor crosses the restart, so that a board solved with help reads so
again when its restart is undone, and a board solved by hand after a restart
is not marked by a solve made before it.

A restart SHALL NOT reset the solve timer and SHALL NOT hold it: the time is
the time spent on the board. Crossing a restart in either direction SHALL play
no move animation, since the two boards are not one move apart.

The state notification SHALL list the positions restarts reached
(`restarts`).

**The save envelope carries a restart.** Its entry in `moves` SHALL be `null`,
and the envelope SHALL list each restart apart from the moves, as its index
and the solver record it keeps (`restarts`), because a move is the game's own
shape and no marker inside the list could be told from one. The envelope
version SHALL be 3. A version 2 envelope holds no restart and SHALL be lifted
by its version alone. On load a restart SHALL be replayed to the board a
restart made at that point of play reached: one logged before the description
was superseded goes to state 0.

#### Scenario: Undo after a restart returns the moves

- **WHEN** a player makes moves, restarts and presses Undo
- **THEN** the board is as it was before the restart, and further Undo walks
  back through the moves
- **AND** Redo restarts again

#### Scenario: A restart with nothing played does nothing

- **WHEN** a restart is asked for at the first position, with moves ahead of
  the cursor
- **THEN** the history is unchanged and Redo still reaches those moves

#### Scenario: The solver record returns with the moves it belongs to

- **WHEN** a board solved by the Solve command is restarted and solved by hand
- **THEN** its status is solved
- **AND** undoing back across the restart shows it solved-with-help

#### Scenario: A save holding a restart round-trips on either side of it

- **WHEN** a game with a restart in its history is saved with the cursor after
  the restart, or before it, and restored
- **THEN** the restored game has the same position, the same steps each way,
  and the same solver record on each side of the restart

#### Scenario: A save written before a restart was a step opens

- **WHEN** a version 2 envelope is loaded
- **THEN** it restores as it did, with no restart in its history

### Requirement: The board a new one replaces is kept, one deep

When a board in play is replaced, by a deal, an id or a loaded save, the
midend SHALL keep it as a save of itself, and SHALL bring it back when Undo is
asked for at the new board's first position. The board undone from SHALL be
kept the same way, and brought back when Redo is asked for at the last
position of the board Undo returned. A board returns as it was left: its
history and cursor, its time, its help and solver records, and its type as the
type chosen.

**Undo and Redo keep one meaning.** A step of the board in play is taken first
in each direction; the other board lies beyond the first position and beyond
the last. No press means either of two things.

Both kept boards SHALL be dropped at the first step made on the board in play,
a move or a restart, and SHALL NOT be dropped by Undo or Redo. One board is
kept each way: replacing a board drops the board kept before it. Neither is
written to a save or survives the page.

An unplayed copy of the board that replaces it SHALL NOT be kept: nothing of
it is missing. That is what a deterministic deal leaves, and what a page
leaves when it opens a board by id and then that board's autosave.

The board is kept in the midend, and not by the app, because every way a board
is replaced ends in one function there.

The state notification SHALL report whether a board is kept each way
(`boardBefore`, `boardAfter`), SHALL count them in `canUndo` and `canRedo`,
and SHALL number the board in play (`board`): the number changes when the
board is replaced, and a board brought back returns under the number it had,
so that what the app holds per board can follow it.

#### Scenario: Undo on an unplayed new board returns the old one

- **WHEN** a board with moves on it is replaced and Undo is pressed
- **THEN** the old board is in play at the position it was left in, with its
  moves ahead of and behind the cursor, and its time

#### Scenario: Redo returns to the new board

- **WHEN** Undo has brought a board back and Redo is pressed past its last move
- **THEN** the board undone from is in play, and Undo there returns again

#### Scenario: The first move drops the other board

- **WHEN** a move is made on a board that replaced another
- **THEN** undoing that move leaves nothing further to undo

#### Scenario: A deal that finds no board keeps nothing new

- **WHEN** a New game finds no board
- **THEN** the board in play, and the board kept before it, are as they were

### Requirement: A load reports the board once

While the midend replays a save's log it SHALL send no change notification.
When the board is as the save holds it, it SHALL send the board's id, its
params, its state and its status, once each. A replayed step is made as a
player's and is not one: a state reported midway carries a position the
player never sees, and the app keeps what it holds per board (checkpoints,
the autosave) by the states it is told of.

#### Scenario: A long save is one state

- **WHEN** a save of many moves is loaded
- **THEN** one state notification is sent, at the saved position

### Requirement: A cross-game sweep deals each board once

A cross-game sweep that needs a board of given params SHALL take it from
`dealt(game, params, n)` in `src/engine/testing/dealt.ts`, and a sweep that
drives a `Midend` SHALL begin it with `beginDealt`, which hands the midend the
same board by the route New game takes with a board dealt ahead, the generator's
`aux` included. The dealer keeps each board for the life of the worker, so
every sweep in a worker reads one deal of it. A deal that throws SHALL be kept
and thrown again.

A sweep SHALL NOT seed a deal from its own name. Measured 2026-10-08, dealing
and not checking was where the sweeps' time went: following a hint plan to the
end took under 0.1 s on all but three boards of the six dearest games, and
dealing one board took up to 19.5 s, which about a dozen sweeps each did afresh.

Where a property needs more than one board of the same params, the sweep takes
the later ones by `n`. Where it needs a particular board, the board is pinned by
its description and not reached through the dealer.

A game's own tests are not bound by this: the requirement is on the sweeps that
walk every game.

#### Scenario: Two sweeps walk the same preset

- **WHEN** two cross-game sweeps in one worker each walk Group's 8x8 at Hard
- **THEN** the board is dealt once and both walk it

#### Scenario: A sweep drives a midend

- **WHEN** a sweep begins a midend on a dealt board
- **THEN** the midend holds the generator's `aux` for it, as it does for a board
  a player was dealt

#### Scenario: A board cannot be dealt

- **WHEN** the generator runs out its retries on a params set
- **THEN** every sweep asking for that board gets the same refusal, and the
  generator runs once
