# Cuts: engine-helpers

Requirements: 21 before, 19 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "The class SHALL support `constructor(n)`, `reinit()`, `canonify(i)`, `merge(a, b)`, `size(i)` … and `equivalent(a, b)`" (The engine provides a shared disjoint-set forest (dsf)) | type | The `Dsf` class in `src/engine/dsf.ts` declares each method. The requirement keeps that a game imports it and holds no copy. |
| "with path compression and union by size" (same requirement) | how | Which union-find the class is; its header comment says it. |
| Scenario "Size and equivalence reflect merges" (same requirement) | particular | What `size` and `equivalent` mean is their names; only `dsf.test.ts` consults it. |
| "Tarjan's bridge finding, non-recursive linked-list form" (The engine provides a shared loop-finding helper) | how | The algorithm; the header of `src/engine/findloop.ts` says it. What a loop edge and a bridge are stays. |
| The catalog check runs ahead of the documentation-only shortcut | duplicate | Merged into "The engine catalog names every shared helper there is", as a sentence and with its scenario. |
| A timing comparison warms every arm and carries a control | process | `docs/games/testing.md` § "Timing anything under vitest: two things to know first": warm every arm before the clock starts, rotate their order, report the minimum beside the median, against an A/A control; and a control needs a warm-up, not two module instances. |
| Scenario "A desc codec reads a number the same way" (A game reads a digit run with the shared parser) | duplicate | Restates its requirement, which names a game description; "No game declares a copy" stays. |
