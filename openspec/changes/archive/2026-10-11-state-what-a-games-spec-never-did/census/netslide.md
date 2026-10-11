# netslide

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: a hex digit a tile, `v` and `h` for its barriers | stated | "Netslide descriptions encode wires and barriers" |
| desc | what the parser refuses: an unexpected character, too few or too many tiles | stated | "Netslide descriptions encode wires and barriers" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, the `w` letter, the `b` segment, the `m` segment | stated | "Netslide's params and their encoding" |
| params | what the short form leaves out: `b` alone | stated | "Netslide's params and their encoding" |
| params | a bare `{n}` being square | stated | "Netslide's params and their encoding" |
| params | a string with no `b`, the order of the letters, a bare `{n}` taking none | gap | "A Netslide params string with no `b` asks for no barriers" (new) |
| params | refusal: more than a million squares | gap | "Netslide refuses a grid past a million squares" (new) |
| params | refusal: a side under 2, a barrier probability outside 0 to 1, a negative move target | not-owed | `engine-params`: "Params validity is the engine's check" (the fields' declared bounds) |
| pref | (none) | not-owed | The game has none (`facts.json`: `prefs: []`) |
| control | a click in the gutter slides the line, the right button the other way | stated | "A click in the gutter slides the line beside it" |
| control | which way each gutter slides its line | gap | "A Netslide arrow slides its line toward its own edge" (new) |
| control | no slide beside the source's row or column | stated | "A click in the gutter slides the line beside it" |
| control | the arrows walk the ring of slide arrows | stated | "The keyboard cursor walks the ring of arrows" |
| control | select slides the line under the cursor | stated | "The keyboard cursor walks the ring of arrows" |
| control | Enter and Space both slide as the left button, and the first only shows a hidden cursor | gap | "A Netslide arrow slides its line toward its own edge" (new); the game declares no `targetVerbs` (`facts.json`: `targetVerbs: null`), so `engine-input`'s rule for a declaring game's select keys does not cover it |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | what the plan is searched against, and its goal | stated | "The hint plans against a finished grid"; "The plan's goal is every tile powered" |
| hint | rung `frozenLine`: the source's row or column never slides | stated | "The hint leads with the tile's one degree of freedom" |
| hint | rung `besideSource`: the tile belongs beside the source | stated | "The hint does not restate the rules" |
| hint | rung `working`: the slide said by what it does for its tile | stated | "Each move is narrated by its consequence" |
| hint | the order the three are chosen in, and a later leg's words | gap | "A Netslide journey opens on the first reason that holds" (new) |
| hint | "where it belongs" and "sets it up" | stated | "The hint claims a tile belongs only where its wires are wanted"; "A tile an unfinished plan parks is narrated as set up" |
| hint | a subgoal of several slides | stated | "A subgoal of several slides is one journey" |
| hint | the marks | stated | "Netslide renders the displayed hint step"; "A destination a tile belongs in is marked apart from a stop on the way" |
| hint | the refusal where the search finds no plan | stated | "Netslide can be solved from any position" |
| words | the status bar: what it reports | stated | "The status bar counts moves and powered tiles" |
| words | the status bar: its words | gap | "Netslide's status bar reads moves, then the target, then the tiles lit" (new) |
| words | the preset titles `easy`, `medium`, `hard` | gap | "Netslide's preset titles name the help the barriers give" (new) |

## Defects

None. `help/games/netslide.md:26-34` gives the arrows, the right button and
the keys as `src/games/netslide/index.ts:166-222` has them.

## Notes

- **Netslide's titles may break an engine rule.** `engine-params`'s "A preset
  title that names a difficulty names its own tier" says a title that uses
  one of the collection's difficulty words uses the word of the preset's own
  tier, derived from the tier list. Netslide has no tiers and titles a preset
  "easy" (`src/games/netslide/index.ts:98-105`). The guard
  (`src/engine/difficulty-contract.test.ts:183-212`) passes it twice over: it
  walks only games with a difficulty contract, and it matches the scale's
  words with their capitals. The new requirement states what the titles
  mean. Recommendation: title these by what differs, as the
  engine's describer already can ("100% barriers", "wrapping"), and drop the
  three words; that changes what a player reads in the Type menu, so it is
  the owner's call.
- "A preset keeps a declared title only for a name no field says"
  (`engine-params`) is the other rule these titles sit under: `easy` is the
  `b1` field said again, and `hard` the `w` field. Run 2026-10-11, the
  engine's describer names the three 3×3 presets "3x3, 100% barriers", "3x3"
  and "3x3 wrapping" from their fields, and the menu shows "3x3 easy", "3x3
  medium" and "3x3 hard". Only `medium` is a name no field says. So the code
  sits against both engine requirements as they are written, and the new
  requirement states what the code does, not that it is right. Whether the
  titles change or the engine rules gain an exception is the owner's: either
  changes what a player reads.
- **The status bar's exact words were not in the spec.** "The status bar
  counts moves and powered tiles" says what it reports;
  `src/games/netslide/index.ts:347-352` writes `Moves: {n}`,
  ` (target {t})` and ` Active: {a}/{w·h}`. The reviewer added them as a
  requirement of their own, since every other game of the batch with a
  status bar has its words stated (run 2026-10-11 through the midend: "Moves:
  0 Active: 2/9" on `3x3b1:26dh2vhb49cv1`, "Moves: 0 (target 7) Active: 2/9"
  on `3x3b1m7:26dh2vhb49cv1`).
- **`decodeParams` parses its `{w}x{h}` prefix itself**
  (`src/games/netslide/state.ts:107-116`), against `engine-params`'s "The
  engine provides a shared dimension param parser", and differs from it: a
  bare `{n}` returns at once, so `3w` is a 3×3 grid that does not wrap.
- The barrier probability from a params string is not rounded to single
  precision (`src/games/netslide/state.ts:130`), where the Custom dialog's
  is (`src/games/netslide/index.ts:286`) and Net's decoder's is
  (`src/games/net/state.ts:106`). A string such as `b0.1` therefore names a
  probability a hair off the one the dialog would set for "0.1"; whether a
  board ever differs for it was not measured.
