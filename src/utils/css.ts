// CSS that needs to be shared between various shadow DOMs
import { css, unsafeCSS } from "lit";

import cssNativeRaw from "../css/native.css?inline";
import cssWATweaksRaw from "../css/wa-tweaks.css?inline";

/**
 * Our styling for native tags (a, h1, p, etc.).
 * (Include in any component that wants to style native tags.)
 */
export const cssNative = css`${unsafeCSS(cssNativeRaw)}`;

/**
 * Our overrides for Web Awesome defaults.
 * (Include in any component that directly renders wa-* elements in shadow dom.)
 */
export const cssWATweaks = css`${unsafeCSS(cssWATweaksRaw)}`;

/**
 * A `wa-button.stacked` whose content is `<span class="stack">` holding an icon
 * and then its caption: the icon above the caption, as a slot of the puzzle
 * screen's Bar draws them, so a control beside the board reads as one there
 * does.
 */
export const cssStackedButton = css`
  wa-button.stacked::part(base) {
    height: auto;
    min-height: var(--app-row-tool-phone);
    padding-block: 0.25rem;
  }

  .stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    font-size: var(--app-font-size-micro);
    line-height: 1.15;

    wa-icon {
      font-size: 1.125rem;
    }
  }
`;

/**
 * Return the numeric value of a CSS custom property on element.
 * If defaultValue is not provided, throws an error if missing or invalid.
 * Property must be defined in CSS using a numeric @property `syntax` type
 * to ensure unit conversion. (This function does not parse or apply units.)
 */
export function getNumericProperty(
  element: Element,
  property: string,
  defaultValue?: number,
): number {
  // CSS @property to declare numeric type is Baseline 2024 (Firefox 128).
  // Checking `CSS.supports("at-rule(@property)")` is itself not yet supported,
  // so look for CSS.registerProperty added at the same time.
  if (typeof CSS.registerProperty === "function") {
    const valueStr = window.getComputedStyle(element).getPropertyValue(property);
    if (valueStr) {
      const value = Number.parseFloat(valueStr);
      if (Number.isNaN(value)) {
        throw new Error(`Unparseable numeric value for ${property}: '${valueStr}'`);
      }
      return value;
    }
  }
  if (defaultValue) {
    return defaultValue;
  }
  throw new Error(`No value for property "${property}"`);
}
