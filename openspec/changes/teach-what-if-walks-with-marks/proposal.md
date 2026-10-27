# Proposal

## Why

The owner ruled (2026-10-26, `retire-hint-ordinals` design D4) that a chain
is fair only if every link can be recorded with the game's ordinary marks.
A chain of suppositions is Search and belongs to Unreasonable: "in practice,
long forcing is indistinguishable from backtracking." Their example was
Path 7×9 Normal on a phone: "A cross on this edge would force the outlined
edges and leave the outlined square a dead end, so it must be a line." They
called it "an already extremely difficult hint".

Moving such a rung empties the tier when the rung is all that defines it,
and removing a tier changes the params that game IDs and saved preferences
carry. So the owner chose (2026-10-27, D7) to move the Latin forcing chains
at once. The tier-defining rungs wait until each tier has a markable
technique to deal its boards. This change is the engine's side of that, for
one shape: suppose a mark, run the easy rung a bounded number of times, and
reach a clash. The hint shows that shape statically
(`docs/hints-marks.md` § "Show the what-if walk statically").

The rungs of this shape kept below Unreasonable, as classified on 2026-10-27:

| Game | Rung | Tier it alone defines |
| --- | --- | --- |
| Path | `lookahead`, `long-lookahead` (`path/solver.ts`) | Normal (the default), Tricky |
| Clusters | `lookahead-chain` (`clusters/solver.ts`) | Normal |
| Spokes | `contradiction-bounded` (`spokes/solver.ts`) | Normal |
| Boats | the trial `refuted` reads (`boats/solver.ts`) | Hard (borderline: one trial square and one validator call, nearer a Check) |

Re-take this list from the code before relying on it.

## What Changes

- For each tier, find what a player can mark that deals the tier's boards
  without the supposition. A new mark kind or rung the engine offers is
  preferred to one game's own (`docs/doctrine.md`).
- Once a tier deals its boards from markable reasoning, move the rung to
  Unreasonable, or retire it where the game has none, and retire the
  static what-if walk with its last user.
- Where no markable technique fills a tier, bring the owner the measurement
  and the choice: the tier goes or takes another name (a compatibility
  break), or the rung stays.

## Impact

Path, Clusters, Spokes and Boats: their solvers, generators, hints, help
pages and specs. The engine: whatever mark or rung is shared, and
`engine-hints`' exception for a tier-defining supposition rung, which goes
when no rung needs it.
