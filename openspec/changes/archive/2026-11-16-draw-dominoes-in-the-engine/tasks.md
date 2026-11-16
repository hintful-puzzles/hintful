# Tasks

## 1. The piece

- [x] 1.1 The spanning piece in `engine/piece.ts`: a cell's half, the joined sides, the divider
- [x] 1.2 Norinori draws its dominoes with it; the partner's side in the tile key
- [x] 1.3 Dominosa draws its dominoes with it; numbers, clash and flash unchanged
- [x] 1.4 Boats: both looks in the browser; the owner's choice. One hull with
      round ends and no divider: shown both and accepted by the owner,
      2026-11-16.
- [x] 1.5 Each game in the browser, both schemes; frame snapshots updated after reading their diffs
- [x] 1.6 The rendering guide's section on pieces

## 2. Norinori's auto-cross

Asked by the owner, 2026-11-16: a preference to cross the squares round a
domino, as Star Battle does, managed by the engine. The engine already owns
it (`Game.rulesOut`, the `auto-cross` preference).

- [x] 2.1 Norinori declares `rulesOut`: the open squares beside a domino a
      move completes, and the rest of a region given its second shaded square
- [x] 2.2 The help page's sentence; checked in the browser
