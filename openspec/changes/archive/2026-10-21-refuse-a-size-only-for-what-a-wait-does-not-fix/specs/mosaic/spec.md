## REMOVED Requirements

### Requirement: Params: Mosaic rejects board shapes it cannot generate

**Reason**: The greatest lengths were drawn from the share of pictures the
rule finishes, not from a board that cannot exist, and a size is no longer
refused for its rarity (`engine-difficulty`, "A rare tier is dealt under the
deadline").

**Migration**: None. A long thin board is dealt, and the deadline answers
one that finds no board in time.

### Requirement: Params: Aggressive generation above Easy is bounded on its own measurements

**Reason**: The bound was drawn from deal times, and a size is no longer
refused for its wait (`engine-difficulty`, "A rare tier is dealt under the
deadline"). Measured 2026-10-20, an aggressive Unreasonable 80×80 is dealt
in 107 s.

**Migration**: None. These sizes are dealt with aggressive generation on,
and the page ends a deal at the deadline where one search outlives it.
