# Cuts: canvas-sizing

Requirements: 5 before, 3 after. No rule is gone: two pairs of requirements on one subject became one each, and two restatements were cut.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "The puzzle board sizes to fit on load without a manual resize": the scenario "A full page reload leaves the board full-size" | duplicate | The scenario "A freshly-loaded board fills its space with no synthetic resize" of the same requirement: a reload is a load. |
| "The available width is measured from the board's padded wrapper" (the requirement as a separate one) | duplicate | Merged into "The available size is never measured from chrome sized from the board", which now carries its rule (width from the padded wrapper, not the shared container) and its scenario. |
| "The available width is measured from the board's padded wrapper": "because the host element flexes to fill its parent, its box does not change after first layout, and so the `ResizeObserver` does not fire again once the canvas attaches" | how | The mechanism of the sticking; the merged requirement keeps the consequence ("stuck until an incidental resize"), and the doc comment on `computeAvailableCanvasSize` in `src/puzzle/canvas-sizing.ts` keeps the mechanism. |
| "The available size is never measured from chrome sized from the board": "would re-open the loop" (of anything later added to the container that sizes itself from the board) | duplicate | The sentence before it in the same requirement already calls reading such chrome a loop; the SHALL NOT on later additions stays. |
| "A real resize still resizes the board, within the maxScale clamp" (the requirement as a separate one) | duplicate | Merged with "A size recompute with no layout change reports no change" into "A size recompute changes the board only when the layout changed", which keeps both sentences and both scenarios. |
