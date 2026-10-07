## ADDED Requirements

### Requirement: Bridges tells a settled island by a lifted face

`redraw` SHALL draw the face of an island that still has bridges to take as
the collection's cell surface, and the face of an island the player has marked
completed, or one the auto-mark aid marks, as the collection's lifted surface,
the one a given sits on elsewhere. The band under a bridge that a completed
island has locked SHALL be the same lifted surface. Settled is so told by a
pair of surfaces the collection names, which hold in both schemes, and never by
a bevel shade. An island's rim, its count and the bridges SHALL stay in ink,
and the board between islands SHALL stay the board.

#### Scenario: An island with bridges to take has the cell surface

- **WHEN** a freshly dealt board is drawn
- **THEN** every island's face is the cell surface and none is the lifted
  surface

#### Scenario: A completed island is lifted

- **WHEN** the player marks an island completed
- **THEN** that island's face is the lifted surface

## MODIFIED Requirements

### Requirement: Bridges auto-marks satisfied islands (fork aid)

The game SHALL offer an `auto-mark-complete` boolean preference, default on,
exposed through `Game.prefs` — a deliberate divergence from upstream, which
requires a manual click to mark an island done. When on, the renderer SHALL draw an
island whose current bridge-count equals its clue with the "done" mark background
(`DI_BG_MARK`), automatically and without any player action. This aid SHALL be
**purely visual**: it SHALL NOT set `G_MARK` or lock the island's bridges, so the
player can still edit them freely (the manual click-to-mark-and-lock behavior is
retained and unchanged). Because a satisfied island is never `island_impossible`,
the auto-mark background SHALL never fight the red live-error foreground. The
background is part of the render diff key, so an island takes the done-mark
background, the lifted surface, as soon as its count is met and reverts when a
bridge is removed.

#### Scenario: A satisfied island grays only when the preference is on

- **WHEN** the player brings an island's bridge-count up to its clue with
  `auto-mark-complete` on
- **THEN** that island is drawn with the done-mark background, while the same
  state drawn with the preference off shows no done-mark background, and in
  neither case is the island's `G_MARK` flag set (its bridges stay editable)
