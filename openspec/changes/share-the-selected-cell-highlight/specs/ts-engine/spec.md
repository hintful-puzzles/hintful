## ADDED Requirements

### Requirement: The note-taking cell's highlight has one picture, drawn by the engine

The engine SHALL draw the note-taking cell's highlight, so that the selected
cell looks the same in every game in the mechanic: the whole cell washed while
typing enters a value, and a right triangle in the cell's top-left corner, its
legs half the cell's painted width and height, while typing enters a note. The
picture SHALL be the same whether the pointer or the keyboard placed the
highlight. The wash SHALL be the palette's "you are here" wash of the board's
background, at whatever palette index the game keeps it, for both the full cell
and the triangle.

The picture SHALL be part of the cell's background: it is drawn with the cell's
background and before any of the cell's content, so a clue, a mark or a
divider in the same corner stays on top of it. The game SHALL fold the
highlight's state into its per-cell repaint key, so the cell repaints when the
highlight arrives, changes mode or leaves.

A game SHALL keep what is genuinely about its puzzle: the rect it paints, its
background, a completion flash that hides the highlight, and a square the
picture cannot sit on. A Crossing wall has no background to wash and can be
reached only by the arrow keys, so the keyboard cursor there SHALL remain the
corner brackets.

Membership SHALL be derived as the mechanic's is — a game is in it iff its `Ui`
carries the fields — and a member that does not paint its cell background
through the engine SHALL fail the build, by a source scan, for the reason the
press arm's guard gives.

#### Scenario: Entry and notes, in every member

- **WHEN** a member's cell is selected, first for entry by the pointer and by
  the keyboard, then for notes
- **THEN** the entry frames wash the whole cell and draw no triangle, and the
  notes frame draws the corner triangle in the same wash and does not wash the
  cell

#### Scenario: The highlight leaves

- **WHEN** the highlight is put away
- **THEN** the cell repaints, with neither the wash nor the triangle

#### Scenario: A game that kept its own copy

- **WHEN** a game carries the mechanic's `Ui` fields and never calls the
  engine's cell-background painter
- **THEN** the build fails and names the game
