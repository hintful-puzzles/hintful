# rome-implicit-continuity — design

## D1. The premise goes on the step as `reads`, added by the walk

A `regionsFull` single's sentence ("its row, column and block already hold every
other number") names no cell, but it is true because of particular placed ones.
Three places could say so:

- **Each game's `placeWords`**, returning `reads` for the reason. Rejected: nine
  games' words would each compute the same thing, from facts only the walk has
  (which cells have notes, the reach), and a new game would forget.
- **A hatch**, since Rome's sentence names "its area". Rejected here: it is a
  mark the player sees, a Latin sentence names a row *and* a column (a step
  naming two lines hatches neither), and it would not reach the hidden single's
  premise, which lies outside the line.
- **The walk, as `reads`** (chosen). The walk decides that a single is
  `regionsFull` (the cell has no notes) and owns the reach, so it can list the
  placed cells ruling each other value out. `reads` is already premise that
  nothing draws, the frontier already reads it, and under the implicit reading a
  placed cell is never "bare", so no note leg follows from it.

The hidden single gets the same treatment for the note-less cells of its line:
the placed cells ruling the value out of each. A cell with notes needs nothing,
since its notes are its premise and it is in the hatch.

## D2. The instrument reads what the walk reads

`plan-continuity.ts` read `area ∪ hatch ∪ targets`. With `reads` added, a
single is a candidate only once nothing it rests on has been written since, which
is the availability the walk actually has. Without the hidden single's premise,
the instrument called Solo's "in this row, 1 can go only here" available two
placements before the 1 that made it so.

**Grading HEAD fairly needed the premise without the choice.** A measurement
with the frontier blind to the new `reads` but the steps carrying them is the
"premise visible" column of the proposal's table. That column is what shows the
four default plans were over the bound all along; comparing the new plan against
the old instrument's figure would have hidden it.

## D3. The guard walks every reading a game offers

A player may pick either reading, so either plan ships. The readings come from
the `Ui`, as `candidate-reading.test.ts` derives them: a game carrying
`candidateReading` is walked under both, any other under its own default.

Towers' implicit plan stays over the bound (12.9% at six seeds). It is excused
by a ledger entry naming `towers-implicit-strike-window`, and the walk asserts the
entry is **still over**, so fixing it fails the test until the entry goes. That
is the shape AGENTS.md asks for where intent cannot be derived: the population is
derived and the ledger says why a member is excused.

## D4. Rome defaults to the implicit reading

With the premise read, Rome's implicit plan is 0.70 the populate plan's length
and passes over a continuing firing on 5.7% of its jumps, against the populate
plan's 6.0%. The collection's rule then picks `implicit`, so Rome overrides the
convention in `newUi` and says why, as Solo and the others do.

## Verified

- The guard goes red on five games' implicit readings (Group, Mathrax, Seismic,
  Solo, Unequal, 10.2–23.1%) with the frontier blind to the new premise.
- Towers' residual is not either availability rule alone: lifting the strike
  window left it at 12.9%, lifting the pending-mark rule at 12.8%; both together
  7.0%, and with the implicit opening's note-free phase lifted too, 2.7%.
