# Tasks

## 1. Propose

- [x] 1.1 Take the census (2026-11-13, tree at `8ecc915a4`): `census/raw-1.md` to `raw-5.md`, every game's sentence templates with flagged clauses (`RULE-CLAUSE`, `MAYBE`) and vocabulary. Raw agent output; a sample of flagged clauses was checked against the source (Netslide, Tents, Towers, Inertia, Loopy, the engine's `populateText`), the rest was not. Its counts are the agents' own
- [x] 1.2 (2026-11-13: folded into `proposal-page.md` §2, by kind; the `MAYBE`s are settled in §3. The kind table samples the shapes, not all 33 would-break forms) Normalize the census by kind of deduction, one table: every game's sentence for a kind side by side (the engine's `compose` forms, `engine/hint-words.ts`, are the frame). Settle every `MAYBE` with the test in the proposal ("drop the clause: can a player who knows the rules still see why?"). Known: "so there is something to cross out" (`engine/hint-text.ts:113`, copies in Undead, Map and Salad) is one clause in about a dozen games
- [x] 1.3 (`proposal-page.md` §§1-4) Write the lexicon and each kind's one wording, with the clauses proposed for dropping, the ones kept as the reason, and the exceptions a game keeps and why
- [ ] 1.4 Show the owner the page ("drop", "keep as the reason" and "reword" columns) and wait for their word. Netslide's sentence is not on it: `reword-the-netslide-hint`

## 2. Apply

- [ ] 2.1 Written once the owner has answered and `build-hint-steps-in-the-engine` is archived
