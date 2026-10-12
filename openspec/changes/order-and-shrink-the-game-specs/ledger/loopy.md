# loopy

The Purpose stands as it was: everything it names is still in the spec.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Loopy checks notes against its solution | the clause "and the hint SHALL refuse while one stands" cut from the last sentence, and "and a hint asks for the mistakes to be fixed first" from its scenario | `engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board before asking the game" (`FIX_MISTAKES_FIRST` when `findMistakes` reports anything; a note is reported by `findMistakes`, `src/games/loopy/index.ts:832`) |
| Params: Loopy's params are a size, t with a grid index, and d with a tier letter | retitled "Params: A Loopy params string may leave out its height, its tiling and its tier". The encoding (order, `x`, `t`, `d`, the four tier letters, the tier in the full form only) cut for a sentence that names `paramConfig` and the declared codec (rule 2); the refusal of a `d` letter that is none of the four cut; the three missing-piece clauses kept. Scenarios "The Hats preset" and "Hard is h, and Tricky is t" dropped; "A part left out keeps its default" kept | the `paramsCodec` field list, `src/games/loopy/params.ts:191` (`dims`, `num "t"`, `choice "d"` over `LOOPY_DIFF_CHARS = "enth"`, `:100`, `full: true`); `engine-params`, "A params string is read whole or refused" (a letter after a tag that the tag does not list is refused). `src/engine/__snapshots__/params-stability.test.ts.snap` holds `9x11t16dh` with its brief `9x11t16`, and `7x7t0dt` and `7x7t0dh` under their preset titles |
| Generation: Loopy generation recovers from a degenerate grid patch | last sentence cut ("Exhausting the bound SHALL raise an error rather than return a fallback board.") | `engine-difficulty`, "Every generate-until-success loop is bounded by the shared retry limit" (it throws `RetryLimitExceeded`) and "An exhausted retry limit throws, or hands over to a bounded recovery"; the throw is `src/games/loopy/grid-build.ts:123` |
| Generation: Where no patch reaches its size, Loopy deals the largest drawn | last sentence cut ("A deal that runs its bound on patches out SHALL throw `RetryLimitExceeded`, as any generator does."), and scenario "Every patch drawn is one that cannot carry the tier" dropped | `engine-difficulty`, "Every generate-until-success loop is bounded by the shared retry limit" (params that admit no puzzle throw `RetryLimitExceeded`) and "A generator that runs out of tries is answered, not thrown" (what the engine's `generate` answers); the bound is `retryLimit("loopy: unfavorable grid patch", …)`, `src/games/loopy/generator.ts:139` |
| Controls: Loopy is playable from the keyboard alone | third sentence cut ("Loopy SHALL NOT be exempt from the collection's keyboard-reachability guard."), and scenario "Loopy is not on the keyboard-exemption list" dropped | `engine-input`, "Keyboard reachability is a recorded decision for every game" (a game handles the keyboard or is on the list with its reason) and "A keyboard commits a move" (some keyboard-only sequence changes the board) |
| Controls: Enter, Space and the erase key act on Loopy's chosen edge | first sentence (Enter and Space are the left and right buttons, the erase key clears) replaced by one that names `targetVerbs` and the engine's requirement, and says a key's move is the click's, auto-follow included, which is what "Controls: The keyboard sets an edge through the code a click uses" said. "instead" dropped from the second sentence. Gains scenario "Auto-follow applies to a keyboard selection", which moves, unchanged, from that requirement | `targetVerbs`, `src/games/loopy/index.ts:560` (`primary`, `secondary`, and the key-only verb on `ERASE_KEYS`); `engine-input`, "The engine owns a declaring game's press and select keys" (Enter applies the left-click verb, Space the right-click verb, a verb's own keys that verb) |
| Controls: The keyboard sets an edge through the code a click uses | removed. Its claim (a key's move is the click's, auto-follow included) is a clause of "Controls: Enter, Space and the erase key act on Loopy's chosen edge", and its scenario "Auto-follow applies to a keyboard selection" moves, unchanged, to that requirement. "Loopy SHALL NOT keep a parallel path for the keyboard" cut | `engine-input`, "The engine owns a declaring game's press and select keys" (a key applies the button's verb) and "A verb is the game's function, and other input is the game's own arm"; every verb of the declaration is `setEdge`, `src/games/loopy/index.ts:306` and `:557` |
| Controls: A drag outside notes mode repeats the press along the edges it passes | first sentence (what a sweep is: the pressed button's verb to each further edge that holds what the pressed edge held) replaced by one that names the declared sweep and the engine's requirement; the reach and its reason kept; scenario kept | `sweep` in `targetVerbs`, `src/games/loopy/index.ts:590` (no `buttons` limit, so both); `engine-input`, "A drag on from a press repeats the press" and "A sweep honors its declared limits and skips no target" |
| Preferences: Loopy offers auto-follow and faint-line preferences | retitled "Preferences: Loopy's preferences are three aids of its own and none of the pencil ones". The keys, the three auto-follow choices and what auto-follow does cut for a sentence that names `prefs`; the two defaults, what the faint drawing's off does, and the absence of the pencil preferences kept. Scenario "Auto-follow extends a click along a corridor" moves, unchanged, to "Preferences: Auto-follow goes on while one edge leads on in the clicked edge's state"; the choice labels cut from "The preferences of a new game"; "A new game follows nothing and rules out what counting settles" kept | `prefs`, `src/games/loopy/index.ts:246` (`kw`, `name`, `choices`); what auto-follow does is this spec's "Preferences: Auto-follow goes on while one edge leads on in the clicked edge's state" |
| Preferences: Auto-follow goes on while one edge leads on in the clicked edge's state | gains scenario "Auto-follow extends a click along a corridor" | |
| Hint: Loopy explains the next deduction from notes the player can make | retitled "Hint: Loopy's plan takes the player's lines, ruled-out edges and notes as facts". First sentence (an ordered plan of the lines the solver can decide, each step narrating why from premises the sentence states) replaced by one that names the engine's requirement; the second kept, with the notes named as corner and pair notes. Scenario kept | `engine-hints`, "A hint is deduced from the board in play" (the plan is deduced from the state in play, the player's entries included) and "A hint relies only on marks the player can make" (every premise a sentence names is a clue, an entry or a mark the player can make); that each step says why its move is forced is "A hint step always names a technique, with no un-narrated fallback" |
| Hint: The hint plan is the solver's own rungs, easiest tier first | last sentence cut ("The generator SHALL NOT build a recorder, so no generated board changes.") | `engine-hints`, "The solver and the hint are two projections of one deduction engine" (the generator runs the techniques with the recorder off, the hint with it on); `src/games/loopy/loopy-differential.test.ts` ("generates the same description, byte for byte") holds the boards |
| Hint: A hint step marks what it sets and what its sentence names | replaced by the pointer requirement "Hint: A Loopy hint step's marks are its legend's" (rule 2). Both sentences went (the band solid or broken, the clue outlined, the dot ringed, a placed note in the action color, a cited one in the evidence color); the pointer says that a note takes a role as an edge does and where each technique's marks are said. Scenario "A step that rules an edge out bands it broken" kept | `hintMarks.roles`, `src/games/loopy/index.ts:892` (`ring`: a band along an edge it sets, solid or broken, or a note it places; `outline`: the clue outlined, the dot ringed, a band under the lines it cites, the notes it cites highlighted); `engine-hints`, "A bound hint step's words SHALL name exactly the marks it draws" and "The engine SHALL own the hint mark roles and the words for them" |
| Look: Loopy draws edges in a fixed color order with clues at the incenter | "and SHALL flash on completion" cut. Scenario "Completing a single loop wins" dropped; scenario "A flagged line meets a plain one" written, since the kept sentence had none | `ts-engine`, "The win flash plays on a forward move that solves the board"; when a board is solved is this spec's "Rules: A Loopy board is solved when its lines are one loop and every clue is met". The new scenario is `PHASES`, `src/games/loopy/render.ts:256`, with `COL_MISTAKE` last, and `lineColor`, `:289` |
| Controls: Each button sets its own state and clears a decided edge | "(a tap)" and "(a long press)" reworded out of the first sentence, and the second cut ("A finger and a mouse SHALL behave the same.") | `engine-input`, "A game reads one pointer with two buttons" (a tap is the left button and a long press the right, the same from a mouse, a finger and a pen) |
| Controls: Each button cycles a note its own way | ", and a held finger," reworded out of the second sentence | `engine-input`, "A game reads one pointer with two buttons" |
| Look: Loopy shows which lines are joined to the one under the pointer | fourth sentence corrected, not cut: "The highlight of every closed loop but the largest" became "The flag `checkCompletion` puts on every piece but the largest" (see `## Review`) | |

## Kept, and why

- **Rules: Loopy checks the board against its solution.** Reads as the
  collection's "flags mistakes against the one answer" (`ts-engine`, "A
  mistake check compares with the one answer, hidden or not"). What is a
  mistake on an edge, that the answer is solved from the clues at the top
  tier, and that a board with no provable answer reports nothing are Loopy's.
- **Params: Loopy offers every tiling the geometry module provides**, and
  **Solver: Loopy grades boards with a four-tier deductive solver.** Each
  scenario reads as `engine-difficulty`, "A difficulty tier binds the board it
  generates". The first is the one place that says "for any grid type"; the
  second is the requirement's only scenario and its sentences are Loopy's.
- **Params, "Squares where `t` is absent and Easy where `d` is absent".** Both
  are `defaultParams` under a declared codec, which `engine-params`, "A params
  string is read whole or refused", says of every such game; kept as what a
  missing piece decodes to, which an old link depends on.
- **Params: A submenu titled More... holds the presets of further tilings.**
  A preset table, but a departure: `engine-params`, "The preset menu is a
  grid", has no submenu, and "More..." is a title of the game's own.
- **Params: Each row of LOOPY_GRIDS states whether its tiling turns.** The
  table is read by Loopy's own `transposeParams`, not by the engine, and the
  requirement is the reason a tiling turns.
- **Generation, "within a bounded number of attempts" / "within a bounded
  number of draws".** The counts are Loopy's stages (`PATCH_DRAWS`,
  `PATCHES`), which `engine-difficulty`, "A count on a retry loop is the
  algorithm's and not a budget", names as Loopy's in a scenario only.
- **Controls: Loopy's cursor is held under ui.cursor in its own shape.**
  `engine-input`, "One keyboard-cursor vocabulary across games", says such a
  cursor has a shape of the game's own; it does not say the field is
  `ui.cursor`, what the shape holds, or that Loopy's tests guard it.
- **Controls: Each button sets its own state and clears a decided edge.** The
  verbs' `does` strings say a second press returns an edge to undecided; that
  the right button clears a line, and does not cross it, is `nextLineState`.
- **Params: Loopy's presets draw tall, read width first, and turn where the
  tiling allows**, and **A tiling that cannot turn takes a preset size of its
  own.** They read as the preset table and as `engine-params`, "Every default
  and preset draws no wider than tall". What they hold is how each size was
  chosen against upstream's, and that a title reads width first where
  upstream's read height first, which `engine-params`, "One describer labels
  every params set", gives only as "size".
- **Controls: A hover makes no move and nothing depends on it.** `Game.hover`
  is typed to return no move. That no move reads the hovered edge, so a touch
  screen plays the same, the type cannot say.
- **Controls, "A pointer press SHALL hide the cursor".** The engine's for a
  press the verbs take; a notes-mode press is Loopy's own arm and hides it too.
- **Preferences, scenario "The preferences of a new game".** It names the
  three keys. No test of the game reads `auto-follow` by its key, so the
  scenario is left holding them.
- **Hint: The hint plan is the solver's own rungs, easiest tier first**, and
  **Hint: Within a tier the hint counts first and closes loops last.**
  `hintRungs` lists the rungs in another order and nothing reads it for order:
  the order is the loop of `nextFiring`, `src/games/loopy/solver.ts:1598`,
  over `RUNGS`, `:1404`.
- **Hint: A fact a hinted line rests on is first placed as a note.**
  `engine-hints`, "A note a hint asks for is placed beside the step that uses
  it", says where a note goes; that every corner and pair a line rests on is
  placed, and none that no line rests on, is Loopy's.

## Engine requests

None.

## Found

- **The hint's refusals are stated nowhere in the spec.** `hint` refuses with
  the collection's deduction-ran-out sentence where the solver decides no
  line, and with the unlocalized-contradiction one where it found the marks
  inconsistent: `src/games/loopy/hint.ts:782`.
- **The Solve command is stated nowhere in the spec.** It solves from the
  clues at the top tier and fills in whatever the solver proved, with no
  refusal where the board is ambiguous or unfinished:
  `src/games/loopy/index.ts:792`. A pasted board the solver cannot finish
  therefore loads and Solve leaves it unsolved.
- **"Look: Loopy shows which lines are joined to the one under the pointer"
  said "the highlight of every closed loop but the largest"**, which
  "Rules: Once a loop is closed, Loopy flags all but the largest piece" states
  differently (the open paths together are a piece, and a loop can be the one
  flagged). Corrected in review: see `## Review`.
- **How the win flash travels is stated nowhere**: it runs round the loop from
  the edge nearest the bottom-left corner, `src/games/loopy/render.ts:267`
  and `:593`.
- **That a press moves the hidden keyboard cursor to the pressed edge** is in
  no sentence of the spec; `engine-input`, "The engine owns a declaring game's
  press and select keys", states it, and Loopy's part is `parkCursor`,
  `src/games/loopy/index.ts:539` (the cursor's dot becomes one of the edge's
  ends).
- **`buildLoopyGrid` counts its draws with a `for` loop** and throws
  `RetryLimitExceeded` itself (`src/games/loopy/grid-build.ts:113`), where
  `engine-difficulty`, "Every generate-until-success loop is bounded by the
  shared retry limit", asks that the bound come from the shared helper.
- **`auto-follow` is read by its key in no test of the game.** The key is in
  `prefs` and in this spec's scenario "The preferences of a new game" alone.
- The dropped scenario "Loopy is not on the keyboard-exemption list" named a
  list the spec could not see; the list is in
  `src/engine/input-parity.test.ts`.

## Review

14 rows read, each against the declaration or the requirement it names, read
whole; 1 row corrected, 3 rows added, no sentence restored.

Changed:

- **The hover requirement's fourth sentence was false of the code and is
  corrected.** It said "the highlight of every closed loop but the largest".
  `checkCompletion` flags every piece but the largest, where the open paths
  together are one piece and a loop can be the one flagged
  (`src/games/loopy/state.ts:483`), and the hover touches none of it: the run
  under the pointer is a halo drawn beneath the edges
  (`src/games/loopy/render.ts:624`), and a flagged line keeps the mistake
  color (`lineColor`, `:289`). The sentence now names the flag
  `checkCompletion` puts on every piece but the largest.
- **Two copies cut from kept `Controls` requirements**, each with a row: "(a
  tap)", "(a long press)" and "A finger and a mouse SHALL behave the same",
  and "and a held finger". `engine-input`, "A game reads one pointer with two
  buttons", states all of it.
- **"Controls: Enter, Space and the erase key act on Loopy's chosen edge"**
  opened "these keys", which only its title named: it names them now, and its
  last sentence was shortened to stay within 500 characters, claiming the
  same.
- **"Hint: A Loopy hint step's marks are its legend's"** said "Loopy departs
  from neither" of a legend and a requirement; it says "makes no departure".
- The row for "Hint: Loopy explains the next deduction from notes the player
  can make" did not name where "narrating why its move is forced" is stated:
  `engine-hints`, "A hint step always names a technique, with no un-narrated
  fallback", added.
- One entry added under "Kept, and why" for the two preset requirements.

Checked and found sound:

- The engine titles the spec cites are exact (`spec-citations`), and each requirement a row
  names states all of what the row removed. The thinnest is the dropped
  scenario "Every patch drawn is one that cannot carry the tier", which
  `engine-difficulty` states for any generator in a scenario of "Every
  generate-until-success loop is bounded by the shared retry limit" ("params
  that admit no puzzle"). Taken as stated.
- The declarations: the codec and `LOOPY_DIFF_CHARS` (`params.ts:191`,
  `:100`), `defaultParams` (Squares, Easy), `prefs` (`index.ts:246`), the two
  verbs, the key-only verb on the erase keys and the sweep with its reach of
  three tenths of the edge's length (`index.ts:560`-`598`), and the legend
  (`index.ts:892`), which holds each mark the old requirement listed.
- The new sentences against the code: every verb is `setEdge`, so a key's
  move is the click's; the written scenario "A flagged line meets a plain
  one" is `PHASES`, with the mistake color last.
- The kept `Params`, `Generation`, `Hint`, `Controls` and `Look` requirements
  were read for copies. Beyond the two cut, what reads as shared is under
  "Kept, and why" with the clause the shared statement lacks. The cut is
  small because of what the spec holds: most of its 17 `Hint` requirements are
  techniques and their order, and its `Controls` are a cursor and a notes mode of its own.
- `cut-check`, `openspec validate --strict`, `spec-subjects`, `spec-form` and
  `spec-citations` pass.
