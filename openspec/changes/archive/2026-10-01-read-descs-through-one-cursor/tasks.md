## 0. Measure

- [x] 0.1 Classify every game's description parser (proposal § "Task 0") and
      check the falsifier.

  Every game's `validateDesc`, `newState` and the helpers they call, read in
  full by six readers against a sketched cursor (2026-10-01). **Held on both
  counts.**

  - **Shorter or losing a hand-written ran-out decision: about 40 games**
    (39 parsers, Net and Netslide sharing one), against a falsifier of
    fifteen. The cursor replaces the loop line for line in every grammar the
    `run-length.ts` header names as rejecting a token iterator — Towers, Keen,
    Solo, Undead, Unequal, Mathrax, Salad, Boats, Tents, Tracks, Pattern —
    because the caller drives it; the "index handed back" that sank the
    iterator is the cursor's position.
  - **Ran-out split sites: about 45 hand-written** in about 24 games (Mines'
    `misplaced` helper alone has seven uses; Twiddle and Undead each grew a
    local `missing`), **and about 25 more made wrongly**: Solo's three
    `!== ","` checks can only fail by running out but say malformed;
    Subsets, Unequal, Dominosa, Slide and Untangle call a truncation
    malformed; Sixteen calls a trailing comma malformed; Flip, Flood and Cube
    call an overlong section malformed; Crossing's too-short verdict is
    overwritten by a later section's; Rome's last error wins, so `!` reads
    as too short.
  - **Does not fit (9):** fixed-width one-character-per-cell grammars whose
    length is known up front (Singles, Spokes, Pegs, Separate),
    single-character-token grammars where `for…of` already is the cursor
    (Galaxies, Clusters, Unruly), and obfuscated hex blobs that mean nothing
    until whole (Blackbox, Guess). All nine can still read once.
  - **Already on `run-length.ts` (7)**, plus Light Up, which writes that
    grammar by hand: Bridges, Filling, Loopy, Mosaic, Palisade, Pearl,
    Slant. The cursor makes none shorter; merging their two loops does.
  - **One parse: every game can.** Eleven already called one parser from
    both, in the eight shapes the proposal lists.
  - **Defects the second scan was hiding**, beyond lenience: Rect's and
    Sticks' clues have no bound and wrap in their typed arrays, so the parser
    reads a different board; Twiddle accepts trailing text in orientable
    mode; Magnets never checks its end; Sokoban's `@0` counts no player but
    places one; Tents' `z!_` is accepted and its `!` dropped; Slide never
    range-checks its target; Cube reads an out-of-range start as square 0;
    Ascent's clue `0` builds a locked empty cell; Blackbox reads non-hex as 0
    and accepts two balls on one cell, a board that can never be won.

## 1. If it holds

- [x] 1.1 The cursor, in `desc-error.ts` or beside it, with its own tests.

  `engine/desc-reader.ts`: `readDesc` and `DescReader` (`peek`, `peekIs`,
  `accept`, `expect`, `char`, `int(lo, hi)`, `rest`, `end`, `fail`). `int` has
  no unbounded form: every wrap Task 0 found was an unbounded number.
  Failures unwind by a private throw `readDesc` catches, so `validateDesc`
  still returns.

- [x] 1.2 Port the games task 0 found it fits, one commit per family of
      grammar; every ported game's existing rejection tests still pass
      unchanged.

  **Every game**, not only the ones the cursor fits: the nine it does not fit
  read once through `readDesc` with `char` loops or `scanRunLength`, since
  the single read was the second count and they pass it. Ported by family
  (comma-separated numbers; fixed-width and hex sections; runs with numbers
  and `_`; sectioned grids; clue-list sections; wall lists; run-length;
  one-character tokens and blobs), and **landed as one commit**: the gate
  runs against the working tree rather than the index, so a commit per family
  would have claimed eight verifications of one tree.

  Two shared readers fell out, each because two games carried the same
  grammar after porting: `engine/wall-runs.ts` (Rome and Seismic's wall
  lists) and `engine/dot-runs.ts` (Unruly's givens and Clusters' dots, letter
  for letter, encoders included). Flip, Cube and Mines each read a hex bitmap
  and were **not** unified: their case and bit layout differ, and those are
  frozen bytes.

  **Rejection tests changed only where the cursor's answer is the defined
  kind**, about a dozen assertions, each now naming what is there: a doubled
  or misplaced separator names the character (Fifteen, Sixteen, Flood, Slide,
  Subsets, Crossing), a truncation is too short (Sixteen's trailing comma,
  Slide's `f` at the end, Subsets' cut after a cell), a number past its bound
  is out of range (Singles, Spokes, Pattern's over-long clue). **One
  convention was decided across games**: a section stopped by an early comma
  names the comma. Solo, Slide and Salad had each special-cased it as too
  short, which tells a player the ID was cut off when copied, and Keen,
  Crossing and Undead gave the cursor's answer; the three special cases went.

  **Defects fixed on the way**, each pinned by a test: every one listed under
  0.1; Rome's encoder writing a run of 26 or more past `z` (or as a `z` that
  lost a wall) in both halves; Crossing's encoder doing the same for a wall
  run over 26, reachable on a Custom board 26 or more wide; Solo's
  block-structure decoder reading `z` as 26 where its encoder writes 25;
  Sokoban's player run, Twiddle's repeated tiles, Signpost's and Subsets'
  repeated numbers and sets, Guess's repeated color when repeats are off,
  Seismic's clue section that was not validated at all, Mathrax's clue
  numbers outside what its generator can write.

  **Kept on purpose**, though no encoder writes them: leading zeros (every
  hand loop read them); Mines' `u` layout prefix and Undead's `G`/`V`/`Z`
  givens and Pattern's clue-square suffix, upstream grammar with live
  handling behind it; Slide's optional move count; Palisade's dropped
  trailing run, which is its encoder's format; Untangle's edges written
  high-to-low or unsorted and Towers' all-blank grid section, which name the
  same board.

- [x] 1.3 The engine catalog entry, and `docs/games/mechanics.md` §
      "Descriptions and state".

  Catalog entries for `desc-reader.ts`, `dot-runs.ts` and `wall-runs.ts`;
  `mechanics.md` § "The two scans have to agree, and nothing makes them"
  became § "Read a desc once", every citation repointed.

- [x] 1.4 One result type for a parse in `desc-error.ts`, and each ported
      game's `validateDesc` and `newState` reading through one parse. The
      validator lenience listed in the proposal goes with it: re-run the
      identical-state measurement and list what is left.

  `DescParse<T>`, `descVerdict` and `descValue` in `desc-error.ts`; every
  game's `validateDesc` is `descVerdict(parseDesc(…))` and its `newState`
  builds from `descValue(parseDesc(…))`.

  **The identical-state census, re-run** (2026-10-01): every game's
  near-miss boards, up to 400 one-edit mutants each, every accepted mutant
  built and compared with the original's state. **Ten games build an
  identical state from some accepted mutant (Abcd, Boats, Bricks, Fifteen,
  Mathrax, Sticks, Tents, Undead, Unequal, Untangle), and in all ten every
  such mutant is a leading zero** — `00` for `0`, kept on purpose. Before,
  it was 26 games, many with characters outside the grammar. The leading
  zeros are also the instrument's known positive: it found them in all ten,
  classified separately from any other identical mutant, of which there were
  none. (A first attempt compared states with `isDeepStrictEqual`
  and stalled for half an hour on Loopy, whose state holds a cyclic grid
  graph; the census compares a bounded fingerprint instead.)

## 2. Guards

- [x] 2.1 `desc-error-games.test.ts` loads every desc each game's generator
      writes, since a parser made strict must still read its own encoder's
      output. Planting Slant's encoder with `keepTrailingBlanks: false` turned
      it red, naming both game IDs.
- [x] 2.2 The near-miss floor re-founded: 4,668 accepted mutants when it was
      written, 3,443 with every parser strict, floor 3,000. The drop is the
      change working — a near miss a strict parser refuses never reaches
      `newState`.
- [x] 2.3 `src/run-length-desc.test.ts` retired. Its pristine half (a
      generated desc loads) is 2.1 for every game rather than nine, its
      mutation half was a crash sweep the near-miss test runs for every game,
      and the two scans it held to each other are one parse.
