## 1. Find the copies

- [x] 1.1 Re-measure the guides and the route by kind of game. List each rule
      stated in more than one place, found by reading (a regex over prose
      empties without a sound), with where its home should be.

Found by reading (2026-11-21; four readers over the seventeen guides, each
hit re-read before an edit). `[x]` is folded: the home keeps the rule, the
copies point.

### Duplicates

- [x] Bounding retry loops: home `solver-and-generator.md` § "Every retry
      loop is bounded"; the catalog's `retry-limit.ts` entry points.
- [x] The difficulty contract: the item `mechanics.md` § "Difficulty is a
      declared contract", the capped solve and its guard
      `solver-and-generator.md` § "The difficulty contract".
- [x] The note-taking cell: input and preferences `mechanics.md` § "Pencil
      marks: the full note-taking UX", the picture `rendering.md` § "The
      note-taking cell's picture"; the catalog lists exports and points.
- [x] Check, Tactic, Search: `hints.md` § "The forcing boundary" restated
      the classes, narrower than the home (a weighing is a Check);
      home `solver-and-generator.md` § "Check, Tactic, Search".
      `hints-marks.md` § "Group one firing into one step" is another rule.
- [x] Fixed seeds in `testing.md`: the opening's item 5 is the opening's
      one-line summary with a pointer; not a copy.
- [x] Notes checked like entries, with the free-purpose (Rome) exception
      moved home: `solver-and-generator.md` § "Marks are checked like
      entries"; mechanics, hints-candidates point.
- [x] `aux`: hints-search said "prefer `aux` where tidier", the home
      "only where impractical, measured": home `solver-and-generator.md` §
      "Solve and the generator's aux".
- [x] The Marks key: home `input.md` § "The on-screen keypad".
- [x] Mark-all never resets, and its guard narrows first: home
      `mechanics.md` § "Pencil marks: the full note-taking UX".
- [x] `pointer.ts` rules in the catalog: home `input.md`.
- [x] `copyUi`'s kinds: home `input.md` § "A canceled press is the engine's".
- [ ] `findMistakes` and a hidden answer: mechanics § "Mistake checking is
      part of done" excuses a hidden answer, solver-and-generator § "One
      answer, even when it is hidden" does not (the code agrees: Mines,
      Blackbox, Guess check). Home solver-and-generator; also "a
      permutation puzzle omits the hook" vs `notApplicable` (Fifteen
      declares it).
- [ ] A deducing untiered game: mechanics "writes its own test" vs
      solver-and-generator "answers with `hintFinishes`" (Mines does).
      `hasNoSolution`/`markedDeadEnd`: mechanics and hints.md restate
      solver-and-generator § "One answer, even when it is hidden".
- [ ] A note outside a cell's full set: hints-candidates says Rome may
      pencil an arrow off the board; mechanics and `rome/index.ts` refuse it.
- [ ] `params-stability` re-baseline: mechanics contradicts itself
      (`-u` vs `--update`); home `testing.md`.
- [ ] Step budget: hints.md § "The step budget" home; catalog
      `step-budget.ts`, solver-and-generator restate.
- [ ] Hint refusals: catalog `hint-refusal.ts` restates hints.md §
      "Refusal wording comes from one module"; move its `ALREADY_SOLVED`
      sentence home.
- [ ] `showable`: catalog `hint-plan.ts` restates hints.md § "Show only
      what the board does not already say".
- [ ] Read a desc once, `assertNever`: catalog `desc-error.ts`,
      `assert-never.ts` restate mechanics.
- [ ] Digits, run-length, params `kw`, floats: catalog `decimal.ts`,
      `desc-alphabet.ts`, `run-length.ts`, `params.ts` restate mechanics
      (the catalog's "read it with `atof`" is imprecise).
- [ ] `auto-cross`/`rulesOut`: mechanics § "Preferences" restates
      descriptions.md § "What a placement rules out".
- [ ] Catalog render entries restating their guide: `overlay-sidecar.ts`
      (rendering § "Overlay sidecars"), `pencil-indicator.ts` (rendering,
      input § "A notes mode added to a game"), `draw.ts` (rendering § "A
      shape another game also draws"), `ring.ts`, `hint-mark.ts`,
      `hatch.ts` (hints-marks), `slide-planner.ts`, `finish-search.ts`
      (hints-search), `easing.ts`, `drawRuledOutCross`, `sections.ts`,
      `completion-status.ts`.
- [ ] ladderWalk continuity: hints.md § "Recording the deduction" home;
      descriptions.md § "The runtime a ladder runs on" and catalog
      `hint-frontier.ts` restate.
- [ ] FactGraph parents: descriptions.md restates catalog `fact-graph.ts`.
- [ ] Monotone rules: hints.md § "A hint carries on from an entry the
      player made first" restates solver-and-generator § "A fixpoint is
      order-independent only if every rule is monotone".
- [ ] No line named by a number: hints-marks § "Hatch the line the
      sentence names" restates hints.md § "Name elements by what the
      player can see"; plan cap counts shown steps: hints.md restates
      hints-marks § "Bound a plan by the steps it offers".
- [ ] `keepTrack` shrinking: hints-marks, hints.md, catalog.
- [ ] `NoteEncoding.all(i)`: hints-candidates and catalog.
- [ ] The hint-resume slicing: hints-search, hints.md, testing.md (home).
- [ ] Render asks, move code decides; bespoke geometry draw side:
      rendering and mechanics § "Bespoke geometry".
- [ ] `changedState` and a dangling drag: rendering and input § "A board
      change under a gesture is the engine's" (home).
- [ ] `ds.tileSize`: mechanics and rendering (home).
- [ ] Upstream divergence: solver-and-generator § "Divergence and what it
      costs" restates doctrine § "Upstream" (home).
- [ ] Quirks: testing § "Quirks are load-bearing" and solver-and-generator
      § "Solver-gated generation"; say once what "tidy" means.
- [ ] Timing under vitest: testing says ~7× vs node, solver-and-generator
      ~2× vs Chrome; one figure, with date and baseline, in testing §
      "Timing anything under vitest".
- [ ] See a test fail: method, testing § "Break the code under a new
      test", test-strength § 3; extracted logic's tests: testing and
      test-strength § 4; self-derived assertions: test-strength § 3 and
      method.
- [ ] Hint pins: hints.md § "Verifying a hint in-process" restates testing
      § "Pinning a hint's positions".
- [ ] When to push: work-management § "Pushing and deploying" restates
      testing § "What runs when".
- [ ] Focus after a press: testing and input.
- [ ] Color in the words: hints.md and hints-marks § "The engine colors the
      marks" (complementary; check).
- [ ] AGENTS.md: the four heads restated from work-management § "What a
      session files"; "cosmetic" in new-game § "The acceptance gate" and
      work-management.

### Contradictions to settle, not fold

- [ ] Player-visible work: doctrine § and AGENTS.md "ask before changing
      how a control behaves" vs work-management § "What the owner accepts"
      "player-visible does not by itself mean stop and ask". AGENTS.md is
      the owner's; align the guides to it.
- [ ] Naming by color: help-pages "never its color", rendering
      `SHADED_NAME`, vs rendering § "Black pieces stay black".

### Stale names (verify with grep, then fix or delete)

- [ ] hints-marks: `Game.uiUpdateClearsHint` (is `hint.uiUpdateClears`);
      `seedFrom` (Slant), `analyzeLine` (Pattern), Boats' `unfinishable`,
      `hintFirings` (Dominosa), `markedOf` (Range), `deduceHintPlan` in
      Unruly, `drawLinkFor` (Tents); the advice around them may be obsolete
      now these games run compiled ladders.
- [ ] hints-candidates: `satisfiedLines`, `packedLines` (ABCD).
- [ ] hints.md: `skeletonHint`/`deduceHintPlan` as how games plan;
      `deduceHintPlan` in Range, `deduceForcedEdges` in Palisade;
      `Game.refreshHintStep`; `markHelps` (Spokes); `stepOf`;
      `skeletonKeepTrack` location.
- [ ] descriptions, testing: `Game.hintRungs` (is `hint.rungs`).
- [ ] testing: `drawRectOutline` draws "a hint ring".
- [ ] mechanics: `NOT_COLORS`; solver-and-generator: `findBreaks`,
      `findWeighed`; catalog: `easyRungs`/`offered`/`available()`,
      `borderTileStale`, `redivide.ts`'s pointer.
- [ ] new-game § "File anatomy" omits `catalog.ts` and the description.

## 2. One home each

- [ ] 2.1 Keep each rule in its home; replace the copies with a pointer by
      file and heading. Remove passages the earlier changes made obsolete.
- [x] 2.2 Re-measure the route and record it with its query:
      `node scripts/checks/guide-sections.mjs --route`, named in
      `new-game.md` § "The route by kind of game". 2026-11-21, before the
      folds: Cells with notes 4,295 lines; Cells marked by state 4,234;
      Edges and loops 4,329; Moves and search 3,414; Hidden answer 4,826.

## 3. Finish

- [ ] 3.1 Commit, push, archive.
