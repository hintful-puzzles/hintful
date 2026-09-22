# deal-boards-in-portrait

**Status: implemented 2026-09-22, awaiting owner acceptance.** Owner-requested,
2026-09-21. The owner took both recommendations below on 2026-09-22.

## Why

The owner expects **a phone held upright** to be the main way players play:
*"I expect mobile play in portrait orientation to be the main form factor for
our players, but currently we have a ton of non-square board types default to a
landscape proportion (e.g. magnets 6x5, or tracks 15x10)."* A landscape board on
an upright phone is drawn at the width of the screen and wastes most of its
height, so every square is smaller than it needs to be.

The board sizes are upstream's, chosen for a desktop window, and nothing here
has revisited them since. Matching upstream is not a reason to keep them
(`AGENTS.md` § "Byte-parity was a tool").

## What the tree does today (measured 2026-09-21)

A throwaway census read each registered game's `defaultParams()` and every
preset leaf for a `w`/`h` (or `width`/`height`) field. Re-run it before
designing against it; the figures are a snapshot, not a contract.

- **Default is landscape in 9 games:** Ascent 7x6, Bricks 7x6, Filling 13x9,
  Inertia 10x8, Magnets 6x5, Map 20x15, Range 9x6, Slide 7x6, Sokoban 12x10.
- **Presets include landscape sizes in 25 games**, among them every preset of
  Bricks, Filling, Inertia, Magnets, Map, Range, Slide and Sokoban, and some
  of Ascent, Loopy, Mines, Net, Palisade, Pearl, Samegame, Sixteen, Slant and
  Tracks (10x8 and 15x10).
- **Portrait presets exist in two games only** (Boats, Pegs).

**The census measured the wrong unit, and the change must not repeat it.** A
`w > h` in params is not a landscape board on screen. Magnets adds a clue margin
on every side; Loopy's and Ascent's non-square tilings have cells that are not
square, so "4x5 Great-Hexagonal" may draw wide or tall regardless of the
numbers; and Unruly, Cube and several Latin games name their dimensions in other
fields, so the census counted them as having none. The measure that matters is
the **aspect of `computeSize(params, tileSize)`**, which every game already
answers. Take the census again on that (`AGENTS.md` § "Check the instrument
before the finding").

## What changes

### 1. Portrait by default

Every default and preset that draws wider than tall is flipped to draw taller
than wide: 6x5 becomes 5x6, 15x10 becomes 10x15, and preset titles follow. Most
games need nothing more than swapping two numbers. Board shapes that are not a
transpose (Pegs' boards, Loopy's tilings) are read one by one and decided on
their own merits.

What this does **not** touch, and why:

- **A player's remembered size** (`settings.getParams`) is their choice, and it
  stays. Only a player who never chose a size sees the new default.
- **Saved games and shared game IDs** carry their own params and descs, and
  load exactly as they were. A flipped default only affects new deals.
- **The frozen differentials** that pin a landscape size stay as they are:
  they test the generator at that size, which remains legal. A test that pins
  the *default* is re-read, not re-baselined blindly.

### 2. Deal to fit the screen, where orientation does not matter

For a game whose rules are the same whichever way round the board is, deal the
board **in the orientation of the viewport**: an upright phone gets 5x6, a
landscape tablet or desktop gets 6x5, from the same preset. This is a decision
made **when a board is dealt**, never afterwards: an in-progress game is a fixed
puzzle, and a turned phone does not reshuffle it.

This splits into three questions the change must answer before building:

- **Which games may be dealt either way round.** The test is `AGENTS.md`'s: *can
  we say what a game would legitimately want to do differently?* Most
  rectangular-grid logic games have no preferred orientation. Some genuinely do:
  **gravity** (Samegame's tiles fall and its columns close leftward, and Bricks'
  bricks rest on what is below, so a tall board is a different game, not a
  rotated one), a **tiling with a direction** (a hex or triangular Loopy grid
  transposed is a different tiling), and any game whose clue or goal sits on a
  particular side. Derive the exception from something the game already has
  rather than a new roster, where that is possible (`AGENTS.md` § "Convention
  over configuration": derive the exception from a declaration the game already
  makes); where intent genuinely cannot be observed, the ledger shape from
  `docs/games/testing.md` § "How a cross-game guard finds its population"
  applies.
- **What the type menu shows.** `Puzzle.currentParams` labels the menu by
  matching params against presets. A 6x5 preset dealt as 5x6 must still read as
  that preset, not as "Custom", so presets need to match up to transposition,
  and the Custom dialog has to show the size the board really is.
- **What "the viewport" means.** The app already derives a layout orientation
  (`--app-orientation` in `src/css/common.css`, read by `screens/screen.ts`),
  but that answers "where do the panels go", which is not the same question as
  "which way round does this board fit best". Candidates: compare the board
  area's aspect with `computeSize` both ways round and take the larger tile
  size. That is measurable and honest, and it leaves square boards alone
  automatically.

**Considered and not recommended: rotating the view instead of the board.**
Drawing an existing game transposed would let a turned phone re-fit a game in
progress, but pointer mapping, keyboard arrows, and every hint sentence that
says "row" or "column" would all have to swap. That is a cross-cutting
presentation layer for a small gain over dealing each board to fit.

## Player-visible, and the owner's calls

All of this is player-visible, and the owner asked for it by name, so they
decide whether it landed. Two points to raise **before** building, with the
cost stated:

- **Preset titles change** ("6x5 Easy" becomes "5x6 Easy"). Harmless, but a
  player who knows the old names will notice.
- **A remembered size and auto-orientation interact.** If a player picked "6x5"
  on a desktop and later plays on a phone, should that remembered size be dealt
  as 5x6? Recommendation: yes, for a game that may be dealt either way. The
  choice they made was a size, not an orientation.
