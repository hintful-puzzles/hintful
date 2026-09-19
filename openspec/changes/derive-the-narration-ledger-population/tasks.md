# derive-the-narration-ledger-population — tasks

- [ ] 1.1 Key `ledgerUsed` by `(entry index, game id)` and assert every listed
      game reached its entry. Make the failure message ask for the *measurement*
      that justifies a listing, not just its removal.
- [ ] 1.2 Prove the new guard fails before trusting it: add a game to the shared
      Latin chain entry that does not speak the sentence — Mathrax is the known
      negative, measured at 0/100,249 — and watch it go red. Restore.
      A guard nobody has seen fail is a guard nobody has seen work.
- [ ] 1.3 Run it and read what it finds. The prediction is that the six games
      still listed on the shared Latin chain entry are not all reaching it; for
      each one that is not, remove the listing and record the walk beside the
      entry, in the shape the Mathrax removal already uses.
- [ ] 1.4 Watch for the opposite failure while doing 1.3: a game that *does*
      speak the sentence but only on a preset or tier the gate's walk skips
      would look dead and is not. Before deleting a listing, widen the walk for
      that game (every leaf preset, both auto-pencil settings) and say which
      walk found nothing — the deletion's evidence is the wider walk, not the
      gate's.
- [ ] 1.5 Correct the doc comment: say that the roster is held to what the walk
      speaks, and that a shared-engine sentence's roster is the set of games
      that actually reach it rather than the set that could.

## Watch out for

**The instrument is a walk, and a walk's reach is a parameter.** This whole
change turns on "did game X ever speak sentence Y", which is a *negative* over a
sample. `AGENTS.md` § "Carry a vacuity guard" applies to the fix itself: the
close-out case already floors `linted` at 2000, and that floor is what stops the
stricter check passing over a walk that examined nothing. Check the floor still
binds after the change, and raise it if the per-game keying makes it cheap to.

**Do not `-u` your way past a red.** A red here is the finding.
