## Why

`architectural-review-blue-sky` stage 3, the pilot of the end state the
owner set on 2026-11-21: no imperative code addressed to one game, a game
being its description alone (`docs/doctrine.md` § "Where the engine is
heading: a game is its description").

The review found that every fill game holds two models of its board,
upstream's `State` and the description's, and that most game-level
redundancy follows from the split: the adapters between them, the
narration said twice, and hooks the engine cannot write once because each
game owns its `Move` and `Ui` (design.md § "What a fill game writes
today"). A capability can be reused by the next description only if it
speaks the engine's vocabulary, so the engine's board comes first.

## What Changes

- **The engine's board.** A fill game's board is one engine store laid out
  from its description: the answer's values, the marks, the dealt clues. One
  `Edit` move and one engine `Ui`.
- **Built from the board.** The engine provides:
  - `executeMove`, `status`, `findMistakes`, `clearMistakes`, `revealOne`,
    `solve`, `markAll`, `newUi`, `changedState` and `textFormat`;
  - the hint's targets and tracking;
  - the ladder's `dealt`, which needs no adapter.
- **A step's words from its binding.** A `steps` entry's terms and marks
  are evaluated over the technique's binding.
- **Render by layers, opt in.** A painter per value, and the engine draws
  the rest.
- **Clues derived from `means`.** The generator samples an answer, and the
  engine writes the clues and runs the tier gate.
- **A new fill game written with no TypeScript of its own.** Every gap is
  closed by an engine capability, named in the engine's vocabulary.
- **Tents moved to the same standard**, as the stress test: links, edge
  clues, a pairing rule.
- **Measured against today:**
  - lines;
  - frame time and hint-walk time;
  - hint quality, judged in the app;
  - how many new capabilities the second game needed beside the first.
- **Saves.** Tents' saves from before the move stop loading, accepted by
  the owner on 2026-11-21. Game IDs and shared links are unchanged.
- **A guard.** The lines of TypeScript under `src/games/` become a ratchet
  that only goes down.

## Capabilities

### New Capabilities

- `described-fill-game`: a fill game born from its description, beside
  `described-ladder` and `described-position`.
- `kakurasu`: the new game.

### Modified Capabilities

- `tents`: its hint begins at its dealt tier, its pins certify its ladder,
  and a line count hatches its clue.
- `repo-layout`: a born game is registered by what the compiler writes, and
  the TypeScript under `src/games/` only shrinks.

## Impact

`src/engine/` (a new board layer), `src/describe/`, `src/games/tents/`, a
new game directory, `docs/new-game.md` and the guides the route sends a
fill game to.
