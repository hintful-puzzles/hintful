# Design of the investigation

Written 2026-10-08 from one evening's search and a first look at the tree,
and corrected as the steps reported. Step 1 read the prior art in full
(`prior-art.md`, 2026-10-29); the section below is its summary.

## Prior art

`prior-art.md` holds the reading: each work's correction to the first table
(written from abstracts), the works found since, and a sample game in each
language. Its findings, in short:

- **The solution side is well covered**, and the language borrows it:
  cspuz's and Ludii's separation of the space from the rules, the named
  connectivity and loop primitives of grilops and cspuz, PuzzleScript's
  rewrite rules for movement.
- **The deduction side has a language for one genre and explanations for
  any.** Butler, Torlak and Popović (2017) write Nonogram techniques as
  programs a solver checks sound. Demystify and cspuz's Analyzer explain any
  model's steps by minimal sets of named rules, and say they explain
  connectivity and loops poorly. Nobody has **named techniques with tiers
  across many genres**, which this collection has in code. That is the side
  "easy to learn, hard to master" is a statement about.
- **Lantz and others' depth (2017) is a technique ladder** measured over a
  distribution, and Browne's deductive search (2013) prices a technique by
  the lookahead it saves. Neither has been computed for a puzzle genre.
- **Three figures in the first table were overstated**: Ludii's XCSP route
  is a six-puzzle prototype absent from its public code; Maeda and Inoue
  confirmed 10 of 46 rules; Pelánek's 0.95 is the best of 13 metrics on one
  dataset.

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
  what premise, in what order). It is not experiment C: it checks a premise
  against the game's own technique, not a technique against the rules (below).
- **Declared parameters, rulesets and modifiers**, which the engine consumes
  (`envision-the-game-contract`, archived, and the changes it scaffolded).
- **Games that plan and do not deduce** (Fifteen, Flood, Inertia, Slide,
  Sokoban). A language for deduction does not describe them, and PuzzleScript's
  rewrite rules are the prior art for that family.

What it does not have: the rules of a game stated anywhere but in code. A
ladder is an array literal built inside a solve, closing over the board
(`engine-difficulty`, "A game's tiers are read from its difficulty item").

### What a game declares that the engine consumes (step 2.2, 2026-10-29)

Each line is a query over `src/games/*/*.ts` without tests, so it can be run
again. The figures are 2026-10-29's, of 59 game directories.

| Declaration | What consumes it | Query (games) |
| --- | --- | --- |
| `id`, `menu`, the params codec | routing, saves, links, the preset menu | every game |
| `paramConfig` | the Custom dialog, the codec, the params label, the help's settings list | `paramConfig` (all) |
| A ruleset's or modifier's `rule` sentence | the help page's list of rulesets and modifiers, a title's words | `rule:` (23); `rulesetItem` (7), `modifierItem` (9) |
| A difficulty item and contract | tier names, the dialog, `solveAtCap`, the tier guards | `difficulty:` (39) |
| `hintRungs`, `hintMarks` | every cross-game hint guard; the help's legend of marks | each (all) |
| A ladder of `DeductionTechnique` `{ id, tier, run }` | `runDeductionFixpoint`: grade, cap, census | `runDeductionFixpoint` (24); the Latin solver, `engine/latin` (13) |

So the engine already consumes, per game: its parameters, the sentence of
each rule a setting changes, its tier names, and the names of its techniques.
It consumes **no statement of the rules themselves**. The base rules are
stated four times in four forms, none read by the others: the help page
(`help/games/<id>.md`), the spec's `Rules:` requirements (every game's spec
has them), `status()` and `findMistakes` (the checker), and the solver (whose
techniques presuppose the rules and never state them).

**How far the premise audit reaches.** `firing-replay.test.ts` audits the
games whose hint is the candidate walk (`CandidatePlan(` in the hint): the
Latin family (Solo, Keen, Towers, Unequal, Group, Salad, Mathrax) and Rome
offer a replay; ABCD and Seismic walk without recording (`RECORDS_NOTHING`).
Rome's `expand` and two of Mathrax's clue firings are ledgered as gated. What
it checks is narrower than experiment C: that a firing **follows from the
cells its step names, by the same technique**. It replays the game's own code.
It cannot find a technique that is unsound against the rules, since the rules
are nowhere for it to read. Experiment C asks the other question, and needs
the rules stated.

## What the earlier withdrawals bind

Read for step 2.1, 2026-10-29: the seven postmortems under
`openspec/postmortems/` and the archived `retire-the-framework-vision`. The
question for each is whether its finding binds a description language, and
for which of the three aims (maintainability, reasoning about the space,
invention).

| Postmortem | Its finding | Binds |
| --- | --- | --- |
| Scene graph (2026-05-21) | A declarative scene tree diffed per frame was slow, and the cache risk it addressed had imperative fixes | Nothing here: rendering is outside the language (question 1) |
| Retiring the `MODIFIED` delta (2026-08-24) | A tool's defect was worked around in four layers; the tool's next version had fixed it | Method only: check a dependency's version before building around it |
| Gesture table (2026-09-05) | A drag game's keyboard half is a design reached by playtest, not derivable from the pointer gesture; the derivable part had already shipped as helpers | Aim 1, if the language described input. It does not: input stays out |
| Board model (2026-09-06) | `grid/` already models every planar tiling, and 55 games decline it because a typed array is right for a square board; cloning is a per-field judgment; the desc codec is frozen | **Aim 1**: a language must not generate a game's state, its clone or its codec. Not aims 2 and 3: a description of the space is mathematics, and needs no game to represent its board that way |
| Definition adapter (2026-09-06) | No declaration needed another, so there was nothing to compile; "a game joins a shared mechanic by having it" | **Aim 1**: a definition object compiled into a `Game` is refused. The language is not a way to write a game |
| Tile loop (2026-09-09) | The headline number ("~80 lines of bookkeeping") was wrong by four and inverted | Method: measure a proposal's number. This change's own number is "the rules are spread over four places"; it is measured above |
| Untangle unflip (2026-09-26) | A cause assumed in a design did not survive measurement | Method only |

`retire-the-framework-vision` records that every row of the vision reported
and that its deduction end's last open question, splitting a technique into
`find`, `apply` and `narrate`, was declined
(`docs/solver-and-generator.md` § "What the runner does not carry: the
record"): a rung holds several premises, and is graded together and narrated
apart. A language's technique is that rung's unit or below, and it does not
replace the runner's.

**What this leaves of each aim.**

- **Maintainability is not a reason to build this.** Every withdrawal that
  touched it found the same thing: a statement of the game that the game's code
  does not run lost to a helper the game calls. A description from which the
  app's code is generated is the definition adapter again. The one form of
  aim 1 that survives is narrower: a description that a check compares, on
  dealt boards, with the game's own verdict (question 3). It is consumed, and a
  drift fails it. Whether that is worth a second statement of each game's rules
  is for the report, and `docs/doctrine.md` § "One source of truth" is the bar:
  a statement read only by a check is refused, unless the check is what keeps
  the four statements we have today from disagreeing.
- **Reasoning about the space, and invention, are not touched by any
  postmortem.** Each withdrawal asked whether a declaration could build the
  app. None asked whether a game could be described in order to compare it
  with another, or to search for a new one, and those are the aims a
  description that builds nothing serves.
- **The refusal in `engine-difficulty`** ("A game's tiers are read from its
  difficulty item") names three conditions under which projecting tiers from
  techniques would be reconsidered. One of them, a ladder declared without a
  board, is what the language's deduction layer would be. The report says
  whether it meets it, and does not move the tiers either way.

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
