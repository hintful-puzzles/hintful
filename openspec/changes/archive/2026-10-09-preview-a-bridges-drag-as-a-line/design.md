# Design

## The preview is the release's own move, executed

One rule covers every drag the game has: **while a drag has a far end, the
span between the two islands is drawn from the board the release would
leave**, in the drag's color. `redraw` asks the same function the release
asks for its ops (`dragReleaseOps`) and runs them through `executeMove`. The
span's squares then take their line, cross and limit from that board, and
everything else on the canvas stays the board as it is.

That is how the preview is kept from promising something the release does not
do: there is no second statement of what a drag does to disagree with the
first. A table of cases in `render.ts` would be such a statement, and
`todraw` was the start of one.

What it comes to, case by case (read from `dragReleaseOps` and `lowerLimit`
on 2026-10-09):

| Drag | The release plays | The span shows mid-drag |
| --- | --- | --- |
| Primary, empty span | `L n=1` | one bar |
| Primary, `k` bridges below the span's limit | `L n=k+1` | `k+1` bars |
| Primary, span at its limit | `L n=0` | no bars: the bridges lift off |
| Secondary, no limit | `C n=maxb-1` | `≤n` mid-span, any bars kept |
| Secondary, limit above the bridges drawn | `C n-1` | the lower `≤n` |
| Secondary, limit of one, no bridge | `C maxb`, `N` | the pair of crosses |
| Secondary, crossed | `N` | the span bare |
| Secondary, limit down at a bundle | `C maxb` | the bars, label gone |

Everything in the right-hand column is in `COL_SELECTED`, the color the two
islands' rims already take, so a preview is never mistaken for a committed
bridge (`docs/games/rendering.md` § "A press preview must not look like a
commit").

**A removing drag shows the span empty**, not the bars it takes away struck
through or dimmed. The bars vanish as the finger crosses onto the span and
the two rims stay green, which says "release here and these go". A second
shape for "about to be removed" would be a new mark to learn, and a board
that says the same thing two ways.

**A drag with no far end previews nothing**, as before: over a locked bridge,
a crossed span (primary), a span another bridge crosses, or a full bundle
with no limit (secondary). `updateDragDst` already refuses those, and the
source island's rim alone is green.

**The keyboard drag has no mid-gesture frame.** Ctrl or Shift with an arrow
resolves and releases in one key, so there is nothing to preview.

## Where the code goes

`render.ts` needs `executeMove` and the release's ops, and both live in
`index.ts`, which imports `render.ts`. They move to a `moves.ts` both import,
with `lowerLimit`: the guide's shape, with Signpost as its exemplar.

`BridgesUi.todraw` goes. So does `BridgesUi.nlines`, which was the bridge
count `updateDragDst` worked out for `finishDrag` to play: `dragReleaseOps`
reads it from the board at the release instead, where the preview can ask the
same question. Neither field was saved.

## The tile cache needs nothing

The packed descriptor is the cache key, and the preview changes the line
field a span's squares are packed from, so the squares repaint when the far
end changes and again on release or cancel. The half-stubs the two islands
draw come from the same field, so they follow. Nothing is painted outside a
tile.

## What the preview does not show

The board the release leaves can also turn an island red, or settle one. The
preview reads only the span's own squares from it, so neither shows until the
release. Showing them would recolor islands the finger is not on, mid-drag.
