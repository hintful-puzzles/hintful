# Cuts: project-identity

Requirements: 16 before, 15 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| The name and the support links are read from one source | duplicate | Merged into "The product is named Hintful Puzzles, from one source", whose title already promised it; the rule and a scenario are kept there |
| "The name SHALL be read from there by the About dialog's title and description, the PWA manifest, the front page's title and heading, and the home screen's header" (same requirement) | declared | The importers of `src/project-identity.ts` are the list; the kept rule binds every surface, not a named few |
| "in the `hintful-puzzles` organization" and "the product and the codebase are different things with different names" (The product is named Hintful Puzzles, from one source) | declared | `REPO_URL` and the header comment of `src/project-identity.ts` |
| Scenario "The source-code link" | duplicate | Folded into the scenario "No surface carries its own copy" |

Nothing else is cut. Every other requirement is a rule the owner decided about
what a player reads: the credits and their order, whose voice the text is in,
where a link leads, what the privacy notes promise, and that a crash report
waits for consent.
