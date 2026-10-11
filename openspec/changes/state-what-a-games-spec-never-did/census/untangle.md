# untangle

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: comma-separated `a-b` pairs of zero-based points, no coordinates | stated | "The Untangle desc encodes the edges only" |
| desc | what the parser refuses: a point out of range, a pair joining a point to itself, an edge named twice | stated | "The Untangle desc encodes the edges only" |
| desc | a graph `hasNoSolution` proves is not planar is refused at load | gap | "A graph that is not planar does not load" (new) |
| desc | `supersededDesc` | stated | "The layout is restored by replaying the move log" (it has none) |
| params | the number of points, written as the integer, the same short and full | stated | "Untangle's params are a vertex count" |
| params | refusal: fewer than 4 points, or more than the declared upper bound | stated | "Untangle's params are a vertex count" |
| pref | `snap-to-grid`: its key and default | stated | "The Untangle port exposes its three preferences via the hook" |
| pref | `snap-to-grid`: what it changes | gap | "Snap-to-grid drops a point in the middle of a grid square" (new) |
| pref | `show-crossed-edges` | stated | "The Untangle port exposes its three preferences via the hook"; "Rendering frames the play area and colors roles distinctly" |
| pref | `vertex-style` | stated | "The Untangle port exposes its three preferences via the hook"; "Rendering frames the play area and colors roles distinctly" |
| control | a press near a point and a drag move it; a release places it | stated | "Vertices are dragged by pointer or keyboard" |
| control | a drag past the edge | stated | "A drag is clamped to the playable area" |
| control | an arrow picks out the nearest point that way | stated | "The keyboard selects, holds, nudges and cycles a vertex" |
| control | Space or Tab steps through the points, backwards with Shift | stated | "The keyboard selects, holds, nudges and cycles a vertex" |
| control | Enter picks up, the arrows nudge, Enter puts down | stated | "The keyboard selects, holds, nudges and cycles a vertex" |
| control | the first key with nothing selected, what "that way" means, and how far a nudge goes | gap | "Untangle's keyboard starts from point 0" (new) |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | a move that removes the most crossings (`clear`) | stated | "A clearing step removes the most crossings a searched spot allows"; "A clearing spot keeps its gaps"; "A clearing step lands where the pointer can drop" |
| hint | a move toward the solved layout (`rearrange`) | stated | "A placing step moves a vertex to its place in the solved layout"; "A placing step is explained by what the player can see" |
| hint | several points moved together (`journey`) | stated | "Untangle hints finish a knot of crossings as one journey"; "A journey removes crossings and unplaces nothing it need not"; "A journey's legs say what the journey and each move do" |
| hint | the order: a journey first, a placing step only when no move removes a crossing | stated | "Untangle hints move the point that removes the most crossings"; "Untangle hints finish a knot of crossings as one journey" |
| hint | what a step says | stated | "A hint's count is a numeral"; "A placing step is explained by what the player can see"; "A journey's legs say what the journey and each move do" |
| hint | what a step marks | stated | "A hint step marks its vertex, its destination and the crossings it removes" |
| hint | when it refuses | stated | "Untangle's hint refusals" |
| hint | refusal on a finished board | not-owed | `engine-hints`: "The midend SHALL refuse a hint on a finished or wrong board before asking the game" |
| words | the status bar | not-owed | The game has none (`facts.json`: `statusbar: false`) |
| words | a title's words, `N points` | gap | "An Untangle title is its number of points" (new) |

## Defects

None.

## Notes

- Two requirements already in the spec speak of a board a player cannot open.
  "Solve untangles any planar board, with or without aux" has the scenario
  "Solve refuses a non-planar graph" on "a hand-typed description of K5", and
  "Untangle's hint refusals" has "A hand-typed K5 is helped, then refused".
  Both hold of `solve` and `hint` called on a state built by `newState`
  (`src/games/untangle/untangle-hint.test.ts` does that), but loading refuses
  that description first: run on 2026-10-11, `loadVerdict` for
  `5:0-1,0-2,0-3,0-4,1-2,1-3,1-4,2-3,2-4,3-4` answered "This game ID's puzzle
  has no solution, so it can't be played here." The new requirement states the
  refusal; the two scenarios are left as they are and now describe what the
  hooks do, not what a player meets.
- The spec's desc requirement says the pairs are "sorted … with `a < b`". That
  is what the generator writes. The parser also reads a pair written the other
  way round, or pairs out of order, as the same edges
  (`src/games/untangle/state.ts`, `parseDesc`): run on 2026-10-11, the dealt
  description with its first pair turned to `2-0` was read. The requirement's
  acceptance sentence already allows it.
- Either mouse button drags a point (`isMouseDown`,
  `src/games/untangle/index.ts:226`); the spec and the help say "a pointer
  press" and "click", which cover both.
- With snap-to-grid on, a point picked up with Enter and put down with no
  nudge goes back exactly as it was and is not snapped
  (`src/games/untangle/index.ts:318`), which "The keyboard selects, holds,
  nudges and cycles a vertex" already states.
