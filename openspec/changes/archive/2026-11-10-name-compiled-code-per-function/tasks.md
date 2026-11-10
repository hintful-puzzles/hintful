# Tasks

- [x] 1. `Out`'s fresh names are numbered per emitted function, the module's own names apart
  - `Out.own(owner, write)` numbers a function's names from the first and
    hands an enclosing function its count back, since a kept definition is
    compiled at its first call, inside the technique that calls it.
    `Out.fresh` throws outside any `own`, so a new emitter cannot fall back
    on a module-wide count without the compile failing.
  - Names that must not collide across functions are the ones a rung
    declares at the module's scope (`held`: a filling's and a projection's
    arrays, a set's stamps), which outlive its call. They are named after
    the rung (`Out.held`, `onlyWay_st3`), as its `Facts` and `Cands` were.
  - The kept functions (`edgeHoldsN`, `linkTermN`) keep the module's count,
    which is their key's. The recheck's counts of facts were named by the
    slot's module-wide sequence (`_m105_0`) and now take a fresh name of the
    function; the labels `rechecked` writes follow a binder's depth. The
    slot and block sequences stay module-wide and reach no text.
- [x] 2. A planted edit to one technique changes that function's text alone
  - Filling's `mustGrow` given one more conjunct: its function alone moved,
    in the module and in no other. Held by `compile.test.ts` § "a function's
    fresh names are its own", which fails on the commit before.
  - Recompiling twice leaves every module byte-identical.
- [x] 3. Every described game deals and grades as the commit before
  - `deal-compare` against `75cf0ca7`, all 61 described games at two deals
    a preset (1,122 boards): no board and no verdict differs, and each
    game's deal total is within the machine's noise (2026-11-10). Every
    module's diff, its names ending in digits reduced to a stem, is a
    renaming alone.
