## 1. Inventory

- [x] 1.1 Measure every registered game's actions by pointer alone and by
      keyboard alone, and search each one-sided kind for a route (`audit.md`).
- [x] 1.2 Read what the probe could not see: app controls (mark-all),
      randomness (Net's jumble), the games it ran out of budget on.

## 2. The structural rule

- [x] 2.1 `KeyOnlyVerb.pointer: PointerRoute` (`repeat`, `cycle`, `notes`),
      required; the Controls paragraph says it (D1).
- [x] 2.2 Routes declared: Net (half turn, lock), Slant, Unruly, Loopy,
      Subsets.
- [x] 2.3 `target-verb.test.ts` holds each route to its keys by painted frame;
      `ProbeBoard.seen`, `boardsReached` `bySight` and `presses` (D2). Seen to
      fail against a planted `times: 3` and a planted `cycle` lock.

## 3. The gaps

- [x] 3.1 Net: Source key and mode, Jumble key, margin drag on a wrapping grid
      (D3); tests in `net.test.ts`; `KEYPAD_WITHOUT_PENCIL` entry.
- [x] 3.2 Ascent: `numberKeys` keypad (D4); a test writing a missing
      two-digit number by taps and keypad alone; ledger entry.
- [x] 3.3 Group: Shift+arrow reorder, `|` and `-` lines (D5); a test holding
      each to its pointer gesture.

## 4. Docs, help, specs

- [x] 4.1 `docs/games/input.md`: the route as a field, both directions of the
      rule, and where the guarantee stops.
- [x] 4.2 Help: Net, Ascent, Group; Loopy's stale touch sentence removed.
- [x] 4.3 Deltas: ts-engine, net, ascent, group, every heading checked against
      the live spec.
- [x] 4.4 Ran the app: Net's Source key, Jumble key and margin scroll; Ascent's
      keypad; Group's keys.
