# Verdicts: licensing

## reword `licensing`: A package's own NOTICE file takes precedence

The three notice-selection requirements are one precedence rule, which
`noticeFor` in `vite-plugins/dependency-notices.ts` implements as one function
in this order, and which no one of the three stated whole: the order between a
filled-in appendix and the license text was left to be inferred. How many
requirements hold it is internal form and not the owner's. This one now
carries the order, every rule of the other two, and their scenarios.

### Requirement: A package's own NOTICE file takes precedence

The notice reproduced for a bundled package SHALL be its own `NOTICE` file,
which Apache-2.0 §4(d) requires; else the Apache-2.0 appendix, where the
package filled its copyright line in, as the closest thing it has to a NOTICE;
else its license text. An appendix left as the template SHALL be removed and
SHALL NOT be reproduced, extracted or within the license text. The entry SHALL
still reproduce the grant: the appendix is addressed to authors and is no part
of it.

#### Scenario: A NOTICE file beside a filled-in appendix

- **WHEN** a bundled Apache-2.0 package ships a `NOTICE` file and also fills in
  its appendix
- **THEN** the `NOTICE` file is what the entry reproduces

#### Scenario: A package fills the appendix in

- **WHEN** a bundled package's appendix names a real copyright holder
- **THEN** that line is used as the package's notice

#### Scenario: A package ships the Apache appendix unfilled

- **WHEN** a bundled package's license text contains the appendix with its
  copyright line left as the template
- **THEN** the appendix is not reproduced, in the extracted form or within the
  license text it would otherwise fall back to
- **AND** the entry still reproduces the license grant itself

## cut `licensing`: A filled-in Apache appendix is the package's notice

duplicate: "A package's own NOTICE file takes precedence", as reworded above,
states that a filled-in appendix is used as the notice and why, and keeps this
requirement's scenario.

## cut `licensing`: An unfilled Apache appendix is removed

duplicate: "A package's own NOTICE file takes precedence", as reworded above,
states that an unfilled appendix is removed in both forms and that the grant
is still reproduced, and keeps this requirement's scenario.

## keep `licensing`: One MIT body covers every layer

It is a separate legal decision from who is credited: that one grant applies
to every layer, and is not repeated per copyright holder. "Layered top-level
LICENSE.md" is already close to the length bound, and a session adding a layer
reads that one while a session asked for a per-layer license reads this.

## reword `licensing`: CREDITS.md file thanking lineage

This adds a clause, and says so: the requirement predates the
`puzzles-unreleased` ports. `CREDITS.md` has a section for Lennard Sprong with
a link to his repository, "Layered top-level LICENSE.md" requires his layer,
and `project-identity` "The app presents its own authorship and its lineage in
order" names him second in the lineage. The tree and the two sibling
requirements show what is meant, so the spec is brought level with them and
the owner is not asked.

### Requirement: CREDITS.md file thanking lineage

The repository SHALL contain a top-level `CREDITS.md` file that thanks upstream
Simon Tatham + contributors, Lennard Sprong (x-sheep) for the
`puzzles-unreleased` puzzles, and the medmunds/puzzles-web project, with a
link to each of the three source repositories.

#### Scenario: CREDITS.md links to every upstream source

- **WHEN** a reader opens `CREDITS.md`
- **THEN** the file thanks Simon Tatham + upstream puzzles contributors and
  links to the upstream repository
- **AND** it thanks Lennard Sprong and links to `puzzles-unreleased`
- **AND** it thanks Mike Edmunds and links to puzzles-web

## note the cut of "The notice check refuses an implausibly short listing" stands

`docs/method.md` § "Count what the check looked at" states the rule for every
check: count the inputs and assert the count. `assertNoPlaceholders` in
`vite-plugins/dependency-notices.ts` fails below five entries. A floor is how
a check is made trustworthy and not something licensing promises a reader.
For the reviewer's eye: `build-pipeline` kept the same kind of rule for the
precache check and the unused-export check, so the specs are not uniform on
this, and the choice here was to leave the cut and not to add a requirement.
