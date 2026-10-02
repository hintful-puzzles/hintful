## 0. Census

- [ ] 0.1 Take every hint sentence template in the collection, by the shape of
      a `phrase` call that a step's words come from (not by function name:
      AGENTS.md § "A scan that keys on a name"), and classify each as: fits
      look/follows/move as written, fits with a declared relation, or a
      genuine exception, with the reason. Record the counts in `design.md`; the
      proposal's "large majority" is a claim until then.
- [ ] 0.2 For each relation, list the games that need it, and whether any game
      needs a connective the fixed set lacks (the owner's decision).

## 1. Design

- [ ] 1.1 `design.md`: the parts type, where it sits in `HintStep`, how the
      engine composes text and marks from it, how journeys and refresh
      (`Narration.narrow`) carry over, and the exception declaration.
- [ ] 1.2 The engine-owned reference to the step's move, and how a renderer
      maps it onto its existing rings (Pegs' whole-jump ring is the first case).

## 2. Engine

- [ ] 2.1 The parts type and composition, with the candidate walk's ", so …"
      ending rebuilt on it rather than beside it.
- [ ] 2.2 The exception declaration, derived and asserted exact.
- [ ] 2.3 The mechanical half of rule 2 in the hint-quality walk: a step whose
      relation is *forced* while the game reports another good move fails.

## 3. Games

- [ ] 3.1 Convert the games in batches by shared hint machinery, re-reading
      every converted sentence out loud (docs/games/hints.md § "Read one plan
      out loud").
- [ ] 3.2 Black Box's hint, written in the new shape from its first commit.

## 4. Docs and acceptance

- [ ] 4.1 docs/games/hints.md: the five rules in the general narration
      section, the parts as the way to follow them, and the exception path.
- [ ] 4.2 Run the app on a sample of converted games; owner acceptance on the
      wording.
