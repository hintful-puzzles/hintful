# add-rome-hint — tasks

Read [`docs/games/hints.md`](../../../docs/games/hints.md) first and keep it
current as you go — that is part of "done", not a chore (`AGENTS.md` § "Dev
guides under `docs/games/`").

## 1. Read before building

- [ ] 1.1 Read `src/games/rome/solver.ts`'s header in full before touching it.
      It states the byte-match surface (rule order, dsf root choice) and the
      `nakedPairs` quirk, and both bind anything that threads a recorder.
- [ ] 1.2 Read `rome-ladder.test.ts`'s firing census and write down **which
      rungs the generator actually reaches, per tier**, before deciding what to
      narrate. The audit says `naked-pairs` is dead; confirm it rather than
      inherit it, and note the date.
- [ ] 1.3 Take the baseline you will be compared against: the recording-projection
      line counts of the hints already written (Galaxies 387, then Tracks,
      Bridges, Seismic, Mathrax). Read them from their archived changes, not
      from memory.

## 2. Decide the substrate questions — each one is a framework answer

- [ ] 2.1 **`NoteEncoding` over direction bits.** Rome's notes are already bit
      flags, so `bit(v)` is near-identity. Write it, and say whether the
      abstraction fit or was contorted. A contortion here is the finding.
- [ ] 2.2 **`regionsOf` over a `Dsf`.** Rome's uniqueness region is an outlined
      region, not a line. Write it, and ask *immediately* whether the dsf→
      `CellRegion` adapter belongs in `engine/` rather than in Rome —
      `separate` is a second dsf-region game already in the corpus, which is the
      "will it evolve the same way across games" test.
- [ ] 2.3 **Answer the `CellRegion.name` question.**
      `derive-solos-region-names` left it open for want of a second game
      supplying a `regionsOf`; Rome is it. If Rome's sentences want to name a
      region, propose the engine field with two games' evidence. If they do not,
      **say so and close the question** rather than leaving it open a third
      time.
- [ ] 2.4 **Arrow vocabulary.** Decide whether `LatinVocab`'s `{ noun, value }`
      carries a direction, or whether a direction needs a word, a glyph and a
      relation. Do not widen `LatinVocab` speculatively — widen it if a sentence
      needs it, and if it does, check what the other consumers would pass.

## 3. The plan

- [ ] 3.1 Thread a recorder through the solver on the **hint path only**, and
      assert the commit path is untouched — the generator is solver-gated at
      every step, so a changed verdict changes every published desc. Mathrax's
      change shows the assertion shape.
- [ ] 3.2 Adopt `runCandidatePlan` with Rome's own rungs. The open question is
      whether the **dsf-reachability rungs** (`loops`, `expand`,
      `find-4-position`) sit in the own-rungs slot as cleanly as the
      candidate rungs do. Report which, and where the seam chafed.
- [ ] 3.3 Narration to the Palisade bar: every sentence says *why* the move is
      forced, one firing is one journey, equivalent moves share a color, and
      every claim is checked in code. A reachability rung's premise ("this
      arrow would start a loop") is a claim about a walk — verify it, do not
      assume it.
- [ ] 3.4 **Marks the player can make** (`AGENTS.md`, owner 2026-09-15): Rome
      has per-square direction notes and the player can set them. Confirm every
      premise a step rests on is expressible in them; if a tier's deductions
      need a mark Rome does not offer, the fallback is the tier, not a
      hint-only overlay.

## 4. Tests

- [ ] 4.1 Rome joins every cross-game hint guard the moment it declares
      `hint()` — enrollment is derived (`src/engine/testing/hint-games.ts`), so
      there is no list to edit. Check the vacuity counts those guards floor.
- [ ] 4.2 A tier-2.5 render scenario for at least one elimination frame and one
      reachability frame, with targeted op assertions **plus** a snapshot.
- [ ] 4.3 Say what a new test would catch that no cheaper one would
      (`AGENTS.md` § "A test earns its runtime"), and watch the cost: Rome is
      not a searching planner, so it should not approach
      `SEARCH_PLANNING_GAMES` territory — if it does, that is a finding about
      the plan, not a budget to absorb.

## 5. Close out

- [ ] 5.1 Report the cost in the series' terms: **game production lines, of
      which how many are the recording projection**, against §1.3's baseline.
- [ ] 5.2 Spec deltas for whatever was decided — the `rome` capability for the
      hint itself, `ts-engine` for any contract that moved. Grep the live spec
      for the sentence you mean to change before writing a `MODIFIED`.
- [ ] 5.3 Update `docs/games/hints.md` with what the guide did not tell you.
- [ ] 5.4 Run the app. A green suite is not a rendered frame.
