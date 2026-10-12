# sokoban

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Sokoban is complete when the board cannot become more complete | sentence untouched. In the scenario "The last barrel onto a target completes the level", "and flashes" cut | `ts-engine`, "The win flash plays on a forward move that solves the board" |
| Params: Sokoban's parameters are a width and a height | retitled "Params: Sokoban's params are its declared codec's". Both sentences (width and height, both at least 4; the string encodes them; a bare number is a square) replaced by one that sends the reader to the declaration and says the game departs nowhere (rule 2). Scenario "Parameters round-trip" dropped; scenario "The default board" written from the params snapshot | the fields and the floor of 4: `paramConfig` (`dimensionParamConfig({ bounds: { min: 4 } })`), `src/games/sokoban/state.ts:106`, refused by `engine-params`, "Params validity is the engine's check"; the encoding: `paramsCodec(defaultParams, [dims(paramConfig)])`, `state.ts:119`; the bare number: `engine-params`, "The codec grammar is a prefix, tagged segments, flags and letters" (scenario "A square board's params"); the round trip: `engine-params`, "A game declares its params encoding once, and both codec halves are derived" and "Encode and decode are mutual inverses over the corpus". The `sokoban` entry of `src/engine/__snapshots__/params-stability.test.ts.snap` holds `10x12`, and `presets`, `state.ts:123`, puts it first |
| Params: Sokoban deals no level past the area its search can open | title kept. Sentence 1 untouched. Sentence 2 (applies only when a level is to be dealt; a board that arrives with its description loads at any size) cut to "The refusal SHALL bind dealing only." Scenario "A board past the limit loads from its description" dropped; "A board past the limit is refused when dealing" kept | `engine-params`, "Param validation distinguishes generating a board from loading one" (the `<params>:<desc>` form is checked with `full: false`; its scenario "A generation-only bound does not refuse the descriptive form" is the dropped one) and "A generation-only bound is gated on full". The game's gate: `validateParams`, `state.ts:112`; `src/games/sokoban/sokoban.test.ts:145` holds both halves |
| Solver: Sokoban's Solve finishes from the player's position, or else from the dealt board | third pass: retitled "Solver: Sokoban's Solve move carries the finished board, a labeled barrel's letter with it". Sentence 1 (the search from the player's position, then from the board as dealt; that it leaves the finished board the line reaches) cut. Sentence 2 reworded to stand without it ("The move Sokoban's Solve makes of a line SHALL carry the board the line finishes on as `encodeBoard` writes it"), the rest word for word. Sentence 3 untouched. Scenario "A lost position is solved from the dealt board" dropped; "A level with a labeled barrel is solved" kept | `ts-engine`, "Solve by search finishes from the player's position, or else from the board as dealt" (the order of the two searches; its scenario "A position the player has lost" is the dropped one); that the board left is solved: the same scenario and `ts-engine`, "Solve leaves a solved board". `solve`, `src/games/sokoban/index.ts:304` |
| Hint: Sokoban's hint refuses a position it cannot finish | third pass: retitled "Hint: Sokoban's hint refuses, outlining the barrel, where a barrel is stuck for good". The second half of its sentence ("and SHALL refuse with `NO_SOLUTION_FROM_HERE` when the search proves no line finishes and with `SEARCH_OUT_OF_REACH` past its reach") cut. The stuck barrel's refusal and its scenario kept. Found, mended: a second sentence added, that a barrel is called stuck only on a board where every barrel is needed (no pit, no more barrels than targets), which every dealt board is (`SokobanBoard.tight`, `src/games/sokoban/solver.ts:116`; `stuck` and `stuckKind`, `:437`, `:459`) | `engine-hints`, "A search that can prove a position lost says which of its two ends it met". `searchRefusal(plan)`, `src/games/sokoban/hint.ts:184` |

## Kept, and why

- **Description**, all three requirements. The parser and the writer are
  hand-written; no engine grammar is this one. The round-trip scenario has no
  shared statement.
- **Generation: Sokoban generates a board by reversing a solution.** It reads
  like a rule of the collection and is not one: Sokoban has no tiers, and how
  its boards come to be solvable is the generator's.
- **Solver: Sokoban's Solve finishes from the player's position, or else from
  the dealt board**, first sentence. Kept until the third pass, which cut it
  (see its row).
- **Controls: Sokoban's keys step the player one cell at a time.** A
  hand-written arm of `interpretMove`. It names no layout; that the bare
  digits are read as the pad's is a departure from `engine-input`, "The engine
  reads a number-pad digit as a direction, once" (a top-row digit names no
  direction).
- **Controls: An illegal Sokoban move leaves no history.** `ts-engine`, "A
  move that leaves the board as it was is no step of the history" is about a
  move that is made; here `interpretMove` makes none.
- **Hint: Sokoban's hint refuses a position it cannot finish**, second half.
  Kept until the third pass, which cut it (see its row). The first half, the
  stuck barrel outlined, is the game's `hasNoSolution`: the engine's
  requirement leaves the cause a game can name to the game.
- **Hint: A barrel's run of pushes onto a target is one journey.**
  `engine-hints`, "One deduction firing is one journey" says what a journey
  is; when Sokoban makes one is the game's.
- **Look**, the floor, the wall, the barrel's and the target's colors.
  `engine-colors`, "The pair's hues carry what a player moves, seeks and
  finishes" gives the roles; which piece takes which, and its shape, is the
  requirement.
- **Look: A Sokoban move animates along the route it walks.** `animLength` is
  a function of the two boards here, not a constant.

## Engine requests

- **Solve by search tries the player's position, then the board as dealt.**
  "Sokoban's Solve SHALL search for a line from the player's position and,
  failing that, from the board as dealt", in "Solver: Sokoban's Solve finishes
  from the player's position, or else from the dealt board". What the engine
  requirement would say: a game that solves by a budgeted search finishes from
  the line found from the player's position, else from the line found from
  the board as dealt; where neither has a line, Solve fails with `NO_SOLUTION`
  if the search proved the dealt board has none and with
  `PUZZLE_NOT_REASONABLE` otherwise. Belongs in `ts-engine`, beside "Solve
  leaves a solved board". `solveBySearch`, `src/engine/search-outcome.ts:58`.
  Stated of themselves by `pegs` and `sokoban`, the two games that call it;
  Sokoban's spec does not state the two failures.
  **Answered:** `ts-engine`, "Solve by search finishes from the player's
  position, or else from the board as dealt".
- **A searching hint's two refusals.** "SHALL refuse with
  `NO_SOLUTION_FROM_HERE` when the search proves no line finishes and with
  `SEARCH_OUT_OF_REACH` past its reach", in "Hint: Sokoban's hint refuses a
  position it cannot finish". What the engine requirement would say: a hint
  whose search proved that no line finishes refuses with
  `NO_SOLUTION_FROM_HERE`, and one whose search ran out with
  `SEARCH_OUT_OF_REACH`. Belongs in `engine-hints`, beside "A hint that plans
  by searching SHALL refuse honestly past its reach", which states the second
  only. `searchRefusal`, `src/engine/search-outcome.ts:35`. Stated of
  themselves by `pegs` and `sokoban`, the two games that call it.
  **Answered:** `engine-hints`, "A search that can prove a position lost says
  which of its two ends it met".

## Found

- **A stuck barrel refuses the hint only on a board where every barrel is
  needed.** "Hint: Sokoban's hint refuses a position it cannot finish" says
  "when a barrel off its target is already stuck for good" without the
  condition; `SokobanBoard.stuck` answers none on a board with a pit or spare
  barrels (`src/games/sokoban/solver.ts:437`). Every dealt board is such a
  board, so only a hand-typed level differs.
- **The spec does not say the secondary button means nothing here.** Sokoban
  declares `ignoresSecondaryButton` (`src/games/sokoban/index.ts:332`) and
  only follows `engine-input`, "A game with no secondary meaning is not given
  a synthetic one"; nothing is owed.
- **The stale comment above `hintGesture`** (`index.ts:363`) describes taps
  toward each square; the gesture is the drag the next comment says.

## Review

Three rows read, each against the code line and the engine requirement it
names; one corrected. The 31 untouched requirements read sentence by sentence
against the three classes; none cut.

- **Corrected: "Params: Sokoban deals no level past the area its search can
  open".** The writer's second sentence ended "as the collection's
  generation-only bounds do (`engine-params`, "Param validation distinguishes
  generating a board from loading one")": a citation as long as what it
  replaced. It is now "The refusal SHALL bind dealing only.", which is the
  game's own gate on `full` (`state.ts:112`) and the qualifier the first
  sentence needs; the row says where the loading half is stated.
- **Sound: the Params pointer.** The subject's only other statement is the
  1200-square refusal, so the pointer is rule 2's. `10x12` is the default and
  the first preset (`state.ts:123`, and the `sokoban` entry of the params
  snapshot); the floor of 4 is `bounds: { min: 4 }`.
- **Sound: "and flashes" cut.** `ts-engine`, "The win flash plays on a forward
  move that solves the board".
- **The two engine requests stand.** `ts-engine` ("Solve leaves a solved
  board", "Solve failures are worded once for the whole collection", "A
  Solve installs no route and reveals no loss") and `engine-hints` ("A hint
  that plans by searching SHALL refuse honestly past its reach", "The
  refusals distinguish the situations a player must tell apart", "The refusal
  kinds' dead-end verdicts") were opened: none says a searching Solve falls
  back to the board as dealt, and none says which refusal a search's proof
  earns. `engine-hints`, "The hint-resume walk excuses the games that can say
  a search ran out" names `searchRefusal` and not what it answers. The
  requests are worded as `pegs.md` words them.
- **Kept and checked: "Controls: An illegal Sokoban move leaves no history".**
  It reads like a rule of the collection, and `ts-engine`, "A UI-only input
  redraws without a history entry" says only a move enters the history; that
  a step into a wall is no move is `interpretMove`'s, and its scenario is the
  only statement of that case.

## Third pass

Rows of the engine's third-round tables that name Sokoban: 2. Engine requests
of its own: 2, both answered. Sentences cut: 2 (one whole, one the second half
of a sentence), and 1 scenario. Clauses kept: 3.

- **"Solver: Sokoban's Solve finishes from the player's position, or else
  from the dealt board"**: the first sentence and the scenario that restated
  it went to `ts-engine`, "Solve by search finishes from the player's
  position, or else from the board as dealt". Kept, as the engine's row says:
  what the move carries (the engine's last sentence leaves the move made of a
  line to the game) and that it is refused on a board whose walls differ.
  Retitled for those.
- **"Hint: Sokoban's hint refuses a position it cannot finish"**: the two
  refusals of the search went to `engine-hints`, "A search that can prove a
  position lost says which of its two ends it met". Kept: the stuck barrel
  outlined, the marked dead end the engine's row leaves the game. Retitled
  for it. Nothing of the search's refusals is left as a pointer: the Hint
  subject says plenty of the game's own.
- **Kept: "with no departure from the codec grammar"** in "Params: Sokoban's
  params are its declared codec's": the one pointer of an owed subject whose
  only other statement is the 1200-square refusal.
- No sentence of the form "What a pasted game ID opens as" and none citing
  `engine-difficulty`: Sokoban has no tiers.
- The Purpose still fits ("the hint and Solve with the search beneath them").

## Found, mended

- A stuck barrel refuses the hint only where every barrel is needed: the
  condition is now the second sentence of "Hint: Sokoban's hint refuses,
  outlining the barrel, where a barrel is stuck for good", and it says the
  same of a push a step stripes (`hint.ts:200`, `:250` ask the same `stuck`).
- The secondary button means nothing here: left: `ignoresSecondaryButton` is
  a declaration and the game follows `engine-input`, "A game with no
  secondary meaning is not given a synthetic one"; nothing is owed.
- The stale comment above `hintGesture`: left: code
  (`src/games/sokoban/index.ts:363`).
