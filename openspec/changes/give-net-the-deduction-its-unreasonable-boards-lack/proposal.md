# give-net-the-deduction-its-unreasonable-boards-lack

**Status: filed 2026-10-10 by the session that gave Net its Unreasonable
tier (`add-an-unreasonable-tier-to-the-untiered-deductive-games`), which
measured it. What it says of the code was true that day; re-check before
relying on it.**

**A draft since 2026-10-10, for the owner to pick.** A new deduction is
optional work in one game. Its plan is `design.md`, which was its `tasks.md`.

## Why

Net's solver, and its hint, rule a way of turning a tile out for three
reasons: it contradicts a known side, it closes a loop, or it seals a group
off (`net/deduce.ts`). Each is about the tile itself. Neither asks what the
turning does to the tile beside it. A turning that leaves a neighbor with no
way to turn at all is as wrong, and a player looking at a square with two
ways left sees it: "if this corner points up, that T has nowhere to go".

Measured 2026-10-10 on dealt Unreasonable boards, 60 a size. The count is of
boards that this one rule, added to the three the engine has, finishes
outright:

| Board | Boards | Finished with it |
| --- | --- | --- |
| 5x5 | 60 | 58 |
| 7x7 | 60 | 49 |
| 9x9 | 60 | 45 |
| 11x13 | 60 | 39 |
| 5x5 wrapping | 60 | 6 |
| 7x7 wrapping | 60 | 15 |
| 11x11 wrapping | 60 | 33 |

The instrument ran the hint's engine to where it stops, then for each
unlocked tile and each way it could still turn, locked the tile that way and
asked the engine's own survey whether any tile was left with no way: one
look, with nothing followed. A tile with one way surviving was locked and the
engine run on. Without the rule it finished none of the 420 boards, as the
solver finishes none, so the difference is the rule's. No tile it locked
disagreed with the board's answer.

So on a board without wrapping, most of what the menu deals as Unreasonable
needs no trial and error: about nineteen in twenty at 5x5 and two in three at
11x13. The hint says "nothing further follows by deduction" on them at a
point where a deduction a player can see does follow. The tier's name is a
promise that its boards need search (`docs/games/solver-and-generator.md` §
"Check, Tactic, Search"), and a rule the hint never had is a missing rung.
On a wrapping board the tier is mostly what it says.

These boards are shallow besides. The search needs a median of three
positions on every menu size, one square tried both ways, and on about nine
boards in ten every wrong turning of every open tile is refuted by one trial
followed through the solver (59 of 60 at 5x5, 52 of 60 at 11x13, 48 of 60 at
5x5 wrapping).

## What Changes

- The hint's engine gains the rule: a way of turning a tile is ruled out when
  it leaves a tile beside it no way to turn.
- The hint gains its rung, with its sentence, its marks (the tile ringed, the
  neighbor left with no way outlined, each of the neighbor's ways shown with
  why it fails) and its help entry.
- The solver gains the same rule, or the generator asks the engine: Net's
  Easy is already the solver's verdict and the engine's both.
- Unreasonable keeps only the boards the four rules do not finish.

## What to settle first

- **Where the boards the new rule finishes go.** Easy is today exactly what
  upstream deals with its checks on, draw for draw, which the differential
  holds. Two shapes: (a) a middle tier, Easy below it unchanged, so that a
  board dealt as Unreasonable today opens as the middle tier once this lands;
  (b) Easy widens, and its deals differ from upstream's from the same seed,
  which nothing a player holds depends on. The rewiring loop in
  `net/generator.ts` stops at the first network the solver settles, so a
  wider Easy needs the rule in the solver, where the middle tier can ask the
  engine.
- **Whether it is a Check or a Tactic.** Looking one tile further is a
  bounded walk a sentence can follow. Following a trial through the solver to
  a contradiction is not, and stays the tier's.
- **How rare Unreasonable becomes without wrapping.** A 5x5 board takes a mean
  of 860 draws today. With one in thirty of those left it takes about 26,000,
  where the generator gives up at 80,000, so the tier may have to be refused
  on a small board without wrapping, or the menu offer it on wrapping boards.
  Measure before choosing.
- **The menu's wrapping line.** The one wrapping board is offered at Easy
  only, since a rule modifier has one line of the menu
  (`preset-menu-shape.test.ts`). If Unreasonable becomes a wrapping tier in
  practice, that line is the place to offer it.

## Capabilities

### Modified Capabilities

- `net`: the hint's reasons, the tiers, what the generator deals.

## Impact

- `src/games/net/deduce.ts`, `hint.ts`, `hint-text.ts`, `solver.ts`,
  `generator.ts`, `state.ts` (tiers, bounds), the game's tests and pins,
  `help/games/net.md`, and the params snapshot if a tier is added.
