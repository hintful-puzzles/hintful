## 1. Census

- [x] 1.1 Re-run the count. For each regex scan, record what it asks and
      whether a declaration could answer it.
      2026-11-20, at `dd44e452b`: 33 test files read `?raw`, and 11 more read
      through `membersNotMentioning`/`codeLinesMatching`/`testCodeLinesMatching`.
      Of 142 scans, 54 test text that is itself the subject (help, YAML,
      prose, markup, shell) and stay regexes; 22 already read the tree; 2 a
      declaration answers (`emittable-keys`: `puzzleKeyMap`, the fact
      modules' exports); 64 convert. Groups, in order:
      (a) the game-source helpers and their consumers (`border-grid-render`,
      `hint-frontier`, `kept-structures`, `ladder-continuity`,
      `note-taking-cell{,-render}`, `hint-games.ts`, `untiered-load`,
      `catalog-families`, `hatch-contrast`, `hint-enrollment`, `decimal`);
      (b) imports and calls: `module-layering`, `test-selection`,
      `no-module-mocks`, `gate-scope`'s TS half;
      (c) declarations and casts: `palette-source`, `palette-departures`,
      `coord-conversion`, `cursor-vocabulary`, `note-vocabulary`,
      `compiled-ladder`, `ladder-skip`, `stale-reads`;
      (d) the rest: `emittable-keys`, `asset-integrity`'s URLs,
      `color-scheme-default`, `project-identity`'s TS halves,
      `mistake-overlay-coverage`, `help-coverage`'s icon map; and the tree
      scans keyed on a callee's spelling (`desc-error`, `hint-refusal`,
      `params-refusal`) resolve it through the import.

## 2. Convert

- [x] 2.1 One shared, cached parse of the game sources; measure its cost
      against the regex reads it replaces. `testing/syntax.ts`. Parsing the
      580 game and engine files took 377 ms against 1657 ms for the comment
      stripping the text scans ran (2026-11-20).
- 2.2 progress: groups (a) and (b) done. Next, (c) then (d). Notes for them:
      - `syntax.ts` holds `parsed`, `nodesOf`, `usesOf`, `importsOf`,
        `importedModules`, `callsTo`, `where`, `shown`; `enrollment.ts`
        holds `gamesUsing`/`gamesNotUsing`/`gamesImporting`/
        `gamesCallingMethod`/`gameSyntax`. `gameSourceFiles` paths are now
        repo-relative (`src/games/…`): `palette-departures`' failure
        messages still strip `../../games/`.
      - `palette-source` already builds a `ts.Program` for its literal
        rule; its background-channel rule can key on the `Color` type the
        same way rather than on the names `bg`/`background`.
      - `palette-departures`' positional form labels a slot by its trailing
        comment: read it through `ts.getTrailingCommentRanges` on the
        array element, since the comment is the label.
      - `cursor-vocabulary`'s check that `pointer.ts` exports the vocabulary
        is answered by importing the names (the typecheck holds it).
      - `emittable-keys`: `puzzleKeyMap` is a public static on
        `PuzzleViewInteractive`, readable at run time; the fact modules'
        exports are their namespaces' keys.
      - The tree scans keyed on a callee's spelling (`desc-error`,
        `hint-refusal`, `params-refusal`) bind it through `usesOf`.
- [ ] 2.2 Replace each scan a declaration can answer; convert the rest to
      the syntax tree. Plant the defect each scan exists for and see it fail.

## 3. Finish

- [ ] 3.1 `docs/method.md` and `docs/testing.md` say how a scan reads source.
      Commit, push, archive.
