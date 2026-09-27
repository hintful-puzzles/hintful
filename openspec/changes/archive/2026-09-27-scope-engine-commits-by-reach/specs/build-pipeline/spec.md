## MODIFIED Requirements

### Requirement: The pre-commit hook may run a selected subset of the suite

The **automatic per-commit hook** MAY run only the test files a commit can have
broken. CI and a manual `npm run gate` SHALL continue to run the whole suite, so
the guarantee on `main` is unchanged — the same backstop argument that already
scopes biome to staged files in the hook and to the whole tree in CI.

The selection SHALL be the **union of two channels**, because neither is
sufficient alone:

1. the static import graph, via `vitest list --changed`;
2. every test whose walk reaches a staged path, where the walk follows imports
   and reads the `import.meta.glob` calls of **every module it visits**, not
   only of the test file. A guard that reads source through a helper reads what
   the helper's glob matches, and a scan of the test file alone cannot see it.

The glob channel SHALL match by the pattern's **literal base directory** — the
prefix before its first wildcard — rather than by evaluating the pattern. A
matcher for Vite's glob syntax is a component that can be subtly wrong, and
being subtly wrong here means silently not running a guard; matching by base
directory can only ever select *more* tests. It MAY also require a match to end
in the pattern's literal last segment, or in the literal after a last segment of
the form `*<literal>`, since every file the pattern matches does.

The selector SHALL **fail closed**, resolving to the whole suite whenever: a
staged path lies outside the directories it models, the union is empty, or
anything at all goes wrong.

A test SHALL NOT reach its subject through a channel the selector cannot model.
A guard SHALL assert this by reading the tree — failing on a computed
`import.meta.glob` pattern, or on a direct filesystem read from a test inside the
gate's `include` — and SHALL be shown to fail before it is trusted. The gate
SHALL also hold the walk to known couplings on the real tree, among them a glob
reached only through a helper, so that a walk gone blind fails rather than
reporting a small selection.

#### Scenario: A commit changes a help page

- **WHEN** only files under `help/` are staged
- **THEN** the guards that glob `help/` are selected and run
- **BECAUSE** the import graph alone selects nothing for such a change, which is
  the defect that made graph-only selection unusable

#### Scenario: A commit touches a file the selector does not model

- **WHEN** a staged path lies outside the modeled directories — a config file, a
  template, a script
- **THEN** the whole suite runs
- **BECAUSE** a wrong "everything" costs minutes and a wrong subset costs a guard

#### Scenario: A test acquires an unmodeled read channel

- **WHEN** a test is written with a computed glob pattern, or reads the
  filesystem directly
- **THEN** the guard fails the build and names the file
- **BECAUSE** the coupling would otherwise be invisible to the selector, and the
  commit that broke it would pass without ever running it

#### Scenario: A guard reads source through a helper

- **WHEN** an engine module is staged, and a guard reads engine source only
  through a helper module's glob
- **THEN** the guard is selected
- **BECAUSE** the helper's glob is read by every file that imports the helper,
  and a selector that read only the test file's own globs would skip it

## REMOVED Requirements

### Requirement: The pre-commit hook narrows the cross-game sweeps to the games a commit touched

**Reason**: Narrowing now reaches commits that touch the engine too. The removed
requirement's scenario "A commit touches the engine as well" forbids exactly
that, so it cannot be modified in place.

**Migration**: "The pre-commit hook narrows the cross-game sweeps to the games a
commit can reach" replaces it and carries its surviving scenarios. A commit
confined to game directories narrows exactly as before.

## ADDED Requirements

### Requirement: The pre-commit hook narrows the cross-game sweeps to the games a commit can reach

The **automatic per-commit hook** SHALL skip the cross-game cases of every game
whose code cannot reach a staged path, and SHALL NOT skip anything else on that
basis. CI and a manual `npm run gate` SHALL never narrow, so the guarantee on
`main` is unchanged. A cross-game guard runs one case per game, and on a
Pearl-only commit, measured 2026-09-27, 518 s of 593 s of test time was such
cases and 413 s of it was other games' cases.

The **scope** SHALL be the games that reach a staged path: a game whose
directory holds it, and a game whose own files' walk reaches it through imports,
globs or text imports. A test file outside the game directories whose walk
reaches a staged path **without passing through a game directory** SHALL run
with every game's cases, in a test run of its own, because the name filter is
one per run.

A skipped case SHALL be one the commit could not have turned red, which requires
both halves of a soundness condition: **the case's file reaches no staged path
except through a game, and every such game is in scope**; and **a case titled
`<id>: …` depends on no game but `<id>`**, which holds because a game cannot
import another game and no case reads a second one on purpose. A case is
recognized by that title and by nothing else, so a guard that titles its cases
otherwise is not narrowed, which only costs time. When no game reaches a staged
path the hook SHALL NOT narrow at all.

The scope SHALL travel as a single value, `GATE_GAME_SCOPE`, honored only beside
`GATE_PRECOMMIT=1`, so it inherits that toggle's backstop. The name filter that
skips the cases and the helpers that narrow the assertions spanning a sweep SHALL
both be derived from it, so they cannot disagree about which games ran. Skipped
cases SHALL be reported as skipped at the runner level.

An assertion that reads across a sweep SHALL be narrowed **with** the sweep, as
"The pre-commit gate minimizes wall-clock without dropping checks" already
requires of an assertion whose verdict depends on narrowed work.
A ledger compared against what the cases found SHALL be filtered to the games
that ran, so the touched game's entry is still held to its case. A floor over the
whole population that no subset can be expected to meet SHALL be skipped on a
narrowed run, unless a touched game could move it on its own; such a floor SHALL
be computed over the whole population without the narrowed work, so that it
still runs.

A helper module that reads a broad tree through a glob SHALL be kept apart from
helpers that do not, so that importing one does not make a guard read the whole
tree. The narrowing works at the grain of a module, and a glob reached through
a shared helper makes every importer of that helper run whole.

#### Scenario: A commit touches only one game

- **WHEN** every staged path is under `src/games/pearl/`
- **THEN** the hook skips every cross-game case titled for a game other than
  Pearl, and runs Pearl's
- **AND** reports the skipped cases as skipped
- **BECAUSE** no other game's verdict can have changed, and CI runs them all

#### Scenario: A commit touches an engine module some games use

- **WHEN** the staged path is an engine module that the Latin-square games
  import and no guard imports itself
- **THEN** the cross-game guards run the cases of the games that reach it and
  skip the rest
- **AND** a test file that imports the module itself runs with every game's
  cases
- **BECAUSE** a game that does not reach the module cannot have changed
  verdict, while a file that reads the module itself can fail in any case

#### Scenario: A commit touches a module every guard reads itself

- **WHEN** the staged path is the midend, which every cross-game guard imports
  directly
- **THEN** those guards run with every game's cases
- **BECAUSE** a module a guard reads itself can change every case in it

#### Scenario: A ledger is compared on a narrowed run

- **WHEN** the hook narrowed the run to one game, and a guard compares an
  exemption ledger against the games its cases found
- **THEN** the comparison is made over the ledger's entries for the games that
  ran
- **BECAUSE** skipping it would drop a check of the touched game's own entry,
  and making it whole would fail on every game whose case never ran

#### Scenario: A game drops out of a population no case can see

- **WHEN** a commit touching only one game removes that game's keypad, so it
  has no on-screen-key case left to fail
- **THEN** the floor on the number of games offering a keypad is still
  evaluated over every game, exactly as on an unnarrowed run
- **BECAUSE** that floor is read from the games without building a board, so
  narrowing the cases does not narrow it
