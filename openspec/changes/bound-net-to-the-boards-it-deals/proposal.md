# bound-net-to-the-boards-it-deals

**Status: filed 2026-10-10 by the session that gave Net its Unreasonable
tier (`add-an-unreasonable-tier-to-the-untiered-deductive-games`), which
measured it. What it says of the code was true that day; re-check before
relying on it.**

## Why

Net's only size bound is a million squares (`validateParams` in
`net/state.ts`), and an Easy deal is far slower than that allows. Two things
cost the time, and they are different defects.

**The check that the hint finishes the board grows with the square of its
size.** `easyBoard` in `net/generator.ts` keeps a board only if `finishes`
(`net/deduce.ts`) plays the hint's engine to the end, and `nextStep` surveys
every unlocked tile for each step it takes. Measured 2026-10-10 at Easy, no
walls, mean time for a deal, six deals a size or as many as fit in six
seconds:

| Board | Squares | No wrapping | Wrapping |
| --- | --- | --- | --- |
| 15x15 | 225 | 0.07 s | 0.08 s |
| 20x20 | 400 | 0.24 s | 0.29 s |
| 25x25 | 625 | 0.64 s | 0.69 s |
| 30x30 | 900 | 1.3 s | 1.4 s |
| 40x40 | 1,600 | 4.6 s | 4.9 s |
| 50x50 | 2,500 | 11 s | 16 s |
| 70x70 | 4,900 | 46 s | 48 s |

An Unreasonable deal does not run that check and is faster than an Easy one
past 20x20 (0.45 s at 30x30, 0.7 s at 40x40), so the engine's walk is the
cost and not the solver or the rewiring.

**A thin wrapping board can take minutes.** Same day, Easy, wrapping:

| Board | Deals | Mean | Worst |
| --- | --- | --- | --- |
| 3x30 | 6 | 0.13 s | 0.41 s |
| 3x80 | 6 | 0.13 s | 0.23 s |
| 3x100 | 6 | 60 s | 355 s |
| 3x120 | 5 | 91 s | 453 s |
| 4x50 | 6 | 0.14 s | 0.23 s |
| 4x80 | 3 | 3.1 s | 4.5 s |
| 4x120 | 0 | none in 5 s | |
| 5x120 | 6 | 0.7 s | 0.9 s |
| 6x120 | 6 | 1.0 s | 1.1 s |

Most 3x100 deals take a fraction of a second and one in six takes minutes,
so it is a tail and not a slope. Where the time goes was not found: the
sweep's time limit sat in the rewiring loop and did not fire, which leaves
the shuffle (`shuffle` in `net/generator.ts`, bounded at 10,000 reshuffles of
up to `w * h * 100` rounds each) and the hint's walk. A ring three tiles
round closes a loop whenever its three tiles all lie across it, so the
shuffle's loop-fixing is the first place to look.

The Unreasonable tier has bounds of its own from the same sweep
(`unreasonableRefusal` in `net/state.ts`): 900 squares, 80 long when
wrapping, 30 long when wrapping and four wide, and a barrier probability of
0.3. They were taken with no walls and with walls at four sizes only.

## What Changes

- `validateParams` refuses, when a board is to be dealt, a board Net does not
  deal in a few seconds, with a reason that names what to change.
- The tail on a thin wrapping board is found and bounded, in the loop that
  has it and not only by refusing the size.
- A pasted board of any size still opens.

## What to settle first

- **Where a 3x100 wrapping deal spends 355 seconds.** Put a time limit and a
  count in `shuffle` and in `finishes` and deal 3x100 wrapping until one is
  slow. If it is the shuffle, the bound on its rounds is the defect and the
  size need not be refused.
- **Whether `finishes` can be made cheap enough to move the bound.** It
  rebuilds its reach for every step and rescans every tile. A worklist of the
  tiles a new fact can affect would deal the same boards, since the engine's
  fixpoint does not depend on the order of its steps so long as each rule is
  monotone (`docs/games/solver-and-generator.md` § "A fixpoint is
  order-independent only if every rule is monotone"), and that has to be
  shown before the generator relies on it.
- **Not refusing what deals today.** A 30x30 board deals every time in under
  two seconds. Refusing a board that deals today in a few seconds is the
  owner's call.
- **The shape of the bound.** Sweep the shorter side from 3 to 12, every
  width and not every other one, wrapping and not, with walls at 0, 0.3 and
  1: on a wrapping board the even widths are the slow ones at Unreasonable
  (4 wide past 30 long, 6 wide past 80).

## Capabilities

### Modified Capabilities

- `net`: which sizes are dealt.

## Impact

- `src/games/net/state.ts` (`validateParams`), `generator.ts` (`shuffle`,
  `easyBoard`), `deduce.ts` (`finishes`), `net.test.ts` and
  `net-tier.test.ts`, `help/games/net.md` and `help/differences.md`.
