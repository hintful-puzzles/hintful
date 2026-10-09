## REMOVED Requirements

### Requirement: Recording leaves the solve path unchanged

**Reason**: collection: `engine-hints` "The solver and the hint are two
projections of one deduction engine" (the generator runs the techniques with
the recorder off, the hint with it on) and `engine-candidate-hints` "A shared
candidate-elimination hint plan" (the solvers and the generate and solve paths
do not change because of the walk) cover Solo with no departure.
`pendingRecorder` is set only in `recordSoloDeductions`; `solveSolo`, the
generator and `findMistakes` attach none. Group's and Keen's copies of this
rule were cut on the same ground, and Unequal's and Towers' are gone too, so
the candidate games now agree.
