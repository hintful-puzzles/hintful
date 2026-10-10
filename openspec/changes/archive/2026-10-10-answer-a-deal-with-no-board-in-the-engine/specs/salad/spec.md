## REMOVED Requirements

### Requirement: Salad's generation retry bound outlasts a legal seed

**Reason**: No generator states a bound for its deal, by shape or otherwise.
The engine bounds every deal by one deadline, which counts no tries, so a
shape whose boards are rare is given the tries it needs with nothing written
for it (`engine-difficulty`, "A deal is bounded by one deadline, the same in
every game").
**Migration**: None. The Normal Number Ball preset is held to dealing by the
difficulty contract's sweep of every preset.
