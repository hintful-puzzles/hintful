## Why

A board's whole fun can be its size, and a phone cannot show a large board
at a size a finger can hit. Today the app fits the board to its space and
leaves zoom to the browser: the board allows only the page's pinch-zoom
(`touch-action: pinch-zoom` in
`src/puzzle/components/view-interactive.ts`), which magnifies the page's
pixels rather than redrawing the board, carries the toolbar with it, and is
absent on a desktop. Large Loopy, Pattern and Galaxies boards need zoom on a
phone now, and the arrow game in `one-model-for-moving-pieces` is only hard
on a board that needs it (owner, 2026-11-21).

## What Changes

- **The board view zooms and pans, for every game**, with no game code: the
  view, not the game, owns a scale and an offset over the fitted board.
- The board is **redrawn at the zoomed size**, so lines and numbers stay
  sharp; the toolbar and controls stay where they are.
- **Every input mode**: pinch and two-finger pan on touch, wheel or trackpad
  and drag of a pan gesture with the mouse, keys for keyboard players. A
  one-finger drag stays the game's.
- **Pointer coordinates are mapped through the view**, so every game's
  clicks and drags land on the cell under the finger at any zoom.
- **The cursor and the hint are kept in view**: a keyboard cursor or a
  hint's target that leaves the visible part of the board pans it back.
- A way back to the fitted board in one action.

## Capabilities

### Modified Capabilities

- `canvas-sizing`: the fitted size becomes the zoom's floor, and the canvas
  may be larger than its space.
- `engine-input`: pointer positions are mapped through the view's
  transform; which gestures belong to the view and which to the game.

## Impact

`src/puzzle/components/view.ts`, `view-interactive.ts`, the midend's
drawing size (`src/engine/midend/midend.ts`), the settings dialog if a
preference is added, and each game's help only where it names a gesture the
view now takes. A browser smoke test on a large board.
