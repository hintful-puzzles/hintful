# Testing a game

How a game change is verified: which tier a test belongs in, what a new game
ships, how a hint's positions and a frame are pinned, what the frozen
differentials still hold, the rules that keep the suite deterministic, what
runs at a commit and at a push, and what a game and a new guard owe the
cross-game guards. Writing tests is here; assessing them (the mutation probe,
`npm run probe`) is [`test-strength.md`](./test-strength.md). The specs are
[`testing`](../openspec/specs/testing/spec.md) (the tiers, the render
harness, determinism under load, the differential helper, a hint test's pins,
the boards a cross-game sweep walks) and
[`build-pipeline`](../openspec/specs/build-pipeline/spec.md) (what the gate
runs, and what a commit may leave to the push and to CI).

## What every game does

1. Start from the three test files `scripts/new-game.sh` stamps beside the
   game, which pass as stamped, and keep their shape
   ([`src/skeleton/grid/`](../src/skeleton/grid/)). See "What a new game
   ships".
2. In `<game>.test.ts` (`skeleton.test.ts`), on a board written into the
   file: the params and desc codecs round-trip and refuse, each input gives
   its move, `executeMove` leaves its argument alone, the solve move played
   through `executeMove` reaches a solved board, the mistake check, a save
   that loads, and one frame through `renderScenario` with a targeted op
   assertion beside its snapshot. See "The test tiers" and "Render
   scenarios".
3. In `<game>-generation.test.ts` (`skeleton-generation.test.ts`):
   `describeDealtTiers` over every preset and the smallest board, and
   `describeLadderCensus` over dealt boards with `unreached` empty. See "What
   a new game ships".
4. In `<game>-hint.test.ts` (`skeleton-hint.test.ts`): one
   `describeHintPins` call with a pin for every rung, written by
   `npm run hint-scan -- <the test file>`; plans followed to the answer; and
   a frame from a pin through `renderPinnedHint`. See "Pinning a hint's
   positions".
5. Deal every board from a fixed seed or write its desc down. Give no test a
   timeout or an elapsed-time assertion. See "Seed-deterministic, never
   clock-gated".
6. Break the line each new test is for, see it fail, and put it back. See
   "Break the code under a new test".
7. Run `npm run game -- <id>` after each concern you change: the game's own
   tests and every cross-game guard's cases for it. See "A game's verdict in
   one command".
8. Run the app, commit, and push once when the session's work is done. See
   "What runs when".

## Sections

| Section | Read it when |
| --- | --- |
| The test tiers | you are deciding where a test goes, or which environment and setup file it needs |
| – Stand in for a module with a spy | a test must replace or observe another module's export |
| – Focus after a pointer press | a component test asserts where keyboard focus lands after a press |
| Pinning a hint's positions | your game gains a hint rung, or a hint test needs the board a sentence fires on |
| – A rung the scan finds no position for | `npm run hint-scan` exits 1, or you are about to list a rung in `unreached` |
| – A kind a rung id does not say | a test needs a case of a rung, a step's shape, a later leg, or a position off the hint's own line |
| A game's verdict in one command | you are writing or changing a game and want everything the collection asks of it, in a minute |
| Render scenarios | your game draws a highlight, an overlay, a cursor or an animation frame |
| – A frame that needs the browser | a check has to be made in the running app and the frame is deep in a game |
| – A snapshot cannot see a hole | a change moves the canvas geometry: a margin, an origin, `computeSize` |
| Observing a midend | a test asks what the midend told the app: status bar, timer, repaint requests |
| Render-op vocabulary | an op assertion never matches, or you are matching a ring, a circle or a color |
| What a new game ships | you are writing a new game's tests |
| The frozen differentials | a game has a `<game>-differential.test.ts`, or you wonder whether to write or delete one |
| Byte-match: fidelity where there is a right answer | you refactor or optimize a generator, a codec or an RNG-drawing library a fixture pins |
| Order-independent verdicts | a fixture's generator was never reproducible byte for byte |
| Quirks are load-bearing — capped, not cleaned | you are tempted to tidy an upstream quirk in a fixture-pinned generator |
| When a fixture goes red | a differential fails after your change |
| Seed-deterministic, never clock-gated | a test needs a particular board, is slow, flaky under load or hangs, or you want to give it a timeout |
| – A test that fails only in a full run | a test passes alone and fails in the suite |
| Right-sizing the gate | a test is expensive and you are deciding whether to shrink, defer or retire it |
| – What runs when | you want to know what a commit, a push and CI each test |
| – Running the slow tier | a refactor moves a solver, a generator or a hint planner |
| – Narrowing a game's own sweep | a game's own property test is expensive |
| Break the code under a new test | you have just written a test, or made one cheaper |
| A shared module needs its own tests | you extract logic from a game into `src/engine/` |
| What a game owes the cross-game guards | you add a game, a hint, a difficulty contract, a `Ui` field or a mistake overlay |
| – How a cross-game guard finds its population | you are writing a cross-game guard, not a game |
| – Slicing a preset sweep for the gate | you are writing a cross-game guard, not a game, and it walks boards |
| – Deal through `dealt` | you are writing a cross-game guard, not a game, and it deals boards |
| – One board of each kind in the hooks | you are writing a cross-game guard, not a game, and the hooks should walk less than CI |
| – A cross-game guard the hooks can narrow | you are writing a cross-game guard, not a game: its case titles and whole-sweep assertions |
| – A guard that only reads source | you are writing a guard, not a game, and it scans source text |
| – One concept under several names | you suspect games name the same `Ui` or draw-state field differently |
| Metrics and instruments | you start or end a refactoring change, or read a jscpd, madge or biome figure |
| – Timing anything under vitest | you are about to time a test, a generator or a refactor |

## The test tiers

Reach for the lowest tier that fits; Playwright is visual and integration
smoke only. The tiers are the
[`testing`](../openspec/specs/testing/spec.md) spec's:

- **Tier 1**, pure logic (the `Game` implementation, solver, generator,
  codecs): the default `node` environment, no setup.
- **Tier 2**, render ops: drive `redraw` against the shared recording
  `GameDrawing` and assert draw calls. Still `node`.
- **Tier 2.5**, render scenarios and snapshots through
  [`src/engine/testing/`](../src/engine/testing/): a real `Midend` driven to
  a frame. New render code should ship one (§ "Render scenarios").
- **Tier 3**, components and persistence: opt the file into `happy-dom` for
  Lit components. A fake IndexedDB is in place for every file
  (`src/test-setup/indexeddb.ts`); import that module only for `resetDb`.
  Mounting Web Awesome controls needs `src/test-setup/element-internals.ts`,
  and opening a `wa-dialog` that holds a config form needs
  `src/test-setup/resize-and-animations.ts` too. Each module's header says
  what fails without it.

### Stand in for a module with a spy

Replace another module's export with `vi.spyOn` in a `beforeEach` and restore
it in `afterEach`; never `vi.mock`, `vi.doMock` or `vi.hoisted`. The suite
runs with `isolate: false`, so a worker's module graph outlives each file and
a mock misses any importer an earlier file already loaded. Spy on the real
export (`vi.spyOn(toast, "showToast")` after `import * as toast from …`), or
on a shared object's method. `src/no-module-mocks.test.ts` refuses the three
calls; `src/screens/puzzle-screen.test.ts` is the exemplar.

### Focus after a pointer press

Do not assert where focus lands after a press in `happy-dom`: it focuses
nothing on `mousedown`, so "this press does not take focus from the board"
passes whether or not the code is right. Assert the cause the code controls
(the `mousedown` default was prevented), say in the test that it is a proxy,
and check the consequence in Chrome: `document.activeElement` after the
press, and a physical key reaching the game straight after. Exemplar:
`src/puzzle/components/keys.test.ts`.

## Pinning a hint's positions

Pin one position for every rung the game declares, with one
`describeHintPins` call in `<game>-hint.test.ts`, and let
`npm run hint-scan -- <the test file>` write the pins. Never write a seed
scan for a hint position.

`describeHintPins`
([`testing/hint-positions.ts`](../src/engine/testing/hint-positions.ts))
keys each pin on a rung's id (`Game.hintRungs`, [`hints.md`](./hints.md)
§ "Name the rung a step speaks"). It declares two tests: every pin still
fires its kind, and a snapshot of the sentence said at each pin, which is
where a rung's wording is held. It returns the loader the game's own tests
read through: `pinned("trap")` gives the board, the plan, the step of that
rung and its index, and the `id` and `moves` a `renderScenario` takes.

- **Adding a rung is: name it, run the command, read the count.** The types
  require a pin for every rung, so a new one does not compile until the
  command has run. It walks hint-guided play over fixed seeds and writes each
  pin under how many of the positions walked it held on. That count is the
  power argument the pin owes ([`method.md`](./method.md)): a rung that held
  on a handful of several hundred is the one to watch.
- **A pin that still fires is left alone**, since tests and snapshots are
  written against its board; `--all` replaces every pin the scan found. A
  pin the scan found no position for is left alone and named: it is one kept
  by hand.
- **A rung's pin is a position whose plan speaks the rung.** The scan prefers
  one where the rung's step opens the plan, then the fewest moves in;
  `index` says where the step is. Some steps are only ever a later leg.
- **Draw a pin with `renderPinnedHint(game, pinned(kind))`**
  ([`render-scenario.ts`](../src/engine/testing/render-scenario.ts)), not
  with a `renderScenario` fed the pin's `id` and `moves`, which shows the
  step the plan opens with. It plays the legs before the pin's step, throws
  when the step on show is not the pin's, and returns the pin's `step` typed
  as the game's.
- **A game whose mid-game board is itself a desc passes `descOf`**, and its
  pins are bare `params:desc` strings. Otherwise a pin is a board and the
  moves played on it.
- **Prefer `pinned(kind)` inside a test to one in a `describe` body**, which
  runs at collection, where a pin that does not load fails the whole file.
- **A refusal is not pinned**, having no step to return. A test that wants a
  lost board keeps the desc by hand and says why beside it
  (`pegs-hint.test.ts`'s `LOST`).
- **A pin does not keep `aux`.** The scan asks the hint with none, so a kind
  that needs the generator's answer to fire cannot be pinned.

Exemplars: `pegs-hint.test.ts` (rungs, cases of a rung as kinds, a stray line
of play, a pin kept by hand), `galaxies-hint.test.ts` (a ladder's rungs,
pinned mid-game) with `galaxies-hint-render.test.ts` (a frame from a pin).

### A rung the scan finds no position for

When the command names a rung with no pin and no position and exits 1, widen
the scan (`params`, `seeds`, `stray`), or build the board by hand and pin
that. List the rung in `unreached` with its reason only when no board is
known to fire it; that is a shortfall on show, and empty is the goal, as it
is for `describeLadderCensus`. The scan walks the excused rungs too and says
when one fires.

The scan's zero cannot say why a rung did not fire: it follows the hint's own
play, cheapest rung first, on boards the generator deals at the sizes it was
given. "Rare" and "a cheaper rung gets there first" are seldom the true
reason. Before writing an entry:

- **Ask the hint from positions its own play does not visit.** Play random
  shares of the answer and ask from there, give the board the marks only a
  player makes, deal the sizes the scan was not given, and for a generator
  that places pieces only where they are safe, build boards it does not deal.
- **Build the rung's shape and see what decides it.** Where nothing fires
  across thousands of positions, construct the position the rung reads and
  record which rung speaks in its place. A harder rung speaking there is a
  defect.
- **A rung proved dead leaves the list**, with its sentence, and the proof is
  the comment where its reason was. Prove it from the code, then measure it
  off the hint's line too.
- **A rung the game's plan cannot speak is removed from the list, not
  excused by the test.** Where a shared list or type put it there, fix it a
  layer down ([`hints.md`](./hints.md) § "Name the rung a step speaks").
- **What may stay** is a rung on a board no pin can hold, saying so and
  naming the test that builds the board.

A pin found this way is kept by hand, under a comment saying where it came
from and out of how many.

### A kind a rung id does not say

Pin what a rung id does not say as a predicate under `kinds`, over the
opening step, its board and its plan: a step's shape, which of a rung's cases
it is (`step.rung === "trap" && ownRival(step)`), the board's, or the plan's.

- **The plan is the third argument**; a predicate that calls the game's
  `hint` to see it pays for the plan twice.
- **`{ leg: predicate }` is held by any step of the plan**, as a rung id is,
  for a case of a rung that is only a later leg
  (`pearl-render-scenario.test.ts`). The board a `leg` is given is still the
  one the plan was asked from, so it reads only what play does not change.
- **A predicate reads the step's fields, never its sentence.** A regex over
  `step.explanation` is a name-keyed scan of our own output
  ([`method.md`](./method.md) § "Our own code keys on a reference, a type or
  an id"), and `HintKind` does not take one.
- **A kind may read the board and ignore the step**, for the board on which a
  solver rung fires where no step says so:
  `(_step, state) => firstFiring(state)?.kind === "…"`. Whether a rung fires
  at all on a corpus is `describeLadderCensus`'s question.

What a scan can be told:

- **`opening`**: moves played on a fresh board before the first hint, for a
  game whose deductions want a mark-all or whose board is dealt by the first
  click (`keen-hint.test.ts`, `mines-hint.test.ts`). Give the callback its
  return type (`(): SoloMove[] => …`): a bare literal widens to
  `{ type: string }` and every kind then fails to typecheck.
- **`ui`**: the `Ui` the hint is asked under, for a kind a candidate reading
  decides (`group-hint.test.ts`).
- **`stray`**: a second line of play on every board, steered by the game, for
  a rung spoken only off the lines that finish (`pegs-hint.test.ts`).

A test file with positions of its own (a render test's frames, a second scan
under another `ui`) takes `describeHintKindPins`. Its kinds are rung ids or
predicates, the same command writes its pins, and a file may hold several
blocks at any indent.

## A game's verdict in one command

Run `npm run game -- <id>` while you write a game, after each concern you
change. It is about a minute, and it is what a commit staging the game would
run: the typecheck, biome over the game's directory, the gate's node checks
that read a game's source or its spec in seconds (absence spelling, unused
exports, the spec's subjects, openspec's strict form), the game's own tests,
and every cross-game guard that reaches the game, with the other games' cases
skipped ([`scripts/game.ts`](../scripts/game.ts)). The node checks read the
whole tree, so a refusal there may be another file's, and unused exports
reads only files git tracks: `git add -N` a new game's files first.

Do not take a green `vitest run src/games/<game>` as the game's coverage. Its
input paths, save round-trip, params codec and its source text (color
literals, hint wording, note vocabulary) are checked by guards outside
`src/games/` (§ "What a game owes the cross-game guards").

- **It names every refusal at once**, each with the guide sections the
  refusing guard cites. A guard that cites none says what it asks in its
  header.
- **A game it has never seen is refused by two records kept by hand**: its
  row in `help/puzzles.md`, and the snapshots of `capability-surface.test.ts`
  and `params-stability.test.ts`, which you write again with
  `npx vitest run <file> -u` after reading the diff.
- **Green here is a commit's verdict and not the gate's.** It ends by saying
  what it did not run: the other games' cases, the floors over the whole
  collection, the later boards of each kind that CI walks, the gate's checks
  that read no game, and the app.
- **It does not narrow by `-t <game>`**, and neither should you: a name
  filter alone runs a floor over the collection against one game. The scope
  travels as the commit hook's does (§ "A cross-game guard the hooks can
  narrow").

## Render scenarios

Test any highlight, overlay or animation frame with `renderScenario`
([`render-scenario.ts`](../src/engine/testing/render-scenario.ts)). It takes
`{ game, id, moves?, presses?, at?, settle?, showHint?, showMistakes? }`,
drives a real `Midend` to the frame by replaying `Move`s (no pointer events,
no coordinates), optionally shows the hint's opening step or the mistake
overlay, and captures `redraw` through
[`recording-drawing.ts`](../src/engine/testing/recording-drawing.ts). A
pinned hint step, at any leg, is `renderPinnedHint` (§ "Pinning a hint's
positions").

- **Assert what matters with targeted op checks.** They are the guarantee.
- **Add `toMatchSnapshot` on the record** to catch drift as a reviewable text
  diff. Re-baseline an intended change with `vitest -u` and commit the
  regenerated `__snapshots__/*.snap`. Pair every snapshot with a targeted
  assertion, so a careless `-u` cannot erase the guarantee.
- **`toSvg(ops, size)`**
  ([`svg-drawing.ts`](../src/engine/testing/svg-drawing.ts)) renders the
  record as SVG for a frame that needs eyeballing. Keep it out of committed
  tests.
- **`moves` reaches a board state; `presses` reaches a `Ui` state.** Prefer
  `moves`. A keyboard cursor lives on the `Ui`, so no `Move` can place it:
  send buttons through `presses` (at `at`, default the origin). Use `presses`
  for a pointer button only when the coordinates are under test. Exemplar:
  `tracks-render-scenario.test.ts`'s cursor frame.
- **On an animated game `moves` lands on animation frame zero**, with the
  previous state still on screen. Pass `settle: true` to run the animation
  and flash clock out first. Asserting both frames from the same `moves`
  pins an animation's endpoints.

Exemplar:
[`palisade-render-scenario.test.ts`](../src/games/palisade/palisade-render-scenario.test.ts),
a mid-plan hint frame.

### A frame that needs the browser

When a check needs the running app, choose the board so the frame is one
press deep, and do not walk in from a default board. Scan seeds in a
throwaway vitest file for a board whose first press is the frame under test,
print its game ID, and open `/<game>.html?id=<id>` (`routing.ts` reads `type`
and `id` off the query string).

### A snapshot cannot see a hole

When a change moves a canvas's geometry (a new margin, a shifted origin, a
grown `computeSize`), look at the frame in the app. A snapshot records the
ops a frame drew, so a region left unpainted has no op to miss and the diff
is clean.

Where a game paints a ground layer of its own (a whole-board repaint, or a
ground in a color other than 0), assert the flood covers the canvas and not
the board: a `rect` op at `(0,0)` the size of `computeSize`.

The midend lays a color-0 ground over `computeSize` on a fresh draw state's
first frame ([`rendering.md`](./rendering.md) § "The first frame and a fresh draw state"),
and `src/engine/first-frame-coverage.test.ts` fails on a bare pixel in any
game's first frame at its default params. Neither sees a margin only a later
frame opens, nor whether color 0 is the color the margin should be.

## Observing a midend

Ask what the midend told the app (the status bar, the game state, the id, the
timer readout, whether it wants the clock, how often it asked for a repaint)
through `driveMidend(game)`, or `observeMidend(midend)` for one you hold
([`drive-midend.ts`](../src/engine/testing/drive-midend.ts)).

`last(type)` returns the last notification of that type, typed from its
argument, or `null` when none was sent; never restate a notification's shape
in a cast. Clear `notes` to look only at what follows. A test that only needs
the midend to run passes no callbacks: they are optional. Exemplar:
`src/engine/midend-ui-state.test.ts`.

## Render-op vocabulary

Match an op by the name the shared `RecordingDrawing` records it under, and
use that recorder, not a local double.

- A filled `drawRect` is `op === "rect"`. `drawRectOutline` (a hint ring, an
  error outline, a cursor frame) records as `op === "line"` segments.
- A `drawCircle` records `fill` and `outline`, not `color`.
- `paintsWith(op, color)` answers "is anything painted in this color"
  whichever primitive carries it, and `opsOfKind(ops, kind)` narrows a list
  to one op.
- An op carries `color`, the palette index the game passed, and `rgb`, the
  resolved label. Assert against the game's own constant
  (`o.color === COL_HINT`); `rgb` is there so a snapshot diff stays readable
  when an index moves.
- `DrawOp` is a discriminated union, so chained `.filter` calls do not
  narrow. Put the whole predicate in one `filter`, or use a type guard.

## What a new game ships

Ship the skeleton's three test files, filled in; write no differential. A new
game has no oracle, so its floor is a generation-invariant property test:
every generated board is uniquely solvable at exactly its stated difficulty,
across a fixed-seed sweep.

- `<game>-generation.test.ts` is the floor: `describeDealtTiers`
  ([`absent-tiers.ts`](../src/engine/testing/absent-tiers.ts)) over the
  presets and the smallest board, and `describeLadderCensus`
  ([`ladder-census.ts`](../src/engine/testing/ladder-census.ts)) over dealt
  boards.
- `<game>-hint.test.ts` pins every rung (§ "Pinning a hint's positions").
- `<game>.test.ts` is the game's own behavior, at tier 1: input to move,
  `executeMove` purity, serialize and deserialize round-trips, completion.
- A tier-2.5 scenario for anything the game renders beyond plain tiles.
- A property test wherever a closed-form invariant exists.

**Play a move through `executeMove` to a completed board in a tier-1 test.**
A generation check runs the solver's verdict-only completion; the interactive
completion path (error marking, loop and path marking, flash labeling) is
other code, and no generation check or differential runs it. Play the solve
move, or the moves, to a solved board. Exemplars:
[`skeleton.test.ts`](../src/skeleton/grid/skeleton.test.ts),
[`tracks.test.ts`](../src/games/tracks/tracks.test.ts).

## The frozen differentials

Treat a `<game>-differential.test.ts` and its `__fixtures__/*.json` as the
net under refactoring, and never regenerate, re-record or hand-edit a
fixture: the C build that recorded them is gone. A change that alters a
solver's verdict alters which boards exist, and nothing else in the suite
notices a solver that got quietly stronger.

- **A deliberate divergence retires or re-founds its fixture**
  ([`solver-and-generator.md`](./solver-and-generator.md) has the policy and
  the assurance that must replace it).
- **None is kept for parity's sake.** A fixture may be deleted with its test
  when a change deals other boards and another assurance (the tier contract)
  grades what it deals.
- **Cost is not a reason to retire one.** Together they were about a tenth of
  suite time (measured 2026-09-09).
- **A differential test file carries no regeneration recipe**, because none
  can be run. The full statement is the header of
  [`differential.ts`](../src/engine/testing/differential.ts), per the
  `testing` spec.
- **The gated, committed, frozen-fixture test is the only form a differential
  has.** `npm run diff` runs the advisory checks under `scripts/checks/`
  (`diff.vitest.config.mts` lists them), which report and never gate; no
  differential is among them. Delete on sight a check that still sits in the
  tree and can no longer run its real comparison.
- **A fixture's `"genMs"` field is evidence, not an assertion**: the C's
  wall-clock per board at capture.

Two shapes:

- **Byte-for-byte desc match**: a faithful generator over the bit-identical
  RNG reproduces the recorded desc for the same seed. Call
  `describeDescDifferential` with the fixtures, a params mapper, the game's
  `newDesc`, and an optional `extra` follow-on. Exemplar:
  [`unruly-differential.test.ts`](../src/games/unruly/unruly-differential.test.ts).
- **Solver agreement**: decode a recorded board, run the solver, assert the
  recorded difficulty verdict. Game-specific, so it stays inline. Exemplar:
  [`galaxies-differential.test.ts`](../src/games/galaxies/galaxies-differential.test.ts).

A game without one is a recorded decision. Permutation and short-RNG games
get their RNG faithfulness from the RNG's own corpus
([`random.test.ts`](../src/engine/random/random.test.ts)).

## Byte-match: fidelity where there is a right answer

Before refactoring or optimizing a fixture-pinned generator, find what the
fixture pins and keep it. Matching the C is not a reason to hold back an
improvement to a game ([`solver-and-generator.md`](./solver-and-generator.md)
has the divergence policy); while a fixture stands, these hold:

- **A byte-match proves a substitution changed no behavior**, so it is the
  safest ground for an optimization. When one looks risky, check whether a
  fixture already pins its observable output.
- **RNG draws are observable side effects.** A loop that rejects a candidate
  has already spent its draws, so "pick only legal candidates in the first
  place" diverges the stream. The tell is a loop whose counter increments
  conditionally, or a draw skipped "because n === 1". This holds through the
  RNG-drawing leaf libraries too (`latin.ts`'s `matching`, `loopgen.ts`,
  `laydomino.ts`).
- **A recorded artifact with no right answer is a yardstick, not an answer
  key.** Where an approximate optimizer has many equally good outputs, assert
  the result is legal, complete and no worse than the recorded one, not equal
  to it. Exemplar:
  [`inertia-differential.test.ts`](../src/games/inertia/inertia-differential.test.ts).
- **Read what the reader accepts before deciding what a writer owes it.** An
  encoder that never flushes its trailing run is a format, and "completing"
  it diverges every desc. Where a writer can emit what its own reader
  mis-parses, the undefined range is free to fix: validate the fix by
  round-tripping through a decoder written strictly to the reading rules,
  never encoder against its own decoder. Exemplar: `encodeRegionWalls` in
  [`engine/wall-runs.ts`](../src/engine/wall-runs.ts).
- **A sort that feeds only rendering does not threaten a fixture.** Trace
  whether a `.sort()` or a draw reaches the desc before treating it as
  byte-match surface.

## Order-independent verdicts

Where a generator's output was never reproducible byte for byte (upstream
sorted with `qsort`, whose tie order is implementation-defined), assert only
verdicts that are provably independent of that order, and keep the
order-independence argument in the test. The fixture records such verdicts
(uniquely solvable, solved by the iterative solver, the ambiguity count after
the fixpoint, the brute-force outcome) and no order-dependent quantity such
as passes to fixpoint; the test decodes the same descs and asserts the solver
reaches the same verdicts, which validates solver and codec where the
generator cannot be pinned. Exemplar:
[`undead-differential.test.ts`](../src/games/undead/undead-differential.test.ts).

## Quirks are load-bearing — capped, not cleaned

Do not tidy an upstream quirk in a fixture-pinned generator: it is part of
which boards exist, and a hygiene fix diverges the fixture. Where the quirk's
safety rests on an unproven invariant, port it faithfully and wrap the loop
in a generous cap that throws when exceeded, so an accidental divergence
fails loudly and does not hang. The shared form is
[`retry-limit.ts`](../src/engine/retry-limit.ts), and every
generate-until-success loop takes it, quirk or not.

## When a fixture goes red

Treat the fixture as the instrument and your change as the suspect: a red
differential after a refactor means the set of boards that exist changed.
Never hand-edit a fixture to pass. If the divergence is deliberate, the
fixture is retired or re-founded
([`solver-and-generator.md`](./solver-and-generator.md)).

Find the first fixture that mismatches. If the game records intermediate
verdicts, binary-search for the first board whose solver verdict moved.
Toggle techniques off one at a time to find which got stronger or weaker,
then diff that technique against its earlier self. Two things to check
first:

- **A sentinel imported from the wrong module reads as `undefined`** and
  weakens a `diff >= X` gate with no type error. Check a difficulty
  sentinel's import source before the solver.
- **A translated C loop whose increment clause had a side effect**
  (`for (…; …; ++j, board[i] = 1)`) ran that effect after the final iteration
  too. The surviving sites are commented; the after-last-iteration effect is
  part of the behavior.

## Seed-deterministic, never clock-gated

Make a heavy test's work identical every run, so that only the clock moves.
The requirement is `testing`, "The test suite is deterministic under parallel
load".

- **Drive generation from a fixed seed** (`randomNew("…")`), so the work and
  the verdict do not depend on load.
- **A test that needs a specific board finds it once and writes it down**; it
  does not scan further each run. Loop fixed-seed ids, keep the first whose
  state matches, and put the board it found in the test. The position a hint
  sentence fires on is the exception: pin it through `describeHintPins`
  (§ "Pinning a hint's positions") and write no seed scan for it.
- **Never give a test its own timeout.** The one ceiling is `testTimeout` in
  [`vitest.config.ts`](../vitest.config.ts), a runaway backstop and not a
  gate. A per-test ceiling is a guess about contention.
- **Never assert `elapsed < N ms`.** Assert a load-independent proxy: a
  bounded expansion count, an iteration count, or the result's shape.
- **Bound non-termination in the code, not with a timeout.** These tests are
  synchronous, so a runaway loop blocks the event loop and no timer fires.
  Use [`step-budget.ts`](../src/engine/step-budget.ts) for solver and hint
  fixpoints and [`retry-limit.ts`](../src/engine/retry-limit.ts) for
  retries.
- **Do not judge a generator's cost from a vitest run.** The module runner
  and suite contention have shown about a 7× gap against a plain `node`
  process on the same seeds. Measure outside the runner before designing a
  fix (§ "Timing anything under vitest").

A heavy generation or exhaustive solve takes 1 to 3 s alone and 5 to 10 times
that in a saturated full run. "Contention on work that terminates" is a
complete diagnosis, and its fix is removing the clock gate. Look for shared
state, order dependence or non-termination only when evidence points there,
and re-run the file alone first.

### A test that fails only in a full run

Localize a suspected cross-file leak by forcing the suspected files into one
worker and running them in both orders:
`VITEST_MAX_WORKERS=1 vitest run <a> <b>`, with `--sequence.shuffle.files`
under recorded seeds. One worker still runs its files in the order the
sequencer picks, so a pair run once can pass by scheduling the victim first.

## Right-sizing the gate

Hold every test to what it would catch in a refactor that no cheaper test
would; one that cannot answer is a candidate for retirement whatever it cost
to write.

- **Retire by measurement, never by category.** "It was a porting test" is
  not a reason. Answer per fixture.
- **Say what still covers the configuration**, at the site, when you defer or
  delete the only case covering a mode, a grid type or a difficulty.
- **A guard that catches what the author just wrote stays on the per-commit
  path, on one board of every kind it walks.** More boards of the same kind,
  and a check on decay, go to CI (§ "One board of each kind in the hooks");
  the conditions are in the `build-pipeline` spec.

Three treatments for an expensive test, in order of how little they lose:

1. **Run a deterministic search once.** A loop that scans seeds until a board
   shows a technique finds the same board every time, so write the board
   down. For a hint's rung that is `describeHintPins`, as in
   [`boats-hint.test.ts`](../src/games/boats/boats-hint.test.ts).
2. **Turn a seed count down** with `seedBudget(gate, full)`
   ([`slow.ts`](../src/engine/testing/slow.ts)), only for a property whose
   violation would be systematic, and say at the call site how many
   assertions the reduced count still executes.
3. **Defer to `npm run test:slow`** (`slow: true` on
   `describeDescDifferential`, or `describeSlow` and `itSlow`), only where
   the cost is board size and not configuration. Never defer the only fixture
   covering a configuration, and state what still covers it.

### What runs when

Run the sweep that guards what you changed before committing, and push once,
when the session's work is done or the owner asks to see it sooner.
`scripts/gate.sh` is all three runs below, and its comments give the steps
and their reasons.

| Run | When | What it tests |
| --- | --- | --- |
| The commit hook | every commit | The tests that reach what the commit stages, with per-game work for the games it stages and no other, so a commit costs about the same whatever it touches. |
| The push hook | once, at a session's end | What the commits left out: the own tests and the cross-game cases of every game that reaches a path the push carries, on the boards a commit walks. Nothing, when every commit was a game's own or documentation. |
| CI | every push | Everything, on every board. Never canceled by a newer push. |

- **Per-game work** is a game's own test files and the cases a cross-game
  guard titles `<id>: …`, and it is nearly all of the suite's time.
- **A commit to the engine tests no game's boards.** It runs the engine's own
  tests and the whole-collection tests that are not split by game. Run the
  guarding sweep yourself first: `npx vitest run src/engine/hint-resume.test.ts`
  for a hint planner, the file named for the mechanic otherwise. A bare
  `vitest` is the wide run, since only the hooks narrow.
- **A staged test file runs with every game's cases**, being what the author
  just wrote.
- **A push that carries a change to shared code is one whole run**, and it
  will not run over uncommitted changes to tracked files. It judges only
  `HEAD`: a push of another commit runs nothing here.
- **A commit that stages only documentation** (`docs/`, `openspec/`,
  `AGENTS.md`) runs the gate's fast prefix and no test or build. `help/` and
  `README.md` are not documentation here: a test or the build reads them.
- **A change to nothing but comments** in a source file outside the games
  selects only the guards that read the file as text.
- **A path the selector does not model** (a config file, `package.json`, a
  script) has a commit run every test file outside the game directories, and
  the push run the rest.

The selector is `scripts/checks/select-tests.ts`, and its `--verify` holds
both plans to known cases. The spec is `build-pipeline`, "A commit runs the
per-game work of the games it stages" and "The push runs what its commits
left out, and nothing when they left nothing".

### Running the slow tier

Run the slow tier with a path, for the games a refactor could have moved,
when you move a solver, a generator or a hint planner:
`npm run test:slow -- src/games/seismic`,
`npm run test:slow -- src/engine/hint-resume.test.ts`. The bare command
re-runs every gate test as well, with the widened seed budgets on top. The
deferred cases are
`git grep -n -e 'itSlow(' -e describeSlow -e 'slow: true' -- src`.

### Narrowing a game's own sweep

Before choosing a treatment for a game's expensive property test, time the
items inside one run and plant the defect the test is named for. Never settle
it by reading the test. Four shapes to look for:

- **Dealing costs more than the property.** A sweep that deals a board per
  case can spend most of its time in the generator. A test that wants a board
  only to plan on writes the descs down; a desc stays a board of its tier
  whatever the generator later deals.
- **"Systematic" is a claim about one rung, and it is planted, not argued.**
  A seed count is a confidence dial only for a defect that shows on most
  boards. Lift each guard the property rests on and count the boards that
  show it, per tier. Where few do, write down boards on which that guard
  decides something; where a tier shows nothing, it is not earning its cost.
- **A rule that rarely decides anything needs a board where it does.** Lift
  the rule, scan for the positions where the outcome changes, write those
  down, and have the test hold a written-down board to being such a board
  where it can ([`method.md`](./method.md) § "A sweep that finds zero owes a
  power argument").
- **A game's own walk follows the plan.** Follow each plan to its end and ask
  again when it runs out. Asking again after every move is
  `hint-resume.test.ts`'s, unless the recomputation itself is under test: a
  cycle, or a plan length that must fall by one.

## Break the code under a new test

Flip the line a new test is for, watch it go red, and put it back. Do it
again for a test you just made cheaper, since what an optimization breaks is
a test that still passes and catches nothing. A chosen case can be caught by
another guard and pass with the checked code deleted. The systematic form is
the mutation probe ([`test-strength.md`](./test-strength.md)).

## A shared module needs its own tests

When you extract logic from a game into `src/engine/`, write the extracted
module's tests in the same change, stating the rules its doc comment claims
and not pinning values. The game's differential still catches a defect in the
module, but as a differing desc after a full generate-and-compare and not as
a named rule in 100 ms. Exemplar:
[`wires.test.ts`](../src/engine/wires.test.ts).

## What a game owes the cross-game guards

A game joins a cross-game guard by declaring or having the thing the guard
reads; no list is edited. What each asks of the game's author:

- **Hints**: declaring `hint()` enrolls the game in every guard that reads
  `HINT_GAMES` (`git grep -l HINT_GAMES -- src scripts`): plans resume from
  any position, the overlay reaches the render cache, narration form, and the
  rest. Recipe: [`hints.md`](./hints.md).
- **A numbered chain**: a game whose hint numbers a chain adds one pinned
  position to
  [`testing/hint-chain-pins.ts`](../src/engine/testing/hint-chain-pins.ts);
  `hint-quality.test.ts` fails on a numbered chain from a game with no entry.
- **Recorded premises**: a game whose hint calls the candidate walk is in
  [`firing-replay.test.ts`](../src/engine/firing-replay.test.ts), which
  audits that every recorded firing follows from its premise. A `latinSolver`
  game has its replay already; a bespoke recording solver writes a
  `ReplayAdapter`, and one that records without offering a replay is
  reported. See [`hints-candidates.md`](./hints-candidates.md) § "A premise names everything its
  deduction reads".
- **Difficulty tiers**: declaring `Game.difficulty`
  ([`difficulty.ts`](../src/engine/difficulty.ts)) enrolls the game in
  [`difficulty-contract.test.ts`](../src/engine/difficulty-contract.test.ts):
  caps are monotonic, every tier generates or refuses with a reason, the tier
  list matches the difficulty `paramConfig` choices, and tiers survive the
  params codec. A tiered game that does not declare fails. Adapter rules:
  [`solver-and-generator.md`](./solver-and-generator.md).
- **Registration**: adding a game is two edits, `src/games/index.ts` and
  `src/puzzle/catalog-data.ts`, and
  [`catalog-registry.test.ts`](../src/catalog-registry.test.ts) holds them
  equal in both directions.
- **Layering**: no game imports another game, the engine imports no game
  (but for `testing/hint-games.ts`, the enrollment file), and neither imports
  the app shell;
  [`module-layering.test.ts`](../src/module-layering.test.ts) also holds
  runtime import cycles at zero.
- **Mistake overlay**: paint, call `findMistakes()`, redraw the same draw
  state, and assert the highlight on the second paint, and ideally that a
  third frame without the overlay erases it. A cold frame proves nothing,
  since every cell misses the cache on frame one
  ([`rendering.md`](./rendering.md) § "Prove the overlay repaints").
- **A new `Ui` or draw-state field**, or a new optional `Game` method, moves
  [`capability-surface.test.ts`](../src/capability-surface.test.ts)'s
  snapshot. Re-baseline with `vitest run <path> -u` and say so in the change.
- **An exported function inserted directly above another** strands the second
  one's doc comment on the first.
  [`asset-integrity.test.ts`](../src/asset-integrity.test.ts) scans every
  `.ts` file under `src/` for it.

The last two take their population from the whole tree, so an edit inside one
game's directory can move them (§ "A game's verdict in one command").

### How a cross-game guard finds its population

For the author of a new cross-game guard. The normative form is the
`ts-engine` spec, "A shared mechanic is joined by having it".

1. **Derive the population from what the game is**: the object it registers,
   a method's presence, the `Ui` its `newUi` returns, its comment-stripped
   source. Ask through
   [`testing/enrollment.ts`](../src/engine/testing/enrollment.ts)
   (`builtGames`, `enrolledIn`, `membersNotMentioning`). Never a roster of
   opted-in names: a game left off one gets none of the guard, silently.
2. **Put a floor under the population you drew from**
   (`Enrollment.population`), not only under the set you filtered out of it.
   The gate passes `--passWithNoTests`, so a loop of `it()` over an empty
   array is green.
3. **State exceptions as a ledger in the guard, never as the enrollment
   key**: one entry per member with its reason, asserted equal to what the
   derivation found. Exemplars: `input-parity.test.ts`'s `NO_KEYBOARD`,
   `hint-quality.test.ts`'s `NARRATES_MOVES`, `contract-surface.test.ts`'s
   `NO_CONSUMER`. An empty ledger meant to stay empty is a real assertion. An
   excuse that the game has no such section is not an entry: it is the game's
   `notApplicable` reason, read with `sectionState`
   ([`mechanics.md`](./mechanics.md) § "Contract sections, and what makes a
   draft").
4. **Hold a declared flag to the behavior.** Where production needs an answer
   synchronously and the game declares a boolean, assert it equal to a
   derivation (`ignoresSecondaryButton`, in `input-parity.test.ts`). Better
   is no flag: the midend reads `canMarkAll` off the presence of the
   `markAll` hook. A flag that only turns a guard off most needs this.
5. **Scan code, not text.** `membersNotMentioning` strips comments, because a
   mention in prose is not a use. Key on the name and take the superset
   ([`method.md`](./method.md), "A scan that keys on a name"). When the
   population is who uses a symbol, ask by reference:
   `npm run refs -- <file> <Name | Type.member>`, which is blind to source
   read as text.
6. **Ask a question the system is actually asked.** Read the guard's inputs
   off what the game presents (its presets, its registered object, its `Ui`)
   and do not construct them: `validateParams` accepting a record is not
   evidence a board can carry what is in it. The tell is a guard that builds
   its inputs with a `with*` or a setter; check the file you copy from for
   it. The exception is narrow and said at the site: a synthesized record is
   right when the question is what the contract does to a record (a codec
   round-trip that generates no board), or when the behavior needs a
   combination no preset carries, such as a small grid at a hard tier. Say
   which behavior needs it, and keep the slice beside it.
7. **A coverage guard has a second key: who is already covered.** Take the
   superset there too and classify what it catches; an over-reported
   shortfall fails no commit, so nothing else checks it. The tell is a
   covered set that is one `includes("…")`.
8. **A behavioral sweep drives its board through `probeBoard`**
   ([`testing/input-probe.ts`](../src/engine/testing/input-probe.ts)) and
   reads a `Ui` through its `ui()`. Its `reset()` deals the id again and does
   not call `restartGame`, which keeps the `Ui` and lets one probe point's
   highlight answer for the next. Use `restartGame` only where the state
   replacement is under test.

### Slicing a preset sweep for the gate

For the author of a cross-game sweep over boards. Do not build a population
of presets: call `gatePresets(id, game)`
([`testing/hint-games.ts`](../src/engine/testing/hint-games.ts)). It returns
every preset in the slow tier and otherwise the slice, one preset per value
of every axis the game's `paramConfig` varies, and it bounds the searching
hints' board sizes for you. Difficulty is a `"choices"` item like any other,
so the slice replaces a `tiers.map(withTier(base))` loop.

- **`dealtBoards`**
  ([`testing/presets.ts`](../src/engine/testing/presets.ts), which reads no
  registry) is the call for a sweep over games without a hint, or one that
  wants its modes and no large board (`scalarEnds: false`), as
  [`desc-error-games.test.ts`](../src/engine/desc-error-games.test.ts) and
  [`mistake-invariant.test.ts`](../src/engine/mistake-invariant.test.ts) do.
  `axisSlice` and `leafPresets` are for a sweep about the slicing rule
  itself, and deal nothing the menu leaves out.
- **A sweep that calls `firstLeaf(` or `withTier(` is held to a ledger** in
  [`hint-enrollment.test.ts`](../src/engine/hint-enrollment.test.ts), one
  entry per file with the behavior that needs a record the menu does not
  offer.
- **A value the Custom dialog offers and no preset holds is dealt beside the
  slice** (`unofferedValues`), written onto the first preset in menu order
  that `paramsError` accepts it on: the `with*` form of § "How a cross-game
  guard finds its population" rule 6, used for the one thing it is right for.
  A tier written onto the smallest grid may not be a hard board, so a rung
  that needs a large board at a hard tier still wants its pin.
- **Expect a guard to meet a board its setup never allowed for**: a refusal
  from a fresh board, or no cell with two candidates. Fix the guard's
  assumption; do not drop the board.
- **A value no preset accepts has no board**, and `hint-enrollment.test.ts`
  holds such values to the ledger `NO_BOARD`, which is empty. Add a preset
  that carries the value.
- **Say what still covers the presets between.** The slow tier walks them all
  (`npm run test:slow -- src/engine/hint-resume.test.ts`).
  `hint-quality.test.ts`'s `lintCases` reads every preset of every game at
  one seed, for narration and not convergence, so it is no substitute.
- **Pay for the slice in seeds, not in presets.** For a property that is a
  code path, the second seed of one configuration repeats the first; take one
  seed across the slice.
- **Expect a lexical rule to meet wording it has not heard** when its walk
  widens. Extend the vocabulary with the reason, or declare the idiom where
  the wording is owner-endorsed. Never flatten a sentence to fit the regex.

### Deal through `dealt`

For the author of a cross-game sweep. Take its boards from
`dealt(game, params, n)`
([`testing/dealt.ts`](../src/engine/testing/dealt.ts)), and begin a midend
on one with `beginDealt`. Dealing is where a sweep's time goes, and the
dealer's cache is one per worker, so every guard shares a board.

- Take a second board of the same params with `n` only where the property
  needs one. Never seed a deal from the guard's own name.
- A sweep reports on the boards it walked; a sentence or a rung that matters
  is pinned to a board (§ "Pinning a hint's positions").
- A game's own test deals as it likes.

### One board of each kind in the hooks

For the author of a cross-game sweep. Use `perCommit(hook, wide)`
([`slow.ts`](../src/engine/testing/slow.ts)) only for more of the same: the
two local hooks walk one board of each kind and CI walks the rest. The only
board of a mode, a tier or a rule stays in the hooks, and so does anything a
single board shows. Say at the call site what the hooks' amount still walks.

- `gatePresets` uses it already: in the hooks it leaves out a game's largest
  board and keeps a board for every value of every mode, tier and choice.
- The hooks and CI can walk different boards of one game, because the slice
  takes the smallest preset that supplies each value still wanted. A ledger a
  walk is held against has to be true of both.
- Nothing but the hooks sets the toggle. After changing the code a sweep
  guards, run that sweep wide before committing (`npx vitest run <file>`); no
  hook is that run.

### A cross-game guard the hooks can narrow

For the author of a cross-game guard. A commit runs the per-game cases of the
games it stages and skips the rest by title, so:

- **Title a per-game case `<id>: …` and let it read only that game.** A case
  titled some other way runs on every commit to any game. A case titled for
  one game that reads another would be skipped unsoundly; do not write one.
  The soundness condition is in
  [`game-scope.ts`](../src/engine/testing/game-scope.ts).
- **Build the title with a template in a loop, never
  `describe.each(…)("$id: …")`.** Vitest renders a `$` field quoted, so the
  title comes out as `'keen': …` and is not narrowed.
- **An assertion over a whole sweep narrows with it.** Filter a ledger
  compared against what the cases found with `inSweep`. Put a floor no single
  game could meet in `itOverWholeSweep`. Where a touched game could fail a
  floor on its own, compute the floor from the games and not from the cases,
  in a plain `it` (`input-parity.test.ts`'s `offered`). All are in
  [`slow.ts`](../src/engine/testing/slow.ts).
- **Keep a glob over a broad tree in a module of its own**
  (`engine-source.ts`, `test-source.ts`, with `code-lines.ts` for the shared
  comment stripping), and a scan over that tree in a test file of its own. A
  helper's glob is paid for by every file that imports it, and one cheap
  `describe` reading the engine makes every sweep in its file run whole on an
  engine commit.
- **A sweep that walks every game inside one test, or in a `beforeAll`, is
  not narrowed at all**, and a run for one game pays for all of them. Give
  each game a case, and let what reads across the cases compute a game's
  answer on first asking, so it does not depend on which cases ran
  (`input-answers.test.ts`).
- **Check a new guard with `GATE_PRECOMMIT=1 GATE_GAME_SCOPE=<one game>`**;
  what fails there is what the hook would reject. If
  `node scripts/checks/select-tests.ts --verify` goes red on a heavy hint
  guard no longer narrowing, find the import that now reads a broad tree and
  do not widen the check.

### A guard that only reads source

For the author of a guard that scans source text. Keep its imports off the
registry and the game modules, and the gate runs it in the pass ahead of the
rest of the suite, so its failure arrives in seconds. Nobody enrolls a file:
[`scripts/checks/source-scans.ts`](../scripts/checks/source-scans.ts) takes
any test that reads source through a `?raw` `import.meta.glob` and whose
import closure reaches nothing under `src/games/`. One import of
`games/index.ts`, or of a helper that imports it such as
`testing/hint-games.ts`, moves the file to the main pass without a word.
`node scripts/checks/source-scans.ts` prints the current set. The spec is
`build-pipeline`, "The gate runs the source-scan tests as a pass ahead of the
rest of the suite".

### One concept under several names

To find one concept spelled several ways across games (a `dragType` beside a
`dragtype`, a private pencil indicator per game), read
[`capability-surface.test.ts`](../src/capability-surface.test.ts)'s snapshot
through: it lists every game's `Ui` and draw-state field names, sorted, in
one file. A clone detector does not see this, since differing spellings are
not duplication. The snapshot asserts nothing about which names a game may
use; it makes a change of vocabulary a line in a diff.

Read the game's interface when the count is the point, because the snapshot
under-counts: the `Ui` half holds only what `newUi` returned, so an optional
field only a gesture assigns is absent, and the draw-state half holds only
what `newDrawState` returned at the preferred tile size, before any `redraw`.

## Metrics and instruments

Run `npm run metrics` at the start and end of a refactoring change and quote
the difference. It records duplication (jscpd), runtime import cycles (madge,
calibrated), dead code (the gate's unused-export check) and cognitive
complexity (biome) into a dated snapshot, and it is not in the gate. File the
snapshot under your change, so the archive carries it; top-level `metrics/`
is for live instruments only.

1. **Thresholds are ratchets.** Lower a cap when a change earns it, never
   raise one to fit new code, and never suppress without a specific reason:
   the suppression list is the work queue.
2. **Confirm every finding against the config the project runs.** An isolated
   measuring config can report findings the real one does not have.
3. **Know where an instrument clamps.** Biome's complexity counter saturates
   at 255, and a stable 255 is unmeasured, not unchanged.

A raw madge cycle count is not a runtime cycle count here:
`verbatimModuleSyntax` erases `import type`, the standard fix for a cycle, so
madge reports the fix as the problem. `scripts/metrics-cycles.mjs`
calibrates, and treats an edge it cannot classify as a failure.
`npm run probe` and `npm run mutation` are diagnostics, never gates and never
ratcheted ([`test-strength.md`](./test-strength.md)).

### Timing anything under vitest

Time a cost on an idle machine, say which machine, and trust ratios taken
under comparable conditions over absolute seconds.

- **Record free memory and swap beside the load average.** Under paging,
  `sys` time is page-fault time, so a figure taken then is an upper bound.
- **Measure CPU (`/usr/bin/time`'s `user + sys`), not wall.** Contention
  inflates wall several-fold and unevenly, so even a ranking distorts. CPU
  time is the better instrument and still inflates under paging.
- **To compare two configurations of a sweep, time the items once inside one
  run**, not the sweep twice. Record the wall time of each (game, preset,
  seed) case in the widest configuration and sum the cases a narrower one
  would keep. Two whole-file runs are minutes apart under different load.
- **Attribute cost per game, not per directory.** A cross-game guard's time
  belongs to the games its cases name; the `<id>: …` title is the join key.
- **Warm every arm before the clock starts, rotate their order, and report
  the minimum beside the median.** A control needs a warm-up, not a second
  module instance.
- **An imported constant costs time under the test transform and nothing in
  the build.** The module runner makes every export a getter, so a table read
  in a hot loop pays a call per access: 1.6 to 1.7 times on one generator
  (measured 2026-09-12). `vite build` flattens it away, so do not refuse a
  hoist for a slowdown only the suite sees.
- **A single test file that takes tens of minutes is unrunnable, not
  thorough.** The fix is a cheaper configuration or a narrower invocation.
