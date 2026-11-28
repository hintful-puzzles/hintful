/**
 * The list as a reference aid (`play.along.panel`, Crossing's Numbers): each
 * record of the list, grouped by its length, marked held where the board as
 * placed holds its meaning, broken where the rules break it, fitting where
 * `AlongInput.take` would write it in (a site through the square selected
 * for typing, or with none selected, any site), and ruled out otherwise. It
 * does the scan "which numbers fit here?" for the player, so it lives behind
 * the panel, where it counts as help; a pick is a press on the record in the
 * list beneath the board.
 */

import { type ReferenceAid, UI_UPDATE, type UiUpdate } from "../contract/game.ts";
import type {
  ReferenceItem,
  ReferenceModel,
  ReferenceSection,
} from "../contract/types.ts";
import { liveErrors } from "../render/live-errors.ts";
import { type AlongInput, NONE_HELD } from "./along.ts";
import { rulesOf } from "./answer.ts";
import { type FillBoard, type FillModule, spaceOf } from "./board.ts";
import type { CandidateFillModule } from "./candidates.ts";
import type { Edit } from "./edit.ts";
import { boardGlyphs } from "./glyphs.ts";
import type { FillUi } from "./play.ts";
import { listRecords, recordTexts } from "./record-list.ts";

/** What the panel calls a record of the list and a site it is read along,
 * each a noun its plural adds `s` to. */
export interface PanelWords {
  readonly record: string;
  readonly site: string;
}

const capitalized = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** The reference aid of the list `kind` of boards of `module`, played by
 * `along`. */
export function recordPanel<C>(
  module: FillModule<C> & Pick<CandidateFillModule<C>, "WORDS">,
  kind: string,
  along: AlongInput<C>,
  words: PanelWords,
): ReferenceAid<FillBoard<C>, FillUi, Edit> {
  const rules = rulesOf(module);
  const holds =
    module.recordHolds ??
    ((): never => {
      throw new Error("play along panel: no recordHolds");
    })();
  const cell = module.WORDS?.cell ?? "square";
  const { record, site } = words;
  const typing = (ui: FillUi): boolean => ui.cursor.visible && ui.pencilMode !== true;

  function model(b: FillBoard<C>, ui: FillUi): ReferenceModel {
    const sp = spaceOf(module, b);
    const glyphs = boardGlyphs(module, sp, b.dealt);
    const member = module.WORDS?.value ?? glyphs.noun;
    const broken = liveErrors(rules, b).clues.get(kind);
    const texts = recordTexts(b, kind, glyphs.draw);
    const status = (k: number): ReferenceItem["status"] =>
      broken?.has(k) === true
        ? "conflict"
        : holds(b.values, sp, b.dealt, k)
          ? "placed"
          : along.fits(b, ui, k)
            ? "outstanding"
            : "ruledOut";
    const sections: ReferenceSection[] = [];
    listRecords(b, kind).forEach((members, k) => {
      const n = members.length;
      const heading = `${n} ${member}${n === 1 ? "" : "s"}`;
      let section = sections.at(-1);
      if (section?.heading !== heading) {
        section = { heading, group: null, items: [] };
        sections.push(section);
      }
      section.items.push({ key: String(k), label: texts[k], status: status(k) });
    });
    const held = ui.held ?? NONE_HELD;
    return {
      instructions: typing(ui)
        ? `The ${record}s that fit a ${site} through the selected ${cell}. Tap one that fits to write it in.`
        : `Select a ${cell} to see the ${record}s that fit its ${site}s. Tap one to pick it up.`,
      search: true,
      filters: [
        { label: "Fits", statuses: ["outstanding"] },
        { label: "Placed", statuses: ["placed", "conflict"] },
      ],
      sections,
      selected: held === NONE_HELD ? null : String(held),
      hinted: [],
    };
  }

  return {
    title: capitalized(`${record}s`),
    model,
    watches: (ui) =>
      `${ui.cursor.visible ? `${ui.cursor.x},${ui.cursor.y}` : ""}|${ui.way}|${ui.pencilMode}|${ui.held}`,
    select(b, ui, key): Edit | UiUpdate | null {
      if (key === null) {
        if ((ui.held ?? NONE_HELD) === NONE_HELD) return null;
        ui.held = NONE_HELD;
        return UI_UPDATE;
      }
      const k = Number(key);
      if (!Number.isInteger(k) || k < 0 || k >= listRecords(b, kind).length)
        return null;
      return along.take(b, ui, k);
    },
  };
}
