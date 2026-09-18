# order-hints-from-the-frontier — tasks

Read `design.md` first, then `docs/games/hints.md` § "Recompute-stable plans" and
§ "A rung is not a premise, so return per premise".

> **The ordering half stopped on its own stopping condition (1.1).** A plan position
> offers a median of **one** firing, 63.8% offer exactly one, and **86.1% of the
> jumps that prompted this change were forced** — no nearer firing existed at that
> tier. So §2, §3.1, §3.2, §4.1, §4.4 and the §1.3 baseline are **not being done**,
> and the engine gains no enumeration hook. What shipped is the note placement
> (3.3, 3.6), its guard (4.2), and the rendered-frame check on a real board (6.3).
> **What remains live is 3.4, the delta narrowing 5.3 makes conditional on it, and
> 6.2.** The numbers, and the bias that makes them an upper bound, are in
> `findings.md`.

## 1. Measure before designing

- [x] 1.1 Candidates per plan position, and how often a jump had a nearer option:
      **p50 1, 63.8% exactly one, 13.9% of jumps avoidable** over 737 positions.
      The stopping condition fired; the ordering half stops here (`findings.md`).
- [x] 1.2 Note-to-consumer distance: median **15** firings, p90 **87**, max **143** on
      10×10 Hard. Confirmed, and separable from the ordering work (`findings.md`).
- [~] 1.3 Withdrawn with §2. The baseline existed to judge a candidate-enumeration
      hook that is not being built, and nothing that shipped touches the solve path
      the generator runs — `planSteps` reorders the *presentation* of an already-built
      plan.
- [x] 1.4 Census the defect with the exact read-set from `LoopyReason` plus the grid:
      **14.4%** of steps land ≥4 hops from the previous step, tail 14–17 hops. A tail
      defect, ~1 hint in 7. The first instrument was vacuous and was replaced; both it
      and the replacement are written up in `findings.md`.

## 2. The engine's ordering

- [~] 2.1–2.3 Withdrawn by 1.1. The engine gains no candidate-enumeration hook, no
      comparator and no game-supplied predicates: a plan position offers a median of
      one firing, so there is nothing to order. D1–D4 are kept as the record of what
      the rule would have been and what it would have had to respect.

## 3. Loopy adopts it

- [~] 3.1–3.2 Withdrawn with §2. Loopy's easiest-first tier sweep stands untouched,
      which is also why the generator's exploration order was never put at risk (D4).
- [x] 3.3 `planSteps` groups a note by first use rather than by `tickOf`, for notes
      whose sentence makes only **monotone** claims (D5; classified per sentence in
      `findings.md`, never from `fact.kind`), and never ahead of a note it cites.
      Notes shown with a firing that cites them: **24.1% → 80.9%**.
- [x] 3.6 The note joins its consumer's **journey**: every leg after the first carries
      `continuesPrevious`, counted from what actually landed rather than decided before
      the pushes — `placeCorner`/`placePair` return early on a note already present,
      and `chainPair` pushes a leg per link from inside them. Player-visible, as seen
      in the running app under 6.3: the note and the deduction it serves arrive as
      consecutive legs of one numbered journey ("Step 1 of 4") instead of as two
      unrelated hints. It does **not** reduce the press count, as a draft of this line
      claimed: the rail's stepper alternates show/apply per leg deliberately
      (`docs/games/hints.md` § "Highlight, never perform"), so a leg still costs a
      press to see and a press to apply. What the journey changes is adjacency,
      numbering, and that manual play and Auto-Hint carry the display through the legs.
- [~] 3.4 Carried to `sequence-hints-in-cell-games` rather than done here. Placing an
      expiring note at the **latest** step where its claim still holds would close the
      19% residual, but it concentrates notes onto their consumers harder, and the
      55-leg journey of 6.1 is the open question about exactly that. Landing it before
      anyone has judged whether a long journey reads as a wall would be building on an
      unvalidated answer. The spec was narrowed to what ships (5.3) so nothing promises
      it in the meantime.
- [x] 3.5 Answered by the before/after table in `findings.md` § "3.3 / 3.6 — the fix,
      measured", which splits the lag by the only line that matters: the monotone half
      is gone (the corner-heavy Tricky boards reach 100%), and the **19.1% residual is
      the expiring half**, which is exactly what 3.4 is for. Measuring the split
      separately first would have measured the same quantity twice.

## 4. Guards

- [~] 4.1, 4.4 Withdrawn with §2 — there is no comparator to guard, and D6 says a
      bare distance assertion with no availability clause would be worse than nothing.
- [x] 4.2 The note-placement guard, in `loopy-hint.test.ts`: the rate at which a note
      sits with a firing that cites it, plus the journey shape (one lead leg, every
      later leg flagged). A rate rather than a rule per note because three separations
      are legitimate — an expiring sentence, an ancestor pulled back ahead of its
      dependent, and a `chainPair` composition backing no single recorded fact — and
      stating the second per note would mean rebuilding the fact closure inside the
      test. **Seen to fail:** restoring the discovery-position grouping drops the rate
      to **40.3%** (437/1085) against the 0.5 floor. The margin to the floor is real
      but not wide, so a corpus change that adds pair-heavy boards should re-check it.
- [~] 4.3 Withdrawn with 1.3: no baseline, because nothing that shipped runs during
      generation.

## 5. Docs and spec

- [x] 5.1 `ts-engine` delta written, carrying the note-placement requirement only. The
      ordering requirement was withdrawn with §2 rather than softened, and the delta's
      own header says so: a requirement the collection cannot satisfy, and that nothing
      intends to implement, must not reach the live spec.
- [x] 5.3 Resolved by narrowing, the second of the two options it offered. The
      requirement and its second scenario now state what ships — an expiring note is
      **not** moved to its consumer and is offered at a position its explanation still
      describes — instead of 3.4's "at the latest such position", which no code
      implements. The live spec therefore says something true of the tree, and 3.4
      moves to `sequence-hints-in-cell-games` to widen it when it lands.
- [x] 5.2 `docs/games/hints.md` § "Give the facts a notation (Loopy)": the bullet that
      said *"place a note where its fact was found, not where it is used"* stated the
      **opposite** of what shipped, and a guide that contradicts a spec is worse than
      one that is silent. Rewritten around the rule that shipped — slot at first use,
      leave at `tickOf` only where `sentenceExpires` says the narration would go stale,
      and branch on the sentence rather than `fact.kind`. The other half of this task,
      how a game supplies its frontier metric, is withdrawn with §2 along with the D2
      history rule that governed it.

## 6. Report and accept

- [x] 6.1 Replayed 10×10 Squares Hard at a fixed seed — the owner's own seed is not
      recoverable from a screenshot — and reported it in `findings.md`. The reported
      sentence now opens a journey that ends in a line that cites it, 17 and 34 hints
      later than it used to appear. The replay also surfaced what the fix concentrates:
      a 55-leg journey at hint 112, filed under "Still open".
- [x] 6.3 Verified in the running app, on `7x7t0dt:c3a2a21a22121a2b22b3a21f3b3332b2c12a`
      — a Tricky board whose **first** Hint press opens a four-leg journey, found by
      scanning seeds for the earliest multi-leg note journey. Walking it: the rail
      reads "STEP 1 OF 4" with the note's sentence, the board draws the corner to
      place as a `COL_HINT` wedge with its clue outlined, applying it leaves the
      player's own note in its own color, and the next press reads "STEP 2 OF 4" with
      the just-placed note redrawn as cited evidence and its dot ringed. Numbering and
      note legs render correctly.
      **What the check corrected:** "the hint staying displayed across them" was the
      wrong expectation for the rail's button. `hideHintAfterStep` hides the plan after
      an applied step *by design* (`midend.ts`; `docs/games/hints.md` § "Highlight,
      never perform"), so the stepper alternates show/apply per leg and `Hint applied`
      shows in between. `continuesPrevious` carries the display through legs on the
      manual-play and Auto-Hint paths, not the stepper. 3.6's claim was reworded.
      The 55-leg journey of 6.1 was not reached in the browser; it is 6.2's question.
- [x] 6.2 Accepted (owner, 2026-09-18): *"Fabulous, accepted. I love it for Loopy!"*
      Accepted **on Loopy**, which is the whole of what shipped; the cell-game half of
      this task was never reached, because the mechanism it would have been judged on
      is the ordering that 1.1 withdrew. Whether cell games have the defect at all is
      the opening measurement of `sequence-hints-in-cell-games`.
