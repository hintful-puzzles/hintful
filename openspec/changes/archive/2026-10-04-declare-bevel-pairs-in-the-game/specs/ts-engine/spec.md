## ADDED Requirements

### Requirement: A game declares its palette's scheme handling with its own color constants

What a game's palette needs from the color schemes beyond its tokens SHALL be declared on the game, as `Game.paletteScheme`, in terms of the game's own color constants: the color the board is painted in when it is not color 0, the pairs whose dark values are exchanged, and a factor on a color's dark lightness.

The app SHALL read that declaration from the game, through the static attributes the midend reports, and SHALL hold no table of its own that addresses a game's palette by index. A game that declares nothing SHALL get color 0 as its board, no exchanged pairs and no factors.

#### Scenario: A moved color takes its swap with it

- **WHEN** a color is added or dropped above a game's bevel so that the bevel's indices move
- **THEN** the dark scheme still exchanges the bevel's highlight and lowlight, with no edit outside the game's palette

#### Scenario: A game that declares nothing

- **WHEN** a game has no `paletteScheme`
- **THEN** the app paints the page around its canvas in color 0, and adapts its palette to the dark scheme with no exchange and no factor

#### Scenario: A board that is not color 0

- **WHEN** a game declares a board color other than color 0
- **THEN** the page around its canvas takes that color, and the guards that measure against the board measure against it

## MODIFIED Requirements

### Requirement: A dark-scheme palette swap keeps its bevel lit from one side

For every bevel trio a game exchanges via `darkSwaps`, the highlight SHALL be lighter than the surface it sits on and the lowlight darker, **in both schemes**.

A swap exists because inverting every color's lightness turns an emboss into an inset. For every declared pair, whatever its two colors are, the lighter of the two in the light scheme SHALL be the lighter of the two in the dark scheme.

The requirement above is a relationship to that *surface* and not to the board, so a measurement of a swapped index against the background does not state it and MUST NOT be read as though it did: the two indices of a pair denote different roles in the two schemes, so such a measurement compares a highlight with a lowlight.

#### Scenario: A bevel survives the scheme flip

- **WHEN** a game's bevel trio is resolved for the light scheme and for the dark scheme
- **THEN** in each scheme its highlight is lighter than its base and its lowlight is darker

#### Scenario: A swap names two distinct colors

- **WHEN** a game declares a `darkSwaps` pair
- **THEN** both indices exist in that game's palette, they differ in lightness, and no index is named by more than one pair

#### Scenario: A pair keeps its order across the schemes

- **WHEN** a declared pair is resolved for the light scheme and for the dark scheme
- **THEN** the color that is lighter in one is lighter in the other
- **AND** the check fails for every declared pair when the exchange is not applied

## REMOVED Requirements

### Requirement: A game's palette index order is stable

**Reason**: The requirement existed only because the app's dark-mode adjustments addressed a game's palette by raw index from another file. They are declared by the game with its own constants, so reordering a palette cannot re-target them.

**Migration**: None. A game may insert, drop or reorder its colors.

### Requirement: A comment naming a palette-override index is checked against the declaration

**Reason**: The comments it checked explained why appending a color was safe given an index-keyed table in another file. The table is gone and the comments with it, so there is no claim about another file left to check.

**Migration**: None. `src/palette-override-claims.test.ts` is deleted.

### Requirement: A dark-mode swap names a bevel's highlight and its lowlight

**Reason**: The test read each index pair back through the game's constant names to catch a pair left behind by a moved index. A pair written with the constants cannot be left behind, and names both colors where it is declared.

**Migration**: None. `src/palette-swap-names.test.ts` is deleted; the order of each pair across the schemes is held by `src/puzzle/dark-palette.test.ts`.
