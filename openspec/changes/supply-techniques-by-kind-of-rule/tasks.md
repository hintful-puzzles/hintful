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
  - [x] Not placed yet (both placed since, below), and why: **Mines** `alone` is narrated by its own
    `hint.ts` (rungs `satisfied`/`full`), so a count kind's sentence goes
    unspoken there, and its `open(c)` is over a square, not a set: restating
    it re-checks every Mines technique, whose `count` and `regions` take
    sharded hours (Magnets `count` and Undead `total` were placed on
    `count.value`, below); **Palisade**
    `numberExhausted` counts edges round a clue reached through `edge(c,
    y)`, so `open($set)` would need to be a set of edges; **Light Up**
    `square` is upstream's column scan, a dark square and a number
    interleaved, which splitting reorders; **Spokes** `saturation`/
    `exhaustion` carry `again`/`later` words the kinds lack (placed since,
    below, as was Boats `total`, its group the whole board).
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
  - [x] (2026-11-17) PEER's "no two touch" form, `peer.touch`: Range
    `besideShaded` (`adj4`), Star Battle `around` and Tents `nextToTent`
    (`adj8`, `square: blank(c)` for the trees). Its sentence: "No {piece}
    may touch the outlined {piece}{how}, so each ringed square {restWord}".
    A game's `says:` beside a placement is now laid over a kind's own
    sentence (it was dropped), so Range keeps its step a square (`shown:
    each`). Tents' own hint renders the compiled step with `statedParts`, so
    all three speak one sentence. Its `|S| > 0` guard went (a tent with no
    open neighbor fires nothing new). **Tents' walk moved steps** (8x8 Easy
    22 to 21, Normal 25 to 26, both solved): its `nextToTent` said `marks:
    {}`, so its facts had unknown parents in the fact graph; the kind's
    `reads` (the tent and its neighbors) give them parents, and the plan
    chooses on that. More accurate evidence, kept. **Moved, words only, in
    the other two** (same steps and rung counts): Range "No shaded square may touch the outlined shaded
    square, so the ringed square must be clear" (was "This square touches
    …, so it must be clear"), Star Battle "…the outlined star, even
    diagonally, so each ringed square must be empty" (was "these squares"),
    Tents "No tent may touch the outlined tent, even diagonally, so the
    ringed square must be grass" (was "Tents never touch, even diagonally,
    so every ringed square around the outlined tent must be grass"). Seen in
    the app in all three. Deal-compared at 3 seeds a preset: same boards
    and verdicts, totals 0.99× to 1.09×. Re-checked sound; the kind's plant
    (a neighbor's neighbor) caught on Star Battle, whose own plant it equals
    and which went; Range (diagonal) and Tents (two along a row) keep their
    sharper boundary plants, restated over the kind's `t`.
  - [x] (2026-11-17) ONE's remaining forms. `one.cell` is any thing down to
    one option, bound as `U`: it takes `group` (Crossing's run), `options`
    (Signpost's squares an arrow may lead on to, Dominosa's spots round a
    square, Crossing's numbers that fit) and `move`. `one.place` takes
    `may`, when a square may still take the value (Signpost's arrow into a
    square, Dominosa's open spot), its `value` now needed only where `may`
    or `move` reads it. **Placed:** Filling `onlyNumber`, Signpost
    `onlyNext` (compiled identically, no re-check) and `onlyBefore`,
    Crossing `onlyNumber` (its walk reads `K: U`), Dominosa `squareOnly`
    and `onlySpot`, Magnets and Undead `single` (`square: "true"`, `move`
    allowing a known square); Subsets `placed` on `peer.placed` in passing.
    Every game's own words stay (their walks speak these firings); five
    plants files shed the kind's plant; Signpost and Subsets keep their
    sharper ones, restated over the kind's names. **Found:** Dominosa's
    `onlySpot` read a domino with no spot left as a contradiction and was
    unsound (a checked board has such a domino with consistent marks), so
    its group reads only a domino with a spot left, as the stated one did;
    and its `spotsOf` is bound once in the group, which a second gather had
    doubled. **Moved: nothing.** Every game's tests and snapshots pass
    unchanged; deal-compare against HEAD at 3 to 5 seeds a preset gives the
    same boards and verdicts in all ten games, totals 0.94× to 1.06×
    (Subsets 1.15× on millisecond times). The binding `U` in the six games
    already on `one.cell` compiles to the same reads. Every changed
    statement re-checked sound (Signpost's `onlyBefore` held, as it was),
    each kind's plant caught. Seen in the app: Dominosa's and Signpost's
    walks. `test:hint-sweeps` green.
  - [x] (2026-11-17) GRP's wall-region forms, for a board divided by walls
    on its edges (Palisade, Separate). `region.apart`: two groups side by
    side that `apart` says can never be one region are walled on every edge
    between them; placed on Palisade `notTooBig` (too many squares),
    Separate `sharedLetter` and `walledApart`. `region.grow`: a group short
    of `size` whose every way out leads into one other group joins it,
    carrying its sentence; placed on Palisade `notTooSmall` and Separate
    `onlyWay`. Separate's `onlyWay` took only a group with one square left
    to grow into; it is now Palisade's wider rule, so **Separate's ladder
    reaches further**: deal-compare at 3 seeds a preset gives the same
    boards in Palisade and every Separate Easy preset, and 4 of 24 boards
    differ at Separate's Unreasonable presets (6x7, 6x8), verdicts the same
    on shared boards; totals 1.05× and 1.11× (noise). Separate's generator
    records which squares' letters a deduction read, so `region.apart` takes
    `more`, binders after the groups' (the shared letter `d` and its squares
    `x`, `y`). Separate's hint names its edges from `anchor`, as Palisade's
    does (was `side` or the stripes). **Moved, words only:** Palisade "…so
    the edge between them must be a wall" (was "this edge"; a firing now
    walls every edge between the two, which the later firings each walled);
    Separate "This region has 3 of its 4 squares and just one way left to
    grow" (was "The striped region … and one square left to grow into"),
    "…so these edges can't be walls" where it joins a region by several.
    Walk fingerprints: Palisade's same steps and rung counts; Separate's 4x4
    Easy the same 22 steps, one told as `walledApart` where it was
    `sharedLetter` (both fire there). Separate's help said the hint stops
    when no region has one square left; it now says one way left to grow.
    Found: a count in a kind's sentence is a `{numeral}`, for Separate says
    its values as letters ("has D of its E squares"). Re-checked sound, each
    kind's plant caught at order 3; Palisade keeps its `notTooBig` boundary
    plant, Separate its `sharedLetter` one restated over the kind. Seen in
    the app in both. Not placed, and why: Filling's `tooBig`/`noRoom`/
    `tooFar`/`onlyWay` are the same ideas over numbered squares, not walls,
    each its own formula; Galaxies' `separate` reads its arrows; Range's
    `cut` is connection, not size.
  - [x] (2026-11-17) CMP, `count.compare`: A needs at least `least` in its
    open squares, B holds at most `most` in its; A's own squares hold the
    difference, and where that is all of them they are filled and B's own
    cleared, in one firing (Mines' form). Placed on Mines `pair` and
    `regions` (the same formula with a region on each side) and Mosaic
    `compared`. Mines compiles to the same conclusions and keeps its own
    narration: **a kind's frame is now laid only under a game's `says`**, so
    a game whose hint narrates the firing takes no words. Mosaic's `more`
    arm now clears the other number's own squares in the same step (its
    `sameNeed` did it on the next pass, so the closure is the same): **the
    deal-compare at 3 seeds a preset gives the same boards and verdicts in
    both games**, totals 0.99× (Mosaic) after the kind reads `by` before
    making either set (making both for every pair doubled Unreasonable deals,
    1.8×). Mosaic's `fill` move takes a mark per square (a save written
    before reads as it did). **Moved, Mosaic:** rungs `compared.more`/`.same`
    (were `needsMore`/`sameNeed`); a step with both marks says "This 4 needs
    2 more shaded squares than this 2, so each ringed square outside the 2's
    block must be shaded, and each ringed square outside the 4's block must
    be clear" (`long:` on the arm: two moves, each placed), the rings in two
    colors as the sentence's chips; "same" says "…so each ringed square must
    be clear". The plan is shorter (671 positions walked for the pins, was
    738). Seen in the app: the step, applied in one move and one Undo, and
    shrinking to "the ringed square" when one is made by hand. Re-checked
    sound, the kind's plant caught in both; Mosaic's plants file went whole,
    Mines keeps its `regions` boundary plant restated over the kind's names.
    **Found on the way:** a placement's `says` was schema-checked before the
    kind's frame was laid under it, so an arm without `when` was refused;
    the expanded file is now checked again, which found the count kinds'
    arm `later` missing from the schema. **Not placed, and why:** Mines
    `region` states both orientations in one technique (`heavy`), which the
    kind would split in two and reorder; **Clusters** `countFull`/
    `countShort` are this kind with bounds (lo/hi) and a value per pair (`v
    in domain`, B's bounds counted in A's value), but its steps are `shown:
    each` with "{ring} must hold a {piece fill}", which the B side's cleared
    squares (the other piece) would contradict; it needs a fact-level
    wording first.
  - [x] (2026-11-17) A FIT form that holds across games, `fill.support`:
    a value no filling of a set that keeps the rule puts in a square is
    struck (generalized arc consistency). Placed on Keen `cage`, Towers
    `arrangement` (a square a firing, `each: "{q}"`) and Undead
    `sightline`; the game's rule sits in the filling's `where`, so the
    compiler still prunes part-fillings by it. Keen's module is
    byte-identical, Towers' and Undead's differ by renames and a no-op
    `if (!(true))`. Their sharper plants (Keen's repeat in a cage, Towers'
    count one off, Undead's ghost seen as a vampire) are restated over the
    kind. **In passing, on kinds that exist:** Solo `boxSingle`
    (`one.place`; its plant was the kind's and went); Norinori `partner`,
    Tents `tentLink`, Galaxies `soleOwner`, `onlyReach` and `exclave`, and
    Singles `boxedIn` (`one.cell`, a thing with one option left; every
    module differs from HEAD only in names and `<= 1` read as `< 2`; the
    plants that were the kind's went, Galaxies keeps `exclave`'s boundary
    plant); Singles `besideCovered` (`peer.touch`), which takes the kind's
    look and keeps its own move naming the ringed squares by number,
    restating its diagonal plant over `t`. **Moved, words only:** Singles
    "No shaded square may touch the outlined shaded square, so these
    squares (1, 3, 5 and 1) must be clear" (was "A shaded square
    (outlined) touches these squares …, so those squares must be clear"),
    seen in the app. Deal-compared against HEAD at 3
    seeds a preset (Solo, Towers, Undead): same boards and verdicts, totals
    0.95× to 0.98×. Not placed: Light Up `shine` (its `lights(c)` holds the
    bulb itself, and it runs on a placement; `peer.touch` reads neither).
  - [x] (2026-11-17) The room kinds, a FIT family over the game's
    `fits(S, n)` and `most(S, n)`: `room.needed` (a square without which a
    group has room for too few is filled) on Star Battle `neededLine`/
    `neededRegion` and Norinori `neededRegion`; `room.crowded` (a piece tried
    in a square rules out what `ruled` names and leaves a group near it too
    little room) on Star Battle `crowdedLine`/`crowdedRegion` (`act: touch`)
    and `starvedLine`/`starvedRegion` (`act: block`, with the group the star
    would complete as `cause`). Room is read with the tried piece placed.
    The kinds carry Star Battle's sentences; Norinori's `neededRegion` now
    says "This region needs 2 shaded squares as dominoes and without this
    square has room for only 1, given the outlined square" (was "Without
    this square, this region has no room for …"), seen in the app on its
    pin, and Star Battle's "room for 1 star, not 2" is "room for 1, not 2".
    All six plants were the kinds' and went. **In passing:** a wording a
    kind's parameters leave `when: "false"` is dropped as it expands (the
    `zero` wordings of Spokes, Unruly and Loopy left their modules; nothing
    else moved), and Star Battle's unused `own` define went. Deal-compare
    at 3 seeds a preset: same boards and verdicts in both games; Norinori
    0.99×, Star Battle deals 1.02× and solves 1.16× (4.1 to 4.8 ms mean,
    twice measured: the room is read under the tried star). Star Battle
    re-checked sound whole, every plant caught; Norinori's `neededRegion`
    sound. Walk fingerprints: the same steps and rung counts, Star Battle's
    words hash moved. **Not placed, and why:** Norinori `crowded` and
    `blocked`, whose room runs out beside the tried square's domino, not
    over what it rules out, so the kind's "would rule out {outline}" would
    name the wrong squares.
  - [x] (2026-11-17) CNT read of one value by its candidates,
    `count.value`: Magnets `count` (a line's poles) and Undead `total` (the
    board's monsters, `open` leaving out a square whose one candidate is the
    monster, `need` its `room(d)`), each the met and exact readings in one
    technique, as stated. No words: both games' walks speak them, so the
    games' `says` stand. The compiled modules count the open squares where
    they gathered them, and conclude the same; Undead's term `n` is still
    `holds(d)`. In passing, Boats `total` on `count.exact` (its group the
    whole board, `S = cells`, `marks: {}` so the board is not striped, its
    own sentence kept); its line terms (`line`, `number`) moved from
    `kindWords` into the two line placements, for they read `L`. The one
    difference: a finished board short of boats is now a contradiction
    where it fired nothing, as `count.exact` reads it elsewhere. All three
    plants were the kind's and went. Re-checked sound, each kind's plant
    caught at order 3. Deal-compare at 3 seeds a preset: same boards and
    verdicts; totals Magnets 0.81×, Undead 0.87×, Boats 1.06×. Every test and
    hint snapshot of the three games passes unchanged. CNT now 25
    placements in 12 games (`git grep "kind: count\." -- 'src/games/*.yaml'`,
    `count.compare` included).
  - [x] (2026-11-17) REL's bounds form: Unequal `sign` on `rel.support`,
    no new kind. Its group is each end of a sign in turn (`c in {big,
    small}`, partner `p`), `rel` "(c = big and u < d) or (c = small and u >
    d)". Its bound wordings stay the game's `says`: **a clause of a kind's
    sentence reading a word the game did not give is now left out** where
    the game gives its own `says`, so `rel.support`'s `link`, `cell`,
    `none`, `fits` became optional (a kinds test, and planted out Unequal
    fails to load). Striking an end's low (or high) values never moves the
    other end's bound short of emptying it, so the strikes are the same:
    **deal-compare at 3 seeds a preset gives the same boards and verdicts**,
    totals 0.95× deals, 1.11× solves (sub-millisecond). **Moved: a sign's
    two ends are two steps**, no longer one step and a continuing leg, same
    words; the plan places what it needs sooner (5x5 Normal #0 59 steps to
    58, one `lesser` and one `single` fewer, one `hiddenSingle` more; the
    other walks the same rung counts, reordered). Seen in the app: the
    larger end ("The outlined smaller side of this greater-than sign is at
    least 3, so this cell can only be 4 or 5"), then the smaller end's step
    on the same sign. Its plant restated over `c`/`p`, caught; re-checked
    sound.
  - [x] (2026-11-17) SUM, three kinds over a set of open squares and the
    `total` they make: `sum.last` (the one open square left holds what the
    total leaves), `sum.bounds` (a value the others' least and greatest
    cannot bring to the total is struck), `sum.sets` (a value in no set of
    different values that makes it is struck; upstream's reading). Placed
    on all five of Solo's cage readings, `cageSingle`, `cageMinMax`,
    `partMinMax`, `cageSums`, `partSums`; its `sums` and `beyond` defines
    went into the kinds, and all five plants were the kinds' and went.
    `cageSums` reads its sizes (none, or two to four) in its group's `where`.
    Solo's hint narrates its own steps, so the kinds carry no words and
    nothing a player reads moved. **Found on the way, a compiler defect:**
    `x in S` over a bitmask compiled to `(S >> x) & 1`, and a shift counts
    mod 32, so a number outside 0 to 31 read another bit (a cage's total
    less what is placed, 33, read as 1). The kind's `total in domain` had
    it where Solo's `t >= 1 and t <= w` had not. `maskHas` now guards it,
    in the compiler and the runtime's `has`; a test planted unguarded fails.
    A name drawn from a mask's members or a cell's candidates carries `bit`
    and takes no guard, so only derived numbers pay for it (17 modules
    differ from HEAD, each at such a read: a size, a value read as -1, a
    row index). **Measured:** deal-compare against HEAD gives the same
    boards and verdicts in Solo, Keen, Towers, Unequal, Map, Signpost,
    Crossing, Magnets and Salad; Unequal's solves first read 1.22×, then at
    8 seeds twice 1.01× and 0.97× (noise; its own module is unchanged).
    Every Solo technique re-checked sound (a define went), each kind's plant
    caught at order 3. `test:hint-sweeps` green. Seen in the app, 3x3
    Killer Easy: `cageSingle` ("its last cell must be 9"), `cageMinMax`
    ("its other cells leave no room for 7 or 9") and `cageSums` ("No way to
    make this killer cage total 6 uses 3 in this cell") speak and apply as
    before. **SUM is placed**: five of § 1's six; `regionRule` (a unit's
    sum less its whole cages, read across two rules) stays Solo's own.
  - [x] (2026-11-17) Dominosa `placed` on `peer.placed`: the kind takes
    `group` (what was placed, binding `c`: a spot holding a domino) and
    `move` (how a peer is left: the spot empty); its peers are the spots
    sharing a square with it and those of the same domino, one binder. A
    firing is now a peer, where it was the placed spot with every peer.
    Silent (`placed` says nothing), so no words; its plant restated over
    the kind's names, caught at order 4. Deal-compare at 3 seeds a preset:
    same boards and verdicts, 0.97×.
  - [x] (2026-11-17) Clusters `countFull` and `countShort` on
    `count.compare`, with two defines naming each tile's bounds for a piece
    (`fewest(t, d)`, `allows(t, d)`): countFull is A = b, B = a; countShort A
    = a, B = b. **What moved:** a firing now also settles the other tile's
    own squares (Mosaic's form), sound, so **1 of 30 boards differs** in
    deal-compare (6x8 Normal), the same verdicts on every board, totals
    0.70×. The hint stays a square a step, now `shown: legs`, its later
    squares quoting no count (a count the first leg's move has made stale on
    the board). The `{ring 1}`/`{ring 2}` move of the kind names squares by
    value, which Clusters' varying piece cannot use, so its arms give the
    move and read a fact term `own`: **the compiler now lets a one-square
    step's clauses read its fact terms**, as the renderer already merged
    them. Words (seen in the app): "The outlined dotted disc must touch
    three more blocks, and the outlined dotted block allows at most one
    block beside it, so this square, beside only the dotted disc, must hold
    a block" (was "The outlined dotted disc's last disc must also touch the
    outlined dotted block, so …"), a later leg "…and this square, beside
    only the dotted block, must hold a disc, for the same two outlined
    tiles". Rungs `countFull.more`/`.same`, `countShort.more`
    (`countShort.same` cannot hold: its group asks for an own square of A,
    listed unreached). Walk fingerprints: same steps and rung counts; the
    wide file was stale at HEAD and is rewritten. Help's Normal paragraph
    restated. Re-checked sound whole (defines added), both plants the
    kind's.
  - [x] (2026-11-17) GRP over numbered squares, the area kinds: `area.must`,
    `area.grow`, `area.over`, `area.short`, `area.far`, placed on all five of
    Filling's (`mustGrow`, `onlyWay`, `tooBig`, `noRoom`, `tooFar`). Not
    `region.grow`/`region.apart` generalized: a region of numbers grows by a
    number placed, and Filling's `tooBig` joins every region beside a square
    at once where `region.apart` reads two across an edge, so folding them in
    would weaken Filling or take every part as a parameter. The kinds read
    the game's defines (`alike`, `room`, `joins`, `grown`, `fresh`,
    `holding`), as the count kinds read `need` and `open`, and carry no
    words (Filling narrates by its reasons). **Moved: nothing.** The compiled
    module is byte-identical to HEAD, so no board, grade or hint can move;
    Filling's tests pass. Re-checked sound, each kind's plant (Filling's five,
    now the kinds') caught at order 3; Filling's plants file went whole.
    GRP's remaining techniques: Galaxies `separate` (reads its arrows), Range
    `cut` (connection, not size; placed below).
  - [x] (2026-11-17) GRP's connection form, `connect.cut`: Range `cut` and
    Singles `split`, one formula (a square whose loss would split the group
    that must stay one takes the rest value). Singles' now reads a set
    already apart as a contradiction, as Range's did: re-checked sound,
    the kind's plant (every open square read as a cut) caught in both, both
    plants files shed theirs. Deal-compare at 3 seeds a preset: same boards
    and verdicts, totals 1.03× (Singles) and 1.01× (Range). `test:hint-sweeps`
    green, walk fingerprints unchanged. **Moved, words only:** one sentence in
    both, "Shading this 4 would cut off some of the outlined squares around
    it from the rest, so it must be clear" (Singles, was "…cut some of the
    outlined squares off from the rest of the clear region"), "Making this
    square shaded would cut off some of the outlined squares around it from
    the rest, so it must stay clear" (Range, word order). Naming the group
    ("from the other clear squares") ran Range's sentence past 120
    characters, and dropping "around it" failed Range's test that every step
    ties its outline to the ring, so the group goes unnamed. Seen in the app
    in both, the ring and outlines where the sentence says.
  - [x] (2026-11-17) LOOP's closed form, `loop.closed`: Loopy and Pearl
    `closed`, one formula but for how a point's lines are counted (`lines`)
    and Pearl's pearls on the loop (`more`). Pearl's form taken, connection
    in the conclusion, so Loopy now reads lines closed into several loops as
    a contradiction where it fired nothing. Pearl's module is byte-identical;
    Loopy re-checked sound, the kind's plant (a loose end read as closed)
    caught in both, both plants files shed theirs. Deal-compare, Loopy at 3
    seeds a preset: same boards and verdicts, 1.01×. No words (neither game
    speaks it); Loopy's and Pearl's tests and `test:hint-sweeps` pass
    unchanged.
  - [x] (2026-11-17) LOOP's remaining formulas. Tracks `closeLoop` on
    `loop.early`, which gained `edge` (" and …", Tracks' side between two
    track squares, not shut), `leaves` (the loop's "that leaves other lines
    out", "" for a track that may never close) and nouns (`edgeWords`,
    `lineNoun`, `blockWord`); `off`/`offWords` became optional. The compiled
    module differs from HEAD only by `R` renamed `L` and a no-op `&& true`;
    Loopy's and Pearl's are unchanged. Tracks' line terms moved from
    `kindWords` into its two count placements, for they read the count's `L`.
    **Found:** the kind's plant drops `elsewhere`, which for Tracks is `true`,
    so the plant was the technique itself and the checker found it sound;
    Tracks keeps its own plant (any open side between track squares),
    restated over `L`, caught. **Moved, words only** (same steps and rung
    counts in the walk fingerprint): "This side would close the outlined
    track into a loop, so it must be blocked" (was "The outlined track
    already joins the squares this side separates, so crossing it would
    close a loop: it must be blocked"), seen in the app on an 8x8 Easy walk,
    the side ringed and the U of track outlined. **Slant and Rome `loop` are
    one formula**, a new `loop.never`: a value the game's `closes` says
    would close a cycle is ruled out (`values`, `more` binding Rome's `q`,
    `move` Slant's placing the other). Both modules byte-identical to HEAD,
    no verdict moved; each game keeps its boundary plant. LOOP now places 7
    techniques in 5 games (`git grep "kind: loop\." -- 'src/games/*.yaml'`);
    the rest § 1 counted there are read again in the recount below.
  - [x] (2026-11-17) Mines `alone` on `count.both`, its set `adj8(c)`.
    **The blocker was stale:** a check now stops at the order where its
    plants are caught (3 for every Mines technique), so restating Mines'
    defines re-checked all five in 54 s, not the sharded hours of order 4.
    Mines' `open(S)` is now over a set, as the count contract asks, and its
    number's squares `unopened(c)` = `open(adj8(c))`. Mines' hint narrates
    the firing, so the kind's sentence would be an unspoken second copy:
    **a placement's `says: false` places a worded kind without its words**,
    wanting only the parameters its formula and plant read (a kinds test;
    schema). The solver reads the squares from its group, not the binding
    `U`. Its plant was the kind's and went. Deal-compare at 3 seeds a
    preset: same boards and verdicts (Mines lays its board at the first
    open). Tests and snapshots unchanged; seen in the app ("The outlined 2
    already touches both its mines (outlined), so the ringed squares must be
    safe", on the right squares).
  - [x] (2026-11-17) Light Up `square` split as upstream's scan never was:
    `clueFull` (`count.met`), `clueExact` (`count.exact`) and `square`
    (`one.cell`, a dark square whose options are `open(lights(c))`). Its
    bulb-sees-bulb check went: the marks' seed refuses two bulbs that light
    each other, and `shine` strikes the rest. **Order:** read after the dark
    squares, the numbers fired on too few for the generator (it keeps only
    the numbers a reading fired on) to deal a 3x3 turned half round at
    Normal (none in 5M tries); read first, every tier cell deals. Recorded in
    `docs/descriptions.md` § "A statement's order is behavior". **Moved:**
    13 of 27 boards differ in deal-compare (3 seeds a preset), every verdict
    the same, totals 1.05× deals, 0.99× solves; the numbers a board shows are
    the same within noise (40 boards a preset: 7x7 Easy 5.70 to 5.72,
    10x10 Normal 12.75 to 13.03). Rungs `clueFull`/`clueExact`/`square`
    (were `square.clueSatisfied`/`.clueSaturated`/`.forcedLight`), the
    numbers before the dark squares in a walk (10x10 Easy #0 19 steps to 18),
    pins re-scanned. Words: "This 4 needs 4 bulbs and has only 4 free
    neighbors, so each ringed square must hold a bulb" (was "The outlined
    clue still needs 4 more bulbs and has exactly 4 free neighbors left, so
    each ringed one must be a bulb"), "This 1 already has its bulb, so each
    ringed square can't hold a bulb", "This 0 takes no bulbs" (was "The
    outlined clue is 0, so no bulb may sit beside it"). **In passing:** with
    `clueFull` its own technique, Light Up states `rulesOut` and its
    hand-written `ruledOut` went (its comment said it was hand-written only
    because the rule was an arm of `square`); seen in the app, a bulb crossing
    the other squares of the 1 and the 2 it completes. Re-checked sound
    whole, each plant caught. Seen in the app.
  - [x] (2026-11-17) **The recount.** Placements by kind (`git grep -hE
    "^[[:space:]]*- kind: " -- 'src/games/*/*.description.yaml'`) against
    § 1's labels: CNT 25 of 35, ONE 26 of 28, PEER 13 of 19, REL 4 of 14,
    LOOP 7 of 12, GRP 12 of 19, FIT 15 of 45, CMP 5 of 7, SUM 5 of 6: **112
    of the 185**. Of every game's 360 techniques, games state 201 (56%), the
    kinds place 112 and the Latin library 47; 20 of 48 games state under
    half of theirs. **The bar of 2.2 is not met yet**, and FIT is where the
    rest is: 30 left (Net's eight, Pearl's seven, Norinori's `crowded` and
    `blocked`, Keen's and Mathrax's clue checks), which placed would bring
    the stated share to about 48%. That is the proposal's § "A rule states
    how it breaks": the Check written once from each kind of rule's break
    clause.
  - [x] (2026-11-17) FIT's ways form, `ways.lock` and `ways.note`: a square
    whose sides are each a line or empty, and the game's `fits` (some way of
    the square keeping its rule has the side so, `@` the value, which the
    kind reads as 1 and 2 through a new `$fits[1]`). Placed on all eight of
    Net's (`fit`, `loop`, `seal`, `strand`, each a lock and a note, the pair
    sharing its group by anchor) and Pearl's `square`, `blackPearl`,
    `whiteTurnsOpposite` and `earlyThrough` (`every: exists`, deciding what
    it can where Net waits for one way left; `side`/`sides` for the square
    past a white pearl; `least: 1`). **Moved: nothing.** Both modules are
    byte-identical to before. **Found:** binding Net's `G` and `K` in the
    group, before the open sides, made every decided square walk the lines
    too (deal-compare against the commit before: solves 1.61×, deals
    1.27×), so the lock takes `reads`, what `fits` reads bound once a square
    has open sides. Net re-checked whole with `CHECK_AGAIN`, every plant
    caught. Both
    games keep their sharper plants; the kinds' own (a side both values fit
    read as a line) seen caught on Net's `fitLock` and `fitNote` with the
    game's plants taken out. Net's and Pearl's tests and snapshots pass
    unchanged. No words: both games' hints narrate these. FIT now places 27.
    Not this form: Pearl's `blackRunsOn`, `blackCannotRunOn` and
    `whiteCannotTurn` (a pearl's own geometry, read across two squares).
  - [x] (2026-11-17) PEER's pair form, `peer.pair` (a naked pair): two open
    squares down to the same two values, each the other's peer; a square
    seeing both loses them. Placed on Rome `pair` (module byte-identical; its
    plant was the kind's and went) and Map `pair` (its partners and peers as
    sets, the same pairs in the same order; re-checked sound, its sharper
    plant, any region read as a partner, restated over the kind and caught).
    No words: both walks speak it. Map's and Rome's tests pass unchanged.
    **Recount** (`git grep -hE "^[[:space:]]*- kind: " -- 'src/games/*/*.description.yaml'`
    against `^  - id: `): 126 placed, 182 stated, 47 by `use`, so games
    state 51% of their techniques; 22 of 48 games state under half.
    **Read and left the game's own, with why:** Mathrax's three `clue`
    readings (upstream's tier gates, `|M| < 2` and `constrainsEasy`, over
    a corner clue that mixes a parity rule with an arithmetic one); Keen's
    `cageEasy` (a value no filling puts anywhere in the cage, upstream's Easy
    reading, weaker than `fill.support` and stated by no other game) and
    `cageLine` (a cage meeting a line: two rules); Pearl's `blackRunsOn`,
    `blackCannotRunOn`, `whiteCannotTurn` (a pearl's own geometry across two
    squares); Path's and Spokes' `lineBreaks`/`pairBreaks`/`spareBreaks`,
    each a trial read by a break predicate of the game's own (`shortNear`,
    `brokenH`), which is where a rule's break clause would have to start.
  - [x] (2026-11-17) FIT from a rule's break clause, the reading: which rule
    each FIT technique left supposes broken.
    - **Path** `lineBreaks`, `pairBreaks`, `weighed`: the count rule (a
      square crowded, `lines > takes`, or short, `stuck`: more lines owed
      than live edges), the loop rule (`b in piece(a)`: a line joining its
      piece's two ends) and the number rule (`not meets(i, j)`). What broke
      is found twice: `brokeOf` (solver.ts) reads the witness for which, and
      `clashRead`/`clashTerms` (hint.ts) count it again for the words.
    - **Spokes** `lineBreaks`, `spareBreaks`: the count rule (`shortH`, a
      hub owing more lines than free spokes) and the connect rule
      (`sealedH`, a group of full hubs closed off); `twoOnes` is the connect
      rule's one case. The supposition is by hand (`H`, with `drawn`,
      `linesH`, `spareH` copies of the count rule's defines), because `with`
      places one element and `spareBreaks` places a set; and what broke is
      found a second time in TS (solver.ts' break finder, `trialBreaks`).
    - **Norinori** `crowded`, `blocked`: the domino rule (`lit = 1`) with
      the count read as room. **Pearl** `blackRunsOn`, `blackCannotRunOn`,
      `whiteCannotTurn`: the pearl clue's `means`. **Keen** `cageEasy`,
      `cageLine`, **Mathrax**'s three: a clue rule under upstream's tier
      gates.
    So the rules broken repeat (count, loop, connect, a clue's meaning), and
    what each game writes twice is not the trial, which is one `with`, but
    **what broke and its words**: each game finds it again in TS from the
    witness or the board.
  - [ ] The design, in this order (each a commit, each game moved
    deal-compared and walked and seen in the app):
    1. **`breaks:`, a rule's break clause with its words**: a named clause
       (`stuck(t)`, `closes(a, b)`) whose `when` is a define the
       techniques call, and whose `says` names what broke, its terms read
       at the witness under the supposition (hint path only), carried in
       the witness's def node.
    2. **`{broke}` in a look speaks the break that held** (the innermost
       break in the firing's witness), so Path's three Checks share one set
       of words and its `brokeOf`, `clashRead` and `clashTerms` go; then
       Spokes', its TS break finder going.
    3. **`with place(S, v)` over a set** (compiler, checker, interpreter,
       witness), so Spokes' `H` copies go and its breaks are the count and
       connect rules' own, read under the supposition.
    4. **A trial kind** once two games read their breaks the same way.
  - [x] (2026-11-17) Steps 1 and 2 on Path. `breaks:` (schema, `load.ts`'s
    `withBreaks`, `Description.breaks`): a break's `when` goes into
    `define`, and `{broke}` in a clause becomes `{if brokeCloses: … | …}`
    over the breaks the technique's formula reads, its terms added as
    `{ broke, term }`; the compiler reads them in the witness's def node,
    under the suppositions there, and `brokeAt` (runtime) finds the
    innermost. Path states `closes(i, j, c)`, `joins(c, i, j)` and
    `stuck(t)`; `lineBreaks` and `pairBreaks` say `{broke}`, and Path's
    `brokeOf`, `Broke`, `clashRead`, `clashTerms` and their crowd wording
    (which no firing could reach: `live` needs both ends spare) went.
    **Moved:** one pin's words, a Pairs join said lower number first ("join
    the outlined 1 to the 4", was "4 to the 1"), as Path's already were;
    walk fingerprints unchanged on both tiers; deal-compare at 3 seeds a
    preset: same boards and verdicts, 1.01× deals, 1.00× solves. Seen in
    the app on the pin's board (Pairs 5x5 Normal): the join and the dead
    end, outlines and tried edges where the words say. `weighed` keeps its
    TS clash reading (a set of pairs, no one witness). A new
    `path-witness` test (the square said is the witness's member) seen to
    fail with `sq` planted as a neighbor. Soundness re-checked.
  - [x] (2026-11-17) Spokes on `breaks:` (step 2's second game). `shortH(c,
    H)` (a hub left too few spokes, terms `starved`, `bn`) and `sealedH(c,
    H)` (a group closed off, `sealed`) are breaks; `lineBreaks` says
    "Drawing this line would {broke}", `spareBreaks` "Ruling this spoke out
    would fill the outlined 2 and {broke}" (was "leave the outlined 2 no
    spare spoke and …"; "and leave" ran it to 126 characters, and the help
    already says a hub is filled). Where the hub left short has the filled
    hub's number, a wording whose `when` reads the break's terms
    (`brokeShortH and bn = fn`) says "fill one outlined 4 and leave the other
    4 too few spokes", seen in the app with the two outlines and chips
    agreeing. **Gone:** `breakOf`, `SpokesBreakKind`, the firing's
    `hypothesis`/`filled`/`breakKind`, the hint's `trialBreaks` and
    `SUPPLIED` and every `supplied` term; the evidence hubs and the walk's
    `reads` come from the break terms. **Moved:** words (the "fill"
    sentence), and the hint-walk dump (24 boards, four shares each) has
    every walk ending the same, 4 boards taking steps in another order (one
    plan a step shorter): a Check now rests on the hub its witness held, not
    on the first starved hub in index order that the TS re-scan found. Walk
    fingerprint re-recorded (same steps and rung counts). Deal-compare at 3
    seeds a preset: same boards and verdicts, 0.96× deals, 1.03× solves.
    Re-checked sound, the same verdicts (`spareBreaks` held, as it was).
  - [x] (2026-11-17) Step 3, `with place(S, v)` over a set, so Spokes' `H` copies
    (`drawn`, `linesH`, `spareH`) go and its breaks are the count and
    connect rules' own, read under the supposition. The compiler reads a
    supposed set's members by `includes` (a `Supposed` carries `many`), the
    checker takes a set's member guards as the supposed cells', and a
    witness's `supposing` node holds the set. Spokes' breaks are now
    `short(c)` (`|free(c)| < n`, the rules' `free`, `lines`, `spare` read
    under the supposition) and `stranded(c)` over a new `group(c)`;
    `lineBreaks` and `spareBreaks` read `with place(e, 1)` and `with
    place(H, 1)`. **Moved: nothing.** Spokes' tests and snapshots pass
    unchanged; deal-compare at 3 then 5 seeds a preset gives the same boards
    and verdicts (deals 1.11× then 0.65×, solves 1.03× then 1.05×: noise).
    A compile test (a set supposed, a number refused); planting "only a
    set's first member is supposed" failed six Spokes hint tests. Re-checked
    sound whole (defines changed): the same verdicts, `spareBreaks` held as
    it was, but on 24 sampled boards in its two minutes where it was 64 (a
    supposed set is a guard per member in the checker's reads). Seen in the app (4x4 Normal): "Drawing
    this line would leave the outlined 4 too few spokes" and "Ruling this
    spoke out would fill the outlined 2 and strand the outlined hubs", the
    outlines on the hubs said. **Not moved, and why:** Bridges supposes at
    least `j` bridges on a line (`needAt(c, H, j)`), which leaves the line
    room for more and is no one value (`docs/descriptions.md` § "The formula
    syntax"). Step 4 (a trial kind) waits for a second game whose breaks
    read the same way.
  - [x] (2026-11-17) Boats' trials on nested `with`s and `breaks:` (step 2's
    third game). `broken(H, W, T)` supposes W (with H's open corners) water
    and H boat segments inside it (`tried`), and its breaks are the rules'
    own reads under that: `touching(a)`, `lineCount(L)`, `fleetCount(S)`,
    `overlong(a, T)`, `extra(m)`. `sh`, `closers`, `closes` and the `x not
    in W` copies went; the fleet count is `done(m) > boatsOf(m)` under the
    supposition, which fires where `|C| > boatsOf(m) - done(m)` did. **Found
    on the way:** a first restatement dropped the corner water from the
    lines `breaks` reads (a 9x9 Hard frozen board stuck); the corners now
    pass into `tried` as part of W. The three trials say `{broke}`, and
    `solver.ts` lost `classifyBreach`, `trialReason`, `breachTerms` and
    every supplied term and mark (the validator re-run, with its "segment"
    and catch-all words that no formula break matched). **Engine, in
    passing:** (1) a break's set the words draw in a role is in that
    role's mark (`drawBrokeSets`, `compile.ts`), so the step draws what
    broke and the walk's premise holds it; Path's and Spokes' modules gain
    an `outline` of their break sets, their tests unchanged. (2) **A compiler
    defect:** the witness inlined a definition by substituting its argument
    expressions, so `tried(H, W + corners, T)` re-read `not known(d)` inside
    the `with` and saw other lines than the solve; it now binds parameters
    by value, as `definitionCall` does (only Boats' module moved). (3) A
    firing whose witness holds no break throws on the hint's path, where it
    said the last break's words with empty terms ("more 0-boats"); planting
    the substitution back failed seven Boats tests on it. **Measured:** HEAD's
    and the new trials fire identically on 2,231 walk positions (0
    differences); deal-compare at 3 and 5 seeds a preset gives the same
    boards and verdicts, deals 1.3× to 1.5× (Hard presets 1.4× to 1.8×, all
    under 54 ms: the fleet count reads the whole board under the
    supposition; left, by the owner's 100 ms rule). Re-checked sound whole
    (a define changed), all 20, every plant caught at order 3. **Moved:**
    words, "If this square held a boat segment, there would be more 2-boats
    (outlined) than the fleet has" (was "it would make one boat (outlined)
    too many"), a line over its number "would have more than its 3 boat
    squares" (was "couldn't reach"), a boat "longer than any in the fleet";
    the middle segment's move says "the squares either side of it" where it
    rings both (was "the square to its right", wrong at HEAD too). The walk
    fingerprint: same steps and rungs, words hash moved; the wide file
    (stale at HEAD since the count words of 2.12) one Hard board 17 steps
    to 16 (one `lastWater` more, a `lineShips` and a `tooLong` fewer): a
    trial's premise is now the break's squares, not the validator's
    flagged ones, and the walk continues by it. `centerTrial` is now the hint's
    step on 1 of 8,554 positions (160 Hard boards), so its pin is kept by
    hand (a 7x9 Hard board five steps in), seen in the app: the striped row
    0 and both ringed neighbors where the words say. `test:hint-sweeps`
    green but for Boats' fingerprint, re-recorded. Step 4 (a trial kind):
    Path, Spokes and Boats read their breaks three ways (an edge tried, a
    set of spokes, boats and water by nested `with`s), so no shared trial
    shape yet.
  - [x] (2026-11-17) REL and PEER, what was left. **Placed, no new kind:**
    Light Up `shine` and Boats `touch` on `peer.placed` (group a placed
    bulb or segment, peer the squares it lights or touches diagonally, move
    `place(p, 2)`); Adjacent `adjacent` and Subsets `noShoeBeside` on
    `rel.support` with the partner known (`known(a)`, `|cand(k)| = 1`), whose
    one candidate is then the partner's value. Light Up's module is
    byte-identical; Boats' differs by its binder renamed `p`; Adjacent's and
    Subsets' loop over the known partner's one candidate where they read its
    value. Adjacent's plants file went (its plant was the kind's); Boats'
    and Subsets' sharper plants restated over the kind's names. Re-checked
    sound, every plant caught. Deal-compare at 3 seeds a preset: same boards
    and verdicts, totals Adjacent 0.99×, Boats 1.01×, Subsets 0.91×. Tests
    and snapshots unchanged; seen in the app (Adjacent 5x5 Normal: "No bar
    joins this cell to the 1 beside it: they can't differ by 1, so this cell
    can only be 3 or 5", outlines and ring where it says, applied as 3 and
    5). **Read and left the game's own, with why:** Singles `sameLine` is
    `peer.placed`'s formula, but a firing is a clear number with every copy
    (its hint rings them together and stripes the line), where the kind
    fires a peer, and Singles runs it as a rung, not on placing: placing it
    would split its hint steps. Singles `pair` and `sandwich` read two rules
    (all different and no two shaded touching). Magnets `pair` and `tile`
    are a domino's two ends read on placing and on striking, where
    `rel.support` is a rung reading every candidate, and `pair` places where
    the kind strikes. Subsets `carryIn` and `carryOut` are Easy letter-level
    projections of `smaller` and `bigger`, weaker and read first, and
    `noShoe` reads the clue alone. Rome `opposite` is a two-square cycle
    read through a pair. **Recount** (as before): 130 placed, 178 stated,
    47 by `use`, so games state 50% of their techniques; 24 of 48 games
    state under half.
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
