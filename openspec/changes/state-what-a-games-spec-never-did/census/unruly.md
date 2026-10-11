# unruly

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: lowercase a run then a `zero` given, uppercase a run then a `one`, `z`/`Z` 25 cells with no given | stated | "Unruly descriptions are run-length color grids" |
| desc | what the parser refuses: a character outside the alphabet, a length other than `w2·h2 + 1` | stated | "A malformed Unruly description is refused" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w2}x{h2}`, the short form | stated | "Unruly's params are a size, the unique variant and a difficulty" |
| params | the `u` letter (`unique`) | stated | "Unruly's params are a size, the unique variant and a difficulty" |
| params | the `d` letter, written only with `full` | stated | "Unruly's params are a size, the unique variant and a difficulty" |
| params | which letter is which tier: `t`, `e`, `n` | gap | "Unruly's difficulty letters are t, e and n" (new) |
| params | a missing or unknown difficulty letter | gap | "Unruly's difficulty letters are t, e and n" (new) |
| params | refusal: an odd side, a side below 6, too many squares | stated | "Unruly's params are a size, the unique variant and a difficulty"; "Unruly refuses params no board can be dealt for" |
| params | refusal: a `unique` grid too tall or too long for distinct rows | stated | "Unruly refuses params no board can be dealt for" |
| pref | none of the game's own | not-owed | The game has none (`facts.json`: `prefs: []`) |
| control | left-click and Enter cycle empty, one, zero; right-click and Space the other way | stated | "Unruly marks cells via three-state cycling moves" |
| control | a given takes no click | stated | "Unruly marks cells via three-state cycling moves" |
| control | a drag repeats the press on the squares that held what the pressed one held | not-owed | `engine-input`: "A drag on from a press repeats the press" |
| control | `1` places one, `0` or `2` zero, at a shown cursor | stated | "Unruly's keys place and clear at the cursor" |
| control | Backspace or Delete empties the square under the cursor | stated | "Unruly's keys place and clear at the cursor" |
| control | the arrows move the cursor; the first select key only shows it | not-owed | `engine-input`: "A target and its cursor belong to the geometry"; "The engine owns a declaring game's press and select keys" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | no three in a row (`threes`) | stated | "A hint step states the technique that forces its cell"; "The Easy techniques are the impending three and the single gap" |
| hint | a full quota (`complete`) | stated | "A hint step states the technique that forces its cell"; "The Normal techniques are the completed count and the unique-rows conflict" |
| hint | no two lines alike (`unique`) | stated | "A hint step states the technique that forces its cell"; "The Normal techniques are the completed count and the unique-rows conflict" |
| hint | the last one has few places to go (`nearcomplete`) | stated | "A hint step states the technique that forces its cell"; "The Tricky technique is the near-complete line" |
| hint | the order the techniques are tried in, and that a board's tier does not limit them | gap | "Unruly's hint tries the simplest technique first" (new) |
| hint | a line with one empty cell is told as a full quota | gap | "Unruly's hint tries the simplest technique first" (new) |
| hint | several cells from one firing are one journey | stated | "A firing that forces several cells is one journey" |
| hint | what a step marks | stated | "A displayed step carries the marks its sentence refers to"; "The named line is hatched under its pieces"; "A cited premise is ringed apart from the move"; "Unruly uses a single premise ring color" |
| hint | following a step | stated | "hintKeepTrack completes on the hinted cell and value" |
| hint | refusal when no technique fires | not-owed | `engine-hints`: "Deduction running out on a sound board SHALL have one wording" |
| hint | refusal on a finished board or one with a mistake | not-owed | `engine-hints`: "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | a title's word `unique` | gap | "An Unruly title says unique when rows and columns must differ" (new) |
| words | the title's order, and its tier name | not-owed | `engine-params`: "One describer labels every params set"; `engine-difficulty`: "Tier names come from one collection-wide scale" |

## Defects

None.

## Notes

- The spec's tier requirements are titled by upstream's ladder ("The Easy
  techniques are the impending three and the single gap", "The Normal
  techniques are the completed count …", "The Tricky technique is the
  near-complete line") and they match the tiers the player sees: the solver's
  `DIFF_TRIVIAL`, `DIFF_EASY` and `DIFF_NORMAL` are shown as Easy, Normal and
  Tricky (`src/games/unruly/constants.ts`). The new letters requirement uses
  the names the player sees.
- A step of the single-gap technique carries the rung `complete` and the
  completed-count sentence (`src/games/unruly/solver.ts`, `checkSingleGap`),
  so `hintRungs` has four entries for five techniques.
- The letters are read in the order they are written in: run on 2026-10-11,
  `8x8deu` decoded as Normal with `unique` off, the `u` after the difficulty
  being passed over, and `8x8d` and `8x8dz` were both refused with
  "Difficulty must be one of Easy, Normal, Tricky." The order is the shared
  codec's, so no requirement of Unruly's states it.
- Unruly's unknown difficulty letter is refused, where Undead's and Unequal's
  decode as the default tier. Each spec now says which; nothing in
  `engine-params` says a game must choose one or the other.
