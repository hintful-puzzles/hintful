# The brief for stating what a game's spec never did

Given to the agent that writes a batch of games, and to the one that reviews
it. Written 2026-10-11.

## What this is

`docs/games/README.md` § "What a game's spec holds" says what
`openspec/specs/<game>/spec.md` holds. Some specs have never said one of those
things: the only statement of the description format is the parser. You find
those places in your games, from the code, and write the requirement that is
missing. Nothing a player sees changes, and no code, test, help page or guide
is edited.

Read first: `AGENTS.md`, `docs/games/README.md` § "What a game's spec holds",
and the `rules: specs:` list of `openspec/config.yaml`.

## What a game's spec owes

For each of your games, read `src/games/<game>/`, its spec, and
`help/games/<game>.md`, and settle each of these:

| Kind | What the code says | The spec owes |
| --- | --- | --- |
| `desc` | `newState` and what it parses, `newDesc`, `supersededDesc` | The description format as the parser reads it, and what it refuses |
| `params` | `paramsCodec` or `encodeParams`/`decodeParams`, `validateParams` | The encoding, letter by letter, what the short form leaves out, and each refusal that is the game's own |
| `pref` | `prefs` | Each preference of the game's own: its key (`kw`) and what it changes |
| `control` | `targetVerbs`, `interpretMove`, `requestKeys`, the help's Controls section | What each button, drag, key and keypad key does |
| `hint` | `hintRungs`, `hint` | Each technique the hint has, in what order it tries them, and what it says and marks where that is not stated |
| `words` | `statusbarText`, preset titles that are not the engine's | What the status bar says and when; what a title of the game's own means |

`facts.json` in the scratch directory you are given holds, for every game,
what its `Game` object answered on 2026-10-11: the params strings of every
preset, the fields of its Custom dialog, a description dealt from its first
preset (`newDesc(firstLeaf(presets()), randomNew("facts-<id>"))`), its
preference keys, its rung ids, and whether it has a status bar. Start from it;
it is the population, and the spec is checked against it item by item.

## What is not a gap

- **A rule of the collection the game merely follows.** The engine's
  capability states it once: `engine-notes` the pencil preferences
  (`sticky-pencil-mode`, `pencil-keep-highlight`, `hint-notes`) and Mark-all,
  `engine-hints` when a hint is refused and how its marks are drawn,
  `engine-input` and `ts-engine` the cursor, the arrows and the shared
  gestures, `engine-params` and `engine-difficulty` the codec's shared
  segments and the tiers, `border-grid` the border games' input. Before
  writing `not-owed`, open that capability and name the requirement that
  covers this game with no departure. Where the game departs, the departure is
  owed.
- **What the spec already says**, under any title and in any requirement's
  body or scenarios. Search the whole spec for the subject, and for the
  literal (a params letter, a `kw`, a key), before calling it a gap. Name the
  requirement that states it.
- **A rung id.** A spec names a technique in the words the hint uses or the
  help page gives it, never by `hintRungs` id alone. A technique is stated
  when a requirement says what it concludes and from what.
- **How a thing is built**, a copy of a preset table or a palette, and what the
  `Game` type says of every game.

When unsure whether the spec states something, it does not: a session checking
a change against the spec would not have found it either.

## What you write

Two files per game, and nothing else in the tree.

**`openspec/changes/state-what-a-games-spec-never-did/census/<game>.md`**, one
row per item the game owes:

```markdown
# <game>

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format | stated | "Net descriptions ..." |
| params | the `b` letter | gap | "Net's params ..." (new) |
| pref | `sticky-pencil-mode` | not-owed | `engine-notes`: "..." |

## Defects

## Notes
```

`Verdict` is exactly `stated`, `gap` or `not-owed`. `Where` is the title of
the requirement that states it, of the one you wrote, or of the shared one.
`## Defects` holds each place the code and the help page disagree, with file
and line of both: the requirement states what the code does, and nothing is
fixed. `## Notes` holds anything else a later session needs: a rule several of
your games each lack that the engine could state once, a bug, a requirement
already in the spec that the code contradicts. Write "None." under a heading
with nothing to say.

**`openspec/changes/state-what-a-games-spec-never-did/specs/<game>/spec.md`**,
only for a game with a gap:

```markdown
## ADDED Requirements

### Requirement: <title>

<SHALL sentences>

#### Scenario: <name>

- **WHEN** ...
- **THEN** ...
```

- One requirement per behavior, at most 500 characters before its first
  scenario, at least one scenario, in the present tense. No date, no change
  id, no count of games, no history, no test file and no private function
  name. Name a `Game` hook, a params letter, a key, or a sentence the player
  reads.
- Write it from the code, then read the help page. A requirement states what
  the code does.
- **A desc or params scenario quotes a real string**: one from `facts.json`,
  or one a test of the game uses, and says what it means. Do not compose one.
  A refusal scenario may alter a real string in one place and say where.
- A scenario gives a case the sentence does not. Do not restate the rule.
- A title is unique in the capability and reads as the rule ("Flip
  descriptions are two hex strings"), in the manner of the spec's other
  titles.
- **A subject the spec covers in part is a `## MODIFIED Requirements` entry**,
  under the existing title, restating the requirement whole: every sentence
  and every scenario it has, word for word, with what was missing added. The
  validator refuses one that drops a scenario. Prefer an `ADDED` requirement
  on the part that is missing where that reads as its own rule.
- A hint with many techniques is several requirements, by family, and one
  that gives the order they are tried in.

## The check

`npx --no-install openspec validate state-what-a-games-spec-never-did --strict`
passes with your files in it; other agents are writing other games' files at
the same time, so a failure that names a game not yours is not yours to fix.

To run a string through a game, write `src/scratch-spec-<your batch>.test.ts`,
build a report as a string and `throw new Error(report)` (the config swallows
`console.log`), run it with `nice npx vitest run <that file>`, and delete the
file before you finish. Do not import `node:fs`. Do not commit, and do not run
the gate.

## The review

The reviewer is given the same batch after the writer has finished, and reads
each game's census and delta beside the code and the help page:

- every `stated` row: the requirement named does say it;
- every `not-owed` row: the shared requirement named exists and covers this
  game with no departure;
- every `gap` row: each sentence of the requirement is what the code does,
  read against the lines that do it, and each string a scenario quotes is run
  through the game (`decodeParams`/`encodeParams`, `newState`) and means what
  the scenario says;
- the population: every preference key, every params field, every rung and
  the status bar of `facts.json` has a row, and the controls rows cover the
  help page's Controls section;
- a `MODIFIED` requirement loses no sentence and no scenario of the one in the
  tree.

It corrects the files itself, runs the check, and reports what it changed and
what it could not settle. It does not remove a requirement because a test
holds the behavior.

## What you report

For each game: the count of rows by verdict, the titles written, each defect,
and anything you could not settle. For the batch: what several games lacked
in the same way.
