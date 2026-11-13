import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup, configure } from '@testing-library/react';

// vitest.config.ts does not set `test.globals: true`, so @testing-library/react's automatic
// per-test cleanup (which only self-registers when it detects a global `afterEach`) never runs
// on its own. Register it explicitly here so every test file gets DOM cleanup between tests
// without needing its own afterEach(cleanup) boilerplate.
afterEach(() => {
  cleanup();
});

// `findBy*` and `waitFor` default to a 1000ms budget. Several components in
// @true-tech-team/react-components open on an animation (Select's dropdown, Dialog), and under CPU
// load that open plus the re-render can exceed one second - which showed up as
// `IconField > offers every icon name...` failing with "Unable to find role=\"menu\"" only when the
// machine was busy, never in isolation. A longer budget costs nothing: `findBy*` resolves as soon as
// the element appears, so passing tests are not slowed, only genuinely-missing elements wait longer
// before failing.
configure({ asyncUtilTimeout: 5000 });

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

// jsdom does not implement ResizeObserver; AdaptiveGrid and other components use it.
if (!global.ResizeObserver) {
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

// jsdom does not implement the PointerEvent constructor (a long-standing gap:
// https://github.com/jsdom/jsdom/issues/2527), so `fireEvent.pointerDown`/`pointerMove` fall back
// to a plain `Event` that drops `clientX`/`clientY`. Polyfill a minimal PointerEvent (MouseEvent
// already carries clientX/clientY) so pointer-drag handlers (ResizeEdge and friends) receive real
// coordinates in tests.
if (!window.PointerEvent) {
  class PointerEventPolyfill extends MouseEvent {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.PointerEvent = PointerEventPolyfill as any;
}

// jsdom does not implement DataTransfer or the DragEvent constructor (long-standing jsdom gaps:
// https://github.com/jsdom/jsdom/issues/1568 and .../2913), so tests that simulate a drop's
// geometry by constructing `new DragEvent(...)` directly (RTL's `fireEvent.drag*` helpers fall
// back to a plain `Event` here too, silently dropping `clientX`/`clientY` - same shape of gap as
// the PointerEvent one above) need both polyfilled.
if (!window.DataTransfer) {
  class DataTransferPolyfill {
    dropEffect = 'move';
    effectAllowed = 'all';
    private readonly store = new Map<string, string>();
    setData(format: string, data: string) {
      this.store.set(format, data);
    }
    getData(format: string) {
      return this.store.get(format) ?? '';
    }
    clearData() {
      this.store.clear();
    }
    setDragImage() {}
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.DataTransfer = DataTransferPolyfill as any;
}

if (!window.DragEvent) {
  class DragEventPolyfill extends MouseEvent {
    dataTransfer: DataTransfer;
    constructor(type: string, eventInit: DragEventInit = {}) {
      super(type, eventInit);
      // A real dragstart event's `dataTransfer` is populated by the browser's own drag manager,
      // not by the DragEvent constructor - nothing here simulates that, so default one in
      // whenever the caller doesn't supply one. Without this, library drag-start handlers that
      // unconditionally call `event.dataTransfer.setData(...)` (as `useDraggable`'s does) crash
      // on a null/undefined dataTransfer.
      this.dataTransfer = eventInit.dataTransfer ?? new window.DataTransfer();
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.DragEvent = DragEventPolyfill as any;
}
