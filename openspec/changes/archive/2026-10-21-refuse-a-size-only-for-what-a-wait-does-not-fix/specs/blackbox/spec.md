## REMOVED Requirements

### Requirement: Params: Only a deal is bound by the ball limit

**Reason**: The limit was drawn from deal times, and a size is no longer
refused for its wait (`engine-difficulty`, "A rare tier is dealt under the
deadline"). Measured 2026-10-21, an 8×8 with 35 balls deals in 6 s and with
40 in 73 s; the page ends a deal that outlasts the deadline.

**Migration**: None. Any number of balls fewer than the squares is dealt.
`ballLimit` is removed.
