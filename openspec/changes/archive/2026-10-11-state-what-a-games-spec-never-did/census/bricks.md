# bricks

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: the playable cells in reading order, numbers in decimal, blank runs as lowercase letters, no boundary cells | stated | "Bricks descriptions use the run-length cell encoding" |
| desc | the separator's character `_`, what a letter counts, the range of a number and what a 7 is | gap | "A Bricks description parts two numbers with _ and counts blank cells from a" (new) |
| desc | what the parser refuses: too many or too few cells, a number out of range | stated | "A Bricks description of the wrong size or range is rejected" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `WxH` | not-owed | `engine-params`: "The engine provides a shared dimension param parser" |
| params | the tier letters `e`, `n`, `t` | stated | "Bricks parameters are a width, a height and a difficulty"; "The undeclared Bricks tier still loads and is never dealt" |
| params | the `d` letter, what the short form leaves out, a string with no `d`, a letter that is no tier | gap | "Bricks writes its difficulty after d, in the full encoding only" (new) |
| params | refusal: width or height under 2 | stated | "Bricks parameters are a width, a height and a difficulty" |
| params | refusal: a 2×2 at Unreasonable | stated | "Bricks parameters are a width, a height and a difficulty" |
| params | refusal: the retired third tier, when dealing | stated | "The undeclared Bricks tier still loads and is never dealt" |
| pref | (none) | not-owed | The game has none (`facts.json`: `prefs: []`) |
| control | left-click cycles shaded, clear, empty; right-click the other way; a numbered cell takes nothing | stated | "Bricks cells cycle by a click or a drag" |
| control | a drag paints every cell it passes | stated | "Bricks cells cycle by a click or a drag" |
| control | Up and Down on the hexagonal grid | stated | "The Bricks keyboard cursor follows the hexagonal grid" |
| control | Enter and Space at the cursor | not-owed | `engine-input`: "The engine owns a declaring game's press and select keys" |
| control | `1`, `0` or `2`, Backspace or Delete (the three key-only verbs); the number pad; Ctrl and Shift with a move | gap | "Bricks' keys paint the cell under the cursor" (new) |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | rung `three` | stated | "A Bricks hint step explains why the move is forced" |
| hint | rungs `unsupported`, `strandSupport`: a shaded brick with nothing to rest on, the cell's own or the one above | stated | "A Bricks hint step explains why the move is forced" |
| hint | rungs `overcount`, `undercount` | stated | "A Bricks hint step explains why the move is forced" |
| hint | the order: which cell, which color first, which rule where several break | gap | "A Bricks hint takes the first empty cell one color breaks a rule in" (new); that the order is fixed is "A Bricks hint plan is recompute-stable" |
| hint | the marks | stated | "A Bricks hint marks the forced cell and its evidence, and places nothing" |
| hint | when it refuses | stated | "The recursive lookahead rung is never narrated"; "A Bricks hint is refused on a board that contradicts its solution without breaking a rule" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | the label | not-owed | `engine-params`: "One describer labels every params set"; the tier's name is "Bricks offers Easy and Unreasonable, and no third tier" |

## Defects

None. The help's line on the number pad and on Ctrl and Shift
(`help/games/bricks.md:18`) says what `src/games/bricks/index.ts:155` and
`:295` do.

## Notes

- "A Bricks hint step explains why the move is forced" names three rules and
  the code has five rungs: each of the two rules about resting and about a
  count breaks in two directions, by shading the cell or by clearing it. The
  new order requirement names all five apart.
- The generator writes no 7 (`src/games/bricks/generator.ts` holds none), and
  the parser accepts one (`src/games/bricks/state.ts:271`): such a cell is
  skipped by the count check (`src/games/bricks/solver.ts:144`) and drawn `?`
  (`src/games/bricks/render.ts:253`). It is upstream's format, so refusing it
  would be a compatibility break.
- Ctrl or Shift with a move names a numbered cell in its move when the cursor
  leaves or enters one (`src/games/bricks/index.ts:295`), and `executeMove`
  passes over it. Run 2026-10-11: with the cursor on a number at the board's
  edge, Ctrl with Up answered a paint move of that one cell, and the board
  did not change. The midend takes a move that leaves the board as it was for
  no step of the history, so a player sees nothing; the game is answering a
  move where `engine-input`: "A game declines a button it did not act on"
  would have it decline.
- The first press of `1`, `0`, `2` or Backspace while the cursor is hidden
  shows the cursor and paints nothing (run 2026-10-11), which is the engine's
  rule for a declaring game's keys and not Bricks' own.
