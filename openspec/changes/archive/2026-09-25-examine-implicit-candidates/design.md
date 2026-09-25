# examine-implicit-candidates — design

Owner direction at the start of implementation (2026-09-25): *"I really like the
idea of allowing players to control it. In particular for games like Solo
(sudoku), having all notes can be distracting, and the majority of deductions can
be arrived at with just a few notes here and there (or with single steps without
notes at all). And I really think it'll be better managed as engine
functionality."* That settles proposal §3's shape (a player preference, owned by
the engine). What the measurement still had to decide was each game's default.

## D1. The reading is orthogonal in the code: one view, one option

Every place the walk treated an empty note set as "no candidates" (task 1.1):

| Site | Under the implicit reading |
|---|---|
| `nakedSingles` | reads `impliedNotes`, so a note-less cell whose regions leave one value is a single |
| `availableStrikes`' liveness | reads `impliedNotes`, so a strike of a value the regions already rule out is dead, as the obvious clean made it before |
| `availablePlacements`' classifier | reads `impliedNotes`, and a naked single in a note-less cell is `regionsFull` |
| `lazyPopulate` | not used |
| `obviousCandidateMarks` | unchanged: it skips note-less cells, so it cleans only notes the player wrote |
| `regionDuplicateMarks` (the dup cull) | unchanged: it strikes only written notes, and a note-less cell is culled by the reading itself |
| `refreshCandidateHintStep`'s populate arm | unreached: no populate step is emitted |

So the reading is one option on `runCandidatePlan` (`reading`) and one board view
(`impliedNotes`: a cell's notes where written, otherwise its fill-all less every
value its regions hold). Populate, the clean and the dup culls follow from it
rather than being separate decisions: under the implicit reading the setup is the
clean alone (for stale notes the player wrote), and the culls touch written notes
only.

**The populate reading is unchanged.** Once its setup is done the view *is* the
written notes, so a game with a settled empty square that keeps no note (Salad)
reads exactly as before. Every candidate game's suite and snapshots passed
without a change under the populate reading; the only tests that moved asked a
game whose default became implicit for a populate step, and now say which
reading they mean.

## D2. Group's `visibleCandidates` was the implicit reading in miniature

It filled a note-less cell with what its lines leave, and also cleaned stale
written notes, for classifying a single before Group populates (task 1.2). The
walk now hands its own view to a game's rungs as `RungContext.shown`, and Group's
copy is gone. The stale-note half was not carried over: a note the board still
shows is one a sentence may not treat as gone. That exposed a latent throw: Group
led with the solver's next single and classified it with the *throwing*
classifier, which a stale note defeats. A single now never leads; whether the
board shows it is `availablePlacements`' question, which answers "not yet"
instead of throwing.

## D3. The premise duty is the walk's, not each game's

Map's playtests found that one region read off its neighbors is fine and several
are too much (`dot-map-pairs-first`, `dot-map-chains-first`). Under the implicit
reading a firing first writes, one continuing leg each, the notes of every blank
note-less cell it strikes, outlines as evidence, or `reads`, and never of one it
places in. The engine words the leg from the game's vocabulary ("Only 3 and 7
aren't already placed in this cell's row, column or block, so pencil them in.";
"Nothing in this cell's row or column rules out a number yet, so pencil in every
one." where the regions rule nothing out).

- **`reads`** is new on a step's words, for a region the sentence names (and so
  hatches) whose cells' candidates the step rests on: Keen's `cage`/`cageLine`,
  Solo's `cageMinMax`/`cageSums`, Towers' `arrangement`. It joins the premise
  under both readings, so the frontier and `availableStrikes`' pending check see
  it too. No populate-reading plan changed because of it in any suite.
- **A hatched line is not read by default.** A hidden single says no other cell of
  its line can take the value, and each of those shows that by its own regions:
  cross-hatching, which is how most sudoku players find singles with no notes.
- **The generic Latin `set` recorded no cells**, so under the implicit reading its
  premise could not be found, and under either reading its sentence ("Other cells
  already account for …") pointed at nothing. `latin.ts` now records the subset
  (both the zero-rectangle `set` and `setGeneral`), every row/column game outlines
  it through the new `genericLatinArea`, and the sentence says "The outlined cells".
  `genericLatinArea` also replaces six hand-written `forcing` → `forcingChainArea`
  arms. Sets fire 2–9 times a board at the harder tiers of Unequal, Mathrax, Keen
  and Group.

**Declined for now: folding the note into the deduction's conclusion.** Map's
narrowing ends a deduction in whichever move the board calls for ("…: dot red and
teal"), so it never needs a separate note leg for a target. Doing that here means
every game's strike sentence growing a second conclusion form. The separate leg
costs a step per noted cell, which is visible in the numbers below. It is the
first thing to revisit if a playtest finds the legs slow.

## D4. The single a note-less cell gives

`SingleReason` gains `regionsFull`: "This cell's row and column already hold every
other number, so it can only be 4." A cell with no notes has none to have
collapsed, so "every other number has been ruled out in this cell" would describe
notes that are not there. The walk's `SingleWhy` carries it. Each row/column
game's reason union now takes `SingleReason` whole rather than restating its
`hiddenSingle` arm, so the next arm needs no per-game edit.

## D5. Defaults: measured, per game, convention plus override

Every preset at six seeds, a plan from a fresh board under each reading (task
2.1–2.3). "Notes" is the share of blank cells the implicit plan writes notes into,
which is the load proposal §2 asked about:

| Game | Steps, implicit ÷ populate | Notes | Default |
|---|---|---|---|
| Solo | 0.72 | 12% | implicit |
| Mathrax | 0.91 | 51% | implicit |
| Group | 1.02 | 12% | implicit |
| Towers | 1.11 | 58% | populate |
| Unequal | 1.14 | 71% | populate |
| Rome | 1.18 | 80% | populate |
| Keen | 1.22 | 82% | populate |

Per preset, Solo Easy, Normal, Normal X and the Jigsaw Normals write **no note at
all** (52 steps against 87, where populate writes ~450 notes and clears ~300).
Solo's Killer is the exception inside Solo (55% of cells, 1.07×), and Group's
identity-hidden Tricky inside Group (54%, 1.24×). Where the clues or cages drive
the deductions, nearly every cell needs notes, and writing them one cell at a time
costs more than one populate.

So the convention (`DEFAULT_CANDIDATE_READING`) is `populate`, and a game whose
plan is no longer under the implicit reading overrides it in `newUi` with its
reason. That is three of seven today. The rule a new game applies is the
measurement, not the tally. A game's `hint` passes `ui ?? newUi(state)`, so a
caller with no `Ui` (every cross-game guard) walks the game's own default.

## D6. Map (task 2.4), and the games not on the walk

Map keeps the implicit reading and offers no choice. It has no Mark-all move for a
populate to follow, and a populate would write four dots into every region to
strike three, when its Easy tier needs none. Map's plan measures what the implicit
reading was chosen for: dots only where a deduction removes a color no neighbor
shows. What keeps Map off the walk is geometry (a graph, not a grid), not the
reading.

Salad's setup is its own (its "might be empty" note is a candidate no row or
column rules out), so it walks the populate reading; the walk refuses the
implicit reading with a game's own setup. Undead and Seismic plan without the walk
and populate first. Both are clue-driven, the shape that measured populate-better
above, so neither was converted. Crossing already writes notes only where a
narrowing needs them.

## D7. What a player's data sees

- **A new move, `pencilAdd`**, in the seven games' move unions, written only by a
  hint. It is added, not changed, so every existing save replays as before.
- **A new preference, `hint-notes`**, a choice of two. A player who never opens
  the preference gets the game's default.
- **Changed hint sentences**: a set's sentence names the outlined cells, and the
  implicit reading adds the note and `regionsFull` sentences. Hints are recomputed,
  never saved, so nothing stored holds the old wording.

## D8. Guards

- `candidate-reading.test.ts` derives its population from the `Ui` field. For each
  member, on every mode and tier at its smallest board, it checks both readings: a
  fresh plan's steps are live when shown (refresh is the identity), the plan
  finishes, and each reading's setup move never appears in the other's plan. It
  also walks a hint recomputed after every move under the non-default reading,
  which is the one every other hint guard misses. Seen failing: a walk with no
  note legs fails 43 of its 97 cases.
- `candidate-plan.test.ts` holds the note legs (struck, outlined, `reads`, never
  a placed cell, never a filled outline), `regionsFull`, the unchanged populate
  reading, and the refusal of an own setup. It too was seen failing with the note
  legs removed.
- `candidate-hint.test.ts` holds `impliedNotes` and following and refreshing a note
  step. `solo-hint.test.ts` holds that an Easy or Normal sudoku needs no note.
