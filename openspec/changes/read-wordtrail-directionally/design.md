# Design

Decisions made while filing (2026-11-19); the implementing session may
revise any of them for a reason it records here. What is still the owner's
is marked **(owner)**.

## What an edge holds

The engine's `EdgeMark` stays `OPEN | LINE | CROSS`. A directed game keeps
beside it the direction of each line: which of the edge's two squares comes
first (a per-edge byte in the state, carried by `EdgeChange` as an optional
`from` square). An undirected game never sets or reads it, so Path's and
Pearl's saves and moves do not change. Read the engine first: if a single
mark with two line values (`LINE_FORWARD`, `LINE_BACK`) is cleaner across
the drag, the preview, `edgeMistakes` and the hint's ring, take that
instead and record why.

## The drag

The engine's `LineDrag.cells` is already in stroke order, so a release knows
each line's direction. With `directed: true` in `LineRules`:

- A square takes at most one line in and one line out (`takes` stays 2).
- A drag from the **last** letter of a word carries it on, as today.
- A drag that **ends on the first** letter of a word joins onto its front:
  the drawn lines run into it, and the word reads on through it.
- A drag **from the first letter outward**, or one that would meet a word's
  line head to head, stops before the square, as a drag stops today where a
  square would take too many lines: the start mark says where a word begins.
- A drag back along a word's own lines, in either direction, takes them up,
  as a drag that passes only lines does today.
- The keyboard's Enter-path is a drag and follows the same rules;
  Ctrl+arrow lays a line in the direction the cursor moves.
- **A click near an edge** (owner): today it toggles a line. Recommended: a
  click on an edge beside the end of a word extends that word across it;
  anywhere else it lays a line pointing right or down, and a click on a line
  reverses it before a third click takes it up. Ask the owner if this is not
  obviously good once played.

## The description

The answer's value on an edge needs the direction: `range(1, 3)`, with 1 a
line read from the edge's lower-numbered square to its higher, 3 the other
way, and 2 none (keep 2 = none so the crossing reads stay). `follows(k, x,
y)` becomes directed (`pos(k, y) = pos(k, x) + 1`), and the techniques
place the value of the direction the trails agree on. Find how the language
compares two squares' order (or add the smallest thing that lets it), check
every technique sound again (`CHECK_GAMES=wordtrail`), and re-pin. A trail
that spells a word both ways is two trail clues, so `onlyWord` where only
SIP and PIS fit through a letter decides nothing on that edge: the ladder
never asks a player to draw a line whose direction it does not know.

## The generator

A board is kept only where its division is unique against the guess list
read directionally, and no answer word reversed is a guess, so the answer's
directions are forced. Re-run the deal walk's census: how many boards a
preset costs at both tiers, against today's (`add-wordtrail` § 1.2).

## The look: the engine's arrows

The owner asked (2026-11-19) for **proper arrows, drawn by the engine**, the
same in every game that shows which way a path runs, and named Ascent's as
unclear. Today each game draws its own: Ascent's polygons in
`games/ascent/render.ts` (`drawArrow`, and however its path shows
direction), Signpost's in its own render, and others that draw arrows
(`grep -liE "arrowhead|drawArrow|chevron" src/games src/engine`). So:

- **Survey first**, with a subagent if it spans many games: every game that
  shows a direction along a path or a link (not a clue's fixed arrow, like
  Unequal's signs, unless it reads the same), how each draws it, and a
  screenshot of each in the app. Say in this file which share one shape.
- **One engine primitive** for a directed line between two squares: the
  line with an arrowhead (or chevron) at a fixed point along it, sized by
  the tile, legible at a phone's tile size, in light and dark, and a start
  mark for a path's first square. Its own module under `src/engine/`, with
  a render-scenario test.
- **Wordtrail uses it** for every line, fragments included. The list writes
  each word as read.
- **Ascent moves onto it** where its direction is drawn, and is checked in
  the app against today's, side by side: the owner found it unclear, so the
  result must read better, not only the same. Other games the survey finds
  drawing the same thing move too, or are recorded here with the reason
  they keep their own.

Not Wend's look: no colored word bands; the board's fill for a finished word
already says it is done.

## As built (2026-11-19)

**What an edge holds: a `from` beside the mark.** `EdgeMark` stays three
values, and `LineRules.directed.from(state, e)` says which square a line
runs from; `EdgeChange.from` carries it in a move. Two line values would
have put an `isLine` test in place of every `=== LINE` in Path, Pearl, the
edges skeleton and `edge-hint.ts`, for games that never have a direction.
Wordtrail stores the direction in its own edge code (`LINE` from the edge's
first square, `LINE_BACK = 3` from its second), so `edgeMistakes` compares
codes whole: anything not `OPEN` or `CROSS` is a line, and a line whose code
differs from the answer's is a mistake. Path's and Pearl's codes are 0 to 2,
so they read as before.

**The drag** checks each step on the board as it would be left: at most one
line in and one out of each of the step's two squares, and no run closing on
itself (followed forward from the square, it comes back). A hint's line is a
two-square drag from its square, since a click may lay it the other way.
The click is as recommended, still open with the owner (`tasks.md`).

**Old saves are refused by their lines**: a line change with no `from`
throws in `executeMove` (`codeOf`), and the solve move is renamed `answer`
because its edge array cannot tell the old from the new. An old save that
only crossed edges still loads, and means what it did. An old shared link's
board still loads: its desc did not change. Where one of its words reads as
a guess backwards, the ladder cannot decide those lines' direction, so the
hint stalls there and the mistake check sees no answer. Today's generator
deals no such board.

**The ladder lost `oneWay`.** A letter with one neighbor left must join it,
but its word may start or end there, so the rung would place a line with no
direction. `onlyWord` covers the same letter once the trails through it
agree. The value on an edge is `range(1, 3)`, 1 read from `end1` to `end2`,
3 the other way, 2 none; `runs(x, y)` and directed `follows` compare a
square with `end1(edge(x, y))`, so the language needed nothing new. Both
rungs were checked sound again (`CHECK_GAMES=wordtrail`, 117 s).

**The deal census** (`npm run deal-walk`, 24 seeds a cell, with the reverse
refusal; `add-wordtrail` § 1.2 is the baseline): every preset at both tiers
deals quickly, in at most 50 tries, and so do 3×3 Easy (7) and 8×8 Normal
(15). The tail is 3×3 Normal, at most 328 tries where it was 1031: the
reverse refusal rejects most draws there (926 of them) before the ladder
runs. A word that reads as a guess backwards is refused before the ladder,
which could never finish such a board.

## The survey of direction drawing (2026-11-19)

No game drew an arrowhead on a path between two squares before this
change. What draws a direction:

- **Pegs' and Sokoban's hint arrows** (`draw.ts`'s `drawMoveArrow`): a move
  from one square to another. It now wears the engine's head
  (`path-arrow.ts`'s `drawArrowHead`), unchanged pixel for pixel (Pegs' hint
  snapshot fails when the head is planted wider).
- **Ascent's path showed no direction**: undirected bars between squares'
  middles, its direction only in the numbers on them, and 1 and the last
  number ringed alike. Its `drawArrow` is the Edges mode's border clue tab,
  not the path. Task 1.6 moved it onto the engine's arrow (below).
- **Galaxies' arrow** points from a square to its dot, which may be several
  squares away, and stops short of the dot: a line and two head strokes. A
  candidate for `drawArrowHead` later; it is not a path between neighbors.
- **Keep their own**, being clues or controls and not a path's direction:
  Signpost's and Rome's arrows (a clue in one square), Unequal's and the
  edge-clue Latin games' signs, Inertia's aim out of one square, Netslide's
  and Sixteen's slide buttons, and Twiddle's turn arrow.

## Ascent on the engine's arrow (2026-11-19)

Between two consecutive numbers the link is the engine's whole arrow
(`drawPathArrow`): a shaft as thin as the start ring's stroke and the
engine's head, filling the gap between the two numbers' discs, now 0.3 of a
tile (were a third) so the arrow is twice the head's length. 1 wears the
start ring, drawn over the shaft out of it; the last number keeps a plain
disc, told by the arrow into it. A line the player draws, which has no
direction until numbers are on it, stays a bar. Arrows are drawn after each
square's outline, which would cut them where they cross a side.

Compared in the app against the bars (Orthogonal, Classic, Hexagon; light
and dark; 390 px wide). What was tried and dropped:

- **The head on the full line**, as Wordtrail draws it: the line showed only
  as a stub past the tip, a pin through the head.
- **A thick shaft ending in the head**: about four pixels of it showed,
  which on a hexagon's slant read as a notch.
- **The head alone**, pushed once: on a hexagon's slanted links the heads
  floated near where three cells meet, joined to neither number, and looked
  like tabs on the outline (the owner, and a design review). A thin shaft
  gives each one an axis from number to number.
- **The whole arrow centered on the shared side**, the review's proposal:
  on a Classic board two diagonals crossing at one corner put both heads on
  the corner, a blot. Filling the gap between the discs instead keeps a
  straight or hexagonal link's arrow where the proposal put it, and moves a
  diagonal's head next to its own number.

Not taken from the review: dimming the arrows in the dark scheme. They wear
the path's strong gray, chosen to stand off both surfaces; a dimmer path is
a decision about the path's color, not the arrow's.
