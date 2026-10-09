# offer-a-declined-shifted-key-bare

**Status: self-driven.** Turned up by `make-guess-d-clear-in-notes-mode`, whose
`D` could not be seen working in the app, and done in the same session as the
same defect one layer down.

## Why

The frontend sends a key with `MOD_SHFT` set whenever Shift is held, so a
capital `D` arrives as `'D' | MOD_SHFT`. Upstream's midend takes Shift and
Ctrl off every key but the arrows and Tab before a game sees it; this midend
passes the bits through, and each game is left to strip them. Most do. A game
that does not compares the button against `'D'` and never matches.

Seen in the running app (2026-10-09): in Guess, Shift+D and Shift+L did
nothing, in notes mode and out of it, while `d` and `l` worked. A capital
reached the game only with Caps Lock on.

Measured the same day through the midend, 57 games, every printable key plus
Enter, Space, Tab, Escape and both erase keys, from three positions (fresh, a
cursor shown, notes mode on), bare against shifted, 34,200 comparisons:

- Five games dropped a shifted key they take bare: Guess (`l`, `L`, Enter,
  Space), Signpost (`x`, `X`, Enter, Space), Ascent (the erase keys, Enter,
  Space), Pegs (Enter, Space) and Untangle (Enter). The probe reaches a key
  only where the bare key acts from one of its three positions, so this is a
  floor: it missed Guess's `D`, which needs a peg placed.
- No game took a shifted key it declines bare.
- One game gave a shifted non-arrow key a different meaning: Untangle, where
  Shift+Tab and Shift+Space step its point cursor backwards.

Every other read of `MOD_SHFT` in `src/games/` is under `isCursorMove`
(`grep -rnE "MOD_SHFT|shift" src/games/*/index.ts`, read 2026-10-09).

## What Changes

- When a game declines a key that has Shift on it, and the key is not an
  arrow, the midend offers the same key again without Shift. A game that reads
  Shift on a key answers the first offer and is never asked twice, so Untangle
  is unchanged and the engine holds no list of such games.
- An arrow is not offered again. Shift+arrow is a gesture, and a game that
  declines it (Net's origin shift on a bounded grid) has refused that gesture.
- Ctrl is left as it is. Upstream refuses Ctrl+letter outright, and most games
  here act on it; which is right is a separate question that nothing a player
  reported turns on.

Player-visible effect: a capital letter does what its game binds it to, and
Shift+Enter, Shift+Space and Shift+Backspace do what the bare key does in the
five games above, as they already do in the rest.

Declined: removing the per-game `stripModifiers` calls. They also take off
Ctrl and the keypad bit, which this change does not own, and a game is not
wrong to strip.

## Capabilities

### Modified Capabilities

- `engine-input`: a new requirement, "A declined key is offered again without
  its Shift".

## Impact

- `withoutShift` in `src/engine/pointer.ts`, one step in `Midend.interpret`,
  and tests in `src/engine/midend.test.ts`.
- `docs/games/input.md` § "How a press reaches interpretMove".
- No save or game-ID change. `interpretMove` may be called twice for one key.
