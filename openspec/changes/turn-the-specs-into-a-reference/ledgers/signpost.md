# Ledger: signpost

Base: bb004490

Where every rule of Signpost's spec went in the reference form: every rule
kept, stated once, a requirement held to the tool's 500 characters.

## Signpost game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `signpost` game implements `Game`, on a grid of arrows and immutable numbers, linked into one chain `1 … n` | spec: Signpost game implements the Game interface |
| The five type arguments of `Game` spelled out | untrue: `signpostGame` in `src/games/signpost/index.ts` is typed with eight, adding the mistake, hint and rung types, so the rule names `Game` alone |
| Params are `w`, `h` and `forceCornerStart`, and a bare `{n}` is a square | spec: Signpost's parameters |
| The encoding ends in `c` when corner start is set | untrue: the `c` segment in `src/games/signpost/index.ts` is declared `{ full: true }`, so only the full encoding writes it. The rule now says so |
| All the presets are offered, each named | spec: Signpost's presets |
| "All 6" | figure |
| The presets are upstream's | history |
| `validateParams` rejects non-positive dimensions | untrue: `validateParams` in `src/games/signpost/index.ts` does not look at them. The engine's params check refuses them from the `bounds: { min: 1 }` the dimension items declare. The rule now says they are refused, without naming who |
| `validateParams` rejects a 1×1 full generation | spec: Signpost's parameters |
| The game provides `solve` and `textFormat` | spec: Signpost game implements the Game interface |
| The win flash is a spin, and is suppressed after Solve | spec: Signpost's win flash spins the arrows |
| Scenario: params round-trip | spec: Signpost's parameters |
| Scenario: invalid params are rejected | spec: Signpost's parameters |

## Signpost descriptions use the upstream per-cell encoding

| Rule | Where it went |
| --- | --- |
| Row-major, one token per cell, a direction letter with the number before it for a given | spec: Signpost descriptions use the upstream per-cell encoding |
| Unknown characters, numbers out of range and a wrong token count are refused | spec: A malformed Signpost description is refused |
| The refusal is `validateDesc`'s | untrue: the game has no `validateDesc`. `parseDesc` in `src/games/signpost/state.ts` refuses inside `newState`, and the engine's `validateDesc` reads that verdict. The rule now says validating a desc refuses |
| `newState` parses the desc into arrows and immutable numbers | spec: A new Signpost board holds the description's arrows and givens |
| The arrows and immutable numbers are shared, frozen, across all states | untrue: `cloneState` in `src/games/signpost/state.ts` copies `dirs` and `flags` into every state. What holds is that no move changes them, which the rule now says |
| No links are placed initially | untrue: `newState` in `src/games/signpost/index.ts` runs `checkCompletion(s, true)`, which links every pair of consecutive immutable numbers whose lower arrow points at the higher. The rule now says those are the only links |
| Scenario: a description round-trips | spec: Signpost descriptions use the upstream per-cell encoding |
| Scenario: a malformed description is rejected | spec: A malformed Signpost description is refused |

## Signpost maintains the linked-chain state model

| Rule | Where it went |
| --- | --- |
| The state holds the links, a disjoint-set forest of regions, and a derived number and color group per cell, recomputed on every move | spec: Signpost maintains the linked-chain state model |
| The upstream function names for the renumbering | history |
| Merging keeps the larger region's color, a blank cell joining a numbered region inherits it, two blank cells take the lowest unused | spec: Signpost's region colors follow the links |
| State is immutable and cloned per move | spec: Signpost maintains the linked-chain state model |
| "Typed arrays + disjoint-set forest, no explicit free" | history |
| Scenario: linking renumbers a region | spec: Signpost maintains the linked-chain state model |
| Scenario: merging keeps the dominant color | spec: Signpost's region colors follow the links |

## Signpost reports mistakes for Check & Save

| Rule | Where it went |
| --- | --- |
| `findMistakes` re-solves from the clues and flags each `next` link that disagrees with a unique solution, never a cell with no outgoing link, and nothing on a board that is not uniquely solvable | spec: Signpost reports mistakes for Check & Save |
| The live error overlay flags locally inconsistent links and not globally wrong ones | spec: Signpost's live error overlay is not its mistake check |
| Scenario: a wrong link is flagged | spec: Signpost reports mistakes for Check & Save |
| Scenario: a hand-typed ambiguous board reports nothing | spec: Signpost reports mistakes for Check & Save |

## Signpost exposes the victory-flash preference

| Rule | Where it went |
| --- | --- |
| The sole preference, `flash-type`, is exposed through `Game.prefs`, changes the spin pattern and persists | spec: Signpost exposes the victory-flash preference |
| The preference is upstream's | history |
| Scenario: the flash preference is offered and applied | spec: Signpost exposes the victory-flash preference |

## Signpost solves by forced-link deduction

| Rule | Where it went |
| --- | --- |
| The solver iterates the renumbering and the forced-link deduction, for a sole successor and a sole predecessor, to a fixpoint | spec: Signpost solves by forced-link deduction |
| A region bridges only a numeric gap it fits into | spec: Signpost solves by forced-link deduction |
| The solver reports solved, stuck or impossible | spec: Signpost solves by forced-link deduction |
| The private function names `update_numbers`, `solve_single` and `move_couldfit` | history |
| Scenario: forced links are deduced | spec: Signpost solves by forced-link deduction |
| Scenario: Solve recovers the chain from a dirty state | spec: Signpost solves by forced-link deduction |

## Signpost generates solver-gated boards reproducibly

| Rule | Where it went |
| --- | --- |
| The same seed and params give the same desc, through the head and tail walk, the shuffled solver-gated clue selection and the encoding | spec: Signpost generates solver-gated boards reproducibly |
| The private function names `new_game_fill`, `new_game_strip` and `generate_desc` | history |
| Scenario: generation is reproducible from a seed | spec: Signpost generates solver-gated boards reproducibly |

## Signpost renders region colors, arrows and a blitter drag sprite

| Rule | Where it went |
| --- | --- |
| Four ramps for the region backgrounds and the mid and dim arrow colors | spec: Signpost's palette carries four ramps over the region colors |
| The ramps are HSV | untrue: `src/engine/color/palette-games.ts` builds the backgrounds from the shared fills and their midpoints, and the other three by mixing each toward the ink or the board. No ramp is computed in HSV |
| "16-entry" | figure |
| The file name `render.ts` | history |
| A per-cell cache diffed against the previous frame, with every overlay rebuilt each frame so it is in the key | spec: Signpost repaints a square only when what it shows changed |
| The packed word holds the color group, the sequence number, the arrow direction and a flash bit | untrue: in `redrawSignpost` in `src/games/signpost/render.ts` the packed word holds flag bits only. The number, which carries the color group, and the inbound link's direction are compared from arrays beside it, the cell's own arrow is not compared since it never changes, and the flash forces a repaint when the spin angle changes. The word also holds the dimmed bit, the two linked bits and the hint's marks. The rule now lists these |
| The cache is an `Int32Array`, and the error styling is named `COL_ERROR` | history |
| The immutable, error, cursor, drag-origin and findMistakes-overlay bits are in the key | spec: Signpost repaints a square only when what it shows changed |
| The drag sprite uses a blitter, saving and restoring under the arrow | spec: Signpost's drag sprite uses a blitter |
| "As the Pegs port does" | history |
| The win flash spins the arrows, honoring `flash-type` | spec: Signpost's win flash spins the arrows |
| The first draw paints the grid frame over the ground the midend lays | spec: Signpost paints the grid frame on the first draw |
| Scenario: region colors repaint after linking | spec: Signpost's palette carries four ramps over the region colors |
| Scenario: a wrong link renders red | spec: Signpost repaints a square only when what it shows changed |

## Signpost draws its squares on the collection's quiet surface

| Rule | Where it went |
| --- | --- |
| A chainless square is the cell surface, a given the lifted surface, every other square its chain's color, with the thin grid line between squares and a frame no heavier | spec: Signpost draws its squares on the collection's quiet surface |
| A given keeps its lifted surface under a drag's dimming, and its number is full strength, stepping to middle strength only while dimmed, with the reason | spec: A Signpost given keeps its surface and its number's strength |
| Scenario: three kinds of square | spec: Signpost draws its squares on the collection's quiet surface |
| Scenario: a linked given stays readable | spec: A Signpost given keeps its surface and its number's strength |
