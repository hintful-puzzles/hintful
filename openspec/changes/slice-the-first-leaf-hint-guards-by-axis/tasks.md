# slice-the-first-leaf-hint-guards-by-axis — tasks

## 1. Confirm the blindness per guard, on the board rather than in the source

- [x] 1.1 Census taken off the live registry through a scratch `*.test.ts` that
      throws its report. **The proposal's list was short**: reading the call
      sites found three more inside `hint-resume.test.ts` itself — the no-op
      step block, the `hint()`-purity block and the Latin naked-single block —
      all still on `firstLeaf` after that file's *main* walk had been widened.
      Two of the proposal's own figures did not survive checking: its prose says
      "eight others" where its own list enumerates ten sites, and "five seeds per
      case" was `hint-resume`'s `SEEDS` rather than these three, which run three,
      three and two. **No count of them is written down anywhere now** — a
      suite scan in `hint-enrollment.test.ts` names the files that still build
      their own boards, and the ledger beside it says why each may.
- [x] 1.2 Named per guard, at the site, in the comment that now says why the
      guard reads the slice. Two claims were checked rather than asserted:
      `hint-text-convention`'s `speaks()` returns on the first speaking board,
      so widening it is free for every game but a silent one; and
      `difficulty-contract.test.ts`'s three `firstLeaf` sites **stay narrow**,
      because they generate no board at all — they ask what `withTier` does to a
      params record, which any valid record exercises.
- [x] 1.3 Vacuity counts carried: `mark-all`'s `M` probe counts the boards it
      walked and floors it, and `hint-resume`'s per-game walk already floored
      its preset count. Census: 35 games → **146** sliced boards (141 with the
      searching games' size axis dropped), 10 Mark-all games → 49, 57 registered
      games → 227.

## 2. Measure before widening

- [x] 2.1 Every guard timed before and after on the same box, load and free
      memory recorded beside each figure. The table is in
      `docs/games/testing.md` § "Slicing a preset sweep for the gate".
- [x] 2.2 Seed budgets decided *with* the slice rather than after it, because
      the slice is a hundred and forty configurations and a second seed of one
      board repeats one the first already walked. `hint-overlay` 3 → 1,
      `hint-mark` 6 → 2, `hint-quality`'s form block 3 → 1, `hint-resume`'s two
      single-plan blocks 5 → 1 (`BREADTH_SEEDS`, priced at the site: 39.1 s and
      19.4 s at two seeds against a 122 s file).
- [x] 2.3 No deferral was needed, so the `build-pipeline` conditions do not come
      into it. The treatments used were the second one — turn a seed count down,
      saying what the reduced count still executes — and nothing was moved to
      the slow tier. `mark-all`'s 19.8 s `interpretMove` probe is paid rather
      than sliced further, with the reason at the site.

## 3. Widen, and prove each one

- [x] 3.0 The rule is held by a check rather than by a guide sentence:
      `hint-enrollment.test.ts` scans every test file's comment-stripped source
      for `firstLeaf(` / `.withTier(` and asserts the result equals a ledger of
      the four files that legitimately still build a params record, each with
      the behavior that needs one. Proved both ways — a planted call in
      `hint-overlay.test.ts` turns it red, and so does removing an entry.
- [x] 3.1 All of them read `gatePresets(id, game)`, a new shared entry point in
      `testing/hint-games.ts` — the slow tier's full list, the gate's
      `axisSlice`, and the searching games' cost discipline in one place. The
      searching-game rule changed with it: `all.slice(0, 1)` and `all.slice(0, 3)`
      became `axisSlice(..., { scalarEnds: false })`, every mode on the smallest
      board offering it, derived from the same axes as everyone else's slice
      rather than being a count of presets that happened to reach Netslide's
      three barrier modes.
- [x] 3.2 Proved by what they caught, which is stronger than a plant — five
      findings, each on a board the narrow form could not reach:
      - **Group narrated a naked single over a cell showing two notes**
        (`8x8 Tricky`). Its `leads` rung offered a `single` placement ahead of
        the strikes once the notes were in, contradicting its own comment, and
        `visibleCandidates` culled the obvious marks for itself so the
        classification never threw. Reachable in play: place an element without
        culling your notes, then ask for a hint. Fixed in `games/group/index.ts`.
      - **Loopy's corner rung and Palisade's clue-0 rung** failed the necessity
        rule with *"can take one line at most"* and *"none of its remaining
        edges can be walls"* — two constructions five-plus games write and the
        rule had never heard. Vocabulary extended, with the scoping that keeps
        Subsets' bare *"none of them has A"* failing.
      - **Loopy's blocked-pair sentence** is owner-endorsed (2026-09-19) and
        carries its necessity in its own words, so it is a declared idiom.
      - **Salad said "further along"**, the collection's phrase for a deduction
        the reader must carry on alone, where it meant a place on the line. Now
        "later in the row".
      - **Keen emits an ordered chain on none of its ten presets**, at eight
        seeds each — it was in `ORDERING_GAMES` on the strength of a
        Custom-dialog board. `hint-ordinal` therefore walks the slice *and* the
        first preset's tiers, with the measurement at the site.
- [x] 3.3 `BIGGER_BOARD` is deleted. Solo's slice carries `3x3 Extreme` on its
      own, because Extreme is a value of Solo's difficulty axis and that is the
      smallest preset offering it, and Solo is still in `ORDERING_GAMES`.

## 4. Close out

- [x] 4.1 `ts-engine` delta: `ADDED` "A cross-game sweep SHALL take its boards
      from the shared slice, not build them". The existing preset-walk
      requirement already said a sweep derives its population from the game and
      is unchanged; what is new is that the answer comes from one function.
- [x] 4.2 `docs/games/testing.md` updated in both sections — § "Slicing a preset
      sweep for the gate" now points at `gatePresets`, carries the per-guard
      cost table and the "pay in seeds, not presets" rule, and warns that a
      lexical narration rule will meet vocabulary it has never heard; rule 6's
      tell records that eleven sweeps wore it at once, and states the narrow
      exception for a synthesized record.
- [x] 4.3 Follow-up scaffolded: `read-the-widened-deixis-report`. The advisory
      deixis sweep went 230 shapes / 20 games → 505 / 27 once it read the
      presets menu; the new rows were sampled, not read, and the sweep's header
      says so rather than carrying the old conclusion.
