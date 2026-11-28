## Next

2.1d, the deal, on Undead's description (the `sighting` fixture deals no
mirror: `never: mirror`). Undead's answer becomes the `sighting` shape:
`\` 4 and `/` 5, the mirror clue's meaning `value(at) = v + 3`, the
domain `{d in range(1, 5) where (clue(mirror, c) < 0 and d < 4) or d =
clue(mirror, c) + 3}`, the mirror clue listed before `sees`. Then
`sample.first` with a value of several drawn at random. Upstream
undead.c's `new_game_desc` gives each square a mirror at 2 in 5, either
way alike, with no symmetry, and draws again where the monsters are four
or fewer or under 0.48 or over 0.78 of the squares; then the rest of
2.1d's list.

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
  - [x] 2.1c The ID: the totals, the mirrors, the sightings clockwise
        (`sides`, bottom and left backwards), on `sighting`; mirrors as
        values only the deal places (design.md § "Decisions" 5).
  - [ ] 2.1d The deal: mirrors first on a share of the cells, each one of
        the two mirror values at random (design.md § "Decisions" 5); a sightline length bound
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
