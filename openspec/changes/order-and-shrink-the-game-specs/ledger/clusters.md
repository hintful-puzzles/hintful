# clusters

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Clusters' findMistakes reports each tile the answer contradicts | scenario "The next move puts the wash away" dropped; sentences untouched | `ts-engine`, "The midend shows mistakes until the next transition" (its second scenario is this one) |
| Params: Clusters' parameters are a width, a height and a difficulty | retitled "Params: A Clusters params string is its declared codec's, and one with no difficulty is Easy". Sentences 1, 2 and 4 (the three fields; width, height, square fallback, full-form difficulty and the round trip; the unknown tier letter) replaced by one sentence that sends the reader to the declaration and says the game departs nowhere (rule 2). Sentence 3 kept, reworded to say "params string" for "ID". All three scenarios dropped; it takes "The Normal preset's two forms" from the `de`/`dt` requirement below | the fields: `paramConfig`, `src/games/clusters/state.ts:117`; the encoding: `paramsCodec(defaultParams, [dims(paramConfig), choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true })])`, `state.ts:130`; the square fallback: `engine-params`, "The codec grammar is a prefix, tagged segments, flags and letters"; the round trip: `engine-params`, "A game declares its params encoding once, and both codec halves are derived" and "Encode and decode are mutual inverses over the corpus"; the unknown letter and its scenario: `engine-params`, "A params string is read whole or refused", whose first scenario is a game with tiers `e` and `t`. Scenario "An older game ID still resolves" restated the kept sentence and is wrong of an ID that carries a board (see Found); `src/games/clusters/clusters.test.ts:133` ("reads a pre-tier game ID as Easy") and the `clusters` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` hold the strings |
| Params: Clusters refuses to generate Normal on a board too small for it | title kept. Sentence 1 kept, opening "Validation SHALL refuse Normal" since the next sentence now carries "generation only". Sentence 2 (reported through validation with `full` set, so a saved game or an ID with its description loads) cut to "The refusal SHALL bind generation only, as the collection's does", with the citation. Scenario "A board too small for the harder tier refuses it" dropped; scenario "The boundary, in both of its shapes" written from the game's test | `engine-difficulty`, "An unbindable tier is refused, not silently downgraded" (states the validation route, generation only, and the dropped scenario with no game named). The new scenario's sizes and its sentence: `src/games/clusters/clusters.test.ts:158`, `validateParams` at `state.ts:157` |
| Params: Clusters writes its difficulty as `de` or `dt` | removed; its scenario "The Normal preset's two forms" moves, unchanged, to "Params: A Clusters params string is its declared codec's, and one with no difficulty is Easy" | `DIFF_CHARS = "et"`, `state.ts:32`, and `choice(…, "d", …, { full: true })`, `state.ts:132`; the snapshot above holds `7x7de`, `7x7dt` and `7x7` |
| Description: Clusters descriptions use the upstream run-length dot encoding | title kept. The letter grammar (run before a dot, `z`/`Z` for twenty-five, the total of area plus one) and the refusals replaced by two citations; kept as the game's own: that the marks are the given dots and nothing else, the row-major cell order, and which case is which color. Scenario "A description with the wrong number of cells is rejected" dropped; "A generated description round-trips" kept; it takes "The board the first preset deals" from the requirement below | `engine-params`, "The engine provides the dot-run description grammar" (letter, offset, case, skip, closing letter) and "The dot-run reader refuses what its writer never writes" (too short, too long, a character that cannot appear). The game's calls: `writeDotRuns`, `state.ts:185`, and `readDotRuns`, `state.ts:198` |
| Description: A Clusters description closes in lowercase and keeps a skip in its dot's case | removed; its scenario "The board the first preset deals" moves, unchanged, to "Description: Clusters descriptions use the upstream run-length dot encoding" | lowercase close and the skip's case: `engine-params`, "The engine provides the dot-run description grammar" (last two sentences); the two refusals: "The dot-run reader refuses what its writer never writes" ("a skip followed by a letter of the other case, and an uppercase closing letter"). `src/games/clusters/clusters.test.ts:250` holds the game's case |
| Generation: Clusters offers difficulty tiers over its two deduction levels | title kept. Last two sentences (one solution; Easy soluble by the single-cell rule; Normal not) replaced by one that names the two shared requirements and says the game departs from neither. Scenario "The easier tier needs only the single-cell rule" dropped; "The harder tier needs the deeper reasoning" kept as the game's one case | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates". The Easy case stays in this spec as the scenario "An Easy board is hinted to the end without a chain" |
| Generation: Every generated Clusters board is solvable by narratable deduction | removed, but for its last clause (an Easy board needs no lookahead step), which joins "Hint: Solve and the hint use the deeper rung at every tier" with the scenario "An Easy board is hinted to the end without a chain" | `engine-difficulty`, "Narratable-deduction generation policy"; "no nested speculation" is this spec's "Normal is the same reasoning one hypothetical level deep" |
| Controls: Clusters is painted by click, drag and keyboard cursor | title kept. Sentence 1 (overview), the click half of sentence 2 (left cycles toward blue, right toward red, each able to clear) and sentence 4 (the dedicated keys) replaced by one that sends the reader to `targetVerbs`. The drag half is reworded to stand alone and to say what `interpretMove` does: the press picks the state, the release paints every square passed, whatever it held, as one move. "Given dot cells SHALL never be overwritten" kept. Both scenarios kept | `targetVerbs.primary`, `.secondary` and `.keyOnly` with their `does` strings, `src/games/clusters/index.ts:139`-`177`; `engine-input`, "The engine owns a declaring game's press and select keys" (press parks the cursor, Enter and Space, a verb's own keys). Which color the left button gives first is kept, in "Look: Clusters draws its two colors as the collection's two-state pair" |
| Controls: Clusters' number keys set the cursor's square outright | title kept. Sentence 1 (the key list) cut; sentences 2 and 3 reworded to stand without it ("Each key-only verb of `targetVerbs`", "its key") | `targetVerbs.keyOnly[].keys`, `index.ts:158`-`177` |
| Hint: Solve and the hint use the deeper rung at every tier | gains "The hint of a board dealt at Easy SHALL nonetheless need no lookahead step at all." and the scenario "An Easy board is hinted to the end without a chain", both from "Generation: Every generated Clusters board is solvable by narratable deduction" | |
| Hint: Clusters provides an explained deduction hint | retitled "Hint: A recomputed Clusters plan continues where the last one left off". Sentence 1 cut to what the shared rule does not say of this game (the hint deduces from the player's current position, by the game's own contradiction solver), with the citation; sentence 2 untouched. Scenario "A hinted move is one the solver makes" dropped | `engine-hints`, "The solver and the hint are two projections of one deduction engine" |
| Hint: A Clusters hint step names the rule the other color would break | sentence 1 ("explain why the move is forced, not merely which cell") cut and "Each hint step" moved onto sentence 2; "in the necessity voice" reworded out of sentence 3. Scenario untouched | `engine-hints`, "A hint step always names a technique, with no un-narrated fallback" and "The necessity-voice rule applies to every hinting game not ledgered as narrating moves" (its second scenario: a forced step is required to carry necessity) |
| Hint: A Clusters hint shows its reasoning on the board | retitled "Hint: The tile the other color would break is outlined, in a hue the error frame does not use". Sentence 1 (the target is ringed) and sentence 3 (the forced color is not pre-placed) replaced by one that sends the reader to the legend. Sentence 2 kept without "which the narration's 'outlined' refers to uniquely, so the reasoning is visible on the board and not only in prose"; the case the legend does not give is added from the code (no tile is outlined when the contradiction is on the target). Scenario "The target stays empty under its hint" dropped; "The word and the ring go together" kept | `hintMarks.roles.ring` ("the square the step colors. It is drawn empty…") and `.outline`, `index.ts:491`-`496`; `engine-hints`, "The engine SHALL own the hint mark roles and the words for them" (ring, outline) and "A bound hint step's words SHALL name exactly the marks it draws" (the word and the mark agree). `buildHighlights`, `index.ts:367`, for the target case |
| Hint: A lookahead deduction is one step showing its whole forcing chain | title kept. "displays the whole forcing chain statically on the board" and "numbered in order" reworded out for a citation; kept: one step, the hypothesis cell is the target, the what-if piece and its size, the contradiction's tile. Scenario "A lookahead deduction shows its whole forcing chain" dropped; "A what-if piece cannot be taken for a placed one" kept | `engine-hints`, "A Tactic's chain is shown on the board" (every link marked in order, both ends anchored), "A chain's order is declared and drawn as an ordinal" (the numbers) and "A Tactic's narration names the ends, the links and the rule" (the dropped scenario's narration clause) |
| Hint: A Clusters hint is refused where it cannot deduce | sentences untouched. Scenario "A hint is refused on a doomed board" dropped; "Several wrong tiles, none flagged" kept as the game's case of it | `engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board before asking the game" (scenario "Asking for a hint on a board with a mistake highlights it") |
| Look: Clusters draws its two colors as the collection's two-state pair | "There SHALL be no interpolated move animation." cut. The parenthesis and the clause after it reworded to say which of blue and red is the pair's first member, since "Controls: Clusters is painted…" no longer says the left button gives blue | `animLength: () => 0`, `index.ts:510`. Blue is first: `pairIndex`, `state.ts:41`, and `firstVerb`, `index.ts:139` |

## Kept, and why

- **Rules: Clusters' findMistakes…**, first sentence. `ts-engine`, "A mistake
  check compares with the one answer, hidden or not" says a check compares
  with the answer. It does not say the answer is the solve from the givens,
  nor "whether or not it breaks a rule, and nothing else", which is what tells
  the wash from the live frame; and the second sentence's "any other board"
  hangs on it.
- **Params: … one with no difficulty is Easy.** `engine-params`, "A params
  string is read whole or refused", hands it back: "at the tier the game's
  spec gives a string with no `d`".
- **Params: Clusters refuses a board size that has no puzzle**, "as too
  large". `engine-params`, "A grid too large for a game is refused in one
  sentence" leaves where the ceiling sits to the game.
- **Description: "A generated description round-trips".** No shared
  requirement says a description `encodeDesc` writes is read back to the same
  board; the two dot-run requirements state each half and never the pair.
- **Controls: … number keys**, "SHALL make no move on a given dot or on a
  square already in that state": `paintWith`, `index.ts:126`, a hand-written
  function. "whatever the square held, where a click cycles it": the `does`
  strings say "color it" against "color it (click again…)", which is the
  difference only by implication.
- **Controls: An arrow with Shift or Ctrl…**, last sentence. `engine-input`,
  "One arrow press reveals the cursor and moves it" allows a modified arrow
  to reveal without acting; Clusters paints on that press, a departure.
- **Hint: A recomputed Clusters plan…**, "from the player's current
  position". `engine-hints`, "A hint finishes a board from a right entry made
  out of order" implies it and no requirement states it.
- **Hint: A Clusters hint is refused…**, second sentence. It follows from
  `engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board
  before asking the game" and `engine-params`, "A board loads only if the
  game's own solver solves it", two requirements in two files, neither of
  which says it; without it the first sentence reads as a refusal a player
  meets.
- **Hint: A lookahead deduction is one step…**, "one step". The shared
  requirement says a Tactic need not advance a leg at a time, not that it is
  one step. "smaller than any placed piece": the legend says "a small piece"
  and gives no measure.
- **Look**: "pieces on a quiet surface", "inset on its cell", "a lifted
  surface". `engine-colors`, "The engine owns what a board of pieces looks
  like" says a game takes these by reference; that Clusters does is the
  requirement.

## Engine requests

- "With the cursor hidden, its key SHALL only show the cursor.", in
  "Controls: Clusters' number keys set the cursor's square outright". Belongs
  in `engine-input`, "The engine owns a declaring game's press and select
  keys", which says it of the first *select* key only and of a verb's own
  keys says just that they apply the verb. `interpretTargetVerbs`,
  `src/engine/target-verb.ts:580`-`585`: any keyed verb on a hidden cursor
  shows it and applies nothing.
- "A hint SHALL be deduced from the player's current position", in "Hint: A
  recomputed Clusters plan continues where the last one left off". Belongs in
  `engine-hints`, beside "The solver and the hint are two projections of one
  deduction engine": that a hint's plan starts from the board as the player
  has it, entries included, and not from the givens. `Midend.hint` hands
  `Game.hint` the current state (`src/engine/midend.ts`); each game's
  recorder then starts there (here `deduceHintPlan`,
  `src/games/clusters/solver.ts:437`).
- "A generated description round-trips" (the scenario, in "Description:
  Clusters descriptions use the upstream run-length dot encoding"). Belongs
  in `engine-params`, "The engine provides the dot-run description grammar":
  that `readDotRuns` reads back what `writeDotRuns` wrote.
  `src/engine/dot-runs.ts`.

## Found

- **A game ID with no difficulty and a board does not open as Easy when the
  board is Normal.** The dropped scenario "An older game ID still resolves"
  said "its parameters read as the easier tier". `decodeParams("7x7")` is
  Easy (`clusters.test.ts:133`), but `Midend.withBoardTier`
  (`src/engine/midend.ts:642`) grades a board whose params string cannot tell
  tiers apart, so `7x7:<a Normal board>` opens as Normal (`engine-difficulty`,
  "A loaded board whose id states no tier takes the lowest tier that solves
  it"). The kept sentence says "decode", which is true; the spec does not say
  what such an ID opens as.
- **The spec does not state the order the hint tries its two techniques in.**
  `deduceHintPlan` (`solver.ts:453`) takes the first single-cell firing in
  row-major order, red tried before blue, restarting the scan after each, and
  only at a stall the shortest lookahead chain. A loop fixes this and not
  `hintRungs`. The spec says the scan is deterministic and "at each lookahead
  stall", and never that the single-cell rule leads or in what order it scans.
- **"Rules: The cluster rules…", scenario "A rule-breaking cell is reported
  as a mistake"** reads as though the rule-breaking cell is the mistake. On a
  dealt board `findMistakes` reports the wrong tile, which may be a neighbor
  of the cell the frame is on (`index.ts:314`-`332`; the help page says so).
  A mistake is reported, so the scenario is not false.
- **"On any other board it SHALL report the cells that break a rule"** is not
  reachable by a player: `engine-params`, "A board loads only if the game's
  own solver solves it" refuses such a board. The spec says so of the hint's
  refusals and not of this branch (`index.ts:322`).
- **"Hint: Solve and the hint use the deeper rung at every tier" holds a
  `Solver` fact** (what `solve` runs) under `Hint`. Left where it is.
- **The lookahead is called a Tactic here by my reading** of `engine-hints`,
  "A hypothesis is classified as Check, Tactic or Search" (a bounded chain of
  forced consequences to a named endpoint); nothing under
  `src/games/clusters/` uses the word.

## Review

17 rows read, each against the declaration or the requirement it names, read
whole; 0 rows corrected, and no sentence restored or cut in the spec.

Changed:

- Two line citations outside the table: `deduceHintPlan` is at
  `solver.ts:437` and `withBoardTier` at `midend.ts:642`.

Checked and found sound:

- The 9 engine titles the spec cites are exact, and each of them and of the
  others the rows name states all of what its row removed. The thinnest is "in the necessity voice": `engine-hints`,
  "The necessity-voice rule applies to every hinting game not ledgered as
  narrating moves" says who is held to the rule and gives what the rule asks
  of a forced step only in its second scenario, which names no game. Taken
  as stated.
- The declarations: `paramConfig` and the codec (`state.ts:117`, `:130`),
  `DIFF_CHARS`, the three verbs and their keys (`index.ts:139`-`177`), the
  legend (`index.ts:491`), `animLength`.
- The new sentences against the code: the drag (`interpretMove`: the press
  cycles the pressed square for the drag's state, the release paints every
  square passed but a given, as one move); a keyed verb on a hidden cursor
  only shows it (`target-verb.ts:580`); no tile is outlined when the
  contradiction is on the target (`buildHighlights`); blue is the pair's
  first member (`pairIndex`); lowercase is red (`encodeDesc`, kind 0).
- The quoted strings: the Normal refusal and its five sizes
  (`clusters.test.ts:158`), `7x7dt`, `7x7`, `7x7de` (the snapshot),
  `DceclHbAacAg`.
- Each subject read alone: none hollow, no dangling antecedent, every title
  fits its body.
- The lookahead is a Tactic by `engine-hints`, "A hypothesis is classified as
  Check, Tactic or Search", so the chain requirements cited bind it.
