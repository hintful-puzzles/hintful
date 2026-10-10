# Rules: candidate-walk

## add `engine-candidate-hints`

Rule 1, the half about what the solver is seeded from. Six games state it in
the same words (Group, Solo, Keen, Towers, Unequal, Mathrax). The population
is the games on the walk whose `CandidatePlan.record` runs a solver: Group,
Keen, Mathrax, Rome, Salad, Solo, Towers and Unequal. Read: each game's
`record` closure in its `buildSteps` and the `record…Deductions` function it
calls (`group/index.ts`, `keen/index.ts`, `mathrax/index.ts`, `rome/hint.ts`
`boardOf`, `salad/hint.ts` `board()` with `seedMarkers` in `salad/solver.ts`,
`solo/index.ts` with `recordSoloDeductions`, `towers/index.ts`,
`unequal/index.ts`): each is handed the working grid and the clues, and none
takes the pencil array (Rome's board gets a fresh empty one). It is false of
ABCD and Seismic, whose `record` returns nothing and whose rungs read
`RungContext.shown`. Salad's board also carries the player's cross and ball
markers (`seedMarkers`), which are entries Check & Save judges, not notes.
The walk itself reads the notes for which firings are live
(`availableFirings`), for classifying a single (`availablePlacements`) and
for its own naked singles (`nakedSingles`), which it places from the notes
with no recording behind them. So the rule is stated of the recording and of
nothing wider: the second sentence says what the notes do to the recorded
firings and does not say that is all the notes do.

after: The game keeps what carries its meaning

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

## not-shared a plan may deduce from the notes because the mistake check vouches for them

One game states it: Seismic, "The hint deduces from the player's notes". ABCD
("ABCD offers an explained hint") says only that it reasons from the pencil
marks, and gives no reason. A requirement that every game on the walk SHALL
flag, in `findMistakes`, a note that excludes its cell's answer would be a
rule no spec states and no guard holds: each of the ten does it by its own
code (nine call `entryMistakes` with `notes: state.pencil`, Salad calls
`entryMistake` on the same board shape in `salad/solver.ts`), and nothing
derives that a game on the walk must. `ts-engine` "A candidate note that
excludes the answer is a mistake" says what such a report is where a game
makes one. Seismic keeps its requirement; see the note below.

## note Every game on the walk leans on its mistake check, and nothing holds it to one

The walk's own naked-single rung places a value from the player's notes alone
(`CandidateWalk.singles` calls `nakedSingles(plan.grid, notes, …)`), in all ten
games, recording or not, and ABCD's, Seismic's and Salad's own rungs read the
notes too. That is sound only because each game's `findMistakes` flags a note
that excludes its answer and the midend refuses a hint on a flagged board
(`engine-hints` "The midend SHALL refuse a hint on a finished or wrong board
before asking the game"). All ten do flag today, each by its own call, and no
cross-game test derives the walk's games and asks it of them: a game joining
the walk whose mistake check ignores notes would place wrong naked singles
with every suite green. A guard over the walk's population would make the
dependency a rule that could then be stated in `engine-candidate-hints`.

## cut `group`: Group's hint deduces from the placed entries, never the notes

`engine-candidate-hints`, "A recording solve reads the placed entries and
never the notes", holds the rule: Group's `record` calls
`recordGroupDeductions(wGrid, w, maxdiff)`, which takes no notes. The
requirement and its scenario say nothing else.

## edit `solo`: Solo provides an explained deduction hint

`engine-candidate-hints`, "A recording solve reads the placed entries and
never the notes", holds the clause removed; `recordSoloDeductions` builds its
`SolverUsage` from the grid, blocks and cages and reads no notes.

from: , working in a sound candidate cube **seeded from the placed entries (givens and player digits) only, never from the player's pencil notes**, since a note can be wrong
to:

## edit `keen`: Keen provides an explained deduction hint

`engine-candidate-hints`, "A recording solve reads the placed entries and
never the notes", holds the clause removed. The cap below recursion stays: it
is Keen's number.

from: recorded on a sound candidate cube seeded from the placed entries only, never from the player's pencil notes, since a note can be wrong, and SHALL be capped
to: capped

## drop-scenario `keen`: Keen provides an explained deduction hint

It restates `engine-candidate-hints`, "A recording solve reads the placed
entries and never the notes"; the requirement keeps "A hint on an Unreasonable
board".

scenario: A wrong-looking note does not steer the deduction

## reword `towers`: Towers provides an explained, pencil-notes-based deduction hint

`engine-candidate-hints`, "A recording solve reads the placed entries and
never the notes", holds the clause and the scenario line removed
(`recordTowersDeductions(w, state.clues, wGrid, maxdiff)` takes no notes). A
reword and not an edit because the scenario's first result is one of the two
things removed and an edit cannot take out a bullet. What stays is Towers'
own: the hint is the solver's script, expressed against the live notes.

### Requirement: Towers provides an explained, pencil-notes-based deduction hint

The hint SHALL teach Towers' candidate-elimination reasoning by setting and
striking pencil notes. It SHALL be the solver's own narrated deduction script:
the recording solver's ordered operations are expressed against the player's
live notes and grid as a sequence of `HintStep`s.

#### Scenario: The player has edited the notes

- **WHEN** a hint is requested on a mistake-free board whose notes the player
  has edited
- **THEN** each step is expressed against the notes as they stand

## edit `unequal`: Unequal provides an explained deduction hint

`engine-candidate-hints`, "A recording solve reads the placed entries and
never the notes", holds the sentence removed; `recordUnequalDeductions` is
given the order, the mode, the clue flags and the working grid.

from: It SHALL work in a sound candidate cube seeded from the placed givens and entries only, never from the player's pencil notes: a note can be wrong, and that is what `findMistakes` flags.
to:

## reword `mathrax`: The recording solve reads placed digits and stops below the guess-and-verify tier

`engine-candidate-hints`, "A recording solve reads the placed entries and
never the notes", holds the first half (`recordMathraxDeductions(o,
state.clues, wGrid, maxdiff)`), so the title loses it. The cap is Mathrax's
own and stays with its scenario. No source or guide cites the title.

### Requirement: The recording solve stops below the guess-and-verify tier

The recording solve SHALL be capped below the guess-and-verify tier, because a
guess is not a teachable note strike.

#### Scenario: A board at the top tier is hinted by deduction alone

- **WHEN** a hint is requested on a board generated at `Unreasonable`
- **THEN** the recording solve runs no higher than Tricky

## keep `seismic`: The hint deduces from the player's notes

It is the other side of "A recording solve reads the placed entries and never
the notes", which is stated only of a plan that records: Seismic's plan
records nothing and deduces from the notes and from what a note-less cell's
area and the numbers within reach leave it, and the requirement gives the
reason that is sound, which no shared requirement states.

## keep `abcd`: ABCD offers an explained hint

"Reasoning from the player's pencil marks and placed letters" says ABCD's plan
is on that same side, in a sentence that also gives its reach and its two
rungs.

## add `engine-candidate-hints`

Rule 2. Solo, Keen, Towers and Unequal each say a step is "never undone by the
hint". It is a property of the walk, true of all ten games on it, because the
walk builds every step: a placement writes the working grid, a strike clears
bits, the fill-all and a note leg write only a cell that has no notes
(`lazyPopulate` fills where `wPen[i] === 0`; the note legs in
`candidate-plan.ts` write a blank, note-less cell), and nothing clears a cell.
It is not a rule of every hint: a sliding game's plan moves a tile it has
already moved. The other half of the games' requirement, that a recomputed
hint makes progress and skips what the board shows, `engine-hints` already
states for every game ("The hint walk SHALL cover every preset a game offers",
"A displayed hint step never references already-resolved state"), and this
capability states of the recorded firings ("A placement's bookkeeping is not a
firing to teach": the still-live ones).

after: A firing is emitted whole

### Requirement: A candidate plan's step is never undone by a later one

Every step the candidate walk builds SHALL be progress the rest of the plan
keeps: notes written into a cell that had none, a note struck, or a cell
filled. No later step SHALL write back a note a step struck, and none SHALL
empty a cell a step filled.

#### Scenario: The fill-all leaves a narrowed cell alone

- **WHEN** a populate-reading plan strikes a note in a cell the player has
  noted, and then pencils in the cells that have no notes
- **THEN** the fill-all step leaves that cell as the strike left it

## cut `solo`: Every hint step is monotone progress

`engine-candidate-hints`, "A candidate plan's step is never undone by a later
one", holds the first sentence. `engine-hints`, "Only a searching hint is
excused the walk's promise" (a hint never gives up on a solvable board) and
"The hint walk SHALL cover every preset a game offers" (from any reached
position, on every preset, so Solo's standard, X, jigsaw and killer boards),
hold the second; and `engine-hints`, "A displayed hint step never references
already-resolved state", holds the skip of what the board already shows.

## cut `keen`: Every Keen hint step is monotone progress

`engine-candidate-hints`, "A candidate plan's step is never undone by a later
one", holds the first sentence; `engine-hints`, "Only a searching hint is
excused the walk's promise" and "The hint walk SHALL cover every preset a game
offers", hold the recompute, and "A displayed hint step never references
already-resolved state" the skip. Nothing in it is Keen's own.

## cut `towers`: Every Towers hint step is progress the hint never undoes

`engine-candidate-hints`, "A candidate plan's step is never undone by a later
one", holds the first sentence; `engine-hints`, "Only a searching hint is
excused the walk's promise" and "The hint walk SHALL cover every preset a game
offers", hold the recompute, "A displayed hint step never references
already-resolved state" the skip, and "Deduction runs out only where the tier
permits search" its "a board whose tier needs no search".

## cut `unequal`: Every hint step is monotone progress

`engine-candidate-hints`, "A candidate plan's step is never undone by a later
one", holds the first sentence; `engine-hints`, "Only a searching hint is
excused the walk's promise" and "The hint walk SHALL cover every preset a game
offers", which walks both modes' presets, hold the recompute, and "A displayed
hint step never references already-resolved state" the skip.

## cut `salad`: Salad's hint plan is recomputable from any position

`engine-hints` holds both halves for every hinting game: "A displayed hint
step never references already-resolved state" (no step asks for a move the
board already shows, a marker included) and "Only a searching hint is excused
the walk's promise" with "The hint walk SHALL cover every preset a game
offers" (a hint asked from any reached position does not stall). The
requirement says nothing of Salad's own: its marker steps are a `step` leg of
the walk and are held by the same cross-game walks as the steps the walk
builds.

## edit `engine-hints`: A highlight on a board element stays legible against its cell

Rule 3. Solo, Keen, Towers and Unequal each say a struck candidate is drawn
with a line through it, and this requirement already covers the subject and
says only that it stays visible. The population is every game whose renderer
paints the `struck` lane of the hint `OverlaySidecar`, which holds a step's
`marks`: ABCD, Crossing, Group, Keen, Mathrax, Rome, Salad, Seismic, Solo,
Towers, Unequal and Undead. Each draws it in its own `render.ts`, there is no
shared painter, and I read all twelve sites: each draws the note in its
ordinary pencil color whether struck or not and then a line across it (ten a
level line in the note's color, Rome a diagonal in the arrow-note color,
Undead a diagonal in the hint color). None draws a strike another way.

from: does not look already resolved.
to: does not look already resolved. A candidate a step strikes, one of the `marks` of its highlights, SHALL stay drawn among its cell's notes in the note's own ink, with a line through it as the cue that the hint rules it out.

## edit `solo`: Solo's hint marks pair each color with a shape

`engine-hints`, "A highlight on a board element stays legible against its
cell", now says a struck candidate is drawn with a line through it. The
scenario stays: it is the one case of a strike naming a region, and its title
names the candidates.

from: rests on, stripes over the region the sentence names, and a line through a ruled-out candidate
to: rests on, and stripes over the region the sentence names

## edit `keen`: A cage elimination is one firing, struck as one journey

`engine-hints`, "A highlight on a board element stays legible against its
cell", holds the line through a struck candidate.

from: striped, the cell is ringed in the hint color and the struck candidates are shown with a line through them
to: striped and the cell is ringed in the hint color

## edit `towers`: A Towers hint step marks the clue it reasons from and the cells it acts on

`engine-hints`, "A highlight on a board element stays legible against its
cell", holds the line through a struck candidate. The clue's outline, the
striped line of sight and the ring stay.

from: ring the target cell or cells and cross through the struck candidates, with
to: ring the target cell or cells, with

from: striped, each cell struck from is ringed and each struck candidate is crossed through
to: striped and each cell struck from is ringed

## edit `unequal`: A hint's marks ring the struck cell and outline the clue's pair

`engine-hints`, "A highlight on a board element stays legible against its
cell", holds the line through a struck candidate.

from: sits between, and SHALL show every candidate it rules out with a line through it.
to: sits between.

from: outlined, the struck cell is ringed, and the struck candidates are drawn with a line through them
to: outlined and the struck cell is ringed

## keep `undead`: A struck candidate stays legible

It says more than the shared sentence: that the background behind the struck
candidate is not the hint color, and, in its scenario, that dismissing the
hint repaints the candidate as an ordinary note. Undead's line is the one
drawn in the hint color (`undead/render.ts`).

## reword `engine-candidate-hints`: The shared track and refresh read a game's move dialect

Rule 4. The body is unchanged. Its one scenario gave the verdicts, which the
next entry states as a requirement of their own (the two together pass 500
characters), so this one takes a scenario about its own subject, the dialect.
Read: `CandidateMoveAdapter`, `adapterOf` and `keepCandidateHintTrack` in
`candidate-hint.ts`, Group's `groupCandidateMoves` (a move carrying a cell
list) and Crossing's `crossingCandidateMoves` (moves keyed on `kind`).

### Requirement: The shared track and refresh read a game's move dialect

The engine SHALL provide generic `keepCandidateHintTrack` and
`refreshCandidateHintStep` over the shared pencil-move shape (`set`,
`pencilAll`, `pencilStrike`, `pencilAdd`), read through a game's move dialect,
and over `CandidateHighlights`.

#### Scenario: A move the dialect does not read is off the plan

- **WHEN** a game whose moves carry a cell list passes its dialect, and the
  player fills several cells with one move
- **THEN** the dialect reads that move as none of the shared shapes and the
  verdict is `off`, and a step the helper shrinks has its move rebuilt in the
  game's own shape

## add `engine-candidate-hints`

Rule 4, the verdicts. Keen, Towers and Unequal each state them, and each
game's `hintKeepTrack` is one call of `keepCandidateHintTrack`
(`keen/index.ts`, `towers/index.ts`, `unequal/index.ts`). The helper is called
by every game on the walk and by Crossing, eleven in all; Salad and Crossing
judge a step of their own (a marker, a whole-run placement, Crossing's note
step) before handing the rest to it, so the rule is stated of the helper.
Checked against `keepCandidateHintTrack`: a populate step is `completed` only
by a fill-all; a placement step only by an ink `set` of the same cell and
value; a strike or note step by a `pencilStrike` or `pencilAdd` of exactly its
marks (`sameMarks`), `off` for any other of that type; a pencil toggle on one
of the step's marks is `onTrack`, or `completed` on the last, only when the
candidate is present for a strike and absent for a note; everything else is
`off`. The keen note's wording was right, with two additions the code makes:
the fill-all, and the note step. The existing scenario moves here.

after: The shared track and refresh read a game's move dialect

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

## cut `keen`: Keen keeps a hint plan while the player follows it

`engine-candidate-hints`, "A candidate step is completed by the move that
makes it whole", holds every verdict it gives; Keen's `hintKeepTrack` is one
call of `keepCandidateHintTrack` with the default dialect.

## cut `towers`: hintKeepTrack advances the plan when a move matches the step

`engine-candidate-hints`, "A candidate step is completed by the move that
makes it whole", holds every verdict it gives; Towers' `hintKeepTrack` is one
call of `keepCandidateHintTrack` with the default dialect.

## cut `unequal`: A kept plan follows the player's own move

`engine-candidate-hints`, "A candidate step is completed by the move that
makes it whole", holds every verdict it gives; Unequal's `hintKeepTrack` is
one call of `keepCandidateHintTrack` with the default dialect.

## reword `engine-candidate-hints`: Latin-family hints distinguish naked and hidden singles

Rule 5. The population sentence ("every game on the shared Latin solver and to
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

## not-shared a firing census certifies every rung of a solver ladder

Rule 6. Solo ("A census certifies that every rung fires"), Pearl ("Pearl's
solver is a certified deduction ladder"), ABCD ("ABCD's solver classifies a
clue set by deduction alone") and Tents ("Tents' solver is a certified
deduction ladder") each say a firing census asserts that every rung of its
ladder fires, on a corpus each names. The rule they share, that a
`runDeductionFixpoint` ladder is certified by a census, is true of only some
of the games it would name, with no line that divides them: thirteen games'
ladder tests call `describeLadderCensus`
(`src/engine/testing/ladder-census.ts`), and other games call the runner in
their solvers with no census at all (the note below). What is true of the
thirteen is the helper's own behavior: it fails unless the rungs with a zero
tally are exactly the keys of `unreached`, on an `unreached` key the ladder
lacks, and on a fired id the ladder does not declare. No game states that
(all four say none is excused), no game's copy would shrink by it, and the
helper's failure message says it to the session that meets it, so it is not
written as a requirement of `testing`, whose "A rung no known board fires is
excused by name, with its reason" is about `Game.hintRungs` and the pin scan.
The four games keep theirs: each gives its corpus and its caps.

## note Some games on `runDeductionFixpoint` have no firing census

Clusters, Filling, Pattern, Singles, Spokes, Undead and Unruly call
`runDeductionFixpoint` in their solvers and have no test that calls
`describeLadderCensus`, and no guard derives which games owe one (Boats and
Loopy name the runner only to say why they do not use it). A rung of
theirs that fires on no board is not seen by anything. A requirement that
every such ladder has a census would be false today; a guard deriving the
population from who calls the runner would make it true, and would be the
moment to state the census once in `testing`.

## note The naked-single guard walks a hand-kept list of four games

`hint-resume.test.ts`, "a Latin-family placement never falsely claims a naked
single", filters `HINT_GAMES` by the names `towers`, `unequal`, `keen` and
`group`, and reads the cell's candidates by row and column. The sentence it
checks is also spoken by ABCD, Mathrax, Salad and Seismic through
`narrateLatinReason`, and Solo and Rome word the same claim themselves. The
classifier's throw holds the rule in every game on the walk; this test's
population is a list of names and not a derivation.

## note The guide says Seismic alone records nothing

`docs/games/hints.md`, § "Deduce from the notes when the mistake check vouches
for them (Seismic)", says "Every other walk game records, because its notes
may be wrong." ABCD's plan also has `record: () => []` and deduces by its own
rungs from `RungContext.shown`. The reason given is also not the dividing
line: every game on the walk flags a note that excludes the answer.

## note Map removes a pencil dot with no line through it

Map's hint can remove a dot the player made ("A narrowing step says what it
does") and its renderer paints no struck lane: the step rings the region and
the sentence says the dot must go. Map is off the candidate walk and its steps
carry no `marks`, so the sentence added to `engine-hints` "A highlight on a
board element stays legible against its cell" does not reach it; whether a
dot a hint removes should be shown struck is a question for Map.

## note Rome's hint requirement restates the resume walk in its one scenario

`rome` "Rome explains its next deduction" has a single scenario, "A hint can
be followed to a finished board", which is `engine-hints` "The hint walk SHALL
cover every preset a game offers" for Rome. It is left because the
requirement would have no scenario without it.
