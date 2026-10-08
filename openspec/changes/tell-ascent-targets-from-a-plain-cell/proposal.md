# tell-ascent-targets-from-a-plain-cell

Raised by `order-ascent-rulesets-by-neighbors`, whose new default board
brought the pair into the contrast guard's sample; the owner looked at the
dark scheme, agreed it read poorly, and asked for it to be fixed with the
palette's own colors.

## Why

Ascent filled three things with its bevel highlight: the squares a held
number leads to, the row or column an edge number is dragged along, and the
disc under the first and last number. As a cell fill it failed in both
schemes (2026-10-08, pixels measured in the running app, distances as
`neighbor-contrast.ts` counts them, floor 0.07):

| Scheme | Against a plain cell | Against a given | Against the held cell |
| --- | --- | --- | --- |
| Dark | 0.084 | 0.242 | 0.092 |
| Light | 0.180 | 0.051 | 0.279 |

In the dark scheme it was darker than a plain cell and read as a second held
cell. In the light scheme it was white on a given's near-white, and a target
is usually a given.

## What changes

- **The target squares and the dragged row or column take `GOAL_WASH`**, in a
  slot of their own (`COL_TARGET`). A target always holds a number, the
  nearest placed one on either side of the held number, which is the wash's
  meaning: the cell a goal is in. Rome pairs the same two washes, held and
  goal. A dragged row or column ends on the two arrows it lines up with,
  which are the same yellow.

  | Scheme | Against a plain cell | Against a given | Against the held cell |
  | --- | --- | --- | --- |
  | Dark | 0.225 | 0.095 | 0.395 |
  | Light | 0.114 | 0.080 | 0.176 |

- **A number offered on the dragged row or column is drawn in ink.** Its gray
  stood 0.080 off the wash in the dark scheme, by hue alone, and it is where
  the drop lands.
- The discs keep the highlight, and the contrast guard's ledger loses the
  entry that excused the pair.

Other washes were weighed and declined: blue is Ascent's hint, green its
player's line, purple means finished, and the hint's evidence wash fails the
floor on a dark cell.

## Capabilities

### Modified Capabilities

- `ascent`: the color of a target square and of a dragged row or column.
