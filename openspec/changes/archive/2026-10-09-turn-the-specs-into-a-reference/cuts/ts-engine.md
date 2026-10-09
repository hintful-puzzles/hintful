# Cuts: ts-engine

Requirements: 126 before, 102 after.

| Requirement, or the sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| The native engine defines one idiomatic `Game` interface that every port implements | type | `Game` in `src/engine/game.ts` and `GameStatus` in `src/engine/types.ts` are the interface and the union it described |
| The TS midend orchestrates a game behind the existing Comlink surface | how | A list of the fields `Midend` holds; each behavior it named has its own requirement here |
| The midend provides the app-facing surface and its notifications | type | `PuzzleEngineSurface` (`src/puzzle/engine-surface.ts`) states the surface; "no app-shell change" was the migration's promise, which is finished |
| "C-format save is not required to load" (scenario of "The engine uses a clean TS-native save format") | duplicate | The requirement's last sentence says it, and its round-trip scenario stays |
| Midend correctness is established by behavioral tests, not a corpus | port | The C oracle and its corpus are gone, so no corpus can be captured; `repo-layout` "A C-recorded fixture is kept for what cannot be derived, not as a quality bar" says what the frozen ones are for |
| The `Game` drawing, color, and input-feedback contract is fully specified | type | `GameDrawing` in `src/engine/game.ts` declares the calls, and the canvas satisfying it is a compile error otherwise |
| A game derives its palette from the host background | type | `colors(defaultBackground: Color)` is the signature; the rule on what a palette may depend on is `engine-colors` "A game's palette depends on nothing but the frontend background" |
| The worker exposes one shared puzzle-engine surface | port | No C/WASM implementation is left in `src/` to choose between |
| A game with no preferences of its own reports only the engine's | duplicate | "Every game has a solve timer, and it runs while the board is undecided", whose first scenario is this case |
| "The engine SHALL NOT carry a binary `savePreferences`/`loadPreferences` surface, and an import or export feature SHALL choose its own wire format." (of "Preferences are not part of a save") | port | Upstream's API, which nothing here has; the rule that a save holds no preference stays |
| The reference panel docks beside the board or presents as a bottom sheet | obsolete | No bottom sheet or scrim is left; the panel is a region of the grid in `src/puzzle/layout.ts`, as `app-shell` "The reference panel is a region of the same layout" and "The window's shape chooses the layout" state |
| The engine owns its type vocabulary and depends on nothing above it | how | Where the types live follows from `repo-layout` "The engine and the games import nothing else under `src/`"; the list of names copied `src/engine/types.ts` |
| The Comlink adapter lives on the app side of the seam | how | Which directory a class lives in; the same `repo-layout` requirement forbids it the engine, since it imports the app's canvas |
| The engine and the games import nothing above them, with no exception | collection | `repo-layout` "The engine and the games import nothing else under `src/`" and "The module layering is enforced, not merely observed" |
| A consumer of a `Game` member is read from the syntax tree | how | How the check reads source; its rule, that a comment or a relay is no consumer, moved into "The Game contract carries no capability without a consumer" |
| "The check states how much it inspected" (scenario, twice: of "The Game contract carries no capability without a consumer" and "The static-attributes relay carries no field the app does not read") | process | `docs/method.md` § "Count what the check looked at" |
| An enrollment fact is read off the game, through the shared helper | process | `docs/games/testing.md` § "How a cross-game guard finds its population", rule 1 |
| A derived sweep puts a floor under the population it drew from | process | The same section, rule 2 |
| A guard's exemptions are a ledger held equal to the derivation | process | The same section, rule 3 |
| An absent contract section is excused by the game's reason, not by a ledger | process | The same section, rule 3, its last paragraph |
| "A guard's own population is synthesized from a base preset" and "A hand-maintained roster patches the narrow population" (scenarios of "A cross-game sweep SHALL take its boards from the shared slice, not build them") | process | The same section, rule 6 and its tell |
| The sweeps that build their own boards are derived and ledgered | process | `docs/games/testing.md` § "Slicing a preset sweep for the gate" describes the scan and its ledger; its scenario on a configuration no preset carries moved to the requirement above |
| Widening a sweep does not widen what it asserts | process | `docs/games/testing.md` § "Slicing a preset sweep for the gate", its last paragraph |
| A value no preset holds is dealt on the first preset that accepts it | process | The same section, "What the menu does not offer is dealt beside the slice" and its first two bullets |
| A value no preset accepts is held to a ledger | process | The same section, the `NO_BOARD` bullet and the paragraph on a `"string"` item |
| A sweep does not seed a deal from its own name | process | `docs/games/testing.md` § "Deal through `dealt`" |
| The reference model is plain, serializable data | type | `ReferenceModel` and `ReferenceItem` in `src/engine/types.ts` |
| The reference aid is reached through the shared engine surface | duplicate | "The midend surfaces the reference aid without touching the history" gives the three members and the null answer; `PuzzleEngineSurface` declares them |
