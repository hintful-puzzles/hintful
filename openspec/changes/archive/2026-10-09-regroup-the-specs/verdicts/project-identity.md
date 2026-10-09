# Verdicts: project-identity

## keep `error-reporting`: Consent is enforced at the reporting SDK's transport

The placement is the decision and not only the implementation.
`src/utils/sentry.ts` wraps the transport in `reportConsent.gate`, and the
transport it wraps is the SDK's offline one, which writes to storage when a
send fails. Holding reports in an event hook, or per integration, is the
simpler design a later session would reach for, and it lets an integration send
around the consent. The requirement also carries the promise that a held
report is never written to storage, and the bound on what is held.

## reword `project-identity`: Player-facing text is this project's own, and the lineage is credited in one place

Nothing runs the comparison the scenario describes: `src/project-identity.test.ts`
has no case that reads `puzzles-web`'s pages, and a test cannot read the
sibling clone. The rule itself stands for every page written from now on, so
the scenario is restated as that. The body is unchanged.

### Requirement: Player-facing text is this project's own, and the lineage is credited in one place

Every sentence a player reads outside the per-game help pages SHALL be this
project's own writing, in its own voice: the front page, the page titles and
descriptions, the help site's own pages, the unsupported-browser and not-found
pages, and the privacy notes. Text inherited from `puzzles-web` SHALL NOT
survive verbatim on those surfaces. The per-game pages under `help/games/` are
excluded on purpose and keep upstream's wording.

#### Scenario: A page outside the per-game help is written or revised

- **WHEN** the front page, one of the help site's own pages, the
  unsupported-browser page, the not-found page or the privacy notes is written
  or revised
- **THEN** its text is written for this project, and no paragraph of
  `puzzles-web`'s is carried into it verbatim

## edit `project-identity`: The privacy notes promise no more than the code keeps

obsolete, for the one clause. Searched the tree outside `openspec/` for the
placeholder's words ("No privacy policy", "placeholder" beside "privacy"):
only the test that refuses them has them. `src/assets/privacy.html` is the
notes' one source, imported by the About dialog, and no build path substitutes
another. "The privacy notes describe what the app does with a player's data"
requires what the notes say, which a placeholder could not meet. The rest of
the requirement is untouched.

from: The privacy notes SHALL NOT be a development placeholder, and SHALL NOT promise
to: The privacy notes SHALL NOT promise

## keep `error-reporting`: What a crash report carries matches what the privacy notes promise

It does not restate "The privacy notes promise no more than the code keeps".
That one binds the notes to named code (`sendDefaultPii: false`, the consent
gate, a deployment's analytics block). This one is an act at the moment
reporting is enabled: one real payload read against the notes. Neither says
what the other says, and they are now in different capabilities, each where
its reader looks.

## keep `project-identity`: The description says this version is a native TypeScript implementation

The negative is still worth stating. The About dialog's description was
inherited from `puzzles-web`, which is still credited beside it as the direct
parent, and `CREDITS.md` still describes that project's WASM worker. The
sentence is player-read wording the owner decided, and
`src/project-identity.test.ts` holds both halves.

## note the placeholder test can stay as it is

`src/project-identity.test.ts`, "is not the development placeholder", still
passes and costs nothing. With the clause gone from the requirement it holds a
rule the spec states through "The privacy notes describe what the app does
with a player's data".
