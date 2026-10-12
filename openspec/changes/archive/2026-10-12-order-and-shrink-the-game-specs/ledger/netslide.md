# netslide

The Purpose was left as it stood: it names nothing the cut removed.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Netslide's board, its source and the lines that never slide | third pass: the clause "each a 4-bit mask of connections `R=1`, `U=2`, `L=4`, `D=8`" reworded out; the rest and the scenario kept | `engine-helpers`, "A wire tile is four bits, one for each side its wire leaves by" |
| Rules: Netslide slides rows and columns, and powers the connected tiles | "and plays a completion flash" cut from the scenario's last line; the sentences kept. Third pass: "reachable from the source through mutually connected wires not separated by a barrier" reworded out, the sentence now naming `computeActive`; the line in motion, its reason and what counts as complete kept | `ts-engine`, "The win flash plays on a forward move that solves the board"; `engine-helpers`, "Power floods from the source along wires joined from both sides" |
| Description: Netslide descriptions encode wires and barriers | third pass: retitled "Description: A Netslide description is the shared wire grid, read under the params' wrap". All three sentences cut (the grammar, the refusals, the unwritten border) and one pointer put in their place, `Description` being owed: it names the writer, the reader and the wrap, and says Netslide adds no refusal (`newState`, `src/games/netslide/state.ts:241`). Scenarios "A description one tile short" and "A non-wrapping game is walled in" dropped; "A description round-trips" kept | `engine-helpers`, "The engine provides the wire-grid description grammar" (the border not written, and `addBorderBarriers` fencing it) and "The wire-grid reader refuses what its writer never writes" (its scenario "One row of two tiles, not wrapping" has a description one tile short) |
| Look: A slide is animated, and completion flashes outward | third pass: how the flash's distance is measured ("in tiles along the connections, through the wrap of a wrapping board and never through a barrier") reworded out, the sentence now naming `wireDistance`; scenario "A neighbor the wires do not join" dropped; the slide's animation and its scenario kept | `engine-helpers`, "A wire distance is counted in tiles along the wires" (its scenario is the dropped one) |
| Solver: Netslide solves from the generator's grid when it has one | "and is reported solved-with-help" cut from the last line of scenario "Solve on a freshly generated game"; the sentences and the other two scenarios kept | `ts-engine`, "Only the Solve command sets the solver record", and "The win flash plays on a forward move that solves the board", scenario "The Solve command does not celebrate" (the status is solved-with-help) |
| Hint: Netslide can be solved from any position | last sentence ("The hint's searches are bounded: where they return no plan the hint SHALL refuse as out of reach, and SHALL NOT narrate a move it cannot justify.") cut; the promise that the hint finishes from any position and never circles kept, with the scenario | `engine-hints`, "A hint that plans by searching SHALL refuse honestly past its reach" (`SEARCH_OUT_OF_REACH`, `src/games/netslide/hint.ts:409`) |
| Hint: An endgame the heuristic cannot see past is searched exactly | cut after "an exact shortest search": "so that the plan's first move provably shortens the distance to a finished board. A heuristic plan carries no such guarantee, and loops." Title and scenario kept | `engine-hints`, "Sliding-permutation games share one slide planner whose exact search always runs" (scenario "The exact search returns a shortest plan": playing its first move leaves the board strictly nearer the goal) and "The slide planner's exact search runs on every board" (why a gated search cycles); `exactSearch`, `src/games/netslide/hint.ts:394` |
| Hint: Netslide renders the displayed hint step | removed, with its scenario "A displayed step" | `hintMarks.roles.ring`, `src/games/netslide/index.ts:333` (the piece ringed, the arrow in the hint's color, the square the slide takes it to outlined); `engine-hints`, "A bound hint step's words SHALL name exactly the marks it draws" |
| Hint: A destination a tile belongs in is marked apart from a stop on the way | removed, with its scenario "A destination the tile does not belong in" | `hintMarks.roles.ring`, `src/games/netslide/index.ts:333` ("A solid outline is where the piece belongs; a dashed one is a square it is only passing through, or being parked in to set up a later move"); drawn at `src/games/netslide/render.ts:412` |
| Status bar: The status bar counts moves and powered tiles | removed (Found, mended): its sentence says nothing the requirement after it does not. Scenario "A game with a move target" moves, unchanged, to "Status bar: Netslide's status bar reads moves, then the target, then the tiles lit" | this spec, "Status bar: Netslide's status bar reads moves, then the target, then the tiles lit" |
| Status bar: Netslide's status bar reads moves, then the target, then the tiles lit | gains scenario "A game with a move target" | |
| Hint: The hint plans against a finished grid | Found, mended: gains the sentence that the hint refuses, in Solve's sentence, where no finished grid can be recovered (`SOLUTION_UNKNOWN`, `src/games/netslide/hint.ts:351`), and the scenario "A hint on a hand-typed board with no wires", whose board and sentence are those of the Solver requirement's scenario | |
| Hint: Only the slide a Netslide step asks for keeps the plan | added (Found, mended): `hintKeepTrack`, `src/games/netslide/hint.ts:710` | |
| Hint: Netslide's hint does not open by undoing the player's last slide | added (Found, mended): `rejectFirstMove`, `src/games/netslide/hint.ts:399`; the engine requirement says a game may hand the veto over and where the planner applies it, and not that Netslide does | |

## Kept, and why

- **Params: Netslide's params and their encoding** and **Params: A Netslide
  params string with no `b` asks for no barriers.** `encodeParams` and
  `decodeParams` are written out (`src/games/netslide/state.ts:95`, `:108`),
  so nothing declares the letters, their order or the absent `b`.
- **Params: Netslide's preset titles name the help the barriers give.** The
  titles are a function of the game's own (`presetTitle`,
  `src/games/netslide/index.ts:97`), and the requirement says what the three
  words mean, which no field does.
- **Params, "a side under 2 is refused by the bound its field declares".** It
  restates no bound's wording; it says where the refusal `validateParams` does
  not make is made.
- **Hint: A subgoal of several slides is one journey.** `engine-hints`, "One
  deduction firing is one journey", binds a deduction's forced moves. No
  shared requirement says a searched plan's slides for one tile are a journey.
- **Hint: The hint leads with the tile's one degree of freedom.** That a
  named line is hatched and never numbered is `engine-hints`, "A hint hatches
  the one line its sentence names" and "A hint names no row or column by a
  number the board does not draw"; which line, and that it is the technique,
  is Netslide's.
- **Hint: A Netslide journey opens on the first reason that holds.**
  `hintRungs` lists the three reasons in the same order, and nothing reads it
  for order: the choice is the chain of `narrateStep`,
  `src/games/netslide/hint.ts:615`.
- **Hint: The distance to finished is a pure function of the board.**
  `engine-hints`, "A plan steered by a measure SHALL be steered by one
  measure", forbids a second measure; that Netslide's one measure is
  recomputed against the board, with no cached plan, is the game's.
- **Look: Netslide draws its tiles on a quiet surface** and the wire colors of
  **Look: Netslide renders wires, barriers, arrows and the slide animation.**
  The renderer is the game's own, so which entry a tile or a wire takes is a
  choice in `redraw`.

## Engine requests

Net and Netslide share `src/engine/wires.ts`, and each spec states of itself,
in nearly the same words, what that module does. No engine capability states
any of it:

- The tile: "each a 4-bit mask of connections `R=1`, `U=2`, `L=4`, `D=8`", in
  "Rules: Netslide's board, its source and the lines that never slide" and in
  Net's "Rules: Net's board and what counts as solved". The code is `R`, `U`,
  `L`, `D` at `src/engine/wires.ts:32`.
- The description: "one hexadecimal digit per tile giving its wire mask, each
  optionally followed by `v` ... and/or `h` ... A game that is not wrapping
  SHALL be walled around its whole border, which the desc does not write", in
  "Description: Netslide descriptions encode wires and barriers", and Net's
  "Description: Net descriptions are a hex digit a tile, with its barriers",
  which adds the refusals `parseWireDesc` makes for both (an `h` before its
  tile's `v`; a last column's `v` or last row's `h` on a board that does not
  wrap). The code is `parseWireDesc`, `encodeWireDesc` and
  `addBorderBarriers`, `src/engine/wires.ts:281`, `:320`, `:308`. A shared
  link in either game depends on it.
- The power flood: "reachable from the source through mutually connected
  wires not separated by a barrier", in "Rules: Netslide slides rows and
  columns, and powers the connected tiles". The code is `computeActive`,
  `src/engine/wires.ts:359`.
- The flash: "The completion flash SHALL spread from the source along the
  wires: a tile's position SHALL be its distance from the source in tiles
  along the connections, through the wrap of a wrapping board and never
  through a barrier", word for word in "Look: A slide is animated, and
  completion flashes outward" and in Net's "Look: The completion flash spreads
  from the source along the wires", each with the scenario "A neighbor the
  wires do not join". `ts-engine`, "A game gives each element a position, and
  the route is which position it gives", says only "its distance from the
  source". The code is `wireDistance`, `src/engine/wires.ts:402`.

These belong in `engine-helpers`, or a capability for the wire grid as
`border-grid` is for edges.

All four answered, in `engine-helpers`: the tile by "A wire tile is four
bits, one for each side its wire leaves by"; the description by "The engine
provides the wire-grid description grammar" and "The wire-grid reader refuses
what its writer never writes"; the flood by "Power floods from the source
along wires joined from both sides"; the flash by "A wire distance is counted
in tiles along the wires".

One more, of the slide planner's games:

- "A subgoal that takes several slides SHALL be emitted as one multi-leg
  journey, its continuation legs flagged `continuesPrevious`, so that it reads
  and auto-plays as a single hint", in "Hint: A subgoal of several slides is
  one journey". Sixteen's "Hint: A journey's second leg keeps its tile" says
  the same of itself. `engine-hints`, "One deduction firing is one journey",
  binds only a plan derived from a deduction; the planner's games have no
  shared statement. Each game groups the legs itself (`narratePlan` in
  `src/games/netslide/hint.ts`), so the home is a rule in `engine-hints`
  beside the planner's requirements. Left the game's own: the planner
  returns moves and makes no step, and the two games group by different
  rules (Sixteen flags a second leg only, where the first step previewed it;
  Netslide flags every later slide while the tile it follows stays the
  same), so no one sentence is true of both.

## Found

- "Status bar: The status bar counts moves and powered tiles" says nothing
  that "Status bar: Netslide's status bar reads moves, then the target, then
  the tiles lit" does not say exactly. It is a copy inside the spec, which is
  none of the three classes, so it stands.
- The spec never says that Solve counts as a move: `executeMove` adds one to
  the move count for the solve move (`src/games/netslide/index.ts:116`), so
  the status bar after Solve on an untouched board reads "Moves: 1".
- The spec never states the hint's keep-track verdict (`hintKeepTrack`,
  `src/games/netslide/hint.ts:710`): the step's own slide completes it and
  any other move drops the plan, with no on-track case.
- The spec never says the hint does not open by undoing the slide the player
  just made (`rejectFirstMove`, `src/games/netslide/hint.ts:399`).
- "Hint: The hint plans against a finished grid" does not say what the hint
  answers where no finished grid can be recovered: the Solve refusal's
  sentence (`SOLUTION_UNKNOWN`, `src/games/netslide/hint.ts:351`).
- The dropped scenario "A displayed step" was set "on a board with no keyboard
  cursor showing"; what the arrow looks like where the cursor is on the
  hinted arrow is stated nowhere.

## Review

6 rows read, each against the declaration or the requirement it names, read
whole; 4 rows' requirements changed in the spec, no sentence restored.

Changed:

- **"Hint: Netslide can be solved from any position"**: the citation of the
  search refusal cut with the sentence it replaced. The collection's
  requirement states all of it, and the Hint subject says plenty of its own.
- **"Hint: An endgame the heuristic cannot see past is searched exactly"**:
  the rewording round a citation undone. It added a claim about the budget
  the requirement never made; the requirement is its first sentence as it
  stood, to "an exact shortest search".
- **"Hint: Netslide's marks are the roles its legend declares"** removed. The
  two requirements it replaced are the `ring` role's sentence
  (`index.ts:333`: the piece, the arrow in the hint's color, the square
  outlined, solid where the piece belongs and dashed where it passes
  through), and a pointer was no better than the copies. The scenario "A
  destination the tile does not belong in" went with it. The two requirements
  after it ("the tile mark", "the destination mark") stand without it.

Checked and found sound:

- No engine capability names `wires.ts` or its functions, so the four
  requests stand and the sentences stay. `engine-hints`, "One deduction
  firing is one journey", binds a plan derived from a deduction, and no
  requirement of the slide planner speaks of a journey: "Hint: A subgoal of
  several slides is one journey" stays and its request stands.
- The two scenario lines cut (the flash, solved-with-help) against
  `ts-engine`, "The win flash plays on a forward move that solves the board"
  and "Only the Solve command sets the solver record".
- `encodeParams`, `decodeParams` and `interpretMove` are hand-written
  (`state.ts:95`, `:108`; `index.ts:165`), so Params and Controls stay whole.
  `narrateStep` is at `hint.ts:615`, not `:648`.
- Each subject read alone: none hollow, no dangling antecedent.

## Third pass

What the engine's third round states, removed. 5 rows of the third-round
tables name Netslide (the wire tile, the wire-grid grammar, its reader's
refusals, the power flood, the wire distance). Four of this ledger's five
requests were answered and one was left the game's own.

Cut, 6 sentences or clauses and 3 scenarios:

- **The tile's mask**, in "Rules: Netslide's board, its source and the lines
  that never slide".
- **How power floods**, in "Rules: Netslide slides rows and columns, and
  powers the connected tiles".
- **The three sentences of the Description requirement**, and its scenarios
  "A description one tile short" and "A non-wrapping game is walled in". One
  pointer stands in their place, the subject being owed.
- **How the flash's distance is measured**, and the scenario "A neighbor the
  wires do not join", in "Look: A slide is animated, and completion flashes
  outward".

Kept, 3 clauses:

- "A row or column that is mid-slide SHALL be treated as unpowered, so the
  highlight does not appear to jump across a line in motion." The engine
  requirement says a game with a line in motion names it; that Netslide has
  one, and why, is the game's.
- That Netslide's flash spreads from the source along the wires: the engine
  requirement is conditioned on it and does not say it of Netslide
  (`src/games/netslide/render.ts:720`).
- "Hint: A subgoal of several slides is one journey", left the game's own.

`engine-hints`, "The slide planner's first-move veto binds the heuristic
search alone" names no sentence of Netslide: the spec states none of the
veto (see Found). No sentence of the brief's section 2 stood in the spec.

Each subject read alone: `Description` is one pointer with a case of
Netslide; no fragment, no dangling antecedent, every title fits. The Purpose
names nothing that went.

## Found, mended

- Two status-bar requirements stating one thing: "Status bar: The status bar
  counts moves and powered tiles" removed, its scenario moved to the other.
- Solve counts as a move: left, not sure it is meant. `executeMove` adds one
  (`index.ts:116`) where upstream sets the count to 1
  (`../puzzles/netslide.c:1145`); for the owner.
- The keep-track verdict: added "Hint: Only the slide a Netslide step asks
  for keeps the plan".
- The hint does not open by undoing the last slide: added "Hint: Netslide's
  hint does not open by undoing the player's last slide".
- The hint's answer where no finished grid can be recovered: a sentence and
  a scenario of "Hint: The hint plans against a finished grid". The board of
  the Solver requirement's scenario loads, so a player reaches it.
- The arrow where the cursor is on the hinted arrow: left, the scenario that
  raised it is gone and no sentence of the spec is wrong about it.
