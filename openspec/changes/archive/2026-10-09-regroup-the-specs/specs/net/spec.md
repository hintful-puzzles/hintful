## MODIFIED Requirements

### Requirement: Tiles rotate and lock

Left-click or `a` SHALL rotate a tile anticlockwise, right-click or `d` clockwise, and `f`
by 180°. `s` SHALL toggle a tile's lock, and so SHALL a tap in the middle
third of a tile in notes mode, where the pointer's other taps note sides:
outside notes mode both buttons rotate, so notes mode is where the pointer
reaches the lock. A locked tile SHALL NOT rotate.

#### Scenario: A tap in the middle of a tile in notes mode locks it

- **WHEN** notes mode is on and the player taps, or right-clicks, the middle third of a tile
- **THEN** the tile's lock toggles, and a tap nearer one of its sides notes that side instead

### Requirement: A hint's lock is one journey of the turn and the lock

A lock step of Net's hint whose tile must turn first SHALL be one journey of
the turn and the lock.

#### Scenario: A lock that needs a turn

- **WHEN** the hint locks a tile that is not yet turned the one way that fits
- **THEN** the plan holds a rotation of that tile and then its lock, the lock
  continuing the rotation's step

## REMOVED Requirements

### Requirement: Net offers one wrapping preset

**Reason**: collection: `engine-params`, "A checkbox rule modifier has one line
of the menu", gives the single wrapping board (Net declares wrapping with
`modifierItem`, a checkbox, in `src/games/net/index.ts`, and is in no per-size
ledger), and `engine-params`, "Every default and preset draws no wider than
tall", gives the 13×11 stood upright. Both rules were decided for every game
with the owner
(`openspec/changes/archive/2026-10-05-review-preset-counts-across-the-catalog/proposal.md`,
"A rule modifier has one line"; its `menus.md` row for Net gives that rule as
the reason). What is left, which sizes, is the `PRESETS` table.
