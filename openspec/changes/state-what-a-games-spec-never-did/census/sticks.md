# sticks

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: the cells in reading order, runs of blank cells as lowercase letters, a block marker, a number inline | stated | "Sticks descriptions use the run-length blank encoding" |
| desc | the characters themselves: `a`–`z` as 1–26, `B`, the `_` between two written cells, and each number's range | gap | "A Sticks description spells a block `B` and parts two written cells with `_`" (new) |
| desc | what `newState` refuses: too many cells, too few, an unknown character | stated | "A Sticks description is validated against the grid" |
| desc | what `newState` refuses: a number out of range, a `_` missing or out of place | gap | "A Sticks description spells a block `B` and parts two written cells with `_`" (new) |
| params | `{w}x{h}`, and a bare `{n}` as a square | not-owed | `engine-params`: "The codec grammar is a prefix, tagged segments, flags and letters" |
| params | the `b` letter (block percentage), full form only | gap | "Sticks writes its block percentage after `b` and its symmetry's number after `s`" (new) |
| params | the `s` letter and which number is which symmetry, full form only | gap | "Sticks writes its block percentage after `b` and its symmetry's number after `s`" (new) |
| params | the `d` letter (`e`, `u`), full form only, and no letter read as Easy | stated | "Sticks parameters round-trip through their encoding" |
| params | what the short form leaves out | stated | "Sticks parameters round-trip through their encoding" |
| params | Width and Height at least 2, and a known symmetry | stated | "Sticks parameters and what each check refuses" |
| params | refusals when dealing: a block percentage outside 5 to 100, 4-way rotational off a square | stated | "Sticks parameters and what each check refuses" |
| params | refusal: an Unreasonable 2×2 | stated | "Sticks refuses Unreasonable where no board needs it" |
| params | refusal: an Unreasonable board past 100 squares or 30 on a side | stated | "Unreasonable Sticks is bounded on its own measurements" |
| control | left-click and right-click on a square | stated | "Sticks is played by drag, click and keyboard cursor" |
| control | Enter and Space at the cursor | not-owed | `engine-input`: "The engine owns a declaring game's press and select keys" |
| control | a drag draws, and one begun along a line clears | stated | "A Sticks drag draws along its dominant axis" |
| control | the keys `1`, `0`, `2` and Backspace | gap | "Sticks' line keys set a line outright" (new) |
| control | Shift or Ctrl with an arrow | gap | "Shift or Ctrl with an arrow draws through the squares the Sticks cursor joins" (new) |
| control | a bare arrow reveals and moves the cursor; a press parks it | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it", "The engine owns a declaring game's press and select keys" |
| control | a block takes no line | stated | "A Sticks block takes no line" |
| control | the keypad | not-owed | the game has no `requestKeys` |
| hint | `tooLong`, `unreachable`, `twoClues`, `overConnected`, `starved` | stated | "A Sticks hint names the clue a tentative line would break, and how" |
| hint | the order the squares and the reasons are taken in | gap | "The Sticks hint takes the first forced square in reading order" (new) |
| hint | several squares from one clue are one journey | stated | "One clue ruling out several Sticks squares is one journey" |
| hint | what a step says | stated | "A Sticks hint concludes in the necessity voice and names a clue by its number", "Sticks calls the cell a block" |
| hint | what a step marks | stated | "The Sticks hint draws the forced line in the hint color", "The Sticks hint shows its evidence, and the marks count out against the words" |
| hint | when it refuses | stated | "Sticks' hint stops where the solver does" |
| words | the status bar | not-owed | the game has no `statusbarText` |
| words | the words a title gains off the default: `N% blocks`, `no symmetry`, a symmetry's name | gap | "A Sticks title says its blocks and its symmetry where they are not the default" (new) |
| words | the size and the tier in a title | not-owed | `engine-params`: "One describer labels every params set" |
| words | block, never black cell | stated | "Sticks calls the cell a block" |

## Defects

None.

## Notes

- Sticks declares no preference (`prefs` is absent), so there is no `pref`
  row.
- A params string with a difficulty letter the game does not know
  (`5x5b20s2dq`) decodes as Easy and is not refused. That is the codec's
  `choice` segment and the same in every game that uses one. The spec says
  what a string with no letter decodes as and not what an unknown one does,
  and `engine-params` "The codec grammar is a prefix, tagged segments, flags
  and letters" could say it once.
- The symmetry is written as its stored number and not as a letter, so a
  number that names no symmetry (`5x5b20s7`) decodes and is then refused by
  the engine's check of the choices field, at every check.
- `validateParams` reads the symmetry and the block percentage only when
  dealing, so `5x6b20s4` (4-way rotational on a 5×6) is accepted as the params
  of a board that arrives written. "Sticks parameters and what each check
  refuses" states that; it is recorded here because the scratch run showed it.
- A label composes for params no deal accepts: `2x2b50s2du` reads "2x2
  Unreasonable, 50% blocks" and is refused for a deal ("No 2x2 puzzle is
  Unreasonable."). The title requirement's scenario quotes it for its words
  only; it is the one string a test uses whose block percentage is not 20
  (`sticks-tier.test.ts`).
- On the dealt board the 3 in the top-left corner decides three squares in
  two journeys and not one: the second and third squares of the row are not
  forced until the 3's own line is placed, since a clue with no line through
  it breaks nothing. "One clue ruling out several Sticks squares is one
  journey" holds of squares forced on one board, which the order requirement
  now says.
