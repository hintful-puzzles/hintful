# give-map-colors-clear-of-the-hint-pools

**Status: filed 2026-10-19 by `show-what-a-hint-names`**, on the owner's
decision: "if we can just change Map's own colors so that we don't need an
exception, that'd be better" than letting a game choose its hint pool.

## Why

A hint's references each take a color of their own from their role's pool
(`HINT_COLOR_POOLS` in `src/puzzle/puzzle.ts`: blues and a violet for what a
step decides, greens for what it reasons from, oranges, an amber and a pink
for the line it names), and their marks are repainted in it. A game whose
own content is drawn in those hues makes a mark read as content, or content
as a mark. Map's four region fills are the engine's `FOUR_FILLS`
(`src/engine/color/colors.ts`, `MAP_ORDER` over `REGION_ORDER`: pink, yellow,
teal and violet as of 2026-10-19), which Star Battle also uses, and three of
them sit near a pool shade: violet (`#7048e8`), teal (the greens and
`#22b8cf`) and pink (`#d6336c`).

## What changes

- **The pools and the engine's region and content colors are kept apart by
  construction**: a test over every color a game can draw content in (the
  palette's region fills and every game's `colors()`), against every pool
  shade, in both schemes, by the same distance measure the palette's other
  rules use. A population derived from the games, not a list.
- **Move what the test convicts**: Map's (and Star Battle's) fills where they
  can move, or a pool shade where it is the one out of place. No game takes
  an exception; a pool moving is the engine's change for every game.
- Map's help and spec, wherever they name a region color the move changes
  (`FOUR_NAMES` words: a hint says a region's color by name, so a renamed
  color changes sentences too).

## What has to be settled

- Whether a pale region fill and a strong pool stroke are already far enough
  apart to read as different things, which the test's measure must answer
  before any color moves: measure first (`docs/method.md`).
- Saves and shared links hold a region's color index, not its hue, so moving a
  hue breaks no save; confirm before changing one.
