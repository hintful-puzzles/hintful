import type WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import { css, html, LitElement, unsafeCSS } from "lit";
import { query } from "lit/decorators/query.js";
import { customElement, state } from "lit/decorators.js";
import cssHelpRaw from "../css/help.css?inline";
import { helpUrl } from "../routing.ts";
import { cssNative, cssWATweaks } from "../utils/css.ts";

// Components
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/dialog/dialog.js";

/**
 * The rules of game `puzzleId`, as its served help page renders them: what
 * lies between the page's title and its first section heading. `null` when
 * the page cannot be read, offline with nothing cached, say.
 */
export async function fetchRules(puzzleId: string): Promise<DocumentFragment | null> {
  const url = helpUrl(puzzleId);
  let text: string;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    text = await response.text();
  } catch {
    return null;
  }
  const page = new DOMParser().parseFromString(text, "text/html");
  const title = page.body.querySelector("h1");
  if (!title) return null;
  const rules = document.createDocumentFragment();
  for (
    let node = title.nextSibling;
    node && node.nodeName !== "H2";
    node = node.nextSibling
  ) {
    rules.append(document.importNode(node, true));
  }
  // The page's relative links resolve against the page, not against this one.
  for (const el of rules.querySelectorAll<HTMLElement>("[href],[src]")) {
    for (const attr of ["href", "src"]) {
      const value = el.getAttribute(attr);
      if (value !== null) el.setAttribute(attr, new URL(value, url).href);
    }
  }
  return rules;
}

/**
 * The card a game shows on its first open: its rules, a way to play and a way
 * to the full page. Only read, so a click away from it closes it.
 */
@customElement("first-open-card")
export class FirstOpenCard extends LitElement {
  @state()
  private puzzleId = "";

  @state()
  private name = "";

  @state()
  private rules: DocumentFragment | null = null;

  @query("wa-dialog")
  private dialog?: WaDialog;

  /** Shows game `puzzleId`'s `rules`, replacing any game shown before. */
  async show(puzzleId: string, name: string, rules: DocumentFragment) {
    this.puzzleId = puzzleId;
    this.name = name;
    this.rules = rules;
    await this.updateComplete;
    if (this.dialog) this.dialog.open = true;
  }

  private close = () => {
    if (this.dialog) this.dialog.open = false;
  };

  protected override render() {
    return html`
      <wa-dialog light-dismiss>
        <div slot="label">${this.name}</div>
        <div class="rules">${this.rules}</div>
        <wa-button
            slot="footer"
            appearance="outlined"
            href=${helpUrl(this.puzzleId).href}
            @click=${this.close}
        >Full rules and controls</wa-button>
        <wa-button slot="footer" variant="brand" autofocus @click=${this.close}
          >Play</wa-button
        >
      </wa-dialog>
    `;
  }

  static override styles = [
    cssNative,
    cssWATweaks,
    css`
      :host {
        display: contents;
      }

      wa-dialog {
        --width: 34rem;
      }
      wa-dialog::part(footer) {
        flex-wrap: wrap;
      }

      /* A phone's card sits at the bottom and grows to fit the rules, which
         the player has come to read; what is left of the board shows above. */
      @media (max-width: 40rem) {
        wa-dialog::part(dialog) {
          margin-block: auto 0;
          max-width: 100%;
          border-end-start-radius: 0;
          border-end-end-radius: 0;
        }
      }

      .rules {
        > :first-child {
          margin-block-start: 0;
        }
        > :last-child {
          margin-block-end: 0;
        }

        ${unsafeCSS(cssHelpRaw)}
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "first-open-card": FirstOpenCard;
  }
}
