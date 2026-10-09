# Ledger: engine-hints

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## The engine supports an ephemeral Hint System

| Rule | Where it went |
| --- | --- |
| `Game` defines an optional `hint` returning a non-empty plan of `HintStep`s, each a move, an explanation and optional highlights narrated for its own state | spec: The engine supports an ephemeral Hint System |
| The hint system is UI-only and ephemeral, and the plan and index live in `activeHint`, never in game state and never persisted | spec: The engine supports an ephemeral Hint System |
| The method is `hint(state, aux?)`, with `aux` its optional second argument | untrue: `Game.hint` is `hint(state, aux?, ui?)` in `src/engine/game.ts`, and the midend passes its live `Ui` third, so the signature is corrected |
| The midend passes its stored `aux`, the value `solve` gets, and a deductive game ignores it | spec: The midend passes the generator's aux to a hint |
| At most one step is displayed, passed to `redraw`, and a stored plan can be hidden | spec: The midend displays at most one step of a stored plan |
| The displayed step's explanation is appended to the status bar | untrue: the midend sends it as `activeHintExplanation` beside `statusBarText` on the `status-bar-change` notification (`emitStatusBar` in `src/engine/midend.ts`), which the requirement on the banner already said, so it is stated as sent to the UI |
| A plan is recomputed only when no valid plan is stored, and `midend.hint()` re-displays without recompute or advance | spec: The midend displays at most one step of a stored plan |
| `midend.executeHint()` plays the current step, computing a plan first if none, keeps it displayed through the animation, and previews the next on settle | spec: executeHint plays the current step and previews the next |
| `executeHint` executes the step's move | spec: executeHint sends the gesture and never applies the move |
| A player move is classified by `hintKeepTrack` whether or not the plan is displayed, and what completed, onTrack and off each do | spec: A player move is classified against the stored plan |
| A completed step whose successor is flagged `continuesPrevious` keeps the display on | spec: A journey stays on screen through its legs |
| A game returning completed asserts the resulting state matches the plan's expectation | spec: A completed verdict vouches for the rest of the plan |
| The plan is cleared on undo, redo, restart, new game, solve, its last step completing, and the board being solved | spec: A stored plan is cleared when play leaves it |
| One deduction firing is one journey, its first leg fully explained and its later legs flagged and abbreviated, and distinct deductions stay separate hints | spec: One deduction firing is one journey |
| This keeps the manual flow and the auto-play flow consistent across games that group | spec: One deduction firing is one journey |
| A hint naming several kinds of element colors them by a stable per-game legend, and equivalent forced moves still share the target color | spec: A hint naming several kinds of element colors them by a stable legend |
| Each legend color is paired with a non-color cue, color is never the sole carrier, and no color name appears in narration | spec: A legend color is never the only cue |
| A non-deductive game is free to derive its plan from `aux`, should prefer it when present, and is free to fall back to a heuristic | spec: A game with no technique to teach walks the known solution |
| Scenario: a hint naming multiple element types colors them by a stable legend | spec: A hint naming several kinds of element colors them by a stable legend; spec: A legend color is never the only cue |
| Scenario: a legend color is the same across different hints of one game | spec: A hint naming several kinds of element colors them by a stable legend |
| Scenario: requesting a hint from the midend | spec: The engine supports an ephemeral Hint System |

## Hint explanation surfaces independent of the status bar

| Rule | Where it went |
| --- | --- |
| The explanation reaches the hint banner whether or not the game has a status bar, riding `status-bar-change`, which the midend emits for a game with a status bar or a `hint` | spec: Hint explanation surfaces independent of the status bar |
| The status-bar DOM stays gated on `wantsStatusbar`, so the empty text is inert | spec: Hint explanation surfaces independent of the status bar |
| Range as the game with a hint and no status bar | reason |
| Scenario: a no-status-bar game shows and clears the hint banner | spec: Hint explanation surfaces independent of the status bar |

## executeHint supports a single-step (hide-after) mode

| Rule | Where it went |
| --- | --- |
| `executeHint(hideAfter?)` takes an optional flag, false by default, threaded through `PuzzleEngineSurface` and the worker adapter | spec: executeHint supports a single-step (hide-after) mode |
| When true, the step stays displayed through its animation, then the plan advances and is hidden, and the next `hint()` re-displays without recomputing | spec: executeHint supports a single-step (hide-after) mode |
| When false, and only then, the next step is displayed as the auto-play preview | spec: executeHint plays the current step and previews the next |
| "The behavior is unchanged" and "exactly as before" | history |
| Scenario: single-step execute hides the plan instead of previewing | spec: executeHint supports a single-step (hide-after) mode |
| Scenario: auto-play execute still previews the next step | spec: executeHint plays the current step and previews the next |

## The toolbar Hint button alternates show and apply

| Rule | Where it went |
| --- | --- |
| The Hint control alternates showing and applying one step, built on `hint()` and `executeHint(true)`, without changing any game's `hint()` | spec: The toolbar Hint button alternates show and apply |
| Applying is terminal and does not go on to the next hint | spec: The toolbar Hint button alternates show and apply |
| Most players need a single nudge to get unstuck | reason |
| `Puzzle` keeps an armed flag, set when a press displays a step and cleared when a press applies one | spec: A Hint press applies only while armed |
| The flag is cleared by any intervening action, each listed | spec: Any other action disarms the apply |
| A press while not armed shows, and arms only if the show is not refused, and a refused hint shows its banner and overlay | spec: A Hint press applies only while armed |
| A press while armed disarms and applies exactly the current step with `executeHint(true)`, and the next press shows the next step | spec: A Hint press applies only while armed |
| On success with the board unsolved the banner says "Hint applied", and an error surfaces in the banner | spec: An applied hint is confirmed in the banner |
| Auto-Hint stays the way to play the whole plan, with `executeHint()` and its preview | spec: The toolbar Hint button alternates show and apply |
| Scenario: first press shows, second press applies and stops | spec: The toolbar Hint button alternates show and apply |
| Scenario: presses alternate show and apply | spec: The toolbar Hint button alternates show and apply |
| Scenario: an intervening action re-arms the show | spec: Any other action disarms the apply |
| Scenario: a refused hint does not arm the apply | spec: A Hint press applies only while armed |

## A displayed hint step never references already-resolved state

| Rule | Where it went |
| --- | --- |
| Every element a displayed step asks the player to act on is still actionable, and a kept plan is re-validated before display | spec: A displayed hint step never references already-resolved state |
| The re-validation uses the optional `refreshHintStep(step, state)`, and what it returns | spec: refreshHintStep re-validates a stored step |
| A game without the hook has its steps shown as they are | spec: refreshHintStep re-validates a stored step |
| The midend calls the hook before each display, advances past resolved steps and recomputes when the plan drains | spec: The midend refreshes the current step before every display |
| An exact-follow move still keeps the plan and a conflicting move still drops it | spec: The midend refreshes the current step before every display |
| `hintKeepTrack` is called with the pre-move state, and a candidate toggle is tested for liveness against it | spec: hintKeepTrack judges a move against the board before it |
| "It only adds the freshness guarantee on top" | history |
| Scenario: a displayed step is re-validated before showing | spec: The midend refreshes the current step before every display |

## Requesting a hint never mutates the board

| Rule | Where it went |
| --- | --- |
| Computing or displaying a hint changes no state, `Game.hint` is pure on its state, and pencil notes are untouched | spec: Requesting a hint never mutates the board |
| A highlight acting on a board element is legible against its cell and never the cell's background color | spec: A highlight on a board element stays legible against its cell |
| Scenario: showing a hint leaves the board unchanged | spec: Requesting a hint never mutates the board; spec: A highlight on a board element stays legible against its cell |
| Scenario: a kept plan never shows an already-removed candidate | spec: A displayed hint step never references already-resolved state |
| Scenario: exact-follow still keeps the plan and a conflict still regenerates | spec: A player move is classified against the stored plan |

## Hint mechanics are engine-owned and cross-game guarded

| Rule | Where it went |
| --- | --- |
| A game's hint holds only what it can prove, what it marks and what it says, and the mechanics are the engine's and never re-derived per game | spec: Hint mechanics are engine-owned and cross-game guarded |
| Any per-cell overlay reaches the render cache through the shared sidecar, except where an overlay does not fit, recorded as a no-go with its reason | spec: A per-cell overlay reaches the render cache through the shared sidecar |
| Which seams are extracted is decided by the audit the change carried, in its `design.md` | history |
| A seam that fails the criteria is recorded as a deliberate no-go and not forced | spec: A shared hint mechanism costs no game its narration |
| A defect class seen in two or more games is closed structurally or by a cross-game guard, never left to a documented rule | spec: A hint defect seen in two games is closed for every game |
| The resume test as the example of such a guard | reason |
| "Documented rules are how the same defect reaches a second game" | reason |
| A shared mechanism costs no game its narration, with the exemplar hints as the acceptance test | spec: A shared hint mechanism costs no game its narration |
| "The hint is the product, the framework serves it" | reason |
| Scenario: a recurring hint defect is closed for every game at once | spec: A hint defect seen in two games is closed for every game |
| Scenario: a new hinting game inherits the mechanics | spec: Hint mechanics are engine-owned and cross-game guarded |
| Scenario: an extraction that would flatten a hint is rejected | spec: A shared hint mechanism costs no game its narration |
| Scenario: a mistake overlay reaches the cache the same way the hint overlay does | spec: A per-cell overlay reaches the render cache through the shared sidecar |

## A hint marks beside the content, never behind it

| Rule | Where it went |
| --- | --- |
| No mark is drawn under what the player reads, the acted-on cell is ringed with no exceptions, and evidence carrying content is outlined | spec: A hint marks beside the content, never behind it |
| The target is ringed even where a fill would hide nothing, because one mark means one thing | spec: A hint marks beside the content, never behind it |
| In a game whose move gives a cell a color, a fill states what the narration is still proposing | reason |
| Both marks are drawn on the cell's border, and inset where the border is a game object | spec: A hint mark is drawn on the cell's border |
| A content-free evidence area can stay a wash, by the test of whether the fill would hide the premise, and the game records its reason | spec: An evidence wash is kept only where nothing is drawn on it |
| A kept wash is tuned for visibility and not for legibility through it | spec: An evidence wash is kept only where nothing is drawn on it |
| A fill behind content cannot be rescued by another color, so the palette carries no fill counterpart to the acted-on color | spec: The palette carries no fill for the acted-on color |
| The measured contrasts of the target fill and of a dark wash, and the joint search that found no arrangement | figure; guide: docs/games/hints.md § "Why a fill cannot work, whatever color it is"; held: src/engine/color/palette.ts "There is deliberately no fill counterpart" |
| A mark on a border takes a strong color and not a wash step | spec: An evidence mark on a border takes a bold step |
| That strong color is specifically a `_BOLD`, for every mark | untrue: `HINT_ACTION`, the ring's color, is base `BLUE` in `src/engine/color/palette.ts`, and only `HINT_EVIDENCE` is a bold step (`TEAL_BOLD`), so the bold step is required of the evidence mark alone |
| The evidence color and the chain ordinal are one role | spec: The chain ordinal is the evidence role |
| A mark outside the content box is driven by the drawstate, erased explicitly and repainted each frame, and one inside needs no bookkeeping | spec: A mark outside the content box is driven by the drawstate |
| Guards assert the mark's shape, and the cross-game guard derives each game's hint palette indices from its renderer and counts its games | spec: The mark guards assert shape and derive their games |
| Scenario: the acted-on cell is ringed, not filled | spec: A hint marks beside the content, never behind it |
| Scenario: evidence carrying content is outlined | spec: A hint marks beside the content, never behind it |
| Scenario: a mark outside the content box survives a neighbor's repaint | spec: A mark outside the content box is driven by the drawstate |
| Scenario: a wash is kept only where nothing is drawn on it | spec: An evidence wash is kept only where nothing is drawn on it |
| Scenario: a mark never impersonates a game object | spec: A hint mark is drawn on the cell's border |

## The necessity-voice rule applies to every hinting game not ledgered as narrating moves

| Rule | Where it went |
| --- | --- |
| The rule applies to every game with a `hint()`, minus a ledger of move-narrating games with reasons, and no game is added to a list to be checked | spec: The necessity-voice rule applies to every hinting game not ledgered as narrating moves |
| An idiom is a predicate over the step, is rejected for a game the rule does not apply to, and shared necessity words belong to the shared vocabulary | spec: A necessity idiom is a predicate over the step |
| Scenario: a hinting game not named anywhere is necessity-checked | spec: The necessity-voice rule applies to every hinting game not ledgered as narrating moves |
| Scenario: an idiom scoped to a continuation leg does not excuse a lead leg | spec: A necessity idiom is a predicate over the step |

## The midend reports where a displayed hint sits in its journey

| Rule | Where it went |
| --- | --- |
| The midend reports the displayed step's position in its journey and the journey's length, derived by walking the `continuesPrevious` run | spec: The midend reports where a displayed hint sits in its journey |
| The position is not the plan index, a game that never groups reports a journey of one, and the report is absent with no step displayed | spec: A journey position is not the plan index |
| "Step 3 of 47" as what the plan index would say | reason |
| Scenario: a multi-leg deduction reports its progress | spec: The midend reports where a displayed hint sits in its journey |
| Scenario: a single-leg hint reports a journey of one | spec: A journey position is not the plan index |
| Scenario: no hint is displayed | spec: A journey position is not the plan index |

## The hint walk SHALL cover every preset a game offers

| Rule | Where it went |
| --- | --- |
| The walk is asserted over every leaf preset of every hinting game, with a vacuity count of cases walked | spec: The hint walk SHALL cover every preset a game offers |
| It was asserted over the first leaf preset alone, and widening found refusals the narrow form could not reach | history; guide: docs/games/hints.md § "A hint must resume from any position" |
| The cost is tiered, and the per-commit slice keeps one preset per value of every axis the game varies, the axes derived from `paramConfig` | spec: The per-commit slice keeps one preset per value of every axis |
| The table of the three keys tried and what each could not reach | history; held: src/engine/testing/presets.ts "What this replaces, and why keying on tier alone was not enough." |
| Killer is not a skin on Solo, and adds cage rungs and sentences | reason |
| `paramConfig`'s types decide what covering an axis means, both ends of a string item and every value of a boolean or choices item, with difficulty no special case | spec: A param's type decides what covering its axis means |
| `paramConfig` is consumed by the Custom dialog and complete because a game without one fails its own guard | reason |
| A field every preset holds one value at is not an axis | spec: The per-commit slice keeps one preset per value of every axis |
| Presets are taken in menu order, keeping one that supplies a new value, which claims each value on the smallest board | spec: The slice takes presets in menu order |
| The measured walk counts, seconds and per-mode costs of the widened slice | figure |
| Any cross-game sweep over presets derives its boards from the game, and the enumeration and the slice live with the shared hint testing helpers | spec: Every cross-game sweep over presets derives its boards from the game |
| A second sweep keyed on tier skipped the untiered games before its vacuity count | history |
| The slice's vacuity floor sits above one board per game and one per tier | spec: The slice's vacuity floor sits above its collapses |
| The three measured counts | figure |
| A finding with a shape is pinned by its shape and not by more sampling | spec: A sweep's finding is pinned by its shape |
| The stranding appears on about a fifth of boards | figure |
| Scenario: a hint works on Easy and gives up on Hard | spec: The hint walk SHALL cover every preset a game offers |
| Scenario: a game gains a preset | spec: The hint walk SHALL cover every preset a game offers |
| Scenario: a game's second mode is walked per commit | spec: The per-commit slice keeps one preset per value of every axis |
| That scenario's planted Solo defect that the tier-keyed slice missed | history |
| Scenario: an untiered game's largest board is walked per commit, unless its hint searches, and largest is the extreme of each scalar axis | spec: A param's type decides what covering its axis means |
| The sizes of Flood's boards in that scenario | figure |
| Scenario: a sweep meets a game with no tiers | spec: Every cross-game sweep over presets derives its boards from the game |

## Deduction running out on a sound board SHALL have one wording

| Rule | Where it went |
| --- | --- |
| A game with no move on a sound, unsolved, mistake-free board refuses with the one constant, never an invented phrasing, an alias or the spelled-out value | spec: Deduction running out on a sound board SHALL have one wording |
| There is one situation and not two, shown by walking every preset | history; held: src/engine/hint-refusal.ts "There is one situation here, not two" |
| The wording says the position is the tier's expected end and what to do | spec: Deduction running out on a sound board SHALL have one wording |
| Every builder of a `hint()` imports the constants and retypes none | spec: A hint builder imports the refusal constants |
| The candidate builder once held literal copies of three constants | history; guide: docs/games/hints.md § "Refusal wording comes from one module" |
| The guard for stray refusals reads the engine's hint builders as well as the games | spec: A hint builder imports the refusal constants |
| That guard keys on every `{ ok: false, error: <string literal> }` in the AST | untrue: no test scans for that shape now. `HintResult`'s error is typed `HintRefusal`, so a typed sentence does not compile, and the conformance check in `src/engine/hint-refusal.test.ts` reads the escapes' calls wherever they appear, engine builders included |
| The refusal is reachable only where the tier permits search, the permission derived from the tier's name, and a game with no difficulty contract cannot emit it | spec: Deduction runs out only where the tier permits search; spec engine-difficulty: The midend throws when deduction runs out below Unreasonable |
| Scenario: a player exhausts deduction on a search-permitting board | spec: Deduction running out on a sound board SHALL have one wording |
| Scenario: a game invents a phrasing, and the refusal guard fails | untrue: the program does not typecheck, since the error is a `HintRefusal` (`src/engine/hint-refusal.ts`), and the scenario now says so |
| Scenario: a shared hint builder inlines a refusal as a literal, and the guard sees it | untrue: a literal that is not a constant's value fails the typecheck, and one equal to it is seen by no scan. The scenario now states what the conformance check does read under `src/engine/`, the escapes' calls |
| Scenario: a refusal escapes onto a deduction-complete tier | spec: Deduction runs out only where the tier permits search |

## Sliding-permutation games share one slide planner whose exact search always runs

| Rule | Where it went |
| --- | --- |
| The engine provides one toroidal slide planner every sliding game's hint uses, owning a heuristic forward search and an exact bidirectional search that returns a shortest path | spec: Sliding-permutation games share one slide planner whose exact search always runs |
| A partial plan is returned when the search improves without reaching the goal | spec: The slide planner returns a partial plan when it falls short |
| The planner works on the board as the player sees it and does not tell look-alike boards apart | spec: The slide planner works on the board as the player sees it |
| Every slide on an odd-width torus is an even permutation, so a target can sit in an unreachable coset | reason |
| The planner is parameterized on the grid, the moves, the finished board, the goal test and the distance, and holds no narration or rendering | spec: The slide planner is parameterized on what differs between games |
| The exact search runs on every board before the heuristic, a game supplies only its budget, and a game that cannot afford it omits it | spec: The slide planner's exact search runs on every board |
| The rule this replaced, the two gates that cycled, and Sixteen's cycle with its measures | history; held: src/engine/slide-planner.ts "a shortest plan does not look like progress on the way home" |
| A budget is the smallest that crosses the worst endgame, and the planner's state storage is allocation-free and packed | spec: An exact-search budget is the smallest that crosses the worst endgame |
| The consumers are guarded by their own suites and by the resume walk, the one guard that sees a ping-pong | spec: The slide planner's games are guarded by the resume walk |
| Scenario: a second sliding game reuses the planner | spec: Sliding-permutation games share one slide planner whose exact search always runs |
| Scenario: the exact search is not held back for the boards that need it | spec: The slide planner's exact search runs on every board |
| Scenario: a search that cannot reach the goal still helps | spec: The slide planner returns a partial plan when it falls short |
| Scenario: the exact search returns a shortest plan | spec: Sliding-permutation games share one slide planner whose exact search always runs |

## The slide planner SHALL carry a last resort bounded by depth rather than by memory

| Rule | Where it went |
| --- | --- |
| A second exact search bounded by depth, made of a kept endgame database and a depth-first walk holding one board | spec: The slide planner SHALL carry a last resort bounded by depth rather than by memory |
| Sixteen's swapped-pair endgames, the cost of storing states to reach them, and the boards the hint gave up on | figure; guide: docs/games/hints.md § "Sliding-permutation games" |
| A game declares only the two depths, and the deep search reaches at most one ply past the ungated search | spec: The deep search reaches one ply past the ungated search |
| Two plies further would bring back the recompute cycle an earlier change removed | history; held: src/engine/slide-planner.ts "Keep that one ply." |
| The database's completeness is asserted directly, and an end-to-end agreement check does not stand in for it | spec: The endgame database's completeness is asserted directly |
| The narrowed Zobrist hash in an `Int32Array` that went half blind and survived a round of measurement | history; guide: docs/games/hints.md § "Sliding-permutation games" |
| Scenario: a board past the state-bounded search still gets a plan | spec: The slide planner SHALL carry a last resort bounded by depth rather than by memory |
| Scenario: the two exact searches agree | spec: The slide planner SHALL carry a last resort bounded by depth rather than by memory |
| Scenario: the database is asked whether it holds a board it must hold | spec: The endgame database's completeness is asserted directly |
| Scenario: following the deep search's plan converges | spec: The deep search reaches one ply past the ungated search |

## A hint that plans by searching SHALL refuse honestly past its reach

| Rule | Where it went |
| --- | --- |
| A hint that plans by bounded search refuses with the constant for a search out of reach, never with the claim that no move would help | spec: A hint that plans by searching SHALL refuse honestly past its reach |
| The no-move sentence is a claim about the board, made only where established | spec: A hint that plans by searching SHALL refuse honestly past its reach |
| Its remaining callers are constructions that cannot return empty | reason |
| What Sixteen said on tangled endgames | history |
| The wording names what still works and names no control that fails for the same reason | spec: The search refusal names what still works |
| The never-gives-up guarantee is relaxed for the searching games and no other | spec: Only a searching hint is excused the walk's promise |
| Each further ply of Sixteen's search costs about forty times | figure; held: src/engine/hint-resume.test.ts "each further ply costs about 40×" |
| The relaxation is derived from the game and never declared, with a reason per member and an exact ledger | spec: The searching games are derived and their reasons ledgered |
| The derivation reads which games call the shared planner | untrue: `SEARCH_REACH_GAMES` in `src/engine/testing/hint-games.ts` is the hinted games whose comment-stripped code names `SEARCH_OUT_OF_REACH` or calls `searchRefusal(`. Guess and Pegs search without the planner. The rule names both markers |
| Scenario: a searching hint runs out of reach | spec: A hint that plans by searching SHALL refuse honestly past its reach |
| Scenario: a searching hint uses the board-claiming refusal instead | spec: A hint that plans by searching SHALL refuse honestly past its reach |
| Scenario: a deductive game that does not call the planner borrows the search refusal, and the walk fails | untrue: a game that names the refusal joins the derivation, and what fails is the ledger equality in `src/engine/hint-resume.test.ts`, until its reason is written. The scenario now says that |
| Scenario: the derivation finds nobody | spec: The searching games are derived and their reasons ledgered |

## A plan steered by a measure SHALL be steered by one measure

| Rule | Where it went |
| --- | --- |
| Exactly one heuristic measure is in play on every board, and no sharper one is armed where the first is helpless | spec: A plan steered by a measure SHALL be steered by one measure |
| Sixteen's board that ran four hundred hints as a second pass and solved in sixteen as the only measure | figure; guide: docs/games/hints.md § "Recompute-stable plans" |
| Sharpening a measure is checked against every gate that reads it, and differs from the blunt one only where the searches above cannot help | spec: A sharpened measure is checked against every gate that reads it |
| Sixteen's deep search stopped firing on the endgames it was built for | history |
| Scenario: a sharper measure is armed only where the blunt one is stuck | spec: A plan steered by a measure SHALL be steered by one measure |
| Scenario: a sharpened measure disarms a gate that read it | spec: A sharpened measure is checked against every gate that reads it |

## Hint narration SHALL NOT use an em-dash

| Rule | Where it went |
| --- | --- |
| No player-facing hint text holds U+2014, in a game's narration or the engine's, and the en-dash is not swept up | spec: Hint narration SHALL NOT use an em-dash |
| A rewrite keeps the step's arc and its modal, and removing a clause to remove the dash is a violation | spec: Removing an em-dash keeps the sentence's substance |
| The guard finds its games from those with a `hint()`, scans the engine's shipped code, and excludes tests and `engine/testing/` structurally | spec: The em-dash guard scans the games and the engine's shipped code |
| Both the source scans and the runtime sweep apply the rule, as overlapping nets | spec: The source scans and the runtime sweep both apply the em-dash rule |
| Scenario: a game's narration adds an em-dash | spec: Hint narration SHALL NOT use an em-dash |
| Scenario: shared engine narration adds an em-dash | spec: The em-dash guard scans the games and the engine's shipped code |
| Scenario: a domino label keeps its en-dash | spec: Hint narration SHALL NOT use an em-dash |

## A hint SHALL show only steps the player's board does not already decide

| Rule | Where it went |
| --- | --- |
| A deductive hint shows no step the board already decides, through `deduceHintPlan`'s optional `showable(board, firing)`, and a hidden firing still advances the working board | spec: A hint SHALL show only steps the player's board does not already decide |
| The plan cap counts shown steps only, the loop reports how many it hid, and the step budget ticks for hidden firings | spec: Hidden firings spend the step budget and not the plan cap |
| What is evident is the game's to judge, hides only what the board shows, never a change the win needs, and a legality derivation is judged before the firing and held in a test | spec: What is evident is the game's judgment, held to move legality |
| Scenario: a redundant deduction is never a step | spec: A hint SHALL show only steps the player's board does not already decide |
| Scenario: hidden firings do not spend the plan cap | spec: Hidden firings spend the step budget and not the plan cap |
| Scenario: a hidden firing that changes nothing still terminates | spec: Hidden firings spend the step budget and not the plan cap |

## A game's hint sentences SHALL live in one text module per game

| Rule | Where it went |
| --- | --- |
| Every sentence and word a speaking hint says lives in the game's `hint-text.ts`, exported as `say`, shared sentences in the engine's, refusals outside the rule, and a silent hint has no module | spec: A game's hint sentences SHALL live in one text module per game |
| The narration decides only which sentence and with what values, passes values and never words, and a text module does not read the board | spec: A game's narration chooses the sentence and passes values |
| The population is derived by a cross-game test, both ways | spec: The games with a text module are derived |
| Scenario: a new game's hint speaks | spec: The games with a text module are derived |
| Scenario: rewording a sentence | spec: A game's hint sentences SHALL live in one text module per game |

## Hint narration SHALL be short enough to read at a glance

| Rule | Where it went |
| --- | --- |
| Narration is at most 120 characters, checked at every tier and preset and into the middle of the game, on every commit | spec: Hint narration SHALL be short enough to read at a glance |
| The check also covers each tiered game's last preset at its hardest teachable tier, a search tier excluded, scoped by role to push and manual runs | spec: The length check also walks the last preset at the hardest teachable tier |
| The seconds that rule costs and how the selector reaches the guard | figure |
| A step exceeds the limit only by a ledger listing of its rung with a reason, entries name rungs by id, every listed rung is declared, and the ceiling is 300 characters | spec: A long sentence is excused only by a ledger listing of its rung |
| The ledger is asserted both ways, per `(entry, game, rung)` listing | spec: The narration ledger is asserted both ways, per listing |
| Keyed by entry alone the reverse direction passes on one game's strength | reason; guide: docs/games/hints.md § "Keep the narration terse" |
| The forward direction runs per commit, and the reverse defers with the corner rule and is skipped when it did not run | spec: The ledger's reverse direction defers with the corner walk |
| A vacuity floor per listed game, and a listing deleted only on a widened walk recorded beside the entry | spec: A listing is not called dead on a walk that looked at nothing |
| Scenario: a long sentence without a ledger entry fails | spec: Hint narration SHALL be short enough to read at a glance |
| Scenario: a ledger entry that no longer matches anything long fails | spec: The narration ledger is asserted both ways, per listing |
| Scenario: a game listed on a shared sentence it never speaks fails | spec: The narration ledger is asserted both ways, per listing |
| Scenario: a listed game whose walk examined nothing is not reported as dead | spec: A listing is not called dead on a walk that looked at nothing |
| Scenario: the rot half is skipped when the corner walk did not run | spec: The ledger's reverse direction defers with the corner walk |
| Scenario: a ledgered sentence still has a ceiling | spec: A long sentence is excused only by a ledger listing of its rung |
| Scenario: a reworded sentence keeps its listing | spec: A long sentence is excused only by a ledger listing of its rung |
| Scenario: a listing for a rung the game does not have | spec: A long sentence is excused only by a ledger listing of its rung |

## A Hint press in flight is dropped, and a slow one says it is thinking

| Rule | Where it went |
| --- | --- |
| A press during a hint in flight is dropped and not queued, the rhythm is as if it never happened, and a show landing after Auto-Hint started does not arm | spec: A Hint press in flight is dropped, and a slow one says it is thinking |
| A press unanswered after `HINT_PENDING_MS` shows "Thinking…" on the control and the banner, which revert or give way to the answer's message | spec: A slow Hint press says it is thinking |
| A slow hint is not cancellable, and why | spec: A slow hint is not cancellable; held: src/puzzle/puzzle.ts "Not cancellable, deliberately" |
| The longest case is a few seconds once or twice a game | figure |
| Scenario: presses during a slow hint are dropped, and the rhythm survives | spec: A Hint press in flight is dropped, and a slow one says it is thinking |
| Scenario: a slow hint is labeled | spec: A slow Hint press says it is thinking |
| Scenario: a fast hint is never labeled | spec: A slow Hint press says it is thinking |
| Scenario: a late answer's own message wins | spec: A slow Hint press says it is thinking |

## A hint step always names a technique, with no un-narrated fallback

| Rule | Where it went |
| --- | --- |
| A displayed step explains why its move is forced by a named technique, with no generic fallback | spec: A hint step always names a technique, with no un-narrated fallback |
| A game narrates every deduction its generator accepts or rejects the board at generation | spec: A game narrates every deduction or rejects the board at generation |
| A hypothesis is classified as Check, Tactic or Search by whether its reasoning is a bounded run of glanceable steps, not by whether it propagates or what it is called | spec: A hypothesis is classified as Check, Tactic or Search |
| A Tactic's hint shows the chain on the board, every link in order with both ends anchored, and is not required to advance one leg at a time | spec: A Tactic's chain is shown on the board |
| The stricter one-leg-at-a-time reading was designed, costed and set aside by the owner | history |
| A Tactic's narration names the ends, cites links by position, supplies the propagating rule, and states a case split | spec: A Tactic's narration names the ends, the links and the rule |
| The order is declared as data the renderer reads, reaches the canvas, and is drawn as an ordinal and not a path | spec: A chain's order is declared and drawn as an ordinal |
| The share of Clusters' links a path would misstate | figure; guide: docs/games/hints.md § "Number the chain — the order is the fact the marks used to lose" |
| A Search is never reported as a deduction, and is refused with a message that deduction has run out | spec: A Search is refused and never narrated |
| A rung is classified by the bound it guarantees, and a gating bound is defined once and documented as load-bearing | spec: A rung is classified by the bound it guarantees |
| Two rungs with the same narration are told apart structurally, with a control against vacuity | spec: Two rungs with one narration are told apart structurally |
| Strategic hints are outside the classification and narrate imperatively, and movement games are exempt | spec: Movement and strategic hints are outside the technique rule |
| The whole requirement governs deductive games, its rule on naming the acted-on element included | spec: Movement and strategic hints are outside the technique rule; spec: A narration identifies every element it refers to |
| A tier whose boards can require Search is named `Unreasonable`, and no other is | spec: Only a tier named Unreasonable requires Search; spec engine-difficulty: Unreasonable is declared and never issued by position |
| A hard tier with a propagating trial is not deleted, and the three ways it is resolved | spec: A propagating trial on a hard tier moves up or renames the tier |
| A name is dropped only from a tier that generates nothing, its character still decoding and its refusal keeping its reason | spec: A name is dropped only from a tier that generates nothing; spec engine-difficulty: A tier with no boards is retired and still loads |
| A tier list has one definition per game, and a shortened list re-establishes its lost guard in the game's tests | spec: A tier list has one definition per game |
| The difficulty contract reads the tier list | spec engine-difficulty: A game's tiers are read from its difficulty item; spec: A tier list has one definition per game |
| A moved rung leaves its old tier generable at every size, or the pair is refused by `validateParams` with a reason | spec: A moved rung leaves its old tier generable |
| A narration ties the acted-on element to the others when a step marks more than one, by one of four ties | spec: A narration identifies every element it refers to |
| A relation used as a tie is one the code guarantees, and a chain's numbered elements are named by position | spec: A tie a narration states is one the code guarantees |
| A numbered mark and an unnumbered one are not the same kind of thing, the general rule the other ties are instances of | reason |
| A narration never identifies an element by its color | spec: A narration never identifies an element by its color |
| The example tie "its ringed red neighbor", which names a color | spec: A narration never identifies an element by its color |
| A step with one mark keeps its bare deictic | spec: A step with one mark keeps its bare deictic |
| A trial run to certify a position is not narrated, and the plan stops recording where the trial is needed | spec: A search certifies a position and never teaches one |
| Scenario: a logic game's hint never shows an unexplained step | spec: A hint step always names a technique, with no un-narrated fallback |
| Scenario: a step showing two marks says which one it is acting on | spec: A narration identifies every element it refers to |
| Scenario: the tie is never a color name | spec: A narration never identifies an element by its color |
| Scenario: a single-mark step keeps its bare deictic | spec: A step with one mark keeps its bare deictic |
| Scenario: a movement game's hint is exempt | spec: Movement and strategic hints are outside the technique rule |
| Scenario: a search may certify a position but never teach one | spec: A search certifies a position and never teaches one |
| Scenario: deduction running out is refused, not guessed past | spec: A Search is refused and never narrated |
| Scenario: a bounded chain is walked, not asserted | spec: A Tactic's chain is shown on the board; spec: A Tactic's narration names the ends, the links and the rule |
| That scenario's note on why it kept its name, citing a change's decision | history |
| Scenario: a declared chain order reaches the canvas | spec: A chain's order is declared and drawn as an ordinal |
| Scenario: two strengths of one rung are classified separately | spec: A rung is classified by the bound it guarantees; spec: Two rungs with one narration are told apart structurally |
| Scenario: a tier that can require guessing says so in its name | spec: Only a tier named Unreasonable requires Search |
| Scenario: moving a trial rung up leaves the tier below still generable | spec: A moved rung leaves its old tier generable |

## A note a hint asks for is placed beside the step that uses it

| Rule | Where it went |
| --- | --- |
| A note whose explanation stays true as the board fills is placed immediately before the step that rests on it | spec: A note a hint asks for is placed beside the step that uses it |
| A note whose explanation the board can outgrow is placed at the latest position it still describes, and no note is offered with a false explanation | spec: A note is never offered with a false explanation |
| A journey is one deduction, and notes placed together are split into their derivations | spec: Notes placed together are split into their derivations |
| A note placed where it was discovered reads as an unmotivated triviality, and a journey gathering every note reads as a tour | reason |
| Scenario: a fact found long before it is used | spec: A note a hint asks for is placed beside the step that uses it |
| Scenario: an explanation the board outgrows | spec: A note is never offered with a false explanation |
| Scenario: a step resting on two separate derivations | spec: Notes placed together are split into their derivations |
| Scenario: a step resting on one derivation | spec: Notes placed together are split into their derivations |

## A hint relies only on marks the player can make

| Rule | Where it went |
| --- | --- |
| Every step rests on facts the player can see or record, a missing mark is offered and placed as a move, and no hint-only overlay draws an unrecordable fact | spec: A hint relies only on marks the player can make |

## GameDrawing draws the hint's line hatch

| Rule | Where it went |
| --- | --- |
| `drawHatch(rect, color, period)`, its bands and their canvas-wide lines, the one band geometry and opacity, and visibility in both schemes | spec: GameDrawing draws the hint's line hatch |

## A hint hatches the one line its sentence names

| Rule | Where it went |
| --- | --- |
| A step naming exactly one row or column hatches it and its clue slot, hatches nothing otherwise, and does not also outline it | spec: A hint hatches the one line its sentence names |
| The example sentence "Row 3 still needs", which names a row by number | spec: A hint names no row or column by a number the board does not draw |
| The row/column candidate preset hatches a hidden single's line | spec: The row/column candidate preset hatches a hidden single's line |
| Scenario: a hidden single hatches its line and outlines nothing | spec: The row/column candidate preset hatches a hidden single's line |
| Scenario: every hinting game draws exactly the hatches its steps name | spec: A hint hatches the one line its sentence names |

## A hint names no row or column by a number the board does not draw

| Rule | Where it went |
| --- | --- |
| No sentence names a line by a number, and how a line and a square are named | spec: A hint names no row or column by a number the board does not draw |

## A hint hatches the region its sentence is about

| Rule | Where it went |
| --- | --- |
| A step whose sentence names a region hatches it, does not outline it, and names it by its stripes | spec: A hint hatches the region its sentence is about |

## A set outlines the cells it rests on

| Rule | Where it went |
| --- | --- |
| A Latin set elimination records its cells, and the hint outlines them as evidence | spec: A set outlines the cells it rests on |

## A preference change drops the stored hint plan

| Rule | Where it went |
| --- | --- |
| A preference change drops the stored plan and clears the display, and the next hint is built under the new values | spec: A preference change drops the stored hint plan |

## A piece a hint acts on is ringed as one shape

| Rule | Where it went |
| --- | --- |
| A piece spanning several squares is ringed as one shape | spec: A piece a hint acts on is ringed as one shape |
| The shared painter owns the drawing from the game's relation, for targets and optionally evidence, and without one draws as for a game with no pieces | spec: The shared painter joins a piece from the game's relation |
| A joined mark inside the content box keys each square's repaint on its sides | spec: A joined mark inside the content box keys its repaint on its sides |
| Scenario: a domino placement is one ring | spec: A piece a hint acts on is ringed as one shape |
| Scenario: a domino decided whole is one ring | spec: A piece a hint acts on is ringed as one shape |
| Scenario: a game with no pieces is unchanged | spec: The shared painter joins a piece from the game's relation |

## The engine SHALL own the hint mark roles and the words for them

| Rule | Where it went |
| --- | --- |
| The three roles, their one meaning each, the engine's words for them, and a game adding a role only when none fits, saying why | spec: The engine SHALL own the hint mark roles and the words for them |
| A mark is drawn on an element of a kind, which keys its elements and says what a noun counts, and an inner element marks its container | spec: A mark is drawn on an element of a kind |
| A recolored clue is an outline reference | spec: A recolored clue is an outline reference |
| Scenario: a literal says a mark's word | spec: The engine SHALL own the hint mark roles and the words for them |
| Scenario: a reference uses another role's word | spec: The engine SHALL own the hint mark roles and the words for them |
| Scenario: a shading genre says its rules' word | spec: The engine SHALL own the hint mark roles and the words for them |

## A bound hint step's words SHALL name exactly the marks it draws

| Rule | Where it went |
| --- | --- |
| A game declaring `hintMarks` is bound, its steps carry words built from references, and its renderer paints marks from the words alone | spec: A bound hint step's words SHALL name exactly the marks it draws |
| The glyph a role takes on a kind remains the game's | spec: A mark is drawn on an element of a kind |
| Removing a named element changes the frame, removing every reference leaves the hintless frame, every role is in the legend, and the walk checks every step | spec: The binding walk holds every step's frame to its words |
| A shared mechanic paints from the words | spec: A shared mechanic paints from the words |
| Scenario: a step draws a mark its words never name | spec: A bound hint step's words SHALL name exactly the marks it draws |
| Scenario: a continuation leg keeps showing evidence | spec: The binding walk holds every step's frame to its words |
| Scenario: the words name a mark the renderer does not paint | spec: The binding walk holds every step's frame to its words |
| Scenario: a renderer still paints a mark from a highlight field | spec: A bound hint step's words SHALL name exactly the marks it draws |

## A refresh that shrinks a hint step SHALL rewrite its words

| Rule | Where it went |
| --- | --- |
| A step whose marks shrink has its words narrowed and re-rendered | spec: A refresh that shrinks a hint step SHALL rewrite its words |

## A bound game's help SHALL list its marks from its legend

| Rule | Where it went |
| --- | --- |
| The help page marks where its list goes, the build fills it from the legend, and a mismatch fails the build | spec: A bound game's help SHALL list its marks from its legend |

## Every hinted game SHALL be bound

| Rule | Where it went |
| --- | --- |
| Every game with a `hint` declares `hintMarks`, and its help lists its marks | spec: Every hinted game SHALL be bound |

## A hint step is played by the pointer gesture that makes it

| Rule | Where it went |
| --- | --- |
| Every hinted game declares `hintGesture`, returning the pointer actions that make the step, and its keys are on-screen ones | spec: A hint step is played by the pointer gesture that makes it |
| `executeHint` never applies the move, sends the gesture through `interpretMove` as the frontend would, and judges each move with `hintKeepTrack` | spec: executeHint sends the gesture and never applies the move |
| The midend throws on a gesture that goes off, overruns, presses an off-screen key or falls short, and on a missing `hintGesture` | spec: A gesture that does not make its step throws |
| A cross-game walk plays every hinted game's plans on every gate preset | spec: A gesture that does not make its step throws |
| The name of the test file that holds that walk | reason |
| Scenario: a step the pointer cannot make fails the walk | spec: A hint step is played by the pointer gesture that makes it |
| Scenario: a step made in several moves completes on the last | spec: executeHint sends the gesture and never applies the move |
| Scenario: a key the player has no control for is refused | spec: A gesture that does not make its step throws |

## A target-verb game's hint clicks come from its verbs

| Rule | Where it went |
| --- | --- |
| A target-verb game makes a click-per-target step through `verbClicks`, and other steps stay its own gesture | spec: A target-verb game's hint clicks come from its verbs |
| How the engine picks each button, where it aims, where it stops and when it throws | spec: verbClicks chooses each click's button by the verb the step keeps |
| A drag game's press arm goes through `pressTarget` and `buttonVerb` | spec: A drag game's press arm goes through the engine's verbs |
| Scenario: the button is the one the step keeps | spec: verbClicks chooses each click's button by the verb the step keeps |
| Scenario: a wrong target fails the walk | spec: A target-verb game's hint clicks come from its verbs |
| Scenario: the step and the Ui are left as they were | spec: verbClicks chooses each click's button by the verb the step keeps |

## The midend SHALL refuse a hint on a finished or wrong board before asking the game

| Rule | Where it went |
| --- | --- |
| The midend refuses with `ALREADY_SOLVED` and then `FIX_MISTAKES_FIRST`, in that order, before asking the game, which writes neither | spec: The midend SHALL refuse a hint on a finished or wrong board before asking the game |
| Neither refusal is a `HintRefusal`, the one promising a highlight and the other the midend's alone | spec: The midend's two refusals are not a game's to give |
| How many hinted games wrote this opening before the midend took it over | figure |
| The midend does not refuse on a lost status | spec: The midend does not refuse a hint on a lost board |
| The hint walk asks `findMistakes` at every position and fails if it reports anything | spec: The hint walk asks findMistakes at every position |
| Scenario: asking for a hint on a finished board | spec: The midend SHALL refuse a hint on a finished or wrong board before asking the game |
| Scenario: asking for a hint on a board with a mistake highlights it | spec: The midend SHALL refuse a hint on a finished or wrong board before asking the game |
| Scenario: a refusal unrelated to mistakes highlights nothing | spec: The midend SHALL refuse a hint on a finished or wrong board before asking the game |
| Scenario: a hint walk meets a mistake | spec: The hint walk asks findMistakes at every position |

## A hint refusal SHALL be one of the collection's own

| Rule | Where it went |
| --- | --- |
| `HintResult`'s error is a `HintRefusal`, and no game can return a sentence it typed | spec: A hint refusal SHALL be one of the collection's own |
| The situations the set distinguishes, and that the help teaches two of them as a pair | spec: The refusals distinguish the situations a player must tell apart |
| Every refusal says whether it is a dead end, in a table typed over every kind, held to its sentence | spec: Every refusal says whether it is a dead end |
| Which kinds are dead ends and which are not | spec: The refusal kinds' dead-end verdicts |
| That list of kinds is complete | untrue: `HintRefusal` in `src/engine/hint-refusal.ts` also holds `SOLUTION_UNKNOWN`, a game ID that came without its solution, and the table calls it not a dead end. The list now names it |
| The escapes are for a dead end one puzzle has, are dead ends by construction, and a sentence two games pass becomes a kind | spec: An escape names a dead end only one puzzle has |
| The conformance check finds the escapes' calls by shape, reads templates with holes, and fails an unreadable or non-undo sentence | spec: The conformance check reads every escape call |
| Scenario: two games refuse for the same reason | spec: A hint refusal SHALL be one of the collection's own |
| Scenario: a new phrasing cannot arrive unnoticed | spec: A hint refusal SHALL be one of the collection's own |
| Scenario: a game's own dead end shared by a second game | spec: An escape names a dead end only one puzzle has |
| Scenario: a kind spelled out through the escape | spec: The conformance check reads every escape call |
| Scenario: a board inconsistent with nothing to highlight | spec: The refusals distinguish the situations a player must tell apart |
| Scenario: a kind whose verdict disagrees with its advice | spec: Every refusal says whether it is a dead end |

## The check asks the hint whether a position is a dead end

| Rule | Where it went |
| --- | --- |
| `check()` asks `findMistakes` first, then the hint for its verdict without showing one, and reports dead end, out of reach or sound | spec: The check asks the hint whether a position is a dead end |
| A solved board and one a stored plan leads on from cost no hint, and the verdict crosses the worker boundary, not the marks | spec: A check computes a hint only where the answer is not known |
| Scenario: a dead end findMistakes cannot see | spec: The check asks the hint whether a position is a dead end |
| Scenario: past the search's reach | spec: The check asks the hint whether a position is a dead end |
| Scenario: a sound board shows no hint | spec: The check asks the hint whether a position is a dead end |

## A dead end may mark its cause

| Rule | Where it went |
| --- | --- |
| `markedDeadEnd(words)` is a dead end whose references name its cause, passed to `redraw` as `deadEnd`, never with a step, and cleared with the mistake overlay | spec: A dead end may mark its cause |
| The binding walk holds a marked dead end's words to the frame | spec: The binding walk holds a marked dead end to its frame |
| Scenario: a cut-off peg is outlined | spec: A dead end may mark its cause |
| Scenario: a renderer that ignores the dead end | spec: The binding walk holds a marked dead end to its frame |

## A hint step's words SHALL be built from their parts

| Rule | Where it went |
| --- | --- |
| A step's words are a `Sentence`, made only by `sentence`, `so` and `unshaped`, from its parts | spec: A hint step's words SHALL be built from their parts |
| The engine writes the joining words, one fixed form per relation | spec: The engine writes the words that join a sentence's parts |
| The owner and the date the forms were fixed | history |
| A subgoal prefixes any form, and the serves form | spec: A subgoal prefixes any form of sentence |
| A step that cannot take the parts is a declared exception of one of three kinds, each checked by the walk | spec: A step that cannot take the parts is a declared exception |
| In a searching game a forced step says its rivals were judged lost | spec: A forced step in a searching game says its rivals lost |
| A step's words can leave the move to the board through `MOVE` | spec: A step's words can leave the move to the board |
| Scenario: a forced deduction joins its parts with "so" | spec: The engine writes the words that join a sentence's parts |
| Scenario: a move that is one of several is not concluded with "so" | spec: The engine writes the words that join a sentence's parts; spec: A forced step in a searching game says its rivals lost |
| Scenario: an exception is declared and checked | spec: A step that cannot take the parts is a declared exception |
| Scenario: only a forced step is held to the necessity voice | spec: The necessity-voice rule applies to every hinting game not ledgered as narrating moves |
| Scenario: words cannot skip the parts | spec: A hint step's words SHALL be built from their parts |
| Scenario: a move left to the board is still bound | spec: A step's words can leave the move to the board |

## A searched move's rivals SHALL be judged through the engine

| Rule | Where it went |
| --- | --- |
| The engine provides `judgeRivals`, returning the verdicts, the claim and its relation, and the judge, the rivals and the unsettled wording stay the game's | spec: A searched move's rivals SHALL be judged through the engine |
| The "so" relation over rivals is made only by `judgeRivals`, when every rival was lost or there was none | spec: Only judgeRivals concludes a searched move with so |
| Scenario: only a judging that lost every rival says "so" | spec: Only judgeRivals concludes a searched move with so |
| Scenario: an unsettled rival is not claimed | spec: A searched move's rivals SHALL be judged through the engine |
| Scenario: one allowance is shared | spec: A searched move's rivals SHALL be judged through the engine |

## A hint step SHALL name the rung it speaks

| Rule | Where it went |
| --- | --- |
| Every step carries `rung`, every hinted game declares `hintRungs`, a step's rung is in its game's list, and the types hold a stamp to the list | spec: A hint step SHALL name the rung it speaks |
| A rung is the deduction at the grain the game names it, legs share a rung, two wordings are one rung, and a rung id is not player-facing | spec: A rung is the deduction at the grain the game names it |
| Whatever asks which deduction a step is reads `rung`, and a test stays free to assert a sentence where the wording is under test | spec: Whatever asks which deduction a step is reads its rung |
| The candidate walk stamps its steps, a game on it writes its list and no stamp, and a placement narrating another reason says which | spec: The candidate walk stamps the steps it builds |
| A list holds only the rungs of the readings its plan walks, and a populate-only plan's step type lacks the two it cannot speak | spec: A rung list holds only the rungs of the readings its plan walks |
| Until this a list said more than its game did, and Salad's tests excused the two | history |
| The setup is the declaration, what compiles with and without one, and the walk throwing on a single off a cell with no notes | spec: A plan's setup declares the reading it walks |
| Scenario: a reason kind missing from the list | spec: A hint step SHALL name the rung it speaks |
| Scenario: a hinted game without a list | spec: A hint step SHALL name the rung it speaks |
| Scenario: a step of a rung the list lacks | spec: A hint step SHALL name the rung it speaks |
| Scenario: a candidate game writes no stamp | spec: The candidate walk stamps the steps it builds |
| Scenario: a sentence of another reason | spec: The candidate walk stamps the steps it builds |
| Scenario: a plan on the populate reading alone | spec: A rung list holds only the rungs of the readings its plan walks; spec: A plan's setup declares the reading it walks |
