# trim-the-agents-brief

**Status: scaffolded, not started (2026-10-05).** Asked for by the owner:
*"AGENTS.md is almost 900 lines long! I don't think that really works well."*

## Why

`AGENTS.md` loads into every session, and Claude Code's documentation gives a
size for such a file: *"target under 200 lines per CLAUDE.md file. Longer files
consume more context and reduce adherence."* Its best-practices page is
blunter: *"Bloated CLAUDE.md files cause Claude to ignore your actual
instructions!"* (both read 2026-10-05, at code.claude.com/docs/en/memory and
/best-practices).

Measured the same day, `wc` on `AGENTS.md`: 893 lines, 15,824 words, 101,476
bytes. The line count flatters it, because the file does not wrap: its longest
line is 1,888 characters. Two hundred lines at this repository's 88 columns is
under 18 KB, so the file is between five and six times the recommendation.

Three sections are 36% of the words: "Method" (2,145), "Work management"
(1,795) and "Test discipline" (1,715). Most of that is the incident that
taught each rule, which a session fixing a hint's wording pays for and does
not use.

The file grows by rule. The `repo-layout` requirement "Agent-facing
documentation is one AGENTS.md and no tool generates a second" says that where
a completed change established a rule, the rule SHALL appear in `AGENTS.md`.
Every change that learns something adds a paragraph here and nothing removes
one, so a trim that leaves that sentence alone is undone in a month.

## What Changes

- `AGENTS.md` comes down to what a session needs whatever it is working on,
  inside a bound of 200 lines and 20,000 bytes.
- Rules that bind one part of the tree move to files that load when that part
  is touched. Claude Code's path-scoped rules (`.claude/rules/*.md` with a
  `paths` list) do this, and a probe in a fresh session confirmed they load on
  a matching read here. A nested `AGENTS.md` does not load here, by the same
  probe (design.md § Context).
- The incident behind a rule moves beside the how-to it explains, in the
  `docs/` guide that already covers the subject. Several sections of
  `AGENTS.md` restate a guide that exists (`docs/games/hints.md`,
  `docs/games/testing.md`), so part of the move is a merge.
- **Nothing normative is deleted.** Every line that leaves `AGENTS.md` either
  appears in a destination or is listed in a cut ledger in this change with
  its reason, and every owner directive quoted today is still quoted somewhere
  that loads when it applies.
- The rule about where a new rule goes is rewritten: it goes in the narrowest
  file that loads when it applies, and in `AGENTS.md` only when that is every
  session.
- A check in the gate's fast prefix holds the bound, for `AGENTS.md` and for
  each scoped file, so the file cannot regrow quietly.
- Every citation of an `AGENTS.md` section elsewhere in the tree is repointed
  in the same change. Outside the archive, 79 files cite the file, most often
  § "Method", § "Hint quality bar" and § "A scan that keys on a name".

Nothing a player sees changes. **The owner judges the result**: which
directives stay in the root file is their call, and at under 200 lines the new
file is short enough to read in one sitting.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `repo-layout`: a new requirement bounds the size of the root brief and of
  each scoped rules file, and says where a rule goes. The existing requirement
  "Agent-facing documentation is one AGENTS.md and no tool generates a second"
  also has to change, and its delta is written during the work, once the
  layout is settled (tasks.md 4.1 says why it is not written now).

## Impact

- `AGENTS.md` (and `CLAUDE.md`, its symlink): rewritten.
- `.claude/rules/`: new, tracked.
- `docs/games/*.md`, `docs/test-strength.md`, and possibly one new guide under
  `docs/` for the "Method" material.
- `scripts/gate.sh`: one new fast-prefix check, and the documentation-only
  pattern, which today does not match `.claude/`.
- `scripts/checks/change-citations.mjs`: its roots are `docs/` and
  `AGENTS.md`; change ids cited from the scoped files must resolve too.
- `openspec/config.yaml`: its `context:` block tells openspec to read
  `AGENTS.md`, and has to keep sending a planner to the rules that govern
  planning.
- Every file that cites an `AGENTS.md` section by name.
