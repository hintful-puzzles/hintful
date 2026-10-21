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

## D5 — One set of ten, replacing `FREE` and `TEN` (owner, 2026-10-21)

**This supersedes the outcomes of D1 and D4.** Four colors failed on the
owner's first large board: on a 9x9, two pink pairs and two violet pairs sat
side by side. Pair 6's numbers were at opposite corners, so its box neighbored
nearly every pair. The owner: "I want more distinct colors... superseding
whatever usages we currently have for TEN which use them for semantics-free
needs. I want to make things simpler and more consistent, and for these
semantics-free colors, I'm ok with smaller hue differences between colors, as
long as they're sufficiently distinct from the main semantic elements." The
owner approved the proposal below for the engine and every affected game.

### The constraints, re-derived

- **Held hard**, in both schemes: 0.15 from `ERROR`, and 0.10 from ring[0]
  (`HINT_RING`, which is also `DRAG_ADD`), from outline[0] (`HINT_OUTLINE`)
  and from `CURSOR`/`HELD`. These are drawn in the same shapes as a pair's
  line or a tile's mark.
- **Relaxed**: ring[1] cyan, ring[2] indigo, outline[1] teal and outline[2]
  brown. They appear only when one step has two or more references of one
  role. While a hint shows, the app redraws them with a 1px black or white
  edge (`edged`, `mark-flash.ts`), which pair lines do not have. The hint's
  words are tinted with each and flash on tap. In Path a hint line lies only
  on an edge with no line yet. Holding these hard is what left D1 two arcs of
  hue and stopped it at four.
- **Path's lines are edged.** Each pair line and disc is drawn 1px wider in
  `BLACK` underneath. This reads in the light scheme and is invisible on the
  dark cell. Without the edge, yellow, pink, mint, orange and teal measure
  1.0–1.5 against the light cell. The best set kept inside the 2.4 line bar
  had dark members that were not distinct as lines, and a Flood board in it
  looked murky. The `palette.test.ts` bar becomes: the better of the contrast
  on the cell and the contrast against the black edge is over 2.4.

### The set, in the order games take it

Names are the same in both schemes. Each value is OKLCH `[L, C]` at hue `h`.

| # | name | h | light | dark | number on the disc |
|---|---|---|---|---|---|
| 1 | yellow | 100 | 0.86, 0.168 | 0.86, 0.160 | black |
| 2 | violet | 292 | 0.55, 0.220 | 0.68, 0.170 | black |
| 3 | teal | 185 | 0.68, 0.110 | 0.68, 0.115 | black |
| 4 | magenta | 338 | 0.56, 0.220 | 0.66, 0.210 | black |
| 5 | orange | 58 | 0.72, 0.156 | 0.75, 0.150 | black |
| 6 | olive | 100 | 0.52, 0.105 | 0.66, 0.120 | black |
| 7 | pink | 355 | 0.82, 0.090 | 0.88, 0.070 | black |
| 8 | mint | 165 | 0.88, 0.080 | 0.90, 0.080 | black |
| 9 | brown | 45 | 0.40, 0.070 | 0.52, 0.080 | **white in light**, black in dark |
| 10 | gray | — | 0.62, 0 | 0.74, 0 | black |

The number color is a per-member color with a light and a dark value,
parallel to the set. It is needed because black on the light brown measures
2.2.

**Measured by the design subagent (2026-10-21; re-measure before relying on
it).** Worst pair for the first N members, light / dark, against `TEN` in its
own order:

| first | the set | `TEN` |
|---|---|---|
| 3 | 0.264 / 0.231 | 0.260 / 0.168 |
| 4 | 0.172 / 0.154 | 0.260 / 0.168 |
| 6 | 0.172 / 0.135 | 0.176 / 0.148 |
| 9 | 0.148 / 0.135 | 0.159 / 0.143 |
| 10 | 0.125 / 0.130 (teal and gray) | 0.159 / 0.143 |

Teal and gray are clearly distinct on screen; the metric undervalues color
against gray. The pair to watch by eye is olive and brown in the light
scheme. No two saturated members are within 46° of hue at similar
lightness, so D1's purple and magenta failure has no counterpart. Nearest
held mark for any member: error 0.177, ring 0.125, outline 0.110, cursor
0.116.

### Who takes what

- **Path: the first 9.** Gray stays out: in the dark scheme a light-gray
  pair's line sits near the white of a line reaching no number. Same-color
  touching pairs at 9x9 (40 boards, `spreadColors`): 4 colors 9.7% (38/40
  boards), 6 colors 2.0% (16/40), 8 colors 0.3% (3/40), 9 colors 0.2%
  (2/40). At 7x7, 8 or more gave none.
- **Samegame: 3–9**, gray out as with `TEN` (a gray tile reads as a hole).
- **Flood and Guess: 6 by default, up to 10.**

### Moving off `TEN`, and retiring it

- **Names**: each member takes its word through `named`/`wordOf`, and the set's
  names replace `TEN_NAMES`. Flood's "Fill with ..." and Samegame's
  `colorName` read them unchanged. `colors.test.ts` gains word extents for
  magenta (h 325–350), olive (h 85–120, L ≤ 0.7, C ≥ 0.06) and mint (h
  150–180, L ≥ 0.8). The others' extents already cover their values.
- **Files**: `flood/render.ts` (`TEN`, `COLOR_NAMES`), `guess/render.ts`
  (`TEN`; its comment that the cursor rings pegs "of all ten hues, green
  among them" stops being true, so weigh `CURSOR`), `samegame/render.ts`
  and `hint-text.ts`, `colors.test.ts` (the ten and nine sets, the names
  test, the `NAMED` list), the comment at `palette-source.test.ts` naming
  `RED` in `TEN`, and `colors.ts`'s header, "Why the set is exactly this
  size".
- **It fixes three clashes `TEN` has today**: its red tile is `ERROR`
  itself, its blue tile is `HINT_RING`/`DRAG_ADD` (Flood's blue hint dot can
  land on a blue tile), and its green tile is `CURSOR`.
- **Retiring `TEN`** orphans no named color: `RED` stays through `ERROR`,
  `ORANGE` through Subsets and Tents, `TEAL`/`PINK`/`GRAY` through Mines and
  `palette.ts`, `BROWN` through Tents, and `YELLOW` through `PENCIL_BODY`.
  Re-check this with `palette-source.test.ts` after the move.

### Risks

- Brown in the light scheme is 0.023 from outline[2] brown. That matters
  only on a step with three outline references, and the fix belongs in the
  hint vocabulary.
- Samegame's stripes[2] amber hatch is 0.057 from olive (`TEN`'s brown was
  0.072); the hatch is edged.
- The win flash's yellow (`FLASH` = `GOAL` = `YELLOW`) equals the first
  member, as with `TEN` today.

The design subagent's mock-up (a 9x9 Path board with every mark, each member
as line, ring and disc, and a Flood mosaic, in both schemes) was shown to the
owner. Re-render it in the app; the mock-up is not evidence for the real
board.
