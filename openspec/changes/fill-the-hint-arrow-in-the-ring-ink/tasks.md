# Tasks

## 1. Find

- [x] 1.1 Write the query for games that ring a control and draw it inside the ring; record the games and the sample (Sixteen is the first known)

  Query (2026-11-13): `grep -n "inside:" src/games/*/render.ts`. Each call
  site was read for whether the shape inside is a control the player presses
  in the board's margin. Only Sixteen's gutter arrow was one. After the fix the
  query finds 20 call sites over 17 games, none of them a control.
  The others draw the move's shape for a cell or an edge, which keeps its ring:
  Inertia (the direction arrow on the ball), Signpost (the cell's own arrow
  clue), Twiddle, Tracks, Boats, Bridges, Loopy, Galaxies, Dominosa, Net,
  Salad, Slant, Rect, Spokes, Tents, Sticks and Ascent. The games that have
  controls were also checked: Blackbox's reveal button and Numgame's operator
  buttons are ringed without being drawn again inside, so there is no doubled
  mark to remove (Netslide was already done).

## 2. Fix

- [x] 2.1 Sixteen: fill the hint arrow with `drawRingInkPolygon`, no ring; update its hint render tests and snapshots
- [x] 2.2 Each other game found, the same (none beyond Sixteen)
- [x] 2.3 `docs/hints-marks.md`: when a control is filled and when an element is ringed

## 3. Show

- [x] 3.1 Run the app: each game's hint arrow is blue with no ring, and the old arrow goes back to plain when the hint moves on; bring it to the owner
