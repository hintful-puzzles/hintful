# bound-custom-sizes-by-their-deal

**Status: scaffolded, not started (2026-10-04).** A follow-up from
`strengthen-the-sokoban-solver`.

## Why

Sokoban's Custom dialog takes any size from 4 up (`paramConfig`, `bounds:
{ min: 4 }`). Measured 2026-10-04, under load, eight deals a size: a deal
took 0.7 s on average at 20×24, 2.2 s at 24×30, 3.0 s at 30×30 and 9.9 s at
40×40, where it gives up on seven deals in eight and deals a level the hint
may not reach. Before `strengthen-the-sokoban-solver` bounded the loop, the
40×40 deal did not end in minutes.

That is one game, measured because its solver was being worked on. Whether
other games offer a Custom size whose deal is slow, or never ends, has not
been measured: this proposal claims only that nothing in the tree asks.
docs/games/solver-and-generator.md § "Bound a generator by its tail, not its
median" gives the method, game by game; nothing runs it across the
collection.

## What Changes

- A diagnostic, never a gate: for each game, deal a few boards at sizes past
  its largest preset, counting in the generator's own units where it has
  them and in time otherwise, and report where the tail leaves a second, and
  whether it fails by time or by memory.
- For each game it convicts, the bound goes in `validateParams`, with the
  measurement beside it. Sokoban's is the first.
- A size a player already has in a saved game or a shared ID keeps loading: a
  bound on what the dialog deals is not a bound on what a desc may be. That is
  the owner's to confirm before any bound that would refuse one.

## What would show it worked

A table of every game's largest size that deals within a second, taken on an
idle machine, and a params check in each game the table convicts.
