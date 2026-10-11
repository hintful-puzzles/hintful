# samegame

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the colors in reading order, comma-separated; `newState` starts at score 0 | stated | "A Same Game description is one color for every tile" |
| desc | refusals: not exactly `w·h` numbers, a color outside `1..ncols`, an empty cell | stated | "A Same Game description is one color for every tile" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, the `c` letter, the `s` letter, the unread `r` | stated | "Same Game's params are a size, a color count and a scoring system" |
| params | what the short form leaves out (nothing: `5x5c3s2` both ways) | gap | "Same Game writes its params whole in both encodings" (new); the requirement in the tree gives the full encoding only |
| params | what a string with no `c` or no `s` decodes to | gap | "Same Game writes its params whole in both encodings" (new) |
| params | the square shorthand | not-owed | `engine-params`: "The codec grammar is a prefix, tagged segments, flags and letters" |
| params | refusals: a side below 1, colors outside 3 to 9, a scoring system other than 1 or 2, a 1×1 grid | stated | "Same Game refuses params it cannot deal" |
| params | refusal: an area too large to count | gap | "Same Game refuses an area too large to count" (new) |
| pref | none (`facts.json`: `prefs: []`) | not-owed | The game has none |
| control | a click selects the group; a lone or empty square selects nothing | stated | "A first click in Same Game selects the group" |
| control | a second click removes; a right-click lets go | stated | "A second click on the selection removes it" |
| control | the arrow keys, wrapping at the edges; Enter and Space at the cursor | stated | "Same Game's keyboard cursor acts where it stands"; "A second click on the selection removes it" |
| control | a key held with a press | not-owed | `engine-input`: "A key held with a press changes nothing" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | no hint (`facts.json`: `hasHint: false`) | not-owed | `ts-engine`: "A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft" |
| words | the status bar: the score, the selection's worth, "Cannot move!" | stated | "Same Game's status bar shows the score" |
| words | the status bar's completion words | not-owed | `ts-engine`: "The status bar's completion words come from the engine" |
| words | how a title is put together | not-owed | `engine-params`: "One describer labels every params set" |
| words | the title's own words: "3 colors", and "alt. scoring" on a board scored `(n-1)²` | gap | "A Same Game title names the colors and the other scoring" (new) |

## Defects

None.

## Notes

- The area refusal is one line in each game's `validateParams`, with the
  engine's sentence (`AREA_TOO_LARGE`) and a limit of the game's own: the
  largest safe integer here (`src/games/samegame/state.ts:113`), 2³¹ − 1 in
  Signpost and Separate, and none in Sixteen. Of this batch only Separate's
  spec stated it. The engine could own the check and state it once.
- Same Game has no hint, so by `AGENTS.md` it is a draft; the census records
  no hint row beyond that.
