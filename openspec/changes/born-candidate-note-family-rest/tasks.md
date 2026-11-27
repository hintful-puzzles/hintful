## Next

3.1b, then 3.1a: the figures for Solo, ABCD and Salad are taken
(design.md § "The figures (3.1)"); Solo's deal passes the bar on four
menu boards, and Solo's and Salad's step changes are to explain: by rung
in design.md, Salad's `borderNear` and Solo's `intersect` to read on a
board in both trees. Then 2.4a.
Group's controls are answered: keep them, as engine capabilities
(design.md § "Decisions" 2).

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
- [x] 2.3 Salad born: a ruleset choosing kinds, the folded Latin square,
      the empty value and `O`, the ball weakened before it goes, the ID's
      slot order (design.md § "What each flip changed for a player").
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
  - [x] 2.3f The flip, its words, tests and specs, a ball's notes inside
        its ring, and the walk's hidden single in a line holding the empty
        square more than once: the commit that ticks 2.3f.
- [ ] 2.4 Group born: the letters relabeled about the identity, `i` after
      the tier, the hide's keep-set, an answer from shipped data, and its
      three controls kept (design.md § "Decisions" 2).
  - [ ] 2.4a A selection a drag makes in a shape, typed once as one move.
  - [ ] 2.4b A player's divider between two lines, saved as `done` is.
  - [ ] 2.4c A display order of a square's lines, dragged by a header;
        first, trace whether `Layout` and the target lookup carry it.
  - [ ] 2.4d Group's deal, letters and ruleset; then its flip.

## 3. Finish

- [ ] 3.1a Solo's deal back under 100 ms on its four menu boards past the
      bar, in the engine (design.md § "The figures (3.1)").
- [ ] 3.1b Solo's 434 fewer steps and Salad's 511 more explained, and
      Salad's fixed if each hint does less.
- [ ] 3.1 The figures of `docs/descriptions.md` § "Judging a family moved
      onto its description", per game, with `npm run compare-cost --
      --base <this change's baseline>`, recorded in design.md; each deal
      measured bundled, never under vitest.
- [ ] 3.2 Update the guides for what the family added.
- [ ] 3.3 Commit, push, archive; mark the route's task 1.2 done, or file
      the next part beneath it.
- [x] 3.4 Retire the candidate plan's own setup (`setUp`, `OwnSetUp`, the
      populate-only typing and its tests): the commit that ticks 3.4.
