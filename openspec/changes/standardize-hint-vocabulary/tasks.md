# Tasks

## 1. Propose

- [x] 1.1 Take the census (2026-11-13, tree at `8ecc915a4`): `census/raw-1.md` to `raw-5.md`, every game's sentence templates with flagged clauses (`RULE-CLAUSE`, `MAYBE`) and vocabulary. Raw agent output; a sample of flagged clauses was checked against the source (Netslide, Tents, Towers, Inertia, Loopy, the engine's `populateText`), the rest was not. Its counts are the agents' own
- [x] 1.2 (2026-11-13: folded into `proposal-page.md` §2, by kind; the `MAYBE`s are settled in §3. The kind table samples the shapes, not all 33 would-break forms) Normalize the census by kind of deduction, one table: every game's sentence for a kind side by side (the engine's `compose` forms, `engine/hint-words.ts`, are the frame). Settle every `MAYBE` with the test in the proposal ("drop the clause: can a player who knows the rules still see why?"). Known: "so there is something to cross out" (`engine/hint-text.ts:113`, copies in Undead, Map and Salad) is one clause in about a dozen games
- [x] 1.3 (`proposal-page.md` §§1-4) Write the lexicon and each kind's one wording, with the clauses proposed for dropping, the ones kept as the reason, and the exceptions a game keeps and why
- [x] 1.4 (answered 2026-11-13, recorded at the top of `proposal-page.md`) Show the owner the page ("drop", "keep as the reason" and "reword" columns) and wait for their word. Netslide's sentence is not on it: `reword-the-netslide-hint`

## 2. Apply

Written 2026-11-13 once `build-hint-steps-in-the-engine` was archived, from the
owner's answers at the top of `proposal-page.md` (their word: "square" where it
can be used; every §3 verdict holds; two closings). Each task is its own commit,
with the pins and snapshots it moves regenerated in it; the sentences' words are
the only thing that changes.

- [x] 2.1 (done 2026-11-13, one commit a clause; Sokoban's three dead-end tails went with Numgame, Pegs and Samegame as the same shape; Palisade's "more than the k cells a region holds", which has no joined count, stays; Galaxies' and Cube's steps that lost their only look became `unshaped(…, "bare")` or `serves`) The drop rows of `proposal-page.md` §3, one commit a clause (the engine's ", so there is something to cross out" **done 2026-11-13**: the engine line, Map's, Undead's and Salad's own, 15 snapshot lines over 13 games, no other line moved; then Blackbox, the "Undo until" tails after checking each against "tell the player what to do", Galaxies, Group's "The grid shows", Tents' opener, Palisade's region size, Range, Inertia, Magnets, Cube)
- [x] 2.2 (done 2026-11-13; Boats' clause is ", and the water around it follows", because "and the water around it" after "must continue into X" reads as the boat entering water) The reword rows: Palisade's corner, Adjacent's bar, Boats' one "and the water around it", Group's law kept as the reason
- [ ] 2.3 The two closings: a game declares its off-mark word once ("grass", "water", "blocked", "empty") and the engine's arms and the games' sentences end "must be {off-mark}"; a struck value or note ends "must go"; "is out" and "rule out" retire (Mastermind keeps "is out", `proposal-page.md` §4)
- [ ] 2.4 The noun: "square" wherever it can be used. The engine's `cell` defaults (`engine/hint-text.ts`) become "square"; a game that keeps "cell" declares it with the reason its theme gives. The 19 games whose hint noun disagrees with their help page are read one by one; a help page that says "cell" where "square" would do is fixed with it
- [ ] 2.5 The kinds' standard forms in the engine's `compose` frame (`engine/hint-words.ts`): count met, count starved, last candidate, neighbor ruled out, would break; each game's own sentence for a kind replaced by the standard one where it says the same thing, and kept (with the reason) where its mark differs
- [ ] 2.6 A guard that fails on a retired phrase ("is out" outside Mastermind, "rule out", "something to cross out") over every game's sentences, seen to fail on a planted one; `docs/hints.md` states the lexicon (the noun rule, the closings, the kinds); help pages that quote a changed wording are updated in the same commit
- [ ] 2.7 Run the app on a board of each changed family and read each sentence against its frame
