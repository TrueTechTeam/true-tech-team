import '@testing-library/jest-dom/vitest';

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
