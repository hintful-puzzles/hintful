# Design — color-path-pairs

## Context

Measured 2026-10-21; re-check before relying on it.

- **Pairs a board deals**: 5x5 3–5, 7x7 7–10, 9x9 12–15
  (`add-path-ts-port` design D3). So at 9x9 colors repeat whatever the set's
  size; the numbers carry the identity.
- **`TEN`** is red, yellow, green, blue, orange, purple, brown, teal, pink,
  gray, measured 0.159 light and 0.143 dark for its worst pair (2026-09-11).
  Its users are Flood, Guess and Samegame.
- **What Path's board already draws in a meaning's color**: `ERROR` (red) for
  a broken line and a Check & Save mistake; `HINT_RING` (blue) for a step's
  edge; `HINT_OUTLINE` for the squares and chain a step reads; `CURSOR`
  (green); `DRAG_ADD`/`DRAG_REMOVE` (blues) for the drag's preview;
  `clueDoneColor` for a joined pair's disc.

## D1 — The free set is designed, not picked from `TEN`

The set excludes every hue a meaning uses on a board and any a player would
take for one, then is laid out for mutual distinctness in both schemes, with
the bounds `src/engine/color/colors.test.ts` asserts for `TEN` (no step
inverting, no near-background fill in the dark). Measure with
`scripts/checks/color-dark-check.test.ts` and
`scripts/checks/color-collide.test.ts`, before and after. Record its size and
its worst pair here.

A color here carries no meaning, so a game takes it by index, and the set's
doc says so: it is the one place a game's color is its position in a list.
`engine-colors` "A game references a meaning, or a named color that is the
meaning" already allows a set whose job is to be told apart.

**Outcome (2026-10-21): `FREE`, four colors**: amber, violet, olive and
magenta. Worst pair 0.130 light (amber and olive), 0.145 dark.

- **What it is kept from**: the error, the cursor, a held piece, the drag,
  and all six colors of the hint's ring and outline pools, since a step with
  several references repaints its marks in them. At least 0.10 from each in
  both schemes, and 0.16 from the error. That leaves two arcs of hue, amber
  to olive and violet to pink. The stripes pool is left out: a hatch laid
  under a symbol is not a line, and Path draws none.
- **What it must read on**: a line on `cellSurface` at the ring's 2.5 in
  light (the amber 2.46, a thick line) and well above in dark, and a black
  number on a disc of the color, at 3 or more.
- **Why four, not five**: a search over both arcs put five at the same
  0.130, the bottleneck being amber and olive. On a 9x9 board in the app,
  though, the fifth (a purple between violet and magenta) read as the
  magenta beside it: OKLCH distance overrates two saturated purples that
  differ mainly in lightness. Four are told apart at a glance in both
  schemes. `colors.test.ts` holds the set at 0.125 and `palette.test.ts`
  holds the distances and contrasts above.
- **`color-collide` after**: no pair color lands on another slot of Path's.
  Its new pairs are `COL_DONE_TEXT` (black) with the ink slots, the same
  value in the light scheme only, and deliberate: the number on a filled
  disc stays black in both. `COL_DRAG_ADD = COL_HINT` was there before.
- **`TEN`'s users stay on `TEN`** (D4): it measures 0.159 light and 0.143
  dark, and four colors cannot carry what it carries.

## D2 — How Path assigns colors

A pair's color is its number's index into the set, wrapping: numbering runs
in reading order, so repeats fall far apart on the board more often than
not. Measure how often two pairs of one color sit side by side on dealt
boards, and if often, assign by a coloring of the pairs' adjacency instead,
recorded here.

**Outcome (2026-10-21): often, so pairs are spread by where their numbers
sit.** Over 40 dealt Normal boards a size, with the answer's lines
touching counted as side by side, wrapping gave 13.9% of touching pairs one
color at 9x9 with four colors (8.3% with five), 39 boards of 40 having at
least one such pair. With 7x7 it was 9.9%, and with 5x5 1.1%.

Coloring by the answer's adjacency would leak it: two same-colored pairs
would never touch. So the adjacency is the givens': each pair's two numbers
as a box, a pair's cost for a color halving with each square between their
boxes, and each pair moves to its cheapest color until none moves
(`engine/spread-colors.ts`). That gave 7.6% at 9x9 with four colors (3.4%
with five), 3.9% at 7x7 and 0.5% at 5x5. The numbers tell the rest apart.

## D3 — What is no longer drawn by color

- **A broken line** (a piece joining two numbers, or a loop): by its shape,
  dashed or with a cross mark on the offending edge, in ink, so it reads on
  any pair's color.
- **A Check & Save mistake on a line**: the same shape question; decide one
  look for both or two, and record why.
- **A joined pair**: today its disc grays. With color, decide whether the disc
  keeps its color and the number grays, or the disc fills; show the owner.
- **The drag's preview**: today blue. On a colored board, decide whether the
  preview takes the pair's color with a lighter weight, and show the owner.

**Outcome (2026-10-21)**:

- **A broken line and a Check & Save mistake stay `ERROR` red.** The shape
  was asked for so that no pair's color could hide the error. D1 removes that
  premise: no member of `FREE` is within 0.16 of red. Red is what an error is
  in every game, and a Path-only dashed or crossed line would be a second
  error vocabulary for the player to learn.
- **The disc is a ring of the pair's color while its path is open, and fills
  with the color once the pair is joined**, its number turning black. The
  color shows from the first move, and "filled" reads as finished. This
  replaces the gray disc, which `clueDoneColor` gave.
- **The drag keeps `DRAG_ADD` and `DRAG_REMOVE`.** They are shared meanings,
  and `FREE` holds no blue, so a preview is never taken for a pair's line.

## D4 — The other games reuse it (owner, 2026-10-21)

The owner's word: once the set exists, every game it serves uses it. Flood,
Guess and Samegame color pieces that mean nothing from `TEN`, and Flood's red
tile and the error's red, Samegame's blue and the hint's ring share the
collision Path has. Move each onto the free set where it serves. What can
stop one:

- **More colors than the set holds, with nothing else to tell pieces apart**
  (Flood's and Guess's colors are the pieces' only identity): size the set
  for the most any of them needs, or record the game as staying on `TEN` and
  why.
- **A color a game says aloud**: Flood names its colors through `TEN_NAMES`,
  so the free set needs names a player would say, held to the colors in both
  schemes as `colors.test.ts` holds `TEN_NAMES`.

Search the rest of the collection for any other color used only to tell
things apart (`git grep -l "TEN\b" src/games` is where to start, not the
whole population), and take those on too. If `TEN` is left with no user,
retire it.

**Outcome (2026-10-21): none moves, and `TEN` stays.**

- **Flood, Guess and Samegame** go up to 10, 10 and 9 colors (their defaults
  6, 6 and 3), and a color is a piece's only identity, so `FREE` cannot
  repeat for them. Its size is fixed by the meanings it avoids, so no
  resizing reaches six. Moving only the boards with four colors or fewer
  would give one game two palettes by setting, and Samegame's hint names
  its colors from `TEN_NAMES`.
- **The rest of the collection**: every game importing a set from
  `colors.ts` was read. Signpost's chains, Star Battle's regions and Map
  take `REGION_FILLS`, fills already designed against the marks drawn on
  them. The two-state games take `TWO`, which is chosen to avoid the mark
  hues. Nothing else colors pieces by a color that means nothing.
