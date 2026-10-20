# Design

## What read a game's hint colors (measured 2026-10-20)

- **The repaint's measurement.** `hintReferenceMarks` found a reference's
  marks as the pixels that change when it is hidden (`markAlpha`), so a mark
  drawn in a color close to what lies under it was measured faint and
  repainted faint. This is why the departures existed: Slide's ring left blue
  because a blue ring on the blue key block vanishes, Samegame added a black
  keyline because blue measured 1.00:1 on a blue square, Crossing's and
  Galaxies' hues cleared their own blues. Query: the
  `\[COL_HINT[A-Z_]*\] *=` assignments in `src/games/*/render.ts` that are
  not an engine hint role (Crossing, Galaxies, Slide, Clusters, Singles,
  Unruly, and Subsets' reference-aid slots, which are not hint marks), and
  `COL_HINT_KEY` in Samegame.
- **The player, before the marks are measured.** The measurement waits for a
  step's move to finish sliding (`Puzzle.measureHintMarks`), so through every
  Auto-Hint move the next step's marks are on the board in the game's colors,
  unedged.
- **Copy image**, which took the game's canvas alone.
- **The game's hint palette also showed through.** A partly measured mark was
  repainted partly opaque, so the game's own color mixed into the reference's:
  stripes drawn in blue under an orange repaint read as a muted pink-gray.
- **Tests read palette indices, not colors**, except a few that asserted one
  game's legend (Singles, Range, Pattern, Slant, Unruly, Light Up, Clusters,
  Samegame); those are rewritten to the roles. The help's list of marks named a
  color in seven games (Crossing, Loopy, Pearl, Light Up, Singles, Clusters,
  Samegame), found by reading every game's `hintMarks` for color words.

## D1. The engine colors the marks over the game's frame; the export is composited

The repaint stays where it is: over the frame, from the measured marks. The
alternative, the game drawing each mark in a palette entry the engine fills
per reference, would have every game draw per reference rather than per role,
in all of its drawing paths, and would still need the measurement for the
pills, the flash and the edge. Copy image composites the repaint over the
game's canvas (`Puzzle.getImage`) from one function the view also uses
(`Puzzle.hintRepaintIn`), so the two cannot drift.

## D2. An ink's marks are measured by their coverage

The engine owns the colors marks are drawn in, one ink to a role, and finds a
game's ink slots by reference (`Midend.hintInkIndices`). While it measures,
it draws the inks in white and then in black; a pixel an ink covers by `a` is
`255a` lighter in white, whatever lies under it, and a pixel drawn alike
either way cancels (`inkCoverage`). So a mark is found whole on content of any
color, and keeps its own coverage: a 30% hatch is repainted at 30%, where the
difference had measured it at up to 75% and buried the symbols drawn over
it. A mark drawn in a content color, a struck note in pencil, is still found
by its difference. Two more full redraws a measurement, which the worker does
in the one task, after a step's move has settled.

A content slot holding the same color as an ink (Galaxies' drag preview is
`BLUE`, the ring ink) is drawn in white and black with the inks, and changes
nothing measured, being drawn alike with a reference's marks and without.

## D3. A role's ink is its first reference color

`HINT_RING`, `HINT_OUTLINE` and `HINT_STRIPES` are the first colors of their
roles in `HINT_REFERENCE_COLORS`, by reference, so a step with one reference
of each role looks the same before it is measured as after, and Auto-Hint's
in-between frames show the colors the pills name.

## D4. Rings and outlines take a slot of the game's; stripes are the engine's

A game draws a ring in its `HINT_RING` slot and an outline in its
`HINT_OUTLINE` slot. Both are drawn with the general primitives (rects, lines,
circles, text), which take a palette index, so a game holds the slot; the
guard (`hint-ink.test.ts`) holds it to the role. A hatch is drawn only for
stripes, so `drawHatch` takes no color: it paints the stripes ink, which
`resolvePalette` appends to every palette. A game cannot pick a stripes color
because it has nowhere to say one.

Declined: engine-reserved palette indices for the ring and the outline too.
It would take the slot from every game, but at the cost of renumbering every
palette and every test that finds a mark by its index; the guard holds the
same line.

## D5. The legend colors are retired, and Light Up outlines its evidence

The premise colors (`HINT_BLACKREF`, `HINT_WHITEREF`, the oranges and greens
of Clusters, Singles and Unruly) were seen only before measurement, since each
reference has its own color on screen; their slots fold into each game's
outline slot. Light Up washed a dark evidence square; a wash in a mark's ink
is a fill, so it rings it as it ringed a lit one, one shape for the role, and
`HINT_EVIDENCE_WASH` and its quiet teal go.

## D6. The stripes colors are held to the hatch's symbol bar

Magnets' guard holds a symbol under stripes to 0.72 of its contrast, or
4.5:1. It measured the game's blue hatch, which the screen stopped showing
when references took colors; measured on the three stripes colors a reference
takes, the `?` on an empty domino read 4.47:1 under the first in dark (bar
4.5), and 3.11 and 3.44 under the second and third in light (bar 3.49). The
owner chose (2026-10-20) to retune the colors, lightness only, over relaxing
the bar or thinning the hatch: each moved to the nearest two-place lightness
that clears every bar the reference colors and the hatch are held to (dark
amber 0.84 to 0.83, light red 0.50 to 0.59, light bronze 0.50 to 0.52), and
the guard measures all three.
