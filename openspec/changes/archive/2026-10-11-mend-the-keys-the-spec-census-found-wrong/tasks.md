# Tasks

## 1. Reproduce

- [x] 1.1 Each of the five with the key sequence `found.md` records. Sixteen
  in the running app before any edit (Right, Right, Ctrl+Right left the row
  reading 1 3 4). The other four by a test through the game's own
  `interpretMove`, each seen failing before its fix, and all five in the
  running app after (3.6).

## 2. The engine

- [x] 2.1 `modifierArrows` in `src/engine/testing/input-probe.ts`, read by
  `src/engine/modifier-arrow.test.ts`. It presses from every position the
  plain arrows reach, not the corners alone: Sixteen's arrows walk a gutter
  round the board, so its corners by arrow are not squares. Seen failing on
  Sixteen with the fix taken out, naming Shift with Up and with Down from the
  last row; the population is the games whose board a modified arrow changes.
  It cannot see Ctrl in Sixteen, where the two presses leave the cursor in
  different places, so 3.1's tests hold that.
- [x] 2.2 `numpadDirection` in `src/engine/pointer.ts`; Ascent, Bricks and
  Cube use it. Ascent's diagonal test seen failing first. Ascent and Bricks
  wrote the same zigzag for a hexagonal board, now `shearedHexStep` beside it.
- [x] 2.3 Left to the midend's drop, and no probe convicts. The rule was
  decided already (`docs/games/mechanics.md`, "Return a move when the input
  asks for one"), and the reason a probe would be wrong is now beside it: the
  midend claims the key such a move came from, because an unclaimed key is
  the app's to act on, and a game cannot be asked to decline a letter typed
  where it already stands.
- [x] 2.4 Found on the way: the frontend marked every key from the number pad
  with `MOD_NUM_KEYPAD`, the arrows it sends with Num Lock off among them, so
  Ascent under "Move cursor", Bricks and Cube did not hear those arrows. The
  mark now rides a digit alone (`view-interactive.ts`).

## 3. The games

- [x] 3.1 Sixteen: the direction is the key's. Scenarios from the last column
  and row added to "Ctrl or Shift with an arrow key slides the cursor's line".
- [x] 3.2 Galaxies: the keyboard branch looks for a dot under the cursor
  before asking whether the cursor is on an edge.
- [x] 3.3 Ascent: a diagonal that moves does not type.
- [x] 3.4 Filling: a press ends the keyboard drag.
- [x] 3.5 Bricks: 2.3 leaves the midend's drop standing, and the move no
  longer names a numbered cell, which costs one conjunct where the move is
  built. With nothing to paint and nowhere to go the key is declined.
- [x] 3.6 Run the app: Sixteen reads 3 4 1 with the cursor on the 3; Galaxies
  opens the drag from the edge dot at (3,2) and a second Enter associates;
  Ascent's pad 3 twice moves the cursor two squares down-right and types
  nothing; Filling's arrows after a click select nothing; Bricks' Ctrl+Right
  shades the empty cell and passes over the number beside it.

## 4. Close

- [x] 4.1 The spec deltas, `docs/games/input.md` for what the probe holds,
  `docs/games/engine-catalog.md` for the two helpers, validate, the gate,
  commit, push, archive.
