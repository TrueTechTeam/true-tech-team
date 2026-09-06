import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// vitest.config.ts does not set `test.globals: true`, so @testing-library/react's automatic
// per-test cleanup (which only self-registers when it detects a global `afterEach`) never runs
// on its own. Register it explicitly here so every test file gets DOM cleanup between tests
// without needing its own afterEach(cleanup) boilerplate.
afterEach(() => {
  cleanup();
});

// jsdom does not implement scrollIntoView; NavBar's smooth-scroll click handler calls it.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// jsdom does not implement IntersectionObserver; CountUp and other components use it.
if (!global.IntersectionObserver) {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}
