## MODIFIED Requirements

### Requirement: Generation: Seismic solves by candidate elimination, graded Easy or Normal

Seismic SHALL solve by the ladder its description states, by candidate elimination: a naked single and a hidden single within a region at Easy, plus a starved area at Normal, where every place an area has left for a number is near a square outside it, which then cannot hold the number. It SHALL report the difficulty reached or that the puzzle is not uniquely soluble, and SHALL strike a placed number from its region and as far as the mode's keep-apart rule reaches.

#### Scenario: The solver grades a puzzle's difficulty

- **WHEN** a uniquely soluble puzzle is solved
- **THEN** the solver reports the lowest difficulty at which its deductions
  complete the grid

### Requirement: Hint: The hint walks the shared candidate plan with the keep-apart reach

The plan SHALL be walked by the shared candidate walk (`runCandidatePlan`) over the solver's recording, from the numbers placed, with Seismic's keep-apart rule as the walk's `reach`: an `n` rules `n` out of the cells the description's `cull` strikes. Its placements SHALL lead its strikes, so a single on the board is never passed over for a starved area.

#### Scenario: A note-less cell reads as what the rule leaves it

- **WHEN** under the implicit reading the plan writes a note-less cell's notes, or
  places a number in one as the only number left
- **THEN** the notes written, or the one number, are exactly what `cull` leaves
  that cell after every number on the board is placed
