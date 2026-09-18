# add-loopy-auto-rule-out — tasks

Read `proposal.md`, then `docs/games/input.md` § "An aid extends the move, at the one
place the move is built" — which this change wrote, and which `autofollow` is the other
instance of.

## 1. The rule

- [x] 1.1 `forcedRuleOuts(s, ops)` in `state.ts`, beside `faceOrder`: the still-unknown
      edges the pending ops have settled by counting — a dot brought to two lines, a
      face brought to its clue. It lives in `state.ts` rather than beside `setEdge`
      because `hintKeepTrack` needs it too (3.5) and `hint.ts` importing `index.ts`
      would close an import cycle.
- [x] 1.2 Counts read through the pending ops, not off `s.lines`. Guarded by "counts
      through the move's own ops, not the board behind them", whose two lines arrive in
      one move so nothing on the stale board says the dot is full.
- [x] 1.3 Only `LINE_YES` ops trigger it, and one pass suffices — an exclusion adds no
      line, so it completes neither another dot nor another clue. Guarded both ways.
- [x] 1.4 Never touch an edge that is not `LINE_UNKNOWN`, and fire only on an exact
      count: a dot already carrying three lines is a board in error, not a place to
      hang marks.

## 2. Wiring

- [x] 2.1 `LoopyUi.autoRuleOut`, defaulting **on** in `newUi`, and an `auto-rule-out`
      pref beside `auto-follow`.
- [x] 2.2 `setEdge` folds the rule-outs into the same `ops`, after autofollow, so a
      corridor and the edges its far end settles arrive as one move and one undo.

## 3. Tests

- [x] 3.1 Seven cases in `loopy.test.ts` § "auto rule-out": the dot rule, the clue
      rule, counting through the ops, leaving a set edge alone, staying out of an
      errored board, doing nothing without a drawn line, and the default plus the
      preference.
- [x] 3.4 **Seen to fail.** `yes === 2` widened to `yes >= 2` reddens "stays out of a
      board already in error"; `lineOf(e) === LINE_UNKNOWN` widened to `!== LINE_YES`
      reddens "never touches an edge the player has already set". Both restored.
- [x] 3.5 The interaction that was nearly shipped broken, and its guard. A player
      following a hint with the aid on sends a **superset** of the step's ops, and
      `hintKeepTrack` rejected any op the step did not name: **77 of 277 line steps
      (27.8%) verdicted `"off"`**, dropping the plan on the step the player had just
      taken. `hintKeepTrack` now tolerates exactly the exclusions `forcedRuleOuts`
      derives **from the step's own move**, so an unforced extra still diverges. Guard:
      `loopy-hint.test.ts` "keeps track of a step the player took with auto rule-out
      on", seen to fail (stubbing the derivation to an empty set reddens it) and
      carrying both the tolerance case and a planted unforced exclusion.
- [x] 3.6 Two cross-game guards caught this change and both were right, which is worth
      recording because neither is in `src/games/loopy/` and a targeted run missed both.
      `capability-surface.test.ts` records every game's `Ui` field list, so the new
      `autoRuleOut` field is an intended re-baseline — `vitest run <path> -u`, one line
      added, said here as that snapshot's own comment requires. And
      `asset-integrity.test.ts` § "no doc comment describes a member that was deleted
      out from under it" caught that inserting `forcedRuleOuts` above `faceOrder` had
      left `faceOrder`'s doc comment stranded above the new function — two comments
      stacked, the second function undocumented. **Run the whole suite before believing
      a game-local change is game-local.**
- [~] 3.2 Undo-restores-the-whole-move is checked in the app (6.1) rather than in a
      test: it is midend behavior over a single move, which the move's shape already
      guarantees — one `set` with all the ops — and a test would assert the midend's
      undo rather than this change's rule.
- [~] 3.3 Soundness against the solution is already covered: every edge the aid
      excludes is forced by a count on the player's own board, and
      `loopy-hint.test.ts` "every step agrees with the solution" plus `findMistakes`
      cover the board the plan produces. A separate corpus sweep would restate the
      counting rule rather than test it.

## 4. Measure

- [x] 4.1 Over three boards each, replaying the plan: **7×7 Tricky — 117 exclusions
      placed for the player, and 90 of 275 line steps (32.7%) already fully marked;
      10×10 Hard — 241 exclusions, and 174 of 533 (32.6%)**. So about **a third of
      every "this edge can't be a line" step disappears**, and the player is spared
      roughly 39 marks a board at 7×7 and 80 at 10×10. The consistency across two
      sizes is what makes the figure worth quoting.

## 5. Docs

- [x] 5.1 `help/games/loopy.md` — what a click now does, that one undo takes it all
      back, and where to turn it off.
- [x] 5.2 `docs/games/input.md` § "An aid extends the move, at the one place the move
      is built" — the pattern, with both of its traps: read the counts through the
      pending ops, and derive the `hintKeepTrack` allowance from the step's own move.

## 6. Accept

- [x] 6.1 Run it. On `7x7t0dt:c3a2…`, one click on the right edge of a `1` drew the
      line, dimmed the clue and excluded its other three edges — all from that one
      click — and one undo restored every one of them together.
- [x] 6.2 Accepted (owner, 2026-09-18): *"That's fabulous regarding the rule-out
      mechanism"*, and on this session's work as a whole, *"I accepted the new hover and
      everything else"* — which is what carries the **default-on** divergence, since
      that was the one part flagged as needing their call rather than mine.
