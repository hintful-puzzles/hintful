# Correct stale requirement text

## 1. Re-take the census

- [x] 1.1 Re-run each instrument rather than trusting the proposal's list, and
      record the counts here as the vacuity check for section 6:
      - **Tier words**: for every spec whose `src/games/<id>/` calls
        `tierNames(n[, { search: true }])`, every line naming a tier word
        (`Easy Normal Tricky Hard Extreme Unreasonable`, plus retired words such
        as `Medium Basic Trivial Intermediate Advanced Recursive`, capitalized or
        as a quoted lowercase value) that the call does not produce.
      - **Paths**: every backticked token under a repo root (`src/`, `scripts/`,
        `docs/`, `help/`, …) or a bare file name, checked against `git ls-files`.
      - **The C engine**: `C/WASM`, `WASM path`, `wasm artifact`, `unported`,
        `non-ported`, `puzzles/<name>.c`.
      - **Deleted declarations**: `needsRightButton`, `REQUIRE_RBUTTON`.

      Key the tier instrument on the *call*, not on its argument: the
      2026-09-12 census matched `tierNames(<digit>` and so missed Magnets, whose
      call is `tierNames(DIFF_COUNT)`, and Bridges, whose list is
      `DIFFICULTY_NAMES` rather than `DIFF_NAMES`.

      Taken 2026-09-13, keyed on the registry rather than on any call's spelling
      (`difficultyTiers(getTsGame(id))` for every registered game with a spec):
      - **Tier words, as specified above: 102 hits over 29 tiered games.** The
        instrument as specified is blind to half the defect: it flags a word
        the game no longer produces, and a rename is positional, so a word that
        is still on the scale but now names a *different rung* passes. Salad's
        old "Normal" is today's Easy, Keen's old "Hard" is today's Tricky,
        Unruly's old "Easy" is today's Normal — all invisible to it. So a second
        instrument was added, keyed on each game's **old** list (the arrays
        `947aa8c6` removed) and matching only the words whose position moved:
        **115 spec lines over the 22 renamed games**, case-insensitive, so it
        includes false positives ("hard-block", "basic-region", "trivial row
        eliminations", Solo's "extreme forcing chains").
      - **Paths: 57 hits.** Stale: `ts-engine`'s `puzzle-view.ts` and
        `catalog.json`, `repo-layout`'s `head-matter.ts`. Everything else is
        history (`src/native/…`, `docs/framework-rdd/`, `openspec/project.md`),
        an upstream C file named as the reference (`random.c`, `midend.c`,
        `latin.c`), or a generated output name (`pegs.html`).
      - **The C engine: 38 lines.** Stale: `flip` and `galaxies` (6 each),
        `quick-save` (1), `ts-migration` line 36, and in `ts-engine` the three
        unported-game clauses with their scenarios, the catalog-without-wasm
        requirement and `executeHint`'s "The C/WASM surface accepts and ignores
        the flag". History, left alone: `ts-engine`'s retirement explanations
        and its two past-tense comparisons ("the keypad it showed on the C/WASM
        path", "the same space the C/WASM build did"), `ts-migration`'s
        retirement requirement, `repo-layout`'s two.
      - **Deleted declarations: 6 hits**, 4 stale (the four first requirements)
        and 2 history in `ts-engine`.
- [x] 1.2 Classify every hit by reading its line: stale present-tense claim, or
      deliberate history ("was", "retired by", "rather than upstream's"). Only the
      first kind is in scope. The 2026-09-12 path census was mostly history — of
      56 hits, about four were stale. Before changing a tier word that is valid
      in both vocabularies, its line was `git blame`d: every such line in the
      renamed specs predates the rename (latest 2026-09-02), so none was written
      in the new vocabulary.

## 2. Tier vocabulary

- [x] 2.1 For each game spec in the census, restate the params, presets, solver
      ladder and scenarios in the words its `DIFF_NAMES` produces. Name tiers the
      way the code does — by the conventional word, never by upstream's.
      Deltas on bridges, clusters, dominosa, galaxies, group, keen, lightup,
      magnets, map, pearl, salad, seismic, singles, slant, spokes, tents, towers,
      tracks, undead, unequal, unruly. A constant keeps upstream's name and is
      glossed (`DIFF_TRICKY` (the Normal tier)); where a param holds upstream's
      string keys (Keen, Towers, Undead, Unequal) the spec says so. No delta was
      needed for solo, subsets, bricks, mathrax, ascent, boats, loopy, rome —
      every hit there was a technique name or history. Three scenario headings
      carried a stale tier word (Pearl, Salad, Galaxies); `openspec validate`
      refuses a `MODIFIED` that renames a scenario, so those requirements are
      `REMOVED` + `ADDED`.
- [x] 2.2 Light Up's "current Hard tier … chosen by the owner" passage: read the
      requirement's history (`git log -S`) and state the resolved tier, which the
      code calls `Unreasonable`. Resolved by `add-lightup-hint` (04654edb) as a
      label-only rename.
- [x] 2.3 Salad's `DIFF_EASY` / `DIFF_HARD` doc comments in `state.ts`.

## 3. Deleted declarations

- [x] 3.1 Drop `needsRightButton = true` from the first requirement of `bridges`,
      `dominosa`, `magnets` and `tents` (and any other the census finds).
      Done in this change's first deltas, which also rename those four
      requirements' tiers; their other requirements still need 2.1. The census
      found no fifth spec.

## 4. The C/WASM hybrid

- [x] 4.1 `flip`, `galaxies`: replace "… is served by the native TS engine" with
      what is still true (registered in the engine registry) and retire the
      C/WASM scenario by `REMOVED` + `ADDED`.
- [x] 4.2 `ts-engine`: for each requirement specifying an unported game's
      capability value, decide whether the clause has any remaining meaning (a
      game that does not implement the hook) and restate it that way, or retire
      the scenario. Same for "A TS-ported game stays in the catalog without a wasm
      artifact", whose premise is gone.
      `canFindMistakes` and `hasReference` keep a meaning (the `Midend` returns
      0 / null when the hook is absent) and are restated that way; `canMarkAll`'s
      unported scenario duplicated "A game without pencil marks shows no control"
      and is dropped. The catalog requirement is removed: catalog ↔ registry
      agreement is already "Per-game engine selection is a runtime registry".
- [x] 4.3 `quick-save`, `ts-migration`: the remaining present-tense mentions.

## 5. Contradicted requirements

- [x] 5.1 `netslide`: retire the "solution not known" clause and scenario in
      favor of the requirement the code follows.
- [x] 5.2 `palisade`: "shaded" → "outlined" for referenced cells and cited
      regions, confirmed against `render.ts`.
- [x] 5.3 `repo-layout`: rewrite the Cloudflare requirement to match the deploy
      `AGENTS.md` § "Build commands" describes, or retire it if `build-pipeline`
      already governs the deploy. Rewritten rather than retired: `build-pipeline`
      governs the gating and verification but not what tooling the repo may
      carry, and the three prohibitions are still true.
- [x] 5.4 `random` surface names; `grid`'s `grid.ts`; `ts-engine`'s
      `puzzle-view.ts`; `repo-layout`'s component list; `undead`'s key count.
      Undead's "four monster-entry keys" was wrong in kind, not count: three
      monsters plus a clear key. `repo-layout`'s dialog and component lists
      become examples rather than inventories, and `src/assets/` is no longer
      called generated.
- [x] 5.5 `help/games/bridges.md`: say bridges may be doubled, or more on a
      custom board.

## 6. Verify and conclude

- [x] 6.1 Before writing each `MODIFIED` block, grep the live spec for the
      sentence and confirm which requirement holds it (`AGENTS.md` § "Work
      management"). Blocks were copied from the live spec by script with
      exact-once replacements, and a word-level diff of every `MODIFIED` block
      against its live requirement (63 blocks, 12 removals) was read: every
      difference is an intended correction.
- [x] 6.2 Re-run section 1's instruments: zero stale hits, and the history hits
      unchanged in number. Re-run on the archived specs: the C-engine instrument
      38 → 12, exactly the twelve history lines § 1.1 names; declarations 6 → 2,
      both history; the stale paths gone (the survivors are a "not
      `components/puzzle-view.ts`" rule, the "no counterpart to `random_free`"
      sentence and build-pipeline history). The moved-word tier instrument cannot
      reach zero by construction — "Normal" is a word in both vocabularies — so
      its 24 remaining spec lines were read: every one uses the conventional word.
- [x] 6.3 `openspec validate --all --strict` (78 passed), archive, and the full
      gate on the commit.

## 7. The same words outside the specs

The tier instruments, pointed at `src/games/<id>/` and `help/games/<id>.md`,
found 182 lines. Most are comments and test titles, but some reach players.

- [x] 7.1 Player-visible strings name the tier from `DIFF_NAMES` instead of
      restating it: Galaxies' status bar said "Difficulty Normal." for an Easy
      board and its `validateParams` said "Normal or Unreasonable"; Group's said
      "Trivial puzzles must have an identity"; Clusters', Magnets' and Pearl's
      refusals said "Tricky" for the Normal tier.
- [x] 7.2 A Galaxies test pins the status bar's tier word to the menu's. Seen
      to fail against the old strings ("Difficulty Normal." for "Difficulty
      Easy.") before being trusted. The other refusals are pinned by their games'
      existing exact-string tests.
- [x] 7.3 Comments, doc comments and test titles in the renamed games use the
      conventional word, or say "upstream's" where they mean upstream's tier.
      Identifiers keep upstream's names; no snapshot is keyed on a renamed title.
- [x] 7.4 Run the app: Galaxies' status bar and a refused Custom size. Galaxies
      at `5x5dn` shows "Difficulty Easy." and Clusters' presets read "7x7 Normal".
      A game ID asking for a too-small Normal board loads a board rather than
      showing the refusal, so the refusal's wording rests on its unit test.
