// @vitest-environment happy-dom
/**
 * The draft label, end to end: the build's `virtual:draft-puzzles` module is
 * what the home screen reads, and the card shows it.
 */
import drafts from "virtual:draft-puzzles";
import { describe, expect, it } from "vitest";
import { getTsGame } from "../engine/registry.ts";
import { draftSections } from "../engine/sections.ts";
import {
  REGISTERED_GAME_COUNT,
  REGISTERED_GAMES,
} from "../engine/testing/enrollment.ts";
import "../test-setup/icons.ts";
import type { CatalogCard } from "./catalog-card.ts";
import "./catalog-card.ts";

async function card(missing: readonly string[]): Promise<CatalogCard> {
  const el = document.createElement("catalog-card") as CatalogCard;
  el.name = "Net";
  el.missing = missing;
  document.body.append(el);
  await el.updateComplete;
  return el;
}

describe("the draft label", () => {
  it("is built from the games' own sections, for every draft and no other game", () => {
    expect(REGISTERED_GAME_COUNT).toBeGreaterThanOrEqual(57);
    for (const [id, game] of REGISTERED_GAMES) {
      const missing = draftSections(game);
      expect(`${id}: ${drafts[id] ?? []}`).toBe(`${id}: ${missing}`);
    }
    // Every game ships a hint, so the build may list no draft at all. The
    // positive is then the sections' own: a finished game with its hint taken
    // away is a draft, so a `draftSections` that stopped finding drafts could
    // not make both sides empty. And a known negative.
    const palisade = getTsGame("palisade");
    expect(palisade && draftSections({ ...palisade, hint: undefined })).toContain(
      "Hints",
    );
    expect(drafts["palisade"]).toBeUndefined();
  });

  it("is shown on a draft's card, saying what is still to come", async () => {
    const el = await card(["Hints", "Checking for mistakes"]);
    const label = el.shadowRoot?.querySelector('[part="draft"]');
    expect(label?.textContent).toBe("Draft");
    expect(label?.getAttribute("title")).toBe(
      "Draft: Hints and Checking for mistakes still to come",
    );
  });

  it("is absent from a complete game's card", async () => {
    const el = await card([]);
    expect(el.shadowRoot?.querySelector('[part="draft"]')).toBeNull();
  });
});
