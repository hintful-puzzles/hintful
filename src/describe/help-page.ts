/**
 * A game's help page, rendered from its description's `help`: the markdown
 * the help build's transforms take, and what the tests that read a page read.
 * The order of the sections and every heading are written here, once, so a
 * description cannot lack one or misplace it.
 *
 * It imports nothing of the engine, so the help build's configuration can
 * import it: what it needs of the game arrives as `PageFacts`.
 */

import { type HelpJson, isLibrary } from "./description.ts";
import { DescriptionError, loadDescriptionFile } from "./load.ts";
import { descriptionPath } from "./paths.ts";

/** What a page needs of its game. */
export interface PageFacts {
  /** The catalog's name, the page's title. */
  name: string;
  /** Whether the game declares rulesets, which makes it several puzzles. */
  rulesets: boolean;
  /** The placeholder the build replaces with the parameter list. */
  parameters: string;
  /** The placeholder the build replaces with the touch sentence. */
  touch: string;
}

/**
 * The page `help` renders to. A heading or the parameter list is the
 * renderer's, so a prose field that writes one is refused; a `###`
 * subheading is the section's own.
 */
export function renderHelpPage(
  help: HelpJson,
  facts: PageFacts,
  where: string,
): string {
  const prose = (text: string, field: string): string => {
    const heading = /^#{1,2}\s/m.exec(text);
    if (heading)
      throw new DescriptionError(
        `${where}: help.${field} writes a heading ("${text.slice(heading.index).split("\n")[0]}"); give it a section of its own`,
      );
    for (const [placeholder, home] of [
      [facts.parameters, "in its parameters section"],
      [facts.touch, "at the start of its Controls"],
    ])
      if (text.includes(placeholder))
        throw new DescriptionError(
          `${where}: help.${field} writes ${placeholder}, which the page puts ${home}`,
        );
    return text.trimEnd();
  };
  // Nothing but the rules comes between the title and the first `##`: the
  // first-open card shows that span.
  const parts = [
    `# ${facts.name}`,
    prose(help.rules, "rules"),
    "## Controls",
    facts.touch,
    prose(help.controls, "controls"),
  ];
  for (const [i, s] of (help.sections ?? []).entries())
    parts.push(`## ${s.heading}`, prose(s.body, `sections[${i}]`));
  if (help.origins !== undefined)
    parts.push(
      facts.rulesets
        ? "## Where the puzzles come from"
        : "## Where the puzzle comes from",
      prose(help.origins, "origins"),
    );
  if (help.hints !== undefined) parts.push("## Hints", prose(help.hints, "hints"));
  parts.push(`## ${facts.name} parameters`);
  const { before, after } = help.parameters ?? {};
  if (before !== undefined) parts.push(prose(before, "parameters.before"));
  parts.push(facts.parameters);
  if (after !== undefined) parts.push(prose(after, "parameters.after"));
  return `${parts.join("\n\n")}\n`;
}

/** The help page of cataloged game `id`, whose description reads `text`. */
export function gameHelpPage(id: string, text: string, facts: PageFacts): string {
  const where = descriptionPath(id);
  const file = loadDescriptionFile(text, where);
  if (isLibrary(file) || file.help === undefined)
    throw new DescriptionError(`${where}: a cataloged game's description carries help`);
  if (file.game !== id) throw new DescriptionError(`${where}: game is "${file.game}"`);
  return renderHelpPage(file.help, facts, where);
}
