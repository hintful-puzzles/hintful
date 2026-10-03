# keep-colors-apart-in-dark-mode

**Status: scaffolded, not started (2026-10-03).** Owner, on Sokoban's dark
walls: *"please fix this in the engine colors across all games."*

## Why

On a phone in the dark scheme, Sokoban's walls could not be told from its
floor: the derived dark wall sat 0.03 of lightness off the floor. The light
scheme had the same small step but carried the shape with a white bevel; the
dark bevel is too dim to. `walk-by-tap-push-by-drag` fixed the shared
`wallColor` role (Sokoban and Inertia) by authoring its dark value, held by
`src/puzzle/wall-contrast.test.ts`. The owner asked for the same in every game.

## What a first census found (2026-10-03)

Every registered game's palette, as the app paints it (`scheme-palettes.ts`),
looking for a near-gray color within 0.05 lightness of the board in the dark
scheme though 0.02 or more off it in the light scheme. Sixteen indices in five
games. **This instrument is crude and its findings are unverified:**

- **Equally close in both schemes** (gap 0.025–0.048 both ways): Group 6,
  Mines 1, Undead 8, and eleven Signpost indices. Each is either a deliberately
  subtle tint or the walls' problem (a step the light scheme's bevel or ink
  carried). Which, is per role.
- **Collapsing in the dark scheme**: Slide 5 and 20 (0.19 and 0.28 off the board
  in light, 0.006 in dark) and Unruly 6 (0.55 to 0.03). These look like the
  real finds, **but dark mode swaps each highlight with its lowlight**
  (`augmentation.ts`'s `paletteSwaps`), so an index does not name the same role
  in both schemes (`dark-palette.ts`), and comparing one index across schemes,
  as this census did, can report a swap as a collapse.
- **Measured against the board only.** Two roles drawn side by side (a wall
  and the floor beside it, a filled cell and an empty one) matter whatever
  their distance from the background, and the census did not look at pairs.

## What Changes

1. **The instrument first**: for each game, the pairs of roles a player must
   tell apart, taken from what the renderer draws next to what, compared in
   each scheme by role rather than by index. Prove it on Sokoban's walls before
   the fix (it must flag them) and after (it must not).
2. **Classify each finding** against the game on screen in the dark scheme.
3. **Fix at the shared role**, as `wallColor` was: an authored dark value with
   `token(light, dark)` (docs/games/rendering.md § "Dark mode is the app's
   concern"), not a per-game patch.
4. **A cross-game guard** that holds the pairs apart, replacing
   `wall-contrast.test.ts`'s two-game table.

## Acceptance

How the boards look, so the owner's, on a phone in the dark scheme.
