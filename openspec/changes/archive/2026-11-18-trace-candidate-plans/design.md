# Design: trace the candidate plans

## What the plan's steps are to the replay (task 1.1)

The judge replays a walk's firings on fresh marks, each as its technique
offers it then (`docs/hints.md` § "Judging the last move"). A candidate
plan's firing is no compiled technique's, so `Traced.walked` is now
`TracedFiring`: a firing's facts, its graph ids, and an `id` and `firings`
the replay asks. A ladder walk's `taken` is one as it is; the plan builds
its own.

- **A firing** that makes a fact (`madeFact`, as before) is recorded: its
  legs' facts, then, under the implicit reading, the placement a strike from
  a cell with no notes folds into. They are made on marks of the trace's
  own, read as the judge reads the board, whose placing hook records each
  placement's cull into the graph after them, as `placingRung` does.
- **What it read** is its steps' premise (`premise`: area, stripes, `reads`,
  targets), the cells the frontier continues by.
- **Offered again**, the firing's rung (the singles, or one of the game's
  rungs) is asked with the walk's board and notes set to the replay's marks,
  every rung admitted (`nothingEarlier`, `populated`, `continues` all true),
  and put back after. A strike that leaves a folded cell one value places
  it, as the walked fold did.
- **The setup** (populate, clean, note legs): populate and note legs make
  no fact the player's reading shows. A clean that strikes stale notes does;
  it is recorded with no reads, and the replay makes the obvious clean before
  every firing (`between`), so it is never what a chain cannot do without.
- **A game's state beside the board and notes** (Salad's holes) is set as
  the walk began while a rung is asked (`CandidatePlan.ownState`). A step of
  the game's own (Salad's markers) makes no fact, so a firing resting on a
  marker is not offered again and its chain names none. Making the markers
  facts the judge reads is Salad's own, and was not done.

## Decision: the premise as reads, not every earlier firing

Measured on each notes game's default board, each hint move made alone on
the board as dealt (2026-11-18, populate reading): premise reads named 239
of 246 chained verdicts; no reads (every earlier firing a candidate, the
chain every fact) 232. Where they differed, the premise's replay reached the
move without the firing no-reads named (Group's associativity): a replay of
every firing asks each for all its facts, so it passes over a firing whose
other facts lost their premise, and blamed the start for it. Rome under no
reads hit the 12-candidate bound (5 of 12 named against 12).

## Found on the way: a placement by strikes rests on every strike

`chainOf` began the chain from the one fact of the reaching firing that
makes the move. For a value left alone in its cell, that is the last strike
there; the other strikes, from earlier firings, were left out, so the
replay never left the cell one value ("the move is not made"). The chain
now begins from every fact up to then that makes the move. It moved no
ladder game's count (their walks mostly report no reads) and named 9 more
in the notes games.

## Measured (task 1.4)

Each notes game's default board, every hint move made alone on the board as
dealt. Before: 1 of 259 chained verdicts named a start. After, populate
reading: 240 of 246; implicit: 264 of 273. Unnamed: Salad 6 of 12 (a
marker, above), and Adjacent 3 under the implicit reading. Those are notes
written into a cell with none, whose strikes the cull of a fold's placement
makes: the aim counts a firing's own facts and not its placement's cull, so
the walk took two unrelated firings first, and the chain rests on nothing
before the firing that made it. The aim is every builder's, so it is filed
with `close-trace-gaps`. Dearest check 127 ms (Solo, under the machine's
usual load); most offers 181, within `MOST_OFFERS`.
