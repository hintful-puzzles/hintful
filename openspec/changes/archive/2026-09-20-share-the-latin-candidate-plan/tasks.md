# share-the-latin-candidate-plan — tasks

`design.md` holds the per-field verdicts, the sequencing and the two conditions
under which this change should be killed rather than finished. Read § 5 first,
then § 6, which records what the re-measurement did to the proposal's premises.

## 1. Re-measure before designing against the counts

- [x] 1.1 Take each population **by reference, not by grep**. Done 2026-09-20;
      the numbers and what moved are `design.md` § 6. Seven games walk a
      candidate plan; **six** take plain row/column regions (the proposal said
      four — Group spells it `regions`, Salad `saladRegions`), six take
      `singleReasonOf`, six shade a hidden single by its line. Solo is the only
      game outside all three.
- [x] 1.2 Kill conditions checked. Neither holds: the preset serves six games,
      not two (§ 5 bullet 1 clear). Bullet 2 does not arise, because **D3 is
      declined on its premise rather than on a per-game hook** — see § 6.

## 2. The walk passes the firing's cell (design D3) — DECLINED

- [x] 2.1–2.4 Declined, with the measurement, in `design.md` § 6 D3. `cellsOf`
      preserves first-appearance order, so `cellsOf(marks)[0]` **is**
      `{ x: marks[0].x, y: marks[0].y }` for every firing that has ever run:
      the defect the finding names cannot happen, and a firing that spans cells
      has no single acted-on cell for the walk to pass. Task 2.3's falsification
      is therefore unsatisfiable, which is the signal that stopped it.

## 3. Derive the obvious-clean region phrase (design D4) — re-founded

- [x] 3.1 The proposal's premise ("Solo derives the phrase from the regions it
      declares") is false: `noRepeatRegionNames` is a hand-written list beside
      `regionsOf`, not a derivation from it (`design.md` § 6 D4). The phrase is
      instead removed **structurally**: the preset builds both setup sentences
      from the game's `{ noun, placedVerb }`, so a game on it cannot state the
      region phrase and cannot state a wrong one. The two words stay parameters.
- [x] 3.2 Byte-identical: the five games that typed "row or column" produce the
      same two sentences, asserted by their unchanged hint snapshots.
- [x] 3.3 Solo's parallel list filed as its own change (`derive-solos-region-names`).

## 4. The row/column preset (design D1, D2)

- [x] 4.1 `runLatinCandidatePlan` over `runCandidatePlan`, supplying `regionsOf`,
      `singleReason`, the hidden-single placement area and the setup sentences.
      No `latin: true` flag. A game that cannot take it is refused **by the
      checker** (`NarratesSingles<Reason>`), not by a convention.
- [x] 4.2 Converted: Keen, Unequal, Mathrax, Towers, Group, Salad. **Salad is
      on it too** — the proposal expected it to stay behind, but its regions do
      not differ (only its note encoding and its setup, both already plan
      fields). Solo stays on the general entry.
- [x] 4.3 Proved the preset fails: keying the frontier guard's population on the
      wrong string dropped six of seven games and the guard went red; and the
      converted games' hint snapshots are the net for the regions themselves.

## 5. Close out

- [x] 5.1 Every converted game is byte-identical: all six games' suites and
      every hint/render snapshot passed **unchanged**, with no `-u`. Nothing
      moved, so there is no snapshot to explain — which is what D5 asked for.
- [x] 5.2 `npm run test:slow -- <the six games> <the two engine files>`: 23 files,
      510 tests, all passing. **It vouched for nothing extra**, and saying so is
      the point: none of the six references `engine/testing/slow`, so the slow
      tier runs them identically to the gate (510 = the six games' 486 plus the
      two engine files' 24). The assurance here is the gate and the unmoved
      snapshots, not this.
- [x] 5.3 `docs/games/hints.md` repointed: the "genuinely decides" sentence no
      longer lists regions unconditionally, the `regionsOf` paragraph says the
      preset supplies them, and a new § "The row/column preset" holds the
      per-field table. `docs/games/engine-catalog.md` gained the preset.

- [x] 5.4 Ran the app (Chromium, dev server), because the sentences and the
      shading are player-visible even when byte-identical. Mathrax: the populate
      opener, the obvious clean reading "…already standing in each cell's row or
      column" (Mathrax's two words, the preset's phrase), its own `6+` clue arm,
      naked singles and dup culls. Unequal: a hidden single narrated "In this
      column, 1 can go in only this cell…" with **the whole column shaded as
      evidence** and the target cell outlined, as one two-step journey — the
      evidence line being exactly what the preset now supplies.

## 6. Fall-out

- [x] 6.1 `hint-frontier.test.ts`'s `FRONTIER_GAMES` keyed on `runCandidatePlan(`
      and lost six of its seven games to the rename. Re-keyed on the shape both
      entries share and cross-checked against a second derivation; both halves
      proved to fail. Spec scenario added.
- [x] 6.2 The two `ts-engine` requirements that named the general entry point in
      prose are repointed to "the shared candidate-plan walk", so the spec does
      not key on a name either.
