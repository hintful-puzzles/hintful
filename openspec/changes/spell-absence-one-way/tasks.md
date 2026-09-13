# spell-absence-one-way — tasks

## 1. Re-take the measurements before building on them

- [x] 1.1 Re-run the census (compiler API, declared return types, non-test
      `src/`), known positive first. Re-taken table and the wider union-position
      census are in `design.md` D1.
- [x] 1.2 Read `Midend.setPreferences`, `solve`, `hint`, `executeHint` and
      `formatAsText`. `solve`, `hint` and `executeHint` mean "a refusal, or
      nothing" (each relays a `Game` result's `error`); `formatAsText` means
      "nothing to say"; `setPreferences` returned `undefined` on its only path
      and so declared a refusal it cannot produce.
- [x] 1.3 Classify the engine rows by meaning. Refusal-or-nothing: the
      `EngineCore` members, `computeHintPlan`, the grid and tiling validators.
      Nothing-to-say: `textFormat`, `formatAsText`, `supersededDesc`,
      `refreshHintStep` (fully resolved), `hintJourney`. Lookup miss: the codecs,
      `darkValue`, `difficultyTiers`, `getTsGame`, `firstGreaterThan`, the hint
      getters. Three-state: `keyLetter`, `keyDigit`, and the settings store's
      common-setting read (found by reading, not by the census).
- [x] 1.4 Live spec requirements spelling a changed signature: `ts-engine`
      "The engine answers which character is a digit, once" and "The engine
      provides the two desc value alphabets". The custom-params and
      reference-aid requirements already say `null` or a string.
- [x] 1.5 Entry-key shape across games: 22 read the erase keys, sharing two
      tokens; no-go recorded in `design.md` D3.

## 2. Decide

- [x] 2.1 Chosen and recorded in `design.md` D2: `null`, named states for two
      kinds of nothing, a result beside a value; results declined for
      validators, with the measurement.
- [x] 2.2 Spec deltas: `ts-engine` ADDED "Absence has one spelling" and MODIFIED
      the two codec requirements; `build-pipeline` ADDED "The gate holds absence
      to one spelling". `skip_specs` removed.

## 3. Implement

- [x] 3.1 The contracts: `Game.textFormat`, `EngineCore` and its relays
      (`Midend`, `worker-adapter.ts`, `engine-surface.ts`, `puzzle.ts`) and their
      consumers; `encodeCustomParams` returns `CustomParamsEncoding`;
      `setPreferences` returns `void`.
- [x] 3.2 `keyLetter` and `keyDigit` return `"clear"`; nothing extracted (D3).
- [x] 3.3 `DynamicContent.addItem` declares `… | null`.
- [x] 3.4 Every union naming `undefined` in the tracked TypeScript, including
      tests, the build-side plugins and `vite.config.ts`; settings' common-setting
      read names `UNSET`.

## 4. Verify

- [ ] 4.1 No narration, snapshot or frozen fixture moves; no stored value's
      meaning changes (D5).
- [x] 4.2 By shape: the codemod's 234 lines differ by one token each; the rest
      were read site by site from the guard's and the typechecker's lists.
- [x] 4.3 `EngineCore` result consumers re-read (D5).
- [ ] 4.4 Run the app: an invalid game ID in the Enter Game ID dialog, an
      invalid Custom type, and in Abcd and Crossing a cursor-entered value, a
      clear, and a key that is neither; the settings dialog's favorites and a
      preference round-trip.

## 5. Keep it

- [x] 5.1 `docs/games/mechanics.md` § "Absence is `null`", linked from the digit
      section; `AGENTS.md` Code conventions and the gate list; the engine
      catalog's codec entries.
- [x] 5.2 `scripts/checks/absence-spelling.mjs` in the gate, exceptions derived
      from syntax, fixtures proving both halves on every run.
