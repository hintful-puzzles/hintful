## REMOVED Requirements

### Requirement: Group's hint deduces from the placed entries, never the notes

**Reason**: `engine-candidate-hints`, "A recording solve reads the placed entries and
never the notes", holds the rule: Group's `record` calls
`recordGroupDeductions(wGrid, w, maxdiff)`, which takes no notes. The
requirement and its scenario say nothing else.
