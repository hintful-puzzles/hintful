# Design: name-a-color-in-each-scheme

## What was measured (2026-10-15)

Every named color, swatched in both schemes from `colors.ts`:

- **TEN** (Flood, Guess, Samegame) and **TWO** (the two-state pair): every
  dark value is still the color its word says. The dark gray is darker and
  the dark brown lighter, and both keep their words.
- **FOUR** (Map, the region palette's first four): the dark teal and violet
  keep theirs. The dark yellow fill (`#4c3a13`) is a brown, and its dot mark
  (`#746214`) an olive brown. The dark pink fill (`#572b36`) is a maroon, and
  its dot (`#824459`) a darker rose. So two words change, and only in Map.

## Decisions

**A word is a `ColorWord` (`engine/color/color-word.ts`), not a string.**
It holds a word for each scheme, and it throws if it is spliced into a
template literal, so no sentence can drop the dark word without a sound.
A `phrase` takes it as a part of its own. The type checker caught every
site that used a name as a string, and the throw caught the three that
spliced one into a mark's words, which TypeScript allows.

**A set's names are read off its members.** `colors.ts` records a word for
each base color and each region fill as it makes it, and `TEN_NAMES`,
`TWO_NAMES` and `FOUR_NAMES` are the words of `TEN`, `TWO` and
`FOUR_FILLS`. No list of words is kept beside a list of colors, so the two
cannot drift apart. The dark words sit beside the dark values in
`REGION_DESIGN` (`darkWord`).

**The worker does not learn the scheme.** That is how the palette already
works: the engine authors both values and the frontend picks one
(`Midend.darkPalette`). Hint words do the same. `Narration.textIn(scheme)`
renders either, the status notification carries `activeHintExplanationDark`
beside the light text, and the puzzle screen asks `Puzzle` for the
sentence in `currentColorScheme` (not `Puzzle` itself, which is tested in
node, where the scheme module cannot load). So a scheme changed while a
hint is up re-words it
with no round trip to the worker. The other choice, sending the scheme to
the worker and re-narrating there, adds a message and state to the worker
for no gain.

**`Narration.text` stays the light words.** Every check on a sentence
(lint, the hint-quality walk, snapshots) reads it. Only the screen needs
the scheme. A surface that shows one text in every scheme takes
`ColorWord.only`, which throws for a word that differs by scheme: help
pages (`{{pair:n}}`), a control's `does`, a mark's own words, and a
refusal's words (`markedDeadEnd`). Today only the two-state pair reaches
those surfaces, and it has one word in both schemes.

**Declined: mark words that follow the scheme.** A reference's words are
a string, so Unruly's "all its yellow cells" and two of Clusters' marks
take `.only`. Making them follow the scheme means a reference rendering per
scheme. No color with two words reaches a mark today, and `.only` makes
the day one does fail loudly.

**The words are "brown" and "maroon".** The proposal itself called the dark
pair "an ochre and a maroon". "Brown" is the plainer word for both the
fill and its dot, and Map has no other brown it could be taken for. The
words are one line each in `REGION_DESIGN` if the owner prefers others.

**Truthfulness is now a test.** `colors.test.ts` holds a short table of
what each English word covers in OKLCH, wide on purpose, and checks every
name set against its colors in both schemes (Map's against the fill and
the dot). Planting "yellow" back as the dark word fails it.
