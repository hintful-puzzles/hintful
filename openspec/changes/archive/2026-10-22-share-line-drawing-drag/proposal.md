# share-line-drawing-drag

Filed by `add-path-ts-port` (archived 2026-10-21) on the owner's word, second
of four after `share-square-edge-geometry`, on whose module it builds.

## Why

Drawing a line by dragging through squares is written twice already, and was
a third time for Path:

- **Pearl** (`moves.ts` `updateUiDrag`, `interpretUiDrag`, `index.ts`'s press,
  drag and release arms): a rook move steps square by square, a step back
  onto a passed square cuts the drag there, returning to the first square
  closes a loop, a cross stops the drag, and a drag starting along a line
  erases until its first new edge. The keyboard: Enter starts, the arrows
  carry, Enter draws, Space or Escape abandons, Ctrl+arrow and Shift+arrow
  draw and cross in one press.
- **Path** (`moves.ts` `extendDrag`, `dragChanges`, `index.ts`): the same
  steps, cutting and erase rule, the same keyboard, no loop, and one rule
  Pearl lacks: the drag stops where its line would give a square more lines
  than it takes.
- **The release, the preview and the click** are each written twice as well:
  the click on the edge a press was aimed at, the preview in two drag colors,
  the right button's cross sweep (`crossDrag`, near line for line the same).

Ascent's segment drag and Bridges' island drag are other gestures, and so is
Tracks' rail sweep; the survey's notes on them are in `design.md`.

## What changes

- **A new engine module** for the line drag over the square-edge geometry:
  the drag held on the `Ui`, a step to a square (rook steps, cutting back, a
  cross stopping it), the erase rule, the release as the edges it changes, the
  click by an edge, the keyboard's Enter-arrows-Enter and its modified arrows,
  the cross sweep's declaration, and the preview's per-edge state. What
  differs between games is a declared option, not a fork: whether a drag may
  close a loop, and how many lines a square takes.
- **Pearl and Path move onto it.** Their behavior is held as it is except
  where the owner decides otherwise (D2).
- **`docs/input.md` § "Drag models"** gains the line drag as a model, with the
  module as its exemplar.

## Not in this change

Tracks' rail sweep, Ascent's and Bridges' drags (other gestures, `design.md`
D3); the edge hint marks (`share-edge-hint-marks`).

## Impact

New engine module and tests; refactors in `src/games/pearl` and
`src/games/path`; `docs/input.md`; spec `engine-input` gains the drag's
requirement.
