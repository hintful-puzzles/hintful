/**
 * How a file's text cites a section of a guide: `<guide>.md § "Heading"`.
 *
 * One reading for the two things that read it: `guide-sections.mjs`, which
 * fails a citation that names no heading, and `scripts/game.ts`, which sends
 * the author of a refused game to the sections the refusing guard cites. A
 * citation the second prints is therefore one the first has resolved.
 */

/**
 * A citation runs across a comment's line break, so a break is folded with
 * the comment leader or quote marker that follows it.
 */
export function fold(text: string): string {
  return text.replace(/[ \t]*\n[ \t]*(?:\*(?!\/)|\/\/[/!]?|#|>)?[ \t]*/g, " ");
}

const NAMED = /([a-z][a-z0-9-]*\.md)(?:`|\]|\)|\([^)\s]*\))*,?\s+§\s*"([^"]+)"/g;

/** One citation that names its guide. */
interface Citation {
  /** The guide's file name, without its directory. */
  guide: string;
  heading: string;
  /** Where the citation's `§` stands in the folded text. */
  mark: number;
}

/** Every citation in `folded` that names its guide, in the order written. */
export function namedCitations(folded: string): Citation[] {
  return [...folded.matchAll(NAMED)].map((match) => ({
    guide: match[1] ?? "",
    heading: match[2] ?? "",
    mark: match.index + match[0].lastIndexOf("§"),
  }));
}
