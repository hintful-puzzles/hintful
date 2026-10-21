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

## D2 — How Path assigns colors

A pair's color is its number's index into the set, wrapping: numbering runs
in reading order, so repeats fall far apart on the board more often than
not. Measure how often two pairs of one color sit side by side on dealt
boards, and if often, assign by a coloring of the pairs' adjacency instead,
recorded here.

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
