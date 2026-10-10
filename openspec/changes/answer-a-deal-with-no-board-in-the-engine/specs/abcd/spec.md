## REMOVED Requirements

### Requirement: The generator's retry cap is sized to what the bound admits

**Reason**: No generator states a cap for its deal. The engine bounds every
deal by one deadline (`engine-difficulty`, "A deal is bounded by one deadline,
the same in every game").
**Migration**: None. A deal that finds no board is answered as before, by the
engine's sentence.
