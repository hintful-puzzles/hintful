## 0. Census

- [x] 0.1 Take every hint sentence template in the collection, by the shape of
      a `phrase` call that a step's words come from (not by function name:
      AGENTS.md § "A scan that keys on a name"), and classify each as: fits
      look/follows/move as written, fits with a declared relation, or a
      genuine exception, with the reason. Record the counts in `design.md`; the
      proposal's "large majority" is a claim until then. (design D0,
      `census.tsv`: 564 of 623 fit as written.)
- [x] 0.2 For each relation, list the games that need it, and whether any game
      needs a connective the fixed set lacks (the owner's decision). (D0; the
      owner chose fixed move joins.)

## 1. Design

- [x] 1.1 `design.md`: the parts type, where it sits in `HintStep`, how the
      engine composes text and marks from it, how journeys and refresh
      (`Narration.narrow`) carry over, and the exception declaration.
- [x] 1.2 The engine-owned reference to the step's move, and how a renderer
      maps it onto its existing rings (Pegs' whole-jump ring is the first case).

## 2. Engine

- [x] 2.1 The parts type and composition, with the candidate walk's ", so …"
      ending rebuilt on it rather than beside it.
- [x] 2.2 The exception declaration, derived and asserted exact.
- [x] 2.3 The mechanical half of rule 2 in the hint-quality walk: a step whose
      relation is *forced* while the game reports another good move fails.
      (D6: a searching game's forced step must say its rivals lost; proved red
      on a planted Guess step and a planted setup outline.)

## 3. Games

- [x] 3.1 Convert the games in batches by shared hint machinery, re-reading
      every converted sentence out loud (docs/games/hints.md § "Read one plan
      out loud"). (Census of 39,113 walked steps before and after: every step
      has a form, 33,459 byte-identical, every changed template read.)
- [x] 3.2 Black Box's hint, written in the new shape from its first commit.
      (Every preset, 125 boards: all won by following it, no settled square
      contradicting the hidden balls; a planted peek at the hidden balls in its
      laser choice turned its "reads only the lasers" test red.)

## 4. Docs and acceptance

- [x] 4.1 docs/games/hints.md: the five rules in the general narration
      section, the parts as the way to follow them, and the exception path.
- [x] 4.2 Run the app on a sample of converted games; owner acceptance on the
      wording. (Black Box and Pegs run in Chromium; owner accepted 2026-10-02.)
