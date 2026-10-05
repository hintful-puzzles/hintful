## ADDED Requirements

### Requirement: The root brief is bounded, and the project's rules live in the README and the guides

`AGENTS.md` at the repository root SHALL be no longer than 200 lines and 20,000 bytes. The gate SHALL fail, in its fast prefix, when it exceeds either bound, naming the overage. Any other instruction file an agent loads without being asked SHALL be held to the same bound by the same check.

The line bound is the one the tool's documentation gives for a file read into every session. The byte bound exists because a line count is met by a file that never wraps.

`AGENTS.md` SHALL hold three things: the rules that apply whatever a session is working on, a map naming the guide to read before touching each part of the tree, and what is specific to a coding agent. Everything else SHALL live where any reader finds it: what the project is, how it is laid out and how it is built in `README.md`, and how work is done here in a guide under `docs/`. Where a completed change establishes a rule, the rule SHALL go in the guide for the part of the tree it binds, and in `AGENTS.md` only when it binds every session.

A fact the tree itself states SHALL NOT be restated in `AGENTS.md`, `README.md` or a guide: which directories exist, what a script runs, what a file contains. The source answers these and cannot go stale, and `AGENTS.md` SHALL tell a reader to go to it. What is written down is what the source cannot say: a rule, a decision, a reason, or a trap the code does not warn about.

Material addressed to one tool SHALL be used only for what is inherently specific to that tool, and SHALL NOT be the only place a rule of this project is written.

#### Scenario: a change adds a paragraph past the bound

- **WHEN** a commit leaves `AGENTS.md` over 200 lines or over 20,000 bytes
- **THEN** the gate fails before any test runs, naming the file and by how much

#### Scenario: the check stops seeing the file

- **WHEN** `AGENTS.md` is missing or `CLAUDE.md` no longer resolves to it
- **THEN** the check fails and says so, rather than passing over nothing

#### Scenario: a session reads the guide before it edits

- **WHEN** a fresh session is asked to change a file in a part of the tree the map names
- **THEN** it reads that part's guide before its first edit

#### Scenario: a fact about the tree is asked of the tree

- **WHEN** a session needs to know what the gate runs or where a kind of file lives
- **THEN** it reads the script or lists the directory, and no instruction file or guide carries a copy to disagree with it

#### Scenario: a rule is readable without the tool

- **WHEN** a contributor who uses no coding agent looks for the rule that governs a part of the tree
- **THEN** it is in `README.md` or under `docs/`, and no file under a tool's own directory is needed to find it
