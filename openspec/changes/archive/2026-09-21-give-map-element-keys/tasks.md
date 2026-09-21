# give-map-element-keys — tasks

## 1. Decide

- [x] 1.1 Should Map gain key-based entry at all? **Yes** — owner, 2026-09-21,
      asking for the UX to be as consistent and unsurprising as it can be made
      across games. Map was the last game with enumerable elements off the
      panel.
- [x] 1.2 Do **colors** get keys, or only the marks? **Colors too.** Marks alone
      would leave Map's primary action drag-only, which is the inconsistency
      the rule exists to remove.
- [x] 1.3 What does a tap mean once it can select? **It selects the region under
      it** — and Rome's case *does* transfer after all. The scaffold recorded
      that Map's taps "begin a drag, so selection has to be carved out of
      behavior that already does something"; a tap picks a region's own color up
      and drops it straight back, which `drop` answers as "nothing changed"
      before any move exists. Selection is additive here exactly as it was in
      Rome.
- [x] 1.4 Does erasing get a key? **Yes, Clear** — the key every other element
      panel carries. It empties the region, which is what "drag in from outside
      the grid" already meant.

## 2. Build

- [x] 2.1 `requestKeys`: four color keys plus Clear, through a shared
      `colorKeys(n, firstColor)` that decorates `digitKeys`. The Marks key is
      not listed — the engine appends it. **The builder is shared because the
      gate made it so**: writing `"1".charCodeAt(0) + i` in the game failed
      `decimal.test.ts`'s "no game restates the decimal digit fact", which
      allows exactly one statement of it in the tree and puts it in the engine.
      A guard arriving at the same place the framework rule would have.
- [x] 2.2 Key entry at the cursor, routed through the existing `drop` so notes
      mode, the clue refusal and the no-op case are not re-implemented. Only
      with the cursor shown, as the digit games do.
- [x] 2.3 Tap-to-select: `placeCursorAtCoords` translates a pixel into the
      cursor's own cell-plus-direction vocabulary, deriving the direction from
      the same quadrant expression the hit-test uses rather than tabulating
      against it.
- [x] 2.4 `KeyLabel.swatch` and the palette behind it — `Puzzle.palette`
      published from `setDrawingPalette`, the one choke point, so the keys
      cannot drift from the board.

## 3. Verify

- [x] 3.1 Pin the `KeyLabel[]`, and assert every swatch names a palette index
      Map's own `colors()` fills.
- [x] 3.2 Key entry: color, mark (and its toggle), Clear, the clue refusal, and
      the decline with no cursor shown.
- [x] 3.3 The tap→cursor translation is lossless over the whole board, with
      vacuity guards for the sweep's size and for reaching a split cell.
- [x] 3.4 A key reaches a region after a tap alone, with no drag anywhere.
- [x] 3.5 Watch each new guard fail: the quadrant mapping forced to one
      direction failed 3.3; tap-select disabled failed 3.4 and the tap test;
      a fixed ink and a removed `mousedown` handler failed the panel's two.
- [x] 3.6 Run the app. Light and dark, keyboard and pointer, panel and physical
      keys interleaved, a split cell colored on both sides of its diagonal, and
      phone width — in Chrome.
- [x] 3.7 Re-baseline `capability-surface.test.ts`'s snapshot: Map gained
      `requestKeys`, which is exactly the deliberate kind of change that
      snapshot asks to be re-recorded and declared. The diff is that one line.

## 4. The panel's focus theft (found in 3.6, not Map's)

- [x] 4.1 Reproduce in a second game — Solo — so it is filed against the panel
      rather than against Map.
- [x] 4.2 Fix in `puzzle-keys`: prevent the `mousedown` default, so focus never
      leaves the board rather than being handed back afterwards.
- [x] 4.3 Guard it, saying plainly that the assertion is a proxy and where the
      consequence was actually observed.

## 5. Record

- [x] 5.1 `docs/games/input.md`: Map moves from "deliberately without element
      keys" to the worked case for a game whose element is not a character, and
      the panel's focus rule is written down with why no tier can see it.
- [x] 5.2 Spec deltas: `map` (key entry and tap selection), `ts-engine` (a key
      may name a palette color), `app-shell` (the panel never takes focus).
