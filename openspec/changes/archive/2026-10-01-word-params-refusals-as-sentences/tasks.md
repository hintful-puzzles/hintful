## 0. Measure

- [x] 0.1 The census and the surfaces (proposal § "Task 0"). Taken 2026-10-01 by
      a scratch TS-API scan: 111 `return`s across 47 `validateParams`, plus
      Loopy's call into `gridValidateParams` (4 more) and `paramsError`'s three
      generated messages. Only Salad and Unequal ended in a full stop. 11 games
      have no `validateParams` and refuse only through `bounds`. Surfaces: the
      Enter Game ID dialog's callout and the Custom dialog's form-level error
      (`config.ts`, `part="error"`), both showing the string as it comes; the
      two `setParams`/`newGameFromId` throws in `context.ts`/`type-menu.ts` are
      developer errors for Sentry. The falsifier did not fire: the Custom
      dialog's error sits above the form, not beside a field.
      The midend's own game-ID refusals reach the same callout, so they
      changed too: no separator is now `DESC_MALFORMED`, and a params string
      the game cannot decode says so in a sentence. No registered game's
      `decodeParams` throws on garbage (57 games, ten malformed inputs each),
      so that arm is reached only by a codec bug.

## 1. Sentences

- [x] 1.1 `paramsError`'s generated messages; the tests that quote them.
- [x] 1.2 Every game's `validateParams` messages. Fragments rewritten to say
      what to change: Ascent, Clusters, Mosaic, Range and Undead's size
      refusals now name the product or sum and its limit; Blackbox, Map, Mines
      and Same Game's "too many" fragments name the relation; Cube's "not enough
      space" and Solo's "unable to support" likewise. Pearl's "Width or height
      must be at least six for Tricky" was false (a 6x4 board was refused); it
      now states the rule it checks, width plus height at least 11.
- [x] 1.3 The guard, by shape, with a vacuity count, proved to fail on a
      planted fragment. `params-refusal.test.ts`; planted a fragment in Mines
      (literal), `AREA_TOO_LARGE` (constant) and `gridValidateParams` (call),
      and all three were named; the test also carries a synthetic known positive
      for each route.

## 2. The dialog

- [x] 2.1 Delete `asSentence`; run the app and check a params refusal and a
      description error in the Enter Game ID dialog, and the Custom dialog.
      Checked in Chrome on Mines: `5x5n20#…`, `9x9n0#…`, `9x9:zz` and
      `nonsense` in Open a shared game, and 80 mines on 9x9 in Custom.
