## RENAMED Requirements

- FROM: `### Requirement: A premise that asserts a walk is computed and numbered`
- TO: `### Requirement: A premise that asserts a walk is computed and outlined`

## MODIFIED Requirements

### Requirement: A premise that asserts a walk is computed and outlined

A premise that asserts a walk SHALL be computed and checked, not assumed, and
SHALL be presented to the player as an outlined area holding the cells of that
walk, with no number on them, so the walk is one they can follow from where the
sentence starts it.

#### Scenario: The walk a sentence names is on the board

- **WHEN** a strike's premise says that following a candidate leads back to the
  cell it started from
- **THEN** the cells of that walk are the ones found on this board, outlined,
  and none carries a number

### Requirement: A shared narrator for generic Latin placements and strike premises

The shared hint-text module SHALL provide `narrateLatinReason`, which renders
the generic Latin placement reasons (`single`, `regionsFull`, `hiddenSingle`),
and `latinPremise`, which renders the premise of the generic Latin strike
reasons (`dup`, `set`) for the candidate walk to conclude. A row/column game
SHALL delegate those arms to them and keep its game-specific arms local. Each
SHALL refuse a reason of the other half and SHALL NOT narrate it. Neither
narrates a forcing chain, a search.

#### Scenario: A delegated placement arm narrates the shared sentence

- **WHEN** a row/column game places a value for a generic single
- **THEN** its sentence is the shared narrator's, in the game's value vocabulary

#### Scenario: A narrator refuses the other half

- **WHEN** `narrateLatinReason` is handed a strike reason, or `latinPremise` a
  placement reason
- **THEN** it throws, naming the function that narrates that reason

## ADDED Requirements

### Requirement: A game whose generic wording diverges narrates its own arms

A game whose generic-arm wording legitimately diverges SHALL keep its own
narration and SHALL NOT carry overrides into the shared narrator: Solo, whose
arms name a block or diagonal region, and Towers, which narrates in "height"
vocabulary, are conformingly left local. They SHALL share the premises that read
the same in every game: a value confined across lines (`confinedPremise`) and
the placement cull's (`placedRulesOut`).

#### Scenario: Towers words its own singles and shares a confined value

- **WHEN** a Towers hint narrates a hidden single, and later a height confined
  across lines
- **THEN** the single's sentence is Towers' own, and the confined premise is
  the one `confinedPremise` writes

## REMOVED Requirements

### Requirement: A game whose generic wording diverges keeps its own narration

**Reason**: Its case was the forcing chain's shared premise, and no hint
narrates a forcing chain.

**Migration**: "A game whose generic wording diverges narrates its own arms"
holds the rule for the premises still shared.
