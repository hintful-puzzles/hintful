# Design of the investigation

Written 2026-10-08 from one evening's search and a first look at the tree.
Everything under "Prior art" is from abstracts, documentation pages and search
summaries, not from reading the works in full; step 1 of "The order of work"
is that reading.

## Prior art

| Work | What it describes | What it leaves out |
| --- | --- | --- |
| PuzzleScript (Lavelle, 2013) | Movement puzzles as pattern-rewrite rules over a tile grid; Sokoban is one line | Deduction puzzles |
| Ludii (Browne, Piette and others) | Games as trees of "ludemes"; deduction puzzles are compiled to a constraint solver through XCSP | How a person solves; a 2024 thesis still says no system represents all deduction puzzles well |
| Maeda and Inoue, 2025 | Pencil-puzzle rules as mathematics: grid elements, their relations, composed structures, constraints and domains | About a quarter of existing puzzles covered; no solver or generator built on it |
| Demystify (Espasa, Gent, Hoffmann, Jefferson, Lynch, 2021) | Puzzles in a language based on Essence; each solving step is explained by a small unsatisfiable subset of the rules | Named techniques and tiers. The nearest work to our hints |
| grilops | Nikoli-style rules as constraints over a symbol set and a lattice, with regions, shapes and loops, solved by z3 | A library, not a language; rules and solving only |
| Answer set programming encodings | Nurikabe, Heyawake, Masyu as logic programs | Rules and solving only. Connectedness and the single loop are the hard part |
| pzprjs with cspuz | Over a hundred pencil puzzles with rule checking, and a SAT solver | A framework in code |
| Ludi (Browne, 2008 to 2012) | Board games as rule trees, evolved, filtered for playability and scored on aesthetic measures fitted to human rankings; produced Yavalath | Two-player board games, not puzzles |
| Pelánek, Sudoku difficulty | A model of human solving predicts difficulty at a correlation of 0.95 with solve times; difficulty has two sources, the complexity of a step and the dependency among steps | One puzzle |

Sources:
<https://www.boristhebrave.com/2024/06/10/puzzlescript-rules>,
<https://ar5iv.labs.arxiv.org/html/1907.00245>,
<https://arxiv.org/abs/2501.01433>,
<https://arxiv.org/abs/2104.15040>,
<https://pypi.org/project/grilops>,
<https://research.sabanciuniv.edu/5086>,
<https://arxiv.org/pdf/2603.02119>,
<https://gpbib.cs.ucl.ac.uk/gp-html/Browne_2012_sigevolution.html>,
<https://ar5iv.org/html/1403.7373>.

Named and not yet found or read: Browne's work on deductive search for logic
puzzles, and Lantz and others, "Depth in Strategic Games" (2017), which
proposes depth as a measurable property of a game.

**What the table says.** The solution side is well covered and we should
borrow it. The deduction side, with techniques, tiers and explanations as
first-class things, is where nobody has a language, and it is the side "easy
to learn, hard to master" is a statement about.

## What this repository already has

Written as queries, since the answers move:

- **Named techniques with tiers.** `DeductionTechnique` in
  `src/engine/deduction-fixpoint.ts` carries an `id` and a `tier`, and a game's
  ladder of them is both its grader and its narrator. The games on the shared
  runner: `git grep -l runDeductionFixpoint -- src/games` (a name search, so it
  includes a game that only mentions the runner in a comment). The Latin
  family shares one solver: `git grep -l engine/latin -- src/games`.
- **A premise for a hint step, already audited in part.** A hint marks the
  squares its deduction reads. For the candidate walks, `firing-replay.ts`
  replays each recorded firing and checks that it follows from the premise its
  step names. So a trace exists for a dealt board (which technique fired, on
  what premise, in what order), and a form of experiment C already runs in the
  gate for one family of games. How far it reaches is step 2.2.
- **Declared parameters, rulesets and modifiers**, which the engine consumes
  (`envision-the-game-contract`, archived, and the changes it scaffolded).
- **Games that plan and do not deduce** (Fifteen, Flood, Inertia, Slide,
  Sokoban). A language for deduction does not describe them, and PuzzleScript's
  rewrite rules are the prior art for that family.

What it does not have: the rules of a game stated anywhere but in code. A
ladder is an array literal built inside a solve, closing over the board
(`engine-difficulty`, "The difficulty tier list is not a projection of the
technique ladder").

## What the earlier withdrawals bind

Not yet read for this purpose; step 2.1. Their headlines, from the postmortems'
own summaries:

- **The definition adapter** was withdrawn because no declaration needed to
  know about another: each stood alone as a helper, so there was nothing for a
  definition object to compile.
- **The board model** was withdrawn because the board was already `grid/`,
  `geometry.ts` and a typed array.
- **The gesture table** was withdrawn because what it wanted was a shared
  mechanic module.
- **The tile renderer** and, earlier, the scene graph were withdrawn, and
  presentation stays imperative.

The pattern to take seriously: a declaration earned its place only when the
engine consumed it, and "the game written in declarations" lost each time to
"a helper the game calls". A description language that nothing runs is the
shape `docs/doctrine.md` § "One source of truth" warns about.

## The questions the investigation answers

1. **What does the language describe?** Candidate layers, most covered by
   prior art first: the board's structure; the solution's variables and their
   domains; the rules as constraints, including the global ones; the clues; the
   deduction techniques, each with its premise and its conclusion; the tiers as
   sets of techniques. Input and rendering are out unless the report argues
   them in.
2. **How much of the collection can it state?** Maeda and Inoue reached a
   quarter of their puzzle set. Ours is tried on a fixed, deliberately awkward
   sample before any claim is made.
3. **What keeps a description true?** Something must consume it. Candidates: a
   solution checker generated from the description and compared, in the gate,
   with the game's own verdict on dealt boards; a soundness check of each
   technique against the rules; the rules section of a game's help page or
   spec generated from it. If nothing consumes it, the answer is not to build
   it.
4. **Can a technique be stated, and checked?** A technique is sound when its
   conclusion follows from the rules and its premise. Demystify finds such
   premises by search; ours are written by hand and narrated. Whether a
   hand-written technique can be stated in a form a solver verifies on small
   boards is the experiment that decides the deduction layer.
5. **Can a property be derived from structure?** A first reading of "easy to
   learn, hard to master": the rules are short to state, and the techniques a
   player comes to need are many, are not among the rules, and arrive in an
   order. Pelánek's two sources of difficulty are both readable off a trace
   this repository can already produce. Whether such a measure agrees with
   anybody's judgment needs a judgment to compare with, and this project
   collects no play data. That limit is stated in the report, not worked
   around.
6. **What would invention take?** Ludi's route was to mutate rule trees, cull
   the unplayable and score the rest. For a puzzle the cull is whether boards
   with one solution can be dealt and solved without guessing at more than one
   tier. That needs a generic solver over descriptions, which is a development
   tool and never part of the app.
7. **What would a paper claim?** The candidate: a description language for
   deduction puzzles that includes the human techniques, with a corpus of
   dozens of implemented games whose techniques both grade and explain, and a
   structural measure of a game's learning curve taken from it. The report
   says whether the experiments support that claim or a smaller one.

## Decisions

- **No language is designed before the experiments.** Each of the three
  experiments in step 3 can come back negative and end the effort
  cheaply, which is how the earlier withdrawals were kept cheap.
- **Experiment A needs no language.** It reads traces from the engine as it
  is. If the ladders we have say nothing interesting about a game's learning
  curve, a language built on them will not either.
- **The sample of games is fixed in advance** and chosen to break a
  vocabulary: a Latin game (Solo), a loop on arbitrary tilings (Loopy), a
  connectivity rule (Range or Singles), a path (Ascent), a region puzzle
  (Palisade or Filling), and one planning game (Sokoban) as the expected
  failure.
- **Our own language is the working assumption**, as the owner leans, and the
  report still says for each layer what is taken from which prior work and
  why not the whole of it.

## Risks / Trade-offs

- It repeats the framework vision under a new name → the postmortems are read
  first, and the maintainability aim is argued against them or dropped.
- A description becomes a second copy of each game that drifts → question 3 is
  answered before anything is built, and "nothing consumes it" ends the effort.
- The measure of "fun" is unfalsifiable without human data → the report states
  what data would be needed, and whether to collect any is the owner's
  decision since it concerns players.
- It draws effort from the games → it is filed for later and builds nothing
  the app depends on.

## Open Questions

- Where experiment code that is worth keeping lives in the repository.
- Which venue a paper would suit. Decided only if the report supports one.

## The order of work

The change has no `tasks.md` while it waits, which is what makes it a draft
(`docs/work-management.md` § "The backlog is being drained"). The session that
takes it up writes `tasks.md` from this list.

**1. Read the prior art in full**

- 1.1 Read each work in "Prior art" whole, and find the two named there as
  not yet found. The table is corrected where the full text differs from the
  summary it was written from.
- 1.2 For each language, write one of the sample games in it, or say what
  stopped it. The report has the description or the obstacle, per pair.

**2. Read our own history and tree**

- 2.1 Read every postmortem under `openspec/postmortems/` and
  `retire-the-framework-vision`, and say for each whether its finding binds a
  description language, and which aim. "What the earlier withdrawals bind" is
  rewritten from the reading.
- 2.2 Inventory what a game already declares that the engine consumes, by
  query, and how far the premise audit in `firing-replay.ts` reaches.

**3. Three experiments**

- 3.1 Experiment A, no language: for every game with a technique ladder,
  trace dealt boards at each tier and record which techniques fire, the size
  of each premise and the order. A table per game, and a statement of whether
  the traces separate the tiers and the games.
- 3.2 Experiment B: state the rules of the six sample games in a first
  vocabulary, on paper, and list every rule that did not fit.
- 3.3 Experiment C: state three techniques from three games so that a solver
  checks each is sound on small boards. The check passes for the three and
  fails for a deliberately unsound variant of one.

**4. Report**

- 4.1 Answer the seven questions above, each from the steps it rests on, in a
  report in this directory that says what was not checked.
- 4.2 The recommendation: build a language or not, what consumes it, what a
  paper would claim, and the next change if there is one. The owner's decision
  is recorded in the report.
