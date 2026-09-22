## ADDED Requirements

### Requirement: Loopy's presets draw tall, read width first, and turn where the tiling allows

Every Loopy preset SHALL draw no wider than tall. A tiling that turns keeps upstream's size, turned where it was landscape; a tiling that cannot turn SHALL take a size of its own that draws taller than wide, chosen to keep about the drawn area of upstream's preset (Triangular 9×14, Kites 4×6, Great-Hexagonal 4×5, Kagome 3×6, Dodecagonal 3×6, Great-Dodecagonal 3×6, Great-Great-Dodecagonal 3×5, Compass-Dodecagonal 4×5, Hats 9×11). Preset titles SHALL print the width first, as every other game's titles and the Custom dialog do, rather than upstream's height first.

Each row of `LOOPY_GRIDS` SHALL state whether its tiling `turns`, and `transposeParams` SHALL turn exactly those. A tiling turns when a patch `h` wide and `w` tall is the same tiling on its side: the square-lattice tilings (Squares, Snub-Square, Cairo, Octagonal, Compass-Dodecagonal) and the aperiodic tilings whose patch fills its box alike both ways (both Penroses, Spectres). A triangle or hexagon lattice turned is another tiling, and a Hats patch is not the same shape turned, so those SHALL NOT turn.

#### Scenario: Titles read width first

- **WHEN** the preset menu is walked
- **THEN** every leaf's title begins with its params' `{w}x{h}`

#### Scenario: A hexagonal tiling is dealt as chosen

- **WHEN** a Honeycomb board is dealt to fit a wide area
- **THEN** it is dealt at the size chosen, because Honeycomb does not turn
