## 1. Measure and decide

- [x] 1.1 Re-take the review's counts at HEAD: `DIFF_*` constants against
      `tiers`, `sizes` against `paramConfig` bounds, `name` and `family` in
      both places, the pass-through `interpretMove`s, `animLength: () => 0`.
      At `834bc5759` (2026-11-21): 33 games kept `DIFF_*` constants, 19 of
      them naming another tier than the description's at that index (Unruly's
      `DIFF_EASY` held Normal); 7 pass-through `interpretMove`s (Flood, Light
      Up, Magnets, Netslide, Palisade, Same Game, Separate); 34
      `animLength: () => 0`; `name` differed in one game (Numgame/Target);
      `family` held two taxonomies in all 65; 20 descriptions wrote a
      placeholder `max` (99999, 2^31−1 or 2^53−1).
- [x] 1.2 Decide whether `sizes` builds the bounds or leaves the description,
      and what `family` means in each place; record why.
      **`sizes` does neither: it is a different fact.** Measured against every
      game's `paramConfig` at runtime, the description's sizes name things no
      param holds (Ascent's `moves`/`top`, Blackbox's ball counts, Undead's
      monster counts, Path's `step`) and bound the rest by what the soundness
      check can build, not what the app deals: Solo `c` 2–5 against 2–255,
      Salad 3–10 against 3–100, Adjacent/Unequal 3–16 against 3–31. Building
      the Custom dialog from them would cut player bounds by an order of
      magnitude; dropping them would leave the soundness check no worlds and
      the compiler no size names. So `sizes` stays, defined as the worlds the
      rules are stated over (schema and `described-ladder`), and the
      placeholder `max` goes: `max` is optional, absent where the rules set no
      bound. Wordtrail's 1–12 against 2–8 and Crossing's 1 against 2 are then
      no drift: the rules are checked over more worlds than the app deals,
      which costs nothing. The direction that would be a gap, a description's
      `min` above the app's (Mines `w` 3 against 1, Pegs 2 against 1,
      Separate `k` 2 against 1), is in games whose descriptions state no
      technique the check could miss there.
      **`name` and `family` leave the description**: `name` had no reader;
      `family` was the research taxonomy (what the player produces), read by
      `inherit.ts` and by the "is out" wording rule, under the catalog's name
      for a different taxonomy. It is renamed `produces`.

## 2. One copy each

- [x] 2.1 Tier indices from `tiers`: the compiler emits `TIER` (and `SCALE`
      for other scales); every `DIFF_*` tier constant is defined from it under
      its tier's name; verdicts past the tiers are written from
      `tiers.length`. `src/engine/edge-clue-latin/` takes its tiers at
      runtime from two games, so its constants keep their numbers under the
      tier names.
- [x] 2.2 Size bounds: see 1.2; placeholders removed, `max` optional.
- [x] 2.3 One `name`; `family` settled (`produces`).
- [x] 2.4 `playedByTargetVerbs` supplies `interpretMove` from `targetVerbs`;
      `animLength: () => 0` dropped.
- [x] 2.5 Plant a drift (a tier constant naming another tier, a bound
      disagreeing) and see what now refuses it. In Tents:
      `DIFF_NORMAL = tents.TIER.easy` and `DIFF_PLANTED = 1` failed
      `tier-constants.test.ts`, naming each; `tents.TIER.hard` failed the
      typecheck; a `name:` put back in the description failed
      `npm run describe` on the schema. A bound disagreeing has nothing to
      refuse it, by 1.2: the two bounds are different facts. The scan reads
      `const DIFF_*` only: Galaxies' tiers were an enum, whose `Normal` held
      Easy; it is now an object read from `TIER`, and no other game keeps
      tier indices in an enum (`git grep -n "enum .*Diff" -- src/games`).

## 3. Finish

- [x] 3.1 Spec deltas where a requirement moved; guides that named the
      removed copies.
- [ ] 3.2 Commit, push, archive.
