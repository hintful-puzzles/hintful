# derive-the-narration-ledger-population — tasks

- [x] 1.1 Key `ledgerUsed` by `(entry index, game id)` and assert every listed
      game reached its entry. Make the failure message ask for the *measurement*
      that justifies a listing, not just its removal.
      Done, and the close-out case now **collects** its findings and asserts the
      whole list is empty rather than throwing at the first, so one run reports
      every dead listing instead of a queue of reruns.
- [x] 1.2 Prove the new guard fails before trusting it: add a game to the shared
      Latin chain entry that does not speak the sentence — Mathrax is the known
      negative, measured at 0/100,249 — and watch it go red. Restore.
      Watched: with Mathrax listed the close-out case fails naming
      `mathrax on /has just two \w+s left, so each forces the next/` and
      **nothing else**, so the same run that convicts Mathrax acquits the other
      six. That discrimination is the whole point of the re-keying, and the
      entry-keyed set could not make it.
- [x] 1.3 Run it and read what it finds.
      **The prediction was wrong, and the opposite of it was true.** The
      stricter check found exactly one suspect listing — Group on the shared
      Latin chain entry — and Group is **live**. Nothing was deleted; no entry
      in the ledger is dead.
- [x] 1.4 Watch for the opposite failure while doing 1.3.
      This is what actually happened, so the safeguard earned its place on its
      first run. Group speaks the chain sentence **only at 12x12 Hard**, 44
      times in 2,007 steps over 12 seeds. Its shipped presets stop at 8x8
      Tricky and 12x12 Normal, so 12x12 Hard is reachable only through the
      Custom dialog, and the gate's walk — every tier of the *first* preset,
      every other preset at *its own* tier — built it at neither. Every other
      point of Group's 7 presets × 5 tiers is zero, twelve seeds deep.
      (Group has no auto-pencil preference, so that axis does not exist for it;
      `pencil-prefs.ts`' `autoPencilPref` has no Group caller.)
      Every counter was handed a known positive first: Unequal, which gives
      `latinSolver` the identical `diffSet1 = diffForcing = DIFF_EXTREME` level
      map, produced 6 forcing records and 6 chain sentences at its Hard tier —
      so both the `reason.kind === "forcing"` key and the sentence regex find
      the thing when it is there.
      **The fix is therefore to the walk, not to the roster**: `lintCases`
      gained a third rule, the last preset at the hardest teachable tier, which
      is the one corner of `presets × tiers` the other two both miss.
- [x] 1.5 Correct the doc comment. Done, on all four surfaces the finding
      touched: `LONG_NARRATIONS` (the unit of both halves is the *listing*; a
      shared-engine roster is the games that reach the sentence in the walk,
      not the games that could; reading a roster off the solver is an
      inference), the entry itself (Group's measurement beside Mathrax's),
      `lintCases` and `LINT_ROUNDS` (the third rule, why a search tier is
      excluded, and the cost), and `docs/games/hints.md` § "Keep the narration
      terse".

## What this cost, and why three seeds

Measured 2026-09-20 on this box at load 5–6 (upper bounds; the ratios are the
usable part, same box and session): the narration-length block is 36 s without
the third rule, 43 s with it at one seed, 83 s at three. Four games hold ~40 s
of the 47, all for the same reason — generating a *large* board at a *hard*
tier is the expensive corner: Group ~18 s, Salad ~12 s, Solo ~6 s, Spokes ~3 s.

Three seeds rather than one because the close-out case decides a **negative**,
and a negative from a sample of one is not evidence: Group speaks its chain
sentence on three of six 12x12 Hard seeds, so at one seed whether a live
listing reads as dead is a coin flip on a fixed seed. A declared search tier is
excluded from the rule for the same accounting — it is where the cost is worst
(12x12 Unreasonable ran past 25 minutes for 12 boards and was abandoned,
against 116 s for 12x12 Hard) and where there is least to hear, because a hint
refuses on a board that needs a guess and the plan stops early (Group's 6x6
yields 27 steps at Unreasonable against 253 at Hard).

## Watch out for

**The instrument is a walk, and a walk's reach is a parameter.** This whole
change turns on "did game X ever speak sentence Y", which is a *negative* over a
sample. `AGENTS.md` § "Carry a vacuity guard" applies to the fix itself: the
close-out case already floors `linted` at 2000, and that floor is what stops the
stricter check passing over a walk that examined nothing.

It binds, and it proved it: a `-t`-filtered run of the close-out case alone
skipped every per-game walk, and the floor caught `linted === 0` rather than
reporting eleven dead entries. Per-game keying made a **second** floor cheap and
it is now carried too — each listed game must have walked more than 200 steps,
against a measured range of 320 (Subsets) to 3,007 (Solo) — because the
collection-wide floor is met many times over by the games that *did* walk and so
can say nothing about one that did not.

**Do not `-u` your way past a red.** A red here is the finding.
