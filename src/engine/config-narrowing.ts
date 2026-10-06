/**
 * What a config form offers of a field while another field decides it
 * (`ConfigDescription.narrowing`), and the values a form submits. It reads the
 * description alone, so the form on the page and the engine in its worker
 * work one answer out the same way.
 */

import type { ConfigDescription, ConfigValues } from "./types.ts";

/**
 * What is offered of the field `id` at these values: the choice indices left
 * of a `choices` field, the one value of a checkbox, or `null` for a field
 * nothing narrows. Two deciding fields leave of a field what both offer.
 */
export function offeredOf(
  config: ConfigDescription,
  values: ConfigValues,
  id: string,
): number[] | boolean | null {
  let offered: number[] | null = null;
  for (const { by, only } of config.narrowing ?? []) {
    const left = only[Number(values[by])]?.[id];
    if (left === undefined) continue;
    if (typeof left === "boolean") return left;
    offered = (offered ?? left).filter((i) => left.includes(i));
  }
  return offered;
}

/**
 * `values` with every narrowed field at a value it is offered: a checkbox at
 * its one value, and a choice that is not offered moved to the nearest that
 * is, the lower of two. The value a field was given is kept by the caller, so
 * a field narrowed for a while returns to it.
 */
export function offeredValues(
  config: ConfigDescription,
  values: ConfigValues,
): ConfigValues {
  const out = { ...values };
  for (const id of Object.keys(config.items)) {
    const offered = offeredOf(config, values, id);
    if (offered === null) continue;
    if (typeof offered === "boolean") {
      out[id] = offered;
      continue;
    }
    const value = Number(values[id]);
    out[id] = offered.reduce(
      (best, i) => (Math.abs(i - value) < Math.abs(best - value) ? i : best),
      offered[0] ?? value,
    );
  }
  return out;
}
