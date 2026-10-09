## ADDED Requirements

### Requirement: A game is resolved at runtime through the registry, and an unregistered id fails

The engine SHALL resolve a game's implementation at runtime through a registry
keyed by `puzzleId`, populated by `registerGame(...)` side effects. A
`puzzleId` absent from the registry is unplayable: the worker SHALL fail
explicitly for it and SHALL NOT fall through to another implementation.

#### Scenario: An unregistered puzzle id fails explicitly

- **WHEN** the worker is asked for a `puzzleId` with no registered `Game`
- **THEN** it raises an error naming the id
- **AND** no fallback implementation is attempted

### Requirement: A mistake check compares with the one answer, hidden or not

A game's `findMistakes` SHALL compare the player's marks with the board's one
answer, including where the answer is hidden from the player. A hidden answer
SHALL NOT be a reason in `notApplicable.findMistakes`.

#### Scenario: A hidden answer is checked

- **WHEN** the player runs Check & Save in Mines with a flag on a square that
  has no mine
- **THEN** the flag is highlighted as a mistake and the board is not saved

## REMOVED Requirements

### Requirement: Per-game engine selection is a runtime registry, not a build flag

**Reason**: Reworded in `ts-engine` as "A game is resolved at runtime through
the registry, and an unregistered id fails". The build-flag half is gone and
nothing it refuses can be proposed: there is one engine. Searched `src`,
`vite.config.ts`, `package.json` and `scripts` for `.wasm`, `emscripten` and
`emcc` (comments and frozen-fixture provenance only), and for a C source or
`CMakeLists.txt` outside a change's `reference/` (none). "Selection" between
engines has no second engine to select. What still binds is kept word for word:
the registry keyed by `puzzleId` and filled by `registerGame` side effects, and
the explicit failure with no fallback (`src/puzzle/worker.ts`, "No game is
registered for puzzleId"). No source or guide cites the title
(`spec-citations.mjs --list`; `git grep` for the title finds only the spec), so
it is free to change.

### Requirement: The Untangle port exposes its three preferences via the hook

**Reason**: Moved to `untangle`, with its words.

### Requirement: The app shell shows a non-blocking, responsive reference panel

**Reason**: Moved to `app-shell`, with its words.

### Requirement: The reference panel renders each item and selects on a click

**Reason**: Moved to `app-shell`, with its words.

### Requirement: The board spotlight persists when the reference panel is closed

**Reason**: Moved to `app-shell`, with its words.

### Requirement: A cross-game sweep SHALL take its boards from the shared slice, not build them

**Reason**: Moved to `testing`, with its words.

### Requirement: The shared slice holds the cost discipline of a searching hint

**Reason**: Moved to `testing`, with its words.

### Requirement: A refused Solve is shown in the help banner

**Reason**: Moved to `app-shell`, with its words.

### Requirement: Solve is ordered with the other queued input

**Reason**: Moved to `app-shell`, with its words.

### Requirement: A cross-game sweep SHALL deal every choice the Custom dialog offers

**Reason**: Moved to `testing`, with its words.

### Requirement: Every value is dealt, the generator's choices included

**Reason**: Moved to `testing`, with its words.

### Requirement: Whether every value is dealt is asserted apart from the derivation

**Reason**: Moved to `testing`, with its words.

### Requirement: The next board is dealt ahead and kept

**Reason**: Moved to `dealing`, with its words.

### Requirement: Every type is dealt ahead, and a quick one keeps one board

**Reason**: Moved to `dealing`, with its words.

### Requirement: A type whose deal was slow keeps three boards

**Reason**: Moved to `dealing`, with its words.

### Requirement: A deal is slow by its generator's time alone

**Reason**: Moved to `dealing`, with its words.

### Requirement: A kept board is keyed by its puzzle and its full params

**Reason**: Moved to `dealing`, with its words.

### Requirement: A kept board is played only by the build that dealt it

**Reason**: Moved to `dealing`, with its words.

### Requirement: A deal ahead is abandoned when its type is no longer wanted

**Reason**: Moved to `dealing`, with its words.

### Requirement: A deal a player waits for runs off the board's thread and can be stopped

**Reason**: Moved to `dealing`, with its words.

### Requirement: A search for a board offers a way to stop it

**Reason**: Moved to `dealing`, with its words.

### Requirement: Stopping a search leaves the board in play as it was

**Reason**: Moved to `dealing`, with its words.

### Requirement: A deal that finds no board says so in the engine's sentence

**Reason**: Moved to `dealing`, with its words.

### Requirement: A wait for a board ends when another board is opened

**Reason**: Moved to `dealing`, with its words.

### Requirement: Stopping a search with no board in play deals the first preset

**Reason**: Moved to `dealing`, with its words.

### Requirement: A cross-game sweep deals each board once

**Reason**: Moved to `testing`, with its words.
