# Tasks

## 1. Measure

- [x] 1.1 Swatch every named set in both schemes and say which words a
      dark value leaves (`design.md` § "What was measured").

## 2. The engine

- [x] 2.1 `ColorWord` (`color-word.ts`): a word per scheme, which throws
      if it is spliced into a string, and `.only` for a surface with one
      text.
- [x] 2.2 `colors.ts` gives each base color and region fill its word, and
      the name sets are read off their members. Map's yellow and pink carry
      "brown" and "maroon" in the dark scheme.
- [x] 2.3 `phrase` takes a word as a part, `Narration.textIn(scheme)`
      renders either scheme, and `listOf` lists words and narrations.
- [x] 2.4 The status notification carries the dark words, and the hint
      banner shows the scheme in force, re-worded when the scheme changes.
- [x] 2.5 A refusal's words, help pages, control text and mark words take
      `.only`.

## 3. Games

- [x] 3.1 Map's sentences name colors through words; its local
      `joinNarrations` is `listOf`.
- [x] 3.2 Flood, Clusters and Unruly take the word type.

## 4. Checks

- [x] 4.1 `colors.test.ts`: every word fits its color in both schemes, seen
      to fail with "yellow" planted back as the dark word.
- [x] 4.2 `map-hint.test.ts`: every step's dark words are its light ones
      with the dark words swapped in, and "brown" and "maroon" are said.
- [x] 4.3 `midend.test.ts`: the notification carries both, seen to fail
      with the light words sent as the dark ones.
- [x] 4.4 `hint-words.test.ts`: a word in a phrase, a capital, a list, and
      the refusal to splice.

## 5. Look and words

- [x] 5.1 Map in the app in both schemes, a hint naming yellow and pink,
      and the scheme switched while it is up: "touches pink, yellow and
      violet" became "touches maroon, brown and violet" and back, with no
      new request.
- [x] 5.2 Map's help page names the dark words.
- [x] 5.3 Guides: `docs/rendering.md`, `docs/hints-candidates.md`,
      `docs/engine-catalog.md`.
- [x] 5.4 Deltas: `engine-colors`, `map`.
