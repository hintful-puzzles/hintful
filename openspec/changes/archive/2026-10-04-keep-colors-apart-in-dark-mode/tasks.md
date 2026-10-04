## 1. Measure

- [x] 1.1 An instrument comparing the role pairs a player must tell apart, in
      each scheme, by role rather than palette index; proved on Sokoban's walls
      before and after `wallColor`'s authored dark value.
- [x] 1.2 Classify each finding against the game in the dark scheme
      (`proposal.md` § "What it found").

## 2. Fix

- [x] 2.1 Mines' bevel swap, Range's grid, Unruly's black tile.
- [x] 2.2 A cross-game guard over the pairs, replacing
      `src/puzzle/wall-contrast.test.ts`'s table.
- [x] 2.3 A guard holding each `paletteSwaps` pair to the constants it names.

## 3. Acceptance

- [x] 3.1 The owner looks at Mines, Range and Unruly on a phone in the dark
      scheme. Accepted on the deployment, 2026-10-04.
