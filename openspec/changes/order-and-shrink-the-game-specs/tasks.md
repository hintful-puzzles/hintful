# Tasks

**Where this stands (2026-10-12, evening): the cut is made and committed.
All 57 game specs are cut in place, reviewed, and passed over twice more
(`design.md` § "What the cut measured": 10% of their bytes, 155 requirements,
284 scenarios), and the engine capabilities state what the games repeated
(`ledger/_engine.md`). What is left, for the next session, in this order:
3.4a (what the readers found: code fixes, each run in the app, and the
questions for the owner), 3.8 (the whole read of the four specs to copy),
then 4.3 (delete `tools/`, archive, `spec-subjects.mjs --fix`, push).**

## 1. Decide, on a sample

- [x] 1.1 Read `state-what-a-games-spec-never-did` in the archive: its
      `brief.md`, `design.md`, `found.md` and three `census/` files. Its six
      kinds of row are the starting list of what a spec owes.
- [x] 1.2 Take six specs of different kinds (a Latin game, a cell-state
      game, an edge game, a search game, the largest and the smallest) and
      sort every requirement into: states what the code cannot; restates a
      declaration; states a rule of the collection. Count each. For
      "restates a declaration", name the declaration and say whether a check
      could read the spec against it or whether the requirement should go.
      Keen, Clusters, Palisade, Inertia, Loopy, Flood: `design.md` § "The
      sample".
- [x] 1.3 Write `design.md` with the count, the rule for what goes, the
      order of subjects and the form of a title, and how the order is held
      without a pattern over prose (a closed list of subject words leading
      the title is one candidate; say what would make it fail silently).
      **Put the cut to the owner with the sample's before and after**, as
      bytes and as two specs they can read: `sample/clusters.after.md` and
      `sample/palisade.after.md`, each with a ledger.

## 2. Reorder

- [x] 2.1 Reorder all 57, one reader per batch of games, classifying each
      requirement by subject. Verify by the shape of the diff: the multiset
      of requirement bodies is unchanged, by a script. Commit 13a4d7e4.
- [x] 2.2 Repoint citations of a retitled requirement
      (`node scripts/checks/spec-citations.mjs`). None cites a game's
      requirement, so there was nothing to repoint.

## 3. Shrink, once the owner has accepted the rule

- [x] 3.0 **The owner answers A, B or C** (`design.md` § "The question for
      the owner"). Answered 2026-10-12: C, amended (`design.md` § "The
      owner's answer: C, amended", which every task below follows).
- [x] 3.1 Write the brief for a batch's writer and the one for its reviewer
      from that section, the guide, and the two ledgers in `sample/` (what
      the first draft did badly is the list of traps). Batch the 57 by kind,
      so a batch leans on the same engine capabilities. `brief.md`; the
      batches are listed under 3.4. **The specs are edited in place and not
      by delta** (`design.md`, "The specs are edited in place, with no
      delta"), and `tools/cut-check.mjs` holds each ledger to its spec's
      diff.
- [x] 3.2 The engine amendments of rule 1, before any batch that leans on
      them, each read against the engine code and reviewed:
      `ledger/_engine.md`. Round one: `border-grid` (buttons, nearest edge,
      cursor, drag, the two reddening rules, the keep-track verdict),
      `ts-engine` (only Solve sets the solver record), `engine-params` (the
      dot-run grammar), `engine-notes` (the pencil preference keys). Round
      two, from what Clusters and Palisade found: `engine-input` (a key on a
      hidden cursor), `engine-hints` (a hint is deduced from the board in
      play), `engine-difficulty` (the bounded answer search, Solve from it,
      the tier a string with no `d` decodes to), `border-grid` (the edge
      byte), `engine-params` (the dot-run round trip).
- [x] 3.2a **A last engine round**, when every batch is written: the
      `## Engine requests` of all the ledgers gathered and given a home, in
      two halves, each written and then reviewed: `ledger/_engine.md`,
      "Third round: the rest" and "Third round: hints and colors", with what
      was deliberately not written (the games' own, no shared code or guard
      behind it) and why.
- [x] 3.2b (done: `brief-third-pass.md` is what each agent was given, and
      every ledger has a `## Third pass` section) **Remove from the games
      what the third round now states.** Each
      third-round table's last column names the games that keep the sentence
      and the requirement in each that holds it, as corrected by that
      round's review section. For each game: cut the sentence (keeping any
      clause the review says must stay), with a ledger row, under a
      `## Third pass` heading; a writer per batch of games and then
      `cut-check`, the validator, `spec-subjects.mjs` and `spec-form.mjs`.
      Read what is left of each touched subject alone: the cut must not
      leave it hollow (`brief.md`, rule 2).
- [x] 3.2c (done with 3.2b, by the same brief) **One rule for the
      Generation pointer, across all 57.** The second
      pass removed "what a dealt board promises is the collection's … with
      no departure" from some specs and kept it in others
      (`git grep -n 'no departure\|departs from n' -- openspec/specs`). Where
      the subject already says what the game's tiers mean, it goes; where
      the subject would say nothing else, it stays. Same for the sentence
      "What a pasted game ID opens as SHALL follow from that", which
      Palisade keeps and Crossing, Filling and Signpost lost.
- [x] 3.3 Redo Clusters and Palisade under the three rules, and read the two
      results whole as specs before starting the rest. Clusters 17,754 to
      14,166 bytes, Palisade 31,602 to 25,015; both read whole and reviewed.
- [x] 3.4 The other 55, a writer then a reviewer a batch. Each game: its
      spec cut in place, and its ledger with a `## Review` section. All 57
      are written and reviewed, and the 27 reviewed before the brief said "A
      pointer is for that case only" had a second pass for it
      (`## Second pass` in their ledgers). Two sweeps over all 57 after
      that: each owed subject measured before and after (Twiddle's
      `Controls` was the one left without its ordinary case, mended), and
      every declared `kw` looked for in the spec before and after (75 keys,
      one gone, Magnets' `strip-clues`, a Custom-dialog field and not a
      stored preference). `cut-check` with no argument gives the measure.
      The batches were: (separate slant rect) (loopy galaxies) (keen towers
      unequal group mathrax) (solo salad rome abcd undead) (crossing map
      seismic filling signpost) (unruly singles lightup tents magnets)
      (mosaic pattern range boats subsets) (tracks pearl bridges spokes
      sticks) (net netslide dominosa bricks ascent) (fifteen sixteen twiddle
      cube flip) (inertia sokoban slide pegs samegame) (mines blackbox guess
      untangle flood).
- [ ] 3.4a Read `## Found` in every ledger
      (`grep -n -A30 '^## Found' ledger/*.md`, and the Found lists of
      `ledger/_engine.md`): fix what is quick and safe, a spec sentence the
      code contradicts above all, and raise the rest in `design.md` under
      "Found, and the owner's to decide". Done so far: Flip's second
      too-large sentence is the engine's (16867030; **its Custom dialog is
      still to be looked at in the running app**, a 300×300 board). Known
      from the reviewers' reports, each verified from the code or by a run
      and each in its game's ledger:
      - the same defect as Flip's in Mosaic ("Width times height must be at
        most 10000.") and Undead (its over-54 refusal): check each is a hold
        limit and not the refusal of a board the game cannot work, then fix;
      - Untangle: a played hint step lands at once (`animLength` answers 0
        because the hint's release sets `justDragged`), against
        `engine-hints`, "A hint-executed move plays its animation at one
        duration". A defect a player meets;
      - Seismic: `validateParams` never reads `full`, so a pasted ID above
        64 cells (100 in Tectonic) is refused at load, against
        `engine-params`, "A generation-only bound is gated on full"; the
        code's comment gives a reason that no longer holds. Upstream has no
        bound, so this refuses a desc upstream's generator writes. Whether a
        board that size loads in reasonable time is unmeasured: measure,
        then fix or raise;
      - Magnets and Undead decode a params string with no `d` as Normal and
        say so nowhere; Keen and Unequal likewise; five games' short form
        reads back differently from the full form through a full-form-only
        flag (ABCD, Crossing, Magnets, Signpost, Tracks), and only
        Signpost's differs from its default. Find whether a player is ever
        handed a short form before calling any of it a defect;
      - Solo's `decodeParams` accepts a malformed symmetry code (`3x3m3`),
        against "A params string is read whole or refused";
      - Boats' ring role draws a filled segment or waves and no ring, which
        `engine-hints`, "A hint marks beside the content, never behind it"
        forbids as worded and `docs/hints-marks.md` § "Echo the move's shape
        in the hint color" asks for: the guide and the requirement disagree;
      - `searchTierSegment` games' default tier "SHALL be Easy" and nothing
        asserts it; `src/store/settings.ts` holds a second copy of the
        `pencil-keep-highlight` default; stale comments at
        `src/games/filling/solver.ts` (above `deduceHintPlan`),
        `src/games/flip/hint.ts:41` and `src/games/slant/render.ts`
        ("teal"); `docs/` names a `"broken"` status of `deduceHintPlan` that
        does not exist.
- [x] 3.5 Where a removed requirement held the only statement of a promise
      to a player (a save or link format), the ledger names the test that
      holds the promise now, or the requirement stays. What a params string
      that leaves a field out decodes to stays in every game; a preference's
      key and choice order stay unless the ledger names the test that pins
      them (restored in Singles, Net, Ascent, Pearl, Spokes, Slant and
      Loopy; Untangle's and Rome's are pinned, and their rows name the
      tests).
- [x] 3.6 `repo-layout` gains the rule as a requirement ("A game's spec does
      not restate what its game declares or what the collection states"),
      with the hollow-subject rule ("A subject a game owes says what the
      game does there or where it is said"); `docs/new-game.md` § "What a
      game's spec holds" gains the hollow-subject rule and names four specs
      to copy.
- [x] 3.7 Measure: bytes, requirements and scenarios of the 57 before and
      after, by subject: `design.md` § "What the cut measured". `sample/` is
      deleted; `spec-subjects.mjs`, the validator and `spec-form.mjs` are
      green.
- [ ] 3.8 **Read whole, as a session that has never seen the game, the four
      specs the guide names as the ones to copy**: `clusters`, `palisade`,
      `keen`, `inertia`. Three passes by different agents went over each, and
      Clusters and Palisade are a quarter shorter than when they were last
      read whole. Each subject says what the game does there or where to
      look; no fragment; every cited title exists
      (`node scripts/checks/spec-citations.mjs` does not read `openspec/`,
      so check a game spec's citations by grep). Mend with a ledger row.
      Palisade's spec was reported changed on disk by an editor that was not
      its assigned agent during the third pass, so read its whole diff
      against `c86372f4` beside its ledger.

## 4. Hold it

- [x] 4.1 The gate check: what a spec owes, derived from each registered
      game, and the order. See it fail on a spec with a subject removed and
      on one out of order. `scripts/checks/spec-subjects.mjs`; the three
      planted failures are in `design.md`.
- [x] 4.2 `docs/new-game.md` § "What a game's spec holds" states the
      rule and the order.
- [ ] 4.3 Gate, commit, archive, push. Before the archive: delete `tools/`
      (its import path breaks when the directory moves) and re-read the
      `repo-layout` delta against the specs as they stand. After it:
      `node scripts/checks/spec-subjects.mjs --fix`.
