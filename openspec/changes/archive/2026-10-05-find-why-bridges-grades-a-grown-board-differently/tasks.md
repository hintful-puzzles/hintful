## 1. Read

- [x] 1.1 Build one of the four boards both ways and find the first deduction
      where the two solves part. Done by listing the islands of
      `4b7f2zzf2zn3b2g` in all 720 orders: reading order solves at Easy, and
      the order with the corner 2 ahead of the 7 solves only at Tricky. They
      part at the 7's "room for exactly what it needs".

## 2. Fix

- [x] 2.1 The verdict made a function of the board, not of island order:
      `BridgesState.islandAdjspace` takes the bridges on a span off its
      capacity.
- [x] 2.2 A test that shuffles island order: the four boards pinned as descs,
      720 shuffled orders each, and 150 dealt boards at `11x11i5e10m3d2`. Both
      seen red with the old room planted.
- [x] 2.3 The generator's read-back removed; the 80-deal test kept, and seen
      red with the old room planted.
- [x] 2.4 `docs/games/solver-and-generator.md` § "A fixpoint is
      order-independent only if every rule is monotone".
