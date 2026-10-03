# teach-sokoban-push-order

**Status: scaffolded, not started (2026-10-03).** A follow-up from
`judge-rivals-for-search-hints`.

## Why

Sokoban's hint teaches the traps well: it stripes a push that would wedge a
barrel in a corner or jam it for good. Most of its steps say little else.
Measured over hint-guided play when it was written (313 pushes on boards of
every preset, `judge-rivals-for-search-hints` design D4): 60% of steps said
"Push this barrel left: that puts it on a target", 19% named only the push,
20% were traps, and the judging of the barrel's other pushes made a claim
once. On these generated levels most barrels sit a push or two from a target
with every direction still able to finish, so there is little contrast to
draw between pushes of one barrel.

What players actually struggle with in Sokoban is **order**: which barrel to
move first, and keeping a corridor or a target clear for the barrel that
needs it. A hint that only ever names the next push leaves that lesson out.

## What Changes

A design pass first, on what the hint can verify before it says it, as Pegs'
packages had (docs/games/hints.md § "Find with one search, prove with
another (Pegs)"). Candidates to measure:

- **"Fill this target first."** A target whose filling the search's line
  cannot delay, because a barrel pushed onto a neighboring target first
  would block it. Checkable by searching the position with the order swapped.
- **"Clear the way."** A push that moves a barrel off the line another barrel
  must travel, named with both barrels marked.
- **A barrel's run as one journey**: the consecutive pushes of one barrel to
  its target, narrated once, as Pegs narrates a package.

Each must be a claim the code has checked, bound to marks the player can see,
and measured for how often it fires before it is kept. Then the help page's
Hints section says what the new marks mean.

## Acceptance

Wording a player reads, so the owner's.
