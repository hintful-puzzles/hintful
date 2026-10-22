# add-edges-skeleton

Filed by `add-path-ts-port` (archived 2026-10-21) on the owner's word, last of
four: it is built from `share-square-edge-geometry`,
`share-line-drawing-drag` and `share-edge-hint-marks`, and starts when they
are archived.

## Why

`scripts/new-game.sh <id> [kind]` stamps a new game from `src/skeleton/<kind>`,
and the only kind is `grid`: a square grid of cells the player marks. Of the
route table's four kinds (`docs/new-game.md` § "The route by kind of game"),
it serves one. Both greenfield games replaced every file of the copy:

- **Target** (`add-numgame-ts-port`, finding 1): a game of moves and search,
  no grid.
- **Path** (`add-path-ts-port`, finding 1): an edges-and-loops game. The copy
  gave file names, test shapes and the closing checklist. The board, the
  input, the renderer, the hint marks and every test were written again, about
  2,500 lines.

Once the edge geometry, the line drag and the edge hint marks are the
engine's, an edges skeleton is mostly declarations over them, which is the
point of a skeleton: a new edge game changes the puzzle and keeps the shape.

## What changes

- **`src/skeleton/edges/`**: a small edges game that plays, on the shared way
  for every concern: edges on the square-edge geometry, the line drag and its
  keyboard, the cross sweep, a ladder over edges with a Check rung and a
  bounded look-ahead walked on the board, a generator gated by it, the mistake
  check on set edges, the hint and its edge marks, a renderer that draws lines,
  crosses and the outline under them, and the tests.
- **`scripts/new-game.sh <gameId> edges`** stamps it, and its checklist
  says what the copy leaves undone.
- **The route table** names the edges skeleton as the kind's exemplar.

## Not in this change

A skeleton for moves and search (Target's finding): a change of its own if
the owner wants it.

## Impact

New `src/skeleton/edges/`; `scripts/new-game.sh`; `src/skeleton/README.md`;
`docs/new-game.md`; spec `repo-layout`'s scaffolding requirement.
