# keep-colors-apart-in-dark-mode

**Status: implemented 2026-10-04, and accepted by the owner on the deployment
the same day.** Owner, on Sokoban's dark walls: *"please fix this in the engine
colors across all games."*

## Why

On a phone in the dark scheme, Sokoban's walls could not be told from its
floor: the derived dark wall sat 0.03 of lightness off the floor. The light
scheme had the same small step but carried the shape with a white bevel; the
dark bevel is too dim to. `walk-by-tap-push-by-drag` fixed the shared
`wallColor` role (Sokoban and Inertia) by authoring its dark value. The owner
asked for the same in every game.

## The instrument

A first census (2026-10-03) compared each palette index with the board across
schemes. It could not see two roles drawn side by side, and it compared one
index's light and dark values though dark mode exchanges some indices.

The instrument that replaced it reads a game's draw record
(`engine/testing/painted-neighbors.ts`): the frame is painted into palette
indices and every pair that ends up side by side is taken, as two areas, a mark
on an area, or a glyph on what is under it. Each pair is measured within a
scheme (`puzzle/neighbor-contrast.ts`), and its light distance is taken by
role, through the swap partner where there is one.

**What it reads is two frames per game**: the deal, and the board fourteen hint
steps in where the game has a hint. Measured 2026-10-04: 57 games, 732 pairs.
A color only input or an error brings out (a drag, a mistake, the solved flash,
a hint's marks, a cursor in most games) is on neither frame, and nothing here
says those are fine.

Proved on the walls: with `wallColor`'s authored dark value removed the guard
fails for Sokoban and Inertia, and with it restored it passes.

## What it found

Under a floor of 0.07 in the dark scheme (areas outright; marks and glyphs only
where the light scheme gave twice the distance):

**Fixed**

- **Mines** drew a dark red grid in the dark scheme. Its bevel swap named
  indices 16 and 17; a color had been dropped above the bevel, so the pair was
  exchanging the lowlight with the wrong-number wash. Found by looking at the
  contact sheet, not by the pair measure. Now `[15, 16]`, and held by
  `palette-swap-names.test.ts`, which fails on the old pair.
- **Range**'s grid was ink, which is white in the dark scheme, so a run of
  pinned-white cells closed into one bar with no lines between the cells a clue
  counts. The grid is now `GRID_DARK`, as in Pattern.
- **Unruly**'s black tile sat 0.03 off the board and 0.12 off an undecided
  cell. Its dark base is now the lowest the bevel allows: 0.07 and 0.155.

**Close on purpose** (the guard's ledger, one entry each): a grid line beside a
cursor fill or a bevel edge (Abcd, Black Box, Crossing, Sokoban); a tint as
faint in the light scheme (Group's diagonal, Tracks' grid); a shape an outline
or a bevel carries (Mines' covered square, Undead's vampire, Guess's white
peg, Slide's lowlight edge); a fill beside the board's margin, which is not a
state (Signpost, Unruly).

**Left, and said so**

- **Unruly's grid line between two white tiles** stands 0.03 off them in the
  dark scheme, so adjacent white tiles close up. It is in the ledger as a
  defect. Unruly's tiles are redrawn by `give-the-boards-a-visual-identity`,
  which the owner opened for it.
- **The mid-gray grid in sixteen games** (`GRID_MID`, `UNDECIDED`) stands 0.27
  off the board in the light scheme and 0.085 in the dark. It clears the floor
  and reads as a quiet grid. Raising dark `GRAY` is not free: it is the tenth
  member of the ten-color set, and brown pins it at or below 0.45. Whether the
  dark board should sit lower instead is a question about the look, passed to
  `give-the-boards-a-visual-identity`.

The first census's other candidates were not defects: Slide's 5 and 20 are the
two edges of a bevel that dark mode exchanges, and the Signpost, Group, Mines
and Undead indices are as close in the light scheme.

## What Changed

1. `engine/testing/painted-neighbors.ts` and `puzzle/neighbor-contrast.ts`, the
   instrument.
2. `puzzle/neighbor-contrast.test.ts`, a case per registered game, replacing
   `wall-contrast.test.ts`'s two-game table.
3. `palette-swap-names.test.ts`, holding each swap pair to the constants it
   addresses.
4. The three fixes above.
5. `scripts/checks/contact-sheet.test.ts`: every game in both schemes on one
   page, with the close pairs beside it.

## Acceptance

How the boards look, so the owner's, on a phone in the dark scheme: Mines,
Range and Unruly.
