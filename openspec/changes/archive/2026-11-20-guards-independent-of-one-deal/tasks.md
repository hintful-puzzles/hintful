## 1. Mark-collisions

- [x] 1.1 Let a declaration name a slot against a range of slots.
- [x] 1.2 Judge a declaration stale over a fixed set of boards per game.
- [x] 1.3 Rewrite Wordtrail's declarations as one range; see a planted new
      collision still refused, and a planted stale declaration still refused.

## 2. Warm-repaint

- [x] 2.1 Search seeds in order until every paintable mark is painted, up to a
      measured bound; print what covered each mark.
- [x] 2.2 Remove every `PINNED` entry the search now covers; keep `WRONG`.
- [x] 2.3 See the guard still fail on a planted unpainted mark, and time the
      whole file before and after.

## 3. Record

- [x] 3.1 `docs/testing.md`, and spec deltas for `testing`/`engine-colors`.

## Notes (2026-11-20)

- Mark-collisions reads the default board and `dealtBoards(game, { scalarEnds:
  false })`. Declarations are `among`/`against` slot sets; Path's pair text
  became a family like Wordtrail's. The wider set found Boats' given-water
  tilde beside its counts and Salad's edge letters beside its given letters,
  both declared. Its cost (110 s CPU whole) put it in `SPREAD`; the solve is
  capped at 60 hint steps, since the boards' deals and not the solves were
  the cost.
- Warm-repaint's search covered every `PINNED` mark within nine boards, so
  the table went. A pin judged against the seeded run moved with the deal
  as well, and none was left that the search could not replace. Search
  boards play no random events: same coverage, less time.
- Timed on this machine under load, CPU seconds: warm-repaint 184 at HEAD,
  257 searching with 20 events a board, 234 with none; the two files
  together 295 after, against about 206 before (mark-collisions was 22).
- The deltas landed in `engine-drawing` (where the warm-repaint requirements
  are) and `engine-colors`; `testing` holds neither guard.
