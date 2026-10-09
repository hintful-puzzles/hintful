# Verdicts: canvas-sizing

## keep `canvas-sizing`: A size recompute changes the board only when the layout changed

Both doubts are about its last sentence, and neither holds. The `maxScale`
clause is not stated by `engine-drawing` "Fit-to-window sizing fills the
slot": that requirement says the cap is the setting's job and is done by
shrinking `maxSize` before the call, and does not say who does it or that it
survives a resize. The view does it (`src/puzzle/components/view.ts`, where
the available size is limited to `maxScale` times the preferred size before
the midend is asked), and this is the view's promise, with a scenario of its
own ("The space grows under a clamp"). The plain-resize clause is the other
half of the idempotence rule and not a regression note: a recompute that
reports no change is satisfied by a board that never resizes, and this clause
is what forbids that fix. A player would notice it broken and its only other
home is a test.
