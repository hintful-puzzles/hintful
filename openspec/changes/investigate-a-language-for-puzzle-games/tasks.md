# Tasks

Written from `design.md` § "The order of work". The owner revised the order
after step 0 (2026-10-29). Their words: build "a full theory around it, with
at least a basic language for describing our puzzle games, and which you
believe would be future ready", then test it on about a hundred puzzles
collected from outside the collection, "and only if that is the case, commit
to it". Nothing in the catalog moves before then.

## 0. Taxonomy

- [x] 0.1 Read how the prior art in `design.md` § "Prior art" divides a puzzle into parts, and where any of it defines a variant, a ruleset or a family
- [x] 0.2 State the decomposition, each catalog word defined over it, and two or three candidate rules for the cut that makes a game, each tested against Net and Netslide, Fifteen and Sixteen, and Seismic and Tectonic
- [x] 0.3 Re-classify every game's declared rulesets, modifiers, kinds and parameters under each candidate (population: `git grep -l -E "rulesetItem|modifierItem" -- src/games`, plus the games that declare neither); list every disagreement with the catalog and every case the decomposition could not place
- [x] 0.4 Measure which techniques two variants share, for every game with rulesets
- [x] 0.5 Write `taxonomy.md`: the candidates, a recommendation, what each would move in the catalog and at what cost to saves and links, and what was not checked
- [x] 0.6 The owner's decision on the cut, recorded in `taxonomy.md`: B with V-strict, tentative, not acted on

## 1. Read the prior art in full

- [ ] 1.1 Read each work in "Prior art" whole, and find the two named there as not yet found; correct the table where the full text differs
- [ ] 1.2 For each language, write one of the sample games in it, or say what stopped it

## 2. Read our own history and tree

- [x] 2.1 Read every postmortem under `openspec/postmortems/` and `retire-the-framework-vision`; say for each whether its finding binds a description language, and which aim; rewrite "What the earlier withdrawals bind"
- [x] 2.2 Inventory, by query, what a game declares that the engine consumes, and how far the premise audit in `firing-replay.ts` reaches
- [x] 2.3 Read the hint narrations of Fifteen, Sixteen and Twiddle: do they teach one staged method? This is the open case of question 1 in `taxonomy.md`
- [x] 2.4 Settle the two open cases of question 2: Salad's Numbers (the plain game, or a clue kind?) and Path's Pairs (its rungs are too broad to compare)

## 3. The theory and a basic language

- [x] 3.1 State the theory in `theory.md`, built from the parts and the principle in `taxonomy.md`:
  - each part defined;
  - each catalog word defined over the parts;
  - the cut between games, and between families;
  - the open cases of `taxonomy.md` § "Cases the decomposition could not place", each resolved or named as a limit
- [x] 3.2 Experiment A: trace dealt boards at each tier for every game with a technique ladder; a table per game, and whether the traces separate tiers and games
- [x] 3.3 Design a basic language over the theory's parts, taking from the prior art what fits, and say for each layer where it came from and why
- [ ] 3.4 Write the six sample games of `design.md` § "Decisions" in it, and then every game of the collection; list every rule that did not fit (this is experiment B)
- [ ] 3.5 Experiment C: three techniques from three games stated so a solver checks each sound on small boards, passing for the three and failing for a planted unsound variant
- [ ] 3.6 Say what would consume a description (`design.md` question 3), and why the language is ready for games not yet written

## 4. The corpus test

- [x] 4.1 Fix the test before looking at the corpus. Write down what "described well" means: the rules stated with no rule left as prose, the variants placed by the theory's words, and the cut deciding each pair. State the result that would fail the language
- [ ] 4.2 Collect about a hundred puzzle games from outside the collection (genre lists, puzzle sites, the prior art's corpora), chosen to span the families and freedoms, not to suit the language
- [ ] 4.3 Describe each one, and tally which were described well, which needed an extension, and which could not be described

## 5. Report

- [ ] 5.1 Answer the seven questions of `design.md`, each from the steps it rests on, saying what was not checked
- [ ] 5.2 The recommendation: commit to the theory and language or not, and what would move in the catalog; the owner's decision recorded in the report
