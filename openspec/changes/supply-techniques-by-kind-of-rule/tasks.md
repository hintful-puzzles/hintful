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
