# lightup

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: row-major, `B`, `0`–`4`, runs `a`–`z` | stated | "Light Up descriptions use the upstream run-length encoding" |
| desc | what the parser refuses: an unknown character, too short, too long | stated | "Light Up descriptions use the upstream run-length encoding" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, the short form | stated | "Light Up's parameters" |
| params | the `b` letter (`blackpc`) | stated | "Light Up's parameters" |
| params | the `s` letter (`symm`, 0 to 4 in the listed order) | stated | "Light Up's parameters" |
| params | the `d` letter (`difficulty`) | stated | "Light Up's parameters" |
| params | what the short form leaves out | stated | "Light Up's parameters"; "Light Up decodes params leniently" |
| params | the legacy `r` flag | stated | "Light Up decodes params leniently" |
| params | a string naming no symmetry demotes 4-way rotational off a non-square grid | stated | "Light Up decodes params leniently" |
| params | refusal: width or height below 2, a symmetry or difficulty not listed | stated | "Light Up's params are validated" |
| params | refusal: `blackpc` outside 5 to 100 | stated | "Light Up's params are validated" |
| params | refusal: 4-way rotational on a non-square grid, either 4-way on a grid under 3 both ways | stated | "Light Up's params are validated" |
| params | refusal: a board too small for its tier | stated | "Light Up's params are validated" |
| params | refusal: width times height too large | gap | "Light Up refuses a grid too large to count" (new) |
| pref | `show-lit-blobs` | stated | "The impossible-mark is the ruled-out cross" |
| control | left-click, Enter: place or remove a light | stated | "Light Up accepts pointer and cursor input"; "Light Up's keyboard cursor" |
| control | right-click, Space, `I`: place or remove a cross | stated | "Light Up accepts pointer and cursor input"; "Light Up's keyboard cursor" |
| control | a light refuses a crossed square and a cross a lit one (the help's sentence under Controls) | stated | "Light Up accepts pointer and cursor input" |
| control | right-drag repeats the cross; left-drag repeats nothing | stated | "Light Up accepts pointer and cursor input" |
| control | a click on a wall | stated | "Light Up accepts pointer and cursor input" |
| control | the arrows move and reveal the cursor | stated | "Light Up's keyboard cursor" |
| control | the first select key on a hidden cursor only shows it; a press parks the cursor hidden | not-owed | `engine-input`: "The engine owns a declaring game's press and select keys" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | rung `forcedLight` ("Only one way to light it") | stated | "Light Up narrates each of its deductive techniques" |
| hint | rung `clueSatisfied` ("A clue that is full", or a 0) | stated | "Light Up narrates each of its deductive techniques"; "A Light Up hint step names its technique and says why" |
| hint | rung `clueSaturated` ("a clue with just enough room") | stated | "Light Up narrates each of its deductive techniques" |
| hint | rung `discountUnlit` ("a bulb that would spoil every option", from a square to be lit) | stated | "Light Up narrates each of its deductive techniques"; "Normal adds the overlapping-set discount" |
| hint | rung `discountClue` (the same, from a clue) | stated | "Light Up narrates each of its deductive techniques"; "Normal adds the overlapping-set discount" |
| hint | the order the techniques are tried in | gap | "Light Up's hint steps come in the solver's scan order" (new) |
| hint | what a step says | stated | "A Light Up hint step names its technique and says why"; "A discount narration describes the set as the deduction counts it" |
| hint | what a step marks | stated | "Light Up hint rendering follows the element-type legend"; "Light Up draws a hint's evidence by what it is" |
| hint | a ruling-out step's move is the cross | stated | "A hint step that rules a square out places the impossible-mark" |
| hint | a partly followed step | stated | "A partly followed hint step shrinks in place" |
| hint | refusal when deduction runs out | stated | "On an Unreasonable board the hint stops at the guess point" |
| hint | refusal on a finished board or one with a mistake | not-owed | `engine-hints`: "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | preset titles | not-owed | `engine-params`: "One describer labels every params set" (no preset declares a title) |
| words | the label's tail words: `N% walls`, the symmetry's name, `no symmetry` | gap | "A Light Up label names its walls and symmetry only when they are unusual" (new) |
| words | the Custom dialog calls the square a wall | stated | "Light Up's words call the square a wall" |

## Defects

None.

## Notes

- The description requirement lists "unknown characters, short descs and
  over-long descs" as refused. Run 2026-10-11 on `c2mBc2a1a4aBc2m1c` with its
  `4` changed: a `5` or a `9` is refused with "This game ID has a number out
  of range for its board." (`src/games/lightup/state.ts:411`), where a `C` in
  place of the `B` gets "has "C" where it can't have one". The row stays
  `stated`: the requirement gives `B`, `0`–`4` and `a`–`z` as the whole
  alphabet and refuses any other character, so a session that let a `5` load
  would be caught by it. Which of the collection's sentences the refusal
  speaks is not stated for either.
- The area ceiling was counted `not-owed` under `engine-params` "A params
  refusal is a sentence", which fixes a refusal's form and says that which
  refusals a game has stay the game's own. No engine capability states the
  ceiling, and `validateParams` here applies it
  (`src/games/lightup/state.ts:198`), so the row is a `gap`. The sentence is
  the engine's constant and each game that returns it picks its own limit;
  `git grep -l AREA_TOO_LARGE -- 'src/games/*/*.ts'` lists them. The engine
  could own the limit as it owns the sentence.
- A params string with no `x` keeps the default height: `10` decodes as 10×7
  (`src/games/lightup/state.ts` lines 131–132), where most games of the
  collection read a bare number as a square. Upstream's `decode_params` does
  the same. No requirement says it, and nothing the game writes has that form,
  so it is recorded here and not written as a rule; it may be a bug to raise.
- "Light Up's parameters" and "Light Up descriptions use the upstream
  run-length encoding" each have a round-trip scenario that quotes no real
  description; `facts.json` has `c2mBc2a1a4aBc2m1c` for `7x7b20s4d0`, which
  loads, and the new order requirement's scenario uses it.
- The solver requirements say what each tier adds and that "the cheap
  deductions restart after the first successful discount", which is the
  solver's order. That the hint's steps come in that order, and the order
  within a pass (columns from the left, the square before the clue, a full
  clue before one with just enough room), was nowhere.
- The order requirement's scenario was run on 2026-10-11: the first step of
  `hint()` on that board is the bulb at the fourth square of the fourth row
  and the second is the 4 beside it, three bulbs in one step. The label
  scenarios were run through `describeParams` and read as quoted.
