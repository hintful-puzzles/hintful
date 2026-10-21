## REMOVED Requirements

### Requirement: Params: Separate refuses to deal a size its generator gives up on

**Reason**: The bounds were drawn from how often the generator finds a
board, and a size is no longer refused for being rare (`engine-difficulty`,
"A rare tier is dealt under the deadline"). The deal's deadline answers a
size whose board is not found in time, in every game alike.

**Migration**: None. Any letter count from 2 to 26 that divides the grid,
and is less than its area, is dealt.
