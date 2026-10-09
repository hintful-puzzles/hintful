# Verdicts: pegs

## keep `pegs`: Pegs' marks sit beside the peg and never recolor it

`engine-hints`, "A hint marks beside the content, never behind it", covers the ring and the outline. It says nothing of an arrow, and it forbids a mark under what the player reads, where Pegs draws its stripes on the cell's face under the peg and lays its arrow over the pegs. Those two placements are the game's own decisions and are stated nowhere else.

## keep `pegs`: Pegs discards a drag or an armed jump when the board changes under it

The requirement binds the code as it stands: `changedState` in `src/games/pegs/index.ts` clears `dragging` and `curJumping`, and `engine-input`, "The engine cancels a drag the board changed under", reaches only a `GridDrag`. Whether the drag should become one is a change to the code and not to this spec; see the note below.

## keep `pegs`: The completion flash lifts every cell

No shared capability states it. `engine-colors`, "The solved flash is one role", covers only a flash drawn in the `FLASH` color, and a lift to the lifted surface is not that. The look is the game's own until a shared requirement says it; see the note below.

## keep `pegs`: Pegs is won when one peg remains

The rules of the puzzle, what counts as solved and what a Random board promises are what a spec keeps first, and they were held only in the scenarios of a type statement. Writing them as the rule is the rewrite's work done late, not an addition.

## keep `pegs`: A peg jumps by a drag, or from the keyboard

What a control does stays. The body says what `interpretMove` in `src/games/pegs/index.ts` does for the drag and for the armed keyboard jump, which the old scenarios alone held.

## note pegs: the params encoding and the description format are not in the spec

Neither has ever been stated: params are `{w}x{h}` followed in full by the board type's word (`encodeParams` in `src/games/pegs/state.ts`), and the description is one letter for each cell (`parseDesc`, `CELL_LETTERS`). Both are promises to saved games and shared links, so a later change should add them. Nothing was added here.

## note pegs: the drag is not a `GridDrag`, by its shape

Pegs' `Ui` holds the dragged peg's cell (`sx`, `sy`) and the pointer's position in pixels (`dx`, `dy`), since the peg follows the pointer. `engine-input`, "A pointer drag over a grid has one name across the collection", speaks of a pair of integer coordinates, so the drag does not plainly fit. Moving it is a code question for a session working on Pegs' input; the armed jump would stay Pegs' own either way.

## note engine-colors: several games state the same lifted-surface flash

Pegs, Range, Separate, Subsets and Netslide each carry a requirement that the completion flash lifts every cell to the lifted surface on its lit beats. If that is the collection's flash for a quiet-surface board, `engine-colors` or `engine-drawing` should say it once and the games' copies could then go. No shared requirement says it today.
