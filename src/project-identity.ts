/**
 * How this project names itself and where it sends players for support.
 *
 * The **product** is Hintful Puzzles; the **repository** is `hintful`. They
 * are different names for different things, and a player is shown the
 * repository's only as the address of a link. The surfaces built from code or
 * a template — the About dialog, the PWA manifest (the label under an
 * installed icon), the page titles and the front page's heading — read the
 * product name from here. The static pages (the privacy notes, the
 * unsupported-browser and not-found pages, the help site's own pages) write it
 * out, so a rename is this file and those.
 *
 * The support links point at *this* project's repository. Links that exist to
 * credit a predecessor (puzzles-web, Simon Tatham's site, `puzzles-unreleased`)
 * are attribution, not support, and live beside the credits that use them.
 *
 * The app presents itself as **maintained by** its maintainer, never "by": the
 * puzzles are other people's designs. The header and the page titles name no
 * other project: the lineage is credited in the About dialog and the help
 * pages on the collection's origin, and the unsupported-browser page links to
 * the predecessors as other places to play. Every player-facing sentence
 * outside `help/games/` is this project's own writing; those pages keep
 * upstream's wording on purpose. The logo (`public/favicon.svg`) is this project's own
 * drawing, and no third-party logo ships.
 *
 * Imported by `vite.config.ts` as well as the app, so it must stay a leaf:
 * constants only, no browser or Node imports.
 */

/** The name a player sees: dialog titles, the front page, the installed icon. */
export const APP_NAME = "Hintful Puzzles";

/** The short label for a home-screen icon, where the full name would wrap. */
export const APP_SHORT_NAME = "Hintful";

/**
 * The line under the name, and the page title's other half. It says what the
 * collection is and what sets it apart, and it names no other project: the
 * lineage is credited in the About dialog, where a credit belongs.
 */
export const APP_TAGLINE = "logic puzzles with hints that explain why";

/** Source code. */
export const REPO_URL = "https://github.com/hintful-puzzles/hintful";

/**
 * Bug reports and questions. The repository has Issues enabled and Discussions
 * off, so there is deliberately no separate forum link: a link to a disabled
 * tab is worse than none.
 */
export const ISSUES_URL = `${REPO_URL}/issues`;
