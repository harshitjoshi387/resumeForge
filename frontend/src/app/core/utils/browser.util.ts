import { afterNextRender } from '@angular/core';

/** Run after browser hydration. Must be called from a component constructor. */
export function runOnBrowser(run: () => void): void {
  afterNextRender(run);
}
