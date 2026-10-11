# separate

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | `w·h` uppercase letters in reading order | stated | "Separate descriptions encode the letters grid" |
| desc | refusals: the wrong length, a letter outside `A .. A+k-1` | stated | "Separate descriptions encode the letters grid" |
| desc | what `newState` builds: the letters and only the rim walls | stated | "A new Separate board holds its letters and only the rim walls" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}`, the `n` letter, `de` and `du`; the bare `{w}`; what the short form leaves out (the difficulty) | stated | "Separate's parameters are a size and a letter count" |
| params | a size with no `n`, as `6x4`: the letters are the width | gap | "A Separate size with no letter count takes its width" (new); the requirement in the tree gives only the bare `{w}` |
| params | refusals: `k` not dividing `w·h`, an unreasonably large area; for dealing, `k = w·h`, `k = 1`, `k > 26` | stated | "Separate refuses a letter count the grid cannot be divided by" |
| params | refusal: sizes the generator gives up on | stated | "Separate refuses to deal a size its generator gives up on"; "Separate refuses no size of up to seven letters" |
| params | refusal: Unreasonable where no board needs it | stated | "Separate refuses Unreasonable where no board needs it" |
| pref | none (`facts.json`: `prefs: []`) | not-owed | The game has none |
| control | a left click and a right click on the nearest edge | stated | "Each button toggles the nearest edge toward its own state" |
| control | the half-grid cursor, the arrow keys, Enter and Space | stated | "Separate uses a three-valued wall model with a half-grid cursor" |
| control | a drag along several edges | not-owed | `engine-input`: "A drag on from a press repeats the press"; `border-grid`: "A border-grid game takes the mechanic from the engine and owns no copy" |
| control | the rim cannot be edited | stated | "The grid rim cannot be edited" |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | `sharedLetter` | stated | "The ladder's three techniques disconnect, wall and merge" |
| hint | `walledApart` | stated | "The ladder's three techniques disconnect, wall and merge" |
| hint | `onlyWay` | stated | "The ladder's three techniques disconnect, wall and merge" |
| hint | the order | stated | "Separate runs its solver as a declared ladder that its hint shares" |
| hint | what it marks, and how a sentence names a region or a lone square | stated | "A hint sentence rests on the player's own marks"; "Separate offers a deduction-based hint" |
| hint | the sentence of each technique | gap | "A Separate hint says why its edge is forced" (new); the tree quotes only the sentence of two regions a wall separates |
| hint | a later leg's words, and the edge marks | not-owed | `border-grid`: "Border-grid games share the hint's notation layer" |
| hint | the refusal on an Unreasonable board | stated | "Separate's hint stops where the solver does" |
| words | the status bar: "`k` letters per region" | gap | "Separate's status bar says how many letters a region holds" (new) |
| words | the status bar's completion words | not-owed | `ts-engine`: "The status bar's completion words come from the engine" |
| words | preset titles ("4x4 Easy, 4 letters") | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

None.
