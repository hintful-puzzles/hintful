## ADDED Requirements

### Requirement: Bridges lets the player limit a span

A player SHALL be able to write on any span between two in-line islands the
most bridges it may carry, as a mark the board keeps: **the limit**. No limit is
the board's own `maxb`; a limit of none is the no-line cross, so the cross is
the bottom of the same scale rather than a separate mark. A limit SHALL be
stored in the state's per-span maximum, which a bridge drag already wraps at, so
a span limited to one takes a single bridge and the next drag clears it.

The secondary drag (the right button, a touch hold promoted to it, or the
keyboard's Shift+arrow) SHALL lower the span's limit by one: no limit, then each
limit down to one, then the cross, then no limit again. Every stop is weaker
than the one after it, so a player heading for "at most one" or for the cross
never passes through a mark that claims more than they mean. A limit SHALL never
drop below the bridges already drawn on the span: over a bundle the cycle stops
at the bridges drawn and wraps to no limit without reaching the cross, and a
full bundle with no limit on it has nothing to lower. `executeMove` SHALL reject
a limit below the bridges drawn, above `maxb`, or of none.

A limit SHALL be drawn as `≤n` on a patch of background at the middle square of
its span, in the span's own color, so it reads over a bridge already drawn
through that square and turns red with the span when `findMistakes` flags it.
The limit SHALL be part of the tile cache's diff key.

A from-scratch solve SHALL ignore the player's limits, as it ignores their
bridges, and Solve SHALL lift every limit the player wrote.

#### Scenario: A right-drag lowers a span's limit

- **WHEN** the player right-drags between two in-line islands with no bridge
  between them three times on a `maxb = 2` board
- **THEN** the span is limited to one bridge, then crossed with the limit
  lifted, then free again

#### Scenario: A limit never falls below the bridges drawn

- **WHEN** a span carries one bridge on a `maxb = 2` board and the player
  right-drags along it twice
- **THEN** the span is limited to one bridge, then free again, and is never
  crossed

#### Scenario: A wrong limit is a mistake

- **WHEN** the player limits a span below the bridges the unique solution puts
  there
- **THEN** `findMistakes` reports that span

## MODIFIED Requirements

### Requirement: Bridges input drags bridges between islands

Left-drag from an island along its row or column to the next in-line island SHALL
add or increment a bridge between them, wrapping back to zero once the span's
limit is exceeded; the in-progress drag destination SHALL be tracked
(`update_drag_dst`) and committed on release (`finish_drag`). Right-drag along a
span between two islands SHALL lower that span's limit by one, down to the
no-line cross and back to no limit (Requirement: Bridges lets the player limit a
span). Cursor keys SHALL move a keyboard cursor, and `CURSOR_SELECT` SHALL grab
and drop a keyboard drag. A drag that does not run cleanly between two in-line
islands SHALL be canceled with no change. No editor-only move letters are mapped.

#### Scenario: Dragging cycles the bridge count

- **WHEN** the player left-drags from an island to an in-line neighbor three
  times on a `maxb = 2` board
- **THEN** the bridge count between them goes 1, then 2, then 0

#### Scenario: An off-line drag is canceled

- **WHEN** the player starts a drag on an island and releases where no in-line
  island lies
- **THEN** the board is unchanged

### Requirement: Bridges flags mistakes and live errors

The game SHALL draw provably-wrong state red as upstream does (an island that can
no longer reach its count via `island_impossible`, and — when `allowloops` is
false — bridges completing a forbidden loop via `map_hasloops`/`findloop`).
Because a generated board is uniquely solvable, the game SHALL additionally
implement `findMistakes`: re-solve from the island clues to the unique solution
and return every span whose player marks the unique solution contradicts — a
bridge where the solution has none, a count exceeding the solution's, or a limit
below the solution's count, the cross included. A board that is not uniquely
solvable SHALL yield no mistakes. The live-error and `findMistakes` overlays
SHALL be distinct and both SHALL be part of the render diff key so they repaint
and clear on a later frame.

#### Scenario: A wrong bridge is flagged

- **WHEN** the player places a bridge the unique solution does not contain,
  without yet over-committing an island
- **THEN** `findMistakes` includes that bridge and Check & Save refuses to save

#### Scenario: A mistake overlay repaints on a later frame

- **WHEN** a bridge is drawn, then `findMistakes` flags it on a subsequent frame
  without that bridge's own value changing
- **THEN** the mistake overlay is painted on that later frame

### Requirement: Bridges explains the next deduction

`hint(state)` SHALL refuse through `commonHintRefusal` when the board is solved
or `findMistakes` reports a wrong span, and otherwise return the forced
deductions from the player's own marks as an ordered plan, each step narrating
**why** its moves are forced from premises the sentence itself states.

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
