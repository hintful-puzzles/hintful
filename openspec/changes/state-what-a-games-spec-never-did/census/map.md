# map

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: the edge list | stated | "Map descriptions use the upstream two-part encoding" |
| desc | the description format: the clue list | stated | "Map's clue list runs over the regions" |
| desc | what the parser refuses | stated | "A malformed Map description is refused" |
| desc | which color a clue digit is | gap | "Map's digits, keys and color words name one order of the colors" (new) |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, the Width and Height fields | stated | "Map's parameters" |
| params | the `n` letter, the Regions field | stated | "Map's parameters" |
| params | the `d` letter, the Difficulty field, and its chars `e`/`n`/`h`/`u` | stated | "Map's parameters" |
| params | what the short form leaves out (`d`) | stated | "Map's parameters" |
| params | what a decode tolerates and defaults | stated | "Map decodes params leniently" |
| params | refusal: more regions than squares, an overflowing area | stated | "Map refuses params that describe no map" |
| params | refusal: width or height below 2, fewer than 5 regions | gap | "Map's grid is at least two squares each way and holds at least five regions" (new) |
| params | refusal: a tier the map has no board at | gap | "Map refuses a tier that a map has no board at" (new) |
| params | refusal: a tier too rare to deal | gap | "Map refuses a tier too rare to deal on a narrow map" (new) |
| pref | `flash-type`: its key | stated | "Map's preferences" |
| pref | `flash-type`: what each choice changes | gap | "The flash-type preference chooses how a solved map flashes" (new) |
| pref | `show-numbers` | stated | "Map's preferences" |
| pref | `stipple-style`: its key | stated | "Map's preferences" |
| pref | `stipple-style`: what each choice changes | gap | "The stipple-style preference sizes the dots" (new) |
| pref | `sticky-pencil-mode` | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for"; Map's membership is `engine-notes`: "A game whose press starts a drag joins the note-taking cell through its tap" |
| pref | `pencil-keep-highlight` | not-owed | `engine-notes`: "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `hint-notes` | stated | "Map offers the player's reading of an undotted region" (the departure, a default of `implicit`, is stated there) |
| control | drag from a colored region to a blank one | stated | "A drag carries a color or its marks" |
| control | drag from outside the grid, or from a blank region, to erase | gap | "A drag from off the map or from a blank region carries no color" (new) |
| control | a clue cannot be changed | stated | "A drag carries a color or its marks", scenario "A no-op drop yields no move" |
| control | tap a region to select it | stated | "A gesture that commits no move selects its region" |
| control | the four color buttons and Clear | stated | "Map offers one key per color, and a tap selects a region" |
| control | which digit key is which color | gap | "Map's digits, keys and color words name one order of the colors" (new) |
| control | right-drag to add or remove a dot | stated | "A right-drag pencils one color" |
| control | the Marks button: the key itself | not-owed | `engine-notes`: "One way into note-taking across the collection" |
| control | the Marks button: color buttons leave dots | stated | "Map offers one key per color, and a tap selects a region", scenario "The same key marks while notes mode is on" |
| control | the Marks button: ordinary drags leave dots | gap | "Notes mode makes every drop a pencil drop" (new) |
| control | right-click without a drag | stated | "A Map selection follows the note-taking cell's rule"; `engine-notes`: "A game whose press starts a drag joins the note-taking cell through its tap" |
| control | `M`, Fill all pencil marks | stated | "Map's Mark-all press is adaptive" |
| control | the selected region's outline and notes triangle | stated | "The selected region is drawn as a band" |
| control | arrow keys move the cursor | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it"; which region the cursor names is "Selection names the region, not its cell" |
| control | a color's digit fills the region at the cursor | stated | "Map offers one key per color, and a tap selects a region" |
| control | Backspace empties it | not-owed | `engine-input`: "Backspace clears wherever the panel's Clear does"; Clear itself is "Map offers one key per color, and a tap selects a region" |
| control | Enter picks up and a second Enter drops | stated | "The keyboard cursor picks and drops" |
| control | Enter twice without moving erases | gap | "A second select where the color was picked up erases, and the secondary select dots" (new) |
| control | Space drops what is carried as a dot | gap | "A second select where the color was picked up erases, and the secondary select dots" (new) |
| control | `l`/`L` toggles region numbers | stated | "Map's preferences" |
| control | `targetVerbs` | not-owed | The game declares none (`facts.json`: `targetVerbs: null`) |
| hint | `fill` | stated | "The populate reading opens with the Mark-all press" |
| hint | `clean` | stated | "The populate reading opens with the Mark-all press" |
| hint | `onlyColorLeft` | stated | "The hint's deductions are the solver's three rungs" |
| hint | `sharedPair` | stated | "The hint's deductions are the solver's three rungs" |
| hint | `forcingChain` | stated | "The hint's deductions are the solver's three rungs"; its words are "The chain step names what the dots show" and "The chain step ends on the struck color" |
| hint | the order the techniques are tried in | stated | "The plan offers the lowest rung that fires" |
| hint | what a step says and marks | stated | "A narrowing step says what it does", "A pair or chain first dots its premise", "A hint step rings the region it acts on", "A premise's regions are outlined apart from the ring" |
| hint | the words a color is named by | gap | "Map's digits, keys and color words name one order of the colors" (new) |
| hint | when it refuses | stated | "Map explains the next deduction"; the mistake refusal is `engine-hints`: "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | preset titles ("15x20 Easy, 30 regions") | not-owed | `engine-params`: "One describer labels every params set"; the tail words are the Regions field's `label` |

## Defects

None. The help page's Controls section and its Parameters doc strings
(`src/games/map/index.ts:532` and `:536`) agree with `interpretMove`
(`src/games/map/index.ts:231`) and `tierRefusal`
(`src/games/map/state.ts:130`) on every point read.

## Notes

- The help page says "Drag from outside the grid into a region to erase its
  color" without saying that this does nothing while the Marks button is on
  (`drop` in `src/games/map/index.ts:154` refuses to pencil a colored region,
  and the gesture then selects the region). The new requirement "Notes mode
  makes every drop a pencil drop" states it. It is not a disagreement, since
  the help states neither; whether a player in notes mode should be able to
  erase by drag is a question for the owner.
- Selecting twice on a blank region that carries dots changes nothing: the
  second select drops "no color" with the dots that were picked up, which is
  what the region already holds (`src/games/map/index.ts:284`). The help's
  "pressing Enter twice without moving erases" is true of a colored region
  only, and the new requirement says so.
- "Map decodes params leniently" has a scenario with no real string beyond
  `12`; `src/games/map/map.test.ts:155-162` holds `20x15n30dh` and
  `10x10n5.5` for whoever next modifies it.
- The existing desc requirements quote no description. The one dealt for
  `facts.json` is quoted in the new color-order requirement, and was run
  through `newState` on 2026-10-11: region colors
  `0 - - - 1 3 2 1 - - 3 - - - - - 0 1 - 0 - - 1 0 - - 0 0 3 2`.
- The `stated` rows were read on 2026-10-11 against the sentences and
  scenarios of the requirements they name, and each says its item. Run the
  same day: every params string the delta quotes, through `paramsError` and
  `describeParams`, with the refusals word for word; the drags, taps and
  select keys of the four input requirements, through `interpretMove` on the
  `facts.json` board; the preference defaults; and `hint()` followed to the
  end of that board, whose sentences name the colors red, yellow, teal and
  violet in the order of the clue digits.
- A drag from outside the grid onto a colored region in notes mode makes no
  move and moves the highlight there without showing it, as a tap on a
  colored region does in that mode; the scenario said the region "is
  selected", which a player would read as shown.
- A second select erases only by the primary key with notes mode off: the
  secondary key, and either key in notes mode, drops "no color" as a pencil
  drop, which changes nothing on a colored region. The requirement now says
  so.
- For the engine to state once: that a `paramConfig` item's `bounds` is a
  refusal at load as well as at deal is `engine-params` "Params validity is
  the engine's check", but no game's spec is told to state its own bounds'
  values, and those are what a shared link depends on. Every game with
  `bounds` owes the same sentence Map's new first requirement gives.
