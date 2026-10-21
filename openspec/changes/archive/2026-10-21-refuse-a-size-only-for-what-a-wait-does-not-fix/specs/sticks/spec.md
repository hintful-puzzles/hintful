## REMOVED Requirements

### Requirement: Params: Unreasonable Sticks is bounded on its own measurements

**Reason**: The bound was drawn from deal times, and a size is no longer
refused for its wait (`engine-difficulty`, "A rare tier is dealt under the
deadline"). Measured 2026-10-21, a 15×15 deals in 87 s on average and a
2×60 in 67 s.

**Migration**: None. These sizes are dealt, and the deadline answers one
that finds no board in time.
