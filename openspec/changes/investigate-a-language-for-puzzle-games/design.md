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

## The first goal: a taxonomy

**The owner's words (2026-10-28).** The effort starts as research toward a new
taxonomy of the catalog: what makes a game, a ruleset, a modifier and a board
shape. It does not have to match the catalog's current typology, and it
changes nothing on the ground, so that later decisions about the catalog are
made from one consistent position. Breaking compatibility is acceptable where
a later change needs it. The prompt was Net and Netslide, which the owner
feels should be rulesets of one game rather than two games. On the questions
raised so far:

- **Which cut makes a game** is open, to be investigated and decided later.
  The owner leans toward a shared goal, combined with at least some aspects
  of the freedom (below).
- **The catalog stays a tree.** A clear catalog is what makes it usable. That
  is a strong initial position, and it is open to influence from data. A
  faceted view, where a game sits in two families, may be kept as analysis
  that justifies the tree, never as the catalog itself.

**What the catalog files by today (2026-10-28).** Two tests, both in
`docs/mechanics.md`, and both about the shape of a game's settings rather than
about its puzzle. The deal test: candidates that combine freely are
modifiers, and candidates that exclude each other are one ruleset field. The
neighbor test: "a field that changes which squares are neighbors is a
ruleset", but a tiling, which also changes neighbors, is a `kind`. Read
against the declared rule sentences (`git grep -n "rule:" -- src/games`):

| Structurally alike | Filed as |
| --- | --- |
| Star Battle's stars per unit; Bridges' most bridges per pair (a number inside one constraint) | ruleset; modifier |
| Salad's Letters or Numbers; Solo's Killer (a change of the clues' vocabulary) | ruleset; modifier |
| Flip's Crosses or Random (a change of what a move does) | ruleset |
| Net's walls wrap around (a change of topology, the board becoming a torus) | modifier |
| Twiddle's orientation matters (a change of what a cell holds, and of the goal) | modifier |

**The working decomposition**, a hypothesis for experiment B to break. A
puzzle's description falls into: the *space* (cells, adjacency, regions,
topology); the *domain* (what a cell holds); the *clue vocabulary* (what kinds
of givens exist and what they mean); the *goal* (the predicates a finished
board satisfies, with their parameters); the *freedom* (how the dealt position
relates to the positions the player may reach: filling blanks, an independent
change per cell, a global permutation, a linear toggle); and the
*distribution* (what the generator deals, which is no rule at all). The
catalog's words then name which part a variation touches. A board shape
changes only the space. A modifier adds, removes or bounds one goal predicate.
A ruleset changes the domain or the clue vocabulary, replaces a predicate, or
changes a parameter of the freedom. A separate game changes the kind of
freedom. A generator setting changes only the distribution.

**The tension a goal-first tree has to resolve.** Net and Netslide share
space, domain, clues and goal, and differ in the kind of freedom: Net's
choice is per cell, so it is a constraint problem and its hint deduces, while
Netslide's row and column shifts make a permutation puzzle, whose hint plans
with the `slide-planner` it shares with Sixteen (`src/games/netslide/hint.ts`,
2026-10-28). Netslide is Net's goal with Sixteen's freedom, and Fifteen and
Sixteen in turn share a goal. So a tree cut by goal has to say how far a
change of freedom may go before it makes a separate game, and the taxonomy
states that line so that it decides every pair, not only Net's.

**A candidate measure for the cut**: how much of the technique ladder
transfers between two variants. Flip's two rulesets keep their method; Net
and Netslide share no technique, since Netslide has no ladder. Experiment A's
traces can read this for every game with rulesets.

## The questions the investigation answers

0. **What makes a game, a ruleset, a modifier and a board shape?** Answered
   from "The first goal: a taxonomy" and experiments A and B, as a definition
   of each word over the decomposition, a rule for the cut that makes a game,
   and the catalog re-classified under them.

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

- **The language is tested before it is committed to.** The owner revised
  the order on 2026-10-29: a basic language is now designed over the theory
  that step 0 began. The cheap way out moves to the corpus test in
  `tasks.md` § 4. A language that does not describe outside puzzles well is
  not committed to, as the earlier withdrawals were kept cheap.
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
- Which cut defines a game: a shared goal, the kind of freedom, the
  techniques, or a combination. The owner's, informed by step 0.

## The order of work

The session that takes the change up writes `tasks.md` from this list. Step
0 comes first, and draws on steps 1 and 2 only as far as it needs them; its
deliverable is `taxonomy.md` in this directory, for the owner's decision
before the remaining steps go on.

**0. Taxonomy**

- 0.1 Read how the prior art in the table divides a puzzle into parts, and
  where any of it defines a variant, a ruleset or a family.
- 0.2 State the decomposition, each catalog word defined over it, and two or
  three candidate rules for the cut that makes a game, each tested against
  Net and Netslide, Fifteen and Sixteen, and Seismic and Tectonic.
- 0.3 Re-classify every game's declared rulesets, modifiers, kinds and
  parameters under each candidate (`git grep -l -E "rulesetItem|modifierItem"
  -- src/games` for the population, plus the games that declare neither), and
  list every disagreement with the catalog and every case the decomposition
  could not place.
- 0.4 Measure what can be measured for the cut: which techniques two variants
  share, for every game with rulesets.
- 0.5 `taxonomy.md`: the recommendation, what it would move in the catalog
  and at what cost to saves and links, and what was not checked. The owner's
  decision is recorded in it.

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
