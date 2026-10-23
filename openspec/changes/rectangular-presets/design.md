# Design: rectangular-presets

## Context

`presetGrid(paramConfig, BOARDS, opts)` writes every board at every tier, and
`preset-menu-shape.test.ts` holds every menu to the grid's shape, 18 lines a
menu and 12 a section. A game's boards are its own `BOARDS` list, so the
change is per game, and the rule is the engine's, checked where the menu's
other rules are.

## Goals / Non-Goals

**Goals:** every game that takes rectangles offers at least half its sizes
as rectangles, held by the menu-shape check, and the skeletons show the way.

**Non-Goals:** a game whose menu is all rectangles now (Bricks, Filling,
Inertia, Magnets, Map, Range, Slide, Sokoban) does not gain squares; the
owner asked for rectangles, not for squares. Upstream's named presets stay
where a name says something no field does.

## Decisions

- **Count distinct sizes, not lines.** A size offered at three tiers is one
  board. Per game, not per ruleset: Path's two rulesets together are four of
  seven.
- **The population is what a game accepts.** `validateParams(p, false)` on the
  first board with its width one wider, and again two wider; a game whose
  validator refuses both is a game that needs a square (or whose rules tie
  width to height), and is not asked. No hand-kept list of games.
- **Upright.** A rectangle is taller than wide unless the game's rules care
  (Map's and Same Game's upstream sizes are wide; leave those, and say why at
  the menu).
- **Time each new size before offering it**, three deals at each tier, and
  cut a tier from a size where the tail passes a second; ask
  `difficulty-contract.test.ts` with the slow tier on.
- **One commit a few games**, each game's menu diff and its moved snapshots
  read, never a bulk edit of `BOARDS` across the collection.

## Risks / Trade-offs

- [A rectangle deals slower than the square it replaces] → the timing rule
  above; keep the square and cut the rectangle's hard tier rather than miss
  half.
- [A game's tier vanishes on a rectangle of its size] → `difficulty-contract`
  says so; choose another size.
- [A changed first preset changes what a new player is dealt] → keep each
  game's first board, the smallest at the easiest tier, a square where it is
  one today unless the game is better started on a rectangle.
