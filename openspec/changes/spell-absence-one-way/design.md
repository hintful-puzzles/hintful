# spell-absence-one-way — design

## D1. What the census measures, and what it cannot

It counts **declared** return types, parsed by the compiler rather than grepped,
because the grep this change's predecessor used could not be reproduced and two
line-based attempts in the scaffolding session returned zeros for reasons that
had nothing to do with the tree (POSIX ERE has no `\s`; zsh reads `"$s["` as a
subscript). Give any re-take a known positive — `digitValue` in
`src/engine/decimal.ts` is a one-line `number | undefined` — and read stderr.

Three things it does not see, each a reason not to treat its totals as the
population a convention governs:

- **Unannotated functions** (2,219 of 7,187 on 2026-09-13). Their inferred
  return type may contain either word.
- **Fields, parameters and locals.** `?:` members and `x: T | null` fields
  carry the same question and are not returns.
- **Meaning.** A count says which word, never whether the site means "an error,
  or nothing", "nothing to say", "lookup missed" or a third state. Task 1.3
  classifies the engine rows by reading them; the classification is the input
  to D2, the totals are not.

## D2. The candidate conventions

The test from `AGENTS.md` § "Convention over configuration": *can we say what a
site would legitimately want to do differently?* Where yes, the convention needs
an override; where no, it is a convention nobody made.

| Option | Rule | Cost, as measured 2026-09-13 |
| --- | --- | --- |
| **A** | `undefined` is this tree's "nothing". `null` appears only where a platform API returns it or a stored/transported value gives it a distinct meaning. | Flips the `Game` contract: four members' implementations in every game, plus helpers. Compiler-enumerated, so mechanical. |
| **B** | `null` is "deliberately nothing" (returns, contract results); `undefined` is "not provided" (optional parameters and fields). | Flips `EngineCore`'s relayed results and most app helpers. Keeps the `Game` contract. |
| **C** | Contracts only: `Game` and `EngineCore` agree with each other and with themselves; helpers are the file's business. | Smallest. Gives a new helper no rule, so the per-porter decision survives. |

**Recommendation: A, with the override stated.** Reasons, each checkable:

- The language produces `undefined` on its own — `?.`, `Map.get`, `Array.find`,
  an omitted argument, an unset `?:` member — and default parameters fire only
  on `undefined`. Under A those compose without a `?? null` conversion; under B
  every one of them is a conversion somebody must remember.
- B's distinction ("deliberately nothing" versus "not provided") is real in
  English and unenforceable in code: nothing checks which one a site meant. It is
  exactly the kind of decision a porter makes per helper and two porters make
  differently, which is what this change exists to remove.
- The override is one a site *already declares for its own reasons*: a value
  that is stored or that a platform API returned. `settings.ts` needs no ledger
  entry to keep its `null` — it is a persisted setting, and that is visible.

**Decide in task 2, not here.** A's cost falls mostly on the `Game` contract,
which `interpretMove`'s `Move | null | UiUpdate` also touches — that return has
three members already, and changing its `null` interacts with `UI_UPDATE`'s
handling in the midend. Read that before committing to A; if it pushes back,
say so and choose again. **And if no part of A or B shows a benefit beyond
consistency, implement C and record why the rest was declined**, as
`unify-hint-framework` recorded its no-gos.

## D3. The three-state functions are fixed whichever option wins

`keyLetter` (Abcd) and `keyDigit` (Crossing) return a value, `null` ("clear") or
`undefined` ("not an entry key"). This is not a spelling question: it is two
states hiding in one type's two absent inhabitants. Give "clear" a name the
compiler can see — a `CLEAR` constant or a small discriminated union — so a
`??` cannot merge it into "not mine".

The two functions share their shape (`digitOf`, `CURSOR_SELECT2`,
`isEraseKey`, `digit === 0` means clear). **Before extracting a shared helper,
measure how many other games spell the same entry-key logic inline**, keyed on
that shape rather than on these two names; per `AGENTS.md` § "Refactor as you
go", extract if the shape will stay stable, and record the no-go if not.

## D4. Keeping it

A guard keyed on a name will miss the helper written next week. If one is
built, key it on shape — a declared return union containing the forbidden word
— through the compiler API, as `scripts/checks/unused-exports.mjs` already does,
and **derive its exceptions** from what a site already is (a return that
forwards a platform call; a member of a persisted-settings type) rather than a
roster. Prove it fails on a planted signature before trusting it.

If no honest derivation exists, do not ship a ledger that rots: state the rule
in `docs/games/mechanics.md` and the `ts-engine` spec, and say plainly that
nothing enforces it.

## D5. What must not move

- Stored meaning in `store/settings.ts` and the save envelope (proposal, "What
  this does not do").
- The consumers' behavior: every `EngineCore` result consumer tests truthiness
  today (read on 2026-09-13 at each call site of `setParams`, `setCustomParams`,
  `loadGame`, `newGameFromId`, `setPreferences`, `hint` and `executeHint`
  outside the engine). Re-read them after the contracts change — a switch to a
  strict comparison anywhere would make a respelling a behavior change.
- Values crossing the Comlink worker boundary survive structured clone with
  either word, so the boundary itself is not a constraint; the consumers above
  are.
