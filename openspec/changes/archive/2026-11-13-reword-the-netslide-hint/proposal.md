# reword-the-netslide-hint

**Status: filed on the owner's word (2026-11-13), for an agent working on
Netslide alone.** Player-visible wording: its words are brought to the owner in
the running app before the change is archived. Depends on nothing; the
principles it applies are in `standardize-hint-vocabulary` and
`point-the-first-hint-beat-at-the-board`.

## Why

A Netslide step the owner showed (3x3 easy) reads: "This column never slides,
so only row moves shift this loose end. Take it to the two ringed squares:
that sets it up." The owner (2026-11-13):

- the first click highlights the orange stripe on the column that never
  slides, a fact of the layout and not the position;
- the text is "mostly useless": it says what cannot be done. It should guide
  to the piece that should be moved, say why (the loose end), and say where to
  go (right);
- the two ringed squares show nothing the direction does not.

The code says the same against itself: `netslide/hint-text.ts` states in its
header that a source that never moves is "a rule of the game, not a
deduction", yet `rowFixed` and `colFixed` open with "never slides" and
"only column/row moves shift". Netslide's moves are never forced by logic, so
its sentence is an imperative, not a modal of necessity.

## What Changes

- **Say the piece, the reason and the direction**, and nothing about what
  cannot be done. Drafts, not decided, reusing the `arrives()` closings:
  - arriving leg: "Slide this loose end **right**: that's where it belongs."
  - staging leg: "Slide this loose end **right**: that sets it up."
- **Drop the destination rings** where the sentence says the direction.
- **Drop the stripe on the fixed line.** It is not evidence for the move, and
  it is what the first beat shows.
- **Keep the ring on the tile to move**, with the arrow to click, so the first
  beat lands there.

## The open choice (the owner left it to the session)

What the reason is, when the move is the planner's choice and not forced: the
tile's shape ("this loose end"), a stated reason ("it belongs beside the
source"), or another. Decide it by reading Netslide's walks in the running app,
and say why. Check first whether the step carries the direction as a word, or
only as the arrow.

## What it touches

`src/games/netslide/hint-text.ts`, `hint.ts`, the Netslide hint tests and
their walk fingerprints (the words are meant to change; the moves are not),
and the Netslide help page where it quotes a hint.

## Acceptance

Every Netslide step names the piece, the reason and the direction, ringing only
the tile. The first click lands on the tile. A walk still finishes the board.
The owner accepts the words in the running app.
