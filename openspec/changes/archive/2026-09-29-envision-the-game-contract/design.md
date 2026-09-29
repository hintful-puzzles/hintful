# envision-the-game-contract — design

**Status: decided (owner, 2026-09-29).** This is the vision the proposal asked
for. It implements nothing itself. What follows from it is the set of scaffolded
changes listed under § "The phases", each carrying its own falsifier.

Every figure below was measured on 2026-09-29 at `5765e9e3`, read-only. That
included four surveys (hint narration and marks, rendering, input, and params /
help / text / completeness), and each one read the population instead of
grepping for a name. A figure is history the moment it is written: re-take it
before designing against it.

## The finding that decides the shape

Five earlier framework directions were withdrawn: the scene graph, the gesture
table, the board model, the definition adapter and the tile loop. Each was
measured by whether a declaration would **save code** or **kill a live defect**,
and each lost to helpers keyed on a mechanic: `border-grid.ts`,
`note-taking-cell.ts`, `hint-mark.ts`, `overlay-sidecar.ts`. **Those
measurements still hold.** A contract justified by line savings would lose again,
for the same reasons.

The goal here measures something else: **whether the parts of a game can
disagree with each other.** The adapter postmortem's settling criterion was
*"did a declaration need to know about any other declaration?"* Then, the answer
was no four times. Under this goal the answer is yes:

- **Hint words and hint marks.**
  - "Ringed" names the *target* in some games and the *evidence* in at least
    seven: Bricks, Clusters, Galaxies' dots, Loopy's dots, Light Up, Range and
    Slant.
  - The one drawing primitive `drawHatch` is "striped" in about twelve games and
    "hatched" in Separate, where it is a second kind of evidence rather than the
    line named.
  - The evidence role is spelled at least seven ways across highlight types
    (`area`, `evidence`, `cells`, `focus`, `islands`, `danger`, `chain`).
  - `Game.hint` returns `HintResult<Move>`, so every game's highlight type is
    `unknown` at the boundary. Only thirty-nine renderers see their own type,
    and that through method-parameter bivariance.
  - Nine games have a test pairing a word with a mark. The Boats defect ("the
    striped row" over rings) passed every cross-game guard.
- **Params, their labels and their help.** A game's params are described three
  times: in its preset titles, in its `describeParams`, and in a per-game
  formatter in `src/puzzle/augmentation.ts` (51 formatters). Fed each leaf
  preset's params, the formatters reproduce 363 of 428 titles. **Twiddle's
  custom header reads "rotating NaNxNaN blocks"**, because Twiddle has no
  `describeParams` and its formatter reads fields that never arrive.
- **Help and code.** `help-coverage.test.ts` checks that the Controls and Hints
  sections are *present*, and that the parameters section *mentions* each field
  name. Before 2026-09-28, 27 of 57 pages never mentioned the keyboard, which
  every game has.
- **Draft status** needs every section, by definition.

**So the contract is justified by consistency and completeness, not by
economy**, and it should be built only where two channels must agree.

## What already works, and is the model to copy

The input flags that survived the manifest reversals are exactly this
proposal's principle in miniature. Each of `canMarkAll`,
`ignoresSecondaryButton` and `wantsStylusModifier` is **consumed** by the
frontend or the engine, and **held equal to behavior** by a biconditional
(`mark-all.test.ts`, `input-parity.test.ts`). Similarly, `paramConfig` is
consumed three ways: the dialog, the codec (`params-codec.ts`) and the tier
names (`difficultyTiers`). A new section should look like these: something the
engine builds from, plus a validator where types cannot reach.

## The shape

**`Game` stays the contract. There is no builder, no definition object and no
adapter.** Nothing a builder would add is missing from a typed object, and the
adapter postmortem's objection stands: a compile step buys indirection and no
checking the types cannot do. What changes is the object's type.

**Sections, each in one of three states:**

1. **Implemented.**
2. **`notApplicable(reason)`**: a typed value naming *why* this game has no such
   thing. It is consumed: the help page renders the reason, the draft
   computation reads it, and the cross-game guards read it in place of their
   ledgers. This is the ledger idea (`NOT_TURNED`, `KEYPAD_WITHOUT_PENCIL`,
   `NO_FLAG`, `OPENS_ITS_OWN_REFUSAL`) moved onto the game, where a new game
   meets it at the type rather than in a test file it has not read.
3. **Absent**, which makes the game a **draft**.

The middle state is what makes "draft" mean something. Measured, most absent
members have a puzzle reason: sliding puzzles have no mistake notion, the Latin
games are square, and upstream had no solver for Cube, Pegs, Same Game or
Sokoban. Without it, draft collapses to "has no `hint()`", which the thirteen
hintless games already are. **A hint is never `notApplicable`** (owner,
2026-09-28).

**Adoption is per game and per section.** The sections stay optional in the
type while games migrate, so the old and new shapes coexist, and the draft
label reports the ones not yet done. There is no flag day.

## Owner decisions (2026-09-29)

Recorded here because they bind the scaffolded changes:

- **Mark vocabulary.** A **ring** is what the step decides. An **outline** is
  the evidence it reasons from. **Stripes** are the line or region the sentence
  names. Words players already see are renamed to fit, so Bricks' "ringed
  evidence" becomes outlined. The engine owns each role's glyph, its noun ("a
  ring") and its adjective ("ringed").
- **`notApplicable(reason)`** is a first-class section state, and the help
  shows its reason.
- **Help is generated where the contract holds the facts**: the Parameters
  section, and the Hints section's list of marks. The rules prose, the
  per-field meaning of a mode and the reasoning a hint teaches stay
  hand-written.
- **Order**: phase 0 first, then hints (phase 1), with params (phase 2)
  alongside.

## The phases

Each phase is its own change. The later ones are scaffolds whose task 0 is a
measurement.

### Phase 0: fix the instruments, and the defects they missed

- **`strengthen-the-repaint-differential`.** `repaint-differential.ts` calls
  `m.timer(30)`, and `Midend.timer` takes **seconds**, so every animation and
  flash finishes before the next paint. The guard has never painted an
  animation frame; instrumented, zero frames had `animTime` or `flashTime`
  above zero, across all 57 games. It also never paints mid-drag. A scratch
  copy with sub-second ticks and a mid-drag paint found **a new defect in
  Bricks**: the drag preview's error marker straddles tile corners, and 171
  pixels of it survive the release. Netslide's `besideMoving` fix (7c92f3a6)
  is gated on animating, so today's guard cannot re-detect it. The change also
  adds a power count per game: frames with an animation, a hint or a mistake
  actually reached. Fifteen hinted games reached no hint frame.
- **`fix-twiddle-custom-header`.** The NaN header, fixed now rather than
  waiting for phase 2 to delete the formatter.

### Phase 1: `bind-hint-words-to-marks`

This comes first because October's hints are the pressure.

- **Typed highlights through the boundary.** `Game` gains a highlights type
  parameter, so `hint`, `redraw` and `refreshHintStep` stop erasing it.
- **Engine-owned mark roles.** Each role owns its glyph, noun, adjective and
  palette meaning, per element kind: cell, edge, dot, region, line. A game may
  add a role, and says why in its change.
- **Tagged narration.** A sentence is built from fragments, where a mark
  reference *supplies the mark's elements*. The step's highlights are then
  derived from the sentence, not written beside it, and the Boats defect cannot
  be written. The candidate walk already binds `targets` and `marks` to the
  move (`StepWords` in `candidate-plan.ts`). This extends that binding to the
  words.
- **A validator on every step.** Every drawn mark is referred to, or belongs to
  a role declared silent.
- **Refresh rebuilds the words.** `refreshCandidateHintStep` and
  `keepCandidateHintTrack` shrink a step's marks and keep its old sentence
  today.
- **Generated help.** The Hints section's list of marks is generated from the
  roles.
- **Pilot:** one hintless game, Palisade (all deixis: "this edge", "these
  clues"), and the ten games on the candidate walk (one engine change reaches
  all ten). The hintless game is chosen for what it presses on in the mark
  contract. `characterize-the-hint-assessment-corpus`'s order (2026-09-09) is
  used up, since every game it picked now has a hint, so the change's task 0
  picks one of the thirteen and says why.
- **Falsifier:** the hard forms fail to express without an escape per sentence.
  Those forms are deixis ("this cell" promising a ring), quantifiers ("either
  outlined tile"), agreement ("it/them"), parenthetical references ("its bulbs
  (ringed)"), continuation legs, and the composed `${premise}, so ${conclusion}`
  sentence. If they do fail, the fallback is a typed mark *reference* checked
  against the step, rather than generated text.

The pilot ends by scaffolding the sweep over the other hinted games, in
batches by shared hint machinery.

### Phase 2: `declare-params-in-one-place`

- Each `paramConfig` field gains a doc and, where numeric, its bounds.
- The engine supplies the difficulty item that 29 games write out identically.
- One description of a params object produces the preset titles, the custom
  header and the Parameters help section. This retires `describeParams` and the
  `augmentation.ts` formatters: three copies become one.
- Minimum and maximum messages are generated from the bounds. There were at
  least 18 wordings of "board too small" in the probe.
- The remaining hand-written codecs move to `paramsCodec` where the frozen
  encodings allow it; 19 of 57 use it today.
- **Falsifier:** fewer than about 40 games' titles reproduce from one describer
  without a per-game override.

### Phase 3: `derive-the-draft-label`

- `notApplicable(reason)`, and the section states.
- The catalog's draft label is computed from them. This reverses the catalog's
  comment "No `unfinished` flag".
- The cross-game ledgers that are really "not applicable, because" move onto
  the games.
- The change amends the two live specs that still give the old rule as the
  reason:
  - `build-pipeline`, "Import-graph selection alone is unsound here": "never a
    manifest".
  - `ts-engine`, "The capability snapshot records the draw state its
    constructor builds": "an approved vocabulary would be a manifest".
  - It also amends "A shared mechanic is joined by having it, not by declaring
    it", which says the same thing without the word.

### Phase 4: `derive-target-verb-input`

- A mechanic-keyed input model for the click-only games: 17 of them, the M2
  cluster of the input survey. A game declares its target geometry and each
  button's verb, as a function returning a move with a label. The model
  derives Enter and Space at the cursor, and the Controls paragraph.
- With the note-taking cell, 30 games get a derived input core. The drag games
  keep `interpretMove` for good, because their keyboards are designs
  (`docs/games/input.md` § "The keyboard equivalent of a drag is a design, not
  a derivation").
- **Task 0** is a behavioral probe: does `CURSOR_SELECT` at the cursor do what
  `LEFT_BUTTON` at that cell does, game by game? If fewer than about 20 agree,
  the derivation claim is false and the change is withdrawn.

### Phase 5: `own-the-player-facing-messages`

Engine-owned message kinds, in the shape `hint-refusal.ts` already has:

- **Solve failures:** 27 spellings in `hint-refusal.test.ts`'s exceptions for
  about four concepts.
- **Description-parse errors:** "invalid character" alone has at least ten
  spellings.
- **Status prefixes:** "COMPLETED!", "Auto-solved." and their variants.

## Rendering: no engine-owned tile loop

The tile-loop arithmetic still holds: a median of 20 lines of bookkeeping
against 64 of the game's own. The postmortem's "no live defect" reason does
not: the repaint differential found about a dozen games with defects, and phase
0 found Bricks. But those defects are cross-tile paints, shared pixels and
overflows, not the key-routing class the inversion targeted. So the answer is a
stronger differential (phase 0), not a loop.

**A declared footprint earns its place only where the engine draws.** Phase 1's
engine-drawn marks need to know which tiles a mark's pixels overlap, which is
what `HintMarks.eraseBeforeTiles`' overlaps callback provides ad hoc today. So
phase 1 declares a footprint for mark geometry and nowhere else. Nothing moves
painting behind the engine, so no browser timing is owed. If it ever does
move, the proposal's performance rule applies: time it in a browser before
adopting it.

## What stays per game, permanently

These stay with the game because it could legitimately do them differently:

- The rules prose.
- A drag's keyboard design.
- A technique's deduction.
- The cell painter.
- The per-field meaning of a mode.
- The reasoning a hint teaches.
