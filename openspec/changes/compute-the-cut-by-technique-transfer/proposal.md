# compute-the-cut-by-technique-transfer

**Status: filed on the owner's word (2026-10-29), "keep iterating on it".**
The next step of the language investigation, archived as
`2026-10-29-investigate-a-language-for-puzzle-games` (read its `report.md`
first, then `theory.md`, `language.md`, `corpus.md` and `experiment-c.md`).

## Why

The investigation built a theory of puzzle games and a language over it,
and tried the language on 106 puzzles from outside the collection under a
test fixed in advance. The language stated the rules of 101. **It failed the
cut**: its variation table, which files a variation by the shape of what it
changes, put 15 pairs of puzzles on the wrong side of the line between "one
game" and "two" (`corpus.md` § "The result"). Ten of the fifteen are two
clue-free games that differ in one rule (Nurikabe and Mochikoro, Cave and
Range, N-Queens and Star Battle), which the table calls rulesets and a solver
calls two games.

The theory's principle, a ruleset keeps its game's techniques, called those
pairs right. What failed was the table's guess at it. The investigation's
checker can decide the principle directly: state each technique of one game
in the language, check it against the other's rules with a solver, and a
variation keeps its game's techniques when every one stays sound. It decided
Cave and Range correctly, after the test (`experiment-c.md`). This change
tests that fix the way the language was tested: on pairs fixed in advance,
with the result that would fail it written first.

## What Changes

Nothing in the app, the engine, the specs or the catalog. The change
produces, in its own directory:

- **The test, fixed first**: the pairs (the corpus's 15, the 23 game pairs
  `taxonomy.md` measured by rung overlap, and the catalog's own declared
  variations), the word each should get (a solver's judgment for the corpus,
  the measured overlap for ours), and how many may miss before the computed
  cut fails.
- **The techniques the pairs turn on**, stated in the language. The corpus's
  agents named the one each pair turns on.
- **The checker, extended** to the second version's constructs it lacks
  (bounded fillings, fixed points beyond connectivity), to quantify the
  binding inside one query, and to the rows the corpus found missing (an
  added move or finish in a planning game: ball sort's added tube, a closed
  knight's tour).
- **The run, and a report**: whether the computed cut passes, and if it does,
  the language with a computed cut to commit to and the catalog moves to
  propose, each as its own change.

## Impact

- The checker lives in the repository, outside `src/` (the investigation
  proposed `research/`), run by hand and not by the gate. z3 is a development
  tool and is never bundled.
- The notation stays the exploratory one; JSON or YAML with a schema is
  `build-a-game-from-its-description`'s to settle.

## Acceptance

The owner's: the report, and their decision on committing to the language.
