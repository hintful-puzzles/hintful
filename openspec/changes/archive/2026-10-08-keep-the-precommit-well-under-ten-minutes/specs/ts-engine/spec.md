## ADDED Requirements

### Requirement: A cross-game sweep deals each board once

A cross-game sweep that needs a board of given params SHALL take it from
`dealt(game, params, n)` in `src/engine/testing/dealt.ts`, and a sweep that
drives a `Midend` SHALL begin it with `beginDealt`, which hands the midend the
same board by the route New game takes with a board dealt ahead, the generator's
`aux` included. The dealer keeps each board for the life of the worker, so
every sweep in a worker reads one deal of it. A deal that throws SHALL be kept
and thrown again.

A sweep SHALL NOT seed a deal from its own name. Measured 2026-10-08, dealing
and not checking was where the sweeps' time went: following a hint plan to the
end took under 0.1 s on all but three boards of the six dearest games, and
dealing one board took up to 19.5 s, which about a dozen sweeps each did afresh.

Where a property needs more than one board of the same params, the sweep takes
the later ones by `n`. Where it needs a particular board, the board is pinned by
its description and not reached through the dealer.

A game's own tests are not bound by this: the requirement is on the sweeps that
walk every game.

#### Scenario: Two sweeps walk the same preset

- **WHEN** two cross-game sweeps in one worker each walk Group's 8x8 at Hard
- **THEN** the board is dealt once and both walk it

#### Scenario: A sweep drives a midend

- **WHEN** a sweep begins a midend on a dealt board
- **THEN** the midend holds the generator's `aux` for it, as it does for a board
  a player was dealt

#### Scenario: A board cannot be dealt

- **WHEN** the generator runs out its retries on a params set
- **THEN** every sweep asking for that board gets the same refusal, and the
  generator runs once
