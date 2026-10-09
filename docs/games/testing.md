# Testing a game

> How a game change is *verified*: which tier a test belongs in, what a new
> game must ship, what the frozen differentials still guarantee now that the C
> build is gone, and the rules that keep the suite deterministic and the gate
> affordable. **Writing tests is here; *assessing* them is
> [`docs/test-strength.md`](../test-strength.md)** — the five-minute mutation
> probe, `npm run probe`, and the instrument traps that make an assessment lie.
>
> Authoritative specs: [`testing`](../../openspec/specs/testing/spec.md)
> (the in-process tiers, the render harness, determinism under load, the
> differential helper, a hint test's pins, the boards a cross-game sweep
> walks) ·
> [`build-pipeline`](../../openspec/specs/build-pipeline/spec.md) (what the
> gate runs, and what it may defer to the push).
> Neighboring guides: [`rendering.md`](./rendering.md) (what to draw),
> [`hints.md`](./hints.md) (hint verification recipe),
> [`solver-and-generator.md`](./solver-and-generator.md) (when to diverge from a
> fixture, and what replaces it).

## The test tiers

**Reach for the lowest tier that fits; Playwright is visual/integration smoke
only.** The tiers are codified in the
[`testing`](../../openspec/specs/testing/spec.md) spec; in brief:

- **Tier 1** — pure logic (`Game` impl, solver, generator, codecs). Default
  `node` environment, no setup.
- **Tier 2** — render ops: drive `redraw` against the shared recording
  `GameDrawing` double and assert draw calls. Still `node`.
- **Tier 2.5** — render scenarios + snapshots via
  [`src/engine/testing/`](../../src/engine/testing/): a real `Midend` driven to
  a target frame. **New render code SHOULD ship one** (see below).
- **Tier 3** — components + persistence: opt a file into `happy-dom` for Lit
  components. A fake IndexedDB is in place for every file
  (`src/test-setup/indexeddb.ts`, a vitest setup file): Dexie reads the global
  once as its module loads and every later file in the worker shares it, so
  the fake cannot be left to the files that know they need it. Import that
  module only for `resetDb`.
  Mounting Web Awesome controls needs `src/test-setup/element-internals.ts`,
  and opening a `wa-dialog` that holds a config form needs
  `src/test-setup/resize-and-animations.ts` too — Lit resolves its `node`
  build under vitest, so anything gated on `isServer` behaves as on a server
  even in `happy-dom`. Each module's header says what fails without it.

**Stand in for a module with a spy, never a mock.** The suite runs with
`isolate: false`, so a worker's module graph outlives each file, and `vi.mock`
misses any importer an earlier file already loaded — which file ran first is
the sequencer's choice, not yours. Spy on the real export in a `beforeEach`
(`vi.spyOn(toast, "showToast")` after `import * as toast from …`, or
`vi.spyOn(savedGames, "quickSave")` on a shared object) and restore in
`afterEach`; the importer reads the export at call time, whenever it loaded.
`src/no-module-mocks.test.ts` refuses `vi.mock`, `vi.doMock` and `vi.hoisted`;
`src/screens/puzzle-screen.test.ts` is the exemplar.

**A pointer press focuses nothing in `happy-dom`.** It does not focus an
element on `mousedown`, so a Tier 3 test cannot observe where keyboard focus
lands after a press, and a test of "this press does not take focus from the
board" passes whether or not the code is right. Assert the cause the code
controls (that the `mousedown` default was prevented, say), write in the test
that it is a proxy, and look at the consequence in Chrome:
`document.activeElement` after the press, and a physical key reaching the game
straight after. `src/puzzle/components/keys.test.ts` is the worked case.

**A test that needs a specific board should find it deterministically, not by
scanning further.** The idiom for reaching a specific deduction or board state
without knowing its desc is a fixed-seed scan — loop ids, keep the first whose
state matches — pinned by a recorded first-hit (see "Right-sizing the gate").
The position a *hint sentence* fires on is the exception: pin it through
`describeHintPins` (§ "Pinning a hint's positions") and do not write a seed
scan for it.

### Pinning a hint's positions

**For a hint's rungs the scan is shared, and it stays in the tree.**
`describeHintPins` ([`testing/hint-positions.ts`](../../src/engine/testing/hint-positions.ts))
pins one position for **every rung the game declares** (`Game.hintRungs`,
[`hints.md`](./hints.md) § "Name the rung a step speaks"), keyed on the rung's
id, and returns the loader the game's own tests read the pins through
(`pinned("trap")` gives the board, the plan, the step of that rung and its
index, and the `id` and `moves` a `renderScenario` takes). It declares two
tests: every pin still fires its kind, and a snapshot of the sentence said at
each pin, which is where a rung's wording is held. One call a game, in
`<game>-hint.test.ts`.

**Adding a rung is: name it, run one command, read the count.** The types
require a pin for every rung, so a new one does not compile until
`npm run hint-scan -- <the test file>` has run. That walks hint-guided play
over fixed seeds, taking each plan's first step and asking again, and writes
the pins into the file, each under how many of the positions walked it held on.
That count is the power argument the pin owes ([`method.md`](../method.md)): a rung
that held on 5 of 937 is the one to watch. What the command does with a pin
already there:

- **a pin that still fires is left alone**, since tests and snapshots are
  written against its board (`--all` replaces every pin the scan found);
- **a pin the scan found no position for is left alone too**, and named: it is
  one kept by hand, for a rung this scan's line of play does not reach;
- **a rung with no pin and no position found is named, and the command exits
  1.** Widen the scan (`params`, `seeds`, `stray`), build the board by hand and
  pin that, or, when no board is known to fire the rung, list it in
  `unreached` with the reason, which is a shortfall on show: empty is the goal,
  as it is for `describeLadderCensus`. The scan walks the excused rungs too and
  says when one fires.

**An excused rung is one of several things, and the scan's zero cannot say
which.** The scan follows the hint's own play, where the cheapest rung always
goes first, on boards the generator deals at the sizes it was given. Twelve
entries stood when these were sorted (2026-10-07), nearly all excused as rare
or as "a cheaper rung gets there first", and that was true of one. Before an
entry is written:

- **Ask the hint from positions its own play does not visit.** A player fills
  a board in any order: play random shares of the answer and ask from there,
  and give the board the marks only a player makes. Loopy follows a pair note
  on 1 step in 80 once the player has noted pairs, and on none of its own
  line. Deal the sizes the scan was not given too: Tracks' premise fires on a
  fresh 5x4 board. A game whose generator places pieces only where they are
  safe needs boards it does not deal (Inertia, on scattered cells).
- **Build the rung's shape and see what decides it.** Where nothing fires
  across thousands of positions, construct the exact position the rung reads
  and record which rung speaks in its place. A harder rung speaking there is a
  defect: Boats' `mustGrow` was excused as rare on 672 boards and could not
  fire on any, and the Hard refutation answered for it.
- **A rung proved dead leaves the list**, with its sentence, and the proof is
  the comment where its reason was (Bricks' `BricksReason`, Tracks'
  `checkLooseSub`). Prove it from the code, then measure it off the hint's
  line, since an argument from reading has been wrong here before.
- **A rung the game's plan cannot speak is the list's to lose, not the test's
  to excuse.** Where a shared list or type puts it there, the fix is a layer
  down: Salad's `note` and `regionsFull` came with the Latin family's rungs,
  and went when a plan could say which reading it walks
  ([`hints.md`](./hints.md) § "Name the rung a step speaks").
- **What may stay** is a rung on a board no pin can hold, saying so and
  naming the test that builds the board (Mines' `restart`).

A pin found this way is kept by hand, under a comment saying where it came
from and out of how many.

**A rung's pin is a position whose plan speaks the rung; a further kind's is one
whose plan opens with it.** Of the positions a rung holds on, the scan takes one
where its step opens the plan before one where it comes later (`index` says
where), and then the fewest moves in. Some steps are only ever a later leg: the
sentence that follows a placement inside a plan opens none, because asked
afresh the same square is explained by another rung.

**The frame of a pin is `renderPinnedHint(game, pinned(kind))`**
([`render-scenario.ts`](../../src/engine/testing/render-scenario.ts)), and not
a `renderScenario` fed the pin's `id` and `moves`, which shows the step the
plan opens with whatever the pin is for. It plays the legs before the pin's
step through the midend, so a later leg is drawn on the board the player meets
it on, and it throws when the step on show is not the pin's, by its sentence
and its move (a journey's legs can all say one thing). Its result carries the
pin's `step`, typed as the game's. A game whose mid-game board is itself a
desc passes `descOf`, and its pins are bare `params:desc` strings; otherwise a
pin is a board and the moves played on it, which the scan writes as their JSON
in one string once there are more than a few. A deep pin is long, because a
ladder's late rung opens a plan only once every earlier one is spent.

**A further kind is a predicate over the opening step, its board and its
plan**, under `kinds`, for what a rung id does not say: a step's shape (several
cells), which of a rung's cases it is (`step.rung === "trap" && ownRival(step)`),
the board's, or the plan's. The plan is the third argument, so a journey is
`(_step, _state, steps) => steps[1]?.continuesPrevious === true`; a predicate
that calls the game's `hint` to see it pays for the plan twice, and for a
search that is the scan's whole cost. **Written as `{ leg: predicate }` the
kind is held by any step of the plan**, as a rung id is, for a case of a rung
that is only a later leg (`pearl-render-scenario.test.ts`). The board a `leg`
is given is still the one the plan was asked from, so it reads what play does
not change (the clues). It reads the step's fields and never its sentence: a regex over
`step.explanation` is the name-keyed scan aimed at our own output ([`method.md`](../method.md)
§ "Our own code keys on a reference, a type or an id"), and `HintKind` does not take one.

What a scan can be told:

- **`opening`**: moves played on a fresh board before the first hint, for a
  game whose deductions want a mark-all or whose board is dealt by the first
  click (`keen-hint.test.ts`, `mines-hint.test.ts`). Give the callback its
  return type (`(): SoloMove[] => [{ type: "pencilAll" }]`): a bare literal
  widens to `{ type: string }` and every kind then fails to typecheck.
- **`ui`**: the `Ui` the hint is asked under, for a kind a candidate reading
  decides (`group-hint.test.ts`).
- **`stray`**: a second line of play on every board, steered by the game. A
  hint keeps to lines that finish, so a rung about a jump that would not is
  spoken only off them (`pegs-hint.test.ts`, which follows the hint on even
  turns and takes any legal jump on odd ones).
- **A kind may read the board and ignore the step.** A test that wants the
  board on which a solver rung fires, where no step says so, asks the solver
  in the predicate: `(_step, state) => firstFiring(state)?.kind === "…"`.
  Whether a rung fires at all on a corpus is `describeLadderCensus`'s
  question, not this one's.

**A test file with positions of its own takes `describeHintKindPins`**: a
render test's frames, a second scan under another `ui`. Its kinds are rung ids
or predicates, and the same command writes its pins. A file may hold several
blocks, at any indent.

**Prefer `pinned(kind)` inside a test to one in a `describe` body.** A
`describe` body runs while tests are collected, so a pin that does not load
fails the whole file there, with the command to run. The command itself is
safe from that: while it scans, a pin that does not load reads as a stand-in.

What it does not do: **pin a refusal.** A refusal has no step for a loader to
return, so a test that wants a lost board keeps the desc by hand and says why
beside it (`pegs-hint.test.ts`'s `LOST`). And a pin does not keep `aux`: the
scan asks the hint with none, as a board loaded from `params:desc` has none, so
a kind that needs the generator's answer to fire is not one a pin can hold.

**A cross-game guard pins too.** `hint-ordinal.test.ts` used to search every
hinted game for a numbered chain on every run, 58 s of test time under load
(2026-10-04) of which most was games that have none. It reads one pinned
position a game from `testing/hint-chain-pins.ts`, and `hint-quality.test.ts`,
whose walk was already paid for, fails on a numbered chain from a game with no
pin there. The search runs when a pin is made, and membership is still derived.

Exemplars: `pegs-hint.test.ts` (rungs, cases of a rung as kinds, a stray line
of play, a pin kept by hand), `galaxies-hint.test.ts` (a ladder's rungs, pinned
mid-game) with `galaxies-hint-render.test.ts` (a frame from a pin:
`renderScenario({ game, id, moves, showHint: true })`).

**A game's own directory is not its coverage.** Its input paths, save
round-trip, params codec and even its source text (color literals, hint
wording, note vocabulary) are checked by cross-game guards that live outside
`src/games/`, so `vitest run src/games/<game>` can be green on a change the
commit hook then refuses. The hook's own plan is
`node scripts/checks/select-tests.ts` over what is staged: each test file on a
line of its own after `whole` or `narrow`. The guards name their per-game cases
after the game or its file path, so filter the files with `-t <game>` and check
the count is not zero. Pass the list through `xargs`: zsh does not word-split
an unquoted `$VAR`, and `vitest run $LIST` then finds no tests at all.

## Render scenarios

**The default for any highlight / overlay / animation-frame work.**
[`render-scenario.ts`](../../src/engine/testing/render-scenario.ts) exposes
`renderScenario({ game, id, moves?, presses?, at?, settle?, showHint?,
showMistakes? })`: it drives a real `Midend` to a target frame by
replaying game `Move`s directly (no pointer events, no coordinate maths),
optionally shows the hint's opening step (a pinned step, at any leg, is
`renderPinnedHint`: § "Pinning a hint's positions"), then captures `redraw`
through the shared
[`recording-drawing.ts`](../../src/engine/testing/recording-drawing.ts).

- **Assert what matters with targeted op checks** — these are the real
  guarantee.
- **Add `toMatchSnapshot` on the record** to catch unintended drift; a render
  regression is then a reviewable text diff. Re-baseline an intended change
  with `vitest -u` and **commit the regenerated `__snapshots__/*.snap`**. Pair
  every snapshot with targeted assertions so a careless `-u` can't erase the
  guarantee.
- **`toSvg(ops, size)`**
  ([`svg-drawing.ts`](../../src/engine/testing/svg-drawing.ts)) renders the
  record as a z-ordered SVG for the rare frame that needs eyeballing — keep it
  out of committed tests.

**`moves` reaches a board state; `presses` reaches a `Ui` state.** `moves` stays
the default — no coordinates, nothing a layout change can break. But a keyboard
cursor lives on the `Ui`, so **no `Move` can put it anywhere**, and "the frame
after one arrow press" was a frame this harness could not reach at all until
`presses` (a list of buttons sent through `Midend.processInput`, at `at`,
default the origin — a keyboard press ignores the coordinates). Pointer buttons
work through it too; prefer `moves` for those unless the *coordinates* are what
is under test. Exemplar: `tracks-render-scenario.test.ts`'s cursor frame.

**On an animated game, `moves` lands you on animation frame *zero*, not the
settled frame.** The move armed an animation, so the previous state is still on
screen, and anything drawn only once the move has landed (Inertia's dead-player
splat) is absent from the capture. Pass `settle: true` to run the
animation/flash clock out first. Asserting both frames from the same `moves` is
the cheap way to pin an animation's endpoints, and costs one extra scenario
call.

Seed exemplar:
[`palisade-render-scenario.test.ts`](../../src/games/palisade/palisade-render-scenario.test.ts)
— reaches a mid-plan hint frame in-process that no browser harness could.

**When a check genuinely needs the browser, choose the board so the frame is one
press deep.** The acceptance bar sends real UI work to the running app, and the
expensive part there is not the browser but the *walk* — clicking thirty hints to
reach the first interesting one, in a place where nothing is asserted and every
step costs a round trip. Invert it: scan seeds in a throwaway `vitest` file for a
board whose **first** press is the frame under test, print its game ID, and open
`/<game>.html?id=<id>` directly (`routing.ts` reads `type` and `id` off the query
string). Verifying that a Loopy note journey renders took one seed scan, one URL
and four clicks; a previous attempt at the same check walked in from a default
board and confirmed nothing. The scan is the same fixed-seed idiom tier 2.5 uses
to reach a deduction, aimed at picking the *board* rather than the frame.

### A snapshot cannot see a hole

**A render snapshot records the ops a frame *drew*, so it is structurally blind
to a region the frame left unpainted.** Nothing is missing from the record —
there was never an op there to miss — and the diff is clean whether the gap is
deliberate or a defect.

Measured the hard way (`derive-the-marks-key-from-having-notes`, 2026-09-21):
growing Map's canvas for the pencil-mode indicator left the new margin outside
the first frame's flood, which rendered as a thick black band around the board.
**All 334 test files passed, including the Map snapshot re-baselined with the
band in it.** It was caught by opening the page.

So when a change moves a canvas's *geometry* — a new margin, a shifted origin, a
grown `computeSize` — a green suite and a reviewed snapshot diff are not
evidence that the frame is right. Two habits:

- **Look at it.** This is the acceptance bar's "a green suite is not a rendered
  frame" in its sharpest form, because here the suite cannot in principle tell
  you.
- **Assert the flood covers the canvas**, not the board, wherever a game paints
  a ground layer *of its own* — a whole-board repaint (Cube, Loopy) or a ground
  in a color other than 0 (Rect, Untangle). That *is* expressible as an op
  assertion — a `rect` at `(0,0)` the size of `computeSize` — and it is the one
  part of the class a test can hold.

On the first frame of a fresh draw state the midend lays a color-0 ground over
the whole of `computeSize` (`docs/games/rendering.md` § "The rendering
doctrine"), so a grown margin can no longer be left black there; it is still
worth looking at, because color 0 may not be the color the margin should be.
`src/engine/first-frame-coverage.test.ts` rasterizes every registered game's
first frame at its default params, fails on any bare pixel, and requires the
ground to be the frame's first op. It was written when each game laid its own
ground, and found Pegs, Sixteen, Mines and Pearl shipping black borders
(`test-touch-on-a-real-device`). It does not see a margin that only a later
frame opens up, so the two habits above still apply there.

## Observing a midend

A render scenario answers "what does this frame look like". The other question
a midend-level test asks is **what the midend told the app** — the status bar,
the game state, the id, the timer readout, whether it wants the clock, how
often it asked for a repaint. Ask it through
[`drive-midend.ts`](../../src/engine/testing/drive-midend.ts):

```ts
const h = driveMidend(cubeGame); // or observeMidend(aMidendYouHold)
h.midend.newGameFromId("c3x3:000,4");
expect(h.last("status-bar-change")?.statusBarText).toContain("Moves: 0");
```

`last(type)` is typed from its argument, so a call site never restates a
notification's shape in a cast — a renamed field is a type error everywhere it
is read, rather than a hand-written `Extract<…>` that went on compiling. It
returns `null` when nothing of that type was sent. Clear `h.notes` to look only
at what follows. A test that only needs the midend to run passes no callbacks at
all: they are optional, and an all-no-op `setCallbacks` is ceremony.

## Render-op vocabulary

**Know which primitive records as which op, or your assertion silently never
matches.** The shared `RecordingDrawing` records a *filled* `drawRect` as
`op === "rect"`, but `drawRectOutline` — a stroked box: hint ring, error
outline, cursor frame — records as `op === "line"` segments. A test checking a
ring color must match `"line"`, not `"rect"` (asserting Range's premise ring
cost a debug cycle on exactly this). A `drawCircle` records with
`fill`/`outline` fields, **not** `color` — matching
`o.op === "circle" && o.color === …` type-errors and always misses (Light Up's
bulb assertions hit this). Prefer the shared recorder over ad-hoc doubles — a
local recorder that names ops differently is a second vocabulary to misremember.

**An op carries both forms of its color**: `op.color` is the palette index
the game passed; `op.rgb` the resolved `"rgb(r, g, b)"` label. Assert against
the game's own constant (`o.color === COL_HINT`); the resolved label exists so
a *snapshot* diff stays readable when a palette index moves, not for tests to
match on. Narrowing note: `DrawOp` is a discriminated union, so a chained
`.filter(o => o.op === "rect").filter(o => o.w …)` doesn't narrow — put the
whole predicate in one `filter`, or write a type guard.

## What a new game ships

**A new game has no oracle; its assurance is behavioral, and the standard
floor is a generation-invariant property test**: every generated board is
uniquely solvable at *exactly* its stated difficulty, across a fixed-seed
sweep. `scripts/new-game-port.sh` scaffolds a `<game>-generation.test.ts` stub
for exactly this (the scaffold deliberately emits no differential stub — see
the [`repo-layout`](../../openspec/specs/repo-layout/spec.md) scaffolding
requirement). Beyond that floor:

- Tier-1 behavioral tests: input→move mapping, `executeMove` purity,
  serialize/deserialize round-trips, completion detection.
- A tier-2.5 scenario for anything the game renders beyond plain tiles.
- Property tests wherever a closed-form invariant exists — cheap, additive,
  and they catch inputs no fixture recorded.

**Drive `executeMove` to completion in a unit test — no differential exercises
the interactive completion path.** A generator/solver check runs the solver's
verdict-only completion; the *interactive* completion path (error marking,
loop/path marking, flash labeling) is different code. Tracks shipped an
infinite loop confined to it: the connectivity `Dsf` build dropped an in-grid
guard, an out-of-bounds merge corrupted the union-find, and `canonify` hung —
behind a green 22-fixture differential. It surfaced only when a
`solve()` → `executeMove` → completed unit test hung. Always pair generation
checks with a tier-1 test that plays a move (or the solve move) through to a
completed board. Exemplar: [`tracks.test.ts`](../../src/games/tracks/tracks.test.ts).

## The frozen differentials

**Most games carry `<game>-differential.test.ts` against a frozen
`__fixtures__/*.json` recorded from the C build before `retire-c-engine`
(2026-08-01). The fixtures cannot be regenerated — ever — and that is by
decision, not accident.** There is no C build to ask "what would upstream have
produced?", so a deliberate divergence *retires or re-founds* its fixture
rather than re-recording it. What a fixture still does:
**it is the net under refactoring**. A change that alters a solver's verdict
alters which boards exist, which is exactly what these catch — nothing else in
the suite would notice a solver that got quietly stronger.

**None is kept for parity's sake**, and a fixture may be deleted with its test
(owner, 2026-10-09: *"we're really long past our need to maintain parity with
upstream during the port, and I'd be absolutely ok with you removing any such
old fixtures"*). Tracks' went when its path was laid another way: every seed
then dealt another board, and the tier contract grades what it deals.

The full statement lives once, in
[`differential.ts`](../../src/engine/testing/differential.ts) (the shared
helper's header), per the `testing` requirement — **a differential test
file must not carry a regeneration recipe, because none can be executed.**

Two shapes, both live:

- **Byte-for-byte desc match** — a faithful generator over the bit-identical
  RNG reproduces the C desc exactly for the same seed. Don't re-roll the loop:
  call `describeDescDifferential` with your fixtures, a params mapper, your
  `newDesc`, and an optional `extra` follow-on (e.g. the engine's
  `validateDesc(game, …)` returns null). Exemplar:
  [`unruly-differential.test.ts`](../../src/games/unruly/unruly-differential.test.ts).
- **Solver-agreement** — decode a recorded board, run the TS solver, assert
  the recorded difficulty verdict. Game-specific; stays inline. Exemplar:
  [`galaxies-differential.test.ts`](../../src/games/galaxies/galaxies-differential.test.ts).

**Not every game carries one, and that is a recorded decision, not a gap.**
Permutation / short-RNG games get their RNG-faithfulness transitively from
`random.ts`'s own corpus; each such skip is stated in that port's `design.md`.
Likewise finding no advisory `scripts/diff-*.test.ts` anywhere is expected —
that lifecycle is over (next section).

## Fixture lifecycle

**A differential had two lifecycles, and only one survives.** The gated,
committed, frozen-fixture test is the durable form. The advisory
`scripts/diff-<game>.test.ts` form earned its keep only while it shelled a live
C trace binary; the binaries, harnesses and build all went with
`retire-c-engine`, and every advisory script was deleted with its game's `.c` —
leaving one intact vestige, `npm run diff`, which no-ops (`--passWithNoTests`)
and exists for any future advisory-style check. **The trap this lifecycle rule
guards: a check that can no longer run its real comparison but still sits in
the tree reads as coverage while measuring nothing.** If you ever find an
advisory script that only re-reads the frozen fixture the gated test already
reads, delete it.

Historical residue worth knowing: some fixtures carry a `"genMs"` field — the
C's own wall-clock per board, recorded at capture time. It is evidence, not an
assertion (a wall-clock assertion measures the box, not the code): it settled
"is the port slow?" for Seismic by showing the C slower than the TS on the same
seed. The capture recipes themselves (`<game>-trace.c`, the pure-C build flag
dance) are in git history only — `git log --all -- 'puzzles/**'`.

## Byte-match: fidelity where there is a right answer

**Compressed history with a live core.** Byte-match was the porting era's
verification mechanism: on a solver-gated generator the desc depends on the
solver's verdict on every intermediate board, so one byte-match assertion
validated generator, solver and codec at once. The owner released the
constraint when porting finished — matching the C is no longer a reason not to
improve a game (the divergence policy and what must replace a retired oracle
live in [`solver-and-generator.md`](./solver-and-generator.md)). What stays
live here:

- **A byte-match proves a substitution changed no behavior — which makes it
  the safest possible ground for optimization.** Slide's key-encoding rewrite
  (35% of generation time → a hash + exact compare, 3.4× faster) was provable
  precisely because the differential pinned the output. When an optimization
  looks risky, check whether a fixture already pins its observable output.
- **RNG draws are observable side effects.** A generator loop that *rejects* a
  candidate has already spent its draws; "pick only legal candidates in the
  first place" silently diverges the stream. Tell: a C-style loop whose counter
  increments conditionally, or any draw skipped "because n === 1". This governs
  refactors of any fixture-pinned generator today, including the RNG-bearing
  leaf libraries (`latin.ts`'s `matching`, `loopgen.ts`, `laydomino.ts`) — a
  fixture-pinned game's generator is byte-sensitive *through* them.
- **A recorded artifact with no right answer is a yardstick, not an answer
  key.** Inertia's recorded C solver routes stopped being a byte-match target
  (an approximate optimizer has many equally good outputs, and a byte-match
  welds the port to C's shape and forbids improvement) and became a quality
  bar: the test asserts the TS route is legal, complete, and **no longer than
  C's** — a regression bar a byte-match could never give, since a byte-match is
  equally satisfied by faithfully reproducing a bad answer. Exemplar:
  [`inertia-differential.test.ts`](../../src/games/inertia/inertia-differential.test.ts).
- **Read what the reader accepts before deciding what a writer owes it.** Two
  codec lessons that generalize: an encoder that never flushes its trailing run
  is a *format*, not a bug — "completing" it diverges every desc (Boats); and a
  writer can emit what its own reader mis-parses, in which case the undefined
  range is free to fix — validate the fix by round-tripping through a decoder
  written strictly to the *reading* rules, never encoder-vs-own-decoder
  (Seismic, [`seismic/state.ts`](../../src/games/seismic/state.ts)
  `encodeWalls`).
- **A sort that feeds only rendering does not threaten a fixture.** Only sorts
  and draws on the path that produces the desc matter; trace whether the result
  reaches the desc byte-stream before treating a `.sort()` as byte-match
  surface.

## Order-independent verdicts

**When a generator's output was never reproducible byte-for-byte (upstream
sorted with `qsort`, whose tie-order is implementation-defined), its fixture
records only verdicts that are provably independent of the ambient order** —
for Undead: uniquely solvable, iterative-solver-solved, post-fixpoint ambiguity
count, brute-force outcome. An order-*dependent* quantity ("passes to
fixpoint") is deliberately not recorded. The TS test decodes the same descs and
asserts its solver reaches identical verdicts — validating solver + codec
where the generator cannot be pinned. Exemplar:
[`undead-differential.test.ts`](../../src/games/undead/undead-differential.test.ts)
and its design D1. When asserting against such a fixture, keep the
order-independence argument in the test — it is the load-bearing part.

## Quirks are load-bearing — capped, not cleaned

**A preserved upstream quirk is part of which boards exist; a hygiene "fix"
diverges the fixture.** But a quirk whose safety depends on an unproven
invariant gets a belt: port the quirk faithfully *and* wrap the loop in a
generous throw-on-exceeded cap, so a faithful port stays correct while an
accidental divergence fails loudly instead of hanging (Singles'
`MAX_REGENERATE`; the shared form is
[`retry-limit.ts`](../../src/engine/retry-limit.ts)). The same shape guards
every generate-until-success loop, quirk or not.

## When a fixture goes red

**A red differential after a refactor means the set of boards that exist
changed — treat the fixture as the instrument and your change as the suspect.**
The debugging loop, retold for the post-C world: find the first fixture that
mismatches; if the game records intermediate verdicts, binary-search for the
first board whose solver verdict moved; toggle techniques off one at a time to
isolate which got stronger or weaker; then diff that technique against its
pre-change self. Two gotchas that have burned real time:

- **A sentinel imported from the wrong module reads as `undefined`** and
  silently weakens a `diff >= X` gate — a Tricky board "fails to solve" with no
  type error. When a difficulty-sentinel test misbehaves, check the import
  source before the solver.
- **Beware translated C loops whose increment clause had side effects** — an
  original `for (…; …; ++j, board[i] = 1)` also ran its side effect after the
  final iteration; a naive translation won't. If a fixpoint refactor touches
  such a site (they are commented at the sites that survived porting), the
  after-last-iteration effect is part of the behavior.

If the change is a *deliberate* divergence, the fixture is retired or
re-founded — never hand-edited to pass; see
[`solver-and-generator.md`](./solver-and-generator.md) for the policy and the
required replacement assurance.

## Seed-deterministic, never clock-gated

**A heavy test's work must be identical every run; only the clock may move.**
A retry-until-unique generation or an exhaustive solve legitimately takes 1–3 s
solo and stretches 5–10× under full-suite CPU saturation. Rules, all learned by
violating them:

- **Drive generation from a fixed seed** (`randomNew("…")`) so the work and
  the verdict are load-independent.
- **Never give a test its own timeout.** There is exactly one ceiling,
  `testTimeout` in [`vitest.config.ts`](../../vitest.config.ts), and it is a
  runaway backstop, not a gate. A per-test ceiling is a guess about contention:
  it can only be tighter than the global one, and it must be re-guessed forever
  (one game's went 30 s → 60 s → 120 s and still failed a green commit).
- **Never assert `elapsed < N ms`** as a proxy for "the algorithm is
  efficient" — that measures the box's spare capacity. Assert a
  load-independent proxy instead: a bounded expansion count, iteration count,
  or result shape.
- **A hang is not a slow test, and a timeout was never going to catch one.**
  These tests are synchronous; a runaway loop blocks the event loop, so the
  timeout's timer cannot fire (the same mechanism that orphans vitest workers —
  [`reap-orphaned-workers.sh`](../../scripts/reap-orphaned-workers.sh)). Bound
  non-termination **in the code**: [`step-budget.ts`](../../src/engine/step-budget.ts)
  for solver/hint fixpoints, [`retry-limit.ts`](../../src/engine/retry-limit.ts)
  for retries — opt-in/gated so a false trip can't hit the production hot path.
- **Don't judge a generator's real cost from a vitest run.** The vitest module
  runner plus suite contention has shown a ~7× gap against a plain `node`
  process on the same seeds. Re-measure outside the runner before designing a
  fix for a "slow" generator.

Normative: `testing`, "The test suite is deterministic under parallel load".
"Contention on work that terminates" is a complete diagnosis and its fix is
removing the clock gate — reach for the other causes (shared state, order
dependence, non-termination) only when evidence points there; re-run the file
alone.

**Localize a suspected cross-file leak in one worker, in both orders.** A test
that fails only in a full run and passes alone is localized by forcing the
suspected files into one worker (`VITEST_MAX_WORKERS=1 vitest run <a> <b>`) and
running them in both orders, with `--sequence.shuffle.files` under recorded
seeds. One worker still runs its files in the order the sequencer picks, so a
pair run once can pass by scheduling the victim first.

## Right-sizing the gate

**A test earns its runtime.** The bar is what it would catch in a refactor that
no cheaper test would, and a test that cannot answer that is a candidate for
retirement whatever it cost to write. Three things keep that from becoming an
excuse:

- **Retire by measurement, never by category.** "It was a porting test" is
  not a reason: the frozen differentials are porting artifacts and the
  strongest net under solver refactoring. Answer per fixture.
- **Say what still covers the configuration**, at the site, when you defer or
  delete the only case covering a mode, grid type or difficulty.
- **A guard that catches what the author just wrote stays on the per-commit
  path, on one board of every kind it walks.** More boards of the same kind,
  and a check on *decay*, go to push (§ "One board of each kind per commit");
  the conditions are in the `build-pipeline` spec.

**The gate is paid on every commit; keep each test's cost proportional to what
it catches.** Three treatments, in order of how little they lose:

1. **Short-circuit a deterministic search.** A "scan seeds until a board shows
   technique X" loop finds the same hit every time — record the first find and
   start there, falling back to the full scan if the pin goes stale (never
   failing on it). Loses nothing: see `FIRST_FOUND_AT` in
   [`boats-hint.test.ts`](../../src/games/boats/boats-hint.test.ts), 63 s → 6.4 s.
2. **Turn a seed count down** with `seedBudget(gate, full)`
   ([`slow.ts`](../../src/engine/testing/slow.ts)) — only for a property whose
   violation would be *systematic*, and say at the call site how many
   assertions the reduced count still executes.
3. **Defer to `npm run test:slow`** (`slow: true` on `describeDescDifferential`,
   or `describeSlow`/`itSlow`) — only where the cost is board **size** rather
   than configuration. **Never defer the only fixture covering a
   configuration**, and state what still covers it. The slow tier runs once per
   refactoring round; a tier nobody runs is worse than a deleted test, because
   the file still reads as coverage.

### Deal through `dealt`

**A cross-game sweep takes its boards from `dealt(game, params, n)`**
([`testing/dealt.ts`](../../src/engine/testing/dealt.ts)), and a sweep that
drives a midend begins it with `beginDealt`. Dealing is where a sweep's time
goes: following a hint plan to the end of a board measured under 0.1 s on all
but three of the boards of the six dearest games, and dealing one took up to
19.5 s (Group's 8x8 at Hard, 2026-10-08). Each sweep used to seed its own deal
from its own name, so a dozen guards each dealt that board afresh. The suite
runs with `isolate: false`, so the dealer's cache is one per worker, and that
alone took the suite from 1,475 s of test time to 1,195 s.

- Take a second board of the same params with `n`, only where the property
  needs one. Never seed a deal from the guard's own name.
- A sweep's boards changed when it moved to the dealer, and four tests went red
  on what the new boards showed, three of them true: a Singles sentence over
  the length limit on a 12x12, a second its ledger had never heard, and a Solo
  rung whose premise is short. A sweep reports on the boards it walked; a
  sentence or a rung that matters is pinned to a board (§ "Pinning a hint's
  positions").
- A game's own test deals as it likes. The dealer is for the sweeps that walk
  every game.

### One board of each kind per commit

**The per-commit hook walks one board of each kind, and the push walks the
rest.** `perCommit(hook, wide)` ([`slow.ts`](../../src/engine/testing/slow.ts))
is the lever, and `gatePresets` uses it, so a sweep that takes its boards
there has it already. In the hook:

- a sweep walks one board of each params set where the push walks several;
- `gatePresets` leaves out a game's largest board, and keeps one board for
  every value of every mode, tier and choice;
- the bound-hint walk in `hint-quality.test.ts` checks the first 400 steps of
  a board.

CI runs everything on every push, and so does a bare `vitest`: nothing but
the hook sets the toggle. **After changing the code a sweep guards, run that
sweep wide before committing**: `npx vitest run src/engine/hint-resume.test.ts`
for a hint planner, the file named for the mechanic otherwise. The hook is not
that run.

Use it only for more of the same. The only board of a mode, a tier or a rule
stays in the hook, and so does anything a single board shows. Say at the call
site what the hook's amount still walks.

Measured 2026-10-08 on this machine at load 4 to 5, the whole suite as the
hook runs it when a commit selects every test, one run each back to back:
1,643 s of CPU and 763 s of wall before, 865 s and 387 s after the dealer and
this together. A commit that touches one game selects far less.

**The hook and the push can walk different boards of one game.** The slice
takes the smallest preset that supplies each value still wanted, so leaving out
the largest board can change which preset a mode is walked on. A ledger a walk
is held against has to be true of both.

**A guard that only reads source runs first, if you let it.** The gate runs
the *source scans* as a pass ahead of the rest of the suite, so their failures
arrive in seconds rather than after the whole run. Nobody enrolls a file:
[`scripts/checks/source-scans.ts`](../../scripts/checks/source-scans.ts) takes
any test that reads source through a `?raw` `import.meta.glob` and whose import
closure reaches nothing under `src/games/`. So when you write a guard that scans
game source, keep its imports off the registry and the game modules. Reading a
game's text needs neither, and one import of `games/index.ts` (or of a helper
such as `testing/hint-games.ts` that imports it) moves the file into the main
pass without a word. `node scripts/checks/source-scans.ts` prints the current
set. The spec is `build-pipeline`, "The gate runs the source-scan tests as a
pass ahead of the rest of the suite".

**Run the slow tier targeted, not whole.** `npm run test:slow` re-runs all
~8,500 gate tests *as well*, with the widened seed budgets on top; the deferred
tier itself is six tests in three files. Pass a path and the script forwards it
to vitest — `npm run test:slow -- src/games/seismic`,
`npm run test:slow -- src/engine/hint-resume.test.ts`. That is the form to reach
for when a refactor moves a solver, a generator or a hint planner: run the slow
tier for the games it could have moved, when you move them.

### Narrowing a game's own sweep

Four shapes to look for in a game's expensive property test before choosing
among the treatments above. Each is settled by timing the items inside one run
and planting the defect the test is named for, never by reading the test.

- **Time the dealing apart from the property.** A sweep that deals a board per
  case can spend most of its time in the generator: a top-tier 4x4 Spokes
  board takes up to 2.4 s to deal and 5 ms to plan on. A test that wants such
  a board only to plan on writes its descriptions down. A description stays a
  board of its tier whatever the generator later deals.
- **"Systematic" is a claim about one rung, and it is planted, not argued.** A
  seed count is a confidence dial only for a defect that shows on most boards.
  Lift each guard the property rests on and count the boards that show it, per
  tier. Where few do, write down boards on which that guard decides something;
  where a tier shows nothing, it is not buying its cost.
- **A rule that rarely decides anything needs a board where it does.** A test
  named for a rule, walking boards on which the rule never changes the
  outcome, stays green with the rule deleted. Lift the rule, scan for the
  positions where the outcome changes, and write those down; have the test
  hold a written-down board to being such a board where it can
  ([`method.md`](../method.md) § "A sweep that finds zero owes a power
  argument").
- **A game's own walk follows the plan; asking again after every move is
  `hint-resume.test.ts`'s.** Recomputing per move multiplies the cost by the
  plan's length and reads only each plan's first step. Follow each plan to its
  end and ask again when it runs out, unless what is under test is the
  recomputation itself: a cycle, or a plan length that must fall by one.

### Where the cost actually is — measured 2026-09-09, so you need not re-derive it

`retire-tests-that-do-not-earn-their-runtime` ranked all 301 test files. Two
results are worth not rediscovering:

- **The frozen differentials are not the expense.** 50 files, **10.1%** of suite
  time; the heaviest single one is 11.5 s CPU. Keeping every one of them is
  cheap, so the question "can we afford the differential corpus?" has an answer
  and it is yes. They stay — see [The frozen differentials](#the-frozen-differentials)
  for why they are worth keeping on the merits.
- **The expense is search-based hints amplified by the cross-game guards.**
  Attributing each guard's per-game case to the game it names: Sixteen **30%**,
  Netslide **13%**, Spokes 8.5% — half the suite in three games. A hint that
  *searches* pays for board size twice over (one full search per move, and more
  moves to make), and the guards recompute a hint after every move. So the axis
  to slice for those games is **board size**, and `SEARCH_PLANNING_GAMES`
  ([`hint-games.ts`](../../src/engine/testing/hint-games.ts)) derives the
  population from each game's own source rather than listing it.

**Attribute cost per game, not per directory.** Ranking by file reports
`hint-resume.test.ts` and `hint-quality.test.ts` as undifferentiated "engine"
cost and hides which game makes them expensive — Sixteen reads as 17% by
directory and 30% once its cases inside the cross-game guards are counted. The
per-game `it` title is the join key; this is [`method.md`](../method.md) § "A scan that keys on a
name" aimed at a cost model.

**The import graph alone cannot say which tests a change affects.** Measured
(`measure-test-impact-selection`, 2026-09-09): `vitest related` walks the static
import graph, but 26 test files reach their subjects through
`import.meta.glob(..., "?raw")` — reading game source as *text*, because a
cross-game guard derives its population from what a game **is**. A file read as
text forms no import edge, so a game change omits five glob-only guards and a
`help/` change selects **nothing at all**. The rule that makes the guards
impossible to forget is what makes them invisible to the graph. That is why the
hook's selection (`scripts/checks/select-tests.ts`) is the union of the graph
and a walk that follows imports *and* globs, and never the graph alone. The walk
is [`reach.ts`](../../scripts/checks/reach.ts), and it reads the globs in every
module it visits, not only in the test file: a guard that reads source through a
helper reads whatever the helper's glob matches.

**Title a cross-game case `<id>: …`, and let it read only that game.** Any
change to a game reaches the registry, and every cross-game guard imports the
registry, so file selection saves nothing there; the cost is inside the files.
Measured 2026-09-27 on a Pearl-only change, 518 s of 593 s of test time was
per-game cases in cross-game guards, and 413 s of that was games other than
Pearl. So the hook scopes a commit to the games whose own code reaches a staged
path: a game directory's own files, or the engine modules its imports reach.
It sets `GATE_GAME_SCOPE`, and vitest skips every case titled for a game outside
it. That took the Pearl commit's selection from 310 s to 103 s of wall time. A
test file that reaches a staged path *itself*, not through a game, runs whole in
a vitest run of its own, because nothing but the games is partitioned by title.
The soundness condition and both of the things that read the variable are in
[`game-scope.ts`](../../src/engine/testing/game-scope.ts). A case titled some
other way still runs, which costs time and never a check. A case titled for one
game that reads another would be skipped unsoundly, so don't write one. Build
the title with a template, never `describe.each(...)("$id: …")`: vitest renders
a `$` field quoted, so the title comes out as `'keen': …`. That is how
`difficulty-contract.test.ts` escaped the narrowing until it became a loop.

**An assertion over a whole sweep has to narrow with it.** A narrowed run's
counters see only the touched game's cases, so a count held against the
registry or a floor like "walked more than 100 boards" goes red on an innocent
commit. [`slow.ts`](../../src/engine/testing/slow.ts) has the two answers. Filter
a ledger compared against what the cases found with `inSweep`, so the touched
game's entry is still checked. Put a floor no single game could meet in
`itOverWholeSweep`, which skips it on a narrowed run. When a touched game *could*
fail a floor on its own, for example by dropping out of the population so that
it has no case left, compute the floor from the games directly rather than from
the cases, and keep it in a plain `it` (`input-parity.test.ts`'s `offered`
keypads). To check a new guard, run it with `GATE_PRECOMMIT=1
GATE_GAME_SCOPE=<one game>`; what fails there is what the hook would reject.

**A helper's glob is paid for by every file that imports it.** The walk works
at the grain of a module, so a helper that reads every engine module as text
makes each of its importers run whole on any engine commit, whether or not the
importer calls the function that reads them. `engine/testing/enrollment.ts` once
held the engine-source and test-source scanners beside `builtGames`, and every
hint guard imported it through `hint-games.ts`: on an engine commit none of the
heavy guards could narrow. So a glob over a broad tree lives in a module of its
own (`engine-source.ts`, `test-source.ts`, beside `code-lines.ts` for the shared
comment-stripping), and a scan over that tree lives in a test file of its own
(`hint-em-dash.test.ts`, split out of `hint-quality.test.ts`). The same holds
for a test file: one cheap `describe` reading the engine makes every sweep in
the file run whole. Losing the narrowing fails nothing and only costs time, so
`select-tests.ts --verify` holds four heavy hint guards to running narrowed on
an engine module only some games reach; if it goes red, find the import that
now reads a broad tree rather than widening the check.

**Measure CPU rather than wall — and check what the box is short of first.**
Contention inflates wall several-fold and unevenly (5.2× on one file, 1.6× on
another in the same run), so even the *ranking* distorts. `/usr/bin/time`'s
`user + sys` is the better instrument but **not an immune one**: two untouched
files re-measured at 22.4 s and 14.8 s against 40.5 s and 25.2 s — inflation of
**1.7–1.8×**.

The reason is worth carrying, because it caught three instruments in a row.
**This box has 16 GB of RAM and sits ~24 GB into swap**, so the scarce resource
is memory, not cores; under paging `sys` time *is* page-fault time, and
`user + sys` therefore re-imports the contention that switching off wall clock
was meant to escape. Record free memory and swap beside the load average, treat
any figure taken under paging as an upper bound, and trust **ratios taken under
comparable conditions** rather than absolute seconds.

## Break the code under a new test

**Writing a test is not the same as the test working — flip the line it is
for, watch it go red, put it back.** This applies double to a test you just
made cheaper: the failure mode optimization causes is a test that still passes
and no longer catches anything. `wires.test.ts`'s both-sides check passed with
the checked code *deleted*, because its chosen case was caught by an unrelated
guard. Seconds of work; it is the only thing distinguishing an assertion from a
decoration. (The systematic version of this instinct is the mutation probe —
[`docs/test-strength.md`](../test-strength.md).)

## A shared module needs its own tests

**Extracting logic from a game into `src/engine/` moves the code but not its
tests** — the game's frozen differential still catches a defect in the shared
module, so nothing goes red and the module quietly ends up with no local
assertions. That is adequate *protection* but poor *feedback*: the failure
arrives as a differing desc string after a full generate-and-compare, not as a
named rule in 100 ms, and it is invisible to the run-just-what-I-touched habit.
**When you extract, write the extracted module's tests in the same change**,
stating the rules its doc comment claims rather than pinning values. Exemplar:
[`wires.test.ts`](../../src/engine/wires.test.ts).

## Enrollment duties

**The cross-game guards derive their populations mechanically; a game enrolls
by declaring, not by being remembered.**

**Which means a change confined to one game's directory is not confined to one game's
tests.** Two guards take their population from the *whole tree*, so any edit anywhere
can move them, and neither lives under `src/games/`:

- [`capability-surface.test.ts`](../../src/capability-surface.test.ts) snapshots every
  game's method and `Ui` field lists. A new `Ui` field is an intended re-baseline —
  `vitest run <path> -u`, then **say so in the change**, because the snapshot's own
  comment distinguishes a deliberate re-baseline from the sweep silently shrinking a
  game.
- [`asset-integrity.test.ts`](../../src/asset-integrity.test.ts) § "no doc comment
  describes a member that was deleted out from under it" scans every `.ts` file under
  `src/`. Inserting an exported function immediately above another one strands the
  **second** function's doc comment on the **first**, leaving two stacked comments and
  one silently undocumented export — type-correct, test-green, and invisible in review.
  `add-loopy-auto-rule-out` did exactly this and the guard caught it.

So **run the whole suite before believing a game-local change is game-local**. Running
the game's own directory plus the cross-game hint guards passed cleanly on that change
while both of these were red.

- **Hints**: **declaring `hint()` *is* the enrollment.**
  [`hint-games.ts`](../../src/engine/testing/hint-games.ts) filters the registry
  for games that declare one, so a game is covered by all six guards at once —
  `hint-resume.test.ts` (plans resume from any position),
  `hint-overlay.test.ts` (the overlay reaches the render cache),
  `hint-quality.test.ts` (narration form), `hint-mark.test.ts`,
  `hint-ordinal.test.ts` and `scripts/checks/hint-deixis.test.ts` — with nothing
  to remember and nothing to add. It was a hand-maintained thirty-game array
  until `derive-hint-enrollment`; a game left off got **zero** of the six,
  silently. Recipe and rationale: [`hints.md`](./hints.md).

  *What guards a derived population is not the same as what guarded a list.*
  [`hint-enrollment.test.ts`](../../src/engine/hint-enrollment.test.ts) puts
  floors under both the registry it draws from and the set it produces, because
  the six consumers build their `it()` blocks in a loop and an empty array leaves
  them with nothing to run — and `npm run test:run` passes
  `--passWithNoTests`, under which "nothing to run" is **green**. Asserting the
  derivation against its own definition would have been a tautology; the floors
  are the part that can actually fail.
- **Recorded premises**: a game whose hint calls the candidate walk is in
  [`firing-replay.test.ts`](../../src/engine/firing-replay.test.ts), which
  audits that every recorded firing it offers follows from its premise. The
  solver's part is a replay: a `latinSolver` game has one already, and a
  bespoke recording solver writes a `ReplayAdapter`. One that records without
  offering a replay is reported, not skipped, so a new solver cannot go
  unaudited in silence. See [`hints.md`](./hints.md) § "A premise names
  everything its deduction reads".
- **Difficulty tiers**: declaring `Game.difficulty`
  ([`difficulty.ts`](../../src/engine/difficulty.ts)) *is* the enrollment —
  [`difficulty-contract.test.ts`](../../src/engine/difficulty-contract.test.ts)
  derives its set from the registry, so a tiered game that fails to declare
  fails a test. The guards: cap-monotonicity (Boats shipped without it and it
  silently broke Check & Save on every Easy board), every tier generating or
  refusing with a reason, tier list matching the difficulty `paramConfig`
  choices, tiers surviving the params codec. Adapter gotchas (build the solver
  input from the desc, never reuse scratch, seed the givens):
  [`solver-and-generator.md`](./solver-and-generator.md).
- **Registration**: [`catalog-registry.test.ts`](../../src/catalog-registry.test.ts)
  asserts catalog ≡ registry in both directions; adding a game is two edits
  (`src/games/index.ts`, `src/puzzle/catalog-data.ts`) and this test holds them
  together.
- **Layering**: [`module-layering.test.ts`](../../src/module-layering.test.ts)
  enforces that no game imports another game, the engine imports no game
  (except `testing/hint-games.ts`, the enrollment file), neither imports the app
  shell — and ratchets runtime import cycles at zero. Every rule there has been
  verified to fail when violated; a layering rule that has never fired may not
  work.
- **Mistake overlay**: the paint-twice per-game test obligation (a cold frame
  proves nothing — every cell misses the cache on frame 1) is owned by
  [`rendering.md`](./rendering.md) § "Overlay sidecars"; the testing
  half is: paint, `findMistakes()`, redraw the *same* drawstate, assert the
  highlight on the second paint, and ideally that a third frame without the
  overlay erases it.

### How a cross-game guard finds its population

The bullets above are instances of one rule, and writing a new guard means
following it rather than re-deriving it. Surveyed across every cross-game guard
in the tree by `audit-declared-versus-derived-capabilities`; the normative form
is the `ts-engine` spec, "A shared mechanic is joined by having it".

1. **Derive the population from what the game *is*** — the object it registers,
   a method's presence, the `Ui` its `newUi` returns, its own comment-stripped
   source. [`testing/enrollment.ts`](../../src/engine/testing/enrollment.ts) is
   the shared way to ask (`builtGames`, `enrolledIn`, `membersNotMentioning`),
   and it memoizes the 57 boards that used to be regenerated per guard. **Never
   a roster of opted-in names**: a game left off a roster gets none of the
   guard, silently, and nothing says so.
2. **Put a floor under the population you drew from**, not only under the set
   you filtered out of it (`Enrollment.population`). A filtered count can look
   healthy while the registry behind it is empty, and `--passWithNoTests` makes
   "nothing to run" green.
3. **State the exceptions as a ledger, never as the enrollment key.** Where the
   derived set legitimately has members the rule must not apply to, record them
   in the *guard* — one entry per member, each with its reason — and assert the
   ledger equals what the derivation found. The declaration then says *why*, and
   the derivation says *who*; the ledger cannot rot, because the derivation
   checks it. Exemplars: `input-parity.test.ts`'s `NO_KEYBOARD`,
   `completion-vocabulary.test.ts`'s `NO_FLAG`, `hint-quality.test.ts`'s
   `NARRATES_MOVES`, `contract-surface.test.ts`'s `NO_CONSUMER`. Several are
   **empty and meant to stay so**, which is a real assertion and not a stub.
   **An excuse that says the game has no such section is not a ledger entry**:
   it is the game's `notApplicable` reason, which its help page prints, and the
   guard reads it with `sectionState` ([mechanics](./mechanics.md) § "Contract
   sections, and what makes a draft"). That is where `NOT_TURNED`, the "no
   solver" half of `NO_FLAG` and three entries of a refusal-opening ledger went
   (the ledger itself went when the midend took the opening over).
4. **Where the game must declare a flag because production needs the answer
   synchronously, hold the flag to the behavior.** The `Game` contract carries
   boolean declarations, and each is asserted equal to a derivation rather
   than trusted: `ignoresSecondaryButton` iff the secondary button means nothing
   the player can perceive (`input-parity.test.ts`; consuming `RIGHT_BUTTON`
   with a bare repaint is not a meaning), `canMarkAll` iff its `interpretMove` answers `M`
   (`mark-all.test.ts`). A flag that only turns a
   guard *off* is the one that most needs this — nothing else notices when it
   lies.
5. **Scan code, not text.** `membersNotMentioning` strips comments first,
   because a mention in prose is not a use: the check's first cut convicted Net
   for a comment explaining that it deliberately has no stylus branch. Key on
   the name and take the superset; narrowing the key is the error this repo
   makes most ([`method.md`](../method.md), "A scan that keys on a name"). When the population is
   *who uses a symbol*, skip the key altogether: `npm run refs -- <file> <Name |
   Type.member>` answers by reference, including the `latinSolver<Ctx>(` calls a
   grep misses. It is blind to source read as text, which is exactly what
   `membersNotMentioning` reads, so the two answer different questions.
6. **Ask a question the system is actually asked.** A guard that *synthesizes*
   its own inputs can pose one no code path ever poses, and then convict games of
   failing to answer it. `assert-that-tiers-bind`'s first cut asked "does a board
   generated with tier T applied to the collection's cheapest valid preset need
   tier T?" — and a 4×4 Solo board cannot be Hard however its params are labeled,
   so it reported **ten violations across four games**. Re-keyed on the presets a
   player can pick, reading each one's *own* tier: **three, in one game, and they
   were real.** `validateParams` accepting a params record is not evidence a board
   can carry what is in it.

   **Tell:** your guard builds its inputs with a `with*`/setter rather than
   reading them off something the game offers. The population is what the game
   presents — its presets, its registered object, its `Ui` — not what the guard
   can construct out of the parts. **It is the most common tell in the tree**:
   eleven sweeps were found wearing it at once
   (`slice-the-first-leaf-hint-guards-by-axis`), so when you write one, grep the
   file you are copying from before you copy its population.

   **The exception is real and narrow, and it has to be said at the site.** A
   synthesized params record is the wrong input when the question is what a
   *board* carries, and the right one when the question is what the *contract
   does to a record* — `difficulty-contract.test.ts`'s codec round-trip
   generates no board at all. It is also right when the behavior needs a
   combination no preset carries: a menu never pairs a small grid with a hard
   tier, because menus climb size and difficulty together, and Keen's ordered
   chain fires on none of its ten presets and readily on 4x4 at Hard — a board
   the Custom dialog offers and `validateParams` accepts. Say which behavior
   needs it, and keep the slice beside it rather than instead of it.
7. **A coverage guard has a *second* key, and it needs the same discipline as
   the first.** Rules 1–6 are about finding *who*; a guard that reports a
   shortfall also has to decide who is already covered, and that side is the one
   nobody checks — an over-reported shortfall fails no commit. It sits in the
   tree looking like diligence until somebody tries to close it and finds the
   test already there. `mistake-overlay-coverage.test.ts` derived its population
   from the capability set, argued the point at length, and then keyed coverage
   on the string `showMistakes` — one harness's flag, and the newest of three
   ways to drive a mistake frame. **Six of the seventeen games it convicted
   already had the test**, including Galaxies, whose three-frame version this
   guide's `rendering.md` cites *by name* as the exemplar
   (`widen-the-mistake-overlay-coverage-key`, 2026-09-09).

   **And the fix's own first cut repeated the defect one layer down**: the
   widened key matched `\bredraw\w*\(` and still missed Galaxies, which calls
   `galaxiesRedraw(`. Take the superset on *both* keys and classify what it
   catches.

   **Tell:** the covered set is a single `includes("…")` while the population
   above it took twenty lines to derive.
8. **A behavioral sweep drives its board through `probeBoard`**
   ([`testing/input-probe.ts`](../../src/engine/testing/input-probe.ts)), and
   reads a `Ui` through its `ui()`, which reads the one the midend hands to
   `redraw`. It answers two questions every such sweep has to answer. The board
   is dealt from a fixed seed, so a failure names the same board every run. And
   `reset()` **deals the id again, never `restartGame`**, which replaces the
   board but keeps the `Ui`. A highlight left showing by one probe point then
   answers for the next: `select-or-drag.test.ts`'s first cut reported repeat
   taps as inert in Crossing, which has no such defect. `drag-cancel.test.ts`
   had its own midend, dealt a random board per run and reset by restarting,
   until `share-the-ui-reading-probe` moved it onto the shared probe. Use
   `restartGame` only where the state replacement is the thing under test.

### Slicing a preset sweep for the gate

Rules 1–7 find *which games*. A sweep over **boards** has a second population —
which of each game's presets — and it goes wrong the same way, one axis at a
time, because every wrong answer looks like coverage.

**Never invent a key, and do not build a population at all. Call
`gatePresets(id, game)`**
([`testing/hint-games.ts`](../../src/engine/testing/hint-games.ts)): it hands
back every preset in the slow tier and the slice otherwise — one
preset per *value* of every axis the game varies, derived from the game's own
`paramConfig` — and it decides the search-planning games' cost discipline for
you. In the per-commit hook the slice leaves out each game's largest board
(§ "One board of each kind per commit"). Difficulty is not special there; it is a `"choices"` item like any other,
so the slice **replaces** a `tiers.map(withTier(base))` loop rather than
multiplying with it, and the board it walks a tier on is one the player can pick
from the menu.

`dealtBoards` is underneath it
([`testing/presets.ts`](../../src/engine/testing/presets.ts), which reads no
registry), and is the call for a sweep over games without a hint, or one that
wants its modes and no large board (`scalarEnds: false`).
[`desc-error-games.test.ts`](../../src/engine/desc-error-games.test.ts) wants a
board only for its **desc**: a large board adds no grammar its mutants do not
already write, and generating one cost Slide 30 s.
[`mistake-invariant.test.ts`](../../src/engine/mistake-invariant.test.ts) asks a
solver's second consumer, which a cap or a clue structure desynchronizes and a
size does not. `axisSlice` and `leafPresets`, beneath that, are for a sweep
about the slicing rule itself: a sweep that calls them deals nothing the menu
leaves out.

**Calling it is the whole of the enrollment, and that is the lesson.** Every
cross-game sweep but one used to decide this population for itself and all of
them decided it wrong; three sat inside the very file whose main walk had
already been widened (`slice-the-first-leaf-hint-guards-by-axis`). A sweep that
was fixed once is not a sweep that stays fixed, so the rule names the function
rather than the finding — and
[`hint-enrollment.test.ts`](../../src/engine/hint-enrollment.test.ts) scans the
suite for `firstLeaf(`/`.withTier(` and holds what it finds to a ledger, one
entry per file with the behavior that needs a record the presets menu does not
offer. Do not count these in prose; the scan is the count.

Three keys have been tried here and the first two were each right about one axis
and blind to the rest:

| key | what it walked | what it missed |
| --- | --- | --- |
| `firstLeaf` | the smallest, easiest board | every Hard, every `Unreasonable`, every mode — 13 refusals across 7 games |
| one per tier | a board at each difficulty | every preset of an **untiered** game after the first — Sixteen's cycling 5×5 |
| tier + first/last | that, plus the size ends | every **mode**: Solo's Killer/X/jigsaw, Unequal's Adjacent, Seismic's Tectonic, 17 of Loopy's 18 tilings, 10 of Salad's 11 presets |

**What the menu does not offer is dealt beside the slice.** The slice walks one
preset per value *the presets vary*, so by itself it is blind to a value the
Custom dialog offers and no preset holds. Salad's Normal tier was one: all
eleven of its presets were Easy, and its hint threw on 71 of 1,195 Normal
boards with every guard green (`fix-salad-number-ball-hint-throw`). So
`dealtBoards`, which `gatePresets` calls, adds every such value of a
`"boolean"` or `"choices"` item, written onto the first preset in menu order
that `paramsError` accepts it on (`unofferedValues`). A game is dealt on
everything its dialog offers by having a `paramConfig`, and there is no list.

Three things to know about those boards:

- **This is the `with*` form rule 6 warns against, used for the one thing it
  is right for.** The rule is about a sweep that synthesizes its boards
  *instead of* reading the menu. These are for a value the menu has no board
  to read, and they are dealt beside the slice.
- **A tier written onto the smallest grid is a board the dialog deals, and it
  may not be a hard one.** It reaches the code that tier switches on, and it is
  not a substitute for a preset at that tier. A rung that needs a large board
  at a hard tier still wants its pin (§ "Pinning a hint's positions").
- **Expect a guard to meet a board its own setup never allowed for.** The 53
  values this first dealt found no fault in a game and two in guards: one
  threw on any refusal from a fresh board, which Group's Unreasonable tier
  gives honestly on most of its 6x6 boards, and one needed a cell with two
  candidates, which the smallest Solo under mirrored clues may not have. Fix
  the guard's assumption; do not drop the board.
- **A value no preset accepts has no board**, because the field depends on
  another: ABCD's rule against diagonal touching needs five letters, and no
  ABCD preset had them. `hint-enrollment.test.ts` holds such values to a
  ledger, `NO_BOARD`, which is empty: ABCD's menu gained a board with five
  letters. Prefer that fix. A whole rule with no board on the menu is an
  omission a player meets too.

A `"string"` item is not walked this way. A free scalar has no list of values
to hold the menu against, and its ends are the slice's.

**Why `paramConfig` is the right source**, and not the params object's keys: it
is a value a mechanism *consumes* (the Custom dialog is built from it), so it is
a declaration of the healthy kind rather than a manifest; `custom-params.test.ts`
already fails a registered game whose list is empty, so it is complete; and it is
*typed*, which is the whole of the rule. A `"string"` item is a free scalar whose
values lie on a line — cover both ends. A `"boolean"` or `"choices"` item is a
selection from a closed set with nothing between its members — cover every one.

**It is cheap where it matters and expensive where you would guess.** Measured
2026-09-20 across the collection, the slice went 88 → 141 walks and
`hint-resume.test.ts` 25.1 s → 67.0 s (on a box 18.6 GB into swap, so upper
bounds; the ratio is the figure that survives). But the *mode* coverage that
motivated the widening is nearly free — Seismic's Tectonic board 3 ms, Group's
identity-hidden 11 ms, Unequal's Adjacent 34 ms — because presets are taken in
menu order, so each value is claimed by the **smallest** board offering it. The
two big line items were Loopy's eighteen tilings and one largest board per game.

**Say what still covers the presets between.** The slow tier walks them all
(`npm run test:slow -- src/engine/hint-resume.test.ts`), and
`hint-quality.test.ts`'s `lintCases` reads every preset of every game per commit
at one seed — but for *narration*, not convergence, so it is a different
question and not a substitute.

**Pay for it in seeds, not in presets.** Every guard widened to the slice was
sampling several seeds of *one* configuration, and the slice is a hundred and
forty configurations: for a property that is a code path — a renderer branch
that fills instead of ringing, a diff key missing the hint bits, a rung that
emits a stale step — the second seed of a board buys a repeat of a
configuration the first already walked. Measured per guard, 2026-09-20 (load
2.9–5.7, the box ~18.4 GB into swap, so upper bounds and the ratios are what
survive):

| guard | before | after | what it traded |
| --- | --- | --- | --- |
| `hint-text-convention.test.ts` | 0.26 s | 0.35 s | nothing — it returns on the first speaking board |
| `hint-overlay` | 0.74 s | 9.7 s | 3 seeds → 1 |
| `hint-mark` | 1.1 s | 20.9 s | 6 seeds → 2 |
| `hint-ordinal` | 6.6 s | 25.9 s | nothing; it walks the slice **and** the first preset's tiers |
| `mark-all` | 0.42 s | 26.2 s | nothing; 19.8 s of it is one `interpretMove` probe over 227 boards |
| `hint-quality` | 99.8 s | 121.7 s | 3 seeds → 1 on the form block; `lintCases` already read every preset |
| `hint-resume` | 67 s | 93 s | 5 seeds → 1 on its two single-plan blocks |

**And expect a lexical rule to meet vocabulary it has never heard.** A rule that
recognizes narration by its words was tuned against the sentences a one-board
walk happened to hear, so widening it fails on phrasings the collection has used
all along: *"can take one line at most"* (Loopy, Bridges, Clusters, Slant,
Unequal) and *"none of its remaining edges can be walls"* (Palisade, Bridges,
Seismic, Spokes) both failed the necessity rule the first time it heard them.
Extend the vocabulary with the reason, or declare the idiom where the wording is
owner-endorsed — never flatten the sentence to fit the regex, which is the
failure mode `hint-quality.test.ts`'s own header forbids.

### The divergence no clone detector can see

**One concept spelled several ways is not duplication, so jscpd is blind to it,
and it is the failure mode a 57-game collection produces most.**
`re-express-the-collection` said so in its own closing note; two convergences
then landed in exactly that blind spot. Nine games had a private
`drawPencilIndicator` and jscpd saw nothing, because each computed its own box.
Six games spelled a drag's anchor six ways and there was no duplication at all
to detect.

**The instrument for it is the capability snapshot**
([`capability-surface.test.ts`](../../src/capability-surface.test.ts)), which
records every game's field names — its `Ui` *and* its draw state — sorted, in
one file. It asserts nothing about which names a game may use; an approved
vocabulary that nothing consumed would be a second copy of the names, with nothing
to keep it true. Its whole job is to
put the collection's vocabulary somewhere a person can **read** it, and to make
a change to that vocabulary a reviewable line in a text diff. Reading all 57
once is how the `dragType`/`dragtype` split, the `aiming` collision and a
`dragCol` that meant *color* next to a `dragColumn` that meant *column* were
all found — and, in the draw-state half the first reading could see,
`tilesize` against `tileSize` across 55 games.

Two limits to know before trusting it:

- **The `Ui` half sees only what `newUi` returned.** A field an interface
  declares `optional` and only a gesture assigns is invisible: Sixteen's
  `newUi` returns `{cursor, curMode}` and its nine drag fields — `dragX?`,
  `dragStartX?`, … — appear nowhere in the snapshot. So a census taken off the
  snapshot alone **under-counts**, which is the same wrong-key error as § "How
  a cross-game guard finds its population" rule 1, one level up. Read the
  interface when the count is the point.
- **The draw-state half sees only what `newDrawState` returned**, at the game's
  preferred tile size and before any `redraw`. A draw state is built at its size
  and nothing sizes it afterwards, so that is the only reading there is — but a
  field only a frame assigns, never declared in the constructor's literal, is
  invisible, exactly like the `Ui` half's gesture fields.

## Metrics and instruments

**`npm run metrics` records duplication (jscpd), runtime import cycles (madge,
calibrated), dead code (the gate's unused-export check) and cognitive complexity (biome) into a dated
snapshot — deliberately not in the gate.** Its value is the diff between
refactoring rounds: run it at the start and end of a refactoring change and
quote the delta. File the snapshot **under your change** (`openspec archive`
then carries it with the work); a snapshot left at the repo root reads as a
current measurement of a tree that no longer exists. Top-level `metrics/` is
for live instruments only.

Three rules, each learned by getting it wrong:

1. **Thresholds are ratchets, never aspirations.** Lower a cap when a change
   earns it; never raise one to accommodate new code; never suppress without a
   specific reason — the suppression list *is* the work queue.
2. **Confirm every finding against the config the project actually runs.** An
   isolated measuring config once manufactured 35 phantom "unused suppression"
   deletions; the real count was 0.
3. **Know where your instruments clamp.** Biome's complexity counter saturates
   at 255 — a stable 255 does not mean "no regression"; it means unmeasured.

### Timing anything under vitest: two things to know first

**Time a cost on an idle machine, and say which machine you timed.** A
contended timing measures the contention. Record free memory and swap beside
the load average: under paging, `sys` time is page-fault time, so a figure
taken then is an upper bound. Ratios taken under comparable conditions survive
where absolute seconds do not. A single test file that takes tens of minutes
has been made unrunnable, not thorough; the fix is a cheaper configuration or
a narrower invocation, never a longer wait.

**An imported constant costs real time under the test transform, and nothing in
the production build.** Vite's module-runner transform rewrites `DR[i]` to
`__vite_ssr_import_0__.DR[i]`, and it defines every export as a **getter**, so a
table read inside a hot loop pays an accessor call per access. Measured
2026-09-12 on Range's real generator, three arms rotated and interleaved, 21
reps, four runs: **imported / local = 1.62–1.73×**, against an A/A control (a
second, separately loaded copy that keeps its tables local) of **0.98–1.01**.
That is why `range/solver.ts` keeps `DR`/`DC` beside the loops that read them.

**It does not survive `vite build`.** Rolldown flattens both modules into one
scope and the read compiles to a direct `var` access, byte-identical to the
local form. So this is a fact about the suite, not about the game: it is a
reason to be careful when *timing* a refactor that hoists a hot table, and not a
reason to refuse the hoist. If the shared form is better, take it — and know
that the suite will report a slowdown the player will never see.

**A control does not need two module instances; it needs a warm-up.** It was
reported, twice and independently, that an A/A control timing one loaded
instance twice flatters itself (the second timing running an already-warm
function), and that an instance polluted by an equivalence fuzz runs ~40%
slower. Measured on the same harness: **one instance timed twice gives
0.98–1.02, and a fuzz-polluted instance gives 0.94–1.05** — both indistinguishable
from 1.00. What separates a tight control from a loose one here is not how many
instances you load but whether **every arm is exercised once before the clock
starts**; this harness warms all three, and the distinction vanishes. Warm every
arm, rotate their order, and report the minimum beside the median — on a loaded
box the minima are the least contended samples, and here the two agreed.

**To compare two configurations of a sweep, time the *items* once inside one
run — not the sweep twice.** Two whole-file runs are taken minutes apart under
whatever load the box has then, and this one swings several-fold. A single run
that records the wall time of each (game, preset, seed) case pays for the widest
configuration once and then answers every narrower one by summing the cases it
would have kept, so every figure and every ratio comes from the same conditions.
It also attributes the cost, which is the part that changes decisions:
`slice-presets-by-the-axes-a-game-varies` widened a walk from 88 boards to 141,
and the one run showed the *modes* that motivated it costing 3–95 ms each while
two line items carried almost all of the increase. Summing wall clock across
separate runs is an instrument that has read 5× off.

Two calibration notes that recur: a raw madge cycle count is **not** a runtime
cycle count here (`verbatimModuleSyntax` erases `import type`, which is the
standard cycle *fix*, so madge reports the fix as the problem —
`scripts/metrics-cycles.mjs` calibrates, and treats an unclassifiable edge as a
failure, not as clean); and `npm run probe` / `npm run mutation` are
diagnostics, never gates and never ratcheted — the full treatment is
[`docs/test-strength.md`](../test-strength.md).
