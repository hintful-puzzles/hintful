# Design

## The claims, re-checked at HEAD (2026-11-16)

All held. The render threw on a place word (`hint-words.ts`'s `lint`) and on
another role's word in a reference (`checkAdjective`); retired phrases lived
in a regex inside `hint-retired-phrases.test.ts`; a reference that names no
mark was judged only by `testing/hint-reference.ts` on walked steps; the
length was held only by `hint-quality.test.ts`'s walk and `LONG_NARRATIONS`,
keyed by pinned descs. Norinori's planted `{e in cells where not known(e) and
(exists d in D: e in adj4(d))}` compiles to a loop over `sp.cells` with an
inner loop over `D`. The checker printed `sound` on a line whose verdict was
recorded `held`. `compile.test.ts` alone named a technique left unchecked.

## D1. One copy of each wording rule

`engine/wording-rules.ts` holds the limit, the role words, the retired
adjectives, the place-word rule (`unboundDefect`), the role-word rule
(`adjectiveDefect`) and the retired phrases. It imports nothing, so the
describe script runs it under Node's type stripping. `hint-words.ts` throws on
what it returns, `hint-retired-phrases.test.ts` scans with its regexes, and
`describe/lint.ts` asks it of every form a clause can take. The reference
judge stays in `testing/hint-reference.ts`, exported, and the lint asks it too.

The judge's last two verdicts ("not a noun phrase", "names a thing but not
which mark") are rescued by the game's legend, which is game code. The lint
passes `taught: null`, and the judge then leaves those two to the walk. Asked
with an empty legend instead, it called 90 wordings wrong, every one of them
legend words ("the marked corner", "clue").

## D2. The length: two bounds, not one estimate

One estimate of a wording's longest reading flagged 70 to 90 wordings, at any
calibration of slot sizes, almost none of which a board makes long: it takes
each `if` independently, and a board pairs them. It cannot be a forward check.
Two bounds can:

- **Shortest reading** (one-digit numbers, one-member lists, the shortest
  noun a game says): a lower bound on every board, since a board's reading
  is one of the combinations. Past the limit with no `long:` is an error. It
  found 10: the 7 described wordings already on the ledger, and 3 the walk
  never reached (Boats' `hidden.satisfied` and `centerTrial`, Singles'
  `corner.four`). The first and last were shortened; `centerTrial` says
  `long:`.
- **Longest reading** (two digits, three-member lists): a `long:` on wordings
  all within it is refused. This replaces `spokenOn` as the reverse half for
  described sentences. It is weaker: a stale `long:` on a wording that the
  generous bound still puts past the limit stays. The forward half for the
  sentences in between remains the walk's.

Every `fit` is read at its last form, which a sentence takes wherever an
earlier one would run over.

## D3. Where `long:` lives and how it reaches the walk

`long:` sits on a wording, or on a part (a `says`, an arm, a fact, a planner
step), covering its wordings. `description.ts`'s `wordingsOf` resolves which
`long` covers each wording, once. The compiler writes it into the clauses of
`STATED` and `STEPS`; `statedSentence` carries it onto the `Sentence`
(`Sentence.long`), and `hint-quality.test.ts` lets a long step through on it.
No rung mapping: a planner step's rung is game code (Magnets' `onlyEnd` is
spoken by two steps).

A sentence a game assembles from a described fragment is not a wording the
description states whole. Solo's and Map's wing build their sentence round the
Latin `wing`'s `look` (`hint-text.ts`'s `wingPremise`), so their listing stays
on the ledger, with Rome's, Crossing's, Ascent's, Net's and Rect's, whose
words are game code.

## D4. The whole-board read: a warning, not a rewrite

A rewrite would change the order the elements come in, and a firing's order is
behavior. It would also leave the slow form in the description. The lint warns
on a binder `x in cells` whose `where` keeps `x in F(y)` or
`exists d in D: x in F(d)`, and names the local binder. No description has
one now; the Norinori plant warns.

## D5. What `npm run describe` reports

Every finding, with its file and where in it; an error sets the exit code, so
the gate's typecheck and every `pre` script fail on one, and
`compile.test.ts` asserts none. It also names the techniques and dead-end
claims with no verdict for what they read now, from `soundness.ts`'s
`unchecked`, which `compile.test.ts` now shares, with the command that checks
them.
