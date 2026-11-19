/**
 * What the reference panel shows of a model, under the player's search text,
 * the group and the filter they pressed. Pure, so the panel's narrowing is
 * tested without a page.
 */

import type {
  ReferenceItem,
  ReferenceModel,
  ReferenceSection,
} from "../engine/types.ts";

/** One button of the group row or the filter row. */
export interface FilterButton {
  label: string;
  count: number;
  /** The one of its row whose items are shown: the view's choice, or the
   * row's first where a new board's model has no such button. */
  pressed: boolean;
}

/** What the player has chosen: the search text, the group pressed (an index
 * into the model's groups), and the filter pressed (`0` is "All", `i` the
 * model's filter `i - 1`). */
export interface ReferenceView {
  query: string;
  group: number;
  filter: number;
}

export interface Narrowed {
  /** The pressed group's sections with an item left, each holding only
   * those items. */
  sections: ReferenceSection[];
  /** The group row, none where the model names no group. */
  groups: FilterButton[];
  /** The filter row, none where the model declares no filter. */
  buttons: FilterButton[];
}

/**
 * Each row's buttons count what they would show under the search and the
 * other row's pressed button, so the two rows compose.
 */
export function narrowReference(model: ReferenceModel, view: ReferenceView): Narrowed {
  const needle = view.query.trim().toLowerCase();
  const found = (item: ReferenceItem) =>
    needle === "" || item.label.toLowerCase().includes(needle);
  const shows = [
    (_: ReferenceItem) => true,
    ...model.filters.map(
      (f) => (item: ReferenceItem) => f.statuses.includes(item.status),
    ),
  ];
  const filter = view.filter < shows.length ? view.filter : 0;
  const keep = shows[filter];

  const names = [
    ...new Set(model.sections.flatMap((s) => (s.group === null ? [] : [s.group]))),
  ];
  const pressedGroup = view.group < names.length ? view.group : 0;
  const group = names[pressedGroup] ?? null;
  const inGroup = (s: ReferenceSection) => group === null || s.group === group;

  const groups = names.map((label, i) => ({
    label,
    count: model.sections
      .filter((s) => s.group === label)
      .flatMap((s) => s.items)
      .filter((i) => found(i) && keep(i)).length,
    pressed: i === pressedGroup,
  }));
  const matched = model.sections
    .filter(inGroup)
    .flatMap((s) => s.items)
    .filter(found);
  const buttons =
    model.filters.length === 0
      ? []
      : ["All", ...model.filters.map((f) => f.label)].map((label, i) => ({
          label,
          count: matched.filter(shows[i]).length,
          pressed: i === filter,
        }));
  const sections = model.sections
    .filter(inGroup)
    .map((s) => ({
      heading: s.heading,
      group: s.group,
      items: s.items.filter((i) => found(i) && keep(i)),
    }))
    .filter((s) => s.items.length > 0);
  return { sections, groups, buttons };
}
