# Design — share-line-drawing-drag

## Context

From the survey `add-path-ts-port` ran (2026-10-21); re-check before relying
on a line reference.

| | Pearl | Path |
| --- | --- | --- |
| Ui | `dragcoords` (length w·h) and `ndragcoords` (−1, 0, >0), `clickx/clicky` | `drag: {cells, keyboard, at} \| null` |
| step | rook steps toward the target, stop at a cross | the same |
| back onto a passed square | cut to it | cut to it |
| back onto the first square | closes a loop, unless a square would get three lines | cuts to it (no loops in Path) |
| a square over-full | not refused while dragging | refused: the drag stops |
| erase | `clearing` until the first new edge | the same |
| release | `flip` op pairs | absolute edge marks |
| click | `markInDirection` toward the press's nearest side | `toggleLine` on `edgeAt(at)` |
| right button | `crossDrag` sweep | `crossDrag` sweep, near line for line |
| preview | `draglines` packed at `DS_DSHIFT`, `COL_DRAGON`/`COL_DRAGOFF` | `S_DRAG_ADD`/`S_DRAG_REMOVE` per side |
| keyboard | Enter, arrows, Enter; Space/Escape cancel; Ctrl+arrow line and move; Shift+arrow cross; Ctrl+Shift line without moving | the same less Ctrl+Shift; Ctrl moves only when a move was made |

## D1 — Options, not forks

The module takes what is the puzzle's as declarations: how many lines a square
takes (Pearl: two, or none; Path: one on a number, two elsewhere) and whether
the drag may close a loop (Pearl yes, Path no). Everything else is one
behavior.

## D2 — Where the two differ, the owner decides (asked in this change)

Moving both onto one module surfaces two differences a player of Pearl would
see. Bring each to the owner with a recommendation before changing Pearl:

- **Refusing an over-full square while dragging.** Path refuses it; Pearl
  lets the drag through and shows the error after. Recommendation: refuse in
  both, as upstream's Path sketch asks ("the UI should enforce at all times the
  constraint that at most two links can come into any square").
- **Ctrl+Shift+arrow** (Pearl: a line without moving). Recommendation: keep
  it, and give it to Path.

Until the owner answers, Pearl keeps its behavior through the options.

## D3 — Gestures that are not this one

- **Tracks' rail drag** commits each edge as it passes, through the engine
  sweep, and holds the square paint to one row or column: a different model,
  and its own `docs/input.md` row.
- **Ascent** commits one segment a step and allows diagonals; **Bridges**
  drags island to island. Neither draws through squares.

Record any of these that turns out to share the module's step after all.

## D4 — The preview and the saved move

The module returns the edges a release would change, from which the preview
and the move are both made, so the two cannot disagree. A game's saved move
format stays its own (Pearl's ops), translated at the release.
