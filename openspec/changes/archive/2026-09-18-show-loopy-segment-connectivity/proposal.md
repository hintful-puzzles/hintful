# show-loopy-segment-connectivity

## Why

Owner, 2026-09-18, playtesting Loopy on a 10×10 Hard board: *"A very valuable deduction
is not to close a segment into a loop, when there is more than one segment, but with our
current color scheme, it's very hard to see which segments are connected."*

The deduction is the game's central one and the board gives the player no help with its
premise. Every drawn line is the same color, so "are these two ends the same segment?"
is answered by tracing with the eye across a grid of near-identical strokes — and on a
10×10 board with a dozen fragments that is genuinely hard.

**Loopy already answers the question, but only after the fact.** `checkCompletion`
builds a dsf over the drawn edges and highlights every closed loop but the largest
(`loopy` spec, "Loopy pointer and keyboard input, and rendering"), so a player who
closes a spurious loop is told. What is missing is the *prospective* form: seeing the
segment before committing to the move that closes it.

## What changes

**Hovering an edge highlights the whole run of drawn lines it belongs to.** Owner's
decision, 2026-09-18: *"yes, let's please do the hover for now, and I'll see down the
line if I want something else."*

This was proposed against, and the objection was answered rather than overruled on one
point and accepted on the other:

- **The cost objection was wrong, and it is withdrawn.** The claim was that a hover
  "needs a new event path from the view through the worker into `Ui`". It does not. The
  path `pointermove → Puzzle.processMouse → Comlink → worker-adapter → Midend →
  Game` **already exists in full**; `view-interactive.ts`'s handler simply declines to
  use it unless a pointer is being tracked (`this.pointerTracking?.pointerId ===
  event.pointerId`). What this change adds at the view is a branch, not a pipe. The
  estimate was made by reading the handler's guard and inferring the rest, which is the
  error — the transport was two files away and unexamined.
- **The mouse-only objection stands and is accepted.** Touch has no hover, so this aid
  does not exist on a phone, where the board is hardest to read. That is a known gap
  the owner has chosen to carry for now, not an oversight.

The design questions the hover does not settle are settled the same way they would have
been for any other trigger:

- **Never a per-segment palette.** Segment identity changes whenever two runs join, so
  coloring segments reshuffles the board as the player draws — the recompute-stability
  trap `docs/games/hints.md` records for hint plans, aimed at the palette. Hovering is
  stable for the same reason the rejected scheme was not: the highlight keys on where
  the pointer is, not on an identity that moves under it.
- **One notion of connectivity, two readers.** The run is read off the same dsf
  `checkCompletion` builds, not a second traversal.

## How the hover reaches the game

**A dedicated `Game.hover` hook, not a new button code through `interpretMove`.** Both
would work over the existing transport; the hook is the honest one:

- `interpretMove` returns `Move | UiUpdate | null`, so a button-coded hover *could*
  return a move. A hook typed to return `UiUpdate | null` cannot, by construction.
- A new button code reaches **every** game's `interpretMove`, whose if/else chains are
  deliberately terminated so an unrecognized input is rejected rather than ignored
  (`reject-unrecognized-moves`). Handing all of them an input they have never seen, to
  serve one game, is a cross-game risk taken for nothing.
- **Enrollment derives from declaring the hook**, per `AGENTS.md` § "Convention over
  configuration": a game joins by *having* `hover`, and the app asks the midend once
  whether the current game does, rather than anything declaring that it might.

That last point is also the throttle's justification: a game with no `hover` costs zero
messages, and a game with one coalesces to at most one message per animation frame.

## What this does not do

- **Not a keyboard equivalent**, though an earlier draft of this section said it would
  be. The cursor already draws its own `COL_CURSOR` halo on the edge it has chosen, so
  lighting that edge's whole run in the same color puts two greens of different extent
  on one board with nothing to tell them apart. And the aid's value is comparing two
  *distant* ends at a glance, which a pointer does by moving and a cursor does by
  walking the board — the keyboard wants a different affordance, not this one rendered
  twice. It needs a mark of its own, which is a design question rather than a couple
  of lines.
- **Not the global view.** Pairing each segment's two loose ends with a matching glyph
  would answer "how many segments, and which ends go together" without touching
  anything. The owner has explicitly deferred it: *"I'll see down the line if I want
  something else."*
- **Not the existing loop highlight**, which stays exactly as it is; this is its
  prospective companion.
