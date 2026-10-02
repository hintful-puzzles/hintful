## ADDED Requirements

### Requirement: A hint step's words SHALL be built from their parts

A hint step's words SHALL be a `Sentence` (`src/engine/hint-words.ts`), which only the engine's
`sentence` (and its shorthand `so`) and `unshaped` make, so a game hands over a step's words as
parts rather than as one string: what to look at, an optional consequence that follows from it,
the move, an optional subgoal, and the relation of the move to the rest. The engine SHALL write
the words that join the parts, one fixed form per relation (owner, 2026-10-02):

- *forced*: "L, so M." and, with what follows, "L, so F: M.";
- *one of several*: "L. One of them: M.";
- *answers a danger*, in the game's words for how: "L. One way to save it: M.";
- *effect*, a move no rule forces, narrated by what it does: "L. M: E.";
- *sequence*: "L. First, M.", then "Next, L, M." and "Last, L, M.";
- *again*, a journey's later leg: "…and M, for B.";
- *serves*, a move toward a subgoal: "Working on A: M.".

A subgoal SHALL prefix any form as "Working on A:". A step whose words cannot take the parts
SHALL be declared an exception of one of the engine's kinds (`bare`, `setup`, `evident`), and the
hint-quality walk SHALL check each kind's property on the step: a bare step names only ring
marks, a setup step names no outline or stripes, an evident step names a ring. In a game whose
hint searches (it plans by sliding search or can refuse with `SEARCH_OUT_OF_REACH`), a forced
step SHALL say its rivals were judged lost, and the walk SHALL fail one that does not. A step's
words MAY leave the move to the board through the engine's `MOVE` mark, a ring on the step's own
move that the game's renderer draws as it draws any move.

#### Scenario: A forced deduction joins its parts with "so"

- **WHEN** a game hands over a look and a move with the forced relation
- **THEN** the step's words read "<look>, so <move>." with the first letter capitalized, and
  carry every mark both parts name

#### Scenario: A move that is one of several is not concluded with "so"

- **WHEN** a searching game offers a move other moves would serve as well
- **THEN** its relation is one of several, or answers a danger, and its words do not join the
  move with "so"
- **AND** a forced step in that game that does not say its rivals were judged lost fails the
  hint-quality walk

#### Scenario: An exception is declared and checked

- **WHEN** a step's words are declared `bare`
- **THEN** the hint-quality walk fails the step if its words name any outline or stripes

#### Scenario: A later leg rests on its first leg's necessity

- **WHEN** a journey's later leg is built with the `again` relation, or a step is declared
  `setup`
- **THEN** the necessity-voice rule reads its form and does not require a modal of its own

#### Scenario: Words cannot skip the parts

- **WHEN** a game writes a step whose words are a bare `phrase`
- **THEN** the program does not typecheck

#### Scenario: A move left to the board is still bound

- **WHEN** a step's move is named only by words on the `MOVE` mark ("go back for it")
- **THEN** the game's renderer rings the step's move, and the binding walk finds the mark drawn

## MODIFIED Requirements

### Requirement: Latin-family hints distinguish naked and hidden singles

A Latin-square-family game's hint SHALL narrate a forced single placement by the
deduction that actually forces it, re-derived from the working board, not from the
solver's recorded reason.

This applies to every game riding the shared `latin.ts` solver and to Solo. The generic
`elim` records naked and hidden singles under one `single` reason; the hint re-derives
which it is and narrates accordingly. The shared classifier (`src/engine/latin-hint.ts`)
distinguishes two kinds, considering only *empty* cells as competitors for a value:

1. a **naked single** — the cell's own candidates are exactly `{n}` — narrated "every
   other number/height has been ruled out in this cell, so it can only be N", with the
   cell alone as evidence;
2. a **hidden single** — no other empty cell of a region can still take `n`, the cell
   itself still showing several candidates — narrated by its region ("every other cell
   in this row/column rules out N, so this cell must be N"), with the **whole region**
   shaded as evidence.

A placement that is neither rests on a strike the plan never placed, and is governed
by "A classified placement rests only on strikes the board shows". A game SHALL
reclassify **only** a recorded `single` placement; a game's own clue/region-driven
forced placements (e.g. Towers' facing-clue and full-line placements) keep their own
reasons.

#### Scenario: A hidden single is narrated by its line

- **WHEN** a Latin-family hint forces a placement into a cell that still shows several
  candidates, because the placed digit fits nowhere else in its row (or column)
- **THEN** the narration names the line ("every other cell in this row/column rules out
  N, so this cell must be N"), not "every other number has been ruled out in this cell"
- **AND** the whole row (or column) is shaded as evidence, the cell marked as the
  placement target

#### Scenario: The naked-single phrasing is never used on a multi-candidate cell

- **WHEN** any Latin-family hint emits a placement step whose narration says "ruled
  out in this cell"
- **THEN** the cell's working notes are genuinely a single candidate (a true naked
  single) — a hidden single uses its own narration instead
