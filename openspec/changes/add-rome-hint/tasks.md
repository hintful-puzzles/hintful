# add-rome-hint — tasks

Read [`docs/games/hints.md`](../../../docs/games/hints.md) first and keep it
current as you go — that is part of "done", not a chore (`AGENTS.md` § "Dev
guides under `docs/games/`").

## 1. Read before building

- [x] 1.1 Read `src/games/rome/solver.ts`'s header in full before touching it.
      It states the byte-match surface (rule order, dsf root choice) and the
      `nakedPairs` quirk, and both bind anything that threads a recorder.
- [x] 1.2 Read `rome-ladder.test.ts`'s firing census and write down **which
      rungs the generator actually reaches, per tier**, before deciding what to
      narrate. The audit says `naked-pairs` is dead; confirm it rather than
      inherit it, and note the date.

      **It is not dead, and the census was not wrong — its sample was.**
      Measured 2026-09-20: solving 120 published descs (6x6 and 8x8, Normal and
      Tricky) the way `rome-ladder.test.ts` solves them fires `naked-pairs` on
      **2**, about one board in sixty. The recorded census ("2,896 calls across
      36 board generations, zero firings") is reproducible and honest; thirty
      boards is simply a small sample for a 1.7% event, and a census that finds
      zero needs a power argument rather than only a count. A first reading of
      this blamed the *path* (generation vs the hint's) — disproved by solving
      the same desc through `readDesc` → `romeSolve`, which fires it too.

      The two boards are now pinned in `rome-ladder.test.ts` as **descs, not
      seeds** (a seed reaches a rung only through the generator, so a generator
      change would take the corpus back to thirty boards with the census still
      green), `unreached` is empty, and all seven rungs are certified. The
      rung's `k < c` scan-order quirk is therefore reachable, and its comment
      now states the reason it is reproduced rather than asserting an effect
      nothing measured.
- [x] 1.3 Baseline, read from the archived changes rather than from memory:
      **Galaxies +1,138 game lines / +387 the recording projection** (the
      control, recorded by `characterize-the-hint-assessment-corpus`), **Tracks
      +1,132 / +536**, **Bridges** compared against both, **Seismic +583 / −24,
      of which +335 the deduction projection, plus +87 / −31 engine**.

## 2. Decide the substrate questions — each one is a framework answer

- [x] 2.1 **`NoteEncoding` over direction bits.** **It fit, near-identically**:
      `bit` is a lookup into `DIR_BITS` and `values` is 4. The abstraction is
      not numeric — but it *was* incomplete. The shared machinery enumerates
      candidates as `for (v = 1; v <= values; v++)`, so a direction must cross
      the boundary as a dense ordinal (using the bits as values makes
      `nakedSingles` test `pencil & 12`); that is what `NoteEncoding` is for and
      it says it cleanly.

      **The genuine misfit was one member nobody had needed**: `lazyPopulate`
      filled `(1 << (w+1)) - 2` regardless of `enc`, because every game on the
      plan until now had one board-wide full note set. Rome's is **per square**
      (a top-row square can never point up), and Seismic's is per region.
      `NoteEncoding.all(i)` now states it, defaulting to the old expression.
- [x] 2.2 **`regionsOf` over a `Dsf`.** Six lines (`romeRegions`), and
      `CellRegion.holdsEvery` is `cells.length === 4` — which is
      `find4Position`'s own guard, arrived at independently years earlier.

      **The adapter stays in Rome, deliberately.** It is a member list per
      canonical root plus one predicate, and the predicate is the part that is
      *about the puzzle*: Seismic's would be `size === dsf.size(i)`, Salad's is
      not a partition at all. An engine helper would abstract the six easy lines
      and leave each game the one line that differs. Recorded as a no-go per
      `AGENTS.md` § "Refactor as you go"; revisit if a third partition-region
      game writes the same predicate.
- [x] 2.3 **Answer the `CellRegion.name` question. Answer: no, and the question
      is closed.** Rome is the second game to supply its own `regionsOf`, which
      is what `derive-solos-region-names` was waiting for, and its sentences do
      not want to name a region. They say "this area" — Rome has exactly one
      kind of region, so there is nothing to disambiguate, and a `name` field
      would carry the constant `"area"` on every region the game ever builds.

      Solo needs a name because it has five kinds and its sentences must say
      *which*; that is one game's evidence and it remains one game's evidence,
      held where Solo already holds it (`SoloCellRegion.name`). The rule this
      confirms: a region's name is a fact about a game's *narration*, not about
      the region, so it belongs to whichever game has several to tell apart.
- [x] 2.4 **Arrow vocabulary.** `LatinVocab` is **not** widened. Measured
      against the arms: all eleven want the **word** ("up"), four additionally
      want the **relation** ("the square above", "point straight back"), and
      none wants the glyph — "↑" in prose is smaller than the arrow on the board
      and says nothing the word does not.

      `LatinVocab` could not have helped regardless: Rome's generic-looking arms
      name an **area** where `narrateLatinReason` names a row and a column, so
      Rome writes its own `narrate` for the same reason Solo and Towers do. The
      two shared *setup* sentences are taken from `hint-text.ts`, because those
      are about penciling rather than about rows.

## 3. The plan

- [x] 3.1 Recorder threaded on the hint path only, and the commit path asserted
      untouched — `rome-hint.test.ts` "records without changing a single
      deduction the solver makes" compares the whole board (grid *and* candidate
      set) after a recorded and an unrecorded solve, over twelve boards.

      **No rung needed an early return**, unlike Mathrax's: every Rome rung
      records as a pure side effect, so the two paths are the same walk. That is
      a property of these rungs rather than of the shape, which is why it is
      checked rather than argued. Proved failing by planting `if (rec) return
      ret;` in `solverDoubles`.
- [x] 3.2 `runCandidatePlan` adopted. **The dsf-reachability rungs needed no
      own-rungs slot at all, and `plan.rungs` is unused.** `loops`, `expand` and
      `find-4-position` all write to `pencil`, so all three are ordinary
      candidate eliminations whose *reason* is a fact about a graph.
      Reachability is a premise, not a plan shape. The seam did not chafe
      because it is never touched: the own-rungs slot is for a firing whose
      **move** the canonical shapes cannot express (Salad's markers).

      `solverDoubles` is recorded under the shared `dup` reason, so the plan
      treats it as the cull it already does around its own placements rather
      than teaching it twice.
- [x] 3.3 Narration to the Palisade bar. Eleven sentence templates, all firing
      (inventory over 2,396 steps from 24 boards); longest is 104 characters.
      A `loop` firing's premise is a **walk**, so `arrowPath` takes the walk and
      throws if it does not arrive, with the termination argument beside it; the
      chain is shaded in order and numbered, so the claim is one the player can
      follow. Proved failing by planting a wrong start square.
- [x] 3.4 **Marks the player can make.** Every premise is expressible in Rome's
      own notes — and getting there required deciding what a Rome mark *means*,
      which is §6 below.

## 4. Tests

- [x] 4.1 Enrollment is derived, so Rome joined every cross-game hint guard on
      declaring `hint()`; all pass. Three recorded figures moved, each an
      intended capability change rather than a sweep going quiet:
      `hint-mark.test.ts`'s `CHECKED.length` (32 → 33, Rome's renderer now
      exports `COL_HINT`); `scripts/checks/change-citations.mjs` ledgers
      `find-4-position` as a Rome solver rung rather than a change id; and
      **`capability-surface.test.ts` is re-baselined**, as its own comment
      instructs. That diff is **six insertions and no deletions**, all Rome's —
      `canMarkAll`, `hint`, `hintKeepTrack`, `refreshHintStep`, and the
      `hint`/`marks` draw-state fields — checked by reading every changed line
      rather than by the suite going green (`AGENTS.md` § "Verify a bulk edit by
      shape").

      The probe corpus needed re-anchoring too: two of its `lazyPopulate` cases
      quote lines this change moved, and `feedback-probe --verify` blocks a
      commit that would leave the harness measuring a smaller corpus while
      reporting success.
- [x] 4.2 Two tier-2.5 render scenarios with targeted assertions plus snapshots:
      an area elimination (ring, area outline, struck marks crossed in their own
      color) and the reachability frame (the numbered arrow chain).
- [x] 4.3 What a new test catches that no cheaper one would: the cross-game
      guards check a plan's *form* and `rome-ladder.test.ts` checks the solver
      against its oracle, but nothing else checks that **the recorder is a pure
      observer of that solver** — the assertion the published descs rest on —
      and nothing else reads a premise back to see it is *true of the board*
      rather than merely present. Cost: `rome-hint.test.ts` runs in under a
      second; Rome is a deducing planner and comes nowhere near
      `SEARCH_PLANNING_GAMES`.

## 5. Close out

- [x] 5.1 **Cost, in the series' terms**, counted the same way (`git diff
      --numstat`, production files only, tests excluded):

      **+994 / −131 game production lines, of which +310 / −79 is the recording
      projection** (`solver.ts`). The rest: `hint.ts` 258 and `hint-text.ts` 91
      new, `state.ts` +142 (the direction↔value mapping, the note encoding, the
      region adapter, the grid projection, the two new moves), `render.ts`
      +103 / −44 and `index.ts` +90 / −8. **Engine: +41 / −5** across
      `candidate-hint.ts` and `candidate-plan.ts`.

      Against Galaxies' +1,138 / +387 and Seismic's +583 / +335, Rome sits at
      the top of the range in total and in the middle for the projection — and
      the projection is *cheap for its size*: 95 of those 310 lines are comment,
      leaving ~215 of code across seven rungs. The structural reason is worth
      carrying forward: **Rome's solver already is a candidate-elimination
      ladder**, every rung of which writes to a `pencil` array, so the recorder
      observes it rather than re-deriving it — which is also why no rung needed
      an early return (§3.1). A game whose solver does not already speak in
      candidates pays the Galaxies price instead.

      The engine figure is the one to note: **41 lines** bought a per-cell
      candidate set and a dialect-written fill-all, both of which Seismic could
      use tomorrow. Seismic's hint paid +87 / −31 in engine lines and still sits
      outside `runCandidatePlan`.
- [x] 5.2 Spec deltas: `rome` (a REMOVED + ADDED pair retiring "pencil marks are
      never mistakes", plus Mark-all and the hint) and `ts-engine` (the note
      encoding's full-candidate set, the dialect's fill-all, partition regions,
      and graph deductions as reasons). `openspec validate --strict` passes.
- [x] 5.3 `docs/games/hints.md` § "Candidates that are not values (Rome)".
- [x] 5.4 Run the app.

## 6. The decision this change forced

- [x] 6.1 **A Rome pencil mark now means "this arrow is still possible".**

      Rome's `findMistakes` ignored marks entirely, on the strength of
      upstream's help text ("Pencil marks can be used for any purpose") — which
      leaves a note-taking game with no note semantics. A candidate hint cannot
      deduce from a note it cannot trust: `nakedSingles` reading a mark that has
      crossed out the answer places a **wrong arrow**. And a Mark-all press that
      fills every legal arrow is incoherent under a "ruled out" reading.

      So Rome joins the rest of the collection: an empty square whose non-empty
      marks exclude its answer is a `kind: "note"` mistake. Rome's own solver
      has always read the same array this way.

      **Player-visible, and stated rather than asked** (`AGENTS.md` § "Work
      management": what earns the owner's time is genuine uncertainty, and every
      other note-taking game in the collection already answers this the same
      way). No data compatibility is broken — the save format is unchanged and
      an existing board still loads. What changes is that Check & Save now
      refuses a board whose marks have ruled out an answer. `help/games/rome.md`
      says so.
