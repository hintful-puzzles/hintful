## REMOVED Requirements

### Requirement: The boards a tangle guard names are even permutations

**Reason**: particular: it is a rule about which boards one test may list, and
the only thing that would consult it is someone adding a board to that list.
The comment above the list in `src/games/sixteen/sixteen.test.ts` ("Every board
here is an *even* permutation, and that is load-bearing") says it where that
person is reading, and `docs/games/hints.md` § "Sliding-permutation games"
gives the parity fact itself. It constrains nothing the game does.

### Requirement: Sixteen's hint SHALL refuse only by saying its search ran out

**Reason**: collection: `engine-hints`, "A hint that plans by searching SHALL
refuse honestly past its reach", says the same of every searching hint (the
single constant, and never the refusal that claims no move helps, because an
empty bounded search is a fact about the search), and "The search refusal names
what still works" holds the scenario's second half. Sixteen has no departure:
`src/games/sixteen/index.ts` returns `SEARCH_OUT_OF_REACH` on an empty plan and
nothing else.
