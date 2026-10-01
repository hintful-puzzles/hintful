## MODIFIED Requirements

### Requirement: Bridges explains the next deduction

A hint SHALL be refused when the board is solved or `findMistakes` reports a
wrong span, by the midend before it asks the game, and `hint(state)` SHALL
otherwise return the forced deductions from the player's own marks as an
ordered plan, each step narrating **why** its moves are forced from premises the
sentence itself states.

The plan SHALL be produced by the *same three* `DeductionTechnique` objects
`solveFromScratch` runs, stepped one firing at a time through `singleFirings`,
with a recorder attached to the `Solver`: no rung is reimplemented for the hint,
and the generator's solve path SHALL remain unchanged by recording. The ladder
SHALL be capped at the board's own difficulty rather than the top rung, since
that is the tier the generator certified it soluble at.

One firing SHALL be one step: a stage SHALL stop at the first island that moved
when a recorder is attached, and a rung holding more than one teachable rule
SHALL return at the first of them that changed the board, so a stage that sweeps
sixty-seven islands cannot pile several independent deductions into one step. A
step's move MAY carry several bridges when one premise forces them all, and
`hintKeepTrack` SHALL then verdict `"onTrack"` and shrink the step in place —
judging a bridge count as progress when it moves toward what the step asks for,
because one drag adds one bridge rather than the whole count, and accepting the
span from either end, because the player drags from whichever island they like.
A step that limits a span SHALL be followed the same way, by the limit the
player's drag leaves: lowering toward the step's limit is progress, because the
cross is reached from no limit in more than one drag.

The working copy SHALL resume from the player's marks rather than clearing
them, and SHALL first mark every island whose bridges already meet its clue, so
a resumed position is the position the certified ladder was certified on.

Every change a rung makes SHALL be recorded, and the plan SHALL hide — apply to
its working board, but never show — a firing that declares no reason. Exactly
one rule declares none: stage 1's *this island now has all its bridges, mark it
complete*, which is bookkeeping the fork's own auto-mark aid already draws and
which the win condition does not read.

**No step SHALL lean on a fact the player cannot see.** Stage 3's limit is a
mark the player can write (Requirement: Bridges lets the player limit a span),
so the hint SHALL write it as a step of its own — "two bridges here would shut
these 2 islands into a finished group of their own, so at most one can run this
way" — and the board the deduction reasons from SHALL never hold a bridge, a
cross or a limit the player's board does not.

Where a rung can be forced by more than one cause, the firing SHALL carry which:
stage 3's limit is narrated as a finished group sealed off or as a named island
left short of its clue, read while the trial still stands, because rolling it
back destroys both answers.

#### Scenario: A hint explains an island with exactly enough room left

- **WHEN** an island's remaining count equals the bridges it can still take and a
  hint is requested
- **THEN** the step's narration states that count, its move draws exactly that
  many bridges, and the island it names is the one the hint recolors

#### Scenario: A bookkeeping mark is never a step

- **WHEN** a deduction satisfies an island and the solver marks it complete
- **THEN** no step in the plan asks the player to mark it, and the plan still
  reaches a solved board

#### Scenario: A hint runs from the player's own bridges

- **WHEN** the player has drawn correct bridges of their own and asks for a hint
- **THEN** the plan is deduced from those bridges and its first step is a
  deduction that follows from them

#### Scenario: A hint refuses rather than reasoning from a wrong board

- **WHEN** a bridge contradicts the unique solution and a hint is requested
- **THEN** the hint refuses with the collection's shared mistakes wording and
  produces no plan

#### Scenario: A hint says so honestly when the annotation is what is wrong

- **WHEN** an island is marked complete before it is, so `findMistakes` reports
  nothing and the deduction still contradicts itself
- **THEN** the hint refuses with the collection's unlocalized-contradiction
  wording, which asks the player to undo rather than promising a highlight

#### Scenario: Following the plan solves the board at every tier

- **WHEN** a hint is requested, its first step applied, and the hint requested
  again, repeatedly, on a board of any tier
- **THEN** deduction never runs out before the board is solved

#### Scenario: A hint writes the limit a later step counts

- **WHEN** a Tricky board's plan concludes that a span can take at most one
  bridge, and a later step counts the room that leaves
- **THEN** the limit is a step of its own that writes "≤1" on the span in the
  action color, and every later step's board matches the player's in bridges,
  crosses and limits
