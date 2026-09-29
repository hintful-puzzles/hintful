/**
 * The sections of the game contract whose absence makes a game a **draft**.
 *
 * Each section of a game is in one of three states: implemented, not
 * applicable (the game says why, in {@link Game.notApplicable}), or absent. A
 * game with any section absent is a draft: playable, and labeled in the catalog
 * as not yet complete. Draft is computed here and nowhere else; no game states
 * it about itself.
 *
 * A member belongs here only when its absences can be told apart: when each
 * game lacking it either has a reason in the puzzle's rules or is unfinished
 * work. Members whose absence says nothing either way (`difficulty`,
 * `textFormat`, and the affordances such as `hover` and `reference`) stay
 * optional and outside; `derive-the-draft-label`'s design records why.
 */

import type { Game } from "./game.ts";

/** Each section, in the order the help lists them, with the name a player
 * knows the feature by. A hint is never not applicable (owner, 2026-09-28). */
const SECTIONS = [
  { member: "hint", feature: "Hints", mayBeNotApplicable: false },
  {
    member: "findMistakes",
    feature: "Checking for mistakes",
    mayBeNotApplicable: true,
  },
  { member: "solve", feature: "Show solution", mayBeNotApplicable: true },
  {
    member: "transposeParams",
    feature: "Turning the board to fit the screen",
    mayBeNotApplicable: true,
  },
] as const;

type SectionEntry = (typeof SECTIONS)[number];

export type Section = SectionEntry["member"];

/** A section a game may declare it has no such thing for. */
export type NotApplicableSection = Extract<
  SectionEntry,
  { mayBeNotApplicable: true }
>["member"];

/** Why this game has no such thing, per section: a fact about the puzzle a
 * player could check against its rules, written as a sentence for its help
 * page. */
export type NotApplicableReasons = { readonly [S in NotApplicableSection]?: string };

/** The `transposeParams` reason of a game whose grid has one side length. */
export const SQUARE_GRID =
  "The grid is square, so it is the same shape either way round.";

export type SectionState =
  | { readonly kind: "implemented" }
  | { readonly kind: "notApplicable"; readonly reason: string }
  | { readonly kind: "absent" };

/** What the sections are read from: a member's presence and the reasons, so
 * any game is one whatever its type parameters. */
type AnyGame = Pick<Game<unknown, unknown, unknown>, "id" | "notApplicable"> & {
  readonly [S in Section]?: unknown;
};

/** The state of one section of `game`. Throws when the game both implements a
 * section and declares it not applicable, since one of the two is false. */
export function sectionState(game: AnyGame, section: Section): SectionState {
  const implemented = game[section] !== undefined;
  const reason = section === "hint" ? null : (game.notApplicable?.[section] ?? null);
  if (implemented && reason !== null) {
    throw new Error(
      `${game.id}: implements ${section} and declares it not applicable ("${reason}")`,
    );
  }
  if (implemented) return { kind: "implemented" };
  if (reason !== null) return { kind: "notApplicable", reason };
  return { kind: "absent" };
}

/** The player-facing name of each section `game` lacks, in order; empty when
 * the game is complete. A game is a draft exactly when this is non-empty. */
export function draftSections(game: AnyGame): string[] {
  return SECTIONS.filter((s) => sectionState(game, s.member).kind === "absent").map(
    (s) => s.feature,
  );
}

/** The help page's section listing what `game` has no such thing as, and why;
 * empty when there is nothing to list. */
export function notApplicableMarkdown(game: AnyGame): string {
  const items = notApplicableFeatures(game);
  if (items.length === 0) return "";
  const lines = items.map(({ feature, reason }) => `- **${feature}.** ${reason}`);
  return `## Not in this game\n\n${lines.join("\n")}\n`;
}

/** The features `game` has no such thing as, each with its reason. */
export function notApplicableFeatures(
  game: AnyGame,
): { feature: string; reason: string }[] {
  const out: { feature: string; reason: string }[] = [];
  for (const s of SECTIONS) {
    const state = sectionState(game, s.member);
    if (state.kind === "notApplicable")
      out.push({ feature: s.feature, reason: state.reason });
  }
  return out;
}
