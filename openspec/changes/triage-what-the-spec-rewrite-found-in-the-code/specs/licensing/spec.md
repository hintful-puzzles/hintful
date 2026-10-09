## MODIFIED Requirements

### Requirement: The About box credits every bundled package, and never a template

The third-party section of the About dialog SHALL name, for each package the
app bundles, who publishes it and under what license, as far as the package's
own metadata says either, beside the package's name, and SHALL reproduce that
package's own notice beneath. No entry SHALL
contain an unfilled license template, such as the line
`Copyright [yyyy] [name of copyright owner]`: it names nobody, and reads as
this project's own unfinished work.

#### Scenario: A bundled package's entry

- **WHEN** a player expands a bundled package whose metadata names an author
- **THEN** the entry shows the package's name, that author as who publishes
  it, and the package's own notice or license text
- **AND** no line of it is a license template left blank

#### Scenario: A notice that does not say which license it is

- **WHEN** a bundled package's notice is a `NOTICE` file, a filled-in appendix
  line or a license text with no title
- **THEN** the entry still names the license, beside the package's name and its
  publisher

#### Scenario: A package whose metadata names no license

- **WHEN** a bundled package's metadata declares no license
- **THEN** the entry names its publisher alone beside its name, over the
  notice or license text the package ships, and the build does not refuse it

#### Scenario: Packages published as one family

- **WHEN** the app bundles a `workbox-*` package, which its publisher ships
  with its siblings from one repository under one notice
- **THEN** the entry is named `workbox`, for the family, and not for the one
  package

#### Scenario: A package whose metadata names nobody

- **WHEN** a bundled package declares no author, no contributors and no
  repository, and its notice carries a copyright line
- **THEN** the entry names the license beside the package's name and no
  publisher, and the copyright line in the notice is the credit
