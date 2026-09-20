# derive-the-marks-key-from-having-notes — tasks

## 1. Measure before fixing

- [x] 1.1 Census the collection against the two questions separately — who takes
      notes, and whose keypad offers the Marks key — rather than trusting the
      guard that was supposed to hold them together. Measured 2026-09-21 over
      the live registry: **15 take notes, 13 offer the key, Rome and Map do
      not**, and both have `requestKeys` absent entirely.
- [x] 1.2 Read why the guard missed them rather than assuming. Its population
      was `typeof ui.pencilMode === "boolean"` — a name — and its keypad came
      from `game.requestKeys` rather than from the `Midend` the app renders.
      Both games were outside the population, so the file was green over them.

## 2. Make it structural

- [x] 2.1 `takesNotes(state, ui)` in `key-labels.ts`: the one definition, read
      off what a game *is*. Both arms are needed — `pencil` is the spelling
      every note-taking board uses, and Loopy and Slant take notes without one.
- [x] 2.2 `Midend.requestKeys()` appends the key for any such game, de-duplicated
      so a game that lists it keeps its own placement. This is the step that
      makes the discrepancy unreachable rather than merely detectable: the
      keypad the app renders is this one.
- [x] 2.3 Remove the key from all thirteen games' own lists, so there is one
      source. Loopy's and Slant's `requestKeys` listed *only* that key and are
      deleted. Verified by shape: every changed line across the thirteen files
      is one of exactly three kinds (drop it from an import, drop it from a key
      list, drop a now-unused `KeyLabel` type import) — no prose, no logic
      (`AGENTS.md` § "Verify a bulk edit by shape, not by a green suite").

## 3. The two games it exposed

- [x] 3.1 **Rome.** `pencilMode` toggles from the key and makes an ordinary
      press start a pencil drag rather than an arrow drag; a typed direction
      pencils too. `kmode`'s one-shot `KEYMODE_PENCIL` arming is upstream's and
      is untouched — it is the keyboard-cursor flow, and the new flag is the
      sticky mode a touch player needs.
- [x] 3.2 **Map.** The mode supplies the `altButton` that `drop` already took,
      so a drag from a colored region onto a blank one lays dots instead of
      coloring. **Not a contortion, and worth saying why**: Map's mark is chosen
      by the *drag's origin*, not by the mode, so the mode arms the kind of drop
      rather than its content — which is exactly the boolean the right-drag was
      already supplying.
- [x] 3.3 Both grow their canvas for the pencil-mode indicator, because both had
      borders too small to hold it (Rome's is two pixels; Map had none). A
      sticky mode with invisible state is a trap, and the collection's guard
      says so. Rome routes every drawing site through a new `origin(ts)`; Map's
      geometry already funneled through `coord`/`fromCoord`, so it is two lines.
- [x] 3.4 Help pages: both now name the Marks button.

## 4. The guard

- [x] 4.1 Rewritten to ask the two questions that can still be answered wrongly:
      does the derivation see every game that takes notes, and does the key
      *do* anything when pressed. It reads the keypad through the `Midend`, as
      the app does. Its exemption ledger is **empty**, and empty still asserts
      something.
- [x] 4.2 Proved failing in both directions, per `AGENTS.md` § "Prove a new guard
      fails before trusting it": **16 failures** when the engine stops
      appending the key, and Rome alone when it stops handling the press.
- [x] 4.3 Recorded figures that moved, each an intended change: the capability
      surface (six lines — two `requestKeys` gone, `pencilMode` and
      `pencilModeShown` added for the two games) and four render snapshots
      (Rome's and Map's boards shifted by the indicator margin; the Rome diff is
      75 coordinate shifts plus one new op, which is the expected shape).

## 5. Close out

- [x] 5.1 Ran the app: the Marks key appears below Rome's board, and pressing it
      then dragging lays a blue pencil arrow where an unarmed drag places a
      green one.
- [x] 5.2 Spec delta: `ts-engine` — the engine owns the key, an offered key is
      never inert, and a sticky mode is visible.
- [x] 5.3 `docs/games/input.md` records the rule and the failure that produced it.
