# tone-the-clear-squares-of-mosaic-and-pattern

**Status: asked for by the owner on 2026-10-11, on seeing the circled number
of `mark-the-number-a-hint-outline-is-about` in the app. The look was chosen
by the owner the same day from boards drawn in both schemes (`design.md`).
`tasks.md` is its plan. What it says of the code was true that day; re-check
before relying on it.**

## Why

Owner, 2026-10-11, on a Mosaic board part solved: the purple is great, and
the crosses beside it are "a bit of a mess". A clear square that holds a
number carries its cross small in the corner, since the number has the
middle, so a board half cleared is a scatter of small crosses beside digits.

The owner's distinction, which is the engine's to hold: in some games a small
set of squares is the answer and the rest is crossed out as a note (Tracks,
Mines). In others the board is colored about half and half, each state says
as much as the other, and the work is coloring the whole board in one or the
other. There a clear square wants a color of its own beside the shaded
one. Mosaic is the plainest case, because the clue sits in the square being
marked, so the mark has to share the square with a number. Pattern is the
other, and takes the same look, though its clues are outside the grid and the
two games the owner draws on for it (Nonograms Katana, Picross) keep crosses.

## What Changes

- **A clear square in Mosaic and in Pattern is a pale yellow square**, the
  whole cell, with no piece on it. The shaded piece stays as it is.
- **It carries a faint cross**, where the square has no number. In Pattern
  that is every clear square. In Mosaic a clear square with a number shows the
  number alone on the pale square, and the small corner cross is gone.
- **The engine draws it**, as one helper two games call, beside
  `drawRuledOutCross`, and says in its guide which games take it: the ones
  whose board is colored half and half.
- The other games that draw the ruled-out cross keep it as it is.
- The help pages and legends that describe a clear square follow.

A player who cleared squares sees them pale yellow in the same places. No
save, id or preference changes, and no control behaves differently. The
hint's word for the state stays "clear".

## Capabilities

### Modified Capabilities

- `mosaic`: "Mosaic draws its marks as a piece and a cross on a quiet
  surface", and "A blank Mosaic cell carries a cross that leaves its number
  the middle".
- `pattern`: how a cell known to be empty is drawn.
- `engine-colors`: the clear square of a half-and-half board, and which
  games take it.

## Impact

- `src/engine/piece.ts` and the palette (`engine/color/`), a pale yellow for
  the clear square with a dark value of its own.
- `src/games/mosaic/render.ts`, `src/games/pattern/render.ts`, their render
  snapshots.
- `help/games/mosaic.md`, `help/games/pattern.md`, `docs/games/rendering.md`.

## Acceptance

The owner's, by eye, in both schemes, on the deployed app.
