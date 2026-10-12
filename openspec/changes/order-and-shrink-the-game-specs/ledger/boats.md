# boats

The Purpose is unchanged: each thing it names the spec still holds.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Boats flags a broken rule as the player plays | gains the second sentence of "Rules: Boats findMistakes re-solves to the unique solution" (a board the live flags mark is one `findMistakes` reports a cell on), which its own scenario already gives a case of. Nothing cut | |
| Rules: Boats findMistakes re-solves to the unique solution | removed. Its second sentence joined "Rules: Boats flags a broken rule as the player plays"; the first (re-solve to the unique solution, report every placed cell that contradicts it, so Check & Save blocks a legal placement no solution permits) and scenario "A legal placement no solution permits is reported" cut | `ts-engine`, "The engine supports an ephemeral, opt-in mistake-checking hook" and "A mistake check compares with the one answer, hidden or not"; `engine-hints`, "Check & Save names a wrong entry in every game" (its scenario "An entry that is wrong and breaks no rule"). That the check solves once at the highest cap is this spec's "Solver: Boats' Solve and mistake check solve once, at the highest cap"; `findMistakes`, `src/games/boats/solver.ts:1007` |
| Params: Boats parameters are a board, a fleet, a difficulty and a remove-numbers flag | removed, with its scenario | `paramConfig`, `src/games/boats/index.ts:641` (the five fields); that the full encoding carries each field is this spec's "Params: Boats params are written as the size, f with the largest boat, the tier, S and the fleet's counts"; the round trip is `engine-params`, "Encode and decode are mutual inverses over the corpus", and `src/games/boats/boats.test.ts:134` |
| Params: Boats refuses parameters no fleet can be dealt from | the four bounds ("width and height are each at least 2 and at most 99", "the fleet size is between 1 and 9") cut, and "Parameters SHALL be refused unless …" reworded to the three refusals of `validateParams`; those and the one-boat fleet kept. Scenarios kept | `bounds: { min: 2, max: 99 }` and `bounds: { min: 1, max: 9 }`, `src/games/boats/index.ts:644` and `:651`; `engine-params`, "Params validity is the engine's check" (the bound's refusal and its words) |
| Params: A Boats label gives the largest boat as its size | removed, with its scenario | the `label` words of three `paramConfig` items, `src/games/boats/index.ts:652` ("size N"), `:666` ("fleet" and the counts, null for the pyramid) and `:681` ("hidden clues"); `engine-params`, "One describer labels every params set"; `src/engine/__snapshots__/params-stability.test.ts.snap` holds "6x6 Hard, size 3" for every preset |
| Solver: The Boats solver is monotone in its difficulty cap | retitled "Solver: Boats' Solve and mistake check solve once, at the highest cap". First sentence (the solver is monotone, as every capped solver is) cut to the clause that gives the second its reason ("which a solver monotone in its cap allows"); the second kept. Scenario kept | `engine-difficulty`, "A difficulty-capped solver is monotone in its cap at every tier" |
| Controls: Boats is played by pointer and by keyboard | replaced by the pointer requirement "Controls: Boats declares its two verbs and its erase key, and adds a drag and a modifier stroke" (rule 2). "A left-click SHALL cycle …; a right-click SHALL place water on an empty cell and empty a filled one" and the place-segment and place-water keys became the declaration; the drag and the modifier stroke are named and left to the two requirements that state them. Scenario kept | `targetVerbs`, `src/games/boats/index.ts:182` (`boatVerb` `:164`: "cycle it from empty to a boat segment, then water, then empty again"; `waterVerb` `:168`: "place water, …, or empty it if it is filled"; `keyOnly` `:198`); `engine-input`, "The engine owns a declaring game's press and select keys" (Enter the left-click verb, Space the right-click verb, a verb's own keys that verb) |
| Controls: Boats' modifier arrows fill as the cursor moves, and Backspace empties | retitled "Controls: Boats' modifier arrows fill as the cursor moves". Last sentence ("Backspace or Delete SHALL empty the square under the cursor.") cut; scenario kept | the `keyOnly` verb, `src/games/boats/index.ts:198` (`does: "empty it"`, `keys: ERASE_KEYS`); `ERASE_KEYS`, `src/engine/target-verb.ts:80` (Backspace, Delete) |
| Hint: The Boats hint replays the solver's deductions one firing at a time | removed, with both scenarios | `engine-hints`, "The solver and the hint are two projections of one deduction engine", "A hint is deduced from the board in play" (its scenario "A right entry the deduction had not reached") and "A hint step always names a technique, with no un-narrated fallback". The first scenario's case is this spec's "Hint: The Boats hint finishes a line by its number"; which cap the replay runs at stays in "Hint: The Boats hint replays at the lowest cap that solves the board" |
| Hint: Every Boats technique is narrated | retitled "Hint: A Boats refutation names the rule the other placement would break". First two sentences (every technique narratable; no unexplained "only possibility" step) cut; the two refutation sentences and both scenarios kept | `engine-hints`, "A hint step always names a technique, with no un-narrated fallback"; that Boats guesses at no tier is this spec's "Solver: Boats solves with a four-tier deductive solver" |
| Hint: A Boats hint marks a boat and water each in its own shape | "Forced squares and the evidence they are deduced from SHALL be visually distinct" cut; the two shapes and their reason kept. Scenario kept | `hintMarks.roles`, `src/games/boats/index.ts:702` (`ring`, `outline`, `stripes`); `engine-hints`, "A hint naming several kinds of element colors them by a stable legend" |
| Hint: The Boats hint reads a segment for the squares round it | last sentence ("Each such step SHALL outline the segment and ring the squares it decides.") cut; scenario kept | `hintMarks.roles`, `src/games/boats/index.ts:702` (`ring`: the squares the step decides; `outline`: "the squares it reasons from, such as a given segment") |
| Hint: The Boats hint finishes a line by its number | "A line step SHALL stripe its line, and" cut; what it says of a hidden number kept. Scenario kept, which still gives the striped row | `hintMarks.roles.stripes`, `src/games/boats/index.ts:702` ("the row or column whose number it counts with, and the stripes run on through that number") |
| Look: Boats draws its squares on the collection's quiet surface | the clause "with the collection's surface grid line between squares and round the grid" cut; scenario kept | the palette, `out[COL_GRID] = surfaceGrid(defaultBackground)`, `src/games/boats/render.ts:122` |

## Kept, and why

- **Params: Boats params are written as the size, f with the largest boat,
  the tier, S and the fleet's counts.** `encodeParams` and `decodeParams` are
  written out by hand (`src/games/boats/state.ts:146` and `:159`), so the
  letters and what each missing piece decodes to are stated here.
- **Params, the three refusals of `validateParams`.** Each depends on another
  field, which a bound cannot state.
- **Generation: The Boats generator deals a unique board at exactly the
  requested difficulty.** Its title is the collection's rule
  (`engine-difficulty`, "A difficulty tier binds the board it generates");
  its sentence is how this generator does it: a random fleet, the border
  clues, numbers hidden while the board stays soluble, and a board thrown
  away where it needs less than its tier.
- **Solver: Boats solves with a four-tier deductive solver.** "SHALL NOT guess
  or backtrack at any tier" is what Boats' tiers mean, and the shared policy
  hands that to the game.
- **Controls: A Boats drag fills its line as its first square changed** and
  **Boats' modifier arrows fill as the cursor moves.** `targetVerbs` declares
  no sweep: the press, the drag and the stroke are arms of `interpretMove`,
  `src/games/boats/index.ts:208`.
- **Hint: The Boats hint replays at the lowest cap that solves the board.**
  `engine-hints`, "A hint is deduced from the board in play", leaves a step
  from the clues alone to the game: the cap is asked of the clues, the plan
  made from the player's board.
- **Hint: Water forced by the never-touch rule belongs to the step that
  places the boat** and **A Boats journey shows its whole firing on every
  leg.** `engine-hints`, "One deduction firing is one journey", abbreviates
  the later legs; Boats repeats the whole picture on each.
- **Hint: A Boats hint marks a boat and water each in its own shape.** The
  legend says the same in the player's words; kept because it is a departure
  (`engine-hints`, "A hint marks beside the content, never behind it", rings
  the acted-on cell the same whatever the step places) and the reason is
  nowhere else.
- **Hint: The Boats hint asks its techniques in a fixed order.** `hintRungs`
  lists the techniques' kinds and nothing reads it for order: the order is the
  sequence of finders in `src/games/boats/hint-solver.ts`.
- **Look: Boats draws its waves and its collision diamond's edge in ink.** The
  palette has one ink entry; that the waves take it and not the grid's color
  is the call in `redraw`, `src/games/boats/render.ts:667`.

## Engine requests

- Solve and the mistake check solve once at the top cap, whatever tier the
  board states → `engine-difficulty`, beside "A difficulty-capped solver is
  monotone in its cap at every tier", which says a board solved at one cap
  solves at every cap above and not what a consumer of an unknown tier asks.
  The sentence is "A consumer that solves a board of unknown difficulty, which
  Solve and the mistake check are, SHALL solve once at the highest cap", in
  "Solver: Boats' Solve and mistake check solve once, at the highest cap"; the
  code here is `solveToGrid`, `src/games/boats/solver.ts:980`.

## Found

- **The ring role's mark is not a ring.** `engine-hints`, "A hint marks beside
  the content, never behind it", says the acted-on cell is ringed "in every
  game and with no exceptions" and that "the same mark is used whether the
  step places a value or strikes a candidate". Boats draws a boat segment or
  waves in the hint color on the square (`hintMarks.roles.ring`,
  `src/games/boats/index.ts:704`). The spec states it as its own rule with a
  reason; the shared requirement admits no exception. One of the two is to
  change. **Verified true in review.** What is drawn, on each square of the
  ring role and nothing at its border: for a boat square a whole segment of
  no resolved shape, filled in the hint color (`drawSegment(…, SHIP_VAGUE,
  COL_HINT)`, `src/games/boats/render.ts:674`); for water the two tildes of a
  given water square in the hint color (`drawWaves(…, COL_HINT)`, `:675`).
  `hintBits` (`:476`) clears the evidence bit on such a square, so it gets no
  outline either; only evidence squares get a band (`drawMarkSides`, `:684`).
  By the collection's rule the code is the side that is wrong: the
  requirement's scenario "The acted-on cell is ringed, not filled" wants "a
  ring of thin sides drawn on the cell's border, and no primitive fills the
  cell with a hint color", and the segment is a fill. The code follows the
  guide and not the spec: `docs/hints-marks.md` § "Echo the move's shape in
  the hint color" tells a game whose moves come in more than one visible kind
  to draw the game's own shape recolored (its exemplars are Spokes and
  Sticks), and no requirement of `engine-hints` states that section. So the
  guide and the requirement disagree, and Boats is one of the games between
  them.
- "Description: Boats descriptions use the border-clue and run-length grid
  encoding" and "Description: A Boats description gives the column numbers
  first and names each given by a letter" state the same format twice, the
  second with the letters. Both are the game's, so neither was cut.
- "Generation: An end-capped boat that cannot stop grows at the second tier"
  is a deduction of the solver and the hint, filed under `Generation`.
- The spec never says when the hint refuses. Boats has no Unreasonable tier,
  so a dealt board's deduction does not run out (`engine-hints`, "Deduction
  runs out only where the tier permits search").
- The spec never states the win flash or how a mistake is drawn; the game
  follows the collection's in both.
- No test of the game reads a label with "hidden clues" or with a fleet that
  is not the pyramid: the snapshot holds only the presets' "size N". The
  removed scenario's "6x6 Hard, size 3, hidden clues" is held by the
  `label` functions alone.

## Review

14 rows read, each against the declaration or the requirement it names, read
whole; 3 corrected in the spec, no sentence restored.

Changed. Each of these was a copy swapped for a pointer inside a subject that
says plenty of the game's own, and is now a plain removal:

- **"Params: Boats refuses parameters no fleet can be dealt from"**: the
  sentence naming `paramConfig` and `presets` went. The subject's other
  requirement states the hand-written codec, so it is not hollow.
- **"Solver: Boats' Solve and mistake check solve once, at the highest
  cap"**: the citation went and the reason stays as a clause.
- **"Hint: A Boats hint marks a boat and water each in its own shape"**: "the
  roles `hintMarks` declares" went.

The `Controls` pointer stays. The drag requirement after it says each square
"takes what the press makes of it" and that a left drag from a boat segment
"makes water", and the pointer is the one place the two verbs' cycles are
said.

Checked and found sound:

- The engine request. "A difficulty-capped solver is monotone in its cap at
  every tier" says a board solved at one cap solves at every cap above; no
  requirement of `engine-difficulty`, `ts-engine` or `engine-hints` says what
  cap Solve or the mistake check asks at, so the sentence stays.
- The removed mistake requirement: `ts-engine`, "The engine supports an
  ephemeral, opt-in mistake-checking hook" has `findMistakes` return the
  cells that contradict the unique solution, and `engine-hints`, "Check &
  Save names a wrong entry in every game" has an entry reported "whether or
  not the entry breaks a rule", which is the cut "locally legal placement
  that no solution permits".
- The declarations and every line citation: the two bounds, the three label
  words, the two verbs and the erase key (`ERASE_KEYS` is Backspace and
  Delete), the legend's three roles, `COL_GRID`. `validateParams`' three
  refusals are `src/games/boats/generator.ts:150`-`:154`, and "greater than
  both the width and the height" is the test there.
- Every engine title the spec and the ledger cite is exact (21 citations).
- `Found`: the ring item is verified above, with what is drawn.
