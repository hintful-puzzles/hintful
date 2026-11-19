# read-wordtrail-directionally

**Status: asked for by the owner (2026-11-19)**, after dragging SIP and
seeing the list write PIS.

## Why

Wordtrail keeps a word as a set of squares and reads it whichever way a
search met it first, so a trail that is a guess both ways round (SIP, PIS)
is guessed at. The owner wants **no guessing**: a word is read in the
direction it was drawn, internally and on the board. LinkedIn's Wend is the
inspiration for the ergonomics (not its look): each word shows where it
starts and which way it runs, and a player may draw a fragment they are
sure of first (IGN, read from the I) and then draw onto its start to make
the whole word (A-L-I, joining ALIGN).

The interim fix (`3411251bd`, the common word preferred where a trail reads
both ways) goes once direction is the board's.

## What changes

- **A line has a direction.** Every line runs from one letter to the next
  in reading order. A drag lays its lines in the order it passes the
  squares; a word's first letter and the way each line runs are drawn on
  the board (our own marks: a start mark on the first letter and a chevron
  on each line).
- **Strokes join.** A drag from the end of a word carries it on (as today);
  a drag that ends on the first letter of a word joins onto its front. A
  letter takes at most one line in and one line out.
- **The answer is directed.** Each answer word reads from its start; the
  generator refuses a board where an answer word read backwards is a guess,
  so the answer is unique with its directions. A line drawn the wrong way
  round is a mistake.
- **Trails are directed.** A trail that spells a word both ways is two
  trails, one each way. The ladder decides a line only with its direction:
  every trail through a letter must agree on both.
- **The engine draws the arrows** (the owner, 2026-11-19): one primitive for
  a directed line and a path's start, which Wordtrail uses and Ascent moves
  onto (its direction was unclear), with any other game that draws the
  same thing.
- **The engine's line drawing takes a `directed` rule**, which a game sets
  (Wordtrail) or leaves off (Path, Pearl, the edges skeleton): a framework
  capability, not Wordtrail's own input.

## Cost

A Wordtrail save or shared link made before this does not load: what an edge
holds changes. Wordtrail shipped on 2026-11-19 and is still under
acceptance, so the cost is the owner's own games in progress. The owner asked
for the change, which carries this break.

## Impact

- `engine/line-drawing.ts` (a directed line, a drag laid in order, joining at
  a word's start), its spec (`engine-input`), and its users' tests.
- Wordtrail: state and desc/save format, moves, trails, generator, the
  description's answer and techniques (a line's value says its direction),
  the hint, rendering, help page, and `add-wordtrail`'s spec delta (not yet
  archived, so the Wordtrail scenarios are edited there).
