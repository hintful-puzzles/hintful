# add-loopy-auto-rule-out

## Why

Owner, 2026-09-18, playtesting Loopy: *"It's a bit tedious to manually remove invalid
edges ('The ringed dot already has its two lines, so this edge can't be a line') — any
objection to creating a setting to remove these edges automatically as you go, and to
have that perhaps enabled by default, as it really doesn't require any meaningful
deduction?"*

The judgment is right and the mechanism is already in the game. Two facts about a
Loopy board are pure counting with no deduction in them:

- a dot has at most two lines, so once it has two, its remaining edges cannot be lines;
- a clue is an exact count, so once a face has as many lines as its clue, its remaining
  edges cannot be lines.

Marking those is bookkeeping the player performs to keep the board readable, not
reasoning they perform to solve it. Every click spent on one is a click not spent on
the puzzle.

**Loopy already ships an aid of exactly this kind.** The `auto-follow` preference
extends one click along a forced corridor of edges, and it is wired at the one place a
line move is built (`setEdge`), which turns a single clicked edge into a set of `ops`.
Auto rule-out is the same shape at the same place.

## What changes

- **A new Loopy preference, "Rule out edges that counting has settled."** When it is
  on, a move that draws a line also marks `LINE_NO` on every edge the two counting
  rules above have just settled.
- **The rule-outs are part of the same move**, so one undo takes them all back and
  replaying is idempotent — `setEdge` already returns absolute `ops`.
- **It fires only on a drawn line.** Ruling an edge out and erasing a line can neither
  complete a dot's pair nor a clue's count, so neither triggers anything, and one pass
  suffices: a `LINE_NO` never completes another dot or clue.
- **Default on**, which the "What this decides" section below argues for rather than
  assumes.

## What this does not do

- **Not the inverse.** When a clue has exactly as many open edges left as lines it still
  needs, those edges are forced *to* be lines. That is the same arithmetic, but drawing
  the loop for the player is a different bargain from tidying up behind them, and it
  should be its own decision rather than smuggled in under "remove invalid edges".
- **Not a solver or generator change.** Which boards exist, and how they are graded, are
  untouched. This augments a player's move.
- **No hint work.** A rule-out the board already carries makes its hint step empty, and
  `refreshHintStep` already drops a step the board satisfies — so trivial rule-out
  steps leave the plan on their own, with nothing to write.

## What this decides

**Default on is a deliberate divergence from the collection's posture**, which is that
aids default off: `autofollow` starts at `AF_OFF`, and `autoPencil` defaults off in
every game that offers it. The argument for diverging is that those two aids *make
moves the player might have wanted to make differently* — auto-follow commits a whole
corridor, auto-pencil erases notes the player may be using — whereas a counting
rule-out asserts something already true and forced, discards nothing, and removes no
decision. It is the owner's call and the owner made it; the divergence is recorded here
because a default that differs from its neighbors should say why.
