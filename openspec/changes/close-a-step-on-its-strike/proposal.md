# close-a-step-on-its-strike

Filed 2026-11-17 by `move-each-remaining-game-once`, which moved every
game's sentences into its description and left one kind of words in code:
a declared step that strikes notes cannot say so in its own words, because
a clause references no strike. Three games build the closing themselves,
each a `phrase` passed to the voice as the step's `closing` (read
2026-11-17; re-derive with `git grep -n -F 'phrase\`' -- src/games`):

- Crossing's note strike: "the 3 must go", "3 and 5 must go"
  (`crossing/hint.ts`, `noteStrike`).
- Undead's sightline and total: "the ghost must go", and on a later leg
  "the ghost in that cell must go too" (`undead/speak.ts`).
- Subsets' rule-out: its move "{set} must go", a ring on a tally set
  rather than a strike (`subsets/index.ts`).

## Why

A firing's strike already closes in the engine's words (`hint-text.ts`'s
`candidateConclusions`, "so 2 and 4 must go"); a declared step's does not,
so each game writes the same clause again, and `docs/hints.md` § "The
sentences live in the description" and the engine-hints requirement carry
an exception for it. Where several games write the same thing, the
framework owns it.

## What Changes

- **A step that is given `struck` closes on it by itself**, in the words a
  firing's strike uses, its reference the struck notes as the player
  presses them. What a game says of them (a value, a monster's name) comes
  from the voice's `value`, or a step's word for them.
- **Where the struck notes are**, said when they are not the ringed cell's
  ("in that cell"), and **"too"** on a later leg, as `later` already
  shapes `again`.
- Crossing and Undead drop their closings; Subsets' move is looked at
  against it, and stays its own only with a stated reason.
- The exception goes from `docs/hints.md` and from the requirement
  "A game's hint sentences SHALL be stated in its description".

## Acceptance

Each game's word dump (`research/hint-walk-dump/`) before and after, the
diff read and every changed sentence listed; the marks a step draws do not
change. Each game read in the running app.
