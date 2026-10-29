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

## The corpus

`corpus-list.md`, 106 puzzles in eleven families, collected 2026-10-29 by an
agent that read only § "The sample" above and never the language, and
committed (`683b4bf2`) before any was described. Its rules come from each
source's own text where the source states them (pzprjs, Ludii, PuzzleScript
source, Demystify's models); the planning, word and toggle puzzles' rules are
the standard statements, and the list says which.

## The result

Run 2026-10-29 against the second version of the language (commit
`506d7adc`), by three agents, each told to apply this test strictly, bend no
rule, and leave the language unchanged. Their write-ups are the record:

| File | Families | Puzzles |
| --- | --- | --- |
| `corpus/shading-and-loops.md` | A shading, B loops and paths | 31 |
| `corpus/connecting-regions-numbers-placement.md` | C connecting, D regions, E numbers, F placement and geometry | 37 |
| `corpus/graphs-words-planning.md` | G graphs, H queries, I logic and words, J planning, K toggles and permutations | 38 |

**The verdicts on the rules** (criterion 1):

| Verdict | A, B | C to F | G to K | All |
| --- | --- | --- | --- | --- |
| Described well | 7 | 13 | 15 | 35 |
| Described with an extension | 24 | 23 | 19 | 66 |
| Not described | 0 | 1 | 4 | 5 |

The five not described, and what the core lacks for each: **Tangram**
(positions and angles in the plane, Untangle's limit); **Chase** and **2048**
(chance during play, where the core has chance only in the deal); **Mate in
n** (an adversary: "against every reply"); **Atomix** (a time limit in
seconds). Three verdicts rest on a ruling the owner may overturn: a word
list counted as a library table (Codeword, Word Ladder, Wordle; experiment B
counted Cube's roll table the same way), and Wumpus's walk written as
queries.

**Against the four failing results:**

1. **Described well or with an extension: 101 of 106**, against a floor of
   75. Read strictly, counting a puzzle out when any pair it is in computed
   wrongly (criterion 3), about 78; the three agents drew that line a little
   differently, so the strict figure is approximate. **Passes** either way.
2. **Needing a change to the core: 5**, against a ceiling of 10. **Passes.**
3. **Library additions few and shared.** Of the 66 puzzles described with an
   extension, 20 use only additions no other puzzle in their quarter uses
   (3, 8 and 9), before merging across quarters, which can only lower it.
   Under half. **Passes.** The most shared: a cell-centered loop (9
   puzzles), a walk along drawn edges as a fixed point (5), the 2×2 windows
   (6), a run's length from a cell (4), a region of a cell (4).
4. **The cut: 15 distinct pairs computed wrongly**, against a ceiling of 5.
   **Fails.** In 10 of them the theory can name the part that differs, and in
   5 it cannot (Stostone and Shimaguni, Pipe Link and Reflect Link, Hiroimono
   and Neko, Symmetry Area and Filling, Icosian and Knight's Tour). The test
   asked for both, more than 5 pairs wrong and the theory unable to say; the
   second clause sits at its boundary. It is counted a failure here, without
   argument over the boundary.

**What the cut failures share.** Ten of the fifteen are two puzzles with no
clue kind between them, or the same one, that differ in a rule that reads no
clue: Nurikabe and Mochikoro, LITS and Norinori, Hinge and Heyawake,
Yin-Yang and Unruly, Cave and Range, Aquarium and Thermometers, Sukoro and
View, Hakoiri and Star Battle, Toichika and Hakoiri, N-Queens and Star
Battle. The variation table files a replaced rule as a ruleset, so it calls
each pair one game, and a solver calls each two. The theory's principle
calls them two as well: the techniques that read the replaced rule do not
stay sound. The structural test is what is too generous. The other five turn
on how a puzzle is written: as a fill of a sequence or as moves that extend
it (Icosian and Knight's Tour, Hiroimono and Neko), as walls or as numbers
(Symmetry Area and Filling), or with the theory itself filing a real
difference as a ruleset (Stostone and Shimaguni, Pipe Link and Reflect
Link).

**The cut, computed instead of read off.** Experiment C has one of these
pairs measured: Range's `connect`, checked against Cave's rules, is unsound
(`experiment-c.md`), which is the principle saying "two games" by
computation, with no choice of how to file a rule. That is what a fix looks
like; it was found after the test, and the test's result stands as above.

**Other variant words a player would dispute.** A changed move set in a
planning game computes as a separate game (Shisen-Sho's gravity, Bloxorz's
split switches, Word Ladder's insertion), where players call each an option.
The table has no row for an added finish, a changed clue placement with an
unchanged meaning, or a guard that only removes moves (Hiroimono's no
reversal), and the theory leaves a size that changes the generators open
(Hanoi's four pegs, the Rubik's cube's n). Families cannot be computed for an
answer of `cell -> bool`, which is shading in Squaro and placement in Shinro.

**Techniques**, reported apart: few sources name any. Every one that does
fit the technique form (Cryptarithm's carry, Nurikabe's unreachable square,
Yajilin's satisfied arrow), except Hanoi's recursive method, which needs a
recursive macro the language does not have; its iterative restatement fits.

**The verdict of the test: the language describes outside puzzles' rules,
and its variation table does not decide the cut.** Three criteria pass, the
fourth fails.
