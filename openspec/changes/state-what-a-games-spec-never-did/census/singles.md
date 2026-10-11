# singles

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | one character a cell: `0`–`9`, `a`–`z`, `A`–`Z` | stated | "Singles descriptions are fixed-length number grids" |
| desc | refusals: a length other than `w·h`, a number outside `1..max(w,h)` | stated | "Singles descriptions are fixed-length number grids" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, the `d` letter with `e` or `k`; what the short form leaves out (the difficulty) | stated | "Singles params are a size and a difficulty" |
| params | the square shorthand | not-owed | `engine-params`: "The codec grammar is a prefix, tagged segments, flags and letters" |
| params | refusals: a side below 2 or above 61; an unknown difficulty letter is not refused | stated | "Singles params are refused outside their bounds" |
| params | refusal: Normal on a grid under 4 both ways | stated | "Normal is refused on a Singles grid under 4 squares both ways" |
| pref | `show-black-nums` | stated | "Singles show-black-numbers preference" |
| control | a left click or Enter shades; a right click or Space circles; either clears | stated | "Singles toggle moves" |
| control | a click outside the grid | stated | "A click outside the Singles grid toggles show-black-numbers" |
| control | a drag across several squares | not-owed | `engine-input`: "A drag on from a press repeats the press" |
| control | the arrow keys move the cursor; the first select only shows it | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it"; "The engine owns a declaring game's press and select keys" |
| control | the cursor wraps at the edges | gap | "Singles' keyboard cursor wraps at the grid's edges" (new) |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | `sandwich` | stated | "A Singles hint step states the number pattern that forces its cell" |
| hint | `pair` | stated | "A Singles hint step states the number pattern that forces its cell" |
| hint | `corner4` | gap | "Three or four matching numbers at a Singles corner are shaded" (new) |
| hint | `corner3` | gap | "Three or four matching numbers at a Singles corner are shaded" (new) |
| hint | `corner2` | stated | "A Singles corner deduction is narrated as a contradiction"; "The Singles corner sentence has one shape" |
| hint | `offset` | gap | "Two pairs in neighboring Singles lines force two squares unshaded" (new) |
| hint | `adjBlack` | stated | "A Singles hint step states the decided cell that forces its cell" |
| hint | `sameLine` | stated | "A Singles hint step states the decided cell that forces its cell" |
| hint | `boxedIn` | stated | "A Singles hint step states the decided cell that forces its cell" |
| hint | `split` | stated | "A Singles hint step states the decided cell that forces its cell" |
| hint | the order | gap | "Singles' hint takes the number patterns once and the joining rules last" (new) |
| hint | a two-cell firing is one step | stated | "A deduction that forces two Singles cells is one step" |
| hint | the marks and their colors | stated | "Singles hint roles are bands and stripes, never fills"; "The forced cell, the number premises and the corner have their own colors"; "A decided premise in a Singles hint takes the color of its state"; "Distinct premise roles in a Singles hint take distinct colors" |
| hint | refusals | not-owed | `engine-hints`: "The midend SHALL refuse a hint on a finished or wrong board before asking the game"; "Deduction running out on a sound board SHALL have one wording" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | preset titles ("5x5 Easy") | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None. The Controls paragraph is generated from `targetVerbs`, and the two
paragraphs written after it agree with `interpretMove`.

## Notes

- The help's Controls section does not say the cursor wraps
  (`help/games/singles.md:12`); the generated paragraph has no words for it.
  Same Game's help does say so of its own cursor.
- "Singles deductive solver" names the solver's techniques by the solver's
  names (`singlesep`, `doubles`, `offsetpair`, `allblackbutone`,
  `removesplits`) and gives no order. The new order requirement is the hint's,
  in the words the help uses.
- The hint runs every technique at every tier, so an Easy board's plan holds
  neighboring-line pairs (measured on six dealt `6x6de` boards: each plan held
  two to four), a technique the solver's Easy tier does not use.
