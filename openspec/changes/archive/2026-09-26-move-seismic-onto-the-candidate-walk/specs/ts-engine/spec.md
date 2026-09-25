## ADDED Requirements

### Requirement: What a placed value rules out may depend on the value

The candidate walk SHALL take what a placed value rules out as one function of the
cell and the value, a **reach** (`Reach` in `src/engine/candidate-hint.ts`): the
cells an `n` at a cell rules `n` out of. Every place the walk asks that question
SHALL read it: the placement cull, the obvious-candidate clean, a note-less cell's
candidates under the implicit reading, and a fold's account of a value an earlier
fold placed. Where this specification speaks of a placed value's no-repeat
regions at those places, it means the reach.

The default reach SHALL be every cell of the placed cell's no-repeat regions
(`regionReach` over `regionsOf`), so a game whose rule is its regions supplies
nothing. A game whose reach depends on the value (a Seismic `n` rules `n` out `n`
cells along its row and column) SHALL supply its own, and keeps `regionsOf` for
the regions a hidden single is classified in. A reach SHALL be symmetric: an `n`
at one cell rules out an `n` at another exactly when the reverse holds.

The walk's `RungContext.populated` SHALL mean that the setup is finished, the
obvious-candidate clean included, under either reading, so a rung reading the notes
never runs between the fill and the clean.

#### Scenario: A value rules itself out only as far as it reaches

- **WHEN** a board's reach lets a placed 2 rule out 2s within two cells of it
- **THEN** a note-less cell one or two cells away reads without the 2, one three
  cells away keeps it, and the obvious clean strikes a 2 note exactly where the
  reach does

#### Scenario: A game whose rule is its regions passes no reach

- **WHEN** a game on the walk supplies `regionsOf` and no reach
- **THEN** its placement cull, obvious clean and implied candidates are those of
  its regions, and its plans are unchanged
