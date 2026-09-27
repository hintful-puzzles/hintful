# read-ascent-edges-by-lines

## Why

Owner playtest on a phone, 2026-09-27: on a 5x5 Edges board the hint said "The
run before 20 must step through the outlined squares, so 12 can only go here"
with almost every square outlined. It was "almost useless". The real reason was
three arrows: 12 is in column 5, 11 in row 3 and 13 in row 5, so 12 must be in
row 4.

Edges mode (Jeff Widderich's 1to25) gives every missing number a line the player
can see, and places few numbers. The solver's `overlap` rung was deducing from
those lines. The hint narrated the deduction in the unit of the other modes, the
run between placed numbers, and in Edges a run without a lower end reaches
nearly the whole board.

Measured before the change, over 30 boards per tier: `route` was 22%, 26% and
15% of 5x5 Edges steps at Normal, Tricky and Hard, and 85% of those steps
marked more than a third of the empty board.

The owner also asked that Edges get its own heading in the Type menu, that
Honeycomb and Hexagon share one ("Hex"), and that the presets be trimmed, since
Custom covers the rest.

## What changes

- **Two Edges techniques** in a new `hint-edges.ts`, offered only in Edges mode:
  - `lines` (Normal): a number is on its arrow's line, within `k` steps of the
    line of each missing number `k` places from it, and within `k` steps of the
    nearest placed numbers. When one square satisfies them, the number goes
    there. *"17 must be on its column, within a step of 16's row and 18's row.
    Only this square is, so it must be 17."* It outlines the arrows it reads
    and stripes the other numbers' lines.
  - `pointers` (Tricky with a placed neighbor, otherwise Hard, as
    `single-number` is): of the missing numbers whose arrows point at a square,
    all but one fail such a premise there. *"Of the missing numbers, only 2 and
    10 point here. 10 is too far from 9's diagonal, so it must be 2."* It
    outlines every arrow pointing there and stripes the lines that rule the
    others out. When naming every reason would exceed 120 characters, a
    shorter sentence lets the stripes carry them.
- **Menu:** the rectangle presets stay at the top level. "Hex" holds 6x8
  Honeycomb and size-7 Hexagon, Normal to Hard; "Edges" holds 5x5 Normal to
  Hard. The 8x10 Honeycomb and size-9 Hexagon presets are dropped. Saves and
  game IDs are untouched: a preset is only a menu entry.

## What it cost, and what holds the rest

- After the change, over 60 boards per tier: `route` is 0.5–0.7% of 5x5 Edges
  steps. `lines` is 16–25% and `pointers` 6–26%. A `lines` step marks about a
  quarter of the interior (usually one line). Every sentence fits in 120
  characters.
- **Regular boards are unchanged by construction** (the techniques are not in
  their ladder). They were also checked plan for plan against the previous
  commit: 58 non-Edges shapes (every old preset and the custom options), 10
  seeds each, 679 plans and 9,952 steps, zero differences. The same harness
  reported differences on 11 of 18 Edges plans, as the known positive.
- `route` had stopped firing on the pinned board that claimed it (whole runs
  took it). Its only remaining source was the dropped 8x10 Honeycomb Hard
  preset, so a board firing it is now pinned as a desc.
