# share-the-hint-position-scan

**Status: built (2026-10-04).** What was found and decided is `design.md`. A
follow-up from `strengthen-the-sokoban-solver`.

## Why

A hint test needs a board on which each sentence, rung or mark fires. Games
find one by scanning hint-guided play over fixed seeds, and each has written
that scan for itself (read 2026-10-04):

- **Scanned on every run**: Galaxies (`firstStepMatching` over `SCAN_SEEDS`,
  `galaxies-hint.test.ts`), Clusters (its own loop over `SCAN_SEEDS`,
  `clusters-hint.test.ts`), Palisade (`equivalentEdgesFrame`,
  `palisade-render-scenario.test.ts`), Dominosa (`dominosa-hint.test.ts`).
- **Scanned once, the result pinned as a desc, and the scan thrown away**:
  Sokoban, Pegs and Rect. Their headers say the pins were "found by a
  fixed-seed scan", and no such scan is in the tree.

The second kind is the right shape for a test (an input pinned, never a seed:
AGENTS.md § "Method") and the costly one to maintain. When Sokoban's search
changed, five pins and one cycle board stopped firing, and the scan had to be
written again from the test's regexes, then deleted again. The next change to
any of those three hints pays the same.

A list of files matching the phrase is not the population. Take it by reading
which hint tests reach a position by walking seeds.

## What Changes

A harness in `src/engine/testing/` that walks hint-guided play over fixed
seeds for a game and reports, for each named predicate over a step, the first
position it holds on (as `params:desc`) and how many positions it held on out
of how many were walked. The count is the power argument a pin owes. A test
either calls it live or pins what it reported, and a pin that stops firing
says which command finds it again.

What stays the game's: the predicates, which are about its sentences.

## Hints to pull in

**Flip** (`add-flip-hint`). Its hint is new, its sentences are few, and each
will need a position: writing its test against this harness, with no scan of
its own, is the assessment. If Flip's test is no shorter or no clearer for it,
the harness is not worth having.

## What would show it worked

Flip's hint test pins its positions through the harness and carries no scan.
Sokoban's six pins are found again by one command. One of the games that
scans on every run is moved onto it without losing a case.
