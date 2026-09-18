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

## What the owner suggested, and why not

*"A naive idea I have is to give each connected segment its own color, but that would
probably make things too cluttered."* Clutter is one objection and the smaller one.

**The larger objection is instability.** Segment identity changes every time two
fragments join, so a per-segment palette reshuffles mid-solve: the player draws one edge
and half the board changes color. That is the same non-convergence trap
`docs/games/hints.md` § "Recompute-stable plans" records for hint plans, aimed at the
palette instead — and the fix there, a value that is monotone in the player's own
progress, is what this design borrows.

*"Perhaps for now just having a hover over an edge highlight the entire connected
segment?"* This is the right **shape** and the wrong **event**, and the difference is
not small:

- **There is no hover plumbing in the app at all.** `view-interactive.ts`'s
  `pointermove` handler acts only while a pointer is tracked
  (`this.pointerTracking?.pointerId === event.pointerId`), so a hover reaches nothing.
  Adding one means a new path from the view through the worker into `Ui`.
- **It would be mouse-only.** Touch has no hover, and a phone is where this board is
  hardest to read. An aid absent on the device that needs it most is the wrong first
  step.

## What changes

**The segment you last touched is highlighted.** After a move that sets a line, the
connected component containing that edge draws in a distinct tint; the keyboard cursor
landing on an edge does the same, so keyboard play gets it for free.

- **No new input plumbing** — it rides the move path that already exists.
- **Stable by construction**: the highlight is relative to the player's own last action,
  so nothing reshuffles when two fragments join. It changes when, and only when, the
  player does something.
- **The same on touch, mouse and keyboard.**
- It answers at the moment the question is actually asked — *"I just drew this; what am
  I about to close?"* — and comparing two distant ends costs one tap.
- The connectivity is already computed: `state.ts` builds the dsf over drawn edges for
  the completion check, so this is a second reader of an existing structure.

## Open, for the owner

**Whether a global view is wanted as well.** The focus highlight answers "this one";
it does not answer "how many segments are there, and which pairs of ends belong
together" without touching each. The global form with the least clutter is to **pair
the loose ends**: each segment's two free ends carry a matching small glyph, so the
question is answerable at a glance with two marks per segment rather than a color per
edge. It still reshuffles on a merge, just far less visibly. Worth building only if the
focus highlight leaves the owner still tracing.

## What this does not do

- **Not a solver or hint change.** The premise it surfaces is one the player can already
  read off the board by tracing; this makes it cheap to read, and places no mark the
  player could not have made (`AGENTS.md`, "A hint relies only on marks the player can
  make" — this is not a hint, but the same bar applies to anything drawn on the board).
- **Not the existing loop highlight.** That stays exactly as it is; this is the
  prospective companion to it.
