## 1. Design

- [ ] 1.1 Read every game whose hint can refuse with a doomed verdict and whose
      `findMistakes` misses it; list them in `design.md`.
- [ ] 1.2 Decide between a moveless step and a new result arm, and how the
      marks cross the worker boundary.
- [ ] 1.3 The out-of-reach wording for a check, with the owner.

## 2. Engine

- [ ] 2.1 Doomed / not-doomed on every refusal kind, and on
      `puzzleHintRefusal`.
- [ ] 2.2 A refusal that carries words with references, displayed with its
      marks and held to them by the binding walk.
- [ ] 2.3 One midend check behind Check & Save and Check without saving:
      mistakes first, then a doomed hint verdict refuses to save.

## 3. Callers

- [ ] 3.1 Pegs' cut-off refusal outlines the frozen pegs.
- [ ] 3.2 Inertia's dead-end refusals outline what they are about.
- [ ] 3.3 Help: the check's new refusal in `help/features.md`; both games'
      Hints sections say what the refusal marks.
- [ ] 3.4 Run the app: Check & Save on a lost Pegs board, and on a
      contradictory board in a deductive game.
