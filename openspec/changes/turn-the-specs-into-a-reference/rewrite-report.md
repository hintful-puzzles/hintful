# What the rewrite reported

The findings of the agents that rewrote and reviewed the 78 capabilities of stages 4 to 6, as they returned them (2026-10-09). A rule found false of the code is also an `untrue:` row of that capability's ledger. Nothing here has been acted on unless `design.md` says so.

| | Count |
| --- | --- |
| Capabilities | 78 |
| Rules found false of the code and corrected | 490 |
| Defects the reviewers corrected in the rewrites | 372 |
| Places where the code looks wrong and the spec right | 172 |
| Requirements that look misfiled | 104 |
| Reasons a guide lacks | 22 |
| Left unresolved by a reviewer | 300 |

## Where the code looks wrong and the spec right

### repo-layout

- `metrics/2026-08-05/` (complexity.json, cycles.txt, cycles-raw.txt, knip.txt, summary.md, jscpd/) is tracked at the top level of `metrics/`. This requirement and `build-pipeline` both say a finished round's dated snapshot is not a live instrument and is filed under the change that produced it. Nothing I found reads it. Recommendation: move it into the archive entry of the change that produced it, or delete it.
- `scripts/gate.sh` line 216 runs `node scripts/checks/spec-form.mjs`, and no such file was in `scripts/checks/` when I listed it. It may be arriving with this change's final commit; if not, the gate fails at that step.
- `metrics/2026-08-05/` (complexity.json, cycles.txt, cycles-raw.txt, jscpd report, knip.txt, summary.md) is tracked at top-level `metrics/`. Both this spec ('`metrics/` holds only live instruments'; a finished round's dated snapshot is not one) and `build-pipeline` ('A round's metrics snapshot is filed under the change that ordered it') say a finished round's dated snapshot does not stay there. Nothing under docs/, src/, scripts/ or the root markdown reads that directory by its date. The spec looks right and the tree wrong: the snapshot should be filed under its change or archived, unless that round is still open.

### engine-hints

- src/games/galaxies/hint-text.ts exports `tell`, not `say`. The spec ('A game's hint sentences SHALL live in one text module per game') and docs/games/hints.md § 'The sentences live in one file per game' both say every game's text module is exported as `say`; the other 52 modules comply.
- Nothing enforces 'a hint builder SHALL NOT retype a refusal constant's value'. A string literal equal to a constant's text satisfies the `HintRefusal` type, and src/engine/hint-refusal.test.ts reads only escape calls. No such literal is in the tree today (`git grep 'error: "'` over src/engine and src/games finds none), so the rule holds but is unguarded.

### build-pipeline

- The documentation-only shortcut in `scripts/gate.sh` skips vitest and vite build for `README.md`, `LICENSE.md` and `CREDITS.md` as well as `docs/`, `openspec/`, `AGENTS.md`, `CLAUDE.md`. `README.md` is a test input (`src/project-identity.test.ts` globs `../README.md` and asserts on it) and `LICENSE.md` is a build input (`src/dialogs/about-dialog.ts` imports `../../LICENSE.md?raw`). The spec permits the skip only for paths that are neither.
- The assertion the spec requires over the skippable set covers a subset: `SKIPPED_ROOTS` in `src/gate-scope.test.ts` lists only `docs/`, `openspec/`, `AGENTS.md`, `CLAUDE.md`, so the three root files above are unguarded, and its `READ_CALL` shape would not see a static `?raw` import such as the LICENSE one even if they were listed.
- `metrics/2026-08-05/` (complexity.json, cycles, jscpd, knip.txt, summary.md) is a dated round snapshot tracked at the top level of `metrics/`, with no note beside it. The spec says a round's snapshot is filed under its change and archived with it, that top-level `metrics/` holds only live instruments, and that a snapshot carries a note.
- `scripts/metrics.sh` still runs `npx knip` for its dead-code measurement (with `// true`), but knip is no longer a devDependency and `knip.json` is gone, so the harness's dead-code file records whatever npx does without it. The spec says the harness records dead code and that knip is not the instrument.
- `scripts/deal-walk.ts` is in no TypeScript project: `tsconfig.json` includes `src`, and `tsconfig.node.json` includes `vite.config.ts`, `vitest.config.ts`, `vite-plugins`, `scripts/checks` and `scripts/hint-scan.ts`. `tsc -p tsconfig.node.json --listFilesOnly` lists `scripts/deal-walk-report.ts` (reached by import) and not `scripts/deal-walk.ts`. The spec requires every `.ts` file to belong to a project the gate checks.
- Stale prose, not behavior: the header comment of `.github/workflows/ci.yml` lists the gate's steps (the list the spec says has one definition, `scripts/gate.sh`) and its deploy comment cites a requirement title, "a failing gate does not reach the public URL", that did not exist at the base commit either.
- metrics/2026-08-05/ is a tracked, dated round snapshot at the top level of metrics/ (complexity.json, cycles.txt, jscpd/, knip.txt, summary.md). 'The top-level metrics directory holds only live instruments' and 'A round's metrics snapshot is filed under the change that ordered it' both say it belongs under its change or the archive. I found no reader of it outside the archive.
- scripts/metrics.sh still runs 'npx knip' for its dead-code step and its comments describe a knip.json. knip is in neither package.json nor package-lock.json, and there is no knip.json. 'The unused-export check is the repository's own, not knip' says knip is gone, so the harness's dead-code measurement can only fail, and '// true' hides that.
- The header comment of .github/workflows/ci.yml restates the gate's steps ('the typechecker over both projects → biome ci → probe-anchor check → vitest run → vite build'), a second and already incomplete list. 'The gate's checks are listed in one place' forbids a spec or guide from carrying one; a workflow comment is outside that wording but is the same rot.

### app-shell

- 'Every command the screen offers SHALL be reachable from exactly one place in exactly one of [the three panels]' against src/screens/puzzle-screen.ts: the solved notification (`renderEndNotification`) carries `data-command="share"` and `data-command="change-type"` buttons, so Share is offered both there and in the Menu. The guard (src/screens/puzzle-command-homes.test.ts) mounts only the Bar, Menu and Game controls, so it cannot see this. Nothing was changed.
- The same rule against the spec's own 'The game's name opens the quick-switch': the readout row's name button opens the quick-switch that the Menu's `Switch puzzle…` row also opens, so that command has two places by the spec's own requirement. Both rules were in the old text and both are kept as written; the owner may want the 'exactly one' rule to name this exception.
- 'The first four entries (Undo, Redo, Hint, Check & save) SHALL be on the Bar at every size' (kept verbatim): in a game with no hint, `commandList` in src/puzzle/command-list.ts omits Hint, so the four that `MIN_BAR_LENGTH` guarantees are Undo, Redo, Check & save and Back to last save. The rule about the first four holds; the parenthetical list is only right for a game with a hint.

### engine-input

- Scenario 'A key-only verb reaches the board' says each of a key-only verb's keys reaches some board. The guard in src/engine/target-verb.test.ts (the keyOnly loop near the end) unions the boards of all of a verb's keys and codes into one `byKey` set and asserts only that the union is non-empty (and, for a repeat route, that the union equals the route's boards). One dead key or one dead case of a letter beside a live one passes. The spec's per-key rule looks right; I left the scenario as it was and changed no code.
- The secondary-button requirement says the view skips detectSecondaryButton entirely for a game declaring ignoresSecondaryButton. src/puzzle/components/view-interactive.ts still calls it, with both affordances off, which returns at once. The behavior is the same, so I restated the rule behaviorally (no promotion, press delivered at once) and did not record it as untrue; noted in case the literal reading matters.
- The requirement says a claimed unactionable code's ledger entry 'states why'; the comment on CLAIMS_UNACTIONABLE in src/engine/input-parity.test.ts adds that the reason must also be in the game's spec, which the spec does not require here (it does for the keyboard exemption list). The two ledgers are held to different standards; nothing changed.

### engine-candidate-hints

- src/engine/candidate-hint.ts candidateHint: with ui null the reading falls back to DEFAULT_CANDIDATE_READING, not the game's own default, so the spec's 'a caller asking for a hint without a Ui SHALL get the game's own default' is held only by each game writing ui ?? newUi(state) at its call site. Salad and Crossing pass null. A game that offers the reading preference and passes null would silently break the rule.

### engine-params

- src/engine/midend.ts, doc comment on `setCustomParams` in the midend interface (about line 215): says the values are validated 'with the game's own `validateParams`'. The implementation checks `onlyError` and then `paramsError`, as the spec says, so the comment is stale; behavior matches the spec.

### ts-migration

- src/engine/difficulty-contract.test.ts 'is monotone in its cap' samples seedBudget(perCommit(1, 4), 12): the pre-commit hook runs one board per tier, the sample size its own comment says missed Boats (7 of 8 boards); only the wide run (CI, npm run gate) takes four. The spec asks for enough boards per tier to catch the defect.
- src/engine/deduction-fixpoint.ts names its non-fits (Loopy, Lightup) in the header but defers the reason each does not fit to docs/games/solver-and-generator.md § 'Where the fixpoint does not fit'; the spec asks for the reasons in the module itself.
- openspec/changes/add-path-ts-port/reference/README.md points its license at `puzzles/LICENSE`, a path that no longer exists (the notices are in licenses/). The spec asks the README to record the license.
- src/engine/params-stability.test.ts header and src/engine/testing/params-corpus.ts carry figures ('all 612 cases', 'all 57 games') and quote ts-migration as policy text ('existing games keep their byte-stable codecs permanently') that the spec does not contain.

### engine-colors

- 'The pair's hues carry what a player moves, seeks and finishes' says each role is a reference to a pair member or its wash, so replacing the pair recolors them. `MOVED = TWO[0]` and `GOAL = TWO[1]` are references, but `GOAL_WASH = YELLOW_WASH` and `REGION_DONE = PURPLE_WASH` (src/engine/color/palette.ts) name the hue directly, as does `SHADED`'s sibling `TRACKS_BED` in palette-games.ts. Changing `TWO` in colors.ts would leave those two roles on the old hues. Spec left as it was.
- 'Every game's board sits at one tone' says every consumer of a game's palette goes through `resolvePalette`. The midend, the render-scenario harness, scheme-palettes.ts and view.ts do; several test helpers call `game.colors(...)` directly with an unshifted background: src/engine/testing/hint-binding.ts, src/engine/testing/repaint-differential.ts, src/puzzle/hatch-contrast.test.ts, src/engine/hint-mark.test.ts, src/engine/hint-overlay.test.ts, src/engine/pencil-indicator-placement.test.ts, scripts/checks/color-dark-check.test.ts, scripts/checks/color-collide.test.ts. Spec left as it was.
- 'A color is a shared role only where two or more games use it': `HINT_EVIDENCE_WASH` has one game consumer (src/games/lightup/render.ts; its doc comment still names Range and Pattern), and `UNDECIDED` in palette.ts has no consumer at all (no game or engine file imports it; the dead-token test in palette-source.test.ts covers colors.ts and palette-games.ts but not palette.ts).
- 'The hint emphases stay distinguishable' requires every pair among the five hint roles to be more than 0.12 apart. I computed all ten pairs from the OKLCH design values and all clear it in both schemes (closest: evidence vs black-reference in dark, about 0.196), so the rule is true of the colors, but the guard in src/engine/color/palette.test.ts measures only five of the ten pairs (none of evidence or evidence-wash against the two premise references, nor evidence against its wash).
- Hand-kept counts in guards, against the doctrine that a guard derives its population: palette-departures.test.ts asserts `games.size` is 57 and board-background.test.ts asserts `ids.length` is 57; bevels.test.ts pins the list of bevel-drawing games to fifteen, sixteen and twiddle.
- src/engine/color/palette.test.ts ('keeps the hint emphases distinct, in both schemes') measures five pairs: ACTION-EVIDENCE, ACTION-WASH, BLACKREF-WHITEREF, ACTION-BLACKREF, ACTION-WHITEREF. The spec, old and new, requires every pair among the five roles (ten pairs) to stay more than 0.12 apart. EVIDENCE against EVIDENCE_WASH, the pair OLD named as the closest at 0.124 in dark, is not measured, nor is EVIDENCE against either premise reference.
- src/engine/color/palette-departures.test.ts keys on the slot's index name (CURSOR, HELD, DRAG, HINT), where OLD required finding departures 'by the shape of the assignment rather than by the slot's name' and covering every listed meaning. It also pins the game count as a literal 57 in the test, not derived from the collection.
- src/puzzle/bevels.test.ts pins the games that draw a bevel to a hand-kept list (fifteen, sixteen, twiddle). A new game that draws a bevel through a shared helper fails that assertion until the list is edited, which contradicts the kept scenario 'its bevel is checked by the same guard with no edit to the guard'.
- src/engine/color/colors.ts, doc comment of TWO: 'orange the hint's outline' is stale; the hint's evidence outline is TEAL_BOLD and the premise outlines are GREEN and PINK.
- src/puzzle/neighbor-contrast.ts tooCloseInDark excuses any pair, areas included, whose distance is under 0.005 in both schemes ('one role under two indices'). The spec says two filled areas owe the distance outright and states no such exemption. I did not write it into the spec.

### loopy

- src/games/loopy/cursor.ts header comment: "an arrow press does not *move* it — it picks an edge" contradicts the walk the same header describes two paragraphs later (a plain arrow moves the cursor). Stale comment, not behavior.
- src/games/loopy/cursor.ts header and `edgesByDirection` doc quote "22 presets ... the 23rd" and "all 23 presets"; `PRESETS_TOP` plus `PRESETS_MORE` in params.ts now hold 18. Stale figures in comments.
- Spec "Where no patch reaches its size, Loopy deals the largest drawn" says a size SHALL NOT be refused because its patches are small, with a scenario dealing 3x3 Penrose (rhombs). `validateParams` (params.ts) refuses 3x3, 3x4, 3x5 and 4x3 Penrose (rhombs) at Normal (`THREE_RHOMB_SIZES`, no Normal puzzle exists) and any Penrose (kite/dart) of width under 4 (every patch empty). Neither refusal is 'because patches are small' strictly, and neither is stated anywhere in the loopy spec; I left both the spec and the code alone, but the spec is silent on two player-visible refusals.
- src/games/loopy/params.ts `validateParams` refuses Penrose (kite/dart) below width 4 because the patch comes out empty, and refuses Normal on the four three-rhomb Penrose (rhombs) sizes. Neither refusal is in the spec, old or new. The first sits uneasily beside 'It SHALL NOT raise the per-type minimum sizes to avoid the condition'; the second beside 'A size SHALL NOT be refused ... because its patches are small' (it refuses a tier, not a size). The spec probably needs the two rules added rather than the code changed.
- The header comment of src/games/loopy/cursor.ts says 'an arrow press does not *move* it — it picks an edge', which is the same stale sentence the ledger marks untrue; the code below it walks the cursor on a plain arrow.

### engine-notes

- src/engine/midend.ts requestKeys: its doc comment says 'A game that already offers the key keeps its own placement', and the code returns the game's keys untouched if one is the Marks key, while the spec (and src/engine/pencil-mode-key.test.ts) says a game SHALL NOT list the key and it is always last. The branch is unreachable today because the guard forbids self-listing, but the comment describes a behavior the spec refuses.
- src/engine/game.ts canMarkAll doc comment says the app shell 'surfaces a toolbar button', and src/engine/mark-all.test.ts cites `components/history.ts` as where the button lives; the control is in src/puzzle/components/game-controls.ts. Stale comments, not behavior.
- src/games/seismic/index.ts answers Mark-all fill-only although Seismic's cells do have uniqueness-like regions; its comment gives the reason (adaptiveMarkAllMove assumes a square board with candidates capped at w). The spec's fill-only requirement covers it as written (it supplies neither a region provider nor its own rule), so nothing was changed, but the owner may want it cleaned like Rome, which shares the same shape of per-cell candidate sets.
- src/engine/pencil-indicator-placement.test.ts derives its population from `ui.pencilMode` alone ('A game takes notes iff its own Ui carries the collection's mode flag'), not from the shared `takesNotes` definition the spec requires engine and guard to read. The populations coincide today, but a game with a `pencil` array and no mode flag would get a Marks key and escape the reach guard.
- Stale comments in src/engine/mark-all.test.ts: it says canMarkAll decides whether 'the toolbar shows a Mark-all button (`components/history.ts`)' and cites `puzzle-history.ts` `handleMarkAll`, but the control is now in src/puzzle/components/game-controls.ts.
- src/engine/mark-all.test.ts reads every member's `pencil` as 'one bitmask per cell' and says a per-candidate-flag layout 'would fail the narrowing test', while the spec and docs/games/mechanics.md call ABCD's candidate cube of n slots conforming. I did not run the test to see how Abcd passes it.
- src/engine/pencil-prefs.test.ts pins the shared labels with floors described as 'ten and five games respectively'; every mechanic member now offers keep-highlight, so the figure in the comment is stale.

### engine-drawing

- src/engine/draw.ts: the inline comment "Highlight wedge (top/right)" and the doc comment "a top-right `highlight` wedge and a bottom-left `lowlight` wedge" on `drawRecessedBorder`, and the test title "places the highlight wedge on the top/right corner" in src/engine/draw.test.ts, describe a pentagon that lies along the bottom and right edges. The pixels are right for a recessed frame; the wording is what is off. Nothing changed.
- src/engine/midend.ts: the doc comment on `forceRedraw` says the worker adapter calls it "when the palette or font is replaced"; no font-replacement path exists. Nothing changed.
- src/engine/draw.ts, drawRecessedBorder: the JSDoc ("a top-right `highlight` wedge and a bottom-left `lowlight` wedge") and the inline comments ("Highlight wedge (top/right)", "Lowlight wedge (bottom/left)") misdescribe the polygons beneath them. The highlight pentagon runs along the bottom and right edges and the lowlight along the top and left, which matches upstream's recessed frame, so the drawing is right and the comments are wrong. They are the source of the old spec's untrue wording.
- src/engine/draw.ts, drawRectOutline: the JSDoc says "a 1px-thick rectangle border" while the function takes `thickness = 1` and passes it to every line.
- src/engine/draw.ts, drawRecessedBorder JSDoc cites "Samegame's constant highlight width and gap offset" as a caller shape, but Samegame no longer calls the helper or draws a bevel.

### guess

- Possibly unintended, changed nothing: a right-click or touch long-press on an answer slot ends up selecting the slot and switching notes mode on (declined press, then the frontend's synthesized RIGHT_RELEASE hits the class-keyed release arm in src/games/guess/index.ts). The old spec said it SHALL do nothing and the only test (guess-hint.test.ts, "a right-click or held finger on an answer slot marks nothing") checks the press alone. I recorded the code's behavior as the rule because the same class-keyed release is what the spec requires for the feedback pegs; the owner may prefer the old wording and a code fix.
- src/games/guess/index.ts changedState/restCursor: the spec (old and new) says that in notes mode the cursor SHALL NOT rest on the submit position, but only the Marks-key arm enforces it. With every peg held and notes mode on, pressing the panel's Submit key commits a non-winning guess, changedState rebuilds a full markable row and restCursor sets cursor.x = npegs while pencilMode stays true. The cursor is then on the submit position in notes mode, no answer slot is framed, and color keys are declined until the player moves or taps. Read from the code, not reproduced in the app.

### crossing

- Possible mismatch, not changed: the old scenario 'The selection stops at the end of the run' says the selection 'stays on that cell'. In `interpretMove` (src/games/crossing/index.ts), when `nextInRun` returns null the code calls `releaseHighlightAfterEntry`, which hides a mouse-placed selection after the run's last digit (a keyboard cursor stays). The cursor position does stay in the run, so I reworded the scenario to 'does not move to a cell outside the run', which is true of both cases. Whether the highlight should stay visible after the last digit of a mouse-typed number is a player-visible question for the owner.
- src/games/crossing/render.ts redraw: with a cell selected in pencil mode, selCell is -1, so the clue list is not colored by fit and the runs are not washed, although the spec says selecting a cell indicates which clues fit its runs. Possibly deliberate (index.ts also holds a clicked clue in pencil mode instead of placing it), so not changed.

### solo

- src/games/solo/state.ts: two comments are stale against `regionsOf`. `SoloUi.autoPencil` says a placement strikes the digit "from its row/col/block", and `SoloMove`'s `autoElim` says "row, column, block (or diagonal)"; both omit the killer cage that `autoEliminate` does strike. Behavior matches the spec; only the comments are wrong.
- src/games/solo/render.ts: the SoloHint doc comment and its fields still say the driving region's cells are 'shaded COL_HINT_CELL', while the code outlines evidence in the gutter and hatches the named region; the comment is stale, the drawing matches the spec.
- src/games/solo/index.ts header comment says 'Left-click / cursor-select highlights a cell for a real entry; right-click / select2 highlights it for a pencil mark', which interpretMove does not do (select toggles pencil mode, select2 clears); the comment repeats the old spec's untrue sentence.
- src/games/solo/state.ts: the SoloMove 'set' comment says autoElim strikes from 'row, column, block (or diagonal)' and the pencilAll comment says 'Fill every empty cell's pencil marks'; the code also strikes the killer cage and fills only cells with no notes.

### bridges

- src/games/bridges/solver.ts: the doc comment on `bridgesRecordingPass` (and hint.ts's header, 'the same three rungs') says 'the same *three* DeductionTechnique objects', but `Solver.ladder()` returns four since sealing off became its own technique. Stale comment; code behavior is fine.
- src/games/bridges/index.ts / state.ts: `BridgesUi.todraw` is written in `newUi` and `updateDragDst` and never read anywhere (render.ts does not use it). A drag over an empty span therefore previews only by recoloring the two islands, with no line; the old spec promised a 'drag preview line'. Upstream's C has the same unread field, so I corrected the spec to the code, but an owner may consider the missing preview line a player-visible shortfall rather than a spec error.
- src/games/bridges/state.ts `sparseRefusal`: its comment carries a measurement date and figures ('Measured 2026-10-05 ...'); not a spec matter, noted only because the reference change is removing the same from specs.

### galaxies

- src/games/galaxies/render.ts `drawSquare`: the hatch on 'the galaxy the sentence names' is drawn in COL_HINT (the action purple) though it is evidence the step reasons over; the spec's 'evidence and action in the legend's two colors' reads more naturally with the hatch in the evidence color. Possibly deliberate (stripes role); not changed.
- src/games/galaxies/render.ts comment in `drawSquare` ('A cell's fill *is* its association') contradicts the code two lines below and the spec: the fill comes from the completion check, not the association. Comment only; not changed.
- Old rule 'the narration SHALL state the symmetry as the reason they travel together': hint-text.ts says only 'this cell and its partner' / 'it and its partner'; the symmetry is explained in the `hintMarks.roles` text ('the square opposite the dot (its partner) ... since the same arrow brings it along'), not in each step's sentence. Rule kept as written; a reviewer may judge whether the narration meets it.
- Read from the code, not run: pointer cancellation (cancelPointerTracking in src/puzzle/components/view-interactive.ts) sends a drag at (-100,-100) and then a release. In interpretMove (src/games/galaxies/index.ts) that drag makes a pending left press 'traveled', so it starts a drag from the press point before the release arrives. A canceled left press on an arrowed tile would then pick the arrow up and drop it off the board, removing it and its partner; a canceled left press on an edge's line would open a wall sweep, which may toggle the pressed edge. Both contradict 'a press that ends far from where it began commits nothing'. The release-only path the code comment describes is correct; the preceding synthesized drag is the gap.
- Read from the code, not run: a right press on a dot begins the drag at once with the target set to the snapped press tile. For a dot on an edge or a vertex that tile differs from the source, so a bare right click on such a dot (release without moving) appears to commit the dot's adjacent tile and its partner via dropDrag.

### tracks

- src/games/tracks/index.ts `hintMarks.roles.outline` tells the player the clue number a step counts with is recolored in the 'second color' (evidence), but `redraw` in src/games/tracks/render.ts draws a hinted clue digit in `COL_HINT`, the action color (`key & 2 ? COL_HINT`). The old spec names no color for the digit, so the spec is silent and unchanged; the help sentence and the render disagree. Magnets' row in docs/games/hints.md recolors its clue digits `COL_HINT` too, so the wording may be the side to fix.
- src/games/tracks/tracks.test.ts titles its pinned-seed deal test '15x15 Hard ... at exactly Hard', using upstream's tier name for the tier the game shows as Tricky. Naming only; nothing changed.
- src/games/tracks/render.ts flashLength: `Math.max(1, (trackLength + 3) * 0.07)` means every track of 11 squares or fewer flashes for exactly one second, so the pace is not 'one pace on every board' on short tracks. The spec states both the one pace and the one-second floor (in OLD too), and the two conflict there; not changed.

### palisade

- The old legend required a cited region to be drawn in a color different from the forced edges (`COL_HINT_CELL` against `COL_HINT`). The code hatches the `notTooSmall` and `equivalentEdges` region in `COL_HINT`, the forced edges' own color (`F_HINT_REGION` in src/engine/border-grid-render.ts), told apart by the hatch alone. A comment in src/games/palisade/index.ts cites docs/games/hints.md § 'Hatch the line the sentence names', so this looks decided rather than a defect; the spec now follows the code.
- A wall-enclosed region larger than `k` reddens nothing on its own: `borderErrorBits` measures too-large only over cells joined by no-wall marks. The old spec and its scenario said such a region's boundary walls redden. Plausibly intended (more walls can still fix it), and the spec was corrected to the code, but the owner may want to confirm.

### netslide

- 'The hint SHALL never give up on a solvable board' (kept unchanged): `hint()` in src/games/netslide/hint.ts returns SEARCH_OUT_OF_REACH when the planner comes back empty, and src/engine/hint-resume.test.ts lists netslide among the bounded-search hints excused from that promise ('has not been seen refusing'). The refusal arm is unobserved rather than shown reachable, so the rule was not marked untrue; the spec promises more than the code structurally guarantees.
- 'A plan that runs out of budget ... SHALL be narrated as setting up, not as arriving' (kept): a later leg of a journey (`say.next` in src/games/netslide/hint-text.ts) that ends in a cell the finished board does not want says neither 'belongs' nor any setting-up words, so only the 'not as arriving' half holds for continuation legs. The opening leg does say it. The new scenario is scoped to the opening step.
- src/games/netslide/index.ts header comment and several comments in state.ts/generator.ts/render.ts still call the source 'the center' and say 'solve replays it, faithful to upstream', while solve now also reconstructs; comments only, no behavior, not touched (outside the two files I may edit).
- src/games/netslide/index.ts solve can still return SOLUTION_UNKNOWN when reconstructSolution returns null (a desc whose tiles cannot form a tree), while the spec says Solve on a board with no aux SHALL NOT refuse. OLD said the same ('rather than refusing'), so nothing was changed; the spec holds for any board a generator writes.

### towers

- Comments only, no behavior: src/games/towers/render.ts says a tower's faces 'protrude up-left' (file header) and that a tower 'spills into the cells up and to the left of its own' (above the hint-mark pass), and src/games/towers/index.ts says 'a tower protruding up-left from a neighboring cell'. The code shifts the top up and to the right, as the comment above `overlayMoved` in the same file says. The three stale comments should be corrected.
- src/games/towers/state.ts `validateParams` carries a dated measurement in a comment ('Measured 2026-10-05: none in 50,000 boards'), which the project's own rules for comments and figures would move out.
- Comments in src/games/towers/render.ts (file header: 'the left and bottom faces protrude up-left', 'a 3D tower paints up-left into its neighbors'; and near the hint marks: 'a 3D tower spills into the cells up and to the left of its own') and in src/games/towers/index.ts interpretMove ('a tower protruding up-left from a neighboring cell') say up-left, while the code moves the top face right and up (tx += x3d, ty -= y3d), hit-tests the cells below and to the left, and another comment in the same redraw says 'up and to the right'. The geometry is consistent; the comments are wrong.
- The comment on extremeClueLines in src/games/towers/index.ts says 'The board is mistake-free when the planner runs (`hint` refuses otherwise)'; it is the midend that refuses, and candidateHint refuses only an empty plan.
- The file header comment of src/games/towers/index.ts says 'right-click / select2 highlights it for a pencil mark', but CURSOR_SELECT2 clears the cell and CURSOR_SELECT toggles pencil mode (the same stale claim the old spec made).

### map

- src/games/map/render.ts header comment still says 'The layout is upstream's NARROW_BORDERS one: no border' while `origin` and `computeSize` grow the canvas by the pencil indicator's reach on every side; the code is right and the ledger's untrue: row for 'BORDER of 0' is borne out, the file comment is only loosely worded.

### subsets

- Solve on a board the solver cannot finish. The spec says Solve fills the board unless the board is invalid, and `solve` in src/games/subsets/index.ts does return a partial fill for an `unfinished` result ("An unfinished solve still emits the partial deduction (upstream)"). But `solve()` in src/engine/midend.ts throws when a Solve move leaves a board whose status is not solved. No generated board reaches this, since the top tier solves every one; a hand-entered description the solver cannot finish would throw instead of getting a refusal. Nothing changed; a `NO_SOLUTION`-style refusal for `unfinished` looks like the fix.
- Tier naming in comments. The second tier is `DIFF_TRICKY` in src/games/subsets/state.ts, but the player sees "Normal" (`tierNames(2)`), and comments in generator.ts and solver.ts call it "Normal" while state.ts and one solver.ts comment call it `DIFF_TRICKY`. The spec names no tier, so it was not affected.
- src/games/subsets/solver.ts: `solveCopy` and `deduceHintPlan` default `maxdiff` to DIFF_TRICKY while the spec says the solver takes an explicit cap 'with no default'. `subsetsSolveGame` itself requires the cap, and both defaults are argued in their doc comments (Solve, findMistakes and the hint want the top of the ladder), so the spec was left as OLD had it. A decision is owed on whether the rule should bind these two wrappers or the spec should say that Solve and the hint run at the top of the ladder.

### undead

- OLD required `redraw` to paint red every placed cell of an over-placed type and the whole of a failing sightline. src/games/undead/render.ts computes `cellErrors` but colors no cell from it, and its header says this is deliberate (upstream does the same). The rewrite follows the code. If the owner wanted the cells reddened, this is a player-visible gap rather than a spec error.
- OLD required the hint narration to teach the sighting rule. `say.sightline` in src/games/undead/hint-text.ts deliberately leaves it to help/games/undead.md (which does state it), citing docs/games/hints.md § 'Rules belong in the help'. The rewrite follows the code; flagged only because the old spec's SHALL was explicit.

### singles

- src/games/singles/render.ts draws the grid lines and frame in the error color when state.impossible is set, and the spec requires it, but no played state ever has impossible true: only the solver sets it, on its own working copies, and executeMove/checkComplete never do. The rule is true of the code but unreachable in play. Either the flag should be derived for the board on display or the rule and DS_IMPOSSIBLE are dead; nothing was changed.
- src/games/singles/generator.ts header comment still says the chain 'reproduces the C desc byte-for-byte for the same seed', while the size rule has since diverged from upstream on purpose (Normal at 3xN is dealt, not downgraded). The spec only promises reproducibility from a seed, which holds; the comment may overstate.

### sokoban

- Read, not run: Solve on a hand-authored level with a capital-letter barrel looks like it throws. `solve` in src/games/sokoban/index.ts builds its move with `encodeBoard(end)`, which writes each grid value as a character; a labeled barrel on a target is stored as a control character (1..26, `targetize` in state.ts). `executeMove` then decodes that board through `solvedBoard` -> `newState` -> `parseDesc`, whose `DESC_LETTERS` refuses control characters. A finished board has every labeled barrel on a target, so the spec's 'Its move SHALL carry the finished board as a game ID writes it' cannot hold for such a level. Either the desc alphabet should accept the on-target form (which is what the old spec said) or `encodeBoard` needs a writable form for it.
- Stale comment in src/games/sokoban/render.ts (`isWall`): 'A hand-typed desc may carry generation's INITIAL; it draws as a wall'. `DESC_LETTERS` has no `i`, so a description cannot carry it.
- src/games/sokoban/sokoban-solver.test.ts, 'the search's reach': the scenario (old and new) says the search finds a line 'within the budget a deal allows', and `DEAL_BUDGET` in src/games/sokoban/generator.ts is 20,000, but the test asserts `search(s, 30_000)`. I did not run it at 20,000 (the task forbids running the suite), so whether the three openings finish within the deal's budget is unverified.

### seismic

- src/games/seismic/index.ts interpretMove: in pencil mode, a clear key (Backspace/space/0) on an empty cell that has no notes returns a `set` move with n=0 that changes nothing, so each press adds an undo entry. The spec's no-op rule is worded for a digit, so it is not strictly violated, but the intent (an input that changes nothing makes no move) is; the non-pencil path does guard this with `grid[i] === n`. Nothing changed.
- src/games/seismic/seismic.test.ts, about line 216: the comment says "presets stop well short of" the bound, but the assertion beneath is `p.w * p.h <= 8 * 8`, which equals MAX_CELLS_SEISMIC. The comment is stale for Seismic mode, and the literal 8 * 8 restates the bound instead of referencing it.

### salad

- Retry bound: the spec says the bound is set high enough that a legal seed cannot exhaust it. The comment on `MAX_SMALL_NUMBERS_ATTEMPTS` in src/games/salad/generator.ts says a 4x4 Number Ball board of three numbers at Normal runs that bound out about once in 150 deals, after three quarters of a minute. `validateParams` accepts that shape (its refusals cover two symbols only). The rule is kept as written; either the shape wants a refusal like `twoSymbolRefusal`'s or the bound is still short for it.
- src/games/salad/index.ts interpretMove: commit() returns a set or pencil move without checking whether it changes anything, so re-entering the symbol a square already holds, or clearing a blank square with no notes, records a history entry. The spec and docs/games/mechanics.md § 'interpretMove and UI_UPDATE' both require a no-op; Solo, Keen, Towers, Unequal, Undead, Rome and Map use noOpEntryResult for this and Salad does not.
- src/games/salad/generator.ts MAX_SMALL_NUMBERS_ATTEMPTS: its own comment says the 4x4 Number Ball bound 'runs out once in 150 deals' for three numbers at Normal, a shape validateParams accepts. The spec requires the retry bound to be high enough that a legal seed cannot exhaust it. Either the shape should be refused by twoSymbolRefusal-style validation (tooRareToDeal) or the bound raised.

### slant

- src/games/slant/render.ts: the comment in redraw 'Clue-vertex errors light the clue circle red in all four tiles that draw it' does not match drawClue, which reddens only the number (the disc stays COL_GIVEN and the ring ink). The spec now follows the code; the comment is stale.
- src/games/slant/render.ts: COL_SLANT1 and COL_SLANT2 are both INK, so the (x^y)&1 parity selection in drawClue and drawTile (ccol, fscol, bscol) chooses between two equal colors. Dead distinction: either collapse the two palette entries or restore the chessboard coloring.
- src/games/slant/render.ts header says 'every overlay ... lives in the packed word', but the same-slant marks, the pin and the mark mistakes are keyed in the second sideKeys array, as the next paragraph of the same header says.

### bricks

- src/games/bricks/index.ts header comment says 'Rule violations show live while dragging', consistent with render.ts; OLD spec's 'shown live during play' was the wider claim. The render comment ('never on a plain committed frame (upstream)') reads as deliberate, so I accepted the untrue row rather than reporting the code as wrong.

### group

- src/games/group/solver.ts `solverHard`: the docstring says a filled product that is neither `a` nor `b` proves neither is the identity, and that it works 'in identity-hidden mode'. The code rules out one element at a time by a product that is not the other factor, and runs in both identity modes. The comment is stale; the behavior matches the new spec, and nothing in the behavior looks wrong.

### tents

- Census coverage: OLD said the firing census covers "the preset sizes at both tiers", which most naturally means all six presets. SHAPES in src/games/tents/tents-ladder.test.ts omits 15×15 Easy. The rewriter filed this as `untrue:` and reworded the rule to "every preset size, both tiers and a non-square board"; I kept that, but the test may be the side that is short.

### unequal

- src/games/unequal/index.ts, JSDoc of `unequalKeys`: says 'Orders run 3..32', but the declared bound a few lines below is `MAX_CANDIDATE_VALUE` (31). A stale comment, not a behavior defect; nothing changed.
- src/games/unequal/state.ts `decodeParams`: an unknown difficulty character decodes to "easy" (Normal) and nothing refuses it: `p.diff = idx >= 0 ? diffFromLevel(idx) : "easy"`. The old spec and upstream both refuse it; commit 557c606c deleted the `Unknown difficulty rating` check as dead because the typed `Difficulty` could never reach it.
- src/games/unequal/index.ts, doc comment on `unequalKeys`: 'Orders run 3..32, so the high range is genuinely reachable' is stale. The declared bound is `MAX_CANDIDATE_VALUE` = 31.
- src/engine/candidate-hint.ts, doc comment on `DEFAULT_CANDIDATE_READING`: names Unequal as a game for which `populate` is right, while Unequal's `newUi` in state.ts overrides it to `implicit` with its own stated reason. One of the two comments is out of date.
- src/games/unequal/render.ts, doc comment on `UnequalHint`: says the driving clue's cells are 'shaded `COL_HINT_CELL`'. `redraw` outlines them in the gap and paints nothing over the cell.

### boats

- The fleet display can draw past the canvas width, against 'The fleet display fits the canvas for every legal fleet'. `fleetRowLimit` (src/games/boats/render.ts) is `p.w + 2` tile units measured from `FLEET_X = 0.5`, so a row may reach pixel (w + 1.5) tiles less the 0.25 trailing margin, while `computeSize` reports a canvas (w + 1) tiles wide. Worked by hand, not run: w=5 with fleet configuration 3,2 puts the second two-square boat at fx 5.25, so its right end is drawn to about 6.175 tiles on a 6-tile canvas. The test `fitsOnItsRow` in src/games/boats/boats.test.ts compares against `fleetRowLimit`, not against the canvas width, so it cannot see this.
- The same requirement says 'for every fleet configuration parameter validation admits', but a single boat longer than the row has no break available: validation allows a fleet size up to the larger of width and height, so a 2x9 board with a nine-square boat lays that boat out about 7 tile units wide on a 3-tile canvas. `fleetLayout` only wraps when `fx !== FLEET_X`.
- src/games/boats/render.ts header comment (the 'Two error layers' block) says the Check & Save overlay 'is a strict superset' of the live rule violations. That is the same claim the ledger marks untrue: a live FE_MISMATCH flag sits on a given square and a count error on the border number, neither of which findMistakes reports. The comment is stale; the code's behavior is sound.
- src/games/boats/generator.ts fleetFits doc comment says newBoatsDesc 'retries fleet placement in an unbounded loop', while newBoatsDesc's outer loop is bounded by retryLimit(MAX_GENERATE_ATTEMPTS). The inner `while (!generateFleet(...))` is the unbounded one, so the comment is imprecise, not a behavior defect.

### mathrax

- src/games/mathrax/hint-text.ts keeps wording for a `1÷` clue ('are equal' / 'matches') and its header says a hand-written description can hold one, but `clueNumRange` in src/games/mathrax/state.ts refuses a division clue below 2, so that arm is unreachable. Either the reader is stricter than intended or the arm and its comment are dead. Nothing changed.

### range

- Not a contradiction of a range rule, but found while checking the solver: `fullSolve` returns the first completion and never looks for a second, and Range declares neither `difficulty` nor `finishesByDeduction`, so `loadDesc` (src/engine/desc-error.ts) accepts a pasted Range desc that has several answers or needs search. `findMistakes` would then flag marks that fit the other answer, and the hint would stop at `DEDUCTION_EXHAUSTED`. Mines, Net and Rect declare `finishesByDeduction`; Range does not. Nothing was changed.
- The generator can deal a one-row or one-column board with no black square (see the untrue entry). If the 'at least one black square' guarantee is wanted on every grid, the code is the thing to change; I narrowed the spec to what the code does instead.
- src/games/range/state.ts parseDesc accepts '_' only directly between two clues and refuses it anywhere else. Upstream's validate_desc (../puzzles/range.c, line 1095) ignores '_' wherever it appears, and the old spec said 'exactly as upstream'. Upstream's generator never writes a stray '_', so no generated desc is refused, but a hand-written desc that upstream accepts is refused here. The rewrite corrected the spec to the code under an untrue row; whether the parser should be as lenient as upstream is the owner's call.
- src/games/range/solver.ts chooseBlackSquares can paint no black square on a 1xN grid (for example 1x3 when the only candidate is the middle cell), so newDesc can deal a board with no shaded square. The old spec required at least one on every board. The rewrite narrowed the rule to grids at least two squares each way, which is true of the code; it may be the generator, not the rule, that should change for strips.

### spokes

- "Erasing that line SHALL clear the mark it placed" (A diagonal line automatically rules out its crossing): `syncDiagonalBlock` in src/games/spokes/state.ts cannot tell whose mark is on the crossing. If the player marks a diagonal first, then draws the other diagonal of that square (allowed, since the crossing holds a mark and not a line), then erases the line, the player's own earlier mark is cleared too. The spec only promises clearing the mark the line placed; the code clears any mark on the crossing. Minor, nothing changed.

### dominosa

- src/games/dominosa/index.ts textFormat answers at every n, where the spec gives it for n < 1000 only. For a number of 1000 or more it writes Math.floor(num / 100), two characters, into one cell of the board array, so the text is misaligned. Game.textFormat may return null for params with no text rendering (src/engine/game.ts), and the game does not use that. The spec is kept and the code is unchanged.

### blackbox

- Possible, not certain: `executeMove` (src/games/blackbox/index.ts, case `toggleBall`) accepts a ball toggle on a locked cell, where the old spec's sentence sat among the `executeMove` rules. The input layer never produces such a move, so I read the rule as an input rule and corrected the spec rather than calling the code wrong; if the owner wants the executor to refuse it too, that is a code change.
- src/games/blackbox/hint-text.ts `HINT_MARKS.roles.ring` tells the player the ring marks 'the square to mark as known or to put a ball on or take one off', but the spec (old and new) requires that the hint's steps only ever add marks, and src/games/blackbox/hint.ts never emits a step that removes a ball (`moveTo` returns null for a ball already guessed; `layoutSteps` and `finish` only add). The legend's 'or take one off' describes a step that cannot occur; the spec looks right and the help-legend wording wrong. Not changed (outside the two files).

### separate

- src/games/separate/index.ts: the doc comment on hint() says it 'Refuses on a solved board or one carrying a mistake', but the function checks neither; the midend's computeHintPlan does. The comment describes another file's behavior.
- src/games/separate/hint-text.ts header says 'a lone square is named by its letter instead', but say.walledApart and say.basis name a lone square as a striped or outlined 'region'. Either the walled-apart sentence should name a lone square by its letter (as the old spec required) or the comment overstates; the spec now records what the code does.
- src/games/separate/state.ts validateParams also refuses k > 26 and k === 1 under full validation; neither the old nor the new spec states these, and I did not add them.

### pattern

- src/games/pattern/index.ts, the Ctrl/Shift+arrow paint in `interpretMove`: it emits a two-cell `fill` with no `onlyBlank`, so a keyboard paint stroke overwrites a mark the player already placed, while a pointer paint drag over the same two cells would leave it. The spec's `onlyBlank` rule is worded for a 'multi-cell paint drag' only, so this is not a contradiction of the letter, but it is against the stated reason ('never rewrites a mark the player already placed'). Nothing changed; the keyboard requirement keeps the old wording.

### clusters

- Unverified by a run (I was told not to run tests): the spec refuses a hint with a banner when placed tiles contradict the solution without breaking a local rule. `hint()` in src/games/clusters/index.ts returns CONTRADICTION_UNLOCALIZED only when the plan's verdict is INVALID; when the deduction from a wrong-tile position stalls UNFINISHED instead, it returns DEDUCTION_EXHAUSTED, and the midend (src/engine/midend.ts, around line 1173) throws on that for a game with no Unreasonable tier. solver.ts's own comment says a wrong-tile position 'can only end INVALID or UNFINISHED', so the stall case looks reachable and would throw where the spec wants a banner. I kept the rule's wording (the contradiction case) and narrowed the scenario to match the rule body; nothing in the code was changed.
- src/games/clusters/generator.ts: every FORCE_EVERY (100th) attempt re-randomizes every cell, while the spec (OLD and NEW alike) says the retry loop 're-randomizes only blank ones'. The spec sentence is a reason clause, not a SHALL, so I changed nothing; the spec is loose here more than the code is wrong.
- src/games/clusters/state.ts validateParams does not itself reject an out-of-range tier; the engine's paramsError rejects it from the paramConfig choice list before validateParams runs. The spec's 'rejected when the parameters are validated' is true of that, so nothing was changed.

### magnets

- src/games/magnets/state.ts `parseDesc`: the refusal a player reads for a bad game ID is "This game ID has a domino whose two halves don't point at each other." The requirement 'Magnets calls its pieces tiles when a player reads about them' scopes its body to hint sentences and the help page, so this is not a breach of the rule as written, but it is a player-read sentence that says 'domino' against the requirement's title. Nothing changed.
- src/games/magnets/render.ts header comment lists 'singleton black squares' among what is drawn, but the code draws a singleton as bare background (see the untrue row). I corrected the spec to the code because the code matches upstream's own early return; if a black square was actually intended, the code and not the spec is wrong. Nothing changed in source.
- The header comment of src/games/magnets/render.ts still says "singleton black squares", but drawTileCol returns before filling a singleton, so it is bare background (upstream's draw_tile_col returns the same way). The comment is stale, not the code; the ledger's untrue: row is right.

### abcd

- The firing census (src/games/abcd/abcd-ladder.test.ts `SHAPES`) walks every preset's grid size but not every preset: 7x7 with 4 letters is absent, and the diagonal board it walks is 6x6 n5 with clues removed, not the preset (clues shown). The spec's "every preset shape" is true only read as grid shape; I kept that reading ("every preset's grid shape") and changed nothing. If the intent was every preset's params, the census list is short by two.
- src/games/abcd/abcd-ladder.test.ts: the census corpus omits the 7x7 four-letter preset and deals the diagonal board only with clues removed, so it does not walk every preset as dealt, if that is what the spec's 'every preset shape' means.
- src/games/abcd/render.ts: the doc comment on computeClueErrors says 'over- or under-satisfiable', while the code flags a clue its line exceeds or can no longer reach. The code agrees with the rewritten spec; only the comment's wording is loose.

### engine-helpers

- Games that re-derive the pixel-to-cell mapping with a plain floor and no stated truncation reason, against 'A grid game imports the coordinate helpers': src/games/subsets/index.ts:311-312 (inline `Math.floor((p.x - Math.floor(ts / 2)) / ts)`, exactly the shared helper), src/games/signpost/render.ts:350-351 and 429-430 (inline floor with BORDER, though signpost/index.ts wraps the engine helper), src/games/pearl/render.ts:175 (own floor with a `-1` guard), src/games/rect/index.ts:163 (own unfloored division).
- src/games/netslide/index.ts:154 `cellAt` carries the C truncating-division idiom (`+ 2 * ts ... - 2`) that the spec and the geometry.ts doc comment say has no place; it equals `fromCoord(pixel, ts, border(ts) + 1)`.
- scripts/checks/engine-catalog.mjs lists only top-level `.ts` files of src/engine/ (`readdirSync` without recursion, filtered on `isFile()`), so modules in src/engine/grid/, combi/, color/ and testing/ are not held to 'an entry for every module under src/engine/'. The spec rule was kept as written.
- docs/games/engine-catalog.md § '`findloop.ts` — loop/bridge finding' lists Loopy as a consumer; Loopy does not import it, and Net (src/games/net/loops.ts) does and is not listed.
- docs/games/solver-and-generator.md § 'The deduction fixpoint' says 'Counting happens only where a budget does'; the runner also counts into a caller's `firings` tally with no budget.
- src/engine/geometry.ts says a game taking the Math.trunc override 'names this helper as the thing it is declining'; src/games/mathrax/render.ts (fromCoord) and src/games/blackbox/index.ts (fromDraw) truncate with a comment that does not name the shared fromCoord.
- src/games/group/render.ts fromCoord re-derives the mapping locally as Math.trunc((px + (ts - border - legend)) / ts) - 1, so that a legend click yields -1. That is neither the shared fromCoord nor the fold-onto-row-0 override, which geometry.ts calls 'the only way the two spellings differ'; it breaks both the old and the rewritten 'A grid game imports the coordinate helpers'. Spec left unchanged.

### filling

- Frame weight: the spec says the frame SHALL be as heavy as a border between two regions and no heavier. In src/games/filling/render.ts the frame is one ink line plus the edge cell's own border (bw + 1 pixels on every side), while an interior border between two regions is the left cell's BORDER_R (bw) plus the right cell's BORDER_L (bw + 1) = 2*bw + 1 pixels. At tile size 32 that is 2px against 3px: no heavier, but lighter, not 'as heavy'. Rule kept as written; my new scenario asserts only 'no thicker'. Read from the code, not measured in a browser.
- src/games/filling/render.ts: the frame looks lighter than an interior region border, not 'as heavy as' one. In drawSquare an interior border is the left cell's BORDER_R (bw px) plus the right cell's BORDER_L (bw+1 px), so 2*bw+1 px. A board edge is one cell's own border plus at most the frame's single line, so bw+1 px on every side. At the preferred tile size of 32 (bw=1) that is 3 px inside against 2 px at the edge. Worked out from the code, not measured in a rendered frame.

### mines

- src/games/mines/index.ts `hintMarks.roles.ring` tells the player a ringed square may be one whose "flag must come off", but no hint step ever removes a flag: `MinesHint.kind` in src/games/mines/hint.ts is only `open` or `flag`, and `legsOf` notes the midend refuses a hint while a flag sits on a safe square. The spec (hint rings squares that must be safe or must be mines) looks right and the role's wording stale. Nothing was changed.

### untangle

- "Every layout SHALL be exact rationals, checked crossing-free with the game's exact crossing test before use": `fromEdges` in src/games/untangle/solution.ts returns its last fallback (the shift drawing on integer grid points) without running `isUntangled` on it, after the relaxed and the plain stretched layouts both failed the check. It is exact and crossing-free by construction, but it is the one layout that reaches Solve and the hint unchecked. Nothing changed.
- src/games/untangle/solution.ts `fromEdges`: the last fallback (the integer shift drawing returned when both the relaxed and the stretched layouts fail `isUntangled`) is returned without the exact crossing check, while the spec (OLD and NEW) says every layout SHALL be checked crossing-free with the game's exact test before use. `solve` in index.ts does not check it either. The comment argues integer grid points need no rounding, so it is likely correct by construction, but it is not checked as the rule requires.
- src/games/untangle/solution.ts `fromAux`: when the scaled aux layout fails the crossing check it falls back to the unscaled `raw` layout, so the aux layout is not always 'scaled to fill the play box' as the spec says. Spec left as is.
- src/games/untangle/hint.ts `bestClearing`: a spot is tested for its gaps with `isClear`, then moved by `land` up to an eighth of a unit to a landable spot without the gaps being tested again, so the spot a clearing step actually moves to may be slightly inside the gaps the spec says it SHALL keep. Spec left as is (the wording is OLD's).

### sixteen

- Not confirmed either way: 'a plain slide arrow has the same fill in both' Sixteen and Netslide in the dark scheme. Sixteen's arrow is `mkhighlight(...).lowlight` (background shifted toward black by a fixed distance) and Netslide's is `netslideLowlight` = `scale(background, 0.8)` (src/engine/color/palette-games.ts). The two coincide on a background of 5/6 gray (the light scheme on a white host) and differ on other backgrounds unless the dark-scheme resolution equalizes them. I found no test that compares the two fills, and I was told not to run anything, so the rule and scenario are kept as written. Worth one measured check.
- narrateStep (src/games/sixteen/index.ts) falls back to the lowest-numbered tile on the moved line when every tile on that line is already home; the spec, OLD and NEW, says the highlighted tile is the lowest-numbered out-of-place tile on the moved line and has no such case. The code is probably right and the spec incomplete; nothing changed.
- The drag requirement (unchanged from OLD) says a slide executes 'if the drag distance exceeds half of a tile width'; interpretMove uses Math.round(dist / ts), so a drag of exactly half a tile also executes. A boundary difference only; nothing changed.

### pearl

- /Users/yoni/personalCode/simon-tatham-puzzles/puzzles-ts/src/games/pearl/generator.ts: the doc comment on newClues says it follows new_clues 'including ... the 5x5-Normal->Easy downgrade', but the function passes params.difficulty through unchanged and has no such downgrade (validateParams refuses a Normal board with w + h < 11, so the case is unreachable). The comment is stale; the same file's header also says 'Byte-match critical ... equals the C output', which reads as a retired promise.

### net

- src/games/net/index.ts decodeUi: restores the origin and the source from a save with no range check against the grid (its own comment says the hook gets no state to check against), so a save from a different-sized board could place them off the grid. The spec only requires that both survive a save, so nothing in the spec changed.

### signpost

- src/games/signpost/render.ts `tileRedraw`: the error color is applied only when `f & F_ERROR && !(f & F_IMMUTABLE)`, and the number's color is the only thing the error bit changes. `findMistakes` flags the cell a wrong link leaves from, so a wrong link dragged out of a given (for example from the 1) is flagged by Check & Save and draws nothing red. The scenario 'A wrong link renders red' is kept as it was. Found by reading the code, not by running the app.

### mosaic

- src/games/mosaic/state.ts and src/games/mosaic/solver.ts: comments still call the marks "black" (file header of state.ts, `populateCell` doc in solver.ts) while the spec and the rest of the code say marked and blank. Comment wording only, no behavior.
- src/games/mosaic/index.ts file header says "aligned drags paint the click's mark across a straight run", which describes the retired paint gesture; the game now makes no `paint` move and a drag is the engine's sweep in any direction. Stale comment, the spec is right.

### project-identity

- "Errors that never open the dialog are never sent" (kept unchanged, now in "Consent is enforced at the reporting SDK's transport"). src/utils/report-consent.ts holds every non-feedback envelope in one in-memory list and release() sends all of it. An error the crash dialog ignores (the ignoreErrors list or third-party code in src/dialogs/crash-dialog.ts reportError, which returns without opening the dialog) can still be captured by the SDK: src/utils/sentry.ts says its own ignore list is shorter on purpose ("we don't want to show the crash-dialog but we *do* want Sentry capture"). Such a report stays held, and goes out when the player presses Send report on a later, different error, unless a dialog close or reload discarded it first. I read the code only and did not reproduce it in a browser. Privacy-relevant, so I left the rule as the spec had it instead of weakening it.
- The source comment at the top of src/project-identity.ts says "Outside the About dialog no surface names another project", while unsupported.html names Simon Tatham and Mike Edmunds and help/index.md credits the lineage. The spec (header and page titles name no other project, lineage credited in the About dialog and the origin help pages) is the narrower and correct statement, so the comment overstates it.
- src/assets/privacy.html, unsupported.html, public/404.html and help/index.md, help/install.md, help/puzzles.md each write 'Hintful Puzzles' literally rather than reading APP_NAME, so a rename is not one edit as src/project-identity.ts's own header comment claims ('Every surface that shows it ... reads it from here'). The spec was corrected to the code per the ledger's untrue row; the header comment in src/project-identity.ts still overstates.
- src/project-identity.ts header comment says 'only the product name reaches a player', while aboutBlurb in src/dialogs/about-dialog.ts shows the repository address 'github.com/hintful-puzzles/hintful' as link text. Harmless, but the comment is not literally true.

### fifteen

- Possible, not confirmed: the old spec reserved the 'home' wording for a tile the solver will not disturb again, while `narrateFifteenStep` (`src/games/fifteen/index.ts`) says 'slide tile N into place' for any slid tile that lands in its solved cell. A tile not yet placed by the greedy order could pass through its home cell while another tile is the goal and be narrated as placed, then be moved again. I read the code and the tests (`fifteen.test.ts` asserts only that an 'into place' step lands the tile in its solved cell) but did not run a sweep to find such a step, since the brief forbade running tests. I corrected the spec to the code and filed an `untrue:` row; if the owner wants the old guarantee, the code needs a check that the cell is already settled.

### pegs

- openspec/specs/pegs/spec.md says a hint's 'rings, outline, stripes and arrows SHALL be drawn beside the peg' (OLD said the same). In src/games/pegs/render.ts drawTile, arrows are drawn last through drawMoveArrow from the jumping peg's center to the hole's center, under the comment 'Laid over the peg each jumps', so an arrow crosses the jumping peg and the jumped peg. Stripes are hatched on the cell face before the peg is drawn, and rings sit in the margin. Either the arrows or the spec's 'beside' needs a decision; I changed neither.

### flood

- The line between two regions, and the frame round the field, have zero width at any tile size under 32. `sepWidth` in src/games/flood/render.ts is `Math.floor(ts / 32)`, `drawTile` draws the separators only `if (sep > 0)`, and `drawFrame` is then exactly covered by the tiles. The midend picks the largest integer tile that fits (`largestTile` in src/engine/midend.ts) and src/puzzle/components/view-interactive.ts says the puzzle runs in standard (CSS) pixels, so a 12x12 board in a slot narrower than about 416px, or a 16x16 one under about 544px, would be drawn with no line between regions, against the spec's "two adjacent tiles of different colors are separated by the grid line". Read from the code only; I did not run the app (the task forbade it), and the render test pins only tile size 32. I kept the spec's rule unchanged.

### licensing

- The spec says the About dialog SHALL name 'under what license' each bundled package is. `src/dialogs/about-dialog.ts` renders an entry's `license` field only as a fallback when `notice` is null; otherwise the license is named only by the notice text itself. In today's `dist/dependencies-app.json` every one of the 24 notices does name its license, so nothing is visibly wrong, but a package whose NOTICE file names no license would be shown without one. Rule kept as written.
- The spec says the About dialog SHALL name who publishes each bundled package. `assertNoPlaceholders` in `vite-plugins/dependency-notices.ts` lets an entry through with no attribution when its notice has a copyright line, and the dialog then shows nothing beside the name. All 24 entries in today's build have an attribution. Rule kept as written.
- Spec (old and new): the About dialog's third-party section SHALL name, for each bundled package, 'under what license'. src/dialogs/about-dialog.ts:396-415 destructures `license` but renders it only in the fallback `${license} license (no license text provided)` when `notice` is null. Where the notice is a package's NOTICE file or a filled-in Apache appendix line (vite-plugins/dependency-notices.ts:109 and :120, e.g. 'Copyright 2017 Google Inc.'), the entry shows the name, attribution and that notice, and the license is named nowhere. Spec left unchanged; recommend rendering `license` in the entry summary.

### puzzle-icons

- src/asset-integrity.test.ts: the describe block that asserts catalog completeness is titled "every cataloged puzzle has its generated icons", while the spec (and the code) say the icons are committed, never generated. The assertion itself is right; only the title is stale.
- .gitignore: the comment above the TypeScript build-info rule carries history the spec no longer holds ("There is no scripts/build-icons.sh — the GTK screenshot pipeline it named was deleted by drop-icon-generation"). No ignore rule is wrong; the comment is a retired instruction with a change id.
- src/asset-integrity.test.ts line 209: the describe title reads 'every cataloged puzzle has its generated icons', while the spec requires the icons to be committed, not generated. The assertion itself is right; only the title is stale.

### random

- Comments only, no behavior: the header of src/engine/random/index.ts says identical streams are 'what keeps shared game IDs reproducible', and src/engine/random/random.test.ts says a mismatch 'changes every shared game ID - never acceptable'. Both repeat the reason found untrue above (shared IDs are params:desc and the app hands out no seed). Nothing was changed; the two comments want rewording to the stream-stability reason.

## Left unresolved by a reviewer

### repo-layout

- Spelling guard exemptions: `scripts/checks/spelling.mjs` EXCLUDED also drops binary assets (png/ico/jpg/webp/woff) and every `.c`/`.h` file anywhere, not only C under a change's `reference/`; and under `licenses/` it excludes only the two LICENSE files, not `licenses/README.md`. NEW (like OLD) says 'every tracked file outside the exemptions' and 'the files under `licenses/`'. I left the wording: the binary exclusion is not a spelling rule and the licenses wording is qualified by 'which this project renames'. Needs a decision only if the list is meant to be exhaustive.
- NEW scenario 'The tool parsed nothing' (rename-shape): on an empty diff `scripts/check-rename-shape.mjs` prints 'no changes in the working tree.' and exits 0 rather than printing a zero inspected count. I judged that as satisfying 'says that no lines were inspected' and left it; a stricter reading would want the count line printed.
- No `guide:` or `held:` destinations exist in this ledger, so there were none to open. All 13 `untrue:` rows were checked against the tree and hold (root files, metrics/ contents, src/engine subdirectories, vitest setupFiles for fake-indexeddb, renderScenario's single game id, docs/ listing, AGENTS.md wording, three named layering exceptions, HINT_GAMES derived by filter, spelling tooling self-exclusion, capability names as a citation home, the no-letter choice-name skip, native paths in the archive).

### engine-hints

- Guide disagrees with the spec, and I could not edit it: docs/games/hints.md § "Refusal wording comes from one module" says Fifteen, Sixteen and Netslide each check their tiles and say `ALREADY_SOLVED` from their own hint. The spec (old and new) says `ALREADY_SOLVED` is the midend's alone and not a `HintRefusal`, and the `HintRefusal` union in src/engine/hint-refusal.ts bears the spec out. The guide paragraph looks stale.
- Guide wording differs from the spec: docs/games/hints.md § "Keep the narration terse" calls the narration ledger's unit 'the `(entry, game)` listing'; the spec (old and new) says `(entry, game, rung)`. The ledger row citing that section as a guide for 'keyed by entry alone the reverse direction passes on one game's strength' holds for the reason, but the guide's unit is one field short.
- 'A completed verdict vouches for the rest of the plan' turns OLD's descriptive sentence ('A game returning "completed" is asserting that the resulting state matches the plan's expectation') into 'A game SHALL return it only where that holds'. I left it as the obligation the assertion implies, since a requirement needs a SHALL, but it is a SHALL the old text did not spell.
- The untrue row for the `_BOLD` rule stands on the code (`HINT_ACTION` is base `BLUE`, `HINT_EVIDENCE` is `TEAL_BOLD`), so the bold step is now required of the evidence mark alone. Base BLUE's lightness does differ slightly between schemes (0.57 light, 0.62 dark), so the ring meets the old rule's first half but not its '(a `_BOLD`)'. The palette comment and the guide both call the emphatic base blue deliberate, so I treated the spec as the stale side.

### ts-engine

- No binding rule was found lost in the rows dropped as history, figure or reason. All six original `untrue:` claims hold against the code (no checkpoints in `SaveEnvelope`; `resolvePalette` shifts the background; `show-timer` added for every game; Untangle reports four items; `TEST_ONLY_CONSUMER` is empty; `afterTransition` clears overlays on a UI-only update). All five `held:` texts are present in their files. There are no `guide:` rows.
- NEW's envelope list adds 'the cursor in it', which OLD's body did not list. It is true of the code (`pos` in src/engine/save.ts) and implied by OLD's round-trip scenario (redo availability), so I left it; it has no `untrue:` or separate ledger row.
- New scenarios written for split requirements were checked where doubtful and left as written: `restarts` lists position 4 after three moves and a restart (midend `emitStateChange`), a load re-applies retained preferences (`applyPrefs` in `begin`), `getPreferences` answers only for a started game, and the enrollment helper reads each game's `newUi` result (`BuiltGame.ui`).
- Misfiled but kept, as the brief requires: the reference-panel requirements (app shell) and the Untangle preferences requirement (a single game) sit in ts-engine.

### build-pipeline

- All six untrue: rows hold against the code: testTimeout is 3_600_000 in vitest.config.ts; the hook sets GATE_BIOME_STAGED and GATE_PRECOMMIT; metrics/ holds more than the two listed instruments; PRECACHE_IGNORES and NOT_PRECACHEABLE are two declarations; SEARCH_REACH_GAMES also takes searchRefusal( callers; public/robots.txt is copied into every build.
- Left as rewritten, for a decision if anyone objects: three old permissions (MAY) are now statements of what the hook does ('skips vitest run and vite build only when...', 'runs only the test files a commit can have broken', 'The one narrowing it takes is...'), and 'A cross-game sweep MAY do less work... where' is now 'SHALL do less work... only where'. Each matches scripts/gate.sh today and adds no condition.
- Left as rewritten: two old statements of fact are now SHALLs: 'the gate invokes node directly' for the probe check (true, scripts/gate.sh line 105), and 'keying the excuse on the planner left such games unexcused' became 'the excuse SHALL NOT be keyed on the planner'.
- Dropped permission filed as reason: 'a pull_request trigger MAY be added later if a contributor PR flow is adopted'. No obligation went with it, but 'reason' is the nearest destination and not an exact one.
- 'Which test shapes the gate guards is decided by measurement' still says the two rejected candidates 'caught none of the corpus'. That is a measured result kept in a body. I left it because it is what records that those shapes were tried and refused.
- The scenario 'A test is made cheaper' (still discriminates, shown by breaking the code) sits under 'The commit gate's cost is proportional to what it protects', though it speaks of 'the three treatments', which the next requirement states. It is that requirement's only scenario, so I did not move it.
- I did not confirm that spec-ledger.mjs checks a guide: heading exists; the repointed row passes the check either way, and I read the section myself.

### app-shell

- The 'only behind a preference' wording is my reading of the old MAY sentence (permission conditional on the preference). If the owner reads the old sentence as pure permission with no restriction, the clause should be dropped instead; the code today does gate bare letters on a preference (src/puzzle/shortcuts.ts header).
- The draft-label scenario lost its named example and its two-feature case: OLD named Net with 'Hints and Checking for mistakes'; Net now has both a hint and findMistakes (src/games/net/index.ts lines 835, 846), so the untrue row holds, and NEW's generic 'a game that has no hint ... Hints are still to come' is true of the label code (src/components/catalog-card.ts, src/engine/sections.ts). I did not look for a currently registered game lacking two sections to restore a two-feature case.
- 'about 34rem' to '34rem' is filed as `untrue:`; it is a sharpening rather than a falsehood (SHORT_BELOW_REM = 34 in src/puzzle/layout.ts confirms the figure). Left as the rewriter filed it.
- New scenarios checked by reading code, not by running the app: URL id warning ('Ignoring invalid id in URL', puzzle-screen.ts), Escape clearing a reference spotlight while still reaching the game (handleBubbledKeyDown plus view-interactive.ts with no preventDefault or stopPropagation), Backspace sending 127 (puzzleKeyMap), mouse press on an on-screen key (mousedown preventDefault in keys.ts), back link accessible name 'All puzzles', Check & save tooltip carrying its chord (bar.ts title). 'A chosen size ... remembered type is still the 5x6 preset' and 'A dialog opened from a control is closed' rest on the rule's own sentence and a code comment; I did not trace them end to end.

### engine-input

- NEW names things OLD left unnamed: the canonical Ui field `cursor`, the builders `colorKeys` and `colorKeysZeroIsTen`, and `dragMarkVerbs`. Each is true of the code (CURSOR_FIELD = "cursor" in src/engine/cursor-vocabulary.test.ts; the exports in src/engine/key-labels.ts and src/engine/target-verb.ts), so I kept them as contract names. Strictly they are additions to the text; needs a decision if the rewrite must add no names.
- The dense-sweep rule ('dense enough to land on live targets, fails when no probe reaches one') belonged to the touch-equivalence sweep, which no longer exists. NEW restates it for every board sweep in 'A probe sweeps what could differ'. probePoints in src/engine/testing/input-probe.ts is that dense, and the guards I read carry vacuity assertions (input-parity.test.ts, target-verb.test.ts), but I did not confirm that every consumer of probePoints fails when it reaches no target.
- OLD's scenario 'An arrow that acts on the board still reveals first' was unconditional while its body said MAY. NEW reconciles them by adding 'in a game that reveals before acting' to the scenario and 'SHALL NOT be required to act' to the body. I judged that faithful to the body and left it; it does narrow the old scenario.
- Scenarios new in NEW were checked against code only where doubtful: digitKeys(3), colorKeys(4, firstColor), Net's two routes, and the Marks key in Midend.requestKeys all hold. The rest ('A two-step game is heard', 'The first select only shows the cursor', 'A fast drag takes what it passed over', and similar) restate their rule's body and I did not run them.

### engine-candidate-hints

- The largest untrue correction stands, but it is the one to look at: OLD 'Obvious candidate strikes precede a classified placement' (a plan has struck every stale note before it classifies a placement, and Group runs the cleanup ahead of its placement arm) became 'notes are read as written, stale or not, and the stale notes are struck before any recorded strike'. The code bears this out: CandidateWalk.run offers the opening (singles and own rungs, Group's leads rung included) before each setUp.step(), and OLD's own scenario 'a stale note still lets a single go first' says the same. A stale note can only hide a single, never invent one, so no false narration follows. No Group test covers the stale-note case either way.
- 'A hint with no Ui takes the game's reading' is true only because each game's hint passes ui ?? newUi(state). candidateHint itself, given null, falls back to DEFAULT_CANDIDATE_READING (populate). Salad and Crossing pass null, which is harmless today since neither offers the reading preference.
- The premise guard in src/engine/firing-replay.test.ts also holds an UNREPRODUCED ledger and a SHORT ledger that neither OLD nor NEW mentions. Left out, as the rewrite adds no rules.
- Not individually exercised against code: the new scenarios 'Two histories of one board hint alike', 'The walk a sentence names is on the board' and 'Towers words its own singles and shares a chain'. Each restates its rule and matches the source I read (the frontier keys only on the plan's steps, Towers imports forcingChainPremise), but I ran no test for them.

### engine-params

- OLD 'A game MAY express a generation-only bound by gating it on `full`' is NEW 'A game SHALL express a bound that holds only when generating ... by gating it on `full` in its `validateParams`'. I left it: with OLD's 'A generation-only limit SHALL NOT move into `bounds`' the gate is the only place such a bound can live, so nothing new is required in practice, but it is a permission turned into an obligation.
- OLD 'The `Game` interface SHALL define an optional declarative `paramConfig`'; NEW drops 'optional'. The field is still optional in the type (src/engine/game.ts, `paramConfig?:`). I left it because 'No game ships an empty custom-params dialog' requires every registered game to declare one, and NEW keeps 'For a game with no `paramConfig` the form SHALL be empty'.
- The ledger's untrue row for the scenario 'A description the generator wrote' ('`validateDesc` accepts it' became 'the description loads') is a strengthening, not a correction of something false: `validateDesc` does accept such a description. The stronger claim is what the guard asserts (`loadVerdict` in src/engine/desc-error-games.test.ts), so I left spec and row as they are.
- NEW adds 'that title SHALL then be its label and its line' for a named preset leaf, under an untrue row. The code bears it out (`menu.title ?? describeParams(game, params)` in src/engine/param-label.ts, and the guard compares the name with `describeParams`), but it is an obligation OLD did not state in those words.
- Guide wording differs from OLD on one figure the ledger sends there: docs/games/mechanics.md § 'Codecs and validation' names Dominosa alone for the tail loop where OLD named Dominosa and Mines, and Solo without 'symmetry and difficulty'. The row is a dropped figure, so no rule is lost; the guide was not mine to edit.

### ts-migration

- The guide no longer holds the reason an exhausted retry bound is answered and not refused up front (a game whose parameters are a list, or several numbers at once, has corners no refusal could name). The brief says to report a missing reason, not write it: it belongs in docs/games/solver-and-generator.md § "A size that cannot carry a tier".
- The rewrite changed 'Acceptance SHALL require the owner to exercise the actual behavior' to 'that its actual behavior be exercised', with an `untrue:` row. docs/work-management.md § "What the owner accepts" and AGENTS.md bear it out, so I left it, but it changes who does what and is worth the owner's eye.
- The rewrite changed 'seeds produce reproducible boards across builds' to 'a game ID the engine hands out names its board (params:desc) on every build', with an `untrue:` row. app-shell 'The app hands out boards, never seeds' and 'A seed ID still deals a game' and docs/doctrine.md § "Upstream" bear it out, so I left it. It narrows a compatibility promise in this spec to match those.
- The new scenario 'A tier generates nowhere and says nothing' is true of the guard as written, but the guard in src/engine/difficulty-contract.test.ts treats a tier as generating when `validateParams` accepts it at some preset; that case does not deal a board. OLD's wording 'generates or is refused' had the same gap, so nothing was changed.

### engine-colors

- 'The pair's colors keep off the marks' hues' still lists 'the orange a hint outlines premises in', carried verbatim from OLD. No hint role is orange today: HINT_EVIDENCE is TEAL_BOLD, HINT_BLACKREF is GREEN, HINT_WHITEREF is PINK (src/engine/color/palette.ts). The rule holds as written (TWO is PURPLE and YELLOW), but the list names a color no hint uses. Left unchanged, because replacing it with teal, green and pink would be a stronger rule than OLD stated. Needs a decision: is orange still reserved, or should the list name the hues hints use now?
- 'A color is a shared role only where two games mean the same by it' gained a concrete form OLD did not state: declared 'in the engine's table of game-local colors, under a name that begins with the game's id', plus a scenario that the suite fails when another game imports it. Both are true of the code (palette-games.ts, and the ownership test in palette-source.test.ts) and are recorded under the untrue row for the enumerated-set rule, so I kept them. It is an addition all the same; a game's own color taken directly from colors.ts (a named color) is not in that table.
- 'A cross-game check finds an unexplained departure' was narrowed by the rewrite to cursor, held, drag and hint slots, to match the test. The companion requirement still obliges a stated reason for all eight meanings (mistake, black or white piece, retired clue and completed region included), so four meanings now have a rule and no check. I kept the rewrite, since the test header documents keying on the slot name as deliberate; whether to widen the check instead is the owner's call.

### loopy

- All three `untrue:` rows hold against the code: a plain arrow moves the cursor (`walkEdge`, `moveCursor`); Honeycomb 10x10 and Floret 5x5 presets do not turn and keep upstream's size; only Triangular 9x14, Kites 4x6, Dodecagonal 3x6 and Hats 9x11 are presets of non-turning tilings, and Compass-Dodecagonal `turns: true`. The five dropped sizes (Great-Hexagonal 4x5, Kagome 3x6, Great-Dodecagonal 3x6, Great-Great-Dodecagonal 3x5, Compass-Dodecagonal 4x5) are now recorded nowhere; if they were meant as recommended Custom sizes, that is an owner decision.
- 'entries MAY be appended' became 'a new entry SHALL be appended at the end', as the brief's no-MAY rule requires. Left as is: it adds nothing beyond the kept 'SHALL NOT be reordered or inserted'.
- The old figure 'at most nine' unwalkable edges on Penrose kite/dart is now 'no more than the pinned residue' and filed as `figure`. The number lives only in the test and in the header comment of src/games/loopy/cursor.ts; the ledger has no `held:` pointer for it.
- Not verified by running anything: the 3x14 Penrose (rhombs) scenario's premise that no patch exceeds half the usual count (carried from the old scenario's title), and the added scenario 'A note at the rim is drawn whole'.

### engine-notes

- OLD 'A game may not rename its move discriminator to suit the engine, because the save format replays the move log' reads either as a prohibition or as the reason the dialect exists. NEW states it as 'A game SHALL NOT rename its move discriminator'. I left it; the owner may prefer it as a reason clause.
- The 'One way into note-taking' requirement now speaks of 'a game that takes notes' where OLD said 'a game whose Ui carries pencilMode' (ledger row marked untrue:, citing takesNotes in src/engine/key-labels.ts). By a source grep the two populations are the same today: every game with a `pencil` array also has the flag. So this is a reconciliation with the later Marks-key requirement, not a correction of a false rule. Left as written.
- The sizing requirement 'The pencil-mode indicator is legible against the canvas and never covers the board' keeps its old title, but its 'never covers the board' half now lives in 'A game reserves the indicator's reach at every tile size'. Title left because the ledger and other documents may cite it.
- All eight untrue: rows were checked against the code and hold (Group has no sticky preference; no arity ledger in mark-all.test.ts; repaintPencilIndicator takes no first-frame flag; the Mark-all control is a wa-button in game-controls.ts and no wa-button-group remains; Solo's regionsOf returns a Killer cage; a narrowed cell keeps its notes; Map and Abcd clean by their own rule; takesNotes also reads the pencil array). I verified by reading the sources only; no tests were run.

### engine-drawing

- All six `untrue:` rows hold against the code: recessed wedge sides (highlight pentagon holds bottom-right, lowlight top-left); only fifteen/sixteen/twiddle call drawRecessedBorder; only fifteen/sixteen call drawRaisedTile; crossing/render.ts calls no bevel helper; drawRectOutline has a seventh `thickness = 1` argument; there is no setDrawingFontInfo in src/puzzle/worker-adapter.ts. All three `held:` texts exist in their files.
- The scenario "A pressed-in tile swaps the two colors" now names no game, because no game in the tree draws a pressed-in tile through the helper (Crossing draws no bevel). It is kept as OLD had it minus the example; whether a scenario with no live instance should stay is a decision for the owner of the change.
- src/puzzle/worker-adapter.ts also calls forceRedraw on the FIRST palette install, not only on a replacement. OLD did not state this and I did not add it; the spec is silent on a behavior the code relies on (a deep link otherwise leaves the canvas blank, per the comment there).
- OLD's hint-walk permission "That walk MAY paint only the frame each event leaves and the frame it settles to" is in NEW as "SHALL paint the frame each event leaves and the frame it settles to, and is not required to paint the frames between". This turns a permission into an obligation to paint those two frames; I left it because the brief bans MAY, OLD's scenario "A frame a plan wins on" already requires the walk to paint that frame, and the code (`jump` in src/engine/testing/repaint-differential.ts) does exactly this.
- Obligation count is approximate: about 120 clauses across 12 old requirements and 31 old scenarios.

### guess

- The other 12 untrue rows were checked against src/games/guess/{index,state,render,hint}.ts and src/engine/{params,desc-error}.ts and hold: eight Game type arguments; bounds on paramConfig rather than validateParams; no game validateDesc; board height includes the 1.5-tile answer row; status line reports the outcome once over; restCursor's fallback slot; the hold toggle on the RIGHT_BUTTON press; the hatched (striped) row; the SEARCH_OUT_OF_REACH refusal; a right-button release selecting an answer slot; findMistakes reporting a rule-out of the code's color; notes-mode keys declined with no cursor.
- New scenarios were checked by reading the code, not by running it (I was told not to run the suite). Read as true: registry without textFormat, eleventh color refused naming Colors, blank peg throws, Solve plays the answer, first key of a fresh board, Submit on an empty row, filling the last slot waits, tap on a color block, right click toggles a hold, full unsubmittable row keeps the cursor on a slot, color key on a full row, held finger over the feedback pegs submits, two answers behind the same rows, every fitting answer survives, lost game has no hint, six colors are 2 across by 3 down, same mark move twice, notes mode with no cursor shown, a hint-framed color still drawn whole.
- newState also refuses a desc that repeats a color when allowMultiple is false (DESC_REPEATED in parseDesc, src/games/guess/state.ts). Neither OLD nor NEW states it; I did not add it, since the rewrite is to change nothing required. Decision: whether the spec should hold that rule.
- NEW 'Guess SHALL NOT declare ignoresSecondaryButton' is a SHALL NOT made from OLD's 'Guess cannot turn that promotion off with ignoresSecondaryButton, because its right button genuinely means something'. It is true of the code and I kept it, but it is a prohibition where OLD had an explanation.
- In notes mode the keys 'D' and 'd' still rub out a working-row peg (only isEraseKey is diverted to clearMarks in src/games/guess/index.ts). The spec, old and new, speaks only of 'the erase key'; left as is.

### crossing

- Both OLD and NEW say 'Selecting a cell SHALL indicate which clues can still go in either run through it' with no condition, but redraw in src/games/crossing/render.ts computes selCell only when the selection is showing and not in pencil mode, so a cell selected for pencil marks gets neither the run wash nor the list coloring. The rewrite did not change the rule and its ledger has no untrue: row for it; I left it as OLD had it. Needs a decision: narrow the rule to 'selected for digit entry' (as the rewrite already did for clue placement) or treat it as a code gap.
- OLD 'a clue number longer than the maximum row length' is filed as spec: 'A Crossing description is validated against its board', where NEW says 'longer than 9'. parseDesc uses the fixed MAX_NUMBER_LENGTH = 9, and the old rule is only covered in effect by the one-for-one match of clue lengths to run lengths in the same requirement. I left the row; it could instead be an untrue: row.
- NEW adds the word 'area' to the generable-maximum rule ('any board whose area is larger than the generable maximum'); OLD said only 'any board larger than'. It is true of validateParams (w * h > MAX_AREA) and I left it, but it is a specification the old text did not make.

### solo

- OLD and NEW both say a left-click 'highlights a cell for a real entry'. With sticky pencil mode on and pencil mode latched, applyPress in src/engine/note-taking-cell.ts leaves pencil mode on, so the left-click highlights for a pencil mark. Left as OLD had it since no ledger row claims it untrue; it wants an untrue row or a decision.
- NEW 'Solo refuses parameters outside its bounds' lists three refusals of validateParams (over 31 digits, killer not below 10, X below 4). The code in src/games/solo/state.ts also refuses tiers that do not exist on tiny grids (2x2 and 2 or 3 Jigsaw above Easy, 4 Jigsaw above Tricky, 2 Jigsaw Killer) in full mode. OLD never stated these, so they were not added; the spec is silent on a player-visible refusal.
- OLD and NEW both require 'each step' to carry a narration that leads with the firing region; the populate, clean and note steps of the walk lead with no region. Kept as OLD had it.
- The ledger's untrue rows were all borne out by the code (eight Game type arguments, validateParams and the engine's bounds and choices, select and space keys, adaptive mark-all, no completed flag, undashed cage outlines, indicator on ui.pencilMode, keep-highlight default on, implicit reading, cage in regionsOf, 'must be N' wording, stripes/ring/outline roles, midend refusals, pencilAdd, keep-track verdicts, killer boards without givens, hatch inside the tile). Both guide destinations (docs/games/hints.md 'The quality bar' and 'The element-type color legend') and the app-shell requirement 'Checking a board never costs a player their checkpoint' say what the rows claim. No ledger edit was needed.

### bridges

- Decision needed: the code's second `CURSOR_SELECT` (and any `CURSOR_SELECT2`) also toggles the island's completed mark, the keyboard's only way to mark an island (`interpretMove` in /Users/yoni/personalCode/simon-tatham-puzzles/puzzles-ts/src/games/bridges/index.ts). OLD never required it, so I took it out of the rewrite. Likewise unspecified: Ctrl+arrow as a bridge drag, digit keys jumping the cursor, and `g` toggling the possible-bridge lines.
- Kept under the `untrue:` row for the description refusals: NEW lists three refusals OLD did not name (a desc that stops short of the grid, two orthogonally adjacent islands, fewer than two islands). All three are in `parseDesc`, and the grid-edge check OLD claimed does not exist. They are new obligations, accepted as the correction of a false list.
- OLD and NEW both omit two things the code does: Easy's stage 1 also runs the 'every neighbor' rule (clue greater than (neighbors - 1) x `maxb`), and the live-error red also covers a finished group cut off from the rest (`G_WARN` from `mapGroupCheck`). Not added, since the rewrite must add nothing.
- Not checked against code: that the midend, and not the game, refuses a hint on a solved or mistaken board. I did not open the engine's midend; the wording is carried unchanged from OLD.
- The count of 120 old obligations compared is an estimate of clauses, not a tally. No `guide:` or `held:` rows exist in this ledger, so there were no destinations to open.

### galaxies

- Restoring 'unreasonably large' keeps OLD's vague upper bound; the code's bound is 100 (paramConfig in src/games/galaxies/index.ts). Stating the number in the spec is a decision for whoever owns the change, not a rewrite.
- NEW keeps the qualifier 'A press that did not become a drag' on the far-release rule, where OLD said 'A press that ends far from where it began SHALL commit nothing at all'. I left it: OLD read literally would forbid every drag, and the code comment at the release branch states the same qualifier. It is a narrowing by interpretation and is flagged for a decision.
- validateParams also refuses a 3x3 Unreasonable board (noSuchTier). Neither OLD nor NEW states it; I did not add it because it has no source in OLD.
- The ledger files the solver's technique list (solver_obvious, lines-opposite, spaces-oneposs, expand-from-dot, extend-exclaves) as history. I accepted it as upstream's private names, but NEW no longer says which deductions the chain contains.
- OLD and NEW both say the offer check depends on the dot layout alone, and both list 'a tile inside a locally valid region' as uncommittable; okToAddAssocWithOpposite in src/games/galaxies/moves.ts does refuse on the completion colors, which depend on the player's walls. The tension was in OLD and is carried unchanged.

### tracks

- The requirement 'Tracks refuses a grid under 4x4, and a 4x4 above Easy' states a refusal OLD never had (OLD said a 4x4 at Normal/Tricky falls back to Easy). The code bears the refusal out (state.ts validateParams with noSuchTier; generator.ts has no fallback), so it stands as an untrue correction, but it is a player-visible rule entering the spec through the rewrite and the owner may want to know.
- The Easy byte-for-byte match with upstream now lives only in the scenario 'Easy boards are unchanged', as it did in OLD (whose body spoke only of the test). I did not promote it to a SHALL, since the project doctrine says changing which board a seed deals breaks nothing; say if it should be a body rule or dropped.
- Not run, per instructions: the test suite. The new scenarios were checked by reading the code (index.ts, state.ts, solver.ts, hint.ts, generator.ts, render.ts, engine params.ts, desc-error.ts, midend.ts), not by executing it. 'A drag repaints only the squares its preview changes' and 'Select on a cell border toggles the edge' were judged from the tile-cache diff and flipAt/edgeFlipMove without opening edgeFlipMove's body in moves.ts.
- MAY to SHALL: OLD 'A step's move MAY carry several ops when one premise forces them all'; NEW 'Where one premise forces several ops, the step's move SHALL carry them all'. Left as is, since the brief forbids MAY and the recorder returns all of one firing's ops (solver.ts tracksRecordingPass), but it is formally a strengthening.

### palisade

- The 13 `untrue:` rows were all checked against the code and hold (eight `Game` type arguments; bounds rather than `validateParams` refuse values below 1; `k = w*h` refused only under full validation; `newDesc` returns no aux; `redraw` draws dots only; too-large measured over no-wall-joined cells; no 'clear this one, then the rest' sentence; corner squares cited; `edges.slice(leg)`; regions hatched in `COL_HINT`; no three-step cycle; marks drawn by the shared renderer). No `guide:` or `held:` rows exist in this ledger.
- Left as the rewriter had it, a judgment call: OLD 'When the clue set is not uniquely solvable (so no deduction is found) `hint()` SHALL return an error' reads in NEW as 'When the deductions force no edge, as on a clue set that is not uniquely solvable'. The code errors exactly when no edge is forced (`forced.length === 0`), so NEW matches the code; a non-unique clue set that still forces some edges returns a plan, which OLD's wording arguably forbade.
- Left as history, a judgment call: the old rule that adopting the shared border-grid module 'SHALL NOT change any board Palisade generates or any frame it draws' and its scenario. It binds a migration that is complete; no standing rule went with it.
- Left as the rewriter had it: OLD kept 'the explained hint's own marks' as Palisade's own; NEW says 'the explained hint's sentences', with an `untrue:` row. The drawing is shared (`hintTileBits`, `drawBorderTile`), but which marks a step makes is still decided by Palisade's sentences and its `hintMarks` roles in index.ts, so 'marks' was only half untrue.

### netslide

- NEW 'An endgame the heuristic cannot see past is searched exactly' reads OLD's dash apposition ('-- two tiles wanting each other's cells ... --') as 'such as two tiles wanting each other's cells'. I left it: the code (src/games/netslide/hint.ts, exactSearch on every board) does not restrict the exact search to that shape, so the example reading is the truer one, but it is a judgment on OLD's meaning.
- New scenario 'Two tiles in each other's cells' asserts the plan's first move is the first of a shortest way home. It is a direct case of OLD's unconditional rule, but no test pins it and the exact search is bounded (maxDepth 14, maxStates 1,200,000 in src/games/netslide/hint.ts); beyond that budget the heuristic takes over. The same bound qualifies OLD's rule, so I kept the scenario and did not narrow it.
- Ledger row 'spec ts-engine: The status bar's completion words come from the engine' was confirmed against the working-tree openspec/specs/ts-engine/spec.md, which another agent may be retitling in this same pass; re-run spec-ledger after ts-engine settles.
- The other six untrue rows were checked against the code and stand: validateParams refuses only area (bounds on paramConfig items do the ranges, via paramsError); no validateDesc (newState/parseWireDesc); barriers not frozen (readonly type); 'This row never slides' with hatching, not a row number; SOLUTION_UNKNOWN wording; Check & Save still consults the hint in Midend.check().

### towers

- NEW 'Towers' grid size runs from 3 to 9' carries 'When full, validateParams SHALL refuse a 3x3 board above Normal', which OLD never stated. It is true of src/games/towers/state.ts and I left it, as part of correcting OLD's untrue validateParams rule (the ledger's untrue row names it), but it is an obligation the old spec did not have; a decision on whether it belongs here or only in engine-difficulty.
- NEW 'A Towers hint is ordered the way a person solves' keeps OLD's three-rung order (naked single, clue elimination, forced placement). The code's ladder has a fourth rung between the first two that neither text states: Towers' own extreme-clue lines (clue == w, clue == 1), placed before any recorded strike (buildSteps `rungs`, src/games/towers/index.ts). Left unstated, since adding it would be a new rule.
- The rule that the hint on an Unreasonable board may come up empty (recording capped at DIFF_EXTREME in buildSteps) is recorded as untrue and the resume promise narrowed to 'a board whose tier needs no search'. I verified the cap in the code and that engine-hints holds 'A Search is refused and never narrated', so I accepted it as decided; it is nonetheless a narrowing of a player-facing promise.
- All 18 untrue rows checked against the code and borne out (validateParams, choice codec, parseDesc underscore, no validateDesc on the game, CURSOR_SELECT / CURSOR_SELECT2, up-right protrusion, pencilKeepHighlight default on, sticky right-click on an unmarkable cell, populate reading, strikeAxis per height, frontier continuity, outline and stripes, pencil-color strike, midend refusals, Extreme cap, keepCandidateHintTrack, opening before populate). No guide: or held: rows exist in this ledger. The cross-capability titles cited (engine-hints 'The midend SHALL refuse a hint on a finished or wrong board before asking the game', engine-candidate-hints 'A candidate hint plan continues from its latest steps where it can') exist in the working tree, but those specs are being rewritten concurrently and the titles should be re-checked at the end.

### map

- The spec's params requirement does not mention the tier refusals `validateParams` now makes (`tierRefusal` in src/games/map/state.ts: no such tier at n <= 7, two squares wide, a region per square, and the too-rare-to-deal cases). OLD did not state them either, so I added nothing; whether map's spec or engine-difficulty should hold them is a decision for the change's owner.
- The old and new scenario 'Generated boards are uniquely solvable at their difficulty' holds for every board the generator returns, but `newMapDesc` throws via `retryLimit` when its work budget is spent; neither OLD nor NEW says so. Left as is, since OLD had no such rule.
- Kept as written but worth a second opinion: the scenario 'The hint reads the rungs without applying them' (new, for 'The generator does not call the hint') is true of solver.ts and hint.ts by construction, but is closer to a restatement than a case.

### subsets

- The three remaining untrue rows were checked against the code and hold: the params message is 'Currently only 4x4 puzzles are supported.' (state.ts `validateParams`); the tally draws no count, only a color by never/once/more than once (render.ts); a rule-out hint step survives a UI update (index.ts `uiUpdateClearsHint`). Note the exception is wider than NEW's reason clause suggests: a rule-out step stays for every aid touch (tally, any cell's icon, cursor), not only for its own cell's inspect icon. The body's rule ('a hint step that rules a set out of a cell ... SHALL stay') is accurate; only the reason clause is narrower. Left as written.
- The unrecognized tier is refused by the engine's `paramsError` choice-list check (src/engine/params.ts), not by the game's `validateParams`, which checks only the shape. OLD and NEW both say 'validation' generically and name no function, so nothing was changed; a comment in state.ts `decodeParams` names `paramsError` correctly.
- NEW requirement bodies carry three sentences lifted from OLD scenarios (solved when every set is placed once and every clue holds; a multi-slot firing is one journey; a contradicting board's hint is refused). Each has an OLD scenario as source and matches the code, so they were kept.
- No guide: or held: rows exist in this ledger, so there were no destinations to open. The four history rows ('matching upstream', the Solve divergence note, the TODO-repair provenance, 'as before') carry no binding rule.

### inertia

- 'hint SHALL NOT mark the game as solved-with-help' is kept verbatim and holds for the solver record (the midend's `cheated`, the 'Auto-solver used.' status words). But the midend's `markHelped()` runs when a hint plan is shown, so the timer reads as assisted after a hint. Whether 'solved-with-help' was meant to cover that is the owner's reading; I changed nothing.
- 'COMPLETED! when finished' is kept as OLD had it. The words are the engine's (`completionStatus` in src/engine/completion-status.ts), not Inertia's `statusbarText`, and a board finished by Solve reads 'Auto-solved.' instead. Not corrected, since OLD's Solve scenario already says the game reports itself solved with help; an untrue row may be wanted.
- 'relaxing by one every 50 rejections' is kept as OLD had it. In src/games/inertia/generator.ts only spread rejections count toward the 50; a grid rejected for too few candidates does not. OLD's wording is ambiguous on this, so I left it.
- Not opened: the ledger's untrue row for a dimension below 2 relies on `dimensionParamConfig` passing `bounds: { min: 2 }` to items that `paramsError` checks before `validateParams`. I read `paramsError` and `validateParams` (area only) but did not trace `numberItem` to confirm its item type takes the bounds branch of `itemError`.

### undead

- The 'Renaming the tier moves no board' scenario (same seed gives the identical description as before the rename) is dropped as `history`. I left it: it compares against a past state nothing can check today, and the surviving rule (the solver retains the forcing rung, only the hint's recorder lacks it) is kept. Say if a seed-stability promise should stand as a rule.
- NEW adds 'A difficulty letter the encoding does not know SHALL decode as the default tier' in place of OLD's '`validateParams` SHALL require a known difficulty'. It is true of the code (`choice` in src/engine/params-codec.ts leaves the default when no `invalid` is given), but it turns a refusal into an acceptance in the normative text. Left as the rewriter wrote it, with its `untrue:` row.
- 'Undead flashes on solving' and 'not on Solve' are kept from OLD, but the suppression is the midend's (`becameSolved` checks `pendingSolve` in src/engine/midend.ts), not the game's render. The requirement is arguably misfiled under undead; kept per the brief.
- All 17 `untrue:` rows were checked against the code and hold. No `guide:` or `held:` rows exist in this ledger. The three brief checks were re-run after the edits and are clean (38 requirements, longest body 417 characters).

### singles

- The corner requirement keeps OLD's parenthetical 'not generic "this square / its other neighbor"' for every corner deduction. The four-number sentence (say.corner4) names the corner's number but calls the two side cells 'both its neighbors'. I read that as within the rule, since the number is named; a stricter reading would make it a wording defect in the hint text.
- 'Singles completion flash' and 'A Singles hint is refused on a solved or mistaken board' now state engine behavior (becameSolved and computeHintPlan in src/engine/midend.ts) inside the singles capability. Both are true of the code and kept here per the brief, but they are arguably misfiled: the rule belongs to the engine's capability.
- 'the difficulty is one of the two tiers' can never refuse anything for Singles: the choice item's getter maps the string union to 0 or 1 (diffToLevel in src/games/singles/state.ts) and decodeParams leaves the default tier on an unknown letter. The clause is harmless and carried from OLD's 'a known difficulty'.

### sokoban

- Both `untrue:` rows were checked and hold: `DESC_LETTERS` in src/games/sokoban/state.ts is `[swptdbfuvA-Z]`, so a description cannot write a labeled barrel on a target; `hint` in src/games/sokoban/hint.ts looks for a plan-shortening push only within `ALLOWANCE` and otherwise offers the plan's first push. Decision for the owner: whether a hand-typed ID should be able to write a labeled barrel on a target, since the old spec promised it and upstream stores it as a control character.
- The seven scenarios the rewrite added were checked against src/games/sokoban/index.ts, state.ts, hint.ts and src/engine/rival-judging.ts and are true cases of their rules: diagonal step into a barrel, step into a wall, barrel into a pit, walking toward the hinted push, every other push lost, push onto a target with nothing else to say, filling first before clearing a way.
- The ledger has no `guide:` or `held:` rows to open. The two `history` rows and the one `figure` row (presets being upstream's sizes turned; the 16x20 and 300,000 figures) carry no binding rule.
- The two MAY permissions cannot be written as SHALL without some rewording; I bounded each prune as narrowly as OLD's text and title allow. A reader who wants the permissions verbatim would need the brief's ban on MAY lifted for this capability.

### seismic

- Wall-list order: OLD said "all horizontal borders followed by all vertical borders"; NEW says the borders between the cells of each row first, then the borders between rows, which is what regionWalls in src/engine/wall-runs.ts does. I left it as a spec: row because OLD's wording is ambiguous, not plainly false; if "horizontal borders" is read as horizontal lines it would be an untrue: row instead.
- Untrue claims confirmed against the code and left as written: the Seismic keep-apart distance (placeNumber and validateGame bar j = 1..n either side), mark-all filling only note-less cells (executeMove pencilAll, anyEmptyLacksNotes), and presets not stopping well inside the bound (the 8×8 Seismic presets equal MAX_CELLS_SEISMIC = 64).
- New scenarios checked against the code and true: two 2s with one cell between (both flagged FM_ERRORDIST, status invalid), the retry error labeled with game and size (retryLimit label `seismic: WxH generation`), mark-all leaving a narrowed cell alone, the refusal naming the mode. The new hint scenarios (stale notes struck first, a placed number's cull, Easy never taught the trial, a new player's first hint) were judged only as cases of their own rule sentences, not run.
- The ledger has no guide: or held: rows, so there was no destination to open.
- "A preset SHALL NOT be a size that takes seconds to generate" is carried from OLD unchanged, but the code's own table gives 8×8 a worst run of 2.3 s. Whether 8×8 presets meet that wording is the owner's call; I changed nothing.

### salad

- Decision needed on the no-op rule: I restored 'A move that would not change the board SHALL be a no-op' because the guide backs it, but Salad's code does not meet it (see codeLooksWrong). If the owner prefers the spec to describe today's code instead, the rewriter's narrower requirement would have to come back as an untrue correction.
- The untrue correction for the ball fill stands but adds wording OLD did not have: OLD 'a ball drawn round a character SHALL show that surface through it'; NEW 'In ABC End View mode a ball SHALL show that surface through it; in Number Ball mode a given ball's inside SHALL be paper and the player's the entry color as a wash'. drawBall and colors in src/games/salad/render.ts bear it out (ABC End View draws no ball round a placed character and fills the ball with the square's surface; Number Ball fills with COL_I_BALLBG = PAPER or COL_G_BALLBG = GREEN_WASH, a fill that predates the surface requirement). I kept it as the code's behavior; whether the Number Ball fill was meant to give way to the surface is the owner's call.
- The description-validation rule keeps OLD's 'more or fewer squares ... distinguishing which', but a too-short ABC End View border section is reported by readSection in src/games/salad/state.ts as a bad character (the comma is read as an entry), not as too short. I did not run it; salad.test.ts 'rejects each way a description can be wrong' would show which message each case gets.

### slant

- OLD 'Arrow keys SHALL move a cursor (revealing it first)' is ambiguous. The ledger reads it as a press spent on the reveal and marks it untrue against moveCursor in src/engine/pointer.ts, which reveals and moves in one press. NEW's 'revealing it in the same press' is true of the code and I left the row; if the old text only meant 'reveals as it moves', the row is a rewording and not an untrue.
- NEW names the `solvedFlash` hook where OLD said only 'SHALL drive a solve-completion flash suppressed after Solve'. The suppression is the engine's (becameSolved in src/engine/midend.ts checks pendingSolve), not Slant's. I left the hook name in as a Game contract name; say if it should go.
- NEW's 'The completion flash SHALL run in three phases, lit on the first and the last' spells out OLD's 'the upstream 3-phase completion flash'. It is true of redraw in src/games/slant/render.ts, and I left it as the content of the dropped 'upstream' reference.
- The hint-colors-after-the-ported-palette rule is kept, but its only stated reason (dark-mode overrides targeting other indices) is correctly marked untrue: no index-keyed override exists in the tree. Nothing reads the promise any more; dropping the rule is a decision for the owner of the change.

### rome

- Scenario 'A tap that commits nothing still selects' is carried verbatim from OLD, but its WHEN ('a press and release land on the same square, in either mode') is broader than its rule: with notes mode off, a tap on a square that already holds a player's arrow commits a clearing move (interpretMove in src/games/rome/index.ts emits place with dir null), so no selection happens. The requirement body is correct ('that commits no move'). Left unchanged because the rewrite must not change meaning; narrowing the WHEN to 'and no move is committed' needs a decision.
- 'A move off the grid ... SHALL produce no state change' (kept verbatim) means a press outside the grid; it reads close to the separate rule that an arrow placed pointing off the grid is a move. Both are true of the code, wording left as OLD had it.

### bricks

- Carried unchanged from OLD, not a rewrite defect: 'The undeclared Bricks tier still loads and is never dealt' says the refusal message names 'the difficulty and the tiers that do exist'. The engine's message is 'Difficulty must be one of Easy, Unreasonable.' It names the field and the existing tiers, not the refused tier (which has no name). True only if 'the difficulty' means the field; left as it was.
- `validateParams` in src/games/bricks/state.ts refuses a full 2x2 at Unreasonable ('No 2x2 puzzle is Unreasonable.'). Neither OLD nor NEW states this rule, so I did not add it; the ledger mentions it only inside an untrue row. Needs a decision on whether the spec should carry it.
- The ledger's 8 untrue rows all hold against the code (engine `itemError` refuses bounds, unknown and retired difficulty; marks show only during a drag or from the check's mistakes; a clue is flagged over or unreachable; `status` validates non-strict so empty cells do not block completion; `unclassified` throws and has no sentence; `findMistakes` never runs the solver). I could not compare the non-strict completion with upstream: ../puzzles/unreleased/bricks.c is not in the sibling clone.

### lightup

- OLD 'the hint MAY narrate the deductive prefix and then refuse' is a permission; NEW states it as two SHALLs (narrate what remains, refuse at the guess point), because the brief bans MAY. This is true of the code (hint in src/games/lightup/index.ts returns DEDUCTION_EXHAUSTED on an empty plan), and the ledger row says so, but it is a strengthening someone should knowingly accept.
- validateParams in src/games/lightup/state.ts also refuses full params through absentTier (no Normal or Unreasonable on a 2x2, no Unreasonable under 9 squares, the 3x3 and 4x4 symmetry cases). Neither OLD nor NEW lightup spec states these refusals. I did not add them, since the rewrite is to change nothing required, and I did not check whether another capability such as engine-difficulty covers them.
- NEW 'Light Up's tile cache keys on one packed word' lists the show-lit-blobs preference among the bits of the word. OLD named only the findMistakes highlight and the hint bits. It is true of redraw (DF_BLOBS_PREF) and is what makes the kept scenario 'reappears when the preference is re-enabled' hold, so I left it in.

### grid

- 'A grid is immutable once built and shared by reference' adds 'The one write after construction SHALL be the incenter that ... caches on a face'. OLD does not say this; it reconciles OLD's 'immutable after construction' with OLD's 'cached on the face', and it is true of the code (GridFace.ix/iy/hasIncenter; index rewrites by gridTrimVigorously and the Penrose/spectre re-centering both happen inside construction). I left it as a permitted reconciliation; it is a judgment call.
- The new scenario 'A game needs a grid helper' states as behavior that a game imports from src/engine/grid/index.ts. OLD only required the barrel's doc comment to tell callers so. It is true today (no file outside src/engine/grid/ imports a part), so I left it.
- OLD and NEW both say gridValidateParams rejects 'sizes large enough to overflow the coordinate arithmetic'. The code (src/engine/grid/grid-tilings.ts, gridValidateParams) also rejects on an object-count bound (cells > INT_MAX / multiplier) that is not an extent overflow. The rule is not false, only incomplete, so I changed nothing.

### keen

- OLD 'validateParams SHALL require ... a known difficulty' is dropped as untrue, and I left it dropped: `diffToLevel` in src/games/keen/state.ts reads an unknown key as Normal and `decodeParams` keeps the default tier for an unknown letter (so `6dq` decodes as Normal). The `Difficulty` union makes an unknown key unrepresentable in typed code, so I read this as a design choice, not a defect; the owner may want it restored as a rule.
- NEW 'Keen provides an explained deduction hint' names `runLatinCandidatePlan` as the walk the plan SHALL be built by. OLD said only 'walking a working copy of the board the way a person solves it' followed by a ladder order the ledger marks untrue. I kept the name as the correction of that order (it is an exported engine helper); strike it if a helper name should not bind.
- NEW 'The block structure is run lengths between dividing lines' turns OLD's 'a compression pass that may replace a run' into 'three or more SHALL be written as letter plus count', matching `encodeBlockStructure`. It binds the writer only; the reader still accepts an uncompressed run and refuses a count below 3. Left as the ledger's untrue row has it.
- All 21 `untrue:` rows were checked against src/games/keen and the engine files they name and hold. The ledger has no `guide:` or `held:` rows; every `spec <capability>:` destination (engine-params, engine-notes, engine-candidate-hints, engine-hints, quick-save) was opened and says the rule. Those specs are being rewritten concurrently, so a title may move again before the final commit, as the engine-notes one did.

### group

- The largest change in the rewrite is a reversal that needs the owner's eye, though the code bears it out: OLD required small sizes to be 'generated one tier easier' (upstream's downgrade exceptions); NEW 'A size is refused at a tier none of its boards need' requires `validateParams` to refuse them and SHALL NOT deal an easier board. Verified against `sizeLacksTier` and `tierTooRare` in src/games/group/state.ts (every bound in the new body matches) and against `newGameDesc`, which generates at the tier asked. The ledger marks it untrue twice (body and scenario).
- NEW 'Notes are penciled in only when an elimination needs them' adds 'Group SHALL start on the implicit reading, which has no populate step', which has no source in OLD. It is true of `newUi` in src/games/group/state.ts and is covered by the ledger's untrue row on populate, but it newly pins a default preference as normative.
- Two more untrue rows change player-facing statements and were verified true of the code: typing an element's number does not fill a cell (`interpretMove` takes only `isChar` letters), and the hint's order is naked single, then Group's placements, then eliminations, then generic placements (ladder in `run` of src/engine/candidate-plan.ts with Group's `leads` rung).
- The old scenario kept verbatim, 'every cell along that diagonal is set to the element, skipping any immutable cell that already holds it', differs from the code in mechanism only: `interpretMove` includes such a cell in the move and sets it to the value it holds. Same result on the board, so left as OLD had it.
- Several new scenarios were checked by reading the code only, not by running it: 'A hidden single names its line', 'Only a guess is left', 'A hint rings a cell', 'A broken product is annotated' (true for a single failure; `checkErrors` skips a second annotation on a cell whose slot is used).

### tents

- `validateParams` in src/games/tents/state.ts refuses a 4x4 above Easy when `full`; neither OLD nor NEW states it. Not added, since the rewrite is to change nothing required; whether the spec should carry it needs a decision.
- NEW adds code-true detail OLD did not state, left in place without ledger rows: tent count "rounded down", non-adjacent "even diagonally", an empty line defined as "holds neither a tree nor a tent", `T`/`N`/`B` mapped to tent/non-tent/blank, and "the second [pass] counting a blank square as a possible tent". All checked against generator.ts, index.ts and render.ts.

### unequal

- Owner decision: should a game ID whose difficulty letter names no tier (e.g. `5dz`) be refused, or keep dealing Normal as the code does now? I kept the old spec rule ('`validateParams` SHALL require a known difficulty') per the brief's 'code looks wrong, spec right: change nothing and report', so the spec and code now knowingly disagree on this until it is decided. Recommendation: refuse, as upstream does and as Mathrax does through the codec's `invalid` value. Keen silently keeps its default instead, so the collection is not uniform.
- Kept as the rewriter had it, verified against the code but strictly new text relative to OLD: 'the game's `hint` SHALL give neither' refusal (matches engine/hint-refusal.ts: 'neither is a refusal a game can give at all'), and '`newUi` SHALL state the implicit reading' (matches state.ts). Both come from `untrue:` rows. Whether Unequal's default reading belongs in the spec as a SHALL is a judgment call; note that the doc comment on DEFAULT_CANDIDATE_READING in src/engine/candidate-hint.ts still lists Unequal among the games that take `populate`.
- The old narration quote '"exactly one away from N"' is not literally what the code says (hint-text.ts: 'must differ by exactly 1' and 'nothing open one away from N'). NEW's 'SHALL speak of being one away from N and SHALL NOT say "N-1 or N+1"' is true of the code and I left it without an `untrue:` row.
- The upper order bound moved from 32 (OLD, and upstream) to 31 (`MAX_CANDIDATE_VALUE`), recorded as `untrue:`. It looks deliberate (index.ts comment: 'One more would not fit a candidate mask'), but it does refuse an order-32 board upstream could deal. I did not find where that compatibility break was decided.

### boats

- Kept, but an addition a decision-maker may want to see: 'Boats refuses parameters no fleet can be dealt from' now states the one-boat-above-Easy refusal, which OLD did not have. It is true of the code and is an instance of engine-difficulty's 'An offered tier generates, or is refused with a reason'. I kept it as the correction of OLD's 'matching upstream' and 'any legal parameter set' claims; removing it would also be defensible.
- Kept: the scenario 'Every preset produces a uniquely soluble board' is narrowed from 'any preset or legal parameter set' to 'any preset'. The code bears this out (newBoatsDesc gives up after MAX_GENERATE_ATTEMPTS, and the comment in validateParams says small fleets lack a tier). The generator requirement still binds every board that is produced to exactly the requested difficulty with a unique solution, so only the false 'a board is always produced' was dropped.
- Kept: OLD 'the live-flagged cells are a subset of what findMistakes reports' is replaced by 'a board the live flags mark is a board on which findMistakes reports a cell', limited to boards the solver completes. I confirmed the old wording is false cell for cell (FE_MISMATCH lands on a given square, FE_FLEET on every square of a boat, a count error on the number only). The replacement is a weaker rule argued from the rules of the game; I did not run a test of it.
- Kept: 'A hint resumes from the player's board' is a new scenario for the split-off replay requirement. planAt in hint-solver.ts starts from boardOf(state) and firings test for EMPTY squares, but I verified it by reading, not by running.
- Not verified in a browser or by a test run (the task forbade running the suite): the new scenarios for the cursor ring, ink waves on given water and the left-end shape were checked by reading render.ts and validate.ts only.
- No guide: destinations exist in this ledger. The one held: destination (src/games/boats/render.ts, the upstream TODO text) was opened and holds the quoted text.

### unruly

- `validateDesc` is named in OLD and NEW, but `unrulyGame` (src/games/unruly/index.ts) has no `validateDesc` hook: the rejection is the engine's `validateDesc` in src/engine/desc-error.ts reading the game's `newState`. I left the wording as OLD had it, since it does not say whose function it is; if other capabilities were rewritten to say 'the engine's desc check', this one should follow.
- The five existing untrue: rows were all checked against the code and hold: `Game` has eight type arguments; `validateParams` checks neither below-6 nor difficulty, and `paramsError` does both; digits and Backspace/Delete act only at a shown cursor; the three-in-a-row overlay is a thick outline (`drawErrRectangle`), not a bar; the `nearcomplete` premise includes the anchor piece (`markedOf`).
- New scenarios checked against the code and found true: registry hooks, unique board with identical rows not solved, preset menu (four square sizes, one unique), Tricky board not finishable at Normal, tier cap, completed count, near-complete window, executeMove throws on a clue, digit at cursor, like-pair sentence, palette word, hint-step animLength positive, hatch under pieces, reserved window ringed empty, reference line ringed in one color. The midend's hint refusal on a solved board was not opened separately (only the mistakes refusal at src/engine/midend.ts:1171 was read); the rule is carried word for word from OLD.

### mathrax

- NEW 'Mathrax SHALL start on the reading that pencils in only the notes a deduction needs' and 'SHALL offer the collection's sticky pencil preference, defaulting on' have no sentence in OLD. I kept both as part of their `untrue:` corrections: each is the fact that made the old rule false, and each is true (`newUi` in src/games/mathrax/state.ts). They do newly pin two player-visible defaults in the spec; say if those should not be normative here.
- OLD and NEW both say 'a cell is selected for ink by left-click or cursor'. With sticky pencil mode on and pencil mode active, `applyPress` in src/engine/note-taking-cell.ts makes a left-click select for pencil marks, not ink. The ledger does not mark it untrue and I left it: the new right-click requirement states the mode, but the left-click sentence is unqualified. Recommend qualifying it to 'outside pencil mode'.
- The clue-error exception I added is worded without SHALL ('is excepted: its disc and ring take the error colors'), to narrow the old rule without creating a new error-drawing obligation. If error drawing should be normative, it needs its own requirement.
- The 'cells on a quiet surface' requirement body is now exactly 500 characters, at the limit.

### range

- No rule was found lost, weakened or strengthened. All seven untrue rows hold against the code: eight Game type arguments; the non-positive dimension refused by the engine's paramsError from bounds {min: 1}; '_' written and read only between two adjacent clues; no game validateDesc; zero black squares possible on a 1xN strip; solveRec returns the first completion that passes findErrors; midend makes the solved and mistakes refusals before calling hint.
- NEW states 'w + h above 128' where OLD said only 'overflows the cell encoding'. The figure is true of validateParams (w > 127 - (h - 1)) and I left it, but it is a number the old spec did not carry.
- NEW says 'search' throughout where OLD said 'recursion'. Meaning is unchanged; left as is.
- All nine added scenarios were checked against src/games/range (index.ts, solver.ts, render.ts, hint-text.ts) and are true cases of their rules. I read the code and did not run the app or the tests, as instructed.

### spokes

- validateParams in src/games/spokes/state.ts also refuses Unreasonable (in full mode) on a board of 8 cells or fewer and on any board two squares wide. OLD never stated this and NEW does not either, so I added nothing; 'width and height each at least 2, with no upper bound' stays true as far as it goes. Decision needed on whether the spokes spec should carry this refusal.
- NEW names the top tier's internal key `hard` and difficulty character `h`, where OLD said only that they are 'unchanged'. Both match DIFFS and DIFF_CHARS in state.ts and I kept them as the contract a game ID depends on; flagging it as a concretization rather than a verbatim carry.
- The requirement 'Spokes refuses to hint from a position it cannot vouch for' is carried verbatim, but the game's own hint() only checks solvability and an empty plan; the solved, mistaken and rule-breaking refusals must come from the engine. I did not trace the engine to confirm them, since the text is unchanged from OLD.

### dominosa

- The sentence added to 'Dominosa refuses params outside its bounds' (a tier above Easy at n = 1 and above Normal at n = 2 is refused in full form) names sizes OLD never named. It is what the code does and is my reading of OLD's 'a valid difficulty'. If the owner would rather leave it to engine-difficulty's 'The tier-binding guard has no exemption list and counts its cases', remove the sentence and its scenario.
- NEW's barrier-technique list adds 'a square that can be part of only one domino' (the squareSingleDomino rung), which OLD's parenthetical list lacked. The code bears it out (firstFiring in src/games/dominosa/solver.ts, say.barrier in hint-text.ts) and the two untrue rows on the hint cover it, so I kept it.
- The scenario 'The plan solves the board from any mid-game position' is now limited to a board that needs no forcing chain. The untrue claim is borne out (firstFiring runs no forcing chain and hint returns DEDUCTION_EXHAUSTED), but no requirement of this spec says that such a board's hint refuses. I added none, since OLD had none.

### slide

- The requirement 'Only the key block and the exit carry a hue' is carried over unchanged from OLD, but the keyboard cursor is authored RED (COL_CURSOR in src/games/slide/render.ts). Both OLD and NEW scope the rule to the board's fills ('the other fills SHALL stay neutral'), so I read it as consistent and changed nothing; say if the rule was meant to cover every mark on the board.
- NEW adds 'not from the board as dealt' to the Solve rule and 'SHALL then report that no solution exists within the limit' to the solver's move-limit rule. Both are implied by OLD and true of the code (solve() passes curr; solveBoard returns moves -1), so I left them, but they are words OLD did not have.
- Escape also hides the cursor when no block is held (interpretMove in src/games/slide/index.ts). Neither OLD nor NEW states it; I added nothing, since it is not an OLD obligation.

### blackbox

- No other defect found. All 8 `untrue:` rows were checked against the code and hold: `ball` singular in the `no-of-balls` label; no worker adapter maps `no-of-balls` (it is a `paramConfig` kw read by `describeParams`); `validateParams` has no size check and the 2..255 refusal comes from `bounds` via `paramsError` in src/engine/params.ts; `ballLimit` is the name and `blackboxBallLimit` is nowhere in src, docs or scripts; `executeMove` toggles a ball on a locked cell and the refusal is in the primary action's `apply`; `toggleLineLock` unlocks only above half; `statusbarText` is empty on a reveal; the cross is drawn only under `known && !gs.reveal`.
- The two behavior-shaped `untrue:` rows (locked-cell toggle, line lock at exactly half) match upstream's C in ../puzzles/blackbox.c (`if (lcount > (c))` with `h/2`; the lock test sits in interpret_move, not execute_move), so the old spec sentences were the wrong side, not the code.
- The ledger has no `guide:` or `held:` rows, so there were no destinations to open. The three dropped rows (1 figure, 2 history: 'the 5 upstream presets', 'reproduce upstream's rules') carry no binding rule; the five presets and the laser rules are each stated in full in NEW.
- New scenarios checked against the code and true: the game is registered; preset menu holds 8x8 3-6 and 8x8 5-5; `w: 1` refused; one ball past `ballLimit(8, 8)` refused on a deal and accepted with a board; a move leaves its state alone; a click on a locked cell makes no move; a second fire throws; a row exactly half locked is locked; the status text after a win; a wrong verify is counted; hint steps never remove a mark (`moveTo` returns null when the mark shows, layout and finish only add balls); a settled ball; search past budget refuses `SEARCH_OUT_OF_REACH`; a count past budget (`answerCount` returns null, `solve` tests `=== 2`); cursor on a ball; 'a ball' with no color in hint-text.ts.
- OLD's scenario named `validateDesc`; NEW says 'a desc ... is validated' without the name. `validateDesc` is the engine's (src/engine/desc-error.ts), not a hook of this game, so the name was not Black Box's contract and I left NEW as it is.

### separate

- The ledger has no guide: or held: rows, so there were no destinations to open. All nine untrue: rows were checked against the code and hold (eight Game type arguments; bounds not validateParams refuse w/h/k below 1 with 'Width must be at least 1.'; three ladder techniques; edgeEdits has no three-step cycle; the midend, not hint(), refuses on solved and mistaken boards).
- NEW says 'striped' where OLD said 'hatched' in 'Border-grid games share the hint's notation layer' as well as in the hint sentence rule. The mark role is `stripes` and the player's word is 'striped', while the draw op is still called `hatch`; I left 'striped' as a synonym with no ledger row of its own for the notation-layer requirement.
- NEW's 'The module SHALL NOT define a shared move type' and 'a guard SHALL fail the build' are promoted from OLD scenario THEN/BECAUSE clauses into requirement bodies. Both are true of the code (border-grid.ts is generic over Move; the guard is in src/engine/border-grid-render.test.ts), so I kept them, but the guard is a test, not a build step: 'the build fails' is OLD's wording carried over.
- OLD 'select/select2 set the adjacent edge' is 'the edge it rests on' in NEW; this matches borderGridGeometry.cursorTarget (nothing on a corner or a tile center) and I read it as a clarification, not a change.

### pattern

- The desc refusal reads "a clue that is non-positive or longer than its line" where OLD said "non-positive or grossly excessive". I left it: `r.int(0, len)` in /Users/yoni/personalCode/simon-tatham-puzzles/puzzles-ts/src/games/pattern/state.ts refuses exactly that, and the next clause ("a line whose clues cannot fit in its length") already implies it, so no desc is newly refused. It is a more specific wording with no `untrue:` row; say if the old words should come back.
- The hook name `interpretMove` no longer appears in the spec. Its only old sentence was the dropped history one ("SHALL reproduce upstream's input with two deliberate divergences"), and every input rule under it is kept, so I did not re-add the name.

### clusters

- The permission 'the acceptance gate MAY run the easier rung first and reject a Normal candidate it completes' is no longer in the spec; the ledger holds it at src/games/clusters/generator.ts "const easy = solveGame(grid, w, h, DIFF_EASY)". That line and its comment do say it, so I left the row, but a permission now lives only in code.
- NEW keeps 'the tile where the contradiction lands ringed' in the lookahead requirement while the corrected hint vocabulary calls that tile 'outlined' and reserves 'ringed' for the cell the step colors. I left it as OLD had it, since it describes the drawn mark (an orange ring in render.ts), but the two uses of the word sit side by side in the spec.
- No ledger edit was needed: the three `untrue:` rows are borne out by the code. hint-text.ts says 'outlined' for the danger tile; render.ts drawTile tells the ring from the error frame by hue and ts/12 against ts/7; findMistakes returns findErrors and runs no solver rung.
- The eleven scenarios NEW adds were each checked against code or tests and are true cases of their rules: kept board completes at its tier, perturbation flips one cell, drag over a given, hinted move is the solver's, recomputed plan continues, target stays empty, 'outlined' exactly when the contradiction lands off the target, shorter chain wins, Easy board hinted without a chain, unknown tier letter refused, primary button gives the pair's first member, Solve on an Easy board.

### magnets

- validateParams in src/games/magnets/state.ts also refuses a full-form 3x6 or 6x3 board at Normal (noSuchTier). Neither OLD nor NEW states it. I did not add it, since the rewrite is to add no obligation; it needs a decision on whether the spec should carry it.
- The requirement titled "A Magnets singleton square takes no input" also holds "Cursor keys SHALL move a keyboard cursor", which the title does not cover. The rule is kept and the meaning is unchanged; it does not fit in the input requirement under 500 characters, so I left the title alone.
- NEW states that w and h are "declared bounded from 2 to 61" in place of OLD's untrue "validateParams enforces w >= 2, h >= 2 and the area bound". I confirmed it against the code (paramConfig bounds min 2, max DESC_ALPHABET_SIZE - 1 = 61, refused by the engine's paramsError). Note that the upper bound is a rule OLD never stated in that form; it stands in for the area bound.

### abcd

- The fill-all-marks requirement, rewritten under an untrue row, states more than the old sentence did: the strike phase, the single pencilStrike, never a cell's last mark, no move when nothing to strike. I checked each clause against interpretMove, adaptiveMarkAll and abcdObviousMarks and all are true, so I kept it; whether an untrue correction should carry that much new obligation is a call for the change's owner.
- The 'every preset shape' census clause is true only if 'shape' means grid dimensions: SHAPES in src/games/abcd/abcd-ladder.test.ts has no 7x7 four-letter board, and deals the 6x6 five-letter diagonal board with clues removed, which is not the preset. I kept the old words rather than pick a reading.
- NEW adds 'the half rounded down' to the clue-size bound in description validation. It matches parseDesc in state.ts and is equivalent to the old text for whole-number clues, so I left it.
- NEW says 'Every shipped preset SHALL pass validation for generation' where OLD said 'pass validation'. Validation for generation is the superset of checks, so I left it.
- In the runs rung, the count is drawn only on a journey's first step (later steps use say.alsoForced and read no count). The body reads as per journey and the scenario already names the first step, so I left the body as is.
- The three new scenarios 'ABCD is served by the engine', 'A selected cell under a hint' and 'The preference before the player changes it' were checked by reading index.ts, render.ts and pencil-prefs.ts only, not by running the app or a test.

### engine-helpers

- All five untrue: claims checked against the code and they hold: runDeductionFixpoint has no recorder option (two rows); it counts into a caller's `firings` tally with no budget; Loopy is ported and does not call findLoops (comment on checkCompletion in src/games/loopy/state.ts); several grid games truncate instead of importing fromCoord.
- Left as is, for a decision if wanted: NEW names `runDeductionFixpoint` in `src/engine/deduction-fixpoint.ts` and the option `settled`, where OLD said only 'a runner (in src/engine/)' and 'an optional early-out'. Both are true exported names, so I kept them as contract names.
- Left as is: NEW says the early-out 'SHALL NOT be specified or named as solved'; OLD said 'specified', with the naming point carried only in its reason clause ('a name narrower than its meaning...'). Slight strengthening with a source in the old text.
- Left as is: NEW says `isBridge` answers `null` for a loop edge where OLD said 'optionally reports the vertex counts'. True of src/engine/findloop.ts.
- The narrowing of the loop-finder consumer rule to games 'where its rules forbid a loop' follows from the Loopy untrue: row; every current findLoops consumer (Slant, Bridges, Dominosa, Tracks, Net) is such a game.
- New scenario 'An obligation that holds of nothing' (a bespoke-loop game with no hint) is a hypothetical case of the vacuous-obligation rule; no game in the tree is in that position today and docs/games/solver-and-generator.md § 'Where the fixpoint does not fit' records no obligation as unmet, so it could not be checked against a live instance.
- Both guide: destinations (docs/games/testing.md § 'Timing anything under vitest: two things to know first') opened and confirmed: the 1.62-1.73 and 0.98-1.01 figures, the getter mechanism, the build flattening and the warm-up control are all there. No held: rows exist.

### filling

- The frame requirement, kept verbatim from OLD ('the frame SHALL be as heavy as a border between two regions and no heavier'), is not what the code draws by my arithmetic. See codeLooksWrong. I left the rule alone as the brief says. The new scenario 'The edge of the board' asserts only 'no thicker than', which is true of the code. Someone needs to decide whether the code or the rule moves.
- 'Filling builds a selection of cells' says CURSOR_SELECT2 'SHALL toggle the cursor's cell in the selection', where OLD said only 'CURSOR_SELECT2 toggle'. The code toggles only when the cursor is already shown and the cell is not a clue: the first press just shows the cursor. I left it as a fair reading of OLD, but it is more specific than OLD was.
- All 13 untrue rows hold against the code as read (state.ts, index.ts, render.ts in src/games/filling, and computeHintPlan in src/engine/midend.ts). Both guide rows hold: docs/games/hints.md § 'The quality bar' and § 'Group one firing into one step' say what the ledger claims. The new scenarios were checked by reading the code, not by running the app or the tests.

### mines

- NEW 'The count of deaths persists' adds the clause 'through an undo of the death' to the body. The old body said only 'for the rest of the game'; the clause comes from the old scenario 'A player dies, undoes, and carries on' and is true of the code (deaths live in MinesUi, saved as D<deaths>), so I left it.
- NEW 'One seed lays out the same board for the same first square' turns the old history clause about 'the alternative' into the non-SHALL statement that a player 'is never left on a board made to be finished from a square other than the one they opened'. It follows from the old rules (the next square lays out around itself; a layout with no first square lays out afresh), so I left it.
- New scenarios I checked only by reading the code, not by running anything: registry lookup of `mines`, the last two presets at w 16 and h 30, 9x9 with 73 mines refused (n > w*h - 9), finishesByDeduction passing a board not laid out, a death still counted after save, Solve on a dead board, game ID naming layout and first square (supersededDesc). The flash scenario's lit beat matches redraw's wash in src/games/mines/render.ts; its unlit-beat claim that the trodden mine keeps the error color restates the old rule and I did not trace it through drawTile.

### untangle

- All eight `untrue:` rows were checked against the code and hold: no `validateParams` (bounds 4..MAX_POINTS on `n`); `parseDesc` refuses a repeated edge; `allCleared` writes 'its only crossing' and 'both of its crossings'; places are landed spots (`landedLayout`, `closestPlaces`); `narrate` requires `gain > 0`; `onItsPlace` uses `withinReach`; steps carry `words`, not `highlights`; a one-move journey is narrated by `narrate`. The ledger has no `guide:` or `held:` rows; its one cross-capability destination, engine-params 'A rule that a game rejects params is met by the engine's check', exists in the working tree and says it.
- Kept, not a defect: 'The margin from the frame SHALL NOT tighten' has no sentence of its own in OLD, but OLD's exception covered only 'a slightly tighter gap' while the margin was an unconditional SHALL, and `Board.isClear` scales the point and line gaps only.
- Kept, not a defect: 'A drag off the board SHALL NOT cancel' comes from OLD's parenthetical on the clamp-and-commit divergence, a refusal that still binds.
- Not verified by running: the old scenario 'the owner's board is solved within 22 moves' was carried unchanged; I was told not to run the test suite.
- The `validateDesc` rule accepts a pair written `b-a` or out of sorted order (`parseDesc` reads it as the same edge). OLD and NEW both say only that the generator's desc is sorted with `a < b` and that any in-range non-loop pair is accepted, so nothing was changed.

### sticks

- Strengthening filed as untrue, left in place: old 'a hint on a board contradicting its own clues SHALL refuse' is not false of the code (such a board always has a line findMistakes flags); NEW widens it to 'a board that carries a mistake'. The wider rule is what src/engine/midend.ts does (FIX_MISTAKES_FIRST when findMistakes() > 0) and what engine-hints 'The midend SHALL refuse a hint on a finished or wrong board before asking the game' already states, so I kept it; revert the requirement and its scenario to the old wording if the ledger's untrue rows are to be held to strictly false rules.
- NEW's 'validateParams SHALL refuse, on a full parameter check only' adds 'only', and the new scenario 'A short check ignores the generation-only limits' asserts acceptance where old said just 'for a full parameter check'. True of the code (sticks.test.ts asserts paramsError(..., false) is null for 5x6, 0%, 4-way rotational) and I read it as the old meaning, so left as is.
- NEW adds 'The short encoding SHALL be the bare width x height' under the untrue row about every game ID carrying all four parameters. True of the codec (percentage and symmetry are full: true; '7x7' beside '7x7b20s2'), left as is.

### sixteen

- All four untrue: rows hold against the code: sixteenGame has eight Game type arguments (src/games/sixteen/index.ts); SixteenMove is { type: 'slide', axis, index, delta } beside { type: 'solve' } (state.ts); the heuristic adds TANGLE_COST (4) per tangle past TANGLES_IN_REACH (2); a continuation leg carries no why and the journey's why is on its first leg (hint-text.ts say.step, narrateStep). The fourth one adds an obligation OLD did not have ('the why SHALL be spoken on the journey's first leg; a continuesPrevious leg SHALL NOT repeat it'); it is what the code does and I kept it, but it is a player-visible wording rule now written into the spec for the first time.
- NEW names SEARCH_OUT_OF_REACH where OLD said only 'the collection's constant for a search out of reach'. The name is correct (index.ts imports it from engine/hint-refusal.ts) and it is an exported engine name, so I left it.
- Scenario wording is not uniform with the body: the 'final placement' scenario keeps OLD's 'moved into its final place' while the body says 'its final spot', which is the string the code speaks. Both are OLD's or the code's own words, so left.
- The ledger files the name COL_HINT under 'reason'; it is a private constant of render.ts, which the brief lets leave, but none of the ledger's destinations names that case exactly. Left as is.

### pearl

- No guide: or held: destinations in this ledger, so none to open. All five untrue: rows were checked against the code and hold: non-reciprocal line refused by executeMove via checkCompletion valid:false (src/games/pearl/moves.ts); Game takes eight type arguments (src/games/pearl/index.ts); validateParams has no w/h >= 5 test, paramConfig bounds {min: 5} enforced by the engine's itemError (src/games/pearl/state.ts, src/engine/params.ts); no 5x5 Normal downgrade in newClues (src/games/pearl/generator.ts); tier naming.
- New scenarios checked against the code and found true: loop missing a pearl gets ERROR_CLUE and is not solved; flagged cross drawn in COL_MISTAKE; left-click on a crossed edge returns UI_UPDATE from markInDirection; Ctrl+arrow draws a line and Shift+arrow a cross once the cursor shows; saved 'hint' op replays in executeMove; drag preview in DRAG_ADD/DRAG_REMOVE; Normal board not unique at Easy and graded Normal (generator gate plus gradePearl); solve without aux re-solves; default appearance GUI_MASYU; evident() drops a cross beside a two-line square; pearlKeepTrack shrinks a partly made step; 8 wide by 12 high preset.
- NEW adds one explanatory non-SHALL clause with no words in OLD: 'a drag that returns to its start does not close there when that would leave the square with more than two lines' as the gloss of OLD's 'the loop-closure degree rule'. It is true of updateUiDrag (NBITS(lines) > 2 falls back to ndragcoords = 1), so I kept it; a decision only if glosses of a named rule are unwanted.
- OLD's 'a white pearl on it is parted from it by the pearl's black outline' was descriptive; NEW states it as SHALL. True of render.ts (rim COL_BLACK for a white pearl); left as is.
- Purpose dropped 'by default' from 'the generator gated on it by default'. Not an obligation, and with upstream's trailing n unread every board is gated; left as is.

### rect

- OLD named `validateDesc` as what rejects a malformed desc; NEW says it in the passive ("SHALL be refused"). Left as is: Rectangles has no `validateDesc` hook, and the refusal comes from the engine's `validateDesc(game, params, desc)` in src/engine/desc-error.ts through the game's `parseDesc`. The ledger has no row of its own for the dropped name.
- The `untrue:` row for the optional `_` holds against the code (`parseDesc` in src/games/rect/state.ts requires `_` exactly between two adjacent numbers and refuses it elsewhere). That is stricter than upstream's reader, which skips `_` anywhere; upstream's generator only writes it between adjacent numbers, so no generated desc is refused. NEW states only the positive rule, not the refusal of a stray `_`.
- `validateParams` also refuses an over-large area (AREA_TOO_LARGE) and `parseDesc` holds each number to 1..w*h; neither was in OLD and neither was added to NEW.

### net

- The 'leads only into the striped squares' words are also spoken when only barLoops holds (hint.ts sets runsOn = runsOn // barLoops), a case the rule's condition 'across a side not yet known to be wired' does not literally cover. OLD had the same gap and the kept scenario 'A tile on the way could lead on only round a loop' covers the case, so I left the rule as OLD stated it.
- Purpose: OLD said boards are uniquely solvable 'unless the player opts out'; NEW drops the clause. That agrees with the requirement ('No parameter SHALL deal a board that requires guessing') and with decoding skipping `a`, so I kept NEW; there is no ledger row because the ledger format covers requirements only.
- NEW says the letter `a` 'elsewhere asks for a board with no promised single answer' where OLD said 'upstream's `a`'. Meaning is preserved but 'elsewhere' is vague; left as is, since the brief removes what upstream did.

### signpost

- With the added preset sentence removed, the spec no longer defines "free ends" in a requirement body (OLD did not either). The parameters requirement names `forceCornerStart` and the presets scenario shows the two kinds of 4x4; say if a definition should be added.
- The scenario "Region colors repaint after linking" sits under the palette requirement, though it is about repainting after a merge. It is a true case of both that and the repaint requirement; left where the rewriter put it.
- The "16-entry" ramp size is dropped as a figure, replaced by "one entry for each region color". The code does have 16 (NBACKGROUNDS in src/games/signpost/render.ts). Left dropped as the brief directs for counts; restore it if the number of region colors is meant to be contract.

### mosaic

- No `guide:` or `held:` rows exist in this ledger, so there were no destinations to open. The three `history` rows (presets are upstream's, desc "exactly as upstream", the black/white naming) carry no binding rule: the desc format is stated in full in the new spec.
- The seven original `untrue:` rows were each checked against src/games/mosaic/state.ts, src/games/mosaic/index.ts, src/engine/params.ts and src/engine/desc-error.ts and all hold: eight `Game` type arguments, the 3-minimum from `bounds: { min: 3 }` refused by the engine's `paramsError`, no game-level `validateDesc`, no `notCompletedClues` field (`cluesLeft` derives it), and the fourth `fill` move arm.
- The new scenarios were checked against the code and are true: registry hooks, 50x50 the only non-aggressive preset, 3x3 and 100x100 accepted, a move keeps the same board object, a two-step toggle from unmarked gives blank, a finished board takes no click but still moves the cursor, and the error disc under a contradicted number on a marked cell (src/games/mosaic/render.ts).

### flip

- NEW keeps three elaborations OLD did not spell out. I verified each against the code and left them, because each stands in for a reference to upstream that had to go: (1) the Random matrix 'starts as the square itself and grows within the eight squares around it ... a matrix with two identical rows SHALL be discarded and grown again' in place of 'the structural equivalent of upstream's ordered-multiset growth algorithm' (src/games/flip/generator.ts); (2) 'a string without one decoding as crosses' (paramsCodec starts from defaultParams); (3) 'The params encoding SHALL be the width and height, followed in the full form by c or r' in place of 'SHALL be unchanged'. An owner who wants strictly no new wording could cut (1) back to the algorithm's name.
- The 'retained bit-identical random.ts' clause is dropped as history in the ledger. It is a rule about the random capability rather than Flip, and the project doctrine says changing which board a seed deals breaks nothing, so I left it dropped; whether the random spec still states bit-identity was not checked here.
- The untrue: row on round-tripping depends on reading OLD's 'encoding' as either form. If OLD meant the full encoding only, the rule was already true and NEW merely states it more precisely; the NEW text is correct either way.
- The lower bound of 1 is enforced by the engine's paramsError, whose message is '<field name> must be at least 1.'; I did not run it to read the exact sentence for Flip's width and height.

### project-identity

- Untrue claims verified and kept as written: (1) 'every surface reads the name' is false for src/assets/privacy.html, unsupported.html, public/404.html and help/*.md, which write 'Hintful Puzzles' out; (2) only the front page's title carries the tagline (templates/index.html.hbs vs puzzle.html.hbs, 404.html, unsupported.html); (3) the 'fallback link shown to unsupported browsers' clause: unsupported.html keeps two outward links, and the archive (openspec/changes/archive/2026-09-03-claim-project-authorship/proposal.md, 'One item was reclassified on inspection', tasks 3.4) records that as a decision, so the spec clause was stale at birth and the code is right.
- The unsupported page's second outward link is https://medmunds.github.io/puzzles/ (Mike Edmunds' 2013 web version), which is not the `puzzles-web` repository; NEW's sentence calls both 'the predecessors' sites', which is accurate, but it is a permission the OLD text did not state and exists only because of untrue claim (3). Left in place.
- OLD stated 'The lineage is credited in the About dialog and in the help pages that explain the collection's origin' declaratively; NEW makes it SHALL. Left as is: the requirement's own title ('the lineage is credited in one place') and the lineage requirement make it binding, and help/index.md does credit the lineage per commit b2080e61.
- The two front-page footers differ: templates/index.html.hbs links 'source code' to repoUrl for credits, while the Lit footer in src/screens/home-screen.ts points to the About box. Both satisfy the links rule; noted only because the spec speaks of 'the front-page footer's credits link' as one thing.

### samegame

- The four untrue: rows all hold against the code: validateParams in src/games/samegame/state.ts refuses only ncols < 3, w*h <= 1 and an oversized area, with the rest refused by paramsError from paramConfig bounds and choices (src/engine/params.ts); parseDesc reads r.int(1, ncols) and samegame.test.ts refuses '1,0,3'; newState sets impossible from check() and the state has no complete flag; statusbarText returns 'Score: N' alone on a cleared board and the midend's completionStatus prepends 'COMPLETED!'.
- Every new scenario was checked against the code and is true: registry without solve/hint/findMistakes; five presets none wider than tall; a 5x10 board not turned (paramsToFit returns the params when transposeParams is absent); ncols 10 and scoresub 3 refused by paramsError; executeMove throws on an off-grid index; right-click drops the selection; CURSOR_SELECT selects then removes; status bar strings 'Score: 0 Selected: 3 (1)' and 'Cannot move! Score: 4' match samegame.test.ts; cursor outline in BLACK on a tile; stuck tiles take INK at the middle; lit beat paints field and margin in the lifted surface.
- Kept as OLD had it, not changed: the validateDesc scenarios say it 'returns a non-null error string', while the engine's validateDesc (src/engine/desc-error.ts) returns a DescError; the game itself has no validateDesc hook, the engine derives the verdict from newState. NEW's body already says only 'SHALL be refused'.
- Unspecified in OLD and so not added: render.ts hides the keyboard cursor on a cleared or stuck board, the cursor wraps toroidally, and a board that becomes stuck flashes as a win does. NEW's cursor scenario is correctly conditioned on 'a board that has a move left'. A decision for the owner whether these become rules.
- The spec says the game SHALL NOT provide hint, while project doctrine says every game has a hint and a game without one is a draft. The code matches the spec (no hint); the rewrite rightly carried the rule unchanged.

### fifteen

- No defect found in openspec/specs/fifteen/spec.md itself; I left it unedited. All five original `untrue:` rows hold against the code: `fifteenGame` has eight type arguments; there is no `validateParams`, and `paramConfig` bounds min 2 are refused by `paramsError`; the home narration tests position only (`landsAtOwnHome`); the tile cache also repaints on `ds.hintTile` change; the flash color is passed as the tile face while the gap stays `COL_WELL`.
- The four new scenarios are true of the code: solved exactly when in order (`isCompletedTiles`); `{ w: 1, h: 4 }` refused; Down arrow with the gap bottom-right slides the tile above down (`OPPOSITE_ARROW`); `COMPLETED! Moves: 12` then `Moves: 13` (`completionStatus` in src/engine/completion-status.ts with `statusbarText`); last slide flashes and Solve does not (`becameSolved` in src/engine/midend.ts).
- Judgment call left as is: the rewrite drops the five type-argument names (`FifteenParams`, `FifteenState`, `FifteenMove`, `FifteenUi`, `FifteenDrawState`) and says `Game` alone. The five are still the first five of the eight in code, so the old sentence was incomplete rather than false; only `FifteenMove` is still named in the new spec.
- Judgment call left as is: the setup-move rule says it names 'the target tile'. The code names a stable goal tile (the running maximum of the solver's per-step target), not the per-step target. Old and new spec use the same words, so nothing changed.

### twiddle

- No defect found, so neither /Users/yoni/personalCode/simon-tatham-puzzles/puzzles-ts/openspec/specs/twiddle/spec.md nor /Users/yoni/personalCode/simon-tatham-puzzles/puzzles-ts/openspec/changes/turn-the-specs-into-a-reference/ledgers/twiddle.md was edited. All three checks were clean as found (18 requirements, longest body 407 characters, 21 scenarios).
- Both `untrue:` rows hold: `validateParams` in src/games/twiddle/state.ts checks only `w < n`, `h < n` and the area; `n < 2` and a negative `movetarget` are refused by `paramsError` in src/engine/params.ts from the `bounds` the two `numberItem`s declare in src/games/twiddle/index.ts, before the game's `validateParams` is called.
- The preset requirement now lists the seven boards where OLD said only "Upstream's presets ... with one orientable board where upstream had two". The list matches `presets()` in state.ts and is upstream's list minus its 4x4 orientable board, so I kept it as the faithful expansion; it does make the exact list normative in this spec for the first time.
- The numpad requirement spells out what OLD called "the parity-gated numpad rotations": corner digits ungated, 8/2 gated on `w-n` even, 4/6 on `h-n` even, 5 on both. This matches `fixedBlockKey` in index.ts; kept.
- The seven scenarios with no source in OLD (neither hook present, first select reveals the cursor, capital turns the corner back, edge digit needs a block midway, solved board turned again is unsolved, unchanged board repaints nothing, cursor's block is outlined, count keeps running after a win, orientable preset is the 3x3) were each checked against index.ts, state.ts, render.ts and src/engine/target-verb.ts and are true cases of their rules.
- The ledger has no `guide:` or `held:` rows to open. The one `history` row (presets are upstream's, which had two orientable boards) and the one `reason` row (no hint because upstream has no human solver) carry no binding rule: the `SHALL NOT provide a hint hook` itself is kept.

### pegs

- The Purpose lost 'a palette derived through the shared highlight helper'. It is not a requirement and render.ts builds its colors from palette.ts (cellSurface, givenSurface, surfaceGrid), so I left it dropped; the ledger format has no row for Purpose text.
- NEW adds 'Otherwise' before the NO_SOLUTION_FROM_HERE / SEARCH_OUT_OF_REACH refusals, where OLD listed the three refusals without an order. hint() checks frozen pegs first, so it is true of the code; I kept it as a reconciliation and added no untrue row.
- Both untrue rows hold against src/games/pegs/hint.ts: the shape journey is reached only when no rival cuts a peg off (the trap return precedes packageAt), and the cut-off refusal sentence carries no count ('The outlined peg is cut off' / 'The outlined pegs are cut off').
- The ledger has no guide: or held: rows, so there was no destination to open. Its one history row ('as before') carries no rule.
- The ledger file needed no edit: no requirement title changed and every row's destination holds its rule.

### flood

- NEW's 'Flood offers its presets' lists the seven presets by size, colors, leniency, title and order where OLD said only 'The seven upstream presets SHALL be offered'. I kept it: it matches `presets()` in src/games/flood/state.ts exactly and is the only way to state the rule once 'upstream' and the count leave. It does newly bind the order and titles, so it is a call for whoever owns the change.
- NEW's params requirement glosses leniency as 'the moves allowed beyond the solver's own count'. Kept: it restates the old scenario (move limit equals the solver's count plus the leniency) and matches `newDesc`.
- NEW's status-bar requirement spells out OLD's 'as appropriate' (`FAILED!` on a lost board, `COMPLETED!` on a player-solved one, `Auto-solved` on one Solve finished). Kept as a true reading: `statusbarText` in src/games/flood/index.ts writes `FAILED!`, and src/engine/midend.ts prepends the other two through `completionStatus`.
- The ledger needed no edit: the one `untrue:` row holds (`validateParams` in src/games/flood/state.ts checks only `w·h < 2`; `colors` 3 to `MAXCOLORS` and `leniency` min 0 are `bounds` in `paramConfig`, refused by `paramsError`/`itemError` in src/engine/params.ts before the game is called). There are no `guide:` or `held:` rows; the `history` and `figure` rows (presets being upstream's, and seven) took no binding rule with them.

### quick-save

- Left as written, for a decision if wanted: OLD 'A position the hint's search could not settle SHALL be saved' became 'Where the check ... finds no mistakes and the hint's search could not settle the position, the board SHALL be quick-saved'. The added 'finds no mistakes' is not in the old sentence, but it reconciles it with the old 'only if the check finds no mistakes' and matches the code (src/engine/midend.ts check(): mistakes are returned before the hint is asked), so I judged it a restated condition and not a change.
- The ledger has no guide:, held:, untrue:, figure or reason rows, so there was nothing of those kinds to open. Its one dropped row ('owner, 2026-10-02', history) carries no rule. The ledger needed no edit.

### licensing

- The count 'thirteen of the games' (Lennard Sprong layer) stays dropped as `figure`, with `held: LICENSE.md "that thirteen of the games here are ported from"`. The text is there, and a count is what the brief says leaves, so I left it; note the holder is the governed file itself, so nothing outside LICENSE.md now pins that number.
- OLD 'SHALL NOT live inside a subdirectory of the source tree they once accompanied' named the vanished `puzzles/` tree; NEW generalizes to 'a subdirectory of the source tree', with a new scenario about a notice under `src/games/`. I kept it: the old reason (they cover the whole of `src/engine/`, `src/games/` and the help sources) supports that reading, and the literal old rule is vacuous now. It is a slight broadening, flagged for a decision if the literal wording is wanted.
- The five scenarios NEW adds with no OLD source (a bundled package's entry; contributors and no author; author differs from copyright holder; NOTICE beside a filled-in appendix; a notice under `src/games/`) were each checked against vite-plugins/dependency-notices.ts and src/dialogs/about-dialog.ts and are true cases of their rules.

### puzzle-icons

- No ledger rows needed correcting: there are no guide:, held: or untrue: rows, and the 4 history rows and 1 figure row (the localhost:5173 address) carry no binding rule.
- Two wordings in NEW have no exact OLD sentence and were left because they are true and sourced from OLD scenarios: the manual-workflow body adds 'nor any wasm or C build step' (from OLD's scenario 'no wasm or C toolchain step is involved') and 'before merge' (from OLD's new-puzzle scenario); the new procedure scenario adds 'ready to commit to src/assets/icons/'.
- New scenarios checked against code and true: the card's srcset is '<64 file>, <128 file> 2x' via new URL(..., import.meta.url) in src/components/catalog-card.ts; capture mode renders only a capture bar and the puzzle view when `screenshot && import.meta.env.DEV` in src/screens/puzzle-screen.ts; the icon test's failure message is 'missing icon: src/assets/icons/<id>-<suffix>.png'; git check-ignore does not match src/assets/icons and .gitignore has no rule for a directory under src/.

### combi

- The ledger has no `untrue:` rows and no `guide:` rows, so there was nothing of either kind to check. The one `held:` row (src/engine/combi/combi.test.ts "There is deliberately no C-recorded corpus") was opened and the file comment does say the reason does not generalize to the per-game differentials and `random`'s corpus.
- Two requirements in this capability ("A frozen fixture is retired only where every fact it asserts is derivable" and "Retiring a fixture accounts for everything it covered") are rules about retiring any frozen fixture, not about combi. They look misfiled; kept here as the brief requires, for a decision on whether they belong in a testing capability.
- OLD's first requirement body never said the ported test's two-case coverage: the code's port pins (3, 5) and (2, 5), and the spec still says 'a handful of (r, n) cases'. Left as OLD had it.

### cube

- No ledger edit was needed. Both `untrue:` rows hold against the code: `CubeMove` is `{ dir: 'L'/'R'/'U'/'D' }` on every grid (src/games/cube/state.ts) and `interpretMove` (src/games/cube/index.ts) maps a diagonal input to the orthogonal direction with the same edge mask; `enumGridSquares` (src/games/cube/grid.ts) builds only square and triangular topologies. The 'hexagonal' row is filed `untrue:` but under the other reading (a hexagon-shaped patch of triangles) the old words were true and are simply covered by the triangular rule; either way nothing binding is lost, so I left the row as written.
- NEW turns three plain statements in OLD into SHALL sentences: 'Cube fully repaints every frame', 'there is no per-tile cache', and 'no win flash ... completion is reported only in the status bar'. I kept them as the brief asks for rules in SHALL form, and each is true of the code (`flashLength: () => 0`; the engine's completion-status prefixes the status bar text). Note that Cube's own `statusbarText` returns only `Moves: N`; the completion wording comes from the engine, not the game.
- The four new scenarios (presets list, game object carries no solver, a finished solid keeps rolling, a frame opens with the background, completing the board flashes nothing) were each checked against src/games/cube/{state,index,render}.ts and are true cases of their rules.
- The ledger has no `guide:` or `held:` rows, so there were no destinations to open. The two `history` rows (presets are upstream's; upstream's `flash_length` is 0) carry no binding rule.

### latin-solver

- The 'express it in the cube' fix adds one SHALL that OLD stated only as a participle clause and in the requirement title. It is true of the code (`LatinSolver` in src/engine/latin.ts sets `symbols = o - times + 1` and `cubepos` strides by it), but it is a judgment that the clause was a rule and not a reason.
- After my rewording, line 72 of openspec/specs/latin-solver/spec.md is longer than the file's usual wrap width. The three checks pass; I did not re-wrap it.

### random

- Both `untrue:` rows hold against what I read: `openspec/specs/app-shell/spec.md` 'The app hands out boards, never seeds' and 'A seed ID still deals a game' (the board 'the current generator deals for it'), and `docs/doctrine.md` line 145. The corrected reason (a seed keeps feeding a generator the same numbers) therefore stays. Decision for the owner only if they want the old player-facing promise back: OLD said shared seeds 'must keep producing the same boards'.
- NEW scenario 'A replay that fails is not fixed in the corpus' says 'THEN the module is corrected'. I kept it as a true case of the two rules together (output matches the corpus; the corpus is not re-baselined), but OLD has no sentence saying it in those words.
- OLD stated 'The module lives under `src/engine/`' as a plain present-tense sentence; NEW makes it a SHALL. I kept it as the same rule in the reference form. Its scenario is true of the code: 237 imports under `src/games` come from `../../engine/random/index.ts`.
- The ledger row 'The rollover is the `state.pos >= 20` test' points at the stability requirement, whose scenario says 'more than 20 bytes of the state's data buffer'. The private field name is gone, as the brief asks; the code's test is `state.pos >= DATABUF_LEN` at `src/engine/random/index.ts:44`.

### canvas-sizing

- The reason clause 'its box does not change after first layout' is kept from OLD unverified: with the host at `flex: 1 1 auto` its flex base size is content-derived, so whether the host box is truly unaffected by the canvas depends on the parent `.board-area` layout, which I did not run in a browser. It is a reason and not a rule, so nothing binding hangs on it.
- The new scenarios 'The board's own size does not move the measurement' and 'Something wider than the board in the container does not shrink the board' were checked against src/puzzle/canvas-sizing.ts and the view's CSS by reading and hold (width = host minus wrapper padding when the wrapper exists; content is auto-height so the height term is stable), subject to the 64px minimum dimension floor that neither scenario mentions. Left as written.

## Requirements that look misfiled

### repo-layout

- The help-content requirements are player-facing help rules, not repository layout, and `docs/help-pages.md` is their guide. They read as a capability of their own (or part of a help one): 'The site-level help documents the features this fork adds' and its six siblings, 'Every game's help page has one skeleton, read off the game' and its two siblings, 'A game's Hints section teaches its hint marks', 'A game's parameters section is generated from its paramConfig', 'A help page names a field's choice through a placeholder', 'A help page does not type a choice's name', and the two generated-list requirements (rulesets, modifiers).
- The hint-pin harness and `npm run hint-scan` requirements (15 after the split, from 'A hint test's pinned positions keep the scan that finds them' and 'One command scans a hint test's positions and writes its pins') are engine test-harness contracts and sit more naturally with the hint capability (`ts-engine` or the hint spec) than with repo layout.
- 'Every generate-until-success loop is bounded by the shared retry limit', 'An exhausted retry limit throws, or hands over to a bounded recovery' and the three open-loop gate requirements are generator rules that would sit with the engine or generator capability. They were reconciled here but not moved.
- 'Cloudflare Pages deploy tooling lives in the CI deploy job' overlaps `build-pipeline`, which governs the gating and verification of the same publish.
- 'A change the agent scoped and decided is archived without an acceptance checkpoint' and 'Owner acceptance is required only where the owner is the only judge' are workflow rules that `docs/work-management.md` already carries. They are not layout.

### engine-hints

- 'A drag game's press arm goes through the engine's verbs' (`pressTarget`, `buttonVerb`) is a rule about pointer input for target-verb games, not about hints; it was the second paragraph of 'A target-verb game's hint clicks come from its verbs'. It belongs with the target-verb input capability.
- 'Only a tier named Unreasonable requires Search', 'A propagating trial on a hard tier moves up or renames the tier', 'A name is dropped only from a tier that generates nothing', 'A tier list has one definition per game' and 'A moved rung leaves its old tier generable' are difficulty-tier rules that lived inside 'A hint step always names a technique'. They overlap engine-difficulty ('Unreasonable is declared and never issued by position', 'A tier with no boards is retired and still loads', 'A game's tiers are read from its difficulty item') and belong there.
- 'Deduction runs out only where the tier permits search' restates engine-difficulty's 'The midend throws when deduction runs out below Unreasonable' and 'One helper says which tiers permit search'.
- 'A per-cell overlay reaches the render cache through the shared sidecar' covers the mistake overlay as well as the hint's, so it is a rendering rule (docs/games/rendering.md § 'Overlay sidecars'), not a hint rule.
- The app-shell requirements ('The toolbar Hint button alternates show and apply', 'A Hint press applies only while armed', 'Any other action disarms the apply', 'An applied hint is confirmed in the banner', 'A Hint press in flight is dropped…', 'A slow Hint press says it is thinking', 'A slow hint is not cancellable') are about `Puzzle` in src/puzzle/, not the engine; they may belong to an app-shell capability if one holds the chrome's rules.
- 'A bound game's help SHALL list its marks from its legend' is a help-build rule (vite-plugins/hint-marks.ts) and may belong with the help-pages capability.

### ts-engine

- 'The Untangle port exposes its three preferences via the hook' is a rule about one game and belongs to the untangle capability.
- 'The app shell shows a non-blocking, responsive reference panel' and the three requirements split from it (docking or bottom sheet, item rendering and click, spotlight persistence) are app-shell UI, not engine; they belong to app-shell.
- 'A refused Solve is shown in the help banner' and 'Solve is ordered with the other queued input' are app-side behavior (the banner and the main-thread input queue) and fit app-shell better.
- 'The next board is dealt ahead and kept' and 'A deal a player waits for runs off the board's thread and can be stopped', with the requirements split from them, describe the app's DealAhead in src/puzzle/ and the chrome's stop control; only the midend's `newGame(fitTo, kept)` half is engine. Arguably app-shell; ts-migration and app-shell cite these titles, so they were kept here with titles unchanged.
- The 'Absence has one spelling' group is a tree-wide coding rule enforced by a gate check, not an engine rule; build-pipeline and scripts/gate.sh cite the title.

### build-pipeline

- "The gate holds absence to one spelling" and its companion: a guard for the `ts-engine` rule "Absence has one spelling"; by this spec's own rule (membership is normative per check, in the requirement that introduced it) it belongs with `ts-engine`. Kept here.
- "A static-analysis finding is triaged against the type information behind it", "A guard the type system misrepresents is kept", "Compiler strictness is adopted on measured evidence" and "noUncheckedIndexedAccess stays off": code-convention rules about types and guards, closer to `ts-engine` or `repo-layout` than to the gate. Kept here.
- "A stated reporting rule matches what the build does", "Turning on error reporting settles its side effects deliberately", "A public DSN is restricted at the reporting service", "Error reporting is verified on the deployed origin" and "What a crash report carries matches what the privacy notes promise": error reporting and privacy, not the build or the gate, if a capability for them exists. Kept here.
- "A cross-game guard bounds its cost on the axis the game varies" and its three companions (searching-hint slicing, `SEARCH_REACH_GAMES`, the per-member ledger): rules for writing cross-game hint guards, closer to the engine's testing or hint capability. Kept here.

### app-shell

- 'A summary check asserts the rendered word, not merely that a token was replaced' is a rule about a guard over the params label, which engine-params owns ('One describer labels every params set').
- 'A cancel arm that tests 8 also tests 127' (split out of the Escape requirement) is a rule for a game's `interpretMove`, which belongs with engine-input; src/engine/pointer.ts `isEraseKey` and docs/games/input.md § 'The numeric keypad never arrives' already carry it.
- 'The game-ID notification carries no seed' (split out of 'The app hands out boards, never seeds') is a rule about the midend's notification, which belongs to ts-engine.
- 'A help page lists what is not in the game, with the game's reason' and 'The drafts are computed at build time, not kept in the catalog' are about the help build and the build pipeline as much as the chrome; they sit closer to build-pipeline or ts-engine's contract sections.

### engine-input

- 'The engine answers which character is a digit, once' and the three requirements split from it ('The digit helpers take a character, and the caller checks the bounds', 'A game reads and writes a digit character through the engine', 'The meaning of a digit character stays with the game') are about reading a desc or params string through src/engine/decimal.ts, not about input. They belong with whichever capability owns game ids and desc codecs. Kept here.
- 'One drag is one step of Undo' is a rule about the midend's history (and what a save carries), which reads as the capability that owns undo and saves; it is only reached from input. Kept here.
- 'A swatch key is painted from the published palette' (the palette published from one point, the ink chosen from the fill's lightness) is a rule about the app's key panel and palette, closer to the rendering or app-shell capability than to engine input. Kept here.

### engine-candidate-hints

- The three driver requirements ('The recording path steps the ladder one firing at a time through the engine', 'A call of the driver returns one firing, and a contradiction is sticky', 'The driver returns a firing the player cannot see') describe `singleFirings` in src/engine/deduction-fixpoint.ts, which serves the non-candidate hint plans (`deduceHintPlan`'s `showable`) and not the candidate walk. They read as belonging to engine-hints (or wherever the deduction-fixpoint runner is specified). Kept here.

### engine-params

- "A mistake check compares with the one answer, hidden or not" (split from "A board with a mistake check loads only with exactly one answer") is a rule about `findMistakes` and `notApplicable.findMistakes`, which belongs with the capability that owns mistake checking rather than params. Kept here.
- "No parameter or tier switches a generator's checks off" (split from "A board loads only if the game's own solver solves it") is a rule about generators and tiers, closer to engine-difficulty. Kept here.

### ts-migration

- 'A difficulty tier binds the board it generates', 'A corrected tier gate retires or re-founds the game's differential', 'The tier gate's cost is measured by its worst case', 'An unbindable tier is refused, not silently downgraded', 'A generator never settles for a lower tier', 'A refusal that claims absence rests on a count', 'A rare tier is dealt by retrying', 'A tier too rare to deal says so', 'A tier probe runs on state uncontaminated by earlier candidates' and the four monotonicity requirements belong to engine-difficulty, which already states the neighboring guards ('A cross-game guard asserts that tiers bind', 'An offered tier generates, or is refused with a reason').
- 'A generator that runs out of tries is answered, not thrown', 'Only an exhausted retry bound is answered' and 'The app shows the sentence wherever a deal was asked for' belong to ts-engine, which already has 'A deal that finds no board says so in the engine's sentence' and 'Stopping a search with no board in play deals the first preset'.
- The five params-encoding requirements ('Encoded params are byte-stable, and the guard is derived' and its four splits) are engine rules about the params codec, not migration doctrine.
- 'A shared declarative helper is adopted by every game it fits', 'A game's params fields are not renamed to fit a helper' and 'A per-game label states only what holds on every board' belong with the engine helpers capability.
- 'The solver and the hint are two projections...' and 'A game narrates every deduction it accepts, or rejects the board at generation' duplicate engine-hints ('A game narrates every deduction or rejects the board at generation'), which cites this spec as its companion.
- 'Game work is accepted by exercising it...', the two touch-acceptance requirements and 'A device pass records a verdict per item' are process rules that docs/work-management.md holds in part, not rules about the code.

### engine-colors

- The narration sentence inside the old 'The hint emphases stay distinguishable in both schemes' ('This is what the narration rule above rests on. A narration may tie two marks together in words only where the marks are distinguishable by something other than hue') is a rule about hint narration and refers to a rule 'above' that lives in engine-hints ('A narration never identifies an element by its color'). Kept here as the one-clause reason of 'The acted-on hint color outweighs the evidence fill'.
- 'A lightness a help page names is pinned in the game's palette' is as much a help-page rule as a color one (its guard is src/help-lightness-words.test.ts and it reads help/games/*.md). Kept here.
- The help-placeholder half of 'A game that uses the pair names no hue or shape of its own' (a page names the pair by `{{pair:N}}` and types neither word) is guarded from src/help-coverage.test.ts and overlaps whatever capability owns help pages. Kept here.

### engine-notes

- 'The Mark-all action is the M key' holds an app-shell rule (where the control is rendered and that it injects `M` via processKey); that half belongs to app-shell. Kept here.
- The second paragraph of 'The engine owns the candidate encoding' (OverlaySidecar keeps struck marks in a lane of their own, covered by its stale test) is a hint-overlay rendering rule that belongs with engine-hints. Kept here, with the requirement whole under its old title.
- 'The Mark-all guard derives its roster from the capability', 'The Mark-all flag is held to what the game does' and 'The vocabulary guard scans for a retired spelling as a typed-array field' are rules about cross-game guards rather than about note-taking behavior; they could sit with the testing capability. Kept here.

### engine-drawing

- The three capability-snapshot requirements ("The capability snapshot records the draw state its constructor builds", "... permits and forbids no name", "... reads the draw state as newDrawState returns it") are about the cross-game capability-surface guard (src/capability-surface.test.ts), which covers `Ui` and Game members as well; only the draw-state half is about drawing. They would sit better with wherever the capability surface guard is specified (ts-engine or repo-layout). Kept here.
- "A game's render test records through the shared recording drawing" is a testing rule and neighbors repo-layout's "A render test pairs a snapshot with targeted assertions". Kept here.

### solo

- "A hint is refused on a solved or mistaken board": both refusals are the midend's, and engine-hints already states them ("The midend SHALL refuse a hint on a finished or wrong board before asking the game"). Kept in solo, worded as the midend's.
- "Solo keeps a displayed plan on track" and "A kept step is refreshed before it is shown": the behavior is entirely `keepCandidateHintTrack` / `refreshCandidateHintStep` in src/engine/candidate-hint.ts, so it belongs to engine-candidate-hints; Solo only delegates.
- "The order Solo's hint prefers" and "The setup of the notes follows the reading the player chose": the ladder and setup are owned by the engine walk (engine-candidate-hints: "The walk owns the ladder", "The walk owns the setup"). Only the choice of the implicit reading is Solo's.
- "Mark-all fills the cells without notes, then clears the obvious": the additive rule and the second-press clean are the engine's `adaptiveMarkAll`, shared by every `canMarkAll` game.

### bridges

- The first sentence of 'Bridges explains the next deduction' (a hint is refused on a solved or wrong board by the midend before it asks the game) is an engine rule already stated by engine-hints 'The midend SHALL refuse a hint on a finished or wrong board before asking the game'. Kept in bridges as it was.

### galaxies

- 'Galaxies is in the cross-game hint guards' (was the last sentence of the hint requirement): enrollment is derived by `HINT_GAMES` from any game declaring `hint()` (src/engine/testing/hint-games.ts), so this is an engine-hints rule that holds for every game, not a Galaxies rule. Kept here.
- 'A hint refuses on a board with a mistake': the refusal is the midend's (`FIX_MISTAKES_FIRST` when `findMistakes() > 0`, src/engine/midend.ts), not Galaxies' `hint()`. An engine-hints rule; kept here.
- The `solved-with-help` half of 'Galaxies reports solved from its edges': the upgrade is the midend's (`this.cheated`, src/engine/midend.ts), the game's `status` returns only ongoing/solved. Kept here.

### tracks

- The first sentence of 'Tracks explains the next deduction' (a hint is refused by the midend, before the game is asked, on a solved board or one with mistakes) is the engine's rule and belongs to engine-hints. Kept here as it was.

### palisade

- 'The shared renderer SHALL take Palisade's palette indices and a callback for the middle of a tile, and SHALL NOT branch on which game is drawing' (now in 'Palisade's clue layer stays its own') is a rule about the engine's border-grid renderer, and Separate's spec states the same rule; it belongs once in an engine capability. Kept here.
- 'The border-marking mechanic's look is shared on the same terms' and the scenario 'A fix to the shared mechanic reaches both games' are rules about the shared border-grid module, duplicated word for word in the `separate` capability ('Separate shares its border-marking mechanic rather than owning a copy'). Kept here.
- The hint's shared notation layer (journey, keep-track verdict, hatch and outline drawing) is specified for Palisade inside `separate` ('Border-grid games share the hint's notation layer'), while Palisade's own hint requirements restate the same behaviors game-side; the two capabilities overlap there.

### towers

- 'A hint is refused on a solved board or one with mistakes' is the midend's rule (engine-hints: The midend SHALL refuse a hint on a finished or wrong board before asking the game). Kept in towers, restated as the midend's.
- 'hintKeepTrack advances the plan when a move matches the step' describes the engine's `keepCandidateHintTrack`, which engine-candidate-hints already covers (The shared track and refresh read a game's move dialect). Kept.
- 'Check & Save refuses a board with an invalid note' is the engine's Check & Save gate applied to Towers' `findMistakes`. Kept.
- The step-budget sentence in 'Recording a deduction script leaves the generator's solve unchanged' is the shared walk's (engine-candidate-hints: The walk owns the ladder). Kept.
- The highlight picture (full wash for entry, corner wedge for notes) in 'Towers tells its inks and its selection apart' and the sticky-press rules are engine-notes rules that Towers inherits. Kept.

### map

- "Check & Save refuses a Map board with a mistake" (split out of "Map reports completion and mistakes") is the app's rule for every game with `findMistakes`, not Map's; kept in map as told.

### undead

- 'An Undead hint is refused on a solved or contradictory board': the refusal is the midend's, before the game is asked, so it is an engine-hints rule restated here; kept in undead.
- 'Undead's Mark-all fills the cells that have no notes': the additive fill-only Mark-all is engine-notes' rule ('A game with no obvious-candidate rule keeps a fill-only Mark-all', 'The Mark-all action is the M key'); kept in undead as the game's case of it.
- The sticky-pencil scenario and the pencil-mode indicator under 'Undead supports monster, pencil, and clue moves with a cursor' restate engine-notes behavior ('The sticky pencil toggle is a mode switch, not a selection', 'A sticky notes mode is visible on the board'); kept.
- 'Undead flashes on solving' (not on Solve): when the win flash plays is the engine's rule (`Game.solvedFlash` doc in src/engine/game.ts); the game only supplies the duration. Kept.

### singles

- The clause that the completion flash is withheld from the Solve command is an engine rule (ts-engine 'The win flash plays on a forward move that solves the board'); it is kept in 'Singles completion flash' in corrected form, with only the lifted-surface part being Singles' own.
- 'A Singles hint is refused on a solved or mistaken board' restates what the midend does for every game (src/engine/hint-refusal.ts header); it is kept here, corrected, rather than moved.

### sokoban

- 'Check & Save SHALL ask the hint whether the position is a dead end instead' (kept in 'Sokoban game implements the Game interface') describes the midend's behavior for any game without `findMistakes` (src/engine/midend.ts, the `dead-end` check result), so it belongs to the engine's hint/check capability; Sokoban only declares `notApplicable.findMistakes`.

### seismic

- Scenario "The naked-single phrasing is never used on a multi-candidate cell" (kept under "The deductions the hint makes") is worded for "any Latin-family hint" and is held by a cross-game test in the engine; it belongs with engine-candidate-hints "Latin-family hints distinguish naked and hidden singles".
- The first sentence of "Seismic explains the next deduction" (a hint is refused by the midend on a solved or mistaken board, before the game is asked) is an engine-hints rule restated here; kept.

### salad

- "A Salad hint is refused on a wrong or a complete board" restates the midend's behavior, not Salad's: Salad's `hint` goes straight to `candidateHint` and writes neither refusal. At the base commit engine-hints holds it as "The midend SHALL refuse a hint on a finished or wrong board before asking the game". Kept in salad, as instructed.
- The left-press and right-press halves of "Salad selects a square and enters a symbol or a marker" are the shared note-taking cell's rules (engine-notes: "A pointer press moves the highlight to the pressed cell", "The sticky pencil toggle is a mode switch, not a selection"). Salad only supplies `canEnter` and `canMark`. Kept in salad.
- "The menu SHALL hold one section for each game mode" in "Salad's menu offers both of its difficulties" is built by the engine from the ruleset declaration (engine-params: "The preset menu gives each ruleset a section"); Salad's `presets()` returns a flat list. Kept in salad.

### bricks

- 'A Bricks hint is refused on a solved, mistaken or contradicted board': the solved-board and the rule-violation refusals are the midend's (src/engine/hint-refusal.ts, ALREADY_SOLVED and FIX_MISTAKES_FIRST), given before the game's `hint` is asked; only the contradicted-board refusal (CONTRADICTION_UNLOCALIZED) is Bricks' own. Kept in bricks, worded neutrally as to who refuses; the first two belong to engine-hints.
- 'The undeclared Bricks tier still loads and is never dealt': the mechanism (a retired choice loads, and is refused for a full parameter set) is the engine's and engine-difficulty already states it as 'A tier with no boards is retired and still loads'. Kept in bricks as the game's case of it.

### lightup

- The refusal of a hint on a solved board and on a board with mistakes is the midend's behavior for every game, not Light Up's; kept here as 'A Light Up hint is refused on a solved board and on a wrong one' because the old spec stated it, but it belongs to engine-hints.
- 'Light Up's tile cache keys on one packed word' restates, for this game, the general tile-cache rule (docs/games/rendering.md, 'Prefer a bit in the per-tile key over a sidecar'); kept because the old spec carried it.

### grid

- "Seeded random loop generation" and the two requirements split from it ("Loop generation orders candidates by the random stream alone", "A bias callback steers loop generation") describe src/engine/loopgen.ts, which sits outside src/engine/grid/ and is cataloged with the engine helpers (docs/games/engine-catalog.md § "`loopgen.ts` — random loop generation"). The grid Purpose claims it, so it was kept here; engine-helpers would be the other home.

### keen

- The sentence in 'Keen flags mistakes against its unique solution' that Check & Save hard-blocks a quick-save while any mistake exists is quick-save's rule; it was not kept in keen and its ledger row points at quick-save 'Check & save gates the checkpoint on a clean board'.
- Most of the old hint requirement (ladder order, setup, cull after a placement, keep-track and refresh mechanics, naked/hidden single narration) is the shared walk's and is already stated in engine-candidate-hints and engine-hints. Keen keeps short statements of what is true of Keen; a later pass could reduce them to what Keen supplies (its recording solver, cage words and per-cell strike axis).

### group

- 'A Group hint is refused on a solved or mistaken board' (refusal by the midend before the game is asked, lighting the mistake overlay) is the engine's behavior for every game and belongs to engine-hints; kept here as told.
- 'Every hint step is monotone progress', 'A stored Group plan follows the player's moves' and the ladder order in 'Group's own placements lead the eliminations' / 'Notes are penciled in only when an elimination needs them' largely restate the shared walk, keep-track and refresh of engine-candidate-hints (Group only passes its move dialect and one rung); kept here, not cross-referenced, because that spec's titles are being rewritten concurrently.

### tents

- 'The hint SHALL be refused on a solved board and while findMistakes reports anything' (kept as 'The Tents hint is refused on a solved or mistaken board'): the refusal is the midend's for every game (`computeHintPlan` in src/engine/midend.ts returns ALREADY_SOLVED / FIX_MISTAKES_FIRST before calling the game's `hint`), so it belongs to engine-hints. Kept here, worded in the passive so it does not say Tents does the refusing.
- 'The win flash SHALL NOT play for the Solve command' (kept in 'Tents completion is judged from the board'): this is the midend's `becameSolved` (`!this.pendingSolve`) for every game, so it belongs to ts-engine.

### unruly

- 'A hint is refused on a solved or mistaken board' states a midend rule that holds for every game (src/engine/midend.ts returns ALREADY_SOLVED and FIX_MISTAKES_FIRST before calling `hint`). It belongs to engine-hints. Kept in unruly.
- 'A hint-executed placement plays at the hint-step duration' is the midend's stretch of any non-zero `animLength` (HINT_ANIM_S in src/engine/midend.ts). Unruly's only part is the non-zero `animLength`. It belongs to engine-hints. Kept in unruly.

### separate

- 'Border-grid games share the hint's notation layer' is a rule about the engine's shared border-grid hint layer and about Palisade's frames, not about Separate; it belongs to an engine capability (or Palisade). Kept here, title unchanged.
- 'A game adopting the border-grid input adopts its look' (split out of the old sharing requirement's third scenario) is a cross-game guard over the registry, held by src/engine/border-grid-render.test.ts; it is an engine rule. Kept here.
- 'The games' move formats stay independent' and 'The border-marking mechanic's look is shared on the same terms' constrain the shared module for both games; Palisade's spec carries the same rules in its own words. Kept here so each game's spec stays whole.

### pattern

- 'A Pattern hint is refused on a solved or mistaken board': the refusal is the midend's, before the game is asked (src/engine/midend.ts returns `ALREADY_SOLVED` / `FIX_MISTAKES_FIRST`), so it is an engine-hints rule restated per game. Kept in pattern as told.

### clusters

- None moved. Note only: the dot-run description grammar and its validation (two requirements here) are implemented once in src/engine/dot-runs.ts and shared letter for letter with Unruly, so the grammar is stated per game rather than in an engine capability.

### abcd

- The adaptive behavior of ABCD's Mark-all (fill only note-less cells, then strike obvious marks, never the last, no move when nothing to strike) overlaps engine-notes "Mark-all is adaptive in a game with uniqueness regions", "The Mark-all cleanup is one pencilStrike, or no move" and "Repeated Mark-all presses converge". Those are scoped to games with uniqueness regions, which ABCD has none of, so ABCD's own rule (touching cells and met line counts) is stated in the abcd spec; the shared part arguably belongs in engine-notes with the scope widened.

### engine-helpers

- 'A hot constant's placement is decided by the build, not by the suite' and the split-off 'A timing comparison warms every arm and carries a control' are rules about measuring and about where a constant lives, not about an engine helper; the timing rule is method (docs/method.md, docs/games/testing.md) and has no natural engine capability. Kept here.
- 'The catalog check runs ahead of the documentation-only shortcut' is a rule about the gate's ordering and overlaps `repo-layout`, which it already cites. Kept here.

### mines

- "Elapsed time SHALL survive a save and restore" (now in "Solve stops the clock, and elapsed time survives a save") is the engine's solve-timer behavior, not something Mines implements; it belongs with ts-engine's timer requirements. Kept in mines.

### pearl

- "Check & Save depends on `findMistakes` and SHALL refuse to save while any mistake is present" is the app's behavior for every game, not Pearl's. Kept in pearl, in "Pearl's mistakes gate Check & Save and draw apart from its error marks".

### rect

- "Check & Save depends on this hook and SHALL refuse to save while any mistake is present" (now in "Rectangles flags a drawn edge the solution lacks") is a rule of the shell and midend, not of Rectangles. Kept in place.
- "The hint SHALL refuse on a board with a wrong line" (in "Rectangles offers an explained hint that reads only the board") is the midend's refusal before it asks the game, which engine-hints holds; `rectHint` makes no such check itself. Kept in place.
- The completion flash "does not play after Solve" (in "Rectangles game implements the Game interface") is the engine's win-flash rule in ts-engine; Rectangles only supplies `solvedFlash`. Kept in place.

### project-identity

- "A crash report leaves the device only with the player's consent" and its split-off "Consent is enforced at the reporting SDK's transport" are crash-reporting behavior, not presentation. They sit here because the privacy notes promise them. Kept in place; app-shell (or a crash-reporting capability, if one exists) would be the natural home.

### combi

- "A frozen fixture is retired only where every fact it asserts is derivable" and "Retiring a fixture accounts for everything it covered" are rules about retiring any frozen fixture in the repository, not about combi. They were split out of combi's "Enumeration correctness is asserted in closed form, not by replay" and kept here. They belong with the capability that holds the fixture-corpus rules: repo-layout, which has "A module is not required to carry a C-captured fixture corpus" (title as read mid-rewrite, so it may have changed).
- The clause "The module SHALL live under `src/engine/`, because it is an engine library" (kept in "TypeScript combi module enumerates subsets in lexicographic order") duplicates a repo-layout rule that names `random/` and `combi/` as engine libraries under `src/engine/`. I kept it here and did not point the ledger at repo-layout, because that spec is being rewritten at the same time and its titles are not stable.

### random

- 'The random module lives in the engine' (the module SHALL live under src/engine/) is a tree-layout rule and reads like repo-layout's; kept here as instructed.

## Reasons a guide lacks

### repo-layout

- Why the citation scan excludes `openspec/specs/`, and the measurement to repeat before widening it (how many of a root's kebab tokens fail to resolve, and how many of those are change ids). The reasoning survives only in the header of `scripts/checks/change-citations.mjs`. A session proposing to widen the scan would need it in `docs/method.md` § "A scan that keys on a name".
- I did not open the guides to confirm that the other dropped reasons are held there, so every dropped reason is filed in the ledger as `reason`, `history` or `figure`, never as `guide:`. The ones a session is most likely to need: why a module mock fails under `isolate: false` (kept in one clause in the spec, and in the header of `src/no-module-mocks.test.ts`), and why Stryker's `killedBy` measures file order (header of `scripts/feedback-probe.mjs`). `docs/test-strength.md` is where both would be checked.

### engine-hints

- Why a Tactic is not required to advance one leg at a time: the display-only step per link was designed, costed and set aside by the owner, because holding a hypothesis is acceptable and holding the chain is not, and marking the chain avoids widening `HintStep` (whose `move` is required). I found no guide text for it (no match for 'leg at a time' in docs/games/hints.md). Belongs in docs/games/hints.md § 'The forcing boundary' or § 'Number the chain — the order is the fact the marks used to lose'.
- Why the slice's vacuity floor must sit above 'one board per game' and 'one board per tier': both are counts a broken axis derivation produces with every walk green. docs/games/hints.md has no 'vacuity floor' text; it is held only by a comment in src/engine/hint-resume.test.ts. Belongs in docs/games/testing.md § 'How a cross-game guard finds its population'.
- Why presets are taken in menu order (each value is claimed on the smallest board offering it, so a mode costs about what the easiest board costs). Held only in src/engine/testing/presets.ts's doc comment; no match in docs/games/hints.md. Belongs in docs/games/testing.md beside the slice.
- Why a narration ledger listing is not deleted on the gate walk's silence alone (the reverse direction asserts a negative over a sample, so a widened walk of that game is recorded beside the entry first). docs/games/hints.md § 'Keep the narration terse' covers the listing unit but I found no 'widened walk' text there.

### build-pipeline

- Why the complexity ceiling is not lower, and the distribution it was read from (diagnostics at each candidate ceiling; every site at 100 being an `interpretMove`, a `redraw` or a solver deduction loop). The spec requires the ceiling to be "recorded with that measurement", `biome.json` cannot carry a comment, and no guide mentions it (grep for 'cognitive' in `docs/` finds only the metrics line). Belongs in `docs/games/testing.md` § "Metrics and instruments".
- The static-analysis triage evidence: that every finding of the one measured round was the third kind (a correct guard the types misrepresent), which is what tells a session not to run a mechanical fix pass. The two mechanisms are kept in the spec, but no guide carries the triage (grep for `noUncheckedIndexedAccess` in `docs/` finds nothing). Belongs in `docs/method.md`.
- The measured result behind "retire by measurement, never by category": the frozen differentials were the cheap share of suite time, so the category that looked most like porting leftovers was not where the cost was. I did not confirm `docs/games/testing.md` § "The frozen differentials" or § "Right-sizing the gate" says this; if neither does, it belongs in the second.

### app-shell

- Why the hint is not the filled control (it once was the one filled control on the screen, and read as an instruction to ask for help): the rule and its one-clause reason are kept in the spec, and src/puzzle/components/bar.ts holds a comment, but no guide says it. It belongs in docs/games/input.md § 'The puzzle screen's three panels' if a session restyling the Bar is to find it.
- Why the shortcut sweep exists (a game that consumes a bare letter makes that shortcut silently dead while every table, matcher and label test stays green, as Ascent once did with u, r, n and h): the incident left the spec as history. The shape to look for is held only in the comment in src/puzzle/shortcuts.test.ts; docs/games/input.md § 'A button you did not act on must not be claimed' is where a porter would need it.

### ts-migration

- docs/work-management.md: the device-acceptance rules have no guide home. Nothing under docs/ says that touch feel is accepted on a real device against a deployed build, that a synthesized-pointer Chrome pass covers only the frontend's decision, that a carried-forward device acceptance names the change that discharges it, or that a device pass lists a verdict per item and tells 'not delivered' from 'delivered and feels wrong'. The dropped reason (a device is the scarcest instrument; an unenumerated pass leaves no record) belongs there too.
- docs/games/mechanics.md § 'Params are declared once, on `paramConfig`' (or docs/games/engine-catalog.md § '`params.ts`'): the reason a partially adopted declarative helper is worse than none (a change to the dialog's handling reaches the adopters and silently misses the hand-written tables) was dropped from the spec and I did not find it in a guide.
- docs/games/testing.md: the story behind 'accepted by exercising it' (Flip shipped with a fully green suite and drew nothing) was dropped as history; I found no guide section telling it. AGENTS.md holds the rule, so this is optional.

### loopy

- The reason the auto-rule-out aid tells the player nothing (both facts are exact counts, not deductions, so the player is spared bookkeeping) left the spec as a reason. docs/games/input.md § "An aid extends the move, at the one place the move is built" covers where the aid lives but not this reason for defaulting it on; the one-clause form (discards nothing, removes no decision) stays in the spec, and the fuller argument now lives only in a comment in src/games/loopy/index.ts `newUi`.

### engine-notes

- docs/games/mechanics.md § "Pencil marks: the full note-taking UX" still says 'games without a row/column model keep plain fill-only', which is the rule found untrue (Map and Abcd clean by their own rule). The guide should say what the spec now says: fill-only is for a game with neither a region provider nor an obvious-candidate rule of its own.
- No dropped reason is left without a holder that a session would need: the reasons marked `reason` are either kept as one clause in the requirement or held in the source the ledger names (src/engine/key-labels.ts, src/engine/midend.ts, src/engine/note-taking-cell.ts, src/engine/note-vocabulary.test.ts).

### grid

- The incenter rounding measurement (truncating `v + 0.5` costs up to 1.229 units of inscribed radius, rounding 0.053) left the spec as a figure. It is held in the comment at the rounding site in src/engine/grid/grid-geometry.ts, so no guide needs it; noted only because the ledger's `held:` row depends on that comment staying.

### engine-helpers

- The dropped reason for the early-out's name ('a name narrower than its meaning obliges every reader to consult the doc comment') is not stated as such in a guide, but docs/games/solver-and-generator.md § 'The deduction fixpoint' already says why `settled` is broader than 'solved'; nothing a session needs is missing.
- docs/games/solver-and-generator.md § 'What a bespoke loop still owes' cites this capability's 'shared deduction-fixpoint scaffold' requirement as carrying the three obligations; they now live in 'A bespoke loop carries three obligations', so that sentence should be repointed.

### sticks

- The reason the `x > 1` / `y > 1` look-behind bounds are kept: correcting them was measured to change no verdict on any board at any offered preset (dropped from the spec as a figure). No guide holds it; the comments in src/games/sticks/solver.ts give only 'ported verbatim, since the solver's exact power decides which boards generate'. A session tempted to fix the bounds needs it. It belongs in docs/games/solver-and-generator.md, beside the Check / Tactic / Search discussion that already cites `sticksTry`.

### sixteen

- The tangle measure's reasons are only partly in docs/games/hints.md § "Sliding-permutation games" (it covers the gate, the nine-move endgame and the deep search, and mentions the tangle term in the earlier 'Sixteen is the second worked example' passage). Dropped from the spec and not found in a guide: why the tangle threshold is two (a tangle is about four and a half moves and the deep search reaches nine), and that pricing from the first tangle turned the complete nine-move plan into a five-move partial one. Both are held today only in the comments on `TANGLES_IN_REACH` in src/games/sixteen/index.ts; that may be enough, otherwise they belong in that guide section.

## Rules found false of the code and corrected

### repo-layout

- Root file list read as exhaustive: the root also tracks `tsconfig.node.json`, `unsupported.html` (copied by `vite.config.ts`), `.github/` and `.claude/` (`git ls-files`). The requirement now names categories plus those entries.
- `metrics/` live instruments 'currently `mutation/report.json` and `color-inventory.md`': it also holds `tier-walk.md`, `deal-walk.md` and `hint-deixis.md`, each written by a check under `scripts/`. The requirement now states the rule with no list.
- Engine families 'are `grid/` and `color/`', everything else flat: `src/engine/` also has `testing/`, `random/` and `combi/`. The requirement names the families beside the leaf libraries and the test utilities.
- `fake-indexeddb` 'opted into per-file': `vitest.config.ts` installs it for every file via `setupFiles: ['./src/test-setup/indexeddb.ts']`. Only `happy-dom` is per-file.
- Render scenario driver 'given a game, params, a description': `renderScenario` takes one game `id` (`src/engine/testing/render-scenario.ts`).
- Guides are the `docs/games/` set 'plus the repo-wide `docs/test-strength.md`': `docs/` also holds `doctrine.md`, `method.md`, `work-management.md` and `help-pages.md`. The requirement says a repo-wide guide sits directly under `docs/`.
- The quoted `AGENTS.md` sentence ('treat these as a live wiki… that is part of done') is not in `AGENTS.md` today, which says 'The guides under `docs/` are a live wiki' and 'Update the guide in the change that taught you something'. The requirement states the obligation without a quote.
- `engine/` imports `games/` with 'one named exception, `engine/testing/hint-games.ts`': `src/module-layering.test.ts` allows three, `enrollment.ts`, `hint-games.ts` and `params-corpus.ts`.
- 'each hinting port adds itself' to `hint-games.ts`: `HINT_GAMES` is filtered from the registry by `typeof game.hint === 'function'`. The scenario is rewritten as an unnamed engine file importing a game.
- Spelling exemptions are 'three kinds': `scripts/checks/spelling.mjs` also excludes the spelling tooling itself (`scripts/checks/spelling(-*).mjs`). The requirement lists it.
- A cited change id resolves to three homes (open change, archive entry, postmortem): `scripts/checks/change-citations.mjs` also resolves a capability name under `openspec/specs/`. Both citation requirements list four.
- 'Two kinds of name are outside the scan' for typed choice names: `src/help-coverage.test.ts` also skips a choice name with no letter in it (`!/[a-z]/i.test(name)`). The requirement lists three.

### engine-hints

- `Game.hint` was specified as `hint(state, aux?)`. It is `hint(state, aux?, ui?)` in src/engine/game.ts, and the midend passes its live `Ui` third (`this.game.hint(this.state, this.aux, this.ui)` in src/engine/midend.ts). Signature corrected.
- The displayed step's explanation was said to be 'appended to the status bar'. `emitStatusBar` in src/engine/midend.ts sends it as `activeHintExplanation` beside `statusBarText` on the `status-bar-change` notification. Now stated as sent to the UI, in the requirement body and in the 'Requesting a hint from the midend' scenario.
- A mark on a border was said to take 'specifically a `_BOLD`' step. `HINT_ACTION` (the ring) is base `BLUE` in src/engine/color/palette.ts; only `HINT_EVIDENCE` is a bold step (`TEAL_BOLD`). The bold step is now required of the evidence mark alone; 'a strong color, not a wash step' still covers every border mark.
- The stray-refusal guard was said to key on every `{ ok: false, error: <string literal> }` in the AST. No test scans for that shape. `HintResult`'s error is typed `HintRefusal`, and src/engine/hint-refusal.test.ts reads the escapes' calls (`puzzleDeadEnd`, `markedDeadEnd`) wherever they appear, engine builders included.
- Scenario 'A game invents a phrasing' said the refusal guard fails. The program does not typecheck instead (the error is a `HintRefusal`). Scenario corrected.
- Scenario 'A shared hint builder inlines a refusal' said the guard sees a string literal under src/engine/. A literal that is not a constant's value fails the typecheck, and one equal to it is seen by no scan. The scenario now states what the conformance check does read there: the escapes' calls.
- The searching-games relaxation was said to be derived from which games call the shared slide planner. `SEARCH_REACH_GAMES` in src/engine/testing/hint-games.ts is the hinted games whose comment-stripped code names `SEARCH_OUT_OF_REACH` or calls `searchRefusal(`; Guess, Pegs, Black Box and Sokoban are members without the planner. Rule corrected.
- Scenario 'A deductive game borrows the search refusal' said the walk fails for a game that does not call the planner. Under the real derivation such a game joins the population, and what fails is the ledger equality in src/engine/hint-resume.test.ts until its reason is written. Scenario corrected.
- The list of refusal kinds and their dead-end verdicts omitted one. `HintRefusal` in src/engine/hint-refusal.ts also holds `SOLUTION_UNKNOWN` (a game ID that came without its solution), and the `DEAD_END` table calls it not a dead end. The list now names it.

### ts-engine

- Save envelope 'carries checkpoints': SaveEnvelope in src/engine/save.ts has no checkpoints field (the app keeps checkpoints per board, per the midend's `serial` comment). The requirement now lists puzzle id, params, the board's description, the move list, the cursor and the timer's elapsed time.
- 'A game with no prefs reports an empty preferences set' (and its scenario): getPreferencesConfig/getPreferences in src/engine/midend.ts add the engine's own `show-timer` for every game. Rewritten as 'A game with no preferences of its own reports only the engine's'.
- Untangle scenario 'getPreferencesConfig returns three items': it returns four, the game's three plus `show-timer` (same midend code). The scenario now says the game's three beside the engine's `show-timer`.
- 'colors SHALL receive the frontend default background' / 'the game receives that background': resolvePalette in src/engine/color/color-mkhighlight.ts hands every game the host background shifted off pure white and pure black (mkhighlightBackground). The requirement now says the background as the engine hands it to every game.
- Mistake overlay 'displayed until the next state transition': afterTransition in src/engine/midend.ts calls clearOverlays on a UI-only update too (processInput's UI_UPDATE arm, hover, selectReference), and its comment lists 'UI update'. The requirement now names a UI-only update among the clearing transitions.
- 'Game.difficulty exists precisely so...' as the example of a member whose only consumer is a cross-game guard: TEST_ONLY_CONSUMER in src/contract-surface.test.ts is empty, and its comment says `difficulty` left it when the midend began reading it (midend.ts withBoardTier reads this.game.difficulty). The example was dropped; the rule is kept.

### build-pipeline

- One role toggle: the old spec said the toggle that selects the biome scope is the same one a deferred assertion reads. `.husky/pre-commit` sets two (`GATE_BIOME_STAGED=1 GATE_PRECOMMIT=1 sh scripts/gate.sh`); `scripts/gate.sh` reads `GATE_BIOME_STAGED` for the biome branch only, and `src/engine/testing/slow.ts` reads `GATE_PRECOMMIT`. The new requirement "The gate is one script, and the hook selects its role by environment" names both.
- "One 600s ceiling in vitest.config.ts, so contention makes a test slower, never failed": `vitest.config.ts` has `testTimeout: 3_600_000`, and the header of `scripts/gate.sh` records two Sixteen tests failing the gate under contention at the earlier ceiling. The sentence was history and is dropped; the rule it argued for (concurrency is not conditional on load) stands.
- Live instruments in top-level `metrics/` "currently" being the mutation report and the color inventory: the directory also holds `deal-walk.md`, `hint-deixis.md` and `tier-walk.md`, written by `scripts/deal-walk.ts`, `scripts/checks/hint-deixis.test.ts` and `scripts/checks/tier-walk.test.ts`. The requirement now states the rule with no list.
- Precache scenario "The exclusions are one list": there are two declarations. `PRECACHE_IGNORES` in `vite.config.ts` is handed to both Workbox's `globIgnores` and the check; `NOT_PRECACHEABLE` in `vite-plugins/precache-coverage.ts` is the check's own ledger of build machinery (sw.js, the manifest, `_headers`, source maps, robots.txt, sitemap.xml) and is the one held exactly, with `conditional` entries. "The precache check's exclusions are shared and held exactly" states each.
- `SEARCH_REACH_GAMES` as "the games whose own code names `SEARCH_OUT_OF_REACH`": in `src/engine/testing/hint-games.ts` it also takes a game whose code calls `searchRefusal(`, which names the refusal for it. The requirement states both.
- `robots.txt` "emitted only when `VITE_CANONICAL_BASE_URL` is set": `public/robots.txt` is copied into every build and the sitemap plugin overwrites it only when the variable is set (comment on the `robots.txt` entry in `vite-plugins/precache-coverage.ts`, and the header of `public/robots.txt`). The requirement now asks for `sitemap.xml` and the `robots.txt` written beside it.

### app-shell

- 'A summary check asserts the rendered word': the old text says a `{field}` placeholder check exists and 'both checks are kept'. No summary template is left: `describeParams` in src/engine/param-label.ts composes the label from `paramConfig`, and the standing guard is src/engine/params-declared.test.ts ('a tiered game's label names the tier'), which asserts each tier's label contains the declared tier name. The requirement keeps its title and now states that comparison only.
- 'Undo and redo have keyboard shortcuts': 'SHALL show each binding on its control' is false. `shortcutLabel` in src/puzzle/shortcuts.ts returns a command's first chord only (redo shows one of its two), and the Bar puts it in the slot's tooltip, not on the slot (src/puzzle/components/bar.ts). Rewritten as 'a control whose command has a chord SHALL show the first one'.
- 'Every bare shortcut letter is swept': 'Guess and Pearl bind `h` to their own hint' as ledger entries is false. `BINDS_A_SHORTCUT_LETTER` in src/puzzle/shortcuts.test.ts holds Tents alone and is asserted equal to the set the sweep finds. The example is dropped and Tents kept.
- 'The catalog labels a draft': the scenario says Net has no hint and no mistake check and its label names both. Net implements `findMistakes` (src/games/net/index.ts). The scenario is now written for any game with no hint, whose label says Hints are still to come.
- 'The chrome follows a recorded design direction': the surfaces listed include 'app bar, toolbar'. The puzzle screen has a readout row and three panels (src/screens/puzzle-screen.ts), so the requirement names those.
- 'A player can choose where the panels dock': 'below about 34rem of height'. `SHORT_BELOW_REM` in src/puzzle/layout.ts is exactly 34, so the requirement says 34rem.

### engine-input

- MOD_MASK is 0x7800 (stated in two requirements): it is 0x7000 in src/engine/pointer.ts and in PuzzleButton (src/engine/types.ts); the stylus bit 0x0800 is left unused. The spec now says 0x7000. The 0xE000 decoding the spec keeps holds under either mask.
- The modifier masks match upstream's puzzles.h: upstream's mask includes the stylus bit, which pointer.ts leaves out. Dropped.
- A game without requestKeys gets an empty list from the midend: Midend.requestKeys (src/engine/midend.ts) appends the Marks key for any note-taking game, hook or not, so the list is empty only for a game that takes no notes. Requirement 'The midend serves a game's key labels' now says so.
- The suite sweeps every registered game's board with a touch press against a mouse press: no such sweep exists. A finger's press arrives as the mouse's own codes with nothing marking it, and the frontend's 'one pointer, two buttons' tests in src/puzzle/components/view-interactive.test.ts hold that (the header of src/engine/input-parity.test.ts says the same). The rule now lives in 'No bit marks a press as a finger's' and 'A game reads one pointer with two buttons'; the old title 'Touch equivalence is guarded for every registered game' is gone. Its density and vacuity rules moved to 'A probe sweeps what could differ'.
- Scenario 'a game comparing an unstripped button fails once the midend's stripping is removed': the midend strips nothing from a pointer press, since no stylus bit exists, so the defect cannot be planted. Dropped.
- Guess's peg holds are UI state never serialized: the comment on `observable` in src/engine/testing/input-probe.ts records that Guess's holds reach the save since it grew an encodeUi. The frame-plus-save rule is kept without the example.
- The count of games with a key panel carries a floor that only moves up: src/engine/input-parity.test.ts has no such floor and gives every game its own keypad case instead, which the later requirement already demanded ('SHALL NOT rely on a floor'). Reconciled into 'The keypad rule is checked per game'.

### engine-candidate-hints

- `candidateHint` refuses on a completed board and on a board with mistakes, and a game passes it `findMistakes`: false. `candidateHint(state, ui, buildSteps)` in src/engine/candidate-hint.ts takes no `findMistakes` and makes neither refusal; the midend's `computeHintPlan` (src/engine/midend.ts) returns ALREADY_SOLVED and FIX_MISTAKES_FIRST before it asks the game. The requirement now says the entry reads the preferences, builds, and refuses only an empty plan.
- The standard refusal and empty-plan messages live in candidate-hint.ts: false. The module holds no message; the empty-plan refusal is `DEDUCTION_EXHAUSTED` from src/engine/hint-refusal.ts.
- A game's `hint` is a one-line call passing `findMistakes` and `buildSteps`: false. Every caller passes its `Ui` (or `ui ?? newUi(state)`) and `buildSteps` (e.g. src/games/keen/index.ts).
- A plan strikes every stale note before it classifies or places anything (old 'Obvious candidate strikes precede a classified placement', and its scenario 'strikes that note before any placement step'): false. `CandidateWalk.run` in src/engine/candidate-plan.ts offers the opening (singles and the game's own rungs) before each `setUp.step()`, so a single the written notes show is placed before the clean; the spec's own later scenario 'a stale note still lets a single go first' says the same. Rewritten as 'A placement is classified against the candidates the board shows': notes are read as written, stale or not, and the clean precedes any recorded strike. The requirement was retitled because its rule changed (no source comment cites the old title).
- The frontier looks 'up to three steps back': imprecise. `HintFrontier.take` records one written-cell set per candidate taken, which is a whole firing with every step it pushed, and keeps three (DEPTH = 3). The requirement now counts firings.
- The plan helpers list 'the first recorded placement not yet on the working grid' and 'the next forced placement' as two helpers: there is one, `nextPlace`, in src/engine/candidate-hint.ts.
- The row/column preset supplies a hidden single's placement evidence, shading the line over the game's own area: false. `runLatinCandidatePlan` passes `placeWords` through unchanged; the line is striped by the words that name it (`narrateLatinReason`'s `hiddenSingle` arm). The requirement now says the preset adds no evidence.
- The preset builds 'the two setup sentences': it builds three sentences (`populate`, `cleanObvious`, and the implicit reading's `note`) and the conclusions.
- The cross-game continuity measurement 'reads a square grid': `planContinuity` (src/engine/testing/plan-continuity.ts) reads a grid with its own width, square or not. Now 'reads a grid'.
- Signatures `narrateLatinReason(reason, n, vocab?)` and `latinPremise(reason, ns, vocab?)`: the code declares `narrateLatinReason(reason, at, w, vocab)` and `latinPremise(reason, marks, vocab)`. The requirement names the functions without parameters.
- Solo and Towers 'share only' `forcingChainPremise` and `confinedPremise`: both hint-text modules also import `placedRulesOut` (the placement cull's premise). The requirement lists all three and drops 'only'.

### engine-params

- Turning a deal: the old rule said the params are dealt turned whenever the turned board draws at a strictly larger tile. `Midend.paramsToFit` (src/engine/midend.ts) also keeps the chosen params when the turned ones fail `paramsError(game, turned, true)`. The requirement "A deal turns the chosen params when the turned board fits better" now says so, with a new scenario.
- Modifiers: the old rule said every `modifierItem` declares the value at which its rule applies, and that the engine states that value and says the label words exactly then. In src/engine/modifier.ts only a checkbox modifier has `when`; a choices modifier "bounds its rule at every value and has none" and supplies its own `label`, and a checkbox with `slot: null` says no words. The two modifier requirements now say this.
- Description error kinds: the old list had seven kinds. src/engine/desc-error.ts has an eighth, `descNeedsOne` (none or several of a thing a board has exactly one of), now listed.
- Named presets: the old text said a named leaf's name SHALL differ from the leaf's label. `presetMenu` (src/engine/param-label.ts) sets a named leaf's `label` to its declared title (`menu.title ?? describeParams(...)`), so the name is the label; the guard compares it with `describeParams`. The requirement now says the name differs from the label its params compose.
- Scenario "A description the generator wrote" said `validateDesc` accepts it; the guard (src/engine/desc-error-games.test.ts) asks `loadVerdict`, the whole load. The scenario now says the description loads.
- Scenario for the desc alphabets said Bridges' own `validateDesc` rejects `H`; games declare no validator (src/engine/desc-error.ts), so it now says Bridges' own parse rejects it.
- The Enter Game ID sentence was quoted with a straight apostrophe; src/dialogs/enter-gameid-dialog.ts writes "That game won’t open." with a typographic one, and the scenario now quotes it so.

### ts-migration

- A seed reproduces its board across builds: false. A seed deals whatever the current generator deals (app-shell 'The app hands out boards, never seeds' and 'A seed ID still deals a game'; docs/doctrine.md § 'Upstream'). The requirement now promises stability of the params:desc ID the engine hands out, and keeps the RNG stream held fixed.
- The generator is the file `random.ts`: the module is the directory src/engine/random/ (index.ts, with random.test.ts holding the stream to a fixture). The requirement now says 'the engine's random number generator'.
- No C source at all remains in the working tree: openspec/changes/add-numgame-ts-port/reference/numgame.c and openspec/changes/add-path-ts-port/reference/path.c exist, as the old requirement's own last paragraph allowed. The rule now states that exception.
- The served help sources are the halibut manual source and per-puzzle overview fragments: help/ holds no halibut source (no *.but in the tree); every page is the project's markdown (help/*.md, help/games/*.md; docs/help-pages.md § 'One directory, owned by this project').
- Acceptance requires the owner to exercise the behavior: docs/work-management.md § 'What the owner accepts' and AGENTS.md have the session run the app itself, with the owner's acceptance asked in three named cases only. The requirement now says the behavior is exercised, without saying by whom. This is a process rule checked against the guides, not code; see notes.
- The pencil-mark preference set is for latin-family games: src/engine/pencil-prefs.ts is 'the GamePref declarations every pencil-mark game shares', and Map, Undead, Seismic, ABCD and Crossing use it.
- Declarative tables are consumed by the Custom-params and preferences dialogs alone: paramConfig also feeds preset titles, the bounds check, the help's Parameters section, the tier accessors and the params codec (docs/games/mechanics.md § 'Params are declared once, on `paramConfig`'; src/engine/params-codec.ts). The no-op rule is kept without that reason.
- The params corpus perturbs every field of the default params: src/engine/testing/params-corpus.ts bumps numbers and flips booleans only, skips fields the difficulty item writes, and adds the default params as a case.
- The guard asserts a game's declared tier list matches its form's choices: no game declares a tier list. DifficultyContract holds solveAtCap alone and difficultyTiers reads the form's difficulty item (src/engine/difficulty.ts, src/engine/difficulty-contract.test.ts).
- The monotonicity sample size is established by removing a known exemption: the contract has no exemption to remove. The requirement now asks that the guard be seen to fire on a solver known to be non-monotone.

### engine-colors

- A per-puzzle adjustment is applied instead of a palette entry's own decision: the only thing a game can declare is an exchange (`PaletteScheme.darkSwaps`), and `darkModePalette` (src/puzzle/dark-palette.ts) gives every index its authored or calculated dark value first and exchanges the declared pairs last. Now its own requirement, 'A game's declared exchange holds over an entry's own decision'.
- The app passes a game pure white as its default background in dark mode: src/puzzle/components/view.ts supplies pure white as the host background, and `resolvePalette` (src/engine/color/color-mkhighlight.ts) shifts it before any `colors()` sees it. The requirement now says the host is pure white.
- A member of a game's own enumerated set (peg, region, tile, digit colors) remains defined by that game: the sets are the engine's named colors (`TEN`, `EIGHT_FILLS`, `FOUR_FILLS`, `TWO` in src/engine/color/colors.ts); src/engine/color/palette-games.ts holds only board-relative derivations prefixed with the game's id. The requirement now says a set member is not a shared role, and that a game-local color is declared in that table under the game's id.
- The undeclared-color guard reads resolved palettes and names the game and the color: src/engine/color/palette-source.test.ts reads game source instead and fails on a color literal, a channel read off the background, or an import of the combinators in color-token.ts, naming file and line, with a recorded list of three-number literals that are not colors. The requirement states those.
- A shared derivation's inputs are tokens: they also take the background the game was handed (`lineNoColor(background)`, `cellSurface(background)`, `mkhighlight`). Both inputs are now named.
- Every meaning holds no value of its own: `INK` and `PAPER` are literal values exempted by name in src/engine/color/palette.test.ts, and the background-derived roles (`lineNoColor`, `cellSurface`, `wallFill`, ...) author values and are skipped by that test. The requirement names the two kinds outside it.
- One hint role is 'the fill behind text the acted-on color is about': `HINT_ACTION` deliberately has no fill (its doc comment in src/engine/color/palette.ts); the fifth role is `HINT_EVIDENCE_WASH`. The requirement now names the five roles the palette has.
- The acted-on color carries twice the chroma of 'either wash': there is one hint wash, `HINT_EVIDENCE_WASH`, the one palette.test.ts measures against.
- The departure check goes by shape 'rather than by the slot's name' and covers every listed meaning: src/engine/color/palette-departures.test.ts finds assignments by shape, then keeps slots whose index name contains CURSOR, HELD, DRAG or HINT. Mistake, piece, retired-clue and completed-region slots are not checked. The check's requirement now names the four kinds.
- The departure check 'reports the number of games and slots it examined and fails if that number is not the collection's': it reports nothing; it asserts the count of game directories equals a number written in the test and that each slot kind reaches an `atLeast` floor.
- A help page's lightness word is answered only by a color pinned dark or light in both schemes: `holdsPinned` in src/help-lightness-words.test.ts also accepts, for 'shaded', a palette holding the `SHADED` role whatever its lightness.
- The bevel guard 'finds a bevel in a game that draws through each shared helper and in a game that draws its own': src/puzzle/bevels.test.ts requires every bevel on a game's frames to come from a shared helper call, so no game draws its own. The scenario now says it sees each shared helper called and fails if no game draws a bevel.

### loopy

- "Loopy is playable from the keyboard alone": the cursor-shape paragraph said "an arrow press chooses an edge rather than moving the cursor". A plain arrow moves the cursor one dot (`geometry.moveCursor` in src/games/loopy/index.ts, `walkEdge` in src/games/loopy/cursor.ts); only a Shift+arrow chooses an edge without moving it (`nextEdgeFor`). The new requirement "Loopy's cursor is held under ui.cursor in its own shape" names the Shift+arrow.
- "Loopy's presets draw tall...": the list of own-size presets named Great-Hexagonal 4x5, Kagome 3x6, Great-Dodecagonal 3x6, Great-Great-Dodecagonal 3x5 and Compass-Dodecagonal 4x5. `PRESETS_TOP` and `PRESETS_MORE` in src/games/loopy/params.ts hold no preset of those five tilings (its comment leaves them to the Custom dialog), and Compass-Dodecagonal's row has `turns: true`. The list now keeps the four that exist: Triangular 9x14, Kites 4x6, Dodecagonal 3x6, Hats 9x11.
- "Loopy's presets draw tall...": "a tiling that cannot turn SHALL take a size of its own that draws taller than wide" was stated for every such tiling. Honeycomb 10x10 and Floret 5x5 in `PRESETS_MORE` are tilings with `turns: false` that keep a square size. The rule is now stated for a preset that upstream draws landscape, as the comment in params.ts has it.

### engine-notes

- Every game in the mechanic offers both pencil preferences: Group offers no sticky preference (src/games/group/index.ts lists only pencilKeepHighlightPref; NoteTakingUi.pencilSticky in src/engine/note-taking-cell.ts is optional for that reason), and the population guard in src/engine/note-taking-cell.test.ts holds only keep-highlight. The spec now requires keep-highlight of every member, defaulted on, and the sticky default (on) only of members that offer it.
- The Mark-all guard's slot-arity ledger scenario ('a slot-arity entry for a game without the press fails'): src/engine/mark-all.test.ts holds no arity ledger and reads every member's `pencil` as one candidate word per cell. Scenario dropped; the rule about what such a ledger would have to satisfy is kept.
- The indicator's repaint decision takes the game's own first-frame flag: repaintPencilIndicator in src/engine/pencil-indicator.ts takes no such flag; PencilIndicatorCache.pencilModeShown being null means the draw state never painted it. The spec now states the cache and that no first-frame flag is passed.
- The Mark-all control sits in the toolbar wa-button-group with Hint and Check & Save: it is a wa-button with data-command="mark-all" in the `others` part of src/puzzle/components/game-controls.ts, beside the Marks key; no wa-button-group element is left in src.
- Repeated Mark-all presses converge to all candidates minus placed values in every empty cell: a cell the player narrowed keeps its narrower notes (the additive rule in src/engine/candidate-hint.ts, and the never-resets property in src/engine/mark-all.test.ts). The spec states that end state for a board the player has not narrowed.
- A game without a row/column uniqueness model keeps fill-only: Map and Abcd have no such model and clean by their own rule (markAll in src/games/map/hint.ts; abcdObviousMarks passed to adaptiveMarkAll in src/games/abcd/index.ts). The spec now says fill-only is for a game supplying neither a region provider nor an obvious-candidate rule of its own (Undead, and Seismic in the code).
- The uniqueness regions are row/column plus sub-block and X-diagonal: Solo's regionsOf (src/games/solo/index.ts), which its Mark-all press passes to adaptiveMarkAllMove, also returns a Killer cage (holdsEvery: false), so a cage that forbids repeats is listed too.
- The Marks key population is what newUi returns as pencilMode ('One way into note-taking'): takesNotes in src/engine/key-labels.ts also counts a board with a `pencil` array, which the later Marks-key requirement already said. Reconciled to 'a game that takes notes'.

### engine-drawing

- Recessed border: the spec said a top-right highlight wedge and a bottom-left lowlight wedge. In `drawRecessedBorder` (src/engine/draw.ts) the highlight pentagon is (right,bottom),(right,top),(right-inset,top+inset),(left+inset,bottom-inset),(left,bottom): it holds the bottom-right corner and runs along the bottom and right edges; the lowlight one holds the top-left corner. src/puzzle/bevels.test.ts reads the halves the same way. The requirement now says bottom/right highlight, top/left lowlight.
- Recessed border examples: the scenario named Samegame and Flood as callers. Only src/games/fifteen/render.ts, sixteen/render.ts and twiddle/render.ts call `drawRecessedBorder`, and src/puzzle/bevels.test.ts pins the bevel-drawing games to exactly those three. Examples corrected.
- Raised tile examples: the scenario named Mines, Inertia, Sokoban and Crossing. Only fifteen and sixteen call `drawRaisedTile`; no game calls `drawRaisedBevel` directly. Examples corrected to Fifteen and Sixteen.
- Pressed-in tile: the scenario named Crossing's walls and its selected digit. src/games/crossing/render.ts calls neither raised-bevel helper, so the scenario now names no game (the rule, swap the two colors, is kept).
- `drawRectOutline` always one pixel thick: the function takes a seventh argument `thickness = 1` and passes it to each `drawLine` (src/engine/draw.ts). The requirement now says one pixel unless a thickness is passed.
- Worker adapter calls `forceRedraw` when `setDrawingFontInfo` replaces a font: no `setDrawingFontInfo` exists in src/puzzle/worker-adapter.ts; the font arrives once via `attachCanvas`, and src/puzzle/drawing.ts says "There is no `setFontInfo`". The adapter rule now names only `setDrawingPalette`.

### guess

- `validateParams` rejects `ncolors < 2`, `npegs < 2`, `ncolors > 10`, `nguesses < 1`: false. `validateParams` in src/games/guess/state.ts tests only `allowMultiple = false` with `ncolors < npegs`; the other limits are `bounds` on the `paramConfig` number items in src/games/guess/index.ts, refused by the engine's `paramsError` (src/engine/params.ts). Spec now says the bounds are declared and the engine refuses.
- `validateDesc` SHALL reject a bad desc: the game has no `validateDesc` hook. `newState` (via `parseDesc`/`readDesc`/`descValue` in src/games/guess/state.ts) refuses, and the engine's `validateDesc` in src/engine/desc-error.ts reads that. Spec now puts the refusal on `newState`.
- The `Game<...>` type-argument list of six: `guessGame` takes eight (`GuessHighlights`, `GuessRung` added). Spec now says only that it implements `Game`.
- "A key SHALL act whether or not the cursor is shown": true only outside notes mode. In notes mode `interpretMove` declines a color key and Clear when `markSlot` returns -1 (cursor not shown). Spec scopes the rule to outside notes mode and states the notes-mode decline.
- "Its height SHALL be the guess rows' alone": `computeSize` in src/games/guess/render.ts adds `ANSWER_ROWS` (1.5 tiles) to the guess rows. Spec now says the guess rows and the answer row, with no palette term.
- The status line always names the guess in progress: once the game is over `statusbarText` reports "Solved in N guesses." or "Out of guesses: the answer is revealed." Spec scopes the rule to a game in play.
- "The cursor SHALL rest ... on the submit position when the row has none [empty]": `restCursor` in src/games/guess/index.ts rests there only when the row is markable; a full row that cannot go (a repeat under no-duplicates) keeps the cursor on the slot just entered, or slot 0 after a transition.
- "Every pointer action SHALL happen on the release, and the press SHALL be declined": the hold toggle acts on the `RIGHT_BUTTON` press and consumes it (index.ts `if (button === RIGHT_BUTTON)`). Spec now excepts the hold toggle.
- A mark step draws "the row it reads outlined": the row is hatched, the `stripes` role in `hintMarks` (index.ts), drawn with `drawHatch` in render.ts. Spec says striped.
- "The hint SHALL refuse only once the game is over" and "every plan SHALL end with a guess": `guessHint` in src/games/guess/hint.ts also returns `SEARCH_OUT_OF_REACH` when its enumeration budget finds no fitting answer and no mark step remains, and returns the mark steps with no probe when some remain. Spec states both cases.
- "A right-click or held finger on the answer row SHALL do nothing": only the press is declined. The frontend answers an unconsumed press with a release (src/puzzle/components/view-interactive.ts), and `isMouseRelease` answers for `RIGHT_RELEASE` too, so the release selects the slot and switches notes mode on, as a tap does. Spec now says it marks nothing, the press is declined and the release selects.
- "A mark SHALL never be reported as a mistake": superseded by the later requirement in the same spec; `findMistakes` in state.ts reports a slot whose rule-outs include the code's color. Reconciled into "Guess checks the answer row's rule-outs against the code", which now adds that no other mark is reported.

### crossing

- A game ID encodes the symmetry: the `S` flag is declared `{ full: true }` in the `paramsCodec` call in src/games/crossing/state.ts, so only the full params encoding carries it. The spec now says the full encoding carries a trailing `S`.
- Description validation has only four checks and accepts an over-short description or an invalid digit character: `parseDesc` in src/games/crossing/state.ts reads through `readDesc`, whose reader fails an early end as DESC_TOO_SHORT, and it also fails a clue character that is not 1 to 9 (descBadCharacter), a clue number under 2 or over 9 digits (DESC_OUT_OF_RANGE), and a clue list whose lengths do not match the board's runs one for one (DESC_CONTRADICTORY). The spec now lists these.
- A left click selects for digit entry and a right click for pencil marking, unconditionally: `pressNoteTakingCell` in src/engine/note-taking-cell.ts does that only with `pencilSticky` off. `newUi` in src/games/crossing/state.ts sets it on, where a right press toggles pencil mode and a left press selects in whichever mode is on. The spec now states both cases.
- A placed digit is drawn in one ink: `drawCell` in src/games/crossing/render.ts draws the digit in COL_RUNTEXT (PAPER) when the square's fill is a run's direction wash, and COL_TEXT otherwise. The spec now says so in 'A wash replaces a square's surface, empty or filled'.
- With a cell selected, clicking a fitting clue places it at once, in either entry mode: `interpretMove` in src/games/crossing/index.ts does so only under `ui.cursor.visible && !ui.pencilMode`, otherwise the clue is held. The spec now says 'selected for digit entry'.
- The hint owns the background of the squares it marks (given as the reason for the legible selection cue): `drawCell` in src/games/crossing/render.ts leaves the background to the selection's wash under a hint, which is a ring on the square's border plus a translucent hatch. The rule (a legible selection cue on a hinted square) is kept, the false reason dropped.

### solo

- Game type arguments: the spec gave six; `soloGame` in src/games/solo/index.ts is a `Game` of eight (adds `SoloHint`, `SoloRung`). The rewrite names the interface only.
- `validateParams` enforces a known difficulty and every upstream bound: it does neither. src/games/solo/state.ts `validateParams` checks only cr <= 31, killer cr <= 9 and X cr >= 4 (plus no-such-tier refusals); single-field limits are `numberItem` bounds and the difficulty is a `difficultyItem` choice, both refused by the engine.
- Cursor-select highlights for a real entry and select2 highlights for a pencil mark: in `interpretMove` the select key toggles pencil mode while the highlight shows (`toggleNoteTakingMode`), and `CURSOR_SELECT2` (space) clears the cell.
- A right-click on a given or filled cell toggles pencil mode without selecting, unconditionally: true only in sticky mode. `applyPress` in src/engine/note-taking-cell.ts, with sticky off, turns pencil mode on and moves the (hidden) highlight to the cell.
- `M` fills every empty cell with all candidates: `adaptiveMarkAllMove` yields `pencilAll` only while some empty cell has no marks, `applyNoteMove` fills only note-less cells, and on a fully noted board the key strikes the obvious candidates as one `pencilStrike`, or makes no move.
- A completing placement marks the state completed: `SoloState` has no completed flag; `status` derives solved from the grid via `checkValid`.
- Killer cages are drawn dashed: `drawNumber` in src/games/solo/render.ts draws plain inset `drawLine`s in `COL_KILLER`; nothing dashes.
- The pencil indicator shows only for persistent pencil mode: `redraw` passes `ui.pencilMode` to `repaintPencilIndicator` whether or not the mode is sticky.
- Keep-mouse-highlight preference defaults off, matching upstream: `newUi` sets `pencilKeepHighlight: true` (body and scenario both corrected).
- The hint populates any board with no notes before eliminating: `newUi` sets `candidateReading: "implicit"`, under which the walk (src/engine/candidate-plan.ts) emits no fill-all step; the populate step belongs to the populate reading only.
- Basic-region strikes reach row, column, block and diagonals: the clean reads `regionsOf`, which also includes the killer cage.
- Every placement concludes "can only be N": only the naked single does; `say.hiddenSingle` and `say.cageSingle` conclude "must be N".
- Hint cues are shade / ring / cross-through, with regions shaded and struck candidates in the hint color: `hintMarks.roles` declares ring, outline and stripes; regions are striped (`mark.this("stripes", ...)`), and `drawPencilMarks` strikes a candidate through in the pencil color. Corrected in the body and in three scenarios (region elimination, positional single, deduced extra-cage).
- Killer narration reads "this cage must sum to V": `say.cageMinMax` reads "This killer cage must total V".
- Solo's `hint` returns the solved and mistakes refusals: `computeHintPlan` in src/engine/midend.ts returns `ALREADY_SOLVED` / `FIX_MISTAKES_FIRST` before calling the game's `hint`; Solo's `hint` never asks `findMistakes`.
- The note a hint step adds is always populate's: under the implicit reading the walk writes notes with `pencilAdd`.
- A `pencilStrike` clearing a subset of a step's marks is `onTrack`: `keepCandidateHintTrack` completes only on a `pencilStrike` of exactly the step's marks (any other is `off`); it is a pencil toggle (`set { pencil }`) clearing one mark that shrinks the step.
- Givens are removed in symmetry orbits on every variant: `newSoloDesc` removes orbits only on the non-killer path; a killer board ships with no givens and is kept only when `dlev.diff === maxdiff && dlev.kdiff === maxkdiff`.
- Every hint mark stays in the gutter: only the ring and outline do (`markBand`); stripes are hatched inside the tile by `ds.hint.drawHatch`, and the strike-through is drawn among the pencil marks.

### bridges

- Game generics: the spec listed six type arguments; `bridgesGame` in src/games/bridges/index.ts is declared with eight (adds `BridgesHighlights`, `BridgesRung`). The requirement now says `Game`.
- Invalid-params scenario: the spec said `validateParams` refuses 3x3 at the default density as too small for the minimum island count. `validateParams`/`sparseRefusal` in src/games/bridges/state.ts accept it at Easy (island target is three) and refuse it only at a tier above Easy. The scenario now names 3x3 Normal, in full validation.
- Desc validation: the spec said a desc is rejected for an island count no legal bridge configuration could satisfy at the grid edge. `parseDesc` in state.ts makes no such check; it refuses too long, too short, a character that is not a count 1-16 or a run length, two orthogonally adjacent islands, and fewer than two islands. The requirement lists those.
- Keyboard: the spec said `CURSOR_SELECT` grabs and drops a keyboard drag. In `interpretMove` (index.ts) the second `CURSOR_SELECT` cancels the drag and returns the `M` move, toggling the island's completed mark. The requirement says both.
- Live-error and `findMistakes` overlays 'SHALL be distinct': `redrawBridges` (render.ts) sets the one warning bit for an impossible island, a group/loop warning and a mistake alike and draws all in the one red. The requirement now says the mistake overlay is drawn in the live-error red with no palette entry of its own (which the old renderer requirement also said, so the two were reconciled).
- Hint plan from 'the same three DeductionTechnique objects': `Solver.ladder()` in solver.ts returns four (stage1-arithmetic, stage2-counting, stage2-sealing, stage3-connectivity). The requirement gives no count.
- 'The three premises that count a group SHALL mark every member alike': `namesFocus` in hint.ts leaves the island unnamed for two group premises (`wouldSealGroup`, `wouldCloseLoop`); the third group premise, `mustReachOut`, names its island and recolors it in the action color. The rule now binds a premise that counts the group without naming the island.
- Solver 'returns an impossible / ambiguous / solved verdict': `solveFromScratch` returns 1 for solved and 0 otherwise (contradiction included), and `solveAtCap` in index.ts reports only "solved" or "unsolved". The requirement says it reports whether it solved the board.
- Stage 2 'using each neighbor's own remaining capacity': `solveIslandStage2` sums `islandIsadj`, which is the span's possible count (lesser clue and limit) or the bridges on a locked span, not what the neighbor still needs. The requirement says 'the most its other directions can hold'.
- Renderer draws an 'in-progress drag preview line': `redrawBridges` recolors the drag's two islands and any bridges already between them; on an empty span it draws no line (`ui.todraw` is never read). The requirement says the recoloring.
- Renderer draws a 'keyboard cursor ring': `drawIsland` fills the island's face with the cursor wash (`COL_CURSOR` as background) and leaves the rim alone. The requirement says a wash on the face.
- `show-hints` draws 'faint COL_HINT lines indicating forced or forbidden bridges': the lines are `COL_POSSIBLE` (in render.ts `COL_HINT` is the hint system's action color) and run along every span between two in-line islands carrying no bridge and no cross, i.e. where a bridge could go. Requirement and scenario corrected.

### galaxies

- Move types as the letters `E`, `A`/`a`, `U`, `M`, `s`: a move is `{ ops, solving }` with ops of kind `edge`, `assoc`, `unassoc`, `hold` (`GalaxiesOp`/`GalaxiesMove`, src/games/galaxies/index.ts). The requirement now lists the kinds of move in words.
- `solved` when every component 'matches its dot's associations': `checkComplete` (src/games/galaxies/state.ts) reads only set edges and dots; a region is valid when symmetric about the one dot at its center, with no other dot on it and no set edge inside. Associations are never read. Requirement restated, with 'Associations SHALL NOT enter the check'.
- Scenario 'a release where nothing can commit (the source, ...) removes the dragged arrow': `dropDrag` (index.ts) returns UI_UPDATE before building any op when a classic drag is released on its source tile, so the arrow stays. Requirement now says a release on the starting tile changes nothing; off-board and uncommittable releases still remove the arrow.
- 'A dot move SHALL animate the dot along its shortest path (upstream's movedot_cb)': there is no dot-moving move, `animLength` returns 0, and upstream's `movedot_cb` (../puzzles/galaxies.c:1065) is a generator helper. Dropped, including the 'dot moves animate along their path' scenario clause.
- Status bar reports 'move count, completion state, and difficulty': `statusbarText` (index.ts) returns only `Difficulty <word>.` (changed deliberately in 730b4ce0, the engine owning status-bar wording). Requirement now states the difficulty only.
- 'Colors SHALL be derived from the supplied default background' as a rule for every color: `colors()` derives only the surfaces and grid from the background and pins dots (WHITE/BLACK), ink, cursor, drag, mistake and hint colors, as the spec's own later requirements demand. Requirement now says the surfaces.
- 'Evidence SHALL be highlighted as an area': no hint role fills a cell; `drawSquare` (src/games/galaxies/render.ts) outlines evidence cells with inset rings and hatches the named galaxy. Requirement now names the legend's evidence role and no shape.
- 'Rule-outs SHALL be shown as evidence highlights': the sole-owner step marks only the surviving dot and leaves ruled-out dots unmarked (`marksOf` case `soleOwner`, src/games/galaxies/hint.ts). Requirement now: a rule-out is never demanded as a move, and where shown it is shown as evidence.

### tracks

- Game type arguments ending in `TracksMistake`: `tracksGame` in src/games/tracks/index.ts is `Game<TracksParams, TracksState, TracksMove, TracksUi, TracksDrawState, Point, unknown, TracksRung>` and no `TracksMistake` type exists. The requirement now names `Game` alone.
- Params field `single_ones`: the field of `TracksParams` (src/games/tracks/state.ts) is `singleOnes`. Corrected in the body and the round-trip scenario.
- `validateParams` enforces the 4x4 minimum: `validateParams` has no size check. The minimum is `bounds: { min: 4 }` on the dimension items of `paramConfig`, refused by the engine's `paramsError` (src/engine/params.ts). Restated as the config's bound that the engine refuses on.
- `validateDesc` rejects malformed descs: the game has no `validateDesc`. The parse inside `newState` (state.ts `parseDesc`) refuses each case, and the engine's `validateDesc` (src/engine/desc-error.ts) reads that refusal. Restated on `newState`.
- `findMistakes` returns one mistake per square or edge: it returns one `Point` per square, reported when the square's own mark or a mark on one of its edges contradicts the solution (index.ts `findMistakes`), so a wrong edge reports the squares it borders.
- The hint runs the rungs through one `runDeductionFixpoint` call: `tracksRecordingPass` (solver.ts) runs the ladder through the engine's `singleFirings`, one firing at a time. Only `tracksSolve` calls `runDeductionFixpoint`.
- Hint marks are drawn from `TracksHighlights`: no such type exists. `redraw` (render.ts) reads the marks the step's words carry through `stepMarks`, in the roles `ring`, `outline` and `stripes`.
- The generator's 4x4 Normal/Tricky to Easy fallback: `newDesc` (generator.ts) has no fallback. `validateParams` refuses a 4x4 above Easy with `noSuchTier` when `full` is set, and tracks.test.ts pins `4x4dt` and `4x4dh` as absent tiers. The refusal is now a requirement with a scenario.
- A clue's completed-count mismatch is an error 'once a path exists': `checkCompletion` (state.ts) applies it only while `pathret` holds, which needs the path and no cell in error. A board with a path and stray track elsewhere does not flag the count. The requirement now says 'and no cell is in error'.
- The '15x15 Hard deals' scenario's tier names 'Hard' and 'Tricky': `DIFF_NAMES` is `tierNames(3)`, i.e. Easy, Normal, Tricky, so `DIFF_HARD` is shown as Tricky and the tier below is Normal. The scenario now reads 'Tricky (`DIFF_HARD`)' and 'not at Normal', matching the old spec's own first requirement.

### palisade

- `Game` type arguments: the spec listed six by name; `palisadeGame` in src/games/palisade/index.ts takes eight (adds PalisadeHint, PalisadeRung). The spec now says only `Game`.
- `validateParams` requires k, w, h >= 1: it checks none of them (src/games/palisade/state.ts). The `bounds: { min: 1 }` declared in `paramConfig` are what the engine's `paramsError` refuses on (test expects "Region size must be at least 1."). Spec now says the declared bounds refuse.
- `k < w*h` required at every validation: `validateParams` returns null when `full` is false before that check, so `k = w*h` is refused only under full validation, like `k = 2`.
- The generator's aux is the solution border set: `newDesc` in src/games/palisade/solver.ts returns `{ desc }` only; `solve`, `findMistakes` and `hint` re-solve from the clues. Sentence removed.
- `redraw` draws the background once on first draw: `drawBorderGridBackground` (src/engine/border-grid-render.ts) draws only the corner dots, over the ground the midend lays.
- A wall is reddened when 'the player's walls enclose a region larger than k': `borderErrorBits` measures too-large over cells joined by no-wall marks (the 'yellow' DSF), not over what walls enclose, and reddens the edge between such a group and a neighbor whether or not it is a wall. Too-small is over wall-bounded regions. Rule and scenario corrected; an undersized-region scenario added (the render test covers it).
- Conclusion phrased "clear this one, then the rest": no such sentence in src/games/palisade/hint-text.ts; the multi-edge conclusions are "draw them all", "its remaining edges can't be walls", "both must be walls", "neither can be a wall". Examples replaced.
- Referenced cells are 'a clue pair, the clue cell, or the region': `noDanglingEdges` also cites the four squares meeting at a corner. Added to the list.
- Every edge the firing forces is painted on every leg: `borderHintJourney` (src/engine/border-grid-hint.ts) rings `edges.slice(leg)`, so an edge already set drops back to normal. Spec now says the firing's edges not yet set.
- Every referenced cell, the `equivalentEdges` region included, is outlined in COL_HINT_CELL: `say.notTooSmall` and `say.equivalentEdges` mark their region with `stripes`, which `drawBorderTile` draws as a hatch in the hint-edge color (COL_HINT). Only clues, corners, clue pairs and the two `notTooBig` regions are outlined.
- Legend scenario: a `notTooSmall`/`equivalentEdges` region is outlined in a color different from the forced edges: those regions are hatched in COL_HINT, the edges' own color (F_HINT_REGION); only `notTooBig` regions are outlined in COL_HINT_CELL. Scenario split and corrected.
- 'undecided -> wall -> no-wall tri-state cycle': `edgeEdits` in src/engine/border-grid.ts has no three-step cycle. Left toggles wall against undecided, right toggles no-wall against undecided, and an edge in the other button's state goes straight to the pressed button's. Reconciled with the edges requirement, which now states this once.
- 'The explained hint's own marks' stay Palisade's: the marks are drawn by `hintTileBits` and `drawBorderTile` in the shared src/engine/border-grid-render.ts; what stays in the game is the sentences in hint-text.ts that name them.

### netslide

- `validateParams` requires width and height above one, a barrier probability in [0, 1] and a non-negative move target: false. `validateParams` in src/games/netslide/state.ts refuses only an oversized area (AREA_TOO_LARGE); the three ranges are `bounds` on the `paramConfig` items in src/games/netslide/index.ts and the engine's `paramsError` refuses them. Rule and scenario reworded to the engine's params check.
- `validateDesc` rejects unexpected characters and wrong lengths: the game has no `validateDesc`. `newState` refuses through `parseWireDesc`/`descValue` (src/engine/wires.ts) and the engine derives the verdict. Reworded to 'SHALL be refused'.
- Barriers are shared 'frozen': nothing freezes the array (Object.freeze throws on a populated typed array); the `readonly` type on `NetslideState.barriers` is the guarantee. Reworded to shared by reference and never written after `newState`.
- The game's status bar reports whether the game is complete or was auto-solved: `statusbarText` in src/games/netslide/index.ts returns only moves, target and active count; the midend prefixes the completion words via `completionStatus`. Pointed at ts-engine 'The status bar's completion words come from the engine'.
- A line that cannot be slid is named by its number ('row 3 never slides'): `say.rowFixed`/`say.colFixed` in src/games/netslide/hint-text.ts say 'This row never slides' / 'This column never slides' and the line is hatched, because the board draws no numbers. Rule and its scenario corrected.
- Solve's avoided refusal reads 'Solution not known for this puzzle': the text is `SOLUTION_UNKNOWN` in src/engine/solve-failure.ts ('This game ID doesn't include its solution, and this puzzle has no solver to work one out.'). Scenario no longer quotes a sentence.
- Check & Save 'degrades to a plain quick-save': `check()` in src/engine/midend.ts still asks the hint whether the position is a dead end or out of reach when the game has a hint. Reworded to 'Check & Save SHALL flag no mistake on any board'.

### towers

- `validateParams` requires 3 <= w <= 9: it checks no size. The bounds 3 and 9 are declared on the grid-size item of `paramConfig` (src/games/towers/state.ts) and `paramsError`/`itemError` in src/engine/params.ts refuses outside them ("Grid size must be at least 3."). `validateParams` refuses only a 3x3 above Normal when full. The scenario was corrected the same way.
- `validateParams` requires a known difficulty when full: `choice` in src/engine/params-codec.ts leaves the default tier on an unknown letter (Towers passes no `invalid`), so nothing is refused.
- `validateDesc` rejects malformed descs: Towers has no `validateDesc` hook. The one reading `newState` builds from (`parseDesc` through `descValue`, src/games/towers/state.ts) refuses them and the engine takes its verdict from that.
- The `_` separator in the givens is optional: `parseDesc` requires it between two adjacent givens and refuses it anywhere else, matching what `encodeDesc` in generator.ts writes.
- select / select2 pick the real-entry / pencil highlight: `toggleNoteTakingMode` (src/engine/note-taking-cell.ts) makes `CURSOR_SELECT` toggle pencil mode while the highlight shows, and `interpretMove` makes `CURSOR_SELECT2` (Space) clear the cell.
- A 3D tower protrudes into its up-left neighbors: `drawTile` in src/games/towers/render.ts shifts the top right by `x3d` and up by `y3d`, and `redraw` repaints a clip when the tile to its left, below or below-left changed, so the reach is up and to the right.
- The keep-highlight preference defaults off: `newUi` sets `pencilKeepHighlight: true`.
- A sticky right-click always moves the highlight to the clicked cell: `applyPress` in src/engine/note-taking-cell.ts leaves the highlight where it was when the cell can take no mark.
- A hint's steps are of three kinds unconditionally: `buildSteps` passes the `hint-notes` reading to the walk, and under `implicit` there is no fill-all and notes are written with `pencilAdd`. The three kinds are stated for the `populate` reading `newUi` starts on.
- A multi-cell firing is one step with a single `pencilStrike`: `strikeAxis: (op) => op.n` in src/games/towers/index.ts makes a firing that rules out two heights one step per height.
- At each step a naked single is preferred ahead of any elimination: the walk's `HintFrontier` takes a firing continuing from the plan's latest steps before rung order decides, so the order is stated as the rung order a freshly built plan opens in.
- The hint shades the driving clue and its line of sight: hint-text.ts outlines the clue in its slot and stripes the line, and render.ts draws the marks on the cell's border.
- Struck candidates are marked in the hint color: `drawTile` crosses them through in the pencil color, and the hint color rings the cell.
- Towers' `hint` refuses on a solved board or one with mistakes: `candidateHint` refuses only an empty plan, and the midend gives both refusals before the game is asked (engine-hints: The midend SHALL refuse a hint on a finished or wrong board before asking the game).
- A recomputed hint leads to a solved board from any solvable mistake-free position: `buildSteps` caps the recording at `DIFF_EXTREME`, so on an Unreasonable board the plan can come up empty and `candidateHint` refuses with the deduction-exhausted sentence. Restated for a board whose tier needs no search.
- A `pencilStrike` clearing a subset of the step's marks is `onTrack`: `keepCandidateHintTrack` completes on a `pencilStrike` of all the marks and is `off` on any other. The step shrinks on a pencil toggle (`set` with `pencil`) that clears one of its marks.
- Scenario 'on an empty board the first step fills the notes': the walk takes a naked single or one of Towers' note-free clue lines (`extremeClueLines`) before the fill, and emits no fill under the implicit reading. The scenario now conditions on the populate reading and on nothing being placeable without notes.

### map

- `validateParams` enforces `w >= 2`, `h >= 2`, `n >= 5`: false. `validateParams` in src/games/map/state.ts tests only `n > w*h` and the area overflow (plus tier refusals). The three minimums are `bounds` on the `paramConfig` items in src/games/map/index.ts (`dimensionParamConfig` min 2, `numberItem` regions min 5), which the engine checks before it asks the game (src/engine/params.ts `itemError`). Corrected in "Map refuses params that describe no map"; its scenario no longer names `validateParams` as the hook that returns the error.
- The game SHALL provide `textFormat`: false. `mapGame` in src/games/map/index.ts has no `textFormat`, and nothing under src/games/map/ defines one. Dropped from "Map game implements the Game interface".
- `Game<MapParams, MapState, MapMove, MapUi, MapDrawState, MapMistake>` (six type arguments): `mapGame` is typed with eight, adding `MapHint` and `MapRung`. The rule now names `Game` alone.
- `redraw` draws with a `BORDER` of 0: false as stated. `computeSize` in src/games/map/render.ts grows the canvas with `pencilIndicatorCanvas`, and `origin(ts)` starts the board at `pencilIndicatorReach(ts)`. Corrected to "Map's board has no border of its own": no border of its own, canvas grown on every side by the pencil-mode indicator's room.
- Generator scenario's "or the generator's documented fallback for pathologically dense/sparse maps": there is no fallback. `newMapDesc` in src/games/map/generator.ts loops until a board is unique at the tier and not at the tier below, and `retryLimit` throws when the budget is spent. The scenario now says exactly the requested difficulty, and the requirement carries one `SHALL NOT` fall back.
- Hint scenario "A pair's undotted region is dotted before the pair is stated" said the first step "outlines the other" region: false. `say.pairDot` in src/games/map/hint-text.ts marks only the ringed region (its comment: "nothing else is marked"), and src/games/map/map-hint.test.ts holds a pair's premise leg to outlining nothing. Scenario now says it outlines nothing.

### subsets

- The unsupported-parameters scenario called the refusal upstream's "only 4x4 supported" message. `validateParams` in src/games/subsets/state.ts returns "Currently only 4x4 puzzles are supported."; the scenario now quotes that sentence.
- Rendering was said to show the tally "with its placement count". `redraw` in src/games/subsets/render.ts draws no count: it colors an entry by whether the set is placed never (ink), once (used-up color) or more than once (error color). The requirement `What Subsets draws` now says that.
- Touching the reference aid was said to dismiss a displayed hint, unconditionally. `uiUpdateClearsHint` in src/games/subsets/index.ts is `(step) => step.move.kind !== "rule"`, so a rule-out step stays up, because following it by hand starts with the cell's inspect icon. The requirement `Touching the reference aid dismisses a displayed hint` now carries that exception, with a scenario.
- "The solver SHALL take an explicit difficulty cap, with no default" holds only for `subsetsSolveGame`. `solveCopy` and `deduceHintPlan` in src/games/subsets/solver.ts both default `maxdiff` to `DIFF_TRICKY`, which is what the Solve action and `hint()` use. The requirement `The solver takes an explicit difficulty cap` keeps the no-default rule for the solver and adds that Solve and the hint run at the top of the ladder.

### inertia

- Check & save 'degrades to a plain quick-save' because the game has no findMistakes: false. `canCheck` in src/engine/midend.ts is `findMistakes !== undefined // hint !== undefined`, and Inertia has a hint, so Check & save runs the check and a dead end (dead ball, stranded gem) refuses the save. The quick-save spec's 'Check & save gates the checkpoint on a clean board' agrees with the code. The sentence was removed from 'Inertia has no mistake check'.
- Scenario 'validateParams is given a grid with a dimension below 2 ... returns a non-null error': `validateParams` in src/games/inertia/state.ts tests only the safe-integer area and area < 6. The floor of 2 is `bounds: { min: 2 }` on `paramConfig`, refused by the engine's `paramsError` (src/engine/params.ts) before the game's hook. Corrected in 'Inertia's parameters and presets'.
- Collecting narration 'SHALL name what it sweeps up and what brings the ball to a halt': `say.collect` in src/games/inertia/hint-text.ts names the stopper only when the slide is not the ball's only move. When it is, the sentence gives the walls-or-mines reason and the sweep, with no stop clause. Corrected in 'A collecting move names what it sweeps up and what stops the ball'.
- Stranding narration fires 'when the subgoal gem could be swept up by a single slide from here' that strands another: `narrate` in src/games/inertia/hint.ts reaches that test only after the collecting and forced branches, so a suggested slide that itself collects the gem from a safe side is narrated as collecting. The rule is now conditioned on the suggested slide collecting nothing ('A stranding grab is called out').
- Positioning 'when the slide collects nothing, the narration SHALL say that no slide from here reaches the subgoal gem': `narrate` says so only when `oneSlideGrab` finds no non-fatal grab. A grab it could take and cannot prove a trap gets the `declined` rung ('you could grab it from here, but the route comes at it from another side'). 'A positioning move's premise is checked' now states both.
- 'The aim arrow of a swipe in progress SHALL take precedence over both' the ring and the hint arrow: `redraw` in src/games/inertia/render.ts draws the ring from the hint's marks regardless of the swipe. Only the arrow gives way, and only while `aimDir >= 0` (a swipe held on the ball with no direction still shows the hint's arrow). Corrected in 'The hint is drawn as a marked gem and an arrow'.

### undead

- `validateParams` requires `w >= 3` and `h >= 3`: `validateParams` in src/games/undead/state.ts checks only `w*h <= 54`; the minimum of 3 is `bounds: { min: 3 }` in `paramConfig`, refused by `paramsError` in src/engine/params.ts. The spec now says which side refuses which, and the scenario goes through the engine's params check.
- `validateParams` requires a known difficulty: nothing refuses one. The codec leaves the default tier for an unknown letter (state.ts comment on `paramsCodec`), and `diffToLevel` reads an unknown value as Normal. The spec now says an unknown letter decodes as the default tier.
- `Game<...>` with six type arguments: `undeadGame` in src/games/undead/index.ts takes eight (adds `UndeadHint`, `UndeadRung`). The spec now says only `Game`.
- `validateDesc` SHALL reject: the game has no `validateDesc`; the reader inside `newState` (`parseDesc` in state.ts) refuses and the engine derives the verdict. The spec now says 'reading a description SHALL refuse'.
- 'A monster-letter count that disagrees with the totals': `parseDesc` compares the number of monster cells (runs and givens together) with the sum of the three totals. Reworded to that.
- Mark-all fills every undecided cell with all candidate notes: `executeMove` case `markAll` fills only an empty cell whose notes are empty and never resets a narrowed one (and `interpretMove` returns null when no such cell exists). Requirement and scenario corrected.
- `executeMove` marks the game solved: it sets no flag; the `status` hook (state.ts `status`, via `recomputeErrors` on a clone) reads solvedness from the board. Spec now says the game SHALL be solved when..., without naming executeMove as the marker.
- `redraw` paints red every placed cell of an over-placed type and the whole failing sightline: render.ts reads `cellErrors` for staleness only and colors no cell from it (the file header says so explicitly); only the count block (`drawMonsterCount`) and the clue (`clueColor`) turn red. The flags are still computed in state; the spec now separates flagging from painting, and the over-placing scenario asserts only the count.
- Count-display style is an in-play toggle: `interpretMove` has an in-play key only for the letters display (`A`/`a`); `UndeadUi.countStyle` is documented 'Set in Preferences only - no in-play toggle'. Corrected.
- Pencil-mark UX scenario 'right-clicks empty cells -> pencil notes toggle': with sticky pencil on, a right-click is the mode switch (`applyPress` in src/engine/note-taking-cell.ts); a note is toggled by a monster key. Scenario rewritten to noting a monster in one cell and then another without leaving pencil mode.
- The narration SHALL teach the sighting rule (and the scenario 'explains the mirror-sighting rule'): `say.sightline` in src/games/undead/hint-text.ts says only "This sightline's a and b leave no room for a X in this cell, so we must cross out ..."; its comment leaves the rule to help/games/undead.md per docs/games/hints.md § "Rules belong in the help". Spec now requires the step to name the line and its two clues.
- Placement target is a solid `COL_HINT` fill and the sightline evidence is shaded `COL_HINT_CELL`: both are outlines on the cell's edge painted by `HintMarks` after the cell loop in render.ts; the cell keeps its ordinary background (this also reconciles with the later surface requirement's 'hint's marks stay on the cell's edge').
- `COL_HINT` and `COL_HINT_CELL` are 'appended' to the palette: `COL_CELL` (13) and `COL_GIVEN` (14) follow them in render.ts. Spec now says they are in the palette.

### singles

- Size bound 'both <= 62': the dimension items declare max MAX_DIM = DESC_ALPHABET_SIZE - 1 = 61 (src/games/singles/state.ts); singles.test.ts expects "Height must be at most 61." Spec now says 61, with the alphabet as the reason.
- 'validateParams SHALL require' the bounds and a known difficulty: the game's validateParams checks only Normal on a small grid; bounds and the choice are refused by the engine's paramsError/itemError from the declared items (src/engine/params.ts). Spec now says 'Params SHALL be refused', and the scenario no longer names validateParams.
- Known difficulty checked only 'when full': itemError checks a choice against its list whether or not params are full (src/engine/params.ts).
- 'validateDesc SHALL require' length and range: the game declares no validator; newState/parseDesc raises the refusal (src/games/singles/state.ts) and the engine derives the verdict (src/engine/desc-error.ts). Spec now says 'A desc SHALL be refused unless'.
- 'executeMove SHALL set the board completed': SinglesState has no completed field; executeMove only marks errors, and status reads checkComplete off the board (src/games/singles/solver.ts). Spec now states it of status.
- 'solve SHALL mark the state as solved-with-help': no state field records it; the move carries solve: true (diffMove, src/games/singles/index.ts) and the midend keeps the solver record (cheated, src/engine/midend.ts). Spec now says the move is marked solve: true.
- Flash withheld from 'a solved-with-help' completion: midend becameSolved withholds it only from the Solve command's own transition (pendingSolve); a board finished by hand after a Solve does flash (src/engine/midend.ts). Spec now says 'a completion that is not the Solve command's'.
- 'hint SHALL refuse' on a solved or mistaken board: computeHintPlan returns ALREADY_SOLVED and FIX_MISTAKES_FIRST before calling the game (src/engine/midend.ts); the game's hint refuses only with DEDUCTION_EXHAUSTED when the solver forces nothing (src/games/singles/index.ts). Spec now says both refusals are the midend's.
- 'Difficulty SHALL downgrade to Easy when min(w,h) < 4': newSinglesDesc generates at the difficulty asked for; validateParams refuses Normal (noSuchTier) when generating only where both w and h are under 4 (src/games/singles/state.ts; singles.test.ts describeAbsentTiers 2x2dk, 2x3dk, 3x2dk, 3x3dk). Now its own requirement, 'Normal is refused on a Singles grid under 4 squares both ways'.
- The corner narration's contradiction order and sentence shape were stated of 'the corner deduction' generally: only say.corner2 ends that the target stays not shaded; the three- and four-number corner sentences end that their cell must be shaded (src/games/singles/hint-text.ts). Both requirements now name the corner deduction from two matching numbers.
- The Game type-argument list of six: singlesGame is typed with eight (SinglesHint and SinglesRung added) (src/games/singles/index.ts). Requirement now says `Game`.

### sokoban

- Description alphabet 'covers labeled capital-letter barrels and their on-target forms': false. `DESC_LETTERS` in /Users/yoni/personalCode/simon-tatham-puzzles/puzzles-ts/src/games/sokoban/state.ts is `/^[swptdbfuvA-Z]$/`, and its comment says a labeled barrel's on-target control character has no place in an ID. The new spec says the alphabet covers labeled capital-letter barrels only.
- Hint: 'The offered push SHALL be one after which the line the search finds is shorter than the plan, wherever some push is': false as an unconditional rule. `hint` in /Users/yoni/personalCode/simon-tatham-puzzles/puzzles-ts/src/games/sokoban/hint.ts tries the other pushes only until `ALLOWANCE` (positions per request) is spent, and offers the plan's first push where it found none (the file's header comment says the same: 'nothing proves the walk from there'). The new spec says 'wherever the hint finds such a push within the positions a request is allowed; otherwise it SHALL be the plan's first push'.

### seismic

- "Presets SHALL stop well inside the bound": false in Seismic mode. The 8x8 Seismic presets in PRESETS (src/games/seismic/state.ts) are 64 cells, exactly MAX_CELLS_SEISMIC; the test in src/games/seismic/seismic.test.ts asserts only that each preset passes validation and is at most 8x8 in either mode. Corrected in "A preset is never a long wait" to: every preset passes validation and is no larger than the largest area whose worst observed run is short, in either mode.
- "In Seismic mode two equal numbers Z on the same row or column SHALL be at least Z cells apart": placeNumber and validateGame (src/games/seismic/solver.ts) bar a Z from the Z cells either side, so a distance of exactly Z clashes. Corrected to "at least Z cells between them", which is what the Purpose and the ruleset's own player-facing sentence already say.
- "Validation ... SHALL otherwise accept it" (descriptions): parseDesc in src/games/seismic/state.ts also refuses a clue of 0 (DESC_OUT_OF_RANGE) and a clue list that runs past or stops short of the board (DESC_TOO_LONG, r.end()). Both added to "A Seismic description is validated against its regions".
- "a mark-all action that fills every empty cell with all of its region's candidates": the pencilAll arm of executeMove (src/games/seismic/index.ts) fills only an empty cell with no notes, and interpretMove emits no move unless anyEmptyLacksNotes. Corrected in "Mark-all fills a note-less cell with its region's candidates"; the old hint requirement already called pencilAll additive, so this also reconciles the two.

### salad

- "Validation SHALL require" all four parameter limits: `validateParams` in src/games/salad/state.ts refuses only `nums >= order`. `order` at least 3 and `nums` between 2 and 9 are the `bounds` on the `paramConfig` items in the same file. The new requirement "Salad's parameters" says which is which.
- Description rejections "reproducing the upstream messages": `readSection` and `parseDesc` in src/games/salad/state.ts fail with `DESC_TOO_LONG`, `DESC_OUT_OF_RANGE`, `descBadCharacter` and (from the reader) `DESC_TOO_SHORT`, which are the collection's own sentences in src/engine/desc-error.ts. Corrected to "the collection's shared description errors".
- "Right-click SHALL select a cell for pencil entry" as an unconditional rule: `newUi` in src/games/salad/state.ts sets `pencilSticky: true`, and with it on `applyPress` in src/engine/note-taking-cell.ts makes a right press switch pencil mode. The new requirement states both arms.
- "A move that would not change the board SHALL be a no-op": `interpretMove` in src/games/salad/index.ts returns a `set` move for a symbol the square already holds (`commit(symbol)` is unconditional), and `commitMove` in src/engine/midend.ts records every move with no equality test. Upstream's `interpret_move` does not filter it either. Replaced by the inputs the code does refuse: a symbol past `nums`, any entry on a given symbol or cross, a cross on a given ball, a penciled circle on a given ball or a filled square.
- The per-line count's second half, "once its symbols are all placed": `cheapMarkers` in src/games/salad/hint.ts fires `countLettersDone` once `nums` squares of the line carry a ball, placed or not, and `allPlaced` only picks the sentence. Reworded to "once the squares holding its symbols are all marked or filled".
- "A ball drawn round a character SHALL show that surface through it": `drawBall` in src/games/salad/render.ts returns without drawing a ball round a character in ABC End View, and shows the surface (or the selection wash) through a ball only there. In Number Ball a ball is filled with `COL_I_BALLBG` (paper) for a given or `COL_G_BALLBG` (`GREEN_WASH`) for the player's, a choice the comment in `colors` states. Corrected per mode.

### slant

- The `Game` type arguments were listed as five by name: `slantGame` in src/games/slant/index.ts takes eight (adds `SlantMistake`, `SlantHint`, `SlantRung`). The spec now says only `Game`.
- `validateParams` enforces minimum size 2x2 (body and scenario): `validateParams` in src/games/slant/state.ts refuses only an over-large area and returns null for a 1-wide grid. The `bounds: { min: 2 }` on `paramConfig` are what the engine's `paramsError` (src/engine/params.ts) refuses on. New requirement: Slant refuses a grid narrower or shorter than two squares.
- `validateDesc` SHALL reject...: Slant defines no `validateDesc`. The engine's `validateDesc` (src/engine/desc-error.ts) reads the refusal off `newState`. The spec now says 'Validating a desc SHALL reject'.
- The clue grid is 'shared (frozen)': nothing freezes it. `newState` returns a `readonly` `Int8Array` that `executeMove` carries by reference and never writes. The spec now says shared by reference and written by no move.
- Arrow keys move the cursor 'revealing it first', read as a press spent on the reveal: `moveCursor` in src/engine/pointer.ts reveals and moves in one press. The spec now says 'revealing it in the same press'.
- The three reasons a mark-placing step may give were stated as the whole list: `markStep` in src/games/slant/hint.ts also narrates a pair whose two v-shapes are ruled out for two different reasons (`say.markV` over two `vClause`s: a 1 or 3, a placed diagonal, or across a 2) and one held across a single 2 (`say.vAcross`). The spec now names the two kinds of merge (clue pair, both v-shapes ruled out) and keeps 'same clue at both ends' and 'line of 2s' as cases.
- Hint colors are appended past the upstream enum because 'the dark-mode overrides target other indices': no override keyed on a palette index is in the tree, and `colors` in src/games/slant/render.ts derives every entry from the background. The rule is kept as 'hint colors take palette indices after the game's base colors', and the reason is dropped.
- 'A 2-clue with two undecided adjacent neighbors marks them equivalent': `slantSolve` in src/games/slant/solver.ts merges on `nu === 2 && nl === 1`, i.e. any clue with one line left and exactly two undecided neighbors side by side. Corrected in 'The Normal solver tracks squares that slant alike'.
- Diagonals and clue rings are 'chessboard-colored' by parity `(x^y)&1`: `colors` in src/games/slant/render.ts sets `COL_SLANT1` and `COL_SLANT2` both to `INK`, so the parity picks between two equal colors. The spec now says ink.
- Red error coloring for 'unmet clue circles': `drawClue` in src/games/slant/render.ts reddens only the number (`tcol`); the disc and ring are unchanged. The spec now says the number of a clue whose vertex is in error.
- In notes mode 'a press of any button' toggles a mark: `interpretMove` in src/games/slant/index.ts takes the left and the right button, the only two the engine's pointer has. The spec now says 'either button'.

### rome

- A wall run in a description is 'a digit': it is a decimal number of any length (`String(wrun)` in `encodeWallRuns`, src/engine/wall-runs.ts, whose header says 'A decimal number is a run of that many walls'). Spec now says 'a decimal number'.
- Rendering draws 'an inline error tint for off-grid and duplicate arrows': only the off-grid arrow tints its square (`FE_BOUNDS` -> `COL_ERRORBG` in `redraw`, src/games/rome/render.ts); a duplicate arrow is drawn in the error color (`FE_DOUBLE` -> `COL_ARROW_ERROR` in `drawArrow`) and its square keeps its surface. Spec now states the two separately.
- 'A step's evidence SHALL be shaded' (and the walk's chain 'shaded in order'): hint evidence is outlined, not shaded. `OverlaySidecar.pack` sets the outline sides for the area, `HintMarks.paint` draws the evidence outline in src/games/rome/render.ts, and `hintMarks.roles.outline` in src/games/rome/index.ts tells the player so. Spec now says evidence is marked by an outline and the chain is marked in order, numbered.

### bricks

- Completion needs 'no cell left empty': false. `status` in src/games/bricks/index.ts calls `bricksValidate(..., strict=false)`, which never looks for an empty cell; a board whose bricks are all placed is solved with other cells still empty. Requirement 'A Bricks board is complete when its three rules hold' now says an empty cell counts as not shaded, with a scenario for it.
- Rule violations 'shown live during play': false. `redraw` in src/games/bricks/render.ts computes error flags only while a drag is in flight (for the previewed board) or from the `mistakes` the check hands it; a committed board otherwise carries no mark. Requirement 'Bricks marks a rule violation on the board' states that.
- Only 'over-count numbers' are marked: false. `validateCounts` in src/games/bricks/solver.ts flags a clue that is over its count or can no longer reach it, and `drawTile` colors either; the requirement says a miscounted clue.
- The single-cell rung's 'unclassified' case is narrated as a break at a marked cell: false. `classifyShadeTrial` / `classifyUnshadeTrial` in src/games/bricks/solver.ts end in `unclassified(...)`, which throws; `BricksReason` has five kinds and none for it; src/games/bricks/hint-text.ts has no sentence for it. Requirement 'A Bricks contradiction no named rule matches is an error, never a narration' states the throw and keeps the SHALL NOT on chain wording. The old scenario for that narration is replaced by one where every refutation has a named rule.
- The retired third tier is rejected by `validateParams`: false. `validateParams` in src/games/bricks/state.ts never looks at the tier; the refusal ('Difficulty must be one of Easy, Unreasonable.') is `itemError` in src/engine/params.ts reading the `retired` count given to `difficultyItem`. The requirement says the engine refuses it from the retired choice.
- Width >= 2, height >= 2 and a known difficulty are the game's validation: false as to who refuses. They are refused by the engine's `itemError` from the `bounds: { min: 2 }` and the choices in `paramConfig`; the game's `validateParams` refuses only a 2x2 at the harder tier. The requirement says the engine refuses them from what the game declares.
- Mistake-checking uses the depth-2 rung: false. `findMistakes` in src/games/bricks/solver.ts runs the validity pass only and never the solver; only `hint` and `solve` in src/games/bricks/index.ts call `solveGame` at `DIFF_TRICKY`. The requirement names the hint and Solve.

### lightup

- `validateParams` enforces minimum size 2x2 and known symmetry/difficulty values: false. `validateParams` in src/games/lightup/state.ts checks neither; the engine's `paramsError`/`itemError` in src/engine/params.ts refuses them from the game's `paramConfig` (dimension `bounds: { min: 2 }` and the two choice lists). Spec now says the engine refuses these from `paramConfig`.
- `4-way symmetry only on square grids of at least 3x3`: false. `validateParams` requires a square grid only for 4-way rotational (`p.w !== p.h && p.symm === SYMM_ROT4`); 4-way mirror is allowed on any rectangle; either 4-way symmetry is refused only when `p.w < 3 && p.h < 3` (both). All of this only when `full`. The old scenario's '4-way symmetry on a non-square grid' was narrowed to rotational, and a scenario added for 4-way mirror on 5x7.
- `hint()` refuses on a solved board and on a board with mistakes: the game's `hint` in src/games/lightup/index.ts refuses only with DEDUCTION_EXHAUSTED when the plan is empty; src/engine/midend.ts (lines ~1166-1167) returns ALREADY_SOLVED / FIX_MISTAKES_FIRST before calling it. Spec now states the refusals and that the midend makes them.
- findMistakes overlay reaches the diff key through a sidecar (stated twice, in 'ships findMistakes' and 'renders with live error feedback'): false. `redraw` in src/games/lightup/render.ts ORs `DF_WRONG`, `DF_BLOBS_PREF` and the four hint bits into the packed per-tile word that is the `Int32Array` cache entry; `LightupDrawState` holds no sidecar. Spec now says every overlay is a bit of that word.
- blackpc ramps by 5 'to at most 90': `newLightupDesc` in src/games/lightup/generator.ts does `params.blackpc < 90 ? params.blackpc + 5 : paramsIn.blackpc`, so a start that is not a multiple of 5 passes 90 (89 -> 94), and at the top the ramp starts over from the percentage asked for. Spec now states both.

### grid

- "gridNewDesc returns null for the other twelve periodic tilings": PERIODIC_GRID_TYPES in src/engine/grid/grid-tilings.ts lists fourteen tilings, so thirteen besides triangular reach the `default: return null` arm of gridNewDesc in src/engine/grid/grid-desc.ts. The requirement "gridNewDesc is the only function that consumes randomness" now says "null for every other periodic tiling".

### keen

- validateParams requires 3 <= w <= 9: validateParams in src/games/keen/state.ts holds no size bound; the grid-size item's bounds {min 3, max 9} in src/games/keen/index.ts do, read by the engine's paramsError. Spec now says the grid size is refused by the bounds its paramConfig item declares.
- validateParams requires a known difficulty (and the scenario that an unknown difficulty is rejected): diffToLevel in state.ts reads an unknown key as Normal, so the difficulty item's choice check passes it, and decodeParams keeps the default tier for an unknown letter. Rule dropped from the spec.
- Game's six type arguments: keenGame takes eight (KeenHint, KeenRung added). Spec now names Game alone.
- Block-structure compression 'may replace a run of the same letter with letter plus count': encodeBlockStructure writes two of a letter as the letter twice and three or more as letter plus count, and readBlockStructure refuses a count below 3. Spec states that.
- validateDesc rejects malformed descs: Keen declares no validateDesc; the parse inside newState (parseDesc in state.ts) refuses and the engine derives the verdict. Spec says the desc 'SHALL be refused'.
- The solver framework is named latin_solver: the export of src/engine/latin.ts is latinSolver.
- Cursor-select highlights a cell for a real entry: toggleNoteTakingMode (called by interpretMove) toggles pencil mode on a showing highlight.
- Select2 highlights an empty cell for a pencil mark: interpretMove reads CURSOR_SELECT2 (the space key, view-interactive.ts) as clear.
- M fills every empty cell with all candidates: applyNoteMove's pencilAll fills only empty cells with no notes, and adaptiveMarkAllMove strikes the obvious row/column candidates once every empty cell is noted (never a cage duplicate).
- A completing placement marks the state completed: KeenState has no completed flag; status derives solved from checkErrors.
- Pencil-mode indicator shown while persistent pencil mode is on: redraw passes ui.pencilMode to repaintPencilIndicator, so it shows in any pencil mode, sticky or not.
- Keep-highlight preference defaults off: newUi in state.ts sets pencilKeepHighlight: true (engine-notes also requires defaulted on).
- Hint preference order (naked single, populate plus basic Latin eliminations, cage elimination, forced placement): the order is the shared walk's in runCandidatePlan (src/engine/candidate-plan.ts): naked singles, own rungs, whichever recorded strike the plan can take now (cage or generic), then recorded placements. Keen states no order; filed to engine-candidate-hints 'The walk owns the ladder'.
- Populate comes on every plan: under the implicit reading of the hint-notes preference no fill-all step is emitted; populate is only Keen's default (DEFAULT_CANDIDATE_READING). Spec conditions the rule on that reading.
- A hidden single shades its whole line as evidence: narrateLatinReason marks the line with the stripes role, which drawTile hatches; nothing is outlined.
- The hint refuses on a solved board or when findMistakes is non-empty: Keen's hint is one call to candidateHint, which refuses only an empty plan; the midend refuses those two boards before asking the game (engine-hints). No Keen requirement kept for it.
- hintKeepTrack: a pencilStrike clearing a subset of the step's marks is onTrack: keepCandidateHintTrack judges a pencilStrike completed only when its marks equal the step's and off otherwise; it is a pencil toggle (set with pencil) clearing one mark that is onTrack, or completed on the last.
- Cage-elimination scenario: cage cells shaded and struck candidates marked in the hint color: say.cage stripes the cage, and drawTile draws a struck candidate in the pencil color with a line through it; the hint color goes to the cell's ring.
- A 3x3 puzzle requested above Normal is dialed down to Normal: newKeenDesc dials nothing down; validateParams refuses the deal when full with noSuchTier, 'No 3x3 puzzle is Tricky.'
- The hint's marks stay in the gutter: only the ring and outline do (HintMarks in redraw); drawTile hatches a striped cell, strikes candidates through and numbers a chain inside the cell.

### group

- Small sizes are generated one tier easier (and its scenario): `newGameDesc` in src/games/group/generator.ts generates at the tier asked; `validateParams` in src/games/group/state.ts refuses the size instead (`sizeLacksTier`, `tierTooRare`). Replaced by the new requirement 'A size is refused at a tier none of its boards need', which states the table the code holds and the 6x6 Hard identity-shown 'too rare' refusal.
- Scenario said validation rejects an identity-hidden Easy deal: `validateParams` has no arm for it; the engine refuses it from the modifier's `only: { difficulty: HIDDEN_IDENTITY_TIERS }` in src/games/group/index.ts. Only the 3x3 case is `validateParams`'s.
- Hard uses the generic set elimination and forcing: `solveGroup` in src/games/group/solver.ts sets `diffSet0: DIFF_HARD` (the tier shown as Tricky), so plain set elimination runs at Tricky; Hard adds the harder variant (`diffSet1`) and forcing.
- Tricky rules out identity candidates from a product that equals neither factor: `solverHard` rules an element out by a filled product of it that is not the OTHER factor (`gm(i,j) !== j + 1`), which includes a product equal to the element itself.
- Hint's identity-mark elimination strikes the marks of both a and b, narrated 'neither can be the identity': under recording `solverHard` returns once per element, so a step strikes one element's marks; `say.identityElim` in src/games/group/hint-text.ts reads 'The product ..., not O as it would be if E were the identity'. The words 'neither can be the identity' are in no hint sentence.
- Typing an element's number fills a cell: `interpretMove` in src/games/group/index.ts takes an entry only where `isChar(button)` holds (a letter), and `requestKeys` offers letters only.
- Hint order put Group's own deductions after the basic Latin eliminations: `buildSteps` gives the walk a rung (`leads`) that sits before the recorded strikes in `runCandidatePlan`'s ladder (singles, own rungs, strikes, placements), so associativity and the identity fill lead, with every single the board shows until the notes are set up.
- The populate step as an unconditional part of the plan: `newUi` in src/games/group/state.ts starts `candidateReading` at `implicit`, under which the walk in src/engine/candidate-plan.ts has no populate. The rule is kept for the populate reading.
- Populate and strikes are made by a `pencil` move: the plan fills by `pencilAll` and strikes by `pencilStrike` (`groupCandidateMoves` and the `GroupMove` union).
- Associativity scenario said the three known-product cells are 'shaded' as evidence: `say.associativity` marks them `outline`, and `redraw` in src/games/group/render.ts paints evidence on the cell border (`HintMarks`); the game's `hintMarks.roles.outline` says the same.

### tents

- `validateParams` enforces the 4x4 minimum: it does not. `validateParams` in src/games/tents/state.ts tests only area overflow and a 4x4 above Easy. The minimum is `bounds: { min: 4 }` on the dimension fields of `paramConfig`, which `paramsError` in src/engine/params.ts checks before calling the game (the test asserts "Width must be at least 4."). The requirement and its scenario now say the engine's check refuses it.
- The game implements `Game` with six type arguments: `tentsGame` in src/games/tents/index.ts gives eight (the last is `TentsRung`). The requirement now names `Game` alone.
- Every adjacent tent pair marks the shared corner(s): `findErrors` in src/games/tents/render.ts sets corner bits for a diagonal pair only; an orthogonal pair sets ERR_ADJ_TOP/BOT/LEFT/RIGHT, which `drawTile` draws at the middle of the shared edge. Corrected to edge for orthogonal, corner for diagonal.
- The solver marks a blank 'diagonally adjacent to any tent' as a non-tent: `grassNextToTents`/`touchingTent` in src/games/tents/solver.ts mark a blank touching a tent on any of its eight sides. Corrected to 'touching a tent, even diagonally'.
- The ladder has seven rungs: `tentsLadder` in src/games/tents/solver.ts has eight (and the census in tents-ladder.test.ts lists eight). `tree-link`, tying a tree to a tent already on its single candidate square, is its own rung at Easy. The count is dropped and the rung is listed.
- The firing census covers the preset sizes at both tiers: SHAPES in src/games/tents/tents-ladder.test.ts holds 8x8 and 10x10 at both tiers but 15x15 at Normal only, plus 12x5. Corrected to 'every preset size, both tiers and a non-square board'.
- A hint link is drawn only when some stalled rung fires once it is drawn: `tentsHintLadder` in src/games/tents/solver.ts ends with `link-for-any` called with `anyway: true`, which draws the first pending link when no single link lets any rung fire (the comment gives the reason: a chain two links long). The requirement now states the order (square-placing rungs, then any rung) and that fallback, and the scenario is narrowed to a link followed by a square-placing firing, which is what the test checks.

### unequal

- Order bound `3 ≤ order ≤ 32` enforced by `validateParams`: the bounds are 3..`MAX_CANDIDATE_VALUE` (31, src/engine/candidate-bits.ts), declared on the size item of `paramConfig` in src/games/unequal/index.ts and refused by the engine's `paramsError`, not by `validateParams`.
- `validateParams` requires a known difficulty: `decodeParams` (src/games/unequal/state.ts) reads an unknown difficulty character as `"easy"` (the tier named Normal) and nothing refuses it. Spec now says it decodes as Normal.
- Desc may skip runs of blank cells with letters a-z: `parseDesc` (state.ts) reads a number for every cell and refuses a letter. Upstream's loader accepted the letters but its generator never wrote them (`sprintf "%d%s%s%s%s,"`), so no dealt board is refused.
- Generator falls back to an easier difficulty after the upstream retry cap: `newUnequalDesc` (generator.ts) loops until the board is at its tier and never deals an easier one; `validateParams` instead refuses a 3x3 at Tricky or Unreasonable when a board is to be dealt (that refusal is now in the spec).
- `0` clears a cell: `charValue` (state.ts) reads `0` as the value 1 from order 10 up, so it clears only below order 10.
- `M` fills every empty cell with all candidates: `interpretMove` returns `adaptiveMarkAllMove`, which fills only empty cells with no notes and, once every empty cell has notes, strikes row/column duplicates instead.
- Keep-highlight preference defaults off: `newUi` (state.ts) sets `pencilKeepHighlight: true`.
- Populate precedes elimination on every plan: `newUi` starts on `candidateReading: "implicit"`, under which the walk emits no fill-all step; the fill-all comes first only under the populate reading (the hint test asks for it explicitly via `populateHint`).
- The game's `hint` refuses a solved or mistaken board: `hint` is one call of `candidateHint`, which refuses only an empty plan; the midend makes both refusals before asking the game.
- Hint scenario: clue cells 'shaded' and struck candidates 'marked in the hint color': `redraw` (render.ts) outlines the evidence pair and rings the struck cell in the gap, and `drawHints` draws a struck candidate in the pencil color with a line through it.
- `Game` listed with six type arguments: `unequalGame` is typed with eight (adds `UnequalHint`, `UnequalRung`); the requirement now names `Game` alone.

### boats

- Every game ID carries the difficulty and the remove-numbers flag: `encodeParams` (src/games/boats/state.ts) writes the difficulty letter and the `S` flag only when `full`. The requirement now names the full encoding.
- The validation list was the whole of what is refused: `validateParams` (src/games/boats/generator.ts) also refuses a fleet of exactly one boat above Easy when a board is to be generated (`full`), through `noSuchTier`. Added to the requirement, with a scenario.
- Scenario 'a board is produced for any preset or legal parameter set': `newBoatsDesc` throws after `MAX_GENERATE_ATTEMPTS` rejected boards, and its own comment says other small fleets lack a tier and the generator runs out. The scenario is now stated for the presets only.
- 'A board with no given clues at all encodes as its border clues alone': `encodeDesc` (src/games/boats/state.ts) emits a letter whenever a run reaches `MAX_RUN` (26), so a 6x6 board with no clues encodes as its border clues plus `z`. Corrected to boards smaller than one letter's run, with a second scenario for the larger case.
- 'A right-click toggles water': `clickFill` (src/games/boats/index.ts) turns an empty cell to water and any filled cell, a boat segment included, to empty. The requirement says that.
- 'The live-flagged cells are a subset of what findMistakes reports': the live flags (src/games/boats/validate.ts) fall on a line's number, on the given square for `FE_MISMATCH`, and on every square of an over-size boat for `FE_FLEET`; `findMistakes` never reports a given square and need not report each flagged cell. Restated as: on a board the solver completes, a board the live flags mark has a cell `findMistakes` reports.
- Scenario 'the offending cells and the count are shown in the error color' for a row over its count: `redraw` (src/games/boats/render.ts) colors only the line's number from `countShips`; a segment turns red only on `FE_MISMATCH` or the Check & Save overlay. The scenario now claims the count only, and that `findMistakes` reports at least one of the row's cells.
- 'The hint replays at the lowest cap at which the board solves' read as the only cap: `deduceBoatsPlan` (src/games/boats/hint-solver.ts) escalates to the next cap whenever the lower one yields no firing from the player's board. The requirement now states the escalation.

### unruly

- `validateParams` rejects a dimension below 6 and an unknown difficulty: false. `validateParams` in src/games/unruly/state.ts checks only odd dimensions, the area and the A177790 bound. `paramsError` in src/engine/params.ts refuses the other two, from the size items' `bounds: { min: 6 }` and the difficulty item's choice list (the codec decodes an unknown letter to `DIFF_COUNT + 1`). The spec now says which refuses which, and the scenario speaks of the engine's params check.
- The `1` key places one, `0`/`2` zero and Backspace clears, stated unconditionally: false. `interpretMove` in src/games/unruly/index.ts takes a digit only while `ui.cursor.visible` and applies it at the cursor. The erase verb's keys are `ERASE_KEYS` (src/engine/target-verb.ts), Backspace and Delete, and `interpretTargetVerbs` applies a keyed verb only at a shown cursor (a first press on a hidden cursor only shows it). The spec now says 'at the cell under a shown cursor' and 'Backspace or Delete'.
- A red bar spans a three-in-a-row run: false. `drawErrRectangle` in src/games/unruly/render.ts draws a thick rectangle outline around the run (`drawThickRectOutline`, `COL_ERROR`). Only the unique-match overlay is a filled bar. The spec and its scenario now say an outline in the error color around the run.
- The `nearcomplete` premise is the reserved window alone: false. `markedOf` in src/games/unruly/index.ts outlines the window and, when `reason.anchor >= 0`, the piece beside it as well. The spec now says 'the reserved window with the piece beside it when there is one'.
- The game implements `Game<UnrulyParams, UnrulyState, UnrulyMove, UnrulyUi, UnrulyDrawState>`: `unrulyGame` in src/games/unruly/index.ts takes eight type arguments (`UnrulyMistake`, `UnrulyHint`, `UnrulyRung` after the five). The spec now says `Game`.

### mathrax

- A clue number is refused only when 'too large': `clueNumRange` in src/games/mathrax/state.ts bounds each arithmetic clue's number at both ends (sum 2..2o, difference 0..o-1, product 1..o*o, quotient 2..o), enforced by `DescReader.int`. Spec now says 'a clue number outside what that clue can show on a board of that size'.
- A cell is selected for pencil marks by right-click: `newUi` starts with `pencilSticky` on, and `applyPress` in src/engine/note-taking-cell.ts makes a right press toggle a persistent pencil mode; it selects one cell for pencil marks only with the preference off. Stated as its own requirement.
- The game fills every empty cell with all candidate pencil marks: `applyNoteMove` in src/engine/candidate-hint.ts makes `pencilAll` fill only empty cells with no notes and never resets a narrowed one. Corrected.
- findMistakes derives the solution 'from placed values only': `solveFromGivens` in src/games/mathrax/index.ts solves from the immutable cells and the clues alone, so the player's placed digits are not read either. Corrected to 'from the given digits and the clues, never from the player's entries or notes'.
- The hint plan fills notes with the additive `pencilAll` before a deduction first needs them: `newUi` starts on the `implicit` candidate reading, under which the walk in src/engine/candidate-plan.ts has no populate and a firing writes only the notes it rests on. The fill opens the plan only under the populate reading; spec now says so and states the reading Mathrax starts on.
- A clue step 'shades' the cells that identify its clue (body and the E/O scenario, two ledger rows): `say` in src/games/mathrax/hint-text.ts marks them `outline`, and `redraw` paints evidence as an outline on the cells' borders (`HintMarks.paint`, `markBand`). Corrected to 'outline'.

### range

- The game is typed with five `Game` type arguments: `rangeGame` in src/games/range/index.ts has eight (`RangeMistake`, `RangeHint`, `RangeRung` after the five). The requirement now says `Game`.
- `validateParams` rejects a non-positive dimension: the game's `validateParams` (src/games/range/state.ts) checks only `w + h` above 128 and, when full, both dimensions at most 2. A dimension below 1 is refused by the engine's `paramsError` from the `bounds: { min: 1 }` the items declare (src/engine/params.ts). The spec now says so.
- `_` separates 'two clues or a clue and a run': `encodeDesc` writes `_` only between two adjacent clues and `parseDesc` expects it only there, so `3_a` is refused (src/games/range/state.ts). The spec now says `_` sits exactly where two clues would merge.
- The desc check is the game's `validateDesc`: the game declares none. The refusal is raised by `newState` through `parseDesc`, and the engine derives the verdict (src/engine/desc-error.ts `validateDesc`).
- Every generated board contains at least one black square: on a one-row or one-column grid the first third of candidates can all be squares that would disconnect the whites (the middle of a 1x3, which full validation allows), and `chooseBlackSquares` then paints none (src/games/range/solver.ts). Read from the code, not run. The rule is now stated for a grid at least two squares each way, where the first candidate is always painted.
- Recursion 'forces the surviving color when one leads to a contradiction': `solveRec` tries an undecided cell black then white and returns the first completion `findErrors` passes; it never shows the other color fails (src/games/range/solver.ts).
- The game's `hint` refuses on a solved board or one with mistakes: `hint` in src/games/range/index.ts checks neither. The midend's `computeHintPlan` makes both refusals before calling it (src/engine/midend.ts), and `hint` refuses only with `DEDUCTION_EXHAUSTED` when the plan is empty. The spec keeps the refusal as a rule and says who makes it.

### spokes

- "No shipped board can require a step the hint cannot explain" (old: Spokes explains why each hinted move is forced). `nextSpokesFiring` in src/games/spokes/solver.ts passes only `DIFF_LIMITED` to `findContradiction` and omits the unbounded look-ahead that `spokesSolve` runs at `DIFF_HARD`, exactly as the old requirement "Spokes' hint stops at bounded reasoning" demands. The two old rules contradicted each other; the new "Spokes' hint is a projection of its solver" states the rule with the unbounded rung as its one exception.
- "Keeping a removal only while ... the board stays uniquely soluble at the target difficulty and no easier" (old: Spokes ports the tiered deductive solver and solver-gated generator). `spokesGenerate` in src/games/spokes/generator.ts tests each removal with `spokesSolve(board, scratch, diff)` only; the 'no easier' test (`spokesSolve(board, scratch, diff - 1) !== "valid"`) runs once, on the finished board, as the acceptance check. The generator requirement now says 'at the target difficulty', and 'no easier' is held by "Spokes' difficulty tiers bind the boards they generate".
- "A left drag SHALL toggle a line" (old: Spokes input, movement and completion), read as line on/off whatever the spoke holds. `toggleSpoke` in src/games/spokes/index.ts computes `old !== SPOKE_EMPTY ? SPOKE_EMPTY : mark`, so either verb clears a spoke that holds a line or a mark: a left drag over a ruled-out spoke clears the mark and draws nothing (and a right drag over a line erases it). The new input requirement adds that sentence and a scenario for it.

### dominosa

- `validateParams` enforces `n >= 1` and a valid difficulty: it tests neither (src/games/dominosa/state.ts). The minimum is `bounds: { min: 1 }` on the `n` item of `paramConfig` and the tiers are the difficulty item's choices, both checked by the engine's `paramsError` (src/engine/params.ts) before it calls the game. The requirement now says the engine refuses them; `validateParams` keeps only the overflow bound.
- Scenario 'validateParams given n = 0 returns a non-null error': the game's `validateParams` returns null for n = 0. The scenario now names the engine's check of the `n` item's minimum.
- `textFormat` is provided 'for n < 1000': `textFormat` in src/games/dominosa/index.ts has no test of `n`, and the game declares nothing that withholds it. The requirement now says the game provides `textFormat`, with no bound.
- The game implements `Game` with six named type arguments: `dominosaGame` is a `Game` of eight (adds `DominosaHint`, `DominosaRung`). The requirement now says `Game` and lists none.
- A placement step 'when a square can pair with only one domino': `firstFiring` (src/games/dominosa/solver.ts) places from a square with one placement left (`squareOnly`, narrated 'has only one neighbor left to pair with'); a square that can be part of only one domino is the `squareSingleDomino` rung, which is a barrier step. The requirements now state each.
- The barrier techniques narrated include the forcing chain: `DOMINOSA_RUNGS` has no forcing-chain rung and `firstFiring` runs none (the old spec's own solver requirement forbade it). The barrier list is now squareSingleDomino, mustOverlap, the two local duplicates, parity and set.
- Scenario 'the plan solves the board from any mid-game position': the hint pass runs no forcing chain, so at a position only that deduction advances, `hint` returns `DEDUCTION_EXHAUSTED` and the plan stops. The scenario is now limited to a board that needs no forcing chain (the existing test covers a Tricky board).

### slide

- Old 'Slide input, movement and completion': the dragged block 'follows the pointer with a landing shadow at its snapped destination'. `redraw` in src/games/slide/render.ts simulates the release with `movePiece` and draws the held block itself, lit up (`FG_GRABBED`), at its snapped cell; nothing is drawn at the pointer and there is no separate shadow. The new requirement 'Slide draws a held block where it would land, with no slide animation' states that.
- Old 'Slide plays from the keyboard alone': the cursor is 'hidden until the first cursor key'. `interpretMove` in src/games/slide/index.ts also sets `ui.cursor.visible = true` on `CURSOR_SELECT`/`CURSOR_SELECT2`, on an empty square included. 'A cell cursor moves over the Slide board' now says 'the first cursor key or select key'.
- Old 'Slide descriptions use the upstream run-length block encoding' scenario: a wrong square count is rejected 'with a message distinguishing too much from too little'. `parseDesc` in src/games/slide/state.ts gives DESC_TOO_LONG for too many, but too few is DESC_TOO_SHORT only where the text ends early; a short board followed by its tail is refused as a bad character at the comma (slide.test.ts pins `w5ma13,3,1` to `descBadCharacter(",")`). 'A malformed Slide description is rejected' states both cases, and the scenario now says only that the two messages differ.

### blackbox

- `validateParams` rejects `w`/`h` below 2 or above 255: it has no size check (src/games/blackbox/state.ts). The size fields declare `bounds: { min: 2, max: 255 }` in `paramConfig` (src/games/blackbox/index.ts) and the engine's `paramsError` (src/engine/params.ts) refuses outside them. Spec now says the bounds the size fields declare refuse it.
- The ball limit is `blackboxBallLimit(w, h)`: no such name exists in the tree; the function is `ballLimit(w, h)` exported from src/games/blackbox/state.ts. Spec now names `ballLimit`.
- The `no-of-balls` annotation key is 'mapped in the worker adapter': nothing outside src/games/blackbox mentions it. It is the `kw` of a `paramConfig` field whose `tail`-slot label `describeParams` (src/engine/param-label.ts) composes into the summary. Spec and its scenario now say that (summary `8x8, 3-6 balls`).
- The type summary always reads `balls`: the field's label writes `ball` when the count is exactly `1` (src/games/blackbox/index.ts). Spec now states the singular.
- A whole-line lock 'locks iff fewer than half are locked, else unlocks': `toggleLineLock` (src/games/blackbox/index.ts) unlocks only when MORE than half are locked, so a line exactly half locked is locked, not unlocked. Spec states the code's threshold, with a scenario for the tie.
- 'Toggling a ball SHALL be disallowed on a locked cell', sitting among `executeMove` rules: `executeMove` toggles a ball on a locked cell without throwing. The lock is kept at the input, where the primary action's `apply` returns `null` on a `BALL_LOCK` cell. Spec now says a locked cell offers no ball toggle: the primary action makes no move.
- Scenario 'the status bar reads a success message' on a correct reveal: `statusbarText` returns the empty string once revealed (plus the error count if any), commented 'A reveal is a win, which the engine's own words announce'. Spec now says the game's own status text announces nothing on a reveal.
- A known square with no ball 'SHALL also hold the ruled-out cross' unconditionally: `drawArenaTile` (src/games/blackbox/render.ts) draws the cross only under `known && !gs.reveal`. Spec now says 'until the reveal'.

### separate

- The five type arguments of `Game` by name: `separateGame` in src/games/separate/index.ts takes eight (adds `SeparateMistake`, `BorderHint`, `SeparateRung`). The spec now says only `Game`.
- `validateParams` rejects a non-positive dimension: `validateParams` in src/games/separate/state.ts checks no sign (`{ w: 0, h: 5, k: 5 }` returns null). The refusal comes from the `bounds: { min: 1 }` that `paramConfig` declares on width, height and letters, through the engine's `paramsError` (the game's own test expects "Width must be at least 1."). The spec now attributes it to the declared bounds, and the old scenario was corrected the same way.
- The solver has two deductions (old 'ports the DSF solver' requirement): `separateLadder` in src/games/separate/solver.ts declares three, with `walled-apart` between them, as the spec's own later ladder requirement said. Reconciled to three.
- The shared tri-state is an 'undecided→wall→no-wall cycle': `edgeEdits` in src/engine/border-grid.ts has no three-step cycle. Each button toggles between its own state and undecided, and an edge in the other button's state switches straight over. Now stated in 'Each button toggles the nearest edge toward its own state', matching Palisade's rewritten wording.
- `hint()` refuses on a solved board and on a board carrying a mistake: `hint` in src/games/separate/index.ts checks neither. src/engine/midend.ts returns `ALREADY_SOLVED` and `FIX_MISTAKES_FIRST` before calling the game. `hint()` itself only refuses a board its solver cannot finish from empty (`PUZZLE_NOT_REASONABLE`). The spec now says who refuses what.
- Every step citing two regions has one hatched and one outlined, with the sentence naming both marks: `evidence` in src/games/separate/index.ts outlines both of two lone squares (nothing striped), and `say.sharedLetter` in src/games/separate/hint-text.ts names a lone square by its letter, not by a mark. The rule holds for two regions of more than one square each; the mark role is `stripes` and the player's word is "striped", not "hatched". Narrowed accordingly, with a second scenario for the lone-square case.

### pattern

- `validateParams` SHALL reject a non-positive dimension: `validateParams` in src/games/pattern/state.ts checks only the area (`AREA_TOO_LARGE` when w > MAX_SAFE_INTEGER / h). A dimension below 1 is refused by `bounds: { min: 1 }` on `paramConfig`, which the engine's `paramsError` (src/engine/params.ts) reads before the game's hook. The spec now says the declared bound refuses it and `validateParams` refuses the oversized area.
- `validateDesc` SHALL parse the suffix and reject a malformed desc: Pattern declares no `validateDesc` hook. The engine's `validateDesc` (src/engine/desc-error.ts) reads the board through `newState`, whose parse (`parseDesc` in state.ts) makes every refusal. The spec now says the desc's parse refuses.
- A mistake is rendered with the `COL_MISTAKE` overlay: src/games/pattern/render.ts has no `COL_MISTAKE`; the mistake outline is drawn in `COL_ERROR`. The spec now says the mistake outline, in the error color.
- The hint's techniques are run overlap, line completion, unreachable gap, edge/anchor extension and intersection (body and the 'no generic fallback' scenario): `PATTERN_RUNGS` in src/games/pattern/solver.ts is `overlap`, `unreachable`, `lineEmpty`, `intersection`. There is no completion or edge/anchor rung. The spec now lists overlap, cells no run can reach, a line with no clues, and the intersection.
- The bottom rung's sentence is "whichever way this line's runs fit, these cells must be black / must stay white": `say.intersection` in src/games/pattern/hint-text.ts says every way the line's runs can fit covers (or leaves out) the cells, so they must be the engine's shaded word (or `clear`). No sentence says 'must stay'. The spec now describes that sentence.
- The game implements `Game<PatternParams, PatternState, PatternMove, PatternUi, PatternDrawState>` (five type arguments): `patternGame` in src/games/pattern/index.ts is typed with eight, adding `PatternMistake`, `PatternHint`, `PatternRung`. The spec now names `Game` alone.

### clusters

- `findMistakes` uses the deeper solver rung whatever the tier: false. `findMistakes` in src/games/clusters/index.ts returns `findErrors(state.grid, w, h)`, the cells breaking a local rule, and runs no solver rung. The new requirement "Solve and the hint use the deeper rung at every tier" keeps the rule for `solve` and `hint` and says `findMistakes` reports the rule-breaking cells as the board stands.
- The narration's "ringed" refers uniquely to the tile where the contradiction lands: false. src/games/clusters/hint-text.ts names that tile through the `outline` mark role, whose word (src/engine/hint-words.ts MARK_ROLES) is "outlined"; "ring" is the role of the cell the step colors. clusters-hint.test.ts asserts "outlined" is uttered iff the danger ring is shown. The spec now says "outlined".
- The danger ring differs from the live-error frame "in both hue and structure": the code differs in hue and thickness only. `drawTile` in src/games/clusters/render.ts draws both as one square outline via `drawThickRectOutline`, orange at ts/12 thick against red at ts/7. The spec now says hue and thickness.

### magnets

- `validateParams` SHALL enforce `w >= 2`, `h >= 2`: `validateParams` in src/games/magnets/state.ts checks neither. The engine's `paramsError` (src/engine/params.ts) refuses it from the bounds `paramConfig` declares via `dimensionParamConfig({ bounds: { min: 2, max: DESC_ALPHABET_SIZE - 1 } })`. Spec now says the sides are declared bounded, and leaves `validateParams` only the per-difficulty minimum.
- `validateParams` SHALL enforce 'the area bound': no area is checked anywhere in src/games/magnets/state.ts. The only upper limit is per side, `DESC_ALPHABET_SIZE - 1` = 61 (src/engine/desc-alphabet.ts has `DESC_ALPHABET_SIZE = 62`), because a clue count is written as one description character. Spec now states 2 to 61 per side.
- `validateDesc` SHALL reject a malformed desc: the game has no `validateDesc` hook. The one parse inside `newState` (`parseDesc` + `descValue` in src/games/magnets/state.ts) refuses, and the engine's `validateDesc`/`loadDesc` in src/engine/desc-error.ts report that reading. Spec now says the game's one reading of a desc, in `newState`, refuses.
- The renderer SHALL draw 'singleton black squares': `drawTileCol` in src/games/magnets/render.ts returns as soon as a square is its own partner (`if (other === i) { hatchSquare(); return; }`), so a singleton is only the `COL_BACKGROUND` rect `drawTile` painted, with no fill and no symbol. Upstream's `draw_tile_col` has the same early return (../puzzles/magnets.c line 2120). Spec now says a singleton is drawn as bare background with no domino on it.

### abcd

- "A fill-all-marks command SHALL set every empty cell's candidate marks": `interpretMove` in src/games/abcd/index.ts makes the adaptive mark-all. `pencilAll` fills only an empty cell with no marks and never resets a narrowed one; once every empty cell has marks, the press strikes what `abcdObviousMarks` (src/games/abcd/solver.ts) lists (a letter a touching cell holds, or one whose line already holds its clue's count, never a cell's last mark) as one `pencilStrike`, or makes no move. Now stated in "ABCD's fill-all-marks command fills only cells with no marks".
- "SHALL color a clue ... red while ... over- or under-satisfied": `computeClueErrors` in src/games/abcd/render.ts flags a clue only when `found > clue // found + empty < clue`, so an unfinished line that can still reach its clue is not red. "What ABCD draws" now says a clue its line exceeds or can no longer reach.
- Scenario "A runs step names the line and the count" was stated of every runs step. In src/games/abcd/hint.ts a later step of the same firing uses `say.alsoForced` (no count read, `clue` not set), and a line with exactly as many open cells as it needs uses `say.onlyHomes` (src/games/abcd/hint-text.ts), whose sentence does not say the cells "fit only N apart". The scenario's WHEN is narrowed to the first step on a line with more open cells than letters to place.

### engine-helpers

- The fixpoint runner 'SHALL also accept an optional recorder that gates every reason allocation' (and 'recorder threading' is among what it writes once): `DeductionFixpointOptions` in src/engine/deduction-fixpoint.ts has no recorder option, and the doc comment on `DeductionTechnique.run` says a technique records through its game's own recorder as a side effect and 'the runner is oblivious to it'. Now stated as 'The record is the game's, and the generation path allocates nothing'.
- 'When no budget is present it SHALL count nothing': `runDeductionFixpoint` builds its tally as `opts.firings ?? (opts.budget ? new Map() : null)`, so it also counts into a caller-supplied `firings` tally with no budget. Corrected to 'with neither a budget nor a caller's tally it SHALL count nothing'.
- 'Grid games SHALL import these instead of re-deriving the mapping locally', with no exception: the doc comment on `fromCoord` in src/engine/geometry.ts names one legitimate override, `Math.trunc` (a margin press folds onto row or column 0), taken by a game that says so at its own conversion; crossing/render.ts, mathrax/render.ts, seismic/render.ts, rome/index.ts and blackbox/index.ts do exactly that. The new requirement 'A grid game imports the coordinate helpers' states the override.
- Loopy listed as a consumer of the loop finder 'when ported': Loopy is ported and does not call `findLoops`; `checkCompletion` in src/games/loopy/state.ts classifies `Dsf` components and its comment explains why findloop is the wrong tool where a loop is required (Pearl does the same in moves.ts). The consumption rule now binds a game whose rules forbid the loop. Actual importers: slant, tracks, bridges, dominosa, net.

### filling

- `validateParams` requires w >= 1 and h >= 1 (and the scenario that it returns an error for them): `validateParams` in src/games/filling/state.ts checks only the area; the minimum of 1 is `bounds: { min: 1 }` on `paramConfig`, refused by the engine's `paramsError` ("Width must be at least 1."). Restated as the fields' bounds, scenario moved to `paramsError`.
- `validateDesc` SHALL reject: the game declares no `validateDesc`; `parseDesc` (read by `newState`) refuses and the engine derives the verdict. Restated as the description's parse.
- "A digit places a clue of that value" for every digit: `parseDesc` refuses a clue of 0 or above max(w, h, 3) with DESC_OUT_OF_RANGE. Added to the refusal requirement, with a scenario (`1a0` on 3x1) the game's tests bear out.
- A digit fills the cursor cell when nothing is selected: `interpretMove` does so only while `ui.cursor.visible`. Condition added.
- `executeMove` marks the state completed: `executeMove` only writes cells; `status` derives solved through `isComplete`. Restated as the state reporting solved.
- Bold border between differing cells "where at least one is filled": `redrawFilling` in src/games/filling/render.ts draws it when both are filled (`if (v1 && v2)`), or either region is complete or overfull; an unfinished filled cell has no border against an empty one. Corrected.
- The game's `hint` refuses on a solved or mistaken board: `Midend.computeHintPlan` refuses with ALREADY_SOLVED / FIX_MISTAKES_FIRST before asking; `hint` in src/games/filling/index.ts checks neither (it only returns DEDUCTION_EXHAUSTED on an empty plan). Restated as the refusal being the midend's; scenario now says `hint` is not asked.
- Hint target is a mild `COL_HINT` fill and evidence a shaded area in a lighter hint color: render.ts rings the target on its border (`paintHintMarks`), hatches the named region (`drawHatch` in `COL_HINT`) and outlines pinning neighbors in `COL_HINT_CELL`; no hint role fills a cell. Corrected in both the hint-drawing and legend requirements.
- Region premise shaded `COL_HINT_CELL` with digit on top, "which is why Filling shades premises rather than ringing them": the region is striped in `COL_HINT`, and `COL_HINT_CELL` is the neighbors' outline; the comment at `COL_HINT_CELL` in render.ts says the evidence is outlined rather than washed.
- Legend scenario "target and premise in different colors": on a `growth` step the ring and the stripes are both `COL_HINT`, told apart by shape (the pinned render test asserts ring in COL_HINT, hatches, and no COL_HINT_CELL sides). Scenario restated.

### mines

- The game implements `Game<MinesParams, MinesState, MinesMove, MinesUi, MinesDrawState>` (five type arguments): `minesGame` in /Users/yoni/personalCode/simon-tatham-puzzles/puzzles-ts/src/games/mines/index.ts gives eight (adding `Point`, `MinesHint`, `MinesRung`). The requirement now names `Game` alone.
- `validateParams` requires `n >= 1`: `validateParams` in /Users/yoni/personalCode/simon-tatham-puzzles/puzzles-ts/src/games/mines/state.ts has no such test. The minimum is `bounds: { min: 1 }` on the `mines` item of `paramConfig` in src/games/mines/index.ts, which `paramsError`/`itemError` in src/engine/params.ts checks before calling the game. The new requirement "Mines' parameters leave room for a safe first click" says so.

### untangle

- `validateParams` rejects n < 4 and an unreasonably large n: the game has no `validateParams`. `paramConfig` in src/games/untangle/index.ts declares `bounds: { min: 4, max: MAX_POINTS }` on the `n` field and the engine's `paramsError` (src/engine/params.ts) refuses outside them. The spec now says the field declares the bounds and the engine's params check refuses.
- Scenario `validateDesc` accepts every in-range `a-b` with a != b: `parseDesc` in src/games/untangle/state.ts also refuses an edge named twice (`DESC_REPEATED`). The spec now lists a repeated edge among the refusals.
- Hint counts are always stated in numerals: `allCleared` in src/games/untangle/hint-text.ts writes "its only crossing" and "both of its crossings" when a move clears every crossing of its vertex. Stated once as the requirement "A hint's count is a numeral", with that exception.
- A placing step moves a vertex to its place "as Solve would choose it": `closestPlaces` and `landedLayout` in src/games/untangle/hint.ts move each place onto a spot a pointer drop can land on, and pick the symmetry by Solve's criterion counted against those landed places. New requirement "A vertex's place is one the pointer can drop it on".
- A vertex "exactly" on its place is never moved: `onItsPlace` in hint.ts uses `withinReach` (landing.ts), so a vertex anywhere in the half-pixel box of its place counts as placed. The spec now says "within the reach of a drop aimed at that place".
- A placing step names the next step's count when that step removes at least as many crossings as this one adds: `narrate` in hint.ts also requires the next step to remove at least one (`gain > 0 && gain >= p.after - p.before`).
- Each step carries a highlight naming the vertex, destination, crossings and remaining vertices: a step carries no `highlights`. Its `words` hold the marks (`VERTEX`, `SPOT`, `CROSSING` in hint-text.ts), which `redraw` reads through `stepMarks`. The spec now says each step marks them.
- Every journey's first leg says how many marked vertices it moves: `journey` in hint.ts narrates a journey of one move with `narrate`, as an ordinary clearing step. The spec now says a journey of one vertex is explained as a clearing step.

### sticks

- A known symmetry was required only 'for a full parameter check'. The symmetry is a `choices` item of `paramConfig` (src/games/sticks/state.ts) and `itemError` in src/engine/params.ts refuses an out-of-list choice whether or not the check is full. The spec now says the engine refuses it at every check.
- 'Validation SHALL require width and height each at least 2' read as the game's validation. `validateParams` (src/games/sticks/state.ts) checks only the block percentage and the 4-way rotational case; the bound of 2 is the dimension items' `bounds`, enforced by `paramsError` in src/engine/params.ts ('Width must be at least 2.'). The spec now names which check refuses what.
- 'A game ID SHALL encode the width, height, black-square percentage and symmetry'. The percentage and symmetry are `full: true` codec fields, so the short encoding is the bare size (`encodeParams(p, false)` is `7x7`, the full one `7x7b20s2`, per sticks.test.ts). The spec now says the full encoding carries all four and the short one is the bare size.
- 'left-click a vertical line, right-click a horizontal line'. The two click verbs in src/games/sticks/index.ts cycle through `cycleLine`: left goes empty, vertical, horizontal, empty; right goes the other way. A click on a cell holding a line turns or clears it. The spec now states the cycle.
- A drag 'SHALL clear matching lines when started on one'. The clearing drag in `interpretMove` (src/games/sticks/index.ts) clears every cell it passes that holds a line of either orientation; only its start has to match the dragged orientation. The spec now says it clears the lines in the cells it passes.
- 'It SHALL be enrolled in the shared hint-bearing game list'. There is no list to enroll in: `HINT_GAMES` in src/engine/testing/hint-games.ts is derived as every registered game declaring `hint`. The spec now says declaring `hint` is the whole enrollment.
- The refused hint was on 'a board contradicting its own clues'. The refusal is the midend's, on whatever `findMistakes` reports, and Sticks' `findMistakes` (src/games/sticks/solver.ts) flags a line differing from the unique solution whether or not a clue is yet broken. The spec now says a board that carries a mistake.

### sixteen

- The game implements `Game` with five type arguments: `sixteenGame` in src/games/sixteen/index.ts is typed with eight (hint highlights and rung among them). The requirement now names `Game` alone.
- A slide is expressed as `{ axis, index, delta }`: `SixteenMove` in src/games/sixteen/state.ts is `{ type: "slide", axis, index, delta }`, beside a `{ type: "solve" }` arm. The requirement and its scenario now carry `type: "slide"`.
- A journey's final leg narrates the final placement: `say.step` in src/games/sixteen/hint-text.ts gives a `continues` leg no why at all (empty suffix), and `narrateStep` in index.ts puts the journey's why on its first leg via `(ultimatePos ?? targetPos) === bestTile - 1`. The requirement now says the why is spoken on the first leg and a `continuesPrevious` leg repeats neither.
- The measure is travel plus the number of tangles: `heuristic` in src/games/sixteen/index.ts adds `TANGLE_COST` (4) for each tangle past `TANGLES_IN_REACH` (2). The requirement now says 'a cost for the tangles', with the pricing threshold in its own requirement.

### pearl

- The always-on error marks flag non-reciprocal links: false. `checkCompletion` in src/games/pearl/moves.ts returns `valid: false` for a line with no reciprocal in the neighboring square, and `executeMove` throws "pearl: invalid move". The move is refused and nothing is marked. The spec now says the move SHALL be refused.
- `validateParams` enforces `w >= 5` and `h >= 5`: false. `validateParams` in src/games/pearl/state.ts tests only the area overflow and `w + h >= 11` for Normal. The minimum is `bounds: { min: 5 }` on `paramConfig`, refused by the engine's `paramsError` (src/engine/params.ts). The spec now states the bound as declared by the game and enforced by the engine's check, and the old scenario is split in two accordingly.
- The generator generates a 5x5 Normal request at Easy: false. `newClues` in src/games/pearl/generator.ts passes `params.difficulty` to the solver unchanged, and `validateParams` refuses a Normal board with `w + h < 11`, so a 5x5 Normal request never reaches the generator. Commit bc6b700a ("a Custom size deals the tier it asks for, or says it cannot") removed the downgrade. The rule is dropped from the spec.
- The game implements `Game<PearlParams, PearlState, PearlMove, PearlUi, PearlDrawState, PearlMistake>`: incomplete. `pearlGame` in src/games/pearl/index.ts gives `Game` eight type arguments, those six plus `PearlHint` and `PearlRung`. The spec now says it implements `Game`.

### rect

- `validateParams` enforces `w > 0`, `h > 0` and a non-negative expansion factor: false. `validateParams` in src/games/rect/state.ts checks only the area (under 2, and the shared too-large refusal). The other three are refused by the engine from the bounds `paramConfig` declares in src/games/rect/index.ts (`min: 1` on the dimensions, `min: 0` on the expansion factor). The rect test asks `paramsError`, which answers "Width must be at least 1." and "Expansion factor must be at least 0.". The new requirement says who refuses what.
- Scenario "`validateParams` is given a negative expansion factor and returns an error": false for the same reason, since `validateParams` returns null for it. The scenario now says the params are refused, without naming `validateParams`.
- Drag-draw preview is red and drag-erase preview is blue: false. `colors` in src/games/rect/render.ts assigns `DRAG_ADD` and `DRAG_REMOVE`, which src/engine/color/palette.ts defines as BLUE and BLUE_WASH. The spec now names the shared drag-add and drag-remove colors.
- The `_` separator in a desc is optional: false. `parseDesc` in src/games/rect/state.ts requires a `_` exactly between two adjacent numbers (`r.expect("_")`) and refuses one anywhere else (`r.int` fails on it). The spec now says "a `_` between two adjacent numbers".
- The game implements `Game` with six named type parameters: false. `rectGame` in src/games/rect/index.ts takes eight, with `RectHint` and `RectRung` after the six. The spec now says "implementing `Game`".

### net

- A click in the gutter between tiles always returns no move: in notes mode a gutter press notes the nearest side (`noteSpotAt` in src/games/net/index.ts treats `onGutter` as a side). Only the rotating path (`geometry.pointerTarget`) drops it. The rule is now stated of a rotating click.
- Moving the source is not offered on a grid whose every border edge is walled: `interpretMove` in src/games/net/index.ts moves the source on Ctrl+arrow whatever `s.wrapping` is; only the Shift (origin) branch and the margin drag are gated on it. The prohibition is now stated of the origin shift alone.
- The hint refuses while `findMistakes` reports a mistake: `netHint` in src/games/net/hint.ts never reads `findMistakes`; the midend refuses first with `FIX_MISTAKES_FIRST` (src/engine/midend.ts, src/engine/hint-refusal.ts). The rule is now 'No hint SHALL be given while...'.
- The 'leads only into the striped squares ... must stop however they turn' wording is said wherever a sealed group is reached across a side not yet known to be wired: `trapped` in src/games/net/hint-text.ts says it only when a single sealing turning is cited and no loop is; several turnings get 'would seal off some of the striped squares' and a group of dead ends gets 'would join the striped dead ends'. The rule now carries those conditions, and says 'squares', the word the player reads.
- The completion flash lifts each tile as its ripple passes: `redraw` in src/games/net/render.ts XORs the locked bit under the ripple, so an unlocked tile lifts and a locked one drops to the cell surface. The rule now says the two surfaces swap.

### signpost

- New board has no links: `newState` in src/games/signpost/index.ts runs `checkCompletion(s, true)`, which links every pair of consecutive immutable numbers whose lower arrow points at the higher. The rule now says those are the only links a new board holds.
- Arrows and immutable numbers 'shared (frozen) across all states': `cloneState` in src/games/signpost/state.ts copies `dirs` and `flags` into every state. Corrected to: no move changes them.
- `validateParams` rejects non-positive dimensions: it does not look at them. The engine's params check (`paramsError` in src/engine/params.ts) refuses them from the `bounds: { min: 1 }` on the dimension items. The rule now says they are refused, without naming who.
- `validateDesc` rejects malformed descs: the game has no `validateDesc` hook. `parseDesc` in state.ts refuses inside `newState`, and the engine's `validateDesc` reads that verdict. Reworded to 'validating a desc refuses'.
- Encoding ends in `c` when corner start is set: the flag segment is declared `{ full: true }` in index.ts, so only the full encoding writes it. The rule now says so.
- Packed per-cell cache holds color group, sequence number, arrow direction and a flash bit: in `redrawSignpost` (render.ts) the packed word holds flag bits only. The number and the inbound link's direction are compared from separate arrays, the cell's own arrow is not compared, and the flash forces a repaint when the spin angle changes. The rule now lists what the code keys on, including the hint-mark bits.
- 'HSV color ramps': src/engine/color/palette-games.ts builds the backgrounds from the shared fills and their midpoints, and the other three ramps by mixing toward the ink or the board. The word HSV is dropped. The fourth ramp is named as the washed background.
- `Game` with five type arguments: `signpostGame` is typed with eight (mistake, hint and rung types added). The rule now names `Game` alone.

### mosaic

- `validateParams` rejects a board smaller than 3x3: it does not. `validateParams` in src/games/mosaic/state.ts checks only the 10000-tile ceiling; the minimum is `bounds: { min: 3 }` on the dimension fields in src/games/mosaic/index.ts, which the engine's `paramsError` refuses ("Width must be at least 3."). The spec now says the engine refuses it from the declared bounds.
- `validateDesc` SHALL reject a bad character or wrong length: the game defines no `validateDesc`. `parseDesc` under `newState` (src/games/mosaic/state.ts) refuses both and the engine's `validateDesc` (src/engine/desc-error.ts) reports it. The spec now says the desc is refused, naming no hook.
- State holds `notCompletedClues`, set at `newState`, recounted after each move, and 0 on completion (three places): `MosaicState` has no such field. `cluesLeft` in src/games/mosaic/state.ts derives the count from the marks on demand. The spec now speaks of the count of clues left following the marks.
- `MosaicMove` is one of toggle, paint or solve: the union in src/games/mosaic/state.ts has a fourth arm, `fill`, which gives a hint step's cells one mark. Added to the move requirement, and to the reflagging rule (toggle, paint or fill).
- The game implements `Game<MosaicParams, MosaicState, MosaicMove, MosaicUi, MosaicDrawState>`: `mosaicGame` in src/games/mosaic/index.ts declares eight type arguments (adds MosaicMistake, MosaicHint, MosaicRung). The spec now says `Game` alone.

### flip

- "Encoding SHALL round-trip a decoded parameter set": only the full encoding does. `letters(paramConfig, RULESET_KW, ["c", "r"], { full: true })` in src/games/flip/index.ts writes the letter in the full form alone, so the brief form of a Random set is `WxH` and decodes as Crosses (flip.test.ts expects `encodeParams(p, false)` to be "4x6"). The spec now says the full encoding round-trips, and the rulesets requirement states the encoding as width and height, plus `c` or `r` in the full form.
- "SHALL provide a statusbar string reporting move count and completed/auto-solved state": `statusbarText` in src/games/flip/index.ts returns `Moves: N` alone, and `emitStatusBar` in src/engine/midend.ts prefixes the completion words through `completionStatus`. The spec now says the game reports the count and the engine's words are prefixed to it.
- "Colors SHALL be derived from the supplied default background": `colors` in src/games/flip/render.ts derives only the background, the square surface (`cellSurface`) and the grid lines (`surfaceGrid`) from it. The pieces take `TWO`, the diagrams are pinned `WHITE` and `BLACK`, and the cursor and hint colors are the palette's constants. The spec now names the three that are derived; the old scenario's "the palette is derived from the host background" became "the surface".

### project-identity

- "Read by every surface that shows them" and the scenario's "none of them carries its own copy of the string": the listed surfaces do read APP_NAME (src/dialogs/about-dialog.ts, src/screens/home-screen.ts, vite.config.ts manifest and template data), but src/assets/privacy.html (the About dialog's own Privacy panel), unsupported.html, public/404.html and help/index.md, help/install.md, help/puzzles.md write "Hintful Puzzles" out. The requirement now names the surfaces that read the source, and the scenario is limited to the heading, the manifest and the dialog's title and description.
- Scenario "a page title shows the product name and the tagline": only the front page's title carries the tagline (templates/index.html.hbs line 7). A puzzle page's title is puzzle name, description and appName (templates/puzzle.html.hbs lines 11-12), and unsupported.html and public/404.html carry the name alone. The tagline rule now binds the front page's header and title, and a second scenario states the puzzle page title.
- "This covers the fallback link shown to unsupported browsers" (as a link that must resolve to this project): unsupported.html has a link back to "/" and two outward links, to Simon Tatham's site and to medmunds.github.io/puzzles, offered as "two other places play the same puzzles". Written that way by commit b2080e61, the identity change itself. Stated now beside the attribution links, with a scenario.

### samegame

- `validateParams` SHALL require all five bounds (w>=1, h>=1, 3<=ncols<=9, scoresub in {1,2}, w*h>1): `validateParams` in src/games/samegame/state.ts refuses only `ncols < 3` and `w*h <= 1` (plus an unreasonably large area). The lower bound on w and h, the upper bound on ncols and the two scoring choices are declared on `paramConfig` and refused by the engine's `paramsError` (src/engine/params.ts); the game's own test reads the engine's sentences 'No. of colors must be at most 9.' and 'Scoring system must be one of ...'. The new spec keeps all five bounds and says which half refuses which.
- A desc integer outside `0..ncols` is rejected: `parseDesc` in src/games/samegame/state.ts reads each color with `r.int(1, p.ncols)`, so `0` is refused too; samegame.test.ts refuses `1,0,3` with DESC_OUT_OF_RANGE. Corrected to `1..ncols`, with a scenario for the empty cell.
- `newState` leaves the complete/impossible flags clear: `SamegameState` has no complete flag, and `newState` sets `impossible` from `check(tiles, w, h)`, so a typed desc with no adjacent same-color pair (e.g. `1,2,3`) starts impossible. Corrected to 'reads `impossible` off the tiles'.
- `statusbarText` shows the completion words before the score on a cleared board: `statusbarText` in src/games/samegame/index.ts returns `Score: N` alone when cleared; the midend prepends the engine's completion words (src/engine/completion-status.ts), which is how the status bar reads `COMPLETED! Score: N`. The new requirement states both halves.

### fifteen

- `validateParams` rejects `w < 2` or `h < 2`: Fifteen has no `validateParams`. `paramConfig` in `src/games/fifteen/state.ts` declares `bounds: { min: 2 }` and the engine's `paramsError` (`src/engine/params.ts`) refuses on it. The spec now says the params are refused by the minimum the fields declare.
- The five type arguments of `Game<FifteenParams, FifteenState, FifteenMove, FifteenUi, FifteenDrawState>`: `fifteenGame` in `src/games/fifteen/index.ts` is typed with eight (the last is `FifteenRung`). The spec names `Game` alone, as the Sixteen rewrite did.
- The home narration is for a cell 'where the solver will not disturb it again': `narrateFifteenStep` in `src/games/fifteen/index.ts` tests only that the slid tile lands in its own solved cell (`landsAtOwnHome = board.gapPos === tile - 1`). The spec now states the positional test.
- The per-tile cache repaints 'only when it changed, is animating, or the flash background changed': `redraw` in `src/games/fifteen/render.ts` also repaints when the hinted tile changed (`ds.hintTile !== hintTile`). The spec lists it.
- A completion flashes 'the background': `redraw` passes the flash color to `drawTile` as a tile's face only, and the gap stays `COL_WELL`. The spec says the tiles' faces flash.

### twiddle

- Old: "`validateParams` SHALL reject `n < 2` ... and a negative `movetarget`". The game's `validateParams` (src/games/twiddle/state.ts) checks only `w < n`, `h < n` and the area. `n < 2` and a negative `movetarget` are refused by the engine's `paramsError` (src/engine/params.ts), which reads the `bounds: { min: 2 }` and `bounds: { min: 0 }` that the two `numberItem`s declare in src/games/twiddle/index.ts before it calls the game's `validateParams`. The sentences are "Rotating block size must be at least 2." and "Number of shuffling moves must be at least 0.", as src/games/twiddle/twiddle.test.ts asserts through `paramsError`. The new requirement "Twiddle refuses a board smaller than its block" states the declared bounds and the engine's refusal.
- Old scenario "Invalid params are rejected" said `validateParams` receives `{ n: 1 }` or a negative `movetarget` and returns a reason. For those two inputs the game's `validateParams` returns null. The scenario now names the engine's params check, which does return a reason for all three inputs.

### pegs

- The cut-off refusal was said to be 'a sentence counting the pegs', and its scenario to say 'how many pegs are cut off'. The sentence in `hint` (src/games/pegs/hint.ts) reads 'The outlined peg is cut off...' or 'The outlined pegs are cut off...', outlines them through `markedDeadEnd`, and holds no number. The requirement and scenario now say it outlines the pegs, says they are cut off, and asks the player to undo.
- The shape journey (three or six jumps clearing a row, column or block) was stated without condition beside the cut-off rule. `hint` in src/games/pegs/hint.ts looks for a rival jump that cuts a peg off first and returns that step, reaching `packageAt` only when there is none. The new requirement 'Pegs' hint clears a shape as one journey' carries the condition 'where no other jump would cut a peg off', and the judged-rivals requirement spells the old 'Otherwise' out as 'neither a jump that cuts a peg off nor a shape to clear'.

### flood

- Old: "`validateParams` SHALL reject `w·h < 2`, `colors` outside 3-10, and negative `leniency`". `validateParams` in src/games/flood/state.ts holds only the `w·h < 2` check. The other two are refused by the engine: the `colors` and `leniency` items in the `paramConfig` of src/games/flood/index.ts declare `bounds` (3 to `MAXCOLORS` = 10, and min 0), and `paramsError` in src/engine/params.ts checks an item's bounds before it calls the game's `validateParams`. The spec now says who refuses what (requirement "Flood refuses params it cannot deal").

### cube

- A `CubeMove` is one of up to eight directions, diagonals included, on a triangular grid. In the code `CubeMove` is `{ dir: "L" / "R" / "U" / "D" }` on every grid (src/games/cube/state.ts), and `interpretMove` (src/games/cube/index.ts) translates a diagonal input into the orthogonal direction with the same edge mask before making the move. The eight directions are input only; the new requirement "A Cube move is one of four orthogonal rolls" says so.
- Diagonals are available on a "hexagonal" grid. `enumGridSquares` (src/games/cube/grid.ts) builds two topologies only: squares for the cube and triangles for the other three solids. A hexagon is one outline the patch of triangles takes, not a grid of its own. The requirement and its scenario now say "triangular" only.

### latin-solver

- The old spec gave the entry point as eleven positional arguments: `latinSolver(grid, o, maxdiff, diffSimple, diffSet0, diffSet1, diffForcing, diffRecursive, usersolvers, valid, ctx)`. The exported function in `src/engine/latin.ts` is `latinSolver(grid, o, cfg)`, and those nine values are fields of the `LatinSolverConfig` interface (Salad calls it as `latinSolver(grid, o, cfg)` in `src/games/salad/solver.ts`). The requirement now gives that signature and names the nine fields the config carries.

### random

- Old 'Characterization corpus is committed to the repository' gave as the reason for freezing the corpus that moving the stream 'would silently change the board behind every seed a player has shared'. No part of the app hands a seed out, and a seed's board already changes whenever a generator changes: openspec/specs/app-shell/spec.md 'The app hands out boards, never seeds' and 'The game-ID notification carries no seed', and docs/doctrine.md ('changing which board a seed deals is not a compatibility break'). The rule (frozen, SHALL NOT be re-baselined) is kept; its reason now says what the module does hold, the numbers a seed feeds a generator.
- Old 'The random module's output is stable across builds' said 'existing game IDs and shared seeds must keep producing the same boards'. The module holds the stream, not the board; the same app-shell requirements and doctrine say a seed may name a different board after a generator change, and a shared game ID is params:desc, which does not pass through the generator. The requirement keeps exact corpus replay and gives the stream as its reason.

## Size, before and after

| Capability | Before | After | Corrected in review |
| --- | --- | --- | --- |
| repo-layout | 2445 lines / 42 requirements / 264 SHALL (42 bodies over 500 characters, 16 over 2000, longest 5228) | 2620 lines / 160 requirements / 338 SHALL (no body over 500 characters, longest 500; 201 scenarios) | 6 |
| engine-hints | 2166 lines / 45 requirements / 331 SHALL (37 bodies over 500 characters, longest 8852) | 2588 lines / 162 requirements / 413 SHALL (0 bodies over 500 characters, longest 500; 199 scenarios) | 7 |
| ts-engine | 1758 lines / 39 requirements / 293 SHALL (36 bodies over 500 characters, longest 2548) | 2000 lines / 126 requirements / 338 SHALL (0 bodies over 500 characters, longest 495; 163 scenarios) | 4 |
| build-pipeline | 1541 lines / 29 requirements / 169 SHALL | 1615 lines / 100 requirements / 212 SHALL | 6 |
| app-shell | 1100 lines / 36 requirements / 163 SHALL (26 bodies over 500 characters, longest 2198) | 1253 lines / 81 requirements / 198 SHALL (0 bodies over 500 characters, longest 499; 110 scenarios) | 5 |
| engine-input | 986 lines / 27 requirements / 160 SHALL (25 bodies over 500 characters, longest 4773) | 1242 lines / 78 requirements / 189 SHALL (0 bodies over 500 characters, longest 498; 92 scenarios) | 5 |
| engine-candidate-hints | 891 lines / 22 requirements / 145 SHALL | 1146 lines / 71 requirements / 171 SHALL | 9 |
| engine-params | 827 lines / 24 requirements / 147 SHALL | 1120 lines / 69 requirements / 189 SHALL (longest body 500 characters, 93 scenarios) | 4 |
| ts-migration | 701 lines / 16 requirements / 77 SHALL | 746 lines / 44 requirements / 104 SHALL (longest body 497 characters, 55 scenarios) | 6 |
| engine-colors | 638 lines / 24 requirements / 83 SHALL (18 bodies over 500 characters, longest 1458) | 765 lines / 46 requirements / 107 SHALL (0 bodies over 500 characters, longest 498; 63 scenarios) | 7 |
| loopy | 606 lines / 15 requirements / 122 SHALL | 815 lines / 52 requirements / 141 SHALL | 10 |
| engine-notes | 568 lines / 15 requirements / 93 SHALL (12 bodies over 500 characters, longest 3765) | 710 lines / 46 requirements / 113 SHALL (0 bodies over 500 characters, longest 489; 53 scenarios) | 12 |
| engine-drawing | 538 lines / 12 requirements / 77 SHALL (10 bodies over 500 characters, longest 3701) | 620 lines / 35 requirements / 84 SHALL (0 bodies over 500 characters, longest 483; 48 scenarios) | 4 |
| guess | 532 lines / 12 requirements / 100 SHALL (7 bodies over 500 characters, longest 5370) | 664 lines / 40 requirements / 122 SHALL (0 bodies over 500 characters, longest 480; 58 scenarios) | 7 |
| crossing | 517 lines / 14 requirements / 95 SHALL (11 bodies over 500 characters, longest 2212) | 676 lines / 44 requirements / 106 SHALL (no body over 500 characters, longest 490; 56 scenarios) | 5 |
| solo | 505 lines / 16 requirements / 79 SHALL | 787 lines / 55 requirements / 107 SHALL | 4 |
| bridges | 437 lines / 13 requirements / 74 SHALL | 627 lines / 40 requirements / 98 SHALL (longest body 499 characters, 48 scenarios) | 6 |
| galaxies | 422 lines / 8 requirements / 62 SHALL (6 bodies over 500 characters, longest 2354) | 608 lines / 43 requirements / 96 SHALL (0 bodies over 500 characters, longest 463; 50 scenarios) | 5 |
| tracks | 409 lines / 12 requirements / 58 SHALL (11 bodies over 500 characters, longest 1910) | 594 lines / 39 requirements / 80 SHALL (0 bodies over 500 characters, longest 498; 48 scenarios) | 6 |
| palisade | 407 lines / 12 requirements / 64 SHALL (9 bodies over 500 characters, longest 3948) | 559 lines / 37 requirements / 78 SHALL (0 bodies over 500 characters, longest 480; 45 scenarios) | 7 |
| netslide | 398 lines / 11 requirements / 80 SHALL | 627 lines / 48 requirements / 101 SHALL (longest body 400 characters, 50 scenarios) | 3 |
| towers | 387 lines / 12 requirements / 65 SHALL | 539 lines / 36 requirements / 87 SHALL (longest body under 500 characters, 42 scenarios) | 6 |
| map | 382 lines / 9 requirements / 76 SHALL | 653 lines / 45 requirements / 94 SHALL (longest body 466 characters, 52 scenarios) | 7 |
| subsets | 371 lines / 8 requirements / 65 SHALL (longest body 2078 characters, all 8 over 500) | 525 lines / 35 requirements / 81 SHALL (longest body 458 characters, none over 500, every requirement has a scenario) | 9 |
| inertia | 371 lines / 12 requirements / 63 SHALL | 494 lines / 34 requirements / 71 SHALL (longest body 489 characters, 40 scenarios) | 5 |
| undead | 361 lines / 10 requirements / 50 SHALL | 565 lines / 38 requirements / 88 SHALL (longest body 417 characters, 45 scenarios) | 4 |
| singles | 361 lines / 10 requirements / 71 SHALL | 542 lines / 36 requirements / 78 SHALL (longest body 496 characters, 44 scenarios) | 5 |
| sokoban | 359 lines / 10 requirements / 67 SHALL (8 bodies over 500 characters, longest 1624) | 473 lines / 33 requirements / 78 SHALL (0 bodies over 500 characters, longest 455; 41 scenarios) | 4 |
| seismic | 355 lines / 8 requirements / 73 SHALL (8 bodies over 500 characters, longest 2799) | 507 lines / 36 requirements / 89 SHALL (no body over 500 characters, every requirement has a scenario) | 5 |
| salad | 351 lines / 11 requirements / 61 SHALL (9 bodies over 500 characters, longest 1923) | 471 lines / 32 requirements / 73 SHALL (0 bodies over 500 characters, longest 432) | 4 |
| slant | 346 lines / 13 requirements / 51 SHALL | 541 lines / 40 requirements / 81 SHALL (longest body 471 characters) | 4 |
| rome | 346 lines / 10 requirements / 69 SHALL (all 10 bodies over 500 characters, longest 1318) | 458 lines / 34 requirements / 73 SHALL (0 bodies over 500 characters, longest 448; 37 scenarios) | 5 |
| bricks | 342 lines / 10 requirements / 73 SHALL | 483 lines / 34 requirements / 86 SHALL (longest body 451 characters, 40 scenarios) | 1 |
| lightup | 341 lines / 11 requirements / 54 SHALL | 531 lines / 36 requirements / 97 SHALL (longest body 499 chars, 44 scenarios) | 8 |
| grid | 341 lines / 10 requirements / 50 SHALL (8 bodies over 500 characters, longest 1601) | 500 lines / 33 requirements / 73 SHALL (0 bodies over 500 characters, longest 428; 43 scenarios) | 3 |
| keen | 337 lines / 11 requirements / 52 SHALL | 563 lines / 38 requirements / 84 SHALL | 5 |
| group | 331 lines / 9 requirements / 62 SHALL | 533 lines / 35 requirements / 89 SHALL | 4 |
| tents | 325 lines / 12 requirements / 49 SHALL (10 bodies over 500 characters, longest 1458) | 452 lines / 31 requirements / 76 SHALL (no body over 500 characters, longest 478; 37 scenarios) | 4 |
| unequal | 324 lines / 10 requirements / 55 SHALL | 573 lines / 39 requirements / 94 SHALL | 13 |
| boats | 321 lines / 9 requirements / 62 SHALL (as spec-ledger counts them at bb004490) | 449 lines / 31 requirements / 70 SHALL; longest body 498 characters, 34 scenarios, none over 500 and none without a scenario | 3 |
| unruly | 320 lines / 9 requirements / 54 SHALL | 506 lines / 37 requirements / 67 SHALL (longest body 499 characters, 38 scenarios) | 4 |
| mathrax | 320 lines / 10 requirements / 58 SHALL | 446 lines / 28 requirements / 72 SHALL (longest body 500 characters, 40 scenarios) | 7 |
| range | 316 lines / 9 requirements / 54 SHALL | 440 lines / 31 requirements / 66 SHALL (longest body 497 characters, 32 scenarios) | 3 |
| spokes | 309 lines / 10 requirements / 71 SHALL | 413 lines / 28 requirements / 78 SHALL (longest body 495 characters, 32 scenarios) | 4 |
| dominosa | 299 lines / 10 requirements / 57 SHALL | 475 lines / 34 requirements / 71 SHALL (longest body 495 characters, 38 scenarios) | 7 |
| slide | 294 lines / 7 requirements / 66 SHALL (6 bodies over 500 characters, longest 2855) | 470 lines / 33 requirements / 80 SHALL (0 bodies over 500 characters, longest 494; 39 scenarios) | 4 |
| blackbox | 292 lines / 9 requirements / 55 SHALL | 501 lines / 40 requirements / 70 SHALL (longest body 471 characters, 43 scenarios) | 1 |
| separate | 289 lines / 12 requirements / 48 SHALL (9 bodies over 500 characters, longest 1759) | 431 lines / 31 requirements / 69 SHALL per the ledger check (0 bodies over 500 characters, longest 438; 35 scenarios) | 6 |
| pattern | 287 lines / 8 requirements / 49 SHALL | 385 lines / 26 requirements / 66 SHALL (longest body 475 characters, 29 scenarios) | 4 |
| clusters | 285 lines / 7 requirements / 66 SHALL | 400 lines / 26 requirements / 71 SHALL (longest body 457 characters, 32 scenarios) | 2 |
| magnets | 284 lines / 11 requirements / 46 SHALL (9 bodies over 500 characters, longest 1182) | 411 lines / 28 requirements / 61 SHALL (0 bodies over 500 characters, longest 494; 33 scenarios) | 3 |
| abcd | 284 lines / 9 requirements / 50 SHALL | 405 lines / 27 requirements / 59 SHALL | 5 |
| engine-helpers | 281 lines / 8 requirements / 40 SHALL (6 bodies over 500 characters, longest 3863) | 379 lines / 21 requirements / 56 SHALL (0 bodies over 500 characters, longest 469) | 7 |
| filling | 277 lines / 11 requirements / 41 SHALL | 367 lines / 25 requirements / 61 SHALL | 5 |
| mines | 269 lines / 10 requirements / 65 SHALL (5 bodies over 500 characters, longest 1545) | 371 lines / 27 requirements / 69 SHALL (0 bodies over 500 characters, longest 438; 30 scenarios) | 1 |
| untangle | 268 lines / 8 requirements / 54 SHALL (8 bodies over 500 characters, longest 2520) | 432 lines / 28 requirements / 80 SHALL (0 bodies over 500 characters, longest 485) | 5 |
| sticks | 268 lines / 6 requirements / 67 SHALL | 403 lines / 30 requirements / 73 SHALL (longest body 498 characters, 33 scenarios) | 2 |
| sixteen | 255 lines / 7 requirements / 41 SHALL | 350 lines / 23 requirements / 57 SHALL (longest body 490 characters, 28 scenarios) | 7 |
| pearl | 251 lines / 9 requirements / 52 SHALL | 420 lines / 30 requirements / 61 SHALL (longest body 480 characters) | 2 |
| rect | 228 lines / 8 requirements / 36 SHALL | 330 lines / 21 requirements / 49 SHALL (longest body 493 characters, 28 scenarios) | 1 |
| net | 208 lines / 11 requirements / 64 SHALL | 348 lines / 26 requirements / 72 SHALL (longest body 448 characters, 30 scenarios) | 6 |
| signpost | 203 lines / 9 requirements / 35 SHALL | 284 lines / 20 requirements / 52 SHALL | 6 |
| mosaic | 201 lines / 6 requirements / 37 SHALL (5 bodies over 500 characters, longest 1334) | 308 lines / 21 requirements / 55 SHALL (0 bodies over 500 characters, longest 427) | 4 |
| flip | 201 lines / 7 requirements / 41 SHALL | 313 lines / 20 requirements / 46 SHALL (longest body 481 characters) | 3 |
| project-identity | 190 lines / 6 requirements / 26 SHALL | 261 lines / 15 requirements / 36 SHALL (longest body 486 characters) | 10 |
| samegame | 165 lines / 5 requirements / 34 SHALL | 284 lines / 17 requirements / 41 SHALL (longest body 446 characters) | 2 |
| fifteen | 164 lines / 5 requirements / 25 SHALL (4 bodies over 500 characters, longest 1429) | 225 lines / 14 requirements / 39 SHALL (0 bodies over 500 characters, longest 487; 17 scenarios) | 1 |
| twiddle | 146 lines / 4 requirements / 21 SHALL | 258 lines / 18 requirements / 43 SHALL (longest body 407 characters, 21 scenarios) | 0 |
| pegs | 140 lines / 5 requirements / 26 SHALL | 210 lines / 14 requirements / 29 SHALL | 3 |
| flood | 134 lines / 5 requirements / 22 SHALL | 233 lines / 16 requirements / 28 SHALL (longest body 437 characters, 21 scenarios) | 3 |
| quick-save | 132 lines / 4 requirements / 21 SHALL | 176 lines / 13 requirements / 25 SHALL (longest body 387 characters, 14 scenarios) | 1 |
| licensing | 130 lines / 3 requirements / 15 SHALL (2 bodies over 500 characters, longest 1594) | 212 lines / 15 requirements / 27 SHALL (0 bodies over 500 characters, longest 442) | 3 |
| puzzle-icons | 115 lines / 3 requirements / 10 SHALL | 140 lines / 8 requirements / 18 SHALL (longest body 421 characters) | 3 |
| combi | 115 lines / 3 requirements / 10 SHALL (all 3 bodies over 500 characters; longest 1818) | 136 lines / 8 requirements / 17 SHALL (0 bodies over 500 characters; longest 468) | 6 |
| cube | 110 lines / 4 requirements / 15 SHALL (all four bodies over 500 characters: 747, 624, 598, 570) | 167 lines / 12 requirements / 26 SHALL (longest body 368 characters, 13 scenarios) | 1 |
| latin-solver | 87 lines / 3 requirements / 11 SHALL | 101 lines / 6 requirements / 14 SHALL | 4 |
| random | 55 lines / 2 requirements / 7 SHALL | 84 lines / 6 requirements / 8 SHALL (longest body 363 characters, 9 scenarios) | 3 |
| canvas-sizing | 54 lines / 1 requirement / 7 SHALL (one body of 1744 characters) | 74 lines / 5 requirements / 9 SHALL (longest body 388 characters) | 6 |
