## REMOVED Requirements

### Requirement: Params: Unreasonable Net is bounded on its own measurements

**Reason**: Each bound was drawn from deal times, and a size is no longer
refused for its wait (`engine-difficulty`, "A rare tier is dealt under the
deadline"). Measured 2026-10-20, a 70×70 deals in 81 s, a 6×800 in 54 s, and
a 10×300 wrapping in 30 s.

**Migration**: None. These sizes are dealt, and the deadline answers one
that finds no board in time.

### Requirement: Params: Net refuses Unreasonable without wrapping where it is too rare

**Reason**: The boards are rare, not absent, and a rare size is dealt
(`engine-difficulty`, "A rare tier is dealt under the deadline"). Measured
2026-10-20, a 5×5 deals in 4 s and a 4×30 in 3 s.

**Migration**: None. These sizes are dealt, and the deadline answers one
that finds no board in time.
