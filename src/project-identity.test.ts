// @vitest-environment happy-dom
/**
 * The `project-identity` spec, checked against the About dialog's rendered
 * words and against the sources of every other surface that names the app.
 *
 * Two halves. The first renders the dialog's blurb and credits — the exported
 * templates the dialog itself mounts — and reads them: who it says wrote this,
 * that the lineage is credited in order, that no first-person sentence is left
 * for the next maintainer to inherit, and that a support link points home while
 * an attribution link still points at the project it credits. (The templates
 * are rendered bare rather than inside `<about-dialog>` because Web Awesome's
 * dialog does not survive happy-dom; the words are the same either way.) The
 * second is a source scan for the two strings this change retired — the
 * predecessor's name for the app, and its issue tracker as a support
 * destination — which a rename could reintroduce anywhere a template or a
 * README is edited by hand. The scan counts what it read, so an unmatched glob
 * (which yields `{}`) cannot pass it.
 *
 * Sources are read through Vite's `import.meta.glob` rather than `node:fs`, so
 * the file stays inside the browser-shaped type world (`tsconfig.json`
 * `"types": []`), as every other source-scanning test here does.
 */
import { render } from "lit";
import { beforeAll, describe, expect, it } from "vitest";
import privacyHtml from "./assets/privacy.html?raw";
import { aboutBlurb, credits } from "./dialogs/about-dialog.ts";
import { APP_NAME, APP_TAGLINE, ISSUES_URL, REPO_URL } from "./project-identity.ts";

const PUZZLES_WEB = "https://github.com/medmunds/puzzles-web";

let panel: HTMLElement;
let creditsEl: HTMLElement;
let panelText: string;
let creditsText: string;

beforeAll(() => {
  panel = document.createElement("div");
  creditsEl = document.createElement("div");
  document.body.append(panel, creditsEl);
  render(aboutBlurb(), panel);
  render(credits(), creditsEl);
  panelText = (panel.textContent ?? "").replace(/\s+/g, " ");
  creditsText = (creditsEl.textContent ?? "").replace(/\s+/g, " ");
});

function hrefsIn(el: HTMLElement): string[] {
  return [...el.querySelectorAll("a")].map((a) => a.getAttribute("href") ?? "");
}

describe("the About dialog presents this project's authorship and lineage", () => {
  it("names the maintainer and the product in the opening blurb", () => {
    expect(panelText).toContain(APP_NAME);
    // "maintained by", not "by": the puzzles themselves are not his (owner).
    expect(panelText).toMatch(/maintained by Yoni Lavi/);
  });

  it("describes a native TypeScript implementation, not a WebAssembly adaptation", () => {
    expect(panelText).toMatch(/native TypeScript/);
    expect(panelText).not.toMatch(/adaptation|WebAssembly|wasm/i);
  });

  it("credits the lineage in chronological order, with puzzles-web named", () => {
    const order = ["Simon Tatham", "Lennard Sprong", "Mike Edmunds"].map((name) => {
      const at = creditsText.indexOf(name);
      expect(at, `${name} is credited`).toBeGreaterThanOrEqual(0);
      return at;
    });
    expect(order).toEqual([...order].sort((a, b) => a - b));
    // The blurb also walks the chain in order, ending at this project.
    for (const name of ["Simon Tatham", "Lennard Sprong", "Mike Edmunds"]) {
      expect(panelText).toContain(name);
    }
    const mike = [...creditsEl.querySelectorAll("li")].find((li) =>
      li.textContent?.includes("Mike Edmunds"),
    );
    expect(mike?.textContent).toContain("puzzles-web");
    expect(mike?.querySelector("a")?.getAttribute("href")).toBe(PUZZLES_WEB);
  });

  it("leaves no first-person statement attributed to nobody", () => {
    // "I", "I’ve", "my", "me": the credits once said "from which I’ve freely
    // borrowed", with the "I" being the previous maintainer.
    const firstPerson = /(^|[\s(])(I|my|me)(?=[\s’'.,)])/;
    expect(panelText).not.toMatch(firstPerson);
    expect(creditsText).not.toMatch(firstPerson);
  });

  it("sends source and bug-report links home, and offers no forum link", () => {
    const hrefs = hrefsIn(panel);
    expect(hrefs).toContain(REPO_URL);
    expect(hrefs).toContain(ISSUES_URL);
    for (const href of hrefs) {
      expect(href.startsWith(REPO_URL), `${href} belongs to this project`).toBe(true);
    }
    expect(hrefs.some((h) => /discussions/.test(h))).toBe(false);
  });

  it("keeps the attribution links pointing at the projects they credit", () => {
    const hrefs = hrefsIn(creditsEl);
    expect(hrefs).toContain("https://www.chiark.greenend.org.uk/~sgtatham/puzzles/");
    expect(hrefs).toContain("https://github.com/x-sheep/puzzles-unreleased");
    expect(hrefs).toContain(PUZZLES_WEB);
  });
});

/** Every surface a player reads, plus the code that keeps the promises. */
const sources = import.meta.glob<string>(
  [
    "./**/*.ts",
    "../templates/*.hbs",
    "../help/**/*.md",
    "../vite.config.ts",
    "../README.md",
    "../unsupported.html",
  ],
  { query: "?raw", import: "default", eager: true },
);

describe("no other surface still carries the predecessor's identity", () => {
  const thisFile = "./project-identity.test.ts";

  it("scanned the whole app surface", () => {
    // Vacuity guard: 57 games' sources and help pages alone exceed this.
    expect(Object.keys(sources).length).toBeGreaterThan(400);
    for (const must of [
      "../templates/index.html.hbs",
      "../vite.config.ts",
      "../README.md",
    ]) {
      expect(sources, `${must} was read`).toHaveProperty(must);
    }
  });

  it("never names the app 'Puzzles web app' or routes support to puzzles-web", () => {
    const retired = [/Puzzles web app/i, /medmunds\/puzzles-web\/(issues|discussions)/];
    const offenders: string[] = [];
    for (const [file, text] of Object.entries(sources)) {
      if (file === thisFile) {
        continue;
      }
      for (const pattern of retired) {
        if (pattern.test(text)) {
          offenders.push(`${file}: ${pattern}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("gives the front page and the manifest the same name as the dialog", () => {
    const template = sources["../templates/index.html.hbs"];
    expect(template).toMatch(/<h1[^>]*>\{\{ appName \}\}<\/h1>/);
    expect(template).toMatch(/<title>\{\{ appName \}\}/);
    const config = sources["../vite.config.ts"];
    expect(config).toMatch(/appName: APP_NAME/);
    expect(config).toMatch(/tagline: APP_TAGLINE/);
    expect(config).toMatch(/name: env\["VITE_APP_NAME"\] \|\| APP_NAME/);
  });

  it("lets the header and page titles speak for the product, naming no one else", () => {
    // The tagline is the header's second line and the title's other half; the
    // lineage is credited in the About dialog, not the masthead.
    expect(APP_TAGLINE).not.toMatch(/Tatham|Sprong|Edmunds|puzzles-web/);
    for (const file of [
      "../templates/index.html.hbs",
      "../templates/puzzle.html.hbs",
    ]) {
      expect(sources[file], `${file} names no other project`).not.toMatch(
        /Tatham|Sprong|Edmunds|puzzles-web|portable puzzle collection/i,
      );
    }
    expect(sources["../templates/index.html.hbs"]).toMatch(/\{\{ tagline \}\}/);
    expect(sources["./screens/home-screen.ts"]).toMatch(/\$\{APP_TAGLINE\}/);
    expect(sources["./screens/home-screen.ts"]).not.toMatch(/Tatham/);
  });
});

describe("the privacy notes say what the app does with a player's data", () => {
  const text = privacyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  it("is not the development placeholder", () => {
    expect(text).not.toMatch(/placeholder|forgotten|No privacy policy/i);
  });

  it("makes each of the four promises", () => {
    expect(text).toMatch(/no personal information is collected or stored/i);
    expect(text).toMatch(
      /your own browser’s storage, on your device, and are never sent/i,
    );
    expect(text).toMatch(/anonymous actions only/i);
    expect(text).toMatch(/no cookies and no identifier/i);
    expect(text).toMatch(/does not include your identity or any saved game/i);
    expect(text).toMatch(/Nothing is sent unless you choose to send it/i);
  });

  it("says what a report carries, in the words the crash dialog uses", () => {
    // A report holds more than the error on screen, and the player's choice
    // to send one is only theirs if both places say so. The dialog's words
    // are the panel's, whole: two tellings in different terms are two things
    // to keep true.
    const dialog = sources["./dialogs/crash-dialog.ts"].replace(/\s+/g, " ");
    const told = /<summary>What a report includes<\/summary>(.*?)<\/details>/
      .exec(dialog)?.[1]
      .trim();
    expect(told?.length ?? 0).toBeGreaterThan(200);
    expect(text).toContain(told);
    // Everything the reporting attaches is in those words.
    for (const carried of [
      /any other errors recorded since the page was opened/i,
      /buttons pressed/i,
      /pages opened/i,
      /network requests the app made/i,
      /console/i,
      /the app’s version/i,
      /browser and screen/i,
      /game ID/i,
      /offline use and automatic updates/i,
      /installed/i,
      /repair/i,
      /any note you add/i,
    ])
      expect(told).toMatch(carried);
  });

  it("names in its words every tag and context the app attaches to a report", () => {
    // A tag added to a report with no word for it in the notes is how the
    // notes stop being true. Each is listed here beside the word that covers
    // it, and the list is held to what the sources set through the SDK's
    // `setTag`, `setTags` and `setContext`.
    const COVERED_BY: Record<string, RegExp> = {
      puzzleId: /which game/i,
      Puzzle: /its type, its game ID and how many moves in/i,
      "pwa.allowOfflineUse": /whether offline use/i,
      "pwa.autoUpdate": /automatic updates are on/i,
      "pwa.isRunningAsApp": /whether the app is installed/i,
      "lit.repair_font_tags": /repair part of its display/i,
      "lit.render_recovery": /repair part of its display/i,
    };
    const set = new Set<string>();
    for (const [file, source] of Object.entries(sources)) {
      if (file.endsWith(".test.ts")) continue;
      for (const m of source.matchAll(/Sentry\.set(?:Tag|Context)\(\s*"([^"]+)"/g))
        set.add(m[1]);
      for (const block of source.matchAll(/Sentry\.setTags\(\{([^}]*)\}/g))
        for (const key of block[1].matchAll(/"([^"]+)":/g)) set.add(key[1]);
    }
    expect([...set].sort()).toEqual(Object.keys(COVERED_BY).sort());
    for (const [name, words] of Object.entries(COVERED_BY))
      expect(text, `${name} is attached and the notes do not say so`).toMatch(words);
  });

  it("keeps the crash-report promises bound to the code that keeps them", () => {
    // The notes say personal information is switched off in the reporting.
    // This is the line that makes it so.
    expect(sources["./utils/sentry.ts"]).toMatch(/sendDefaultPii: false/);
    // "Nothing is sent unless you choose": `report-consent.test.ts` drives the
    // real `initSentry` and checks that nothing reaches the transport before
    // consent, and what does after it. This holds `initSentry` to the gate
    // that test exercises.
    expect(sources["./utils/sentry.ts"]).toMatch(/transport: reportConsent\.gate\(/);
    // "Nothing you have saved": no save is attached to a report anywhere.
    const attaching = Object.entries(sources)
      .filter(([, text]) => /\.addAttachment\(/.test(text))
      .map(([file]) => file);
    expect(attaching).toEqual([]);
  });
});
