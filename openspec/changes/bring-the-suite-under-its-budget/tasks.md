# Tasks

- [x] 1. Read the newest CI run's per-file costs, and measure what each heavy cross-game walk deals and plays that another also does
  - The walks' overlap was in dealing, not playing: each of CI's four workers
    dealt its own copy of every shared board. The engine's tests on four
    workers made 2,323 deals of 794 boards, 6.5 CPU minutes where 1.9 would
    do (2026-11-09). Planning a board's hint is cheap beside dealing it, and
    the files that walk the same boards (`hint-overlay`, `hint-ink`,
    `hint-mark`, `hint-gesture`, `mistake-invariant`) cost little of their
    own once the deal is paid.
- [ ] 2. Share or cut the overlapping walks, then apply the guide's three treatments to what remains, heaviest first
  - [x] A run's workers share their deals (`scripts/checks/dealt-store.ts`):
        the engine's dealing went from 6.5 to 2.1 CPU minutes, its total
        from 20.1 to 16.5.
  - [x] `ladder-continuity` reads the gate's boards, not every leaf preset:
        92 s alone to 35 s, with the position count raised from 30 to 120 so
        that a frontier planted off still fails every game the old corpus
        failed.
  - [x] `ladder-skip` compares the shared board with one dealt again without
        skipping, instead of dealing both itself: 44 s to 28 s alone, most of
        it the shared deal.
  - [x] Read CI's suite cost on the pushed tree: 36.3 minutes, dealing 2.1
        of them (Gate run 42690070962, 2026-11-09). The same kind of tree
        has read from 35.9 to 53.0 by runner, so one reading under 40 does
        not settle it.
  - [x] `desc-error-games` is spread: charged for a board of every game, it
        read 126 s, over its file budget, once its boards came from other
        workers. Its near-miss floor is held per share (the shares loaded
        227, 420, 407 and 134).
  - [x] The cost report names each file's boards dealt elsewhere, so that a
        cut is chosen by the file's own work.
  - [ ] If a reading goes over 40, cut from the files whose own work is
        largest in that run's report. Measured and declined (2026-11-09):
        `hint-resume` at 32 recomputes (24 s, and its comment's guarantee for
        the searching hints and Solo is unmeasured there), `hint-quality`'s
        bound walk at 150 steps (23 s, and one Loopy rung leaves the walk),
        Loopy's Custom-only tilings smaller (36 s if dropped whole), the
        near-miss sweep at fewer mutants (its own work is 19 s), and
        SameGame's largest-board walk (`hint-resume`'s ledger names it).
- [ ] 3. Three consecutive CI gate runs on `main` under 40 minutes
