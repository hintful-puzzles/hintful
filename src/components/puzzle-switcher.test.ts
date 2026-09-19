// @vitest-environment happy-dom
/**
 * **Every game is reachable through the quick-switch.**
 *
 * The switcher replaces the `Other puzzles` dropdown, and a jump that cannot
 * reach a game is worse than the dropdown was: the dropdown at least showed
 * everything it had. The failure mode is quiet — a filter that excludes a game
 * for a reason nobody meant (one whose objective text is empty, say) looks
 * exactly like a game that does not exist.
 *
 * So this counts. It mounts the real component, walks the whole catalog through
 * the search box, and asserts that each id comes back — and that the count of
 * ids it tried is the catalog's, so a scan over an empty list cannot report
 * health.
 */
import "../test-setup/element-internals.ts";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { puzzleDataMap, puzzleIds, puzzlesInFamily } from "../puzzle/catalog.ts";
import { PuzzleSwitcher } from "./puzzle-switcher.ts";

vi.stubGlobal(
  "fetch",
  vi.fn(
    async () =>
      new Response('<svg xmlns="http://www.w3.org/2000/svg"></svg>', {
        headers: { "Content-Type": "image/svg+xml" },
      }),
  ),
);

let switcher: PuzzleSwitcher;

/** Type `text` into the box and read back the ids the list is offering. */
async function search(text: string): Promise<string[]> {
  (switcher as unknown as { search: string }).search = text;
  await switcher.updateComplete;
  const links =
    switcher.shadowRoot?.querySelectorAll<HTMLAnchorElement>("[part='match']");
  return [...(links ?? [])].map((a) => {
    // The href is the routing layer's own puzzle URL; the id is its last
    // meaningful segment. Reading the rendered href rather than a data
    // attribute is deliberate — the href is what a click actually follows.
    const path = new URL(a.href, "http://localhost/").pathname;
    return path.replace(/\/$/, "").split("/").pop() ?? "";
  });
}

describe("the quick-switch reaches every game", () => {
  beforeEach(async () => {
    document.body.replaceChildren();
    switcher = new PuzzleSwitcher();
    document.body.append(switcher);
    await switcher.updateComplete;
  });

  it("lists the whole catalog with an empty search", async () => {
    const listed = await search("");
    expect(listed.length).toBe(puzzleIds.length);
    expect([...listed].sort()).toEqual([...puzzleIds].sort());
  });

  it("finds every game by typing its name", async () => {
    // The vacuity guard is the count: an empty catalog, or a `search` setter
    // that stopped taking effect, would make the loop below assert nothing.
    expect(puzzleIds.length).toBeGreaterThan(50);

    const unreachable: string[] = [];
    for (const puzzleId of puzzleIds) {
      const listed = await search(puzzleDataMap[puzzleId].name);
      if (!listed.includes(puzzleId)) unreachable.push(puzzleId);
    }
    expect(
      unreachable,
      "a game that cannot be reached by typing its own name is a game the " +
        "quick-switch has silently lost",
    ).toEqual([]);
  });

  it("matches the objective too, so Sudoku finds Solo", async () => {
    // The reason the filter reads more than the name: a player hunts for the
    // word they know a puzzle by, which is often not what this collection
    // calls it.
    const listed = await search("latin square");
    expect(listed.length).toBeGreaterThan(0);
  });

  it("says so when nothing matches", async () => {
    const listed = await search("zzzzzzzz");
    expect(listed).toEqual([]);
    expect(switcher.shadowRoot?.querySelector("[part='empty']")).not.toBeNull();
  });
});

describe("from a game, the empty switcher opens on that game's family", () => {
  beforeEach(async () => {
    document.body.replaceChildren();
    switcher = new PuzzleSwitcher();
    // As the puzzle screen writes it: an attribute, not a property.
    switcher.setAttribute("current", "solo");
    document.body.append(switcher);
    await switcher.updateComplete;
  });

  it("lists the rest of the family first, then everything, each game once", async () => {
    const siblings = puzzlesInFamily("latin").filter((id) => id !== "solo");
    expect(siblings.length).toBeGreaterThan(1);

    const listed = await search("");
    expect(listed.slice(0, siblings.length)).toEqual(siblings);
    expect([...listed].sort()).toEqual([...puzzleIds].sort());
    const groups = switcher.shadowRoot?.querySelectorAll("[part='group']");
    expect([...(groups ?? [])].map((g) => g.textContent?.trim())).toEqual([
      "More Latin squares",
      "All puzzles",
    ]);
  });

  it("marks the game being played", async () => {
    await search("");
    expect(switcher.shadowRoot?.querySelector("[part='match-current']")).not.toBeNull();
  });

  it("drops the grouping once the player types", async () => {
    const listed = await search("loop");
    expect(listed).not.toContain("keen");
    expect(switcher.shadowRoot?.querySelector("[part='group']")).toBeNull();
  });
});
