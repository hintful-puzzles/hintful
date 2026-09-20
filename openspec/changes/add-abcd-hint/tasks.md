# add-abcd-hint — tasks

Read [`docs/games/hints.md`](../../../docs/games/hints.md) and
[`docs/games/solver-and-generator.md`](../../../docs/games/solver-and-generator.md)
first, and keep them current as you go.

## 1. Certify the ladder before narrating it

- [ ] 1.1 Build `abcd-ladder.test.ts`: a firing census over the three
      techniques, per tier, derived from the solver rather than declared.
      `magnets-ladder.test.ts` is the nearest model.
- [ ] 1.2 Carry its vacuity guard — count the boards the census walked and
      assert the count. A census over an empty set reports health.
- [ ] 1.3 **Prove it fails**: delete a technique, watch the census go red,
      restore. Tracks proved a whole rung can be deleted with every test green.
- [ ] 1.4 If this turns out to be a change of its own, **split it out and say
      so** rather than folding a census into a hint change.

## 2. The ordering question — this is why the game was picked

- [ ] 2.1 Write down what the solver's sweep produces per pass, and what a
      person would do with it. The gap between those two is the ordering rule.
- [ ] 2.2 Decide where the rule lives: the candidate-plan walk, or the game. If
      the game, ask whether `pearl` and `tents` — the other two class-B
      solvers — would want the same rule. A population of three is enough to
      ask; it is not automatically enough to extract.
- [ ] 2.3 Whatever is decided, the plan must stay **recompute-stable**: a
      sweeping solver recomputed after a player's own move must not reorder into
      a different first step. This is the Inertia trap, guarded cross-game by
      `hint-resume.test.ts`, and a swept firing set is the likeliest place in
      the collection to hit it.

## 3. The candidate cube

- [ ] 3.1 Abcd's notes live in a `Uint8Array` cube (`cuboid(x, y, c, n, w)`),
      not a per-cell bitmask. Check whether `adaptiveMarkAll` and the candidate
      helpers fit it **before** writing a second version of either.
- [ ] 3.2 If they do not, state precisely what does not fit: `NoteEncoding`
      abstracts `bit(v)` and not where a note lives. Three games with three
      representations is evidence; act on it or record why not.

## 4. Narration

- [ ] 4.1 Three techniques to the Palisade bar. The counting argument (`runs`)
      is the one with no precedent: *"this run of 5 open cells can hold at most
      3 without two touching, the line needs 3, so every odd-length run is
      forced onto its even offsets."* Verify each clause in code — a counting
      claim is exactly the kind that reads plausibly and is false.
- [ ] 4.2 One firing = one journey, equivalent moves share a color.
- [ ] 4.3 Marks the player can make: Abcd has pencil marks, so confirm every
      premise is expressible in them.

## 5. Tests and cost

- [ ] 5.1 Enrollment is derived; declaring `hint()` joins every cross-game
      guard.
- [ ] 5.2 Tier-2.5 render scenario for a `runs` frame — the deduction with the
      least precedent deserves the reviewable snapshot.
- [ ] 5.3 Watch the cost. Abcd is not a searching planner; if its walk lands
      anywhere near `SEARCH_PLANNING_GAMES`, that is a finding about the
      ordering rule, not a budget to absorb.

## 6. Close out

- [ ] 6.1 Report the cost in the series' terms: game production lines, of which
      how many are the recording projection.
- [ ] 6.2 Spec deltas: `abcd` for the hint and the census, `ts-engine` if
      ordering moved into the plan.
- [ ] 6.3 Update the guides with what they did not tell you — in particular,
      `docs/games/hints.md` says nothing today about a solver that sweeps.
- [ ] 6.4 Run the app.
