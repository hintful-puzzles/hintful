## Why

Our games of moving pieces are each written by hand: Slide, Sixteen,
Fifteen, Netslide, Inertia, Sokoban, Ballsort and Twiddle. The open
`a-game-from-its-description-alone` gives fill games one engine board;
nothing gives movement games a shared model, so every new one is a game's
own code, against `docs/doctrine.md` § "Where the engine is heading: a game
is its description". The owner wants a family of games whose pieces move
only horizontally or vertically (2026-11-21), and a family is the
population such a model needs.

## What Changes

- **One engine model for pieces on a grid**: a piece is a set of cells (a
  block, or a path such as a bent arrow), and a move is one of a few move
  rules the description picks, each a capability:
  - free orthogonal sliding (Slide today);
  - **one axis per piece**, a piece moving only along its own length;
  - run until blocked (Inertia-like);
  - leave the board at an edge;
  - snake, the body following the head along its own path.
- **First new member: Slide with each block moving in one dimension**, as a
  ruleset of Slide (a parameter, with its own presets), not a new game
  (owner, 2026-11-21).
- **Then the arrow game** (working name only): each piece is an arrow drawn
  as a path; tapped, it travels straight out of its head, its body following
  snake-fashion, and leaves the board if its path is clear. A tap on a
  blocked arrow is a loss the player can undo, as in Mines and Inertia
  (owner, 2026-11-21). The game is meant for large boards and leans on
  `zoom-and-pan-the-board`.
  - **A player's mark is a dependency between two arrows**, "this one waits
    on that one", so that a player's marks build up the order the board is
    cleared in. The hint explains a move with the same marks.
  - Our own generator and look; the mechanic is a genre, and no app's
    levels, art or name are taken.
- Slide moved onto the model, as the model's test against a game that
  exists; the rest of the movement games are later work.

## Capabilities

### New Capabilities

- `moving-pieces`: the engine's model of pieces on a grid and its move
  rules, as a description declares them.
- The arrow game's own spec, named when the game is.

### Modified Capabilities

- `slide`: the one-axis ruleset, its presets and its hint; Slide built on
  the model.

## Impact

`src/engine/` (the model, its move rules, input and drawing for pieces),
`src/describe/` (what a description says about pieces and moves),
`src/games/slide/`, a new game directory, help pages, the catalog and
About's credits for the prior art the design takes.
