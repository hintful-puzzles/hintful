## REMOVED Requirements

### Requirement: Netslide has no mistake check

**Reason**: declared: `notApplicable.findMistakes` in
`src/games/netslide/index.ts` holds the same reason as a sentence ("Every
arrangement of the tiles is a step on the way to the answer, so no move can be
wrong, only longer."), the engine reads it for the section's state and the help
page shows it, and `ts-engine`, "A not-applicable reason is a fact about the
puzzle", is the rule about it. The prose copy says nothing the declaration does
not.
