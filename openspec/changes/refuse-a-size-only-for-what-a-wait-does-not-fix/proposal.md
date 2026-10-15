# refuse-a-size-only-for-what-a-wait-does-not-fix

**Status: waiting on the owner's answer (below). Filed 2026-10-15** from
item 2 of `mend-what-the-guide-rewrite-found`, which measured it and
archived without it. Every figure here carries that date; re-check it
before relying on it.

## Why

`docs/solver-and-generator.md` § "A Custom size is not refused for its wait"
says a large Custom size that deals slowly is not refused, and names "a
larger one takes too long to deal" as a wait. Net, Signpost and Sticks each
refuse an Unreasonable size in exactly those words
(`src/games/net/state.ts`, `src/games/signpost/index.ts`,
`src/games/sticks/state.ts`), and Net's refusal is in its spec. Beside it,
`engine-difficulty`, "An unbindable tier is refused, not silently
downgraded", reads as an unconditional SHALL, while the guide's default, that
a new game writes no refusal for a rare tier and leaves it to the deal's
deadline (`DEAL_DEADLINE_MS`, 120 s, `src/engine/deal.ts`), is in no spec.

## What was measured

`npm run deal-walk` with `DEAL_WALK_CELLS` naming each size, which now deals
a refused size too. One machine under outside load (load average 5–11, swap
nearly full), so the seconds are an upper bound; the shape is what to read.
Every deal that came back was an Unreasonable board.

| Game | Refused past | Just past the bound (3 deals) | Further out (2 deals) |
| --- | --- | --- | --- |
| Net | 900 squares | `31x30`: 3 s, slowest 4 | `45x45`: 16 s; `60x60`: 38 s |
| Net | 40 long, unwrapped, under 7 wide | `6x41`: 0.8 s, slowest 2 | `6x80`: 0.9 s |
| Net | 30 long, wrapping, 4 wide | `4x31w`: 0.6 s, slowest 1 | `4x60w`: 66 s, slowest 81 |
| Net | 80 long, wrapping | `7x81w`: 1 s | `7x160w`: 4 s |
| Sticks | 100 squares or 30 long | `11x10`: 3 s, slowest 6; `2x31`: 1 s | `15x15`: 79 s, slowest 85; `20x20`: **no board in 120 s**, 2 of 2; `2x60`: 28 s |
| Signpost | 225 squares or 30 long | `16x15`: 1 s; `2x31`: 0.1 s | `20x20`: 5 s; `30x30`: **gave up**, 2 of 2, in 11 s; `2x60`: 0.4 s |

Every bound sits well inside the deadline: the sizes just past each deal in
seconds. Two games do reach a real limit further out, and both are of the
kind the guide does refuse: Sticks at `20x20` never answers inside the
deadline, and Signpost at `30x30` runs its retry bound out, which is a
generator that fails more often than it finds.

## A question for the owner

Player-visible either way. Recommendation: **(a)**.

- **(a)** Remove the three "takes too long to deal" refusals. A size that
  deals inside the deadline is dealt, however long the player chooses to
  wait. Where a generator gives up or never answers (Signpost near `30x30`,
  Sticks near `20x20`), refuse it for that reason, with the line drawn from
  a dozen deals each side as the guide asks, and say so in the words for a
  size no board is found at. Net's spec loses its refusal.
- **(b)** Keep the refusals, and narrow the guide's rule to say when a wait
  is a reason to refuse; `engine-difficulty` gains the bar a refusal must
  clear. This keeps sizes the measurement deals in seconds refused.

## What Changes

On (a): the three games' `validateParams` lose the wait refusals and gain,
where measured, a refusal for a generator that gives up; Net's spec delta;
`engine-difficulty` states the default (no refusal for a rare tier's wait;
the deal's deadline answers it). On (b): `docs/solver-and-generator.md` and
`engine-difficulty`.

## Impact

`src/games/{net,signpost,sticks}/`, their help pages where they name a
limit, `openspec/specs/net/spec.md`, `openspec/specs/engine-difficulty/`,
`docs/solver-and-generator.md`.
