## ADDED Requirements

### Requirement: A change's tasks open with what is next

Every change in progress under `openspec/changes/` SHALL begin its `tasks.md` with a `## Next` section naming the next task, what it waits for and the open questions, within 20 lines and 1,600 bytes. A finished task SHALL take at most three lines, naming its commits; its reasoning is in the commit, the change's design or the guide it binds. The gate SHALL fail, in its fast prefix, on a change that breaks either bound, naming the file and the line.

#### Scenario: A finished task keeps its working notes

- **WHEN** a commit checks a task and leaves its ten lines of notes beneath it
- **THEN** the gate fails, naming the task's line and saying to condense it

#### Scenario: A change opens with its history

- **WHEN** a change's `tasks.md` begins with its first section of tasks
- **THEN** the gate fails, naming the file
