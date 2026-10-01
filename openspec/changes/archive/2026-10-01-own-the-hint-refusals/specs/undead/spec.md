## MODIFIED Requirements

### Requirement: Undead explained deduction hint

The hint SHALL be **purely deductive**: it SHALL NOT reveal the known solution and
SHALL NOT narrate a guess or backtracking search. **The forcing rung is such a
search** — it assumes a candidate and runs the arc-consistency + counting fixpoint
from it — so the hint's recorder SHALL NOT emit it **on any tier**, while the
solver retains it so that grading and generation are unchanged.

The consequence SHALL be stated rather than hidden: on an `Unreasonable` board the
plan stops where deduction stops, and the hint refuses with a message saying so.
A hint that still solved every `Unreasonable` board would mean the rung had come
back; the game's tests SHALL assert **both** bounds — that such a plan never
reaches a solved board, and that it is not empty from the first move — so neither
failure mode passes quietly. The two lower tiers are unaffected: a freshly
computed plan still solves them from empty, and following hints one move at a
time still reaches a solved board.

A hint SHALL be refused when the board is already solved or when `findMistakes`
reports any contradiction, by the midend before it asks the game (lighting the
mistake overlay for the contradiction). The narration SHALL teach the sighting rule —
vampires counted before the beam first reflects, ghosts only after it has bounced,
zombies anywhere along it — and SHALL read correctly at the degenerate clue values
(a count of zero up to the line's full monster count). Conclusions SHALL use the
necessity voice (a strike "must cross out …", a placement "can only be …").

The game's move set SHALL include a `pencilStrike` move that atomically clears a list
of candidate bits across cells (idempotent and resume-safe), used by the hint for a
multi-strike firing; the single-bit `pencil` toggle and the fill-all `markAll` move
are unchanged. The hint SHALL NOT add an auto-pencil preference and SHALL ignore the
optional `ui` argument, because Undead has no trivial (non-teachable) elimination to
fold away.

The hint SHALL render with `COL_HINT` (placement target / acted-on marking) and
`COL_HINT_CELL` (sightline evidence shade) appended to the palette, following the
element-type color legend: the placement target is a solid `COL_HINT` fill with no
pre-rendered monster glyph; a struck candidate is drawn in its normal pencil color
with a strikethrough on a non-`COL_HINT` background so it stays legible; the sightline
evidence is shaded `COL_HINT_CELL`. The hint signature SHALL be folded into the
per-cell draw-state cache so the overlay repaints and clears correctly.

`findMistakes` and the quick-save / Check-&-Save coupling are unchanged: an empty
cell whose non-empty notes exclude the solution monster is already a `note` mistake,
so a hint refused for mistakes highlights those cells for free.

#### Scenario: The forcing rung never reaches a narration

- **WHEN** hint plans are recorded across every tier and many seeds
- **THEN** no recorded deduction is a forcing one, on any tier

#### Scenario: An Unreasonable board's hint stops rather than searching

- **WHEN** a player follows hints one move at a time on an `Unreasonable` board
- **THEN** the hints continue while deduction does, and then refuse with a
  message saying deduction has run out
- **AND** the plan neither reaches a solved board nor is empty from the start

#### Scenario: A sightline elimination is taught as one journey

- **WHEN** a player asks for a hint on a mistake-free Undead board where a path's
  count clues rule a monster value out of one or more of the path's cells, and no
  naked single or total exhaustion is available
- **THEN** the hint returns a journey whose legs strike that monster from those cells
  (one leg per cell, continuation legs flagged `continuesPrevious`), every struck mark
  lying on the narrated path
- **AND** the explanation names the sightline and its clue and explains the
  mirror-sighting rule that forces the elimination
- **AND** the whole sightline is shaded as the evidence area while each leg targets a
  single cell

#### Scenario: Total exhaustion is narrated honestly, not as a sightline

- **WHEN** every monster of one type permitted by the totals is already placed and an
  undecided cell still lists that monster as a candidate
- **THEN** the hint emits a `total` strike of that monster from every still-undecided
  cell as one journey, explaining that the type's full count is already placed
- **AND** the narration does not claim a sightline forced the elimination

#### Scenario: Naked single is surfaced first as a placement

- **WHEN** an undecided cell's surviving candidates have collapsed to a single monster
- **THEN** the hint places that monster (a `set` move) before any elimination step,
  explaining that only that monster keeps the cell consistent

#### Scenario: The plan reaches a solved board from any mistake-free position

- **WHEN** a hint is asked repeatedly from a mistake-free board on any shipped
  non-`Unreasonable` tier — each time applying only the first step and recomputing
- **THEN** every hint makes progress (never a no-op and never "give up") and the
  sequence reaches the solved board using only deductive steps (no solution reveal,
  no guess)

#### Scenario: The hint refuses on a solved or contradictory board

- **WHEN** a hint is requested on an already-solved board, or on a board where
  `findMistakes` reports a contradiction
- **THEN** the midend refuses the hint before asking the game, and (for the
  mistake case) the mistake overlay highlights the offending cells
