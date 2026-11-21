## 1. Design

- [ ] 1.1 Prior art, by a subagent: zoom and pan on a canvas puzzle board
      (puzz.link/pzprjs, other puzzle PWAs, map viewers' gesture
      conventions), and how they keep one-finger drags for the game. Credit
      what is taken.
- [ ] 1.2 Measure the problem in the app: the largest presets of Loopy,
      Pattern and Galaxies on a phone-sized viewport, the cell size in CSS
      pixels, and what the browser's pinch-zoom does today.
- [ ] 1.3 Write `design.md`: where the transform lives (view, not game);
      redraw at the zoomed size and its cost on the largest boards; the
      gesture split per input mode; keeping the cursor and the hint target
      in view; the way back to the fitted board; whether the zoom is kept
      per game or reset on a new game. A control's behavior is the owner's
      call: bring options where unsure.

## 2. The view

- [ ] 2.1 Scale and offset in the board view, with the fitted size as the
      floor; redraw at the zoomed size.
- [ ] 2.2 Pointer mapping through the transform, for every game, with no
      game code.
- [ ] 2.3 Gestures: pinch and two-finger pan, wheel/trackpad, keyboard;
      replace `touch-action: pinch-zoom` with what the view handles.
- [ ] 2.4 Cursor and hint target kept in view; reset to the fitted board.

## 3. Finish

- [ ] 3.1 Tests at the lowest tier that fits: the transform and pointer
      mapping in unit tests; one browser smoke on a large board.
- [ ] 3.2 Check in the app with touch, mouse and keyboard, dark mode and
      a small screen; frame time on the largest board against HEAD.
- [ ] 3.3 Spec deltas (`canvas-sizing`, `engine-input`); help for the
      gestures; commit, push, archive.
