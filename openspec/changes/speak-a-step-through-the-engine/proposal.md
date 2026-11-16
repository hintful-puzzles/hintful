# speak-a-step-through-the-engine

First of the hint track the 2026-11-16 debrief set
(`archive/2026-11-16-state-hint-sentences-in-the-description/tasks.md` § 3).
It follows `generate-compiled-modules`.

## Why

The games whose sentences are the description's `steps` grew when they moved
(hand-written lines: Towers +74, Undead +78, Salad +215, Magnets +375), for
four reasons, each the engine's to mend:

- **Each `speak.ts` repeats one adapter**: about sixty lines of `contextOf`,
  `speak` and `looks`, with `as unknown as PlannedKind` casts, around
  `plannedSentence` and `statedParts`. Three ways to render a clause coexist
  (`statedParts`, `plannedSentence`, `statedSentence`).
- **The grammar has no reusable phrase.** Magnets writes its line phrase about
  eight times where the old code had one helper; Path and Boats write a
  sentence twice.
- **A `# supplied` term is a comment the compiler does not read** (132 over
  eight games at 2026-11-16). A term the game forgets speaks its placeholder,
  where the old function's typed argument would not compile.
- **A unit's name has no word.** "Row", "column", "block" or "diagonal" is
  nested `{if}`s over flag terms at every mention, which Solo and Rome would
  each write a dozen times.

The owner wants an engine interface that is consistent and easy to reason
about, and gives up per-game idiosyncrasy for it (2026-11-16). Wording is free
to change where the result is not significantly worse.

## What Changes

- **One engine call speaks a step**: a game passes the step's id, its terms
  and its marks, and gets the sentence, or the premise a strike's conclusion
  joins. The context (kinds by sort, value words, the noun) is declared once a
  game, not rebuilt per file. No game holds a cast.
- **A description names a phrase and a clause reuses it.**
- **A supplied term is declared**, and the compiled module types it, so
  leaving one out is a type error.
- **A unit term is said by its name.**
- **Towers, Undead, Salad and Magnets move onto it**, and a sentence of theirs
  that differs from the engine's only in style takes the engine's (Towers'
  naked set is one). Each changed sentence is listed in the change.
- **The hook lists of `describedEdgeHint` and `describedFiringHint` are read
  for what the adapter makes unnecessary** (`termAt`, `termKinds`, `terms`,
  `later`, `outline`, `elements` have one to three users each). A hook that
  goes is removed; one that stays says which games need it and why the shape
  cannot hold them.

## Before it starts

Read the four games' `speak.ts` side by side and write the call's signature
against all four before changing the engine. Solo and Rome are the next two
games; check the signature against their `hint-text.ts` as well, so the
adapter is not fitted to four games and bent by the fifth.

## Acceptance

The four games' word dumps before and after, the diff read and listed; each
read in the running app; their hand-written line counts against the ones
above.
