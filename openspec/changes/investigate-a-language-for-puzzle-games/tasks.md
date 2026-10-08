## 1. Read the prior art in full

- [ ] 1.1 Read each work in `design.md` § "Prior art" whole, and find the two
      named there as not yet found. Verify: the table is corrected where the
      full text differs from the summary it was written from.
- [ ] 1.2 For each language, write one of the sample games in it, or say what
      stopped it (`design.md` § "Decisions", the fixed sample). Verify: a
      section in the report with the description or the obstacle, per pair.

## 2. Read our own history and tree

- [ ] 2.1 Read every postmortem under `openspec/postmortems/` and
      `retire-the-framework-vision`, and say for each whether its finding
      binds a description language, and which aim. Verify: `design.md` § "What
      the earlier withdrawals bind" is rewritten from the reading.
- [ ] 2.2 Inventory what a game already declares that the engine consumes, by
      query. Verify: the report lists each with the query that finds it.

## 3. Three experiments

- [ ] 3.1 Experiment A, no language: for every game with a technique ladder,
      trace dealt boards at each tier and record which techniques fire, the
      size of each premise and the order. Verify: a table per game, and a
      statement of whether the traces separate the tiers and the games.
- [ ] 3.2 Experiment B: state the rules of the six sample games in a first
      vocabulary, on paper. Verify: the six descriptions, and a list of every
      rule that did not fit.
- [ ] 3.3 Experiment C: state three techniques from three games so that a
      solver checks each is sound on small boards. Verify: the check passes
      for the three, and fails for a deliberately unsound variant of one.

## 4. Report

- [ ] 4.1 Answer the seven questions in `design.md`, each from the tasks
      above, in a report in this directory. Verify: every answer cites the
      task it rests on, and says what was not checked.
- [ ] 4.2 The recommendation: build a language or not, what consumes it, what
      a paper would claim, and the next change if there is one. Verify: the
      owner's decision is recorded in the report.
