# add-cube-hint: design

Measurements dated 2026-10-16, on boards dealt by the generator from fixed
seeds, six to twelve a preset.

## D1. A position has no orientation

The solid sits on a square of a given shape in one pose whatever face is
down; `executeMove` re-seats the canonical solid and carries each face
place's paint to another place. So a position is the square, the painted
face places and the painted squares. Tracking which physical face is where
multiplied the positions by 12 (cube) to 60 (icosahedron) and changed no
plan: the walks measured both ways were identical.

## D2. Paint must sometimes go down, so the potential is not a count

A plan that never puts paint down finishes 5 of 10 cube boards, 4 of 10
tetrahedron boards and none of 10 octahedron boards. Plans must drop paint
and pick it up again, so "painted squares left" rises under hinted rolls.
Measured failures of the obvious repairs:

- Stages "pick up one more square, dropping at most two on the way",
  recomputed after every roll: the walk cycles (a drop, then the recomputed
  plan picks it straight back up) on 3 of 10 cube boards and every
  icosahedron board.
- The same stages with Sokoban's rule (offer a roll only if the line found
  after it is shorter): no roll qualifies on the same boards.
- Stages counted against the dealt board's squares, forbidding a drop on a
  square already collected: consistent, but most octahedron and every
  icosahedron board has no plan.
- A* toward the nearest pickup: worse than breadth-first, since dropping
  makes a pickup look one roll away.

**Decision:** the potential is `min` over targets `c` in
`[painted − K, painted − 1]` of `64·c + d_c`, where `d_c` is the shortest
line to `c` painted squares never passing more than `c + K`, and staying
put (`64·painted`) is in the minimum. A roll along the minimizing line
lowers its `d_c` by one, and the target stays in the next position's window
because the line never rises past `c + K`, so the value falls by at least
one on every hinted roll. Proof in `solver.ts`'s header; held by
`hint-resume.test.ts` and `cube-hint.test.ts`.

64 is more rolls than any measured line to the next square (the longest,
23, was an icosahedron's last square). At 16 and 20 the icosahedron got
stuck at its last square (no target lowered the value); at 32 and above
none did, and 32 and 48 gave identical plans.

## D3. The window per solid

| solid | K | most positions a request | plan length |
| --- | --- | --- | --- |
| tetrahedron 1×2 | 4 (whole board) | 400 | shortest |
| cube 4×4 | 6 (whole board) | 150,000 | shortest, 10–14 |
| octahedron 2×2 | 5 | 434,000 | 25–31 (shortest 18–24) |
| icosahedron 3×3 | 3 | 41,000 | 99–141 |

The octahedron at 6 took 1.7 million positions and 0.8 s a request for
plans a roll or two shorter; the icosahedron at 4 ran past the two-million
allowance. The allowance is in positions, shared across one request.

## D4. The search engine

The breadth-first store is the slide planner's `SearchSide`, promoted to
`src/engine/position-store.ts` (`PositionStore`, `hashWords`); the slide
planner and Cube both use it. A request takes 20 ms at most on a preset;
the same search keyed by strings in a `Map` took seconds.

## D5. What a step says

Each leg of the line ends with the roll that picks a square up; that square
is outlined on the leg's other rolls ("Working on the outlined square"), and
the leg is a journey, so the step counter places a roll in it. Branches,
each checked on the board the roll is made from:

- collect: a plain face picks up the ringed square's paint, leaving N.
- come-round: every roll onto the goal from here lands a painted face.
- forced-drop: no square can be picked up from here without putting paint
  down first (an exhaustive search of the rolls that change no paint).
- drop: paint goes down where it need not; the sentence says whether the
  line picks it up again, and whether with another face (faces numbered
  alongside the plan).
- travel: no paint changes.

A roll that puts paint down names no goal: in the common shape the leg
picks up the very square it leaves paint on, which would then be ringed and
outlined at once.

## D6. The generator

No deal check: the hint finished every preset board measured from its
opening, and its reach depends on the arena's size, not on which squares
are dealt. A custom arena far larger than the presets may refuse with
`SEARCH_OUT_OF_REACH`.
