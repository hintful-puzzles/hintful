## Next

5.1, `docs/descriptions.md` gathered and the delta MODIFYING each main-spec
requirement that names an old key. Open: none.

## 1. Design

- [x] 1.1 The census, as queries in design.md § "The census": nine
      spellings, not eight, and the "two codecs" false.
- [x] 1.2 The decisions in design.md § "Decisions"; the one-user keys'
      own at 4.1.

## 2. Settings

- [x] 2.1 The `settings` concept in the schema, types and compiler; a
      kind's refusal named, so the refusal scan reads it.
- [x] 2.2 Each born game and fixture moved to it; IDs byte-stable.

## 3. One codec

- [x] 3.1 `params-codec.ts`' header: a setting kind's shape is its own
      segment beside the factories (Solo's symmetry, Boats' fleet).
- [x] 3.2 `digits`, `glyphs` and `codes` one stream, `parts` on its
      codes; `runs` kept (design.md § "One codec"); `after`, `also` and
      `glyphs`' requirements MODIFIED in the delta.

## 4. Keys and fixtures

- [x] 4.1 The one-user keys renamed or folded per 1.2; the hides one key.
- [x] 4.2 Fixtures renamed for their concepts: `fleet` is `tallying`,
      `killing` is `dividing`; `washing` is `play.wash`'s, a concept key.

## 5. Close

- [ ] 5.1 `docs/descriptions.md` describes settings and the codec once
      (2.1 renamed its keys in place; 5.1 gathers them in one paragraph).
      The delta spec MODIFIES each main-spec requirement that names an
      old key: `play.modifiers`, `play.sizes`, `play.blocks`, `play.tally`,
      `deal.options`, `deal.kindLetters`, `offFrom`
      (`git grep -nE` them in `openspec/specs/`).
- [ ] 5.2 `npm run test:hint-sweeps`; the app run on each born game whose
      Custom dialog changed, the differences a player sees listed here.
      Measured at 2.1 (2026-11-24, every field, default, preset and label of
      the ten games with settings, against HEAD): only the reorders of
      design.md § "Dialog reorder" — Mosaic, Solo and Unruly. The app run
      on those three is still owed.
- [ ] 5.3 Archive, and take the next change from
      `describe-the-whole-catalog` § "0. The refactor first".
