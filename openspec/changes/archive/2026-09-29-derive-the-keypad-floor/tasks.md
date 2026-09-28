## 1. Measure

- [x] 1.1 Census which games accept a digit or letter key, and which offer a
      keypad (scratch sweep over every registered game, cursor walk plus
      pointer selection).
- [x] 1.2 Try the proposal's property ("accepts a keyboard-only character ⇒
      offers a keypad"), and the Clear code as a separator; record why each fails.
- [x] 1.3 Census the two arms of `takesNotes` against the keypads.

## 2. Replace the floor

- [x] 2.1 Export `hasPencilArray` from `engine/key-labels.ts` as the board arm
      `takesNotes` already runs.
- [x] 2.2 Replace `offered.length >= 12` in `input-parity.test.ts` with a
      per-game biconditional and the `KEYPAD_WITHOUT_PENCIL` ledger (Filling,
      Guess), with a ledger sanity case.
- [x] 2.3 Prove it red: Solo without `requestKeys`, Filling without
      `requestKeys`, Guess missing from the ledger — each fails its own case.

## 3. What the census found

- [x] 3.1 Unequal answered the panel's Clear (8) but not the keyboard's
      Backspace (127), which its help page promises; test `isEraseKey`.
- [x] 3.2 Guard it: the inert-key case presses `DELETE` wherever the panel
      offers Clear; proved red against the unfixed Unequal.

## 4. Record

- [x] 4.1 `docs/games/input.md` § "The on-screen keypad": the keypad check and
      Clear/Backspace.
- [x] 4.2 `ts-engine` spec delta.
