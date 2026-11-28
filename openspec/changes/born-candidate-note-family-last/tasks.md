## Next

2.1c, the ID, with the mirrors drawn on a board of numbers. Undead's
answer gives a mirror one value, 4, and its painter (`fall`, `rise`) needs
its way; so the answer's mirrors become two values, `\` 4 and `/` 5, the
clue's meaning `value(at) = v + 3`. A board of numbers then needs
`play.given` (drawn by its painter whatever the preference; no key, no
keypad key, no note), and its domain differs from cell to cell at the
givens alone, which `play.ts`'s "the domain differs from cell to cell"
refuses today; `keypadTop` reads the domain off the params, where no
mirror is dealt.

## 1. Design

- [x] 1.1 The gap list and order of the five against this change's
      baseline, in design.md (§ "The gap list (1.1)", § "Decisions" 1
      and 2): Subsets joins, fifth.

## 2. The games

Each its own commit, as the predecessor's tasks 2 say (its tasks.md, in
the archive): each capability on a fixture first, then the flip with its
description, cases, spec deltas, `npm run flip`, `play-smoke`,
`compare-cost --quick --times 12` (an unsettled board on 100 seeds) and
`test:hint-sweeps`, and the guides updated for what it added (route
design.md § "What every group does"). In design.md § "Decisions" 2's
order.

- [ ] 2.1 Undead born. Read against `fd9ed95f9` (2026-11-28): met as
      `gaps.md` says, and also a clue at the board with fields (Boats'
      fleet, `tallying`), which the totals become in place of the three
      sizes, and `sample.build.first` for the mirrors.
  - [x] 2.1a A clue at the board derived from the answer, drawn as a row
        of counts beneath the board (`play.counts`, `totaling`); a flip
        difference: Undead drew its totals above. Seen in the app at 2.1e.
  - [x] 2.1b A board of numbers drawn as pictures (design.md § "Decisions"
        4), on `portraying`. For 2.1e to weigh: the keypad says G, V, Z
        where Undead's says Ghost, Vampire, Zombie.
  - [ ] 2.1c The ID: the totals, the mirrors' glyph stream, the
        sightings round the grid clockwise (`sides` with the bottom and
        left read backwards).
  - [ ] 2.1d The deal: mirrors first on a share of the cells, each one of
        the values its meaning allows at random; a sightline length bound
        and the build's settings by tier; a board refused for holding one
        kind of monster; Easy graded by a rung's passes; timed.
  - [ ] 2.1e The flip: words, cases, spec deltas, guides.
- [ ] 2.2 Crossing born.
- [ ] 2.3 Rome born.
- [ ] 2.4 Magnets born.
- [ ] 2.5 Subsets born.
- [ ] 2.6 Map born, with the space whose cells are a partition's parts.

## 3. Finish

- [ ] 3.1 The figures of `docs/descriptions.md` § "Judging a family moved
      onto its description", per game, against this change's baseline,
      recorded in design.md.
- [ ] 3.2 Update the guides for what the family added.
- [ ] 3.3 Commit, push, archive; mark the route's task 1.2 done.
