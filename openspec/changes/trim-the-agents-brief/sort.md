# The sort (task 2.1)

Every paragraph of `AGENTS.md` as it stood at commit `1f597366`, with one
disposition. Paragraphs are blank-line separated and numbered in file order;
this command prints the same numbering with each paragraph's word count:

```
awk 'BEGIN{RS="";FS="\n"} {n++; w=split($0,a,/[ \n\t]+/); print n "\t" w "\t" substr($1,1,80)}' AGENTS.md
```

It prints 155 paragraphs. A paragraph that is one list is split into lettered
rows where its items go different ways. The proposed root file is
`root-draft.md` beside this table: 171 lines and 9,809 bytes against a bound of
200 and 20,000.

## Dispositions

- **root**: stated in `root-draft.md`, in the section named.
- **tree**: deleted. The file or command named states it.
- **tool**: deleted. A third-party tool's behavior, which the tool documents.
- **hist**: deleted as history. The rule it supported is named, with where
  that rule is.
- **stale**: deleted because it is false today. Found by the prompt audit
  (`prompt-audit.md`) or by this read.
- **guide, there**: the named guide section already says it. Nothing to write.
- **guide, move**: the named guide does not say it today. Task 3.1 writes it
  there, as a rule without its incident.
- **cut**: a rule or directive that goes nowhere. Each is in `directives.md`
  for the owner.

"There" was checked by searching the guide for the paragraph's own key phrase.
Where a search came back empty the row says "move".

## The table

| # | Paragraph opens | Disposition |
| ---: | --- | --- |
| 1 | `# Notes for All Agents` | root, title |
| 2 | Do not make this file longer | root, opening. Gains one sentence naming the bound |
| 3 | `CLAUDE.md` is a symbolic link | tree: `ls -l CLAUDE.md`; the title says it |
| 4 | `## Project at a glance` | heading, goes with 5 to 8 |
| 5 | PWA port … TypeScript end to end | root § "What this is"; `README.md` intro has the rest |
| 6a | All the games + the engine in | tree: `ls src`; `README.md` § "Structure" |
| 6b | TypeScript web app in `/src` | tree: `package.json`, `src/preflight.ts` |
| 6c | Help is this project's own markdown | tree: `ls help`. The rules about help are rows 140 to 147 |
| 6d | The product is Hintful Puzzles | tree: `src/project-identity.ts` header comment and `src/project-identity.test.ts`. Move into that header comment the two rules it does not state: "maintained by", never "by"; and every player-facing sentence outside `help/games/` is this project's own writing, while those pages keep upstream's wording on purpose |
| 7 | The authoritative statement of the migration approach | root § "What this is": `openspec/specs/` is normative |
| 8 | The record of how the project got here | root § "What this is". "That rule belongs here" becomes "in the guide it binds", root § "Rules for every session". The `project.md` story is hist |
| 9 | `## Dev guides under docs/games/` | heading |
| 10 | Whenever you work on a game | root § "Read the guide before you touch" and the "Update the guide" rule |
| 11 | the list of eight guides | root, the map. The `docs/test-strength.md` §7 warning is the map row "or quoting a measurement" |
| 12 | Treat these as a live wiki | root, "Update the guide" rule; guide, there: `docs/games/README.md` opening ("live wiki", "Cite sections by heading"). The dead `§<number>` story is hist |
| 13 | `## Goal` | heading |
| 14 | A puzzle collection where user-facing value | root § "What the project is for"; guide, move: `docs/doctrine.md` |
| 15 | The ambition sets the scale | root, one line; guide, move: `docs/doctrine.md` keeps the reason (fixed cost at two games, marginal cost at dozens) |
| 16 | No progression features | root; guide, move: `docs/doctrine.md` keeps "the timer shows this board's time and keeps no record" |
| 17 | `### Convention over configuration` | heading |
| 18 | A game's directory should contain | root, one line; guide, move: `docs/doctrine.md` |
| 19 | The bar for a new game | root, same line. The tier-names story is hist |
| 20 | The test for whether a decision is real | guide, move: `docs/doctrine.md` ("can we say what a game would legitimately want to do differently?", "N games sharing a defect means the layer below is wrong") |
| 21 | A game that does not fit a convention | root, one line; guide, move: `docs/doctrine.md` keeps "derive the exception from a declaration the game already makes" and "ask first whether the exception should exist". `nonMonotone` stays as the exemplar to copy; the Dominosa story is hist |
| 22 | A consistent idiom is not the finish line | root, one line; guide, move: `docs/doctrine.md` keeps "re-read any recorded 'deliberately not shared' in that light". The `runCandidatePlan` story is hist |
| 23 | One source of truth | root, one line; guide, move: `docs/doctrine.md`. The three reversed copies are hist |
| 24 | So the direction is more declaration | guide, move: `docs/doctrine.md` keeps the direction and "ask what consumes it, then what the consumer is already being sent". What is built today is tree: `src/engine/sections.ts`, and guide, there: `docs/games/mechanics.md` § "Contract sections, and what makes a draft" |
| 25 | Where intent genuinely cannot be observed | guide, there: `docs/games/testing.md` § "How a cross-game guard finds its population" |
| 26 | How this is done, in practice | deleted: a pointer to sections of the old file |
| 27 | `## Lineage` | heading |
| 28 | Upstream / Direct parent / This project | tree: `README.md` intro and § "How the migration worked", `CREDITS.md` |
| 29 | `## Upstream policy` | heading |
| 30 | There is no C engine, and there are no merges | root § "What the project is for", last bullet |
| 31 | A new question about upstream behavior | root, same bullet; guide, there: `docs/games/README.md` § "Where the C went" (`git show`, answered behaviorally), `docs/games/solver-and-generator.md` § "A divergence retires or re-founds its fixture" |
| 32 | Game IDs from upstream … keep loading | root, same bullet (refusing a generator-written desc is a compatibility break); guide, move: `docs/doctrine.md` keeps best-effort and what is not kept. The guard is tree: `src/engine/upstream-descs.test.ts` |
| 33 | The app hands out boards, never seeds | root, same bullet; guide, move: `docs/doctrine.md` |
| 34 | The upstream MIT notices stay intact | root, same bullet. That the About dialog imports them is tree: the build fails without them |
| 35 | `## Method` | heading |
| 36 | These are the rules this project has rediscovered | hist |
| 37 | A guard must measure the thing | root § "Method"; guide, move: `docs/method.md` with the four shapes to grep for. The four incidents are hist |
| 38 | Prove a new guard fails | root; guide, move: `docs/method.md`. The Bricks story is hist |
| 39 | Carry a vacuity guard | root; guide, move: `docs/method.md` with the three ways a population comes back empty |
| 40 | A census that finds zero owes a power argument | root; guide, move: `docs/method.md` keeps "widen until a positive appears or the absence is argued from the code" and "pin the input the rung consumes, never a seed". The Rome story is hist |
| 41 | Verify a bulk edit by shape | root; guide, move: `docs/method.md` with the pure-move shape |
| 42 | Check the instrument before the finding | root; guide, move: `docs/method.md`, pointing at `docs/test-strength.md` §7 |
| 43 | A scan that keys on a name | root, one line, and the `npm run refs` line in § "Specific to a coding agent"; guide, move: `docs/method.md` keeps each shape (key on shape and classify the superset; read a small population; the syntax after the name; a constant's value typed out; a spec scenario keyed on a name; references are not implementations). Every incident is hist |
| 44 | Our own code is keyed on a reference | root, same line; guide, there: `docs/games/hints.md` § "Name the rung a step speaks"; guide, move: `docs/method.md` keeps "give the producer a field for the fact" |
| 45 | A spec delta is a claim about code that is still moving | guide, move: `docs/work-management.md`: re-read every delta against the code before archiving. The incident is hist |
| 46 | A count written in prose | root, one line; guide, there: `docs/games/README.md` § "Comments, and what earns one"; guide, move: `docs/method.md` keeps "assert the number in a test where it is the point". The three counts are hist |
| 47 | A number a proposal argues from | root, one line; guide, move: `docs/method.md` keeps "against the population" and "walk the deliverable list against what is on disk". The tile-loop figures are hist |
| 48 | A fact about the codebase rots | root, same line as 46; guide, move: `docs/method.md` keeps "date a claim about the code" and "re-verify a constraint that says don't bother looking". The Ascent story is hist |
| 49 | Don't repoint a dead recipe | root; guide, move: `docs/method.md` keeps the generated-file rule. The headers story is hist |
| 50 | An optimized artifact needs its bounds asserted | guide, move: `docs/method.md`. The color search is hist |
| 51 | `## Acceptance bar` | heading |
| 52 | Game-facing work is done when the owner says | root § "Rules for every session" |
| 53 | A shortfall is never called "cosmetic" | root, same rule |
| 54 | Run the app before declaring UI work done | root, same rule |
| 55 | `## Test discipline` | heading |
| 56 | There is no inherited test suite | hist |
| 57a | 1. Behavioral tests per ported game | guide, there: `docs/games/testing.md` § "The test tiers", § "What a new game ships" |
| 57b | 2. Dev-time differential spot-check | stale (audit finding 2): there is no C build to compare against. The truth is guide, there: `docs/games/testing.md` § "The frozen differentials" |
| 57c | 3. Pre-commit gate stays | tree: `scripts/gate.sh`, whose header says why `vite build` is in it |
| 57d | 4. NEVER EVER attempt to bypass | root, first rule, without the threat (audit finding 6) |
| 58 | In-process testing tiers | root § "Code", last bullet; guide, there: `docs/games/testing.md` § "The test tiers" |
| 59 | Tier 1 / Tier 2 / Tier 2.5 | guide, there: `docs/games/testing.md` § "The test tiers", § "Render scenarios" |
| 60 | How to use it / Tier 3 | guide, there: `docs/games/testing.md` § "Render scenarios", § "Pinning a hint's positions". The `fake-indexeddb` caveat is tree: the comment in `src/test-setup/indexeddb.ts` |
| 61 | A test earns its runtime | root § "Code", last bullet; guide, move: `docs/games/testing.md` § "Right-sizing the gate" gains the bar ("what would it catch in a refactor that no cheaper test would") |
| 62 | This retires the "extensive by default" posture | same as 61 |
| 63 | Four things keep the rule from becoming an excuse | goes with 64 |
| 64a | The gate is not what gets trimmed | root, first rule |
| 64b | Retire by measurement, never by category | guide, move: `docs/games/testing.md` § "Right-sizing the gate" |
| 64c | Say what still covers the configuration | guide, there: same section, treatment 3 |
| 64d | A slow tier nobody invokes | guide, there: same section, "Run the slow tier targeted, not whole". The 776 s figure is hist |
| 64e | The expensive tests and the porting-era tests | guide, there: `docs/games/testing.md` § "Where the cost actually is"; guide, move: it gains "record free memory and swap beside the load average". The percentages are hist |
| 64f | Time a cost on an idle machine | guide, move: `docs/games/testing.md` § "Timing anything under vitest". The figures are hist |
| 65 | Browser checks: Chrome only | root § "Specific to a coding agent" |
| 66 | Bit-identical RNG is retained | tree: `README.md` § "Structure", `src/engine/random/`. "Old C-format saves are expendable" is hist: no such save can reach the app |
| 67 | `## Hint quality bar` | heading |
| 68 | Followable how-to | root, the map |
| 69 | Explained hints are a core … product value | root § "What the project is for"; guide, there: `docs/games/hints.md` § "The quality bar" |
| 70 | points 1 to 7 | guide, there: `docs/games/hints.md` § "The quality bar" (1 to 4, 6), § "Recompute-stable plans" (5), § "Every step is a gesture" (7). Guide, move: point 5's first half, "claim only what you have checked", is in the guide once and gains a place in the bar's list. The guide's own line "The full statement is in `AGENTS.md`" is removed |
| 71 | A non-deductive game is not exempt | guide, there: `docs/games/hints.md` § "Non-deductive (heuristic) hints" |
| 72 | Every game has a hint, and a game without one is a draft | root, one line; guide, there: `docs/games/hints.md` § "Bind the words to the marks", § "Name the rung a step speaks"; guide, move: `docs/work-management.md` takes the ordering rule (the framework leads, one hintless game beside each framework change, the rest in `hintless-games-in-reserve`). **cut**: the end of October 2026 target. See `directives.md` |
| 73 | Aspirational next step | **cut** (audit finding 5): Fifteen's hint text no longer reads that way. See `directives.md` |
| 74 | `## TS port style` | heading |
| 75 | Followable how-to | root, the map |
| 76 | Port to the most idiomatic TS shape | root § "Code"; guide, there: `docs/games/mechanics.md` § "Idiomatic state, not a C transliteration". "The dev-time differential spot-check" is stale (audit finding 2) |
| 77 | `### Byte-parity was a tool` | heading |
| 78 | Matching the C is not a reason | root § "What the project is for", first bullet; guide, there: `docs/games/README.md` § "Where the C went" |
| 79 | Display code was never in scope | guide, move: `docs/doctrine.md` |
| 80 | Worth understanding about what byte-parity bought | guide, there: `docs/games/testing.md` § "Byte-match: fidelity where there is a right answer" |
| 81 | No requirement asks for C compatibility | guide, there: `docs/games/solver-and-generator.md` § "A divergence retires or re-founds its fixture" |
| 82 | Two things this does not license | goes with 83 |
| 83 | 1. Churn. 2. Losing the assurance silently | root, first bullet of § "What the project is for". "playbook §4 rule 3" is stale (audit finding 4) |
| 84 | Four rules, from `add-loopy-ts-port` | goes with 85 |
| 85 | the four divergence rules | guide, there: `docs/games/solver-and-generator.md` § "Divergence and what it costs" |
| 86 | `## Nothing is sacred` | heading |
| 87 | The section above released the C | hist |
| 88 | The standing instruction | root § "What the project is for"; guide, move: `docs/doctrine.md` |
| 89 | Where the line is | goes with 90 |
| 90 | Internal … just do it / player or data … check first | root § "Rules for every session", "Ask before changing" |
| 91 | The guard rails … survive intact | root, first bullet of § "What the project is for" |
| 92 | The smell to watch for | guide, move: `docs/doctrine.md` keeps the smell and its two signals. The `Midend` story is hist |
| 93 | Breaking the assumption collapsed it | hist. The owner's answer on stale saves is in `directives.md` |
| 94 | So the question to ask | root, "Nothing is sacred" bullet |
| 95 | `## Build commands` | heading |
| 96a | There is no asset build | tree: `README.md` § "Building". Which scripts went is hist |
| 96b | `npm run dev` / `build` / `preview` / `check` / `test` | tree: `package.json`. "tsc + vite" is stale (audit finding 3) |
| 96c | The app is live … nobody deploys it by hand | tree: `.github/workflows/ci.yml`, `README.md`; the build-only run and the owner's reason are the comment at step 1c-i of `scripts/gate.sh` |
| 96d | `_headers` is a real deploy artifact | tree: the comment above `CLOUDFLARE_HEADER_RULE_LIMIT` in `vite.config.ts`, where the build fails on a per-puzzle rule |
| 96e | A build's environment changes its output | tree: `.github/workflows/ci.yml`, `vite.config.ts` |
| 96f | Verify a deploy against the deployed origin | guide, move: `docs/work-management.md`, with the service-worker trap |
| 96g | `npm run probe` | guide, there: `docs/test-strength.md` §2a |
| 96h | `npm run hint-scan` | guide, there: `docs/games/testing.md` § "Pinning a hint's positions" |
| 97 | Nothing under `src/assets/` is generated | tree: `src/asset-integrity.test.ts`, `openspec/specs/puzzle-icons/spec.md`, `README.md` § "Structure". What went is hist |
| 98 | `## Code conventions` | heading |
| 99a | TypeScript: strict, no `any` | root § "Code" |
| 99b | Absence | root § "Code"; guide, there: `docs/games/mechanics.md` § "Absence is `null`" |
| 99c | Formatter / linter | root § "Code"; tree: `biome.json` |
| 99d | Comments | root § "Code"; guide, there: `docs/games/README.md` § "Comments, and what earns one" |
| 99e | Spelling | root § "Code"; tree: `scripts/checks/spelling-table.mjs` is the convention's one copy |
| 99f | UI / Reactive state / Persistence / Styling | tree: `package.json`, any component, `README.md` § "Structure" |
| 99g | WASM: runs in a web worker | stale (audit finding 1) |
| 99h | `help/` | guide, move: `docs/help-pages.md`. What went is hist |
| 100 | `## Constraints` | heading |
| 101a | Edit the notices in `licenses/` | root § "What the project is for", last bullet |
| 101b | Ship a help page that documents another platform | guide, move: `docs/help-pages.md`. The manual story is hist |
| 101c | Name a help source directory after a URL subdirectory | guide, move: `docs/help-pages.md` (the `EISDIR` trap) |
| 101d | Break Baseline 2023 | root § "Code" |
| 101e | top-level await in `src/preflight.ts` | tree: the header comment of `src/preflight.ts` |
| 101f | Add dependencies without considering bundle size | root § "Code" |
| 101g | Commit generated assets in `dist/` | tree: `.gitignore`; the icons exception is `openspec/specs/puzzle-icons/spec.md` |
| 101h | Catch unrecoverable errors only to log them | root § "Code" |
| 102a | touch / offline / keyboard / accessibility | root § "Code" |
| 102b | Take ownership of everything | root § "Rules for every session" |
| 102c | Refactor as you go | root § "What the project is for"; guide, move: `docs/doctrine.md` keeps the test (stable shape, or one that evolves the same way across games) and the guardrails |
| 102d | Don't ask "should I continue?" | root § "Rules for every session" |
| 103 | `## Repo layout` | heading |
| 104 | There is no C anywhere in this repo | root (`../puzzles/`); tree: `ls` |
| 105 | `../puzzles/` and `../puzzles-web/` | root names the first. The second is hist: a diff reference for the port |
| 106 | The experimental C sources kept as reading references | tree: the README in each `reference/` directory. Guide, move: `docs/doctrine.md` keeps "don't recreate a directory named for a source tree that no longer exists" |
| 107 | The build output is `dist/` | tree: `.gitignore` |
| 108 | Source tree under `src/` | goes with 109 |
| 109 | the directory list | tree: `ls src`, `README.md` § "Structure", the doc comment of `src/engine/grid/index.ts`. Guide, move: `docs/games/engine-catalog.md` gains why `src/engine/` is flat. What moved from where is hist |
| 110 | `## Special files` | heading |
| 111 | `catalog-data.ts` and the rest | tree: `src/catalog-registry.test.ts`, `src/puzzle/catalog-families.test.ts`, `README.md` § "Structure". Guide, move: `docs/games/testing.md` § "How a cross-game guard finds its population" gains the family rule (a family may be read as a population; it is never the only thing that enrolls a game in a mechanic the game could simply have) |
| 112 | `## Work management` | heading |
| 113 | Tracked via openspec | root, the line under the map; tree: `package.json`, `openspec/config.yaml`; the rest is tool |
| 114 | There is no `openspec/OPENSPEC_AGENTS.md` any more | hist, and tool |
| 115 | A decision or a follow-up is persisted by committing it | root § "Rules for every session" |
| 116 | Two corollaries | root, same rule |
| 117 | One openspec change per coherent unit of work | root, the line under the map; guide, move: `docs/work-management.md` keeps when to bundle |
| 118 | Don't wait for proposal approval | root, "Finish your own work" |
| 119 | And don't ask to have your own work accepted | root, same rule; guide, move: `docs/work-management.md` |
| 120 | Acceptance is for work whose correctness | root, same rule |
| 121 | Anything a player sees or feels | root, same rule |
| 122 | But player-visible does not automatically mean "stop and ask" | root, same rule ("genuinely unsure"); guide, move: `docs/work-management.md` keeps "make the call, say what you decided, run the app yourself" |
| 123 | the owner may defer testing to the end of the arc / asked for by name / compatibility | root; guide, move: `docs/work-management.md` keeps the deferral, taken as said only when it is said |
| 124 | Everything else … is an implementation detail | guide, move: `docs/work-management.md` |
| 125 | Stop and ask only for a genuinely difficult decision | root, "Continue by default" |
| 126 | When a change is finished and another is ready | root § "Specific to a coding agent" |
| 127 | `ADDED`, `MODIFIED`, `REMOVED` and `RENAMED` | tool |
| 128 | Retiring a scenario takes `REMOVED` plus `ADDED` | tool |
| 129 | a delta can be faithful to the wrong original | tool. The precaution goes with it; see `directives.md` |
| 130 | A `REMOVED` block is matched by heading | tool. The precaution goes with it; see `directives.md` |
| 131 | Why the gate carries a version floor | tree: `scripts/checks/openspec-version.mjs` and the comment at step 1c of `scripts/gate.sh` |
| 132 | Two smaller notes | tool |
| 133 | `## Traps that catch new game work` | heading |
| 134a | A desc that changes mid-game | guide, there: `docs/games/mechanics.md` (`supersededDesc`) |
| 134b | Suppress a no-op move locally | guide, there: `docs/games/mechanics.md` § "interpretMove and UI_UPDATE" |
| 134c | Don't map editor-only move letters | guide, move: `docs/games/input.md` |
| 134d | Printing has no implementation here | guide, move: `docs/games/mechanics.md` § "Capability flags", one line |
| 135 | `## Known unresolved questions` | heading |
| 136 | the Web Worker / a stricter differential | guide, move: `docs/doctrine.md`, as two open questions |
| 137 | `## License & attribution` | heading |
| 138 | the four license bullets | tree: `LICENSE.md`, `CREDITS.md`, `licenses/`, `README.md` § "License" |
| 139 | `## Documentation` | heading |
| 140 | The in-app help system is assembled from | tree: `ls help` |
| 141 | Never split help by authorship | guide, move: `docs/help-pages.md`. The guard is tree: `src/help-coverage.test.ts` |
| 142 | A game's help page names every mode | guide, move: `docs/help-pages.md`. The Unequal story is hist |
| 143 | Every page has one skeleton | guide, there: `docs/games/README.md` § "Definition of done"; guide, move: `docs/help-pages.md` keeps "key on the field, not the preset title". The 18-games sweep is hist |
| 144 | A game's rulesets are declared once | guide, there: `docs/games/mechanics.md` § "Params are declared once, on `paramConfig`". The Salad story is hist |
| 145 | A setting that changes one rule is a declared modifier | guide, there: same section. Guide, move: it gains "which of the two a field is gets measured, not judged" |
| 146 | A Hints section is checked for presence, not content | guide, there: `docs/games/hints.md` § "The help teaches the marks" |
| 147 | Update `/help` when adding features | guide, move: `docs/help-pages.md` |
| 148 | `## Git` | heading |
| 149a | Main branch: `main` | root, "Push to `main`" |
| 149b | Push when a task is done | root § "Rules for every session" |
| 149c | This is the one place the gate's steps are written out | tree: `scripts/gate.sh`. Its header says the readable list is this section, so the header is rewritten in 3.3 to say the script is the list |
| 150 | In order, blocking on any failure | tree: `scripts/gate.sh`, `package.json` |
| 151 | steps 1 to 13 | tree: each step's comment in `scripts/gate.sh` gives its reason. The LSP remark in step 1 is root § "Specific to a coding agent". 3.1 reads the thirteen reasons against the script's comments and moves into the script any that is in neither it nor `build-pipeline` |
| 152 | Steps 5–7 sit ahead of the documentation-only shortcut | tree: the comments at steps 1b to 1b-vi of `scripts/gate.sh`, `src/gate-scope.test.ts` |
| 153 | Three scopings by role | tree: the comments at biome, 1d, 1e and 1c-ii of `scripts/gate.sh` |
| 154 | The third is the narrowest | tree: `openspec/specs/build-pipeline/spec.md`, `src/gate-scope.test.ts`. Guide, move: `docs/games/testing.md` § "Right-sizing the gate" gains "a guard that catches what the author just wrote stays on the per-commit path; the answer to its cost is a cheaper walk" |
| 155 | the two link definitions | deleted with the links; `README.md` carries both |

## What the table adds up to

- New guides, as design D3 has them: `docs/doctrine.md`, `docs/method.md`,
  `docs/work-management.md`, `docs/help-pages.md`.
- Existing guides that gain a rule: `docs/games/testing.md` (rows 61, 64b,
  64e, 64f, 111, 154), `docs/games/hints.md` (70), `docs/games/input.md`
  (134c), `docs/games/mechanics.md` (134d, 145),
  `docs/games/engine-catalog.md` (109).
- One code comment that gains a rule: `src/project-identity.ts` (6d). One
  that is rewritten: the header of `scripts/gate.sh` (149c).
- `README.md` gains nothing. Rows that name it are already there. Its two
  pointers to `AGENTS.md` are repointed in 3.3, and one of them cites a
  section, "Approach", that the file has not had for some time.
- Five stale statements are deleted, not corrected: 57b, 76 (one clause), 83
  (one clause), 96b (one clause), 99g.

## Not yet done

Task 2.1 also asks for a normative sweep of every deleted paragraph. That is
design D8's check on the finished move and belongs to 3.1; the rows above were
classified by reading each paragraph once, and the "there" rows by one search
each. A row marked "there" on a search hit has not been compared sentence by
sentence with its paragraph.
