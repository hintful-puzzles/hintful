# Ledger: licensing

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Layered top-level LICENSE.md

| Rule | Where it went |
| --- | --- |
| `LICENSE.md` credits the four layers in chronological order, each named with what it contributed | spec: Layered top-level LICENSE.md |
| The Lennard Sprong layer covers thirteen games | figure; held: LICENSE.md "that thirteen of the games here are ported from" |
| The Yoni Lavi layer has the open-ended year range `2025-` | spec: Layered top-level LICENSE.md |
| The Simon Tatham layer defers to `licenses/sgt-puzzles-LICENSE` for the full contributor list, and the Lennard Sprong layer to `licenses/puzzles-unreleased-LICENSE` | spec: LICENSE.md defers to the upstream notices |
| The MIT grant, conditions and disclaimer appear once below the copyright lines and apply to every layer | spec: One MIT body covers every layer |
| Upstream notices live in `licenses/`, one file per upstream project, byte-identical, with a README recording what each covers | spec: Upstream notices are kept byte-identical in licenses/ |
| The names are this project's and follow its spelling, the contents are not edited, and a rename is not an edit | spec: Upstream notices are kept byte-identical in licenses/ |
| The notices do not live inside a subdirectory of the source tree, since they cover the whole of `src/engine/`, `src/games/` and the served help sources | spec: The upstream notices sit outside the source they cover |
| The tree that once held them, `puzzles/`, no longer exists after the migration | history |
| The notices stay reachable from the app, the About dialog `?raw`-imports each one, and moving one without repointing the import breaks the production build | spec: The upstream notices are reachable from the app |
| Scenario: every lineage layer credited, the four copyright lines | spec: Layered top-level LICENSE.md |
| Scenario: every lineage layer credited, the single MIT body | spec: One MIT body covers every layer |
| Scenario: upstream contributor list not duplicated, and the notice file left byte-identical | spec: LICENSE.md defers to the upstream notices |
| Scenario: the notices are shown in the app | spec: The upstream notices are reachable from the app |
| Scenario: renaming a notice file leaves its content hash identical | spec: Upstream notices are kept byte-identical in licenses/ |
| Scenario: the `?raw` imports are repointed in the same commit as a rename | spec: The upstream notices are reachable from the app |

## CREDITS.md file thanking lineage

| Rule | Where it went |
| --- | --- |
| A top-level `CREDITS.md` thanks Simon Tatham and the upstream contributors and the puzzles-web project, with links to both repositories, and its scenario | spec: CREDITS.md file thanking lineage |

## The About box credits every bundled package, and never a template

| Rule | Where it went |
| --- | --- |
| The third-party section names who publishes each bundled package and under what license, and reproduces its own notice | spec: The About box credits every bundled package, and never a template |
| No entry contains an unfilled license template | spec: The About box credits every bundled package, and never a template |
| The Apache-2.0 appendix is a template for authors, and a filled-in one is used as the package's notice | spec: A filled-in Apache appendix is the package's notice |
| An unfilled appendix is removed, not reproduced, and is not part of the license grant | spec: An unfilled Apache appendix is removed |
| The alternative is telling players `Copyright [yyyy] [name of copyright owner]`, which reads as this project's unfinished work | spec: The About box credits every bundled package, and never a template |
| Attribution is derived from `author`, else `contributors`, else the repository, and is not written down in this repository | spec: Attribution is derived from each package's own metadata |
| Attribution is presented as who publishes the package, never as a copyright notice asserted on their behalf, and a stated copyright holder is in the notice text below | spec: Attribution says who publishes a package, never who holds its copyright |
| A package's own `NOTICE` file takes precedence over everything else, as Apache-2.0 §4(d) requires | spec: A package's own NOTICE file takes precedence |
| Scenario: a package ships the Apache appendix unfilled | spec: An unfilled Apache appendix is removed |
| Scenario: a package fills the appendix in | spec: A filled-in Apache appendix is the package's notice |
| Scenario: a package that names nobody fails the build | spec: A package that credits nobody fails the build |
| Scenario: the check fails on the count over an implausibly short listing | spec: The notice check refuses an implausibly short listing |
