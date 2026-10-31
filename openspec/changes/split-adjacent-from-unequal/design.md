# Design

## Where the shared code lives

Unequal and Adjacent are one mechanic, a Latin square with clues in the gaps
between neighboring cells, and differ only in what a clue says. No game
imports another (`repo-layout`, "The module layering is enforced"), so what
both run moves to `src/engine/edge-clue-latin/`, as Palisade and Separate's
border mechanic is `engine/border-grid.ts`: the state, the params and desc
codecs, the moves and input, the cell drawing, the solver's driver and the
generator.

Each game keeps what is its own puzzle, in its own directory: its
description and compiled ladder, the reason each rung records and the words
the hint says for it, the clue's drawing and text glyph, its params' menu and
refusals, and its `Game` object. The `Game` object is written in each game,
not built by an engine factory: the source guards ask of a game's own code
whether it uses a shared helper (`engine/testing/enrollment.ts`'s
`membersNotMentioning`), and a factory would answer for both games from
outside them.

## What a clue kind declares

The shared code takes a `ClueKind`, the whole of what the two games do
differently below their `Game` objects:

- `holds(a, b)`: whether the clue flagged at a cell holding `a`, toward a
  neighbor holding `b`, is true of them. Unequal: `a > b`. Adjacent:
  `|a − b| = 1`.
- `complete`: every true clue is dealt, so a missing one is a statement too
  (Adjacent's `complete: true` in its description). The generator seeds them
  all and never adds or strips one; the error check and the validator read a
  missing clue as "does not hold".
- `bothEnds`: a clue is flagged from both its cells (a bar) rather than from
  one (a sign, at its greater end). The desc parser refuses the other, and the
  keyboard's spent mark goes on the cell above or left of a bar.
- The ladder its description compiles to, the drawing of a cell's clues, and
  the text glyph of a gap.

One predicate serves the error check, the solver's validator and the
generator. Adjacent's validator used to skip the last row and column, as
upstream's did; it now checks every edge, as the error check always has.

## Params and compatibility

Both games' params are `{ order, diff }`, encoded `{order}d{c}` as Unequal's
were. Adjacent's lose the `a`, so `5adk` is now `5dk` under `adjacent`. The
owner released compatibility for this change: an Adjacent save, link or
favorite from before it does not open, and Unequal refuses params with an
`a`. No route alias is kept: the app has no alias mechanism to extend, and
building one for a beta's links is not "little cost".

A game ID upstream's encoder writes still opens here (`engine-params`, "A
params string is read whole or refused"): Adjacent reads upstream's `a`
after the order by name, so `5ade:…` pasted into Adjacent opens. That costs
three lines in Adjacent's decoder and no mechanism.

## What the guards read

Several guards read a game's own source to ask whether it uses a shared
mechanic, and two read its own `render.ts`. A game whose mechanic lives in an
engine directory would read to them as having none. A game's own source
(`testing/enrollment.ts`'s `gameSourceFiles`) now includes each **game
family** it imports: an engine directory whose modules import the `Game`
contract. The engine's libraries (`grid/`, `color/`, `random/`, `combi/`)
import no `Game` and stay out, and none of them mentions a marker a guard
looks for (checked 2026-10-31). `palette-departures` and `hint-mark` read
through it.

The validator's context is empty: `latin.ts`'s premise replay structured-
clones a context, and a clue kind is functions, so the validator closes over
the kind and the flags instead.

Adjacent's default is 5×5 Normal: a 4×4 Adjacent has no tier above Normal,
and its menu starts at 5×5. Unequal's menu is unchanged; Adjacent's is the 5×5 and 7×7
boards it had.
