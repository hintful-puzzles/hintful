# share-square-edge-geometry

Filed by `add-path-ts-port` (archived 2026-10-21) on the owner's word: its
findings name the engine work that would have made the build cheaper, and the
owner asked for each as a change, with the existing games moved onto it.
First of four, in order: this, `share-line-drawing-drag`,
`share-edge-hint-marks`, `add-edges-skeleton`. The later three build on this
one.

## Why

Every game that marks the edges between the squares of a square grid writes
its own geometry for them, and they do not even agree on what a direction is:

- **Three direction encodings.** Bits R=1, U=2, L=4, D=8 (Pearl, Tracks, and
  Net through `engine/wires.ts`); indices U, R, D, L with `1 << dir`
  (`engine/border-grid.ts`, Palisade, Separate); and slots up, left, right,
  down (Path's `Geometry.around`).
- **The same helpers written again.** "The square across this edge", "the
  edges around this square", "the edge between these two squares", the
  opposite direction, the side of a square a press is nearest: Pearl about 50
  lines over `state.ts`, `index.ts` (`sideAt`) and `hint.ts`; Tracks about 50
  (`sEDirs`, `sECount`, `sESet`, `spotAt`); Path about 60 (`Geometry`,
  `across`, `edgeBetween`, `edgeAt`, `pointAtEdge`, `edgeFromCursor`); border
  grid about 40 (`pointerEdge`, `DX`, `DY`, `FLIP`). Dominosa, Rect, Galaxies,
  Net's notes and Slant's "alike" marks each hold edges in a shape of their
  own too.
- **Writing a mark on both squares by hand** (Pearl's op pairs, Tracks'
  `sESet`, Dominosa, border grid) is a correctness trap a flat edge index does
  not have: the two copies can disagree.

A new edge game (Path was the first greenfield one) spends its first hour on
this.

## What changes

- **A new engine module, `src/engine/square-edges.ts`**: a memoized geometry
  of a `w × h` board's edges, each edge one number, with the squares it joins,
  the edges around a square in one fixed order, the edge between two squares,
  the square across an edge, a direction's deltas and opposite, and the
  pixel side: the edge a press is aimed at and a point that aims at an edge,
  given the tile size and border. Path's `Geometry` is the starting point.
- **Games move onto it where it removes code and moves no byte a player
  owns**: Path whole; Pearl, Tracks and the border grid for their traversal
  and pointer helpers. Each game's stored state and move formats stay as
  they are wherever a save or a game ID carries them (`docs/work-management.md`
  § "A cross-game refactor moves no bytes a player owns"). Dominosa, Rect,
  Galaxies, Net and Slant are each measured, and taken on or declined with
  the reason in `design.md`.
- **An `engine-catalog.md` entry** and the guide pointers for edge games
  (`docs/new-game.md` § "The route by kind of game", Edges and loops).

## Not in this change

The line-drawing drag and the edge hint marks, which are the next two
changes and build on this module; Loopy, whose board is the engine's general
tiling (`src/engine/grid/`) and not a square grid of edges.

## Impact

- New `src/engine/square-edges.ts` and its tests.
- Refactors in `src/games/path`, `src/games/pearl`, `src/games/tracks`,
  `src/engine/border-grid*.ts`, and whichever of the five measured games take
  it.
- Spec: `engine-helpers` gains the module's requirement.
