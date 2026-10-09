# Ledger: ts-engine

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## The native engine defines one idiomatic `Game` interface that every port implements

| Rule | Where it went |
| --- | --- |
| One `Game` interface every game implements, generic over params, state, move, UI and draw state | spec: The native engine defines one idiomatic `Game` interface that every port implements |
| No manual duplicate or free, no opaque handles, unions and booleans in place of integer sentinels | spec: The native engine defines one idiomatic `Game` interface that every port implements |
| It is a rendering of upstream's `struct game` responsibilities | history |
| State transitions are immutable, and a move returns a new state | spec: Applying a move returns a new state |
| A game depends on the interface only and never calls the midend, and the interface is the sole contract | spec: A game depends on the `Game` interface and never on the midend |
| Scenario: a port implements the interface without handle ceremony | spec: Applying a move returns a new state; spec: A game depends on the `Game` interface and never on the midend |
| Scenario: game status is a typed union, with its four members named | spec: The native engine defines one idiomatic `Game` interface that every port implements |

## The TS midend orchestrates a game behind the existing Comlink surface

| Rule | Where it went |
| --- | --- |
| The midend owns the game, its params, the history, the UI and draw state, the random source, the timer and the preset and configuration handling | spec: The TS midend orchestrates a game behind the existing Comlink surface |
| The random source is the retained bit-identical `random.ts` | history |
| The midend provides the app-facing Comlink surface and emits the change notifications | spec: The midend provides the app-facing surface and its notifications |
| App shell, screen, dialog, drawing-canvas and store code need no change to drive a game | spec: The midend provides the app-facing surface and its notifications |
| `PuzzleEngineSurface` is where the shape is stated | spec: The midend provides the app-facing surface and its notifications |
| The requirement once read as reproducing the `WorkerPuzzle` API, which a change deleted | history |
| Scenario: a game is driven through the unchanged app surface | spec: The midend provides the app-facing surface and its notifications |

## Per-game engine selection is a runtime registry, not a build flag

| Rule | Where it went |
| --- | --- |
| A game's implementation is resolved at runtime through a registry keyed by `puzzleId`, filled by `registerGame`, never by a build flag | spec: Per-game engine selection is a runtime registry, not a build flag |
| The registry began as a selection between the TS midend and C/WASM and shipped empty | history |
| An absent `puzzleId` is unplayable, and the worker fails explicitly with no fall-through | spec: Per-game engine selection is a runtime registry, not a build flag |
| The registry agrees with the catalog in both directions, asserted by a test | spec: The registry and the catalog hold the same games |
| Scenario: an unregistered puzzle id fails explicitly | spec: Per-game engine selection is a runtime registry, not a build flag |
| Scenario: catalog and registry cannot drift | spec: The registry and the catalog hold the same games |

## The engine uses a clean TS-native save format

| Rule | Where it went |
| --- | --- |
| A versioned TS-native envelope carrying the puzzle id, the params, the move list and the timer's elapsed time, restored by replaying the moves, round-tripping state and history | spec: The engine uses a clean TS-native save format |
| The envelope carries the game id, which it holds as the params and the board's description | spec: The engine uses a clean TS-native save format |
| The envelope carries checkpoints | untrue: `SaveEnvelope` in `src/engine/save.ts` has no checkpoints field, and `src/engine/midend.ts` says the app keeps its checkpoints per board |
| The format need not match upstream's serialization, and a save in that format need not load | spec: The engine uses a clean TS-native save format |
| That follows the `ts-migration` decision that old saves and shared IDs are expendable | reason |
| The envelope carries the solver record as `cheated`, and not whether the board was solved | spec: The save envelope records the solver's use and not the solve |
| A key the current shape does not read, such as `timerStopped`, is ignored and not rejected | spec: The save envelope records the solver's use and not the solve |
| A version bump comes with an upgrade, the validator describes only the current shape, and an envelope that cannot be lifted is rejected | spec: A save version bump comes with an upgrade, not a rejection |
| Scenario: save and restore round-trip | spec: The engine uses a clean TS-native save format |
| Scenario: a C-format save is not required to load | spec: The engine uses a clean TS-native save format |
| Scenario: an older envelope is upgraded, not discarded | spec: A save version bump comes with an upgrade, not a rejection |
| Scenario: an envelope that cannot be lifted is still rejected | spec: A save version bump comes with an upgrade, not a rejection |

## Midend correctness is established by behavioral tests, not a corpus

| Rule | Where it went |
| --- | --- |
| Behavioral and property tests over a fake `Game`, not a characterization corpus, covering the listed behaviors | spec: Midend correctness is established by behavioral tests, not a corpus |
| This applies the `ts-migration` discipline to the engine | reason |
| Scenario: the midend is validated without a golden corpus | spec: Midend correctness is established by behavioral tests, not a corpus |
| The corpus would have been captured from the C build | history |

## The `Game` drawing, color, and input-feedback contract is fully specified

| Rule | Where it went |
| --- | --- |
| The drawing surface, the UI-only feedback and the color derivation are specified in full | spec: The `Game` drawing, color, and input-feedback contract is fully specified |
| The keystone left them as a placeholder for the first real port | history |
| `GameDrawing` exposes the full drawing API with the canvas surface's semantics, and the canvas `Drawing` satisfies it structurally | spec: The `Game` drawing, color, and input-feedback contract is fully specified |
| The engine imposes no redraw policy, and redraw optimization is the game's | spec: The engine imposes no redraw policy |
| `interpretMove` reports a UI-only change apart from a move and from nothing, and the midend answers each of the three | spec: A UI-only input redraws without a history entry |
| The default background is threaded from the worker surface through the midend to `colors` | spec: A game derives its palette from the host background |
| `colors` receives the frontend default background itself | untrue: `resolvePalette` in `src/engine/color/color-mkhighlight.ts` hands every game the host background shifted off pure white and pure black, so the requirement says the background as the engine hands it |
| As upstream's palette function does | history |
| Scenario: a game draws through the full surface | spec: The `Game` drawing, color, and input-feedback contract is fully specified |
| Scenario: a UI-only input redraws without a history entry | spec: A UI-only input redraws without a history entry |
| Scenario: the palette is derived from the host background | spec: A game derives its palette from the host background |

## The worker exposes one shared puzzle-engine surface

| Rule | Where it went |
| --- | --- |
| One implementation, the TS-midend-backed puzzle, behind `PuzzleEngineSurface`, always constructed | spec: The worker exposes one shared puzzle-engine surface |
| No C/WASM implementation, WASM-instantiation path or leaf-bridge coherence check | spec: The worker exposes one shared puzzle-engine surface |
| `PuzzleEngineSurface` keeps the shape of the app-facing remote type | spec: The worker exposes one shared puzzle-engine surface |
| Removing the C implementation required no change to the app's directories | history; spec: The midend provides the app-facing surface and its notifications |
| Scenario: the worker constructs the TS engine unconditionally | spec: The worker exposes one shared puzzle-engine surface |
| Scenario: the app's remote type is unchanged by the removal | history |

## The midend reconciles persisted Ui across state transitions

| Rule | Where it went |
| --- | --- |
| The optional `changedState` hook, called in place after a move, undo, redo, solve and restart and once at new-game setup with a null old state | spec: The midend reconciles persisted Ui across state transitions |
| An omitted hook is a no-op | spec: The midend reconciles persisted Ui across state transitions |
| It is the rendering of upstream's `game_changed_state` | history |
| It runs before the animation and flash durations are computed and before the repaint | spec: `changedState` runs before the animation is timed and the frame is painted |
| It is not called on a bare `UI_UPDATE` | spec: `changedState` is not called on a UI-only update |
| Scenario: the hook fires on a move and reconciles the Ui | spec: `changedState` runs before the animation is timed and the frame is painted |
| Scenario: the hook fires on undo and redo | spec: The midend reconciles persisted Ui across state transitions |
| Scenario: the hook does not fire on a UI-only update | spec: `changedState` is not called on a UI-only update |

## The engine supports per-game user preferences

| Rule | Where it went |
| --- | --- |
| The optional declarative `prefs` list, each item with `kw`, `name`, a discriminated `type` and accessors over the `Ui` | spec: The engine supports per-game user preferences |
| A game with no preferences omits `prefs` | spec: The engine supports per-game user preferences |
| It realizes upstream's `get_prefs` and `set_prefs`, which stores them on `game_ui` | history |
| A game with no `prefs` reports an empty preferences set | untrue: `getPreferencesConfig` and `getPreferences` in `src/engine/midend.ts` add the engine's own `show-timer` for every game, so such a game reports that one preference |
| That is the correct behavior for the four-plus existing ports | figure |
| The midend and `EngineCore` expose the three methods and translate to the app's config shapes, a boolean as a boolean and a choice as its index | spec: The midend translates preferences to the app's config shapes |
| `TsWorkerPuzzle` delegates the three, so the app's form and persistence need no change | spec: The midend translates preferences to the app's config shapes |
| `setPreferences` applies only the keys present, coerces each value, and repaints | spec: `setPreferences` applies the keys it is given and repaints in full |
| The midend retains the last-applied values and re-applies them after each `Ui` recreation | spec: A preference survives a new board |
| Upstream keeps one `game_ui` across new games | history |
| Preferences are not written into the save file | spec: Preferences are not part of a save |
| No binary `savePreferences` and `loadPreferences` surface, and an import or export feature chooses its own wire format | spec: Preferences are not part of a save |
| That surface mirrored upstream across the C/WASM boundary and the adapter answered it with an empty buffer | history |
| Scenario: a game declares preferences and the app drives them unchanged | spec: The engine supports per-game user preferences; spec: `setPreferences` applies the keys it is given and repaints in full |
| Scenario: a preference survives a new game | spec: A preference survives a new board |
| Scenario: a game with no preferences reports an empty set | spec: A game with no preferences of its own reports only the engine's |
| Galaxies is an example of a game that omits `prefs` | untrue: `src/games/galaxies/index.ts` declares a `prefs` list holding `galaxies-show-drag-candidates`, so the scenario names Flip alone |
| Scenario: a preference change repaints even when no board state moved | spec: `setPreferences` applies the keys it is given and repaints in full |

## The midend retains generator aux info for Solve

| Rule | Where it went |
| --- | --- |
| The midend keeps the `aux` of `newDesc` and passes it to `solve`, for `newGame` and a `#seed` id | spec: The midend retains generator aux info for Solve |
| It is cleared for a `:desc` id and a loaded save, so a solver that needs it reports the solution unknown | spec: The midend retains generator aux info for Solve |
| That is faithful to upstream, where Solve is for a game generated in the session | history |
| Scenario: Solve uses the generator's aux on a freshly generated game | spec: The midend retains generator aux info for Solve |
| Scenario: Solve is unavailable on a loaded game | spec: The midend retains generator aux info for Solve |

## The Untangle port exposes its three preferences via the hook

| Rule | Where it went |
| --- | --- |
| The three preferences, their types and keywords, and the defaults `newUi` sets | spec: The Untangle port exposes its three preferences via the hook |
| The keywords match upstream for tidiness, and the app has no other default-divergence mechanism | reason |
| Scenario: `getPreferencesConfig` returns three items | untrue: it returns four for Untangle, the game's three and the engine's `show-timer` (`getPreferencesConfig` in `src/engine/midend.ts`), and the scenario now says so |
| Scenario: show-crossed-edges is true by default, and setting it false repaints and leaves the others | spec: The Untangle port exposes its three preferences via the hook |

## The app shell shows a non-blocking, responsive reference panel

| Rule | Where it went |
| --- | --- |
| The reference control beside Hint, shown only with `hasReference`, toggling a `<reference-panel>` like a disclosure | spec: The app shell shows a non-blocking, responsive reference panel |
| The panel is non-blocking and keeps the board visible and interactive in both layouts | spec: The app shell shows a non-blocking, responsive reference panel |
| Docked beside the board where there is room, a bottom sheet on a narrow viewport or in the horizontal orientation, with no scrim either way | spec: The reference panel docks beside the board or presents as a bottom sheet |
| A side dock there would shove the board off-center against the toolbar column | spec: The reference panel docks beside the board or presents as a bottom sheet |
| Each item rendered by status, with pips or a label, live, and a click toggling the selection and calling `selectReference` | spec: The reference panel renders each item and selects on a click |
| Selection feedback is immediate and does not wait on the model refresh | spec: The reference panel renders each item and selects on a click |
| The spotlight persists when the panel is closed, and is cleared by a board interaction, by Escape and by re-clicking the item | spec: The board spotlight persists when the reference panel is closed |
| On a small screen the player marks a piece, closes the panel and acts on the highlight | reason |
| Scenario: the control appears only for a reference-bearing game | spec: The app shell shows a non-blocking, responsive reference panel |
| Scenario: the panel keeps the board interactive and updates live | spec: The app shell shows a non-blocking, responsive reference panel |
| Scenario: clicking an item spotlights it on the still-visible board | spec: The reference panel renders each item and selects on a click |
| Scenario: the spotlight persists after close and clears on Escape | spec: The board spotlight persists when the reference panel is closed |

## The engine serializes Ui state a move-log replay cannot reconstruct

| Rule | Where it went |
| --- | --- |
| The optional `encodeUi` and `decodeUi` hooks, written to the envelope's `ui` field and restored after the replay, and no field for a game without them | spec: The engine serializes Ui state a move-log replay cannot reconstruct |
| They are upstream's `encode_ui` and `decode_ui` | history |
| A `Ui` field set by `interpretMove` outside the history cannot be replayed, since replay goes through `executeMove` | spec: The engine serializes Ui state a move-log replay cannot reconstruct |
| Mines' death counter and Guess's half-composed row are such fields | reason |
| The midend reports the encoding on `game-state-change`, for a game with the hook and no other | spec: The midend reports a game's saveable Ui with every state change |
| It reports the encoding and not a flag, so the app compares the part of the save that would differ | spec: The midend reports a game's saveable Ui with every state change |
| Guess shipped a correct `encodeUi` whose output nothing asked for | history; held: src/engine/types.ts "the bytes were right" |
| Scenario: a persistent Ui counter survives a save | spec: The engine serializes Ui state a move-log replay cannot reconstruct |
| Scenario: a game's saveable Ui is reported with every state change | spec: The midend reports a game's saveable Ui with every state change |
| Scenario: a Ui edit that is not a move is reported | spec: The midend reports a game's saveable Ui with every state change |

## The engine owns its type vocabulary and depends on nothing above it

| Rule | Where it went |
| --- | --- |
| The shared vocabulary lives under `src/engine/` and is imported from there by the app, and the list of what it is | spec: The engine owns its type vocabulary and depends on nothing above it |
| The declarations once sat in the app layer, re-exported from a generated file, and were hand-authored in place | history |
| 182 files under the engine and the games imported the app layer, and 201 importers | figure |
| `TsWorkerPuzzle` lives in `src/puzzle/` and not inside `src/engine/`, since an adapter belongs with what it adapts to | spec: The Comlink adapter lives on the app side of the seam |
| It was the only production module under the engine importing upward | history |
| The layering invariant holds with no exceptions and no allowlist, and is checked automatically | spec: The engine and the games import nothing above them, with no exception |
| Scenario: a game imports the drawing vocabulary | spec: The engine and the games import nothing above them, with no exception |
| Scenario: the app consumes the engine's vocabulary | spec: The engine owns its type vocabulary and depends on nothing above it; spec: The engine and the games import nothing above them, with no exception |

## A game rejects a move it cannot play, rather than guessing

| Rule | Where it went |
| --- | --- |
| `executeMove` throws on a move its dispatch does not recognize, naming the game and the move, and never guesses, returns a non-state or ignores it | spec: A game rejects a move it cannot play, rather than guessing |
| A save's moves are cast on replay and not parsed, so an off-union value can arrive | spec: A game rejects a move it cannot play, rather than guessing |
| A union dispatch makes an unhandled member a compile-time error with `assertNever`, and a bare throwing `default` does not meet it | spec: An unhandled member of a move union is a compile-time error |
| A move that is not a union validates the fields its dispatch reads and throws in the same form | spec: A move that is not a union has its fields validated |
| Scenario: a move from another build is refused, not misread | spec: A game rejects a move it cannot play, rather than guessing |
| Scenario: an unrecognized move is never silently ignored | spec: A game rejects a move it cannot play, rather than guessing |
| A dispatch previously had a tolerant catch-all | history |
| Scenario: adding a move type without handling it fails to compile | spec: An unhandled member of a move union is a compile-time error |

## The Game contract carries no capability without a consumer

| Rule | Where it went |
| --- | --- |
| Every optional member has an implementer and a consumer, checked separately because they fail differently | spec: The Game contract carries no capability without a consumer |
| A capability with no consumer reads as protection while doing nothing | reason |
| `validateParams`'s `full` flag was passed a literal by four call sites while sixteen games gated a bound on it | history; figure |
| A member read only by a cross-game guard is allowed and recorded with its argument | spec: A `Game` member read only by a guard, or by nothing, is recorded |
| `Game.difficulty` is such a member | untrue: `TEST_ONLY_CONSUMER` in `src/contract-surface.test.ts` is empty, and its comment says `difficulty` left it when the midend began reading it |
| A member with no consumer is recorded with its owning change, and an entry with none does not stand | spec: A `Game` member read only by a guard, or by nothing, is recorded |
| Consumers are derived from the syntax tree, a comment is not one, and a relay into a same-named field is not one | spec: A consumer of a `Game` member is read from the syntax tree |
| `needsRightButton`'s only mention was a commented-out line | history |
| Scenario: an optional hook nothing invokes is reported | spec: The Game contract carries no capability without a consumer |
| Scenario: an optional hook no game implements is reported | spec: The Game contract carries no capability without a consumer |
| Scenario: a recorded exception that has stopped being true is reported | spec: A `Game` member read only by a guard, or by nothing, is recorded |
| Scenario: the check states how much it inspected | spec: The Game contract carries no capability without a consumer |

## The static-attributes relay carries no field the app does not read

| Rule | Where it went |
| --- | --- |
| Every field is read by the app shell, a check asserts it, and an unread field is removed or recorded with its owning change | spec: The static-attributes relay carries no field the app does not read |
| The check counts only reads from outside the engine, because the two contracts share field names | spec: The static-attributes relay carries no field the app does not read |
| It is the sibling of the `Game` rule, stated apart because the two contracts fail independently | reason |
| Two of the original nine fields, `canConfigure` and `displayName`, had no reader | history; figure |
| Scenario: a relayed field the app never reads is reported | spec: The static-attributes relay carries no field the app does not read |
| Scenario: the check states how much it inspected | spec: The static-attributes relay carries no field the app does not read |

## A shared mechanic is joined by having it, not by declaring it

| Rule | Where it went |
| --- | --- |
| A game joins a mechanic by having it, a guard derives its population from what the game is, and no game adds itself to a list | spec: A shared mechanic is joined by having it, not by declaring it |
| The three kinds of enrollment fact, and `src/engine/testing/enrollment.ts` as the shared way to ask | spec: An enrollment fact is read off the game, through the shared helper |
| A floor on the population drawn from, not only on the filtered set | spec: A derived sweep puts a floor under the population it drew from |
| Exempt members are a ledger in the guard with reasons, held equal to the derivation, never the enrollment key, and valid when empty | spec: A guard's exemptions are a ledger held equal to the derivation |
| An excuse of having no such section is the game's `notApplicable` reason and not a ledger entry | spec: An absent contract section is excused by the game's reason, not by a ledger |
| Scenario: a newly ported game joins every guard for its capabilities | spec: A shared mechanic is joined by having it, not by declaring it |
| Scenario: a derived sweep that found nothing fails | spec: A derived sweep puts a floor under the population it drew from |
| Scenario: a ledger entry that has stopped being true fails | spec: A guard's exemptions are a ledger held equal to the derivation |

## A cross-game sweep SHALL take its boards from the shared slice, not build them

| Rule | Where it went |
| --- | --- |
| A test that walks the collection takes its boards from the one shared preset enumeration and builds no population of its own | spec: A cross-game sweep SHALL take its boards from the shared slice, not build them |
| Every such sweep but one read `firstLeaf` or synthesized params from it, and three sat in the file already widened | history |
| What no such board had carried, measured over the registry | figure |
| The sweeps that still build their own boards are derived by a scan for the two calls and each held to a ledger entry | spec: The sweeps that build their own boards are derived and ledgered |
| A guide sentence could not have stopped the next sweep | reason |
| A searching hint's games get every mode on the smallest board offering it and no large board, from the same axes | spec: The shared slice holds the cost discipline of a searching hint |
| It replaced a count of presets chosen because three reached Netslide's barrier modes | history; spec: The shared slice holds the cost discipline of a searching hint |
| Widening a sweep runs the same assertions, and a failure is a defect or an unheard vocabulary, both findings | spec: Widening a sweep does not widen what it asserts |
| Scenario: a sweep is written that walks the collection | spec: A cross-game sweep SHALL take its boards from the shared slice, not build them |
| Scenario: a sweep is written that builds its own boards anyway | spec: The sweeps that build their own boards are derived and ledgered |
| Scenario: a guard's own population is synthesized from a base preset | spec: A cross-game sweep SHALL take its boards from the shared slice, not build them |
| Scenario: a hand-maintained roster patches the narrow population | spec: A cross-game sweep SHALL take its boards from the shared slice, not build them |
| The `hint-ordinal` roster for Solo went that way | history |
| Scenario: a lexical narration rule meets a construction it has never heard | spec: Widening a sweep does not widen what it asserts |
| Each phrasing is written by five or more games | figure |
| Scenario: a guard needs a configuration the presets menu does not offer | spec: The sweeps that build their own boards are derived and ledgered |
| Keen emits an ordered chain on none of its ten presets at eight seeds each | figure |

## The engine supports an ephemeral, opt-in mistake-checking hook

| Rule | Where it went |
| --- | --- |
| A UI-only, ephemeral facility, and the optional pure `findMistakes(state)` returning the contradicting cells as highlight data | spec: The engine supports an ephemeral, opt-in mistake-checking hook |
| It is shaped like the Hint System | reason |
| A game with candidate notes that reports them reports a set excluding the answer, never a set with extras, and checks against the placements only | spec: A candidate note that excludes the answer is a mistake |
| So Check & save refuses a board carrying an invalid note | spec: A candidate note that excludes the answer is a mistake |
| The midend calls the hook, holds the result outside game state and saves, passes it to `redraw` and returns the count | spec: The midend shows mistakes until the next transition |
| The display is cleared on the events that clear an active hint, a move, undo, redo, restart, new game and solve, and on reaching the solved state, which only a move or a solve does | spec: The midend shows mistakes until the next transition |
| The display lasts until the next state transition | untrue: `afterTransition` in `src/engine/midend.ts` clears the overlay on a UI-only update too, where no state changed, and its comment lists it, so the requirement names it |
| A game without the hook reports it as unavailable | spec: `canCheck` and `check()` reach the mistake hook |
| `canCheck` in the static attributes, `check()` asking the hook first, and the answers for a game without it | spec: `canCheck` and `check()` reach the mistake hook |
| Scenario: checking a board with mistakes | spec: The midend shows mistakes until the next transition |
| Scenario: checking a clean board | spec: The engine supports an ephemeral, opt-in mistake-checking hook |
| Scenario: a transition clears the mistake display | spec: The midend shows mistakes until the next transition |
| Scenario: a game without the hook reports no capability | spec: `canCheck` and `check()` reach the mistake hook |
| Scenario: a candidate annotation that excludes the solution is a mistake | spec: A candidate note that excludes the answer is a mistake |

## The engine surface exposes an opt-in per-game reference-aid capability

| Rule | Where it went |
| --- | --- |
| The optional reference aid, and the two `Game` hooks `reference` and `selectReference` | spec: The engine surface exposes an opt-in per-game reference-aid capability |
| The shapes of `ReferenceModel` and `ReferenceItem`, and what `key`, `pips` and `selected` are | spec: The reference model is plain, serializable data |
| The midend's `hasReference`, `getReference` and `selectReference`, the last repainting like a `UI_UPDATE` with no move, undo entry, log change or save | spec: The midend surfaces the reference aid without touching the history |
| For a game without `reference`: false, null and a no-op | spec: The reference aid is reached through the shared engine surface |
| The three are part of `PuzzleEngineSurface` | spec: The reference aid is reached through the shared engine surface |
| Scenario: a game exposing a reference is discoverable through the surface | spec: The engine surface exposes an opt-in per-game reference-aid capability |
| Scenario: selecting a reference item repaints without a history entry | spec: The midend surfaces the reference aid without touching the history |
| Scenario: a game without a reference aid reports none | spec: The reference aid is reached through the shared engine surface |

## Absence has one spelling

| Rule | Where it went |
| --- | --- |
| A possibly absent value is typed with null, `undefined` is in no union type of a tracked file, an optional parameter or member is written `?`, and a cast is exempt | spec: Absence has one spelling |
| A value the language produced as `undefined` is converted where it enters a declared type | spec: A value the language produced as undefined is converted where it enters a declared type |
| Two kinds of nothing are named states, not the language's two words | spec: Two kinds of nothing are two named states |
| A function that can fail returns its reason or null, or a discriminated result when it returns a value | spec: A function that can fail returns its reason or a discriminated result |
| What a save or a stored setting means does not change to satisfy the rule | spec: The absence rule changes no stored meaning |
| Scenario: a helper that may find nothing | spec: Absence has one spelling |
| Scenario: a key with two kinds of nothing | spec: Two kinds of nothing are two named states |
| Scenario: the engine surface reports a refusal | spec: A function that can fail returns its reason or a discriminated result |
| Scenario: a preview whose answer is itself a string | spec: A function that can fail returns its reason or a discriminated result |
| Scenario: a stored null is not an unset setting | spec: Two kinds of nothing are two named states |

## A refused Solve is shown in the help banner

| Rule | Where it went |
| --- | --- |
| A refused Solve shows its own text in the banner a refused Hint uses, whichever control asked, in every game with Solve, a hintless one included | spec: A refused Solve is shown in the help banner |
| A Solve that lands adds no message | spec: A refused Solve is shown in the help banner |
| Solve is ordered with the other queued input, after an Auto-Hint step in flight | spec: Solve is ordered with the other queued input |
| The wording is the collection's and the app does not rewrite it | spec: A refused Solve is shown in the help banner |
| Scenario: Solve on an unstarted Mines board | spec: A refused Solve is shown in the help banner |
| Scenario: a Solve that lands shows no banner | spec: A refused Solve is shown in the help banner |
| Scenario: Solve waits behind a step in flight | spec: Solve is ordered with the other queued input |

## Solve, the status bar and text export follow from the game's methods

| Rule | Where it went |
| --- | --- |
| `canSolve`, `wantsStatusbar` and the text rendering follow from the presence of the methods, and the contract carries no flag restating them | spec: Solve, the status bar and text export follow from the game's methods |
| Scenario: a game without the methods offers neither Solve nor a status bar | spec: Solve, the status bar and text export follow from the game's methods |
| Scenario: a game with the methods offers both | spec: Solve, the status bar and text export follow from the game's methods |

## A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft

| Rule | Where it went |
| --- | --- |
| The four sections, the three states, and draft computed from them and never declared | spec: A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft |
| A reason is a checkable fact about the puzzle, unwritten work is not one, and a hint is never not applicable | spec: A not-applicable reason is a fact about the puzzle |
| A game that implements a section and excuses it is refused wherever the state is read | spec: A section both implemented and excused is refused |
| A member joins only when its absences can be told apart, and the named members stay outside | spec: A member joins the sections only when its absences can be told apart |
| Scenario: a hintless game is a draft | spec: A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft |
| Scenario: a reason excuses a section | spec: A not-applicable reason is a fact about the puzzle |
| Scenario: a game cannot both have a section and excuse it | spec: A section both implemented and excused is refused |
| Scenario: a guard's ledger of absences reads the game's reasons | spec: An absent contract section is excused by the game's reason, not by a ledger |

## A boolean capability flag is held to the behavior it claims

| Rule | Where it went |
| --- | --- |
| A flag only where a production consumer needs the answer synchronously and cannot observe it, each asserted equal to a derivation | spec: A boolean capability flag is held to the behavior it claims |
| A flag that disables a guard or a frontend behavior carries such a check | spec: A boolean capability flag is held to the behavior it claims |
| What `ignoresSecondaryButton` and `canMarkAll` are each held to | spec: Each flag of the contract is held to its derivation |
| A source scan standing in for a derivation reads code with comments removed | spec: Each flag of the contract is held to its derivation |
| Scenario: a flag declared against the behavior fails | spec: A boolean capability flag is held to the behavior it claims |
| Scenario: a flag the behavior calls for but the game omits fails | spec: Each flag of the contract is held to its derivation |

## Solve failures are worded once for the whole collection

| Rule | Where it went |
| --- | --- |
| A refused `solve` returns one of the collection's failures, the type admits no other string, and the seven cases the set tells apart | spec: Solve failures are worded once for the whole collection |
| No solution and more than one are said only where established, and otherwise the failure that is true either way | spec: A solver claims only what it established |
| A fact a hint can also meet is one message for both | spec: A fact a hint and Solve both meet is worded once |
| The midend refuses Solve on a solved or a lost board without asking the game | spec: Solve leaves a solved board |
| Scenario: two games fail to solve for the same reason | spec: Solve failures are worded once for the whole collection |
| Scenario: a game's own sentence does not compile | spec: Solve failures are worded once for the whole collection |
| Scenario: Solve on a finished board leaves the win alone | spec: Solve leaves a solved board |
| Scenario: a hint and Solve name one dead end alike | spec: A fact a hint and Solve both meet is worded once |

## The status bar's completion words come from the engine

| Rule | Where it went |
| --- | --- |
| The words come from the engine's one helper, in four states, prefixed by the midend from the status now and its solver record | spec: The status bar's completion words come from the engine |
| No game writes the words, asserted by scanning for what they say | spec: No game writes the completion words itself |
| Scenario: a helped board the player has moved off | spec: The status bar's completion words come from the engine |
| Scenario: nothing follows the words | spec: The status bar's completion words come from the engine |

## A game's status is judged from the board alone

| Rule | Where it went |
| --- | --- |
| `status` reports from the position alone, writes nothing into the state, and reads a fact the board shows | spec: A game's status is judged from the board alone |
| No state records a solve or the solver's use, which the midend owns | spec: No game's state records a solve or the solver's use |
| A board typed in solved is solved at move 0, a Solve move completes by the board it leaves, and a broken solved board reads ongoing, one rule for every consumer | spec: A board's status follows the board on display |
| The owner's decision and its date | history |
| Scenario: a board typed in already solved | spec: A game's status is judged from the board alone |
| Scenario: a broken solved board | spec: A board's status follows the board on display |
| Scenario: a record of completion on the state fails the build | spec: No game's state records a solve or the solver's use |

## The engine derives a board's history from its position

| Rule | Where it went |
| --- | --- |
| The midend asks `status` once per position and derives the solver's use, the win flash and the completion words from its history | spec: The engine derives a board's history from its position |
| When the win flash plays, for how long, and what `flashLength` is for | spec: The win flash plays on a forward move that solves the board |
| Scenario: the Solve command does not celebrate | spec: The win flash plays on a forward move that solves the board |
| Scenario: a hand solve after a Solve celebrates | spec: The win flash plays on a forward move that solves the board |
| Scenario: a broken solved board solved again celebrates again | spec: The win flash plays on a forward move that solves the board |
| Scenario: an expensive status is asked once per position | spec: The engine derives a board's history from its position |

## Every game has a solve timer, and it runs while the board is undecided

| Rule | Where it went |
| --- | --- |
| The `show-timer` preference in every game, on by default, and the four conditions under which time counts | spec: Every game has a solve timer, and it runs while the board is undecided |
| A solved board broken or undone out of counts again, and a new board resets the time | spec: The solve timer follows the board on display |
| The owner's decisions and their dates | history |
| A peek at the solution and then solving it oneself is a use the clock follows | reason; held: src/engine/midend.ts "a peek at the solution" |
| The `timer-change` notification, its two readouts, and that it is sent only on a change | spec: The timer is reported when its readout changes |
| What counts as help, alike for every asker and game, and what does not | spec: Help is the app doing some of the solving |
| A check that finds something saves the player the time of finding it | reason |
| Scenario: a game that does not ask for a timer offers one | spec: Every game has a solve timer, and it runs while the board is undecided |
| Scenario: the timer counts from the first move | spec: Every game has a solve timer, and it runs while the board is undecided |
| Scenario: a solve stops the clock while the board stays solved | spec: The solve timer follows the board on display |
| Scenario: a peek at the solution stays assisted | spec: Help is the app doing some of the solving |
| Scenario: a hidden page does not count | spec: Every game has a solve timer, and it runs while the board is undecided |
| Scenario: a helped time says so | spec: The timer is reported when its readout changes |
| Scenario: a check that finds something is help | spec: Help is the app doing some of the solving |
| Scenario: a check that finds nothing is not | spec: Help is the app doing some of the solving |

## Solve leaves a solved board

| Rule | Where it went |
| --- | --- |
| Solve shows the finished board or refuses, the midend refuses a solved or lost board unasked, and throws on a solve move that leaves an unsolved board | spec: Solve leaves a solved board |
| A Solve installs no route or marks and reveals no loss, a solver with no finish refuses, and a fixed answer replaces the player's mistakes | spec: A Solve installs no route and reveals no loss |
| Every game with Solve is solved by a test from its deal and from played positions | spec: Every game with Solve is solved by a test |
| Scenario: Solve finishes the board | spec: Solve leaves a solved board |
| Scenario: a Solve move that leaves the board unsolved is a defect | spec: Solve leaves a solved board |
| Scenario: a lost board is refused | spec: Solve leaves a solved board |
| Scenario: no finish within the rules is a refusal | spec: A Solve installs no route and reveals no loss |

## A cross-game sweep SHALL deal every choice the Custom dialog offers

| Rule | Where it went |
| --- | --- |
| The enumeration deals a board for every boolean or choices value no preset holds, by the game having a `paramConfig`, with no list kept | spec: A cross-game sweep SHALL deal every choice the Custom dialog offers |
| Salad's hint threw on 71 of 1,195 Normal boards, and 54 such values stood in 27 fields of 16 games | figure; held: src/engine/testing/presets.ts "71 of 1,195" |
| Each value goes on the first preset in menu order that accepts it, beside the slice and never instead of the menu, and is no substitute for a preset at that tier | spec: A value no preset holds is dealt on the first preset that accepts it |
| Every value is dealt, the generator's choices included, and no ledger excuses the unlikely ones | spec: Every value is dealt, the generator's choices included |
| Bridges cost 0.7 s before its values were dealt and 0.9 s after | figure |
| A value no preset accepts is held to a ledger with reasons, equal to the derivation, and a free scalar is not walked | spec: A value no preset accepts is held to a ledger |
| The ledger is empty, since ABCD's menu gained a preset | history |
| Whether every value is dealt is asserted from `paramConfig` and the dealt boards alone, naming known boards by their params | spec: Whether every value is dealt is asserted apart from the derivation |
| Scenario: a game's dialog offers a tier its menu stops short of | spec: A cross-game sweep SHALL deal every choice the Custom dialog offers |
| Scenario: a game gains a choice | spec: A cross-game sweep SHALL deal every choice the Custom dialog offers |
| Scenario: a value depends on another field | spec: A value no preset accepts is held to a ledger |
| Scenario: a sweep reads the menu by itself | spec: A cross-game sweep SHALL deal every choice the Custom dialog offers |

## The next board is dealt ahead and kept

| Rule | Where it went |
| --- | --- |
| The app deals the next board ahead, off the board's thread, keeps it, and a New game plays a board kept for its params or waits | spec: The next board is dealt ahead and kept |
| A deal is slow once a board, and kept ahead the wait is paid by the first board of a type | reason |
| Every type is dealt ahead, and a quick type keeps one board | spec: Every type is dealt ahead, and a quick one keeps one board |
| A slow type keeps three boards, dealt one at a time, the longest kept played first | spec: A type whose deal was slow keeps three boards |
| What makes a deal slow, by the generator's time alone, and how long the type stays slow | spec: A deal is slow by its generator's time alone |
| A kept board is keyed by puzzle and full params as dealt, kept across visits apart from saves and settings, and handed to one deal | spec: A kept board is keyed by its puzzle and its full params |
| A kept board is played as written, with its tier on trust and its `aux`, and only by the build that dealt it | spec: A kept board is played only by the build that dealt it |
| A deal ahead is abandoned when its type is no longer the next, and the three cases not dealt ahead again until asked for | spec: A deal ahead is abandoned when its type is no longer wanted |
| Scenario: the second deal of a slow type arrives at once | spec: The next board is dealt ahead and kept |
| Scenario: boards of a slow type passed over are each followed by a kept one | spec: A type whose deal was slow keeps three boards |
| Scenario: a quick type keeps one board | spec: Every type is dealt ahead, and a quick one keeps one board |
| Scenario: a kept board is for the board as it will be dealt | spec: A kept board is keyed by its puzzle and its full params |
| Scenario: a kept board survives a visit and not a build | spec: A kept board is played only by the build that dealt it |
| Scenario: choosing another type abandons the deal ahead | spec: A deal ahead is abandoned when its type is no longer wanted |
| Scenario: a slow deal with no board kept says what it is doing | spec: A search for a board offers a way to stop it |

## A deal a player waits for runs off the board's thread and can be stopped

| Rule | Where it went |
| --- | --- |
| A New game with no board kept waits on a deal off the board's thread, the engine's thread runs no generator for it, and a deal ahead under way is the one waited on | spec: A deal a player waits for runs off the board's thread and can be stopped |
| A generator owns its thread until it returns, which at a Custom size can be minutes | reason |
| A control that stops the search, by touch, keyboard and mouse, standing apart from where a hint's words show | spec: A search for a board offers a way to stop it |
| Stopping ends the deal at once, leaves the board and its moves, puts the type back and says nothing further | spec: Stopping a search leaves the board in play as it was |
| A deal that found no board answers in the engine's sentence and leaves the board and its type | spec: A deal that finds no board says so in the engine's sentence |
| A wait ends when another board is opened, gives way to a later New game, and follows the type now chosen | spec: A wait for a board ends when another board is opened |
| With no board in play, stopping deals the first preset, with no control to stop that deal | spec: Stopping a search with no board in play deals the first preset |
| Scenario: the board in play is played through a wait | spec: A deal a player waits for runs off the board's thread and can be stopped |
| Scenario: one deal serves the type just chosen | spec: A deal a player waits for runs off the board's thread and can be stopped |
| Scenario: a player stops the search | spec: Stopping a search leaves the board in play as it was |
| Scenario: asking again deals again | spec: Stopping a search leaves the board in play as it was |
| Scenario: a hint during the wait leaves the way out | spec: A search for a board offers a way to stop it |
| Scenario: a deal that finds nothing says so | spec: A deal that finds no board says so in the engine's sentence |
| Scenario: stopping with no board in play | spec: Stopping a search with no board in play deals the first preset |

## A restart is a step of the history

| Rule | Where it went |
| --- | --- |
| A restart enters the starting board as the next step, crossed by Undo and Redo, and dropped by a step made after undoing it | spec: A restart is a step of the history |
| It is upstream's restart, which the port had replaced with no reason recorded | history; held: src/engine/midend.ts "movetype = RESTART" |
| The starting board is state 0, or the board the public description builds for a superseded game | spec: A restart returns to the board as it started |
| A restart does nothing where nothing has been played since the start or the last restart | spec: A restart with nothing played does nothing |
| Each restart keeps the solver record of the far side, exchanged when the cursor crosses | spec: The solver record belongs to a stretch of play |
| A restart neither resets nor holds the timer, and crossing one plays no move animation | spec: A restart leaves the timer running and plays no animation |
| The state notification lists the positions restarts reached | spec: The state notification lists the restarts |
| A restart is `null` in `moves` and listed apart in `restarts`, the envelope version is 3, and version 2 is lifted by its version alone | spec: The save envelope carries a restart |
| On load a restart is replayed to the board a restart made then reached | spec: A restart is replayed on load to the board it reached |
| Scenario: Undo after a restart returns the moves | spec: A restart is a step of the history |
| Scenario: a restart with nothing played does nothing | spec: A restart with nothing played does nothing |
| Scenario: the solver record returns with the moves it belongs to | spec: The solver record belongs to a stretch of play |
| Scenario: a save holding a restart round-trips on either side of it | spec: The save envelope carries a restart |
| Scenario: a save written before a restart was a step opens | spec: The save envelope carries a restart |

## The board a new one replaces is kept, one deep

| Rule | Where it went |
| --- | --- |
| A replaced board is kept as a save of itself and brought back by Undo at the first position, and the board undone from by Redo at the last | spec: The board a new one replaces is kept, one deep |
| It is kept in the midend and not by the app, since every replacement ends in one function there | spec: The board a new one replaces is kept, one deep |
| A board returns as it was left, with its history, cursor, time, records and type | spec: A kept board returns as it was left |
| A step of the board in play is taken first each way, and no press means two things | spec: Undo and Redo keep one meaning |
| Both kept boards are dropped at the first step made, not by Undo or Redo, one is kept each way, and neither is saved or survives the page | spec: A kept board is dropped at the first step made on the board in play |
| An unplayed copy of the replacing board is not kept | spec: An unplayed copy of the replacing board is not kept |
| The notification's `boardBefore`, `boardAfter` and `board`, and their count in `canUndo` and `canRedo` | spec: The state notification reports the kept boards and numbers the board in play |
| Scenario: Undo on an unplayed new board returns the old one | spec: A kept board returns as it was left |
| Scenario: Redo returns to the new board | spec: The board a new one replaces is kept, one deep |
| Scenario: the first move drops the other board | spec: A kept board is dropped at the first step made on the board in play |
| Scenario: a deal that finds no board keeps nothing new | spec: The board a new one replaces is kept, one deep |

## A load reports the board once

| Rule | Where it went |
| --- | --- |
| No notification during the replay, then the id, params, state and status once each, and why | spec: A load reports the board once |
| Scenario: a long save is one state | spec: A load reports the board once |

## A cross-game sweep deals each board once

| Rule | Where it went |
| --- | --- |
| A sweep takes its board from `dealt`, begins a midend with `beginDealt`, the dealer keeps each board for the worker's life, and a throwing deal is kept and rethrown | spec: A cross-game sweep deals each board once |
| A sweep does not seed a deal from its own name, takes later boards by `n`, pins a particular board by its description, and a game's own tests are not bound | spec: A sweep does not seed a deal from its own name |
| Dealing was where the sweeps' time went, up to 19.5 s a board against under 0.1 s to follow a plan | figure; held: src/engine/testing/dealt.ts "19.5 s" |
| Scenario: two sweeps walk the same preset | spec: A cross-game sweep deals each board once |
| Scenario: a sweep drives a midend | spec: A cross-game sweep deals each board once |
| Scenario: a board cannot be dealt | spec: A cross-game sweep deals each board once |
