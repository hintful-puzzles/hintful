## Next

Salad (2.3): 2.3f, the flip, on the draft as 2.3e left it (its deal
deals every menu board at its tiers, 2026-11-27).
Open: Group's header
drag, dividers and multifill, asked at 1.1 (design.md § "Open Questions");
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
- [x] 2.2 ABCD born: e9a8e85bb, d67aebdd0, ddad4fa63, 0da94ca05; the
      flip, the commit that ticks 2.2 (design.md § "What each flip changed
      for a player").
- [ ] 2.3 Salad born: a ruleset that chooses kinds and segments, the
      folded Latin square, the empty value and `O`, the ball weakened
      before it goes, the ID's slot order. A draft of its born description
      (`salad-born-draft.yaml` here, game `saladborn`, compiled as a
      fixture under `src/engine/testing/fixtures/saladborn/` while it is
      worked on, and removed at the flip) compiled 2026-11-27 and, after
      2.3a, deals every menu board; what it refused or dealt wrong is each
      sub-task. The ruleset stays a size the params give (`mode`, Seismic's
      way), which the rules may read.
  - [x] 2.3a A value a unit holds more than once, counted by the marks; a
        Latin sample folded to the domain; a derived clue reading a size.
  - [x] 2.3b A clue kind dealt only on a ruleset's boards, its ID segment
        neither written nor read elsewhere; a ruleset's code written at its
        default (Salad's `L`).
  - [x] 2.3c The empty value (`play.numbers.empty`): typed by `X`, drawn
        as a cross, noted as an X; `O` strikes it from the notes, drawn as
        a ball; its reach waits for a line's every copy.
  - [x] 2.3d The ID, and values drawn, typed, said and written by
        ruleset: the commit that ticks 2.3d.
  - [x] 2.3e The deal: givens whole by ruleset, a ball after its number,
        `refuse` on the empty squares, Normal bounded by ruleset and size,
        the menu's tiers: the commit that ticks 2.3e, with its figures.
  - [ ] 2.3f The flip: the value's word by ruleset (letter, number);
        the words of the draft's `emptyLine` and `emptySquare`, which 2.3e
        added for its `refuse`, and the hint's order with them before the
        Latin singles;
        Salad's steps as `says` (a line with all its empty squares or all
        its symbols, a square with only the X left or no X, the border
        clue's two arms, a set holding a line's empties); soundness, tests
        to `cases.yaml`, spec deltas, the app run. In the app, look at a
        ball holding notes (the note grid is the square's, not fitted
        inside the ring as upstream's). What 2.3c changed for a player, for
        design.md: the cross is the engine's, half a square wide, where
        upstream's spans it; a ball is a ring, unfilled; `O` on a square
        holding a value types nothing, where upstream empties it into a
        ball; a ball is a note, so Undo, Clear and mistakes treat it as
        one; a placed number is drawn without a ball round it.
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
