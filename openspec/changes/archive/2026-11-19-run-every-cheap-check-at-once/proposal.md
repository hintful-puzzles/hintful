## Why

The owner asked, 2026-11-19, for the ergonomics problems found in the session
logs of the Wordguess and Wordtrail implementations to be filed. This was the
costliest, and every session hit it.

The gate's fast prefix is fail-fast (`set -e` in `scripts/gate.sh`), so a
gated commit reports one refusal, the agent fixes it, and the next attempt
reports the next. Measured from the logs (2026-11-18 and 19):

- Wordguess's last commit took eight gated attempts over about 40 minutes;
  the owner asked mid-way whether it was taking longer than usual.
- A Wordtrail commit took seven attempts in 12 minutes, another four.
- The refusals were cheap checks, each seconds on its own: biome
  formatting, `spelling.mjs`, `unused-exports`, `absence-spelling`,
  `openspec validate --all --strict` (a requirement over 500 characters),
  `spec-subjects` (a subject out of order), and a source scan for a stale
  plant.
- `npm run game <id>` passed before several of those refusals: it runs biome
  over `src/games/<id>` only (`scripts/game.ts`), so an engine or describe
  file the game's work touched is unformatted until the hook says so.
- An archive merges deltas into the main specs, and only then does the gate
  refuse what it merged: requirements over 500 characters (four sessions,
  one agent wrote a scratch `longreq.mjs` to find them) and an added
  requirement appended out of subject order, which
  `spec-subjects.mjs --fix` mends but which the archive skill does not run.

One agent wrote its own loop over `scripts/checks/*.mjs` mid-session to get
all the failures at once. That loop is what the repo should own.

## What Changes

- A command that runs every check of the gate's fast prefix that costs
  seconds, keeps going past a failure, and ends by listing every refusal
  with the command that reproduces it. It applies the fixes that are
  mechanical (biome's `--write` on the files in the change, `spec-subjects
  --fix`) and reports the rest.
- `npm run game <id>` runs the same command, scoped to what the working tree
  changed rather than to the game's directory, so a green verdict means the
  commit's cheap checks pass.
- After `openspec archive`, the same command covers what the archive merged:
  it reorders subjects and names every merged requirement over the limit, so
  the archive commit's first gated attempt is the one that lands.
- The gate itself stays fail-fast: what changes is that nobody has to reach
  it to learn what it will say.

## Impact

`scripts/gate.sh` (its fast prefix is factored so the new command and the
gate run one list of checks, never two copies), `scripts/game.ts`,
`package.json`, `docs/testing.md` § "A game's verdict in one command",
`docs/work-management.md` § "Before archiving".
