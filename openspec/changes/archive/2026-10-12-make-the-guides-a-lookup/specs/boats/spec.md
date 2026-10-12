## MODIFIED Requirements

### Requirement: Every Boats technique is narrated

Every named technique SHALL be narratable. Boats guesses at no tier, so the
hint SHALL NOT fall back on an unexplained "this is the only possibility" step.
A step forced only because the opposite placement contradicts the board SHALL
name the rule that placement would break. Where the board's check rejects the
placement without naming a rule, the step SHALL say that the rest of the fleet
could no longer be placed legally, and SHALL NOT be dropped.

#### Scenario: A refutation names the rule the alternative would break

- **WHEN** a square is forced only because the opposite placement immediately
  contradicts the board
- **THEN** the explanation names the specific rule that would break (a line's
  number, two boats touching, or a boat the fleet cannot hold) rather than
  asserting the square is forced without reason

#### Scenario: A refutation the check gives no rule for is still a step

- **WHEN** the opposite placement is rejected and the check flags no line, no
  touching boats, no boat and no given segment
- **THEN** the step is offered, and says the rest of the fleet could no longer
  be placed legally

## ADDED Requirements

### Requirement: A Boats journey shows its whole firing on every leg

Every leg of a journey SHALL carry the sentence and the marks of the whole
firing: every square the firing decides, its never-touch water included, and
its evidence. Playing a leg SHALL NOT shrink the picture. `hintKeepTrack`
SHALL judge a leg by the squares its own move asks for, so a journey advances
one leg at a time.

#### Scenario: A journey played leg by leg

- **WHEN** a firing that decides several squares is played one leg at a time
- **THEN** each leg completes on its own move and the plan advances to the
  next
- **AND** every leg marks all the squares the firing decides
