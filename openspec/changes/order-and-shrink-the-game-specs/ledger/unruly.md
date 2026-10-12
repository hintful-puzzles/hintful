# unruly

The Purpose's list is corrected: "its params and description formats" and
"what a dealt board promises" named what the spec no longer holds, and now
read as what its params refuse, which case of a description's letters is
which piece, and how a board's clues are winnowed.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Unruly checks player marks against the unique solution | third pass. Title and scenario kept. "It SHALL return none when the clues do not deduce a complete solution (a foreign or non-unique board) or when the player's marks are all consistent" cut; that the answer is re-solved from the clues alone with the full solver, and which cells are returned, kept | `ts-engine`, "A mistake check compares with the one answer, hidden or not" ("Where the game's solver or search did not establish exactly one answer, no mark SHALL be flagged against an answer"); the early return is `src/games/unruly/solver.ts:667`. That consistent marks are not returned is the kept sentence's own |
| Hint: The named line is hatched under its pieces | third pass. Retitled "Hint: The named line is hatched in the color of the move". "under the pieces it holds" cut, and the scenario's last line, "each piece on that line is drawn over the hatch"; that the hatch is `COL_HINT` kept | `engine-hints`, "A hatch lies over the square's ground and under what it holds"; `dr.drawHatch` before the piece, `src/games/unruly/render.ts:198` |
| Params: Unruly's params are a size, the unique variant and a difficulty | retitled "Params: An Unruly params string is its declared codec's, and one with no difficulty is Easy". Its one sentence (the four fields, "both even and at least 6", the `{w2}x{h2}`, `u` and `d{c}` encoding) replaced by one that sends the reader to the declaration and says the game departs nowhere (rule 2); it gains "A params string with no `d` SHALL decode as Easy." from the letters requirement below. Scenario "Params round-trip" dropped; it takes "The unique board of the Type menu" from the letters requirement | the fields and "at least 6": `paramConfig`, `src/games/unruly/state.ts:96`-`119` (`bounds: { min: 6 }`); the encoding: `paramsCodec(defaultParams, [dims, flag "u", choice "d" … { full: true }])`, `state.ts:122`; "both even" is kept in "Params: Unruly refuses params no board can be dealt for"; the round trip: `engine-params`, "A game declares its params encoding once, and both codec halves are derived"; the bare `8x8` as a square with `unique` false: `engine-params`, "The codec grammar is a prefix, tagged segments, flags and letters" and "A params string is read whole or refused" (a piece left out is as `defaultParams` has it). `src/games/unruly/unruly.test.ts:48` and `:76` hold the strings |
| Params: Unruly's difficulty letters are t, e and n | removed. Sentence 1 (the three letters) and sentence 3 (any other character after `d`, or nothing, is refused) go; sentence 2 moves, unchanged, to "Params: An Unruly params string is its declared codec's, and one with no difficulty is Easy", as does its scenario "The unique board of the Type menu". Scenario "A letter that names no tier" dropped | the letters: `DIFF_CHARS = "ten"`, `src/games/unruly/constants.ts:31`, read by `choice(…, "d", "difficulty", DIFF_CHARS, …)`, `state.ts:125`; the refusals and the dropped scenario: `engine-params`, "A params string is read whole or refused" (its first two scenarios). The `unruly` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds `8x8dt`, `8x8de`, `8x8dn`, `8x8ude` and `8x8u` |
| Params: An Unruly title says unique when rows and columns must differ | removed, with its scenario | `modifierItem({ …, words: "unique", slot: "tail" })`, `state.ts:105`-`118`; `engine-params`, "One describer labels every params set" (size, tier, then the tail) and "The engine builds a modifier's help entry and label words" (the words are said exactly when the rule applies). The snapshot above holds "8x8 Normal, unique" for `8x8ude`; `unruly.test.ts:99` |
| Description: Unruly descriptions are run-length color grids | title kept. The letter grammar (a letter advances past a run and places a clue, `z`/`Z` advance 25, the total of `w2·h2 + 1`) replaced by a citation; kept as the game's own: that the marks are the immutable clues, the scan order, and which case is which piece. It gains "The parser SHALL refuse what `readDotRuns` refuses …, and nothing of its own" in place of the requirement below. Scenario "A description round-trips" dropped; scenario "Two clues of the two kinds" written from the game's test | `engine-params`, "The engine provides the dot-run description grammar"; the round trip: `engine-params`, "The dot-run reader reads back what its writer wrote" ("A game whose description is this grammar alone SHALL thereby read back every description it writes"). The game's calls: `readDotRuns`, `state.ts:165`, and `writeDotRuns`, `state.ts:186`. The new scenario: `unruly.test.ts:139` |
| Description: A malformed Unruly description is refused | removed, with its scenario | `engine-params`, "The dot-run reader refuses what its writer never writes" (a character that cannot appear, too short, too long); `parseDesc`, `state.ts:157`, adds no refusal. `unruly.test.ts:117` and `:123` hold the game's cases |
| Generation: Unruly generates uniquely solvable boards at the target difficulty | retitled "Generation: Unruly winnows the clues of a full valid grid". Sentence 1 (every board passes `validateDesc` and is solvable at its target difficulty from its clues) cut; sentence 2 (the winnowing) kept, and is the whole of it. Scenario "Generated boards are valid and solvable" dropped; it takes "A Tricky board is not a Normal one" from the requirement below | `engine-difficulty`, "Every tier promises one solution found at its cap"; that a written description is read: `engine-params`, "The dot-run reader reads back what its writer wrote" |
| Generation: A board above Easy needs its own tier | removed; its scenario "A Tricky board is not a Normal one" moves, unchanged, to "Generation: Unruly winnows the clues of a full valid grid" | `engine-difficulty`, "A difficulty tier binds the board it generates" (not solvable one tier down, tested by the acceptance gate) and "A generator never settles for a lower tier" (it deals the tier asked for or exhausts its retry bound) |
| Controls: Unruly marks cells via three-state cycling moves | title kept. "Left-button / select" and "right-button / select2" reworded to "the left-click verb of Unruly's `targetVerbs`" and "the right-click verb", which is where a reader finds which input applies which. The two cycles and the inert clue kept. Both scenarios kept | `targetVerbs.primary` and `.secondary`, `src/games/unruly/index.ts:99`-`107`; `engine-input`, "The engine owns a declaring game's press and select keys" (Enter is the left-click verb, Space the right-click one) |
| Controls: Unruly's keys place and clear at the cursor | retitled "Controls: Unruly's digit keys place at the cursor". Sentence 1 (a keyboard cursor moves within the grid) cut. "Backspace or Delete SHALL clear the cell" cut. The digits kept. Scenario kept | the cursor: `squareGrid(…)`, `index.ts:97`, and `engine-input`, "A target and its cursor belong to the geometry"; the erase keys: `targetVerbs.keyOnly[0]` (`keys: ERASE_KEYS`, `does: "empty the square under the cursor"`), `index.ts:108`-`115` |
| Hint: Unruly provides an explained deduction hint | removed, with its scenario. "one narrated `HintStep` per forced cell" joins "Hint: A firing that forces several cells is one journey" | a plan of narrated steps: `engine-hints`, "The engine supports an ephemeral Hint System" and "A hint step always names a technique, with no un-narrated fallback"; the plan advances as it is followed: `engine-hints`, "A player move is classified against the stored plan"; from the player's current marks: `engine-hints`, "A hint is deduced from the board in play"; "at the solver's full strength" is kept in "Hint: Unruly's hint tries the simplest technique first" ("whatever tier the board was dealt at"); the scenario's last clause: `engine-hints`, "A hint finishes a board from a right entry made out of order" |
| Hint: A firing that forces several cells is one journey | title kept. Gains "The plan SHALL hold one narrated step per forced cell." from the requirement above. "emitted … via `continuesPrevious`, so they read and auto-play as a single coherent hint" reworded out; which firings force several cells kept. Scenario kept | `engine-hints`, "One deduction firing is one journey" (the later legs flagged `continuesPrevious`; auto-play animates the legs as one move) |
| Hint: A displayed step carries the marks its sentence refers to | retitled "Hint: Every step shows the evidence it rests on". Sentence 1 (the ring, the outline and the stripes, and what each is on) replaced by one that sends the reader to the legend; sentence 2 kept. Scenario kept | `hintMarks.roles` (`ring`, `outline`, `stripes`), `index.ts:320`-`327`; `engine-hints`, "The engine SHALL own the hint mark roles and the words for them" and "A bound hint step's words SHALL name exactly the marks it draws" |
| Look: Unruly draws a cursor outline and a completion flash | retitled "Look: Unruly draws a cursor outline, and the win flash fills a cell under its piece". "The completion flash SHALL sweep the cells diagonally, a cell's position being its place in the grid" reworded out; the cursor outline and what a lit cell looks like kept. Scenario kept | `ts-engine`, "A game gives each element a position, and the route is which position it gives" (`sweepStep` of its center, a diagonal); the game's call is `flash.win(sweepStep(x, y))`, `src/games/unruly/render.ts:382` |

## Kept, and why

- **Rules: A placement on a clue or off the board is rejected.** `ts-engine`,
  "A game rejects a move it cannot play, rather than guessing" is about a
  move the dispatch does not recognize; a recognized placement on a clue is
  the game's own refusal (`executeMove`, `state.ts:208`-`210`).
- **Rules: Unruly checks player marks against the unique solution.**
  `ts-engine`, "A mistake check compares with the one answer, hidden or not"
  does not say the answer is the full deduction from the clues alone. Its
  opening clause ("the mistake check Check & Save hard-blocks on") is in no
  engine requirement's sentences and stays as the antecedent of the rest.
- **Params: … one with no difficulty is Easy.** `engine-params`, "A params
  string is read whole or refused" hands it back ("at the tier of the game's
  `defaultParams`").
- **Params: Unruly refuses params no board can be dealt for**, "an
  unreasonably large `w2·h2`". `engine-params`, "A grid too large for a game
  is refused in one sentence" leaves the ceiling to the game.
- **Generation: the three technique requirements.** What a tier means.
- **Controls: the two cycles.** The `does` strings say "turn it" a color and
  not the order a second and third click take; the cycle is `place(…)`, the
  game's function (`index.ts:101`, `:106`).
- **Controls: the digit keys.** An arm of the game's own `interpretMove`
  (`index.ts:126`-`130`), not a declared verb.
- **Hint: hintKeepTrack completes on the hinted cell and value.** A
  hand-written `hintKeepTrack` (`index.ts:248`); see Engine requests.
- **Hint: The named line is hatched in the color of the move.**
  `engine-hints`, "A hint hatches the one line its sentence names" says the
  line is hatched and not in which color; that Unruly's hatch is `COL_HINT`
  and its premise ring another is the game's.
- **Hint: A cited premise is ringed apart from the move.** The legend's
  `outline` entry lists the four kinds of premise, but not the piece beside
  a reserved window, and "an empty reserved-window cell stays empty" is given
  by `engine-hints`, "A hint marks beside the content, never behind it" only
  in a scenario.
- **Hint: Unruly's hint tries the simplest technique first.** The order is
  the `techniques` list of `solveGame` (`src/games/unruly/solver.ts:463`),
  which holds five where `hintRungs` holds four.
- **Look: Unruly draws pieces on a quiet surface.** `engine-colors`, "The
  engine owns what a board of pieces looks like" says a game takes these by
  reference; that Unruly does, and which piece is which member, is the
  requirement.
- **Look: A placement animates as a growing fill.** `animLength` is a
  function (`index.ts:261`), not a constant.

## Engine requests

- Left the game's own: Unruly's `hintKeepTrack` is three lines of its own
  that compare the move with the step's one target and do not call
  `trackTargets`, so `engine-hints`, "A step asking for several elements is
  followed one element at a time" does not state it (`ledger/_engine.md`,
  "Third round: hints and colors", Not written). As filed:
  "`hintKeepTrack` SHALL report `"completed"` when the player's move sets the
  hinted cell to the hinted value and `"off"` otherwise.", the whole of "Hint:
  hintKeepTrack completes on the hinted cell and value". It would read the
  same of any game whose step sets one cell to one value. Unruly writes the
  comparison by hand (`hintKeepTrack`, `src/games/unruly/index.ts:248`); the
  engine's `trackTargets` (`src/engine/hint-track.ts:40`) gives the same two
  verdicts for a one-target step and is what Singles, Light Up and Tents
  call, and no capability states it (`singles.md`, § "Engine requests", has
  the request: the verdict rule of `trackTargets`). Belongs in
  `engine-hints`, beside "A completed verdict vouches for the rest of the
  plan".
- Answered: `engine-hints`, "A hatch lies over the square's ground and under
  what it holds"; the clause is cut. As filed:
  "under the pieces it holds", in "Hint: The named line is hatched under its
  pieces". The same request as Singles' "stripes under the cell's content"
  (`singles.md`, § "Engine requests"): that a line's hatch lies under what
  its cells hold. Belongs in `engine-hints`, "A hint hatches the one line its
  sentence names". `dr.drawHatch` before the piece,
  `src/games/unruly/render.ts:196`-`198`.

## Found

- **The spec does not say an Unruly description closing in uppercase, or with
  a skip in the other case from its mark, is refused** (`_engine.md`,
  § "Found"). After the cut it does, by citation: "The dot-run reader refuses
  what its writer never writes". `unruly.test.ts:123` holds `Zl`, `zL` and
  `ZL` refused.
- **A digit key does nothing while the cursor is hidden.** The game's arm
  takes a digit only on a shown cursor (`index.ts:129`); on a hidden one the
  digit goes to `interpretTargetVerbs`, which binds no digit, so the cursor
  is not shown, where Backspace on a hidden cursor shows it (`engine-input`,
  "The engine owns a declaring game's press and select keys"). Clusters' `1`
  and `2` are key-only verbs and do show it. The spec says "under a shown
  cursor" and is silent on the hidden one. **Reviewed: true.** The digit arm
  asks `ui.cursor.visible` (`src/games/unruly/index.ts:128`-`130`) and
  otherwise hands the key on; `interpretTargetVerbs` shows a hidden cursor
  only for a key some verb lists (`src/engine/target-verb.ts:580`-`588`),
  and Unruly's one keyed verb lists the erase keys (`index.ts:108`-`115`),
  so a digit answers `null`. No test holds either half: nothing under
  `src/games/unruly/` presses a key on a hidden cursor.
- **The spec never states the drag.** `targetVerbs.sweep` (`index.ts:116`) is
  declared, so a drag repeats the press (`engine-input`, "A drag on from a
  press repeats the press"). Declared, so nothing is owed.
- **"Params: Unruly refuses params no board can be dealt for", scenario**
  lists "a dimension below 6" among what the check refuses. That refusal is
  the width item's `bounds` (`state.ts:102`), not `validateParams`, which the
  requirement's sentence names; the scenario says "the engine's params check"
  and so is true (`engine-params`, "A rule that a game rejects params is met
  by the engine's check").
- **`validateParams` refuses no area a player can type.** Its "unreasonably
  large" test is `w2 > Number.MAX_SAFE_INTEGER / h2` (`state.ts:139`), and the
  size items declare no maximum, so a 1000×1000 board passes validation.
- **"Look: Unruly draws its error overlays live" and "Look: A flagged mark is
  outlined apart from the live errors" hold `Rules` facts** (which cells are
  flagged) under `Look`. Left where they are.

## Review

13 rows read, each against the declaration or the requirement it names, read
whole; 4 rows corrected, all four for a copy that had been swapped for a
pointer of the same length.

Changed:

- **Generation: Unruly winnows the clues of a full valid grid.** "What a
  board dealt at a tier promises SHALL be the collection's (…), with no
  departure" cut. The subject states the winnowing and three tiers'
  techniques, so nothing is hollow without it.
- **Controls: Unruly marks cells via three-state cycling moves.** The
  sentence that only sent the reader to `targetVerbs` and `engine-input` cut;
  the two cycles now name "the left-click verb of Unruly's `targetVerbs`"
  themselves.
- **Controls: Unruly's digit keys place at the cursor.** "The keys that clear
  the cell SHALL be those of the key-only verb of `targetVerbs`" cut: a
  second pointer in a subject that says its own, and nothing of the game's.
- **Hint: A firing that forces several cells is one journey.** ", as the
  collection's is (`engine-hints`, "One deduction firing is one journey")"
  cut; which firings force several cells is the game's and stays.
- Engine requests: the hatch under the pieces was kept for want of a shared
  statement and had no request; added, in Singles' words. `trackTargets` is
  at `hint-track.ts:40`.

Checked and found sound:

- The declarations: `paramConfig` and the codec (`state.ts:96`-`126`),
  `DIFF_CHARS = "ten"` with `e` as Normal (`constants.ts:31`; the snapshot's
  `8x8de` is "8x8 Normal"), the modifier's `words: "unique"`, the three verbs
  and the erase keys (`index.ts:99`-`116`), the legend (`index.ts:320`).
- Every cited engine title is exact, and each requirement states all of what
  its row removed. The dot-run three were read against `parseDesc` and
  `encodeGrid`, which add nothing to `readDotRuns` and `writeDotRuns`.
- The kept pointers: `Params` and `Description` are owed and would say only
  their refusals without one; the legend's in `Hint` is the one place the
  ring on the square a step fills is said.
- The two engine requests: no requirement of `engine-hints` states the
  verdict rule of `trackTargets` or of a one-cell step (grep of the
  capabilities for the name finds nothing; "A player move is classified
  against the stored plan" says what each verdict does and not when a game
  gives it). "A hint hatches the one line its sentence names" does not say
  where the hatch lies, and "A hint marks beside the content, never behind
  it" speaks of the ring and the outline, so the game's sentence stays.
- The new scenario "Two clues of the two kinds" is `unruly.test.ts:139`.
- Each subject read alone: none hollow, no dangling antecedent.

## Third pass

One row of the engine tables names Unruly as keeping a sentence (the hatch);
"Not written" names its `hintKeepTrack` as its own. The mistake row does not
name it, and the spec held the rule in other words.

- **Rules**, "Rules: Unruly checks player marks against the unique
  solution": the sentence of what is returned where the clues deduce no
  complete solution cut.
- **Hint**, "Hint: The named line is hatched under its pieces": "under the
  pieces it holds" cut, with the scenario's line that restated it; retitled.

Sentences cut: 1, and 1 clause; one line of a scenario. Clauses kept: "The
line the sentence names SHALL be hatched `COL_HINT`" (no requirement says
which color a hatch takes; the next requirement turns on the premise ring
not being that color); "Hint: hintKeepTrack completes on the hinted cell and
value", whole (Unruly's own code, by the engine ledger); in `Rules`, that
the answer is solved from the clues alone with the full solver.

Section 2 of the brief: "with no departure from the codec grammar" stands in
"Params: An Unruly params string is its declared codec's, and one with no
difficulty is Easy". It is a clause of the one pointer `Params` has to its
declaration, which is where the ordinary case of an owed subject is said;
the subject's other requirement speaks only of what is refused. Kept. The
sentence of `Generation` went in the review, and the spec has no pasted-ID
sentence.

Each subject read alone: `Hint`'s two color requirements still read
together (the hatch in `COL_HINT`, the premise ring in `COL_HINT_REF`); no
fragment, every title fits its body.
