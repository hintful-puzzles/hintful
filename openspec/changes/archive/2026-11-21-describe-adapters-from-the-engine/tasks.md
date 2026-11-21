## 1. Census

- [x] 1.1 Re-run the counts (`dealtOf`, `clueList(at, v`, `<game>Ladder`,
      `spaceOf`, `new WeakMap<`) and sort the adapters by shape. Record each
      with its query.

      Measured 2026-11-21, HEAD `310c4ad8a` → this change's worktree:

      | Query (over `src/games`, tests excluded where noted) | HEAD | after |
      | --- | --- | --- |
      | `git grep -l 'clueList(at, v'` | 23 | 7 |
      | one-line wrappers: `git grep -h -A1 -E 'function [a-z][A-Za-z]*Ladder\('` then `grep -cE '^\s+return (described\|latin)Ladder\([a-z]+, [a-z]+\);'` | 26 | 0 |
      | `git grep -lE '(function\|const) spaceOf[ (=]'` | 18 | 2 |
      | `git grep -lE 'let (lastSpace\|space)[:]\|const spaces = new Map<string, GridSpace>'` | 17 | 0 |
      | `git grep -l 'new WeakMap<' -- src/games ':!*.test.ts'` | 21 | 9 |

      The shapes, and where each went:
      - **The squares where a predicate holds** (mosaic, slant, loopy,
        clusters, pearl, towers, filling, range, palisade, spokes, path,
        mines, rect, lightup, bricks, tents, singles, separate, net,
        crossing, wordtrail, rome): `cluesWhere(array, given, value?)`.
        Its zero-valued form (a wall, a tree, a hole, a goal) is the same
        call with `() => 0`.
      - **A clue at a computed place** (abcd and magnets by `perPlace`,
        unequal and adjacent by edge, blackbox's laser ends, bridges'
        islands, salad's border slots, tents' and tracks' line counts): left
        as `clueList`, since the place is the game's own arithmetic.
      - **A one-line ladder wrapper** (26, among them seismic, magnets,
        rome, mathrax and salad, exported to hint and generator files): gone.
        Callers name `describedLadder(module, dealt)` or `latinLadder`. A
        ladder that supplies rungs or variations keeps its function (slant,
        loopy, mines, pattern, subsets, galaxies, abcd, ascent, filling,
        net, unruly, bridges, guess, solo, keen).
      - **A space cache** (`lastSpace`, a `Map` by shape): gone, since
        `describedSpace` keeps every space by shape already, and now looks
        at the last one asked for before it builds a key. The two
        `spaceOf`s left compute the size from a shape the game owns
        (dominosa's, the code skeleton's).
      - **A per-board memo** (map, crossing, wordtrail, flip, cube's deal;
        loopy, pearl, tracks, net, crossing's ladder; seismic and rome's
        areas; cube's rolls; netslide's rules): `perBoard(make, still?)`, with `still` for a board the
        generator changes in place. Seismic's and Rome's identical
        Dsf-to-areas walk is `Dsf.classes()`.
      - **The `WeakMap`s left** are not a deal: render caches (rect, loopy),
        hint caches (ascent, untangle), solutions (loopy, untangle),
        Pattern's per-binding reason, Loopy's faces.

## 2. Helpers

- [x] 2.1 The clue-list helper; migrate the games of that shape.
- [x] 2.2 The default ladder; remove the one-line wrappers. There is no new
      engine call: `describedLadder(module, dealt)` with its defaults already
      is the default ladder, and the wrappers only renamed it.
- [x] 2.3 Memoize givens and space in the runtime; remove the games' caches.
      Measure a hint walk's time against HEAD, back to back.

      `describedSpace` already kept every space by shape; it now looks at
      the last one asked for first. A deal or a ladder is kept by
      `perBoard`. Measured 2026-11-21: `hint-walk-fingerprint.test.ts`,
      HEAD (a scratchpad worktree) and the change alternated twice under
      `nice`, the sum of the 130 games' walk times averaged over the two
      runs: 16.2 s at HEAD and 13.6 s with the change. Of the 2.6 s, 1.9 s
      is one HEAD run of Rect's walk that took 4.0 s while the other three
      took 0.16 s, which is load. Without it: about 14.3 s against 13.6 s, so
      no game walks slower.
- [x] 2.4 Hints and boards byte-identical: hint-walk fingerprints and deal
      snapshots unmoved. `npm run test:hint-sweeps` green with no snapshot
      written. The deal snapshots are in each game's tests, which the
      commit's gate runs for every staged game.

## 3. The declared form

- [x] 3.1 Decide, on what is left after 2, whether a description declares
      its givens. Record the decision and the reason here; if yes, pilot on
      a game with a margin of clues, then migrate.

      **No.** After 2 a game's deal is one `cluesWhere` line a kind, and
      what is left in it is the game's own encoding: which bit of `flags`
      means numbered (Light Up), the sentinel for no clue (`-1`, `0`,
      `NOCLUE`, `NO_END`), a hidden number read as 0 (Rect), a place
      computed by `perPlace` or an edge. A declaration would have to name
      the state's fields and restate those predicates in the YAML, which is
      the same line moved into a second language and the game's state shape
      made a contract the description reads. That bends the game to the
      description, and removes no more than the line it moves.

## 4. Finish

- [x] 4.1 Skeletons and `docs/descriptions.md` show only the one way. Run
      `npm run test:hint-sweeps`; commit, push, archive.
