## Next

2.2b, ABCD's letters, then 2.2c, 2.2e and the flip (2.2f). Open: Group's header drag,
dividers and multifill, asked at 1.1 (design.md § "Open Questions");
2.4 waits for the answer.

## 1. Design

- [x] 1.1 The gap list and order of the nine, against this change's
      baseline (design.md § "The gap list (1.1)"; c398328d0).
- [x] 1.2 Split: Solo, ABCD, Salad and Group here; the other five in the
      successor (design.md § "Decisions" 1; c398328d0).

## 2. The games

Each its own commit, with the hand-written game playing on until its flip,
and each capability built first on a fixture description of its own, in a
commit before the flip. A flip: its description, every technique checked
sound, its tests in its `cases.yaml`, its spec deltas; `npm run flip --
<game>` reports what it has left (the `game-lines` ceiling, citations of
its deleted modules, snapshots, guard lines naming it); `npm run play-smoke
-- <game>`, and its variants by `--type`, play it in the browser, the
screenshots looked at (live errors and the modes by hand); `npm run
compare-cost -- --base <the commit before> --quick <game>` counts its cost;
`npm run test:hint-sweeps` before its commit. Its commit lists the
capabilities it added, each with its concept; design.md § "What each flip
changed for a player" gets its line. In the order task 1.1 set.

- [x] 2.1 Solo born: f40732022, 810b4009e, 96c15ac59, c7522031d,
      6eeebdcc6, 7ac27c7cf, dcb4d60ea; the flip 13f27ca01; 98b5275e2.
- [ ] 2.2 ABCD born: the number size, letters, the walk with no region, a
      clue per value derived, written and drawn in a margin, corner
      crosses, `D` and `R`. A draft of its born description
      (`abcd-born-draft.yaml` here, game `abcdborn`, compiled as a fixture
      under `src/engine/testing/fixtures/abcdborn/` while it is worked on,
      and removed at the flip) compiled 2026-11-27 and, after 2.2a, deals
      every menu board in upstream's ID format; what it refused is each
      sub-task.
  - [x] 2.2a A number size and a clue one a value dealt, written and read,
        on the `counting` fixture.
  - [ ] 2.2b Letters: values drawn, typed and said as letters from A,
        digits their aliases (`play.numbers.letters`).
  - [ ] 2.2c A clue one a value drawn in a margin as deep as the values,
        each heading a value, marked done, struck as a hint reads it, and
        in the text format.
  - [x] 2.2d The walk with no unit, on the `counting` fixture; ABCD's
        `satisfied` and `runs` as `says` are the flip's.
  - [ ] 2.2e Bounds: Unreasonable refused on a board of nine squares or
        fewer unless `R` hides clues; five letters or more under the
        no-diagonal rule (a modifier's bound on a size). Corner crosses
        drawn under the no-diagonal rule.
  - [ ] 2.2f The flip: `says` restated, soundness, tests to `cases.yaml`,
        spec deltas, the app run. For the player: the Custom box is "No
        diagonal touching", on for the rule, where upstream's "Allow
        diagonal touching" was on without it (consistency with every other
        modifier); 6x9 with 3 letters is on the menu's grid at both tiers,
        where it was an Easy variant.
- [ ] 2.3 Salad born: a ruleset that chooses kinds and segments, the
      folded Latin square, the empty value and `O`, the ball weakened
      before it goes, the ID's slot order.
- [ ] 2.4 Group born, after the owner's answer (design.md § "Open
      Questions"): the letters relabeled about the identity, `i` after the
      tier, the hide's keep-set, an answer from shipped data.

## 3. Finish

- [ ] 3.1 The figures of `docs/descriptions.md` § "Judging a family moved
      onto its description", per game, with `npm run compare-cost --
      --base <this change's baseline>`, recorded in design.md; each deal
      measured bundled, never under vitest.
- [ ] 3.2 Update the guides for what the family added.
- [ ] 3.3 Commit, push, archive; mark the route's task 1.2 done, or file
      the next part beneath it.
