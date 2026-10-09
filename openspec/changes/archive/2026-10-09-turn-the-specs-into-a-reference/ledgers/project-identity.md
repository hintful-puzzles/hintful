# Ledger: project-identity

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## The product is named Hintful Puzzles, from one source

| Rule | Where it went |
| --- | --- |
| The product is presented as Hintful Puzzles, with the short label Hintful where a full name does not fit | spec: The product is named Hintful Puzzles, from one source |
| The repository is `hintful` in the `hintful-puzzles` organization, a different thing with a different name, and it is not presented as the product's name | spec: The product is named Hintful Puzzles, from one source |
| Only the product name reaches a player | untrue: the About dialog's source link shows the repository's address, `github.com/hintful-puzzles/hintful`, as its text (`aboutBlurb` in `src/dialogs/about-dialog.ts`), so the requirement says the repository's name is not presented as the product's |
| The name and the support links have one source, `src/project-identity.ts`, read by the About dialog, the manifest, the front page's title and heading and the home screen's header | spec: The name and the support links are read from one source |
| Every surface that shows a support link reads it from the source | spec: The name and the support links are read from one source |
| So that a rename is one edit and the copies cannot drift | reason |
| Every surface that shows the name reads it from the source, and none carries its own copy | untrue: the listed surfaces read `APP_NAME`, but `src/assets/privacy.html` (the About dialog's Privacy panel), `unsupported.html`, `public/404.html` and the help site's own pages under `help/` write "Hintful Puzzles" out, so the requirement names the surfaces that read the source |
| Scenario: every surface shows the same name, with Hintful the short label for the installed icon | spec: The product is named Hintful Puzzles, from one source |
| Scenario: none of the listed surfaces carries its own copy of the name | spec: The name and the support links are read from one source |
| Scenario: a deployment that sets `VITE_APP_NAME` renames the dialog title and the manifest, and the license panel keeps the project name | spec: The product is named Hintful Puzzles, from one source |

## Player-facing text is this project's own, and the lineage is credited in one place

| Rule | Where it went |
| --- | --- |
| Every player-facing sentence outside the per-game help pages is this project's own writing, on the surfaces listed | spec: Player-facing text is this project's own, and the lineage is credited in one place |
| Text inherited from `puzzles-web` does not survive verbatim on those surfaces | spec: Player-facing text is this project's own, and the lineage is credited in one place |
| The pages under `help/games/` are excluded on purpose and keep upstream's wording | spec: Player-facing text is this project's own, and the lineage is credited in one place |
| The `help` convention already governs the per-game pages' wording | reason |
| The header and the page titles describe the product and name no other project | spec: The header and the page titles speak for the product |
| The tagline comes from `src/project-identity.ts` | spec: The header and the page titles speak for the product |
| The lineage is credited in the About dialog and in the help pages that explain the collection's origin | spec: The header and the page titles speak for the product |
| A header that names a predecessor presents the app as that predecessor's | spec: The header and the page titles speak for the product |
| The logo is this project's own drawing in `public/favicon.svg`, the single source of every generated PWA icon, and no third-party logo ships | spec: The logo is this project's own drawing |
| Icons of a browser's own controls in the install instructions come from an openly licensed set and are not logos | spec: The logo is this project's own drawing |
| Scenario: the front page header shows the product name and the tagline and names no other project or person | spec: The header and the page titles speak for the product |
| Scenario: any page title shows the product name and the tagline | untrue: only the front page's title carries the tagline (`templates/index.html.hbs`), while a puzzle page's title is the puzzle, its description and the product name (`templates/puzzle.html.hbs`), and the unsupported and not-found pages' titles carry the name alone |
| Scenario: inherited copy is gone | spec: Player-facing text is this project's own, and the lineage is credited in one place |

## The privacy notes describe what the app does with a player's data

| Rule | Where it went |
| --- | --- |
| The Privacy panel states, truthfully for the build in use, that no personal information is collected or stored, that games, saves, checkpoints and preferences stay in the browser's storage and are never sent, and that any measurement is anonymous and aggregate with no cookies or client-side identifier | spec: The privacy notes describe what the app does with a player's data |
| It states that crash reporting, where switched on, asks before sending, and lists what a report carries, with personal information disabled | spec: The privacy notes say what a crash report carries |
| The notes are not a development placeholder and promise no more than the code keeps | spec: The privacy notes promise no more than the code keeps |
| The crash-report description is bound to `sendDefaultPii: false` and the consent gate in `src/utils/sentry.ts` | spec: The privacy notes promise no more than the code keeps |
| The measurement description is bound to the analytics block a deployment injects, and a deployment adding identifying measurement changes the notes in the same change | spec: The privacy notes promise no more than the code keeps |
| Scenario: the panel's statements on personal information, local storage and measurement | spec: The privacy notes describe what the app does with a player's data |
| Scenario: the panel's statements on crash reports | spec: The privacy notes say what a crash report carries |

## The app presents its own authorship and its lineage in order

| Rule | Where it went |
| --- | --- |
| The project is presented as its own work, maintained by Yoni Lavi and never "by", since the puzzles are other people's designs | spec: The app presents its own authorship and its lineage in order |
| The lineage is named in chronological order: Simon Tatham, Lennard Sprong, Mike Edmunds, then this project | spec: The app presents its own authorship and its lineage in order |
| Mike Edmunds is credited explicitly as the author of `puzzles-web`, the direct parent | spec: Mike Edmunds is credited as the author of puzzles-web |
| Claiming authorship is no reason to state a predecessor's contribution less clearly, and no name is removed from the middle of the chain | spec: Mike Edmunds is credited as the author of puzzles-web |
| The description says this is a native TypeScript implementation on this project's own engine, not a web adaptation of a C engine compiled to WebAssembly | spec: The description says this version is a native TypeScript implementation |
| The WebAssembly description stopped being true at `retire-c-engine` | history |
| No player-facing text speaks in a first person whose referent is not the current author, and inherited prose is re-attributed by name or rewritten without the pronoun | spec: No player-facing first person lacks an owner |
| An unowned "I" reassigns a personal statement to the next holder of the repository | spec: No player-facing first person lacks an owner |
| Scenario: the About dialog names the maintainer and credits the three predecessors | spec: The app presents its own authorship and its lineage in order |
| Scenario: Mike Edmunds is identified as the author of `puzzles-web` | spec: Mike Edmunds is credited as the author of puzzles-web |
| Scenario: no first-person statement is attributed to nobody | spec: No player-facing first person lacks an owner |
| Scenario: the description matches what the app is | spec: The description says this version is a native TypeScript implementation |

## Player-facing links resolve to this project

| Rule | Where it went |
| --- | --- |
| Every player-facing link for source code, discussion, bug reports and credits resolves to a destination this project controls, or is absent | spec: Player-facing links resolve to this project |
| No link sends a player to a predecessor's repository for support with code the predecessor did not write | spec: Player-facing links resolve to this project |
| This covers the About dialog's source, forum and bug-report links and the front-page footer's credits link | spec: Player-facing links resolve to this project |
| This covers the fallback link shown to unsupported browsers | untrue: `unsupported.html` has a link back to this app and two links to Simon Tatham's site and Mike Edmunds' web version, offered as other places to play the same puzzles, so the page's outward links are stated beside the attribution links |
| Links that credit a predecessor or upstream are not support destinations and are kept | spec: Attribution links point at the projects they credit |
| What decides is what the link is for: attribution points outward, support points home | spec: Attribution links point at the projects they credit |
| Scenario: a bug report is not misrouted | spec: Player-facing links resolve to this project |
| Scenario: attribution links are preserved | spec: Attribution links point at the projects they credit |

## A crash report leaves the device only with the player's consent

| Rule | Where it went |
| --- | --- |
| In a build with reporting on, nothing is sent until the player chooses to send the report | spec: A crash report leaves the device only with the player's consent |
| Declining, closing the dialog or reloading discards what was held, and it is never sent afterwards | spec: A crash report leaves the device only with the player's consent |
| Consent is enforced at the SDK's transport and not per integration, so no integration can send around it | spec: Consent is enforced at the reporting SDK's transport |
| Held reports are not written to storage before consent | spec: Consent is enforced at the reporting SDK's transport |
| Errors that never open the dialog are never sent | spec: Consent is enforced at the reporting SDK's transport |
| Scenario: a player declines | spec: A crash report leaves the device only with the player's consent |
| Scenario: a player sends, and the dialog shows the event ID | spec: A crash report leaves the device only with the player's consent |
