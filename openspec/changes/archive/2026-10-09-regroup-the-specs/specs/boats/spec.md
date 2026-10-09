## MODIFIED Requirements

### Requirement: Every Boats technique is narrated

Every named technique SHALL be narratable. Boats guesses at no tier, so the
hint SHALL NOT fall back on an unexplained "this is the only possibility" step.
A step forced only because the opposite placement contradicts the board SHALL
name the rule that placement would break.

#### Scenario: A refutation names the rule the alternative would break

- **WHEN** a square is forced only because the opposite placement immediately
  contradicts the board
- **THEN** the explanation names the specific rule that would break (a line's
  number, two boats touching, or a boat the fleet cannot hold) rather than
  asserting the square is forced without reason

## REMOVED Requirements

### Requirement: Boats refuses to hint a board it cannot honestly advise

**Reason**: duplicate: "Boats findMistakes re-solves to the unique solution"
already says a locally legal placement no solution permits is reported, with
that scenario. The refusal itself is `engine-hints` "The midend SHALL refuse a
hint on a finished or wrong board before asking the game", which refuses
wherever `findMistakes` reports anything and highlights it. Boats' `hint` in
`src/games/boats/index.ts` makes no such check of its own; its comment says the
midend's refusal is why.
