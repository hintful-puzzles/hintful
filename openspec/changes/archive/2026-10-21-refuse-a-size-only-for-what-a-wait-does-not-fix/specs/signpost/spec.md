## REMOVED Requirements

### Requirement: Params: Unreasonable Signpost is bounded on its own measurements

**Reason**: The bound was drawn from deal times, and a size is no longer
refused for its wait (`engine-difficulty`, "A rare tier is dealt under the
deadline"). Measured 2026-10-21, a 30×30 deals in 114 s on average and a
2×200 in 23 s.

**Migration**: None. These sizes are dealt, and the deadline answers one
that finds no board in time.
