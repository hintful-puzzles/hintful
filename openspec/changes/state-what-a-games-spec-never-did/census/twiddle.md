# twiddle

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: each tile's number in reading order, commas without `orientable`, a facing letter `u`/`l`/`d`/`r` with it | gap | "Twiddle descriptions list the tiles in reading order" (new) |
| desc | what the numbers are: `1` to `w·h` once each, or with `rowsonly` each row's number `w` times | gap | "Twiddle descriptions list the tiles in reading order" (new) |
| desc | what the parser refuses: a number out of range or given too often, too few or too many tiles, a comma or a letter in the wrong form | gap | "A malformed Twiddle description is refused" (new) |
| desc | a board `hasNoSolution` proves out of reach is refused at load | gap | "Twiddle refuses a board no turns can put in order" (new) |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, and a bare `W` as a square board | stated | "Twiddle params are written WxHnN with trailing flags" |
| params | the `n` letter (the block's size, 2 when missing) | stated | "Twiddle params are written WxHnN with trailing flags" |
| params | the `r` letter (`rowsonly`) | stated | "Twiddle params are written WxHnN with trailing flags" |
| params | the `o` letter (`orientable`) | stated | "Twiddle params are written WxHnN with trailing flags" |
| params | the `m` letter (`movetarget`) | stated | "Twiddle params are written WxHnN with trailing flags" |
| params | what the short form leaves out: nothing, the shuffle target included | gap | "Twiddle's short params are its full ones" (new) |
| params | the order the letters are read in, an unknown character, `n0` | gap | "Twiddle's short params are its full ones" (new) |
| params | refusal: a board narrower or shorter than its block | stated | "Twiddle refuses a board smaller than its block" |
| params | refusal: width times height too large | stated | "Twiddle refuses a board smaller than its block" |
| params | refusal: a block size below 2, a shuffle count below 0 (the fields' bounds) | gap | "Twiddle's block is at least two squares wide" (new) |
| pref | none of the game's own | not-owed | The game has none (`facts.json`: `prefs: []`) |
| control | left-click turns the block centered on it anticlockwise, right-click clockwise | stated | "A click rotates the block centered on it" |
| control | a click whose block would overhang the grid | stated | "A click rotates the block centered on it" |
| control | the arrows move the cursor over the blocks, clamped | stated | "The Twiddle cursor moves over the rotation origins" |
| control | Enter and Space turn the cursor's block; the first select key only shows the cursor | not-owed | `engine-input`: "The engine owns a declaring game's press and select keys" |
| control | a drag turns nothing more (no sweep) | not-owed | `engine-input`: "A drag does not repeat a move" |
| control | `a`–`d` turn a corner block anticlockwise and `A`–`D` clockwise | stated | "Letter and numpad keys rotate fixed blocks" |
| control | which corner each letter and each keypad corner digit turns | gap | "Each Twiddle letter and keypad digit has its block" (new) |
| control | which edge each keypad edge digit turns, and that a keypad digit turns anticlockwise only | gap | "Each Twiddle letter and keypad digit has its block" (new) |
| control | an edge or center digit acts only where a block sits exactly there | stated | "Letter and numpad keys rotate fixed blocks" |
| control | a digit typed off the keypad does nothing | gap | "Each Twiddle letter and keypad digit has its block" (new) |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | the game has no hint (`hasHint: false`, `hintRungs: null`) | not-owed | `ts-engine`: "A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft" |
| words | the status bar: the move count, never frozen or reset, with `(target K)` | stated | "The Twiddle status bar shows a move count that never resets" |
| words | the status bar's wording, `Moves: N` | gap | "The Twiddle status bar shows a move count that never resets" (modified) |
| words | a title's words: `rows only`, `orientable`, `rotating NxN blocks`, `K shuffles` | gap | "A Twiddle title names what departs from the basic game" (new) |
| words | the title's order (size, kind, tail) | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

- The spec never said what `rowsonly` means for the board (every tile of a row
  carries the row's number). "Twiddle descriptions list the tiles in reading
  order" now says it, as the numbers a description holds.
- What `movetarget` does to the deal is not stated anywhere in the spec: the
  shuffle is exactly `K` random turns, and with no target it is
  `2·w·h·n²` turns plus one more at random (`src/games/twiddle/state.ts`,
  `newDesc`). It is a generator promise, which is not one of this change's
  kinds, so no requirement was written for it.
- Twiddle has no hint and declares no reason for it, so by `ts-engine` it is a
  draft. Nothing in its spec says so, and nothing needs to: the engine
  computes it.
- The spec's "Twiddle is solved when its tiles read in order" says the game
  provides `statusbarText`, `solve` and `textFormat`; `textFormat`'s output
  (numbers padded to a column, `^<v>` after each on an orientable board) is
  stated nowhere. A text export is not one of this change's kinds.
- `fixedBlockKey` strips every modifier but the keypad bit, so Ctrl+`a` turns
  the top-left block as `a` does. Not written as a requirement: no key the
  help names depends on it.
