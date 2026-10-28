# Tasks

Written from `design.md` § "The order of work". Step 0 is done first and goes
to the owner as `taxonomy.md`; steps 1 to 4 wait for their decision on it.

## 0. Taxonomy

- [x] 0.1 Read how the prior art in `design.md` § "Prior art" divides a puzzle into parts, and where any of it defines a variant, a ruleset or a family
- [x] 0.2 State the decomposition, each catalog word defined over it, and two or three candidate rules for the cut that makes a game, each tested against Net and Netslide, Fifteen and Sixteen, and Seismic and Tectonic
- [x] 0.3 Re-classify every game's declared rulesets, modifiers, kinds and parameters under each candidate (population: `git grep -l -E "rulesetItem|modifierItem" -- src/games`, plus the games that declare neither); list every disagreement with the catalog and every case the decomposition could not place
- [x] 0.4 Measure which techniques two variants share, for every game with rulesets
- [x] 0.5 Write `taxonomy.md`: the candidates, a recommendation, what each would move in the catalog and at what cost to saves and links, and what was not checked
- [ ] 0.6 The owner's decision on the cut, recorded in `taxonomy.md`

## 1. Read the prior art in full

- [ ] 1.1 Read each work in "Prior art" whole, and find the two named there as not yet found; correct the table where the full text differs
- [ ] 1.2 For each language, write one of the sample games in it, or say what stopped it

## 2. Read our own history and tree

- [ ] 2.1 Read every postmortem under `openspec/postmortems/` and `retire-the-framework-vision`; say for each whether its finding binds a description language, and which aim; rewrite "What the earlier withdrawals bind"
- [ ] 2.2 Inventory, by query, what a game declares that the engine consumes, and how far the premise audit in `firing-replay.ts` reaches

## 3. Three experiments

- [ ] 3.1 Experiment A: trace dealt boards at each tier for every game with a technique ladder; a table per game, and whether the traces separate tiers and games
- [ ] 3.2 Experiment B: the rules of the six sample games in a first vocabulary, on paper, with every rule that did not fit
- [ ] 3.3 Experiment C: three techniques from three games stated so a solver checks each sound on small boards, passing for the three and failing for a planted unsound variant

## 4. Report

- [ ] 4.1 Answer the seven questions of `design.md`, each from the steps it rests on, saying what was not checked
- [ ] 4.2 The recommendation, and the owner's decision recorded in the report
