# map

The Purpose is unchanged: Map's params codec is written out by hand, so the
spec still holds "its params and description encodings".

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Map reports completion and mistakes | "Because boards are uniquely solvable, the game SHALL implement `findMistakes`:" and the parenthesis "(a definite mistake)" reworded out; the completion rule, the re-solve from the clues and the empty result on a board with no one solution kept. Scenario "A region colored against the unique solution is flagged" dropped; "A partially-colored but correct board has no mistakes" kept | `ts-engine`, "The engine supports an ephemeral, opt-in mistake-checking hook" (the cells that contradict the unique solution) and "A mistake check compares with the one answer, hidden or not"; `engine-hints`, "Check & Save names a wrong entry in every game" |
| Params: Map's parameters | gains "The width, the height and the region count SHALL be bounded below as `paramConfig` declares." (rule 2; added in review): with the requirement below gone, nothing under `Params` said where the lower bounds are. Nothing cut | |
| Params: Map's grid is at least two squares each way and holds at least five regions | removed, with its scenario; "Params: Map's parameters" now names where the bounds are | `bounds: { min: 2 }` and `bounds: { min: 5 }` in `paramConfig`, `src/games/map/index.ts:523` and `:527`; `engine-params`, "Params validity is the engine's check" (a bound refuses whatever `full` says, in the engine's words, "Regions must be at least 5.") and "A generation-only bound is gated on full" (a bound applies to a loaded ID too) |
| Generation: Map's generator is gated on the solver | retitled "Generation: Map's generator never removes the last clue of a color". Second sentence kept and put first. First sentence (one solution, found at the requested difficulty and not below) became a pointer that says Map departs from neither. Scenario kept as the game's one case | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates"; the gate is `src/games/map/generator.ts:336` |
| Controls: A Map selection follows the note-taking cell's rule | gains the capability and title of the rule it points at. Nothing cut | |
| Controls: Map's Mark-all press is adaptive | title and scenario kept. "SHALL declare `canMarkAll` and answer the `M` key" and the two phases cut for a citation; kept as the game's own: what the fill is (all four colors) and what an obvious candidate is (the dot of a color a neighbor shows) | `engine-notes`, "Mark-all is adaptive in a game with an obvious-candidate rule" (fill every note-less cell and change no other, otherwise remove the obvious candidates; "a rule of its own") and "The Mark-all press is the engine's, from the game's hook"; `markAll`, `src/games/map/index.ts:509` and `src/games/map/hint.ts:145` |
| Preferences: Map's preferences | retitled "Preferences: The `l` key shows and hides the region numbers". First sentence (the two preferences are exposed through `prefs` under two keywords) cut to a clause naming the two keys; second sentence kept. Scenario kept | `prefs`, `src/games/map/index.ts:558` (`show-numbers` at `:560`, `stipple-style` at `:569`); `ts-engine`, "The engine supports per-game user preferences" |
| Hint: Map explains the next deduction | removed. That the hint refuses where no rung fires, which only an Unreasonable board allows, joins "Hint: The plan offers the lowest rung that fires" with the scenario "A board that needs a guess is refused", which moves unchanged | `engine-hints`, "A hint is deduced from the board in play" (the forced steps from the player's own board), "Deduction running out on a sound board SHALL have one wording" and "Deduction runs out only where the tier permits search" |
| Hint: The plan offers the lowest rung that fires | gains the refusal sentence and the scenario "A board that needs a guess is refused", both from "Hint: Map explains the next deduction" | |
| Hint: A hint step rings the region it acts on | title and scenario kept. "with a solid band inside the region's boundary, in the hint's action color" replaced by a sentence that sends the reader to the legend (rule 2); that the band is the only hint mark on a region boundary, and that a single outlines nothing else, kept | `hintMarks.roles.ring`, `src/games/map/index.ts:548` ("a thick band in the hint color along its border") |
| Hint: A premise's regions are outlined apart from the ring | title and scenario kept. "by a thin dashed line in the hint's evidence color, set in from their boundary" reworded to a clause that names the legend; "A chain's regions SHALL be numbered at their label points, with the region numbers hidden while it shows" cut. Kept: the outline stays apart from the ring, and the selection band stays visible | `hintMarks.roles.outline`, `src/games/map/index.ts:549` ("a thin dashed line in a second color, set in from its border", the chain's numbers "where a region's number would go", "the map's own region numbers are hidden"); `engine-hints`, "A chain's order is declared and drawn as an ordinal" |
| Hint: Map offers the player's reading of an undotted region | the requirement it names as the first of the run is now "A blank region's colors are read from its dots", since "Map explains the next deduction" is gone. Nothing else changed | |
| Look: The Map completion flash sweeps the regions | "the whole of a lit region SHALL be filled with a flash color and keep its border and its number" cut to "a region SHALL be lit whole"; the order of the regions and the hidden band kept. Scenario kept | `engine-colors`, "A solved flash drawn as a color takes a shared color" (the ground of a region filled with the role's color, keeping what it holds) |

## Kept, and why

- **Params: Map's parameters** and **Params: Map reads a params string with
  its height, region count or difficulty left out.** `encodeParams` and
  `decodeParams` are written out, `src/games/map/state.ts:70` and `:82`, so
  no declaration holds the letters or the defaults.
- **Params: Map refuses a tier that a map has no board at**, "None of these
  SHALL be refused at Easy, or when a game ID is loaded". The second half is
  `engine-difficulty`, "An unbindable tier is refused, not silently
  downgraded"; it is one clause of a sentence whose first half is the game's.
- **Rules: Dots that leave out a region's color are a mistake.** `ts-engine`,
  "A candidate note that excludes the answer is a mistake", binds a game
  "where" it reports notes; that Map does is the requirement.
- **Generation: Map's solver is graded by tier.** What each tier means.
- **Solver: Solve uses the generator's answer when it has one.** `ts-engine`,
  "The midend retains generator aux info for Solve", hands the aux over; that
  Map's Solve prefers it to a re-solve is `solve`, `src/games/map/index.ts:429`.
- **Controls**, all but two. `interpretMove`, `pickUp` and `drop` are
  hand-written (`src/games/map/index.ts:128`-`:360`), and `requestKeys` is a
  function whose first sentence is the antecedent of what a key does.
- **Hint: The plan offers the lowest rung that fires.** The order is the
  plan's own loop in `src/games/map/hint.ts`, which nothing reads `hintRungs`
  for.
- **Hint: Map offers the player's reading…**, "defaulting to `implicit`".
  `engine-candidate-hints`, "A game states the reading it starts on", makes
  `populate` the convention and has a game that overrides it say so.
- **Look: What Map draws.** A list, and the only place the spec says a
  flagged mistake is an outline round its region.

## Engine requests

None.

## Found

- **The spec named a `Game` member that does not exist.** "Controls: Map's
  Mark-all press is adaptive" said Map "SHALL declare `canMarkAll` and answer
  the `M` key". The hook is `markAll` (`src/games/map/index.ts:509`), the
  game reads no key for it (`engine-notes`, "The Mark-all press is the
  engine's, from the game's hook"), and `canMarkAll` is a field of the app's
  relay only (`src/contract-surface.test.ts:47`). The sentence went with the
  cut.
- **A clean that would empty a region keeps its lowest dot**
  (`src/games/map/hint.ts:138`); the Mark-all requirement does not say so,
  before or after the cut. That one dot is kept is `engine-notes`, "Repeated
  Mark-all presses converge"; which one is the game's and is unsaid.
- **The spec never says that an ID with no `d` decodes at Normal and not
  Easy**: "Lenient decode" says only "the default difficulty", and the
  default is 15x20 of 30 regions at Normal (`defaultParams`,
  `src/games/map/state.ts:47`). The codec is hand-written, so no declaration
  says it either. It decides what a seed ID with no `d` deals; a board loaded
  with its description is graded as it loads. The preset menu the spec does
  not state either; that is a declaration (`PRESETS`,
  `src/games/map/state.ts:52`) and by the rule not the spec's to hold.
- **`validateParams` refuses an area past 2³¹ before the region count**
  (`src/games/map/state.ts:118`); the spec says "a width and height whose
  product overflows" and not that the words are the collection's
  `AREA_TOO_LARGE`.

## Review

12 rows read, each against the declaration or the requirement it names, read
whole; 1 requirement given a sentence in the spec and a row, no sentence
restored, no further sentence cut.

Changed:

- **"Params: Map's parameters"** gains the sentence that the width, the
  height and the region count are bounded below as `paramConfig` declares.
  The removed bound requirement was the only place `Params` named the lower
  bounds, and the codec requirement beside it is hand-written and names no
  declaration. The sentence gives no figure.
- Two `## Found` items corrected. The preset menu is a declaration and not
  something the spec owes; what a string with no `d` decodes to is owed, the
  codec being hand-written, and `defaultParams` is at `state.ts:47`. That a
  clean keeps one dot is the engine's requirement, and only which dot is
  unsaid.

Checked and found sound:

- The 5 engine titles the spec cites resolve, each exactly. `engine-notes`,
  "The button and the sticky preference decide the mode a press selects
  for", is the rule of what a selecting press does to the highlight and the
  mode, which is what the Controls requirement hands to it.
  `engine-difficulty`, "A difficulty tier binds the board it generates",
  states both directions of the gate at `generator.ts:336`.
- The Mark-all row: the fill of every note-less cell "and change no other",
  then the removal of the obvious candidates, is the engine's sentence clause
  for clause; `markAll` is the hook and no key is read for it.
- The hint rows: the legend's `ring` is "a thick band in the hint color along
  its border", its `outline` "a thin dashed line in a second color, set in
  from its border", with the chain's numbers "where a region's number would
  go" and the map's own numbers hidden. The removed "Hint: Map explains the
  next deduction" is the board in play, the one wording of the refusal and
  where it may show; its "which only an Unreasonable board allows" stays in
  the plan's requirement with its scenario.
- The removed bounds: `min: 2` and `min: 5` in `paramConfig`, refused by
  `paramsError` whatever `full` says, in the engine's words.
- Every line citation lands on the line named, but for the one corrected.
- No kept requirement holds a further copy by the three classes.
  `encodeParams` and `decodeParams` are written out as functions,
  `interpretMove` is hand-written, and the menu is listed by hand and was
  never in the spec. "Map SHALL offer an on-screen key for each of its four
  colors and a Clear key" is `requestKeys`, and is the antecedent of what a
  key does at the cursor. "The Marks key SHALL only switch the mode and SHALL
  make no move" was read against `engine-notes`, "The engine gives every
  note-taking game its Marks key", which appends the key and does not say
  what it does. A cut of 3% is what a game with these three written out by
  hand has to give.
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body.
