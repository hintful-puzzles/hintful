/**
 * **The Menu: every command the Bar does not show.** It draws the entries of
 * `command-list.ts` that follow the Bar's, in the list's order, under the
 * group each belongs to.
 *
 * It is the puzzle screen's one overflow: the only panel that may scroll, with
 * no second menu inside it apart from the timeline, which is a list of moves
 * and not of commands.
 *
 * Every row is a `data-command` control, so `puzzle-screen.ts`'s command bus is
 * the single vocabulary and `puzzle-command-homes.test.ts` can hold the
 * rendered panels and the `commandMap` to each other in both directions.
 */
import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { css, html, LitElement, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { cssWATweaks } from "../../utils/css.ts";
import { awaitsFirstBoard } from "../board-commands.ts";
import {
  type CommandEntry,
  type CommandGroup,
  commandList,
  cutCommandList,
  GROUP_LABEL,
  MIN_BAR_LENGTH,
} from "../command-list.ts";
import { puzzleContext } from "../contexts.ts";
import type { Puzzle } from "../puzzle.ts";
import { shortcutLabel } from "../shortcuts.ts";

// Component registration
import "@awesome.me/webawesome/dist/components/icon/icon.js";
import "./history.ts";

@customElement("puzzle-menu")
export class PuzzleMenu extends SignalWatcher(LitElement) {
  @consume({ context: puzzleContext, subscribe: true })
  @state()
  private puzzle?: Puzzle;

  /** How many of the list's leading entries the Bar is showing. */
  @property({ type: Number, attribute: "bar-length" })
  barLength = MIN_BAR_LENGTH;

  /** The game's display name, for the help row's label. */
  @property({ type: String })
  gameName = "";

  /** Where `How to play …` points. */
  @property({ type: String })
  helpHref = "";

  protected override render() {
    const entries = this.puzzle
      ? cutCommandList(commandList(this.puzzle, this.gameName), this.barLength).menu
      : [];
    const groups = new Map<CommandGroup, CommandEntry[]>();
    for (const entry of entries) {
      const group = groups.get(entry.group) ?? [];
      group.push(entry);
      groups.set(entry.group, group);
    }
    return html`
      <div part="base">
        <header part="header">
          <h2 part="title">Menu</h2>
          <button part="close" type="button" @click=${this.handleClose}>
            <wa-icon name="xmark" library="system" label="Close menu"></wa-icon>
          </button>
        </header>
        ${[...groups].map(([group, rows]) => this.renderGroup(group, rows))}
      </div>
    `;
  }

  private renderGroup(group: CommandGroup, rows: CommandEntry[]) {
    const label = GROUP_LABEL[group];
    return html`
      <section part="group" aria-label=${label ?? "Commands"}>
        ${label === null ? nothing : html`<h3 part="group-label">${label}</h3>`}
        ${rows.map((entry) => this.renderEntry(entry))}
      </section>
    `;
  }

  private renderEntry(entry: CommandEntry): TemplateResult {
    switch (entry.kind) {
      case "timeline":
        return html`<puzzle-history part="timeline"></puzzle-history>`;
      case "help-link":
        // A link and not a command: `Screen.interceptCommandAndHrefClicks`
        // routes a help URL to the help drawer, and throws in dev on an
        // element carrying both an href and a data-command.
        return html`
          <a part="row" href=${this.helpHref}>
            <wa-icon part="row-icon" name=${entry.icon}></wa-icon>
            <span part="row-label">${entry.label}</span>
          </a>`;
      case "command": {
        // The key comes from `shortcuts.ts`, the table the handler binds from,
        // so a shown key is a bound key.
        const key = shortcutLabel(entry.id);
        return html`
          <button
              part="row"
              class=${entry.quiet ? "quiet" : nothing}
              type="button"
              data-command=${entry.id}
              ?disabled=${entry.disabled === true || awaitsFirstBoard(entry.id, this.puzzle ?? null)}
          >
            <wa-icon part="row-icon" name=${entry.icon}></wa-icon>
            <span part="row-label">${entry.label}</span>
            ${key ? html`<kbd part="row-key">${key}</kbd>` : nothing}
          </button>`;
      }
    }
  }

  private handleClose() {
    this.dispatchEvent(
      new CustomEvent("puzzle-menu-close", { bubbles: true, composed: true }),
    );
  }

  static override styles = [
    cssWATweaks,
    css`
      :host {
        display: block;
        box-sizing: border-box;
        min-width: 0;
      }

      * {
        box-sizing: border-box;
      }

      [part="base"] {
        display: flex;
        flex-direction: column;
        gap: var(--app-gap-group);
        padding: var(--wa-space-xs) var(--wa-space-s) var(--wa-space-m);
      }

      [part="header"] {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-inline-start: 0.5rem;
      }

      [part="title"] {
        margin: 0;
        font-size: var(--app-font-size-body);
        font-weight: var(--wa-font-weight-semibold);
        color: var(--app-color-text);
      }

      [part="close"] {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: var(--row-height);
        min-height: var(--row-height);
        border: none;
        border-radius: var(--app-radius-control);
        background: none;
        color: var(--app-color-text-quiet);
        cursor: pointer;

        &:focus-visible {
          outline: var(--wa-focus-ring);
          outline-offset: var(--wa-focus-ring-offset);
        }
      }

      [part="group"] {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      [part="group-label"] {
        margin: 0 0 0.25rem;
        padding-inline: 0.5rem;
        font-size: var(--app-font-size-micro);
        font-weight: var(--wa-font-weight-semibold);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--app-color-text-faint);
      }

      /* A row under a finger is a real tap target; under a mouse it is the
       * denser row a long list wants. */
      :host {
        --row-height: var(--app-row-rail);
      }
      @media (pointer: coarse) {
        :host {
          --row-height: var(--app-tap-min);
        }
      }

      /* A row is a row whether it is a button or a link: one selector, so the
       * two cannot drift apart visually. */
      [part="row"] {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        width: 100%;
        min-height: var(--row-height);
        padding-inline: 0.5rem;
        border: 1px solid transparent;
        border-radius: var(--app-radius-control);
        background: none;
        color: var(--app-color-text);
        font: inherit;
        font-size: var(--app-font-size-body);
        text-align: start;
        text-decoration: none;
        cursor: pointer;

        &:disabled {
          color: var(--app-color-text-faintest);
          cursor: default;
        }

        &:focus-visible {
          outline: var(--wa-focus-ring);
          outline-offset: var(--wa-focus-ring-offset);
        }

        @media (hover: hover) {
          &:hover:not(:disabled) {
            background-color: var(--app-color-row-rule);
          }
        }
      }

      [part="row-icon"] {
        flex: 0 0 auto;
        font-size: 1rem;
        color: var(--app-color-text-quiet);

        [part="row"]:disabled & {
          color: inherit;
        }
      }

      [part="row-label"] {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* A key is shown where there is likely a keyboard to press it on. */
      [part="row-key"] {
        display: none;
        flex: 0 0 auto;
        font-family: var(--app-font-mono);
        font-size: var(--app-font-size-micro);
        color: var(--app-color-text-faint);
      }
      @media (hover: hover) and (pointer: fine) {
        [part="row-key"] {
          display: inline;
        }
      }

      [part="row"].quiet {
        color: var(--app-color-text-quiet);
      }

      puzzle-history::part(counter) {
        min-height: var(--row-height);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "puzzle-menu": PuzzleMenu;
  }
}
