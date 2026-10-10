# Design

Written 2026-10-10 by the session that took the change up.

## How it is carried out

The method is that of `2026-10-09-regroup-the-specs` (its `design.md`,
§ "How it was carried out"), smaller:

- **The rules are settled a family at a time, into `rules/<family>.md`.** A
  family is the rules one shared capability would hold and one agent can
  check against the code in a sitting: `seed`, `no-op-input`,
  `candidate-walk`, `note-taking`, `colors-and-animation` and
  `engine-contract`. `brief.md` is what each agent was given, and it says
  what an entry is: a shared requirement added or reworded, a game's copy
  edited, shortened by a scenario or cut, a copy kept with its reason, a rule
  not shared with its reason, and a note for what is not this change's.
- **A second agent reviews each file**, old against new and against the
  code, and corrects it (`brief.md` § "The review").
- **The deltas are derived, never written.** A script applies every entry to
  the specs and writes each capability's delta as the difference, so a delta
  cannot disagree with the entries. The script is not in the tree; it was
  used once, and the entries are what a reader needs.
- **A game's requirement that loses a scenario under its own title has no
  delta.** The validator refuses a `MODIFIED` that leaves out a scenario the
  requirement has, and refuses one title in `REMOVED` and `ADDED`. Those were
  put into the specs from their entries after the archive ran, as the
  archived change did with its eleven. The entry of each, in its family's
  file, is the record of what changed and why.
- **An `edit` rewraps the paragraph it changes** and leaves every other line
  of the requirement as it was.

## What was stated once

Each is an `add`, a `reword` or an `edit` entry of the family's file, with
the population and what in the code makes it true.

| Rule | Capability, requirement | Family |
| --- | --- | --- |
| A seed deals one board | `engine-difficulty`, "A generator's board depends only on its params and its random state" | `seed` |
| A press on no target | `engine-input`, "A target and its cursor belong to the geometry" | `no-op-input` |
| A hint's solve reads the placed entries | `engine-candidate-hints`, "A recording solve reads the placed entries and never the notes" | `candidate-walk` |
| A hint step is never undone | `engine-candidate-hints`, "A candidate plan's step is never undone by a later one" | `candidate-walk` |
| A struck candidate is crossed through | `engine-hints`, "A highlight on a board element stays legible against its cell" | `candidate-walk` |
| The keep-track verdicts | `engine-candidate-hints`, "A candidate step is completed by the move that makes it whole" | `candidate-walk` |
| What a press selects for | `engine-notes`, "The button and the sticky preference decide the mode a press selects for" | `note-taking` |
| The preferences' defaults | `engine-notes`, "Every member offers the keep-highlight preference, defaulted the same way" | `note-taking` |
| Enter toggles pencil mode | `engine-notes`, "The select key on a showing highlight toggles pencil mode" | `note-taking` |
| Shaded or not | `engine-colors`, "Shaded or not is the pair's first member alone" | `colors-and-animation` |
| A hint's move at one duration | `engine-hints`, "A hint-executed move plays its animation at one duration" | `colors-and-animation` |
| Presets pass validation | `engine-params`, "Every default and preset passes validation for generation" | `engine-contract` |
| A move is a promise to saves | `ts-engine`, "A move a save holds keeps replaying" | `engine-contract` |

## What read wider or narrower than the code, and was corrected

- `engine-colors`, "The solved flash is one role", now "A solved flash drawn
  as a color takes a shared color": it names the lifted flash beside `FLASH`.
- `engine-colors`, "The figure the player steers takes the cursor's color":
  a figure whose faces show what it carries is the departure (Cube).
- `engine-input`, "One keyboard-cursor vocabulary across games" and "A cursor
  outside the canonical field fails the build": a cursor that is a position
  on a grid. Two games' cursors are not, Loopy's and Untangle's.
- `engine-input`, "A pointer drag over a grid has one name across the
  collection": a drag whose ends are pairs of integers in one grid space.
- `engine-notes`, the Mark-all requirements: a game with an
  obvious-candidate rule, whether or not it has uniqueness regions; and a
  fill-only Mark-all leaves a narrowed cell alone.
- `engine-candidate-hints`, "Latin-family hints distinguish naked and hidden
  singles", now "A candidate hint distinguishes naked and hidden singles":
  every game on the walk.
- `ts-engine`, "A candidate note that excludes the answer is a mistake": the
  answer comes from what the puzzle fixes, never from what the player entered.
- `engine-hints`, "Deduction runs out only where the tier permits search",
  reads true since the untiered deductive games gained a tier, and is kept.

## What was not shared

- **An input that would change nothing makes no move.** It is each game's own
  code, nothing in the engine or a guard holds it, and seven games break it:
  ABCD, Mathrax, Loopy, Pearl, Galaxies, Untangle and Group each record a
  move that leaves the board as it was, an Undo step that shows no change.
  `rules/no-op-input.md` has the input that does it in each. The games keep
  their sentences, and the defect is filed as a change of its own.
- A quiet-surface board flashing by lifting its cells, and a searched plan's
  slides for one tile being one journey: no line in the code divides the
  games that do from those that do not.
- A firing census certifying every rung of a solver ladder, and a plan
  deducing from the notes because the mistake check vouches for them: one
  game states each.
- Agreement with upstream's board from the same seed, and determinism that
  is not a generator's, stay with their games.

The `note` entries of each family's file hold what else was found and is
not this change's.

## Where it ended

By `node scripts/checks/spec-census.mjs`, on 2026-10-10:

| | Lines | Requirements | The games' lines | The engine's lines |
| --- | --- | --- | --- | --- |
| Before | 42,518 | 2,623 | 25,152 | 10,231 |
| After | 42,476 | 2,617 | 24,762 | 10,579 |

- **The specs are barely shorter**: the games lost 390 lines and the engine
  gained 348. What changed is that each rule has one place: 13 stated once,
  8 shared requirements corrected, and the copies of 52 capabilities
  shortened or cut.
- **The deltas carry 23 requirements added, 50 modified and 29 removed.**
  Twenty-one more lost a scenario under their own title and were put into
  the specs from the build after the archive ran; the tree was then compared
  with the build, requirement for requirement, by text. Each is a
  `drop-scenario` entry, or a `reword` that keeps its title, of its family's
  file.
- **The reviewers changed something in every file.** The largest: a flash
  rule false of the four games that blink between their bevel's colors, a
  generator said to read no clock where the deal's deadline reads one, a
  press rule false of Crossing, a save promise stated as absolute where a
  break is the owner's to allow, and two requirements no game had stated,
  which became `not-shared`.
- **The session took one requirement out after both agents**: `ts-engine`
  was to say that a move leaving the board as it was is still a step of
  Undo. It is true of the code and it is the defect, so the requirement
  stands as it was (`rules/no-op-input.md`).
