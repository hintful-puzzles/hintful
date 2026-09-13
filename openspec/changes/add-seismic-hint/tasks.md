# add-seismic-hint — tasks

A stub. Read [`docs/games/hints.md`](../../../docs/games/hints.md) first — it is
the procedure; `AGENTS.md` § "Hint quality bar" is the bar. Flesh these tasks
out once task 0 has been done; `add-bridges-hint`'s `tasks.md` is the shape the
last one took.

## 0. Re-take the claims, and the baseline

- [ ] 0.1 Confirm Seismic is still hintless, and re-read what the audit says
      about it (ladder, `attempt` rung, generator gating, differential) against
      the code today.
- [ ] 0.2 Read `add-tracks-hint` and `add-bridges-hint`'s `findings.md`.
- [ ] 0.3 Baseline: production lines per Seismic file, taken the way Bridges'
      were.

## 1. Engine refactoring survey

- [ ] 1.1 List the hint machinery Seismic would write that Tracks and Bridges
      already wrote (the proposal names places to start). For each: extract,
      break an assumption, or decline with the reason recorded.
- [ ] 1.2 Scaffold any refactoring that is its own coherent unit as its own
      change, and decide whether it lands before the hint.

## 2. The hint

- [ ] 2.1 Recording projection, narration, overlay and wiring, per
      `docs/games/hints.md`; generator path unchanged.
- [ ] 2.2 Settle the Check/Tactic/Search reading of `attempt`, in
      `findings.md`, with its reasoning.
- [ ] 2.3 Spec delta for the hint, and remove `skip_specs`.

## 3. Report and accept

- [ ] 3.1 `findings.md`: the same numbers as Tracks and Bridges, plus what the
      refactoring survey took and declined.
- [ ] 3.2 Run the app and read real plans; `help/games/seismic.md` gains a
      Hints section.
- [ ] 3.3 Update `docs/games/hints.md` with anything the guide did not say.
