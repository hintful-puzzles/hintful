## Next

Salad (2.3): 2.3b, a clue kind dealt only on a ruleset's boards, then
2.3c to the flip, a capability a fixture each. Planned for 2.3b
(2026-11-27): a `gives: size` choice states the kinds it `deals`; one no
choice names is dealt on every board. `derive.ts` wraps such a kind's
derivation in a test of the size (added to the sizes read, so `Dealt`
holds it); `encodeDesc`/`decodeDesc` skip a segment whose kinds are all
off the board and a stream reads no code of an off kind (helper beside
`sizeChoices` in `params/settings.ts`); `choice.ts`'s `codesSegment`
writes a ruleset's code at its default too (Seismic's is `""`, Solo's
deal choice stays unwritten). On `emptying`: rulesets of its slot clue
and a ball. Open: Group's header
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
  - [ ] 2.3b A clue kind dealt only on a ruleset's boards: dealt, hidden,
        drawn and written there alone (the draft deals both kinds on every
        board), its ID segment neither written nor read elsewhere; and a
        ruleset's code written where the default's code is not `""`
        (Salad's `L`, which the draft leaves off).
  - [ ] 2.3c The empty value (the repeated one): typed by `X`, `-` and
        `_`, drawn as a cross, given or placed; its note an X. `O` (`+`,
        `=`): a square known to hold a value, not which, drawn as the ball
        a given ball is. Mark-all's and auto-pencil's reach of a placed
        empty square: nothing by its line until the line holds all its
        empty squares (`notes.ts` `reachOf` strikes every peer).
  - [ ] 2.3d The ID: Letters' `<border>,<grid>` and Numbers' `<grid>`;
        slots in the ID's order (top, left, bottom, right), a stream over
        slots; values written as the board draws them, letters under
        Letters and digits under Numbers (glyphs by ruleset, drawn, typed
        and said so too); the empty value's code `X` and the ball's `O`.
  - [ ] 2.3e The deal: no givens on a Letters board below 8x8; a given
        weakened to a ball before it goes (Numbers'); a board refused
        where a named part of the ladder finishes it (Numbers' empty
        squares alone); Normal refused for two symbols by size and
        ruleset; the menu's tiers by board. The draft's 8x8 rejects some
        8,000 draws with every clue shown: measure once 2.3b deals one kind
        a ruleset.
  - [ ] 2.3f The flip: the value's word by ruleset (letter, number);
        Salad's steps as `says` (a line with all its empty squares or all
        its symbols, a square with only the X left or no X, the border
        clue's two arms, a set holding a line's empties); soundness, tests
        to `cases.yaml`, spec deltas, the app run.
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
