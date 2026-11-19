/**
 * What the reference panel shows of a model, under the player's search text
 * and the filter they pressed. Pure, so the panel's narrowing is tested
 * without a page.
 */

import type {
  ReferenceItem,
  ReferenceModel,
  ReferenceSection,
} from "../engine/types.ts";

/** One filter button: "All" first, then the model's own. */
export interface FilterButton {
  label: string;
  count: number;
}

export interface Narrowed {
  /** The sections with an item left, each holding only those items. */
  sections: ReferenceSection[];
  /** The buttons to show, none where the model declares no filter. */
  buttons: FilterButton[];
}

/**
 * The model's items whose label contains `query`, case ignored, and that the
 * filter at `pressed` shows: `0` is "All", `i` the model's filter `i - 1`.
 * Each button counts what it would show under the same search.
 */
export function narrowReference(
  model: ReferenceModel,
  query: string,
  pressed: number,
): Narrowed {
  const needle = query.trim().toLowerCase();
  const found = (item: ReferenceItem) =>
    needle === "" || item.label.toLowerCase().includes(needle);
  const shows = [
    (_: ReferenceItem) => true,
    ...model.filters.map(
      (f) => (item: ReferenceItem) => f.statuses.includes(item.status),
    ),
  ];
  const matched = model.sections.flatMap((s) => s.items).filter(found);
  const buttons =
    model.filters.length === 0
      ? []
      : ["All", ...model.filters.map((f) => f.label)].map((label, i) => ({
          label,
          count: matched.filter(shows[i]).length,
        }));
  const keep = shows[pressed] ?? shows[0];
  const sections = model.sections
    .map((s) => ({
      heading: s.heading,
      items: s.items.filter((i) => found(i) && keep(i)),
    }))
    .filter((s) => s.items.length > 0);
  return { sections, buttons };
}
