# spell-absence-one-way — design

## D1. What the census measured, re-taken

Taken 2026-09-13 with the TypeScript compiler API and its type checker, from
scripts kept in the session scratchpad; the durable instrument is now the guard
(D4). The known positive held — `digitValue` found as `| undefined` — over
527 files and 6,909 function-like nodes, 2,162 of them unannotated.

| declared returns, non-test `src/` | `\| null` | `\| undefined` | both |
| --- | --- | --- | --- |
| `src/engine/` | 48 | 33 | 0 |
| `src/games/` | 330 | 8 | 2 |
| app | 7 | 54 | 1 |

The checker closed the blind spot the scaffold named: unannotated functions
inferred 4 / 0 in the engine, 30 / 1 in the games and 2 / 10 in the app.

Two wider figures decided D2. **Every union position**, not only returns
(parameters, members, variables, aliases, type arguments), in non-test `src/`:
about 750 name `null` and about 160 name `undefined`, 45 of the latter being the
one `EngineCore` relay chain written out in four layers. And **the respelling's
hazard population**: 478 `return null` statements in the games (189 in
`interpretMove`) and 42 in the engine, with 197 strict comparisons against
`null` and 160 against `undefined` — the comparisons being the part no
typechecker checks after a word moves.

Two instruments lied before they were trusted, both in the known way. A
`--include=*.ts` glob expanded in zsh and every scan returned nothing; a
`git grep -E` using `\b` reported no `toBeDefined()` on a respelled value until a
known positive (`crossing-hint.test.ts:585`) was required to appear, whereupon
it found ten.

## D2. Decision: `null`, with named states and results where a value is at stake

The rule, stated in `docs/games/mechanics.md` § "Absence is `null`" and the
`ts-engine` requirement "Absence has one spelling":

1. A value that may be absent is `T | null`; `undefined` is never written into a
   union. `?` marks a parameter or member that may be left out, and a value the
   language produced as `undefined` takes `?? null` where it enters a declared
   type.
2. Two kinds of nothing get named states.
3. A failure with nothing to return on success is its reason or `null`; a failure
   beside a value is a discriminated result.

**The scaffold recommended the opposite (A, `undefined`). Measured, it does not
survive:**

- **Every path has to say it.** Verified with tsgo on a probe: a declared
  `number | null` return that falls off its end is TS2366, and `number |
  undefined` compiles. The tree had a live instance — `extractSGTGameID` fell off
  its end for any URL that was not upstream's, legal only because its return
  admitted `undefined`.
- **It is enforceable by syntax with no ledger.** A's guard would have to exempt
  every `null` a move, a `Ui` field or a save carries, and no declaration marks
  which types those are. That is D4's "no honest derivation" case; the `null`
  rule has none.
- **A's "composes without conversion" is symmetric.** Assigning `T | undefined`
  into `T | null` is a type error, but so is the reverse, so either rule makes the
  compiler demand each conversion. The sweep added about forty `?? null`
  conversions; A would have respelled some 520 `return null` statements and
  audited 197 comparisons tsc does not check.
- **B's objection does not apply.** The scaffold called B unenforceable because it
  distinguished "deliberately nothing" from "not provided" by meaning. The rule
  adopted is not a meaning; it is where the word may be written.

**The owner's lean toward explicit types** (2026-09-13: "rather than
`strToNum(s: string | undefined)` I'd lean towards something like
`strToNum(s: string | MissingFixtureValue | MissingInput)`", with anything
consistent acceptable) **is applied where it earns something**:

- *Two kinds of nothing are named.* Abcd's `keyLetter` and Crossing's `keyDigit`
  return `"clear"` (Salad's `symbolFor` already spelled it that way), and the
  settings store reads a key nobody stored as `UNSET`, because several settings
  store `null` as a value and the decorator must give the default to one and not
  the other.
- *A failure beside a value is a result.* `encodeCustomParams` returned the
  params string or `#ERROR:<reason>` in the same string; it returns
  `CustomParamsEncoding` now. `Game.solve` and `Game.hint` were already that
  shape.

**And declined for "fine, or why not"** — `validateParams`, `validateDesc` and
`EngineCore`'s refusals stay reason-or-`null`. Measured: 111 validator
implementations, 737 test lines naming them, of which 118 `not.toBeNull()` and
15 `toBeTruthy()` would pass against an always-truthy result object, and every
`if (err)` in production would compile and invert. A reason cannot be confused
with a success value when success carries none, so a result there buys
uniformity and costs a hazard. Revisit when a validator must return something on
success.

**What each part buys beyond consistency:**

- `EngineCore`: the refusal is spelled as `Game`'s validators spell it, across
  the midend, the worker adapter, the surface and `Puzzle`. `setPreferences`
  declared a refusal no path produced and returns `void`.
- `encodeCustomParams`: a caller that forgot the `#ERROR:` prefix test would have
  used the refusal as a params string; the compiler now refuses that.
- `keyLetter` / `keyDigit`: a `??` written against the result can no longer merge
  a clear into an ignored key.
- The digit codecs: `digitValue` and its key-side twin `digitOf` spell the one
  fact one way.
- The guard (D4): four silent defects were written *by this sweep* and caught
  before any commit — Loopy's and Mosaic's `validateDesc` accepting any
  character (`c2nUpper(…) !== undefined`, now always true), an unmapped key
  reaching the game as a `null` button, and the settings dialog drawing a
  progress ring with no value. The guard found the first two; reading each
  consumer found the other two, and the guard has since been run over them.

`interpretMove`'s `Move | null | UiUpdate` is unchanged: it was already the rule.

## D3. The three-state keys, and why nothing was extracted

Named as D2 says. The extraction the scaffold asked to measure (task 1.5),
keyed on the shape rather than the two names: 22 games read the erase keys, and
what they share is two tokens, `CURSOR_SELECT2 || isEraseKey`. Whether that pair
*clears* is the game's own decision — Boats and Bricks cycle on the secondary
select, Sticks and Unruly read `0` as a value, Salad adds Space, Abcd and Solo
accept letters. A helper would name a disjunction, not a fact. No-go.

## D4. The guard

`scripts/checks/absence-spelling.mjs`, in the gate's fast prefix after
`unused-exports.mjs`.

- **Parse half:** a union type with an `undefined` member, outside a cast.
- **Checker half:** a strict comparison against `null` or `undefined` whose
  other operand's type holds the other word and not this one.
- **Exceptions, all by syntax:** a cast (the walk climbs through an inline type's
  members, so `as { env?: Record<string, string | undefined> }` is still a cast);
  a comparison against an index read, which is a bounds check while
  `noUncheckedIndexedAccess` is off; an operand whose type is generic, `any` or
  `unknown`. No ledger.
- **It proves itself** against in-memory fixtures on every run and floors the
  files, unions and comparisons it examined.

It was red before it was green: its first run over the tree named 220 unions and
one comparison. That comparison was a live check under an understating type (the
settings merge filters `undefined` values that `Object.entries` types away), and
the fix typed the merged entries `unknown` rather than exempting the shape.

**Cost.** A program per tsconfig checked `src/` twice, because the build-side
project imports most of it: 22 s wall. One program over both projects' files
under the build-side options (a superset environment) measured 7.0 s user and
8.7 s wall at load average 37 with about 140 MB free and the machine swapping —
an upper bound.

## D5. What did not move

- **Stored data.** `setParams` and `setLastGameId` clear their key on `null`
  exactly as they did on `undefined`, and a stored `null` setting still reads back
  as `null`. `puzzleAutoSaveFilename` in history state now holds `null` where it
  held `undefined`; its reader accepts only a string, so both read the same.
- **Consumers.** Every `EngineCore` result consumer outside the engine was re-read
  after the contract moved (`config.ts`, `context.ts`, `type-menu.ts`,
  `puzzle-screen.ts`, `saved-games.ts`, `enter-gameid-dialog.ts`, `puzzle.ts`,
  `share-dialog.ts`, `render-scenario.ts`) and each still tests truthiness or
  `?? null`.
- **Tests that would have lied.** 234 `toBeUndefined()` assertions on respelled
  APIs were moved to `toBeNull()` by a scratchpad codemod and verified by shape
  (every changed line differed by that token alone); they would have failed
  loudly anyway. That codemod matched a call and its assertion on one line, so
  the first gated commit failed on 220 tests where the two sat apart
  (`const err = …; expect(err).toBeUndefined()`) or the API was unnamed
  (`chordCommand`, `bareCommand`). The fix read every one of the 194 remaining
  `toBeUndefined()`/`toBeDefined()` assertions in the tree rather than only the
  failing ones, because the *silent* kind cannot fail: about thirty
  `toBeDefined()` sites would have passed on `null` (an absent hint step, a
  difficulty item, a registry lookup, a text rendering) and now assert
  `not.toBeNull()` or, for a text rendering, `typeof … === "string"`.
