# Ledger: ascent

Base: 176780d0

Where every rule of Ascent's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Ascent game implements the Game interface

| Rule | Where it went |
| --- | --- |
| `src/games/ascent/` implements `Game` and is registered | spec: Ascent is solved by one path through every number |
| The parameters, and what validation requires of width, height, Hexagon and a 2×2 Edges grid | spec: Ascent's parameters |
| Validation forbids an Edges difficulty below Normal and symmetrical clues in Edges | spec: Each ruleset declares what it offers |
| "Matching upstream" | history |
| A game ID encodes every parameter and round-trips | spec: Ascent's parameters |
| It implements `findMistakes` and an explained hint | spec: Ascent is solved by one path through every number |
| Scenario: every preset produces a uniquely soluble board | spec: Ascent's generator keeps every board soluble at its tier |
| Scenario: a game ID round-trips | spec: Ascent's parameters |

## Ascent descriptions use the upstream run-length encoding

| Rule | Where it went |
| --- | --- |
| The run-length encoding of numbers, empty runs and wall runs | spec: Ascent descriptions use the upstream run-length encoding |
| Edges arrows are numbers on the border ring, tagged on decode | spec: Ascent descriptions use the upstream run-length encoding |
| The physical grid is the size adjusted for the mode | spec: A description is validated against the physical grid |
| Validation rejects too high a number and tells too few cells from too many | spec: A description is validated against the physical grid |
| Scenario: a generated description round-trips | spec: Ascent descriptions use the upstream run-length encoding |
| Scenario: the wrong number of cells is rejected | spec: A description is validated against the physical grid |

## Ascent input, movement and completion

| Rule | Where it went |
| --- | --- |
| Three ways to enter a number, and the arrow keys and Enter emulate clicks | spec: Ascent places a number three ways |
| A path is drawn by left-drag, erased by right-click or right-drag, and resolves into numbers | spec: Ascent draws and erases a path |
| Entry state lives on the UI, and an input that changes nothing adds no history | spec: Ascent's moves are a union, and entry state is the UI's |
| A move is a discriminated union, and placing on a given is rejected | spec: Ascent's moves are a union, and entry state is the UI's |
| The union has four arms | untrue: `AscentMove` in `src/games/ascent/state.ts` has a fifth, `places`, for a hint's whole run |
| The game is complete on one path through every cell with every arrow satisfied | spec: Ascent is solved by one path through every number |
| `findMistakes` re-solves and flags what contradicts the completion, apart from in-play shading | spec: findMistakes compares the board with its one solution |
| What rendering draws, the completion flash, and no animation | spec: What Ascent draws |
| Scenario: placing the next number along the path | spec: Ascent places a number three ways |
| Scenario: a wrong number is reported as a mistake | spec: findMistakes compares the board with its one solution |
| Scenario: completing the path wins | spec: Ascent is solved by one path through every number |

## Ascent grades its difficulty tiers honestly

| Rule | Where it went |
| --- | --- |
| A board above Easy is not soluble at the tier below, in any mode | spec: Ascent grades its difficulty tiers honestly |
| Upstream has no gate, and 7 of 22 fixture boards and 56 of 180 fresh ones fell a tier | history; figure |
| The correction changes every description above Easy | history |
| The generation loop is bounded | spec: Ascent's generator keeps every board soluble at its tier |
| The probe runs on scratch state carrying nothing from an earlier candidate | spec: Ascent grades its difficulty tiers honestly |
| Why: the scratch keeps a flag that weakens the solver | spec: Ascent grades its difficulty tiers honestly; guide: docs/games/solver-and-generator.md § "The difficulty contract" |
| Scenario: a board above Easy needs its own tier | spec: Ascent grades its difficulty tiers honestly |
| Scenario: the probe is not weakened by the candidate before it | spec: Ascent grades its difficulty tiers honestly |

## Ascent acts on a pointer button, not on a pointer coordinate

| Rule | Where it went |
| --- | --- |
| `interpretMove` enters its board arm only for a pointer button | spec: Ascent acts on a pointer button, not on a pointer coordinate |
| What upstream did, and which shortcuts and guards it broke here | history; reason |
| The `UI_UPDATE` tail is kept, and what it repaints | spec: The UI_UPDATE tail of interpretMove is kept |
| Narrowing the tail by comparing UI state is not the remedy | spec: The UI_UPDATE tail of interpretMove is kept |
| A right-click clears a number or a line, so Ascent does not declare `ignoresSecondaryButton` | spec: Ascent draws and erases a path |
| The scope note on which guards the change restored | history |
| Scenario: a key that is not a pointer button is declined | spec: Ascent acts on a pointer button, not on a pointer coordinate |
| Scenario: a typed number still commits on a cursor move or a click | spec: Ascent acts on a pointer button, not on a pointer coordinate |

## Ascent solves with a four-tier deductive solver

| Rule | Where it went |
| --- | --- |
| The solver finds the unique completion or reports that it cannot | spec: Ascent solves with a four-tier deductive solver |
| A fixpoint gated by difficulty, with what each tier adds | spec: Ascent solves with a four-tier deductive solver |
| It never guesses or backtracks | spec: Ascent solves with a four-tier deductive solver |
| The generator: backbite, clue removal or the Edges matching, retrying until soluble | spec: Ascent's generator keeps every board soluble at its tier |
| Generation from a seed is reproducible | spec: Ascent's generator keeps every board soluble at its tier |
| Scenario: a graded board is solved only at its difficulty | spec: Ascent solves with a four-tier deductive solver |
| Scenario: generation is reproducible from a seed | spec: Ascent's generator keeps every board soluble at its tier |

## Ascent's square grids turn and its hexagonal grids do not

| Rule | Where it went |
| --- | --- |
| The presets' sizes, `transposeParams`, and Hexagon recorded as wide by nature | spec: Ascent's square grids turn and its hexagonal grids do not |
| The presets are upstream's turned, and 6×8 is nearest to upstream's 7×6 | history |
| A square-grid preset is 8×10 | untrue: `BOARDS` in `src/games/ascent/index.ts` holds one board a ruleset, 6×7 for Orthogonal and Classic and 5×5 for Edges, since the rulesets were split |
| Scenario: a hexagonal board is never turned | spec: Ascent's square grids turn and its hexagonal grids do not |

## Ascent explains the next number

| Rule | Where it went |
| --- | --- |
| A step places one number from facts on the board, rebuilt through the solver's rungs, reading no drawn line | spec: Ascent explains the next number |
| Every step places exactly one number | untrue: a whole-run step places several, as "Ascent's hint places a run with one route in one step" requires, so the two are stated together |
| The techniques, easiest first, and no step above the board's tier | spec: Ascent's hint techniques stay within the board's tier |
| One sentence of at most 120 characters, the ring, the outlines, the striped arrow line | spec: A hint step says why in one sentence and marks what it reads |
| A square only one run can reach says why in words, or names the run and stripes its reach | spec: A square only one run can reach names the close rival; spec: Several close rivals give way to the counts, or to the run's reach |
| A step whose move fills more than its own square ends the plan | spec: A hint step says why in one sentence and marks what it reads |
| The hint refuses on a solved board and while `findMistakes` reports anything | spec: Ascent explains the next number |
| A step is followed by placing its number by any gesture | spec: Ascent explains the next number |
| Scenario: following the hint finishes the board | spec: Ascent explains the next number |
| Scenario: a dead end names the path's end | spec: Ascent's hint techniques stay within the board's tier |
| Scenario: a step stays within the board's tier | spec: Ascent's hint techniques stay within the board's tier |
| Scenario: a square only one run can reach shows that run's reach | spec: Several close rivals give way to the counts, or to the run's reach |

## Ascent's solver treats the last number like any other

| Rule | Where it went |
| --- | --- |
| Reach, `overlap` and placement apply to the last number as to any other | spec: Ascent's solver treats the last number like any other |
| Upstream stopped one short in each place | history |
| Both scenarios | spec: Ascent's solver treats the last number like any other |

## Ascent's hint follows a run and names the close rival

| Rule | Where it went |
| --- | --- |
| The plan follows a run with the same techniques and presents it as one journey the cap does not split | spec: Ascent's hint follows a run |
| The one close rival, or none, is named with the counts | spec: A square only one run can reach names the close rival |
| Past 120 characters or several rivals: the counts, outlining only their ends | spec: Several close rivals give way to the counts, or to the run's reach |
| Otherwise the run's reach is striped | spec: Several close rivals give way to the counts, or to the run's reach |
| Scenario: a forced run arrives as one hint | spec: Ascent's hint follows a run |
| Scenario: the one close rival is named | spec: A square only one run can reach names the close rival |
| Scenario: several close rivals give way to the counts | spec: Several close rivals give way to the counts, or to the run's reach |

## Ascent always offers a number beside the one selected

| Rule | Where it went |
| --- | --- |
| Which number a selected one offers, and the right-click cycling the two | spec: Ascent always offers a number beside the one selected |
| The second and third tap, each acting on the release | spec: A second tap on the selected number offers the one before |
| Scenario: a number with neither neighbor placed | spec: Ascent always offers a number beside the one selected |
| Scenario: tapping the selected number again | spec: A second tap on the selected number offers the one before |

## Ascent's hint places a run with one route in one step

| Rule | Where it went |
| --- | --- |
| The three ways a run has one route, and the routes are counted | spec: Ascent's hint places a run with one route in one step |
| The sentence, the route line, the rings and the stripes | spec: A whole-run step draws its route and shrinks as it is followed |
| A player placing one number at a time stays on the step | spec: A whole-run step draws its route and shrinks as it is followed |
| Every sentence names a run by its placed ends | spec: A whole-run step draws its route and shrinks as it is followed |
| Scenario: a run with one route | spec: A whole-run step draws its route and shrinks as it is followed |
| Scenario: a run with two routes | spec: Ascent's hint places a run with one route in one step |
| Scenario: only one route leaves a neighbor room | spec: Ascent's hint places a run with one route in one step |

## Ascent's hint names only numbers the player can see

| Rule | Where it went |
| --- | --- |
| The whole requirement and its scenario | spec: Ascent's hint names only numbers the player can see |

## Ascent's hint reads the arrows' lines in Edges mode

| Rule | Where it went |
| --- | --- |
| `lines`: when it places a number, its tier and its place in the order | spec: Ascent's hint reads the arrows' lines in Edges mode |
| The `lines` sentence, outlines and stripes | spec: A lines step names every premise it needs |
| `pointers`: when it places a number, and its tiers | spec: Ascent's Edges hint asks which arrow pointing at a square still fits |
| The `pointers` sentence, outlines and stripes | spec: A pointers step names the numbers it rules out |
| Neither technique changes a hint in another mode | spec: Ascent's hint reads the arrows' lines in Edges mode |
| Scenario: three arrows single out a square | spec: Ascent's hint reads the arrows' lines in Edges mode |
| Scenario: only one arrow pointing at a square still fits | spec: Ascent's Edges hint asks which arrow pointing at a square still fits; spec: A pointers step names the numbers it rules out |
| Scenario: the other modes keep their hints | spec: Ascent's hint reads the arrows' lines in Edges mode |

## Ascent's Edges hint names a number's own line by its shape

| Rule | Where it went |
| --- | --- |
| The whole requirement and its scenario | spec: Ascent's Edges hint names a number's own line by its shape |

## Ascent's Edges hint says when the arrows fix a run's route

| Rule | Where it went |
| --- | --- |
| The whole requirement and its scenario | spec: Ascent's Edges hint says when the arrows fix a run's route |

## Ascent offers a number keypad

| Rule | Where it went |
| --- | --- |
| The keypad, Clear, and why a touch player needs it | spec: Ascent offers a number keypad |
| Scenario: a missing number is written by taps and the keypad alone | spec: Ascent offers a number keypad |

## Ascent draws its cells on a quiet surface and lifts a given

| Rule | Where it went |
| --- | --- |
| The cell surface, the lifted given, ink and entry color, the outline, the wall and the margin | spec: Ascent draws its cells on a quiet surface and lifts a given |
| The board's path in the strong gray line, the end discs and the player's path | spec: The board's own path stands off both surfaces |
| The selection wash and the goal wash, each told from the cells round it | spec: The held cell and its targets take washes of their own |
| The offered number's color | spec: An offered number is drawn as a pencil mark |
| Scenario: a target in the dark scheme | spec: The held cell and its targets take washes of their own |
| Scenario: an offered number on a dark cell | spec: An offered number is drawn as a pencil mark |
| Scenarios: a given told by its cell, and the quiet grid | spec: Ascent draws its cells on a quiet surface and lifts a given |
| Scenario: the board's own path reads on both surfaces | spec: The board's own path stands off both surfaces |

## Ascent's rulesets are told apart by a square's neighbors

| Rule | Where it went |
| --- | --- |
| The four rulesets, the dialog's two fields and the unchanged encoding | spec: Ascent's rulesets are told apart by a square's neighbors |
| `Ruleset.only`, and `validateParams` writes no refusal for it | spec: Each ruleset declares what it offers |
| The Type menu's sections and the default | spec: The Type menu has a section for each ruleset |
| Scenario: the menu's sections | spec: The Type menu has a section for each ruleset |
| Scenario: Hex is chosen in the dialog | spec: Ascent's rulesets are told apart by a square's neighbors |
| Scenario: a ruleset asked for on a shape it does not have | spec: Each ruleset declares what it offers |
| Scenario: a game ID from before the rulesets were split | spec: Ascent's rulesets are told apart by a square's neighbors |

## A square's corners are cut where the path may step diagonally

| Rule | Where it went |
| --- | --- |
| The whole requirement and its scenario | spec: A square's corners are cut where the path may step diagonally |
