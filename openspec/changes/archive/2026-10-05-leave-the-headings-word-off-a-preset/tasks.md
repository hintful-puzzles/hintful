## 1. Build

- [x] 1.1 `presetMenu`: a leaf's `title` and `label`, the title without the
      ruleset's name under that ruleset's heading.
- [x] 1.2 The midend's `getPresets` carries the label, and
      `Puzzle.getParamsDescription` returns it.
- [x] 1.3 `leafPresets` and the params corpus read the label.

## 2. Guard

- [x] 2.1 `param-label.test.ts`: the lines under a heading, a menu of one
      ruleset, a named preset under a heading.
- [x] 2.2 `puzzle-deal-orientation.test.ts`: Seismic's menu line and header,
      seen to fail when the header returns the line.
- [x] 2.3 `params-declared.test.ts`: no two lines under one heading read the
      same.

## 3. Record

- [x] 3.1 `docs/games/mechanics.md` and `engine-catalog.md`.
- [x] 3.2 The `ts-engine` delta.
- [x] 3.3 The app, opened on a ruleset game.
