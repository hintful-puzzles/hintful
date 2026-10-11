# seismic

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | two comma-separated lists: the walls, row borders first, then the clues in reading order | stated | "Seismic descriptions use the run-length wall and clue encoding" |
| desc | what a number, a letter and `z` stand for in the wall list, and a letter and a digit in the clue list | gap | "A wall-list letter is a run of open borders and the wall that ends it" (new) |
| desc | refusals: an unknown character, a region over nine cells, a clue over its region's size, a clue of 0, a list that does not cover the board | stated | "A Seismic description is validated against its regions" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `{w}x{h}` and the square shorthand | stated | "Seismic's parameters" |
| params | the `T` letter | gap | "Seismic's game ID writes Tectonic as T and the difficulty as de or dh" (new) |
| params | the `d` letter with `e` or `h`; what the short form leaves out (the difficulty) | gap | "Seismic's game ID writes Tectonic as T and the difficulty as de or dh" (new) |
| params | refusals: a side below 4, an unknown difficulty | stated | "Seismic's parameters" |
| params | refusal: an area over the mode's bound, naming the mode | stated | "The size bound is measured, per mode, and says why"; "Tectonic's bound is what can be reached"; "Seismic's bound is what is possible" |
| pref | `sticky-pencil-mode` | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for"; "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `pencil-keep-highlight` | not-owed | `engine-notes`: "Every member offers the keep-highlight preference, defaulted the same way" |
| pref | `hint-notes` | not-owed | `engine-candidate-hints`: "A candidate hint plan reads an unmarked cell the way the player chose"; its default is stated in "The hint starts on the implicit reading" |
| control | a left press, a right press, a press on the highlighted cell | not-owed | `engine-notes`: "The button and the sticky preference decide the mode a press selects for"; "A pointer press moves the highlight to the pressed cell" |
| control | the arrow keys | stated | "Seismic input, note-taking and completion" |
| control | Enter toggles pencil mode | not-owed | `engine-notes`: "The select key on a showing highlight toggles pencil mode" |
| control | a digit enters a number, or toggles a pencil mark | gap | "A Seismic digit enters or pencils, and Backspace, Space or 0 clears" (new) |
| control | a digit over the region's size, a digit on a given | stated | "A Seismic digit above its region's size, or on a fixed clue, is refused" |
| control | Backspace, Delete, Space and `0` clear | gap | "A Seismic digit enters or pencils, and Backspace, Space or 0 clears" (new) |
| control | `M` | stated | "Mark-all fills a note-less cell with its region's candidates" |
| control | the keypad: the digits a board can accept, and Clear | stated | "The on-screen keypad offers only digits a board can accept" |
| control | the Marks key of the keypad | not-owed | `engine-notes`: "The engine gives every note-taking game its Marks key" |
| hint | `populate` | not-owed | `engine-candidate-hints`: "The walk owns the setup" |
| hint | `clean` | not-owed | `engine-candidate-hints`: "Candidate-elimination hints clean obvious candidates at populate"; the reach it cleans by is "The hint walks the shared candidate plan with the keep-apart reach" |
| hint | `note` | not-owed | `engine-candidate-hints`: "The implicit reading writes the notes a firing rests on"; its Seismic words are a scenario of "A note-less Seismic cell is told by what stands within reach" (new) |
| hint | `dup`: a placed number struck from its area and its reach | not-owed | `engine-candidate-hints`: "A placement's cull continues its journey"; the reach is "The hint walks the shared candidate plan with the keep-apart reach" |
| hint | `singleton`: an area of one cell | stated | "The deductions the hint makes" |
| hint | `single`: a cell with one candidate left | stated | "The deductions the hint makes" |
| hint | `regionsFull`: a note-less cell with one number left | gap | "A note-less Seismic cell is told by what stands within reach" (new) |
| hint | `hidden`: a number with one cell left in its area | stated | "The deductions the hint makes" |
| hint | `starve`: an area starved of a number | stated | "The deductions the hint makes"; "The starved-area deduction is the solver's trial rung" |
| hint | the order | stated | "The deductions the hint makes" (the starved area last); `engine-candidate-hints`: "The walk owns the ladder" for the rest |
| hint | the marks: ring, outline, stripes | stated | "The deductions the hint makes" (scenario) for the starved area; `engine-candidate-hints`: "A naked single shades its cell and a hidden single its region" for the singles |
| hint | refusals | not-owed | `engine-hints`: "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | preset titles ("Seismic: 4x4 Easy") | not-owed | `engine-params`: "The preset menu gives each ruleset a section"; "One describer labels every params set" |

## Defects

- The help says the sticky pencil mode is something a preference switches on
  (`help/games/seismic.md:13`: "A preference makes right-click switch on a
  *sticky* pencil mode instead"). The game starts with it on
  (`src/games/seismic/state.ts:312`, `pencilSticky: true`), as `engine-notes`
  "Every member offers the keep-highlight preference, defaulted the same way"
  requires, so the preference switches it off. Confirmed by running,
  2026-10-11: a fresh game's preferences read `sticky-pencil-mode: true`, and
  a right-click on one cell, a left-click on another and `1` pencils a 1 in
  the second cell. The paragraph's first sentence ("Right-click a cell, then
  type a number to add a pencil mark") is therefore true only with the
  preference off.
- The help says `M` fills "every empty cell with all possible pencil marks"
  (`help/games/seismic.md:17`). The move fills only an empty cell that holds no
  marks (`src/games/seismic/index.ts:220`), which is what "Mark-all fills a
  note-less cell with its region's candidates" states. Confirmed by running,
  2026-10-11: with a 1 penciled alone in the first cell of `1a6df3,f1h1`, `M`
  filled every other empty cell and left that cell's one mark, and a second
  `M` made no move.

## Notes

- The wall list is `src/engine/wall-runs.ts`'s, shared with Rome. Its grammar
  (a letter is open borders and the wall that ends them, `z` ends on none) is
  one rule the engine could state once for both games.
- The numbers of the size bound (64 squares in Seismic mode, 100 in Tectonic)
  are in no requirement: the spec states how the bound is arrived at and names
  `MAX_CELLS_SEISMIC`. They are measured figures, which `openspec/config.yaml`
  keeps out of a requirement, so none was written. The refusal reads "Width
  times height must be at most 64 in Seismic mode; the generator cannot
  reliably build a larger board."
- `engine-notes` names neither `sticky-pencil-mode` nor `pencil-keep-highlight`
  by its key: the only requirements that spell `sticky-pencil-mode` are Keen's
  and Solo's. The keys are the engine's (`src/engine/pencil-prefs.ts`) and a
  saved preference depends on them, so `engine-notes` is where they would be
  stated once.
- `Delete` and `0` clear as Backspace and Space do; the help names only the
  last two (`help/games/seismic.md:11`).
