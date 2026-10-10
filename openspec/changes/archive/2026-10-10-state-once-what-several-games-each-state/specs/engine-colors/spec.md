## ADDED Requirements

### Requirement: A solved flash drawn as a color takes a shared color

A completion flash drawn as a fill or line color SHALL take a shared color and
none of the game's own. A flash that lifts cells takes the lifted surface
(`givenSurface`) on its lit beats, a step off the cell that reads in both
schemes; any other takes the `FLASH` role, maximum contrast against the surface
and inverting with the scheme. A game that flashes to another color SHALL say
why at the assignment. A flash that is an animation and not a color keeps its
own mechanism.

#### Scenario: Two white-flashing games flash the same color

- **WHEN** two games that flash their board to white on completion are resolved
  in either scheme
- **THEN** both flash colors are equal
- **AND** neither is the board's own color in that scheme

#### Scenario: A board that lifts its cells

- **WHEN** a game whose flash lifts its cells also draws givens
- **THEN** a cell on a lit beat is the color of the cell under a given, and the
  pieces and glyphs on it are drawn as on any other frame

#### Scenario: A flash that is not a color

- **WHEN** a game's flash swaps two states, hides its content, cycles its
  colors, spins its pieces, blinks its beveled tiles between their bevel's two
  colors, runs a wave of its bevel's colors across the board or washes the
  cells under their text
- **THEN** it takes neither color and owes no reason

#### Scenario: A flash along content that has spent the role

- **WHEN** a game's flash runs along ink lines over a bed in a hue of the pair,
  where `FLASH` is the lines' opposite in one scheme and close to the bed in
  the other
- **THEN** it takes another shared role, and the assignment says so

### Requirement: Shaded or not is the pair's first member alone

The engine SHALL provide, for a game where a cell is shaded or is not, the
pair's first member alone: its color (`SHADED`), its shape (`SHADED_SHAPE`),
its word (`SHADED_NAME`) and one word for a cell known not to be shaded
(`UNSHADED_NAME`), which holds no piece. Such a game SHALL take the three by
reference wherever it names the piece's color or shape, SHALL call a cell
known not to be shaded by that one word, and SHALL name the color in its help
page by the pair's placeholder.

#### Scenario: Two games conclude a cell is not shaded

- **WHEN** a hint of one such game and a hint of another each conclude that a
  cell is not shaded
- **THEN** both sentences end on the same word

#### Scenario: A game that names the state and never the color

- **WHEN** such a game's sentences call its piece by a word of the puzzle, as
  "shaded brick", and say no color
- **THEN** it owes the piece's word nowhere, and its help page still names the
  color by placeholder

#### Scenario: Two states the player makes

- **WHEN** both of a game's states are ones the player makes, as lit and unlit
- **THEN** the game takes the two-state pair, and this requirement does not
  bind it

## MODIFIED Requirements

### Requirement: The figure the player steers takes the cursor's color

The figure the player steers SHALL take the cursor's color, which says where
the player is, and SHALL NOT take a hue of the two-state pair. A figure whose
faces show what the player carries is the departure: a face that carries
SHALL be `MOVED`, as the thing is on the board, and a plain face SHALL be the
lifted surface (`givenSurface`), so that the only hue on the figure is what
it holds.

#### Scenario: A figure beside the thing it pushes

- **WHEN** a game draws the figure the player steers beside a thing it pushes
- **THEN** the figure is the cursor role's color and the pushed thing is `MOVED`

#### Scenario: A solid that picks paint up

- **WHEN** a game's figure is a solid that takes paint from a square onto the
  face that lands on it
- **THEN** that face is the painted square's color, every other face is the
  lifted surface, and no face is the cursor's color

## REMOVED Requirements

### Requirement: The solved flash is one role

**Reason**: Restated as "A solved flash drawn as a color takes a shared color". The requirement said a flash drawn as a fill takes `FLASH` and excused only a
flash that is an animation. The code has a second fill: `givenSurface`, under
every cell on the flash's lit beats. Read in each game's `colors()` and
`redraw` (`src/games/*/render.ts`; Mines' palette is in `index.ts`): Pegs
(`COL_LIT`), Range, Palisade, Subsets, Unruly and Slant (`COL_GIVEN`), Separate,
Singles, Same Game and Light Up (`COL_FLASH`), Netslide (`COL_FLASHING`), Net
(`COL_LOCKED`) and Mines (`COL_COVERED`) all assign `givenSurface` to the slot
the flash fills with; Palisade and Separate reach it through `flash` of
`BorderGridColors` (`drawBorderTile`, `src/engine/border-grid-render.ts`).
`FLASH` is assigned by Crossing, Inertia, Magnets, Loopy, Pearl, Rome, Mathrax,
Sokoban, Seismic, Spokes, Undead, Unequal and Untangle. One game fills with a
third color and says why at the assignment: Tracks takes `GOAL`
(`src/games/tracks/render.ts`, the comment above `out[COL_FLASH]`). The title
changes because "one role" is no longer what it says; no source or guide cites
it (`spec-citations.mjs --list`). The list of animations moves into a
scenario, and names the wave of bevel colors that ABCD, Ascent and Salad run
and the blink between the bevel's two colors that Fifteen, Sixteen, Twiddle
and Slide give their tiles (`bgcolor` in the first three's `redraw`,
`FLASH_LOW`/`FLASH_HIGH` in Slide's). The reviewer read the flash path of every
registered game's `render.ts`; the rest hide content, swap states, cycle
colors, spin or wash under text, and Cube and Guess have no solved flash.
