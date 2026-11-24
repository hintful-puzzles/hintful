## Why

The fill engine was written in three days, one game at a time, into a few
files (measured 2026-11-24 at 98b5275e2):

| File | Lines |
|---|---|
| `src/describe/compile-fill.ts` | 2,845 |
| `src/engine/fill/render.ts` (`fillRender`, one closure of about 1,900 lines, 138 `if`s) | 2,367 |
| `src/engine/fill/game-id.ts` | 2,231 |
| `src/engine/fill/deal.ts` (`dealFill` 570 lines, `dealOf` 316) | 1,137 |

They grew 65–75% over the three candidate-note games, and biome's
complexity bound was met by pulling helpers out of `redraw` to pass. They
are also what a session re-reads most: in the migration sessions
compile-fill.ts was opened 57 times, render.ts 55, deal.ts 44, game-id.ts
37, many after a compaction. Each capability arrives as a concept (a clue
at an edge, a part, a slot, a corner) but lands as branches spread across
the four files: its codec segment, its painter, its done-mark press, its
text print, its deal step.

## What Changes

- **A concept is one module**: each clue location, painter layer, ID
  segment kind and deal step lives in a module of its own that owns its
  encode, decode, drawing, input and text, and registers with the file that
  runs them. Adding a concept adds a module and a registry line.
- **`fillRender`, `dealFill` and the ID codec become loops over their
  registries.**
- **No behavior moves**: every born game's cases, render snapshots, ID
  cases and hint-walk fingerprints pass unchanged, and the change's diff is
  verified by its shape (`docs/method.md`).
- **`docs/engine-catalog.md` and `docs/descriptions.md` point at the
  registries**, so a session finds a concept's module without reading the
  others.

## Capabilities

### Modified Capabilities

- `described-fill-game`: a concept of the fill board is one module.

## Impact

`src/engine/fill/`, `src/describe/compile-fill.ts`, the guides that cite
them. No player-visible change.
