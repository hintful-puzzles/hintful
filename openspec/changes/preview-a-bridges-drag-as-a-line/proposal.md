# preview-a-bridges-drag-as-a-line

**Status: approved by the owner (2026-10-09)**, who took the recommendation
of the session that archived
`2026-10-09-triage-what-the-spec-rewrite-found-in-the-code` (its row
`A-bridges-2`). Sixth and last in the order that session set.

## Why

Dragging from one Bridges island toward another over an empty span recolors
the two islands' rims and draws nothing between them. Seen mid-drag in the
running app (2026-10-09). Upstream's renderer does the same, by reading
`bridges.c`: the C carries a `todraw` field its drawing never reads, and so
does the port (`BridgesUi.todraw`, written in `newUi` and `updateDragDst`,
read nowhere). The preview a player would expect, the bridge the release
will draw, is not there, and on a crowded board the two recolored rims are
easy to miss under a finger.

## What Changes

- While a drag has a destination, the span between the two islands shows the
  bridge the release would leave, in the drag's color, and the secondary drag
  shows what it would leave.
- `BridgesUi.todraw` either carries that and is read, or is removed.

## Capabilities

### Modified Capabilities

- `bridges`: "Bridges renders islands, bridges, marks and the win flash",
  whose scenario today says a drag over an empty span draws no line. It is
  replaced under a name that includes the preview, since a scenario cannot be
  dropped from a requirement that keeps its name.

## Impact

- `src/games/bridges/render.ts`, its tile cache key (a preview must repaint
  the span's tiles and put them back on release or cancel), and the render
  tests.
- `src/games/bridges/state.ts` and `index.ts` if `todraw` goes, with the
  capability-surface snapshot.
- No save or game-ID change.
