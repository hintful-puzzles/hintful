## ADDED Requirements

### Requirement: A shared role is two games' meaning, and a hint ink is the engine's

A color SHALL be a shared role only where two or more games mean the same
thing by it; a hint ink (`HINT_RING` and its siblings) owes no game, since
the engine reads every one. A color one game derives for its own board SHALL
be declared in the engine's table of game-local colors, under a name that
begins with the game's id; a named color a game takes directly is not in that
table. A member of a set told apart from its other members SHALL NOT be a
shared role.

#### Scenario: A game-specific color stays game-specific

- **WHEN** a color is derived for one game's board only
- **THEN** it is declared game-local under that game's id, so the declaration is a
  recorded decision and not an omission
- **AND** the suite fails when another game imports it

#### Scenario: A role one game is left holding

- **WHEN** a shared role outside the hint inks is taken by one game, or by
  none
- **THEN** the suite fails and names the role and the game

### Requirement: The hint inks are their roles' first reference colors, kept apart

Each hint ink SHALL be its role's first reference color, and the three inks
(`HINT_RING`, `HINT_OUTLINE`, `HINT_STRIPES`) SHALL stay more than 0.12 apart
in OKLCH in each scheme.

#### Scenario: A scheme's hint inks converge

- **WHEN** a color edit brings two hint inks within 0.12 in either scheme
- **THEN** the palette guard fails, naming the pair and the scheme

#### Scenario: A reference color is retuned

- **WHEN** the first color of a role's reference colors changes
- **THEN** the role's ink changes with it

### Requirement: The two-state pair keeps off every mark's hue and stands apart in lightness

The two-state pair's colors SHALL be none of the hues spent on marks drawn
over a board: the error's, the cursor's, and those of the hint inks and the
reference colors. A game that paints the pair, a role made of it or one of its
washes SHALL give no mark of its own a color in either of the pair's hues.
They SHALL stand apart in lightness in both schemes, for a player who cannot
tell the hues.

#### Scenario: A cursor over a finished region

- **WHEN** a game washes a finished region in the pair's first hue, as Filling
  does, and draws its keyboard cursor as a ring over the cell
- **THEN** the ring is the shared cursor's green and not a purple, which the
  wash would swallow in the dark scheme

#### Scenario: The pair survives a loss of hue

- **WHEN** the pair's two colors are measured in either scheme
- **THEN** their lightnesses stand apart by more than a stated gap
- **AND** their shapes differ

## REMOVED Requirements

### Requirement: A color is a shared role only where two games mean the same by it

**Reason**: Its scenario for the evidence fill described `HINT_EVIDENCE_WASH`,
which is retired, and a hint role now owes no game.

**Migration**: Requirement "A shared role is two games' meaning, and a hint
ink is the engine's".

### Requirement: The hint emphases stay distinguishable in both schemes

**Reason**: The five hint roles it measured are retired for three inks.

**Migration**: Requirement "The hint inks are their roles' first reference
colors, kept apart".

### Requirement: The pair's colors keep off the marks' hues and stand apart in lightness

**Reason**: No game outlines a third hint premise in orange any more.

**Migration**: Requirement "The two-state pair keeps off every mark's hue and
stands apart in lightness".

### Requirement: The two premise references each cite one state of a cell

**Reason**: Each reference of a hint's words has been repainted in a color of
its own since references took colors, so a premise's color no longer says its
state; the games draw every premise in the outline ink, and the engine colors
it.

**Migration**: A premise is an outline reference, named by its noun.

### Requirement: The acted-on hint color outweighs the evidence fill

**Reason**: No game washes its evidence any more (engine-hints requirement "An
evidence area is outlined, never washed"), so there is no fill to outweigh.

**Migration**: None.
