# Ledger: canvas-sizing

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## The puzzle board sizes to fit on load without a manual resize

| Rule | Where it went |
| --- | --- |
| The canvas fills the available space as soon as a game loads, with no later resize needed | spec: The puzzle board sizes to fit on load without a manual resize |
| The available size is not derived from chrome whose own size is a function of the board's, which is a loop that settles where it started | spec: The available size is never measured from chrome sized from the board |
| The available width is measured from the board's padded wrapper and not from a container that may hold something sized from the board | spec: The available width is measured from the board's padded wrapper |
| The host's box does not change after first layout, the `ResizeObserver` does not re-fire, so a mis-measurement stays stuck until an incidental resize | spec: The available width is measured from the board's padded wrapper |
| The host element is `flex: 1` | untrue: the host is `flex: 1 1 auto` with a minimum of 5rem each way, in the `puzzle-view-interactive` rule of src/screens/puzzle-screen.ts, so the reason now says it flexes to fill its parent |
| A hint banner reserving `max(canvasSize.w, 34rem)` left the board too small on load | history |
| The banner is gone and the container and the wrapper are now the same box, by `implement-front-page-and-chrome` | history |
| The rule is stated about the shape and not the banner, since anything later added to the container that sizes itself from the board re-opens the loop | spec: The available size is never measured from chrome sized from the board |
| The recompute is idempotent, reports no change with no layout change, and triggers no resize loop | spec: A size recompute with no layout change reports no change |
| A real window or element resize still resizes the board, and the `maxScale` clamp still bounds it | spec: A real resize still resizes the board, within the maxScale clamp |
| Scenario: a freshly-loaded board fills its space with no synthetic resize | spec: The puzzle board sizes to fit on load without a manual resize |
| Scenario: a full page reload leaves the board full-size | spec: The puzzle board sizes to fit on load without a manual resize |
| Scenario: correcting the size does not loop | spec: A size recompute with no layout change reports no change |
