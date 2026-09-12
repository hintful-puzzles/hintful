## ADDED Requirements

### Requirement: The engine supports an ephemeral, opt-in mistake-checking hook

The engine SHALL support a UI-only, ephemeral mistake-checking facility,
shaped like the Hint System. The `Game` interface SHALL define an
optional `findMistakes(state)` method returning the cells of the current
state that contradict the puzzle's unique solution as game-specific
highlight data (an empty result means no detectable mistakes). The
method SHALL be pure (no state mutation).

A game whose state carries **candidate/pencil annotations** (e.g. Towers) MAY
report **annotation-level** contradictions as mistakes, consistently with how a
placed value is reported: a non-empty candidate set that **excludes** the cell's
unique-solution value (the player has crossed out the correct answer) is a
contradiction and MAY be returned, whereas a candidate set that merely holds
extra, non-solution candidates is ordinary mid-solve state and SHALL NOT be
reported. The solution such a game checks against SHALL be derived from the
committed placements only, never from the annotations themselves (an annotation
can be wrong — that is precisely what is being checked). This makes pencil notes
first-class markings, so the existing Check-&-Save gate (which refuses a save
while `findMistakes` is non-empty) refuses a board carrying an invalid note
exactly as it refuses a wrong placed value.

The `Midend` SHALL, on `findMistakes()`, call the game's hook, store the
result as `activeMistakes` (midend-only, never in game state, never
persisted), pass it to the game's `redraw`, and return the **count** of
flagged cells. `activeMistakes` SHALL be displayed until the next state
transition and SHALL be cleared on the same events that clear an active
hint (a player move, undo, redo, restart, new game, solve, and reaching
the solved state). A game that does not implement `findMistakes` SHALL
report it as unavailable.

The engine surface SHALL expose `canFindMistakes` (true iff the game
implements the hook) in its static attributes and `findMistakes(): number`
(display the mistakes as a side effect, return how many). For a game
that does not implement the hook, `canFindMistakes` SHALL be false and
`findMistakes()` SHALL return 0.

#### Scenario: Checking a board with mistakes

- **WHEN** the user invokes `findMistakes()` on a game that implements
  the hook and the current state has cells contradicting the solution
- **THEN** the midend stores those cells as `activeMistakes`, schedules a
  repaint that draws them highlighted, and returns the count (> 0)
- **AND** the highlight remains until the next state transition

#### Scenario: Checking a clean board

- **WHEN** the user invokes `findMistakes()` and no cell contradicts the
  solution
- **THEN** the count returned is 0 and nothing is highlighted

#### Scenario: A transition clears the mistake display

- **WHEN** `activeMistakes` is displayed and the user makes a move,
  undoes, redoes, restarts, starts a new game, or solves
- **THEN** the midend clears `activeMistakes` and the next repaint draws
  no mistake highlights

#### Scenario: A game without the hook reports no capability

- **WHEN** the active game does not implement `findMistakes`
- **THEN** `canFindMistakes` is false and `findMistakes()` returns 0,
  and the app shell shows no mistake-checking control

#### Scenario: A candidate annotation that excludes the solution is a mistake

- **WHEN** a game with pencil/candidate annotations reports mistakes on a state
  where an undecided cell's non-empty candidate set excludes that cell's
  unique-solution value
- **THEN** `findMistakes` includes that cell
- **AND** a cell whose candidate set still contains the solution value (with or
  without extra candidates) is not included
- **AND** Check-&-Save refuses to quick-save the board while such a cell exists

### Requirement: The engine surface exposes an opt-in "fill all pencil marks" capability

The engine surface SHALL expose `canMarkAll` in its static attributes, true
iff the active game supports the "fill every empty cell with all candidate
pencil marks" action (upstream's `M`/`m` key). The `Game` interface SHALL
define an optional `readonly canMarkAll?: boolean` flag; the `Midend` SHALL
surface it as `canMarkAll: game.canMarkAll ?? false`.

The action itself reuses the existing keyboard input path rather than a new
engine method: a game that sets `canMarkAll` SHALL handle the `M`/`m` key in
`interpretMove` and return its mark-all move. The app shell SHALL render a
control in the same toolbar `wa-button-group` as Hint and Check & Save, shown
only when `canMarkAll` is true, which on activation injects the `M` key via the
surface's `processKey`.

The mark-all action SHALL be **adaptive** for a game whose cells have uniqueness
regions (one that supplies a per-game region provider): if any empty cell has **no
pencil notes at all** the action fills every note-less empty cell with all candidates
(as before); otherwise (every empty cell already carries notes) the action SHALL
instead **remove the obvious candidates** — every penciled value equal to a value
already *placed* in one of that cell's uniqueness regions (row/column, plus sub-block
and X-diagonal where the game has them; a Keen arithmetic cage is NOT a uniqueness
region). "Obvious" SHALL be judged only against placed values, never inferred from
another pencil mark.

The cleanup SHALL be emitted as the existing atomic `pencilStrike` move with its marks
computed at `interpretMove` time, so replay and undo are exact. When there is nothing to
fill **and** nothing to strike (an already-cleaned, fully-noted board) the action SHALL
produce **no move at all** (a true no-op that adds no undo entry), rather than an empty
`pencilStrike`. The cleanup SHALL be **idempotent** and a pure function of the placed
(non-pencil) grid: repeated presses converge to and remain at "every empty cell noted with
all candidates minus the values placed in its regions" — there SHALL be no fill⇄clean
toggle, and a cleaned board SHALL NOT silently re-fill. A clean SHALL NOT empty a cell of its last note (a cell whose every
candidate is region-eliminated occurs only on an already-mistaken board; leaving its last
note keeps idempotency unconditional). A game without a row/column uniqueness model (e.g.
Undead) SHALL keep the fill-only behavior.

#### Scenario: A pencil-mark game shows the control and fills candidates

- **WHEN** the active game reports `canMarkAll` true and the player activates
  the toolbar control
- **THEN** the `M` key is injected via `processKey`, the game fills every empty
  cell with all candidate pencil marks, and the board repaints

#### Scenario: A second press on a fully-noted board removes obvious candidates

- **WHEN** every empty cell is already fully noted and the player activates the
  mark-all control on a game with uniqueness regions
- **THEN** the action emits a `pencilStrike` that removes exactly the penciled
  values already placed in each cell's row/column (and block/diagonal where the game
  has them), leaving every still-possible candidate, and replaying the move
  reproduces the cleaned board

#### Scenario: Repeated presses are idempotent (no re-fill, no toggle)

- **WHEN** the player activates the mark-all control a third time, after a fill and a
  clean, with no board change in between
- **THEN** the cleaned board is unchanged — the action produces no move (a true no-op,
  no undo entry) and does not re-fill any cell — and the resulting notes equal `{1..n}`
  minus the placed values in each cell's regions

#### Scenario: An arithmetic cage is not a uniqueness region

- **WHEN** the game is Keen and a cell's penciled value also appears in its cage but
  not in its row or column
- **THEN** the cleanup does NOT remove that candidate (the value is still legal under
  the cage's arithmetic constraint)

#### Scenario: A non-uniqueness game keeps fill-only

- **WHEN** the game has no row/column uniqueness model (e.g. Undead)
- **THEN** the mark-all action only ever fills missing candidates; it performs no
  obvious-candidate cleanup

#### Scenario: A game without pencil marks shows no control

- **WHEN** the active game does not set `canMarkAll`
- **THEN** `canMarkAll` is false and the app shell renders no mark-all control

### Requirement: The engine surface exposes an opt-in per-game reference-aid capability

The engine surface SHALL expose an optional per-game "reference aid": a read-only
checklist of a puzzle's fixed inventory of pieces with found/outstanding status, plus a
way to spotlight one item on the board.

The `Game` interface SHALL define two optional hooks:

- `reference(state, ui): ReferenceModel` — returns a plain, serializable model of the
  inventory. `ReferenceModel` SHALL be `{ items: ReferenceItem[]; selected: string | null;
  columns?: number }`, and `ReferenceItem` SHALL be `{ key: string; label: string; pips?:
  readonly number[]; status: "outstanding" | "placed" | "conflict" }`. `key` is a stable id;
  `pips` is optional face-value data for games whose pieces render as pips; `selected`
  echoes the currently spotlighted key (or null).
- `selectReference(ui, key): boolean` — spotlights the item `key` (or clears it when `key`
  is null) by mutating `Ui`, and returns whether anything changed.

The `Midend` SHALL surface `hasReference = this.game.reference !== undefined` in its static
attributes, and SHALL provide `getReference(): ReferenceModel | null` (returning
`game.reference(state, ui)` or null) and `selectReference(key): void`. `selectReference`
SHALL call `game.selectReference(this.ui, key)` and, on a `true` return, take the same
repaint path as a `UI_UPDATE`: it SHALL NOT create a move, add an undo entry, alter the move
log, or be serialized into a save. For a game that does not define `reference`,
`hasReference` SHALL be false,
`getReference()` SHALL return null, and `selectReference()` SHALL be a no-op.

`hasReference`, `getReference`, and `selectReference` SHALL be part of the shared
`PuzzleEngineSurface`, so the app reaches them through the same surface as every other
engine call.

#### Scenario: A game exposing a reference is discoverable through the surface

- **WHEN** the active game defines `reference` and the app queries static attributes
- **THEN** `hasReference` is true and `getReference()` returns the game's model, whose
  `items` reflect current board state and whose `selected` matches the spotlighted key

#### Scenario: Selecting a reference item repaints without a history entry

- **WHEN** the app calls `selectReference(key)` on a game whose `selectReference` reports a
  change
- **THEN** the board repaints with that item spotlighted, and no move is added — the move
  log, undo/redo availability, and any subsequent save are byte-for-byte identical to before
  the call

#### Scenario: A game without a reference aid reports none

- **WHEN** the active game does not define `reference`
- **THEN** `hasReference` is false, `getReference()` returns null, `selectReference()` does
  nothing, and no reference control is shown

## MODIFIED Requirements

### Requirement: The midend repaints on every transition and drives animation

The TS midend SHALL cause the canvas to repaint after every state
transition it processes — moves, undo, redo, solve, restart, load,
and UI-only updates — mirroring the C frontend, which redraws after
every processed input. A transition that changes what is displayed
SHALL NOT leave the canvas stale.

For games that animate, the midend SHALL drive the animation/flash
timer to parity with `midend.c`: it SHALL obtain the animation and
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

#### Scenario: A non-rendering port is not at parity

- **WHEN** a TS port processes input correctly but the midend does not
  repaint (the game appears frozen)
- **THEN** this is a parity regression, not a cosmetic deferral
- **AND** the game is not eligible for parity registration until it
  repaints and animates to parity with the C build

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

## REMOVED Requirements

### Requirement: A TS-ported game stays in the catalog without a wasm artifact

**Reason**: Its premise is gone: no game has a wasm artifact, no C source is built, and there is no catalog generator to union TS-ported games with wasm-built ones. Its scenario names a generated `catalog.json` that is now the committed `src/puzzle/catalog-data.ts`.

**Migration**: That the catalog lists every playable game is "Per-game engine selection is a runtime registry, not a build flag", which requires the registry and the catalog to agree in both directions and a test to assert it.

### Requirement: The engine supports an ephemeral mistake-checking hook

**Reason**: It specified what "an unported C/WASM game" reports, with a scenario of that name; there is no such game, and a `MODIFIED` block cannot rename the scenario.

**Migration**: Replaced by "The engine supports an ephemeral, opt-in mistake-checking hook", identical except that the absent capability belongs to a game that does not implement the hook.

### Requirement: The engine surface exposes a "fill all pencil marks" capability

**Reason**: It specified what "an unported C/WASM game" reports, with a scenario of that name; there is no such game, and a `MODIFIED` block cannot drop the scenario.

**Migration**: Replaced by "The engine surface exposes an opt-in \"fill all pencil marks\" capability", identical without the unported clause; its existing scenario "A game without pencil marks shows no control" already covers the absent capability.

### Requirement: The engine surface exposes a per-game reference-aid capability

**Reason**: It specified what a game "served by C/WASM" reports, with a scenario of that name; there is no such game, and a `MODIFIED` block cannot rename the scenario.

**Migration**: Replaced by "The engine surface exposes an opt-in per-game reference-aid capability", identical except that the absent capability belongs to a game that does not define `reference`.
