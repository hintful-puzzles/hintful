# Tasks

## 1. See the gap

- [ ] 1.1 Plant a key verb that acts on the square beside the cursor, in one
      declaring game, and see `target-verb.test.ts` stay green. Keep the plant
      to hand: it is what the new form has to refuse.
- [ ] 1.2 Time the guard by game (`vitest run --reporter=json`), Loopy first.

## 2. Compare per target

- [ ] 2.1 For every cursor position the walk reaches: the board a key leaves
      equals the board its button leaves at `pointAt` of `cursorTarget`.
- [ ] 2.2 Decide what the key-only verbs with a cycle route compare against,
      and whether the set comparison survives for them alone.
- [ ] 2.3 Compare states without writing them out, where the probe allows it.

## 3. Hold it

- [ ] 3.1 The plant from 1.1 fails. So does an erase key that marks two
      squares, as it does today.
- [ ] 3.2 Fix what the stricter guard finds in the games, each with its own
      test where the defect is a game's.
- [ ] 3.3 Time it again, and say the figure in `docs/testing.md` if the
      guide names this guard's cost.
- [ ] 3.4 Gate, commit, archive.
