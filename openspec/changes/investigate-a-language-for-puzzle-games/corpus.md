# The corpus test

Step 4 of `tasks.md`: the language (`language.md`) tried on about a hundred
puzzle games from outside the collection, before anything is committed to.

## The test, fixed before the corpus was collected

Written and committed 2026-10-29, before any outside puzzle was chosen. The
commit that adds this section has no corpus in it.

**Each puzzle gets exactly one verdict:**

- **Described well**, when all of these hold:
  1. **Every rule is stated in the language**: the answer shape, every clue
     kind's meaning, every goal predicate and the freedom, as blocks of
     `language.md` § "The shape of a description", using the core logic and
     the library. No rule is left as prose or as a comment standing in for a
     formula.
  2. **Its variants are placed by the theory's words**: each variant the
     source names gets the word the language computes (board shape, modifier,
     ruleset, generator setting, size, or a separate game), and the word is
     one a reader of `theory.md` would accept.
  3. **The cut decides each pair**: where the puzzle is close to another
     (in the corpus or in our collection), the language says whether they are
     one game or two, and in which family, from the descriptions alone.
- **Described with an extension**, when it is described well after one or
  more **library additions**: a named space, predicate or function defined in
  the core logic. Each addition is listed with its definition.
- **Not described**, when it needs a change to the **core**: a new kind of
  block, a new kind of freedom, a logic the core does not have (beyond
  first-order logic with counting, aggregates and transitive closure), or a
  rule that cannot be stated at all. Each is listed with what was missing.

A library addition that is no more than a renamed rule ("`kurodoko_ok`") is
not an extension; it is a rule left as prose, and the puzzle is not
described.

**Techniques are not part of the verdict.** Most outside puzzles have no
technique ladder written down, and the corpus test is about the rules and the
cut. A puzzle whose source names techniques gets one or two of them stated,
as a check that the technique form holds outside the collection, and the
result is reported apart.

**The sample.** About a hundred puzzle games, none of them in the
collection under any name, chosen to span the families and the kinds of
freedom, from at least four kinds of source: a pencil-puzzle genre list
(puzz.link, Nikoli, Janko), a puzzle publisher's list (Conceptis, Puzzle
Square), a list of planning and movement puzzles (PuzzleScript's gallery,
Hearn and Demaine's catalog), and the prior art's corpora (Ludii's puzzles,
Demystify's models, pzprjs's variants). They are chosen before any is
described, and none is dropped after.

**What fails the language.** The language is not committed to if any of
these hold:

- **fewer than 75 of the puzzles are described well or with an extension**;
- **more than 10 need a change to the core**;
- **the library additions are not few and shared**: if more than half the
  puzzles described with an extension each need an addition no other puzzle
  uses, the library is a list of rules, not a vocabulary;
- **the cut fails**: two puzzles a solver of both would call one game are
  computed to be two, or the other way round, in more than 5 of the pairs
  examined, and the theory cannot say which part makes the difference.

A pass on all four is what "described well" means for committing. A pass on
some is reported as such, with what would have to change.
