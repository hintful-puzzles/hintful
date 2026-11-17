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
- [x] 2.12 (2026-11-17) Plan step (2), the count contract, and the count
  kinds' own sentence. **The contract:** every counting game defines
  `open(S)` over a set (Loopy and Tracks gained it; Tracks' square-sides
  `open(c)` is now `ways(c)`, and `undecided(L)` became `open(cells(L))`).
  `need` cannot stay over a set alone: Boats', Tracks' and Loopy's number is
  the line's or face's clue, which a set does not carry. So a kind's
  `need` is a parameter whose default is `need($set)` (Norinori, Star
  Battle); Tracks defines `need(L)`, Loopy keeps `need(f)`, Boats gives `v -
  ships(cells(L))` (its hidden numbers are read apart), Loopy's dot `2 -
  dotLines(c)`. Kinds gained `defaults` (`need`, `restMove`/`fillMove` for a
  game whose squares are only struck, Tracks', `mark`/`marks`, `zero`,
  `slots`), and `kindWords` gained `terms`. **Placed:** Boats `lineShips`,
  `lineWater`; Loopy `dotFull`, `clueFull`, `clueStarved`; Tracks
  `clueFull`, `clueExact` (CNT now 13 techniques in 5 games). **The
  sentence is the kind's:** "{unit} already has {has}", "{unit} takes no
  {items}" for a number of 0, "{unit} needs {n} {items} and has only {n}
  {slots}", and "{the ringed X | each ringed X} {restWord}". **Moved, words
  only:** every hint walk has the same steps and rungs, its words' hash
  alone moved; Norinori/Star Battle "already has", "the ringed square";
  Boats "takes no boat squares" (was "'s number is 0"); Loopy's clueStarved
  "This 3 needs 3 lines and has only 3 open edges" (was "Only 3 of this 3's
  edges aren't ruled out"); Tracks "This row already has all 2 track squares
  its clue asks for, the outlined ones" (was "By clue 2, this row's track
  squares are the outlined ones"), "needs 8 track squares by its clue and has
  only 8 open squares" (was "Clue 8 is the length of this row"). Seen in the
  app in Tracks, Loopy, Boats and Star Battle. Loopy and Tracks re-checked
  sound whole (a define changed); the five games' own plants for these
  techniques were the kind's plant restated and are gone.
- [ ] 2.13 Plan step (3): the remaining forms of each kind, until its
  techniques are placed. CNT first, the rest of its 35 (§ 1's table: Boats'
  `total`, Magnets', Tents', Light Up's counts, which are hand solvers or
  stated otherwise; find which are described before choosing; Tents'
  `open(L)` is over a line, not a set, and its `lineCount` a fit, not a
  count kind; Clusters' `countFull`/`countShort` look like CNT), then ONE's
  value-in-one-cell form, PEER's unit form (`once`, `cull`), REL's bounds
  form (Unequal `sign`), GRP, CMP, SUM. Each placed game is deal-compared
  and walked, and seen in the app.
  - [x] (2026-11-17) Unruly `lastGap`, `quota` on `count.met` (a line's
    quota is half its squares, `need` per piece d; `lastGap` is the same
    kind with its group narrowed to a line one short of the other piece).
    Found on the way: the cell-walk hint (`described-hint.ts`, Unruly's)
    always spoke a technique's first wording, and had no noun, so a kind's
    `{noun}` said "square"; it now speaks the firing's wording and takes
    `noun` (`WORDS.cell`). Words only moved: "This row already has all its
    blocks (outlined), so the ringed cell must hold a disc" (was "has all
    its blocks …, so this cell and the row's other empty cells must hold
    discs").
  - [x] (2026-11-17) Mosaic `alone` on a new `count.both`: met and exact
    as one technique, each number's two readings before the next's.
    Splitting it into `count.met` and `count.exact` moved its boards
    (`easyClues` hides the numbers the deduction never read, and which it
    reads follows the firing order; the tier test's kept-numbers margin
    failed). Five more games state the same interleaved shape (Mines
    `alone`, Magnets `count`, Undead `total`, Palisade `numberExhausted`,
    Light Up `square`'s clue arms), so the shape is the kind's. Moved:
    words ("This 4 needs 4 shaded squares and has only 4 open squares", was
    "needs all 4 of its squares shaded"; "This 0 takes no shaded squares",
    was "allows no") and the arm `needsAll`, now `exact`.
  - [ ] Not placed yet, and why: **Mines** `alone` and **Magnets** `count`
    are narrated by their own `hint.ts` (rungs `satisfied`/`full`,
    `count.full`), so a kind's sentence goes unspoken there until their
    hints speak the description; **Undead** `total` counts over candidates
    (`cand(c) = {d}`), not a set's open squares; **Palisade**
    `numberExhausted` counts edges round a clue reached through `edge(c,
    y)`, so `open($set)` would need to be a set of edges; **Light Up**
    `square` is upstream's column scan, a dark square and a number
    interleaved, which splitting reorders; **Spokes** `saturation`/
    `exhaustion` carry `again`/`later` words the kinds lack; **Boats**
    `total` is a count over the whole board, with no group to bind.
  - [x] (2026-11-17) `count.exact` counts its open squares (`m =
    |open($set)|`), as `count.both` does, walking them only in the
    conclusion. Norinori, Star Battle, Boats, Loopy and Tracks re-checked
    sound (the kind's plant caught in each), their tests and snapshots
    unchanged, and deal-compared against HEAD at 3 seeds a preset: the same
    boards and verdicts, totals 0.96× to 1.05× (noise). The compiler's
    growth line for these went from `n^0.5` to `n`: it now sees the line
    array the count walks, which the old copy through `_t` hid; the work is
    the same.
  - [x] (2026-11-17) Palisade `numberExhausted` on `count.both`: its set is
    the edges round a number (`set(edge(a, y) over y in adj4(a))`), its
    per-square `open(c)` renamed `ways(c)` and `open(S)` defined over a set
    (as Tracks did), `need` the number less its walls. The count kinds now
    carry `again: "{unit}"` (no game's walk spoke it before, so no other
    snapshot moved). **Found on the way:** the kind's "the ringed {noun}"
    said "square" on Palisade's edges; a ring's words that say `{noun}`
    are now refused like a bare ring where the ring's sort has no noun, and
    `describedEdgeHint` takes `ringNoun` (Palisade: "edge"). **Moved, words
    only** (same steps, same counts in the walk fingerprint): "This 0 takes
    no walls, so each ringed edge can't be a wall" (was "Clue 0 allows no
    walls, so none of its remaining edges can be walls"), "This 3 needs 2
    more walls and has only 2 open edges, so each ringed edge must be a
    wall", a later leg "…and these edges can't be walls either, for this
    0" (was "for clue 0"). Seen in the app. The rung is now
    `numberExhausted.met`/`.exact`; pins re-scanned. Palisade re-checked
    sound whole (a define was renamed).
  - [x] (2026-11-17) Spokes `saturation` (`count.exact`) and `exhaustion`
    (`count.met`), kept two techniques for `twoOnes` between them. Its open
    edges are not just the undecided ones (an edge to a full hub or across
    a line counts as closed), so its set is the edges to `free(c)`, a new
    define, and `open(S)` the undecided edges of it; `ways(c)` stays for
    its other techniques. `ringNoun: "spoke"`; the `rest` supplied hook and
    its own `later` went. The count kinds gained a `later` clause ("{the
    move} too", `restLater`/`fillLater` defaults a game may reword). **Moved,
    words only** (same steps and rung counts in the walk fingerprint, same
    boards in deal-compare): "This 5 needs 5 lines and has only 5 free
    spokes, so each ringed spoke must be a line" (was "The outlined hub has
    just enough free spokes left for its count, so these spokes must all be
    lines"), "This 1 already has its line, so the ringed spoke must be
    unused", a later leg "…and each ringed spoke must be a line too, for
    this 5". Seen in the app. Re-checked sound, the kinds' plants caught.
    CNT now 19 techniques in 9 games (`git grep "kind: count\." --
    'src/games/*.yaml'`).
  - [x] (2026-11-17) ONE's value-in-one-place form, `one.place`: a value
    its unit still owes with one open square left for it goes there. Placed
    on Seismic `areaSingle`, Subsets `onlyCell`, Ascent `onlySquare` and
    Rome `onlyHome` (whose `move` strikes the other arrows: its solver
    places only a square down to one). The kind counts open squares only
    (`not known(c)`), which Ascent did and the others left to their value
    filter; Subsets' "first of C not known" became a filter on the value.
    Three plants files shed the kind's coarse plant; Rome keeps its boundary
    plant (an area of three). **Its sentence is the library's
    `hiddenSingle`**, spoken by Seismic's walk through `narrateLatinReason`
    with the area as its unit. **Moved, words only** (same steps and rungs in
    the walk fingerprint): "No other cell in this area can be 5, so this
    cell must be 5" (was "the striped area"; still striped), seen in the app.
    Not Seismic's: Subsets' walk says a set's one home in its own words
    (letters, `hiddenSingle` in `hint-text.ts`), Rome's names the area of
    four (2.10), Ascent's places by its own route reasons. Deal-compared at 3
    seeds a preset: same boards and verdicts, totals 0.96× to 1.03×.
    Re-checked sound. **In passing:** `one.cell` takes `square` (which
    squares are read, `not known(c)` by default), and Ascent's `onlyNumber`
    is placed on it (`not known(c) and open(c)`), compiling to the same
    statement; Rome's `cull` is `peer.placed` (its plant, a placed arrow
    struck from its neighbors, kept), re-checked sound.
  - [ ] PEER's "no two touch" form, next: Range `besideShaded` (adj4), Star
    Battle `around` and Tents `nextToTent` (adj8) are one formula, a square
    holding `on` puts `off` in each open neighbor and none may hold `on`.
    What the kind must settle (read 2026-11-17): Range says it a square at
    a time (`shown: each`, "{ring} touches the outlined shaded square"),
    Star Battle all at once ("no star may touch the outlined star"), so
    one sentence moves one game's steps, to be walked; Tents' hint reads
    the terms `t` and `S` and fires only where `S`, its blank neighbors,
    is not empty, and its `blank` is not `not known` (trees), so check what
    a tree square reads as before placing it.
  - [ ] Next: the ONE, PEER, REL, GRP, CMP, SUM forms listed above, and the
    CNT techniques not placed yet (the item above says why each waits).
    ONE left: `one.cell` with a narrower square set (Ascent `onlyNumber`
    reads `open(c)`; Magnets and Undead `single` read known squares too, so
    a placed square with no value left is a contradiction there), Dominosa
    `onlySpot` and `squareOnly`, Crossing `onlyNumber`, Signpost
    `onlyNext`/`onlyBefore`.
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
