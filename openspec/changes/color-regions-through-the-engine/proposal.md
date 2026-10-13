# color-regions-through-the-engine

**Status: built and committed 2026-10-13, not pushed, waiting for the
owner's word on the look** (`tasks.md` § 5). The session's questions are
settled in `tasks.md` § 4, and the change grew at the owner's word past
what is written below: the fills are a region palette of their own
(`REGION_FILLS`) and not the washes; Map takes its first four, with pink
where its red was; and Map's generator and the renderer share one coloring
walk. What the palette's design left for other games is `tasks.md` § 6.

**Where the first session stops.** The owner's word, 2026-10-13: work until
there is a screenshot of a colored Star Battle board to show them, then wait
for them to approve the look. So build it, run the app, take the screenshot
in both schemes, show it to the owner (the `herdr-open` skill opens an image
where `HERDR_PANE_ID` is set; otherwise give the path), and stop. Commit the
work so it is not lost, and do not push until the owner has approved, since
a push deploys the look to players. This overrides the brief's "push without
asking" for this change only.

## The owner's answers (2026-10-13)

- **Which games: Star Battle only, to start**, "and seeing how it goes from
  there". The other region games are not this change's. The engine helper
  is still the engine's, so that the next game takes it by a declaration.
- **Always on, with no preference.**
- The session's own questions (3 to 6 below) were agreed as recommended:
  each is settled by what the session sees on the board and shows the owner
  in the screenshot.

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

**For the owner**, both answered above.

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
