# Ledger: separate

Base: bb004490

Where every rule of Separate's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Separate game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `separate` game implements `Game`, the grid-partition puzzle of `k` letters each occurring `w·h/k` times, divided into connected `k`-ominoes holding one of each letter | spec: Separate game implements the Game interface |
| The five type arguments of `Game` by name | untrue: `separateGame` in `src/games/separate/index.ts` takes eight, adding `SeparateMistake`, `BorderHint` and `SeparateRung`, and the spec now says only `Game` |
| "Block Puzzle" | history |
| Params are `w`, `h` and `k`, positive integers, encoded `{w}x{h}n{k}`, with a bare `{w}` decoding square with `k = w` | spec: Separate's parameters are a size and a letter count |
| `validateParams` rejects a non-positive dimension | untrue: `validateParams` in `src/games/separate/state.ts` checks no sign, and the `bounds: { min: 1 }` its `paramConfig` declares on width, height and letters are what the engine's `paramsError` refuses on, now spec: Separate refuses a letter count the grid cannot be divided by |
| `validateParams` rejects a `k` that does not divide `w·h`, an unreasonably large `w·h`, and under full validation `k` equal to the whole grid | spec: Separate refuses a letter count the grid cannot be divided by |
| The game offers a menu of presets, provides `solve` and `textFormat`, and drives a solve-completion flash | spec: Separate game implements the Game interface |
| Scenario: params round-trip, and a bare `5` decodes square | spec: Separate's parameters are a size and a letter count |
| Scenario: `validateParams` returns an error for a non-positive dimension | untrue: `validateParams({ w: 0, h: 5, k: 5 })` returns null, and the refusal "Width must be at least 1." is the engine's from the declared bound, now a scenario of spec: Separate refuses a letter count the grid cannot be divided by |
| Scenario: a `k` that does not divide `w·h` is rejected | spec: Separate refuses a letter count the grid cannot be divided by |

## Separate descriptions encode the letters grid

| Rule | Where it went |
| --- | --- |
| The desc is the `w·h` letters in row-major order, each `A + grid[i]`, so `k` distinct letters | spec: Separate descriptions encode the letters grid |
| "Exactly as upstream's `new_game_desc` emits" | history |
| A desc of the wrong length or with a character outside `A .. A+k-1` is rejected | spec: Separate descriptions encode the letters grid |
| The rejection is the game's `validateDesc` | untrue: `separateGame` in `src/games/separate/index.ts` declares no `validateDesc`, the engine's `validateDesc` in `src/engine/desc-error.ts` refuses what `newState`'s parse refuses, and the spec now says only that validating a desc rejects it |
| `newState` parses the desc into the immutable letters array and an all-unknown wall state with only the rim walls set | spec: A new Separate board holds its letters and only the rim walls |
| Scenario: a description round-trips | spec: Separate descriptions encode the letters grid |
| Scenario: a malformed description is rejected | spec: Separate descriptions encode the letters grid |

## Separate uses a three-valued wall model with a half-grid cursor

| Rule | Where it went |
| --- | --- |
| The player divides the grid by toggling edges, each three-valued and shared between two cells so every edit records both sides | spec: Separate uses a three-valued wall model with a half-grid cursor |
| "Exactly as Palisade" | spec: Separate shares its border-marking mechanic rather than owning a copy |
| A left click cycles the nearest edge between wall and unknown, a right click between no-wall mark and unknown | spec: Each button toggles the nearest edge toward its own state |
| The half-grid cursor in `[1, 2w-1] × [1, 2h-1]` moves with the arrow keys and sets its edge with select and select2 | spec: Separate uses a three-valued wall model with a half-grid cursor |
| Toggling a grid-rim wall is rejected, and a move that changes nothing returns `null` with no history entry | spec: The grid rim cannot be edited |
| Scenario: clicking an interior edge toggles a wall on both sides | spec: Separate uses a three-valued wall model with a half-grid cursor |
| Scenario: rim walls cannot be toggled | spec: The grid rim cannot be edited |

## Separate is solved when every region is a one-of-each k-omino

| Rule | Where it went |
| --- | --- |
| Solved iff the walls divide the grid into components of exactly `k` cells, each holding each letter once, with no wall interior to a component, and `status` reports it | spec: Separate is solved when every region is a one-of-each k-omino |
| Scenario: a correct partition is solved | spec: Separate is solved when every region is a one-of-each k-omino |
| Scenario: a duplicate-letter region is not solved | spec: Separate is solved when every region is a one-of-each k-omino |

## Separate ports the DSF solver and gates generation on it

| Rule | Where it went |
| --- | --- |
| The solver deduces over a disjoint-set forest of squares, run to a fixpoint, reporting solved, progressed or stuck | spec: Separate ports the DSF solver and gates generation on it |
| "The upstream `solver_attempt` deductions" | history |
| The two deductions, disconnecting components that share a letter and connecting an under-size component with one way to extend | spec: The ladder's three techniques disconnect, wall and merge |
| The solver has two deductions | untrue: `separateLadder` in `src/games/separate/solver.ts` declares three, with `walled-apart` between them, as the spec's own later requirement says |
| `solve()` runs the solver to the unique partition, returns a move walling every edge between two components, and reports failure on a board not uniquely deducible | spec: The Solve command draws the unique partition's walls |
| The generator builds a partition with `divvyRectangle`, refills each omino with shuffled letters respecting the squares the solver depended on, and re-solves | spec: The generator refills one partition's letters until the solver solves it |
| A board is kept only when the solver fully solves it, so every generated board is uniquely solvable by the solver | spec: Separate ports the DSF solver and gates generation on it |
| All RNG draws go through the engine's random state | spec: The generator refills one partition's letters until the solver solves it |
| The random state is "bit-identical" to upstream's | history |
| Scenario: generated boards are uniquely solvable | spec: Separate ports the DSF solver and gates generation on it |
| Scenario: Solve draws the unique partition's walls | spec: The Solve command draws the unique partition's walls |

## Separate shades completed correct regions

| Rule | Where it went |
| --- | --- |
| A completed, correct region fills with `REGION_DONE`, the untouched board is not filled, and the fill is a local check and not a check against the solution | spec: Separate shades completed correct regions |
| "As in Rectangles" and the feedback Galaxies and Rectangles give | reason |
| The valid overlay is part of the render cache diff key, so it appears and clears with the regions | spec: Separate's finished-region fill follows the board |
| Scenario: a completed region is shaded, the rest is not | spec: Separate shades completed correct regions |
| The scenario names the fill `COL_CORRECT` | history |

## Separate ships findMistakes for Check & Save

| Rule | Where it went |
| --- | --- |
| `findMistakes` re-solves to the unique partition and returns every edge contradicting it, and returns an empty list on a board not uniquely deducible | spec: Separate ships findMistakes for Check & Save |
| The flagged edges render with a distinct error overlay that is part of the render cache diff key | spec: A flagged mistake reddens its edge on the frame it is found |
| "Playbook §3.2" | history |
| Scenario: a contradicting wall is flagged and renders in the error color | spec: Separate ships findMistakes for Check & Save; spec: A flagged mistake reddens its edge on the frame it is found |

## Separate shares its border-marking mechanic rather than owning a copy

| Rule | Where it went |
| --- | --- |
| The bit vocabulary, direction tables, closest-edge hit test, paired edit and half-cell cursor scheme come from a shared engine module | spec: Separate shares its border-marking mechanic rather than owning a copy |
| The shared tri-state is an "undecided→wall→no-wall cycle" | untrue: `edgeEdits` in `src/engine/border-grid.ts` has no three-step cycle, each button toggles between its own state and undecided and an edge in the other button's state switches straight over, now spec: Each button toggles the nearest edge toward its own state |
| The geometry, the edge rects, the tile skeleton, the cursor and the live error model are shared, and a change to what counts as a wrong wall reaches both games | spec: The border-marking mechanic's look is shared on the same terms |
| Region constraints, solver, generator and clue rendering stay Separate's, and the shared renderer takes palette indices and a callback and does not branch on the game | spec: Separate's clue layer stays its own |
| Adopting the shared module changes no board for a seed and no frame, and sharing the look changes no draw call | spec: Sharing the mechanic changes no board and no frame |
| "Tier-2.5" as the snapshot's name, and `vitest -u` | history |
| Scenario: the shared mechanic is adopted without moving a board | spec: Sharing the mechanic changes no board and no frame |
| Scenario: each game constructs its own `Move`, because a shared move type would couple two save formats | spec: The games' move formats stay independent |
| Scenario: a game adopting the input mechanic and not the renderer fails the build, with its reason | spec: A game adopting the border-grid input adopts its look |

## Separate runs its solver as a declared ladder that its hint shares

| Rule | Where it went |
| --- | --- |
| The solver runs on `runDeductionFixpoint` as three tier-0 techniques in order, on a working state that carries the same facts as border-grid bytes | spec: Separate runs its solver as a declared ladder that its hint shares |
| What `shared-letter`, `walled-apart` and `only-way` each do | spec: The ladder's three techniques disconnect, wall and merge |
| The ladder generates exactly the frozen boards, a firing census asserts every technique fires, and no hand-written loop is kept | spec: The ladder deals the frozen boards and every technique fires |
| The boards are "upstream's loop's", the loop is one "the ladder replaced", and "git holds it" | history |
| Scenario: the ladder moves no board | spec: The ladder deals the frozen boards and every technique fires |

## Separate offers a deduction-based hint

| Rule | Where it went |
| --- | --- |
| `hint()` is seeded from the player's marks and returns one multi-leg journey per firing, each leg setting one edge | spec: Separate offers a deduction-based hint |
| `hint()` refuses on a solved board and on a board carrying a mistake | untrue: `hint` in `src/games/separate/index.ts` checks neither, and `ALREADY_SOLVED` and `FIX_MISTAKES_FIRST` are returned by `src/engine/midend.ts` before it calls the game, now spec: A hint is refused on a solved, mistaken or unsolvable board |
| `hint()` refuses on a board its solver cannot finish from empty | spec: A hint is refused on a solved, mistaken or unsolvable board |
| Every sentence rests only on letters, walls and regions joined by the player's marks | spec: A hint sentence rests on the player's own marks |
| Two regions are told apart as one hatched and one outlined, in every step that cites two | untrue: `evidence` in `src/games/separate/index.ts` outlines both of two lone squares of a shared-letter firing, and `say.sharedLetter` in `src/games/separate/hint-text.ts` names a lone square by its letter and not by a mark, so those are the rule's exceptions, the mark is `stripes` and the word "striped", now spec: A hint sentence rests on the player's own marks |
| A lone square is named by its letter, in every sentence | untrue: `say.walledApart` in `src/games/separate/hint-text.ts` calls a lone square a striped or outlined region, and `say.basis` does the same in a later leg, so only the first sentence of a shared-letter or only-way firing names it by its letter, now spec: A hint sentence rests on the player's own marks |
| Scenario: the hint finishes from the player's own positions | spec: Separate offers a deduction-based hint |
| Scenario: two regions are named by their marks | spec: A hint sentence rests on the player's own marks |

## Border-grid games share the hint's notation layer

| Rule | Where it went |
| --- | --- |
| The hint highlight, journey, keep-track verdict, per-tile flags, region and square drawing and later-leg sentence come from the engine, each game keeps its deduction, sentences and `Move`, and no Palisade frame changes | spec: Border-grid games share the hint's notation layer |
| Scenario: Palisade's hint frames survive the extraction | spec: Border-grid games share the hint's notation layer |
| `vitest -u` | history |

## Separate draws its cells on the collection's quiet surface

| Rule | Where it went |
| --- | --- |
| Every cell's body is the cell surface with its letter in ink, no cell is lifted as a given, and the edges keep their own roles | spec: Separate draws its cells on the collection's quiet surface |
| A completed correct region fills with the shared finished-region role, a wash of the theme pair's first hue | spec: Separate shades completed correct regions |
| The solved flash lifts every cell to the given's surface on its lit beats | spec: The solved flash lifts every cell |
| Scenario: every cell is the same surface | spec: Separate draws its cells on the collection's quiet surface |
| Scenario: the flash lifts the cells | spec: The solved flash lifts every cell |
