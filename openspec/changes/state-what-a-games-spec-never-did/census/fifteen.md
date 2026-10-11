# fifteen

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: the cells in reading order, comma-separated, `0` the gap | gap | "Fifteen descriptions list the tiles in reading order" (new) |
| desc | what the parser refuses: a number out of range, a repeat, a wrong length, another character | gap | "Fifteen descriptions list the tiles in reading order" (new) |
| desc | what `hasNoSolution` refuses: a permutation of the wrong parity | gap | "Fifteen descriptions list the tiles in reading order" (new); the load-time refusal itself is `engine-params`: "A board its game proves has no solution does not load" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, a bare `W` being square | stated | "Fifteen's params are a width and a height" |
| params | what the short form leaves out: nothing (`3x3` both ways) | stated | "Fifteen's params are a width and a height" |
| params | refusal: a width or height below 2 | stated | "Fifteen's params are a width and a height" |
| pref | (none) | not-owed | The game has none (`facts.json`: `prefs: []`) |
| control | a click on a tile in the gap's row or column slides it and every tile between | stated | "A click slides only along the gap's row or column"; "A Fifteen slide shifts the whole line between its target and the gap" |
| control | a click anywhere else | stated | "A click slides only along the gap's row or column" |
| control | the arrow keys slide the tile next to the gap in the arrow's direction | stated | "A click slides only along the gap's row or column" |
| control | the right button, and a held press on touch | not-owed | `engine-input`: "A game with no secondary meaning is not given a synthetic one" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | the plan: the whole greedy solution, one slide a step, and how the solver chooses | stated | "Fifteen offers a greedy full-solution hint plan" |
| hint | rung `goalHome` ("slide it into place") | stated | "A Fifteen hint step says whether its slide places a tile home" |
| hint | rung `goalCloser` ("slide it closer") | stated | "A Fifteen hint step says whether its slide places a tile home" |
| hint | rung `goalReposition` ("slide it back a step, leaving the hole between it and its home") | stated | "A Fifteen hint step says whether its slide places a tile home" |
| hint | rung `tileHome` ("slide tile N into place") | stated | "A Fifteen hint step says whether its slide places a tile home" |
| hint | rung `outOfWay` ("slide tile N out of the way") | stated | "A Fifteen hint step says whether its slide places a tile home" |
| hint | the order the five are tried in | stated | "A Fifteen hint step says whether its slide places a tile home" (they are the cases of one slide, told apart by which tile slides and where it lands, and no ladder) |
| hint | the mark: the tile to slide | stated | "Fifteen offers a greedy full-solution hint plan" |
| hint | following and leaving the plan | stated | "Fifteen's hintKeepTrack completes on the hinted slide alone" |
| hint | the refusal on a solved board | not-owed | `engine-hints`: "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar: `Moves: N` after the completion words | stated | "Fifteen's status bar shows the move count" |
| words | the preset titles | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

- **The solved arrangement loads.** `1,2,3,4,5,6,7,8,0` for `3x3` loads
  (`loadDesc`, run 2026-10-11) as a board already finished. The spec's "A
  generated Fifteen board is solvable and starts unsolved" binds `newDesc`
  only. No requirement was written for the pasted case: nothing in the code
  decides it, and `engine-difficulty`'s "A board that comes solved is dealt
  again" is about dealing.
- **A number is read with leading zeros**: `2,7,0,8,1,5,3,6,04` loads as the
  first preset's board (run 2026-10-11). That is the engine reader's decimal
  for every game, and the requirement says "decimal numbers" and no more.
- **The review ran every string the requirement quotes** through
  `validateDesc` and `loadVerdict` for `3x3`: the dealt board loads, the
  repeat is refused as "gives the same number twice", the exchange reads and
  is refused as having no solution, and a list one short, one long, a `9` and
  an `x` are each refused. The arrows were run from that board, whose gap is
  the top right corner: Up slides the tile below the gap up, Right slides the
  tile on its left, Down and Left do nothing, and a held Shift changes
  neither. Each control of `help/games/fifteen.md` has a row and a
  requirement that states it; no further gap was found.
