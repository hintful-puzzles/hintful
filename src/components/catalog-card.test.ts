// @vitest-environment happy-dom
/**
 * The draft label, end to end: the build's `virtual:draft-puzzles` module is
 * what the home screen reads, and the card shows it.
 */
import drafts from "virtual:draft-puzzles";
import { beforeAll, describe, expect, it } from "vitest";
import { getTsGame, registeredGameIds } from "../engine/registry.ts";
import { draftSections } from "../engine/sections.ts";
import { registerAllGames } from "../games/index.ts";
import "../test-setup/element-internals.ts";
import "../test-setup/icons.ts";
import type { CatalogCard } from "./catalog-card.ts";
import "./catalog-card.ts";

beforeAll(registerAllGames);

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
    const ids = registeredGameIds();
    expect(ids.length).toBeGreaterThanOrEqual(57);
    for (const id of ids) {
      const game = getTsGame(id);
      const missing = game === null ? [] : draftSections(game);
      expect(`${id}: ${drafts[id] ?? []}`).toBe(`${id}: ${missing}`);
    }
    // A positive and a known negative, so equality over two empty maps cannot
    // pass. The positive is any draft still without a hint rather than a game
    // named here, which would stop being one the day it gains its hint.
    expect(Object.values(drafts).some((missing) => missing.includes("Hints"))).toBe(
      true,
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
