## Why

The owner asked on 2026-11-21, after the second review's items were all
made: "I still feel that there's too much redundancy at the game level.
Could I ask you to do a deep architecture review of the engine interface and
the game contract, and particularly the description schema, and evaluate it
with a fresh 'blue sky thinking' lens?"

The two earlier reviews (`archive/2026-11-20-architectural-review`,
`archive/2026-11-21-architectural-review-second-pass`) ranked repetition
within the architecture as it stands. This one asks whether the architecture
is the right one: what a game would have to write if the engine and the
description were designed today, from the 65 games we now have, and how far
the tree is from that.

## What Changes

- A review, in `design.md`, of the `Game` contract, the description schema
  and the per-game layers of the 46 games whose description says
  `freedom: { kind: fill }`, measured at `717626277`, with prior art from
  other puzzle systems.
- A target architecture, the gap to it, and a staged route with a pilot,
  each stage with its payoff, cost and the decisions that are the owner's.
- Quick corrections the review found, listed for the owner's pick with the
  rest.
- No refactoring is made here. The owner picks; each pick becomes its own
  change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None: a review changes no requirement.

## Impact

Nothing outside `openspec/changes/architectural-review-blue-sky/`.
