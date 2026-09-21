# give-map-element-keys — tasks

**Nothing here is started.** The first task is a decision, not code.

## 1. Decide, before building anything

- [ ] 1.1 Ask the owner whether Map should gain key-based entry at all. This is
      the whole change: Map has no keys for *anything* today, so element keys
      for its notes mean adding "select a region, press a color", which changes
      how the game is played rather than how its notes are reached.
- [ ] 1.2 If yes, settle whether **colors** get keys too. Marks alone would
      leave Map's primary action drag-only, which is the inconsistency the rule
      exists to remove — so "notes only" is probably the wrong half.
- [ ] 1.3 Settle what a tap on a region means once it can select. **Rome's case
      does not transfer**: its taps were bare no-ops in the two cases that
      mattered, so selecting there was additive. Map's taps begin a drag, so
      selection has to be carved out of behavior that already does something.
- [ ] 1.4 Settle whether erasing gets a key, since erasing a color is currently
      "drag in from outside the grid" and has no keyboard form either.

## 2. If it goes ahead

- [ ] 2.1 Four color keys plus whatever §1 settled, through `requestKeys`. The
      engine appends the Marks key after them, so do not list it
      (`derive-the-marks-key-from-having-notes`).
- [ ] 2.2 A test pinning that a key press reaches a region *without a drag* —
      the assertion Rome's panel rests on, and the one `input-parity.test.ts`
      cannot make, because it presses keys with a cursor already placed.
- [ ] 2.3 Run the app. Map's geometry moved recently for the pencil-mode
      indicator, and a snapshot cannot see an unpainted region
      (`docs/games/testing.md` § "A snapshot cannot see a hole").
