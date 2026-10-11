# group

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: decimal numbers, run letters, `_` | stated | "Group descriptions use the upstream run-length encoding" |
| desc | what `newState` refuses | stated | "A Group description is validated against the grid area" |
| desc | which letter a description's number shows | gap | "With the identity shown, number 1 is lettered e" (new) |
| params | the size, the `d` tier letters `t n h x u`, the `i` flag | gap | "Group's params are a size, a tier letter and an identity flag" (new) |
| params | what the short form leaves out, and what it keeps | gap | "Group's params are a size, a tier letter and an identity flag" (new) |
| params | refusal: a size outside 3 to 26 | stated | "Group's parameters" |
| params | refusal: a 3×3 that hides its identity | stated | "Group's parameters" |
| params | refusal: an identity-hidden Easy deal | stated | "Hiding the identity leaves every tier but Easy" |
| params | refusal: a tier no board of the size needs, a tier too rare | stated | "A size is refused at a tier none of its boards need" |
| params | refusal: a `d` with no tier letter after it | gap | "Group's params are a size, a tier letter and an identity flag" (new) |
| pref | `pencil-keep-highlight` | not-owed | `engine-notes`: "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `hint-notes` | not-owed | `engine-candidate-hints`: "A candidate hint plan reads an unmarked cell the way the player chose"; its starting value is stated in "Group's own placements lead the eliminations" |
| control | a click and a right click on a cell | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for" |
| control | the arrows, Enter toggling pencil mode | not-owed | `engine-notes`: "The select key on a showing highlight toggles pencil mode" |
| control | the Marks key | not-owed | `engine-notes`: "The engine gives every note-taking game its Marks key" |
| control | a letter key, the keypad | gap | "A letter key enters its element, and only a capital M marks all" (new) |
| control | Backspace, Space, the keypad's Clear | gap | "Backspace, Space and Clear empty the selected Group cells" (new) |
| control | Mark-all on capital `M` alone | gap | "A letter key enters its element, and only a capital M marks all" (new); a departure from `engine-notes`: "The Mark-all action is the M key", which gives `M`/`m` |
| control | a diagonal drag | stated | "A diagonal drag fills a whole diagonal at once" |
| control | dragging a heading, clicking between two | stated | "Group's rows and columns reorder, and take subgroup dividers" |
| control | Shift and an arrow | stated | "Shift and an arrow move the cursor's row or column" |
| control | `\|` and `-` | stated | "Two keys toggle the subgroup line beside the cursor" |
| hint | `populate`, `clean`, `note`: the setup | not-owed | `engine-candidate-hints`: "The walk owns the setup", "The implicit reading writes the notes a firing rests on" |
| hint | `single`, `regionsFull`, `hiddenSingle`: the Latin placements | not-owed | `engine-candidate-hints`: "A shared narrator for generic Latin placements and strike premises", "A candidate hint distinguishes naked and hidden singles" |
| hint | `dup`, `set`, `forcing`: the Latin strikes | not-owed | `engine-candidate-hints`: "A shared narrator for generic Latin placements and strike premises" |
| hint | `associativity` | stated | "The hint teaches Group's three deductions", "A Group hint names cells by their letters and associativity by its triple" |
| hint | `identityFill` | stated | "The hint teaches Group's three deductions", "Learning the identity fills its row and column as one journey" |
| hint | `identityElim` | stated | "The hint teaches Group's three deductions" |
| hint | the order | stated | "Group's own placements lead the eliminations" |
| hint | the refusal while marks cross out an answer | stated | "Group's Check & Save flags pencil marks that have crossed out the answer" |
| words | the status bar | not-owed | Group has no `statusbarText`; `ts-engine`: "The status bar's completion words come from the engine" |
| words | the preset titles | not-owed | `engine-params`: "A board's tiers are one run of lines, and every tier is offered", "A checkbox rule modifier has one line of the menu" |

## Defects

None.

## Notes

- `engine-notes`, "The Mark-all action is the M key", says a game with
  `canMarkAll` handles "the `M`/`m` key". Group answers capital `M` only
  (`src/games/group/index.ts`, `button === 77`), because small `m` is an
  element. The engine requirement reads as if both spellings always reach
  Mark-all; it could say that a game whose values are letters keeps the small
  one.
- The existing "The identity flag sets how elements are lettered" says the
  identity "is presented first". The code letters it `e`
  (`eFromFront` in `src/games/group/state.ts`), and it is first only in the
  keypad and in the unreordered table. The new requirement states the
  lettering and leaves that sentence as it is.
- The tier letters are upstream's, from tier names this collection has since
  renamed: `h` is Tricky and `x` is Hard.
