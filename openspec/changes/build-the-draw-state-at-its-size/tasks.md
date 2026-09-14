# Build the draw state at its size

## 1. Re-take the measurements before building on them

- [x] 1.1 Re-read every game's `setTileSize` body (all 56; Ascent's is
      `setAscentTileSize`) and classify: bare assignment / derived geometry /
      rounding / invalidation. `proposal.md` says 42 / 6 / 1 / 9 as of
      2026-09-12; a count in prose is a claim. Verify by the script printing
      the bodies, and record the re-taken figures here.
      **Re-taken 2026-09-14:** 57 definitions, not 56 — every game had one.
      42 bare assignments; 7 derived geometry (Ascent, Blackbox, Cube, Guess,
      Lightup, Samegame, Spokes — Guess was missing from the proposal's list);
      1 rounding (Bricks); 9 invalidations (Bridges, Flip, Galaxies, Guess,
      Inertia, Pegs, Rome, Signpost, Spokes — Guess and Spokes are in two
      classes). **A tenth invalidation sat outside the hook**, found by keying a
      scan on the shape `!== ts` rather than on `setTileSize`: Map's `redraw`
      reallocated its blitter when `ds.blTileSize !== ts`.
- [x] 1.2 List every call site of `newDrawState(` and `setTileSize` outside the
      game definitions, keyed on the call shape and not on a helper name
      (`sizedDrawState` is one route; a test writing both calls by hand is
      another). Record the count; it is the vacuity check for section 4.
      **On `HEAD`:** 114 `newDrawState` call sites, 95 `setTileSize` call sites
      (3 engine, 92 tests), 150 `sizedDrawState` calls. The first scan keyed on
      `newDrawState\(` and missed every `newDrawState?.(` — the syntax after the
      name — so the 114 comes from a second scan matching both spellings. A
      fourth route no name scan could see: five test helpers sized by hand with
      `ds.tileSize = TS` after construction; the typechecker found them.
- [x] 1.3 Re-read `src/puzzle/components/view.ts` `resize()` and
      `worker-adapter.ts` `resizeDrawing`, and confirm design D2's premise still
      holds: the canvas is resized, and `canvasCleared` called, whenever the
      board's pixel size changes. If it no longer does, stop and revise D2.
      **Holds (read 2026-09-14):** `resize()` calls `updateCanvasSize` iff
      `size.w`/`size.h` changed, which calls `puzzle.resizeDrawing`, which calls
      `engine.canvasCleared()` after `Drawing.resize`.
- [x] 1.4 Read `fix-flip-canvas-reshape` (archive, 2026-05-20) for what the
      flicker actually was, and confirm D2 keeps that fix: repeated same-size
      `size()` calls must still leave the draw state alone.
      **Kept:** the flicker was recreating the draw state on *every* `size()`
      call; `size()` now rebuilds only when the resolved tile size differs.

## 2. Contract and midend

- [x] 2.1 `Game.newDrawState(s, tileSize)`; delete `Game.setTileSize` and its
      doc comment in `src/engine/game.ts`. Verify: `npm run typecheck` fails in
      exactly the games and tests section 1.2 listed, and nowhere else.
      **Done with the games in one pass** (a codemod plus asserted hand edits,
      then `tsgo`): the typecheck then failed in 20 places, all in tests and
      the harness — `enrollment.ts`'s missing import and 19 test sites building
      a draw state without the hook — and nowhere in the app.
- [x] 2.2 `Midend.freshDrawState` passes `currentTileSize`; `size()` rebuilds
      the draw state iff the resolved tile size differs (D2); `canvasCleared`
      and `startFrom` unchanged beyond that. Update the `size()` doc comment on
      the `Midend` interface, which currently says "No other side effect on the
      drawstate".
- [x] 2.3 `fakeGame`: take the tile size in `newDrawState`, drop
      `setSizeCalls`. In `midend.test.ts`'s "`Midend.size` is purely
      informational" suite, keep the same-size tests verbatim and turn "does NOT
      recreate the drawstate even when called with a different size" and the
      `size({400})` half of "a redraw after only size() preserves the per-tile
      cache" into their opposites. **Prove each rewritten test fails** against a
      `size()` that does not rebuild, then restore.
      **Proved:** with `size()` planted to assign `ds.tileSize = tile` in place
      (the deleted hook's behavior), "builds a fresh drawstate at the new tile
      size" and "a redraw after a new-tile size() paints from scratch" both
      failed, and the same-tile test passed. The same-tile half now uses a
      *different* slot resolving to the same tile (`200×199`), the real jiggle.

## 3. The games

- [x] 3.1 Move each game's sizing into `newDrawState` and delete its
      `setTileSize`, in batches the typechecker holds together. The 42 bare
      assignments become a `tileSize` in the literal; derived geometry (Blackbox,
      Lightup, Samegame, Spokes, Cube, Ascent) is computed there; Bricks stores
      `evenTs(tileSize)` — read its `computeSize` first.
- [x] 3.2 `newBorderGridDrawState(w, h, tileSize)` for Palisade and Separate.
- [x] 3.3 Delete the nine invalidations (Bridges, Flip, Galaxies, Pegs,
      Signpost, Rome, Guess; Inertia's and Spokes' blitter drops) rather than
      moving them — a fresh draw state has nothing to invalidate. Read each first:
      if one resets something a fresh literal would *not* reset, it is a finding,
      not a deletion.
      **Every reset matched its literal** (caches to −1, Pegs' grid to 255,
      Signpost's `dirp` to −2, blitters to `null`). Map's tenth was deleted too:
      `blTileSize` is gone and the check is `if (!ds.bl)`.
- [x] 3.4 Cube's `gridScale` and Guess's `pegsz` → `tileSize` (D4). Guess's
      derived geometry fields stay.
- [x] 3.5 **Verify by shape.** `grep` for `setTileSize` across `src/` returns
      nothing but the midend's history-free prose, if any; every
      `newDrawState` definition takes two parameters (key on the definition
      shape — `function newDrawState`, `newDrawState: (`, and a method — not on
      one spelling).
      **`rg` for `setTileSize|setAscentTileSize|sizedDrawState|setSizeCalls|
      blTileSize|gridScale|pegsz` over `src/` returns nothing.** Definitions: 56
      function forms (49 single-line, 7 wrapped by biome, each read) and
      Untangle's arrow — 57 — plus the fake game and the `Game` method.

## 4. Harness and tests

- [x] 4.1 Update every call site from 1.2 and confirm the count matches.
      Decide `sizedDrawState` per D5 (delete, or keep only for the
      preferred-size default and say so).
      **Kept for the default and renamed `preferredDrawState`**, since "sized"
      is the vocabulary this change retires: 148 of its 150 calls passed no
      size, and the two that did became `game.newDrawState(state, 32)`.
- [x] 4.2 `capability-surface.test.ts`: read `newDrawState(state, preferred)`,
      delete "loses nothing by reading the draw state before it is sized", keep
      the vacuity test. Rewrite `enrollment.ts`'s `drawState` doc comment, which
      is all about the unsized hazard.
- [x] 4.3 `cursor-vocabulary.test.ts` writes `ds["tileSize"]` into a draw state
      by hand; build it at the size instead.

## 5. Proof it moved nothing a player sees

- [x] 5.1 **No render snapshot moves.** Every tier-2.5 frame is reached through a
      real `Midend`, so a re-baselined render snapshot means a game's draw state
      is not what it was. Run the render tests *without* `-u` (and note that
      `vitest run -u <path>` swallows the path — see `git status '*.snap'`).
      **Held:** every test file carrying `toMatchSnapshot` (70 files, 1446
      tests) passed without `-u`, and `git status '*.snap'` showed only the
      capability surface, re-baselined under 5.2.
- [x] 5.2 The capability snapshot moves only for Cube (`gridScale` → `tileSize`)
      and Guess (`pegsz` → `tileSize`), and for the fake game if it is in it.
      Compare as parsed field sets, not as text — a renamed key re-sorts.
      **Moved in exactly five line kinds, tallied from the diff:** 57 ×
      `-"setTileSize"` (the member roster is derived from `game.ts`, so every
      game lost it — the task's "only Cube and Guess" was wrong about this),
      `-"gridScale"`, `-"pegsz"`, `-"blTileSize"` (Map), 2 × `+"tileSize"`.
      The fake game is not registered, so it is not in the snapshot.
- [x] 5.3 Run the app (Chrome, `playwright-cli`): resize the window across
      several tile sizes on a cached-tile game (Galaxies), a blitter game
      (Inertia or Spokes) and a derived-geometry game (Blackbox), and confirm no
      stale or mixed-size tiles and no flicker on a same-size layout jiggle
      (mobile-width viewport, toggle a panel).
      **Done 2026-09-15** on Galaxies, Inertia and Blackbox (two balls placed
      first, so the derived radii were on screen): windows 1280×900 → 900×900 →
      430×820 → 430×790 → 1280×900. The canvas tracked the tile size each time
      (Galaxies 774 → 513 → 378 → 378 → 774 px) and the 820→790 jiggle kept it;
      every frame read clean with no mixed-size tiles, the balls scaled with
      their cells, and no console errors.

## 6. Docs and close

- [x] 6.1 `docs/games/rendering.md`: the `setTileSize` paragraph, the tile-size
      convention paragraph (and its false Cube/Guess sentence), and the Bricks
      `setTileSize` mention. `docs/games/mechanics.md`: the `setTileSize`
      mentions (declared-by-all-57, `interpretMove` sizing, `sizedDrawState`,
      Bricks). `docs/games/testing.md`: the "Read the draw state *unsized*"
      limit. Grep `docs/` and `AGENTS.md` for `setTileSize`, `sized`, `unsized`.
      **Also** `rendering.md`'s doctrine paragraph, which said "`Midend.size`
      is side-effect-free" and "`canvasCleared()` is the only cache-stale
      signal".
- [x] 6.2 Re-read the `ts-engine` delta against the code as built — it was
      written before implementation, and a delta is a claim about code that was
      still moving (`AGENTS.md` § "Method"). **Decide the capability-snapshot
      requirement's shape while doing so**: its scenario "a game assigns a
      draw-state field only once its tile size is known" was kept by name and
      restated only because `validate` refuses a `MODIFIED` block that drops a
      scenario, and its heading now names a case the contract makes impossible.
      The honest retirement is `REMOVED` plus an `ADDED` requirement under a new
      name (`AGENTS.md` § "Work management", on retiring a scenario). Then the
      full gate, and archive.
      **Both** the snapshot requirement and "The midend repaints on every
      transition and drives animation" are `REMOVED` + `ADDED`: the latter's
      scenario "`Midend.size` is purely informational" had the same
      kept-heading, narrowed-body shape. The delta now counts ten invalidations,
      dated 2026-09-15.
