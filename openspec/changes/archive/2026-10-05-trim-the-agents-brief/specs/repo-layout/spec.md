## REMOVED Requirements

### Requirement: Agent-facing documentation is one AGENTS.md and no tool generates a second

**Reason**: It said a rule established by a completed change SHALL appear in `AGENTS.md`, which is how the file reached 899 lines, and that project guidance about a tool belongs there too.

**Migration**: "Agent instructions have one root file, and no record of completed work is hand-maintained" below keeps the symlink, the ban on a hand-kept record, the sweep before history is removed and the ban on a generated second file. Where a rule goes is in "The root brief is bounded, and the project's rules live in the README and the guides".

## ADDED Requirements

### Requirement: Agent instructions have one root file, and no record of completed work is hand-maintained

The repository SHALL keep one agent-facing instruction file at its root, `AGENTS.md`, and `CLAUDE.md` SHALL be a symbolic link to it so that tools reading either name see the same content.

No record of work already completed SHALL be hand-maintained anywhere: not in `AGENTS.md`, not in `README.md`, not in a guide. The record is `openspec/changes/archive/`, `openspec/postmortems/` and the git log, all produced by the workflow as a side effect of doing the work.

When history is removed from a maintained document, any rule stated only inside it SHALL be lifted out first. A sweep of the removed text for normative language is what catches a lesson embedded in an incident write-up.

No tool SHALL generate a second agent-facing instruction file inside the repository. A generated file that must be edited to be correct is a file whose corrections have an expiry date.

#### Scenario: CLAUDE.md and AGENTS.md never drift

- **WHEN** a contributor reads `CLAUDE.md`
- **THEN** the content is identical to `AGENTS.md`
- **AND** `readlink CLAUDE.md` resolves to `AGENTS.md`

#### Scenario: openspec generates no second instruction file

- **WHEN** the repository is searched for an openspec-generated instruction file
- **THEN** neither `openspec/AGENTS.md` nor `openspec/OPENSPEC_AGENTS.md` exists
- **AND** the workflow is reached through the installed `openspec-*` skills

#### Scenario: Running the tool's update does not silently overwrite

- **WHEN** a contributor runs `openspec update`
- **THEN** it reports what it would change and requires confirmation or `--force` rather than rewriting files unprompted
- **AND** project-authored content in `AGENTS.md` survives the run untouched

#### Scenario: A completed change is recorded by the workflow, not by hand

- **WHEN** a change is archived
- **THEN** its record is the archived change directory and the git log, with no digest of it written into any maintained document
- **AND** whatever rule the change established is stated in the present tense in the guide for the part of the tree it binds

#### Scenario: Removing history does not lose a rule

- **WHEN** history is removed from a maintained document
- **THEN** the removed text is first swept for normative statements, and each is either already present in a retained section, lifted into one, or confirmed to be a fact about the past rather than a rule

### Requirement: The root brief is bounded, and the project's rules live in the README and the guides

`AGENTS.md` at the repository root SHALL be no longer than 200 lines and 20,000 bytes. The gate SHALL fail, in its fast prefix, when it exceeds either bound, naming the overage. Any other instruction file an agent loads without being asked SHALL be held to the same bound by the same check.

The line bound is the one the tool's documentation gives for a file read into every session. The byte bound exists because a line count is met by a file that never wraps.

`AGENTS.md` SHALL hold three things: the rules that apply whatever a session is working on, a map naming the guide to read before touching each part of the tree, and what is specific to a coding agent. Everything else SHALL live where any reader finds it: what the project is, how it is laid out and how it is built in `README.md`, and how work is done here in a guide under `docs/`. Where a completed change establishes a rule, the rule SHALL go in the guide for the part of the tree it binds, and in `AGENTS.md` only when it binds every session.

A fact the tree itself states SHALL NOT be restated in `AGENTS.md`, `README.md` or a guide: which directories exist, what a script runs, what a file contains. The source answers these and cannot go stale, and `AGENTS.md` SHALL tell a reader to go to it. What is written down is what the source cannot say: a rule, a decision, a reason, or a trap the code does not warn about.

How a third-party tool behaves SHALL NOT be described either, openspec included: its commands, its file formats and what its versions accept are documented by the tool and change with it. This repository states which tool it uses and what it has decided about its own workflow.

History SHALL NOT be written into `AGENTS.md` or carried from it into a guide: the incident that taught a rule, when it happened, what a file used to say. What is kept from an incident is what a later session acts on, which is the rule and any concrete shape to look for. The record is the archive and the git log.

`AGENTS.md` SHALL open by saying that a change which would make it longer is made only when there is no better way to achieve the same thing.

Material addressed to one tool SHALL be used only for what is inherently specific to that tool, and SHALL NOT be the only place a rule of this project is written.

#### Scenario: a change adds a paragraph past the bound

- **WHEN** a commit leaves `AGENTS.md` over 200 lines or over 20,000 bytes
- **THEN** the gate fails before any test runs, naming the file and by how much

#### Scenario: the check stops seeing the file

- **WHEN** `AGENTS.md` is missing or `CLAUDE.md` no longer resolves to it
- **THEN** the check fails and says so, rather than passing over nothing

#### Scenario: a fact about the tree is asked of the tree

- **WHEN** a session needs to know what the gate runs or where a kind of file lives
- **THEN** it reads the script or lists the directory, and no instruction file or guide carries a copy to disagree with it

#### Scenario: a rule is readable without the tool

- **WHEN** a contributor who uses no coding agent looks for the rule that governs a part of the tree
- **THEN** it is in `README.md` or under `docs/`, and no file under a tool's own directory is needed to find it
