import '@testing-library/jest-dom/vitest';

// jsdom does not implement scrollIntoView; NavBar's smooth-scroll click handler calls it.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
