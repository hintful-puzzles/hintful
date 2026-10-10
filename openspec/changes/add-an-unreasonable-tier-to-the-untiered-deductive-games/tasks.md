# Tasks

## 1. Count it, and ask

- [x] 1.1 List the untiered games that deduce, from
  `src/engine/untiered-load.test.ts`, and say for each whether it joins. The
  nine of the proposal do unless task 2 finds its Unreasonable boards are not
  worth dealing. Say why Mines, Net, Range and Rectangles do or do not.
  **Decided 2026-10-10** (the reasons are in the proposal, "Which games
  join"): Net, Range and Rectangles join, each after its own task-2
  measurement. Mines does not.
- [ ] 1.2 For each game, show that adding the difficulty item leaves every
  existing params string decoding to the lower tier. The owner's answer
  (proposal, "What to settle first") is that the tier is always written, so
  the full encoding gains `de` and the snapshot's diff shows only that.
  **Pattern: done.** Every recorded line gained `de`, its old string is now
  the shared form, and the only new lines are the Unreasonable presets.
  **ABCD: done.** Every line gained `de` after what it had (`5x5n4R` is now
  `5x5n4Rde`), and the menu's lines moved with the menu (task 3.2).
  **Crossing: done.** Every line gained `de` (`9x9S` is now `9x9Sde`), and
  the menu's lines moved with the menu.
  **Filling: done.** Every line gained `de` (`9x13` is now `9x13de`), and
  the menu gained its three Unreasonable lines.
  **Mosaic: done.** Its codec is now built from `paramsCodec`. Every line
  gained `de` after what it had (`50x50h0` is now `50x50h0de`), and the menu
  gained its six Unreasonable lines.
  **Palisade: done.** Every line gained `de` (`5x5n5` is now `5x5n5de`), and
  the menu gained its four Unreasonable lines.
  **Separate: done.** Every line gained `de` (`5x5n5` is now `5x5n5de`), and
  the menu gained its four Unreasonable lines.
  **Signpost: done.** Every line gained `de` after what it had (`5x5c` is now
  `5x5cde`), and the menu's lines moved with the menu.
  **Sticks: done.** Every line gained `de` (`7x7b20s2` is now `7x7b20s2de`),
  and the menu gained its three Unreasonable lines.

## 2. One game to the end: Pattern

- [x] 2.1 Pick the game whose deduction engine is easiest to search over.
  Write the search that proves exactly one answer, and time it on the largest
  preset. Pattern: its params were a bare `WxH` and its generator has no clues
  to strip. On a 30x30 a dealt board's search tries a median of 17 positions
  at about 0.06 ms each, and the hardest of 225 tried 1,105.
- [x] 2.2 The generator deals Unreasonable boards. Measure how many attempts a
  board takes on each preset, and look at twenty of them in the running app.
  A picture with one answer the lines do not reach is 1 draw in 250 at 10x10,
  1 in 87 at 15x15, 1 in 31 at 20x20, 1 in 18 at 25x25 and 1 in 12 at 30x30,
  and a deal takes about 10 ms at each (worst of 60: 153 ms). **Not twenty in
  the app**: three were dealt and looked at there (two 10x10, one 30x30), and
  forty a preset were walked by the hint outside it, counting the squares it
  leaves undecided: a median of 21 of 100 at 10x10, 40 of 225, 56 of 400, 179
  of 625, and 651 of 900 at 30x30.
- [x] 2.3 The tier, the `difficulty` contract, the hint's refusal on an
  Unreasonable board, the help page, and the spec delta. Remove `skip_specs`
  from `.openspec.yaml`.
- [x] 2.4 A pasted board with one answer that needs search loads as
  Unreasonable; one with several answers, and one with none, is refused.
- [x] 2.5 In the running app: deal an Unreasonable board, play it with hints
  to where deduction runs out, and read the sentence.

## 3. The rest

- [x] 3.1 Say what transferred from the first game and what the engine should
  own, and move it there before the second game. **Done 2026-10-10:**
  `src/engine/answer-search.ts` has what Pattern wrote that is not about
  nonograms, and Pattern is on it:
  - the four verdicts of an answer search (`Answer`);
  - Solve from those verdicts (`solveFromAnswer`);
  - the contract from "deduction and the hint finish it" and "the search says
    one" (`searchTierContract`);
  - the per-board cache of the answer (`answerCache`);
  - the two tier constants, their names, their Custom field and the `eu`
    letters (`searchTierItem`, `searchTierSegment`);
  - the depth-first loop (`searchAnswers`). It is one shape: a position is
    whatever the game's deduction works on, and the game says how a stuck one
    divides, so a cell of more than two values or an edge is the game's
    `assume` and nothing in the loop. Pattern's count of positions is
    unchanged, since it tries shaded before clear as before.
- [ ] 3.2 Each remaining game, as task 2, one commit a game: ABCD, Crossing,
  Filling, Mosaic, Palisade, Separate, Signpost, Sticks, then Net, Range and
  Rectangles. As each joins, `untiered-load.test.ts` loses its ledger line;
  its two floors of ten games (`declared.length`, and the games answering
  `nothingToDeduce`) fall with them and are to be re-stated when the first
  goes red, from what is left. Two snapshots move with each game and are
  read before they are re-baselined: `params-stability.test.ts` (each line
  gains `de`) and `src/capability-surface.test.ts` (`difficulty` for
  `finishesByDeduction`). Run `src/engine` and the tests at the top of `src/`
  before the gated commit; Pattern's first commit failed the gate on the
  second.
  - [x] **ABCD** (2026-10-10). Measured: a fill is stuck with one answer once
    in 11 to 27 at the presets, the search tries a median of 3 to 13
    positions, and the ladder places about 3 letters of 16 (7 of 49) before
    it stops, so the hint does little until the first trial. Decided, each
    with its reason in the guide's "What ABCD, the second, added":
    - "Remove clues" stays an option beside the tier and is labeled "clues
      hidden"; it was "Hard" against "Easy". The menu is four sizes at both
      tiers and one board each for hidden clues, the diagonal rule and three
      letters, so it no longer lists 4x4 with clues hidden.
    - Hiding clues at Unreasonable asks the search within 30 positions.
    - Unreasonable has its own size bound, and is refused with every clue
      showing on a board of up to nine squares (proved) and on one two wide
      under the diagonal rule (none in 240,000 fills).
    - For the owner to look at, none of it blocking: whether an Unreasonable
      board with clues hidden is wanted as hard as 30 positions makes it. The
      ladder places nothing on most of them, so the hint's first answer is
      that nothing follows.
  - [x] **Crossing** (2026-10-10). Measured: a draw is stuck with one answer
    once in 40 to 60 up to 9x9, in 270 at 11x11 and in 1,250 at 13x13 (0.35 s
    a deal); the search tries a median of 3 positions and 129 at most; the
    hint leaves a median of a quarter of a 5x5's squares empty and a
    twentieth of a 13x13's. Decided:
    - The menu is five sizes at both tiers and two symmetric boards, 9x9 and
      15x15, at Easy. It no longer lists 13x13 symmetric, which Custom still
      deals: a section holds twelve lines.
    - Unreasonable is dealt up to 182 squares, where a deal takes half a
      second to a second. No small size lacks the tier: 4x2 has it.
    - **Two defects in the Easy bound, found by measuring the new one and
      fixed here.** A board two squares across is now dealt up to 80 squares,
      and one three or four across up to 180, where the bound was 225 for
      all: 2x60, 3x75 and 4x56 never dealt a board, and 2x50 and 4x50 took
      five seconds when they did. And the retry cap is 100,000 draws, not
      10,000: an Easy 15x15 is accepted once in 3,200 draws and a 7x32 once
      in 14,000, so the deal threw about one time in twenty-five at 15x15
      and every other time at 7x32.
    - **For the owner to look at, not blocking: most of these boards do not
      need trial and error.** One deduction the solver and the hint lack, a
      number that still fits only one run, finishes about six in seven of
      them. The help page tells the player to look for it before trying a
      digit, and
      `openspec/changes/give-crossing-the-deduction-its-unreasonable-boards-lack`
      is filed to build the rung, after which Unreasonable keeps only the
      boards that need a trial.
  - [x] **Filling** (2026-10-10). Measured: a deal is 35 ms at 7x9, 0.17 s
    at 9x13 and 0.65 s at 13x17, about five times an Easy one; a dealt board
    needs a median of 21 to 29 positions of the 30 it is stripped to; the
    hint leaves a median of 14 squares of 63 empty at 7x9 and 35 of 221 at
    13x17. Decided, each with its reason in the guide's "What Filling, the
    fourth, added":
    - The generator hides clues by the search where Easy hides them by the
      solver, within 30 positions. One more deduction would not finish these
      boards: a number that breaks the rule as written settles 3 of 66, and
      a one-level trial 63. No change is filed for a rung.
    - The menu is upstream's three sizes at both tiers.
    - Unreasonable has no size bound of its own. It is refused only on a
      strip of one, three or four squares, where every clue set was tried.
    - **A defect in Easy, found by measuring and fixed here.** Filling had no
      size bound, and filling a board with regions ran its retry cap out one
      deal in twenty at 20x20 and every time at 25x25. A board of more than
      300 squares is now refused at either tier, and the cap is 30,000.
    - The ledger's Filling board has several answers, and is refused as that.
    - **For the owner to look at, not blocking:** on a small board the hint
      can place nothing before it stops (two of three 5x5 samples), as on
      ABCD with clues hidden.
  - [x] **Mosaic** (2026-10-10). Measured with aggressive generation: a
    deal is 7 ms at 10x10, 0.5 s at 25x25 and 1.2 s at 30x30, about five
    times an Easy one; a dealt board needs a median of 9 to 29 positions; the
    rule leaves a median of 58 squares of 100 undecided at 10x10 and 485 of
    625 at 25x25. Decided, each with its reason in the guide's "What Mosaic,
    the fifth, added":
    - The generator hides further clues from an Easy board by the search,
      within 30 positions. Aggressive generation stays an option beside the
      tier: without it hiding stops at the first clue that stops the rule.
    - The menu is upstream's six sizes at both tiers, 50x50 without
      aggressive generation at both.
    - Unreasonable with aggressive generation is refused past 900 squares.
    - **A defect in Easy, found by sweeping the shorter side and fixed
      here.** A board three to nineteen across is not dealt past a length
      well inside the 10,000-square bound, and ran the retry cap out.
      `validateParams` now refuses it with the length its width allows.
    - The ledger's Mosaic board had no answer at all.
    - **For the owner to look at, not blocking: most of these boards do not
      need trial and error.** Comparing two numbers whose blocks overlap,
      which the solver and the hint do not do, finishes 34 of 40 at 10x10
      and every board seen without aggressive generation. The help page says
      to look for it first, and
      `openspec/changes/give-mosaic-the-deduction-its-unreasonable-boards-lack`
      is filed to build the rung.
  - [x] **Palisade** (2026-10-10). Measured: a deal is 8 ms at 5x5, 50 ms at
    6x8, 0.2 s at 8x10 and 1.3 s at 12x15, about three times an Easy one; a
    dealt board needs a median of 9 to 29 positions; the hint leaves a median
    of 25 edges of 40 undecided at 5x5 and 155 of 333 at 12x15. Decided, each
    with its reason in the guide's "What Palisade, the sixth, added":
    - The generator strips further clues from an Easy board by the search,
      within 30 positions. One more deduction would not finish these boards:
      no edge on 90 of them is wrong at a glance.
    - The menu is upstream's four boards at both tiers.
    - Unreasonable is dealt up to 180 squares, the largest preset's, and is
      refused on a strip and in regions of one, where the solver finishes
      every board with no clue.
    - The ledger's Palisade board has no clue, and so several answers.
    - **A defect in Easy, found by measuring and filed, not fixed here.**
      Palisade has no size bound, and no division of a board with many small
      regions is one the solver solves: 9x9 in threes and 12x12 in fours run
      the retry cap out after about 30 seconds, at either tier. The bound
      depends on the region size and on how thin the board is, and the
      numbers so far are in
      `openspec/changes/bound-palisade-to-the-boards-it-deals`.
  - [x] **Separate** (2026-10-10). Measured: a deal is 4 ms at 4x4, 31 ms
    at 5x5, 57 ms at 6x6 with four letters and 0.8 s at 6x6 with six, the
    Easy board's time and little more; a dealt board needs a median of 5 to
    23 positions; the hint leaves a median of 19 edges of 24 undecided at
    4x4 and 53 of 60 at 6x6 with six. Decided, each with its reason in the
    guide's "What Separate, the seventh, added":
    - The board is all letters, so there is nothing to strip. The generator
      swaps pairs of letters inside a region of an Easy board, each while
      the search still proves one answer within 30 positions. One more
      deduction would not finish these boards: a join and a look settles 45
      of 450, a one-level trial 446.
    - The menu is the four boards at both tiers.
    - Unreasonable has no size bound of its own: it is dealt wherever Easy
      is. It is refused on a strip, with two letters (proved at any size)
      and on a 3x2 board with three, where every fill was tried.
    - The ledger's Separate board has five Cs, and so no answer.
    - **A defect in Easy, found by measuring and filed, not fixed here.**
      Separate has no size bound and deals only a handful of sizes: 8x8 with
      eight letters runs the retry cap out in 12 seconds every time, 10x10
      never dealt at any letter count, and the 6x6 preset with six letters
      takes 0.7 s on average and 3 s at worst. The numbers are in
      `openspec/changes/bound-separate-to-the-boards-it-deals`.
    - **For the owner to look at, not blocking:** the hint does little on
      these boards before it stops (7 edges of 60 at 6x6 with six letters).
      Stopping the swaps at the first one that stops the solver would leave
      it half the board, and was not taken because one board in four dealt
      that way falls to a single join and a look.
  - [x] **Signpost** (2026-10-10). Measured: a deal is 1 ms at 4x4 and 5x5,
    3 ms at 6x6, 8 ms at 7x7, 0.26 s at 12x12 and 0.9 s at 15x15, four to
    five times an Easy one; a dealt board needs a median of 3 positions at
    4x4, 15 at 6x6 and 25 at 7x7; the hint leaves a median of 7 links of 15
    unmade at 4x4 and 30 of 48 at 7x7. Decided, each with its reason in the
    guide's "What Signpost, the eighth, added":
    - The generator strips further numbers from an Easy board by the search,
      within 30 positions, never the first or last. One more deduction would
      not finish these boards past 4x4: a link and a look settles 34 of 150
      at 4x4, 19 at 5x5 and 7 at 6x6.
    - The menu is upstream's four sizes at both tiers and its two boards
      with free ends at Easy.
    - Unreasonable is dealt up to 225 squares and 30 on the longer side. It
      is refused on five squares or fewer, on 2x3 and 2x4, and on 3x3 with
      its ends in the corners, where every board was tried. A 1x6 strip has
      the tier.
    - The ledger's Signpost board has several answers.
    - **A defect in the solver, found by the counter and fixed here.** The
      numbering read a blank square inside a chain as a given number, which
      only the solver's several links in a pass can leave. From a position
      with chains on it the solver then forced links that nothing forces,
      and 3 to 9 in 100 of the boards the search called unique had two
      answers. Easy boards were not touched by it: none of 4,000 had a
      second answer, and the differential's boards are the same.
    - **A defect in Easy, found by measuring and filed, not fixed here.**
      Signpost has no size bound. A 20x20 board takes 1.8 s, 22x22 gives up
      half the time after 3 to 6 s, 25x25 and past it nearly always, and a
      2x250 board takes 19 s. The numbers are in
      `openspec/changes/bound-signpost-to-the-boards-it-deals`.
    - **For the owner to look at, not blocking:** a quarter of the 4x4
      boards fall to one link and a look, where a 4x4 has too few squares to
      hide more. The two boards with free ends are on the menu at Easy only,
      as Crossing's symmetric ones are.
  - [x] **Sticks** (2026-10-10). Measured: a deal is 25 ms at 5x5, 0.15 s at
    7x7 and 1.5 s at 10x10, about three times an Easy one; a dealt board
    needs a median of 3 to 5 positions and 19 at most; the hint leaves a
    median of 9 squares of 20 blank at 5x5 and 12 of 80 at 10x10. Decided,
    each with its reason in the guide's "What Sticks, the ninth, added":
    - The generator strips the full clues by the search, within 30
      positions, where Easy strips them by the solver. Stripping an Easy
      board further took five times as long.
    - The menu is the three sizes at both tiers.
    - Unreasonable is dealt up to 100 squares and 30 on the longer side, and
      is refused on 2x2 alone, where every board was tried. A 2x3 board can
      have the tier, and the generator gives up on it in a second more often
      than not.
    - The ledger's Sticks board has several answers.
    - The floor under the untiered games in `untiered-load.test.ts` went red
      with this game and is re-stated as what is left when the change is
      done: the games with nothing to deduce, and Mines.
    - **A defect in Easy, found by measuring and filed, not fixed here.**
      Sticks has no size bound: 12x12 takes 2.6 s, 13x13 8.5 s, 2x50 13.5 s,
      and 10x10 with 5% blocks 18 s. The numbers are in
      `openspec/changes/bound-sticks-to-the-boards-it-deals`.
    - **For the owner to look at, not blocking:** these boards are shallow.
      One trial followed through finishes every one of 106, and a trial
      that only looks for a square left with no line to hold finishes about
      three in ten (11 of 40 at 5x5, 13 of 40 at 7x7, 5 of 26 at 10x10).
      That second is a rung the solver could have; no change is filed for
      it, since it would move the Easy boards and leave most of these.
      10x10 Unreasonable takes 1.5 s on average and 4 s at worst, the
      slowest line on this menu.
  - [ ] Net, Range,
    Rectangles. For each, do what Crossing's measurement did (the guide,
    "What Crossing, the third, added"): count what one more deduction would
    finish of the boards the tier deals, and sweep the shorter side when
    setting a size bound.

## 4. Close

- [ ] 4.1 `docs/games/solver-and-generator.md` and `docs/games/mechanics.md`
  on what an untiered game is once these have tiers. The recipe and what
  Pattern taught are in the first already, under "Giving a deductive game an
  Unreasonable tier".
- [ ] 4.2 Commit, push, archive.
