# engine-hints Specification

## Purpose
The hint system: what a hint step is, how the midend shows, refreshes and
plays one, the marks and words a step is built from, the rules its narration
is held to, and the planners and refusals of the hints that search.

## Requirements

### Requirement: The engine supports an ephemeral Hint System

The engine SHALL support a UI-only, ephemeral Hint System built on **plans**.
The `Game` interface SHALL define an optional `hint(state, aux?)` method returning
a non-empty ordered plan of `HintStep`s — each a move plus a human-readable
explanation and optional visual highlights, narrated for the state that step
applies to (`HintResult`). The optional second argument `aux` is the generator's
solution hint (upstream `aux_info`), the same value passed to `solve`; the
`Midend` SHALL pass its stored `aux` so a game whose best hint derives from the
known solution can use it when present (and fall back otherwise), while deductive
games ignore it. The `Midend` SHALL store the whole plan plus a current-step index
in `activeHint` (midend-only, never in game state, never persisted), SHALL display
**at most** one step at a time (the displayed step is passed to the game's `redraw`
and its explanation appended to the status bar; a stored plan MAY be hidden,
displaying nothing), and SHALL recompute a plan only when no valid plan is stored.

Plan lifecycle:
- `midend.hint()` SHALL re-display the stored plan's current step (no
  recompute, no advance) while a plan is active, and SHALL compute and store
  a fresh plan at index 0 otherwise.
- `midend.executeHint()` SHALL execute the current step of the stored plan
  (computing a plan first if none is stored), keep that step displayed through
  the move's animation, and advance to the next step — displayed, as the
  auto-play preview — when the animation settles.
- A player move while a plan is active SHALL be classified by the game's
  `hintKeepTrack(move, currentStep, state)` verdict, whether or not the plan
  is currently displayed: `"completed"` advances the plan to the next step
  and **hides the display** (the user asks again to see the next step — one
  hint per request in manual play) — unless the next step is flagged
  `continuesPrevious` (the continuation of a journey the completed step
  previewed, e.g. the "then to column 5" leg), in which case the display
  SHALL stay on and transition to that step: a journey is presented as one
  hint and stays on screen through its legs. `"onTrack"` keeps the current
  step displayed (the game MAY adjust the step's move in place to reflect
  partial progress), and `"off"` drops the plan. A game returning
  `"completed"` is asserting that the resulting state matches the plan's
  expectation, so the remaining steps stay valid.
- The plan SHALL be cleared on undo, redo, restart, new game, solve, when the
  last step completes, and when the board reaches the solved state.

**Hint-authoring convention — one deduction firing = one journey.** When a
game's `hint()` derives its plan from a solver/deduction engine, a **single
logical deduction that forces more than one move** (e.g. a coupled pair of
edges, or a clue that simultaneously resolves several of its sides) SHALL be
emitted as **one journey**: an ordered run of `HintStep`s whose first leg
carries the full explanation of the deduction (and SHOULD surface the whole set
visually, e.g. the other forced moves as sibling highlights) and whose
subsequent legs are flagged `continuesPrevious` with abbreviated narration.
Distinct deductions remain separate hints (the first leg of each is
unflagged, so the user asks again to see the next deduction). This keeps the
manual flow ("clear this one, then the rest" stays on screen through its legs)
and the auto-play flow (the legs animate back-to-back as one multi-part move)
consistent across every game whose hints group naturally.

**Hint-authoring convention — element-type color legend.** When a game's hint
narration names **more than one distinct kind of board element** (e.g. a filled
cell as premise versus the forced cell as conclusion, or a clue versus a
region), the game's `redraw` SHALL distinguish those types with a **stable
per-game color legend**: each element type is assigned one highlight color used
consistently across all that game's hints (so the legend is learnable), and only
the types a given hint actually names are highlighted. Each legend color SHALL
be paired with a **non-color cue** (ring versus shade versus fill, the drawn
digit/clue, or position) so the type mapping survives for colorblind players —
color SHALL NOT be the sole carrier, and color names SHALL NOT appear in the
narration text. This convention is orthogonal to "equivalent moves share a
color": equivalent *forced moves* still share the single target color; the
legend governs *premise/element types*.

A non-deductive game (no technique to teach) MAY instead derive its plan from
the known solution via `aux`: it is a legitimate hint strategy to walk the
player to the unique solution. Such a game SHOULD prefer the `aux`-derived plan
when `aux` is present (guaranteeing the plan completes) and MAY fall back to a
local heuristic when it is absent.

#### Scenario: A hint naming multiple element types colors them by a stable legend

- **WHEN** a game's displayed hint step narrates two distinct board-element
  types (for example a cited filled/decided premise cell and the forced target
  cell)
- **THEN** `redraw` highlights each type in its own legend color, paired with a
  distinguishing non-color cue, rather than rendering both in the single target
  color

#### Scenario: A legend color is the same across different hints of one game

- **WHEN** two different hints of the same game each name the same element type
  (for example "a shaded square" appears as a premise in two different
  deductions)
- **THEN** that element type is drawn in the same legend color in both hints

#### Scenario: Requesting a hint from the midend

- **WHEN** the user requests a hint via `midend.hint()` with no active plan,
  on a game that implements the `hint` method
- **THEN** the midend computes a plan once, stores it with index 0, appends
  the first step's explanation to the status bar, and schedules a repaint

### Requirement: Hint explanation surfaces independent of the status bar

The active hint step's explanation SHALL be surfaced to the UI (the hint
banner) whenever a hint is displayed, **regardless of whether the game
has a status bar** (provides `statusbarText`). The explanation rides on the
`status-bar-change` notification together with the status-bar text; the
`Midend` SHALL emit that notification for a game that has either a status bar
or a `hint` capability, so a hint-carrying game with no status bar (e.g.
Range) still shows and clears the banner. The status-bar DOM remains gated on the app's `wantsStatusbar` attribute independently, so the empty status-bar text emitted for a
no-status-bar game is inert.

#### Scenario: A no-status-bar game shows and clears the hint banner

- **WHEN** a game with a `hint` method and no `statusbarText` is sent a
  hint request, and then the player makes a move
- **THEN** the midend emits the hint explanation while the hint is displayed
- **AND** the explanation is cleared (emitted empty) once a move hides the hint

### Requirement: executeHint supports a single-step (hide-after) mode

`midend.executeHint(hideAfter?)` SHALL accept an optional `hideAfter` flag
(default false, threaded through `PuzzleEngineSurface` and the worker adapter).
When false the behavior is unchanged — the executed step stays displayed
through its animation and, on settle, the plan advances and the next step is
**displayed as the auto-play preview**. When `hideAfter` is true the executed
step still stays displayed through its animation, but on settle the plan
advances and is then **hidden** (the same hidden-but-stored state a manual step
completion produces), so nothing is previewed; the next `midend.hint()`
re-displays the advanced step without recomputing.

#### Scenario: Single-step execute hides the plan instead of previewing

- **WHEN** `executeHint(true)` is called on a game with a stored plan
- **THEN** the current step's move is applied and, once it settles, the plan
  advances and is hidden (no next-step preview is displayed)
- **AND** a subsequent `hint()` re-displays the advanced step without
  recomputing the plan

#### Scenario: Auto-play execute still previews the next step

- **WHEN** `executeHint()` (no argument) is called on a game with a stored plan
- **THEN** the executed step settles and the next step is displayed as the
  auto-play preview, exactly as before

### Requirement: The toolbar Hint button alternates show and apply

The app shell's **Hint** control SHALL alternate between showing and applying
one hint step, built on the two midend primitives (`hint()` to display,
`executeHint(true)` to apply one step and hide it), without changing any game's
`hint()`. The intent is one applied hint per request: most players need a single
nudge to get unstuck, so applying is terminal — it does not auto-advance to the
next hint.

The orchestrating `Puzzle` SHALL maintain an "armed to apply" flag that is:

- **set** when a Hint press successfully *displays* a step (the `hint()` show
  path returns no refusal), and
- **cleared** when a Hint press *applies* a step (so the rhythm is
  show → apply → show → apply), and by any intervening user action — a move
  (key or pointer), undo, redo, solve, restart, new game, checkpoint load,
  loading a saved game, deletion, or starting Auto-Hint.

A Hint press SHALL:

- when **not armed**, run the show path (`midend.hint()` via the surface),
  arming the flag only if the show succeeds (a refused hint — mistakes present,
  already solved, nothing deducible — SHALL surface its banner/overlay as today
  and SHALL NOT arm);
- when **armed**, disarm and apply exactly the current step via
  `executeHint(true)` (which hides the plan on settle rather than previewing the
  next step). On success, with the board not yet solved, the hint banner SHALL
  show a transient confirmation ("Hint applied"); on an `executeHint` error the
  message SHALL surface in the banner. The next Hint press then *shows* the next
  step.

The separate Auto-Hint play/pause button is unchanged and remains the way to
animate the whole remaining plan unattended (it uses `executeHint()` with no
`hideAfter`, keeping the continuous preview).

#### Scenario: First press shows, second press applies and stops

- **WHEN** the player presses Hint on a hinted game with no active plan, and
  then presses Hint again without any other interaction
- **THEN** the first press displays the current step (no move is applied) and
  the second press applies that one step in slow motion, hides the plan
  (no next step is previewed), and shows a "Hint applied" confirmation

#### Scenario: Presses alternate show and apply

- **WHEN** the player keeps pressing Hint with no other interaction between
  presses
- **THEN** the presses alternate show, apply, show, apply — each apply lands one
  move and stops, and the following press shows the next step

#### Scenario: An intervening action re-arms the show

- **WHEN** the player presses Hint (showing a step), then performs any other
  action (e.g. a move or undo), then presses Hint again
- **THEN** the next press *shows* the now-relevant step rather than applying a
  stale one (the apply is disarmed by the intervening action)

#### Scenario: A refused hint does not arm the apply

- **WHEN** a Hint press is refused (the game's `hint()` returns an
  unsuccessful result, e.g. the board has mistakes)
- **THEN** the refusal banner/overlay surfaces as before and the next Hint
  press is still on the show path (it does not apply a step)

### Requirement: A displayed hint step never references already-resolved state

The `Midend` SHALL guarantee that whenever a hint step is on display, every
element the step asks the player to act on is still actionable in the current
state — in particular, a candidate-elimination step SHALL NOT name a candidate
that has already been removed from its cell. A stored plan that is kept across a
player's exact-follow moves (the `hintKeepTrack` `"completed"`/`"onTrack"`
path) SHALL be re-validated against the current state before (re-)display, so a
move's side effects (e.g. auto-pencil eliminations) can never leave a later
displayed step referring to a candidate the player has already cleared.

The re-validation SHALL use an optional `Game.refreshHintStep(step, state)`
hook: given a stored step and the current state, the game returns the step with
no-longer-actionable parts dropped (rebuilding its highlights to match, or the
same reference when nothing changed), or `null` when the step is now fully
resolved. The `Midend` SHALL call this before (re-)displaying the plan's current
step — on `midend.hint()` re-show, after a kept manual move advances or shrinks
the plan, and after an executed-hint step settles — advancing past any step the
hook reports fully resolved and recomputing a fresh plan if the whole stored
plan drains. A game that does not implement the hook has its stored steps shown
as-is (correct for games whose move types cannot be partially resolved by a
sibling move's side effects).

This preserves the existing semantics that an exact-follow move keeps the plan
and a conflicting move (`"off"`) drops it; it only adds the freshness guarantee
on top.

The `Midend` SHALL classify a player move with `hintKeepTrack(move, step,
state)` against the **pre-move** state (the state the move is about to be
applied to), so a game MAY itself apply the move to reason about its result
(e.g. a slide puzzle computing the landing cell), and a game classifying a
candidate toggle SHALL test liveness against that pre-move state (a toggle
*clears* a candidate iff it is present before the move; toggling an absent
candidate re-adds it and is off-plan).

#### Scenario: A displayed step is re-validated before showing

- **WHEN** the midend is about to (re-)display the current step of a stored plan
- **THEN** it calls the game's `refreshHintStep` (when provided) and shows the
  refreshed step, advancing past any step reported fully resolved and
  recomputing a fresh plan if every stored step has been resolved

### Requirement: Requesting a hint never mutates the board

Computing or (re-)displaying a hint SHALL NOT change the game state. A hint
*displays* a plan (via highlights the game's `redraw` paints); the player applies
a step only by following it or by an explicit apply action. `Game.hint` SHALL be
pure on its `state` argument, and the act of showing a hint SHALL leave every
board value — including pencil notes — untouched. A displayed highlight that
acts on a board element (e.g. a struck candidate) SHALL be drawn legibly against
its cell, never in the same color as the cell's own background fill, so the
element it references remains visible rather than appearing already-resolved.

#### Scenario: Showing a hint leaves the board unchanged

- **WHEN** the player requests a hint (the show, not an apply)
- **THEN** the game state is byte-for-byte unchanged — only highlighting is added
- **AND** a struck/acted-on candidate remains visible (its highlight contrasts
  with the cell background), not hidden behind a same-color fill

#### Scenario: A kept plan never shows an already-removed candidate

- **WHEN** a hint plan is kept across the player's exact-follow moves, and one
  of those moves (or its auto-pencil side effects) removes a candidate that a
  later stored step would have struck
- **THEN** that later step is not displayed as striking the already-removed
  candidate — the midend drops the dead mark (advancing or recomputing the plan
  as needed) so every displayed elimination is still live

#### Scenario: Exact-follow still keeps the plan; a conflict still regenerates

- **WHEN** the player makes a move that exactly follows the displayed hint
- **THEN** the plan is kept (advanced), not dropped
- **AND WHEN** the player instead makes a conflicting move
- **THEN** the plan is dropped and the next hint recomputes from the new state

### Requirement: Hint mechanics are engine-owned and cross-game guarded

A game's hint SHALL contain only what is genuinely that game's: **what it can prove, what
it marks on the board, and what it says**. The *mechanics* a hint needs — how a plan is
carried and advanced, how a mark survives a move animation, how an overlay reaches the
render cache, how a plan stays stable across recompute, how a step is narrated in the
shared vocabulary — SHALL be provided by the engine or by a shared hint library, and SHALL
NOT be re-derived per game.

The overlay clause is overlay-general, not hint-specific: **any** per-cell overlay a game
paints on top of its tiles (the hint overlay, the mistake overlay) SHALL reach the render
cache through the shared overlay sidecar (`engine/overlay-sidecar.ts`) rather than a
per-game re-derivation of the repack/stale/commit dance, except where a game's overlay
genuinely does not fit the per-cell shape (recorded as a no-go with its reason).

This requirement states the **invariant**, not an API: which seams are extracted, and in
what shape, is decided by the audit this change carries (`design.md`), and a seam that
fails those criteria SHALL be recorded as a deliberate no-go rather than forced.

Two rules make it enforceable rather than aspirational:

- **A hint defect class that has occurred in two or more games SHALL be closed
  structurally or by a cross-game guard** — a test every hinting game is enrolled in (as
  `hint-resume.test.ts` already guards plan convergence) — and SHALL NOT be left to a rule
  in a document that each new port must remember. Documented rules are how the same defect
  reaches a second game.
- **A shared hint mechanism SHALL NOT cost a game any of its narration.** The exemplar
  hints — Palisade's deduction bar, Inertia's stable subgoal, Towers' recorded
  eliminations, Filling's grouped multi-square step — are the acceptance test: if a shared
  abstraction cannot express one of them without loss, the abstraction is wrong, not the
  hint. The hint is the product; the framework serves it.

#### Scenario: A recurring hint defect is closed for every game at once

- **WHEN** a hint defect is found that has already occurred in another game — a mark that
  does not track its moving piece, an overlay absent from the render cache's diff key, a
  plan that loops across recomputes
- **THEN** it is fixed in the shared mechanism and guarded by a test every hinting game is
  enrolled in, rather than fixed only in the game that reported it

#### Scenario: A new hinting game inherits the mechanics

- **WHEN** a newly ported game adds a hint
- **THEN** it implements its deductions, its marks and its narration, and inherits plan
  lifecycle, mark-vs-animation placement, overlay cache invalidation and the narration
  vocabulary from the engine — it does not re-derive them

#### Scenario: An extraction that would flatten a hint is rejected

- **WHEN** a proposed shared abstraction cannot express an exemplar game's hint without
  losing part of what that hint says
- **THEN** the abstraction is rejected or reshaped, and the rejection is recorded with its
  reason

#### Scenario: A mistake overlay reaches the cache the same way the hint overlay does

- **WHEN** a game paints a per-cell mistake overlay (the `findMistakes` highlight) over
  tiles whose values are otherwise unchanged
- **THEN** the overlay is carried by the shared overlay sidecar — packed per frame,
  stale-compared in the cache-miss test, committed after draw — so a Check & Save on an
  already-drawn board repaints the flagged cells

### Requirement: A hint marks beside the content, never behind it

A hint's marks SHALL NOT be drawn *underneath* anything the player has to read.
The acted-on cell SHALL be **ringed** rather than filled, in every game and with
no exceptions. An evidence area whose cells carry content — entered digits,
pencil marks, clue glyphs, a placed mark, or a background the deduction is
reading — SHALL be **outlined** rather than washed.

Both marks SHALL be drawn on the space the cell's **border** already occupies,
which is either the gutter between cells or the cell's own outermost pixels
depending on how the game is laid out, so that a mark costs the content no room
and reads as a highlight by *color* rather than by weight. Where the border
belongs to a game object in its own right — a wall in Galaxies or Palisade — the
mark SHALL be inset inside the cell instead, so it cannot be read as that object.

An evidence area whose cells carry **no** content MAY remain a wash. The
governing question is `docs/games/hints.md` § "Shade vs ring"'s — *would the fill
hide the premise?* — where **hide** includes *rendered unreadable by contrast*,
not only *occluded*. A game that keeps a wash is asserting that nothing is drawn
on it, and SHALL record that reason where it names the role. The target has no
such allowance: it is ringed even where a fill would hide nothing, because one
mark means one thing across the collection, and because in a game whose move is
"give this cell a color" a fill states with the board what the narration is
still proposing.

**A fill behind content cannot be rescued by choosing a different color**, and
this is a measured fact rather than a preference: the target fill scores 1.91:1
against a pencil mark in light and 1.96:1 in dark; clearing ~2.6:1 requires a
wash so pale it collides with the evidence wash, and the only hues that clear it
sit beside `ERROR_WASH`, which would make the cell a hint points at resemble the
cell that is wrong. A joint search over both hint fills, every hue, and both
schemes returns no feasible arrangement. The palette SHALL therefore carry no
fill counterpart to the acted-on color at all, so that a future change cannot
reopen this by retuning one.

A **wash** kept for a content-free evidence area faces the mirror of the same
squeeze and SHALL be tuned for visibility rather than for legibility-through: a
fill dark enough to keep a *derived* foreground readable measures 1.15:1 against
its own board in dark mode, which is a mark nobody can see. The two requirements
move in opposite directions along one axis, so a wash carrying content loses
whichever way it is tuned.

Because a mark on a border is read *against* a surface rather than *through* it,
it SHALL take a **strong** color rather than a wash step, and specifically a
step whose lightness differs between schemes (a `_BOLD`), so that it stands off
the board by a similar margin in each. A step at one lightness under both schemes
reads soft on a pale board and bright on a dark one.

The evidence color and the **chain ordinal** that indexes it SHALL be one role
rather than two roles holding the same value: a number saying where a cell falls
in an ordered chain is an index *into* the evidence, so a name of its own would
claim the ordered cells were a different kind of premise from the unordered ones.

Where a mark lies **outside** the cell's content box, no tile owns those pixels,
so it SHALL be driven by the game's drawstate rather than by its per-tile cache:
a mark that moves or is dismissed SHALL be erased explicitly, and a mark that
persists SHALL be repainted each frame, so that a neighboring cell repainting
for its own reasons cannot clip it. Where a mark lies wholly **inside** the box,
the cell's own repaint undoes it and no such bookkeeping is required — the hint
overlay is already part of that cell's cache key.

Guards on this SHALL assert the mark's **shape** — that a target is a ring of
thin sides and not a solid fill, and that a contiguous evidence region is one
contour rather than a ring per cell. An assertion that some primitive carries the
hint color is satisfied equally by the fill being removed. The cross-game guard
SHALL derive each game's hint palette indices from that game's own renderer
rather than from a list maintained beside it, and SHALL assert how many games it
examined, so that it cannot shrink in silence.

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

#### Scenario: A mark outside the content box survives a neighbor's repaint

- **WHEN** a cell adjacent to a marked one repaints for its own reasons while the
  hint is still displayed
- **THEN** the mark is still whole on the next frame
- **AND** when the hint is dismissed or moves, the space it occupied is restored

#### Scenario: A wash is kept only where nothing is drawn on it

- **WHEN** a game keeps an evidence wash rather than an outline
- **THEN** its evidence cells carry no content the player must read, and the game
  records that reason where it names the role
- **AND** the cross-game guard names that game explicitly, so a further game
  taking the same allowance fails until its reason is written down

#### Scenario: A mark never impersonates a game object

- **WHEN** a game draws its own objects on the cell border — a wall between two
  cells, say
- **THEN** the hint's marks are inset inside the cell instead, so that neither
  mark can be read as one of those objects

### Requirement: The necessity-voice rule applies to every hinting game not ledgered as narrating moves

The cross-game narration guard SHALL derive the games subject to the
necessity-voice rule as **every game that ships a `hint()`**, minus a ledger of
games whose hints narrate *moves* rather than deductions, each carrying its
reason. A game SHALL NOT have to be added to a list to be necessity-checked.

An owner-endorsed per-game idiom, exempting narration that carries necessity in
its own words rather than a modal, SHALL be a predicate over the **step** rather
than over its text alone, so an idiom belonging to one leg of a grouped journey
can say so and be held to it. An idiom SHALL be rejected for a game the
necessity rule does not apply to, since such an entry does nothing.

Words that any game could reasonably write to make a necessity claim belong to
the shared vocabulary, not to a per-game idiom.

#### Scenario: A hinting game not named anywhere is necessity-checked

- **WHEN** a game ships a `hint()` and appears in no list
- **THEN** its narration is held to the necessity-voice rule

#### Scenario: An idiom scoped to a continuation leg does not excuse a lead leg

- **WHEN** an endorsed idiom is declared for a game's continuation legs and a
  lead leg is worded the same way
- **THEN** the lead leg is still required to carry necessity of its own

### Requirement: The midend reports where a displayed hint sits in its journey

When a hint step is on display, the midend SHALL report its position within the
**journey** it belongs to, and the journey's length, so the chrome can say
"Step 2 of 3" while one deduction plays out over several moves.

A journey is the unit this collection already has: the step on display plus
every following step the game flagged `continuesPrevious` ("One deduction firing
is one journey"). The midend SHALL derive it by walking back to the first step of
that run and forward to the last — never from anything a game declares for this
purpose, because `continuesPrevious` is already set by the games that group their
steps, for their own reasons.

The position SHALL NOT be the index within the stored plan. For a plan-based
game the stored plan is the whole tour, and "Step 3 of 47" is a fact about the
solver rather than about the hint the player is looking at. A game that never
groups its steps therefore reports a journey of length 1, and the chrome shows
nothing.

The report SHALL be absent when no step is displayed, so a stale position cannot
sit beside a board with no hint on it.

#### Scenario: A multi-leg deduction reports its progress

- **WHEN** a hint plan's steps 2 and 3 are flagged `continuesPrevious`
- **AND** the first step is displayed
- **THEN** the midend reports position 1 of 3
- **AND** after a move completes that step, position 2 of 3

#### Scenario: A single-leg hint reports a journey of one

- **WHEN** the displayed step is flagged neither as a continuation nor followed
  by one
- **THEN** the journey length is 1, and the chrome shows no step counter

#### Scenario: No hint is displayed

- **WHEN** no hint step is on display
- **THEN** no journey position is reported at all

### Requirement: The hint walk SHALL cover every preset a game offers

The cross-game guarantee that following hints solves the board, from any reached
position, SHALL be asserted over **every leaf preset** of every hinting game, not
over one of them.

It was asserted over `firstLeaf(game.presets())` — by convention the smallest and
easiest board a game offers — for thirty games. The guard therefore had never
seen a Hard board, an `Unreasonable` board, or any mode variant, while reading as
the collection's strongest hint guarantee. Widened (2026-09-08) it walked **209
preset cases** and reported thirteen refusals that the narrow form could not
reach, all of them a real finding.

The sweep SHALL carry a vacuity count of preset cases walked, and its cost SHALL
be tiered rather than paid per commit — with the per-commit slice keeping at
least one preset **per value of every axis the game actually varies**, and with
the axes derived from the game's own `paramConfig` rather than named by the
sweep.

**A game varies more than one axis, and every key tried so far has named one of
them and dropped the rest in silence.** That is a measurement, taken three times:

| the key | what it walked | what it could not reach |
| --- | --- | --- |
| `firstLeaf` | the smallest, easiest board | every Hard, every `Unreasonable`, every mode — thirteen refusals across seven games |
| one preset per declared tier | a board at each difficulty | every preset of an **untiered** game after the first, since they all carry one tier key — Sixteen's 3×3 walks in seven moves and its 5×5 hint cycled for ever |
| that, plus first and last preset where there is no tier | the size ends of untiered games | every **mode** of a tiered one — Solo walked no X, jigsaw or Killer board, Unequal no Adjacent board, Seismic no Tectonic board, Group no identity-hidden board, Keen no multiplication-only board, Loopy one tiling of eighteen; and Salad, whose eleven presets all carry one tier, collapsed to a single board |

Each key was correct about the axis it named. What makes the third fail is not a
missing game but a missing **axis**: a preset that shares a tier with a plainer
board earlier in the menu is de-duplicated away, and a mode is exactly such a
preset. Killer is not a skin on Solo — it adds four cage deduction rungs and four
cage sentences that these guards exist to check.

**The axes SHALL be derived from `paramConfig`, and its *types* SHALL decide what
covering an axis means.** `paramConfig` is a value a mechanism consumes (the
Custom dialog is built from it) rather than a statement written for a guard, it
is complete because a registered game with no `paramConfig` already fails its own
guard, and it distinguishes the two kinds of axis without anyone restating them:
a `"string"` item is a free scalar whose values lie on a line, so **both ends**
cover it; a `"boolean"` or `"choices"` item is a selection from a closed set with
nothing between its members, so **every value** does. Difficulty is a `"choices"`
item, so "one preset per tier" follows from the general rule and is not a case.
A field every preset holds one value at is not an axis: no preset reaches a
second value, so no slice can walk one.

**Presets SHALL be taken in menu order**, keeping one that supplies a value no
earlier one did. That is the cost discipline rather than a detail: it claims each
value on the **smallest** board offering it, so a mode costs about what the
game's easiest board costs. Measured 2026-09-20 back to back on one box (16 GB,
18.6 of 19.4 GB of swap in use, so seconds are upper bounds and the ratio is the
figure that survives), the slice went **88 → 141 walks** and `hint-resume.test.ts`
**25.1 s → 67.0 s**; of the added cost the modes were nearly free — Seismic's
Tectonic board 3 ms, Group's identity-hidden 11 ms, Unequal's Adjacent 34 ms,
Salad's Numbers 9 ms — and the two large items were Loopy's eighteen tilings and
one largest board per game.

**Any cross-game sweep over presets SHALL ask the same question**, and the answer
SHALL be derived from the game rather than assumed. A second sweep keyed on tier
did worse than sample one preset of an untiered game: it skipped such games
before reaching its own vacuity count, so twelve of the thirty hinting games were
outside it while it read as covering them all. The shared preset enumeration
these sweeps derive their population from lives with the other cross-game hint
testing helpers, so a sweep does not re-answer it — and the slice itself lives
there too, for the same reason.

**The slice's own vacuity floor SHALL sit above the ways it can collapse**, not
merely above zero. One board per game and one board per tier are both counts a
broken derivation produces while every walk stays green, so a floor beneath
either asserts nothing about the axis keying. Measured 2026-09-20: 35, 88 and
141 respectively.

**A sweep's finding SHALL be pinned by its shape where it has one, rather than by
more sampling.** The stranding above appears on about a fifth of boards, which no
affordable number of seeds catches reliably; every instance is the same
recognizable board shape, and a test that names two such boards asserts the same
property deterministically in seconds. Seeds remain the wrong dial to turn.

#### Scenario: A hint works on Easy and gives up on Hard

- **WHEN** a game's hint cannot walk a board dealt from a preset at a
  deduction-complete tier
- **THEN** the walk fails, naming the game, the preset and the position

#### Scenario: A game gains a preset

- **WHEN** a preset is added to a game's menu
- **THEN** it is walked from that commit, with no line added anywhere to enroll
  it

#### Scenario: A game's second mode is walked per commit

- **WHEN** a game's presets differ in a `"boolean"` or `"choices"` param — a
  Killer grid, an Adjacent clue set, a Tectonic region shape, a tiling — and the
  mode's presets share their tier with a plainer board earlier in the menu
- **THEN** the per-commit slice walks a board carrying that mode, on the smallest
  preset offering it, rather than de-duplicating it away against the plainer
  board
- **BECAUSE** a mode is a different set of deductions and sentences, not a
  larger board: capping Solo's hint recorder below its board's Killer tier left
  the tier-keyed slice green and turns the axis-keyed one red

#### Scenario: An untiered game's largest board is walked per commit

- **WHEN** a hinting game declares no difficulty contract, so every preset it
  offers carries the same tier key
- **THEN** the per-commit slice walks the largest board it offers as well as the
  smallest, rather than collapsing the game to one board — unless the game's
  hint plans by searching, where board size is sliced away under the
  `build-pipeline` cost requirement and a named per-game test covers the largest
  board instead
- **AND** "largest" is the extreme of each scalar axis, not the last entry in
  the menu: Flood's last preset is 12×12 at four colors, whose color count is
  interior and whose leniency an earlier board already claimed, while its
  largest board (16×16) went unwalked under the rule that took the last one

#### Scenario: A sweep meets a game with no tiers

- **WHEN** a cross-game sweep varies a game's params by tier, and the game
  declares no difficulty contract
- **THEN** it varies that game by preset instead of skipping it, and its vacuity
  count counts what it actually looked at

### Requirement: Deduction running out on a sound board SHALL have one wording

A hinting game that finds no move on a board which is sound, unsolved and free of
mistakes SHALL refuse with the collection's single constant for that situation,
and SHALL NOT invent a phrasing, alias the constant, or spell out its value.

**There is one situation here, not two, and that is a measurement.** Two
constants existed — one bare, one naming trial and error — and the distinction
between them was asserted rather than observed. Walking every preset of every
hinting game found thirteen refusals and **every one was on a board whose tier
permits search**; nothing refused on a deduction-complete tier at any size or in
any mode. A game whose tiers are all deduction-complete cannot reach this refusal
at all, so a wording that hedges about whether trial and error is expected
describes a state no player occupies.

The wording SHALL tell the player that the position is the tier's expected end
and what to do about it. A refusal that says only that nothing follows leaves a
player unable to distinguish a puzzle demanding a guess from a broken hint, which
is the pair `help/features.md` § Hints teaches as calling for opposite responses.

**Every builder of a `hint()` SHALL import the constants, shared ones included,
and SHALL NOT retype their values.** `candidate-hint.ts` — which is the whole
`hint()` of eleven candidate games — held literal copies of **three** of the
seven refusal constants while its own doc comment described them as shared "so a
wording tweak lands in one place". It was one place, and not the same one place
as the other 21 games'; a change to either half would have left the other lying,
and no grep for a constant's *name* could see it.

**The guard that scans for stray refusals SHALL read the engine's hint builders
as well as `src/games/`.** It already keys on the right *shape* — every
`{ ok: false, error: <string literal> }` in the AST, deliberately a superset —
and still missed a third of the collection's refusals by scanning the wrong
*place*. A refusal lives wherever a `hint()` is built, and eleven of them are not
built under `games/`.

**A refusal SHALL be reachable only where the game's own tier declaration permits
search.** The permission is derived — a tier named `Unreasonable` is the
collection's promise that its boards may need search — never declared for a
guard's benefit. A hinting game with no difficulty contract SHALL NOT be able to
emit this refusal, and the guard SHALL assert that rather than skipping such a
game.

#### Scenario: A player exhausts deduction on a search-permitting board

- **WHEN** a hint is asked on a sound, unsolved board dealt at a tier whose name
  promises search
- **THEN** the refusal is the single constant, and it says what the player can do

#### Scenario: A game invents a phrasing

- **WHEN** a game returns its own sentence for deduction having run out
- **THEN** the refusal guard fails, whether the sentence is written at the game's
  call site or inside a shared module

#### Scenario: A shared hint builder inlines a refusal

- **WHEN** a module under `src/engine/` that builds a `hint()` writes a refusal
  as a string literal rather than importing the constant
- **THEN** the refusal guard sees it and fails, because its scan covers the
  engine's hint builders and not only `src/games/`

#### Scenario: A refusal escapes onto a deduction-complete tier

- **WHEN** a hint refuses on a board dealt at a tier that does not permit search
- **THEN** the walk fails — the defect is the refusal, not the wording

### Requirement: Sliding-permutation games share one slide planner whose exact search always runs

The engine SHALL provide a shared toroidal slide planner
(`src/engine/slide-planner.ts`) that every sliding-permutation game's
`hint` uses, rather than each game carrying its own copy of the search.

The planner SHALL own the parts that are hard and game-independent: a heuristic
forward search over slide moves; an exact bidirectional search that returns a
**shortest** path; and a **partial-plan** result when the search improves on the
starting board without reaching the goal (the plan runs out, the player is
closer, and the next request recomputes).

The planner SHALL work on **the board as the player sees it** — one integer per
cell, whose meaning is the game's — and SHALL NOT distinguish two boards that
look alike. A game whose pieces are not all distinct (Netslide's wire masks)
otherwise has the planner chasing arrangements no sequence of slides can produce:
on an odd-width torus every slide is an even permutation, so a target that
distinguishes identical pieces may sit in an unreachable coset while the finished
picture is a move away.

The planner SHALL be parameterized on what genuinely differs between games — the
grid, the legal move set (including whether a slide may cover more than one
step), the finished board, the goal test, and **how far from finished a board
is** — and SHALL contain no game-specific narration or rendering.

**The exact search SHALL run on every board**, before the heuristic search, and a
game SHALL supply only its budget — never a condition under which it runs. A game
that cannot afford the search omits it entirely; there is no third option.

This replaces a rule that let a game hold the search back for the boards that
needed it — as a last resort where the heuristic proved helpless, or behind a
cheap test for "nearly finished". Both cycle, and the reason is structural rather
than a matter of tuning: **a shortest plan does not look like progress on the way
home**, so a gate keyed on any cheap board measure switches off partway down the
descent the search itself opened, the heuristic takes back over, and it walks the
board back where it came from. Sixteen's 5×5 hint did exactly this — a period-4
cycle in which the board reached four tiles from finished and left again, for
ever — and the same board's shortest plan peaks at 17 tiles out of place and a
total travel of 30 on its way home from 9 and 9. Three gates were measured and
all three cycled.

The cost this rule accepts is the searches on boards too far away to reach, which
spend their whole budget and come back empty. A game's budget SHALL therefore be
the smallest that still crosses its worst endgame rather than the largest it can
afford, and the planner's own state storage SHALL be allocation-free and packed,
because how much a failed search costs is what decides whether the guarantee is
affordable at all.

The planner's consumers SHALL be guarded by their own hint suites and by the
cross-game resume walk, which is the only guard that sees this class of defect: a
walk that follows a plan to its end never recomputes, and so is green on a game
whose hint ping-pongs.

#### Scenario: A second sliding game reuses the planner

- **WHEN** a sliding-permutation game other than Sixteen implements `hint`
- **THEN** it supplies its own legal moves, distance measure, goal test and
  narration, and reuses the shared search rather than re-implementing it

#### Scenario: The exact search is not held back for the boards that need it

- **WHEN** a game configures the exact search
- **THEN** it runs on every board the game hints on, with no condition available
  for the game to attach to it

#### Scenario: A search that cannot reach the goal still helps

- **WHEN** the forward search improves on the starting board but exhausts its
  budget before reaching the goal
- **THEN** the planner returns the partial plan to its best board, rather than
  failing

#### Scenario: The exact search returns a shortest plan

- **WHEN** the exact search reaches the goal
- **THEN** the plan it returns is a shortest sequence of moves to it, so that
  playing its first move leaves the board strictly nearer the goal

### Requirement: The slide planner SHALL carry a last resort bounded by depth rather than by memory

The shared slide planner SHALL offer a second exact search for the boards its
state-bounded search cannot reach, and that search SHALL be bounded by **depth**
rather than by stored states: a breadth-first **endgame database** of every board
within a given number of slides of the goal, kept between hints because it
depends only on the goal and the move set, and a depth-first walk from the board
that slides a line in place and slides it back, holding one board however deep it
goes.

**The reason it must be shaped that way is a measurement, not a preference.**
Sixteen's swapped-pair endgames sit exactly nine moves from finished while
reading as two cells out, and the state-bounded search reaches eight at that
board size. Reaching nine by storing states costs 18–24 million of them, about
ten seconds and the better part of a gigabyte, which a browser tab may not spend;
so the hint gave up on those boards — twelve of forty walked 5×4 games and five
of forty 5×5 ones — saying no move would get the player closer, on boards that
were perfectly solvable. Splitting the same nine plies into a kept four-ply
database and a five-ply walk costs tens of megabytes and a few seconds, once per
game.

A game SHALL declare only the two depths, never a condition under which the
search runs. **The deep search SHALL reach at most one ply further than the
ungated search**, and this is the property that makes it safe to gate at all: a
plan it opens is then at most one move longer than the ungated search can
finish, so playing that plan's first move leaves a board the ungated search
handles, on every board, because the ungated search has no condition on it. Two
plies further would leave a board nothing ungated can finish, the gate would shut
on it, and the recompute cycle that `fix-sixteen-hint-recompute-stability`
removed would return.

**The database's completeness SHALL be asserted directly**, not inferred from the
search's answers. A hash index that narrows its key — a Zobrist hash stored in an
`Int32Array` and compared against an unsigned copy of itself — does not fail when
it is wrong; it goes half blind, returns "no plan" on boards it holds, and reads
exactly like a search that cannot reach far enough. It survived a full round of
measurement and produced a confident wrong conclusion about which boards were
reachable. An end-to-end agreement check does **not** catch it at test-sized
depths, because losing half of a small database changes no answer.

#### Scenario: A board past the state-bounded search still gets a plan

- **WHEN** a hint is asked on a board beyond the reach of the planner's
  state-bounded search, where the heuristic search is also at a strict local
  minimum
- **THEN** the deep search returns a shortest plan within its declared depths,
  rather than the planner returning nothing

#### Scenario: The two exact searches agree

- **WHEN** the same board is planned by the state-bounded search and by the deep
  search, both within reach
- **THEN** they return plans of the same length, each reaching the goal

#### Scenario: The database is asked whether it holds a board it must hold

- **WHEN** the deep search is configured to walk no plies at all, and asked about
  a board fewer slides from the goal than its database is deep
- **THEN** it returns a plan for that board, because the database holds every
  such board and can match it

#### Scenario: Following the deep search's plan converges

- **WHEN** a plan from the deep search is followed one move at a time, with a
  fresh plan computed after each move
- **THEN** each plan is strictly shorter than the last, and the walk reaches the
  goal

### Requirement: A hint that plans by searching SHALL refuse honestly past its reach

A `hint()` that plans by **searching ahead a bounded number of moves**, rather
than by deducing, SHALL refuse with the collection's single constant for a
search out of reach, and SHALL NOT use the refusal that says no move would get
the player closer.

The two say different things, and only one of them is checkable. "No move here
would get you closer" is a claim about the **board**; a game may make it only
where it has established it, which is why its remaining callers are
constructions that cannot return empty on an unsolved board. A bounded search
returning empty has established nothing about the board, only about itself.
Sixteen said the first sentence on tangled endgames a dozen moves from home
where most moves *did* get the player closer, on positions they had reached by
following thirty-odd of that same hint's suggestions.

The wording SHALL name what still works from such a position rather than only
reporting the failure, and SHALL NOT name a control that will fail for the same
reason the hint just did — continuous hinting refuses wherever a single hint
refuses, so pointing at it is advice that cannot work.

**The collection's strongest hint guarantee — that a hint never gives up on a
solvable board — SHALL be relaxed for exactly this population and no other.** A
deductive game can meet it: its deduction is complete for the tier, or the
tier's own name promises that search may be needed. A searching game has a
*reach* instead, and past it no budget makes an honest answer available — each
further ply of Sixteen's search costs about 40×. Such a game passes the walk on
the seeds it is given and MAY go red truthfully on a new one, which is the guard
reporting the truth rather than a regression.

**The relaxation SHALL be derived from what the game is**, by reading which
games call the shared planner out of their own comment-stripped source, never
from a declaration a game makes for the guard's benefit. Where the derivation
cannot see *why* a member has a reach, that reason SHALL be recorded per member
and the derivation SHALL assert the ledger is exactly right — so an empty
derivation, which would silently restore the unattainable promise with every
assertion still passing, fails instead.

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

#### Scenario: A deductive game borrows the search refusal

- **WHEN** a game that does not call the shared planner refuses with the
  search-out-of-reach message
- **THEN** the walk fails, because the relaxation is derived from the mechanic
  and that game does not have it

#### Scenario: The derivation finds nobody

- **WHEN** the source scan that derives the searching games matches nothing
- **THEN** the ledger equality fails, rather than every walk silently passing
  under the old promise

### Requirement: A plan steered by a measure SHALL be steered by one measure

Where a `hint()` plans by searching under a heuristic measure of the board,
exactly **one** such measure SHALL be in play on every board. A game SHALL NOT
apply a second, sharper measure only where the first is helpless.

This is the recompute-stability rule one level down. A plan is recomputed after
every move the player makes, so a *measure* that changes between recomputes
ping-pongs exactly as two plans do: the sharper measure walks the board out of a
position, the blunt one measures the result and walks it back, and neither is
wrong by its own lights. Measured on Sixteen — as a last-resort second pass the
named board ran 400 recomputed hints without solving; as the only measure it
solved in sixteen.

**Sharpening a measure SHALL be checked against every gate that reads it.** A
search gated on "the fallback found nothing better than standing still" is gated
on a statement *about the measure*, so a sharper measure silently changes which
boards reach it. Sixteen's deep search stopped firing on the very endgames it
was built for, turning a complete nine-move plan into a five-move partial one,
in a change whose whole intent was to refuse less. A sharpened measure SHALL
therefore differ from the blunt one only where the searches above it cannot help
anyway, so that every board they own is measured exactly as before.

#### Scenario: A sharper measure is armed only where the blunt one is stuck

- **WHEN** a game's hint measures a board one way normally and another way where
  the first way is helpless
- **THEN** the resume walk fails to converge, because consecutive recomputes
  steer by different measures

#### Scenario: A sharpened measure disarms a gate that read it

- **WHEN** a measure is sharpened and a search is gated on that measure finding
  no improvement
- **THEN** the gate stops opening, and the boards it owned lose the plans it gave
  them — so the sharpening is confined to boards past that search's reach

### Requirement: Hint narration SHALL NOT use an em-dash

Player-facing hint text SHALL NOT contain U+2014, in a game's own narration or
in the shared narration and refusal wording the engine writes on a game's
behalf. A comma, a semicolon, a colon, a sentence break or a parenthetical aside
SHALL be used instead.

The rule is about the punctuation only. A rewrite SHALL preserve the step's
indication → reasoning → conclusion arc and its necessity modal; **removing a
clause to remove the dash is a violation of the narration-quality bar**, not a
way of satisfying this one.

The **en-dash** (U+2013) SHALL NOT be swept up with it, because it is used as
notation rather than as punctuation: a domino written `3–5` is a name, not a
connective.

The guard SHALL find its population the way every cross-game hint guard here
does — from the games that declare a `hint()` — and SHALL additionally scan the
engine's own shipped code, because a family's narration is frequently written
once in the engine and shared across its games. A guard that scanned only the
game directories would report a clean collection while the sentence those games
display carried the character.

The engine scan SHALL exclude test files and the `engine/testing/` tree by
those structural facts rather than by a roster of filenames, so that a new
shared narration module is covered by existing, and a new test helper is
excluded, without anyone maintaining a list.

Both the source scans and the runtime narration sweep SHALL apply the rule.
They are kept as overlapping nets on purpose: the runtime sweep sees only the
narration arms that fire on the boards it walks, and a source scan sees only
what is written as a literal.

#### Scenario: A game's narration adds an em-dash

- **WHEN** a hinting game's source writes an em-dash in a narration string
- **THEN** the cross-game narration guard fails, naming the game and the line

#### Scenario: Shared engine narration adds an em-dash

- **WHEN** a shared narration or refusal string in the engine's shipped code
  writes an em-dash
- **THEN** the guard fails, naming the module and the line, even though no game
  directory changed

#### Scenario: A domino label keeps its en-dash

- **WHEN** a game writes a value such as `3–5` with an en-dash
- **THEN** the guard does not fire, because only U+2014 is retired

### Requirement: A hint SHALL show only steps the player's board does not already decide

A deductive hint SHALL NOT show a step whose every change the player's board
already decides. The shared plan loop (`deduceHintPlan`) SHALL provide the
mechanism, as an optional `showable(board, firing)` judgment the game supplies:

- a firing that is not showable SHALL still advance the plan's working board,
  since later firings may rest on it, and SHALL NOT become a step;
- the plan cap SHALL count shown steps only, so hidden firings can never turn a
  plan into a refusal;
- the loop SHALL report how many firings it hid, and SHALL tick its step budget
  for hidden firings as for shown ones.

What is evident is the game's to judge, since it depends on what that game
draws; the judgment SHALL hide only conclusions the player's board already
shows, and SHALL NOT hide a change the win condition needs. Where a game derives
it from move legality — the game would refuse the move (Galaxies) or its
contrary (Tracks) — that derivation SHALL be judged on the board before the
firing, and a game that declares which rules are evident SHALL hold the
declaration to such a derivation in a test.

#### Scenario: A redundant deduction is never a step

- **WHEN** a deduction's every change is one the player's board already decides
  — Tracks' "a finished piece's other two sides are blocked", beside squares the
  player has marked empty
- **THEN** the plan applies it to its working board and shows no step for it

#### Scenario: Hidden firings do not spend the plan cap

- **WHEN** several hidden firings precede the next showable one and the plan cap
  is one step
- **THEN** the plan holds that showable step, and reports the hidden ones as a
  count

#### Scenario: A hidden firing that changes nothing still terminates

- **WHEN** a firing is hidden but changes nothing, so the loop would ask for it
  again for ever
- **THEN** the step budget throws, exactly as it does for a shown one

### Requirement: A game's hint sentences SHALL live in one text module per game

Every game whose hint speaks SHALL keep every sentence it speaks, and every word inside
one, in `src/games/<id>/hint-text.ts`, exported as `say`; sentences several games speak
word for word SHALL live in `src/engine/hint-text.ts`. A game's narration SHALL decide
only which sentence a step speaks and with what values, passing values as the board means
them (counts, axes, directions, the deduction's own record) and never words, and a text
module SHALL NOT read the board. Refusal messages are outside this requirement: they are
held to one list by `src/engine/hint-refusal.ts` and its guard. A hint that speaks no
words has no text module.

The population SHALL be derived, not declared: a cross-game test finds the games whose
hint speaks and asserts that each has a text module and that no text module belongs to a
game whose hint does not speak.

#### Scenario: A new game's hint speaks

- **WHEN** a game gains a `hint()` whose steps carry narration and no `hint-text.ts`
- **THEN** the cross-game guard fails, naming the game

#### Scenario: Rewording a sentence

- **WHEN** a sentence's wording changes
- **THEN** the change touches the game's `hint-text.ts`, or the engine's for a sentence
  several games share, and not the code that decides which sentence fires

### Requirement: Hint narration SHALL be short enough to read at a glance

Every hint step's narration SHALL be at most 120 characters. The check SHALL
cover every hinting game at every tier and on every preset, since a mode a
preset selects can speak sentences no tier reaches, and SHALL walk each board's
plans into the middle of the game rather than reading only the opening plan,
because the sentences that need room are the ones spoken once more of the board
is decided. That much SHALL run on every commit.

The check SHALL **additionally** cover each tiered game's **last preset at its
hardest teachable tier** — the `presets × tiers` corner that "every tier of the
first preset" and "every preset at its own tier" both miss, and which a player
reaches through the Custom dialog. A tier the game declares as a search tier is
excluded from that rule, because a hint refuses where a guess is needed. This
rule and the ledger's rot half below SHALL be scoped by role under the
`build-pipeline` conditions for deferring an assertion to the push-time
backstop: off in the automatic per-commit hook, and running in CI on every push
and in a manual `npm run gate`. Measured 2026-09-20, it is 47 s of the block's
83, and the per-commit test selector reaches this guard from any staged path
under `src/games/`, so it otherwise lands on nearly every commit; what it
protects is decay rather than the narration the commit just wrote.

A step MAY exceed the limit only when a ledger entry lists its rung
(`HintStep.rung`) for its game, with the reason that rung's sentences need the
room. An entry SHALL name rungs by id and SHALL NOT match a step's sentence, so
that rewording a sentence cannot take it out of its listing unseen; and every
rung an entry lists SHALL be one its games declare. A ledgered sentence SHALL
still be at most 300 characters. The ledger SHALL be asserted in both
directions, and **the unit of both directions SHALL be the
`(entry, game, rung)` listing rather than the entry**: a step over the limit
whose rung no entry listing its game names fails, and a listing whose rung its
game never speaks over the limit fails, so a sentence brought under the limit
takes its listing with it and a game that stops speaking a shared rung at
length takes its listing with it. Keyed by entry alone, the reverse direction
passes as soon as any one listed game reaches the rung, which leaves a game
listed on a shared rung it never speaks at length invisible.

The forward direction SHALL run on every commit; the reverse direction SHALL
defer with the corner rule its verdict is decided against, and SHALL be
**skipped** rather than evaluated when that rule did not run, because with the
corner unwalked it would report a live listing as dead.

Because the reverse direction asserts a **negative over the walk's sample**, the
check SHALL carry a vacuity floor per listed game as well as one over the whole
walk, so that a game whose boards all failed to generate cannot read as a dead
listing; and a listing SHALL NOT be deleted on the gate walk's silence alone,
but on a widened walk of that game recorded beside the entry.

#### Scenario: A long sentence without a ledger entry fails

- **WHEN** a hint step's narration is longer than 120 characters and no ledger
  entry for its game lists its rung
- **THEN** the check fails, naming the sentence, its rung and its length
- **AND** it does so on the per-commit path, not only on push

#### Scenario: A ledger entry that no longer matches anything long fails

- **WHEN** a ledgered rung's sentences are shortened under 120 characters, or
  the rung stops being spoken
- **THEN** the check fails until the listing is deleted

#### Scenario: A game listed on a shared sentence it never speaks fails

- **WHEN** a ledger entry names several games and one of them never speaks the
  rung over the limit, while the others do
- **THEN** the check fails naming that game and that entry, and does not pass
  on the strength of the games that do speak it

#### Scenario: A listed game whose walk examined nothing is not reported as dead

- **WHEN** every board for a listed game fails to generate, so its walk
  contributes no steps
- **THEN** the check fails reporting that the game's walk looked at nothing,
  rather than reporting its listings as dead exemptions

#### Scenario: The rot half is skipped when the corner walk did not run

- **WHEN** the run is the automatic per-commit hook, so the last-preset corner
  is not walked
- **THEN** the reverse direction is reported as skipped rather than evaluated,
  and the forward direction still runs in full
- **BECAUSE** a listing whose only sentence lives in the unwalked corner would
  otherwise be reported dead on a walk that could not have heard it

#### Scenario: A ledgered sentence still has a ceiling

- **WHEN** a ledgered sentence grows past 300 characters
- **THEN** the check fails, ledger or not

#### Scenario: A reworded sentence keeps its listing

- **WHEN** a ledgered rung's sentence is reworded and stays over the limit
- **THEN** its listing still excuses it, with no edit to the ledger

#### Scenario: A listing for a rung the game does not have

- **WHEN** a ledger entry lists a rung that one of its games does not declare
- **THEN** the check fails on every commit, naming the game and the rung

### Requirement: A Hint press in flight is dropped, and a slow one says it is thinking

While a Hint press is being answered by the worker, a further press SHALL be
dropped — not queued. Nothing else in the app queues behind a hint either:
the show/apply rhythm of "The toolbar Hint button alternates show and apply"
SHALL be exactly as it would be had the dropped presses never happened, in
both beats (during a *show* nothing is armed yet; during an *apply* the step
was disarmed on the way in).

A show whose answer lands after Auto-Hint has been started SHALL NOT arm the
apply behind it: Auto-Hint owns the plan from the moment it starts.

A press unanswered after a short delay (`HINT_PENDING_MS`, 300 ms) SHALL be
visible as work in progress: the Hint control's label and the hint banner
SHALL both say "Thinking…" until the answer lands. The delay exists so an
ordinary hint never flickers. When the answer lands, the label reverts to the
beat the next press will take, and the banner shows the answer's own message
(a refusal, "Hint applied") or is cleared if the show succeeded.

A slow hint is deliberately **not cancellable**: the search runs synchronously
inside the worker, so an interrupt would need every game's search to poll a
flag, and the longest case is a few seconds once or twice a game. Making the
wait legible is the whole remedy.

#### Scenario: Presses during a slow hint are dropped, and the rhythm survives

- **WHEN** the player presses Hint three times while the first press is still
  being answered
- **THEN** exactly one request reaches the worker, and the press after it
  lands applies the step that press showed

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

### Requirement: A hint step always names a technique, with no un-narrated fallback

A displayed hint step SHALL always explain *why* its move is forced by a named
technique; a game's hint SHALL NOT emit a generic, unexplained "fallback" step
(e.g. "only one arrangement fits") for a deduction its technique set does not
cover. A game SHALL satisfy this by one of two strategies: **narrating every
deduction** its generator accepts (promoting any catch-all into an honest, if
non-local or tedious, technique — as Filling narrates its global
candidate-elimination), or **rejecting at generation** the boards whose solution
needs a deduction it cannot narrate (see the `ts-migration` narratable-deduction
generation policy). This is the Hint-System companion to that generation policy.

**A search is not a technique, but a chain is — if it is walked.** A deduction
that reaches its conclusion through a hypothesis SHALL be classified by whether
the reasoning is a **bounded run of individually glanceable steps**:

- **Check** — a contradiction visible **at the placement**, with no propagation.
  Ordinary deduction; narratable at any tier.
- **Tactic** — a **bounded** chain of forced consequences to a named endpoint.
  Permitted at a non-`Unreasonable` tier, and its hint SHALL **show the chain on
  the board** — every link marked, *in the order it falls*, with both ends
  anchored (the hypothesis and the contradiction) — rather than compressing it
  into a single claim the player can only check by redoing the deduction. The
  narration SHALL name the two ends and cite the links by their position, and
  SHALL supply the **rule that propagates the chain**, which is the technique
  being taught and is nowhere on the board. Where the conclusion rests on more
  than one branch of a case split, the narration SHALL say so; a conclusion that
  does not follow from its own stated premises is a defect.

  **The order is not optional and is not the marks' array position.** A set of
  marked cells with no order is not a chain — the narration's "then", "next" and
  "by the time you reach" name nothing the player can follow, which is the
  compressed-claim failure in a different costume. A game SHALL therefore declare
  each link's position as data its renderer reads, and that position SHALL reach
  the canvas.

  **The order SHALL be drawn as an ordinal, not as a path.** A line or arrow
  between consecutive links asserts that each forces the next, which is true of
  some chains and false of others — measured at **34%** false for Clusters, whose
  links are forced by their own neighborhood rather than by their predecessor in
  discovery order. One mark means one thing across the collection, so every game
  draws the weakest claim every chain can make: *this is the order they fall in*.

  A Tactic SHALL NOT be required to advance one leg at a time. That stricter
  reading — a display-only step per link, so the player is walked through one
  inference at a time — was designed, costed and **set aside by owner decision**
  (2026-08-12): holding a *hypothesis* in mind is acceptable, holding the *chain*
  is not, and marking the chain meets the weaker requirement without widening
  `HintStep` (whose `move` is required, and which 29 games' types live under).
- **Search** — running the whole solver from a hypothesis, or branching and
  backtracking. The hint SHALL NOT report its survivor as a deduction on any
  tier; it SHALL refuse, and the refusal SHALL say that deduction has run out
  rather than reading as a failure.

The test is therefore not whether a trial propagates, nor whether the technique
is called "forcing", but whether the propagation is bounded and can be laid out
for the player.

**A rung SHALL be classified by the bound it guarantees, not by the depth it
typically reaches.** Two rungs may be *the same function* invoked with different
limits and still fall on opposite sides of this line, and the observed
distributions may be indistinguishable at the median while differing entirely in
the tail. Where a game gates a rung on such a bound, that bound SHALL be defined
once and documented as load-bearing for the tier's name rather than as a
performance dial.

Where two rungs differ in this way but produce **the same narration** — so that a
wording check cannot tell them apart — the guarantee that the hint reaches only
the permitted one SHALL be structural and asserted directly (for instance, that
planning at the harder tier yields the same plan as planning at the permitted
one), with a control that prevents the assertion holding vacuously.

Games whose hints are **strategic** rather than deductive — a stable subgoal plus
the next move serving it, justified by a monotone potential rather than by force
— are outside this classification entirely and narrate imperatively.

The tier names follow the same line. A tier whose boards can require **Search**
SHALL be named `Unreasonable`; no other tier name may require it. A game whose
hard tier ships a propagating trial SHALL resolve it by whichever of these the
game's ladder determines — and **SHALL NOT delete the tier**:

- where a tier named `Unreasonable` already sits above the rung's tier, **the
  rung moves up to it**, and the lower tier is re-graded by what remains;
- where the rung's tier is the game's **top** tier, **that tier is renamed**
  `Unreasonable`;
- where emptying the tier would leave it with the same technique set as the tier
  below — so that no board can be solvable at it and not below, and the tier
  therefore generates nothing — the game SHALL first **build the missing
  deductive rung** and re-grade, then move the trial up.

"SHALL NOT delete the tier" is about tiers that **name boards**. Where a rename
would leave an ordering a player cannot read because a name above it belongs to a
tier that generates nothing — one already refused at generation on a measurement
— that name MAY be dropped from the tier list, provided its encoded difficulty
character still decodes and still round-trips, so that no existing game ID or
saved game changes meaning, and provided the refusal keeps its reason. Nothing a
player could previously play is thereby removed.

**A tier list SHALL have one definition per game**, read by the preset menu, the
difficulty contract and the custom-params dialog alike. A hand-copied second list
ships a menu and a dialog that disagree the first time a tier is renamed.

**Dropping a name from a declared tier list silently drops whatever cross-game
guard iterates that list.** A game that shortens its list SHALL re-establish the
lost guarantee in its own tests — at minimum that the undeclared tier's
difficulty character still round-trips.

A rung that moves SHALL be shown to leave its old tier still generable, at every
size the game offers, before the move is called done; a size/tier pair that
becomes ungenerable SHALL be refused by `validateParams` with a reason rather
than silently downgraded.

**A narration SHALL identify every element it refers to.** Where a displayed
step marks **more than one** element on the board, its narration SHALL NOT refer
to the acted-on element by a bare deictic alone ("this cell", "this square",
"here"): with two marks in view and no tie between them, such a phrase points at
neither, and the reader must infer the mark-role convention before the sentence
parses. The narration SHALL tie the acted-on element to the others by one of:

- a **relation the code guarantees** — "its ringed red *neighbor*", "the shaded
  brick *above*", "the end of the shaded run". A relation asserted in prose but
  not enforced in code is a false claim and is forbidden by the same rule that
  governs every other sentence a hint utters;
- a **value or other concrete identifier** the player can read off the board, in
  games that have one ("This 3 shares a line with the ringed white 3");
- a **role word tied to the mark's shape**, where the game's other marks already
  use distinct ones ("ringed" for an outline against "shaded" for a wash);
- a **number on the other marks**, where the step marks an ordered chain: the
  narration names those elements by their position and keeps the bare deictic for
  the one carrying no number. A numbered mark and an unnumbered one are not the
  same kind of thing, which is the general rule the three ties above are each an
  instance of.

A narration SHALL NOT identify an element by its **color**. Color is never the
only cue available to a player: the palette is scheme-relative by construction,
so a hue named in prose is wrong under the other scheme, and the sentence is
unreadable to a color-blind player. This holds even where the game's marks
differ only by hue — in that case the *marks* need fixing, not the sentence.

Where a step marks exactly one element, a bare deictic is correct and a
qualifier is noise.

This requirement governs deductive (logic) games. Movement/objective games whose
hint is heuristic or an `aux`-walk carry an intentionally empty or imperative
explanation and are exempt.

#### Scenario: A logic game's hint never shows an unexplained step

- **WHEN** a hint plan is computed for any board of a deductive game
- **THEN** every step names the technique that forces it (its explanation is not a
  generic "only one arrangement fits" placeholder)

#### Scenario: A step showing two marks says which one it is acting on

- **WHEN** a displayed hint step marks both the cell it acts on and a second
  element it reasons from
- **THEN** its narration ties the two together — by a relation the code
  guarantees, by a concrete value, or by distinct role words — rather than
  referring to the acted-on cell as "this cell" alone

#### Scenario: The tie is never a color name

- **WHEN** a narration must distinguish the acted-on element from another mark
- **THEN** it does so without naming either element's color, so the sentence
  stays true under both color schemes and to a reader who cannot distinguish
  the hues

#### Scenario: A single-mark step keeps its bare deictic

- **WHEN** a displayed hint step marks only the cell it acts on
- **THEN** "this cell" is sufficient and no disambiguating phrase is required

#### Scenario: A movement game's hint is exempt

- **WHEN** a movement/objective game (no deductive "why") returns a hint
- **THEN** an empty or imperative explanation is permitted and is not a violation

A game MAY still run the trial to **certify** a position — to establish that no
value the player has already entered is wrong, which some hints require before
offering any step at all. Certifying is not narrating: the plan records only the
deductions it may teach, and stops recording at the first point the trial is
needed, while the walk that produces the verdict continues.

#### Scenario: A search may certify a position but never teach one

- **WHEN** a game's hint must first establish that the player's board is still
  consistent with the unique solution, and doing so needs the propagating trial
- **THEN** the trial may run to produce that verdict, and the plan the player is
  shown contains only the steps up to the first point the trial was needed

#### Scenario: Deduction running out is refused, not guessed past

- **WHEN** the only remaining progress on a board needs a value assumed and the
  **whole solver** run from it, or a branch explored and backtracked
- **THEN** the hint refuses with a message saying deduction has run out, and
  does not present the surviving assumption as a technique

#### Scenario: A bounded chain is walked, not asserted

- **WHEN** a hint's next deduction is a bounded chain of forced consequences
  reaching a named contradiction
- **THEN** every link is marked on the board in the order it falls, with the
  hypothesis and the contradiction both anchored, and the narration names the two
  ends, cites the links by position and states the rule that propagates them —
  rather than one sentence asserting the conclusion
- **AND** where the conclusion rests on a case split, the narration states both
  branches
- **AND** the player walks it on the board at their own pace; the hint is not
  required to advance one link per step (`walk-tactic-hint-chains` D2 — the
  scenario keeps its name because renaming one is a deletion, and its THEN is
  what binds)

#### Scenario: A declared chain order reaches the canvas

- **WHEN** a hint step declares a position for each link of a chain
- **THEN** those positions are exactly `1..n`, and the frame drawn for that step
  paints every one of them in the ordinal's own color
- **AND** the check is made against the resolved color rather than a palette
  index or the bare glyph, since a candidate game already prints those digits as
  pencil marks

#### Scenario: Two strengths of one rung are classified separately

- **WHEN** a game applies the same trial function at two tiers, bounding the
  hypothesis' consequences at one and leaving them unbounded at the other
- **THEN** the bounded one is a Tactic and the unbounded one a Search, whatever
  their measured distributions look like on typical boards
- **AND** the game asserts structurally that its hint reaches only the bounded
  one, because both produce the same words

#### Scenario: A tier that can require guessing says so in its name

- **WHEN** a game's generator can emit, at a given tier, a board whose solution
  needs a propagating trial
- **THEN** that tier is named `Unreasonable`

#### Scenario: Moving a trial rung up leaves the tier below still generable

- **WHEN** a propagating rung is moved off a tier to the game's `Unreasonable`
  tier
- **THEN** every size the game offers still generates at the vacated tier, or
  that size/tier pair is refused by `validateParams` with a reason the player
  can read — the tier is never left silently unreachable, and never quietly
  downgraded to another difficulty

### Requirement: A note a hint asks for is placed beside the step that uses it

Where a hint plan asks the player to record a fact as a note, and the note's own
explanation asserts only what stays true as the board fills, that note SHALL be placed
immediately before the step whose reasoning rests on it. Where the explanation asserts
something the board can stop satisfying, the note SHALL be placed at the latest
position its explanation still describes, which is beside its consumer whenever the
board allows. A journey SHALL be one deduction: the notes placed together SHALL be
split into the separate derivations they make, each its own journey, and a note SHALL
NOT be part of the journey of a step that does not rest on it.

A note placed where the solver happened to *discover* the fact reads as an unmotivated
triviality, because nothing on screen connects it to the deduction it serves. And a
journey that gathers every note a step rests on reads as a tour of the board, because
independent derivations sit wherever their clues are.

Deferring a note cannot make its fact underivable, since facts only accumulate — but
it can make the note's *explanation* false, where that explanation asserts something
the board can stop satisfying, such as which of a clue's edges are still open. A plan
SHALL NOT offer a note whose explanation is false of the board it is shown on, and the
placement rule is bounded by that.

#### Scenario: a fact found long before it is used

- **WHEN** a plan's step rests on a fact its solver derived many steps earlier, and the
  note's explanation asserts only what stays true as the board fills
- **THEN** the note placing that fact is offered immediately before that step, not at
  the point it was derived

#### Scenario: an explanation the board outgrows

- **WHEN** a note's explanation names which of a clue's or a dot's edges are still
  open, and further edges are settled before the step that cites the note
- **THEN** the note is **not** moved to its consumer, and is offered at a position its
  explanation still describes, rather than beside its consumer carrying a stale claim

#### Scenario: a step resting on two separate derivations

- **WHEN** a step rests on notes that come from two derivations, neither citing the
  other
- **THEN** each derivation is offered as its own journey, and the step follows them
  as a journey of its own rather than as the last leg of either

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

### Requirement: GameDrawing draws the hint's line hatch

`GameDrawing` SHALL expose `drawHatch(rect, color, period)`: translucent diagonal
bands of `color`, half of `period` wide, clipped to `rect` and laid on the lines
`x + y = k · period` of the whole canvas, so that neighboring rects hatched
separately form one unbroken pattern. Every `GameDrawing` implementation SHALL
take the band geometry from the engine's one definition (`hatchBands`) and the
opacity from its one constant, and a hatching game's stripes SHALL be visible
against its board in both color schemes.

#### Scenario: Two tiles hatched separately join up

- **WHEN** a game hatches two adjacent tiles in separate calls
- **THEN** whether any point is striped depends on its canvas coordinates alone,
  so the stripes run on across the shared edge

#### Scenario: A hatching game's stripes show in both schemes

- **WHEN** a game whose code calls `drawHatch` shows a hint that hatches a line
- **THEN** the hatch color blended over its board background at the hatch
  opacity differs from the background by more than the stripe-visibility bar, in
  the light and the dark palette the app paints

### Requirement: A hint hatches the one line its sentence names

A hint step whose sentence names exactly one row or column as the line it reasons
about ("in this row", "this column's run", "Row 3 still needs") SHALL hatch that
line, and the clue slot at its end where the game draws one, and SHALL hatch
nothing when its sentence names no line or several. It SHALL NOT also outline
that line: an outline marks the particular cells a reason rests on. Every step
that carries a line to hatch SHALL draw the hatch, and no other step SHALL draw
one. The row/column candidate preset SHALL hatch a hidden single's line.

#### Scenario: A hidden single hatches its line and outlines nothing

- **WHEN** a row/column candidate game's plan places a hidden single ("Every
  other cell in this row rules out 3, so this cell must be 3")
- **THEN** the step hatches exactly the cells of that row and its evidence
  outline is empty

#### Scenario: Every hinting game draws exactly the hatches its steps name

- **WHEN** any hinting game's plan is walked and each step drawn on a full
  repaint
- **THEN** a step naming a line draws hatch operations, and a step naming none
  draws no hatch

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

### Requirement: A set outlines the cells it rests on

A generic Latin set elimination SHALL record the cells whose candidates account for the
values it strikes, and a game's hint SHALL outline them as the step's evidence, so the
sentence that names them ("the outlined cells already account for …") points at cells
the player can see.

#### Scenario: A set's sentence names outlined cells

- **WHEN** a row/column game's hint strikes a candidate by a set
- **THEN** the step outlines the cells of the set and its sentence speaks of the
  outlined cells

### Requirement: A preference change drops the stored hint plan

A hint plan is built from the board and the game's preferences, so when the player
changes a preference while the midend holds a plan, the midend SHALL drop that plan and
clear any displayed step, and the next hint SHALL be built under the new values.

#### Scenario: Switching how hints pencil in takes effect on the next hint

- **WHEN** the player has applied a hint step built under "Only as needed" and then
  chooses "Every candidate first"
- **THEN** the displayed hint is cleared, and the next hint opens with the populate
  reading's setup rather than continuing the old plan

### Requirement: A piece a hint acts on is ringed as one shape

Where a hint step acts on a **piece** spanning several squares — a domino it
places, a domino it decides whole — the target mark SHALL be one ring around the
piece, drawing a side only where the square across it is not in the same piece,
rather than a ring per square with a double bar across the piece's middle.

The shared hint-mark painter SHALL own the drawing, and a game SHALL supply only
which squares belong together: a relation for the targets, and optionally one for
the evidence when the evidence is whole pieces, so that two pieces side by side
stay two shapes rather than one that is not on the board. Without a relation,
targets SHALL be ringed per square and evidence SHALL be outlined as one contour
per connected region, exactly as for a game with no pieces.

Because a join lets a square's sides change while its role does not, a game whose
mark lies inside the content box and that supplies a relation SHALL key each
square's repaint on the sides drawn around it rather than on its role alone.

#### Scenario: A domino placement is one ring

- **WHEN** a Dominosa hint step asks the player to place a domino
- **THEN** the target mark is one ring of six sides around its two squares
- **AND** a barrier step's two squares are still ringed one each, with the wall
  between them marked

#### Scenario: A domino decided whole is one ring

- **WHEN** a Magnets hint step decides a whole domino (neutral, or marked `?`)
- **THEN** the target mark is one ring of six sides around both ends, drawn by
  the shared painter rather than a pass of the game's own

#### Scenario: A game with no pieces is unchanged

- **WHEN** a game supplies no piece relation
- **THEN** each target square is ringed on all four sides and a contiguous
  evidence region is one contour

### Requirement: The engine SHALL own the hint mark roles and the words for them

The engine SHALL define the roles a hint mark plays, each with one meaning in
every game: a **ring** marks what the step decides, an **outline** marks what
the step reasons from, and **stripes** mark the line or region the sentence
names. The engine SHALL own each role's noun and adjective ("ringed",
"outlined", "striped"). A game MAY add a role only when none of the three fits,
and the change adding it SHALL say why.

A mark is drawn on an element of a **kind** (a cell, a note, an edge, a game's
own such as Signpost's arrow). A kind SHALL key its elements so that two names
for one element compare equal, and SHALL say what a noun about them counts, so
"this cage" stays singular over its cells. An element drawn inside another (a
note in its cell) SHALL mark and name that one with it.

A clue drawn recolored is a glyph for a role, not a role of its own: a clue the
step reasons from SHALL be an outline reference, whatever color the game paints
it.

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

### Requirement: A bound hint step's words SHALL name exactly the marks it draws

A game MAY declare the `hintMarks` section of its contract: what each role marks
in that game. A game that declares it is **bound**, and every one of its hint
steps SHALL carry its sentence as words built from references to marks, with
the explanation equal to their text.

A bound game's renderer SHALL paint every hint mark from the step's words, by
role and kind (`stepMarks`), and from nothing else. A highlight field MAY carry
data that is not a mark, painted only where a named mark is. The glyph a role
takes on a kind remains the game's.

For every step of a bound game, measured on the frame its renderer paints from a
fresh draw state: removing any one element the words name from them SHALL
change the frame; removing every reference SHALL leave the frame the game paints
with no hint shown; and every role the words name SHALL be listed in the game's
legend. The hint-quality walk SHALL check this on every step it visits, through
whole games and under each candidate reading a game offers, and on each step as
a refresh returns it.

Where a shared mechanic paints for several games, it SHALL read the words: the
candidate games' overlay and the border grid's marks are the references the
sentence makes.

#### Scenario: A step draws a mark its words never name

- **WHEN** a bound game's step rings an edge its sentence does not name
- **THEN** the walk fails, naming the step and the unnamed mark

#### Scenario: A continuation leg keeps showing evidence

- **WHEN** a later leg of a multi-edge firing still shows the evidence the first
  leg reasoned from
- **THEN** its sentence names that evidence ("for the same striped region") as
  well as the edges it rings

#### Scenario: The words name a mark the renderer does not paint

- **WHEN** a bound game's words call a square outlined and its renderer paints
  no outline there, because a ring wins that square
- **THEN** the walk fails, naming the outline as not drawn, because removing it
  from the words leaves the frame unchanged

#### Scenario: A renderer still paints a mark from a highlight field

- **WHEN** a bound game's renderer outlines squares listed in its highlights
  rather than the squares its words outline
- **THEN** the walk fails, because the frame with every reference removed still
  shows the outline

### Requirement: A refresh that shrinks a hint step SHALL rewrite its words

When a stored step's marks shrink, because some of what it strikes is already
gone, the step's words SHALL be narrowed to the marks that remain and re-rendered,
so the sentence never names a note the step no longer strikes.

#### Scenario: One of two struck notes is already gone

- **WHEN** a stored step reads "…so we must cross out 1 and 2" and the 1 has
  been struck by the time it is shown
- **THEN** the refreshed step reads "…so we must cross out 2" and rings only the 2

### Requirement: A bound game's help SHALL list its marks from its legend

A bound game's help page SHALL mark where its list of marks goes, and the help
build SHALL replace that mark with one entry per role in the game's legend, led
by the engine's words for the role. A bound game's page without the mark, or an
unbound game's page with one, SHALL fail the build.

#### Scenario: A game binds its hint

- **WHEN** a game declares `hintMarks`
- **THEN** its help page's Hints section lists "A ring marks …", "An outline
  marks …" and "Stripes mark …" for the roles its legend lists, in the game's
  own words for what each marks there

### Requirement: Every hinted game SHALL be bound

Every game that declares a `hint` SHALL declare the `hintMarks` section, so
every hint step in the collection names exactly the marks it draws, and every
hinted game's help page SHALL list its marks from its legend.

#### Scenario: A hinted game without a legend

- **WHEN** a registered game declares `hint` and not `hintMarks`
- **THEN** the hint-quality suite fails, naming the game

### Requirement: A hint step is played by the pointer gesture that makes it
Every game with a `hint` SHALL declare `hintGesture(state, ui, ds, move, step)`, returning the taps, drags and on-screen keys by which a pointer alone makes a hint step's move from the live board and `Ui`; `step` is the whole step on display, so a gesture may be found by asking the game's `hintKeepTrack`. `midend.executeHint()` SHALL NOT apply a step's move; it SHALL send the step's gesture through the game's `interpretMove` as the frontend delivers pointer input (a click as a press and its release, a drag as a press, its drag events and a release, a declined press as its release alone, and a key at the origin), and SHALL judge each move that makes with the game's `hintKeepTrack`. A key in a gesture SHALL be one the game's on-screen keypad offers, or the mark-all control where the game has one.

The midend SHALL throw, naming the step and the gesture, when the gesture makes a move `hintKeepTrack` calls off the step, makes a move after the step completed, presses a key no on-screen control sends, or ends without completing the step; and when a hinted game has no `hintGesture`. `hint-gesture.test.ts` SHALL walk every hinted game's plans with `executeHint` on every gate preset.

#### Scenario: A step the pointer cannot make fails the walk
- **WHEN** a hinted game's plan contains a step whose move no tap, drag or on-screen key makes
- **THEN** its gesture either makes some other move, which `hintKeepTrack` calls off, or makes none, and `hint-gesture.test.ts` fails for that game

#### Scenario: A step made in several moves completes on the last
- **WHEN** a step's move is made by several pointer moves, such as three note strikes or two quarter turns
- **THEN** the earlier moves are judged on track and committed, the last completes the step, and the plan advances when it settles

#### Scenario: A key the player has no control for is refused
- **WHEN** a gesture presses a key that is neither on the game's keypad nor the mark-all control
- **THEN** `executeHint` throws, naming the key

### Requirement: A target-verb game's hint clicks come from its verbs
A game declaring `Game.targetVerbs` SHALL make a hint step that is one click on each of some targets through the engine's `verbClicks`, supplying only the step's targets in order. The engine SHALL choose each target's button by applying each button's declared verb there, left before right, and keeping the first whose move the game's `hintKeepTrack` judges on the step, judging a copy of the step and applying the verbs to a copy of the `Ui`; it SHALL aim each click at the geometry's `pointAt`, SHALL end the gesture at the click that completes the step, and SHALL throw, naming the target, where no button's verb keeps the step. A step made otherwise (a drag, or several presses of one target over values the step accepts) stays the game's own gesture.

A drag game's own press arm SHALL park the cursor through the engine's `pressTarget`, and the release of a drag that never left its target SHALL apply the verb the engine's `buttonVerb` names for the button, so the arm names neither the cursor's handling nor which verb a button applies.

#### Scenario: The button is the one the step keeps
- **WHEN** a step wants a square white and the left button's verb would make it black while the right button's makes it white
- **THEN** `verbClicks` clicks the square with the right button, at its `pointAt`

#### Scenario: A wrong target fails the walk
- **WHEN** a game's `hintGesture` names a target the step does not decide
- **THEN** `verbClicks` throws naming that target, and `hint-gesture.test.ts` fails for that game

#### Scenario: The step and the Ui are left as they were
- **WHEN** `verbClicks` derives a gesture for a step whose `hintKeepTrack` shrinks the step as it is followed
- **THEN** the step the midend holds, and the player's `Ui`, are unchanged by the derivation

### Requirement: The midend SHALL refuse a hint on a finished or wrong board before asking the game

Before it asks a game's `hint` for a plan, the `Midend` SHALL refuse with
`ALREADY_SOLVED` when the board's status is solved, and then with
`FIX_MISTAKES_FIRST` when the game's `findMistakes` reports anything, putting
what it reports on the same overlay Check & Save uses. A game's `hint` is
therefore only ever asked about an unfinished board on which its `findMistakes`
finds nothing, and does not write either refusal.

The refusals SHALL be asked **in order**, because a finished board is not a
wrong board. And `FIX_MISTAKES_FIRST` **promises a highlight**, which only the
code that draws the overlay can keep, so no game says it: it is not a
`HintRefusal`. Forty-two of the forty-eight hinted games wrote this opening, or
called a helper to write it, until the midend took it over; each copy was a
chance to get the order or the promise wrong silently.

The midend SHALL NOT refuse on a lost status, because a lost board is not always
over: Flood plays on past its move limit and its hint still leads home. Because
a status is judged from the board alone, every finished board's status is
solved, so `ALREADY_SOLVED` is the midend's alone and not a `HintRefusal`.

Because the walk in `hint-resume.test.ts` asks `hint` directly, it SHALL also
ask `findMistakes` at every position it reaches, as the midend does, and fail if
it reports anything: that is what holds a game's `findMistakes` to a sound board
and a hint to never leading the player into a mistake.

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

#### Scenario: A hint walk meets a mistake

- **WHEN** following a game's hints reaches a position its `findMistakes` flags
- **THEN** the walk fails, naming the seed and the move

### Requirement: A hint refusal SHALL be one of the collection's own

`HintResult`'s error SHALL be a `HintRefusal`: the union of the literal types of
the collection's refusal constants, plus a sentence made by `puzzleDeadEnd` or
`markedDeadEnd`, the named escapes. A game SHALL NOT be able to return a
sentence it typed. The set SHALL distinguish, at minimum: the board is
inconsistent but **no individual entry can be shown to be wrong**;
deduction has run out; a bounded search is past its reach; for a game that
teaches no technique, no move would help; and the game is over.

This is required because the help teaches "there is a mistake on the board" and
"deduction has run out" as a *pair* whose responses are opposite, and a player
cannot learn a pair whose members are worded differently in each puzzle.

**Every refusal SHALL say whether it is a dead end** (`isDeadEnd`): whether its
advice is to go back. The verdict of each kind SHALL be stated in a table typed
over every kind, so a kind added without one fails the typecheck, and the
conformance check SHALL hold each kind's verdict to whether its sentence tells
the player to undo. A contradiction, a game that is over, and nothing found
that finishes from here are dead ends; deduction run out, a search past its
reach, no move worth making and a puzzle that cannot be reasoned about are not.

The escapes are for a dead end only one puzzle has, where naming it is the
substance of the hint (Inertia's dead ball, Pegs' cut-off pegs), and are dead
ends by construction. A sentence two games pass through them is a situation the
collection has, and SHALL become a kind; the conformance check SHALL find the
escapes' calls by their shape, read a template's words with each substitution as
a hole (a `markedDeadEnd`'s through its `phrase` template), and fail a call
whose sentence it cannot read or which does not tell the player to undo.

#### Scenario: Two games refuse for the same reason

- **WHEN** two games decline to hint because no further move can be deduced
- **THEN** the player reads the same sentence in both

#### Scenario: A new phrasing cannot arrive unnoticed

- **WHEN** a game's `hint` returns a sentence that is neither a refusal constant
  nor made by an escape
- **THEN** the typecheck fails

#### Scenario: A game's own dead end shared by a second game

- **WHEN** two games pass the same sentence to an escape
- **THEN** the conformance check fails, asking for a kind

#### Scenario: A kind spelled out through the escape

- **WHEN** a game passes a refusal constant's text to an escape
- **THEN** the conformance check fails

#### Scenario: A board inconsistent with nothing to highlight

- **WHEN** a board `findMistakes` passes is still inconsistent, with no entry
  provably wrong
- **THEN** the game's `hint` refuses with the message that asks the player to
  undo, not with one pointing at a highlight

#### Scenario: A kind whose verdict disagrees with its advice

- **WHEN** a refusal kind is called a dead end while its sentence does not tell
  the player to undo, or the reverse
- **THEN** the conformance check fails

### Requirement: The check asks the hint whether a position is a dead end

The `Midend` SHALL offer `check()`, the one check behind Check & save and Check
without saving. It SHALL ask `findMistakes` first, displaying any mistakes; on a
board with none, it SHALL ask the game's `hint` for its verdict without showing
a hint, and report a refusal that `isDeadEnd` calls a dead end with that
refusal's sentence. A search past its reach (`SEARCH_OUT_OF_REACH`) SHALL be
reported apart, since it settles nothing. Every other answer SHALL be reported
sound, saying whether `findMistakes` ran. A solved board, and one a stored hint
plan still leads on from, SHALL NOT cost a hint computation. The verdict, not
the marks, SHALL cross the worker boundary: the canvas is painted in the worker.

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

### Requirement: A dead end may mark its cause

A game's hint MAY return `markedDeadEnd(words)`: a dead end whose sentence is
its words' text and whose references name the elements that cause it. While it
is the answer on display, from a Hint press or a check, the midend SHALL pass it
to `redraw` as `deadEnd`, never together with a hint step, and SHALL clear it on
the transitions that clear the mistake overlay. The binding walk SHALL hold a
marked dead end's words to the frame as it holds a step's: every element named
is drawn and nothing else is.

#### Scenario: A cut-off peg is outlined

- **WHEN** Check & save runs on a Pegs board with a peg nothing can reach
- **THEN** the save is refused with the hint's sentence and the cut-off peg is
  outlined until the next move

#### Scenario: A renderer that ignores the dead end

- **WHEN** a game returns a marked dead end but its `redraw` paints marks only
  from the hint step
- **THEN** the binding walk reports each named element as not drawn

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

#### Scenario: Only a forced step is held to the necessity voice

- **WHEN** a deductive game's step is built with any relation but forced (a journey's later
  leg, a move narrated by its effect, one of several), or is declared `setup` or `bare`
- **THEN** the necessity-voice rule reads its form and does not require a modal of its own
- **AND** a forced step, and an `evident` one, is still required to carry necessity

#### Scenario: Words cannot skip the parts

- **WHEN** a game writes a step whose words are a bare `phrase`
- **THEN** the program does not typecheck

#### Scenario: A move left to the board is still bound

- **WHEN** a step's move is named only by words on the `MOVE` mark ("go back for it")
- **THEN** the game's renderer rings the step's move, and the binding walk finds the mark drawn

### Requirement: A searched move's rivals SHALL be judged through the engine

The engine SHALL provide `judgeRivals` (`src/engine/rival-judging.ts`): given the rivals of the
move a hint offers, an allowance counted in positions, and the game's judge of one rival
(finishes, lost, or unsettled), it SHALL return the verdicts and the claim they allow, with the
relation that claim's sentence uses. The relation that concludes a move with "so" over its
rivals SHALL be made only by `judgeRivals`, and only when every rival was judged lost or there
was none, so that a game cannot write it beside rivals nobody judged. The judge, the rivals a
game chooses to judge, and what a step says when nothing is settled SHALL stay the game's.

#### Scenario: Only a judging that lost every rival says "so"

- **WHEN** every rival is judged lost
- **THEN** the claim is that only the offered move remains, and its relation is the forced one
- **AND** when some rival finishes, the relation offers the move as one of several

#### Scenario: An unsettled rival is not claimed

- **WHEN** some rivals are unsettled and none is lost
- **THEN** the claim says nothing about the rivals, and carries no relation

#### Scenario: One allowance is shared

- **WHEN** the judging of the first rivals uses up the allowance
- **THEN** the rivals after them are judged with what is left, which is nothing

### Requirement: A hint step SHALL name the rung it speaks

Every hint step SHALL carry `rung`, the id of the deduction it is, and every
game that declares a `hint` SHALL declare `hintRungs`, the list of every rung a
step of its hint can be, each once. A step's rung SHALL be one of its game's
`hintRungs`. `HintStep` and `Game` SHALL be typed by the game's rung union, so
that a game whose steps are typed by its list fails to compile when a step is
stamped with an id the list lacks.

A rung is the deduction, at the grain the game's solver or plan already names
it: the kinds of its reason union, or the branches of a hint that deduces
nothing. The legs of one journey SHALL share their firing's rung. Two wordings
of one deduction SHALL NOT be two rungs.

Whatever needs to know which deduction a step is SHALL read `rung`, and SHALL
NOT match the step's sentence to find out: the pins a game's tests read, the
narration ledger, and a render scenario that walks a plan to a step. A test MAY
still assert what a step's sentence says, where the wording is the thing under
test.

The candidate walk SHALL stamp the steps it builds: a placement or a strike
with the kind of the reason it narrates, and its own setup steps and a
placement's cull with ids the engine owns. A game on the walk SHALL therefore
write its list and no stamp. Where a game's words for a placement narrate
another of its reasons than the one the walk handed it, the game SHALL say
which, so that a step's rung and its sentence name the same deduction.

**A game's list SHALL hold only the rungs of the readings its plan walks.** A
plan that gives a setup of its own walks the populate reading alone, and two of
the walk's rungs are then ones it cannot speak: the implicit reading's note
step, and the single read off a cell with no notes. Such a plan's step type
SHALL lack both, so its game's list lacks them and its tests excuse neither;
until this a list said more than its game did, and the two were excused in
Salad's tests as rungs no board reached. The setup is the declaration, since
the walk already runs it: a plan typed on the populate reading alone SHALL NOT
compile without one, a plan typed on both SHALL NOT compile with one, and the
walk SHALL throw rather than read a single off a cell with no notes on a plan
that gave one.

A rung id is not player-facing: no sentence, help page, save or game ID holds
one.

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

#### Scenario: A candidate game writes no stamp

- **WHEN** a game builds its plan through the shared candidate walk
- **THEN** each step's rung is the kind of the reason the walk narrated, or
  the engine's id for a setup step or a cull
- **AND** the game's list is the engine's ids and its own reasons' kinds

#### Scenario: A sentence of another reason

- **WHEN** a game's words for a placement are those of a reason other than
  the one the walk found, as a one-cell area's are a singleton's
- **THEN** the step carries that reason's rung, not the one the walk found

#### Scenario: A plan on the populate reading alone

- **WHEN** a game's plan gives a setup of its own
- **THEN** its rung list holds neither the note step nor the single of a cell
  with no notes, and its tests pin a board for every rung left
- **AND** a single the walk would read off a cell with no notes throws, naming
  the plan, where it would have been stamped with a rung the list lacks
