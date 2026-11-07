# make-descriptions-zero-cost

**Status: filed on the owner's word (2026-11-07). It goes next, before the
rest of step 10** (`describe-pearl-tracks-spokes-bridges-net-tents-and-loopy`
waits on it). It takes in `keep-board-definitions-across-boards`, whose
measurements are below.

## Why

The owner, on `describe-lines-and-loops`' result that Path's deals take
about twice as long: "I'm not ok with 'deals take about twice as long' — I
would prefer as much as possible that we aim to have the description layer
be a near-zero-cost-abstraction, and I'd want us to spend time to get that
right before we continue. The download size improvement would be important
too, but is secondary."

A description states a game's rules and reasoning once and is checked
sound. The compiled ladder should cost what the hand-written ladder it
replaced cost, so a game never pays for being described.

## What is measured already

- **Path** (2026-11-07, `31019ce6` against `2483da52`, back to back, the
  same 260 boards):
  - Each class's mean deal is 1.5 to 3 times HEAD's. 8x8 Path Tricky went
    from 301 ms to 678 ms (max 819 ms to 1,894 ms); 7x9 Path Tricky from
    217 ms to 507 ms.
  - A profile puts 41% of a deal in `lineBreaks` and 28% in the inline edge
    walk (`throughWhere`).
  - The full table is in the archived proposal of `describe-lines-and-loops`.
- **Rect** (2026-11-07 at `05ba50d4`, 20 deals, 6,417 boards): `allowed(q)`
  was made 183 k times and `near(c)` 1.04 M times. Together they take about
  24% of the deals' time. They are kept per board, so a generator trying
  many boards that differ in one clue makes them again for each.
  `ladderFinishes` and `searchAnswers` each build their own board from the
  same clues.
- **Galaxies** (twenty 15×15 Normal deals): `near(c)` and the `room(q)` it
  reads are 17% of a deal, made again for each board as the generator moves a
  dot.
- **Size:** Path's compiled ladder is about 15.5 KB minified and gzipped,
  against the 4.6 KB of the rungs it replaced.

## What Changes

- **A census first.** For every described game, time its deals and a hint
  walk against the last commit before its `describe-*` change, back to back,
  at its menu's sizes. `npm run deal-walk` with `DEAL_WALK_CELLS` and
  `DEAL_WALK_SEEDS` deals named params. A walk has no tool yet. Profile the
  worst games and list what the compiled code does that the hand-written
  code did not.
- **Fix it in the compiler and the runtime, never per game.** The levers
  known now:
  - Board-kept values remade for every board a generator tries: keyed by
    what they read, made cheaper (a count over a rectangle as a prefix sum),
    or the board shared by its clues.
  - Inline set walks that a hand-written rung keeps incrementally.
  - What `with` inlines, and evaluates again, at every use.
- **Record each game's download size** against its hand-written rungs. A cut
  that comes cheaply comes here; the rest is `shrink-the-download`'s.

## The target

Each described game's deal time, mean and tail at its menu's sizes, within
about 10% of the hand-written ladder it replaced. A game past that is
brought to the owner with its profile and what would close the gap.

## Acceptance

- The census table for every described game, before and after.
- The boards dealt unchanged, and every soundness verdict and test unchanged.
- The guides updated with what a description must not do to stay cheap.
- An answer, brought to the owner, to how the cost stays near zero as the
  remaining games are described. A timing is not a gate on a busy machine;
  a structural rule or a cost the compiler reports may be.
