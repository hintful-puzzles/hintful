# add-loopy-hint — tasks

A stub. Read [`docs/games/hints.md`](../../../docs/games/hints.md) first; it is
the procedure, and `AGENTS.md` § "Hint quality bar" is the bar. Flesh these
tasks out once task 0 is done. `add-seismic-hint`'s `tasks.md` and
`findings.md` are the shape the last one took.

## 0. Re-take the claims, and the baseline

- [ ] 0.1 Confirm Loopy is still hintless, and re-read the proposal's dated
      claims against the code: no `findMistakes`, what `lineErrors` flags, the
      threshold loop, the whole-frame renderer, the presets.
- [ ] 0.2 Read `findings.md` for `add-tracks-hint`, `add-bridges-hint` and
      `add-seismic-hint`, and Lightup's hint as the met bespoke-loop example.
- [ ] 0.3 Baseline: production lines per Loopy file, taken the way Seismic's
      were (raw `git diff --numstat`).

## 1. Engine refactoring survey

- [ ] 1.1 For each place the proposal names, and anything else Loopy would
      write that another game already has: extract, break an assumption, or
      decline with the reason recorded. Take populations by reference, not by
      name.
- [ ] 1.2 Scaffold any refactoring that is its own coherent unit as its own
      change, and decide whether it lands before the hint.

## 2. The hint

- [ ] 2.1 Decide the mistake check (`findMistakes` against the solution, or
      not) and how the hint's premises stay sound. Record the reasoning.
- [ ] 2.2 Deduction projection, narration, overlay and wiring, per
      `docs/games/hints.md`. The generator's path must stay unchanged, and the
      frozen differential is the proof.
- [ ] 2.3 Settle the Check/Tactic/Search reading of `linedsfDeductions` and the
      Tricky inferences in `findings.md`, measured against the solver the way
      Seismic's `attempt` was.
- [ ] 2.4 Cover every tiling in the hint's corpus test, including the
      triangular grid, where the dot degree is highest.
- [ ] 2.5 Spec delta for the hint, and remove `skip_specs`.

## 3. Report and accept

- [ ] 3.1 `findings.md`: the same numbers as the last three, the refactoring
      survey's taken and declined, and the cost on the largest boards with the
      machine's conditions.
- [ ] 3.2 Update `docs/games/solver-and-generator.md`'s bespoke-loop table,
      including the stale "nothing may ship hintless" sentence.
- [ ] 3.3 Run the app on at least a square, a triangular and an aperiodic board,
      and read real plans. Add a Hints section to `help/games/loopy.md`.
- [ ] 3.4 Add anything the guides did not say to `docs/games/hints.md` and
      `docs/games/rendering.md`.
