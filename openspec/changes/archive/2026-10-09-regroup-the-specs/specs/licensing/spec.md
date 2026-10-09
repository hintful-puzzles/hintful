## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: A filled-in Apache appendix is the package's notice

**Reason**: duplicate: "A package's own NOTICE file takes precedence", as
reworded above, states that a filled-in appendix is used as the notice and why,
and keeps this requirement's scenario.

### Requirement: An unfilled Apache appendix is removed

**Reason**: duplicate: "A package's own NOTICE file takes precedence", as
reworded above, states that an unfilled appendix is removed in both forms and
that the grant is still reproduced, and keeps this requirement's scenario.
