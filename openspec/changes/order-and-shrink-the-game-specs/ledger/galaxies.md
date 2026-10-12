# galaxies

The Purpose stands as it was: everything it names is still in the spec.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Galaxies detects mistakes against the unique solution | first sentence cut ("Galaxies SHALL implement the engine's `findMistakes` hook."); the second now names `findMistakes` as its subject | the `Game` type (`findMistakes`, `src/games/galaxies/index.ts:1220`); `ts-engine`, "The engine supports an ephemeral, opt-in mistake-checking hook" |
| Rules: What is incomplete is not flagged | scenario "A solved board is clean" dropped | `ts-engine`, "The midend shows mistakes until the next transition" (a move clears the display); that a right board reports nothing is the requirement's own first sentence and its scenario "A correct partial board is clean" |
| Params: Galaxies parameter strings round-trip, and a bare size is a square board | retitled "Params: A Galaxies params string may leave out its height and its tier". The field list, the `WxH` form, the `dn` and `du` letters and the round trip cut for a sentence that names `paramConfig` and the declared codec (rule 2); the bare size kept, and the absent tier and the short form joined from "Params: Galaxies' short params form is the size alone". Scenario "The lenient forms decode" kept; gains scenario "An Unreasonable preset in the short form" | `paramConfig`, `src/games/galaxies/index.ts:1090`, and the `paramsCodec` field list, `:1099` (`dims`, `choice "d"` over `"nu"`, `full: true`); `engine-params`, "A game declares its params encoding once, and both codec halves are derived" (the round trip); `src/engine/__snapshots__/params-stability.test.ts.snap` holds `7x7dn`, `7x7du` and the brief `7x7` |
| Params: Galaxies' short params form is the size alone | removed. That a string with no `d` segment is Easy, and that the short form is the size alone, joined "Params: A Galaxies params string may leave out its height and its tier"; the letters `n` and `u`, and `WxH` for a square board, cut. Scenario "An Unreasonable preset in the short form" moves, unchanged, to that requirement | `choice(paramConfig, "d", "difficulty", "nu", { full: true })` and `dims`, `src/games/galaxies/index.ts:1099`; the snapshot's `full=7x7du  brief=7x7` |
| Params: Galaxies refuses a size it cannot deal | retitled "Params: Galaxies refuses to deal a 3×3 at Unreasonable". First sentence (a width and a height of 3 to 100, refused by the engine) replaced by a closing one that names `paramConfig`; the 3×3 refusal and its two qualifiers kept. Scenario "A width of 2" dropped; "A 3×4 has Unreasonable boards" kept | `bounds: { min: 3, max: 100 }`, `src/games/galaxies/index.ts:1093`; `engine-params`, "Params validity is the engine's check" (its scenario gives "Width must be at least N.") |
| Generation: Galaxies generates uniquely-solvable boards at the requested difficulty | retitled "Generation: A Galaxies board is Easy where the deduction chain finishes it and Unreasonable where only recursion does". The promise of one answer at the requested tier became a pointer (rule 2); what the solver's diagnosis must be is kept and says what each tier is, in the words of "Solver: The Galaxies solver grades by deduction, then bounded recursion". "For every preset" cut. Scenario kept | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates"; the gate is `solverState(probe, params.diff) !== params.diff`, `src/games/galaxies/generator.ts:388` |
| Hint: Galaxies explains its deductions in association vocabulary | removed, with its scenario "A forced association is taught as one step" | `engine-hints`, "The solver and the hint are two projections of one deduction engine" (the same chain with the recorder on), "One deduction firing is one journey" and "A hint relies only on marks the player can make"; that a step says why and never merely what to do is "A hint step always names a technique, with no un-narrated fallback"; why each association is forced is this spec's technique requirements, and that one move brings the partner is "Hint: A hint step's action is a move the game already has", scenario "The partner comes in the same step" |
| Hint: The hint plan finishes the board with walls | second sentence cut ("Followed from any position it is asked from, the hints SHALL reach a solved board, or, on an Unreasonable board only, the refusal that deduction has run out.") | `engine-hints`, "A hint finishes a board from a right entry made out of order" and "Deduction runs out only where the tier permits search"; this spec, "Hint: The Galaxies hint stops where its deductions do" |
| Hint: The Galaxies hint never guesses | retitled "Hint: The Galaxies hint stops where its deductions do". Its sentences (every step a deduction, no guess, the refusal and what it says) replaced by a pointer that keeps what a guess is here (trying a square's dot and following it until something breaks) and takes the two sentences of "Hint: An Easy board is finished by deduction alone". Scenario kept | `engine-hints`, "A Search is refused and never narrated" (no survivor of a search reported, the refusal says deduction has run out) and "Deduction running out on a sound board SHALL have one wording" (what the player can do); `DEDUCTION_EXHAUSTED`, `src/games/galaxies/index.ts:994` |
| Hint: An Easy board is finished by deduction alone | removed. Both sentences joined "Hint: The Galaxies hint stops where its deductions do"; scenario "An Easy board is always finished by deduction" dropped | `engine-hints`, "The hint walk SHALL cover every preset a game offers" and "Deduction runs out only where the tier permits search"; `src/games/galaxies/galaxies-hint.test.ts` ("an Easy board is always carried all the way to solved") |
| Look: Galaxies' win flash sweeps the cells | retitled "Look: A lit cell of a black dot's region is drawn as a white dot's is". The diagonal sweep, and that a lit cell is filled with a flash color and keeps what it holds, became a pointer; the black region's case is kept as the sentence, with what its scenario said of the grid lines. Scenario kept | `ts-engine`, "A game gives each element a position, and the route is which position it gives" (`sweepStep`, `src/games/galaxies/render.ts:815`); `engine-colors`, "A solved flash drawn as a color takes a shared color"; the grid line is `flags & DRAW_BLACK && !lit`, `src/games/galaxies/render.ts:382` |
| Hint: Hint marks name what the player can see | first clause cut ("Evidence SHALL be highlighted in the hint color legend, and"), the rest of that sentence now led by "A hint's words"; last sentence cut ("Equivalent moves SHALL share a color."). Scenario kept | `engine-hints`, "A hint naming several kinds of element colors them by a stable legend" (each kind one legend color, equivalent forced moves the one target color) and "A bound hint step's words SHALL name exactly the marks it draws"; the legend is `hintMarks.roles`, `src/games/galaxies/index.ts:1226` |

## Kept, and why

- **Params, "a string with no `d` segment as Easy".** The tier is a `choice`
  and not `searchTierSegment`, so `engine-params`, "A params string is read
  whole or refused", leaves the tier to `defaultParams` and no shared
  requirement says which it is.
- **Controls: A left drag from an edge's line draws walls.** Reads as
  `engine-input`, "A drag on from a press repeats the press" and "One drag is
  one step of Undo". The drag is opened by an arm of the game's own, and
  where a press must land to open it is `wallPressed`,
  `src/games/galaxies/index.ts:369`.
- **Controls: The keyboard cursor steps by half a square**, "Enter or Space …
  SHALL toggle its line as a click does". The engine's select keys, but the
  sentence is the only one that says a corner takes nothing and an edge with
  a dot is not a click.
- **Preferences: Candidate dots are ringed during a cell-to-dot drag, by
  preference.** The key and the default are a declaration and `newUi`; no test
  reads `galaxies-show-drag-candidates`, so the key stays where it is stated.
- **Hint: The Galaxies hint stops where its deductions do**, "That refusal
  SHALL be reached on an Unreasonable board only: an Easy board SHALL be
  carried all the way to solved by deduction alone". Reads as `engine-hints`,
  "Deduction runs out only where the tier permits search", which says where
  the refusal may be shown. That the hint's own deductions finish every Easy
  board is what Easy means here, beside the solver's meaning in `Generation`.
- **Look: Galaxies has a plain-text format.** The sentence is the `Game`
  type's (`textFormat`); the requirement is its scenario, which is the format.
- **Hint: Hint marks name what the player can see.** What is left (a dot named
  by what the player sees, a rule-out shown as evidence and never asked as a
  move) is Galaxies'. Its scenario names a dot by its color, against `engine-hints`, "A narration
  never identifies an element by its color": the color is the dot's kind, held
  the same in both schemes by "Look: The dots keep their white and their
  black in both schemes".
- **Hint: A stored plan survives the player working ahead.** The advancing is
  the midend's (`engine-hints`, "The midend refreshes the current step before
  every display"); that a step is resolved once its tile is associated is the
  game's `refreshHintStep`.
- **Hint: The Galaxies hint tries its deductions in one order.** `hintRungs`
  lists the same order and nothing reads it for order: the order is the
  ladder of `nextPlanFiring`, `src/games/galaxies/hint.ts:169`.
- **Hint: The deduced cell is ringed twice and its partner once.** The legend
  says twice and once; that a step about no one cell rings every cell doubled
  is not in it.
- **Look: Galaxies draws its cells on the collection's quiet surface**, **A
  white dot's finished region is the lifted surface** and **The dots keep
  their white and their black in both schemes.** Each names a palette entry
  (`colors`, `src/games/galaxies/index.ts:1259`) and gives what the entry
  cannot: which cells take it, and why the dots do not invert.

## Engine requests

None.

## Found

- **The Solve command is stated nowhere in the spec.** It solves from the
  player's position and then from the start, and refuses with the
  collection's sentence where neither is solved:
  `src/games/galaxies/index.ts:895`.
- **The status bar reads `Difficulty Impossible.`, `Difficulty Ambiguous.` or
  `Difficulty Unfinished.`** on a pasted board the solver does not finish
  (`src/games/galaxies/index.ts:1116`, from `DIFF_NAMES`, `:1082`). The spec
  says the difficulty is reported "when it is known" and gives the Easy case
  only.
- **A grid line inside a black dot's finished region is drawn in ink**, not
  as the surface grid line (`src/games/galaxies/render.ts:382`). No `Look`
  requirement said so; it was implied by the win flash's scenario alone, and
  is now a clause of that requirement.
- **Easy's params letter is `n`**, upstream's Normal, and the solver's verdict
  for an Easy board is `Normal`. The spec says the second in "Solver: The
  Galaxies solver grades by deduction, then bounded recursion" and left the
  first to the codec.
- The dropped scenario "A solved board is clean" spoke of "the engine's
  lifecycle", which is no hook or requirement by that name.

## Review

11 rows read, each against the declaration or the requirement it names, read
whole; 1 row corrected, 1 row added, no sentence restored.

Changed:

- **Two copies cut from "Hint: Hint marks name what the player can see"**,
  with a row: that evidence is highlighted in the legend's colors, and that
  equivalent moves share a color. The writer's own "Kept, and why" named the
  engine requirement that states the second.
- **"Look: A lit cell of a black dot's region is drawn as a white dot's is"**:
  its last clause read "the quiet grid lines that cell has in place of the ink
  it has", two "it has" of one cell. It now reads as its scenario does: the
  quiet lines a white region's cell has, in place of the ink a black fill
  needs. The claim is the same, and is `render.ts:382`.
- The row for "Hint: Galaxies explains its deductions in association
  vocabulary" did not name where "explain why ... and never merely what to
  do" is stated: `engine-hints`, "A hint step always names a technique, with
  no un-narrated fallback", added.
- Two entries added under "Kept, and why" (the Easy sentence of the hint's
  refusal, the plain-text format), and the entry for the hint marks rewritten
  for what is left.

Checked and found sound:

- The engine titles the spec cites are exact (`spec-citations`), and each requirement a row
  names states all of what the row removed.
- The declarations: `paramConfig` with its bounds of 3 to 100 and the codec
  over `"nu"` (`index.ts:1090`-`1102`), `defaultParams` (Easy), the legend
  (`index.ts:1226`), which says twice and once and why the partner travels.
- The new sentences against the code: the generator keeps a board only where
  the solver's verdict from the dots alone is the tier asked for
  (`generator.ts:388`); a lit cell takes a flash color whichever dot's region
  it is in, and the surface grid line (`render.ts:364`, `:382`); the refusal
  is `DEDUCTION_EXHAUSTED` (`index.ts:994`), whose words the kept scenario
  paraphrases.
- The kept `Params`, `Generation`, `Hint`, `Controls` and `Look` requirements
  were read for copies. The cut is small because the game declares little:
  its controls are one hand-written drag, and its hint's techniques and its
  drawing decisions are its own.
- `cut-check`, `openspec validate --strict`, `spec-subjects`, `spec-form` and
  `spec-citations` pass.
