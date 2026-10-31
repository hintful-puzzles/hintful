## MODIFIED Requirements

### Requirement: A board's tiers are one run of lines, and every tier is offered

The lines of one board SHALL be consecutive and run from its first tier to its
last with none left out of the tiers its ruleset's lines offer, since one
ruleset may offer tiers another does not. Every tier of a tiered game SHALL be
on the menu, unless every board of the menu refuses the tier, or the guard's
ledger gives the game's reason for leaving it off.

#### Scenario: A board with a tier missing from its run

- **WHEN** a board is offered at Easy, Normal and Hard and not at Tricky, and
  another board of its ruleset is offered at Tricky, or its Hard line stands
  apart from its other lines
- **THEN** the guard fails, naming the board and the tiers it is offered at

#### Scenario: A ruleset that offers fewer tiers

- **WHEN** a game's boards of one ruleset are offered at Easy and Unreasonable,
  and only another ruleset's at Normal
- **THEN** the guard passes

#### Scenario: A tier no line offers

- **WHEN** a tiered game's menu holds no board at one of its tiers, and some
  board of the menu would accept that tier
- **THEN** the guard fails unless its ledger names the game and the tier, and
  it fails for a ledger entry the menu does offer
