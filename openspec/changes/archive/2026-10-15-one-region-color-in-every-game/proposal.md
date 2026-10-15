# one-region-color-in-every-game

**Status: done 2026-10-15, at the owner's word, and archived with its
commit.** It follows `color-regions-through-the-engine`, archived the same
day, which gave Map its own stronger dark values for the region palette's
first four.

## Why

The owner, comparing Star Battle and Map in the app (2026-10-15): "I do know
that I want consistency", and after seeing Map drawn on Star Battle's dark
values beside Map as it was, "please go ahead". A yellow region should be
one yellow in every game, in both schemes.

The same day the owner asked for Signpost's near-identical chain colors to be
fixed while the context was fresh: two of its sixteen region backgrounds,
mixes of two washes that had both gone gray, stood 0.009 apart in the light
scheme and 0.012 in the dark.

## What Changes

- **Map's four are the region palette's first four, themselves**, in both
  schemes. Its pencil stipples, dots of a color on a region with no color
  yet, take a stronger dark value of their own (`FOUR_FILL_MARKS`), since a
  dot of the fill's dark value measured 1.3:1 on that surface.
- **Signpost's chain colors are the region palette's eight**, in the order
  that stands each furthest from the next, after the gray of a chain anchored
  to the given numbers. A ninth floating chain takes the first color again;
  its letter tells it apart. The numbers and arrows drawn on a chain author
  their dark values, which lifts the mid strength from 1.03:1 to 2.35:1 on
  its chain in the dark scheme.
- `EIGHT_FILLS`, which only Signpost used, goes.

## Measured (2026-10-15)

| | before | after |
|---|---|---|
| Map, dark: error outline on a fill | 1.48:1 | 2.66:1 |
| Map, dark: hint band on a fill | 1.61:1 | 2.90:1 |
| Map, dark: colored region off an uncolored one | 0.20 | 0.10 |
| Signpost: closest two chain colors, light / dark | 0.009 / 0.012 | 0.072 / 0.082 |
| Signpost: chain off a plain square, light / dark | 0.040 / 0.059 | 0.062 / 0.058 |

## Cost

- Map's dark "yellow" reads as an ochre and its "pink" as a maroon. The
  hint's word always matches the swatch on the key that enters it.
- A Signpost board with nine floating chains at once shows two of one
  color, where it used to take nine: this stretch of the palette repeats
  rather than mixing.

## Capabilities

### Modified Capabilities

- `engine-colors`: the region palette is one value a scheme in every game;
  a mark of a fill's color has its own dark value.
- `signpost`: its chain colors.

## Impact

`src/engine/color/colors.ts`, `src/engine/color/palette-games.ts`,
`src/games/map/render.ts`, `src/games/signpost/render.ts`, their tests and
snapshots, `docs/rendering.md`.
