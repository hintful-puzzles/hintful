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
- [x] `findMistakes` and a hidden answer: mechanics excused a hidden
      answer, the home does not (Mines, Blackbox, Guess check); "a
      permutation puzzle omits the hook" is now `notApplicable` (Fifteen).
- [x] A deducing untiered game: mechanics said "writes its own test", the
      home `hintFinishes` (Mines); mechanics points.
- [x] A note outside a cell's full set: hints-candidates said Rome may
      pencil one; input refuses it (`rome/index.ts`).
- [x] `params-stability`: mechanics contradicted itself; it keeps the
      owner's say-so and points at testing.
- [x] Step budget, hint refusals (the `ALREADY_SOLVED` sentence moved
      home), `showable`, read a desc once, `assertNever`, digits, run-length,
      floats: the catalog lists the exports and points.
- [x] `auto-cross`/`rulesOut`: mechanics points at descriptions.
- [x] Catalog `overlay-sidecar.ts`, `draw.ts`, `hint-mark.ts`,
      `slide-planner.ts`, `finish-search.ts` point at their guides.
- [ ] Catalog `pencil-indicator.ts` (rendering, input § "A notes mode added
      to a game"), `easing.ts`, `drawRuledOutCross`, `sections.ts`,
      `completion-status.ts`: smaller overlaps, read each.
- [x] ladderWalk continuity: descriptions and the catalog's
      `hint-frontier.ts` point at hints.md § "Recording the deduction";
      the catalog's `available()` is the engine's for a compiled technique.
- [x] FactGraph parents: descriptions points at the catalog.
- [x] Monotone rules: hints.md points at solver-and-generator.
- [x] No line named by a number; plan cap counts shown steps.
- [ ] `keepTrack` shrinking: hints-marks, hints.md, catalog.
- [ ] `NoteEncoding.all(i)`: hints-candidates and catalog.
- [ ] The hint-resume slicing: hints-search, hints.md, testing.md (home).
- [x] Bespoke geometry's draw bullets: mechanics points at rendering;
      "render asks, move code decides": rendering points at mechanics §
      "One function, both callers".
- [x] `changedState` and a dangling drag: rendering keeps the preview
      fallback and the keyboard arm, and points at input.
- [x] `ds.tileSize`: rendering's copy is already a line with a pointer.
- [x] Upstream divergence: doctrine § "Upstream" home (it gains "tidiness
      is not one" and "geometry"); solver-and-generator keeps the oracle and
      the quirk-reading list.
- [x] Quirks: testing keeps the fixture angle and points at the divergence
      list and the retry bound.
- [x] Timing under vitest: both figures, each with its baseline, in testing
      § "Timing anything under vitest"; the other two point.
- [x] See a test fail, extracted logic's tests, self-derived assertions:
      testing and test-strength point at one another and at method.
- [x] Hint pins: hints.md keeps the rung key and grouping, and points.
- [x] When to push: work-management points at testing.
- [x] Focus after a press: input points at testing.
- [x] Color in the words: hints.md (the words) and hints-marks (the inks)
      give complementary reasons; kept.
- [x] AGENTS.md's four heads and "cosmetic": kept. AGENTS.md is the brief
      read every session, and each is its one-line form with a pointer; a
      guide is the long form. work-management's "never call a shortfall
      cosmetic" is a clause, kept.

### Contradictions settled

- [x] Player-visible work: work-management § "What the owner accepts"
      left "how a control behaves" and shared links out of its third head,
      which AGENTS.md and doctrine ask before; aligned to AGENTS.md.
- [x] Naming by color: not a contradiction. A help page names a piece by
      its shape; rendering § "Black pieces stay black" now says so before
      what a remaining color word owes the paint.

### Stale names (verify with grep, then fix or delete)

- [ ] hints-marks: `Game.uiUpdateClearsHint` (is `hint.uiUpdateClears`);
      `seedFrom` (Slant), `analyzeLine` (Pattern), Boats' `unfinishable`,
      `hintFirings` (Dominosa), `markedOf` (Range), `deduceHintPlan` in
      Unruly, `drawLinkFor` (Tents); the advice around them may be obsolete
      now these games run compiled ladders.
- [ ] hints-candidates: `satisfiedLines`, `packedLines` (ABCD).
- [ ] hints.md § "The shared plan loop: deduceHintPlan" says to build every
      plan with it, exemplar `skeletonHint`; only Ascent and Loopy import
      it (2026-11-21), a described game plans in `described-hint.ts`.
      Rewrite to what a game does now. (`deduceHintPlan` in Range and
      `deduceForcedEdges` in Palisade: removed from § "The step budget".)
- [ ] hints.md:
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
