# move-the-hint-scans-onto-the-harness

**Status: implemented (2026-10-04); `design.md` says what was found.** A follow-up from
`share-the-hint-position-scan`, which built `describeHintPins`
(`src/engine/testing/hint-positions.ts`) and moved Flip, Sokoban and Light Up
onto it.

## Why

That change went looking for seven games' scans and found about 45, across
about 30 games, each a loop over seeds written for one test and run on every
test run, plus nine groups of pins whose scan was deleted. Three games are on
the harness. The rest still pay for a scan on every run, record no count, and
would each write another the next time a hint changes.

## The population, as read on 2026-10-04

Read by shape (a seed loop near a hint call in a test file) by a subagent
sweep and spot-read after it. **Take it again before working from it**: it is
a list, and lists here go stale. File names are under `src/games/<game>/`.

**Fit the harness as it stands** (public `hint()`, first step, recompute; a
kind over the step or its board):

- Galaxies `galaxies-hint-render.test.ts` `hintFrame` (already keeps the
  board and the moves played), and `galaxies-hint.test.ts`
  `firstStepMatching`, which calls `galaxiesHintSteps` to skip the mistake
  check on cost grounds.
- Group `group-hint.test.ts` (two scans; one wants a `Ui` reading), Salad,
  Undead, Tents `tents-hint.test.ts`, Loopy `first`, Magnets `legWhere`, Net
  `firstTurn`, Pearl `twoLineStep`.
- The `renderScenario({ hintUntil })` loops over `#seed` ids, each wanting a
  frame: Palisade `equivalentEdgesFrame`, Dominosa, Ascent (four), Group
  render, Loopy `frame`, Magnets render, ABCD, Seismic, Singles, Subsets
  notes, Clusters (the chain), Filling, and `src/engine/hint-ordinal.test.ts`.
  `pinned(kind)` returns the `id` and `moves` a `renderScenario` takes.
- Pins whose scan is gone: Pegs (16), Rect (6, pinned as start boards and
  walked live), Map (9 arms, with counts already), Ascent (8), Bridges (3),
  and the render tests that pin a seed name with `hintUntil`, which is a seed
  and not an input: Light Up, Slant, Tracks, Bridges, Pearl, Salad, Pattern,
  Undead, Spokes, Mosaic, Separate, Signpost.

**Want something the harness does not have**, each named in that change's
design D3:

- Moves before the first hint: Keen, Mathrax, Unequal, Solo, Rome, Towers
  (mark-all), Mines (an opening click).
- A solver firing as the kind, with no step saying it: Clusters
  `findDeduction`, Boats `findFiring` (which also keeps a table of where it
  first hit), Spokes, Subsets, Crossing, Sticks, Pattern.
- Play off the hint's line, and a refusal as a kind: Pegs.
- `aux`: Solo, Netslide, Untangle. The scan passes it; a pin does not keep it.

## What Changes

Each scan above becomes pins through `describeHintPins`, or is left with its
reason written at the site. The harness grows only what a moved game needs,
one need at a time, with the game that needed it as the check.

## Hints to pull in

None: every game here already has its hint.

## What would show it worked

No hint test walks seeds on a normal run, every pin carries the count its
scan measured, and the suite's time for these files is lower than it was
(measure before starting: `docs/test-strength.md` §7).
