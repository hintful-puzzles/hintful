## 1. Input

- [x] 1.1 A tap's release walks to a reachable square; the press is declined,
      so a press that slides off still taps where it began.
- [x] 1.2 A press on the player aims; the drag previews the push along its main
      axis, as far as the drag reaches and the barrel can go; the release pushes.
- [x] 1.3 The aim is cleared when the board changes under it (`changedState`).

## 2. Moves, hint and render

- [x] 2.1 `walk` and a `push` with a length, checked in `executeMove`.
- [x] 2.2 The hint's gesture: a tap behind the barrel, then a drag onto it;
      `hintKeepTrack` keeps the step through a walk and completes on the push.
- [x] 2.3 The aim arrow in `DRAG_ADD`, on each square from the barrel to where
      it stops, in the tile cache key.

## 3. Docs and acceptance

- [x] 3.1 The help page's Controls.
- [x] 3.2 docs/games/input.md § "Drag models".
- [ ] 3.3 The owner plays it on a real device.
