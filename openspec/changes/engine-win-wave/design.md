## Context

The midend already owns *when* the win flash plays (`becameSolved`) and runs
its clock. A game owns the rest: `solvedFlash` gives a length, and `redraw`
turns `flashTime` into whatever that game paints. There is one canvas, a game
paints every pixel of it through its own tile cache, and the engine knows
nothing of a game's geometry: not its grid, not its cells.

The owner's decisions (2026-10-11): one traveling highlight in every game,
routed along a path, around a loop from the bottom left clockwise, outward
from a source, or as a diagonal sweep from bottom left to top right; a fixed
length, about 2 seconds, on every board; Map's and Signpost's own styles go.

## Goals / Non-Goals

**Goals:**

- The length, the pace, the width of the highlight and the reduced-motion
  form are written once, in the engine.
- A game with no path, loop or source writes one expression to join, and
  makes no decision.
- A game cannot give its win a length or a rhythm of its own.

**Non-Goals:**

- A flash that is not a win. `flashLength` and its games are untouched.
- An engine that knows a game's geometry.

## Decisions

### The four routes are one number: a position, in steps

A path is "which step from the start", a loop "which step clockwise from the
corner", a spread "how many connections from the source", and a sweep "which
diagonal". So the game hands the engine one number per element, its
**position**, in steps: neighbors along the route are one apart. The engine
runs a head from the lowest position to the highest.

`redraw` takes a `Flash` in the place of `flashTime`:

```ts
interface Flash {
  /** Seconds into the flash `flashLength` asked for; 0 when none runs. */
  readonly time: number;
  /** Whether the win's highlight is on the element at `position`. */
  win(position: number): boolean;
}
```

and a game asks per element, in the loop where it builds a cell's flags:

```ts
if (flash.win(sweepStep(x, y))) flags |= DS_FLASH;   // any game
if (flash.win(order[i])) flags |= DS_FLASH;          // a path
```

*Against a declared route* (`winRoute(state)` returning positions by element
index): the declaration and the render would have to agree on what index an
element has, which is two places a game can disagree with itself, and every
sweep game would write the same declaration. One call at the paint site is
the whole contract, and the engine consumes it.

*Against the engine painting the highlight*: it would need an overlay layer
and every game's element geometry, and a game's tile cache would not know to
repaint what the overlay left.

### The engine learns the route's extent from what it was asked

The head needs the lowest and highest position. The game does not declare
them: a wave records every position it is asked about during a frame, and the
midend commits that range when the frame's `redraw` returns. The frame after
uses it. The first frame of a win therefore lights nothing and measures, a
sixtieth of a second out of two.

The range is committed per frame and never inside one, because the repaint
differential (`engine/testing/repaint-differential.ts`) paints each frame
twice, hot and cold, and the two must be told the same thing.

*Against a measuring pass with a no-op drawing*: exact from the first frame,
but a second `GameDrawing` implementation in production for one frame.

A game that asks nothing has no extent after the first frame; the midend ends
that flash at once, so the dialog is not held for an animation that is not
playing. The cross-game guard below is what keeps a game from being that.

### Length, band and clock

- `WIN_FLASH_S = 2`. The head travels from the lowest position to the highest
  plus the band, so the last element goes dark as the time ends.
- The band is a share of the route (`WIN_BAND`, tuned by eye in the app, and
  recorded in the constant's comment), and never under one step, so a 2x2
  board has no dark gap between its diagonals. A share and not a count of
  squares: at a fixed length a three-square band on a 130-square track would
  light each square for under a twentieth of a second.
- The win's clock starts when the move's own animation ends. Today the two
  run together, and a highlight would cross tiles that are still sliding.
- Reduced motion: the frontend tells the midend, and the wave answers true
  for every position through a shorter, still flash (`WIN_STILL_S`).

### Helpers a game reaches for

In `src/engine/win-wave.ts`:

- `sweepStep(x, y)`: `x - y`, lowest at the bottom left. Any coordinates with
  y downward serve: a grid's, or pixels for a board that has no grid
  (Untangle's points, Map's regions by their label point).
- `loopSteps(points)`: for a closed route's elements in order, each one's
  step, starting from the element nearest the bottom-left corner (the lowest
  `sweepStep`) and going clockwise on screen, by the sign of the enclosed
  area.
- A path and a spread need none: the game already has the order (Tracks'
  `trackOrder`, a number in Ascent and Signpost) or a breadth-first distance.

### What "lit" paints is one color, the `FLASH` role

The first deploy kept each game's own lit look: a cell lifted to a surface, a
line in the paper's tone, Tracks' rails in yellow. The owner saw it and chose
one highlight color for every game (2026-10-11). `FLASH` was already the one
role every line-lighting game assigned, so the role itself becomes the
theme's yellow, and a cell's ground is filled with it where it was lifted.

A census of the resolved palettes (2026-10-11) found no color that no game
draws with: yellow is in 29 games' palettes, and every other hue in some. So
the rule is about the ground, not about a free color: the lit element's
*ground* is yellow and what it holds is drawn on top. A yellow piece on a lit
cell merges with it for the third of a second the highlight is there, which
reads as the cell lighting.

The color has no hook and no engine-drawn overlay: a game gives the role a
palette slot and paints its ground with it, and the cross-game guard lights
each element alone and requires more of that color in the frame than the
settled board has. `drawCellBackground` takes the slot and a `HIGHLIGHT_WIN`,
so the games that share that painter write one expression.

### What the conversion found, and what was done about it

- **A given did not light.** Lifting a lit cell to the given's surface shows
  nothing on a cell that already rests there, and eight games had such cells.
  The cross-game guard lights each element alone to catch it. The one
  highlight color ended it: yellow is no cell's resting surface.
- **Scattered elements left the board dark.** Untangle's points and Map's
  regions, swept by where they are drawn, have stretches of the diagonal with
  nothing on them. Both rank their elements along it (`sweepRanks`).
- **Black Box's blink was its win.** A reveal is the one move that solves its
  board, so its `flashLength` always replaced the win flash. It takes the
  sweep, and the Solve command reveals with no flash.
- **A hint step outlived its move.** The midend settled a displayed hint when
  the flash ended, so a step that solved the board stayed shown through the
  win. It settles when the move comes to rest.
- **The band is 15% of the route**, narrowed from 20% after seeing Tracks.
- **Two games asked twice.** The guard's one-element probe counts questions,
  so a redraw that paints in two passes asks before them.
- Net and Netslide each wrote the search along the wires; it is
  `wireDistance` in `engine/wires.ts`.

### `solvedFlash` is removed, not defaulted

A hook a game may still write is a length a game may still choose. With the
hook gone, `flashLength` is the only duration a game returns, and it is for
what is not a win.

## Risks / Trade-offs

- A game that never asks `flash.win` shows no animation. → A cross-game guard
  drives every game to a win through the midend and asserts that frames of
  the flash paint differently from the settled board, and that the first lit
  element is not the last.
- A game asks about only some elements on some frames, so the extent moves
  between frames. → The range only ever widens within one win.
- Fifty-odd renders change by hand. → Each is run in the browser; the render
  snapshots of flash frames are re-read, not re-baselined blind.
- The dialog arrives later than it did. → Stated in the proposal; the owner
  chose the fixed length.

## Migration Plan

One commit for the engine and every game, since the `redraw` signature moves
for all of them at once. A stored `flash-type` preference for Map or Signpost
is ignored on load: a preference is applied by key, and a key no game
declares is not applied.

## Open Questions

None.
