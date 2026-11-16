/**
 * Each description's plants (`plants.ts`) cover exactly what the soundness
 * checks prove of it, and each plant parses. The checks themselves run for
 * hours and by hand, so a statement with no plant, or a plant whose
 * statement was renamed, is caught here, in milliseconds, instead of passing
 * there unplanted.
 */
import { describe, expect, it } from "vitest";
import {
  type DescriptionFile,
  isFormal,
  isLibrary,
  isPlanning,
  parseBinders,
  withEveryVariation,
} from "./description.ts";
import { parse } from "./expr.ts";
import { loadDescriptionFile } from "./load.ts";
import { type Plants, parsePlants, plantsPath } from "./plants.ts";

const descriptions = import.meta.glob<string>("../**/*.description.yaml", {
  query: "?raw",
  import: "default",
  eager: true,
});
const plantFiles = import.meta.glob<string>("../**/*.plants.yaml", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** The ids a check plants a defect in, by section. */
function planted(file: DescriptionFile): Record<keyof Plants, string[]> {
  if (isLibrary(file))
    return { techniques: Object.keys(file.techniques), once: [], deadEnds: [] };
  const techniques =
    isFormal(file) && file.techniques !== undefined
      ? (withEveryVariation(file).techniques ?? []).flatMap((t) =>
          "use" in t ? [] : [t.id],
        )
      : [];
  const deadEnds = isPlanning(file)
    ? [
        ...Object.keys(file.deadEnds ?? {}),
        ...Object.values(file.variations ?? {}).flatMap((v) =>
          Object.keys(v.add?.deadEnds ?? {}),
        ),
      ]
    : [];
  return { techniques, once: [], deadEnds };
}

const sources = Object.keys(descriptions).sort();

describe("every statement a check proves has a planted defect", () => {
  it("reads the descriptions and the plants", () => {
    // A glob gone wrong would pass everything below.
    expect(sources.length).toBeGreaterThan(50);
    expect(Object.keys(plantFiles).length).toBeGreaterThan(50);
  });

  for (const source of sources) {
    const file = loadDescriptionFile(descriptions[source], source);
    const want = planted(file);
    const path = plantsPath(source);
    const text = plantFiles[path];
    if (want.techniques.length === 0 && want.deadEnds.length === 0) {
      it(`${source}: states nothing to plant in, and has no plants`, () => {
        expect(text).toBeUndefined();
      });
      continue;
    }
    it(`${source}: one plant a statement, each parsed`, () => {
      expect(text, `${path} is missing`).toBeDefined();
      const plants = parsePlants(text ?? "", path);
      expect(Object.keys(plants.techniques).sort()).toEqual(
        [...want.techniques].sort(),
      );
      expect(Object.keys(plants.deadEnds).sort()).toEqual([...want.deadEnds].sort());
      // `once` is a library's, and only where the technique is stated.
      if (!isLibrary(file)) expect(plants.once).toEqual({});
      for (const id of Object.keys(plants.once)) expect(want.techniques).toContain(id);
      for (const p of [
        ...Object.values(plants.techniques),
        ...Object.values(plants.once),
      ]) {
        if (p.for !== undefined) parseBinders(p.for);
        if (p.conclude !== undefined) parse(p.conclude);
      }
      for (const src of Object.values(plants.deadEnds)) parse(src);
    });
  }

  it("has no plants beside no description", () => {
    const orphans = Object.keys(plantFiles).filter(
      (p) => !sources.some((s) => plantsPath(s) === p),
    );
    expect(orphans).toEqual([]);
  });
});
