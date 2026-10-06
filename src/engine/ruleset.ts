/**
 * A game's **rulesets**: the different puzzles it plays on one board, as
 * Seismic's Tectonic is. A game that has them declares them once, with
 * {@link rulesetItem} in its `paramConfig`, and the Custom dialog's field, the
 * word in front of a params label, the Type menu's sections and the help
 * page's list of rules are all built from that.
 *
 * A field that only changes the board's shape or look is not a ruleset.
 */

import type { ParamConfigItem } from "./game.ts";
import type { ConfigNarrowing } from "./types.ts";

/** One puzzle a game plays. */
export interface Ruleset {
  /** What a player picks it by, everywhere it is named. */
  readonly name: string;
  /** The rule that sets it apart, as its line of the help page's list says it
   * (markdown, after "Name: "). */
  readonly rule: string;
  /**
   * The settings this puzzle does not take whole, by the field's `kw`: the
   * choices it offers of a choices field, by index, or the one value a
   * checkbox has in it. A field left out is taken as it stands. From this the
   * engine builds what the Custom dialog offers while the ruleset is chosen
   * ({@link rulesetNarrowing}), the refusal of a params set that asks for
   * anything else ({@link onlyError}), and the sentence in the field's help
   * entry ({@link onlySentences}).
   */
  readonly only?: Readonly<Record<string, RulesetOnly>>;
}

/** What a ruleset leaves of one field: choice indices, or a checkbox's value. */
export type RulesetOnly = readonly number[] | boolean;

type ChoicesItem<P> = Extract<ParamConfigItem<P>, { type: "choices" }>;

/** The params key holding a ruleset's index directly. */
type IndexKey<P> = {
  [K in keyof P]-?: P[K] extends number ? K : never;
}[keyof P];

/** The keyword of every ruleset field, which is how the engine finds one. */
export const RULESET_KW = "ruleset";

export const RULESETS_PLACEHOLDER = "{{rulesets}}";

/**
 * The Custom dialog's ruleset field: `kw: "ruleset"`, labeled "Game mode" and
 * offering each ruleset by name. `field` is the params key holding the index,
 * or accessors for a game that stores a word there.
 */
export function rulesetItem<P>(
  rulesets: readonly Ruleset[],
  field: IndexKey<P> | { get(p: P): number; set(p: P, index: number): void },
): ParamConfigItem<P> {
  const access =
    typeof field === "object"
      ? field
      : {
          get: (p: P) => p[field] as number,
          set: (p: P, index: number) => {
            (p as Record<IndexKey<P>, number>)[field] = index;
          },
        };
  const names = rulesets.map((r) => r.name);
  return {
    kw: RULESET_KW,
    name: "Game mode",
    type: "choices",
    choices: names,
    rulesets,
    doc: `Which puzzle to play: ${names.slice(0, -1).join(", ")} or ${names.at(-1)}. The rules of each are at the top of this page.`,
    get: access.get,
    set: access.set,
  };
}

/** The game's {@link rulesetItem}, or `null` for a game with one puzzle. */
export function rulesetField<P>(game: {
  paramConfig?: readonly ParamConfigItem<P>[];
}): (ChoicesItem<P> & { rulesets: readonly Ruleset[] }) | null {
  const item = game.paramConfig?.find((i) => i.kw === RULESET_KW);
  if (item?.type !== "choices" || !item.rulesets) return null;
  return { ...item, rulesets: item.rulesets };
}

/** One field a ruleset narrows, found in the game's `paramConfig`. */
type Narrowed<P> =
  | { item: ChoicesItem<P>; only: readonly number[] }
  | { item: Extract<ParamConfigItem<P>, { type: "boolean" }>; only: boolean };

/**
 * What `ruleset` leaves of the fields of `config`, each `only` entry matched
 * to its item. A declaration that names no field, names the wrong kind of
 * one, or offers nothing of it throws.
 */
function narrowedBy<P>(
  config: readonly ParamConfigItem<P>[],
  ruleset: Ruleset,
): Narrowed<P>[] {
  return Object.entries(ruleset.only ?? {}).map(([kw, only]): Narrowed<P> => {
    const item = config.find((i) => i.kw === kw);
    const bad = (why: string) =>
      new Error(`ruleset "${ruleset.name}" narrows "${kw}", ${why}`);
    if (!item || item.kw === RULESET_KW) throw bad("which is no other field");
    if (typeof only === "boolean") {
      if (item.type !== "boolean") throw bad("which is not a checkbox");
      return { item, only };
    }
    if (item.type !== "choices") throw bad("which has no choices");
    if (only.length === 0 || only.some((i) => item.choices[i] === undefined))
      throw bad(`to choices it does not have (${only.join(", ")})`);
    return { item, only };
  });
}

/** "Normal, Tricky and Hard". */
function listed(names: readonly string[], last: string): string {
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} ${last} ${names.at(-1)}`;
}

/** The names of the choices a ruleset leaves, or a checkbox's "on" or "off". */
function offeredWords<P>(n: Narrowed<P>, last: string): string {
  if (typeof n.only === "boolean") return n.only ? "on" : "off";
  const { choices } = n.item;
  return listed(
    n.only.map((i) => choices[i] ?? ""),
    last,
  );
}

/**
 * The refusal for a field holding what the chosen ruleset does not offer, or
 * `null`. `read` gives a field's value, so one check reads a params set and a
 * dialog's values alike.
 */
export function onlyError<P>(
  config: readonly ParamConfigItem<P>[],
  read: (item: ParamConfigItem<P>) => number | boolean | string,
): string | null {
  const field = rulesetField({ paramConfig: config });
  if (!field) return null;
  const ruleset = field.rulesets[Number(read(field))];
  if (!ruleset) return null;
  for (const n of narrowedBy(config, ruleset)) {
    const value = read(n.item);
    const offered =
      typeof n.only === "boolean" ? value === n.only : n.only.includes(Number(value));
    if (!offered)
      return `${n.item.name} must be ${offeredWords(n, "or")} for ${ruleset.name}.`;
  }
  return null;
}

/** What the help's entry for the field `kw` says of the rulesets that narrow
 * it, a sentence each: "Edges offers only Normal, Tricky and Hard." */
export function onlySentences<P>(
  config: readonly ParamConfigItem<P>[],
  kw: string,
): string[] {
  const rulesets = rulesetField({ paramConfig: config })?.rulesets ?? [];
  return rulesets.flatMap((ruleset) =>
    narrowedBy(config, ruleset)
      .filter((n) => n.item.kw === kw)
      .map((n) =>
        typeof n.only === "boolean"
          ? `${ruleset.name} always has it ${offeredWords(n, "and")}.`
          : `${ruleset.name} offers only ${offeredWords(n, "and")}.`,
      ),
  );
}

/**
 * The dialog's side of every ruleset's `only`: what each choice of the ruleset
 * field leaves of the other fields, or `null` when no ruleset narrows any.
 */
export function rulesetNarrowing<P>(
  config: readonly ParamConfigItem<P>[],
): ConfigNarrowing | null {
  const field = rulesetField({ paramConfig: config });
  if (!field?.rulesets.some((r) => r.only)) return null;
  return {
    by: RULESET_KW,
    only: field.rulesets.map((ruleset) =>
      Object.fromEntries(
        narrowedBy(config, ruleset).map((n) => [
          n.item.kw,
          typeof n.only === "boolean" ? n.only : [...n.only],
        ]),
      ),
    ),
  };
}

/** The help page's list of rulesets, one line each: what a page's
 * {@link RULESETS_PLACEHOLDER} becomes. */
export function rulesetsMarkdown(rulesets: readonly Ruleset[]): string {
  return rulesets.map((r) => `* ${r.name}: ${r.rule}`).join("\n");
}
