# Cuts: repo-layout

Requirements: 160 before, 146 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| A relocation within `src/` preserves git history | how | Git stores no rename: `git mv` and delete-plus-add make the same commit, and `--follow` reads both alike |
| "no module SHALL carry a `bridge.ts`", in "A shared library lives under `src/engine/`" | obsolete | No `bridge.ts` is tracked, and the toolchain it configured is gone |
| `src/native/` does not exist | obsolete | `git ls-files src/native` is empty, and nothing would bring the name back |
| A module is not required to carry a C-captured fixture corpus | port | No C build exists to capture from; "A C-recorded fixture is kept for what cannot be derived" says what the frozen ones are for |
| Rendering is verifiable in-process, agent-checkable | duplicate | "The render harness is one recorder and one scenario driver", "A draw record is deterministic", and tier 2 of "Behavior is testable in-process across three tiers" |
| The list of guide file names, in "The game guides are organized by concern" | declared | `docs/games/` and the table in `AGENTS.md` § "Read the guide before you touch" |
| Each layering rule is seen to fail | process | `docs/method.md` § "See a guard fail before trusting it" |
| A measuring harness is checked before its results are trusted | process | `docs/method.md` § "Check the instrument before the finding"; `docs/test-strength.md` § "7. The rule that caught the most: check the instrument against something external", which has the per-`describe` case |
| A feedback claim read off a tool's field checks what the field means | process | `docs/test-strength.md` § "7. The rule that caught the most: check the instrument against something external" ("read what the tool documents it to mean") |
| "re-checked with `openspec validate <id> --strict`" and its scenario, in "A path sweep of a pending change is scoped, and re-validated" (now "... is scoped") | duplicate | "The gate validates the specs and every open change" |
| A procedure is retired whole, never partly repointed | process | `docs/method.md` § "Retire a dead instruction" |
| A peer-comparison bar is replaced by the independent computation | process | `docs/test-strength.md` § "4a. A frozen capture used as a *quality bar* is on the wrong side of the line" |
| Retiring a fixture accounts for every fact it asserted | process | The same § 4a ("account for every fact it carried, not just the headline") |
| A change the agent scoped and decided is archived without an acceptance checkpoint | process | `docs/work-management.md` § "No approval step, and you archive your own work" |
| Owner acceptance is required only where the owner is the only judge | process | `docs/work-management.md` § "What the owner accepts", which is the newer statement and narrower than this one was |
| Scenario "Re-anchoring preserves every measurement", in "A local-feedback probe case is anchored within a named function" | obsolete | The corpus was re-anchored once and that is finished |
| A design-fiction doc SHALL NOT carry a hand-maintained status column | duplicate | "No record of completed work is hand-maintained" |
| A vision with nothing left to report is retired | obsolete | The retirement it describes was carried out; no vision is left to retire |
| The list of a citation's homes, in "The citation resolver knows every home, and the scan is floored" (now "The citation scan is floored") | duplicate | "A change id cited outside the archive SHALL resolve" lists the same homes |
| Scenario "Running the tool's update does not silently overwrite", in "Agent instructions have one root file, and no record of completed work is hand-maintained" | how | It states how the openspec CLI behaves, which "A third-party tool's behavior is not described" leaves to the tool |
