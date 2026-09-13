## MODIFIED Requirements

### Requirement: The engine answers which character is a digit, once

The engine SHALL provide, in `src/engine/decimal.ts`, `isDigit(c: string): boolean` and `digitValue(c: string): number | undefined` — the value `0`–`9` a decimal digit character stands for, or `undefined` for any other character. The absent case SHALL sit outside the number domain, so that no caller can use the result without discriminating it; a sentinel inside the domain passes a lower-bound test by coincidence and is stored as a wrapped byte by a typed array. Both SHALL take a **character**, never `string | undefined`: indexing past the end of a string yields `undefined` while typed `string`, and a signature that absorbs that spreads a runtime fact through every helper built on it. The caller holding the index SHALL carry the bounds check (`i < s.length && isDigit(s[i])`), as `parseLeadingInt` does. A game SHALL read a digit character through these and SHALL write a single digit as `String(n)`; it SHALL NOT declare its own `isDigit`, compare a character against a one-digit string with a relational operator, subtract a digit code from a character code, or add one to build a character. The three spellings of the fact — `digitValue` on a character, `c2n` on a desc character, `digitOf` on a key — SHALL agree on every digit, and a test SHALL hold them equal.

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

The engine SHALL provide, in `src/engine/desc-alphabet.ts`, two frozen value alphabets: `n2c`/`c2n` over `0`–`9`, `a`–`z`, `A`–`Z` (62 values, for a desc in which every character is a value) and `n2cUpper`/`c2nUpper` over `0`–`9`, `A`–`Z` (36 values, for a run-length desc, which has spent the lowercase letters on blank runs). Each writer SHALL throw on a value it cannot write rather than walk into punctuation; each reader SHALL return `undefined` for a character outside its alphabet, a lowercase letter included for the run-length alphabet, and its return type SHALL say so. Neither order SHALL change, because both are baked into shipped game IDs. A game whose desc writes a value above nine SHALL use the alphabet its grammar implies and SHALL keep its own bound beside the call.

#### Scenario: A run-length desc writes and reads a value above nine

- **WHEN** Loopy encodes a clue of 12 and Bridges an island of 16
- **THEN** the desc carries `C` and `G` respectively, `c2nUpper` reads them back, and Bridges' own `validateDesc` still rejects `H`

#### Scenario: The two alphabets agree where they overlap and nowhere else

- **WHEN** a digit `0`–`9` is written through either alphabet
- **THEN** both write the same character
- **AND** `c2nUpper("a")` is `undefined` while `c2n("a")` is `10`
