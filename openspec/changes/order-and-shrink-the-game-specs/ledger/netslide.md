# netslide

The Purpose was left as it stood: it names nothing the cut removed.

| Requirement (title as it stood) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Netslide slides rows and columns, and powers the connected tiles | "and plays a completion flash" cut from the scenario's last line; the sentences kept | `ts-engine`, "The win flash plays on a forward move that solves the board" |
| Solver: Netslide solves from the generator's grid when it has one | "and is reported solved-with-help" cut from the last line of scenario "Solve on a freshly generated game"; the sentences and the other two scenarios kept | `ts-engine`, "Only the Solve command sets the solver record", and "The win flash plays on a forward move that solves the board", scenario "The Solve command does not celebrate" (the status is solved-with-help) |
| Hint: Netslide can be solved from any position | last sentence ("The hint's searches are bounded: where they return no plan the hint SHALL refuse as out of reach, and SHALL NOT narrate a move it cannot justify.") cut; the promise that the hint finishes from any position and never circles kept, with the scenario | `engine-hints`, "A hint that plans by searching SHALL refuse honestly past its reach" (`SEARCH_OUT_OF_REACH`, `src/games/netslide/hint.ts:409`) |
| Hint: An endgame the heuristic cannot see past is searched exactly | cut after "an exact shortest search": "so that the plan's first move provably shortens the distance to a finished board. A heuristic plan carries no such guarantee, and loops." Title and scenario kept | `engine-hints`, "Sliding-permutation games share one slide planner whose exact search always runs" (scenario "The exact search returns a shortest plan": playing its first move leaves the board strictly nearer the goal) and "The slide planner's exact search runs on every board" (why a gated search cycles); `exactSearch`, `src/games/netslide/hint.ts:394` |
| Hint: Netslide renders the displayed hint step | removed, with its scenario "A displayed step" | `hintMarks.roles.ring`, `src/games/netslide/index.ts:333` (the piece ringed, the arrow in the hint's color, the square the slide takes it to outlined); `engine-hints`, "A bound hint step's words SHALL name exactly the marks it draws" |
| Hint: A destination a tile belongs in is marked apart from a stop on the way | removed, with its scenario "A destination the tile does not belong in" | `hintMarks.roles.ring`, `src/games/netslide/index.ts:333` ("A solid outline is where the piece belongs; a dashed one is a square it is only passing through, or being parked in to set up a later move"); drawn at `src/games/netslide/render.ts:412` |

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
  `src/games/netslide/hint.ts:648`.
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

One more, of the slide planner's games:

- "A subgoal that takes several slides SHALL be emitted as one multi-leg
  journey, its continuation legs flagged `continuesPrevious`, so that it reads
  and auto-plays as a single hint", in "Hint: A subgoal of several slides is
  one journey". Sixteen's "Hint: A journey's second leg keeps its tile" says
  the same of itself. `engine-hints`, "One deduction firing is one journey",
  binds only a plan derived from a deduction; the planner's games have no
  shared statement. Each game groups the legs itself (`narratePlan` in
  `src/games/netslide/hint.ts`), so the home is a rule in `engine-hints`
  beside the planner's requirements.

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
