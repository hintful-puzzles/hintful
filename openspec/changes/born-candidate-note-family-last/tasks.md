## Next

2.2f waits on the owner's answer to design.md § "Decisions" 7, and 2.4e
and the flip 2.4g on § "Decisions" 15 (the board kind its notes need);
Magnets' engine pieces are in (2.4a to 2.4d, 2.4f), so 2.5 Subsets goes
on meanwhile. Rome is born (2.3e). For 2.2f: the
draft's `play.along` gains `panel: { record: number, site: run }` and its
`words:` `value: digit`, which the panel's headings read, and
`src/games/crossing/numbers.ts` goes with the game. Also for 2.2f:
Crossing's draft techniques were checked sound with two records, which no
board answers (`docs/solver-and-generator.md`, the records bullet); check
them again, now a record a line. The draft deals once it has `play:` (with
`marks:` and the walk's steps, which its bespoke `steps:` then refuse until
restated, and `along:` with the hand-written keys `auto-advance` and
`highlight-runs`); its `blank` clue is then `play.given` at 10, painted
`wall`, as the `opening` fixture's. Weigh design.md § "Decisions" 8's two
hint behaviors there.

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
- [ ] 2.2 Crossing born. Read against `169596021`: met beyond `gaps.md`, a
      clue at the board (`play.counts`'s site beneath the board, its
      records in the ID's `numbers`) and values only the deal places
      (`play.given`, `sample.first`), which the walls take as value 10.
  - [x] 2.2a A list at the board read a binding (`deal.records`), written
        whole by `numbers`; `sample.uniform`, from 2.2c. On `listing`. For
        2.2c: see the records' segment refused anywhere but last.
  - [x] 2.2b The list drawn beneath the board, each record struck where
        the answer holds it and red where the rules break it; a hint's
        ring and outline on a record. In the app at 2.2f.
  - [x] 2.2c Walls dealt apart from the answer, opened until joined, and
        the ID's wall runs, on `opening` (`first.opened`, `spans`); open:
        design.md § "Decisions" 7, the owner's, which 2.2f needs.
  - [x] 2.2d Typing along a run, a record placed whole from the list, the
        runs washed (`play.along`, on `running`, design.md § "Decisions"
        8). In the app at 2.2f.
  - [x] 2.2e The Numbers panel: the list as a reference aid, searched and
        filtered by what fits the selection (`play.along.panel`, on
        `running`, design.md § "Decisions" 9). In the app at 2.2f.
  - [ ] 2.2f The flip.
- [ ] 2.3 Rome born. Read against `0a9b3969b`: met beyond `gaps.md`,
      picture notes (`numbers.pictures`, 2.1b), values only the deal
      places (`play.given`, the goal), and a wash behind a preference
      (`play.wash`, over open cells only).
  - [x] 2.3a Arrows and goals drawn as pictures, an arrow's note on the
        side it points (`Painter.points`, `Painter.note`), and a board
        always pictured where `pictures` names no preference. On `pointing`.
  - [x] 2.3b A value chosen by its way, dragged or keyed (design.md §
        "Decisions" 10), on `pointing`. In the app at 2.3e.
  - [x] 2.3c Washes behind a preference each, `play.highlights`, on
        `pointing` (design.md § "Decisions" 11). In the app at 2.3e.
  - [x] 2.3d A build's fallback value and its cap; a partition merged on
        the answer by its rules (`sample.fallback`, `deal.merge`, on
        `merging`, design.md § "Decisions" 12).
  - [x] 2.3e The ID (the walls, then the clue stream with `U D L R X`),
        read against what is met, and the flip (design.md § "Decisions"
        13; § "What each flip changed for a player", Rome).
- [ ] 2.4 Magnets born. Read against `7379eafb8` (design.md § "Decisions"
      14); its notes are the owner's (§ "Decisions" 15).
  - [x] 2.4a A domino tiling as a divide, a leftover square where the
        area is odd, and the ID's `pairs` segment, on `tiling`.
  - [x] 2.4b `per` of some values, laid at a line's two ends (`play.ends`),
        written a character a value (`alphabet`, `byValue`), on `ending`.
  - [x] 2.4c `play.whole` (any edit writes a part's other squares) and a
        `click` cycle by button, on `poling`.
  - [x] 2.4d Painters `plus`, `minus`, `neutral`, a tile's halves joined
        across its part (`joinsOf`), on `poling`.
  - [ ] 2.4e The notes, by the owner's answer to § "Decisions" 15.
  - [x] 2.4f A build's `count` first cells and `prefer`, on `poling`; `S`
        is `hide`'s `when`, as Boats'.
  - [ ] 2.4g The flip: the hint restated as `says`, cases, spec deltas,
        guides. In the browser: an empty tile drawn as the partition's
        pastel fill against upstream's rounded tile, and the hint's clicks.
- [ ] 2.5 Subsets born. Read against `0cb9604be` (design.md § "Decisions"
      16), each piece on the `holding` fixture.
  - [x] 2.5a The horseshoe painter, `shoe`, on `holding`. In the app at
        2.5e.
  - [ ] 2.5b A value drawn and played as its features over notes that are
        its candidates, full from the deal; the hint's strike given as
        letter presses where it is a union of letter halves.
  - [ ] 2.5c The band of every value: struck where placed, a spotlight, a
        strike from the cell in focus, and the keyboard into it.
  - [ ] 2.5d Every value once (the sample), and upstream's ID.
  - [ ] 2.5e The flip.
- [ ] 2.6 Map born, with the space whose cells are a partition's parts.

## 3. Finish

- [ ] 3.1 The figures of `docs/descriptions.md` § "Judging a family moved
      onto its description", per game, against this change's baseline,
      recorded in design.md.
- [ ] 3.2 Update the guides for what the family added.
- [ ] 3.3 Commit, push, archive; mark the route's task 1.2 done.
