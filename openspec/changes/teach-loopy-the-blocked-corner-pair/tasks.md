# teach-loopy-the-blocked-corner-pair — tasks

Read `proposal.md`, then `docs/games/solver-and-generator.md` § "Divergence and what it
costs" and `docs/games/hints.md` on one firing being one journey — the rule this change
is pressing against.

> **§1 is a stopping condition, stated before the instrument.** If teaching the engine
> the pattern re-grades a material share of boards, §2 does not happen and the fallback
> in §4 does. A dishonest tier is worse than a narrow hint.

## 1. Measure the re-grading first

- [ ] 1.1 Find the configuration's frequency: over a corpus of square boards at every
      tier, how often does a clued face reach `clue = order − 1` with both edges at two
      of its dots blocked? A pattern that fires twice a board is worth a rung; one that
      fires twice a corpus is not.
- [ ] 1.2 Grade every board in the corpus with the current solver and with the pattern
      added, and report **how many change tier**. This is the number the stopping
      condition is about, so take it before writing any narration.
- [ ] 1.3 Check the instrument on a known positive: hand it the owner's configuration
      and assert the pattern fires. A sweep that reports "never fires" is indistinguish-
      able from one that is looking for the wrong shape.
- [ ] 1.4 **Decide, and write the decision down either way.**

## 2. The rung — only if 1.4 says proceed

- [ ] 2.1 Recognize the pattern and fire once, settling the whole face: the edge between
      the two blocked dots ruled out, every other edge a line.
- [ ] 2.2 Decide its tier by what it *replaces*, not by where it is easiest to put it.
      Placing it below the route it short-circuits is what re-grades boards; 1.2 says
      by how much.
- [ ] 2.3 Generalize past the square if 1.1 supports it — the argument is
      `clue = order − 1`, not the digit 3.

## 3. The narration

- [ ] 3.1 **The wording is settled** (owner chose it, 2026-09-18) and is not a draft to
      be re-opened while implementing:

      > Both ringed dots already have a line, and joining them directly would rule out
      > the 3's other two edges and leave it one short. So the loop has to take the
      > long way around this 3: the edge between the dots is out, and the other three
      > are lines.

      Three constraints it satisfies, each of which a rewrite would have to keep:
      it names the excluded edge as **"the edge between them"**, never "the top edge",
      because eighteen tilings have no top; it says **"already have a line"** rather
      than the owner's own "incoming", because the player sees lines on a board and not
      a direction of travel; and it gives **both halves** of the conclusion, since the
      whole value of the step is that the face is settled.
- [ ] 3.2 The digit is the only part that varies. The rule is `clue = sides − 1`, so a
      pentagon clued 4 loses exactly the same two edges and is still exactly one short;
      the sentence generalizes by substituting the number and nothing else.
- [ ] 3.3 The marks the sentence refers to must exist, or it names nothing: **both dots
      ringed**, the edge between them banded as ruled out, the other three banded as
      lines. One firing, so one journey.

## 4. The fallback, if 1.4 says stop

- [ ] 4.1 A hint-side recognizer: spot the three firings that make up the technique and
      emit them as one journey with the combined narration. Costs nothing in the
      generator, at the price of a second place that knows the technique — which must
      then be stated at both sites, because two descriptions of one technique drift.

## 5. Docs

- [ ] 5.1 `help/games/loopy.md` — the technique, in the "Most steps are the rules at
      work" list.
- [ ] 5.2 `docs/games/hints.md` — **the general lesson, whichever branch is taken**: an
      engine firing is not always a human technique, and a hint that narrates firings
      faithfully can still teach badly. This is the first case in the tree where the
      two came apart, and it is worth stating whether or not this particular pattern
      ships.
