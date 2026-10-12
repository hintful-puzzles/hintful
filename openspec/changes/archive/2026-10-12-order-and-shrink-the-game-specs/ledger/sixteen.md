# sixteen

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Params: Sixteen's params choose how the board is scrambled | retitled "Params: Sixteen's params are its declared codec's, and choose how the board is scrambled". Sentence 1 (`WxH[mM]`) replaced by a pointer to the declaration that says the game departs nowhere from the grammar (rule 2). Sentence 2 (what the number selects) kept, reworded to say "A number above 0" and "at 0" for "A movetarget `M`" and "otherwise". It takes "a string with no `m` as no shuffling moves", made a sentence, and the scenario "A board shuffled by ten moves", from the requirement below. Its own scenario kept | the fields: `paramConfig`, `src/games/sixteen/state.ts:64`-`82`; the encoding: `paramsCodec(defaultParams, [dims(paramConfig), num(paramConfig, "m", …, { omitWhen })])`, `state.ts:92`-`97` |
| Params: Sixteen writes its shuffle count wherever it is not zero | removed, but for "a string with no `m` as no shuffling moves" and the scenario "A board shuffled by ten moves", which moves, unchanged, to "Params: Sixteen's params are its declared codec's, and choose how the board is scrambled". Scenario "A strip is refused" dropped | written when not zero, in both encodings: `omitWhen: (p) => !p.movetarget` on a `num` segment with no `full` option, `state.ts:94`-`96`; the bare number: `engine-params`, "The codec grammar is a prefix, tagged segments, flags and letters"; below 2: `bounds: { min: 2 }`, `state.ts:67`, refused by `engine-params`, "Params validity is the engine's check" (whose first scenario gives the sentence's form). `src/games/sixteen/sixteen.test.ts:103`-`108` holds `4x4m10` and "Width must be at least 2."; the `sixteen` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds `4x4m1` with no separate short form |
| Params: A shuffled Sixteen board's title counts its shuffles | removed, with its scenario "Ten shuffling moves" | `label: { slot: "tail", words: (p) => (p.movetarget ? … shuffles : null) }` on the shuffle item, `state.ts:76`-`79`; `engine-params`, "One describer labels every params set" (size, then the tail's words). No test of Sixteen holds "4x4, 10 shuffles"; `src/games/netslide/netslide.test.ts:156` holds the same label words in Netslide |
| Hint: Sixteen draws the hinted tile, its landing cell and its arrow | removed, with its scenario "The current step is drawn" | `hintMarks.roles.ring`, `src/games/sixteen/index.ts:726`-`730`: the tile filled in the hint's color, the arrow to click in the same color, the landing square outlined (and the two-leg journey's dashed and solid outlines, which the requirement never gave) |
| Hint: The hint gives the move home even when it undoes the player's slide | third pass: retitled "Hint: Sixteen's hint does not open by undoing the player's slide, unless that is the shortest way home". Sentences 2 and 3 (the veto not applied to the exact search's shortest plan, and why; the veto left to the heuristic search) cut. Sentence 1 kept, reworded to the game's own: that Sixteen vetoes, after a slide, a first move that undoes that slide or part of it (`rejectFirstMove`, `src/games/sixteen/index.ts:496`), and that the hint still gives the move home where the exact search's shortest plan opens with one. Scenario "One slide off a finished board" kept | `engine-hints`, "The slide planner's first-move veto binds the heuristic search alone" (the veto applied in the heuristic forward search only; a plan the exact search returns given as found though it open with a vetoed move, and why; its first scenario is the dropped one) |
| Rules: Sixteen slides whole rows and columns until the tiles read in order | found, mended: the cursor's modes, named by the members of an enum (`Unlocked`, `LockTile`, `LockPosition`, `src/games/sixteen/state.ts:36`), are said in the player's words; "SHALL animate a slide" gains its exception, the slide a drag's release makes (`animLength`, `src/games/sixteen/index.ts:792`-`:798`) | |
| Controls: The Sixteen port supports direct row and column dragging | found, mended: retitled "Controls: Sixteen supports direct row and column dragging"; its one line wrapped, and two scenario lines with it; the release sentence gains that a distance past half the line becomes the shorter slide the other way and that a whole turn makes no move (`src/games/sixteen/index.ts:246`-`:250`), with scenario "A drag of three squares on a row of four", a case in words | |
| Look: Sixteen's slide arrows are Netslide's | title kept. "and the arrow a hint names in the hint's" cut from the last sentence. Scenario untouched | `hintMarks.roles.ring` ("with the arrow to click drawn in the same color"), `index.ts:728` |

## Kept, and why

- **Rules: Sixteen slides whole rows and columns…**, "SHALL animate a
  slide". `animLength` here is a function with a branch of its own
  (`index.ts:792`), not a constant handed to the engine.
- **Params: …**, "A string with no `m` SHALL decode as no shuffling moves":
  what a missing field decodes to. What the number selects is `newDesc`
  (`state.ts:195`); the `doc` string says it to a player and is not what the
  generator reads.
- **Description: A Sixteen board no slides can order does not load.** The
  title's "does not load" is `engine-params`, "A board its game proves has no
  solution does not load"; the body is what `hasNoSolution` proves and what
  it does not claim, which is the game's.
- **Controls: Sixteen's cursor walks…**, "Enter or Space with the cursor
  hidden SHALL only show it", and **Controls: Ctrl or Shift…**, "With the
  cursor hidden either SHALL only show it". Sixteen declares no
  `targetVerbs`, so `engine-input`, "The engine owns a declaring game's press
  and select keys" does not bind it, and "One arrow press reveals the cursor
  and moves it" allows an acting arrow to reveal first without requiring it.
  Both are arms of `interpretMove` (`index.ts:135`, `:308`).
- **Hint: The Sixteen hint plans in full-slide moves.** `engine-hints`, "The
  slide planner is parameterized on what differs between games" says a game
  supplies its move set; that Sixteen's is a slide of any distance is the
  game's.
- **Hint: A journey's second leg keeps its tile**, "so the midend keeps the
  hint displayed across the legs". `engine-hints`, "A player move is
  classified against the stored plan" gives it by a scenario; it is one
  clause of reason here.
- **Hint: Sixteen's hint SHALL finish the swapped-pair endgames** and the
  three tangle requirements. `engine-hints` states the planner's deep search
  and "A sharpened measure is checked against every gate that reads it" in
  general; the reach, the tangle count and the two-tangle threshold are
  Sixteen's configuration (`index.ts:372`, `:392`, `:526`, `:538`).
- **Status bar.** Hand-written `statusbarText` with two forms; nothing of the
  completion words is restated ("the game's part of it").

## Engine requests

- "The don't-undo veto SHALL NOT be applied to the exact search's shortest
  plan … The veto SHALL remain available to the heuristic search", in "Hint:
  The hint gives the move home even when it undoes the player's slide". It is
  the planner's behavior for any game that passes `rejectFirstMove`, and
  belongs in `engine-hints` beside "Sliding-permutation games share one slide
  planner whose exact search always runs". `planSlides`,
  `src/engine/slide-planner.ts`. Answered: `engine-hints`, "The slide
  planner's first-move veto binds the heuristic search alone".

## Found

- **A slide made by a drag is not animated.** `animLength` answers 0 for the
  move a drag's release made (`index.ts:792`-`798`, set at `:251`): the line
  is already where the finger left it. The spec says only "SHALL animate a
  slide".
- **The spec does not say that a drag takes the shorter way round.** A
  release rounds the distance to whole tiles and then reduces it past half
  the line to the opposite slide (`index.ts:246`-`249`), so a drag of three
  squares on a row of four is a move of one the other way. "Controls: The
  Sixteen port supports direct row and column dragging" says "by the drag's
  distance rounded to a whole number of tiles".
- **The Purpose says the hint "refuses only by saying its search ran out",
  and no requirement states the refusal.** `hint` returns
  `SEARCH_OUT_OF_REACH` on an empty plan (`index.ts:552`), as `engine-hints`,
  "A hint that plans by searching SHALL refuse honestly past its reach"
  requires; the spec was silent on it before the cut.
- **The spec has no `Look` requirement for the win flash**, where Fifteen's
  and Twiddle's have one. `redraw` lights tiles through `Flash.win`
  (`src/games/sixteen/render.ts`).
- **"Rules: Sixteen slides whole rows and columns…" names `Unlocked`,
  `LockTile` and `LockPosition`**, the members of an enum in `state.ts:36`
  that no other requirement uses; the three `Controls` requirements say what
  the modes do in the player's words.
- **"Controls: The Sixteen port supports direct row and column dragging" is
  one unwrapped line, and says "port"** of a game that is no longer one.

## Review

6 rows read, each against the declaration or the requirement it names, read
whole; 1 row withdrawn with its edit, no sentence restored.

Changed:

- **"Hint: A step narrates what its move does"**: "The tile a step marks
  (`hintMarks` is the legend of its marks)" was a pointer added inside a
  subject that says plenty of its own. The sentence is back as it stood ("The
  highlighted tile"), the requirement is untouched, and its row is gone.

Checked and found sound:

- The Params pointer, kept as the accepted specs keep theirs: the subject
  would otherwise hold only the missing `m` and what the number selects, and
  not what the params are. `num` with `omitWhen` and no `full` writes `m` in
  both encodings (`src/engine/params-codec.ts:170`-`172`), the bound is
  `min: 2`, and the label's words are the shuffle item's.
- The legend's `ring` states the filled tile, the outlined landing square
  and the arrow in the hint's color, which is all the removed requirement and
  the cut clause of the `Look` requirement said.
- The engine request stands: no `engine-hints` requirement mentions a
  first-move veto ("Sliding-permutation games share one slide planner whose
  exact search always runs", "The slide planner is parameterized on what
  differs between games" and "The slide planner's exact search runs on every
  board" were read whole). The code is `rejectFirstMove`, read at
  `src/engine/slide-planner.ts:1121`, in the heuristic search alone.
- The kept sentence is borne out by the exact path. `planSlides` returns
  `bidirectionalPlan`'s shortest plan before the heuristic loop starts
  (`slide-planner.ts:1042`-`1047`), and neither `bidirectionalPlan` (`:494`)
  nor `deepPlan` (`:900`, called at `:1166`) reads `rejectFirstMove`: its one
  use is the heuristic loop's first ply (`:1121`, `curr.g === 0`). Sixteen
  passes the veto whenever the last move was a slide (`index.ts:496`) and
  configures the exact search on every board (`index.ts:526`), so one slide
  off a finished board is answered by the slide back, as the scenario says.
- Every kept requirement read by sentence: none is a copy. The 5 engine
  titles the ledger cites are exact, and its line citations are where it
  says.

## Third pass

What the engine's third round states, removed. 1 row of the third-round
tables names a sentence of Sixteen (the planner's first-move veto), and this
ledger's one request was answered by it. Two more name Sixteen and take
nothing: the lit beveled tile ("`sixteen` does the same and states none"),
and the journey of several slides, under "Not written".

Cut, 2 sentences: the second and third of **"Hint: The hint gives the move
home even when it undoes the player's slide"** (the veto not applied to the
exact search's shortest plan, and left to the heuristic search), which are
the engine requirement's second and third sentences.

Kept, 3 clauses:

- That Sixteen passes a veto, which first move it vetoes and when, and that
  the hint still gives the slide back where the exact search finds it
  shortest, with the scenario "One slide off a finished board". The engine
  requirement says what a veto binds and that a game MAY hand one; that
  Sixteen does is in no declaration. The requirement is retitled for it and
  cites nothing.

- "Hint: A journey's second leg keeps its tile", left the game's own: the
  planner makes no step, and Sixteen and Netslide group the legs by
  different rules.
- "with no departure from the codec grammar", in "Params: Sixteen's params
  are its declared codec's, and choose how the board is scrambled". The
  brief's section 2 keeps such a clause as the one pointer of an owed
  subject that would otherwise say nothing of its ordinary case: the rest of
  the requirement is the missing `m` and what the number selects, and not
  what the params or their encoding are.

Each subject read alone: none hollow, no fragment, every title fits. The
Purpose names nothing that went.

## Found, mended

- A slide made by a drag is not animated: the `Rules` requirement's "SHALL
  animate a slide" has the exception.
- A drag takes the shorter way round: stated in the drag requirement, with a
  scenario.
- No requirement states the hint's refusal: left: `engine-hints`, "A hint
  that plans by searching SHALL refuse honestly past its reach" states all
  of it, and `Hint` says plenty of the game's own.
- No `Look` requirement for the win flash: left: the flash is the
  collection's, and Sixteen has no gap or other departure to state.
- `Unlocked`, `LockTile` and `LockPosition`: said in plain words.
- The drag requirement is one unwrapped line and says "port": wrapped and
  retitled.
