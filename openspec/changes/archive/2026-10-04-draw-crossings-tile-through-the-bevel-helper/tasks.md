## 1. Decide

- [x] 1.1 Look at Crossing with the shared width in both schemes; keep the
      shared width or record why Crossing's differs. Kept (proposal § Decided).

## 2. Move

- [x] 2.1 `drawBevelTile` draws through the shared helper.
- [x] 2.2 The "no game re-derives the bevel" scan finds its population by the
      shape on the frames, and is seen red on Crossing before 2.1.
- [x] 2.3 `drawRaisedTile` owns the face and its inset; Fifteen, Sixteen,
      Mines, Inertia, Sokoban and Crossing call it.
- [x] 2.4 Inertia and Sokoban pass the box inside the grid line, so the border
      is even. Unit test seen red on the old inset.
- [x] 2.5 Retire `raised-bevel.test.ts`.

## 3. Verify

- [x] 3.1 Crossing's render snapshots change only in the bevel's geometry and
      in losing the tile's own clip and first fill.
- [x] 3.2 Fifteen's, Sixteen's and Mines' snapshots do not change.
- [x] 3.3 Crossing, Inertia and Sokoban looked at in the app.
