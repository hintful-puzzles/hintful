## MODIFIED Requirements

### Requirement: The product is named Hintful Puzzles, from one source

The product SHALL be presented to players as **Hintful Puzzles**, with the
short label **Hintful** where a full name does not fit (the label under an
installed icon). The repository is `hintful`, in the `hintful-puzzles`
organization: the product and the codebase are different things with different
names, and only the product name reaches a player.

The name and the support links SHALL have one source in the code
(`src/project-identity.ts`), read by every surface that shows them — the About
dialog, the PWA manifest, the front page's title and heading, and the home
screen's header — so that a rename is one edit and the copies cannot drift.

#### Scenario: Every surface shows the same name

- **WHEN** a player reads the front page heading, installs the app, or opens
  the About dialog
- **THEN** each shows "Hintful Puzzles" (the installed icon may show "Hintful")
- **AND** none of them carries its own copy of the string

#### Scenario: A deployment may brand itself without changing the project

- **WHEN** a deployment sets `VITE_APP_NAME`
- **THEN** the dialog title and the manifest show that name
- **AND** the license panel still labels the MIT notice with the project name
