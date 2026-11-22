## 1. Design

- [x] 1.1 Per game, the gap list: what its description already states,
      what `fillGame` lacks to deal, draw and play it, its ID grammar, and
      how its saves are written. Write it in `design.md`, and set the
      order (§ 1). Written 2026-11-22. Undead and Magnets have candidate
      notes, so are not of this family.
- [x] 1.2 Ask the owner whether the games' saves break, with each game's
      cost from 1.1. The owner (2026-11-22): break them; and move Undead
      and Magnets to the candidate family's change.

## 2. The games

Each its own commit, with the hand-written game playing on until its flip.
Each flip runs in the app before it is done: a deal, input, hints, live
errors, dark mode, and a solve to the end. It lists the capabilities it
added here, lowers the `game-lines` ceiling, writes its spec deltas, and
runs `npm run test:hint-sweeps` before its commit. In design.md § 1's
order.

- [x] 2.1 Range born. Done 2026-11-22, 1,381 hand-written lines gone.
      Added, each the engine's: `play.bounds` (the sides' sum, product,
      shorter and longer, and a tier's own, refused as no such tier);
      `play.plain`, a number with no block (never faint, never counted,
      outlined as a square of the area and not circled; found in the app,
      where a number the step only passed through was circled as if it
      counted from it); `scatter.tried` and `scatter.joinedRest`
      (upstream's range.c); `deal.symmetric: halfTurn`, the hide and the
      search tier's strip in units of a clue and its partner; `digits`
      with `apart`, whole numbers and `_` between two side by side, and
      each kind's least value refused below (`deal.least`); the `cross`
      painter drawing nothing under a number. Differences a player sees,
      for consistency with the born games: `S` and `X` keys; two shaded
      squares side by side take a diamond, not a frame each; the number a
      step counts from is outlined apart in its words' color, where its
      digit was redrawn in the outline's ink; a 2x2 or smaller ID is
      refused on load too, where it was refused only when dealt.
- [x] 2.2 Star Battle born. Done 2026-11-22, 1,429 hand-written lines gone.
      Added, each the engine's: `play.sizes`, a size beyond the grid's that
      the params give, by its letter and one ruleset a value with its
      `least` board (the Custom dialog's game mode, `{{rulesets}}`, and a
      preset board's `8x8s2`); a square grid's one size field and
      bare-number ID, with no turned board; `deal.sample.lines`, a count
      to every row and column, none within `apart`; `deal.grow`'s `holds`,
      `smallest` and `parts` as formulas of the sizes (`growBy`), `closed`
      optional, and a desc with another count of parts refused; the `star`
      painter. Differences a player sees, for consistency with the born
      games: `S` and `X` keys; two touching stars take a diamond where they
      meet, not a red star each; a star grows as it is placed; the refusal
      of a small grid names the ruleset.
- [ ] 2.3 Clusters born.
- [ ] 2.4 Light Up born.
- [ ] 2.5 Sticks born.
- [ ] 2.6 Bricks born.
- [ ] 2.7 Pattern born.
- [ ] 2.8 Singles born.
- [ ] 2.9 Boats born.

## 3. Finish

- [ ] 3.1 Per game: lines removed against lines the engine gained, and
      capabilities added; deal and hint-walk CPU time against the
      hand-written game on the same boards (the pilot's method, in its
      archived `design.md` § "The figures (3.1)").
- [ ] 3.2 Update `docs/descriptions.md` and `docs/new-game.md` for what
      the family added.
- [ ] 3.3 Commit, push, archive.
