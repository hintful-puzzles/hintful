## Context

See proposal.md § Why for the size and the recommendation. What shapes the
approach:

**The owner's constraint** (2026-10-05): *"I do want to avoid over-claudifying
it to the extent possible, and would suggest that we use the readme and docs/
for anything that isn't inherently Claude-Specific."* So the content moves to
files any reader or agent opens the ordinary way, and a Claude-only mechanism
is used only where nothing else does the job.

And, the same day: *"wherever possible, particularly for factual information
that can be derived by looking at the codebase directly, I'd prefer to just
delete it rather than relocate it, and encourage future agents to look at the
source."* So deletion is the first choice for a fact, and moving is for what
the source cannot say.

**What the documentation says about each mechanism** (code.claude.com
/docs/en/memory, read 2026-10-05):

- Imports do not help: *"Imports help you organize a long file but don't
  reduce its context cost, because imported files also load at launch."*
- A file under `.claude/rules/` with a `paths` list loads when Claude reads,
  writes or edits a matching file. It is Claude-specific.
- With a `CLAUDE.md` at the root, Claude reads `CLAUDE.md` files and not
  `AGENTS.md` files, unless the user's own setting says both. `CLAUDE.md`
  here is a symlink to `AGENTS.md`, so it counts.

**What a probe showed here** (one fresh headless session, 2026-10-05, Claude
Code 2.1.289): an untracked `src/games/AGENTS.md` and an untracked
`.claude/rules/` file scoped to `src/engine/**` each carried a marker word.
After one read under each directory, the session knew the rules-file marker
and not the nested `AGENTS.md` marker. So the portable form of path scoping,
a nested `AGENTS.md`, does not reach Claude in this repository. One run on
the small model; task 1.1 repeats it.

**Where the words are** (`awk` over the `## ` sections, words), and where a
home for them already exists:

| Section | Words | Existing home |
| --- | ---: | --- |
| Method | 2,145 | none; `docs/test-strength.md` §7 holds part |
| Work management | 1,795 | none |
| Test discipline | 1,715 | `docs/games/testing.md`, `docs/test-strength.md` |
| Goal | 1,463 | none; `README.md` states the product |
| Git | 1,299 | none; `scripts/gate.sh` is the executable copy |
| Hint quality bar | 1,130 | `docs/games/hints.md` |
| Build commands | 748 | `README.md` § "Building" |
| TS port style | 678 | `docs/games/mechanics.md`, `solver-and-generator.md` |
| Documentation | 619 | none |
| the other thirteen | 4,232 | `README.md` § "Structure", § "License" for several |

`README.md` is 174 lines and already has "Structure", "Building", "Commands",
"Contributing / work tracking" and "License" sections, so "Repo layout",
"Build commands", "Lineage" and "License & attribution" largely exist there
already.

**What reads `AGENTS.md` by name:** `scripts/checks/change-citations.mjs`
(roots `docs/` and `AGENTS.md`), `scripts/gate.sh`'s documentation-only
pattern, `openspec/config.yaml`'s `context:` block, and the citations counted
in the proposal.

## Goals / Non-Goals

**Goals:**

- The root file is inside the bound and stays there.
- The project's rules are in files that are not addressed to one tool.
- A session about to work on a part of the tree reads that part's guide
  first, and this is measured, not assumed.
- No rule and no owner directive is lost in the move.

**Non-Goals:**

- Rewriting the rules. A rule may move and may lose a duplicate; its wording
  changes only where a merge with an existing guide forces it.
- Bounding the `docs/` guides. They are read on demand and no recommendation
  covers them.

## Decisions

**D1. The bound is 200 lines and 20,000 bytes, both.** The documentation
gives lines only, and this file's lines run to 1,888 characters, so a line
bound alone is met by never pressing return. Twenty thousand bytes is 200
lines at 100 characters. The byte figure is this change's choice, and the
owner may move it.

**D2. Each paragraph is asked one question first: does the tree already say
this?** If a reader can learn it from a file, a script or a command's output,
it is deleted, and the cut ledger names what answers it. That takes most of
"Repo layout", "Special files", "Build commands" and the per-step list in
"Git" (`scripts/gate.sh` carries a comment per step). What survives the
question is a rule, a decision, a reason, or a trap the code does not warn
about. The test for a doubtful one is the documentation's: would removing it
cause a mistake that reading the source would not prevent?

A deleted fact sometimes has a reason attached that the source does not
carry, such as why the production build is in the gate. The reason is kept
and the fact goes; where the reason belongs beside the code, it moves into a
comment there, which the comments rule in "Code conventions" already allows.

**D2a. What is kept goes to `README.md` and `docs/`, by audience.** What the
project is and whose work it stands on is for anyone, and goes in
`README.md`, which already has most of it. How work is done here goes in a
guide under `docs/`: the existing one where the subject has one, a new one
where it does not. Where `AGENTS.md` and a guide say the same thing, the
guide's copy survives.

**D3. New guides, first cut**, to be corrected against the text in task 2.1:

| Guide | Takes |
| --- | --- |
| `docs/method.md` | "Method", with its incidents |
| `docs/work-management.md` | "Work management": openspec, the delta verbs, acceptance |
| `docs/help-pages.md` | "Documentation": the help skeleton and its checks |

The gate gets no guide. Its steps are `scripts/gate.sh`, which comments each
one, and its rules are `build-pipeline` requirements; task 2.1 checks each
reason in "Git" against those two before cutting it, and moves into
`gate.sh` any reason found in neither.

"Goal", "Convention over configuration" and "Nothing is sacred" are the
project's doctrine and have no guide. Their short form stays in the root
file and the long form goes in one guide, `docs/doctrine.md`.

**D4. `AGENTS.md` keeps three things.** The rules whose breach is expensive
whatever the task, in one line each (never bypass the gate, the acceptance
bar, ask before breaking a player's data, own what you see, push when done).
A map: for each part of the tree, the guide to read before touching it, and
the instruction to read the source for any fact about the tree. And what is
specific to a coding agent, which D5 covers.

**D5. What is inherently Claude-specific stays in `AGENTS.md`, in one short
section, and nowhere else.** By reading, that is: the `playwright-cli` skill,
which language server the LSP tool runs, and the `continueInNewSession`
handoff. The file is the one Claude loads, so they need no second location.
No `.claude/rules/` directory is created by default.

**D6. Whether the map is enough is measured, and a Claude-only trigger is
the fallback, not the plan.** The risk in D2 is that a guide is only read if
the session chooses to. Task 4.3 runs fresh sessions that are asked to make
a small change in a game, in a test and in an openspec delta, and checks
from the transcript whether the guide was read before the first edit. If a
part of the tree fails that, it alone gets a path-scoped file under
`.claude/rules/` holding one line that names its guide and no rule text. The
content stays portable either way.

**D7. A fast-prefix check holds the bound.** It counts lines and bytes of
`AGENTS.md`, fails naming the overage, and fails if the file is missing or
`CLAUDE.md` no longer resolves to it. It also takes any file under
`.claude/rules/`, so a fallback file from D6 cannot grow into a second brief.
It runs ahead of the documentation-only shortcut, as the other checks that
read `AGENTS.md` do.

**D8. The move is verified by shape.** Every non-blank line removed from
`AGENTS.md` appears verbatim in a destination, or is listed in `cuts.md` in
this change. A cut made under D2 names the file or command that answers it,
and that answer is checked to exist; any other cut gives its reason. The cuts
are then swept for normative words
(`SHALL`, `never`, `must`, `always`, `owner`) and each hit is read, which is
what the live requirement asks before any history is removed.

## Risks / Trade-offs

- **A rule that used to be in every session is now read only when the
  session goes to its guide.** → D4 keeps the expensive ones in the root file
  in one line, D6 measures the rest.
- **A deleted fact was sometimes there because the source misleads.** A line
  saying a directory no longer exists is not derivable from the tree in the
  way a line saying one exists is. → D2's test is about mistakes, so a
  warning the source cannot give counts as a trap and is kept, in its guide.
- **`README.md` is a public page.** Text moved there is read by visitors to
  the repository. → Only what D2 assigns to it goes; rules about how agents
  work do not.
- **Merging into a guide can drop a nuance the `AGENTS.md` copy had.** → D8
  treats a merged line as a cut unless it survives verbatim.
- **Repointing 79 files' citations is a bulk edit.** → Every changed line in
  that diff is asserted to be a citation, and the old section names are
  searched for afterwards by what they said.
- **The docs' numbered-section rule.** `AGENTS.md` says a `§<number>` into
  `docs/games/` is dead on arrival and guides are cited by heading name. →
  New guides use named headings only.
