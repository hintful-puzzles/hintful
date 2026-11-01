# Report: a board beyond the Latin square

Measured 2026-11-01 against `e8805ac4`. The instruments are
`research/describe/trace-latin.test.ts` (every preset's deal, three seeds,
and each hint step's rung, move and words) and
`research/describe/tiers-described.test.ts` (a corpus of 400 Unruly and
Seismic boards, 40 a tier and variant, and each board's verdict at every
cap). The corpus was dealt and graded by the hand-written ladders, then
graded again by the compiled ones; a planted defect (Seismic's `starve`
made to fire nothing) moved 80 of its lines, so the instrument sees a
difference where there is one.

## The Latin games and Solo

The trace of the eight described games (22,863 lines) is unchanged on the
engine's runtime, every deal and every hint step's rung, move and words, but
for the firing `group` numbers the trace prints inside a ring's record: the
runner now bumps the group once a technique rather than once a tier. The
group is an identity, never read as a number. Solo's trace (6,791 lines) is
likewise unchanged after its wrapper, pairing plumbing, cube and `place()`
went, and again after its and Towers' sentences moved to the engine's.

## Unruly

- **Tiers**: all 240 corpus boards solve at the same caps.
- **Deals**: all 39 trace deals are the same. On the corpus, one of 240
  deals moved (an 8×8 Normal): where the fill's random walk passes through an
  inconsistent board, the two ladders fill different cells, and the walk's
  draws part from there.
- **Hint walks**: every walk is as long and ends where it did; the steps come
  in another order (948 of 2,890 lines differ in place, 263 as a multiset),
  since the compiled scan meets windows line by line where upstream swept one
  color at a time. Per kind: three in a row 2,118 → 2,117, completed count
  602 → 603, near-complete 84 → 86, unique 8 → 6. One pinned hint position's
  first step is now another pair's three in a row
  (`unruly-hint.test.ts.snap`).
- **Saves and links**: the description, params and moves are unchanged;
  every save and link loads.

## Seismic

- **Tiers**: all 160 corpus boards solve at the same caps, Seismic and
  Tectonic modes: the starved area does what the trial placement did, as the
  hand-written hint argued. `seismic-hint.test.ts` holds it to the trial at
  every point a walk takes one.
- **Deals**: all 51 trace deals and all 160 corpus deals are the same.
- **Hint walks**: every walk ends where it did; 260 of 2,508 lines differ, a
  few singles told as a hidden single rather than a naked one (single 328 →
  326, hidden 248 → 251), the starved areas (133) and whole-area squares (35)
  unchanged. The hint now records from the placed numbers, as every candidate
  game does, rather than reading the player's notes; its placements lead its
  strikes, as its own rungs did.
- **Saves and links**: unchanged; every save and link loads.

## Speed

Dealing and grading the 400-board corpus, alternating a worktree of
`e8805ac4` with this tree on an idle machine, three runs each: 6.9 to 8.6 s
on the hand-written ladders, 6.8 to 7.7 s on the compiled ones.

## The app

Unruly's hints walk a 6×6 board to its finish, each step the pair outlined
and the cell ringed; Seismic's walk two 6×6 Normal boards to theirs, a
starved area striped with the struck cell ringed and folded into a note-less
cell; Solo's walk a 2×3 board to its finish in the engine's sentences, the
unit striped (`npm run dev`, Chrome).

## Soundness

Every technique stated here is sound in every world with an answer, and each
planted defect unsound (`research/technique-check/results-describe-*.txt`).
Tectonic has no board with an answer at the region sizes the checker used,
since every 2×2 block needs four numbers; the checker now tries one size
larger for such a world, and Tectonic is checked at 4×4 (about 30 s a
technique). The library's `placed`, now over every unit, is re-checked.

## Declined

- **`Game.hintRungs` from the pairing (task 4.1).** The rungs the
  descriptions state, with the walk's own, give six Latin games' lists
  exactly, but not a game that speaks rungs no technique is: Towers' planner
  rungs (`fullLine`, `tallestNearest`), Seismic's `singleton` and
  `regionsFull`, and Solo, whose techniques narrate under other kinds (its
  region rule as `cageSingle`). Each game would still list its own, for one
  line saved. The description's `rung` field stays read by
  `research/describe/firings.test.ts` alone.
- **The rest of the sentence copies (task 1.5).** Solo and Towers now speak
  the single, regions-full, confined and wing sentences, and Solo the hidden
  single, in the engine's words, a reason naming its unit; their words are
  unchanged. Towers keeps its hidden single and set, which qualify the height
  in one clause and not the other, and Solo its set, which it says as the
  unit's other cells: one vocabulary cannot say either, and making them the
  engine's would change what a player reads.
