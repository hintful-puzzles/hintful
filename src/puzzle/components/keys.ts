import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { css, html, LitElement, nothing } from "lit";
import { customElement, eventOptions, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import type { KeyLabel } from "../../engine/types.ts";
import { cssColorToOKLCH } from "../../utils/color.ts";
import { cssWATweaks } from "../../utils/css.ts";
import { puzzleContext } from "../contexts.ts";
import type { Puzzle } from "../puzzle.ts";

// Components
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";

interface LabelIcons {
  [label: string]: string;
}

/**
 * Stop a key press moving focus off the board.
 *
 * The board listens for `keydown` on **itself** (`view-interactive.ts`), so
 * whatever holds focus decides whether a physical key reaches the game. A
 * `mousedown` focuses the button it lands on, which left every keypad game in
 * the collection deaf to the keyboard from the first on-screen key a player
 * clicked until they clicked the board again — panel and keyboard are the same
 * input, and using one should not switch the other off.
 *
 * `mousedown` rather than `pointerdown`: iOS Safari generates a click from a
 * prevented `pointerdown` anyway, and a touch press is already answered on
 * `touchstart` by {@link PuzzleKeys.handleButtonPress}. Preventing the default
 * here suppresses the focus, not the click.
 */
function keepFocusOnTheBoard(event: MouseEvent): void {
  event.preventDefault();
}

/**
 * The Web Awesome tokens that paint a key in `fill`, with a readable label on
 * top of it.
 *
 * The ink is chosen from the fill's own lightness rather than fixed: a palette
 * is authored per color scheme, and a fill light enough to take black text in
 * one scheme is not in the other. The same value borders the key, because a
 * default `wa-button` draws a transparent border and a pale fill against a
 * pale panel would otherwise have no edge at all.
 */
function swatchProperties(fill: string): string {
  const ink = cssColorToOKLCH(fill)[0] > 0.6 ? "black" : "white";
  return `--wa-color-fill-loud: ${fill}; --wa-color-on-loud: ${ink}; --swatch-edge: ${ink};`;
}

/**
 * A virtual keyboard for the puzzle
 */
@customElement("puzzle-keys")
export class PuzzleKeys extends SignalWatcher(LitElement) {
  @consume({ context: puzzleContext, subscribe: true })
  @state()
  private puzzle?: Puzzle;

  // Maps KeyLabel.label to wa-icon name
  static defaultLabelIcons: LabelIcons = {
    Clear: "key-clear",
    Marks: "key-marks",
    Hints: "key-hints",
  };

  @property({ type: Object })
  labelIcons: LabelIcons = PuzzleKeys.defaultLabelIcons;

  @state()
  private keyLabels?: KeyLabel[];

  private renderedParams: string | null = null;

  protected override async willUpdate() {
    // The available keys can vary with changes to puzzle params.
    // (This should really be an effect on this.puzzle?.currentParams,
    // but @lit-labs/signals doesn't have effects yet.)
    const currentParams = this.puzzle?.currentParams ?? null;
    if (currentParams !== this.renderedParams) {
      this.renderedParams = currentParams;
      await this.loadKeyLabels();
    }
  }

  private async loadKeyLabels() {
    this.keyLabels = (await this.puzzle?.requestKeys()) ?? [];
  }

  protected override render() {
    if (!this.keyLabels || this.keyLabels.length === 0) {
      return nothing;
    }

    // If >5 keys, divide into two equal groups for better wrapping
    const split =
      this.keyLabels.length > 5
        ? Math.floor(this.keyLabels.length / 2)
        : this.keyLabels.length;
    const keyGroups = [this.keyLabels.slice(0, split), this.keyLabels.slice(split)];
    const groups = keyGroups.map(
      (keys) => html`
          <div part="group">${keys.map(this.renderVirtualKey)}</div>`,
    );

    // Activate virtual keys on touchstart for better responsiveness in rapid "typing".
    // But also handle click for keyboard activation (if a virtual key somehow gets focus).
    return html`
      <div
          part="base"
          @click=${this.handleButtonPress}
          @mousedown=${keepFocusOnTheBoard}
          @touchstart=${this.handleButtonPress}
        >${groups}</div>
    `;
  }

  private renderVirtualKey = (key: KeyLabel) => {
    const label = key.label;
    const icon = this.labelIcons[label];
    const fill = this.swatchFill(key);
    const classes = classMap({
      single: icon || label.length === 1,
      swatch: fill !== null,
    });
    const content = icon
      ? html`<wa-icon name=${icon} label=${label}></wa-icon>`
      : label;
    // Exclude virtual keys from keyboard navigation
    // (they're not helpful for a keyboard user).
    return html`
      <wa-button
          class=${classes}
          style=${fill === null ? nothing : swatchProperties(fill)}
          data-button=${key.button}
          tabindex="-1"
        >${content}</wa-button>
    `;
  };

  /**
   * The CSS color a key with a `swatch` is painted in, or `null` for an
   * ordinary key.
   *
   * Read off `puzzle.palette` — the very array the canvas is painted from —
   * so a key cannot drift from the board when the color scheme flips. Before
   * the first palette arrives the key renders plain rather than guessing.
   */
  private swatchFill(key: KeyLabel): string | null {
    if (key.swatch === undefined) return null;
    return this.puzzle?.palette[key.swatch] ?? null;
  }

  @eventOptions({ passive: false })
  private async handleButtonPress(event: PointerEvent | TouchEvent) {
    // Delegated listener for both touchstart and click events.
    // (On touch devices, preventDefault on touchstart will avoid a later click event.
    // This must be installed on touchstart rather than pointerdown, because it's
    // impossible on iOS Safari to prevent a pointerdown from generating a click.)
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const target = event.target.closest("[data-button]");
    const dataButton = target?.getAttribute("data-button") ?? null;
    if (dataButton !== null) {
      event.preventDefault();
      const button = Number.parseInt(dataButton, 10);
      if (!Number.isNaN(button)) {
        await this.puzzle?.processKey(button);
      } else if (!import.meta.env.PROD) {
        throw new Error(`Invalid data-button="${dataButton}"`);
      }
    }
  }

  static override styles = [
    cssWATweaks,
    css`
      :host {
        display: contents;
      }
      
      [part~="base"] {
        --gap: var(--wa-space-s);

        display: flex;
        flex-wrap: wrap;
        gap: var(--gap);
      }
  
      [part~="group"] {
        display: flex;
        gap: var(--gap);
      }
  
      .single {
        /* Make all single-char buttons the same width, for uniform layout.
         * (This cheats the horizontal padding just a bit.) */
        width: var(--wa-form-control-height);
      }

      .swatch::part(base) {
        /* A default wa-button's border is transparent; a key painted in a pale
         * board color needs an edge to read as a key. */
        border-color: var(--swatch-edge);
      }
      
      wa-button {
        /* Disable double-tap to zoom on keys that might be tapped quickly.
         * (Ineffective in iOS Safari; see preventDoubleTapZoomOnButtons.) */
        touch-action: pinch-zoom;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "puzzle-keys": PuzzleKeys;
  }
}
