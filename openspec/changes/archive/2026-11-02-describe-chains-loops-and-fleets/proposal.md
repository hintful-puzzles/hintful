# describe-chains-loops-and-fleets

**Status: filed by `describe-cuts-chains-loops-and-fleets` (2026-11-02)**,
which split at its start and took Range. The rest of step 8 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). **Split at
its start (2026-11-02)**: it takes Rome, whose answer and marks fit today's
`Marks`, and files Slant and Boats as `describe-loops-and-fleets`, which
files step 9 when it is archived.

## Why

Rome ran a hand-written ladder (seven rules over a disjoint-set forest of its
arrows in `solver.ts`, with a recording projection and a premise-audit
replay of its own) beside a description that stated only its help. What it
reads that the language lacked: the square an arrow points at, and the
squares its arrows lead to (`design.md` § "The constructs", C and a
direction step).

## What Changes

- **`step(c, d)` and `chain(c)` in the language**: the cell beside `c` in
  direction `d`, numbered as the slots are (1 up, 2 down, 3 left, 4 right),
  and `c` with the cells its value steps to, each from the one before, to a
  cell whose value names no cell or one already reached. Compiled, run, and
  read by the soundness checker, `chain` as reach. The checker reads a
  domain stated as `{d in range(1, k) where ...}` up to `k`.
- **Rome's rules and ladder stated** in `rome.description.yaml`: the answer
  check compiled from the rules (every area's arrows distinct, every chain
  ending at a goal, a goal alone in its area), the cull of a placed arrow
  from its area run on placing, and six techniques at upstream's tiers:
  `lone` and `loop` at Easy, `onlyHome`, `pair` and `reach` at Normal,
  `opposite` at Tricky. `onlyHome` and `reach` strike the square's other
  arrows, as upstream's rules did, so the hint speaks the sentences it did.
- **The hand-written rules retired**: the solve, the generator's arrow
  laying and clue stripping, `solve()`, `findMistakes`, the difficulty and
  the hint run the compiled ladder; the hint records it through the
  engine's `compiledRung` and offers the premise audit `ladderReplay`.
  `status()` asks the rules. The validity check that paints the board as it
  is played stays the game's own.
- **`engine/firing-replay.ts` stays**: Seismic and Solo still read it, and
  the engine's ladder runtime and candidate plan build on it.

## Acceptance

Rome runs its compiled ladder for its hint, its solve and its generator's
grading; the hand-written rules removed; every technique checked sound, each
with a plant that comes out unsound; the boards dealt, their tiers and the
hint walks compared with HEAD and each difference reported, with which saves
or links no longer load; the guides updated; the next step filed.

## What the comparison found

Every preset at every tier (4×4, 6×6, 6×8 and 8×10 at Easy, Normal and
Tricky), six seeds each (72 boards), dealt at HEAD and after, each hint
walked to its end by its first step:

- **The same boards and grades**: all 72 descs and the grade at each cap are
  as at HEAD, and the 15 frozen C reference boards of
  `rome-differential.test.ts` still deal byte for byte. So no save or link
  stops loading. The pair rule no longer skips the squares below the region
  forest's root, as upstream's did; no board compared moved for it.
- **The same walks**: every walk finishes in as many steps as at HEAD, 68 of
  72 step for step. In the other four the order moved, as the plan accepted
  (`describe-the-whole-catalog/design.md` § "Decisions made here"): one
  mark a clean-up struck is struck by `opposite`, one a loop struck is
  struck by a clean-up, and a placement's cull is recorded with the
  placement. Every sentence is one HEAD speaks; the pinned `dup` position
  now shows another area's cull first.
- **A board with no way into a goal is left unfinished, not refused.**
  Upstream's goal rule also called the marks broken where no arrow at all
  could point into the squares already leading to a goal. Stated so, its
  count kept the soundness check on one z3 query for over an hour at order
  4; stated as an arrow into the goals that no other shares, it checked
  sound in 34 minutes, and that case is dropped. Only a hand-made board meets it (a 3×3 with no
  goal, `rome.test.ts`): the solve stops incomplete, where it said invalid.
- **Deal time**, back to back with HEAD under the same load: 8×10 9 to 36 ms
  against 23 to 129; 12×12 31 to 59 against 84 to 162; 16×16 80 to 354
  against 285 to 549.
