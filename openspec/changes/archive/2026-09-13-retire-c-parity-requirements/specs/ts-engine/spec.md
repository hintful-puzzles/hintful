## ADDED Requirements

### Requirement: The midend repaints on every transition and drives the animation timer

The TS midend SHALL cause the canvas to repaint after every state
transition it processes — moves, undo, redo, solve, restart, load,
and UI-only updates. A transition that changes what is displayed
SHALL NOT leave the canvas stale.

For games that animate, the midend SHALL drive the animation/flash
timer: it SHALL obtain the animation and
flash durations from the game, run the timer while either an
animation/flash is in progress or a timed-clock game is running, paint
each animation frame, and settle to a final clean paint when the
animation completes. A non-animated transition SHALL paint once;
animation frames (including the first) SHALL be driven by the timer
rather than by an extra synchronous paint that would race the timer.

**The engine emits no pixels of its own.** `Midend.redraw(dr)`
SHALL delegate the entire frame to `game.redraw` (between
`startDraw`/`endDraw`). It SHALL NOT emit a background-fill rectangle,
a clear, or any other paint operation that overwrites what the game
last drew. Background and one-time setup (grid lines, board border,
fixed-position artwork) SHALL be the game's responsibility, painted
in its `!ds.started` branch and re-fired on a fresh drawstate.

**Canvas-cleared / cache-stale signals.** The engine SHALL expose:

- `Midend.size(maxSize, isUserSize, dpr): Size` — **purely
  informational**. It SHALL compute and return the puzzle's preferred
  pixel size at the resolved tile size and SHALL inform the game via
  `setTileSize`, but SHALL NOT recreate the drawstate, invalidate any
  per-tile cache, or schedule any framework-emitted overpaint. The
  frontend may call `size()` on every layout perturbation (any
  element-size change goes through it via `src/puzzle/components/view.ts`'s
  `ResizeController`); a side-effecting call here would wipe caches
  at unrelated moments and cause spurious full repaints.

- `Midend.canvasCleared()` — the signal that the canvas backing
  store has been reset by `Drawing.resize` (`alpha:false` clears to
  opaque black on every `canvas.width=` write). The midend SHALL
  discard the per-game drawstate and construct a fresh one via
  `game.newDrawState`, applying `setTileSize`. The next `redraw`
  SHALL therefore see `!ds.started` and the game SHALL paint from
  scratch, including its own background. The worker adapter SHALL
  invoke this from `resizeDrawing` immediately after `Drawing.resize`.

- `Midend.forceRedraw(dr)` — palette or font replacement does not
  clear the canvas but invalidates the color/font choices baked
  into cached tiles. `forceRedraw` SHALL discard the drawstate (the
  same effect as `canvasCleared`) and immediately call `redraw(dr)`;
  the game's `!ds.started` branch paints a fresh frame over the
  old pixels, in the new palette/font. The worker adapter SHALL
  invoke `forceRedraw` when `setDrawingPalette` or
  `setDrawingFontInfo` replaces an already-installed value.

A startup invariant: a drawstate created by `startFrom` (newGame /
newGameFromId / loadGame) SHALL have `started=false` (or its
per-game equivalent), so the first `redraw` after a new game paints
the bg + one-time setup via the game's first-paint branch.

#### Scenario: A processed move repaints

- **WHEN** the midend processes a move, undo, redo, solve, restart,
  load, or UI-only update
- **THEN** a repaint of the canvas is requested for that transition
- **AND** the displayed board reflects the new state without requiring
  any further external redraw call

#### Scenario: An animated move is driven by the timer to completion

- **WHEN** a move on an animating game is processed
- **THEN** the midend arms the animation/flash timer and the canvas is
  repainted on each timer tick through the animation
- **AND** when the animation and flash complete the midend settles
  with a final paint of the resting state and releases the timer

#### Scenario: `Midend.size` is purely informational

- **WHEN** the frontend calls `size()` repeatedly (e.g. on every
  ResizeController tick, including ones with no actual canvas-size
  change)
- **THEN** the midend computes and returns the preferred pixel size
  but DOES NOT recreate the drawstate, change drawstate identity, or
  cause the next `redraw` to emit a background fill
- **AND** the per-tile cache the game holds survives unchanged

#### Scenario: A real canvas clear invalidates the drawstate

- **WHEN** the worker adapter calls `Midend.canvasCleared()` after
  `Drawing.resize` reset the canvas backing store
- **THEN** the midend discards the per-game drawstate and constructs
  a fresh one (with `started=false` and any cache cleared)
- **AND** the next `redraw(dr)` causes the game's `!ds.started`
  branch to run, painting the bg + one-time setup + every tile
  fresh

#### Scenario: A palette replacement repaints without clearing the canvas

- **WHEN** the worker adapter receives a `setDrawingPalette` call that
  replaces an already-installed palette (e.g. the user toggles
  light/dark mode)
- **THEN** the adapter calls `engine.forceRedraw(dr)`, which discards
  the drawstate and runs `redraw`
- **AND** the game's `!ds.started` branch paints the full frame in
  the new palette over the existing canvas content — the framework
  itself emits no overpaint

#### Scenario: `Midend.redraw` emits no draw ops of its own

- **WHEN** `Midend.redraw(dr)` is called
- **THEN** the only ops it emits directly are `startDraw` and
  `endDraw`; every other paint operation in the recording originates
  from `game.redraw`
- **AND** there is no framework-level background fill, clear, or
  full-window overpaint

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

## MODIFIED Requirements

### Requirement: Games may expose on-screen key labels

The engine SHALL support an optional `Game.requestKeys(params)` hook returning an
ordered list of `KeyLabel` (`{ button, label }`) — the on-screen virtual-keypad
buttons for that game, faithful to upstream `game_request_keys`. The hook SHALL
depend only on `params` (not on `state` or `ui`), matching upstream and the fact
that the app's key panel reloads its labels only when params change. Each entry's `button` is the
key code processed exactly as the equivalent physical keypress, and `label` is the
resolved display text (the digit/letter character, or `"Clear"` for the clear key,
so the app's icon mapping renders it); the engine does not re-derive labels from
button codes.

The `EngineCore` surface SHALL expose `requestKeys(): KeyLabel[]`, and the midend
SHALL return `game.requestKeys(params)` for the current params when the hook is
present and an empty list when it is absent. The worker adapter SHALL forward this
result rather than returning a fixed empty list, so the app shows the keypad the
game declares. A game without the hook SHALL show no keypad
(an empty list), unchanged from prior behavior.

#### Scenario: A keypad game's labels are served on the TS path

- **WHEN** the app requests the key labels for a TS-served game that implements
  `requestKeys`
- **THEN** the midend returns that game's `KeyLabel[]` for the current params
- **AND** the app renders one on-screen button per label, each entering the key
  when pressed

#### Scenario: A game without the hook shows no keypad

- **WHEN** the app requests the key labels for a TS-served game that does not
  implement `requestKeys`
- **THEN** the midend returns an empty list and no keypad is shown

## REMOVED Requirements

### Requirement: The midend repaints on every transition and drives animation

**Reason**: It defined the repaint and the animation timer as parity with upstream — "mirroring the C frontend", "to parity with `midend.c`" — and carried a scenario making a frozen port ineligible for "parity registration" against the C build. There is no C build, and matching upstream is no longer a goal; a `MODIFIED` block cannot drop the scenario.

**Migration**: Replaced by "The midend repaints on every transition and drives the animation timer", which keeps every behavior and every other scenario. That a game which does not repaint is not accepted is `ts-migration` "Game work is accepted by exercising it, not by a green suite".

### Requirement: A hint step always names a technique — no un-narrated fallback

**Reason**: It permitted a game to keep a moved trial rung at its upstream tier behind a differential-only flag "so that a frozen byte-match oracle survives", with a scenario of that name. Matching upstream's C output was a porting-era aid, retired by the owner on 2026-09-13, and a `MODIFIED` block cannot drop the scenario.

**Migration**: Replaced by "A hint step always names a technique, with no un-narrated fallback", identical without that permission and its scenario. A divergence that moves a rung retires or re-founds the fixtures it changes (`ts-migration` "A difficulty tier binds the board it generates").
