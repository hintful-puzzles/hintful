# say-why-a-region-has-no-room: design

## Decisions

- **The refusals are the shaded squares beside the room, stated as a
  description function, not reported by `fits`.** `walls(S)` (the shaded
  squares beside the open squares S and not of them) is what every refused
  fill was refused against: a run of three is a placement beside one of
  them, and a lone one beside two placements. The describe language already
  says it; no compiler change. The alternative, `fits` reporting the squares
  each refused fill touched, needs an exists-fill that returns a set, a
  language feature for one game's sentence, and a minimal set would cost an
  exists-fill a square. Where a wall did not decide the room the outline is
  still true evidence (the fill is read given it), and the sentence says
  "given", not "because of".
- **No wall, no outline**: the sentence says only "as dominoes". Then the
  square left out or tried, which the ring marks, is what closes the room
  (measured below: 20 of the Tricky steps are a lone tried square beside
  the region).
- **`crowded` outlines the tried square's partner, never the squares the
  trial clears.** The outline marks shaded squares in every step of the
  game. The cleared squares are the partner's and the tried square's
  neighbors, which the player reads from the outlined domino; they stay in
  `reads`.
- **"the rest of" is dropped**: "without this square, this region" says it.
- **The three rungs are ledgered past 120 characters** (`LONG_NARRATIONS`,
  one entry with `crowded`'s): ring, region and walls, with the rule. The
  game's plan test held its own copy of the 120 line, which ignored the
  ledger; it is gone, and the shared guard holds the line.

## Measured (2026-11-16, 16 boards each at 6x6 Normal and Tricky, 623 steps)

Before: 65 room steps, none outlining what closed the room; `crowded`'s 7
outlines marked open squares. After: 35 outline the walls (22
`neededRegion` with one wall, 5 `blocked`, 8 `crowded`), 30 have none and
say "as dominoes" alone.
