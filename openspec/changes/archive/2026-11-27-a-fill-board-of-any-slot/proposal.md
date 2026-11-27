## Why

Every game born so far keeps one value a cell; the fill board is built on
cells (`src/engine/fill/board.ts`, `slots.ts`). The next two groups of
`describe-the-whole-catalog` (regions and partitions; lines and loops: 18
games, about 57k lines of hand-written TypeScript, measured 2026-11-24)
need answers on edges, on vertices, or a partition of the cells. Built one
game at a time on today's board, they would grow a second engine beside
`engine/fill`, as the cell games grew the fill engine's files. The owner
(2026-11-24) asked for the refactoring before the migration goes on.

The marks already know three sorts (`MarkSort`: cell, edge, angle), so the
concept exists below the board; the board, the deal, the codec, the
drawing and the input do not have it.

## What Changes

- **A fill board's answer lives in slots of a sort**: cells, edges, or
  vertices, a description stating which; a partition is an answer on edges
  read as regions. Today's cell games are the cell sort, unchanged.
- **Each concept that is per cell becomes per slot** where it applies:
  domains, notes, givens, the deal's hide, live errors, the codec's
  segments, the painters, the input's targets.
- **One fixture of each new sort** (an edge answer; a partition), built
  and played end to end, before any game of those groups is moved.
- **`describe-the-whole-catalog`'s design** is updated with what the
  regions and lines groups now start from.

## Capabilities

### Modified Capabilities

- `described-fill-game`: a fill board's answer lives in slots of a sort.

## Impact

`src/engine/fill/`, `src/describe/compile-fill.ts`, the schema, the
fixtures, `docs/descriptions.md`. Every born game is touched by the
generalization; their cases pin them. No player-visible change intended.
Comes after `fill-engine-by-concern`, whose registries it extends.
