# light-the-line-in-the-win-flash

## Why

The owner (2026-11-12): "I like how the win animation looks in Tracks, where
the track itself gets highlighted — can we do this across all games where
there is a track/path/curve to follow? The one that I'm currently bothered
about is Path, where it highlights the grid squares rather than the path
elements."

Path's flash already ran along its line, number to number, but it filled
each square's ground, so the line the player drew disappeared into a moving
block of yellow. Tracks, Pearl and Loopy light the line itself.

## What changes

- Path lights its line in the flash's tones and leaves the squares as they
  are. A lit line is edged in black as a pair's line is, so the white lead
  reads on the pale squares.
- `engine-colors` says which element a board drawn as a line lights: the
  line, not the ground under it.
- `engine/win-flash.test.ts` compares what a frame paints, not the palette
  indices it was painted with. Path's yellow pair is the flash's body color
  exactly, so on that stretch the body changes an index and no pixel, and
  only the lead shows it. That is the case the engine's two tones exist for
  (`win-wave.ts`, `WinTone`), and the check's own comment allows it.

## Which games, and why only Path

Surveyed 2026-11-12, every game whose flash position is a route
(`rendering.md` § "The win flash"):

| Game | Route | Lit before | Now |
| --- | --- | --- | --- |
| Tracks | path | the track | unchanged |
| Pearl, Loopy | loop | the loop | unchanged |
| Path | path | the squares | **the line** |
| Ascent | path | the squares | unchanged: the line between numbers is short dashes between number discs; lit alone, the flash barely shows (seen in the app) |
| Signpost | path | the squares | unchanged: the route is arrows, not a drawn line |
| Net, Netslide | network | the tiles | unchanged, pending the owner: the tile is the piece the player turns or slides, and its wires are thin |
| Flood | network | the cells | unchanged: regions, no line |

## Engine level

The engine already owns the route, the clock and the two colors; the game
says only where each element sits and paints it. What a lit element looks
like stays the game's, because only the game draws its line (Tracks' rails,
Path's edged strokes, Loopy's edges). The rule is the engine's, in
`engine-colors`, so the next game drawn as a line lights its line.
