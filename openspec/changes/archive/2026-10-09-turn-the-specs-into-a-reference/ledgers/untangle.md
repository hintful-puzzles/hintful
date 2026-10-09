# Ledger: untangle

Base: bb004490

Where every rule of Untangle's spec went in the reference form.

## Untangle game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `untangle` game implements `Game`, a planar graph solved when no two edges cross | spec: Untangle game implements the Game interface |
| Params are `{ n }` encoded as the integer, with presets 6, 10, 15, 20 and 25 and default 10 | spec: Untangle's params are a vertex count |
| The presets are upstream's | history |
| `validateParams` rejects `n < 4` and an unreasonably large `n` | untrue: the game has no `validateParams`. `paramConfig` in `src/games/untangle/index.ts` declares `bounds: { min: 4, max: MAX_POINTS }` on the `n` field and the engine's `paramsError` in `src/engine/params.ts` refuses outside them |
| An `n` under 4 or unreasonably large is refused | spec: Untangle's params are a vertex count; spec engine-params: A rule that a game rejects params is met by the engine's check |
| It provides `solve` and a `hint` hook | spec: Untangle game implements the Game interface |
| It provides no `statusbarText`, `textFormat` or `findMistakes` | spec: Untangle game implements the Game interface |
| No status bar is faithful to upstream, and upstream's text format is only in the excluded editor build | history |
| Crossed edges are the built-in mistake feedback | spec: Untangle game implements the Game interface |
| Scenario: params round-trip | spec: Untangle's params are a vertex count |
| Scenario: invalid params are rejected | spec: Untangle's params are a vertex count |

## Generation yields a planar graph drawn tangled

| Rule | Where it went |
| --- | --- |
| `newDesc` builds a planar graph greedily, lowest degree first, degree capped at 4, and lays it on a shuffled circle re-rolled until an edge pair crosses | spec: Generation yields a planar graph drawn tangled |
| The desc encodes the edges only, as sorted zero-based `a-b` pairs with `a < b` | spec: The Untangle desc encodes the edges only |
| The solved layout is returned as the optional `aux` | spec: The Untangle desc encodes the edges only |
| Scenario: a generated board is planar, degree-capped and starts tangled, and generation terminates | spec: Generation yields a planar graph drawn tangled |
| Scenario: a decoded desc holds no coordinates, and out-of-range and self-loop pairs are rejected | spec: The Untangle desc encodes the edges only |
| Scenario: `validateDesc` accepts every `a-b` in range with `a ≠ b` | untrue: `parseDesc` in `src/games/untangle/state.ts` also refuses an edge named twice, with `DESC_REPEATED` |

## Crossing detection is exact and drives solved status

| Rule | Where it went |
| --- | --- |
| The exact integer crossing test, what counts as a crossing, non-adjacent pairs only, `status`, and the crossing set recomputed on every transition and exposed to `redraw` | spec: Crossing detection is exact and drives solved status |
| Scenario: a board with no crossings is solved | spec: Crossing detection is exact and drives solved status |
| Scenario: adjacent edges are not a crossing | spec: Crossing detection is exact and drives solved status |

## Vertices are dragged by pointer or keyboard

| Rule | Where it went |
| --- | --- |
| A pointer press near a vertex begins a drag, motion previews it as a `UI_UPDATE`, release commits a move | spec: Vertices are dragged by pointer or keyboard |
| The drag target is clamped to the playable area, previewed pinned and committed there | spec: A drag is clamped to the playable area |
| A deliberate divergence from upstream's drag-off-to-cancel, which the owner chose | history |
| A drag off the board does not cancel | spec: A drag is clamped to the playable area |
| The clamp subsumes integer rounding of fractional pointer input | spec: A drag is clamped to the playable area |
| Keyboard control selects the nearest vertex in a direction, begins and ends a drag, nudges and cycles | spec: The keyboard selects, holds, nudges and cycles a vertex |
| `executeMove` applies the placements, recomputes crossings, and throws on a malformed move, a non-integer coordinate included | spec: executeMove places vertices and refuses a malformed move |
| The move is structured-clone-safe with the default serialize and deserialize | spec: executeMove places vertices and refuses a malformed move |
| The editor-only edge add and delete moves are not mapped | spec: Vertices are dragged by pointer or keyboard |
| Scenario: a drag moves one vertex and updates crossings | spec: Vertices are dragged by pointer or keyboard |
| Scenario: a drag released outside the play area clamps and commits | spec: A drag is clamped to the playable area |
| Scenario: a saved game reloads to the same layout through the move log, requiring no `supersede_desc` mechanism | spec: The layout is restored by replaying the move log |

## Rendering frames the play area and colors roles distinctly

| Rule | Where it went |
| --- | --- |
| A visible border round the playable area, edges red when crossed and the preference is on and ink otherwise, vertices as blobs or index numbers in a fixed z-order, red reserved for crossings | spec: Rendering frames the play area and colors roles distinctly |
| A vertex is the pair's second color and a dragged vertex's neighbor the first, the dragged vertex the picked-up color, the cursor vertex the cursor color, the two never together, and the hint the hint color | spec: A vertex's color says its role |
| Scenario: crossed edges and a dragged vertex's neighbors are visually distinct | spec: Rendering frames the play area and colors roles distinctly |

## Solve untangles any planar board, with or without aux

| Rule | Where it went |
| --- | --- |
| `solve` returns one move placing every vertex crossing-free, in the symmetry with the most vertices in place and then the least motion | spec: Solve untangles any planar board, with or without aux |
| The layout is the `aux` scaled to fill the play box, else one computed from the edges alone | spec: The solved layout is exact and checked |
| Every layout is exact rationals, checked crossing-free with the game's exact test before use | spec: The solved layout is exact and checked |
| `solve` refuses only a non-planar graph, animates, and is marked solved-with-help | spec: Solve untangles any planar board, with or without aux |
| Scenario: Solve from a fresh game lands crossing-free | spec: Solve untangles any planar board, with or without aux |
| Scenario: Solve works on a loaded game | spec: Solve untangles any planar board, with or without aux |
| Scenario: Solve refuses a non-planar graph | spec: Solve untangles any planar board, with or without aux |

## Untangle hints move the point that removes the most crossings

| Rule | Where it went |
| --- | --- |
| The game implements `hint`, each step moves one vertex, and is a journey's leg or else a clearing or a placing step | spec: Untangle hints move the point that removes the most crossings |
| Clearing: an unplaced vertex moved to the spot that removes the most crossings among a grid, its place in the solved layout and its neighbors' centroid | spec: A clearing step removes the most crossings a searched spot allows |
| A spot keeps gaps from every other vertex and every line the vertex is not an end of, and a margin from the frame | spec: A clearing spot keeps its gaps |
| Only when no spot with the full gaps removes a crossing MAY a tighter gap be used | spec: A clearing spot keeps its gaps |
| A clearing step's explanation states the crossings before and after, counted exactly as the board counts them | spec: A clearing step removes the most crossings a searched spot allows |
| The counts are stated in numerals | untrue: `allCleared` in `src/games/untangle/hint-text.ts` writes "its only crossing" and "both of its crossings" for a move that clears them all, and a numeral everywhere else |
| A count is a numeral | spec: A hint's count is a numeral |
| Placing happens only when no single move removes a crossing | spec: Untangle hints move the point that removes the most crossings |
| Placing moves an unplaced vertex to its place in the solved layout, preferring one in a crossing, with a long move and a clear place, then the best net next move | spec: A placing step moves a vertex to its place in the solved layout |
| The place is as Solve would choose it | untrue: `closestPlaces` and `landedLayout` in `src/games/untangle/hint.ts` move each place onto a spot a pointer drop can land on, and choose the symmetry by Solve's criterion counted against those places |
| What a vertex's place is | spec: A vertex's place is one the pointer can drop it on |
| A placing step's explanation states what the move does to the vertex's crossings, and never refers to the solved layout | spec: A placing step is explained by what the player can see |
| It states the next step's count when that step removes at least as many crossings as this one adds | untrue: `narrate` in `src/games/untangle/hint.ts` also requires the next step to remove at least one, `gain > 0 && gain >= p.after - p.before` |
| When a placing step names the next step's count | spec: A placing step is explained by what the player can see |
| A vertex exactly on its place is moved by neither kind of step, nor by a journey's first leg | untrue: `onItsPlace` in `src/games/untangle/hint.ts` counts a vertex within the half-pixel box of its place (`withinReach` in `landing.ts`), not only one exactly on it |
| A vertex on its place is not moved | spec: A vertex on its place is not moved, so hints end solved; spec: A vertex's place is one the pointer can drop it on |
| Following hints from any position of a planar board ends solved, recomputing after every step | spec: A vertex on its place is not moved, so hints end solved |
| A solved board is refused by the midend with the already-solved wording, and a non-planar board with the no-move-worth-making wording once no move removes a crossing | spec: Untangle's hint refusals |
| Each step carries a highlight naming the vertex, its destination, the crossings removed and the vertices still to move | untrue: a step in `src/games/untangle/hint.ts` carries no `highlights`. Its `words` hold the marks (`VERTEX`, `SPOT` and `CROSSING` in `hint-text.ts`), which `redraw` reads with `stepMarks` |
| What a step marks | spec: A hint step marks its vertex, its destination and the crossings it removes |
| `redraw` draws the hint-colored line, vertex, destination marker and unfilled rings | spec: redraw draws a displayed hint in the hint color |
| Executing a step animates the vertex sliding to its destination | spec: Untangle hints move the point that removes the most crossings |
| Scenario: a clearing step's counts are true | spec: A clearing step removes the most crossings a searched spot allows |
| Scenario: following hints solves the board from anywhere | spec: A vertex on its place is not moved, so hints end solved |
| Scenario: hint refuses on a solved board | spec: Untangle's hint refusals |
| Scenario: displayed hint is rendered | spec: redraw draws a displayed hint in the hint color |

## Untangle hints finish a knot of crossings as one journey

| Rule | Where it went |
| --- | --- |
| With few crossings left, `hint` first looks for a journey by a bounded search counted in work, returned whole, one leg per vertex, each later leg continuing the one before | spec: Untangle hints finish a knot of crossings as one journey |
| The first leg removes a crossing and moves no placed vertex, a journey leaving crossings moves none, so no hint cycles | spec: A journey removes crossings and unplaces nothing it need not |
| The first leg says how many vertices move and what the journey clears, and every leg what its own move does, counted on the board as it finds it | spec: A journey's legs say what the journey and each move do |
| Every leg's counts are in numerals | spec: A hint's count is a numeral |
| Every journey's first leg says how many marked vertices it moves | untrue: `journey` in `src/games/untangle/hint.ts` narrates a journey of one move with `narrate`, as a clearing step |
| Scenario: a journey does what it says | spec: Untangle hints finish a knot of crossings as one journey |
| Scenario: the owner's board is solved within 22 moves | spec: Untangle hints finish a knot of crossings as one journey |
| The owner finished that board in 20 moves and the hint without journeys in 31 | figure |
| Scenario: a journey that leaves crossings never unplaces a vertex | spec: A journey removes crossings and unplaces nothing it need not |
