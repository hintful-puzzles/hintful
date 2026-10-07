# give-the-boards-a-visual-identity

**Status: scaffolded, not started (2026-10-04).** Owner, on Unruly in the dark
scheme: *"it just looks really boring, with almost no contrast. Would this be an
opportunity to do a catalog-wide sweep, and see about giving Hintful more of a
consistent visual identity, especially (but not only) in dark mode."*

## Why

The collection has no look of its own. A contact sheet of every game in both
schemes (2026-10-04, `scripts/checks/contact-sheet.test.ts`) shows nearly every
board as upstream's gray surface with black ink and bevels; color appears only
where a game happened to need a set of it (Flood, Map, Tents, Guess). Several
games carry their whole state in steps of gray: Unruly's three tile states,
Flip, Pattern, Slide.

`keep-colors-apart-in-dark-mode` holds the measurable half (two things drawn
side by side can be told apart). This change is the half only the owner can
judge: what a Hintful board looks like.

## The starting point, to be worked through

Two inspirations, neither of them the answer:

- **LinkedIn's Tango**, the same puzzle as Unruly, in its dark scheme: the board
  is one quiet dark surface with thin grid lines, and the two states are
  saturated pieces that also differ in *shape* (a sun and a moon). Given cells
  sit on a slightly lighter cell.
- **The "B-hues" mock-up** (`reference/unruly-variants.png`, middle row): a
  palette swap of Unruly with no game code changed. In OKLCH: board 0.9 light /
  0.2 dark, undecided cells a small step off the board (0.84 / 0.26), grid a
  step further (0.72 / 0.36), and the two tile states an amber (L 0.80, C 0.15,
  h 75) and a blue (L 0.56 light / 0.62 dark, C 0.17, h 258). The top row is
  the game as it ships; the bottom row is a monochrome fix that separates the
  three grays and does nothing else.

The owner's verdict (2026-10-04): the *contrast* of B-hues is what is wanted,
and **not that pair of colors**: blue and amber are Tango's own pair, and they
are also close to Ukraine's flag. So the first decision is which two hues.

## The mock-ups put to the owner (2026-10-07)

`reference/unruly-mockups.html` draws them (open it in a browser; the `.png`
beside it is a capture). It is a drawing of its own and not the game's
renderer, so that it can vary shape as well as hue. Three sections, one per
decision:

- **A, the pair.** Unruly already draws in four hues that mean something: red
  (errors), blue (the hint's ring and hatch), green (the cursor) and orange
  (the hint's outline). A tile in one of them swallows that mark, so the pair
  comes from teal, purple, pink and yellow. A6 keeps black and white, as
  stones on a quiet board, which leaves the hint's words true.
- **B, shape.** Hue only, a square and a disc, or a flat tile with a small
  mark.
- **C, the given-cell mark.** Today's bevel, a dot, a given that fills its cell
  where a placed tile is inset, or Tango's lighter cell under the given.

The two states stand apart in lightness in every pair, on purpose: that
difference is what a color-blind player is left with when hue alone carries
state. It is not the equal weight question 1 asks for, and where the two
conflict the owner's eye decides.

**The owner's answers (2026-10-07): A1, B2 and C4/C5.** Purple and yellow; a
square and a disc; a given told by a lighter cell under it. Two more asks came
with them: the pair is to be set up so that a choice of themes is easy to add
later (not built now), and the same colors and style go across the entire
catalog straight after Unruly, which is not to be a look of Unruly's own.

## Questions this change has to answer

1. **Which pair for a two-state game.** The palette ties blue's and orange's
   bold steps at equal weight for Crossing (`colors.ts`), and the same property
   is wanted here, since neither state is the important one. A different pair
   needs the same tie.
2. **Whether state is carried by shape as well as hue.** Hue alone fails a
   color-blind player; Tango's pieces differ in outline too.
3. **The words.** Unruly's hint sentences and help page say "black" and
   "white". A tile that is neither falsifies them, so the words change in the
   same change as the tiles (`docs/games/hints.md` § "Bind the words to the
   marks").
4. **The given-cell mark.** Unruly marks an immutable cell with an inset bevel
   square, which nearly vanishes on a saturated tile in the mock-up.
5. **What the shared rules are**, stated once in the engine and not per game.
   Candidates the contact sheet suggests: the board recedes and content carries
   the color; state is never carried by a gray step alone; a bevel is kept only
   where the tile is an object the player moves (Fifteen, Sixteen, Twiddle,
   Slide).
6. **Which games it reaches, and in what order.** Unruly first. Each family is
   player-visible and is the owner's to accept.
7. **Where the dark board sits.** It is painted at lightness 0.355 (measured
   2026-10-04 through `scheme-palettes.ts`, and in the owner's screenshot);
   Tango's is near 0.23. The mid gray that sixteen games draw their grid in
   stands 0.27 off the board in the light scheme and 0.085 off it in the dark,
   and dark `GRAY` cannot rise to meet it (brown pins it in the ten-color set).
   A lower board opens that gap for every game at once.

## What Unruly is today

After `keep-colors-apart-in-dark-mode`, in the dark scheme: the black tile
stands 0.155 of lightness off an undecided cell (0.28 in the light scheme),
which is as far as a beveled gray tile can go, and the grid line between two
white tiles stands 0.03 off them, so adjacent white tiles close up. Both are
this change's to fix.

## What Changes

- **The engine owns the look of a board of pieces.** `colors.ts` holds the
  two-state pair and its words (`TWO`, `TWO_NAMES`); `palette.ts` the surface
  roles (`cellSurface`, `surfaceGrid`, `givenSurface`); `engine/piece.ts` the
  piece painter, the pair's shapes and the help placeholder `{{pair:N}}`.
- **Unruly is pieces on a quiet surface**: purple squares and yellow discs,
  inset, a given on a lifted cell, a thin grid. Its bevels and its two gray
  tile bases are gone, and with them the collection's only absolute color in
  `palette-games.ts`. The count error's `!` is a badge, since red ink on a
  purple piece differs in hue alone. The completion flash lifts every cell.
- **Unruly's words follow the pieces**: hint sentences, the Controls verbs and
  the hint-marks legend take the pair's names, and the help page names them by
  placeholder and says the shapes.
- **Clusters and Flip take the pair**; Clusters' hint ring returns to the
  collection's blue, which is no longer one of its paints.
- **Pattern, Mosaic, Range, Singles and Bricks** take the owner's second
  choice (`reference/shading-mockups.html`, S1): a shaded cell is the pair's
  purple square alone (`SHADED`), a cell ruled out is a small dot, an
  undecided one is plain surface. Their words say `SHADED_NAME` and
  `UNSHADED_NAME`.
- **Every other game takes what of the look fits it**: cells on the quiet
  surface with a thin grid, a given or otherwise settled cell on the lifted
  surface, no state that is a step of gray alone, and no bevel on a thing the
  player does not move (Mines, Pegs, Black Box, Flood, Same Game, Inertia,
  Sokoban, Crossing lose theirs). A game's own identity stays: Flood's and
  Guess's colors, Map's regions, Tents' trees, Undead's monsters.
- **Shared colors that moved**: `HINT_WHITEREF` from purple to pink, since
  purple is now a piece; `highlightWash` authors a dark value below the cell,
  so a selected cell is not taken for a given; a wall is the flat `wallFill`.
- **An independent review of every board** (task 4.1) changed Pearl, Ascent,
  Tracks, Clusters, Galaxies, Fifteen, Sixteen, Twiddle, Netslide, Spokes and
  the five wall games; the commit that made the fixes lists them.
- **The pair goes further** (owner, 2026-10-07, on seeing the catalog: more of
  the theme colors where a board is still mostly gray or carries a hue with no
  reason). Three roles on the pair: `MOVED`, `GOAL` and `REGION_DONE`.
  Cube's paint and Sokoban's barrel are `MOVED`; Sokoban's target, Inertia's
  gem and Rome's goal are `GOAL`; a finished region in Rect, Filling,
  Palisade and Separate is `REGION_DONE`, a wash of purple where it was a
  darker gray. Net's and Netslide's endpoints and powered wire are the pair
  and their barrier leaves the error's red. Dominosa's dominoes, Boats' ships
  and Sticks' sticks are `SHADED`, and Untangle's points the pair's disc.

A player who knew a board by its old colors meets new ones: a Clusters, Pegs
or Black Box piece that was blue or red, a Sokoban target, a shaded cell that
was black. Nothing a player has saved or shared changes.

Not changed: the save and game-ID formats, and what any control does.

## Acceptance

The owner's, by eye, in both schemes.
