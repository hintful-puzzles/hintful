# slice-presets-by-the-axes-a-game-varies — tasks

## 1. Take the population before designing

- [ ] 1.1 Print, for **every** game, its leaf presets and the gate slice's
      current pick. Solo's is in `proposal.md`; the rest is unmeasured, and the
      design should answer the collection rather than the one game that exposed
      it.
- [ ] 1.2 Classify what each game loses: a game whose presets vary only in size
      loses little, a game whose presets carry a *mode* (Solo's X/Killer/jigsaw,
      Unequal's Adjacent, Loopy's fifteen grid types) may lose a whole rung set.
      Say which games are in the second group and why — by reading the params,
      not by grepping preset titles.
- [ ] 1.3 **Check the instrument**: the slice is a pure function of
      `presets()` and the difficulty contract, so the printout can be taken
      directly. Give it a known positive — a game you expect to lose nothing
      should show a slice equal to its preset list.

## 2. Design the derivation

- [ ] 2.1 Derive the axes from the params the presets carry. Two presets
      differing in one field are two points on that field's axis; the slice
      wants one preset per distinct combination of the fields that actually
      vary. **No roster, no per-game declaration** — that is the manifest shape
      this repo has reversed three times.
- [ ] 2.2 Bound it. The naive derivation is a cross product and Solo would go
      from 6 to most of 18. Decide what bounds it — one preset per *value* of
      each axis rather than per combination is the obvious cheap form, and it
      is probably enough to catch "no Killer board is ever walked".
- [ ] 2.3 Keep the `SEARCH_PLANNING_GAMES` exception intact and check it still
      binds: a searching hint pays for board size twice over, and this widening
      is exactly the direction that made it necessary.

## 3. Measure, then accept or defer

- [ ] 3.1 Time the affected guards before and after on an **idle** box, and
      record free memory and swap beside the figure. A contended timing measures
      the contention (`AGENTS.md` § "Test discipline").
- [ ] 3.2 If the cost is too high per commit, apply the deferral rules rather
      than narrowing silently — and remember the four conditions the
      `build-pipeline` spec attaches to anything deferred to push, including
      that a test fails if the toggle ever leaks into CI.
- [ ] 3.3 Whatever is decided, **say what still covers the configurations the
      slice does not walk**, at the site, per `testing/slow.ts`'s existing rule.

## 4. Prove it works

- [ ] 4.1 The guard this change is really adding is "a mode is walked". Prove it
      fails: break a Solo Killer cage sentence, confirm a cross-game guard goes
      red where it is currently green. A widening nobody has seen catch anything
      has not been shown to work.
- [ ] 4.2 Carry the vacuity guard: assert how many presets the slice returned
      across the collection, so a derivation that silently collapsed to one per
      game cannot report health.

## 5. Close out

- [ ] 5.1 Spec delta against whichever `ts-engine` / `build-pipeline`
      requirement governs the cross-game walk's population.
- [ ] 5.2 Update `docs/games/testing.md` § "How a cross-game guard finds its
      population" — it is the followable form of exactly this rule.
