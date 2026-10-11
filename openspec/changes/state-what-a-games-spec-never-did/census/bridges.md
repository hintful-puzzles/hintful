# bridges

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: islands and their counts row-major, runs of empty squares as letters | stated | "Bridges descriptions encode the island clue grid" |
| desc | which characters are counts and which are runs, and that the trailing empty squares are written | gap | "A Bridges description writes a count above nine as a capital letter" (new) |
| desc | what the parser refuses: a description that overruns or stops short, a character that is neither, two islands side by side, fewer than two islands | stated | "A Bridges description that describes no board is refused" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | the encoding: `WxH`, `i`, `e`, `m`, `L`, `d` with the tier's number; what the short form leaves out | stated | "Bridges params are size, bridge limit, density, expansion, loops and difficulty" |
| params | refusal: Tricky with one bridge a line | stated | "Bridges refuses to generate Tricky with one bridge per line" |
| params | refusal: a tier too few islands can need (three islands above Easy is the one case the spec gives, in a scenario) | gap | "Bridges refuses a tier that so few islands cannot need" (new) |
| params | refusal: a width or height under 3, a value past the end of a field's choices | not-owed | `engine-params`: "Params validity is the engine's check" |
| params | refusal: an island percentage over 30 or an expansion over 100 that the engine's check lets by, when dealing | gap | "Bridges refuses a percentage past its last choice when dealing" (new) |
| pref | `show-hints` | stated | "Bridges offers a show-hints preference for possible bridges" |
| pref | `auto-mark-complete` | stated | "Bridges auto-marks satisfied islands (fork aid)" |
| control | a left-drag between two in-line islands | stated | "Bridges input drags bridges between islands" |
| control | a secondary drag | stated | "A secondary drag lowers a Bridges span's limit by one"; "A Bridges limit never drops below the bridges drawn" |
| control | a click on an island marks it completed and locks it | stated | "Bridges auto-marks satisfied islands (fork aid)" |
| control | Enter then an arrow; Enter twice, or Space; Ctrl and Shift with an arrow; a digit | stated | "Bridges has a keyboard cursor that drags" |
| control | where a bare arrow takes the cursor; `A` to `F` and `0`; the `G` key | gap | "A Bridges arrow steps the cursor to the nearest island that way" (new) |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | rungs `exactSpace`, `everyNeighbor` | stated | "Bridges Easy runs the single-island deductions" |
| hint | rungs `needsThisWay`, `wouldCloseLoop` | stated | "Bridges Normal adds direction counting, loops and sealing off" |
| hint | rung `wouldSealGroup` | stated | "Bridges Normal adds direction counting, loops and sealing off"; "A Bridges firing carries which cause forced it" |
| hint | rungs `wouldStarve`, `mustReachOut` | stated | "Bridges Tricky adds the connected-group deductions"; "A Bridges firing carries which cause forced it" |
| hint | the order the stages are asked in | gap | "A Bridges hint asks its stages in order after every step" (new) |
| hint | the cap, one firing a step, resuming, the hidden bookkeeping mark | stated | "A Bridges hint's ladder is capped at the board's own difficulty"; "One Bridges firing is one hint step"; "Bridges hint resumes from the player's marks"; "Bridges hint hides the bookkeeping mark" |
| hint | the words and the marks | stated | "No Bridges hint step leans on a fact the player cannot see"; "Bridges marks a hint in its own vocabulary"; "A Bridges hint draws a span as what the step makes of it"; "A Bridges hint recolors an island's rim and clue digit" |
| hint | when it refuses | stated | "Bridges explains the next deduction" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | the label: "no loops", "max N bridges", "N% islands", "N% expansion" | gap | "A Bridges label says only what departs from two bridges, 30% islands and 10% expansion" (new) |

## Defects

- **The help's Controls section does not give the `G` key.**
  `help/games/bridges.md:36` lists the arrows, the digits and letters, Enter,
  Space, Control and Shift; `src/games/bridges/index.ts:373` also answers `g`
  and `G`, which switch the possible-bridge lines as the `show-hints`
  preference does. The requirement states the key.

## Notes

- **A percentage between two of the dialog's choices passes the engine's
  check.** Both percentage fields are declared as choices, and the engine
  judges the choice a value falls to, not the value: the island field reads
  `i32` as its last choice and `i7` as its first. Run 2026-10-11: `i35` and
  `i0` are refused by the engine for dealing and loading alike ("%age of
  island squares must be one of 5%, 10%, 15%, 20%, 25%, 30%."); `i32` passes
  it and is refused, for dealing only, by `validateParams`
  (`src/games/bridges/state.ts:238`, "%age of island squares must be between
  1% and 30%."); `e105` likewise (`:240`, "Expansion factor must be between 0
  and 100."); and `i7` is refused by neither, deals, and is labeled "7%
  islands". So the two sentences of `validateParams` are reached, by a typed
  ID alone, for 31 to 34 and for 101 to 109, and the new requirement states
  them. What the engine could do so that no game has it: judge a choices field's
  number against the choices' own values where the codec writes the value.
- The hint takes a stage's islands in the order the board holds them, which is
  the description's reading order. "Bridges grades a board the same however
  its islands are listed" makes the solver's verdict independent of that
  order; which step a hint gives first is not.
