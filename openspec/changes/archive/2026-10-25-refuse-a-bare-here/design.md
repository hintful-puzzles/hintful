# Design: refuse-a-bare-here

## Context

`phrase` lints every literal segment and every string interpolated into it
(`UNBOUND` in `engine/hint-words.ts`), and throws on "this", "these" and the
role adjectives. A template's literals are fixed per call site, so one test
reaching a site checks it for good. `Narration.spansIn` already separates
plain runs from references. `testing/hint-reference.ts` refuses the same
pro-forms inside a pill (`PRO_FORM`); nothing refuses them outside one.

## Goals / Non-Goals

**Goals:** a bare "here" or a place-naming "there" cannot be written into a
hint sentence again, in any game, and every one written now is reworded.

**Non-Goals:** pronouns after a pill ("so it must be a line", "its line").
`docs/hints.md` allows a literal "it" after the reference, and the audit
found every pinned case had its antecedent pill. Refusal strings
(`hint-refusal.ts`) are not hint sentences and are not linted.

## Decisions

- **The lint, not a sweep.** Extending `UNBOUND` makes the rule unbreakable at
  every reached call site with no population to keep and no allowlist. A
  source-text regex would be a second copy of the lint and blind to
  interpolated strings. A walk-level check over plain spans was considered:
  on the 626 pinned sentences it found one true case beyond the lint, against
  about six false ones, so the unmarked-pronoun sites are fixed by hand
  instead (proposal, What Changes).
- **"There" is refused except as an existential.** `there (is|are|'s|would
  be)` is the existential and builds; every other "there" in the audit named a
  place. "There would" alone is not enough: "a bulb there would…" is the
  supposition this change refuses. If the gate finds an existential the
  pattern misses, widen the exception, never add a per-site allowlist.
- **Fix the template first.** The supposition shape spread from
  `skeleton/edges/hint-text.ts`, already fixed. The shared Latin `dup`
  sentence in `engine/hint-text.ts` is one fix for seven games.
- **`docs/hints.md` § "Bind the words to the marks"** gains "here" and
  "there" beside "this" and "these" in the sentence that says what throws.

## Risks / Trade-offs

- [A call site no test reaches throws in play] → the same exposure "this" has
  today; the hint-quality walk reaches every rung of every game, and the
  apply run must keep that true for each reworded site.
- [Rewording moves many pinned-sentence snapshots] → read each diff; only
  words may move, never which step or mark.
- [A rewording overruns 120 characters] → the length guard catches it; trim
  the premise, not the pill.
