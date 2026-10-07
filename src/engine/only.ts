/**
 * What one setting leaves of the others: a ruleset that does not take every
 * tier (`Ruleset.only`), or a rule modifier that takes a tier away while it
 * applies (`modifierItem`'s `only`). It is declared once, on the deciding
 * field, and the three things that follow are built here: the refusal of a
 * deal that asks for more ({@link onlyError}), what the Custom dialog offers
 * ({@link configNarrowing}), and the sentence in the narrowed field's help
 * entry ({@link onlySentences}).
 */

import type { ParamConfigItem } from "./game.ts";
import { RULESET_KW } from "./ruleset.ts";
import type { ConfigNarrowing } from "./types.ts";

/** What is left of one field: choice indices, or a checkbox's one value. */
export type Only = readonly number[] | boolean;

/** What is left of each field that is not taken whole, by the field's `kw`. A
 * field left out is taken as it stands. */
export type OnlyOf = Readonly<Record<string, Only>>;

type ChoicesItem<P> = Extract<ParamConfigItem<P>, { type: "choices" }>;
type BooleanItem<P> = Extract<ParamConfigItem<P>, { type: "boolean" }>;

/** One value of a deciding field, and what the fields are left at it. */
interface Deciding<P> {
  by: ChoicesItem<P> | BooleanItem<P>;
  /** The value: a choice's index, or 0 and 1 for a checkbox off and on. */
  index: number;
  only: OnlyOf;
  /** The ruleset's name where the value is one, which is how a sentence
   * names it. Any other value is named by its field. */
  ruleset: string | null;
}

/** What a form control holds at `index`: a choice's name, or "on" or "off". */
function valueName<P>(by: Deciding<P>["by"], index: number): string {
  if (by.type === "boolean") return index ? "on" : "off";
  return by.choices[index] ?? String(index);
}

/** Every deciding value in `config`: the rulesets first, then the modifiers
 * in dialog order. */
function deciding<P>(config: readonly ParamConfigItem<P>[]): Deciding<P>[] {
  const out: Deciding<P>[] = [];
  const all = [
    ...config.filter((i) => i.kw === RULESET_KW),
    ...config.filter((i) => i.kw !== RULESET_KW),
  ];
  for (const by of all) {
    if (by.type === "string") continue;
    const rulesets = by.type === "choices" ? by.rulesets : undefined;
    rulesets?.forEach((ruleset, index) => {
      if (ruleset.only)
        out.push({ by, index, only: ruleset.only, ruleset: ruleset.name });
    });
    for (const [index, only] of Object.entries(by.modifier?.only ?? {})) {
      const known = by.type === "boolean" || by.choices[Number(index)] !== undefined;
      if (!known)
        throw new Error(
          `"${by.kw}" declares what choice ${index} leaves, and has none`,
        );
      out.push({ by, index: Number(index), only, ruleset: null });
    }
  }
  return out;
}

/** One field a deciding value narrows, found in the game's `paramConfig`. */
type Narrowed<P> =
  | { item: ChoicesItem<P>; only: readonly number[] }
  | { item: BooleanItem<P>; only: boolean };

/**
 * What `d` leaves of the fields of `config`, each `only` entry matched to its
 * item. A declaration that names no field, names the wrong kind of one, names
 * a field that decides others, or offers nothing of it throws.
 */
function narrowedBy<P>(
  config: readonly ParamConfigItem<P>[],
  deciders: ReadonlySet<string>,
  d: Deciding<P>,
): Narrowed<P>[] {
  const who = d.ruleset
    ? `ruleset "${d.ruleset}"`
    : `"${d.by.kw}" at ${valueName(d.by, d.index)}`;
  return Object.entries(d.only).map(([kw, only]): Narrowed<P> => {
    const item = config.find((i) => i.kw === kw);
    const bad = (why: string) => new Error(`${who} narrows "${kw}", ${why}`);
    if (!item || item.kw === d.by.kw) throw bad("which is no other field");
    // A form works a field's offer out from the values as chosen, in one
    // pass, so a field that decides is never itself decided.
    if (deciders.has(kw)) throw bad("which narrows fields itself");
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

/** Every deciding value of `config` with the fields it narrows. */
function narrowings<P>(
  config: readonly ParamConfigItem<P>[],
): { d: Deciding<P>; narrowed: Narrowed<P>[] }[] {
  const all = deciding(config);
  const deciders = new Set(all.map((d) => d.by.kw));
  const out = all.map((d) => ({ d, narrowed: narrowedBy(config, deciders, d) }));
  // Two fields may narrow a third, and a form then offers what both leave. A
  // pair of values that leaves nothing is a form with no value to show.
  for (const a of out) {
    for (const b of out) {
      if (a.d.by.kw >= b.d.by.kw) continue;
      for (const n of a.narrowed) {
        const other = b.narrowed.find((m) => m.item.kw === n.item.kw);
        if (!other) continue;
        const shared =
          typeof n.only === "boolean" || typeof other.only === "boolean"
            ? n.only === other.only
            : n.only.some((i) => (other.only as readonly number[]).includes(i));
        if (!shared)
          throw new Error(
            `"${a.d.by.kw}" and "${b.d.by.kw}" leave nothing of "${n.item.kw}" between them`,
          );
      }
    }
  }
  return out;
}

/** "Normal, Tricky and Hard". */
function listed(names: readonly string[], last: string): string {
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} ${last} ${names.at(-1)}`;
}

/** The names of the choices left, or a checkbox's "on" or "off". */
function offeredWords<P>(n: Narrowed<P>, last: string): string {
  if (typeof n.only === "boolean") return n.only ? "on" : "off";
  const { choices } = n.item;
  return listed(
    n.only.map((i) => choices[i] ?? ""),
    last,
  );
}

/**
 * The refusal for a field holding what another field's value does not leave
 * of it, or `null`. `read` gives a field's value, so one check reads a params
 * set and a dialog's values alike.
 */
export function onlyError<P>(
  config: readonly ParamConfigItem<P>[],
  read: (item: ParamConfigItem<P>) => number | boolean | string,
): string | null {
  for (const { d, narrowed } of narrowings(config)) {
    if (Number(read(d.by)) !== d.index) continue;
    for (const n of narrowed) {
      const value = read(n.item);
      const offered =
        typeof n.only === "boolean" ? value === n.only : n.only.includes(Number(value));
      if (offered) continue;
      const where = d.ruleset
        ? `for ${d.ruleset}`
        : `while ${d.by.name} is ${valueName(d.by, d.index)}`;
      return `${n.item.name} must be ${offeredWords(n, "or")} ${where}.`;
    }
  }
  return null;
}

/** What the help's entry for the field `kw` says of the values that narrow
 * it, a sentence each: "Edges offers only Normal, Tricky and Hard.", "While
 * Show identity is off, only Normal and Tricky are offered." */
export function onlySentences<P>(
  config: readonly ParamConfigItem<P>[],
  kw: string,
): string[] {
  return narrowings(config).flatMap(({ d, narrowed }) =>
    narrowed
      .filter((n) => n.item.kw === kw)
      .map((n) => {
        const words = offeredWords(n, "and");
        if (d.ruleset)
          return typeof n.only === "boolean"
            ? `${d.ruleset} always has it ${words}.`
            : `${d.ruleset} offers only ${words}.`;
        const where = `While ${d.by.name} is ${valueName(d.by, d.index)}`;
        if (typeof n.only === "boolean") return `${where}, it is always ${words}.`;
        return `${where}, only ${words} ${n.only.length === 1 ? "is" : "are"} offered.`;
      }),
  );
}

/**
 * The dialog's side of every `only`: for each deciding field, what each of
 * its values leaves of the other fields. Empty for a game that declares none.
 */
export function configNarrowing<P>(
  config: readonly ParamConfigItem<P>[],
): ConfigNarrowing[] {
  const out = new Map<string, ConfigNarrowing>();
  for (const { d, narrowed } of narrowings(config)) {
    const values = d.by.type === "boolean" ? 2 : d.by.choices.length;
    const entry: ConfigNarrowing = out.get(d.by.kw) ?? {
      by: d.by.kw,
      only: Array.from({ length: values }, () => ({})),
    };
    out.set(d.by.kw, entry);
    for (const n of narrowed) {
      const row = entry.only[d.index];
      if (row) row[n.item.kw] = typeof n.only === "boolean" ? n.only : [...n.only];
    }
  }
  return [...out.values()];
}
