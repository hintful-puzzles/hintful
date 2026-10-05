/**
 * The help's Parameters section, generated from the game's `paramConfig`: a
 * page writes {@link PARAMETERS_PLACEHOLDER} under its `## <Name> parameters`
 * heading and the help build puts this list there
 * (`vite-plugins/parameters.ts`).
 *
 * What a field is called, what range it takes and what the difficulty names
 * mean are the items' own facts, so the page cannot disagree with the dialog
 * beside it. What a field *means* is its `doc`, which the game writes.
 */

import type { ParamBounds, ParamConfigItem } from "./game.ts";
import { choiceName } from "./param-label.ts";

export const PARAMETERS_PLACEHOLDER = "{{parameters}}";

const INTRO =
  "These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.";

/** One entry of the list: the fields it names, and what it says of them. */
interface Entry {
  names: string[];
  doc: string;
  bounds: (ParamBounds | null)[];
}

/** The range sentence for an entry, or `""` when nothing is bounded. */
function boundsSentence(entry: Entry): string {
  const first = entry.bounds[0] ?? null;
  const same = entry.bounds.every(
    (b) => b?.min === first?.min && b?.max === first?.max,
  );
  if (!same) {
    return entry.names
      .map((name, i) => {
        const words = rangeWords(entry.bounds[i] ?? null);
        return words ? `${name} ${words}.` : "";
      })
      .filter((s) => s)
      .join(" ");
  }
  const words = rangeWords(first);
  if (!words) return "";
  return `${entry.names.length > 1 ? "Each" : "It"} ${words}.`;
}

function rangeWords(bounds: ParamBounds | null): string {
  if (!bounds) return "";
  const { min, max } = bounds;
  if (min !== undefined && max !== undefined)
    return `must be between ${min} and ${max}`;
  if (min !== undefined) return `must be at least ${min}`;
  if (max !== undefined) return `must be at most ${max}`;
  return "";
}

/** The list's entries, a `{ with }` item joining the entry before it. */
function entries<P>(config: readonly ParamConfigItem<P>[]): Entry[] {
  const out: Entry[] = [];
  for (const item of config) {
    const bounds = item.type === "string" ? (item.bounds ?? null) : null;
    const last = out.at(-1);
    if (typeof item.doc === "object") {
      if (!last) throw new Error(`${item.kw} shares a doc with nothing before it`);
      last.names.push(item.name);
      last.bounds.push(bounds);
    } else {
      out.push({ names: [item.name], doc: item.doc, bounds: [bounds] });
    }
  }
  return out;
}

/** The Parameters section's body for a game with these fields. */
export function parametersMarkdown<P>(config: readonly ParamConfigItem<P>[]): string {
  const items = entries(config).map((e) => {
    const text = [e.doc, boundsSentence(e)].filter((s) => s).join(" ");
    return `\t<dt>${e.names.join(", ")}</dt>\n\t<dd>${text}</dd>`;
  });
  return `${INTRO}\n\n<dl>\n${items.join("\n")}\n</dl>`;
}

/** `{{choice:kw:index}}`, wherever a page names a choice of one of its fields. */
const CHOICE_PLACEHOLDER = /\{\{choice:([^}]*)\}\}/g;

/**
 * `source` with each `{{choice:kw:index}}` replaced by that choice's name, so
 * a page's prose says a mode in the dialog's word. A placeholder that names no
 * choice of the game throws, which fails the help build.
 */
export function expandChoices<P>(
  config: readonly ParamConfigItem<P>[],
  source: string,
): string {
  return source.replace(CHOICE_PLACEHOLDER, (whole, spec: string) => {
    const [kw, index, ...rest] = spec.split(":");
    if (kw === undefined || index === undefined || rest.length > 0)
      throw new Error(`${whole} is not {{choice:<field>:<index>}}`);
    if (!/^\d+$/.test(index))
      throw new Error(`${whole} names its choice by index, counting from 0`);
    return choiceName(config, kw, Number(index));
  });
}
