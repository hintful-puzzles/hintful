# offer-solos-small-board-at-every-tier — tasks

## 1. Measure the gate cost before accepting it

- [x] 1.1 Time the tier-slicing cross-game guards **before** the edit, and
      record the machine's state beside the figure.

      The four multi-preset guards (`hint-frontier`, `mistake-invariant`,
      `hint-quality`, `hint-resume`): **real 117.4 s, user 156.7 s, 277 tests**.
      Conditions: load average 9.7, swap 17.5 GB of 18.4 GB used — a contended
      box, so the absolute seconds are an **upper bound** and only the
      before/after ratio survives (`AGENTS.md` § "Test discipline").

- [x] 1.2 Add the presets, re-time the same guards, report the delta.

      **real 120.7 s (+2.8%), user 165.0 s (+5.4%), 277 tests (unchanged)**,
      taken back-to-back under comparable conditions (load 7.5, swap
      18.5 / 19.5 GB). The test *count* is identical because the tier slice
      de-duplicates — the added cost is extra work inside existing cases, not
      new ones. `hint-frontier.test.ts` pays most: it iterates **every** leaf
      preset with no tier de-duplication, so it eats a full 2x3 Hard generation.

- [x] 1.3 Material? **No.** ~3 s of wall on four guards, against a full gate of
      roughly ten minutes — under 1% of a commit. Accepted; the fallback in
      `proposal.md` § "What this does not do" is not needed.

## 2. Add the presets

- [x] 2.1 Two `P(2, 3, …)` entries after `2x3 Normal`, at `DIFF_INTERSECT` and
      `DIFF_SET`. No title string written — `presets()` derives every title from
      the params, so neither spells a tier name the Custom dialog would spell
      differently.
- [x] 2.2 Params round-trip: the new entries join the existing "round-trip the
      preset list" population automatically, and the suite covers it.

- [x] 2.3 **The gate blocked the commit, correctly**, on
      `params-stability.test.ts`'s byte-stability snapshot — whose own comment
      says re-baselining it is *"a **compatibility decision**, not a formatting
      one: every line that moves is a shared game ID that stops resolving to the
      board it named."* So the re-baseline is argued, not waved through:

      - **The diff is two added lines and nothing else** — one snapshot file, no
        line removed or modified (checked as a diff, per `AGENTS.md` § "Verify a
        bulk edit by shape"). Every existing shared game ID is byte-identical
        and still resolves to the board it named.
      - **The two new IDs are not new.** `2x3di` and `2x3da` are the existing
        scheme (`di` = `DIFF_INTERSECT`, `da` = `DIFF_SET`), already carried by
        `3x3di` / `3x3da`; no codec changed. Verified rather than asserted:
        Solo's `paramConfig` already offers sub-block columns, sub-block rows
        and a free `difficulty` choice over all of `DIFF_NAMES`, so a player
        could always build 2x3 Hard through the Custom dialog and `2x3da` was
        always a valid ID to paste into "Enter game ID". This change surfaces in
        the menu what the codec already accepted.

      Which is to say: no compatibility was spent. Had a line *moved*, this
      would have been a question for the owner before the edit, not after.

## 3. Say what moved

- [x] 3.1 **The gate slice swapped boards, and this is the cost to state.**
      Verified against the live registry rather than reasoned about:

      ```
      gate slice (6): 2x2 Easy | 2x3 Normal | 2x3 Tricky | 2x3 Hard |
                      3x3 Extreme | 3x3 Unreasonable
      ```

      So the cross-game hint guards now walk a 6×6 for Tricky and Hard where
      they walked a 9×9. Both are the same tier and exercise the same rungs;
      the 9×9 boards remain covered because `walkedPresets` returns **all**
      presets when `SLOW_TESTS_ENABLED` — read in the source, not assumed — so
      `npm run test:slow` still reaches them. Which board represents a tier in
      the gate was already arbitrary, decided by menu position rather than by
      design; this change moves it, it does not introduce the arbitrariness.

- [x] 3.2 Generation-cost asymmetry recorded at the presets themselves, where a
      reader of the menu meets it: a 6×6 at `DIFF_SET` costs the generator
      roughly fifty times a 9×9 at the same tier, because it has fewer places to
      hide a `set` deduction. A retry count, not a defect.

## 4. Accept it as a player

- [x] 4.1 Ran the app. The Type menu reads `2x2 Easy | 2x3 Normal | 2x3 Tricky |
      2x3 Hard | 3x3 Easy | …` — size order preserved. A 2x3 Hard board deals
      with nine givens on a 6×6 and a 1–6 keypad.
- [x] 4.2 Took the hint through to a deduction on that board: *"Other cells in
      this block already account for 3 and 6, so they must be crossed out
      here."* That is the `set` rung `DIFF_SET` is named for, so the tier is
      honest in play and not only in the grader — which is the thing a tier
      gate reporting health over nothing would fail.

## 5. Close out

- [x] 5.1 No spec delta. The preset list is not enumerated in
      `openspec/specs/solo/spec.md` and should not become so — a menu written
      into a spec is a census that rots (`AGENTS.md` § "A count written in prose
      is a census nobody re-runs"). The existing "uniquely solvable at exactly
      the requested difficulty" requirement already governs the new entries and
      needed no widening: 40 of 40 generated boards graded back on tier.
- [x] 5.2 `npm run test:slow -- src/games/solo`, then the full gate.

## 6. Fallout

- [x] 6.1 **The slice printout exposed a hole that predates this change**, and
      it is filed rather than mentioned: of Solo's eighteen presets the gate
      walks six, and **every X, Killer, jigsaw and larger-than-9×9 board is
      de-duplicated away** because each shares a tier with a plainer board
      earlier in the menu. No cross-game hint guard walks a Solo Killer hint on
      a commit, though Killer adds four cage rungs and four cage sentences those
      guards exist to check. Solo's own suite does cover Killer and X per
      commit, so the gap is specifically in the cross-game layer — which is
      where a defect shared by several games would show and a per-game suite
      would not look. Filed as `slice-presets-by-the-axes-a-game-varies`, with
      the measurement in its proposal.
