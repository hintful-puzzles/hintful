# The plan of moves

Written 2026-10-09, before any requirement moved (`design.md`, Decision 1).
The lists it merges are `rewrite-report.md` § "Requirements that look
misfiled" and `prune-report.md` § "Belongs in another capability", both in
`openspec/changes/archive/2026-10-09-turn-the-specs-into-a-reference/`. A
title is as it stood in `openspec/specs/` that day.

## The test

A requirement moves when its destination is where a session reads before the
work the rule binds. "It would sit more naturally" is not that, and an entry
of the lists that argued only so stays where it is, with the reason in
"What each entry became".

## The divisions

- **`repo-layout` loses three subjects and keeps the rest.** It held 149
  requirements. Help pages go to a new `help-pages`, along
  `docs/help-pages.md`. The test tiers, the determinism rules, test strength,
  the local-feedback probe and the hint-position harness go to a new
  `testing`, along `docs/games/testing.md` and `docs/test-strength.md`. The
  bounds on a generator's loops go to `engine-difficulty`. What is left is
  where things live, the guides and the agent brief, and the checks on
  layering, bulk edits, comments, spelling and citations.
- **The workflow rules do not get a capability.** The pruning already cut the
  acceptance and archiving rules to `docs/work-management.md`. The rules about
  an open change's paths and about the agent brief stay in `repo-layout`:
  each is held by a check that cites it there.
- **`ts-migration` keeps what is still about the port**: the save format,
  upstream's C as a reference, and acceptance by exercising a game. Its rules
  for tiers, generators, params encodings and shared helpers each go to the
  capability for that subject. It held 31 requirements and keeps 7.
- **`ts-engine` loses the app's side of dealing and of the reference panel**,
  and the rules for cross-game sweeps, which are `testing`'s.
- **`engine-hints` is not divided.** It is the longest capability left, and
  its subjects (the midend's plan, marks, words, refusals, the hints that
  search) are sections of the one guide `docs/games/hints.md`, which
  Decision 2 does not divide along. Eleven requirements leave it for the
  capabilities that own their subject.
- **Four capabilities are new for a subject that had none**, by the precedent
  of `quick-save`, `canvas-sizing`, `grid` and `latin-solver` (a named feature
  of the app, or an engine module several games share): `dealing`,
  `error-reporting`, `border-grid`, and the two divisions above.

## What the review changed

A fresh reviewer read the plan against the requirements' full text
(`tasks.md`, 1.3). On its findings: the hot-constant rule stays in
`engine-helpers`; the engine's answer to an exhausted retry bound goes to
`engine-difficulty` and not to `dealing`; four more requirements of
`build-pipeline` that bind whoever writes a test or a sweep go to `testing`;
three requirements whose words leaned on a neighbor that did not move with
them are `edit` entries of `rewrites.md`; the merged `border-grid`
requirement keeps the three errors of the live error model; and
`app-shell`'s draft-label requirement loses the half of its title that moved.

## The moves

A moved requirement keeps its title and its words, except where a reference
inside it names a capability that a move has changed.

### To `help-pages` (new)

New, divided out of `repo-layout` along `docs/help-pages.md`. A session writing or changing a help page reads that guide, and the guide has had no capability of its own to name: its rules were 22 requirements spread through `repo-layout`, one in `app-shell` and one in `engine-hints`.

| Requirement | From |
| --- | --- |
| Every help page the app serves lives under `help/` | `repo-layout` |
| No served page documents a platform this app is not | `repo-layout` |
| Every cataloged puzzle has a help page, and every page a cataloged game | `repo-layout` |
| Adopting or relocating a help page changes no words, attribution or URL | `repo-layout` |
| A help source directory does not shadow a served URL directory | `repo-layout` |
| A game's help page introduces the puzzle, not its implementation | `repo-layout` |
| The site-level help documents the features this fork adds | `repo-layout` |
| The help names a control the way the app names it | `repo-layout` |
| The help says why the hint differs, and when it refuses | `repo-layout` |
| A cross-game hint mark is explained once, by its shape | `repo-layout` |
| The help describes a feature's rule, never its rollout | `repo-layout` |
| Help coverage is asserted from the app, and fails closed | `repo-layout` |
| A glyph a help page names resolves to a real icon rule | `repo-layout` |
| Every game's help page has one skeleton, read off the game | `repo-layout` |
| The sections a page owes are derived from the game | `repo-layout` |
| A puzzle's credits sit under the origins heading and nowhere else | `repo-layout` |
| A game's Hints section teaches its hint marks | `repo-layout` |
| A game's parameters section is generated from its paramConfig | `repo-layout` |
| A help page names a field's choice through a placeholder | `repo-layout` |
| A help page does not type a choice's name | `repo-layout` |
| A game page's list of rulesets is generated | `repo-layout` |
| A game page's list of rule modifiers is generated | `repo-layout` |
| A help page lists what is not in the game, with the game's reason | `app-shell` |
| A bound game's help SHALL list its marks from its legend | `engine-hints` |

### To `testing` (new)

New, divided out of `repo-layout` along `docs/games/testing.md` and `docs/test-strength.md`. A session writing a test, a render scenario, a hint test's pins or a cross-game sweep reads those guides, and the rules they name were in four capabilities titled for something else.

| Requirement | From |
| --- | --- |
| Behavior is testable in-process across three tiers | `repo-layout` |
| Each tier runs in the cheapest environment that fits | `repo-layout` |
| New UI or persistence behavior ships an in-process test | `repo-layout` |
| The render harness is one recorder and one scenario driver | `repo-layout` |
| A draw record is deterministic | `repo-layout` |
| A render test pairs a snapshot with targeted assertions | `repo-layout` |
| A shared helper carries the byte-for-byte differential shape | `repo-layout` |
| The frozen fixtures' provenance is stated once, and no recipe is carried | `repo-layout` |
| The test suite is deterministic under parallel load | `repo-layout` |
| Efficiency is asserted by a proxy, never by elapsed time | `repo-layout` |
| There is one test timeout, and it is a backstop | `repo-layout` |
| Non-termination is bounded in code, not by a timeout | `repo-layout` |
| A load-only failure is root-caused | `repo-layout` |
| Test worker processes do not outlive their runner | `repo-layout` |
| The reaper kills only this repo's orphans, and never fails a run | `repo-layout` |
| The test suite's strength is audited, not assumed | `repo-layout` |
| The mutation audit is not a gate, and its score is not ratcheted | `repo-layout` |
| A shared module's tests give feedback where the code lives | `repo-layout` |
| The local-feedback probe plants a defect and runs only the module's own tests | `repo-layout` |
| A module's own tests are derived from what imports it | `repo-layout` |
| The probe walks the engine recursively and fails below a floor of test files | `repo-layout` |
| A guarantee left to a differential is stated and verified | `repo-layout` |
| An assertion's two sides do not derive from the same value | `repo-layout` |
| An assertion distinguishes the value it names from a superstring | `repo-layout` |
| A C-recorded fixture is kept for what cannot be derived, not as a quality bar | `repo-layout` |
| A local-feedback probe case is anchored within a named function | `repo-layout` |
| No test file mocks a module | `repo-layout` |
| The mock check says what it scanned | `repo-layout` |
| A suspected cross-file leak is localized in one worker, in both orders | `repo-layout` |
| A hint test's pinned positions keep the scan that finds them | `repo-layout` |
| A rung no known board fires is excused by name, with its reason | `repo-layout` |
| A further kind is a predicate over the step, never a pattern over its sentence | `repo-layout` |
| A kind named as a leg is held by any step of the plan | `repo-layout` |
| The harness tests that every pin still fires, and snapshots what it says | `repo-layout` |
| A pinned step's frame is drawn through the midend | `repo-layout` |
| The scan walks hint-guided play over fixed seeds and counts each kind | `repo-layout` |
| A scan plays what its test says, for a kind hint-guided play does not meet | `repo-layout` |
| A pin carries its count, and comes from the scan in the tree | `repo-layout` |
| A hint test does not walk seeds to find its position | `repo-layout` |
| One command scans a hint test's positions and writes its pins | `repo-layout` |
| The scan command keeps a pin that still fires | `repo-layout` |
| The scan command fails on a kind nothing fires, and on an empty scan | `repo-layout` |
| A pin that does not load does not stop a scan | `repo-layout` |
| A scan whose pins live elsewhere is printed, not written | `repo-layout` |
| A cross-game sweep SHALL take its boards from the shared slice, not build them | `ts-engine` |
| The shared slice holds the cost discipline of a searching hint | `ts-engine` |
| A cross-game sweep SHALL deal every choice the Custom dialog offers | `ts-engine` |
| Every value is dealt, the generator's choices included | `ts-engine` |
| Whether every value is dealt is asserted apart from the derivation | `ts-engine` |
| A cross-game sweep deals each board once | `ts-engine` |
| A cross-game guard bounds its cost on the axis the game varies | `build-pipeline` |
| A sweep's per-commit amount is chosen through perCommit | `build-pipeline` |
| A sweep's ledger is true of the hook's boards and of the push's | `build-pipeline` |
| The gate rejects a test whose every assertion is conditional | `build-pipeline` |
| Which test shapes the gate guards is decided by measurement | `build-pipeline` |
| A game's render test records through the shared recording drawing | `engine-drawing` |
| The capability snapshot records a draw state's field names and judges none | `engine-drawing` |

### To `dealing` (new)

New. How the app gets a board for New game is the app's `DealAhead` under `src/puzzle/` and the stop control in the chrome, not the midend, and it was thirteen requirements of `ts-engine` with one more in `ts-migration`. What the engine answers when a generator gives up is `engine-difficulty`'s, beside the bound on a generator's loops. A feature of the app with a name has a capability of that name, as `quick-save` and `canvas-sizing` do.

| Requirement | From |
| --- | --- |
| The next board is dealt ahead and kept | `ts-engine` |
| Every type is dealt ahead, and a quick one keeps one board | `ts-engine` |
| A type whose deal was slow keeps three boards | `ts-engine` |
| A deal is slow by its generator's time alone | `ts-engine` |
| A kept board is keyed by its puzzle and its full params | `ts-engine` |
| A kept board is played only by the build that dealt it | `ts-engine` |
| A deal ahead is abandoned when its type is no longer wanted | `ts-engine` |
| A deal a player waits for runs off the board's thread and can be stopped | `ts-engine` |
| A search for a board offers a way to stop it | `ts-engine` |
| Stopping a search leaves the board in play as it was | `ts-engine` |
| A deal that finds no board says so in the engine's sentence | `ts-engine` |
| A wait for a board ends when another board is opened | `ts-engine` |
| Stopping a search with no board in play deals the first preset | `ts-engine` |
| The app shows the sentence wherever a deal was asked for | `ts-migration` |

### To `error-reporting` (new)

New. Crash reporting and the consent it waits for were five requirements of `build-pipeline` and two of `project-identity`, and a session touching the reporting code would open neither. `project-identity` keeps what the privacy notes promise.

| Requirement | From |
| --- | --- |
| A stated reporting rule matches what the build does | `build-pipeline` |
| Turning on error reporting settles its side effects deliberately | `build-pipeline` |
| A public DSN is restricted at the reporting service | `build-pipeline` |
| Error reporting is verified on the deployed origin | `build-pipeline` |
| What a crash report carries matches what the privacy notes promise | `build-pipeline` |
| A crash report leaves the device only with the player's consent | `project-identity` |
| Consent is enforced at the reporting SDK's transport | `project-identity` |

### To `border-grid` (new)

New. The edge-marking mechanic Palisade and Separate share lives in `src/engine/border-grid*.ts` and was specified inside `separate`, with a second copy of one requirement in `palisade`. An engine module two games share has a capability of its own, as `grid` and `latin-solver` do. The two requirements that are merged from the games' copies are in `rewrites.md`.

| Requirement | From |
| --- | --- |
| The games' move formats stay independent | `separate` |
| A game adopting the border-grid input adopts its look | `separate` |
| Border-grid games share the hint's notation layer | `separate` |

### To `engine-difficulty`

The capability `docs/games/solver-and-generator.md` is the guide for: what a tier means and what a generator promises of a board. A session changing a generator or a tier reads it, and half of those rules were in `ts-migration` (the port is finished, and nobody opens it for a generator), with others inside a hint requirement, in `engine-params` and in `repo-layout`.

| Requirement | From |
| --- | --- |
| Narratable-deduction generation policy | `ts-migration` |
| A rejecting generation gate is measured before it is adopted | `ts-migration` |
| An Unreasonable tier is the one exemption from the narratable policy | `ts-migration` |
| A difficulty tier binds the board it generates | `ts-migration` |
| The tier gate's cost is measured by its worst case | `ts-migration` |
| An unbindable tier is refused, not silently downgraded | `ts-migration` |
| A generator never settles for a lower tier | `ts-migration` |
| A refusal that claims absence rests on a count | `ts-migration` |
| A rare tier is dealt by retrying | `ts-migration` |
| A tier too rare to deal says so | `ts-migration` |
| A tier probe runs on state uncontaminated by earlier candidates | `ts-migration` |
| A difficulty-capped solver is monotone in its cap at every tier | `ts-migration` |
| A non-monotone solver is repaired, never declared | `ts-migration` |
| The monotonicity guard samples enough boards to catch its defect | `ts-migration` |
| Only a tier named Unreasonable requires Search | `engine-hints` |
| A propagating trial on a hard tier moves up or renames the tier | `engine-hints` |
| A name is dropped only from a tier that generates nothing | `engine-hints` |
| A tier list has one definition per game | `engine-hints` |
| A moved rung leaves its old tier generable | `engine-hints` |
| No parameter or tier switches a generator's checks off | `engine-params` |
| A generator that runs out of tries is answered, not thrown | `ts-migration` |
| Only an exhausted retry bound is answered | `ts-migration` |
| Every generate-until-success loop is bounded by the shared retry limit | `repo-layout` |
| An exhausted retry limit throws, or hands over to a bounded recovery | `repo-layout` |
| The gate holds every open loop that draws randomness to a stated bound | `repo-layout` |
| The open-loop scan keys on shape and references | `repo-layout` |
| The open-loop scan runs in the source-scan pass and carries its known positives | `repo-layout` |
| A loop that deals a whole board again takes the guard, and the ledger is for the rest | `repo-layout` |

### To `engine-hints`

Rules about a hint that were filed under the port, the gate and the tiers.

| Requirement | From |
| --- | --- |
| The solver and the hint are two projections of one deduction engine | `ts-migration` |
| The hint-resume walk excuses the games that can say a search ran out | `build-pipeline` |
| An excused game's reason and remaining cover are recorded per member | `build-pipeline` |
| Auto-Hint stops when a step throws | `engine-difficulty` |

### To `engine-candidate-hints`

Rules of the shared candidate walk, which has its own capability and its own part of `docs/games/hints.md`.

| Requirement | From |
| --- | --- |
| A set outlines the cells it rests on | `engine-hints` |
| The candidate walk stamps the steps it builds | `engine-hints` |
| A rung list holds only the rungs of the readings its plan walks | `engine-hints` |
| A plan's setup declares the reading it walks | `engine-hints` |

### To `engine-helpers`

Rules for a shared helper: the scope it claims and who adopts it, the decimal-character helpers of `decimal.ts` (which are about reading a description, not about input), and the one-firing driver that sits beside the deduction-fixpoint runner this capability already specifies.

| Requirement | From |
| --- | --- |
| A shared abstraction states its actual scope, not an aspirational one | `ts-migration` |
| A shared declarative helper is adopted by every game it fits | `ts-migration` |
| A per-game label states only what holds on every board | `ts-migration` |
| The engine answers which character is a digit, once | `engine-input` |
| A game reads and writes a digit character through the engine | `engine-input` |
| The meaning of a digit character stays with the game | `engine-input` |
| The recording path steps the ladder one firing at a time through the engine | `engine-candidate-hints` |
| A call of the driver returns one firing, and a contradiction is sticky | `engine-candidate-hints` |
| The driver returns a firing the player cannot see | `engine-candidate-hints` |

### To `engine-params`

The params codec's stability, and a preset's title: both are read by whoever changes a game's params.

| Requirement | From |
| --- | --- |
| Encoded params are byte-stable, and the guard is derived | `ts-migration` |
| Encode and decode are mutual inverses over the corpus | `ts-migration` |
| The recorded params encodings do not move | `ts-migration` |
| A preset title that names a difficulty names its own tier | `engine-difficulty` |

### To `engine-drawing`

A contract of `GameDrawing` and of the render cache, read by whoever writes a renderer; the overlay sidecar carries the mistake overlay as well as the hint's.

| Requirement | From |
| --- | --- |
| A per-cell overlay reaches the render cache through the shared sidecar | `engine-hints` |
| GameDrawing draws the hint's line hatch | `engine-hints` |

### To `engine-input`

A rule for a game's pointer arm, beside the target-verb requirements it depends on.

| Requirement | From |
| --- | --- |
| A drag game's press arm goes through the engine's verbs | `engine-hints` |

### To `app-shell`

Behavior of the chrome: the reference panel (beside "The reference panel is a region of the same layout"), and where a refused Solve is shown and how a Solve is queued.

| Requirement | From |
| --- | --- |
| The app shell shows a non-blocking, responsive reference panel | `ts-engine` |
| The reference panel renders each item and selects on a click | `ts-engine` |
| The board spotlight persists when the reference panel is closed | `ts-engine` |
| A refused Solve is shown in the help banner | `ts-engine` |
| Solve is ordered with the other queued input | `ts-engine` |

### To `ts-engine`

A rule of the `findMistakes` contract, beside the mistake-checking hook.

| Requirement | From |
| --- | --- |
| A mistake check compares with the one answer, hidden or not | `engine-params` |

### To `untangle`

One game's preference keys, which its own spec did not state.

| Requirement | From |
| --- | --- |
| The Untangle port exposes its three preferences via the hook | `ts-engine` |

## What each entry became

One line an entry, in the order of each report's section. **R** is
`rewrite-report.md` and **P** is `prune-report.md`; the number is the entry's
place under its capability's heading. "Step 3" is `tasks.md` § 3: the entry
is a game restating a rule the engine states, or a rule a shared capability
lacks, so it is a cut or a rewording and is settled with that capability's
doubtful requirements, not here.

### R, 104 entries

| Entry | What became of it |
| --- | --- |
| R repo-layout 1 | Moved to `help-pages`. |
| R repo-layout 2 | Moved to `testing`, not to `engine-hints`: a hint test's pins are in both `docs/games/testing.md` and `docs/games/hints.md`, and `engine-hints` is already the longest capability. |
| R repo-layout 3 | Moved to `engine-difficulty`. |
| R repo-layout 4 | Stays. It says what deploy tooling the repository may carry, which is layout, and names `build-pipeline` for the rest. |
| R repo-layout 5 | Already cut by the pruning, to `docs/work-management.md`. |
| R engine-hints 1 | Moved to `engine-input`. |
| R engine-hints 2 | Moved to `engine-difficulty`. |
| R engine-hints 3 | Step 3: a restatement of `engine-difficulty`. |
| R engine-hints 4 | Moved to `engine-drawing`. |
| R engine-hints 5 | Stays. How the Hint button behaves is read by a session changing the hint, from `docs/games/hints.md`; `app-shell` holds where the button sits. |
| R engine-hints 6 | Moved to `help-pages`. |
| R ts-engine 1 | Moved to `untangle`. |
| R ts-engine 2 | Moved to `app-shell`: the three requirements the pruning left of the four named. |
| R ts-engine 3 | Moved to `app-shell`. |
| R ts-engine 4 | Moved to `dealing`. |
| R ts-engine 5 | Stays. A gate script and `docs/games/mechanics.md` cite it under `ts-engine`, and no capability holds rules of coding style. |
| R build-pipeline 1 | Stays. A guard the gate carries sits with the gate's other guards, and names the `ts-engine` rule it holds. |
| R build-pipeline 2 | Stays. The Purpose of `build-pipeline` names the compiler-strictness decisions, and the entry offered two homes and argued for neither. |
| R build-pipeline 3 | Moved to `error-reporting`. |
| R build-pipeline 4 | "A cross-game guard bounds its cost on the axis the game varies" moved to `testing`; the two requirements on which games a hint walk excuses moved to `engine-hints`. |
| R app-shell 1 | Nothing to move: the pruning cut the requirement named. |
| R app-shell 2 | Nothing to move: cut by the pruning, and `docs/games/input.md` § "The numeric keypad never arrives" holds it. |
| R app-shell 3 | Nothing to move: the pruning merged the sentence back into "The app hands out boards, never seeds". |
| R app-shell 4 | "A help page lists what is not in the game, with the game's reason" moved to `help-pages`; the pruning cut the other. |
| R engine-input 1 | Moved to `engine-helpers`. |
| R engine-input 2 | Stays. It is what a drag does, and a session changing a drag reads `engine-input`. |
| R engine-input 3 | Stays. The key panel is this capability's subject. |
| R engine-candidate-hints 1 | Moved to `engine-helpers`, beside the deduction-fixpoint runner. |
| R engine-params 1 | Moved to `ts-engine`. |
| R engine-params 2 | Moved to `engine-difficulty`. |
| R ts-migration 1 | Moved to `engine-difficulty`. |
| R ts-migration 2 | The two that are the engine's answer moved to `engine-difficulty`, beside "An exhausted retry limit throws, or hands over to a bounded recovery"; "The app shows the sentence wherever a deal was asked for" moved to `dealing`. |
| R ts-migration 3 | Moved to `engine-params`. |
| R ts-migration 4 | Moved to `engine-helpers`. |
| R ts-migration 5 | "The solver and the hint are two projections of one deduction engine" moved to `engine-hints`; the pruning cut the other. Whether it now duplicates a requirement there is step 3's. |
| R ts-migration 6 | Stays. Acceptance by exercising a game is what `ts-migration` still holds, and `docs/games/README.md` names it as the home. |
| R engine-colors 1 | Stays. It is one clause of reason in a color requirement. |
| R engine-colors 2 | Stays. The rule pins a value in a palette, and a session changing a palette reads `engine-colors`. |
| R engine-colors 3 | Stays. Half of one requirement. |
| R engine-notes 1 | Nothing to move: the pruning cut the half that was the chrome's. |
| R engine-notes 2 | Stays. A paragraph of a requirement that is cited whole. |
| R engine-notes 3 | Stays. Each is the guard of a rule of this capability, and is read with the rule. |
| R engine-drawing 1 | Moved to `testing`. |
| R engine-drawing 2 | Moved to `testing`. |
| R solo 1 to 4 | Step 3. |
| R bridges 1 | Step 3. |
| R galaxies 1 to 3 | Step 3. |
| R tracks 1 | Step 3. |
| R palisade 1 | Reworded into `border-grid` (`rewrites.md`). |
| R palisade 2 | The requirement moved to `border-grid` with Separate's copy, reworded (`rewrites.md`). |
| R palisade 3 | "Border-grid games share the hint's notation layer" moved to `border-grid`; what Palisade's own hint requirements restate of it is step 3's. |
| R towers 1 to 5 | Step 3. |
| R map 1 | Step 3. |
| R undead 1 to 4 | Step 3. |
| R singles 1, 2 | Step 3. |
| R sokoban 1 | Step 3. |
| R seismic 1, 2 | Step 3. |
| R salad 1 to 3 | Step 3. |
| R bricks 1, 2 | Step 3. |
| R lightup 1, 2 | Step 3. |
| R grid 1 | Stays. The Purpose of `grid` claims loop generation, and the entry named the other home without arguing for it. |
| R keen 1, 2 | Step 3. |
| R group 1, 2 | Step 3. |
| R tents 1, 2 | Step 3. |
| R unruly 1, 2 | Step 3. |
| R separate 1 | Moved to `border-grid`. |
| R separate 2 | Moved to `border-grid`. |
| R separate 3 | "The games' move formats stay independent" moved to `border-grid`; the sharing requirement is reworded there (`rewrites.md`). |
| R pattern 1 | Step 3. |
| R clusters 1 | Stays. A note that two games state one grammar; no requirement was named. |
| R abcd 1 | Step 3. |
| R engine-helpers 1 | Stays, as P engine-helpers 1; the pruning cut the other. |
| R engine-helpers 2 | Stays. The pruning merged it into a sentence of the catalog requirement. |
| R mines 1 | Step 3. |
| R pearl 1 | Step 3. |
| R rect 1 to 3 | Step 3. |
| R project-identity 1 | Moved to `error-reporting`. |
| R combi 1 | Nothing to move: cut by the pruning. |
| R combi 2 | Step 3. |
| R random 1 | Nothing to move: cut by the pruning. |

### P, 84 entries

| Entry | What became of it |
| --- | --- |
| P repo-layout 1 | Nothing to move. |
| P repo-layout 2 | Stays. The two requirements are about the specs and the tool that validates them, beside the other rules for a spec's form. |
| P repo-layout 3 | Moved to `testing`. |
| P repo-layout 4 | Moved to `help-pages`. |
| P engine-hints 1 | Moved to `engine-input`. |
| P engine-hints 2 | Moved to `engine-candidate-hints`. |
| P engine-hints 3 | Moved to `engine-candidate-hints`. |
| P engine-hints 4 | Moved to `engine-difficulty`. |
| P engine-hints 5 | Moved to `engine-drawing`. |
| P engine-hints 6 | Moved to `engine-drawing`. |
| P ts-engine 1 | Moved to `untangle`. |
| P ts-engine 2 | Moved to `app-shell`. |
| P ts-engine 3 | Moved to `app-shell`. |
| P ts-engine 4 | Moved to `dealing`. |
| P ts-engine 5 | Moved to `testing`. |
| P ts-engine 6 | Stays, as R ts-engine 5. |
| P build-pipeline 1 | Moved to `engine-hints`. |
| P build-pipeline 2 | Moved to `error-reporting`. |
| P build-pipeline 3 | Stays, as R build-pipeline 2. |
| P build-pipeline 4 | Not a move. The snapshot it observed was filed under its change by `triage-what-the-spec-rewrite-found-in-the-code`. |
| P app-shell 1 | Moved to `app-shell`. Whether it is stale against "The reference panel is a region of the same layout" is step 3's. |
| P app-shell 2 | Moved to `help-pages`. |
| P app-shell 3 | Stays. It is the other half of "The app hands out boards, never seeds", which is beside it. |
| P app-shell 4 | Nothing to move: the cut stands, and the guide holds the rule. |
| P engine-input 1 | Moved to `engine-helpers`. |
| P engine-input 2 | Stays. A gesture is input, and the entry said only that it may fit elsewhere. |
| P engine-input 3 | Stays, as R engine-input 2. |
| P engine-input 4 | Not a move. The guide's figure for `MOD_MASK` was stale and is corrected in this change. |
| P engine-candidate-hints 1 | Moved to `engine-helpers`. |
| P engine-candidate-hints 2 | Stays. The rule is read by whoever writes a hint on the walk. |
| P engine-candidate-hints 3 | Step 3. |
| P engine-params 1 | Moved to `ts-engine`. |
| P engine-params 2 | Moved to `engine-difficulty`. |
| P engine-params 3 | Stays. The verdicts are `loadDesc`'s, which is this capability's. |
| P engine-params 4 | Stays. `docs/games/mechanics.md` cites it under `engine-params`. |
| P ts-migration 1 | Stays in `ts-migration`; whether a guide should hold the three is step 3's. |
| P ts-migration 2 | Stays, as R ts-migration 6. |
| P ts-migration 3 | Moved to `engine-difficulty`. |
| P ts-migration 4 | Moved to `engine-params`. |
| P ts-migration 5 | As R ts-migration 2. |
| P ts-migration 6 | All three moved to `engine-helpers`: the label rule is about the tables a shared helper emits, and its example is a preference and not a param. |
| P ts-migration 7 | The policy, the measured gate and the Unreasonable exemption moved to `engine-difficulty`, and the two-projections requirement to `engine-hints`. The guides that named `ts-migration` as the policy's home are repointed. |
| P engine-notes 1 | Nothing to move. |
| P engine-notes 2 | Stays, as R engine-notes 2. |
| P engine-drawing 1 | Moved to `testing`. |
| P engine-drawing 2 | Moved to `testing`. |
| P engine-drawing 3 | Stays. It is one of the warm-frame comparison's requirements and is read with them. |
| P solo 1, 2 | Step 3. |
| P tracks 1 | Step 3. |
| P palisade 1 | Moved and reworded into `border-grid`. |
| P palisade 2 | Stays. What a control does is stated with each game. |
| P netslide 1 | Nothing to move. |
| P towers 1 to 3 | Step 3. |
| P undead 1 | Step 3. |
| P keen 1, 2 | Step 3. |
| P group 1, 2 | Step 3. |
| P unequal 1 to 3 | Step 3. |
| P unruly 1, 2 | Step 3. |
| P mathrax 1 | Step 3. |
| P dominosa 1 | Nothing to move. |
| P separate 1 to 3 | Moved to `border-grid`. |
| P engine-helpers 1 | Stays. It binds where a constant lives in a solver or a helper, and the session it binds is writing one, not a test. |
| P engine-helpers 2 | Stays, as R engine-helpers 2. |
| P untangle 1 | Moved to `untangle`. |
| P rect 1 | Step 3. |
| P project-identity 1 | Moved to `error-reporting`. |
| P project-identity 2 | Step 3. |
| P flood 1 | Step 3. |
| P quick-save 1 to 3 | Stays. Each names an overlap and says which statement owns the rule. |
| P combi 1 | Nothing to move. |
| P engine-difficulty 1 | Moved to `engine-hints`. |
| P engine-difficulty 2 | Moved to `engine-params`. |
