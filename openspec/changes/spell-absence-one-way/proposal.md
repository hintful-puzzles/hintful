# spell-absence-one-way

**Readiness: implemented 2026-09-13.** Raised as a deliberate non-goal of
`type-the-absent-digit` (its `design.md` D3), which chose `undefined` for three
desc codecs and declined to settle the tree-wide question. The figures below are
the scaffold's; `design.md` D1 re-took them, and D2 records the convention
chosen — `null`, named states for two kinds of nothing, a result beside a value
— and why the scaffold's recommendation of `undefined` did not survive the
measurement.

## Why

TypeScript gives this tree two words for "nothing here", and the tree uses both
for the same meaning in places a reader has to cross constantly.

- **The engine's two contracts disagree about "an error, or nothing".**
  `Game.validateParams` and `Game.validateDesc` return `string | null` ("`null`
  when valid"). `EngineCore.setParams`, `setCustomParams`, `loadGame` and
  `newGameFromId` return `string | undefined` for the same meaning — read in
  their bodies, which bridge the two by truthiness (`if (err) return err; …
  return undefined`). `setPreferences`, `solve`, `hint` and `executeHint` are
  declared the same way; their bodies are unread (task 1.2). The same
  interface carries a third spelling: `encodeCustomParams` returns an in-band
  `#ERROR:<reason>` string.
- **One interface disagrees with itself about "nothing to say".**
  `Game.supersededDesc?` returns `| null`; `Game.textFormat?` returns
  `| undefined`.
- **Two games encode a third state in the choice of word.** Abcd's `keyLetter`
  and Crossing's `keyDigit` return `number | null | undefined`: a value,
  `null` for "clear", `undefined` for "not an entry key". The distinction lives
  only in a doc comment. Any `?? fallback` or `== null` written against either
  silently merges "clear" into "not mine", and the compiler cannot say so —
  the exact hazard `type-the-absent-digit` removed from the digit codecs.
- **One declaration names a value no path returns.** `DynamicContent.addItem`
  declares `| null | undefined`; both return paths yield a `querySelector`
  result, which is an element or `null`.

**Why it is worth a change, and not only tidiness.** A green suite proves
nothing is broken: every app consumer of the `EngineCore` results tests
truthiness (`if (error)`), so no player sees either spelling. The case rests on
two things instead. First, the three-state functions are a real latent defect
of the kind the compiler cannot guard. Second, `AGENTS.md` § "Convention over
configuration": today every helper a porter writes asks them to pick a word, and
two games could not legitimately want different answers to that — which is the
test for a convention somebody forgot to make. At dozens of games that is paid
per helper, forever. **If implementation cannot show a benefit beyond
consistency for a part of this, that part is dropped** (D2's option C is the
floor), per `AGENTS.md`'s byte-parity guard rail: tidiness alone is not a reason.

### The measurement (2026-09-13)

Declared return types only, taken with the TypeScript compiler API over every
non-test `.ts` under `src/`: a function-like node counts when its annotation is
a union containing the `null` literal or `undefined` (a `Promise<T>` is
unwrapped; `void` is ignored). Vacuity: 493 files, 7,187 function-like nodes.
**Blind spot: 2,219 of those carry no annotation** and are not counted.

| area | `\| null` | `\| undefined` | both |
| --- | --- | --- | --- |
| `src/engine/` | 49 | 33 | 0 |
| `src/games/` | 334 | 8 | 2 |
| app (everything else) | 7 | 54 | 1 |

Cross-checked with a line-based `git grep` for one-line signatures in the
engine, which can only undercount: 44 and 31. **174 of the games' 334 are four
`Game` contract members** implemented per game (`validateParams` 56,
`interpretMove` 55, `validateDesc` 55, `refreshHintStep` 8) — one decision in
`game.ts` each, not 174. `type-the-absent-digit`'s D3 quoted 42 and 26 for the
engine from an unrecorded instrument; do not build on those.

## What changes

Scoped by the convention chosen in task 2; at minimum (option C):

- The two engine contracts agree: one spelling for "an error, or nothing" across
  `Game` and `EngineCore` (and `Midend`, the worker adapter and `puzzle.ts`
  that relay it), and one for "nothing to say" within `Game`.
- `keyLetter` and `keyDigit` stop encoding a state in word choice: the "clear"
  case gets a name the compiler can see.
- `addItem` declares what it returns.
- The rule, its reason and its override are written down — `docs/games/` and a
  `ts-engine` requirement — with a guard keyed on shape if one can be built
  honestly (D4).

## What this does not do

- **It does not touch stored player data.** `store/settings.ts` gives the two
  words different meanings on purpose — `undefined` is "unset, use the default",
  `null` is a value persisted to Dexie — and a save envelope's optional
  `privDesc` is a format. A convention that forced those to one spelling would
  change what a player's data means; that is out of scope, and the owner's call
  if ever proposed.
- **It does not enable `exactOptionalPropertyTypes`.** `tsconfig.json` records
  why that flag is off (`tighten-type-checking`, measured 2026-08-01) and names
  its own trigger for revisiting — a format distinguishing a missing key from an
  explicit `null` — which this does not meet.
- **It does not respell a platform API.** `querySelector`, `RegExp.exec` and
  `Storage.getItem` return `null`; `Map.get` and `Array.find` return
  `undefined`. A convention governs what this tree *declares*, and converts at
  the call only where a value then crosses one of its own contracts.
- **It does not change behavior.** No narration, snapshot or fixture moves.
