# Cuts: engine-candidate-hints

Requirements: 71 before, 69 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| The placement classifier takes any region list | duplicate | "A cell's regions are one definition per relation" (the classifier reads the declared regions) and "A candidate game's regions may come from a partition" (it names the region that forces a single); "A naked single shades its cell and a hidden single its region" has the narration |
| The premise audit checks its own instrument | process | `docs/method.md` § "Check the instrument before the finding" and § "Count what the check looked at"; "A guard runs the premise audit over every game on the walk" still ledgers a recording with no replay and a replay that tests no cell |
| The engine provides the pure plan helpers: the list of helpers (`nakedSingles`, `anyEmptyLacksNotes`, `nextPlace`, `joinNums`) | declared | The exports of `src/engine/candidate-hint.ts` (`joinNums` is `src/engine/hint-text.ts`'s); the one rule, that a `dup` elimination is not a firing to teach, stays as "A placement's bookkeeping is not a firing to teach" |
| The obvious-candidate cleanup is one strike step: "emitted by the shared `emitObviousCleanStep` so every game produces it identically" | how | Which function emits it; "The walk owns the setup" says the walk does it for every game |
| Plan continuity is measured over a derived population: "SHALL be keyed on the shape every entry into the walk shares, not on one entry point's name", and the scenario "the measured population survives a new entry point" | process | `docs/method.md` § "A scan that keys on a name"; `docs/games/hints.md` § "The row/column preset" ("Its population is derived, never declared"). The requirement keeps the population and the bound |
| A candidate hint plan continues from its latest steps where it can: scenario "a fresh plan opens where the rung order says" | duplicate | Restates the requirement's last clause; two scenarios remain |
| A value confined across several lines shows the lines: scenario "The premise the step marks is the premise the firing needs" | duplicate | "A recorded firing's premise SHALL name every cell its deduction reads" and "The engine audits a premise by replaying its firing" |
