# derive-solos-region-names — tasks

## 1. Pin the invariant before changing anything

- [x] 1.1 Write the guard first, against the code as it stands: for a Solo board
      with X diagonals **and** Killer cages, every cell's
      `noRepeatRegionNames(state, cell)` names exactly the regions
      `regionsOf(state, x, y)` returns, with the two diagonals as one word; and
      the `at`-less call is the union over the board. Both functions are
      module-private, so decide how the test reaches them (export, or drive it
      through the rendered `dup` / `cleanObvious` sentences) — and say which, and
      what that choice costs in what the guard can see.

      **Exported**, and the guard is `solo-hint.test.ts`'s "solo no-repeat
      region names". The sentence route can only reach the cells a real
      deduction happened to touch, which on an X board is not reliably the one
      cell of `cr²` lying on both diagonals — the only cell anywhere that asks
      the naming to collapse two regions into one word. **What it costs**: the
      guard sees the two functions, not their call sites, so a `narrate` arm
      passing the wrong cell to `dup` is invisible to it and stays covered by
      the narration walks and the render snapshot. The board is a 4-region
      board built by re-generating at `c=3,r=3,xtype,killer` (5 ms), `cr` odd
      on purpose so the center cell lies on both diagonals.

- [x] 1.2 **Prove it fails**: add a region to `regionsOf` and not to the names
      (and the reverse), watch it go red, restore. A guard nobody has seen fail
      is a guard nobody has seen work.

      Three mutations, run against `-t "no-repeat region names"`:
      **A** — drop the `onDiag1` test so `regionsOf` returns a region the names
      have no word for: 1 failed. **B** — drop `names.push("cage")` so the
      names omit a region: 2 failed. **C** — rename `regionName`'s `col` arm to
      `"col"`: **3 passed before the change and 3 failed after**, which is the
      one that says the derivation took rather than that the two lists happen
      to agree.

- [x] 1.3 Count what it looked at. A board with no Killer data and no X
      diagonals exercises three region kinds of five; assert the population.

      Six kinds, not five — `SoloRegion`'s five plus the untagged cage. The
      guard asserts `cr²` cells visited, the set of kinds seen equal to all six,
      and `onBothDiagonals === 1`, that last one being what would go quietly to
      zero on an even `cr`.

## 2. Derive

- [x] 2.1 Put the name where it can be read off a region without widening
      `SoloRegion` (`proposal.md` states why the cage must stay off that union).

      A `name: string` on **both** arms of `SoloCellRegion`, set at
      construction — `regionName(region)` for the whole regions, the literal
      `"cage"` for the cage. `regionName` is now exported from `hint-text.ts`,
      which is where the reader's vocabulary already lived. The invariant is a
      **type** rather than an assertion: a region added to `regionsOf` cannot
      compile without a word for it. `CellRegion`'s own contract already says a
      game "tags each region with whatever it needs to name it", so this needed
      no engine change.

- [x] 2.2 Replace `noRepeatRegionNames`' hand-written list with the derivation,
      keeping the diagonal dedup and the `at`-less union.

      A `Set` over `regionsOf(...).map(r => r.name)` — one cell when `at` is
      given, every cell of the board when it is not. The `at`-less sweep costs
      one extra pass of `regionsOf` per hint build, against the several the
      plan's opening clean already makes over the same board.

- [x] 2.3 Byte-identical narration: Solo's hint snapshots and
      `solo-hint.test.ts` should not move. A moved snapshot here is a bug this
      change found, not drift — say which.

      Nothing moved: 84 tests, no `*.snap` in `git status`. The two lists did
      agree, which is what the proposal claimed — the defect was that nothing
      made them.

## 3. Close out

- [x] 3.1 Spec delta against whichever `ts-engine` requirement the shape lands
      in — "A cell's regions are one definition per relation" is the likely
      home, since this extends "one definition per relation" to the *naming* of
      a relation.

      `ADDED` rather than `MODIFIED`: naming is a concern beside that
      requirement, not an alteration of it, and an `ADDED` block cannot delete a
      scenario. New requirement "A region's name is read off the region".

- [x] 3.2 `npm run test:slow -- src/games/solo`. 84 passed, 8.7 s.

- [x] 3.3 If the derivation wants a name on `CellRegion` itself, stop and say so
      rather than building it: that is an engine contract on one game's evidence
      (`proposal.md` § "What this does not do").

      It does not, and the measurement says why: **`regionsOf` is supplied by
      exactly one game.** Every other candidate-elimination game takes
      `runLatinCandidatePlan`, whose `rowColRegions` are fixed and whose region
      phrase is the constant `"row or column"` — deriving it would not improve
      it. A `name` on `CellRegion` would be a field every game carries to serve
      one game's sentence. Recorded in `docs/games/hints.md`.

## 4. Fallout

- [x] 4.1 Two prose copies of the same region set, in the same file: the `'M'`
      comment ("each cell's row, column, block, (X) diagonal or (killer) cage")
      and `autoEliminate`'s doc ("every cell sharing a row, column, block,
      diagonal (xtype) or cage (killer)"). Both now name `regionsOf` instead —
      the same defect this change exists to remove, in comment form
      (`AGENTS.md` § "Code conventions": a comment that asserts behavior is a
      claim).

- [x] 4.2 **The same defect in a sentence a player reads.** Solo's auto-pencil
      preference was labeled "…remove it from pencil marks in its row, column
      and block" — a third statement of the region set, and **wrong on two of
      Solo's three modes**: auto-pencil clears the diagonal on an X board and
      the cage on a Killer board (`autoEliminate` reads `regionsOf`). The label
      is this project's own — upstream has no auto-pencil preference at all
      (`grep` of `../puzzles/*.c`, 2026-09-20) — so there is nothing to match.

      `prefs` is a plain array with no params in scope, and the kinds present
      depend on the mode, so an accurate list is not expressible there; making
      `prefs` params-aware would buy a *fourth* statement of the region set at
      the params level. The label now names the **relation**: "When you place a
      number, remove it from the pencil marks it rules out" — true in every
      mode, with no list to drift. Checked in the running app (Preferences
      dialog, 3x3 Easy).

      The four row/column games keep their lists: their regions cannot vary, so
      the concrete wording is better and carries no drift risk. Recorded at
      `engine/pencil-prefs.ts`, which had quoted Solo's old label as its
      example of a per-game sentence.

- [x] 4.3 App check (`AGENTS.md` § "Acceptance bar"): Preferences dialog shows
      the new label; a 3x3 Normal X board's opening clean says "…already placed
      in each cell's row, column, block or diagonal" (the `at`-less union, on a
      board where most cells lie on no diagonal); a 3x3 Killer board's cull says
      "…it can't repeat in its row, column, block or cage". All three are what
      the derivation produces, and the first is the one this change altered.

- [x] 4.4 **Two spec sentences were copies of the region set, and both omitted
      the cage.** `solo` § "Solo interprets digit, pencil, and mark-all input"
      said auto-pencil strikes from "every other cell sharing a row, column,
      block (or diagonal)", and § "Solo exposes pencil-mark preferences" said
      "its row, column, block, and diagonal" — while `autoEliminate` has struck
      the cage since the Killer cull fix. Both `MODIFIED` to the relation.
      `ts-migration` § "A shared declarative helper is adopted by every game it
      fits" gains the rule 4.2 established and drops the parenthetical that
      quoted Solo's old label. Three `MODIFIED` headings checked with
      `rg -F -x` against the live specs before writing them.

      Left alone on inspection: the Solo requirement's "`M` yields a `pencilAll`
      move" reads as a simplification of the adaptive control, which
      `ts-engine` § "The mark-all action SHALL be **adaptive**…" governs —
      restating it in the game spec is the copy this change exists to remove.
