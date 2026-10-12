# clusters: what the cut removes

Before: 17754 bytes, 21 requirements, 34 scenarios.
After: 13582 bytes, 17 requirements, 25 scenarios.

| Requirement (title as it stands) | What happens | Where it is stated instead |
| --- | --- | --- |
| Rules: Clusters' findMistakes reports each tile the answer contradicts | one scenario cut ("The next move puts the wash away") | `ts-engine`, "The midend shows mistakes until the next transition" |
| Params: Clusters' parameters are a width, a height and a difficulty | cut to one sentence ("An ID that carries no difficulty SHALL decode to Easy."), which stands as a short requirement of its own under a new title, "Params: A Clusters game ID that carries no difficulty is Easy", with the scenario "An older game ID still resolves" | the fields: `paramsCodec(defaultParams, [dims(paramConfig), choice(paramConfig, "d", "difficulty", DIFF_CHARS, { full: true })])`, `src/games/clusters/state.ts:130`; the square fallback and the round trip: `engine-params`, "The codec grammar is a prefix, tagged segments, flags and letters"; the unknown letter: `engine-params`, "A params string is read whole or refused", whose own scenario is a game with tiers `e` and `t`; `src/engine/params-stability.test.ts` holds the strings |
| Params: Clusters refuses to generate Normal on a board too small for it | cut to its first sentence, joined to "Params: Clusters refuses a board size that has no puzzle"; scenario dropped | `engine-difficulty`, "An unbindable tier is refused, not silently downgraded", which has the same scenario with no game named |
| Params: Clusters writes its difficulty as `de` or `dt` | removed | `DIFF_CHARS = "et"` and `choice(…, "d", …, { full: true })`, `src/games/clusters/state.ts:32` and `:132`; `src/engine/params-stability.test.ts` holds `7x7de`, `7x7dt` and `7x7` |
| Generation: Clusters offers difficulty tiers over its two deduction levels | three sentences cut (one solution; Easy soluble by the single-cell rule; Normal not) and one scenario ("The harder tier needs the deeper reasoning") | `engine-difficulty`, "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates", whose first scenario is the one cut |
| Generation: Every generated Clusters board is solvable by narratable deduction | cut to one sentence ("An Easy board SHALL additionally need no lookahead step at all."), joined with its scenario to "Hint: Solve and the hint use the deeper rung at every tier" | `engine-difficulty`, "Narratable-deduction generation policy" |
| Controls: Clusters is painted by click, drag and keyboard cursor | one sentence cut ("The keyboard cursor SHALL place blue, red or blank via dedicated keys.") | `targetVerbs.keyOnly`, `src/games/clusters/index.ts:158`; and the next requirement of this spec |
| Hint: Clusters provides an explained deduction hint | first sentence and first scenario cut | `engine-hints`, "The solver and the hint are two projections of one deduction engine" |
| Hint: A Clusters hint is refused where it cannot deduce | cut to its first sentence, joined to "Hint: Clusters provides an explained deduction hint"; both scenarios dropped | `engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board before asking the game" (both scenarios are its `FIX_MISTAKES_FIRST`); `engine-params`, "A board loads only if the game's own solver solves it" |
| Look: Clusters draws its two colors as the collection's two-state pair | one sentence cut ("There SHALL be no interpolated move animation.") | `animLength: () => 0`, `src/games/clusters/index.ts:510` |

Untouched, eleven: both Description requirements, "Rules: The cluster rules
decide when a board is solved", "Params: Clusters refuses a board size that has
no puzzle" and "Hint: Solve and the hint use the deeper rung at every tier"
(each only gains a sentence), the two other Controls requirements, and four
other Hint requirements.

## Kept against the earlier reader

- **Controls: Clusters' number keys set the cursor's square outright** (the
  reader: cut to one sentence). Kept whole. "SHALL make no move on a given dot
  or on a square already so" is `paintWith` (`index.ts:126`), a hand-written
  function, which the guide says a spec states. "With the cursor hidden, the
  key SHALL only show it" is not what `engine-input`, "The engine owns a
  declaring game's press and select keys" says: that speaks of the first
  *select* key, and of a verb's own key says only that it applies the verb.
  That leaves the first sentence, the key list, which is a copy of
  `keyOnly[].keys`; it stays only because "Each" and "the key" in the two
  sentences after it have no other antecedent, and the brief allows no
  rewording. A real cut would reword and save about 110 bytes more.
- **Generation: Every generated Clusters board…**: the reader allowed `go`. The
  Easy sentence is kept: it follows from three requirements in two files, and
  none of them says it.
- **Hint: A Clusters hint shows its reasoning on the board** and **Hint: A
  lookahead deduction is one step showing its whole forcing chain** (the
  reader: a third and a half are copies of the legend at `index.ts:491` and of
  `engine-hints`, "A Tactic's chain is shown on the board" and "A chain's order
  is declared and drawn as an ordinal"). Untouched: each copy is a clause in a
  sentence that also carries the game's own (the hue the live-error frame does
  not use, the small what-if piece), so no whole sentence or scenario comes
  out. The same holds of "in the necessity voice" in "Hint: A Clusters hint
  step names the rule…", and of the click half of the cycle sentence in
  "Controls: Clusters is painted…".
- **Rules: Clusters' findMistakes…**, first sentence (the reader: `ts-engine`,
  "A mistake check compares with the one answer, hidden or not"). Kept: the
  second sentence, the game's own fallback, begins "On any other board".

## What a session loses

- What a game ID looks like (`7x7dt`, width, height, `d` and a letter, short
  form without it): `src/games/clusters/state.ts`, `DIFF_CHARS` and the codec,
  or the `params-stability` snapshot.
- That an unknown tier letter is refused: `engine-params`, "A params string is
  read whole or refused".
- That the Normal size refusal is for generation only and a saved game still
  loads: `engine-difficulty`, "An unbindable tier is refused, not silently
  downgraded". The joined sentence now reads as though it refused always.
- That every board has one solution and a Normal board cannot be finished by
  the single-cell rule: `engine-difficulty`, the two requirements named above.
  No scenario is left for Normal.
- That the game's own hint refusal is not reached on a board that loads, and
  that a wrong tile gets the "fix the highlighted mistakes" banner instead:
  `engine-hints`, "The midend SHALL refuse a hint…", and `engine-params`, "A
  board loads only if the game's own solver solves it". The kept sentence
  alone reads as a refusal a player meets.
- That the hint and the solver are one engine: `engine-hints`, "The solver and
  the hint are two projections of one deduction engine".
- That the Check & Save wash goes at the next move: `ts-engine`, "The midend
  shows mistakes until the next transition".
- That moves are not animated: `animLength` in `src/games/clusters/index.ts`.
