## 1. Verify first

- [x] 1.1 Mines: a bare private desc as a game ID loaded, and its hint opened
      `(-1,-1)`. It no longer loads: `finishesByDeduction` refuses a layout
      that names no first square, and a save's private desc is read without
      being judged (its public one is). Two more routes into the same state
      are the owner's to place, in 4.1.
- [x] 1.2 Re-derive each entry's kind from the code and from the ledgers the
      Loopy and Tracks tests already keep. Of the ten then standing: two
      dead, one disabled by a bug, five that fire on a board the scan does not
      visit, and two (Salad's) the game cannot speak.

## 2. Rungs the list should not hold

- [x] 2.1 Bricks `localBreak`: dead, by proof (the comment on `BricksReason`)
      and by 0 of 12,776 refutations on random shares of 48 answers. The rung
      and its sentence went, and the classifier's fallback throws.
- [x] 2.2 Salad `repeatFull`: decided in `fix-salad-number-ball-hint-throw`.
      The plan teaches the hole-symbol strikes no count says, and the reason
      went.
- [ ] 2.3 Salad `note` and `regionsFull`: the population is taken. Six games
      list `LATIN_RUNGS` (Group, Keen, Mathrax, Salad, Towers, Unequal), and
      Salad alone passes its own `setUp` and so never walks the implicit
      reading; the other five pin `regionsFull`. Whether the engine should let
      a game say so is asked of the owner.

## 3. Boards nobody built

- [x] 3.1 Inertia `declined`: pinned, on the one position that held it among
      447,629 on boards of scattered cells. The generator's boards do not
      reach it.
- [x] 3.2 Boats `mustGrow`: it could not fire. Boats read the union-find's
      root as a boat's first square, and the root is the second. Reading the
      smallest element revives the technique in the solver and the hint
      (2,082 of 6,995 positions walked), makes the solver monotone, and retires
      `solveAtAnyTier` and the engine's `nonMonotone` exemption. The hint also
      asks its cheaper techniques again after it recovers a hidden number,
      which three of 144 newly dealt boards needed.
- [x] 3.3 Loopy `related` and `closesLoop`: both pinned, on positions a
      player makes and the hint's own play does not. Tracks
      `wouldFinishEarly`: pinned, on a fresh 5x4 board. Tracks `looseEndsFill`:
      dead by the ladder's order, and gone.
- [x] 3.4 Salad `forcing`: pinned in `fix-salad-number-ball-hint-throw`.

## 4. Close

- [ ] 4.1 Mines `restart`: the entry says its kind (a board no pin can hold)
      and names the test that builds the board. Whether that board should
      exist is asked of the owner: undoing the first click and opening another
      square changes the game ID, and 299 of 480 such boards then save to a
      file that will not restore.
- [x] 4.2 `docs/games/testing.md` § "Pinning a hint's positions" says what was
      learned about which kinds of `unreached` are acceptable to keep.
