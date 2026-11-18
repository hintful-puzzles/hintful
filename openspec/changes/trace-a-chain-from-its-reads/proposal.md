# trace-a-chain-from-its-reads

**Status: filed by `check-the-last-move` (2026-11-18)**, an engine lack found
while running the app.

## Why

Check & save's verdict on a chained move names the technique its chain began
with ("Your last move follows a few steps on, starting from …"), by the fact
graph: `FactGraph.restsOn` walks a fact's parents back to the earliest firing
the walk took. A firing's parents come only from what its reason says it read
(`says.reads`, which a handful of descriptions state: Boats, Bridges,
Clusters, Net, Norinori, Path, Pearl) or from a game's `citing` (Loopy,
Slant). Everywhere else `ladderWalk` records the firing with no reads, its
facts' parents are `null`, and the chain's start cannot be traced.

Measured 2026-11-18, Unruly's default board, four deals, every answer square
placed alone from the board as dealt: 136 chained verdicts, none naming a
start (each fact's `parents` null, traced in `chainStart`). Light Up's do
name one ("…starting from a number with all its bulbs", a 7x7 Unreasonable
board), by a route not yet pinned down; which games trace and which don't is
task 1.1, and Light Up's route may be the one to generalize.

`ladderWalk` already holds what each firing's premise reads, for the
driver's order (`reads(firing)`: the cells a firing marks, outlines and
fills, in `describedHint`). Recording that where `says.reads` and `citing`
are silent would give the graph parents in every game.

## The risk, which decides the design

A chain's start is named only where the graph can say it truly; naming one
the chain does not rest on is worse than naming none (`check-the-last-move`
`design.md` § "Direct or chained"). So the reads recorded must be what the
premise read, no wider: an outline that includes cells the deduction did not
need would name an earlier technique than the chain's. And an edge game's
`reads` names cells, while its premises read edges.

## What changes

- The graph records a firing's `reads` where nothing narrower is stated, in
  each builder whose `reads` is the premise's own, and not in one whose
  isn't (to be measured per builder).
- A guard: for each judging game, a chained verdict that names a start names
  a technique a firing of the chain took (checked against a walk that
  replays the chain from that firing alone).

## Impact

`ladder-runtime.ts` (`ladderWalk`'s recording), the builders that pass
`reads`; the judge's words are unchanged. `restsOn`'s other consumers are
Slide's planner (its own graph) and Loopy (which cites), so no hint changes.
