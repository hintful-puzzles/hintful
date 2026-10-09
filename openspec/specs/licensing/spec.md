# licensing Specification

## Purpose
How this project meets the MIT obligations of the code it builds on and credits
the people behind it: the layered `LICENSE.md`, `CREDITS.md`, the byte-identical
upstream notices in `licenses/`, and an About dialog that shows those notices
and names every bundled third-party package with its license.

## Requirements

### Requirement: Layered top-level LICENSE.md

The top-level `LICENSE.md` file SHALL credit, in chronological order, the layers
of contribution to this codebase: Simon Tatham and the upstream Portable Puzzle
Collection contributors; Lennard Sprong (x-sheep), for the `puzzles-unreleased`
puzzles that games here are ported from; Mike Edmunds, for the puzzles-web PWA
shell this project forks from; and Yoni Lavi, for the TypeScript port work in
this project, with the open-ended year range `2025-`.

#### Scenario: Every lineage layer credited

- **WHEN** a reader opens the top-level `LICENSE.md`
- **THEN** the file contains a copyright line for Simon Tatham + upstream
  contributors
- **AND** a copyright line for Lennard Sprong covering the `puzzles-unreleased`
  games
- **AND** a copyright line for Mike Edmunds
- **AND** a copyright line for Yoni Lavi

### Requirement: LICENSE.md defers to the upstream notices

The Simon Tatham layer of `LICENSE.md` SHALL defer to
`licenses/sgt-puzzles-LICENSE` for the full list of upstream contributors and
SHALL NOT enumerate them inline. The Lennard Sprong layer SHALL defer to
`licenses/puzzles-unreleased-LICENSE`.

#### Scenario: Upstream contributor list not duplicated

- **WHEN** `LICENSE.md` references upstream contributors
- **THEN** it directs the reader to `licenses/sgt-puzzles-LICENSE` rather than
  enumerating contributors inline
- **AND** that file is left byte-identical to upstream

### Requirement: One MIT body covers every layer

The MIT permission grant, conditions, and warranty disclaimer SHALL appear once
in `LICENSE.md`, below the layered copyright lines, and SHALL apply to every
layer.

#### Scenario: A single license body

- **WHEN** a reader opens the top-level `LICENSE.md`
- **THEN** below the layered copyright lines there is a single MIT
  permission/conditions/warranty body that covers them all

### Requirement: Upstream notices are kept byte-identical in licenses/

Upstream notices SHALL live in `licenses/`, one file per upstream project, each
byte-identical to what that project ships, with a README recording what each one
covers. The directory and file names are this project's and follow its spelling
convention; the contents are the upstream projects' words and SHALL NOT be
edited, which a rename does not do.

#### Scenario: Renaming a notice file leaves its bytes alone

- **WHEN** a notice file or the directory holding it is renamed
- **THEN** the file's content hash before and after the rename is identical

### Requirement: The upstream notices sit outside the source they cover

The upstream notices SHALL NOT live inside a subdirectory of the source tree,
because what they cover is the whole of `src/engine/` and `src/games/` and the
served help sources, and not one directory of them.

#### Scenario: A notice beside the code it covers

- **WHEN** an upstream notice is placed under `src/games/`
- **THEN** it is in the wrong home, and belongs in the top-level `licenses/`

### Requirement: The upstream notices are reachable from the app

The upstream notices SHALL remain reachable from the app: the About dialog
`?raw`-imports each one and shows it to players. They are
therefore live build inputs, and a change that moves or renames one SHALL
repoint that import in the same commit, since the production build breaks
without it.

#### Scenario: The notices are shown in the app

- **WHEN** a player opens the About dialog
- **THEN** the upstream notices are rendered from the files in `licenses/`

#### Scenario: A rename repoints the imports

- **WHEN** a notice file or the directory holding it is renamed
- **THEN** the About dialog's `?raw` imports are repointed in the same commit

### Requirement: CREDITS.md file thanking lineage

The repository SHALL contain a top-level `CREDITS.md` file that thanks upstream Simon Tatham + contributors and the medmunds/puzzles-web project, with links to both source repositories.

#### Scenario: CREDITS.md links to both upstream sources

- **WHEN** a reader opens `CREDITS.md`
- **THEN** the file thanks Simon Tatham + upstream puzzles contributors and links to the upstream repository
- **AND** it thanks Mike Edmunds and links to puzzles-web

### Requirement: The About box credits every bundled package, and never a template

The third-party section of the About dialog SHALL name, for each package the
app bundles, who publishes it and under what license, and SHALL reproduce that
package's own notice. No entry SHALL contain an unfilled license template, such
as the line `Copyright [yyyy] [name of copyright owner]`: it names nobody, and
reads as this project's own unfinished work.

#### Scenario: A bundled package's entry

- **WHEN** a player expands a bundled package whose metadata names an author
- **THEN** the entry shows the package's name, that author as who publishes
  it, and the package's own notice or license text
- **AND** no line of it is a license template left blank

### Requirement: A filled-in Apache appendix is the package's notice

Apache-2.0's text ends with an appendix headed "How to apply the Apache License
to your work", a template for authors. Where a bundled package fills its
copyright line in, the filled-in appendix is the closest thing that package has
to a NOTICE and SHALL be used as one.

#### Scenario: A package fills the appendix in

- **WHEN** a bundled package's appendix names a real copyright holder
- **THEN** that line is used as the package's notice

### Requirement: An unfilled Apache appendix is removed

Where a bundled package ships the Apache-2.0 appendix with its copyright line
left as the template, the appendix SHALL be removed and SHALL NOT be reproduced,
in the extracted form or within the license text the entry falls back to. The
entry SHALL still reproduce the license grant: the appendix is addressed to
authors and is not part of the grant.

#### Scenario: A package ships the Apache appendix unfilled

- **WHEN** a bundled package's license text contains the appendix with its
  copyright line left as the template
- **THEN** the appendix is not reproduced, in the extracted form or within the
  license text it would otherwise fall back to
- **AND** the entry still reproduces the license grant itself

### Requirement: Attribution is derived from each package's own metadata

A bundled package's attribution SHALL be derived from that package's own
metadata: its `author`, else its `contributors`, else the repository it is
published from. It SHALL NOT be written down in this repository, which would be
a list to maintain per dependency and a claim about someone else's code.

#### Scenario: A package with contributors and no author

- **WHEN** a bundled package declares no `author` and declares `contributors`
- **THEN** its attribution is the contributors' names
- **AND** the repository it is published from is not consulted

### Requirement: Attribution says who publishes a package, never who holds its copyright

A bundled package's attribution SHALL be presented as who publishes the
package, and SHALL NOT be presented as a copyright notice this project asserts
on the publisher's behalf. Where a package states a copyright holder, that
statement is in the notice text below the attribution and speaks for itself.

#### Scenario: A package whose author differs from its copyright holder

- **WHEN** a bundled package's metadata names an author and its license text
  carries a copyright line naming someone else
- **THEN** the About dialog shows the author beside the package's name, with no
  "Copyright" wording added
- **AND** the copyright line appears only in the notice text beneath

### Requirement: A package's own NOTICE file takes precedence

A bundled package's own `NOTICE` file SHALL take precedence over everything
else as the notice reproduced for it, which Apache-2.0 §4(d) requires.

#### Scenario: A NOTICE file beside a filled-in appendix

- **WHEN** a bundled Apache-2.0 package ships a `NOTICE` file and also fills in
  its appendix
- **THEN** the `NOTICE` file is what the entry reproduces

### Requirement: A package that credits nobody fails the build

The build SHALL fail, and SHALL NOT ship the package uncredited, where a
bundled package declares no author, no contributors and no repository and its
notice contains no copyright line.

#### Scenario: A package names nobody

- **WHEN** a package declares no author, no contributors and no repository
- **AND** its notice contains no copyright line
- **THEN** the build fails, rather than shipping an uncredited package

### Requirement: The notice check refuses an implausibly short listing

The build SHALL fail on the count where the bundled-package listing is
implausibly short, so the checks on the entries cannot pass over an empty or
nearly empty list.

#### Scenario: The check cannot pass over an empty list

- **WHEN** the bundled-package listing is implausibly short
- **THEN** the build fails on the count rather than reporting that every entry
  is fine
