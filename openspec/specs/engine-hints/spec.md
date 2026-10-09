# engine-hints Specification

## Purpose
The hint system: what a hint step is, how the midend shows, refreshes and
plays one, the marks and words a step is built from, the rules its narration
is held to, and the planners and refusals of the hints that search.

## Requirements

### Requirement: The engine supports an ephemeral Hint System

The `Game` interface SHALL define an optional `hint(state, aux?, ui?)` returning
a `HintResult`: a non-empty ordered plan of `HintStep`s, or a refusal. Each step
SHALL carry a move, a human-readable explanation and optional visual
highlights, narrated for the state that step applies to. The hint system SHALL
be UI-only and ephemeral: the `Midend` SHALL hold the whole plan and a
current-step index in `activeHint`, midend-only, never in game state and never
persisted.

#### Scenario: Requesting a hint from the midend

- **WHEN** the user requests a hint via `midend.hint()` with no active plan,
  on a game that implements the `hint` method
- **THEN** the midend computes a plan once, stores it with index 0, sends the
  first step's explanation to the UI, and schedules a repaint

### Requirement: The midend passes the generator's aux to a hint

The `Midend` SHALL pass its stored `aux`, the generator's solution hint and the
same value `solve` receives, as the second argument of `hint`, so that a game
whose best hint derives from the known solution can use it when present and
fall back otherwise. A deductive game ignores it.

#### Scenario: A freshly generated board is hinted

- **WHEN** the midend asks a game for a hint on a board its generator produced
  an `aux` for
- **THEN** the game's `hint` receives that `aux`, the value `solve` would get

### Requirement: A game with no technique to teach walks the known solution

Walking the player to the unique solution, from `aux`, SHALL be accepted as a
legitimate hint strategy for a non-deductive game, one with no technique to
teach. Such a game
SHOULD prefer the `aux`-derived plan when `aux` is present, which guarantees
the plan completes, and is free to fall back to a local heuristic when it is
absent.

#### Scenario: A non-deductive game is hinted with and without aux

- **WHEN** a non-deductive game's `hint` is given the generator's `aux`
- **THEN** its plan is derived from that solution
- **AND** when `aux` is absent, a game that keeps a local heuristic plans from
  it

### Requirement: The midend displays at most one step of a stored plan

The `Midend` SHALL display at most one step at a time: the displayed step SHALL
be passed to the game's `redraw` and its explanation sent to the UI. A stored
plan can be hidden, displaying nothing. The `Midend` SHALL compute a plan only
when no valid plan is stored: `midend.hint()` SHALL re-display the stored
plan's current step, with no recompute and no advance, while a plan is active,
and SHALL compute and store a fresh plan at index 0 otherwise.

#### Scenario: A hidden plan is shown again

- **WHEN** `midend.hint()` is called while a plan is stored and hidden
- **THEN** the plan's current step is displayed, and the plan is neither
  recomputed nor advanced

### Requirement: executeHint plays the current step and previews the next

`midend.executeHint()` SHALL play the current step of the stored plan,
computing a plan first if none is stored. It SHALL keep that step displayed
through the move's animation, and SHALL advance to the next step when the
animation settles. Called without `hideAfter`, it SHALL display that step as
the auto-play preview.

#### Scenario: Auto-play execute previews the next step

- **WHEN** `executeHint()` (no argument) is called on a game with a stored plan
- **THEN** the executed step settles and the next step is displayed as the
  auto-play preview

### Requirement: A player move is classified against the stored plan

While a plan is active, displayed or not, the `Midend` SHALL classify each
player move by the game's `hintKeepTrack(move, currentStep, state)` verdict.
`"completed"` SHALL advance the plan to the next step and hide the display, so
manual play shows one hint per request. `"onTrack"` SHALL keep the current step
displayed, with any adjustment the game made in place to the step's move to
reflect partial progress. `"off"` SHALL drop the plan.

#### Scenario: Exact-follow keeps the plan and a conflict drops it

- **WHEN** the player makes a move that exactly follows the displayed hint
- **THEN** the plan is kept (advanced), not dropped
- **AND WHEN** the player instead makes a conflicting move
- **THEN** the plan is dropped and the next hint recomputes from the new state

### Requirement: A completed verdict vouches for the rest of the plan

A game returning `"completed"` is asserting that the resulting state matches
the plan's expectation, so the remaining steps stay valid. A game SHALL return
it only where that holds.

#### Scenario: A move finishes the step another way

- **WHEN** a player's move leaves a state the plan's later steps do not expect
- **THEN** the game does not answer `"completed"` for it

### Requirement: A journey stays on screen through its legs

When a move completes a step and the next step is flagged `continuesPrevious`,
the continuation of a journey the completed step previewed (the "then to
column 5" leg), the display SHALL stay on and move to that step instead of
hiding: a journey is presented as one hint and stays on screen through its
legs.

#### Scenario: The first leg of a journey is completed by hand

- **WHEN** the player's move completes a displayed step and the next step is
  flagged `continuesPrevious`
- **THEN** that next step is displayed without another request
- **AND** when the next step is not flagged, the display hides until the
  player asks again

### Requirement: A stored plan is cleared when play leaves it

The stored plan SHALL be cleared on undo, redo, restart, new game and solve,
when its last step completes, and when the board reaches the solved state.

#### Scenario: Undo drops the plan

- **WHEN** the player undoes a move while a plan is stored
- **THEN** the plan is cleared, and the next hint request computes a fresh one

### Requirement: One deduction firing is one journey

Where a game's `hint()` derives its plan from a solver or deduction engine, a
single logical deduction that forces more than one move SHALL be emitted as
one journey: an ordered run of `HintStep`s whose first leg carries the full
explanation and whose later legs are flagged `continuesPrevious` with
abbreviated narration. The first leg SHOULD show the whole set, with the other
forced moves as sibling highlights. Distinct deductions SHALL remain separate
hints, the first leg of each unflagged.

#### Scenario: One clue forces two edges

- **WHEN** a single deduction forces two moves: a coupled pair of edges, or a
  clue that resolves several of its sides at once
- **THEN** the plan holds two steps for it, the first with the full
  explanation and the second flagged `continuesPrevious`
- **AND** in manual play the hint stays on screen through both legs, and
  auto-play animates them back to back as one multi-part move

### Requirement: A hint naming several kinds of element colors them by a stable legend

Where a game's hint narration names more than one distinct kind of board
element (a filled cell as premise and the forced cell as conclusion, a clue and
a region), the game's `redraw` SHALL distinguish the kinds with a stable
per-game color legend: each kind takes one highlight color in all that game's
hints, and only the kinds a given hint names are highlighted. The legend
governs premise and element kinds: equivalent forced moves SHALL still share
the single target color.

#### Scenario: A hint naming multiple element types colors them by a stable legend

- **WHEN** a game's displayed hint step narrates two distinct board-element
  types (for example a cited filled/decided premise cell and the forced target
  cell)
- **THEN** `redraw` highlights each type in its own legend color, and does not
  render both in the single target color

#### Scenario: A legend color is the same across different hints of one game

- **WHEN** two different hints of the same game each name the same element type
  (for example "a shaded square" appears as a premise in two different
  deductions)
- **THEN** that element type is drawn in the same legend color in both hints

### Requirement: A legend color is never the only cue

Each legend color SHALL be paired with a non-color cue (ring against shade
against fill, the drawn digit or clue, or position) so the mapping from color
to kind survives for colorblind players. Color SHALL NOT be the sole carrier.

#### Scenario: Two kinds of element are highlighted in one step

- **WHEN** a displayed step highlights two kinds of element in their legend
  colors
- **THEN** each is also told apart by a distinguishing non-color cue

### Requirement: Hint explanation surfaces independent of the status bar

The displayed step's explanation SHALL reach the UI's hint banner whenever a
hint is displayed, whether or not the game has a status bar (provides
`statusbarText`). It SHALL ride the `status-bar-change` notification beside the
status-bar text, and the `Midend` SHALL emit that notification for a game that
has either a status bar or a `hint`.

#### Scenario: A no-status-bar game shows and clears the hint banner

- **WHEN** a game with a `hint` method and no `statusbarText` is sent a
  hint request, and then the player makes a move
- **THEN** the midend emits the hint explanation while the hint is displayed
- **AND** the explanation is cleared (emitted empty) once a move hides the hint

### Requirement: executeHint supports a single-step (hide-after) mode

`midend.executeHint(hideAfter?)` SHALL accept an optional `hideAfter` flag,
false by default. When it is true the executed step SHALL still stay displayed through
its animation, and on settle the plan SHALL advance and then be hidden, the
same hidden-but-stored state a manual step completion produces, so nothing is
previewed. The next `midend.hint()` SHALL re-display the advanced step without
recomputing.

#### Scenario: Single-step execute hides the plan instead of previewing

- **WHEN** `executeHint(true)` is called on a game with a stored plan
- **THEN** the current step's move is made and, once it settles, the plan
  advances and is hidden (no next-step preview is displayed)
- **AND** a subsequent `hint()` re-displays the advanced step without
  recomputing the plan

### Requirement: The toolbar Hint button alternates show and apply

The app shell's Hint control SHALL alternate between showing and applying one
hint step, built on `midend.hint()` to display and `executeHint(true)` to apply
one step and hide it, without changing any game's `hint()`. Applying SHALL be
terminal: it SHALL NOT go on to the next hint. The separate Auto-Hint
play/pause button SHALL remain the way to play the whole remaining plan
unattended, using `executeHint()` with no `hideAfter` and its continuous
preview.

#### Scenario: First press shows, second press applies and stops

- **WHEN** the player presses Hint on a hinted game with no active plan, and
  then presses Hint again without any other interaction
- **THEN** the first press displays the current step (no move is applied) and
  the second press applies that one step in slow motion, hides the plan
  (no next step is previewed), and shows a "Hint applied" confirmation

#### Scenario: Presses alternate show and apply

- **WHEN** the player keeps pressing Hint with no other interaction between
  presses
- **THEN** the presses alternate show, apply, show, apply: each apply lands one
  move and stops, and the following press shows the next step

### Requirement: A Hint press applies only while armed

The orchestrating `Puzzle` SHALL keep an armed-to-apply flag. A Hint press
while not armed SHALL run the show path (`midend.hint()` via the surface) and
SHALL arm the flag only if the show returns no refusal: a refused hint
(mistakes present, already solved, nothing deducible) SHALL show its banner and
overlay and SHALL NOT arm. A press while armed SHALL disarm and apply exactly
the current step via `executeHint(true)`, so the next press shows the next
step.

#### Scenario: A refused hint does not arm the apply

- **WHEN** a Hint press is refused (for example, the board has mistakes)
- **THEN** the refusal banner and overlay are shown, and the next Hint press
  is still on the show path (it does not apply a step)

### Requirement: Any other action disarms the apply

The armed-to-apply flag SHALL be cleared by any user action between two Hint
presses: a move (key or pointer), undo, redo, solve, restart, new game,
checkpoint load, loading a saved game, deletion, or starting Auto-Hint.

#### Scenario: An intervening action re-arms the show

- **WHEN** the player presses Hint (showing a step), then performs any other
  action (e.g. a move or undo), then presses Hint again
- **THEN** the next press shows the now-relevant step and does not apply a
  stale one

### Requirement: An applied hint is confirmed in the banner

When an armed Hint press applies a step and the board is not yet solved, the
hint banner SHALL show the transient confirmation "Hint applied". When
`executeHint` returns an error, the banner SHALL show that message.

#### Scenario: The applied step solves the board

- **WHEN** an armed Hint press applies the step that solves the board
- **THEN** the banner does not say "Hint applied"

### Requirement: A displayed hint step never references already-resolved state

While a hint step is on display, every element it asks the player to act on
SHALL still be actionable in the current state: a candidate-elimination step
SHALL NOT name a candidate already removed from its cell. A stored plan kept
across the player's exact-follow moves (`"completed"` and `"onTrack"`) SHALL
be re-validated against the current state before it is displayed or
re-displayed, so a move's side effects (auto-pencil eliminations) cannot leave
a later step naming what the player cleared.

#### Scenario: A kept plan never shows an already-removed candidate

- **WHEN** a hint plan is kept across the player's exact-follow moves, and one
  of those moves (or its auto-pencil side effects) removes a candidate that a
  later stored step would have struck
- **THEN** that later step is not displayed as striking the already-removed
  candidate: the midend drops the dead mark (advancing or recomputing the plan
  as needed) so every displayed elimination is still live

### Requirement: refreshHintStep re-validates a stored step

The re-validation SHALL use the optional `Game.refreshHintStep(step, state)`.
Given a stored step and the current state, the game SHALL return the step with
its no-longer-actionable parts dropped and its highlights rebuilt to match, the
same reference when nothing changed, or `null` when the step is fully resolved.
A game without the hook SHALL have its stored steps shown as they are, which is
correct for a game whose moves cannot be partly resolved by another move's side
effects.

#### Scenario: Nothing in the step has been resolved

- **WHEN** the hook is given a stored step every part of which is still
  actionable
- **THEN** it returns the same step reference

### Requirement: The midend refreshes the current step before every display

The `Midend` SHALL call `refreshHintStep` before it displays or re-displays the
plan's current step: on a `midend.hint()` re-show, after a kept manual move
advances or shrinks the plan, and after an executed-hint step settles. It SHALL
advance past any step the hook reports fully resolved, and SHALL recompute a
fresh plan if the whole stored plan drains. An exact-follow move SHALL still
keep the plan, and a conflicting move (`"off"`) SHALL still drop it.

#### Scenario: A displayed step is re-validated before showing

- **WHEN** the midend is about to (re-)display the current step of a stored plan
- **THEN** it calls the game's `refreshHintStep` (when provided) and shows the
  refreshed step, advancing past any step reported fully resolved and
  recomputing a fresh plan if every stored step has been resolved

### Requirement: hintKeepTrack judges a move against the board before it

The `Midend` SHALL classify a player move with `hintKeepTrack(move, step,
state)` against the pre-move state, the state the move is about to be applied
to, so a game can apply the move itself to reason about its result (a slide
puzzle computing the landing cell). A game classifying a candidate toggle SHALL
test liveness against that pre-move state: a toggle clears a candidate only if
it is present before the move, and toggling an absent candidate re-adds it and
is off-plan.

#### Scenario: The player toggles a candidate the step strikes

- **WHEN** a step strikes a candidate and the player toggles that candidate
  while it is absent from the cell
- **THEN** the game judges the move off the plan, because the toggle re-adds it

### Requirement: Requesting a hint never mutates the board

Computing, displaying or re-displaying a hint SHALL NOT change the game state.
A hint displays a plan through highlights the game's `redraw` paints, and the
player applies a step only by following it or by an explicit apply action.
`Game.hint` SHALL be pure on its `state` argument, and showing a hint SHALL
leave every board value, pencil notes included, untouched.

#### Scenario: Showing a hint leaves the board unchanged

- **WHEN** the player requests a hint (the show, not an apply)
- **THEN** the game state is byte-for-byte unchanged, and only highlighting is
  added

### Requirement: A highlight on a board element stays legible against its cell

A displayed highlight that acts on a board element, such as a struck
candidate, SHALL be drawn legibly against its cell and never in the color of
the cell's own background fill, so the element it refers to stays visible and
does not look already resolved.

#### Scenario: A struck candidate stays visible

- **WHEN** a displayed step strikes a candidate
- **THEN** the candidate remains visible, its highlight contrasting with the
  cell background, and is not hidden behind a same-color fill

### Requirement: Hint mechanics are engine-owned and cross-game guarded

A game's hint SHALL contain only what is that game's: what it can prove, what
it marks on the board, and what it says. The mechanics a hint needs (how a plan
is carried and advanced, how a mark survives a move animation, how an overlay
reaches the render cache, how a plan stays stable across recompute, how a step
is narrated in the shared vocabulary) SHALL be provided by the engine or by a
shared hint library, and SHALL NOT be re-derived per game.

#### Scenario: A new hinting game inherits the mechanics

- **WHEN** a newly ported game adds a hint
- **THEN** it implements its deductions, its marks and its narration, and
  inherits plan lifecycle, mark-vs-animation placement, overlay cache
  invalidation and the narration vocabulary from the engine

### Requirement: A shared hint mechanism costs no game its narration

A shared hint mechanism SHALL NOT cost a game any of its narration. The
exemplar hints (Palisade's deduction bar, Inertia's stable subgoal, Towers'
recorded eliminations, Filling's grouped multi-square step) are the acceptance
test: an abstraction that cannot express one of them without loss SHALL be
rejected or reshaped. A seam that does not meet the bar for extraction SHALL be
recorded as a deliberate no-go with its reason, and SHALL NOT be forced.

#### Scenario: An extraction that would flatten a hint is rejected

- **WHEN** a proposed shared abstraction cannot express an exemplar game's hint
  without losing part of what that hint says
- **THEN** the abstraction is rejected or reshaped, and the rejection is
  recorded with its reason

### Requirement: A hint defect seen in two games is closed for every game

A hint defect class that has occurred in two or more games SHALL be closed
structurally or by a cross-game guard, a test every hinting game is enrolled
in, and SHALL NOT be left to a rule in a document that each new port must
remember.

#### Scenario: A recurring hint defect is closed for every game at once

- **WHEN** a hint defect is found that has already occurred in another game: a
  mark that does not track its moving piece, an overlay absent from the render
  cache's diff key, a plan that loops across recomputes
- **THEN** it is fixed in the shared mechanism and guarded by a test every
  hinting game is enrolled in, and is not fixed only in the game that reported
  it

### Requirement: A hint marks beside the content, never behind it

A hint's marks SHALL NOT be drawn underneath anything the player has to read.
The acted-on cell SHALL be ringed and not filled, in every game and with no
exceptions, even where a fill would hide nothing: one mark means one thing
across the collection. An evidence area whose cells carry content (entered
digits, pencil marks, clue glyphs, a placed mark, or a background the deduction
is reading) SHALL be outlined and not washed.

#### Scenario: The acted-on cell is ringed, not filled

- **WHEN** a hint step marks the cell it acts on
- **THEN** the mark is a ring of thin sides drawn on the cell's border, and no
  primitive fills the cell with a hint color
- **AND** the same mark is used whether the step places a value or strikes a
  candidate, so the cell is never identified only by the strike
- **AND** this holds even where the cell is empty and a fill would hide nothing

#### Scenario: Evidence carrying content is outlined

- **WHEN** a hint step marks an evidence area whose cells carry entered digits,
  pencil marks, clue glyphs, or a background the deduction is reading
- **THEN** the area is drawn as an outline: a side wherever the neighbor across
  it is not also evidence, so a contiguous region reads as one contour and a
  scattered set as one ring per cell
- **AND** the content inside it is drawn exactly as it would be without the hint

### Requirement: A hint mark is drawn on the cell's border

The ring and the outline SHALL be drawn on the space the cell's border already
occupies, the gutter between cells or the cell's own outermost pixels according
to the game's layout, so a mark costs the content no room and reads as a
highlight by color and not by weight. Where the border belongs to a game object
in its own right, a wall in Galaxies or Palisade, the mark SHALL be inset
inside the cell instead, so it cannot be read as that object.

#### Scenario: A mark never impersonates a game object

- **WHEN** a game draws its own objects on the cell border, a wall between two
  cells, say
- **THEN** the hint's marks are inset inside the cell instead, so that neither
  mark can be read as one of those objects

### Requirement: An evidence wash is kept only where nothing is drawn on it

An evidence area SHALL be drawn as a wash only where its cells carry no
content. The test is whether the fill would hide the premise, where hiding
includes making it unreadable by contrast and not only covering it. A game that
keeps a wash is asserting that nothing is drawn on it, and SHALL record that
reason where it names the role. A kept wash SHALL be tuned to be visible
against its board, and not to keep content legible through it.

#### Scenario: A wash is kept only where nothing is drawn on it

- **WHEN** a game keeps an evidence wash and not an outline
- **THEN** its evidence cells carry no content the player must read, and the game
  records that reason where it names the role
- **AND** the cross-game guard names that game explicitly, so a further game
  taking the same allowance fails until its reason is written down

### Requirement: The palette carries no fill for the acted-on color

The palette SHALL carry no fill counterpart to the acted-on color. A fill
behind content cannot be rescued by choosing a different color: a wash pale
enough to keep a pencil mark legible collides with the evidence wash, and the
only hues that clear it sit beside `ERROR_WASH`, which would make the cell a
hint points at resemble the cell that is wrong.

#### Scenario: A change proposes a retuned target fill

- **WHEN** a change proposes filling the acted-on cell in a retuned hint color
- **THEN** it is answered with this requirement, and the palette gains no fill
  for that role

### Requirement: An evidence mark on a border takes a bold step

Because a mark on a border is read against a surface and not through it, it
SHALL take a strong color and not a wash step. The evidence mark SHALL take a
step whose lightness differs between schemes (a `_BOLD`), so that it stands off
the board by a similar margin in each: a step at one lightness under both
schemes reads soft on a pale board and bright on a dark one.

#### Scenario: An outline is drawn in each scheme

- **WHEN** an evidence outline is drawn under the light scheme and under the
  dark one
- **THEN** its color is the bold step of its hue in each, dark on the light
  board and light on the dark one

### Requirement: The chain ordinal is the evidence role

The evidence color and the chain ordinal that indexes it SHALL be one role and
not two roles holding the same value. A number saying where a cell falls in an
ordered chain is an index into the evidence, and a name of its own would claim
the ordered cells were a different kind of premise from the unordered ones.

#### Scenario: A chain's cells are numbered

- **WHEN** a hint step numbers the cells of an ordered chain
- **THEN** the numerals take the evidence role's color, the one its outline
  takes

### Requirement: A mark outside the content box is driven by the drawstate

Where a mark lies outside the cell's content box, no tile owns those pixels, so
it SHALL be driven by the game's drawstate and not by its per-tile cache: a
mark that moves or is dismissed SHALL be erased explicitly, and a mark that
persists SHALL be repainted each frame, so a neighboring cell repainting for
its own reasons cannot clip it. A mark wholly inside the box needs no such
bookkeeping: the cell's own repaint undoes it, the hint overlay being part of
that cell's cache key.

#### Scenario: A mark outside the content box survives a neighbor's repaint

- **WHEN** a cell adjacent to a marked one repaints for its own reasons while the
  hint is still displayed
- **THEN** the mark is still whole on the next frame
- **AND** when the hint is dismissed or moves, the space it occupied is restored

### Requirement: The necessity-voice rule applies to every hinting game not ledgered as narrating moves

The cross-game narration guard SHALL derive the games subject to the
necessity-voice rule as every game that ships a `hint()`, minus a ledger of
games whose hints narrate moves and not deductions, each carrying its reason. A
game SHALL NOT have to be added to a list to be necessity-checked.

#### Scenario: A hinting game not named anywhere is necessity-checked

- **WHEN** a game ships a `hint()` and appears in no list
- **THEN** its narration is held to the necessity-voice rule

#### Scenario: Only a forced step is held to the necessity voice

- **WHEN** a deductive game's step is built with any relation but forced (a
  journey's later leg, a move narrated by its effect, one of several), or is
  declared `setup` or `bare`
- **THEN** the necessity-voice rule reads its form and does not require a modal
  of its own
- **AND** a forced step, and an `evident` one, is still required to carry
  necessity

### Requirement: A necessity idiom is a predicate over the step

An owner-endorsed per-game idiom, exempting narration that carries necessity in
its own words and not in a modal, SHALL be a predicate over the step and not
over its text alone, so an idiom belonging to one leg of a grouped journey can
say so and be held to it. An idiom SHALL be rejected for a game the necessity
rule does not apply to, where it does nothing. Words that any game
could reasonably write to make a necessity claim SHALL belong to the shared
vocabulary and not to a per-game idiom.

#### Scenario: An idiom scoped to a continuation leg does not excuse a lead leg

- **WHEN** an endorsed idiom is declared for a game's continuation legs and a
  lead leg is worded the same way
- **THEN** the lead leg is still required to carry necessity of its own

### Requirement: The midend reports where a displayed hint sits in its journey

When a hint step is on display, the midend SHALL report its position within the
journey it belongs to, and the journey's length, so the chrome can say "Step 2
of 3" while one deduction plays out over several moves. A journey is the run
the step on display belongs to: a first step plus every following step the game
flagged `continuesPrevious`. The midend SHALL derive it by walking back to the first
step of that run and forward to the last, and never from anything a game
declares for this purpose.

#### Scenario: A multi-leg deduction reports its progress

- **WHEN** a hint plan's steps 2 and 3 are flagged `continuesPrevious`
- **AND** the first step is displayed
- **THEN** the midend reports position 1 of 3
- **AND** after a move completes that step, position 2 of 3

### Requirement: A journey position is not the plan index

The reported position SHALL NOT be the index within the stored plan, which for
a plan-based game is the whole tour and says nothing about the hint the player
is looking at. A game that never groups its steps SHALL therefore report a
journey of length 1, for which the chrome shows nothing. The report SHALL be
absent when no step is displayed, so a stale position cannot sit beside a board
with no hint on it.

#### Scenario: A single-leg hint reports a journey of one

- **WHEN** the displayed step is flagged neither as a continuation nor followed
  by one
- **THEN** the journey length is 1, and the chrome shows no step counter

#### Scenario: No hint is displayed

- **WHEN** no hint step is on display
- **THEN** no journey position is reported at all

### Requirement: The hint walk SHALL cover every preset a game offers

The cross-game guarantee that following hints solves the board, from any
reached position, SHALL be asserted over every leaf preset of every hinting
game, not over one of them. The sweep SHALL carry a vacuity count of the preset
cases it walked. A preset added to a game's menu SHALL be walked from that
commit, with no line added anywhere to enroll it.

#### Scenario: A hint works on Easy and gives up on Hard

- **WHEN** a game's hint cannot walk a board dealt from a preset at a
  deduction-complete tier
- **THEN** the walk fails, naming the game, the preset and the position

#### Scenario: A game gains a preset

- **WHEN** a preset is added to a game's menu
- **THEN** it is walked from that commit, with no line added anywhere to enroll
  it

### Requirement: Deduction running out on a sound board SHALL have one wording

A hinting game that finds no move on a board which is sound, unsolved and free
of mistakes SHALL refuse with the collection's single constant for that
situation, and SHALL NOT invent a phrasing, alias the constant, or spell out
its value. The wording SHALL tell the player that the position is the tier's
expected end and what to do about it: a refusal that says only that nothing
follows leaves a player unable to tell a puzzle demanding a guess from a broken
hint.

#### Scenario: A player exhausts deduction on a search-permitting board

- **WHEN** a hint is asked on a sound, unsolved board dealt at a tier whose name
  promises search
- **THEN** the refusal is the single constant, and it says what the player can do

#### Scenario: A game invents a phrasing

- **WHEN** a game returns its own sentence for deduction having run out
- **THEN** the program does not typecheck, whether the sentence is written at
  the game's call site or inside a shared module

### Requirement: Deduction runs out only where the tier permits search

The deduction-exhausted refusal SHALL be shown to a player only where the
game's own tier declaration permits search. The permission SHALL be derived (a
tier named `Unreasonable` is the collection's promise that its boards can need
search) and never declared for a guard's benefit. The midend SHALL throw, and
show nothing, when a game returns the refusal on a board whose tier does not
permit search or in a game with no difficulty contract.

#### Scenario: A refusal escapes onto a deduction-complete tier

- **WHEN** a hint refuses on a board dealt at a tier that does not permit search
- **THEN** the walk fails: the defect is the refusal, not the wording

### Requirement: An untiered game's hint runs out only on a board that does not load

A hinting game with no difficulty contract MAY return the deduction-exhausted
refusal from `hint`, and its `finishesByDeduction` SHALL then refuse at load
every board on which it would (`engine-params`, "An untiered game says whether
deduction finishes a board"). The walk SHALL fail on the refusal from such a
game on a dealt board, and SHALL NOT skip the game.

#### Scenario: An untiered game's hint runs out on a pasted board

- **WHEN** a game ID names a board of an untiered game on which its hint would
  return the deduction-exhausted refusal from the opening
- **THEN** the board does not load, so no player is shown the refusal and the
  midend's throw is not reached

### Requirement: Sliding-permutation games share one slide planner whose exact search always runs

The engine SHALL provide a shared toroidal slide planner
(`src/engine/slide-planner.ts`) that every sliding-permutation game's `hint`
uses, and no such game SHALL carry its own copy of the search. The planner
SHALL own the parts that are hard and game-independent: a heuristic forward
search over slide moves, and an exact bidirectional search that returns a
shortest path.

#### Scenario: A second sliding game reuses the planner

- **WHEN** a sliding-permutation game other than Sixteen implements `hint`
- **THEN** it supplies its own legal moves, distance measure, goal test and
  narration, and reuses the shared search and does not re-implement it

#### Scenario: The exact search returns a shortest plan

- **WHEN** the exact search reaches the goal
- **THEN** the plan it returns is a shortest sequence of moves to it, so that
  playing its first move leaves the board strictly nearer the goal

### Requirement: The slide planner returns a partial plan when it falls short

When its search improves on the starting board without reaching the goal, the
planner SHALL return a partial plan: the plan runs out, the player is closer,
and the next request recomputes.

#### Scenario: A search that cannot reach the goal still helps

- **WHEN** the forward search improves on the starting board but exhausts its
  budget before reaching the goal
- **THEN** the planner returns the partial plan to its best board, and does not
  fail

### Requirement: The slide planner works on the board as the player sees it

The planner SHALL work on the board as the player sees it, one integer per cell
whose meaning is the game's, and SHALL NOT distinguish two boards that look
alike. A target that tells identical pieces apart (Netslide's wire masks) can
be one no sequence of slides produces while the finished picture is a move
away.

#### Scenario: Two pieces that look alike are swapped

- **WHEN** a board differs from the finished one only in which of two identical
  pieces sits where
- **THEN** the planner treats it as the finished board

### Requirement: The slide planner is parameterized on what differs between games

The planner SHALL be parameterized on what differs between games: the grid, the
legal move set (including whether a slide may cover more than one step), the
finished board, the goal test, and how far from finished a board is. It SHALL
contain no game-specific narration or rendering.

#### Scenario: A game's win condition is weaker than matching one board

- **WHEN** a game wins on any arrangement meeting its condition, and not only
  on the one its generator drew
- **THEN** it supplies its own goal test, and the planner stops when that holds

### Requirement: The slide planner's exact search runs on every board

The exact search SHALL run on every board, before the heuristic search. A game
SHALL supply only its budget and never a condition under which the search runs,
and a game that cannot afford the search SHALL omit it entirely: there is no
third option. A gate keyed on any cheap board measure cycles, because a
shortest plan does not look like progress on the way home.

#### Scenario: The exact search is not held back for the boards that need it

- **WHEN** a game configures the exact search
- **THEN** it runs on every board the game hints on, with no condition available
  for the game to attach to it

### Requirement: An exact-search budget is the smallest that crosses the worst endgame

A game's exact-search budget SHALL be the smallest that still crosses its worst
endgame and not the largest it can afford, because a search on a board too far
away to reach spends its whole budget and comes back empty.

#### Scenario: A board is too far away for the exact search

- **WHEN** the exact search is run on a board beyond its budget
- **THEN** it comes back empty having spent the budget, and the heuristic search
  answers

### Requirement: The slide planner SHALL carry a last resort bounded by depth rather than by memory

The shared slide planner SHALL offer a second exact search for the boards its
state-bounded search cannot reach, bounded by depth and not by stored states: a
breadth-first endgame database of every board within a given number of slides
of the goal, kept between hints because it depends only on the goal and the
move set, and a depth-first walk from the board that slides a line in place and
slides it back, holding one board however deep it goes.

#### Scenario: A board past the state-bounded search still gets a plan

- **WHEN** a hint is asked on a board beyond the reach of the planner's
  state-bounded search, where the heuristic search is also at a strict local
  minimum
- **THEN** the deep search returns a shortest plan within its declared depths,
  and the planner does not return nothing

#### Scenario: The two exact searches agree

- **WHEN** the same board is planned by the state-bounded search and by the deep
  search, both within reach
- **THEN** they return plans of the same length, each reaching the goal

### Requirement: The deep search reaches one ply past the ungated search

A game SHALL declare only the deep search's two depths, never a condition under
which it runs. The deep search SHALL reach at most one ply further than the
ungated search. A plan it opens is then at most one move longer than the
ungated search can finish, so playing that plan's first move leaves a board the
ungated search handles, on every board.

#### Scenario: Following the deep search's plan converges

- **WHEN** a plan from the deep search is followed one move at a time, with a
  fresh plan computed after each move
- **THEN** each plan is strictly shorter than the last, and the walk reaches the
  goal

### Requirement: The endgame database's completeness is asserted directly

The database's completeness SHALL be asserted directly, not inferred from the
search's answers: an index that narrows its key returns "no plan" on boards it
holds and reads exactly like a search that cannot reach far enough. An
end-to-end agreement check at test-sized depths SHALL NOT be taken as that
assertion, because losing half of a small database changes no answer.

#### Scenario: The database is asked whether it holds a board it must hold

- **WHEN** the deep search is configured to walk no plies at all, and asked about
  a board fewer slides from the goal than its database is deep
- **THEN** it returns a plan for that board, because the database holds every
  such board and can match it

### Requirement: A hint that plans by searching SHALL refuse honestly past its reach

A `hint()` that plans by searching ahead a bounded number of moves, and not by
deducing, SHALL refuse with the collection's single constant for a search out
of reach, and SHALL NOT use the refusal that says no move would get the player
closer. That sentence is a claim about the board, and a game SHALL make it only
where it has established it: a bounded search returning empty has established
nothing about the board, only about itself.

#### Scenario: A searching hint runs out of reach

- **WHEN** a game whose hint plans by searching finds no plan on a sound,
  unsolved board
- **THEN** the refusal is the collection's constant for a search out of reach,
  and the walk accepts it as an honest end

#### Scenario: A searching hint uses the board-claiming refusal instead

- **WHEN** such a game refuses with the message that no move would get the player
  closer
- **THEN** the walk fails, because that sentence asserts something the search
  never checked

### Requirement: The search refusal names what still works

The wording for a search out of reach SHALL name what still works from such a
position and not only report the failure, and SHALL NOT name a control that
will fail for the same reason the hint just did: continuous hinting refuses
wherever a single hint refuses, so pointing at it is advice that cannot work.

#### Scenario: The player reads the search refusal

- **WHEN** a searching hint refuses past its reach
- **THEN** the sentence tells the player to play on and ask again, or to take
  the answer from the solution, and does not point at continuous hinting

### Requirement: Only a searching hint is excused the walk's promise

The collection's strongest hint guarantee, that a hint never gives up on a
solvable board, SHALL be relaxed for the games whose hint has a reach and for
no other. A deductive game can meet it: its deduction is complete for the tier,
or the tier's own name promises that search can be needed. A searching game
passes the walk on the seeds it is given, and where it goes red on a new one
the guard is reporting the truth and not a regression.

#### Scenario: A deductive hint gives up on a deduction-complete board

- **WHEN** a game with no reach refuses on a sound board whose tier does not
  permit search
- **THEN** the walk fails, because the relaxation covers only the searching
  games

### Requirement: A plan steered by a measure SHALL be steered by one measure

Where a `hint()` plans by searching under a heuristic measure of the board,
exactly one such measure SHALL be in play on every board. A game SHALL NOT
apply a second, sharper measure only where the first is helpless: a plan is
recomputed after every move the player makes, so a measure that changes between
recomputes ping-pongs exactly as two plans do.

#### Scenario: A sharper measure is armed only where the blunt one is stuck

- **WHEN** a game's hint measures a board one way normally and another way where
  the first way is helpless
- **THEN** the resume walk fails to converge, because consecutive recomputes
  steer by different measures

### Requirement: A sharpened measure is checked against every gate that reads it

Sharpening a measure SHALL be checked against every gate that reads it: a
search gated on the fallback finding nothing better than standing still is
gated on a statement about the measure, so a sharper measure silently changes
which boards reach it. A sharpened measure SHALL therefore differ from the
blunt one only where the searches above it cannot help anyway, so that every
board they own is measured exactly as before.

#### Scenario: A sharpened measure disarms a gate that read it

- **WHEN** a measure is sharpened and a search is gated on that measure finding
  no improvement
- **THEN** the gate stops opening, and the boards it owned lose the plans it gave
  them, so the sharpening is confined to boards past that search's reach

### Requirement: Hint narration SHALL NOT use an em-dash

Player-facing hint text SHALL NOT contain U+2014, in a game's own narration or
in the shared narration and refusal wording the engine writes on a game's
behalf. A comma, a semicolon, a colon, a sentence break or a parenthetical
aside SHALL be used instead. The en-dash (U+2013) SHALL NOT be swept up with
it, because it is used as notation and not as punctuation: a domino written
`3–5` is a name, not a connective.

#### Scenario: A game's narration adds an em-dash

- **WHEN** a hinting game's source writes an em-dash in a narration string
- **THEN** the cross-game narration guard fails, naming the game and the line

#### Scenario: A domino label keeps its en-dash

- **WHEN** a game writes a value such as `3–5` with an en-dash
- **THEN** the guard does not fire, because only U+2014 is retired

### Requirement: Removing an em-dash keeps the sentence's substance

The em-dash rule is about the punctuation only. A rewrite SHALL preserve the
step's arc from indication through reasoning to conclusion, and its necessity
modal. Removing a clause to remove the dash SHALL be a violation of the
narration-quality bar, not a way of satisfying this rule.

#### Scenario: A sentence loses its dash

- **WHEN** a narration that set its reasoning off with an em-dash is rewritten
- **THEN** the reasoning is still in the sentence, joined by other punctuation

### Requirement: A hint SHALL show only steps the player's board does not already decide

A deductive hint SHALL NOT show a step whose every change the player's board
already decides. The shared plan loop (`deduceHintPlan`) SHALL provide the
mechanism, as an optional `showable(board, firing)` judgment the game supplies.
A firing that is not showable SHALL still advance the plan's working board,
since later firings can rest on it, and SHALL NOT become a step.

#### Scenario: A redundant deduction is never a step

- **WHEN** a deduction's every change is one the player's board already decides:
  Tracks' "a finished piece's other two sides are blocked", beside squares the
  player has marked empty
- **THEN** the plan applies it to its working board and shows no step for it

### Requirement: Hidden firings spend the step budget and not the plan cap

The plan cap SHALL count shown steps only, so hidden firings can never turn a
plan into a refusal. The loop SHALL report how many firings it hid, and SHALL
tick its step budget for hidden firings as for shown ones.

#### Scenario: Hidden firings do not spend the plan cap

- **WHEN** several hidden firings precede the next showable one and the plan cap
  is one step
- **THEN** the plan holds that showable step, and reports the hidden ones as a
  count

#### Scenario: A hidden firing that changes nothing still terminates

- **WHEN** a firing is hidden but changes nothing, so the loop would ask for it
  again for ever
- **THEN** the step budget throws, exactly as it does for a shown one

### Requirement: What is evident is the game's judgment, held to move legality

What is evident SHALL be the game's to judge, since it depends on what that
game draws. The judgment SHALL hide only conclusions the player's board already
shows, and SHALL NOT hide a change the win condition needs. Where a game
derives it from move legality (the game would refuse the move, Galaxies, or
its contrary, Tracks), that derivation SHALL be judged on the board
before the firing, and a game that declares which rules are evident SHALL hold
the declaration to such a derivation in a test.

#### Scenario: A change the win condition needs

- **WHEN** a firing makes a change the board must hold to be solved, and the
  player's board does not yet show it
- **THEN** the game's judgment calls the firing showable

### Requirement: A game's hint sentences SHALL live in one text module per game

Every game whose hint speaks SHALL keep every sentence it speaks, and every
word inside one, in `src/games/<id>/hint-text.ts`, exported as `say`. Sentences
several games speak word for word SHALL live in `src/engine/hint-text.ts`. A
hint that speaks no words has no text module. Refusal messages are outside this
requirement: they are held to one list by `src/engine/hint-refusal.ts` and its
guard.

#### Scenario: Rewording a sentence

- **WHEN** a sentence's wording changes
- **THEN** the change touches the game's `hint-text.ts`, or the engine's for a
  sentence several games share, and not the code that decides which sentence
  fires

### Requirement: A game's narration chooses the sentence and passes values

A game's narration SHALL decide only which sentence a step speaks and with what
values. It SHALL pass values as the board means them (counts, axes, directions,
the deduction's own record) and never words, and a text module SHALL NOT read
the board.

#### Scenario: A sentence needs a plural

- **WHEN** a sentence reads differently for one square and for several
- **THEN** the narration passes the count, and the text module chooses the word

### Requirement: Hint narration SHALL be short enough to read at a glance

Every hint step's narration SHALL be at most 120 characters. The check SHALL
cover every hinting game at every tier and on every preset, since a mode a
preset selects can speak sentences no tier reaches, and SHALL walk each board's
plans into the middle of the game and not read only the opening plan, because
the sentences that need room are the ones spoken once more of the board is
decided. That much SHALL run on every commit.

#### Scenario: A long sentence without a ledger entry fails

- **WHEN** a hint step's narration is longer than 120 characters and no ledger
  entry for its game lists its rung
- **THEN** the check fails, naming the sentence, its rung and its length
- **AND** it does so on the per-commit path, not only on push

### Requirement: The length check also walks the last preset at the hardest teachable tier

The check SHALL also cover each tiered game's last preset at its hardest
teachable tier, the corner of presets and tiers a player reaches through the
Custom dialog. A tier the game declares as a search tier is
excluded, because a hint refuses where a guess is needed. This rule SHALL be
scoped by role under the `build-pipeline` conditions for deferring an assertion
to the push-time backstop: off in the automatic per-commit hook, and running in
CI on every push and in a manual `npm run gate`.

#### Scenario: A long sentence is spoken only in the corner

- **WHEN** a sentence over the limit is spoken only on a game's last preset at
  its hardest teachable tier
- **THEN** the check fails in CI on the push and in a manual `npm run gate`,
  and the automatic per-commit hook does not walk that corner

### Requirement: A long sentence is excused only by a ledger listing of its rung

A step SHALL exceed the limit only when a ledger entry lists its rung
(`HintStep.rung`) for its game, with the reason that rung's sentences need the
room. An entry SHALL name rungs by id and SHALL NOT match a step's sentence, so
that rewording a sentence cannot take it out of its listing unseen. Every rung
an entry lists SHALL be one its games declare. A ledgered sentence SHALL still
be at most 300 characters.

#### Scenario: A ledgered sentence still has a ceiling

- **WHEN** a ledgered sentence grows past 300 characters
- **THEN** the check fails, ledger or not

#### Scenario: A reworded sentence keeps its listing

- **WHEN** a ledgered rung's sentence is reworded and stays over the limit
- **THEN** its listing still excuses it, with no edit to the ledger

#### Scenario: A listing for a rung the game does not have

- **WHEN** a ledger entry lists a rung that one of its games does not declare
- **THEN** the check fails on every commit, naming the game and the rung

### Requirement: The narration ledger is asserted both ways, per listing

The ledger SHALL be asserted in both directions, and the unit of both
directions SHALL be the `(entry, game, rung)` listing and not the entry. A step
over the limit whose rung no entry listing its game names SHALL fail, and a
listing whose rung its game never speaks over the limit SHALL fail. A sentence
brought under the limit therefore takes its listing with it, and so does a game
that stops speaking a shared rung at length.

#### Scenario: A ledger entry that no longer matches anything long fails

- **WHEN** a ledgered rung's sentences are shortened under 120 characters, or
  the rung stops being spoken
- **THEN** the check fails until the listing is deleted

#### Scenario: A game listed on a shared sentence it never speaks fails

- **WHEN** a ledger entry names several games and one of them never speaks the
  rung over the limit, while the others do
- **THEN** the check fails naming that game and that entry, and does not pass
  on the strength of the games that do speak it

### Requirement: A Hint press in flight is dropped, and a slow one says it is thinking

While a Hint press is being answered by the worker, a further press SHALL be
dropped, not queued; nothing else in the app queues behind a hint either. The
show and apply rhythm SHALL be exactly as it would be had the dropped presses
never happened, in both beats: during a show nothing is armed yet, and during
an apply the step was disarmed on the way in. A show whose answer lands after
Auto-Hint has started SHALL NOT arm the apply behind it: Auto-Hint owns
the plan from the moment it starts.

#### Scenario: Presses during a slow hint are dropped, and the rhythm survives

- **WHEN** the player presses Hint three times while the first press is still
  being answered
- **THEN** exactly one request reaches the worker, and the press after it
  lands applies the step that press showed

### Requirement: A slow Hint press says it is thinking

A press unanswered after a short delay (`HINT_PENDING_MS`, 300 ms) SHALL be
visible as work in progress: the Hint control's label and the hint banner SHALL
both say "Thinking…" until the answer lands. The delay exists so an ordinary
hint never flickers. When the answer lands, the label SHALL revert to the beat
the next press will take, and the banner SHALL show the answer's own message (a
refusal, "Hint applied") or be cleared if the show succeeded.

#### Scenario: A slow hint is labeled

- **WHEN** a Hint press has gone unanswered for `HINT_PENDING_MS`
- **THEN** the Hint control reads "Thinking…" and the banner says the same,
  and both revert when the answer lands

#### Scenario: A fast hint is never labeled

- **WHEN** a Hint press is answered within `HINT_PENDING_MS`
- **THEN** neither the control nor the banner ever says "Thinking…"

#### Scenario: A late answer's own message wins

- **WHEN** a hint that was labeled "Thinking…" lands as a refusal
- **THEN** the banner shows the refusal, not an empty banner

### Requirement: A slow hint is not cancellable

A slow hint SHALL NOT be cancellable. The search runs synchronously inside the
worker, so an interrupt would need every game's search to poll a flag; making
the wait legible is the whole remedy.

#### Scenario: A hint takes seconds to compute

- **WHEN** a hint's search runs for seconds
- **THEN** the app labels the wait and offers no control that interrupts the
  search

### Requirement: A hint step always names a technique, with no un-narrated fallback

A displayed hint step SHALL always explain why its move is forced by a named
technique. A game's hint SHALL NOT emit a generic, unexplained fallback step
("only one arrangement fits") for a deduction its technique set does not cover.

#### Scenario: A logic game's hint never shows an unexplained step

- **WHEN** a hint plan is computed for any board of a deductive game
- **THEN** every step names the technique that forces it (its explanation is not a
  generic "only one arrangement fits" placeholder)

### Requirement: A game narrates every deduction or rejects the board at generation

A game SHALL meet the technique rule by one of two strategies. It narrates
every deduction its generator accepts, promoting any catch-all into an honest
technique, however non-local or tedious, as Filling narrates its global
candidate elimination. Or it rejects at generation the boards whose solution
needs a deduction it cannot narrate (the `engine-difficulty` narratable-deduction
generation policy, to which this is the hint system's companion).

#### Scenario: A solver has a catch-all rung

- **WHEN** a game's generator accepts boards that need a deduction its hint has
  no technique for
- **THEN** the game either narrates that deduction as a technique of its own,
  or stops generating such boards

### Requirement: Movement and strategic hints are outside the technique rule

The technique rule governs deductive (logic) games. A movement or objective
game whose hint is heuristic or an `aux` walk carries an intentionally empty or
imperative explanation and is exempt. A game whose hint is strategic and not
deductive (a stable subgoal plus the next move serving it, justified by a
monotone potential and not by force) is outside the Check, Tactic and Search
classification entirely and SHALL narrate imperatively.

#### Scenario: A movement game's hint is exempt

- **WHEN** a movement/objective game (no deductive "why") returns a hint
- **THEN** an empty or imperative explanation is permitted and is not a violation

### Requirement: A hypothesis is classified as Check, Tactic or Search

A deduction that reaches its conclusion through a hypothesis SHALL be
classified by whether its reasoning is a bounded run of individually glanceable
steps. A Check is a contradiction visible at the placement, with no
propagation: ordinary deduction, narratable at any tier. A Tactic is a bounded
chain of forced consequences to a named endpoint, permitted at a tier not named
`Unreasonable`. A Search runs the whole solver from a hypothesis, or branches
and backtracks.

#### Scenario: A trial that propagates is not thereby a Search

- **WHEN** a technique tries a value and follows its forced consequences
- **THEN** it is classified by whether that propagation is bounded and can be
  laid out for the player, not by whether a trial propagates nor by the
  technique being called "forcing"

### Requirement: A Tactic's chain is shown on the board

A Tactic's hint SHALL show the chain on the board: every link marked, in the
order it falls, with both ends anchored (the hypothesis and the contradiction).
It SHALL NOT compress the chain into a single claim the player can only check
by redoing the deduction. A Tactic SHALL NOT be required to advance one leg at
a time: the player holds the hypothesis in mind and walks the marked chain at
their own pace.

#### Scenario: A bounded chain is walked, not asserted

- **WHEN** a hint's next deduction is a bounded chain of forced consequences
  reaching a named contradiction
- **THEN** every link is marked on the board in the order it falls, with the
  hypothesis and the contradiction both anchored, and the narration is not one
  sentence asserting the conclusion
- **AND** the player walks it on the board at their own pace; the hint is not
  required to advance one link per step

### Requirement: A Tactic's narration names the ends, the links and the rule

A Tactic's narration SHALL name the two ends of its chain and cite the links by
their position, and SHALL supply the rule that propagates the chain, which is
the technique being taught and is nowhere on the board. Where the conclusion
rests on more than one branch of a case split, the narration SHALL say so: a
conclusion that does not follow from its own stated premises is a defect.

#### Scenario: A chain's conclusion rests on a case split

- **WHEN** a narrated chain's conclusion follows only because both branches of
  a case split lead to it
- **THEN** the narration names the two ends, cites the links by position,
  states the rule that propagates them, and states both branches

### Requirement: A chain's order is declared and drawn as an ordinal

A game SHALL declare each chain link's position as data its renderer reads, and
that position SHALL reach the canvas. The order is not the marks' array
position, and a set of marked cells with no order is not a chain. The order
SHALL be drawn as an ordinal and not as a path: a line or arrow between
consecutive links asserts that each forces the next, which is false of some
chains, and one mark means one thing across the collection.

#### Scenario: A declared chain order reaches the canvas

- **WHEN** a hint step declares a position for each link of a chain
- **THEN** those positions are exactly `1..n`, and the frame drawn for that step
  paints every one of them in the ordinal's own color
- **AND** the check is made against the resolved color and not a palette
  index or the bare glyph, since a candidate game already prints those digits as
  pencil marks

### Requirement: A Search is refused and never narrated

A hint SHALL NOT report a Search's survivor as a deduction on any tier. It
SHALL refuse, and the refusal SHALL say that deduction has run out and SHALL
NOT read as a failure.

#### Scenario: Deduction running out is refused, not guessed past

- **WHEN** the only remaining progress on a board needs a value assumed and the
  whole solver run from it, or a branch explored and backtracked
- **THEN** the hint refuses with a message saying deduction has run out, and
  does not present the surviving assumption as a technique

### Requirement: A search certifies a position and never teaches one

Running the trial to certify a position, to establish that no value the player
has already entered is wrong, which some hints require before offering any
step, is not narrating it. The plan SHALL record only the deductions it teaches,
and SHALL stop recording at the first point the trial is needed, while the walk
that produces the verdict continues.

#### Scenario: A search may certify a position but never teach one

- **WHEN** a game's hint must first establish that the player's board is still
  consistent with the unique solution, and doing so needs the propagating trial
- **THEN** the trial runs to produce that verdict, and the plan the player is
  shown contains only the steps up to the first point the trial was needed

### Requirement: A rung is classified by the bound it guarantees

A rung SHALL be classified by the bound it guarantees, not by the depth it
typically reaches: two rungs can be the same function invoked with different
limits and still fall on opposite sides of the line. Where a game gates a rung
on such a bound, that bound SHALL be defined once and documented as
load-bearing for the tier's name and not as a performance dial.

#### Scenario: Two strengths of one rung are classified separately

- **WHEN** a game applies the same trial function at two tiers, bounding the
  hypothesis' consequences at one and leaving them unbounded at the other
- **THEN** the bounded one is a Tactic and the unbounded one a Search, whatever
  their measured distributions look like on typical boards

### Requirement: Two rungs with one narration are told apart structurally

Where two rungs differ in their bound but produce the same narration, so that a
wording check cannot tell them apart, the guarantee that the hint reaches only
the permitted one SHALL be structural and asserted directly (for instance, that
planning at the harder tier yields the same plan as planning at the permitted
one), with a control that prevents the assertion holding vacuously.

#### Scenario: A bounded and an unbounded trial produce the same words

- **WHEN** a game's bounded and unbounded trial rungs narrate identically
- **THEN** the game asserts structurally that its hint reaches only the bounded
  one

### Requirement: A narration identifies every element it refers to

Where a deductive game's displayed step marks more than one element, its narration
SHALL NOT refer to the acted-on element by a bare deictic alone ("this cell",
"this square", "here"). It SHALL tie the acted-on element to the others by a
relation, by a value or other concrete identifier the player can read off the
board, by a role word tied to the mark's shape where the game's other marks
use distinct ones, or, where the step marks an ordered chain, by the numbers on
the other marks.

#### Scenario: A step showing two marks says which one it is acting on

- **WHEN** a displayed hint step marks both the cell it acts on and a second
  element it reasons from
- **THEN** its narration ties the two together, by a relation the code
  guarantees, by a concrete value, or by distinct role words, and does not
  refer to the acted-on cell as "this cell" alone

### Requirement: A step with one mark keeps its bare deictic

Where a step marks exactly one element, a bare deictic is correct and a
qualifier is noise: the narration SHALL NOT be required to add one.

#### Scenario: A single-mark step keeps its bare deictic

- **WHEN** a displayed hint step marks only the cell it acts on
- **THEN** "this cell" is sufficient and no disambiguating phrase is required

### Requirement: A tie a narration states is one the code guarantees

A relation a narration uses to tie two marks ("its ringed neighbor", "the
shaded brick above", "the end of the shaded run") SHALL be one the code
guarantees: a relation asserted in prose and not enforced in code is a false
claim. Where a step marks an ordered chain, the narration SHALL name the
numbered elements by their position and keep the bare deictic for the one
carrying no number.

#### Scenario: A chain step says "this cell"

- **WHEN** a step numbers the cells of a chain and rings the cell it acts on
- **THEN** the narration names the chain's cells by their numbers, and "this
  cell" is the one carrying no number

### Requirement: A narration never identifies an element by its color

A narration SHALL NOT identify an element by its color. The palette is
scheme-relative, so a hue named in prose is wrong under the other scheme, and
the sentence is unreadable to a color-blind player. This SHALL hold even where
a game's marks differ only by hue: there the marks need fixing, not the
sentence.

#### Scenario: The tie is never a color name

- **WHEN** a narration must distinguish the acted-on element from another mark
- **THEN** it does so without naming either element's color, so the sentence
  stays true under both color schemes and to a reader who cannot distinguish
  the hues

### Requirement: A note a hint asks for is placed beside the step that uses it

Where a hint plan asks the player to record a fact as a note, and the note's
own explanation asserts only what stays true as the board fills, that note
SHALL be placed immediately before the step whose reasoning rests on it, and
not at the point the solver happened to discover the fact.

#### Scenario: a fact found long before it is used

- **WHEN** a plan's step rests on a fact its solver derived many steps earlier, and the
  note's explanation asserts only what stays true as the board fills
- **THEN** the note placing that fact is offered immediately before that step, not at
  the point it was derived

### Requirement: A note is never offered with a false explanation

Where a note's explanation asserts something the board can stop satisfying,
such as which of a clue's edges are still open, the note SHALL be placed at the
latest position its explanation still describes, which is beside its consumer
whenever the board allows. A plan SHALL NOT offer a note whose explanation is
false of the board it is shown on, and the placement rule is bounded by that.

#### Scenario: an explanation the board outgrows

- **WHEN** a note's explanation names which of a clue's or a dot's edges are still
  open, and further edges are settled before the step that cites the note
- **THEN** the note is not moved to its consumer, and is offered at a position its
  explanation still describes, and not beside its consumer carrying a stale claim

### Requirement: Notes placed together are split into their derivations

A journey SHALL be one deduction: the notes placed together SHALL be split into
the separate derivations they make, each its own journey, and a note SHALL NOT
be part of the journey of a step that does not rest on it.

#### Scenario: a step resting on two separate derivations

- **WHEN** a step rests on notes that come from two derivations, neither citing the
  other
- **THEN** each derivation is offered as its own journey, and the step follows them
  as a journey of its own and not as the last leg of either

#### Scenario: a step resting on one derivation

- **WHEN** every note a step needs placed comes from one derivation
- **THEN** the notes and the step are one journey, the step its last leg

### Requirement: A hint relies only on marks the player can make

A game's `hint()` SHALL rest every step on facts the player can see on the board or
record there with the game's own input. Where a tier's deductions need a kind of
mark the game does not offer, the game SHALL offer that mark to the player, and the
hint's steps SHALL place it as a move. A hint SHALL NOT draw, as a hint-only
overlay, a fact the player has no way to record.

#### Scenario: A deduction rests on a fact the player cannot mark

- **WHEN** a game's hint would rest a step on a fact its solver derived and the
  player has no input to record
- **THEN** the game is not conforming until it gives the player a mark for that fact
  and the hint places the mark as a move

#### Scenario: Every premise of a step is the player's own

- **WHEN** a step of any hinting game is displayed
- **THEN** every premise its sentence names is a clue, an entry the player placed,
  or a mark the player can make

### Requirement: A hint hatches the one line its sentence names

A hint step whose sentence names exactly one row or column as the line it
reasons about ("in this row", "this column's run") SHALL hatch that line, and
the clue slot at its end where the game draws one, and SHALL hatch nothing when
its sentence names no line or several. It SHALL NOT also outline that line: an
outline marks the particular cells a reason rests on. Every step that carries a
line to hatch SHALL draw the hatch, and no other step SHALL draw one.

#### Scenario: Every hinting game draws exactly the hatches its steps name

- **WHEN** any hinting game's plan is walked and each step drawn on a full
  repaint
- **THEN** a step naming a line draws hatch operations, and a step naming none
  draws no hatch

### Requirement: The row/column candidate preset hatches a hidden single's line

The row/column candidate preset SHALL hatch a hidden single's line.

#### Scenario: A hidden single hatches its line and outlines nothing

- **WHEN** a row/column candidate game's plan places a hidden single ("Every
  other cell in this row rules out 3, so this cell must be 3")
- **THEN** the step hatches exactly the cells of that row and its evidence
  outline is empty

### Requirement: A hint names no row or column by a number the board does not draw

A hint step's sentence SHALL NOT name a row or column by a number ("row 3",
"Column 2"), because no board in the collection draws line numbers. It SHALL
name the line it reasons about as "this row" or "this column" over that line's
hatch, a line it cites beside that one by where it lies or by its mark ("the
striped row", "the column beside it"), and a square it sends a piece to by the
mark on that square ("the outlined square", "the dashed square").

#### Scenario: Every hinting game's narration is free of line numbers

- **WHEN** any hinting game's plan is walked across its tiers and presets
- **THEN** no step's explanation contains a row or column followed by a number

### Requirement: A hint hatches the region its sentence is about

A hint step whose sentence names a region as its subject ("this cage", "this
block", "this area", "the striped region of 5") SHALL hatch that region as it
hatches a named line, and SHALL NOT also outline it; its outline SHALL keep to
the particular cells the reason rests on. A sentence that names a region by its
mark SHALL name it by its stripes.

#### Scenario: A cage deduction hatches its cage

- **WHEN** a Keen step reasons that no way to fill a cage puts a number in a cell
- **THEN** the step hatches exactly that cage's cells and outlines none of them

### Requirement: A preference change drops the stored hint plan

A hint plan is built from the board and the game's preferences, so when the player
changes a preference while the midend holds a plan, the midend SHALL drop that plan and
clear any displayed step, and the next hint SHALL be built under the new values.

#### Scenario: Switching how hints pencil in takes effect on the next hint

- **WHEN** the player has applied a hint step built under "Only as needed" and then
  chooses "Every candidate first"
- **THEN** the displayed hint is cleared, and the next hint opens with the populate
  reading's setup and does not continue the old plan

### Requirement: A piece a hint acts on is ringed as one shape

Where a hint step acts on a piece spanning several squares (a domino it places,
a domino it decides whole), the target mark SHALL be one ring around the piece,
drawing a side only where the square across it is not in the same piece, and
not a ring per square with a double bar across the piece's middle.

#### Scenario: A domino placement is one ring

- **WHEN** a Dominosa hint step asks the player to place a domino
- **THEN** the target mark is one ring of six sides around its two squares
- **AND** a barrier step's two squares are still ringed one each, with the wall
  between them marked

#### Scenario: A domino decided whole is one ring

- **WHEN** a Magnets hint step decides a whole domino (neutral, or marked `?`)
- **THEN** the target mark is one ring of six sides around both ends, drawn by
  the shared painter and not by a pass of the game's own

### Requirement: The shared painter joins a piece from the game's relation

The shared hint-mark painter SHALL own the drawing, and a game SHALL supply
only which squares belong together: a relation for the targets, and optionally
one for the evidence when the evidence is whole pieces, so that two pieces side
by side stay two shapes and not one that is not on the board. Without a
relation, targets SHALL be ringed per square and evidence SHALL be outlined as
one contour per connected region, exactly as for a game with no pieces.

#### Scenario: A game with no pieces is unchanged

- **WHEN** a game supplies no piece relation
- **THEN** each target square is ringed on all four sides and a contiguous
  evidence region is one contour

### Requirement: A joined mark inside the content box keys its repaint on its sides

Because a join lets a square's sides change while its role does not, a game
whose mark lies inside the content box and that supplies a relation SHALL key
each square's repaint on the sides drawn around it and not on its role alone.

#### Scenario: A square's sides change while its role stays

- **WHEN** a square stays a target from one frame to the next while the piece
  it is joined into changes, so a side drawn around it comes or goes
- **THEN** the square repaints

### Requirement: The engine SHALL own the hint mark roles and the words for them

The engine SHALL define the roles a hint mark plays, each with one meaning in
every game: a ring marks what the step decides, an outline marks what the step
reasons from, and stripes mark the line or region the sentence names. The
engine SHALL own each role's noun and adjective ("ringed", "outlined",
"striped"). A game SHALL add a role only when none of the three fits, and the
change adding it SHALL say why.

#### Scenario: A literal says a mark's word

- **WHEN** a hint sentence is built with a literal "this", "these", a role's
  adjective, or a retired mark word ("hatched", "highlighted") outside a
  reference to a mark
- **THEN** building the sentence throws, naming the word

#### Scenario: A reference uses another role's word

- **WHEN** a reference to a ring says "the striped row"
- **THEN** building the sentence throws, because the words and the mark disagree

#### Scenario: A shading genre says its rules' word

- **WHEN** a hint sentence in a game whose rules shade cells says a cell "must
  be shaded"
- **THEN** the sentence builds, because "shaded" is the cell's state there and
  not a mark's word

### Requirement: A mark is drawn on an element of a kind

A mark is drawn on an element of a kind: a cell, a note, an edge, or a game's
own such as Signpost's arrow. A kind SHALL key its elements so that two names
for one element compare equal, and SHALL say what a noun about them counts, so
"this cage" stays singular over its cells. An element drawn inside another (a
note in its cell) SHALL mark and name that one with it. The glyph a role takes
on a kind remains the game's.

#### Scenario: A sentence names a cage of several cells

- **WHEN** a step's words refer to one cage through its cells
- **THEN** the sentence says "this cage", in the singular

### Requirement: A recolored clue is an outline reference

A clue drawn recolored is a glyph for a role, not a role of its own: a clue the
step reasons from SHALL be an outline reference, whatever color the game paints
it.

#### Scenario: A step reasons from a clue the game recolors

- **WHEN** a game paints a clue a step reasons from in a hint color
- **THEN** the step's words refer to that clue as outlined

### Requirement: A bound hint step's words SHALL name exactly the marks it draws

A game that declares the `hintMarks` section of its contract, what each role
marks in that game, is bound. Every hint step of a bound game SHALL carry its
sentence as words built from references to marks, with the explanation equal to
their text. A bound game's renderer SHALL paint every hint mark from the step's
words, by role and kind (`stepMarks`), and from nothing else: a highlight field
SHALL carry only data that is not a mark, painted only where a named mark is.

#### Scenario: A step draws a mark its words never name

- **WHEN** a bound game's step rings an edge its sentence does not name
- **THEN** the walk fails, naming the step and the unnamed mark

#### Scenario: A renderer still paints a mark from a highlight field

- **WHEN** a bound game's renderer outlines squares listed in its highlights
  and not the squares its words outline
- **THEN** the walk fails, because the frame with every reference removed still
  shows the outline

### Requirement: The binding walk holds every step's frame to its words

For every step of a bound game, measured on the frame its renderer paints from
a fresh draw state: removing any one element the words name from them SHALL
change the frame, removing every reference SHALL leave the frame the game
paints with no hint shown, and every role the words name SHALL be listed in the
game's legend. The hint-quality walk SHALL check this on every step it visits,
through whole games and under each candidate reading a game offers, and on each
step as a refresh returns it.

#### Scenario: The words name a mark the renderer does not paint

- **WHEN** a bound game's words call a square outlined and its renderer paints
  no outline there, because a ring wins that square
- **THEN** the walk fails, naming the outline as not drawn, because removing it
  from the words leaves the frame unchanged

#### Scenario: A continuation leg keeps showing evidence

- **WHEN** a later leg of a multi-edge firing still shows the evidence the first
  leg reasoned from
- **THEN** its sentence names that evidence ("for the same striped region") as
  well as the edges it rings

### Requirement: A shared mechanic paints from the words

Where a shared mechanic paints for several games, it SHALL read the words: the
candidate games' overlay and the border grid's marks are the references the
sentence makes.

#### Scenario: A candidate game's step strikes two notes

- **WHEN** a candidate game's step names two notes to strike
- **THEN** the shared overlay marks those two notes, taken from the references
  in the step's words

### Requirement: A refresh that shrinks a hint step SHALL rewrite its words

When a stored step's marks shrink, because some of what it strikes is already
gone, the step's words SHALL be narrowed to the marks that remain and re-rendered,
so the sentence never names a note the step no longer strikes.

#### Scenario: One of two struck notes is already gone

- **WHEN** a stored step reads "…so we must cross out 1 and 2" and the 1 has
  been struck by the time it is shown
- **THEN** the refreshed step reads "…so we must cross out 2" and rings only the 2

### Requirement: Every hinted game SHALL be bound

Every game that declares a `hint` SHALL declare the `hintMarks` section, so
every hint step in the collection names exactly the marks it draws, and every
hinted game's help page SHALL list its marks from its legend.

#### Scenario: A hinted game without a legend

- **WHEN** a registered game declares `hint` and not `hintMarks`
- **THEN** the hint-quality suite fails, naming the game

### Requirement: A hint step is played by the pointer gesture that makes it

Every game with a `hint` SHALL declare `hintGesture(state, ui, ds, move,
step)`, returning the taps, drags and on-screen keys by which a pointer alone
makes a hint step's move from the live board and `Ui`. `step` is the whole step
on display, so a gesture can be found by asking the game's `hintKeepTrack`. A
key in a gesture SHALL be one the game's on-screen keypad offers, or the
mark-all control where the game has one.

#### Scenario: A step the pointer cannot make fails the walk

- **WHEN** a hinted game's plan contains a step whose move no tap, drag or
  on-screen key makes
- **THEN** its gesture either makes some other move, which `hintKeepTrack`
  calls off, or makes none, and the gesture walk fails for that game

### Requirement: executeHint sends the gesture and never applies the move

`midend.executeHint()` SHALL NOT apply a step's move. It SHALL send the step's
gesture through the game's `interpretMove` as the frontend delivers pointer
input (a click as a press and its release, a drag as a press, its drag events
and a release, a declined press as its release alone, and a key at the origin),
and SHALL judge each move that makes with the game's `hintKeepTrack`.

#### Scenario: A step made in several moves completes on the last

- **WHEN** a step's move is made by several pointer moves, such as three note
  strikes or two quarter turns
- **THEN** the earlier moves are judged on track and committed, the last
  completes the step, and the plan advances when it settles

### Requirement: A gesture that does not make its step throws

The midend SHALL throw, naming the step and the gesture, when the gesture makes
a move `hintKeepTrack` calls off the step, makes a move after the step
completed, presses a key no on-screen control sends, or ends without completing
the step, and when a hinted game has no `hintGesture`. A cross-game walk SHALL
play every hinted game's plans with `executeHint` on every gate preset.

#### Scenario: A key the player has no control for is refused

- **WHEN** a gesture presses a key that is neither on the game's keypad nor the
  mark-all control
- **THEN** `executeHint` throws, naming the key

### Requirement: A target-verb game's hint clicks come from its verbs

A game declaring `Game.targetVerbs` SHALL make a hint step that is one click on
each of some targets through the engine's `verbClicks`, supplying only the
step's targets in order. A step made otherwise (a drag, or several presses of
one target over values the step accepts) stays the game's own gesture.

#### Scenario: A wrong target fails the walk

- **WHEN** a game's `hintGesture` names a target the step does not decide
- **THEN** `verbClicks` throws naming that target, and the gesture walk fails
  for that game

### Requirement: verbClicks chooses each click's button by the verb the step keeps

The engine SHALL choose each target's button by applying each button's declared
verb there, left before right, and keeping the first whose move the game's
`hintKeepTrack` judges on the step, judging a copy of the step and applying the
verbs to a copy of the `Ui`. It SHALL aim each click at the geometry's
`pointAt`, SHALL end the gesture at the click that completes the step, and
SHALL throw, naming the target, where no button's verb keeps the step.

#### Scenario: The button is the one the step keeps

- **WHEN** a step wants a square white and the left button's verb would make it
  black while the right button's makes it white
- **THEN** `verbClicks` clicks the square with the right button, at its
  `pointAt`

#### Scenario: The step and the Ui are left as they were

- **WHEN** `verbClicks` derives a gesture for a step whose `hintKeepTrack`
  shrinks the step as it is followed
- **THEN** the step the midend holds, and the player's `Ui`, are unchanged by
  the derivation

### Requirement: The midend SHALL refuse a hint on a finished or wrong board before asking the game

Before it asks a game's `hint` for a plan, the `Midend` SHALL refuse with
`ALREADY_SOLVED` when the board's status is solved, and then with
`FIX_MISTAKES_FIRST` when the game's `findMistakes` reports anything, putting
what it reports on the same overlay Check & Save uses. The two SHALL be asked
in that order, because a finished board is not a wrong board. A game's `hint`
is then asked only about an unfinished board on which its `findMistakes`
finds nothing, and SHALL NOT write either refusal.

#### Scenario: Asking for a hint on a finished board

- **WHEN** a hint is requested, or played, on a board whose status is solved
- **THEN** the midend returns `ALREADY_SOLVED` and the game's `hint` is not asked

#### Scenario: Asking for a hint on a board with a mistake highlights it

- **WHEN** a hint is requested on an unfinished board for which the game's
  `findMistakes` reports a mistake
- **THEN** the midend returns `FIX_MISTAKES_FIRST`, the game's `hint` is not
  asked, and the next redraw shows the mistake overlay Check & Save populates

#### Scenario: A refusal unrelated to mistakes highlights nothing

- **WHEN** the game's `hint` refuses on a board with no mistakes
- **THEN** the mistake overlay stays empty and no cell is highlighted

### Requirement: The midend's two refusals are not a game's to give

`FIX_MISTAKES_FIRST` promises a highlight, which only the code that draws the
overlay can keep, so no game SHALL say it: it is not a `HintRefusal`. A status
is judged from the board alone, so every finished board's status is solved, and
`ALREADY_SOLVED` is the midend's alone and not a `HintRefusal`.

#### Scenario: A game returns one of the midend's refusals

- **WHEN** a game's `hint` returns `ALREADY_SOLVED` or `FIX_MISTAKES_FIRST` as
  its error
- **THEN** the program does not typecheck

### Requirement: The midend does not refuse a hint on a lost board

The midend SHALL NOT refuse a hint on a lost status, because a lost board is
not always over: Flood plays on past its move limit and its hint still leads
home.

#### Scenario: A hint is asked past Flood's move limit

- **WHEN** a hint is requested on a Flood board past its move limit
- **THEN** the midend asks the game's `hint`, which still leads home

### Requirement: The hint walk asks findMistakes at every position

Because the cross-game hint walk asks `hint` directly, it SHALL also ask
`findMistakes` at every position it reaches, as the midend does, and fail if it
reports anything. That is what holds a game's `findMistakes` to a sound board
and a hint to never leading the player into a mistake.

#### Scenario: A hint walk meets a mistake

- **WHEN** following a game's hints reaches a position its `findMistakes` flags
- **THEN** the walk fails, naming the seed and the move

### Requirement: A hint refusal SHALL be one of the collection's own

`HintResult`'s error SHALL be a `HintRefusal`: the union of the literal types
of the collection's refusal constants, plus a sentence made by `puzzleDeadEnd`
or `markedDeadEnd`, the named escapes. A game SHALL NOT be able to return a
sentence of its own wording. The type is of literals, so a string spelling a
constant's text exactly is that constant to it, and the player reads the same
sentence.

#### Scenario: Two games refuse for the same reason

- **WHEN** two games decline to hint because no further move can be deduced
- **THEN** the player reads the same sentence in both

#### Scenario: A new phrasing cannot arrive unnoticed

- **WHEN** a game's `hint` returns a sentence that is neither a refusal constant
  nor made by an escape
- **THEN** the typecheck fails

### Requirement: The refusals distinguish the situations a player must tell apart

The set of refusals SHALL distinguish, at minimum: the board is inconsistent
but no individual entry can be shown to be wrong; deduction has run out; a
bounded search is past its reach; for a game that teaches no technique, no move
would help; and the game is over. The help teaches "there is a mistake on the
board" and "deduction has run out" as a pair whose responses are opposite, and
a player cannot learn a pair whose members are worded differently in each
puzzle.

#### Scenario: A board inconsistent with nothing to highlight

- **WHEN** a board `findMistakes` passes is still inconsistent, with no entry
  provably wrong
- **THEN** the game's `hint` refuses with the message that asks the player to
  undo, not with one pointing at a highlight

### Requirement: Every refusal says whether it is a dead end

Every refusal SHALL say whether it is a dead end (`isDeadEnd`): whether its
advice is to go back. The verdict of each kind SHALL be stated in a table typed
over every kind, so a kind added without one fails the typecheck, and the
conformance check SHALL hold each kind's verdict to whether its sentence tells
the player to undo.

#### Scenario: A kind whose verdict disagrees with its advice

- **WHEN** a refusal kind is called a dead end while its sentence does not tell
  the player to undo, or the reverse
- **THEN** the conformance check fails

### Requirement: The refusal kinds' dead-end verdicts

A contradiction, a game that is over, and nothing found that finishes from here
SHALL be dead ends. Deduction run out, a search past its reach, no move worth
making, a puzzle that cannot be reasoned about, and a game ID that came without
its solution SHALL NOT be.

#### Scenario: Deduction runs out on a sound board

- **WHEN** a hint refuses because deduction has run out
- **THEN** `isDeadEnd` answers no, since the advice is not to go back

### Requirement: An escape names a dead end only one puzzle has

The escapes are for a dead end only one puzzle has, where naming it is the
substance of the hint (Inertia's dead ball, Pegs' cut-off pegs), and are dead
ends by construction. A sentence two games pass through them is a situation the
collection has, and SHALL become a kind.

#### Scenario: A game's own dead end shared by a second game

- **WHEN** two games pass the same sentence to an escape
- **THEN** the conformance check fails, asking for a kind

### Requirement: The conformance check reads every escape call

The conformance check SHALL find the escapes' calls by their shape, read a
template's words with each substitution as a hole (a `markedDeadEnd`'s through
its `phrase` template), and fail a call whose sentence it cannot read or which
does not tell the player to undo.

#### Scenario: A kind spelled out through the escape

- **WHEN** a game passes a refusal constant's text to an escape
- **THEN** the conformance check fails

### Requirement: The check asks the hint whether a position is a dead end

The `Midend` SHALL offer `check()`, the one check behind Check & save and Check
without saving. It SHALL ask `findMistakes` first, displaying any mistakes. On
a board with none, it SHALL ask the game's `hint` for its verdict, showing no
hint, and report a refusal `isDeadEnd` calls a dead end with its sentence. A search past its reach (`SEARCH_OUT_OF_REACH`) SHALL
be reported apart, since it settles nothing. Every other answer SHALL be
reported sound, saying whether `findMistakes` ran.

#### Scenario: A dead end findMistakes cannot see

- **WHEN** `check()` runs on a board `findMistakes` passes and the game's hint
  refuses it with a dead end (Bricks' wrong-but-legal mark, Pegs' cut-off peg)
- **THEN** the verdict is a dead end, carrying the hint's sentence

#### Scenario: Past the search's reach

- **WHEN** the hint refuses with `SEARCH_OUT_OF_REACH`
- **THEN** the verdict says the check could not settle the position

#### Scenario: A sound board shows no hint

- **WHEN** `check()` runs on a board the hint has a plan for
- **THEN** the verdict is sound and no hint step is displayed

### Requirement: A check computes a hint only where the answer is not known

A solved board, and one a stored hint plan still leads on from, SHALL NOT cost
a hint computation in `check()`. The verdict, not the marks, SHALL cross the
worker boundary: the canvas is painted in the worker.

#### Scenario: A check on a solved board

- **WHEN** `check()` runs on a solved board
- **THEN** the verdict is sound and the game's `hint` is not asked

### Requirement: A dead end may mark its cause

`markedDeadEnd(words)`, which a game's hint can return, SHALL be a dead end
whose sentence is its words' text and whose references name the elements that
cause it. While it is the answer on display, from a Hint press or a check, the
midend SHALL pass it to `redraw` as `deadEnd`, never together with a hint step,
and SHALL clear it on the transitions that clear the mistake overlay.

#### Scenario: A cut-off peg is outlined

- **WHEN** Check & save runs on a Pegs board with a peg nothing can reach
- **THEN** the save is refused with the hint's sentence and the cut-off peg is
  outlined until the next move

### Requirement: The binding walk holds a marked dead end to its frame

The binding walk SHALL hold a marked dead end's words to the frame as it holds
a step's: every element named is drawn and nothing else is.

#### Scenario: A renderer that ignores the dead end

- **WHEN** a game returns a marked dead end but its `redraw` paints marks only
  from the hint step
- **THEN** the binding walk reports each named element as not drawn

### Requirement: A hint step's words SHALL be built from their parts

A hint step's words SHALL be a `Sentence` (`src/engine/hint-words.ts`), which
only the engine's `sentence` (and its shorthand `so`) and `unshaped` make, so a
game hands over a step's words as parts and not as one string: what to look at,
an optional consequence that follows from it, the move, an optional subgoal,
and the relation of the move to the rest.

#### Scenario: Words cannot skip the parts

- **WHEN** a game writes a step whose words are a bare `phrase`
- **THEN** the program does not typecheck

### Requirement: The engine writes the words that join a sentence's parts

The engine SHALL write the words that join the parts, one fixed form per
relation:

- *forced*: "L, so M." and, with what follows, "L, so F: M.";
- *one of several*: "L. One of them: M.";
- *answers a danger*, in the game's words for how: "L. One way to save it: M.";
- *effect*, a move no rule forces, narrated by what it does: "L. M: E.";
- *sequence*: "L. First, M.", then "Next, L, M." and "Last, L, M.";
- *again*, a journey's later leg: "…and M, for B.".

#### Scenario: A forced deduction joins its parts with "so"

- **WHEN** a game hands over a look and a move with the forced relation
- **THEN** the step's words read "<look>, so <move>." with the first letter
  capitalized, and carry every mark both parts name

#### Scenario: A move that is one of several is not concluded with "so"

- **WHEN** a searching game offers a move other moves would serve as well
- **THEN** its relation is one of several, or answers a danger, and its words do
  not join the move with "so"

### Requirement: A subgoal prefixes any form of sentence

A subgoal SHALL prefix any form as "Working on A:". The *serves* relation, a
move toward a subgoal, SHALL be written by the engine as "Working on A: M.".

#### Scenario: A step serves a stable subgoal

- **WHEN** a game hands over a subgoal and a move with the serves relation
- **THEN** the step's words read "Working on <subgoal>: <move>."

### Requirement: A step that cannot take the parts is a declared exception

A step whose words cannot take the parts SHALL be declared an exception of one
of the engine's kinds (`bare`, `setup`, `evident`), and the hint-quality walk
SHALL check each kind's property on the step: a bare step names only ring
marks, a setup step names no outline or stripes, an evident step names a ring.

#### Scenario: An exception is declared and checked

- **WHEN** a step's words are declared `bare`
- **THEN** the hint-quality walk fails the step if its words name any outline
  or stripes

### Requirement: A forced step in a searching game says its rivals lost

In a game whose hint searches (it plans by sliding search or can refuse with
`SEARCH_OUT_OF_REACH`), a forced step SHALL say its rivals were judged lost,
and the hint-quality walk SHALL fail one that does not.

#### Scenario: A searching game concludes with "so" over unjudged rivals

- **WHEN** a searching game's forced step does not say its rivals were judged
  lost
- **THEN** the hint-quality walk fails the step

### Requirement: A step's words can leave the move to the board

A step's words can leave the move to the board through the engine's `MOVE`
mark: a ring on the step's own move, which the game's renderer SHALL draw as it
draws any move.

#### Scenario: A move left to the board is still bound

- **WHEN** a step's move is named only by words on the `MOVE` mark ("go back
  for it")
- **THEN** the game's renderer rings the step's move, and the binding walk
  finds the mark drawn

### Requirement: A searched move's rivals SHALL be judged through the engine

The engine SHALL provide `judgeRivals` (`src/engine/rival-judging.ts`): given
the rivals of the move a hint offers, an allowance counted in positions, and
the game's judge of one rival (finishes, lost, or unsettled), it SHALL return
the verdicts and the claim they allow, with the relation that claim's sentence
uses. The judge, the rivals a game chooses to judge, and what a step says when
nothing is settled SHALL stay the game's.

#### Scenario: An unsettled rival is not claimed

- **WHEN** some rivals are unsettled and none is lost
- **THEN** the claim says nothing about the rivals, and carries no relation

#### Scenario: One allowance is shared

- **WHEN** the judging of the first rivals uses up the allowance
- **THEN** the rivals after them are judged with what is left, which is nothing

### Requirement: Only judgeRivals concludes a searched move with so

The relation that concludes a move with "so" over its rivals SHALL be made only
by `judgeRivals`, and only when every rival was judged lost or there was none,
so that a game cannot write it beside rivals nobody judged.

#### Scenario: Only a judging that lost every rival says "so"

- **WHEN** every rival is judged lost
- **THEN** the claim is that only the offered move remains, and its relation is
  the forced one
- **AND** when some rival finishes, the relation offers the move as one of
  several

### Requirement: A hint step SHALL name the rung it speaks

Every hint step SHALL carry `rung`, the id of the deduction it is, and every
game that declares a `hint` SHALL declare `hintRungs`, the list of every rung a
step of its hint can be, each once. A step's rung SHALL be one of its game's
`hintRungs`. `HintStep` and `Game` SHALL be typed by the game's rung union, so
that a game whose steps are typed by its list fails to compile when a step is
stamped with an id the list lacks.

#### Scenario: A reason kind missing from the list

- **WHEN** a game's hint gains a reason kind and its rung list does not
- **THEN** the game does not typecheck, at the line that stamps the step

#### Scenario: A hinted game without a list

- **WHEN** a registered game declares `hint` and not `hintRungs`, or lists a
  rung twice
- **THEN** the hint-quality suite fails, naming the game

#### Scenario: A step of a rung the list lacks

- **WHEN** the hint-quality walk meets a step whose rung is not in its game's
  `hintRungs`
- **THEN** it fails, quoting the step's sentence

### Requirement: A rung is the deduction at the grain the game names it

A rung is the deduction, at the grain the game's solver or plan already names
it: the kinds of its reason union, or the branches of a hint that deduces
nothing. The legs of one journey SHALL share their firing's rung. Two wordings
of one deduction SHALL NOT be two rungs. A rung id is not player-facing: no
sentence, help page, save or game ID SHALL hold one.

#### Scenario: One deduction is worded two ways

- **WHEN** a game words one deduction differently on two boards
- **THEN** both steps carry the same rung

### Requirement: Whatever asks which deduction a step is reads its rung

Whatever needs to know which deduction a step is SHALL read `rung`, and SHALL
NOT match the step's sentence to find out: the pins a game's tests read, the
narration ledger, and a render scenario that walks a plan to a step. That SHALL
NOT stop a test asserting what a step's sentence says where the wording is the
thing under test.

#### Scenario: A pinned step's sentence is reworded

- **WHEN** the sentence of a step a test pins is reworded
- **THEN** the pin still finds the step, because it reads the rung

### Requirement: The solver and the hint are two projections of one deduction engine

A logic game's deductive solver and its hint SHALL be two projections of one
deduction engine. The generator runs the techniques to a fixpoint with the
recorder off and SHALL accept a board only when the techniques fully solve it;
the hint runs the same techniques with the recorder on. Deductive completion
implies uniqueness, so no separate uniqueness pass SHALL be required. The
difficulty grade SHALL be the highest **tier** reached, never a technique's
position in the ladder.

#### Scenario: A board is graded by tier and not by position

- **WHEN** the techniques solve a board, and the last technique in the ladder
  that fired declares a lower tier than an earlier one that fired
- **THEN** the board's grade is the higher tier

### Requirement: The hint-resume walk excuses the games that can say a search ran out

Which games the hint-resume walk excuses its completion promise SHALL be a
population apart from a sweep's cost exemption (`testing`), `SEARCH_REACH_GAMES`: the games whose own code names
`SEARCH_OUT_OF_REACH`, the refusal that admits a search ran out, or hands a
search's outcome to `searchRefusal`, which names it for them. A game can
search without the slide planner, so the excuse SHALL NOT be keyed on the
planner.

#### Scenario: A game that searches without the slide planner may refuse past its reach

- **WHEN** a game's hint can say `SEARCH_OUT_OF_REACH` from a search of its own
- **THEN** the hint-resume walk excuses it by the same derivation, and its ledger
  entry is required before the guard passes

### Requirement: An excused game's reason and remaining cover are recorded per member

The reason a member is excused, and the test that still covers its largest
board on every commit, SHALL be recorded per member, with the derivation
asserted to be exactly the ledger, so a game that later joins the mechanic
fails the guard until someone writes that sentence.

#### Scenario: A newly enrolled game has no ledger entry

- **WHEN** the derivation enrolls a game the ledger does not name
- **THEN** the ledger's equality assertion fails until its entry names what
  covers its largest board

### Requirement: Auto-Hint stops when a step throws

Auto-Hint SHALL stop when a step's hint throws, so the error reaches the app's
reporter and the loop is not left marked active with nothing driving it.

#### Scenario: Auto-Hint meets a thrown step

- **WHEN** Auto-Hint is running and a step's hint throws
- **THEN** Auto-Hint stops and the error propagates to the app's reporter
