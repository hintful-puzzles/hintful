## REMOVED Requirements

### Requirement: Params: Crossing rejects board sizes it cannot generate

**Reason**: The maxima were drawn from acceptance rates and deal times, not
from a board that cannot exist, and a size is no longer refused for its
rarity (`engine-difficulty`, "A rare tier is dealt under the deadline").
Measured 2026-10-20 under the deal's deadline, an Easy 2×55 is dealt in 56 s
and a 4×56 in 30 s, both past the old maxima.

**Migration**: None. These sizes are dealt, and the deadline answers one
that finds no board in time.

### Requirement: Params: Unreasonable is bounded on its own measurements

**Reason**: The bound was drawn from deal times, and a size is no longer
refused for its wait (`engine-difficulty`, "A rare tier is dealt under the
deadline"). Measured 2026-10-20, an Unreasonable 15×15 is dealt in 27 s.

**Migration**: None. These sizes are dealt. The preset menu still offers
Unreasonable only up to 11×11, which keeps it quick.
