# What else holds each rule of the `ascent` spec

Measured on 2026-10-09 against commit 176780d0 (`git show 176780d0:openspec/specs/ascent/spec.md`), by reading; no test was run.

One row per obligation (a `SHALL` sentence or a separable clause of one). A scenario that only restates a body rule is folded into that rule's row; a scenario that adds something has a row of its own, marked "Scenario". The holder is the strongest that applies: `type`, `guard`, `declaration`, `guide`, `help`, `code only`, `spec only`.

Paths: `A/` is `src/games/ascent/`, `E/` is `src/engine/`. In **Where**, "own" is a test in `A/` and "cross" is a cross-game guard that reaches Ascent by derivation or through the shared midend. "snapshot only" means no assertion names the rule and only `A/__snapshots__/ascent-render.test.ts.snap` would move.

## Counts

| Holder | Rows |
| --- | --- |
| type | 2 |
| guard, in the game's own tests | 85 |
| guard, cross-game | 25 |
| declaration | 4 |
| guide | 7 |
| help | 9 |
| code only | 15 |
| spec only | 1 |
| **Total rules** | **148** |

Rows with holder `not a rule`: 8, kept apart from the total. Of the 85 own-test guards, 6 are held by a render snapshot alone.

Three rules are false, or partly false, of the code as it stands; each is marked **FALSE** in its Notes. Seven rows could not be settled by reading and say so.

## Requirement: Ascent game implements the Game interface

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| `A/` implements the `Game` interface | type | `A/index.ts` `ascentGame: Game<…>` | |
| The game is registered and served by the TS engine | guard | cross: `src/catalog-registry.test.ts` "registers a game for every cataloged puzzle" | |
| Params are width, height, four tiers, five modes, two booleans | guard | cross: `E/params-stability.test.ts` "encoded params are byte-stable" › ascent (snapshot) | Also `AscentParams` and `paramConfig` |
| Width and height are between 2 and 50 | declaration | `A/index.ts` `paramConfig`, `dimensionParamConfig({ bounds })` | |
| Area is under 1000 | code only | `A/index.ts` `validateParams` | |
| Hexagon needs an odd height and a width over half the height | code only | `A/index.ts` `validateParams` | |
| A 2×2 Edges grid is refused | code only | `A/index.ts` `validateParams` | |
| An Edges tier below Normal is refused | guard | own: `ascent.test.ts` "refuses a game ID asking Edges for what it does not offer" | Made true by `Ruleset.only`. Holds for a deal only: the same test asserts a written-out board is not refused |
| Symmetrical clues are refused in Edges | guard | own: same test | As above |
| A game ID encodes every parameter and round-trips | guard | cross: `E/params-stability.test.ts` "encodeParams and decodeParams are mutual inverses" › ascent | `S` is not written in Edges mode |
| Ascent implements `findMistakes` | guard | cross: `src/capability-surface.test.ts` "matches the recorded capability surface" | Guide: `docs/games/mechanics.md` § "Mistake checking is part of "done"" |
| Ascent implements an explained hint | guard | cross: same test | `Game.hint` is optional in the type; absence makes a draft |
| Scenario: every preset or legal size deals a uniquely soluble board | guard | own: `ascent.test.ts` "generates a uniquely soluble board" (seven shapes) | Cross: `E/solve-finishes.test.ts`, `E/difficulty-contract.test.ts` |
| "Matching upstream"; "because Ascent is a unique-solution logic puzzle" | not a rule | | Provenance and a reason |

## Requirement: Ascent descriptions use the upstream run-length encoding

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| Row-major: decimal numbers with a separator, lower-case empty runs, upper-case wall runs | guard | own: `ascent.test.ts` "reads numbers, blank runs and wall runs", "refuses what encodeGridDesc never writes" | Round trip also in "generates a uniquely soluble board" and `ascent-differential.test.ts` |
| A run longer than 26 repeats the maximal letter | code only | `A/state.ts` `encodeGridDesc` | No frozen fixture holds a run over 26 (searched), and no test re-encodes a board large enough |
| Edges arrows are written as border numbers and re-tagged on decode | guard | own: `ascent.test.ts` "5x5 edges normal: generates a uniquely soluble board"; `ascent-differential.test.ts` (mode 4 fixtures) | |
| The physical grid is the size adjusted for the mode | guard | own: `ascent-differential.test.ts` "frozen upstream boards" | Guide: `docs/games/mechanics.md` § "Grid modes are a movement table" |
| A number above the cell count is refused | guard | own: `ascent.test.ts` "refuses what encodeGridDesc never writes" | The code's bound is the padded area (`r.int(1, s)`), which is larger than the playable count on Hexagon, Honeycomb and Edges boards. Which the spec means is not determinable from its text |
| Too few cells is told from too many | guard | own: same test | |

## Requirement: Ascent input, movement and completion

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| Click a placed number, then a cell beside it, to place the successor | guard | own: `ascent.test.ts` "jumps the focus to the run's leading edge and recommends the next open number" | |
| Click an empty cell and type a multi-digit number | guard | own: `ascent.test.ts` "a tap and the keypad write any missing number into any empty square" | |
| Edges: drag from an arrow to an empty cell on its line | help | `help/games/ascent.md` § Controls, item 3 | No test drives the drag; only its guide line is asserted |
| Left-drag across cells draws a path | help | `help/games/ascent.md` § Controls | No test sends a drag that draws a line |
| Right-click or right-drag erases | help | `help/games/ascent.md` § Controls | The right-click cycle is tested; erasing a line is not |
| A fully drawn path resolves into placed numbers | guard | own: `ascent-hint.test.ts` "ends the plan at a step that fills in more than its own square" | Indirect: it passes only if a line fills a number. Guide: `docs/games/mechanics.md` § "Grid modes are a movement table" |
| Arrow keys and Enter emulate mouse clicks | guard | cross: `E/input-parity.test.ts` "ascent: some keyboard-only sequence changes the board" | |
| Entry state lives on the Ui, never on the state | guide | `docs/games/mechanics.md` § "Grid modes are a movement table" | |
| An input that changes nothing makes no history entry | guide | `docs/games/mechanics.md` § "interpretMove and UI_UPDATE" | |
| A move is a discriminated union of place, line, clear and solve | type | `A/state.ts` `AscentMove`; `assertNever` in `A/moves.ts` | **FALSE in part**: the union has a fifth arm, `places`, the hint's whole-run move |
| Placing on a given cell is rejected | code only | `A/moves.ts` `executeAscentMove` throws | |
| Completed when every cell is filled and the numbers form one path | guard | own: `ascent.test.ts` "Solve completes the board" | |
| ...and every arrow clue is satisfied | code only | `A/state.ts` `checkCompletion` | No test offers a full path with a wrong arrow. The Edges `Ruleset.rule` text tells the player the rule |
| `findMistakes` re-solves the clues and flags each contradicting number | guard | own: `ascent.test.ts` "flags a wrong number and clears on a correct board" | Cross: `E/mistake-invariant.test.ts` |
| Check & Save hard-blocks on a contradiction | guard | cross: `E/check.test.ts` "finds mistakes first, and never asks the hint about a wrong board" | Shared midend, on a test game |
| Rendering draws numbers, walls, path segments and Edges arrows | guard | own: `ascent-render.test.ts` "Rectangle: fresh board fills a background, draws tile borders and clues", "Edges: draws arrow clues around the border" | |
| Endpoint candidates are shown for a single-number path | help | `help/games/ascent.md` § Controls | `A/render.ts` draws `prevhints`/`nexthints`; no test |
| The board flashes on completion | declaration | `A/index.ts` `solvedFlash` | |
| Moves apply instantly, with no interpolation | guard | cross: `src/capability-surface.test.ts` "matches the recorded capability surface" | The snapshot lists no `animLength` for Ascent |
| "This is distinct from the in-play error shading" | not a rule | | A clarification |

## Requirement: Ascent grades its difficulty tiers honestly

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| A board above Easy is not soluble at the tier below, in any mode | guard | own: `ascent.test.ts` "needs its own tier, not the one below" (seven shapes, no Honeycomb) | Cross: `E/difficulty-contract.test.ts` "deals boards that need the tier the preset claims" walks every preset |
| The generation loop is bounded | guard | cross: `E/retry-bound.test.ts` "calls a retryLimit guard, or the ledger says what bounds it" | |
| The gate's probe runs on scratch carrying nothing from an earlier candidate | guide | `docs/games/solver-and-generator.md` § "The difficulty contract" | `A/generator.ts` builds a fresh `SolverScratch`. The tier-binding guards assert the consequence, not this |
| What upstream does; 7 of 22 and 56 of 180; every description above Easy changes; the retained flag | not a rule | | History, measured figures, a reason |

## Requirement: Ascent acts on a pointer button, not on a pointer coordinate

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| The board arm is entered only for a press, drag or release | guard | cross: `E/input-parity.test.ts` "ascent: declines a code it cannot act on" | Guide: `docs/games/input.md` § "A button you did not act on must not be claimed" |
| The `UI_UPDATE` tail is kept | guard | cross: `E/input-parity.test.ts` "ascent: responds to a cursor key, or is on the exemption list" | A cursor key answers only through the tail |
| Scenario: a typed number commits on a cursor move, Enter or a click | guard | own: `ascent.test.ts` "a tap and the keypad write any missing number into any empty square" | The click only. Cursor move and Enter are stated in the help page and untested |
| Why upstream differs; what broke; the refused remedy; the scope note on `ignoresSecondaryButton` | not a rule | | History and reasons, repeated in `docs/games/input.md`. The refused remedy binds and has no `SHALL` |

## Requirement: Ascent solves with a four-tier deductive solver

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| The solver finds the unique completion or reports that it cannot | guard | own: `ascent.test.ts` "generates a uniquely soluble board"; `ascent-differential.test.ts` | |
| A fixpoint of rules gated by tier, as listed | guard | own: `ascent-differential.test.ts` "frozen upstream boards (decode, round-trip, solve at their tier)"; `ascent-ladder.test.ts` (which rungs fire) | Declared in `A/solver.ts` `ascentLadder`. The list is inexact: `overlap` also runs at Normal in Edges, and the simple single-number rung is off at Hard |
| No tier guesses or backtracks | guide | `docs/games/solver-and-generator.md` § "Guess-free generation" | |
| The generator keeps every board uniquely soluble at its tier | guard | own: `ascent.test.ts` "generates a uniquely soluble board", "needs its own tier, not the one below" | |
| The path is built by the backbite algorithm | code only | `A/generator.ts` `generateHamiltonianPath` | |
| Non-Edges: clues are removed while the solver solves, honoring symmetry and kept ends | help | `help/games/ascent.md` § "Ascent parameters" (generated from `paramConfig` docs) | No test asserts a symmetric pattern or that the ends stay |
| Edges: numbers move to arrows by a maximal bipartite matching, retried until soluble | code only | `A/generator.ts` `ascentAddEdges` | |
| The same seed gives the same description | guard | own: `ascent.test.ts` "same seed reproduces the same desc" | |

## Requirement: Ascent's square grids turn and its hexagonal grids do not

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| Square-grid presets draw taller than wide | guard | cross: `E/orientation.test.ts` "draws no default or preset wider than tall, outside the ledger" | |
| They are upstream's turned: 6×7 and 8×10 | spec only | | **FALSE**: `BOARDS` in `A/index.ts` holds 6×7 (Orthogonal, Classic) and 5×5 (Edges). No 8×10 is on the menu; see the `params-stability` snapshot |
| The Honeycomb preset is 6×8 | guard | cross: `E/params-stability.test.ts` "encoded params are byte-stable" › ascent (snapshot) | |
| `transposeParams` turns the square-grid modes | declaration | `A/index.ts` `transposeParams` | `E/orientation.test.ts` skips a `null`, so returning `null` for these would pass |
| `transposeParams` returns `null` for Hexagon and Honeycomb | declaration | `A/index.ts` `transposeParams` | Guide: `docs/games/mechanics.md` § "Portrait boards, and turning them to fit". Whether "draws the turned board as the same board on its side" would catch a turned Honeycomb was not determined |
| Hexagon is recorded as wide by nature in the ledger | guard | cross: `E/orientation.test.ts` "draws no default or preset wider than tall, outside the ledger" | The ledger is held exact |
| A hexagonal grid on its side is another grid; the hexagon is wider across its corners | not a rule | | Reasons |

## Requirement: Ascent explains the next number

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| Every hint step places one number | help | `help/games/ascent.md` § Hints | **FALSE**: a whole-run step places several (`places`), as a later requirement demands. The help page says both |
| Every fact a step rests on is a number, wall or arrow on the board | guard | own: `ascent-hint.test.ts` "every premise, restated from the board, singles out its square" (the block) | |
| The reading is rebuilt from the board, through the solver's rungs, before every step | guide | `docs/games/hints.md` § "Give the facts a notation (Loopy)", the Ascent list | `A/hint.ts` `reading` |
| The hint does not read lines the player drew | help | `help/games/ascent.md` § Hints | `reading` takes `state.grid` only; no test asserts it |
| The techniques: neighbors, reach, dead end, one-run square, the route forms | guard | own: `ascent-hint.test.ts` "fires each technique somewhere in the corpus"; pins "says, at each pin" | |
| Techniques are tried easiest first by their tier in the grid mode | guide | `docs/games/hints.md`, same list ("Order by the tier in the board's own mode") | `A/hint.ts` `techniqueTier` and a stable sort |
| No step uses a technique above the board's tier | guard | own: `ascent-hint.test.ts` "never uses a technique above its board's tier" | |
| The reason is one sentence of at most 120 characters | guard | cross: `E/hint-quality.test.ts` "ascent: every step within 120 characters, or ledgered" | "One sentence" is loose: several steps speak two (see the `lines` pin) |
| Numbers are named by value | guard | own: `ascent-hint.test.ts` "touch and reach: the reach the sentence names, and the arrow when it is needed" | |
| The filled square is ringed and its number is not drawn | guard | own: `ascent-render.test.ts` "Rectangle: rings the square to fill and outlines the numbers it sits between" | Cross: `E/hint-mark.test.ts` "ascent: the acted-on cell is ringed, not filled" |
| What it reasons from is outlined, square and hexagon alike | guard | own: same test; `ascent-hint.test.ts` (outlines hold each bound) | The hexagon's outline is snapshot only |
| An arrow's line is striped when the sentence names it | guard | own: `ascent-hint.test.ts` "touch and reach: …"; `ascent-render.test.ts` "Edges: stripes the line an arrow points along when the sentence names it" | |
| A one-run square: the reason in words, or the run named and its reach striped | guard | own: `ascent-hint.test.ts` "only one number can reach the square" | |
| A step whose move fills more than its own square ends the plan | guard | own: `ascent-hint.test.ts` "ends the plan at a step that fills in more than its own square" | The test stops at the first case it finds |
| The hint refuses on a solved board | guard | cross: `E/midend.test.ts` "refuses a hint on a finished board itself, without asking the game" | The midend refuses, not `ascentHint` |
| The hint refuses while `findMistakes` reports anything | guard | cross: `E/midend.test.ts` "refuses a hint on a board with mistakes itself, and highlights them" | As above |
| A step is followed by placing its number by any gesture | guard | own: `ascent-hint.test.ts` "completes on its own number in its own square, however it was entered" | |
| Scenario: following the hint finishes the board with no wrong number | guard | own: `ascent-hint.test.ts` "finishes every board it deals, one true number at a time" | |
| Scenario: a dead end names the path's end and why the other end is not there | guard | own: `ascent-hint.test.ts` "a dead end: one way in, and the path's other end ruled out" | |

## Requirement: Ascent's solver treats the last number like any other

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| Reach measures the last number from the nearest placed one below | guard | own: `ascent.test.ts` "measures it from the number below, one step and further" | |
| `overlap` narrows it and ties the number before it | guard | own: `ascent.test.ts` "narrows it by overlap, and clears it from a square a placement fills" | The tie to the number before is not asserted apart |
| A placement rules it out of the filled square | guard | own: same test | |
| Upstream stopped one short, and what that cost | not a rule | | History |

## Requirement: Ascent's hint follows a run and names the close rival

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| A started run is followed with the same techniques, none harder, as one journey of legs | guard | own: `ascent-hint.test.ts` "follows a run to its end in one journey, with nothing harder than its start" | |
| The plan's length cap does not split a journey | guard | own: same test (every journey ends with its run filled) | |
| One close rival or none: say which fails and why, with counts, outlining the ends named | guard | own: `ascent-hint.test.ts` "only one number can reach the square"; `ascent-render.test.ts` "outlines the rival and the ends a fill step counts from, and stripes nothing" | |
| Too long or several close, on a run of several: say none reaches, with counts; outline only their ends | guard | own: same test; "says the counts that leave only 70 in the corner, with two runs close" | |
| Otherwise the run's reach is striped | guard | own: `ascent-hint.test.ts` "only one number can reach the square" | |

## Requirement: Ascent always offers a number beside the one selected

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| The one after is offered when the one before is placed | guard | own: `ascent.test.ts` "jumps the focus to the run's leading edge and recommends the next open number" | |
| The one before is offered when the one after is placed | help | `help/games/ascent.md` § Controls, item 1 | `A/ui.ts` `uiSeek`; no test |
| The one after is offered when neither is placed | guard | own: `ascent.test.ts` "offers the next number, and places it on the square clicked beside it" | |
| A right-click on an empty square beside it cycles the two | guard | own: `ascent.test.ts` "cycles a held-adjacent cell none → lower → higher → none" | |
| A second tap offers the one before, a third deselects, on the release; a drag places the offer | guard | own: `ascent.test.ts` "after a tap places the higher number, a long press cycles back to the lower" | Guide: `docs/games/input.md` § "A button with two meanings resolves on the release" |

## Requirement: Ascent's hint places a run with one route in one step

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| A run with exactly one route (plain, through must-take squares, or leaving a neighbor room) is one step | guard | own: `ascent-hint.test.ts` "places a whole run at once only along its one route", "places the run between 33 and 37 along the one route that leaves 28 to 33 room" | |
| The route is drawn as the path line in the hint's color, every square ringed | guard | own: `ascent-render.test.ts` "draws a whole run's route as a path line in the hint's color, ringing its squares" | |
| Squares no other run reaches are striped when they make the route unique | help | `help/games/ascent.md` § Hints | `A/hint-text.ts` `say.wholeRun`. The test checks which squares those are, not that they are striped |
| The number of routes is counted, not inferred | guard | own: `ascent-hint.test.ts` "places a whole run at once only along its one route" (recounts by brute force) | |
| Placing the run a number at a time stays on the step, which shrinks | guard | cross: `E/hint-gesture.test.ts` "ascent: each step's gesture completes it" | Not confirmed by running that the gate presets reach a whole-run step. The game's own test covers a one-number step only |
| Every sentence names a run by the placed numbers at its ends | guard | own: `ascent-hint.test.ts` "names placed numbers, arrow clues, and the numbers the step places" | |

## Requirement: Ascent's hint names only numbers the player can see

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| A sentence names only numbers on the board or placed by its step | guard | own: `ascent-hint.test.ts` "names placed numbers, arrow clues, and the numbers the step places" | |
| A rival's failure is named by the placed end it cannot touch | guard | own: `ascent-hint.test.ts` "only one number can reach the square" | |
| A step count is named by the side of its run it rules out | guard | own: `ascent-hint.test.ts` "names placed numbers, arrow clues, and the numbers the step places" | Asserts no missing number is named; the words "anything higher" are only in `A/hint-text.ts` |

## Requirement: Ascent's hint reads the arrows' lines in Edges mode

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| Two techniques are offered in Edges mode and change no hint elsewhere | guard | own: `ascent-hint.test.ts` "Edges lines: the square is the one on its line near every line and number named" (asserts the mode) | `pointers` is absent elsewhere by construction (`ascentPlan`), unasserted |
| Each is listed ahead of the run techniques of its tier | code only | `A/hint.ts` `ascentPlan`, the ladder's order | |
| `lines` places where one empty square on the line meets every premise | guard | own: same `lines` test | |
| The `lines` sentence names its line and each premise, at least one a line | guard | own: same test | |
| `lines` outlines the arrows and placed numbers named, and stripes the other lines | guard | own: same test; `ascent-render.test.ts` "Edges: a lines step stripes the lines it must be near and outlines their arrows" | |
| `lines` is a Normal technique | guard | own: `ascent-hint.test.ts` "never uses a technique above its board's tier" | An upper bound; the tier is stated in `techniqueTier` |
| `pointers` places when every other candidate fails a premise there | guard | own: `ascent-hint.test.ts` "Edges pointers: every other missing number that could stand here fails its premise" | |
| The `pointers` sentence names those numbers | guard | own: same test | |
| ...and each one's reason when that fits in 120 characters | code only | `A/hint-text.ts` `say.pointers` | The pinned sentence is the short form |
| `pointers` outlines every such arrow and stripes the ruling lines | guard | own: same test; `ascent-render.test.ts` "Edges: a pointers step outlines every missing number's arrow pointing at the square" | |
| `pointers` is Tricky with a placed neighbor and Hard otherwise | guard | own: `ascent-hint.test.ts` "Edges pointers: …" | |

## Requirement: Ascent's Edges hint names a number's own line by its shape

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| A number's own line is named by its shape, in every technique | guard | own: `ascent-hint.test.ts` "touch and reach: the reach the sentence names, and the arrow when it is needed" | |
| Another number's line is named the same way | guard | own: `ascent-hint.test.ts` "Edges lines: …" | |

## Requirement: Ascent's Edges hint says when the arrows fix a run's route

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| When ignoring the arrows finds more routes, the run's arrows are outlined | guard | own: `ascent-hint.test.ts` "places a whole run at once only along its one route" | |
| The sentence says the arrows leave only that route when it fits | guard | own: same test | |
| No such claim when the count finds the same route or gives up | guard | own: same test | The give-up arm is not reached by the test |

## Requirement: Ascent offers a number keypad

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| A keypad of `1`–`9`, `0` and Clear is offered | guard | cross: `E/input-parity.test.ts` "ascent: offers a keypad exactly when its entry needs one" | Declared as `requestKeys: numberKeys` |
| A tap, the digits, and a tap anywhere write a number into any empty square | guard | own: `ascent.test.ts` "a tap and the keypad write any missing number into any empty square" | |
| Clear rubs out the last digit typed | guard | own: same test | |
| Why touch play needs the keypad | not a rule | | A reason, repeated in `E/input-parity.test.ts` `KEYPAD_WITHOUT_PENCIL` |

## Requirement: Ascent draws its cells on a quiet surface and lifts a given

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| A player's cell is the cell surface and a given the lifted surface | guard | own: `ascent-render.test.ts` "Rectangle: fresh board fills a background, draws tile borders and clues" | Guide: `docs/games/rendering.md` § "What a board looks like: pieces on a quiet surface" |
| ...in the hexagonal modes alike | guard | own: `ascent-render.test.ts` "Hexagon: renders real hexagonal cells (6-vertex outlines)" | Snapshot only |
| A fixed number is ink and a placed one the entry color | guard | own: `ascent-render.test.ts` hint-frame snapshots | Snapshot only |
| A cell's outline is the surface grid line | guard | own: `ascent-render.test.ts` "Rectangle: …", "cuts a square's corners only where the path may step diagonally" | |
| A wall is a solid ink fill | code only | `A/render.ts` `redrawAscent` (`COL_BORDER`) | Every padding wall of a generated board becomes a boundary and is not drawn, so no frame shows one (inferred, not run) |
| The margin an edge arrow sits in stays the board | guard | own: `ascent-render.test.ts` "Edges: draws arrow clues around the border" | Snapshot only |
| The board's own path is the strong gray line | guard | own: `ascent.test.ts` "draws the connecting line for a typed preview before it commits" | |
| The first and last number's disc carries a grid-line ring | guard | cross: `src/puzzle/neighbor-contrast.test.ts` "ascent: no pair is closer than the floor, but the ones on purpose" | Its ledger entry `mark:13:2` is held exact |
| A number on a path sits on a disc of its surface; an end's disc is over the line | guard | own: `ascent-render.test.ts` hint-frame snapshots | Snapshot only |
| The player's path keeps the entry color | code only | `A/render.ts` (`FLAG_USER`, `COL_LINE`) | No frame in any test holds a player's line |
| The held, typed-into or selected cell takes the selection wash | code only | `A/render.ts` (`COL_HELD`) | Not in the game's snapshots. Whether the contrast guard's second frame holds one was not determined |
| Targets and the dragged row or column take the goal wash, in a slot of their own | guard | own: `ascent.test.ts` "highlights one whole column for dragColumn", "highlights one whole row for dragRow" | The targets of a held number are not asserted here |
| Scenario: a target is told from a plain, a lifted and the held cell in the dark scheme | guard | cross: `src/puzzle/neighbor-contrast.test.ts` "ascent: no pair is closer than the floor, but the ones on purpose" | Taken from the archived change, which removed this pair's ledger entry. Not run here, so that the frame still holds a target is unconfirmed |
| An offered number is drawn in the pencil-mark color | code only | `A/render.ts` `ascentColors` (`COL_OFFERED`) | Not in any snapshot |
| ...and in ink on the dragged row or column | code only | `A/render.ts` `redrawAscent` | |

## Requirement: Ascent's rulesets are told apart by a square's neighbors

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| Four rulesets in the stated order, with their mode letters | guard | own: `ascent.test.ts` "offers the rulesets by how many neighbors a square has, fewest first" | |
| The dialog asks for ruleset and shape separately; the shape offers three | guard | own: same test; "reads every mode back as the pair that makes it, whatever it is set over" | |
| The params encoding is unchanged: one mode letter | guard | cross: `E/params-stability.test.ts` "encoded params are byte-stable" › ascent | |
| A string naming no mode decodes as Classic | guard | own: `ascent.test.ts` "decodes a string that names no mode as the board it always was" | |
| Each ruleset declares what it offers | guard | own: `ascent.test.ts` "refuses a shape the ruleset does not have", "refuses a game ID asking Edges for what it does not offer" | The declaration is `RULESETS[].only` in `A/index.ts` |
| `validateParams` writes no refusal for any of these | guide | `docs/games/mechanics.md` § "Params are declared once, on `paramConfig`" | True of `validateParams` today; no test would notice a duplicate |
| The Type menu: a section per ruleset, one board each, at the stated tiers | guard | cross: `E/params-stability.test.ts` "encoded params are byte-stable" › ascent (lists every line); `E/preset-menu-shape.test.ts` "every tier is on the menu, in each ruleset" | Built by `presetGrid(paramConfig, BOARDS, …)` |
| The default is the menu's first line | guard | cross: `E/params-stability.test.ts` "encoded params are byte-stable" › ascent | Pins the default and the menu's order; the equality is not asserted |
| Scenario: choosing Hex on a Rectangle offers Honeycomb and Hexagon, Honeycomb chosen | guard | cross: `E/only.test.ts` "the Custom dialog cannot submit what an `only` refusal would refuse" › ascent | That Honeycomb is the one chosen was not confirmed in a test |
| Scenario: Edges with Hexagon is refused, "Board shape must be Rectangle for Edges." | guard | own: `ascent.test.ts` "refuses a shape the ruleset does not have" | |
| "Other sizes are Custom's" | not a rule | | A description |

## Requirement: A square's corners are cut where the path may step diagonally

| Rule | Holder | Where | Notes |
| --- | --- | --- | --- |
| Classic and Edges squares are drawn with their corners cut | guard | own: `ascent-render.test.ts` "cuts a square's corners only where the path may step diagonally" | |
| The board shows in the gap | guard | own: `ascent-render.test.ts` "Rectangle: …" | Snapshot only |
| A hint's ring or outline follows the cut | guard | own: `ascent-render.test.ts` "Rectangle: rings the square to fill and outlines the numbers it sits between" | |
| An Orthogonal square is drawn whole | guard | own: `ascent-render.test.ts` "cuts a square's corners only where the path may step diagonally" | |
| An edge number's arrow is drawn as before | guard | own: `ascent-render.test.ts` "Edges: draws arrow clues around the border" | Snapshot only |
