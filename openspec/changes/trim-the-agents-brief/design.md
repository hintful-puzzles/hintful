## Context

See proposal.md § Why for the size and the recommendation. What shapes the
approach:

**What the documentation says about each mechanism** (code.claude.com
/docs/en/memory, read 2026-10-05):

- Imports do not help: *"Imports help you organize a long file but don't
  reduce its context cost, because imported files also load at launch."*
- A rules file with no `paths` list loads at launch, like the root file.
- A rules file with `paths` loads when Claude reads, writes or edits a
  matching file.
- A subdirectory's `CLAUDE.md` loads when Claude reads a file there.
- With a `CLAUDE.md` at the root, Claude reads `CLAUDE.md` files and not
  `AGENTS.md` files, unless the user's own setting says both. `CLAUDE.md`
  here is a symlink to `AGENTS.md`, so it counts.
- Skills are the documented home for *"a multi-step procedure"* and load on
  demand.

**What a probe showed here** (one fresh headless session, 2026-10-05, Claude
Code 2.1.289): an untracked `src/games/AGENTS.md` and an untracked
`.claude/rules/` file scoped to `src/engine/**` each carried a marker word.
After one read under each directory, the session knew the rules-file marker
and not the nested `AGENTS.md` marker. That is one run on the small model, so
task 1.1 repeats it before anything is built on it.

**Where the words are** (`awk` over the `## ` sections, words):

| Section | Words | Applies when |
| --- | ---: | --- |
| Method | 2,145 | writing a check or taking a measurement |
| Work management | 1,795 | touching `openspec/` |
| Test discipline | 1,715 | writing or running tests |
| Goal | 1,463 | every session, in a tenth of the words |
| Git | 1,299 | touching the gate; its push rule every session |
| Hint quality bar | 1,130 | touching `src/games/` |
| Build commands | 748 | every session, less the deploy detail |
| TS port style | 678 | touching `src/games/` |
| Documentation | 619 | touching `help/` |
| the other thirteen | 4,232 | mixed |

**What reads the file by name:** `scripts/checks/change-citations.mjs` (roots
`docs/` and `AGENTS.md`), `scripts/gate.sh`'s documentation-only pattern,
`openspec/config.yaml`'s `context:` block, and the citations counted in the
proposal.

## Goals / Non-Goals

**Goals:**

- The root file is inside the bound and stays there.
- A rule still reaches the session it binds, without the session having to
  choose to go and read it.
- No rule and no owner directive is lost in the move.

**Non-Goals:**

- Rewriting the rules. A rule may lose its incident to a guide; its wording
  changes only where a merge with an existing guide forces it.
- Trimming the `docs/` guides. They load on demand and have no recommended
  size.
- Serving agents other than Claude Code beyond what a plain file read gives
  them (D5).

## Decisions

**D1. The bound is 200 lines and 20,000 bytes, both.** The documentation
gives lines only, and this file's lines run to 1,888 characters, so a line
bound alone is met by never pressing return. Twenty thousand bytes is 200
lines at 100 characters. The byte figure is this change's choice, and the
owner may move it.

**D2. Scoped rules are `.claude/rules/*.md` with `paths`.** It is the one
mechanism that both loads on its own and was seen to load here. *Alternatives
considered:* nested `AGENTS.md` (did not load); nested `CLAUDE.md` symlinks
(documented to load, but every directory then needs a pair of files held
equal); imports (no saving); a link the session is trusted to follow (what
"read the relevant guide first" is today, and the reason the rules were
copied into the root file).

**D3. A scoped file holds rules; the incident goes to `docs/`.** The same
bound applies to each scoped file, or the bloat moves one directory down. A
rule keeps one sentence of why and a link to the guide section that tells the
story. Where `AGENTS.md` and a guide say the same thing, the guide's copy
survives and the other is deleted.

**D4. The first cut of the scopes**, to be corrected against the text in task
2.1:

| Scoped file | `paths` | Takes |
| --- | --- | --- |
| `games.md` | `src/games/**`, `docs/games/**` | hint bar, port style, traps |
| `tests.md` | `**/*.test.ts`, `src/engine/testing/**` | test discipline, the "Method" rules about guards |
| `openspec.md` | `openspec/**` | the delta verbs and their hazards |
| `gate.md` | `scripts/**`, `.husky/**`, `.github/**` | the gate's steps, deploy detail |
| `help.md` | `help/**` | the help skeleton |

"Method" has no natural path: half of it is about guards (tests) and half
about measuring anything. Its one-line rules stay in the root file and the
catalog of incidents becomes a guide under `docs/`.

**D5. The root file carries a map of the scoped files.** Five lines saying
which file binds which part of the tree. It is what an agent that does not
load `.claude/rules/` reads, and what a person reads.

**D6. A fast-prefix check holds the bound, and a vacuity floor holds the
check.** It counts lines and bytes for `AGENTS.md` and every file under
`.claude/rules/`, fails naming the file and the overage, and fails if it
found fewer files than it expects. It runs ahead of the documentation-only
shortcut, as the other checks that read `AGENTS.md` do.

**D7. The move is verified by shape.** Every non-blank line removed from
`AGENTS.md` appears verbatim in a destination, or is listed in `cuts.md` in
this change with a reason. The cuts are then swept for normative words
(`SHALL`, `never`, `must`, `always`, `owner`) and each hit is read, which is
what the live requirement asks before any history is removed.

**D8. Loading is verified in fresh sessions, not by reading the config.** One
probe per scoped file: a headless session reads one matching file and answers
a question whose answer is only in that scoped file. One more answers a
root-file question with no read at all.

## Risks / Trade-offs

- **A rule that used to be in every session is now absent until a matching
  file is read.** A session that plans a game change without opening a game
  file has not loaded the hint bar. → The root file keeps a one-line form of
  each rule whose breach is expensive, and D5's map names the rest.
- **`.claude/rules/` is Claude-specific.** → D5; and the content is plain
  markdown that any agent can be pointed at.
- **Path matching fires on Read, Write and Edit, not on a shell command.** A
  session that only runs `git` against `openspec/` loads nothing. → Task 3.3
  checks whether the openspec skills read a file under `openspec/` early
  enough, and if not, the delta hazards keep a root line.
- **Merging into a guide can drop a nuance the `AGENTS.md` copy had.** → D7
  treats a merged line as a cut unless it survives verbatim.
- **Repointing 79 files' citations is a bulk edit.** → Every changed line in
  that diff is asserted to be a citation, and the old section names are
  searched for afterwards by what they said.
