## Next

Tick 2.1 (Undead is born), then 2.2, Crossing (design.md § "Decisions"
2): read its `gaps.md` entry against the tree first, since Undead's flip
built a clue at the board drawn as a row of counts and picture names.
Crossing's list is that clue as a panel struck as used; its walls are
dealt apart from the answer. Split it into capabilities on fixtures, then
the flip, as 2.1 was.

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

- [x] 2.1 Undead born. Met beyond `gaps.md`: a clue at the board with
      fields (`tallying`) and `sample.build.first` for the mirrors.
  - [x] 2.1a A clue at the board derived from the answer, drawn as a row
        of counts beneath the board (`play.counts`, `totaling`); a flip
        difference: Undead drew its totals above. Seen in the app at 2.1e.
  - [x] 2.1b A board of numbers drawn as pictures (design.md § "Decisions"
        4), on `portraying`. For 2.1e to weigh: the keypad says G, V, Z
        where Undead's says Ghost, Vampire, Zombie.
  - [x] 2.1c The ID: the totals, the mirrors, the sightings clockwise
        (`sides`, bottom and left backwards), on `sighting`; mirrors as
        values only the deal places (design.md § "Decisions" 5).
  - [x] 2.1d The deal, upstream's, on `sighting` and the draft: mirrors by
        chance, keeps by tier, sightlines filled first, Easy's passes
        (`most`); timed in design.md § "Decisions" 6.
  - [x] 2.1e The flip: words, cases, spec deltas, guides; what it built
        beside is its commit's, what changed for a player design.md §
        "What each flip changed for a player".
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
