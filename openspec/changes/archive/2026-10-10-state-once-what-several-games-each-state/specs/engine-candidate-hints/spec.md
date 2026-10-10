## ADDED Requirements

### Requirement: A candidate hint distinguishes naked and hidden singles

Every game on the candidate walk SHALL narrate a forced single placement by
the deduction that forces it, which the walk re-derives from the working board
and hands the game's `singleReason`, and not by the solver's recorded reason.
The classifier SHALL consider only empty cells as competitors for a value.
Only a recorded `single` placement SHALL be reclassified: a game's own
clue-driven or region-driven forced placements keep their own reasons.

#### Scenario: A clue-forced placement keeps its reason

- **WHEN** a Towers plan takes a recorded facing-clue placement
- **THEN** the step narrates the recorded reason and is not reclassified as a
  single

#### Scenario: The naked-single phrasing is never used on a multi-candidate cell

- **WHEN** a game on the walk narrates a placement as a naked single, in the
  shared narrator's "ruled out in this cell" or in words of its own
- **THEN** the cell's working notes are a single candidate, a true naked single,
  and a hidden single uses its own narration

### Requirement: A candidate plan's step is never undone by a later one

Every step the candidate walk builds SHALL be progress the rest of the plan
keeps: notes written into a cell that had none, a note struck, or a cell
filled. No later step SHALL write back a note a step struck, and none SHALL
empty a cell a step filled.

#### Scenario: The fill-all leaves a narrowed cell alone

- **WHEN** a populate-reading plan strikes a note in a cell the player has
  noted, and then pencils in the cells that have no notes
- **THEN** the fill-all step leaves that cell as the strike left it

### Requirement: A recording solve reads the placed entries and never the notes

A game on the candidate walk whose plan records (`CandidatePlan.record`) SHALL
run its recording solver on the working board's placed entries and the
puzzle's clues alone, and never on the pencil notes, since a note can be
wrong. The notes the board shows SHALL decide which recorded firings are still
to make and when each is offered, and never what is recorded.

#### Scenario: Narrowed notes do not change the recording

- **WHEN** a hint is asked for on two boards with the same placed entries, one
  with no notes and one whose notes the player has narrowed
- **THEN** the solver records the same firings for both, and the notes decide
  which of them each plan still has to make

### Requirement: A candidate step is completed by the move that makes it whole

`keepCandidateHintTrack` SHALL answer `completed` to the move that makes the
displayed step whole: the fill-all on a populate step, a placement of the
hinted value in the hinted cell, a strike of exactly a strike step's marks, or
a note-writing of exactly a note step's. A pencil toggle that clears one mark
of a strike step, or writes one of a note step, SHALL be `onTrack`, the step
shrinking in place to the marks left, and `completed` on the last. Every other
move SHALL be `off`.

#### Scenario: A strike followed one note at a time stays on track

- **WHEN** the player clears one of a strike step's marks with a pencil toggle
- **THEN** the step shrinks to the marks left and stays on track, and clearing
  the last one completes it

#### Scenario: The mark-all control makes the obvious clean

- **WHEN** the displayed step is the obvious-candidate clean and the player
  presses the mark-all control, whose strike is the same marks
- **THEN** the verdict is `completed`, and a strike of only some of a step's
  marks in one move is `off`

## REMOVED Requirements

### Requirement: Latin-family hints distinguish naked and hidden singles

**Reason**: Restated as "A candidate hint distinguishes naked and hidden singles". Rule 5. The population sentence ("every game on the shared Latin solver and to
Solo") was short: the classification is the walk's, done for every game on it.
`availablePlacements` in `latin-hint.ts` reclassifies each recorded `single`
through the game's `regionsOf`, the walk's own singles rung classifies the
rest, and both hand the result to the plan's `singleReason`, which all ten
games on the walk supply (the row/column preset supplies it for those on the
preset). Seismic and Rome are on neither the Latin solver nor Solo's and take
it the same way; `narrateLatinReason`'s naked-single sentence is spoken by
ABCD, Group, Keen, Mathrax, Salad, Seismic and Unequal, and Solo, Towers and
Rome word their own. So the sentence goes, the subject becomes every game on
the walk, "a game SHALL reclassify" becomes the walk's doing, and the title
loses "Latin-family"; no source or guide cites the title. The second
scenario's "any Latin-family hint" is widened the same way.
