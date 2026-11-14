# Tasks

## 1. The trial (proposal § "Before it starts")

- [x] 1.1 A word dump of the three games' hint walks at HEAD (every step's words, rung and move, over the fingerprint boards and a wider sample), to compare against after each move. Taken 2026-11-14 at `cab3810d2`: `walkLines` over `dealtBoards(game, { scalarEnds: false })`, deals 0..5 (Unequal 1587 lines, Singles 200, Loopy 40588; Loopy takes most of the 52 s). That script was a scratch vitest; the tree's own is `research/hint-walk-dump/dump.test.ts` (`DUMP_GAME`, `DUMP_OUT`, `DUMP_DEALS`), which also lists each step's marks: run it at HEAD before a game moves and again after
- [x] 1.2 The form: `look` / `follows` / `move` on a says, an arm and a `fact`, whose own `arms` are read where the fact is made; slots checked at describe time (`checkStated`, `compile.test.ts` "a stated clause names only what its technique states", seen to fail with the check disabled); the clauses emitted as `STATED` in a game's compiled module; the grammar in `engine/stated-clauses.ts` (imports nothing: the describe script runs under Node's type stripping, which refuses `hint-words.ts`), the renderer in `engine/stated.ts` (`stated.test.ts`, seen to fail with the one-or-several choice planted to always take the first). `relation` is not stated yet: no trial game's step needs one but `forced`. The existing wording guards read a compiled module's `STATED`, so they hold stated clauses already (an em-dash planted in Unequal's clause failed `hint-em-dash.test.ts`)
- [x] 1.3 Unequal stated: `hint-text.ts` goes; `sign` restated with the struck end as a binder (`forall c in {big, small}`) so four fact arms pick its words; checked sound; the word dump is byte-identical to 1.1 (564 sign steps, all four arms met)
- [x] 1.4a Wordings (design.md § "Singles, read before it is stated"): `wordings` on a says, an arm and a fact, the fact's `arms` folded into them; `when` sees the terms and marks; `STATED` by wording index; `describedFiringHint` speaks a stated kind from the table, with the game's `shows` (`unit` is the engine's). With the first wording always taken, both games' walk fingerprints and pinned-hint tests fail, and so do the compile tests
- [x] 1.4 Singles stated, from the drafted clauses: `hint-text.ts` goes; word dump byte-identical to HEAD's at 8 and 80 deals; design.md § "Singles, stated"
- [x] 1.5 Loopy's `says` (terms and marks), walk fingerprint unchanged; a role may mark several sorts, a set of each by sort (`compile.test.ts` "a role a step marks several sorts in holds a set of each", seen to fail with the sort check disabled); the walk fingerprint unchanged on both tiers (deals 0 to 3 of every preset) and failing with the outline's dots planted out; `research/hint-walk-dump/` did not finish one deal a preset of Loopy in ten minutes, so 1.6 needs it cut down (fewer shares, or a preset filter) before it compares Loopy's words; design.md § "Loopy's says"
- [ ] 1.6 Loopy stated, its note-placing steps as declared step kinds (design.md § "Step kinds"); `hint-text.ts` goes; word dump compared with 1.1's. First: a reference takes the mark kind of the sort it names, and `earlyLoop`'s wording reads whether its clues are empty (design.md § "Loopy's says")
- [ ] 1.7 Step kinds a planner emits (design.md § "Step kinds"): a description's declared kinds, compiled into `STATED` with their slots checked; a stated `relation` (`effect`); a count term; the game's nouns (§ "A game's nouns"). Each new check seen to fail before it is trusted
- [ ] 1.8 Slide stated: its planner emits kinds; `hint-text.ts` goes; word dump byte-identical to HEAD's
- [ ] 1.9 Run the app on each of the four, and read the stated words against their frames
- [ ] 1.10 The comparison page for the owner (design.md § "Order of work", step 5), and the list of what the form could not state with a decision for each; ask the owner before the catalog moves

## 2. The catalog

Written once the owner has answered 1.10. Library words first (design.md
§ "Order of work", step 6); a game with no `says` waits for
`give-the-remaining-games-their-says`.
