# color-regions-through-the-engine

**Status: scaffolded 2026-10-13 at the owner's word, not started.** It has
no `tasks.md` yet. Two of the questions below are the owner's, and the first
of them decides how much of the rest is built; the others are the session's
to settle with a drawing each.

## Why

The owner, on first playing Star Battle (2026-10-13): give the regions some
color, in this and the other region-based games, through the engine. The
reference is the board LinkedIn's Queens draws, each region filled with a
flat pastel under the heavy borders, with the app's own theme colors in
place of its hues, at a faded saturation.

Today a region is told only by the heavy line round it. On a 10x10 of two
stars the eye traces borders to learn which squares share a region, and
every deduction in the game is about a region.

## What is already there

- **The palette has the fills.** `EIGHT_FILLS` and `FOUR_FILLS`
  (`src/engine/color/colors.ts`) are washes designed as sets to be told
  apart in both schemes, and made to be written on: Map fills its whole
  board with `FOUR_FILLS`. Measured 2026-09-11, the worst pair of the eight
  stands 0.076 apart in the light scheme and 0.100 in the dark; of the four,
  0.113 and 0.120.
- **Map already colors a division so that no two neighbors match.** That is
  a rule of its puzzle and done by its solver, not a helper.
- **The engine reads any division as a number a cell**: `regionNumbers` in
  `src/engine/divide.ts`.

## What Changes

- **An engine helper gives each region of a division a fill**, such that two
  regions sharing a side never take the same one, from as few fills as the
  division needs. A Star Battle board has up to 14 regions and there are
  eight fills, so a fill a region is not enough; neighbors differing is.
- **A region's cells take that fill as their surface**, in place of
  `cellSurface`, in the games the first question below names. The border,
  the pieces, the cross, the mistake wash, the hint's ring, outline and
  stripes, the cursor and the win flash are drawn over it as they are now.
- **The fills are checked against everything drawn on them, in both
  schemes**, by the guards that already hold a board's contrasts
  (`puzzle/neighbor-contrast.test.ts`, `puzzle/hatch-contrast.test.ts`):
  a star, a cross, a digit and the hint's stripes on each fill.
- `docs/rendering.md` § "What a board looks like: pieces on a quiet surface"
  and `engine-colors`, which today say the board recedes and the content
  carries the color, say what a region's fill is and when a game takes it.

## Questions

**For the owner.**

1. **Which games.** The games whose board is divided into regions the
   puzzle gives, by `git grep -l` over `src/games` on 2026-10-13: Star
   Battle, Rome, Seismic, Keen, Solo's jigsaw and Killer boards, Mathrax,
   Separate. Recommended: Star Battle first, as the game it was asked for
   and the only one where a region holds no number or arrow of its own, then
   the rest one drawing at a time, since a filled cage under pencil notes
   (Keen, Solo) is a different picture from a filled region under a star.
   Palisade, Filling, Rect and Galaxies draw regions the player makes, and
   are not this change's.
2. **Always, or a preference.** Recommended: always on in Star Battle, with
   no preference, because a second look for one game is a second thing to
   keep right in both schemes. A game where the fill fights its content
   declines it and says why.

**For the session, each with a drawing put to the owner before it lands.**

3. **How faded.** The wash step as it stands, or a quieter step of its own
   as `TEAL_WASH_QUIET` is. The washes were tuned to be told apart as the
   whole of a Map board; under stars and crosses they may want less.
4. **Eight or four.** Four is always enough for a planar division and is
   the better-separated set; eight gives a board more variety, as the
   reference has, and needs a rule for which eight regions share with which.
5. **A mistake and a hint on a fill.** `ERROR_WASH` is a red wash and one of
   the fills is red's; the hint's stripes are blue over a blue fill. Either
   those fills are left out of the set, or the marks are shown to hold on
   them.
6. **A region the puzzle finishes.** `REGION_DONE` is a fill that says a
   region is complete, in the games that have one. A game with both needs
   one of them to give way.

## Capabilities

### Modified Capabilities

- `engine-colors`: a region's fill, the set it is drawn from and what it
  must stay readable under.
- `engine-drawing` or `engine-helpers`: the helper that assigns fills to a
  division.
- `starbattle`, and each other game that takes the fill: its `Look`.

## Impact

`src/engine/color/`, a new helper beside `src/engine/divide.ts`,
`src/games/starbattle/render.ts` and the renderers of the games question 1
names, the contrast guards under `src/puzzle/`, `docs/rendering.md`. Every
frame snapshot of a game that takes the fill changes. No save, link or
preference changes unless question 2 is answered with a preference.
