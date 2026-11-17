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
- [ ] 2.1 Restate three games on the library (proposal § "Before it starts"
  2): one CNT-heavy (Starbattle or Norinori), one ONE/PEER-heavy (Seismic or
  Map), one FIT-heavy (Sticks). Deal-compare, walk the hints, report what
  moved.
- [x] 2.2 The owner's answer (2026-11-17): **aim strongly at all nine
  kinds, with the option to adjust course if what the work finds changes.**
  A game stating under 50% of its techniques itself is the bar they are happy
  with; the 61% covered leaves 39%. This change and
  `move-each-remaining-game-once` are one: a game moves once, onto the
  library and its words. Adjusting course is mine to do and record; a
  coverage that falls to about half, or a family kind that cannot be made
  to hold, is the sign to look again.
- [ ] 2.3 The first restatements are the evidence for whether the family
  kinds hold (FIT above all): do 2.1 before the catalog moves, and record
  here what moved.
