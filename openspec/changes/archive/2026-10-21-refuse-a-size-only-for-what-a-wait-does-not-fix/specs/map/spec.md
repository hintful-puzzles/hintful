## REMOVED Requirements

### Requirement: Params: Map refuses a tier too rare to deal on a narrow map

**Reason**: These maps are rare at the tier, not absent, and a rare size is
dealt (`engine-difficulty`, "A rare tier is dealt under the deadline").
Measured 2026-10-21, a 4×5 map of 9 regions at Tricky deals in 29 s and a
3×10 of 11 in 73 s.

**Migration**: None. These maps are dealt, and the deadline answers one that
finds no board in time.
