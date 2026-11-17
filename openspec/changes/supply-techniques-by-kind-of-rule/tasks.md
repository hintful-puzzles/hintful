# Tasks

## 1. The clustering (2026-11-17), done

Method: every `techniques:` entry of the 62 descriptions was extracted
(`for`/`conclude` as written) and each of the 305 stated ones (47 more are
`use` of a library technique) was labeled by reading its formula, not its id,
into a kind. A label is one reading, not a measurement by tool; the kinds'
boundaries are judgment, and the counts carry that.

| Kind (one rule alone) | n | Examples |
|---|---|---|
| CNT: a set holds exactly k of v (met: rest clear; starved: rest filled; degree at a node is the same rule) | 35 | norinori `fullRegion`/`exactRegion`, starbattle `fullLine`..`exactRegion` (four copies of one formula), loopy `clueFull`/`clueStarved`/`dotFull`, tracks `clueFull`/`clueExact`, boats `lineShips`/`lineWater` |
| ONE: one place left (a value with one cell, a cell with one candidate, a mark with one partner) | 28 | `single`/`lone`/`onlyCell`/`onlySpot` in 14 games |
| PEER: a placed value rules out the same value in related cells (all different, no two touch) | 19 | `placed`/`cull`/`once`, `besideShaded`, `nextToTent`, `around` |
| REL: a binary relation between two cells prunes candidates | 14 | unequal `sign`, adjacent, subsets `smaller`/`bigger`/`carry*`, magnets `pair` |
| LOOP: one loop, no early close | 12 | loopy/pearl `earlyLoop`+`closed`, tracks `closeLoop`, slant `loop`, rome `loop` |
| GRP: a group's size or connection (cut, too big, sealed off) | 19 | palisade `notTooBig`, filling's five, range `cut`, separate's three |
| FIT: suppose a value, one rule breaks | 45 | net's eight, pearl's seven, sticks' five, starbattle `needed`/`crowded`/`starved` (six), norinori `neededRegion`/`blocked`/`crowded`, keen `cage*`, mathrax `clue*` |
| CMP: compare two overlapping counts | 7 | mines `pair`/`region`/`regions`/`count`, mosaic `compared`, clusters |
| SUM: an arithmetic total over a cage or part | 6 | solo |
| **In nine kinds** | **185 of 305 (61%)** | |
| Own to the game | 120 (39%) | loopy's seventeen corner/pair techniques, boats' ship geometry, rect's seven, slant's seven, guess's six, singles' pattern techniques |

**Number of kinds: nine**, under the fifteen the proposal allowed, covering
61% of the stated techniques, below the report's estimate of two thirds
(196 of 297). Where the kinds are not equally good:

- **Tight, one formula with the game's nouns as parameters** (CNT, ONE, PEER,
  REL): 96 techniques, 31%. Within a game the same formula is already written
  more than once (starbattle states fullLine and fullRegion, exactLine and
  exactRegion, neededLine and neededRegion, crowdedLine and crowdedRegion,
  starvedLine and starvedRegion as separate techniques), which is the cost the
  proposal names.
- **A family, not one formula** (LOOP, GRP, FIT, CMP, SUM): 89, 29%. These need
  the game to say which "set", "group" or "rule" the kind reads, and FIT is the
  rule's break clause the proposal already plans (§ "A rule states how it
  breaks"), so its techniques come from that clause, not from a library
  formula.
- **Rule declarations already exist** as `shape:` (norinori) and `answer`
  rules, so CNT, PEER and FIT can be derived from the rules a game states
  without a second statement; ONE and REL need a rule that names the domain.

## 2. Open

- [x] 2.4 (2026-11-17) First slice, CNT only: `src/describe/kinds.ts`, a
  loader-level template (`kind: count.met` / `count.exact`, `as`, `with`)
  that expands into a stated technique, with the kind's own plant
  (`docs/descriptions.md` § "A kind of rule places its techniques").
  Norinori (`fullRegion`, `exactRegion`) and Starbattle (the line and region
  pair of each) restated on it. **What moved: nothing a player sees.** The
  compiled modules differ only in the order of a step's term names, and every
  hint snapshot and the games' tests pass unchanged, because the expansion is
  the same statement. **What it cost the description: nothing saved.** Two
  games' diffs are +57/-71 lines with 26 of the minus in plants files; the
  `with` blocks run as long as the statements they replace, because the
  words (`unit`, `has`, `items`, `fillWord`) are most of a statement and are
  passed per technique. So the formula is supplied, and the words are not yet.
  Next: a game-level `nouns` block (what a unit, an item and the rest value
  are called, once) from which a kind builds its sentences, so that `with`
  shrinks to `group` and `set`; only then is a kind worth restating a game
  on. 2.1 stays open for ONE/PEER (Seismic or Map) and FIT (Sticks), which
  need the kinds that do not exist yet.
- [x] 2.5 (2026-11-17) The words said once: a game's `kindWords:` block
  (`rest`, `fill`, `has`, `restWord`, `items`, `fillWord`), which every placed
  kind reads for the parameters it takes; `with` is now `group`, `set`, `unit`
  and `terms`, and overrides. Norinori's two placements and Starbattle's four
  shrank from six-to-eight lines to three-to-five; the block is the words once.
  Norinori is the same size as before (its two placements share one block, so
  two uses do not repay it); Starbattle's four placements save 19-12 lines.
  **The words pay from the third placement on, and the kinds that follow
  (ONE, PEER, FIT) are where the count of placements is.** Same tests, same
  snapshots. Next: 2.1 on Seismic/Map (ONE/PEER), which needs those kinds.
- [x] 2.1 (2026-11-17) Restate three games on the library (proposal §
  "Before it starts" 2). Done: CNT (Norinori, Starbattle, 2.4-2.5), ONE/PEER
  (Seismic, Map; `one.cell` also in Rome and Subsets, whose `lone` is the same
  formula) and FIT (Sticks, all five techniques, `fit.flip`). **What moved:
  nothing a player sees.** Every snapshot, ladder and tier test passes
  unchanged, and `test:hint-sweeps` is green: the statements are the same, in
  the same order. Map's `placed` differs from before by the binding
  `n = value(c)`, so it was re-checked sound (the one recorded verdict that
  moved). **What it cost, in lines of the games' descriptions and plants:
  +50/-87.** `one.cell` is the clear win (the same four lines in four games,
  and no plant to write: 5 plants files shed theirs, Sticks' went whole, so
  the checker no longer needs a plants file). `peer.placed` saves little: the
  game's `peer` binder is the whole rule. **`fit.flip` finds the family kind
  holds only in part.** Sticks' five Checks share a shape, with `breaks` the
  negation of `holds`, so a placement is three lines for a six-line
  statement; but the five `says` blocks (the words, which are 80% of the
  technique) stay the game's, and the kind's plant is coarse (a value that
  keeps `holds` struck, caught at once) where the game's were off-by-one
  boundaries that test the technique's own edge. That is a weaker plant for the
  same technique: a game that wants the boundary plant states the technique.
  Not tried: ONE's second form (a value with one cell, `areaSingle`,
  `onlyCell`), whose scope differs per game, and PEER's other forms (`once`,
  `cull` over a unit); both need the same `peer`-style binder and would save
  as little.
- [x] 2.2 The owner's answer (2026-11-17): **aim strongly at all nine
  kinds, with the option to adjust course if what the work finds changes.**
  A game stating under 50% of its techniques itself is the bar they are happy
  with; the 61% covered leaves 39%. This change and
  `move-each-remaining-game-once` are one: a game moves once, onto the
  library and its words. Adjusting course is mine to do and record; a
  coverage that falls to about half, or a family kind that cannot be made
  to hold, is the sign to look again.
- [x] 2.6 (2026-11-17) REL, the support form: `rel.support` (a value of one
  end with no value at the other end it can stand beside is struck; `rel` is
  the relation over `d` and `u`). Placed on Subsets' `smaller`/`bigger` and
  Adjacent's `adjacentSet`: same snapshots and tests (the compiled sample
  differs by one renamed variable); Adjacent's verdict re-recorded. **Lines:
  games' descriptions and plants +36/-38, the kind +15: a net loss in lines**,
  with three plants files entries gone. Unequal's `sign` is not this form (it
  bounds by min/max, not by a pairing relation), so REL as counted is two
  forms, and the support form fits three techniques of 14. The plants are
  coarser (supported value struck) than the games' own boundary plants. This
  is 2.3's evidence again: the formula is cheap to supply, the saving is in
  plants and soundness, not in lines. Next: the bounds form of REL (Unequal
  `sign`) only if a second game states it; then GRP/LOOP/CMP/SUM, and the ask.
- [x] 2.7 (2026-11-17) LOOP, the early-close form: `loop.early` (an open
  edge whose ends the lines join is empty while `elsewhere` holds, the
  game's "something still needs the loop"). Placed on Loopy and Pearl
  `earlyLoop`: the statements compile identically (no snapshot moved, the
  recorded verdicts still match), and the kind's plant is the one both
  games had planted, so **no plant is weakened here**. Lines: games
  +12/-26, the kind +15, so net even at two games, and the kind repays from
  the third. Not placed: Tracks' `closeLoop` (a track never closes, so
  there is no `elsewhere` to drop and its plant differs), Loopy and Pearl's
  `closed`, Slant's and Rome's `loop` (each its own formula over its own
  notion of a loop). So LOOP as counted (12) is about four formulas, and
  this one covers two techniques.
- [x] 2.9 The owner's answer to 2.8 (2026-11-17): **go on, for
  consistency**: "It's very important for me that we make things
  consistent, avoiding any per-game idiosyncracies wherever possible."
  Lines saved are not the measure. A kind is judged by what the corpus's
  ~100 games still to be written get from it (a kind used by one game now is
  the first of many), and the kinds as a vocabulary are where under-explored
  ground for new games of our own will show. The plan they agreed: (1) every
  kind carries its sentence, the game giving only its nouns (`kindWords`);
  (2) the count kinds' contract (`need(S)`, `open(S)` over a set) becomes
  every counting game's, its own accessors (Loopy `need(f)`/`faceOpen`,
  Tracks `laid`/`undecided`, Boats `ships`) restated onto it; (3) the
  remaining forms of each kind added until its techniques are placed.
  Wording and a step's order may move; each game moved is deal-compared and
  walked.
- [x] 2.10 (2026-11-17) Done for `one.cell`: its sentence is the Latin
  library's `single`/`regionsFull` steps, now every candidate game's. Added
  `{be}` (the verb a value is taken by: Rome's "point") and a `regionsFull`
  wording that names the other values (`named`, the values as `struck`); the
  clause renderer takes a value that is a `ColorWord`, said whole, so Map's
  colors keep their per-scheme names. **Moved:** Rome's naked single ("…so it
  can only point right", was "must point"); Map's `lastDot` is the shared
  `single` ("Every other color has been ruled out in this region"), its
  `touchesTheRest` the named `regionsFull` ("This region's neighbors already
  hold pink, teal and violet, so it can only be yellow", was "touches"), and
  `deadDots` keeps its own look with the shared move. Both games run in the
  app, the sentences on the right regions. **Kept the game's own, with the
  reason beside it:** Rome's `regionsFull` (an edge square points fewer ways,
  so "every other arrow" would be false) and `hiddenSingle` (only an area of
  four holds every arrow, which the sentence must say); Map's `deadDots` look
  (the candidate walk strikes stale notes in a step of their own; Map's walk
  folds them in); **Subsets**, whose single is a set spoken letter by letter
  (each leg marks one letter), so no one-value sentence fits its step.
  Seismic already spoke the shared steps. Latin games' sentences unchanged.
  **Found for 2.11:** no game speaks a `lone` firing's `says`; every
  single is spoken by the game's walk (the candidate walk, Map's own), so
  the kind's sentence is the library step the walks share, not a `says` on
  the kind. Before writing a kind's sentence, find what speaks its firings
  (`describedFiringHint` reads `says`; a walk names a step).
- [x] 2.11 Then `peer.placed`, `rel.support`, `loop.early`, `fit.flip` the
  same way, each kind's sentence written once from the games' best wording.
  - [x] `peer.placed` (2026-11-17): its sentence is the library's `placed`
    ("The 2 just placed can't repeat in its {regions}", `placedRulesOut`),
    which Seismic and ABCD had each copied in words of their own. Seismic
    now speaks it, same text (no snapshot moved); ABCD's cull says "in its
    four neighbors" / "eight neighbors" (was "in any cell beside, above or
    below it"), seen in the app with the placed letter outlined. Map speaks
    no `placed` firing (its walk folds the strikes in). **Siblings placed
    in passing:** ABCD's `placed`, `placedDiagonal` (a variation's added
    technique: the loader now expands kinds there) and `single`
    (`one.cell`), Ascent's `once`, Magnets' `repel`: compiled modules
    unchanged, re-checked sound. **A plants file may sharpen a kind's
    plant** (it wins over the kind's), so ABCD and Magnets keep the
    diagonal boundary plant; 2.1's "weaker plant" cost for Sticks can now
    be undone the same way.
  - [x] `loop.early` (2026-11-17): the kind carries its sentence, "This
    edge would close the outlined line into a loop that leaves other lines
    out" (or `offWords`: Loopy "leaves the outlined clue unmet", Pearl
    "misses a pearl"); the games give marks and nouns only. Loopy's "the
    marked lines" became "the outlined line" (its own word for the dot and
    clue); Pearl's "Joining the ends of… with this edge would close a loop"
    became the shared shape, and its `earlyThrough` says the same ending.
    Seen in the app in both. **Found on the way:** a bare `{ring}` in a
    game whose ring is drawn on edges said "this square" (the game's noun);
    the engine now refuses a bare ring of another sort with no noun of its
    own (`ringNoun`), planted and seen to fail.
  - [x] `rel.support` (2026-11-17): the kind carries "{link} joins {cell}
    to {outline partner: its neighbor} with {none} {fits} {struckOr}", the
    shape Adjacent already had; the walk says the strike. Adjacent's bar
    case is unchanged; its no-bar case says "with nothing open two or more
    from 3" (was ", whose numbers all clash with 3"). Subsets' walk renders
    the compiled step with `statedParts`, keeping its marks (striped cell,
    outlined neighbor, the tally's sets outlined, the struck set ringed):
    "The horseshoe joins this cell to its neighbor with no smaller outlined
    set inside {A,B}, so {A,B} must go" (was "No outlined set is a smaller
    set inside {A,B}, so the horseshoe to the outlined cell rules {A,B} out
    of this cell"). Seen in the app in both. **Found:** a `{fit: …}` in a
    walk-spoken look is never tried (only `statedSentence` measures the
    whole sentence), so the no-bar form was shortened to stay under the
    limit; recorded in `docs/descriptions.md`. No verdict moved (the
    formulas are the same).
  - [x] `fit.flip` (2026-11-17): what the five share is the frame, not the
    look. The kind lays the game's `says` over `saysBeneath` (legs, and the
    move "{flipCell} must be {flipped}" with `flipTerms`), which Sticks names
    once in `kindWords`; each technique keeps only how the tried line breaks
    its rule, the part a family sentence cannot say for it ("Suppose …: it
    would break …" would drop the clue each look leads with, which is the
    point of Sticks' `unreachable` wording). Sticks' repeated clause pieces
    became phrases (`tried`, `here`). The compiled module is byte-identical
    to before, so nothing a player sees moved. Sticks' five boundary plants
    are back as sharpened plants, each caught at order 3.
- [ ] 2.12 Plan step (2), the count contract: `need(S)`/`open(S)` over a set
  for Loopy, Tracks, Boats, then `count.met`/`count.exact` placed there.
  Found 2026-11-17: Boats already defines `open(S)` (with `ships(S)` for
  what is held); Tracks defines `open(c)` as a square's open sides, another
  meaning under the contract's name, so it is renamed first (with
  `laid(L)`/`undecided(L)` restated as `need`/`open`); Loopy's
  `need(f)`/`faceOpen(f)` count over a face, not a set.
- [x] 2.8 (2026-11-17) **Asked of the owner, with 2.4-2.7 as the
  evidence; answered in 2.9.** 22 techniques are placed by
  kind, out of the 185 the clustering put in nine kinds. Each kind tried
  splits into several formulas: REL's support form fits 3 of 14, LOOP's
  early-close form 2 of 12. CNT (35) fits only where a game defines
  `need(S)` and `open(S)` over a set, which Norinori and Starbattle do (as of
  2026-11-17); Loopy (`need(f)`, `faceOpen(f)`), Tracks (`laid`,
  `undecided`) and Boats (`ships`) would have their defines restated first,
  which changes their other techniques too. The words stayed each game's in
  every kind. Measured: no player-visible change (no snapshot, ladder or
  order moved), the lines roughly even, and the plants the same or coarser.
  So coverage is heading well under the 61% counted and below the "about
  half" named in 2.2 as the sign to look again. What a kind buys is the
  formula, the plant and the soundness check written once. The question:
  (a) go on, restating each game's defines onto a shared contract so the
  kinds fit, for that saving at a hundred games; (b) stop here, keep the
  seven kinds for new games and archive, folding the rest into
  `move-each-remaining-game-once` with no restatement of old games; or
  (c) something else the owner sees. Recommendation: (b), because a new
  game written against the kinds gets the saving, while an old game's
  restatement buys no player-visible change and costs a soundness re-check
  each.
- [ ] 2.3 The first restatements are the evidence for whether the family
  kinds hold (FIT above all). 2.1's finding, 2026-11-17: the formula part of
  a kind holds and is cheap (`one.cell`, `fit.flip`), and the words do not
  shrink, because they are the game's. So the saving the change promised is
  the formula, the plant and the soundness check, **not the sentences**; at
  a hundred games the three of those are what it buys, and the words stay
  per game. Next: the catalog's one-formula kinds that remain (REL, LOOP,
  GRP, CMP, SUM, and the value-in-one-cell form of ONE), each placed on the
  games that state it, judged by the same two numbers (lines saved, plants
  kept or lost), and the ask to the owner of the proposal's § "Before it
  starts" 3 with this evidence once two more kinds are in.
