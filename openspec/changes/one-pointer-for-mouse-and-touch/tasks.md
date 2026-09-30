## 1. Frontend and engine

- [x] 1.1 `view-interactive.ts`: drop the middle button, the Shift/Ctrl remaps
      and `MOD_STYLUS`; `swapButtons` narrowed to the two buttons (D1).
- [x] 1.2 `pointer.ts`, `types.ts`, `index.ts`: remove the middle codes and
      `MOD_STYLUS`; exact two-button predicates; `MOD_MASK` 0x7000 (D1).
- [x] 1.3 `game.ts`, `midend.ts`: remove `wantsStylusModifier` and the strip.
- [x] 1.4 `target-verb.ts`: remove the `middle` slot and its Controls sentence.

## 2. Games (D3–D6)

- [x] 2.1 Ascent, Boats, Pearl, Salad, Sticks: the middle arm removed.
- [x] 2.2 Loopy: no stylus cycle; the erase verb is `keyOnly`; notes clear by
      an erase key or by cycling.
- [x] 2.3 Mines: middle chord removed; the preview follows the release.
- [x] 2.4 Net: lock on `S` (`keyOnly`) and a notes-mode tap in a tile's middle
      third; the hint takes the lock verb from `keyOnly`.
- [x] 2.5 Pattern: the mouse cycles as Enter/Space; no stylus flag.
- [x] 2.6 Subsets, Unruly: the clear verb is `keyOnly`.

## 3. Guards and tests

- [x] 3.1 Retire `touch-input.test.ts` and the gesture sweep in
      `input-parity.test.ts` (D2).
- [x] 3.2 `view-interactive.test.ts` § "one pointer, two buttons"; seen to fail
      against a planted stylus bit and a planted Shift remap.
- [x] 3.3 Per-game tests updated (Loopy, Mines, Salad, Subsets, Seismic,
      Slide, the engine's pointer, target-verb and note-taking tests); Net's
      lock tap added.
- [x] 3.4 `capability-surface` snapshot re-baselined: its only change is
      `wantsStylusModifier` leaving Loopy's and Pattern's capability lists.

## 4. Docs, help, specs

- [x] 4.1 `docs/games/input.md` § "One pointer, two buttons" (replacing "Touch
      is stripped for you", repointed), the target-verb slots, the checklist;
      `mechanics.md`, `testing.md`, AGENTS.md drop the stylus flag.
- [x] 4.2 Help: `features.md` (the right-drag advice, D7), Ascent, Net,
      Pattern.
- [x] 4.3 Deltas: ts-engine, ascent, loopy, mines, net, pattern, subsets,
      unruly; every `MODIFIED`/`REMOVED` heading checked whole-line against the
      live spec.
- [x] 4.4 Ran the app: Pattern's right-drag and cycle, Net's notes-mode lock.
