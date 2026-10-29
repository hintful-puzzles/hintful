# Report: a language for puzzle games

Step 5 of `tasks.md`, written 2026-10-29 for the owner's decision. It answers
the seven questions of `design.md` (and question 0, the taxonomy's) from the
steps they rest on, says what was not checked, and recommends. Nothing in the
app, the engine, the specs or the catalog changed.

**What the owner is asked** (§ "The recommendation"): whether to commit to
the theory and the language, and with it three things that would move in the
catalog if they do.

## Sections

| Section | What it holds |
| --- | --- |
| What was done | the steps and where each is written |
| The answers | the eight questions, each from its evidence |
| What consumes a description | question 3 and task 3.6 |
| The recommendation | commit or not, what would move, the next change |
| What was not checked | everything the answers lean on without having checked |

## What was done

| Step | Where | In one line |
| --- | --- | --- |
| 0. Taxonomy | `taxonomy.md` | the parts, the catalog's words, three candidate cuts; the owner chose B with V-strict, tentatively |
| 1. Prior art | `prior-art.md` | every work read whole, three figures corrected, five works added, a sample game in each of six languages |
| 2. Our history and tree | `design.md` § "What the earlier withdrawals bind", `taxonomy.md` § "The open cases, read in step 2" | the postmortems bind maintainability and nothing else; the open cases settled |
| 3.1 Theory | `theory.md` | eight parts, five kinds of freedom, the cut resting on monotonicity of soundness |
| 3.2 Experiment A | `experiment-a.md` | 44 games' ladders traced at every tier |
| 3.3 Language | `language.md` | one block per part, techniques in the rules' logic, words computed |
| 3.4 Experiment B | `collection.md`, `collection/` | all 60 games written; 37 fit the first version; the second version takes what the rest needed |
| 3.5 Experiment C | `experiment-c.md`, `experiment-c/` | three techniques checked sound by z3; every planted variant caught |
| 4. Corpus test | `corpus.md`, `corpus-list.md`, `corpus/` | 106 outside puzzles, under a test fixed before they were chosen |

## The answers

### 0. What makes a game, a ruleset, a modifier and a board shape?

**One principle and its structural tests** (`theory.md` § "The cut"): a
ruleset keeps its game's techniques, and a variation whose techniques do not
carry over is another game of the same family. The tests follow from one
fact, that a sound technique stays sound when a rule is added. So adding a
rule or a clue kind, or bounding a rule by a parameter, is a **modifier**;
changing only the space is a **board shape**; replacing a predicate, the
domain or a commuting move set is a **ruleset**; changing only what is dealt
is a **generator setting**; replacing a clue kind, or changing the kind of
freedom or a non-commuting freedom's moves, makes a **separate game**. A
**family** is what the player produces.

Measured against the technique overlap of 23 games (`taxonomy.md` § "What the
techniques share"), the tests and the overlap agree on every pair. Two
refinements came out of step 2 and experiment B: a given of the answer is no
clue vocabulary, so Killer and Salad's Letters add a clue kind and are
modifiers; and a non-commuting freedom's kind is its moves, so Fifteen,
Sixteen and Twiddle are three games, where candidate B made them one.

**The corpus broke one structural test.** "A replaced rule is a ruleset" is
too generous: two games with no clue kind between them that differ in one
clue-free rule (Nurikabe and Mochikoro, Cave and Range, N-Queens and Star
Battle) are two games to a solver, and to the principle, since the techniques
that read the replaced rule stop being sound. The tests that rest on the
theorem (an added rule keeps every technique) held; the one that rested on
measurement within our catalog did not survive outside it. The principle
itself held in every pair where it was applied; experiment C applied it by
computation to Cave and Range (`experiment-c.md`).

### 1. What does the language describe?

The rules (space, domain, answer shape, clue kinds, goal predicates), the
freedom (moves, finish, queries, objective), the distribution as named
settings, the variations, and **the techniques and tiers, in the same logic
as the rules**. Input and rendering are out, as every withdrawal found them
per game. The layers and where each came from are `language.md` § "Where
each layer came from".

### 2. How much of the collection, and of puzzles outside it, can it state?

**The collection** (`collection.md`): the first version stated 37 of 60
games, 33 of the 45 constraint games and 4 of the 15 planning, query and
expression games. The 23 it could not state named, between them, fifteen
changes; the second version takes them, and states the collection but for
what it names as limits (Untangle's and Numgame's infinite domains, Same
Game's objective as reasoned about, Fifteen's endgame table and Pegs' random
board as data).

**Outside the collection** (`corpus.md` § "The result"): 106 puzzles,
chosen before any was described by an agent that never read the language.
The second version stated the rules of 101 (35 with the library as it
stood, 66 with additions defined in the core logic, under half of them
unshared). Five need a change to the core: chance during play (Chase,
2048), an adversary (Mate in n), a clock (Atomix), and the plane (Tangram).
Three of the four results fixed in advance pass. **The fourth fails: 15
pairs of puzzles computed to the wrong side of the cut**, against a ceiling
of 5 (question 0, and § "The recommendation").

### 3. What keeps a description true?

§ "What consumes a description", below.

### 4. Can a technique be stated, and checked?

**Yes, on small boards** (`experiment-c.md`). Solo's `hiddenSingle`, Unruly's
`threes` and Range's `connect`, written in the language's forms, were checked
sound against their games' rules by z3 on boards up to 6×6, and an unsound
variant of each was caught with a counterexample board. Range's technique
needs connectivity, the rule the prior art's explainers handle worst
(`prior-art.md`), and checked as readily as the others.

Two findings bound it. A pass is a claim about the sizes tried: the planted
Unruly variant is sound on 4×4 and unsound from 6×6. And soundness belongs to
a technique and a rule set together: Range's `connect` is sound because Range
forbids touching shaded squares, and is unsound without that rule. The check
grounds every binding, which costs minutes on a 5×4 board; boards of a
playable size need a better encoding.

### 5. Can a property be derived from structure?

**A first one can be read, and not validated** (`experiment-a.md`). The
ladders come in three shapes: steep (few rungs at the first tier and many
added: Loopy, Unequal, Solo, Group, Dominosa, Mathrax), front-loaded (most at
the first tier: Salad, Towers, Singles, Tents) and flat (one deductive tier:
thirteen games). "Easy to learn, hard to master" describes the steep shape.
Lantz and others' depth (`prior-art.md`) is the measure this is an instance
of: steps on a ladder of strategies, each with a measurable gain over a
distribution. No one has computed it for a puzzle genre.

Whether the measure agrees with players is not known, and this project
collects no play data. Two further limits: the hint's rungs show a tier in
only 38 of 44 games, since six games' rungs and solver techniques are two
vocabularies; and Pelánek's work says difficulty varies within a tier as
much as across one, which a set of techniques cannot see.

### 6. What would invention take?

A generator over descriptions: a generic solver that deals well-posed boards
from a description, and the cull that, for a puzzle, replaces Ludi's
viability test: boards with one answer can be dealt, and solved without
search at more than one tier, by techniques the language states and the
checker passes. Experiment C's checker is the seed of the last part. Nothing
of the rest exists, and it is a development tool, never part of the app. It
is the furthest of the three aims, and nothing here says it would find a good
game.

### 7. What would a paper claim?

**The claim the work supports**, smaller than `design.md`'s candidate:

1. A description language for logic puzzles whose **deduction techniques
   are statements in the same logic as the rules**, checked sound against
   them by a solver, with tiers as sets of techniques; demonstrated on three
   techniques of three games, connectivity among them.
2. A **theory of variation** in which the step from a game to a modifier is
   justified by a theorem (soundness is monotone in the rules), and the cut
   between games is the transfer of techniques, **computed by the same
   soundness check** (shown on one pair).
3. **A corpus**: 60 implemented games whose techniques both grade and
   explain, written in the language, with their ladders traced at every tier
   (three shapes of learning curve), and 106 outside puzzles of which the
   rules of 101 are stated.

**What it does not support**: a structural classification of variations
read off a description (the corpus failed it); any claim about difficulty or
"easy to learn, hard to master" as players experience it (no play data); and
invention. The nearest prior work, and the comparison a paper owes, is
Butler, Torlak and Popović's checked Nonogram techniques (one genre, no
tiers) and Demystify's explanations (no named techniques).

## What consumes a description

`docs/doctrine.md` § "One source of truth" is the bar: a declaration is
healthy when the engine runs it or builds from it, and a statement read only
by a check is a second copy that rots. Three consumers were weighed.

1. **A checker built from the rules, run in the gate against each game's own
   verdict on dealt boards.** Checking a finished answer needs no solver: it
   evaluates the rules on a concrete board, which every construct of the
   language allows. Compared with `status()` and `findMistakes` on the boards
   the gate already deals, it fails the day a game's code and its description
   disagree. **This is the consumer that keeps a description true.** It is a
   check, so by the doctrine it must buy more than a second copy costs, and it
   does: today the rules are stated four times (help page, spec, checker,
   solver; `design.md` § "What a game declares that the engine consumes"),
   none read by another, and this would hold one of them to the code.
2. **A soundness check of each technique against the rules**, experiment C's,
   run on small boards. It catches what nothing in the gate can today: the
   premise audit (`firing-replay.ts`) checks a firing against the game's own
   technique, never the technique against the rules. Its cost is a solver as
   a development dependency and minutes a technique.
3. **The rules section of a help page generated from the description.**
   Declined: the help states rules for a player, in words chosen for a
   player, and a generated sentence would be worse than the one written.

**What is ready for games not yet written** (task 3.6, `language.md` § "What
is ready for games not yet written"): a new game is a new combination of
parts, its variations are filed by computation, and its techniques are
checked sound before any hint narrates them. The corpus test is the
evidence for the first claim.

**Building from it** is the further consumer, and the strongest reason to
go ahead if it works: the answer check and the solver's ladder generated from
the description, measured against the hand-written code. The postmortems do
not rule it out (§ "Correction"); `build-a-game-from-its-description`
explores it.

## The recommendation

**Do not commit to the language yet, and move nothing in the catalog.** The
owner's rule (2026-10-29) was to commit only if the corpus test passed, and
it did not: the language states outside puzzles' rules, and its variation
table puts 15 pairs on the wrong side of the cut. The test was fixed before
the corpus was chosen, and the failure is reported as it fell.

**What stands, and is worth keeping:**

- **The theory's principle** (a ruleset keeps its game's techniques) and the
  theorem under it. Every structural test that rests on the theorem held, in
  the collection and outside it.
- **The language's rule layer.** It stated 101 of 106 outside puzzles after
  being shaped only by our own 60, with a library that is a vocabulary rather
  than a list of rules. What it lacks (chance, adversaries, clocks, the plane)
  no game of ours needs.
- **The technique layer and its checker**, which no prior work has across
  genres.

**What failed, and the fix the work points to.** The variation table guessed
at technique transfer from the shape of a change, and was wrong for a
replaced rule. Experiment C's checker can decide technique transfer instead:
run each technique of one game against the other's rules, and a variation is
a ruleset or modifier when every technique stays sound. It decided Cave and
Range correctly where the table could not. That fix was found after the test,
so it is not counted; it is a hypothesis for the next change to test.

**The next change, proposed: compute the cut by technique transfer.**

1. Fix, before any work, the pairs and the result that would fail it: the 15
   pairs the corpus got wrong, the 23 pairs `taxonomy.md` measured, and the
   catalog's own variations; the computed word must match a solver's (for
   the corpus) and the measured overlap (for ours) in all but a stated few.
2. State the techniques the pairs need in the language: the corpus agents
   named the one each pair turns on (Nurikabe's escape, Range's no-touching
   rungs, Pipe Link's every-cell rule).
3. Extend the checker to the second version's constructs it lacks (bounded
   fillings, fixed points beyond connectivity), and to quantify bindings
   inside one query so that boards of 6×6 and up are in reach.
4. Run it. If it passes, the language with a computed cut is what is
   committed to, and the catalog moves below are proposed one change each.

It builds nothing the app runs. Where its code lives is the one open
question from `design.md` it must answer; the proposal is a `research/`
directory at the top of the repository, outside `src/`, run by hand and not
by the gate, since a solver is a development tool.

**What would move in the catalog, if the next change passes.** None of it
moves now. Each is from `taxonomy.md` § "Disagreements with the catalog" as
step 2 and experiment B revised it:

| Change | Kind of cost |
| --- | --- |
| Net's and Netslide's wrapping, Solo's Jigsaw, Ascent's three adjacencies become board shapes | words and the Type menu's sections only; no ID, link or save changes |
| Ascent's Edges, Salad's Letters, Star Battle's star count become modifiers | the same |
| Twiddle's orientation becomes a ruleset; Group's hidden identity a generator setting | the same |
| Unequal and Adjacent become two games of one family | a split: saves, links and favorites divided by their params, with a route alias (`taxonomy.md` § "What a move would cost") |
| Net and Netslide stay two games; Fifteen, Sixteen and Twiddle stay three; Killer stays a modifier of Solo; Pairs stays a ruleset of Path | nothing |

**The owner's decisions asked for:**

1. **Whether to accept "not committed"** and file the next change above. The
   recommendation is yes.
2. **Killer.** The owner's tentative decision listed Killer among the
   confident splits under V-strict. Step 2 found that Killer adds cages to a
   game whose givens are no clue vocabulary, keeps 7 of plain Solo's 8 rungs,
   and is a modifier by the same principle (`taxonomy.md` § "The open cases,
   read in step 2"). The recommendation is to keep it a modifier.
3. **Whether a word list is a library table** (Codeword, Word Ladder,
   Wordle). It changes three corpus verdicts and no conclusion.

## The owner's decision (2026-10-29)

1. **Not committed yet; keep iterating.** The next change computes the cut
   by technique transfer (`compute-the-cut-by-technique-transfer`).
2. **Build from the description, explored as its own change**
   (`build-a-game-from-its-description`). The owner's words: if the
   structured description could build parts of a game, "or otherwise have
   the structured description help implement and maintain the game and its
   deductions, that would be a strong reason to go ahead, and to exclude games
   that don't fit well". The postmortems are not to be read as ruling it out
   (§ "Correction", below). Two directions from the owner, details left to
   that change: something akin to C#'s or Java's XML dependency-injection
   configuration, written and kept with tooling and agents rather than by
   hand; and, once implemented, **JSON or YAML with a strong schema** in place
   of the exploratory notation, for parsing and editing.
3. **Scope: "Hintful Puzzle Games" excludes games with chance during play,
   an adversary, or a time limit.** No game in the collection has any of the
   three. The plane stays open. Recorded in `theory.md` § "Scope".
4. **Flood's move limit stays.** Without a limit or a target Flood is
   meaningless; the owner raised it as an example. They would like a
   **ball-sort game** (colored balls sorted among tubes), whose dead end
   might be met by letting the player add a tube; filed as `add-ball-sort`.
5. **Killer**: whichever fits the language better, which is a modifier of
   Solo (`taxonomy.md` § "The open cases, read in step 2").
6. **A word list is a library table.** Randomly generated word-list puzzles
   are wanted in a future change, Wordle and LinkedIn's Wend first, filed as
   `add-word-list-puzzles`. Crosswords and other definition-based games are
   not, since they need authorial intent. LinkedIn's **Patches** is among the
   next few games the owner wants, filed as `add-patches`, and is added to the
   corpus (`corpus.md` § "Added after the test").

## Correction

The first draft of this report and of `design.md` § "What the earlier
withdrawals bind" said that the postmortems rule out building a game from a
description. They do not. They withdrew declarations of how a game is
implemented (a gesture table, a board model, a definition object, a tile
loop), each of which said nothing a helper did not, so there was nothing to
build from. A description of the rules and techniques with an executable
meaning did not exist then, and is the changed circumstance. The owner
(2026-10-29): a direction failing before is not a reason it must fail again,
and rejected directions are to be revisited wherever circumstances have
changed.

## What was not checked

- **No player's judgment** stands behind the cut, the families or the ladder
  shapes.
- **The agents' descriptions** (54 of the collection, all of the corpus) were
  read by the session for two games each and otherwise taken as written; their
  verdicts are the agents' application of the test.
- **Experiment C's checker** compiles a fragment of the language (no fillings,
  no fixed points beyond connectivity); the second version's additions are
  stated and not executed.
- **The stated techniques against the code**: that Range's TypeScript
  `ruleConnectedness` computes what `connect` states was read, not checked.
- **Experiment A** walked the menu's small presets with four seeds a tier,
  and traced the hint's route, not the grader's.
- **The prior art**: Bogaerts and others 2020, Variations Forever,
  demystify-rs beyond its README and Batenburg and Kosters were not read in
  full; most corpus planning games' rules come from memory and their list
  says which.
