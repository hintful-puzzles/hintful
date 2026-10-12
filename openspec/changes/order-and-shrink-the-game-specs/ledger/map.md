# map

The Purpose is unchanged: Map's params codec is written out by hand, so the
spec still holds "its params and description encodings".

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Map reports completion and mistakes | "Because boards are uniquely solvable, the game SHALL implement `findMistakes`:" and the parenthesis "(a definite mistake)" reworded out; the completion rule and the re-solve from the clues kept. "A non-uniquely-solvable board SHALL yield no mistakes" cut (third pass). Scenario "A region colored against the unique solution is flagged" dropped; "A partially-colored but correct board has no mistakes" kept | `ts-engine`, "The engine supports an ephemeral, opt-in mistake-checking hook" (the cells that contradict the unique solution) and "A mistake check compares with the one answer, hidden or not" (which also states the empty result where no one answer was established); `engine-hints`, "Check & Save names a wrong entry in every game" |
| Params: Map's grid is at least two squares each way and holds at least five regions | removed, with its scenario | `bounds: { min: 2 }` and `bounds: { min: 5 }` in `paramConfig`, `src/games/map/index.ts:523` and `:527`; `engine-params`, "Params validity is the engine's check" (a bound refuses whatever `full` says, in the engine's words, "Regions must be at least 5.") and "A generation-only bound is gated on full" (a bound applies to a loaded ID too) |
| Generation: Map's generator is gated on the solver | retitled "Generation: Map's generator never removes the last clue of a color". Second sentence kept, and is the requirement. First sentence (one solution, found at the requested difficulty and not below) cut whole (second pass: the pointer that stood for it went too), with scenario "Generated boards are uniquely solvable at their difficulty", which was its case; scenario "The only clue of a color stays" written in words for the kept sentence, from `if (cfreq[coloring[j]] === 1) continue`, `src/games/map/generator.ts:324` | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates"; the gate is `src/games/map/generator.ts:336` |
| Controls: A Map selection follows the note-taking cell's rule | gains the capability and title of the rule it points at. Nothing cut | |
| Controls: Map's Mark-all press is adaptive | title and scenario kept. "SHALL declare `canMarkAll` and answer the `M` key" and the two phases cut for a citation; kept as the game's own: what the fill is (all four colors) and what an obvious candidate is (the dot of a color a neighbor shows). Found, mended: gains the sentence that a clean which would strike every dot of a region leaves its first in the colors' order (`struck &= struck - 1`, `src/games/map/hint.ts:161`) | `engine-notes`, "Mark-all is adaptive in a game with an obvious-candidate rule" (fill every note-less cell and change no other, otherwise remove the obvious candidates; "a rule of its own") and "The Mark-all press is the engine's, from the game's hook"; `markAll`, `src/games/map/index.ts:509` and `src/games/map/hint.ts:145` |
| Preferences: Map's preferences | retitled "Preferences: The `l` key shows and hides the region numbers". First sentence (the two preferences are exposed through `prefs` under two keywords) cut; second sentence kept, and names the key it toggles, `show-numbers`. `stipple-style` stands, with its two choices in order and its default, in "Preferences: The stipple-style preference sizes the dots". Scenario kept | `prefs`, `src/games/map/index.ts:558` (`show-numbers` at `:560`, `stipple-style` at `:569`); `ts-engine`, "The engine supports per-game user preferences" |
| Hint: Map explains the next deduction | removed, with its scenario "A board that needs a guess is refused" (second pass: its refusal had joined "Hint: The plan offers the lowest rung that fires" as a sentence with a citation, and that went too) | `engine-hints`, "A hint is deduced from the board in play" (the forced steps from the player's own board), "Deduction running out on a sound board SHALL have one wording" (the refusal, and its scenario) and "Deduction runs out only where the tier permits search" ("which only an Unreasonable board allows") |
| Hint: A hint step rings the region it acts on | title and scenario kept. "with a solid band inside the region's boundary, in the hint's action color" cut (the sentence naming `hintMarks` that stood for it went in the second pass); that the band is the only hint mark on a region boundary, and that a single outlines nothing else, kept | `hintMarks.roles.ring`, `src/games/map/index.ts:548` ("a thick band in the hint color along its border") |
| Hint: A premise's regions are outlined apart from the ring | title and scenario kept. "by a thin dashed line in the hint's evidence color, set in from their boundary" reworded to a clause that names the legend; "A chain's regions SHALL be numbered at their label points, with the region numbers hidden while it shows" cut. Kept: the outline stays apart from the ring, and the selection band stays visible | `hintMarks.roles.outline`, `src/games/map/index.ts:549` ("a thin dashed line in a second color, set in from its border", the chain's numbers "where a region's number would go", "the map's own region numbers are hidden"); `engine-hints`, "A chain's order is declared and drawn as an ordinal" |
| Hint: Map offers the player's reading of an undotted region | the requirement it names as the first of the run is now "A blank region's colors are read from its dots", since "Map explains the next deduction" is gone. Nothing else changed | |
| Look: The Map completion flash sweeps the regions | "the whole of a lit region SHALL be filled with a flash color and keep its border and its number" cut to "a region SHALL be lit whole"; the order of the regions and the hidden band kept. Scenario kept | `engine-colors`, "A solved flash drawn as a color takes a shared color" (the ground of a region filled with the role's color, keeping what it holds) |
| Params: Map reads a params string with its height, region count or difficulty left out | Found, mended: gains "SHALL read a string with no `d` as Normal"; the scenario's "the default difficulty" reads "Normal" (`defaultParams`, `src/games/map/state.ts:47`) | |
| Params: Map refuses params that describe no map | Found, mended: the overflow refusal is said to be in the collection's sentence for an area too large (`AREA_TOO_LARGE`, `src/games/map/state.ts:118`) | |

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

## Second pass

The brief's "A pointer is for that case only" and its line on a preference's
key, applied. 9 citing sentences read; 5 removed, none kept as a subject's
pointer (no owed subject of Map's is hollow: its codec, its tiers, its
gestures and its hint are all written out), 4 kept as what the game says
beside a shared name.

Removed (each a copy with a citation, in a subject that says plenty of its
own; where it is stated is the row's third cell):

- **Params**, "The width, the height and the region count SHALL be bounded
  below as `paramConfig` declares", which the review added. The Params
  subject has five requirements of the game's own, and the bounds are stated
  where the row of "Params: Map's grid is at least two squares each way and
  holds at least five regions" says. "Params: Map's parameters" is as it
  stood before the cut, and its row is gone from the table.
- **Generation**, "That the board has one solution, found at the requested
  difficulty and not at the one below, is the collection's (…), and Map SHALL
  depart from neither", with the scenario that was its case. Generation
  still says what each tier's solver does and what the reduction never
  removes; the requirement's new scenario is the kept sentence's own case,
  in words.
- **Preferences**, "It and `stipple-style` are the preferences of the game's
  own in its `prefs`".
- **Hint**, "Where no rung fires, which only an Unreasonable board allows,
  the hint SHALL refuse as `engine-hints`, "Deduction running out on a sound
  board SHALL have one wording" says", with the scenario "A board that needs
  a guess is refused". "Hint: The plan offers the lowest rung that fires" is
  as it stood before the cut, and its row is gone from the table.
- **Hint**, "A step's marks SHALL be the roles `hintMarks` declares".

Kept: "What a selecting gesture does … SHALL be the note-taking cell's rule
(`engine-notes`, "The button and the sticky preference decide the mode a
press selects for"), with the button the gesture used: a region may take a
color when it is not a clue, and a mark when it is blank", and "Map's
`markAll` SHALL be the adaptive press of `engine-notes`, "…", by a rule of
its own: …": each names the shared rule only to say what Map hands it. "Map
SHALL offer the shared `hint-notes` preference, defaulting to `implicit`":
the shared rule has the game state the reading it starts on. "which the
legend sets in from their boundary" is a clause that says why the outline
and the ring can stay apart.

Preferences: the cut removed no key. `show-numbers` stands in "Preferences:
The `l` key shows and hides the region numbers", and `stipple-style` with
its choices, "Small" the default and then "Large", in the requirement after
it.

Each subject read alone after the edits: no fragment, no dangling "it",
every owed subject says what the game does there, every title fits its body.

## Third pass

Two rows of the engine tables name Map, both in the review of "Third round:
the rest"; the ledger filed no engine request.

- **Rules**, "Rules: Map reports completion and mistakes": "A
  non-uniquely-solvable board SHALL yield no mistakes" cut (`ts-engine`, "A
  mistake check compares with the one answer, hidden or not"). `findMistakes`
  reports no broken rule of its own, `src/games/map/index.ts:454`; the red
  adjacency markers are `redraw`'s and stated in `Look`.
- **Description**, "Description: Map's clue list runs over the regions": kept
  whole, as the review says. `engine-params`, "The engine provides the
  run-letter description grammar" states `encodeRunLength`, which Map's writer
  calls (`src/games/map/map-data.ts:419`), and `scanRunLength`, which Map's
  reader does not: it reads the list by hand, and the sentence is what says
  how.

Sentences cut: 1. Clauses kept: 1 requirement (the clue list, for the
reader).

Section 2 of the brief: the spec has no "no departure" sentence and no
pasted-ID sentence. The hint requirements were read against the third
round's hint rows: Map states no refusal, no never-search sentence and no
`hintKeepTrack` sentence.

Each subject read alone: unchanged but for `Rules`, whose first requirement
still says what completes the board and what the check flags.

## Found, mended

- `canMarkAll`, a member that does not exist: left, the sentence went with
  the cut.
- Which dot a clean keeps: "Controls: Map's Mark-all press is adaptive" now
  says the first in the colors' order. A board with a wrong color or a wrong
  dot reaches it.
- An ID with no `d` decodes at Normal: stated in "Params: Map reads a params
  string with its height, region count or difficulty left out", sentence and
  scenario.
- The area refusal's words: "Params: Map refuses params that describe no
  map" now says they are the collection's.
