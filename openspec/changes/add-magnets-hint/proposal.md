# add-magnets-hint

## Why

Magnets is the deduction end's sharpest remaining instrument, and two things
about it are true of no other game in the collection:

- **Its solver calls `runDeductionFixpoint` twice** (`solver.ts:446` and
  `:533`), with ten rungs across the two ladders. Every other adopter has one
  call site. A hint has to produce one coherent plan out of two runner
  invocations, which is a direct test of whether the runner's contract composes
  or merely runs.
- **Its cells are tri-state** — `POSITIVE` / `NEGATIVE` / `NEUTRAL`, on
  **dominoes**, so a value in one half determines the other half. The candidate
  framework has never met a cell whose candidates are coupled to a specific
  partner cell.

Its ladder-equivalence test now exists (`certify-the-magnets-ladder`, archived
2026-09-10), which closes the one prerequisite the corpus audit flagged: the ten
rungs had no firing census, so nobody knew which of them the generator ever
reaches. That census is the first thing this change reads.

## The hard part, named up front

**Magnets' notes are negative, and the player can write only one of the three.**
The board carries `GS_NOTPOSITIVE`, `GS_NOTNEGATIVE` and `GS_NOTNEUTRAL`, but
the UI's flag cycle exposes `notneutral` alone (`index.ts`, the `"flag"` move).
So a deduction that concludes *"this half cannot be positive"* has **no notation
the player can record**, and the hint bar forbids drawing it anyway
(`AGENTS.md`, owner 2026-09-15: a hint relies only on marks the player can
make).

This is the Loopy situation, and Loopy is the worked precedent
(`add-loopy-notation`): where a tier's deductions need a kind of mark the game
does not offer, **give the player that notation and make the hint's steps place
those marks as moves** — and where a notation would genuinely be too hard to
manage, the fallback is the *tier*, not the hint.

So this change is two things at once, and that is deliberate: it is the
framework instrument *and* the second worked example of the notation rule. If
those turn out to be separable, split them; do not let the notation question be
quietly deferred, which is the failure mode the rule exists to block.

## What changes

1. **Read the census first.** Ten rungs across two ladders, and until
   `certify-the-magnets-ladder`'s test is read nobody knows how many the
   generator reaches. Narrating a rung no board needs is wasted; *assuming* a
   rung is dead without reading the census is the error this repo has made
   before.
2. **A notation for the negative marks the deductions actually produce**, or a
   stated reason a tier cannot be hinted honestly without one. The UI already
   has a flag cycle to extend; the question is whether three negatives are
   manageable for a player or whether the cycle becomes unusable.
3. **One plan across two runner call sites.** Whether the hint sees one ladder
   or two is the framework question. If `runDeductionFixpoint` needs a seam to
   compose, that seam is the change's main deliverable.
4. **Domino-coupled narration.** "This half is positive, so its partner is
   negative" is a sentence with a premise the player can see; "this column
   already has its two positives" is another. Both are Palisade-bar shapes —
   the bar is met by explaining the coupling, not by pointing at the cell.

## Refactor as you go

- **Two call sites in one solver is a shape, not an accident.** Before working
  around it, ask what a game would legitimately want to do differently
  (`AGENTS.md` § "Convention over configuration"). If the answer is nothing,
  the composition belongs in `runDeductionFixpoint`.
- **The flag cycle is a candidate for the engine.** Magnets cycles cell flags on
  a secondary press; several games cycle *something*. Take the population by
  reference before extracting, not by grepping for the word "flag" — a scan
  keyed on a name finds only what was named that way.
- **Tri-state candidates against `NoteEncoding`.** If Rome's arrows and Magnets'
  three states both need a bespoke encoding, that is two games' evidence about
  the abstraction and worth acting on.

## What this does not do

- **Not a rewrite of the solver's ladders.** The census exists to say which
  rungs matter; the ladders themselves are upstream's and are byte-match
  surface through the solver-gated generator.
- **Not a promise that every tier gets a hint.** If the top tier's deductions
  need a notation that would make the board unreadable, the honest outcome is
  that tier refusing and saying deduction has run out — which is a *result*,
  recorded, not a shortfall to call cosmetic.
