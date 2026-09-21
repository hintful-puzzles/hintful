# add-guess-hint — tasks

**Nothing here is started.** The first task is a decision about notation, and
the change should not begin until the input-model question it depends on has
been settled (proposal, § "Its bearing on the input model").

## 1. Decide, before building anything

- [ ] 1.1 **Does Guess get a notation, and which one?** Per-slot ruled-out
      colors (pencil marks — the collection's usual shape), a per-color "proven
      absent" mark (the Wordle shape), or both. Quality-bar rule 6 forces the
      question: without one, a hint narrating an elimination draws a fact the
      player cannot keep.
      **The proposal's rule table is the evidence, and it points at per-slot.**
      The one high-frequency sound reading is positional (rule B, `black = 0` ⇒
      `npegs` eliminations at once, ~a third of the pair space), and a per-color
      strike cannot hold *"not this color, here"*. Re-run the brute force before
      relying on the ranking if `markPegs` has moved.
      **Still open, and deliberately so** — the owner was asked on 2026-09-21,
      alongside the input-model questions, and kept it here rather than folding
      it into `compose-guess-rows-without-dragging`. Two things changed under
      it: `encodeUi`/`decodeUi` now exist, which any notation needed as a
      prerequisite and which are no longer this change's to build; and the
      board's palette column survives as tap-to-place, so **whichever notation
      ships, deleting that column is a step of this change** (the two surfaces
      are one keypress today only because neither holds state the other lacks —
      `openspec/specs/guess/spec.md` and `docs/games/input.md` § "The on-screen
      keypad" both record why).
- [ ] 1.2 **The usual escape is closed.** Guess has no `difficulty` contract, so
      "demote the tier that needs the notation to `Unreasonable` and refuse
      there" is not available. Either the notation happens or the hint says very
      little; decide which, and say so rather than discovering it late.
- [ ] 1.3 **What the hint says when nothing is forced**, which will be most
      turns. Refuse? Or lead with the one thing the game can prove, Inertia-
      style, and then narrate a probe by the consequence it actually has? A
      probe is not forced, so rule 5 governs every sentence about it.
- [ ] 1.4 **`computeHint` and the `'h'` key.** Two things called "hint" in one
      game the day `Game.hint()` is declared, and the app's bare `h` reaches the
      wrong one because Guess consumes the key. Keep the row-filler under
      another key, fold it into a last resort, or retire it.
- [ ] 1.5 **Read the corpus audit before assuming this is the right next hint.**
      It puts Guess in class ∅ and calls the class the wrong pick for assessing
      the framework. That verdict is not overturned by this change; if the
      reason for doing Guess is no longer the UX question, re-read the audit's
      table and pick from it instead.

## 2. If it goes ahead

- [ ] 2.1 Whatever §1 settled, notation first. A `pencilMode` on the `Ui`
      enrolls Guess in the Marks key with no line of its own (`takesNotes`), and
      the color keys toggle marks in notes mode exactly as Map's do.
- [ ] 2.2 The pencil-mode indicator's geometry, if notes are the answer — Guess
      has a half-tile border, so check `pencil-indicator-placement.test.ts`
      before assuming it fits.
- [ ] 2.3 The deduction itself. There is **no solver to project from**: unlike
      every recent hint, this is built rather than derived, and the doctrine
      (one engine, two projections) has to be established here rather than
      followed.
- [ ] 2.4 Drawing the marks. The peg is a circle and the slot is a tile; a
      ruled-out set of up to ten colors has to fit inside one without being
      mistaken for a placed peg — the same trap `colors()` already notes for
      `COL_FLASH` and `COL_HOLD` ("they sit *behind* a peg and must not be
      mistaken for one").

## 3. Verify

- [ ] 3.1 Every sentence the hint utters is checked in code — particularly any
      claim that a color is absent, which Mastermind's count-based feedback
      supports only in narrow cases (upstream's `provenAbsent` is one).
- [ ] 3.2 The cross-game hint guards arrive for free the moment `hint()` is
      declared, and several will have something to say about a game whose
      "plan" is a probe. Expect `hint-resume.test.ts` (recompute stability) to
      be the hard one: a probe recomputed after the player guesses something
      else must not swing.
- [ ] 3.3 Run the app. A hint whose reasoning the player cannot record is the
      failure this change exists to avoid, and no test tier can see it.

## 4. Record

- [ ] 4.1 `docs/games/hints.md`: Guess as the case where the two halves of a
      hint have different standards of proof, if that survives the design.
- [ ] 4.2 Spec deltas: `guess`, plus `ts-engine` if anything is extracted.
