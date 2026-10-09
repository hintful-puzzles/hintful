## REMOVED Requirements

### Requirement: A pair that is close on purpose is recorded

**Reason**: duplicate: "Colors a game paints side by side stand apart in the
dark scheme" states both halves. Its body says a close pair is "entered as
close on purpose with what carries the shape instead", and its scenario "A pair
that is close on purpose" says the guard "holds an entry for that pair saying
so, and fails when a pair is close with no entry, or an entry's pair is no
longer close". A pair the game stops painting is a pair no longer close, since
`src/puzzle/neighbor-contrast.test.ts` compares the close pairs read off the
frames with the ledger's keys for equality. The stale-entry half is a rule a
session checks a change against (a palette whose indices moved fails on it),
and it survives in that scenario.
