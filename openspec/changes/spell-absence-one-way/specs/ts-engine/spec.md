## ADDED Requirements

### Requirement: Absence has one spelling

A value this tree declares as possibly absent SHALL be typed `T | null`. `undefined` SHALL NOT be written as a member of a union type in any tracked TypeScript file — not in a return, parameter, member, variable, alias or type argument. A parameter or member that may be left out SHALL be written `?`, and a value the language produced as `undefined` (`?.` over an optional member, `Map.get`, `Array.find`, an index read) SHALL be converted with `?? null` where it enters a declared type. A cast (`as`, `satisfies`, a type assertion) describes a value rather than declaring one and is exempt.

Where one value has two distinct kinds of nothing, each SHALL be a named state — a string literal or a unique symbol — and SHALL NOT be told apart by the language's two words. A function that can fail and has nothing to return on success SHALL return its reason or `null`; a function that returns a value on success SHALL return a discriminated result, `{ ok: true; … } | { ok: false; error: string }`, so that a refusal cannot hide inside the value.

What a save or a stored setting means SHALL NOT change to satisfy this rule.

#### Scenario: A helper that may find nothing

- **WHEN** a new helper returns a lookup that may miss
- **THEN** it declares `T | null`, and a declared `T | undefined` fails `scripts/checks/absence-spelling.mjs` naming its file and line

#### Scenario: A key with two kinds of nothing

- **WHEN** Crossing reads a key while its cursor is shown
- **THEN** `keyDigit` returns the digit for `1`–`9`, `"clear"` for Backspace, Delete, `0` or the secondary select, and `null` for any other key
- **AND** a `?? fallback` written against the result cannot merge a clear into an ignored key

#### Scenario: The engine surface reports a refusal

- **WHEN** the app calls `setParams`, `setCustomParams`, `newGameFromId`, `loadGame`, `solve`, `hint` or `executeHint` through the worker
- **THEN** the answer is the refusal's text or `null`
- **AND** `setPreferences`, which cannot fail, returns nothing

#### Scenario: A preview whose answer is itself a string

- **WHEN** the Custom dialog asks `encodeCustomParams` for the params its values describe
- **THEN** it receives `{ ok: true, params }` or `{ ok: false, error }`, and no refusal is carried inside a params string

#### Scenario: A stored null is not an unset setting

- **WHEN** a common setting stores `null` as its value
- **THEN** the settings store reads it back as `null` and gives the default only to a key nobody stored, which it reads as `UNSET`

## MODIFIED Requirements

### Requirement: The engine answers which character is a digit, once

The engine SHALL provide, in `src/engine/decimal.ts`, `isDigit(c: string): boolean` and `digitValue(c: string): number | null` — the value `0`–`9` a decimal digit character stands for, or `null` for any other character. The absent case SHALL sit outside the number domain, so that no caller can use the result without discriminating it; a sentinel inside the domain passes a lower-bound test by coincidence and is stored as a wrapped byte by a typed array. Both SHALL take a **character**, never `string | undefined`: indexing past the end of a string yields `undefined` while typed `string`, and a signature that absorbs that spreads a runtime fact through every helper built on it. The caller holding the index SHALL carry the bounds check (`i < s.length && isDigit(s[i])`), as `parseLeadingInt` does. A game SHALL read a digit character through these and SHALL write a single digit as `String(n)`; it SHALL NOT declare its own `isDigit`, compare a character against a one-digit string with a relational operator, subtract a digit code from a character code, or add one to build a character. The three spellings of the fact — `digitValue` on a character, `c2n` on a desc character, `digitOf` on a key — SHALL agree on every digit, and a test SHALL hold them equal.

What the value *means* SHALL stay with the game: the bound it accepts and what an out-of-range value does (an error message, a sentinel, a rejected desc) are written beside the call. A write into a typed array SHALL name that array's own absent constant (`?? EMPTY`, `?? -1`) rather than inherit a codec's, and a write that is safe only because `validateDesc` screened the character SHALL say so at the write. A hex nibble read case-insensitively (a bitmap of mines or lit cells) is not a decimal digit and is read with `Number.parseInt(c, 16)`.

#### Scenario: A run-length game reads a bounded clue

- **WHEN** Slant's `validateDesc` meets a value token
- **THEN** it reads `digitValue(tok.value)` and applies its own bound of `4`, rejecting `5` with its own message and a letter with its own message

#### Scenario: A private copy fails the build

- **WHEN** a game source declares an `isDigit`, `digitValue`, `parseLeadingInt`, `n2c`, `c2n`, `n2cUpper`, `c2nUpper`, `scanRunLength` or `encodeRunLength` of its own
- **THEN** `emittable-keys.test.ts` reports it, the reserved names being read from the fact modules' own export lists

#### Scenario: A stray character cannot be stored without a decision

- **WHEN** Filling's `newState` writes a clue into its `Uint8Array`, whose absent value is `0`
- **THEN** the write names `EMPTY` for a character that is not a digit, and a non-digit can never be stored as `255`

### Requirement: The engine provides the two desc value alphabets

The engine SHALL provide, in `src/engine/desc-alphabet.ts`, two frozen value alphabets: `n2c`/`c2n` over `0`–`9`, `a`–`z`, `A`–`Z` (62 values, for a desc in which every character is a value) and `n2cUpper`/`c2nUpper` over `0`–`9`, `A`–`Z` (36 values, for a run-length desc, which has spent the lowercase letters on blank runs). Each writer SHALL throw on a value it cannot write rather than walk into punctuation; each reader SHALL return `null` for a character outside its alphabet, a lowercase letter included for the run-length alphabet, and its return type SHALL say so. Neither order SHALL change, because both are baked into shipped game IDs. A game whose desc writes a value above nine SHALL use the alphabet its grammar implies and SHALL keep its own bound beside the call.

#### Scenario: A run-length desc writes and reads a value above nine

- **WHEN** Loopy encodes a clue of 12 and Bridges an island of 16
- **THEN** the desc carries `C` and `G` respectively, `c2nUpper` reads them back, and Bridges' own `validateDesc` still rejects `H`

#### Scenario: The two alphabets agree where they overlap and nowhere else

- **WHEN** a digit `0`–`9` is written through either alphabet
- **THEN** both write the same character
- **AND** `c2nUpper("a")` is `null` while `c2n("a")` is `10`
