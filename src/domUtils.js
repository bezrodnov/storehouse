// @flow

if (!document.body) throw new Error('Unexpectedly missing <body>.');
export const body: HTMLElement = document.body;

export function querySelector(el: HTMLElement, selector: string): HTMLElement {
  const result: HTMLElement | null = el.querySelector(selector);
  if (!result) {
    throw new Error(`Failed to match: ${selector}`);
  }
  return result;
}

export function getElementById(id: string): HTMLElement {
  const result: HTMLElement | null = document.getElementById(id);
  if (!result) {
    throw new Error(`Failed to match: ${id}`);
  }
  return result;
}
