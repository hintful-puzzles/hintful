# Ledger: slide

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Slide game implements the Game interface

| Rule | Where it went |
| --- | --- |
| `src/games/slide/` implements `Game` for Slide and is registered | spec: Slide game implements the Game interface |
| Parameters are a width, a height and `maxmoves`, negative meaning no limit | spec: Slide game implements the Game interface |
| A game ID encodes width, height and limit and round-trips | spec: Slide game implements the Game interface |
| Width at least 5 and at most 251, height at least 4, which the engine refuses from the `paramConfig` bounds and `validateParams` does not | spec: Slide bounds its width, its height and its limit |
| Those bounds match upstream | history |
| Upstream accepts the two parameter sets that are additionally rejected | history |
| Each is rejected because the generator provably cannot satisfy it | spec: Slide bounds its width, its height and its limit; spec: A Slide board too large to generate is rejected |
| A cell count over a documented bound is rejected, since generation exhausts the heap past it and does not merely run slowly | spec: A Slide board too large to generate is rejected |
| The bound is at least the largest shipped preset, and its measurements are recorded with it | spec: A Slide board too large to generate is rejected |
| A solution-length limit of zero is rejected, since it asks for a board that starts finished | spec: Slide bounds its width, its height and its limit |
| No `findMistakes` hook, because every reachable board is legal | spec: Slide declares no findMistakes hook |
| Scenario: every preset produces a soluble board | spec: Slide game implements the Game interface |
| Scenario: a game ID round-trips through the parameters | spec: Slide game implements the Game interface |
| Scenario: a board too large to generate is rejected with a reason | spec: A Slide board too large to generate is rejected |

## Slide descriptions use the upstream run-length block encoding

| Rule | Where it went |
| --- | --- |
| Canonical left-to-right, top-to-bottom order, each square an anchor, the main anchor, a back-link, empty or a wall, with a forcefield prefix marker | spec: Slide descriptions use the upstream run-length block encoding |
| Runs of identical squares MAY be abbreviated with a count | spec: Slide descriptions use the upstream run-length block encoding |
| A run of identical back-links can be abbreviated with a count like any other run | untrue: `parseDesc` and `encodeDesc` in `src/games/slide/state.ts` read and write each back-link as its own `d<dist>` with no count, the digits after `d` being the distance, so the requirement excepts back-links |
| Ends with the target coordinates and optionally the minimum move count | spec: Slide descriptions use the upstream run-length block encoding |
| Rejected: wrong number of squares, other than one main piece, an out-of-range or dangling back-reference, an unknown character, missing target coordinates | spec: A malformed Slide description is rejected |
| The message for too many squares differs from the one for too few | spec: A malformed Slide description is rejected |
| Too few squares always reads as its own "too little" message | untrue: `parseDesc` in `src/games/slide/state.ts` gives the too-short message only where the text ends early, and where the tail follows a short board it names the comma as a character that cannot stand there, so the requirement states both |
| Scenario: a generated description round-trips | spec: Slide descriptions use the upstream run-length block encoding |
| Scenario: a description with the wrong number of squares is rejected | spec: A malformed Slide description is rejected |

## Slide input, movement and completion

| Rule | Where it went |
| --- | --- |
| Played by grab, drag and release, with the reachable set computed on the grab, the drag snapping to the nearest reachable cell, and the release moving the block or doing nothing | spec: A Slide block is moved by grab, drag and release |
| Only the main block passes a forcefield cell | spec: Only the main block passes a forcefield cell |
| Moving the same block again does not increment the count, and returning it decrements it | spec: A multi-step slide of one block counts as one move |
| Solve plays a shortest route from the current position, so the board is finished | spec: Solve plays a shortest route from the current position |
| A drag left in progress across a state change is canceled, so no frame previews a block against a board it no longer fits | spec: A grab is dropped when the board changes under it |
| Each block is drawn with beveled highlights | spec: Slide draws a held block where it would land, with no slide animation |
| The dragged block follows the pointer, with a landing shadow at its snapped destination | untrue: `redraw` in `src/games/slide/render.ts` simulates the release and draws the held block itself, lit up, at its snapped cell, and there is no block at the pointer and no separate shadow |
| A flash on completion | spec: Bringing the main block to the target completes the board |
| No interpolated sliding animation | spec: Slide draws a held block where it would land, with no slide animation |
| Scenario: dragging a block to a reachable space moves it | spec: A Slide block is moved by grab, drag and release |
| Scenario: bringing the main block to the target wins | spec: Bringing the main block to the target completes the board |
| Scenario: releasing a block where it started does nothing | spec: A Slide block is moved by grab, drag and release |

## Slide solves for a shortest path and keeps every board soluble

| Rule | Where it went |
| --- | --- |
| A solver finds the minimum number of moves or reports none, by breadth-first search over canonical layouts with exact deduplication and first-in-first-out expansion | spec: Slide's solver finds a shortest path by breadth-first search |
| The solver abandons the search once every remaining candidate exceeds the move limit | spec: Slide's solver respects a move limit |
| The solver does not depend on ordered-collection semantics, only on breadth-first order and exact deduplication | spec: Slide's solver does not depend on an ordered collection |
| The ordered collection in question is upstream's `tree234` | history; guide: docs/games/engine-catalog.md § "`sorted-multiset.ts` — `tree234`, idiomatically" |
| The generator removes singletons until soluble, then merges adjacent blocks in a randomized order while the board stays soluble | spec: Slide's generator keeps every board soluble |
| Generation from a seed is reproducible | spec: Slide's generator keeps every board soluble |
| Solubility is tested after the final singleton removal as well as before each one, and the added check draws no randomness | spec: The generator tests solubility after its final singleton removal |
| Upstream tests only before, and aborts on a board soluble only after its last singleton goes | history |
| That is every board at the smallest legal size | spec: The generator tests solubility after its final singleton removal |
| Scenario: the solver returns the shortest solution | spec: Slide's solver finds a shortest path by breadth-first search |
| Scenario: generation is reproducible from a seed | spec: Slide's generator keeps every board soluble |

## Slide presets draw tall, and a Slide board is never turned

| Rule | Where it went |
| --- | --- |
| The default and presets are 6×7 at limits 40 and 25 and unlimited, and 6×8 unlimited, drawn taller than wide | spec: Slide presets draw tall, and a Slide board is never turned |
| They are upstream's 7×6 and 8×6 turned | history |
| What the 6×8 board costs to generate beside the 8×6 it replaced | figure |
| No `transposeParams`, since a board turned on its side is a different puzzle | spec: Slide presets draw tall, and a Slide board is never turned |
| Scenario: a Slide board is dealt as chosen | spec: Slide presets draw tall, and a Slide board is never turned |

## Slide's board reads by color, not by bevel alone

| Rule | Where it went |
| --- | --- |
| Floor, walls, ordinary blocks and main block are told apart by fill and not solely by bevel, in both presentations | spec: Slide's board reads by color, not by bevel alone |
| Upstream derives all four from one background, which its author calls wishy-washy | history; held: src/engine/color/palette-games.ts "wishy-washy" |
| Each is a function of the host background and not an authored color, so one inversion rule maps all four and their ordering survives the flip | spec: Slide's fills are functions of the host background |
| Only the blue key block and the green exit, the two the help page names, carry a hue, and the others stay neutral | spec: Only the key block and the exit carry a hue |
| The target marker stays the most prominent thing on the board, and "pale" is scheme-relative and not the testable part | spec: The target marker is the most prominent thing on the board |
| The exit marking is legible at the smallest shipped tile size and marks the gate's boundary, not its squares | spec: The exit gate is marked along its boundary |
| Every color comes from the shared palette and is checked in both schemes | spec: Slide's colors come from the shared palette and are checked in both schemes |
| Scenario: the pieces are told apart without relying on bevels | spec: Slide's board reads by color, not by bevel alone |
| Scenario: the ladder inverts as a whole | spec: Slide's fills are functions of the host background |
| Scenario: the exit gate is marked without hiding the exit | spec: The exit gate is marked along its boundary |

## Slide plays from the keyboard alone

| Rule | Where it went |
| --- | --- |
| Playable by keyboard as well as by pointer, both driving the same move machinery | spec: Slide plays from the keyboard alone |
| A cell cursor moves with the cursor keys, clamped to the grid, and is hidden again by any pointer press | spec: A cell cursor moves over the Slide board |
| The cursor is hidden until the first cursor key | untrue: `interpretMove` in `src/games/slide/index.ts` also reveals the cursor on a select key, on an empty square included, so the requirement names both keys |
| Selecting on a block's cell grabs it with the same reachable set the pointer grab computes | spec: The keyboard select grabs with the pointer's grab |
| Selecting again commits, and canceling restores the block | spec: The keyboard select grabs with the pointer's grab |
| One grab implementation, reached from the pointer press and the keyboard select | spec: The keyboard select grabs with the pointer's grab |
| A held block moves one cell per press within its reachable set, and a step out of it is refused | spec: A held block moves one cell per press |
| One cell per press is required, not preferred, since a slide-to-the-end cursor cannot stop inside a corridor | spec: A held block moves one cell per press |
| A keyboard that cannot express a legal move is the defect the requirement removes | spec: Slide plays from the keyboard alone |
| A keyboard journey of several cells is one move, identical to the drag's, and the keyboard is not a second movement model | spec: A keyboard journey produces the one move its drag produces |
| The move count behaves identically for a keyboard move and a drag | spec: A multi-step slide of one block counts as one move; spec: A keyboard journey produces the one move its drag produces |
| A pointer press hides the cursor and, where it grabs no block, puts down what the keyboard held | spec: A pointer press takes the board over |
| A grab is dropped whenever the board changes under it, and the cursor survives | spec: A grab is dropped when the board changes under it |
| The cursor and the grabbed block are shown in both schemes and at the smallest shipped tile size | spec: Slide shows the keyboard cursor and the grabbed block |
| The grabbed block is drawn exactly as the pointer drag draws it | spec: Slide shows the keyboard cursor and the grabbed block |
| The cursor is the mark of keyboard play, rides the grabbed block on its pickup square, and sits beside the content | spec: Slide shows the keyboard cursor and the grabbed block |
| The cursor's color is chosen against the span of materials it can land on, since the ladder inverts between schemes | spec: The cursor's color is chosen against every material it can land on |
| Scenario: a keyboard journey and the equivalent drag produce the same move | spec: A keyboard journey produces the one move its drag produces |
| Scenario: a keyboard move out of the reachable set is refused | spec: A held block moves one cell per press |
| Scenario: canceling a selection restores the block | spec: The keyboard select grabs with the pointer's grab |
| Scenario: a pointer press puts down what the keyboard was holding | spec: A pointer press takes the board over |
| Scenario: a grab dropped by an undo leaves the cursor in place | spec: A grab is dropped when the board changes under it |
| Scenario: a board can be completed without a pointer | spec: Slide plays from the keyboard alone |
