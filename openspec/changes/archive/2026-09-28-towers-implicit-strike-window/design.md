# towers-implicit-strike-window — design

## D1. An unmade placement is a pending mark, not a wall

The recording runs on the solver's candidate cube. The cube differs from the
player's board by exactly the marks the solver made and the board has not: a
strike still live in the notes, and a placement whose cell is still empty. A
placement's effect on the cube is its own cell decided and its value struck
along its reach, and the Latin solver records that cull as `dup` strikes in the
placement's group.

So a strike recorded after an unmade placement is true on the player's board
when its premise reads neither the placement's cell nor a cell still holding one
of its live culls — which is the pending-mark rule `availableStrikes` already
applied between strikes, with the placement's cell added to the set. The first
firing stops being exempt once a placement has been passed, since nothing before
it vouches for the cube any more.

**What this rests on**, as the pending-mark rule already did: a strike's premise
(`area ∪ hatch ∪ reads ∪ targets`) names every cell whose candidates *or placed
value* the deduction reads. Checked by reading, per game, what each strike's
solver reads against what its step outlines:

- Towers' `lineFull`, `lowerBound` and `arrangement` read the heights along the
  clue's line; the step hatches that line.
- The Latin `set` elimination's reduced matrix drops decided cells and their
  values; a premise cell still noting such a value is pending through the cull.
- Group's `identityElim` outlines the witness cell that reveals the identity.
- Unequal's sign strikes outline both cells of the sign.
- Solo's intersection hatches the confined region.

No guard checks a strike's premise against the board generically; the unit
tests in `candidate-hint.test.ts` hold the rule itself, each seen red against a
mutation (placement cell not pending; first firing still exempt past it).

## D2. The implicit reading opens only on a stale note

Under the implicit reading the setup is the obvious clean. The walk ran the
note-free opening (singles and the game's own rungs, no strikes, no recorded
placements) until those ran out, then the clean, even on a board where the
clean had nothing to do. Towers' clue lines alone can run a long way that way.

Skipping the opening outright was tried first and broke Unequal's and Solo's
"surfaces a naked single ahead of any elimination": on a board with stale notes
the plan cleaned them all before placing the single a person would place first.
So the setup counts as done while `obviousCandidateMarks` finds nothing: no stale
note, no opening. `done` latches, so the opening cannot come back mid-plan.

## D3. Measurements

Every leaf preset, `planContinuity`, the guard's instrument. Two seeds (the
guard's own), implicit / populate:

| game | before | window as pending | + opening |
|---|---|---|---|
| towers | 15.9 / 8.5 | 10.9 / 0.0 | 6.5 / 0.0 |
| unequal | 7.2 / 4.8 | 4.0 / 0.2 | 4.0 / 0.2 |
| keen | 4.2 / 3.6 | 2.9 / 1.0 | 2.9 / 1.0 |
| mathrax | 3.7 / 5.1 | 3.7 / 0.0 | 3.7 / 0.0 |
| group | 2.2 / 6.7 | 2.2 / 6.7 | 0.6 / 6.7 |
| abcd | 6.0 / 5.3 | 6.0 / 5.3 | 6.0 / 5.3 |
| rome | 4.7 / 5.8 | 2.0 / 0.3 | 0.6 / 0.3 |
| seismic | 8.1 / 4.0 | 8.1 / 4.0 | 8.2 / 4.0 |
| solo | 5.7 / 4.7 | 3.3 / 2.9 | 3.1 / 2.9 |

Seismic's 8.1 → 8.2 at two seeds is one jump fewer in the denominator; at six
seeds it moved 7.3 → 7.0. The six-seed final figures are in the proposal.

## D4. Render snapshots

Three tier-2.5 scenarios walk a plan to the first step matching a pattern (Towers'
"sees exactly", Solo's region strike, Rome's loop chain). The plans now reach a
different instance of the same deduction, so their snapshots were re-baselined;
each scenario's targeted assertions passed unchanged before the re-baseline.
