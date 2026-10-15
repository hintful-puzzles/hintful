# Tasks

## 1. See the gap

- [x] 1.1 Plant a key verb that acts on the square beside the cursor, in one
      declaring game, and see `target-verb.test.ts` stay green. Keep the plant
      to hand: it is what the new form has to refuse.
      Unruly's erase acting one square *left* stayed green (2026-10-15). One
      acting right was refused, but only by accident: the primed mark sits in
      the first column, so a right-shifted erase reaches no board at all.
- [x] 1.2 Time the guard by game (`vitest run --reporter=json`), Loopy first.
      Loopy 22.2 s of a 32.4 s file; Slant 1.9 s, Boats 1.6 s, the rest under
      1.5 s (2026-10-15, under `nice`).

## 2. Compare per target

- [x] 2.1 For every cursor position the walk reaches: the board a key leaves
      equals the board its button leaves at `pointAt` of `cursorTarget`.
      A position counts only where the cursor is shown: a hidden cursor's
      first key only shows it, so its press has nothing to pair with.
- [x] 2.2 Decide what the key-only verbs with a cycle route compare against,
      and whether the set comparison survives for them alone.
      Paired too: at each position, the boards the cycle passes through
      pressed at that target, the position's own included. The set
      comparison is gone. A `notes` route is pressed at `pointAt`, so its
      `where` is that point (`docs/input.md`).
- [x] 2.3 Compare states without writing them out, where the probe allows it.
      `sameState` moved to `testing/same-state.ts`; the probe compares by it,
      paints a frame only where two states differ under `bySight`, and hands
      out one dealt state per desc, so a reset shares Loopy's grid. The spy's
      changed/unchanged count uses it too: its digests were most of Loopy's
      cost, and no reader of this guard looked at them.

## 3. Hold it

- [x] 3.1 The plant from 1.1 fails. So does an erase key that marks two
      squares, as it does today.
      Refused: Unruly's erase one square left, Loopy's erase on the previous
      edge, Unruly's Enter one square right, an erase that also marks the
      next square, and Net's half turn on the square to the left (`repeat`,
      by sight). An erase that empties two squares passes, honestly: the
      primed board has one mark, so the second square is already empty.
- [x] 3.2 Fix what the stricter guard finds in the games, each with its own
      test where the defect is a game's. The stricter guard found nothing.
- [x] 3.3 Time it again, and say the figure in `docs/testing.md` if the
      guide names this guard's cost. Loopy 0.53 s, the file 3.2 s
      (2026-10-15). `docs/testing.md` names no figure for it.
- [x] 3.4 Gate, commit, archive.
