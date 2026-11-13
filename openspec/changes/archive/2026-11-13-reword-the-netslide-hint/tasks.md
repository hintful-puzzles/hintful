# Tasks

## 1. Decide

- [x] 1.1 Reason: the shape names the piece ("this loose end") and the closing says what the slide does ("that's where it belongs" / "that sets it up"); a tile beside the source keeps its stated reason ("it belongs beside the source"). A stated reason per step would be the planner's choice dressed as logic, and the shape is what the player can see.
- [x] 1.2 The step carried the direction only as the arrow; `markedOf` now derives it from the slide's `delta` (row +1 right, column +1 down), and a test checks it against `dir`.

## 2. Reword

- [x] 2.1 `rowFixed` and `colFixed` gone (the `frozenLine` rung stays, its words are `working`); destination rings, the `SQUARE` mark, the fixed line's stripe and the renderer's `HINT_SQUARE`/`HINT_LINE` removed
- [x] 2.2 Hint tests and the render snapshot updated (the moves are unchanged)
- [x] 2.3 The help page quotes no hint; the mark legend in `index.ts` and `docs/hints.md` no longer cite the frozen line

## 3. Show

- [x] 3.1 Ran 3x3 easy: first click rings the tile and arrow only; "Slide this loose end down: that sets it up.", then "Working on this loose end: slide it right, where it belongs."; the walk finished the board in 6 moves
- [x] 3.2 The owner accepted the words in the running app (2026-11-13)
- [x] 3.3 The owner asked that the arrow to click be only turned blue, with no ring and no second outline: it is filled in the ring ink (`GameDrawing.drawRingInkPolygon`, the engine's: a game cannot name the ink) and the stale outlined arrow no longer shows under it
