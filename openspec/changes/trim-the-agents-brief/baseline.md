# Baseline (task 1.3)

Taken 2026-10-05 at commit `1f597366`.

## Size

`wc -l -w -c AGENTS.md`: 899 lines, 15,896 words, 101,851 bytes. Longest line
1,888 characters. 155 blank-line-separated paragraphs under 22 `## ` headings.

## Owner directives

Listed with their dispositions in `directives.md`.

## Who cites the file

`git grep -l -E "AGENTS\.md|CLAUDE\.md"`, outside `openspec/changes/archive`
and `openspec/postmortems`: 80 files, of which one is `AGENTS.md` itself.

| Where | Files |
| --- | ---: |
| `src/engine/` | 23 |
| `openspec/changes/` (open changes) | 15 |
| `src/games/` | 10 |
| `scripts/checks/` | 7 |
| `docs/games/` | 6 |
| `openspec/specs/` | 5 |
| `src/` root tests and `src/screens/` | 4 |
| `scripts/` (`gate.sh`, `refs.mjs`, `feedback-probe.mjs`) | 3 |
| `README.md`, `docs/test-strength.md`, `openspec/config.yaml`, `.husky/pre-commit`, `.github/workflows/`, `.claude/commands/` | 6 |

## Which sections are cited

Counted by matching `§ "<name>"` or `section "<name>"` on the same line as the
file name. A citation wrapped across a line break is counted under its
truncated name, so the rows below are merged by hand from the raw output and
are a floor: a citation that names the file on one line and the section on the
next is not counted at all. Task 3.3 does not rely on these counts. It
searches for each old section name as a string.

| Section | Citations |
| --- | ---: |
| A scan that keys on a name (under "Method") | 16 |
| Hint quality bar | 14 |
| Method | 10 |
| Convention over configuration | 8 |
| Git | 6 |
| Test discipline | 4 |
| Check the instrument before the finding (under "Method") | 2 |
| Work management | 2 |
| Upstream policy | 2 |
| TS port style | 2 |
| Traps that catch new game work, Goal, Documentation, Acceptance bar, Byte-parity was a tool, A count written in prose, Derive the exception from a declaration, Check / Tactic / Search | 1 each |

"Check / Tactic / Search" is not a heading of `AGENTS.md` and has not been
one at this commit; it is a heading of `docs/games/solver-and-generator.md`.
`README.md` cites a section "Approach", which does not exist either. Both are
dead citations today and are repointed in 3.3 with the rest.
