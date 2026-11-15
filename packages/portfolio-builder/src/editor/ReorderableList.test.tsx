import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReorderableList, type ReorderMove } from './ReorderableList';

interface Thing {
  id: string;
  label: string;
}

const things: Thing[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Bravo' },
  { id: 'c', label: 'Charlie' },
];

/**
 * A real, stateful parent: the keyboard path is only meaningful if each keypress is applied and the
 * next one sees the result. Rows render a text input too, so keys typed inside a row are covered.
 */
function Harness({
  initial = things,
  onMove,
  onKeyDownAbove,
  blurOnMove = false,
}: {
  initial?: Thing[];
  onMove?: (move: ReorderMove) => void;
  onKeyDownAbove?: () => void;
  /** Browsers can drop focus when React re-inserts a moved node; jsdom never does. Simulate it. */
  blurOnMove?: boolean;
}) {
  const [items, setItems] = useState(initial);
  return (
    <div onKeyDown={onKeyDownAbove}>
      <ReorderableList
        items={items}
        label="Things"
        getId={(thing) => thing.id}
        getLabel={(thing) => thing.label}
        onReorder={(next, move) => {
          onMove?.(move);
          if (blurOnMove) {
            (document.activeElement as HTMLElement | null)?.blur();
          }
          setItems(next);
        }}
        renderItem={(thing, { handle }) => (
          <div data-testid={`row-${thing.id}`} data-thing={thing.id}>
            {handle}
            <span>{thing.label}</span>
            <input aria-label={`Note for ${thing.label}`} />
          </div>
        )}
      />
    </div>
  );
}

function handleFor(label: string): HTMLElement {
  return screen.getByRole('button', { name: new RegExp(`^Reorder ${label},`) });
}

/** Row ids in the order they currently appear in the DOM. */
function order(): string[] {
  // Scoped to the list: a pointer drag leaves the library's drag-image clone on <body> until the
  // next animation frame, and that clone carries a copy of the handle.
  return within(screen.getByRole('list', { name: 'Things' }))
    .getAllByRole('button', { name: /^Reorder / })
    .map((handle) => handle.closest('[data-thing]')?.getAttribute('data-thing') ?? '?');
}

function liveRegion(): HTMLElement {
  return screen.getByRole('status');
}

async function pickUp(user: ReturnType<typeof userEvent.setup>, label: string, key = ' ') {
  const handle = handleFor(label);
  handle.focus();
  await user.keyboard(key);
  return handle;
}

describe('ReorderableList handle', () => {
  it('names the row and its position, so identical labels stay distinguishable', () => {
    render(
      <Harness
        initial={[
          { id: 'x', label: 'Gallery' },
          { id: 'y', label: 'Gallery' },
        ]}
      />
    );
    expect(
      screen.getByRole('button', { name: 'Reorder Gallery, position 1 of 2' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Reorder Gallery, position 2 of 2' })
    ).toBeInTheDocument();
  });

  it('is reachable by Tab and the rows themselves are not extra tab stops', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.tab();
    expect(handleFor('Alpha')).toHaveFocus();
    for (const row of document.querySelectorAll('[data-sortable-id]')) {
      expect(row).toHaveAttribute('tabindex', '-1');
    }
  });

  it('describes the keys it responds to', () => {
    render(<Harness />);
    const describedBy = handleFor('Alpha').getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(describedBy)).toHaveTextContent(/arrow keys to move/i);
  });
});

describe('ReorderableList keyboard', () => {
  it('Space picks up and a second Space drops; aria-pressed (not aria-grabbed) reports it', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const handle = await pickUp(user, 'Alpha');
    expect(handle).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard(' ');
    expect(handle).toHaveAttribute('aria-pressed', 'false');
  });

  it("keeps the library's own picked-up state in step, by calling its handler first", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const row = (): Element | null => document.querySelector('[data-sortable-id="a"]');
    await pickUp(user, 'Alpha');
    expect(row()).toHaveAttribute('data-dragging', 'true');
    await user.keyboard('{Escape}');
    expect(row()).toHaveAttribute('data-dragging', 'false');
    await user.keyboard(' ');
    expect(row()).toHaveAttribute('data-dragging', 'true');
    await user.keyboard(' ');
    expect(row()).toHaveAttribute('data-dragging', 'false');
  });

  it('Enter picks up and drops as well', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const handle = await pickUp(user, 'Alpha', '{Enter}');
    expect(handle).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard('{Enter}');
    expect(handle).toHaveAttribute('aria-pressed', 'false');
  });

  it('ArrowDown moves the picked-up row one place and keeps focus on its handle', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await pickUp(user, 'Alpha');
    await user.keyboard('{ArrowDown}');
    expect(order()).toEqual(['b', 'a', 'c']);
    expect(document.activeElement).toBe(handleFor('Alpha'));
    expect(handleFor('Alpha')).toHaveAccessibleName('Reorder Alpha, position 2 of 3');
  });

  it('puts focus back on the handle when the move itself dropped it, and stays picked up', async () => {
    const user = userEvent.setup();
    render(<Harness blurOnMove />);
    const handle = await pickUp(user, 'Alpha');
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(handleFor('Alpha'));
    // The blur the move caused must not have been mistaken for the user tabbing away.
    expect(handle).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard('{ArrowDown}');
    expect(order()).toEqual(['b', 'c', 'a']);
  });

  it('ArrowUp moves the picked-up row one place and keeps focus on its handle', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await pickUp(user, 'Charlie');
    await user.keyboard('{ArrowUp}');
    expect(order()).toEqual(['a', 'c', 'b']);
    expect(document.activeElement).toBe(handleFor('Charlie'));
  });

  it('keeps moving one place per press, from where the row is now', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await pickUp(user, 'Alpha');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(order()).toEqual(['b', 'c', 'a']);
    expect(document.activeElement).toBe(handleFor('Alpha'));
    await user.keyboard('{ArrowUp}');
    expect(order()).toEqual(['b', 'a', 'c']);
  });

  it('reports each move once, with the id and the indices', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);
    await pickUp(user, 'Alpha');
    await user.keyboard('{ArrowDown}');
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalledWith({ id: 'a', from: 0, to: 1 });
  });

  it('does not move past either end', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);
    await pickUp(user, 'Alpha');
    await user.keyboard('{ArrowUp}');
    expect(order()).toEqual(['a', 'b', 'c']);
    expect(onMove).not.toHaveBeenCalled();
    expect(liveRegion()).toHaveTextContent('Alpha is already first.');
  });

  it('does nothing on an arrow key when the row has not been picked up', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);
    handleFor('Alpha').focus();
    await user.keyboard('{ArrowDown}');
    expect(order()).toEqual(['a', 'b', 'c']);
    expect(onMove).not.toHaveBeenCalled();
  });

  it('stops moving once dropped', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await pickUp(user, 'Alpha');
    await user.keyboard('{ArrowDown} {ArrowDown}');
    expect(order()).toEqual(['b', 'a', 'c']);
  });

  it('moves the row once per key, not twice (the library handler must not also see the arrow)', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);
    await pickUp(user, 'Alpha');
    await user.keyboard('{ArrowDown}');
    await user.keyboard(' ');
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(order()).toEqual(['b', 'a', 'c']);
  });

  it('Escape puts the row back where it was picked up', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await pickUp(user, 'Alpha');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(order()).toEqual(['b', 'c', 'a']);
    await user.keyboard('{Escape}');
    expect(order()).toEqual(['a', 'b', 'c']);
    expect(handleFor('Alpha')).toHaveAttribute('aria-pressed', 'false');
    expect(document.activeElement).toBe(handleFor('Alpha'));
  });

  it('Escape with no move made changes nothing and reports nothing', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);
    await pickUp(user, 'Bravo');
    await user.keyboard('{Escape}');
    expect(order()).toEqual(['a', 'b', 'c']);
    expect(onMove).not.toHaveBeenCalled();
  });

  it('keeps Escape for itself while picked up, and lets it through otherwise', async () => {
    const user = userEvent.setup();
    const above = vi.fn();
    render(<Harness onKeyDownAbove={above} />);
    handleFor('Alpha').focus();
    await user.keyboard('{Escape}');
    expect(above).toHaveBeenCalledTimes(1);
    above.mockClear();
    await user.keyboard(' ');
    above.mockClear();
    await user.keyboard('{Escape}');
    expect(above).not.toHaveBeenCalled();
  });

  it('drops the row where it is when focus leaves the handle', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const handle = await pickUp(user, 'Alpha');
    await user.keyboard('{ArrowDown}');
    await user.tab();
    expect(handle).toHaveAttribute('aria-pressed', 'false');
    expect(order()).toEqual(['b', 'a', 'c']);
  });

  it('does not treat keys typed inside a row as reorder keys', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const note = screen.getByLabelText('Note for Alpha');
    await user.click(note);
    await user.keyboard('hello world{Enter}');
    expect(note).toHaveValue('hello world');
    expect(handleFor('Alpha')).toHaveAttribute('aria-pressed', 'false');
    expect(order()).toEqual(['a', 'b', 'c']);
  });

  // Review Focus 4: the right row moves, by identity rather than by what it is called.
  it('moves the right row when two rows share a label', async () => {
    const user = userEvent.setup();
    render(
      <Harness
        initial={[
          { id: 'x', label: 'Same' },
          { id: 'y', label: 'Same' },
          { id: 'z', label: 'Same' },
        ]}
      />
    );
    const second = screen.getByRole('button', { name: 'Reorder Same, position 2 of 3' });
    second.focus();
    await user.keyboard(' {ArrowUp}');
    expect(order()).toEqual(['y', 'x', 'z']);
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Reorder Same, position 1 of 3' })
    );
  });
});

describe('ReorderableList live region', () => {
  it('is a polite status region', () => {
    render(<Harness />);
    expect(liveRegion()).toHaveAttribute('aria-live', 'polite');
  });

  it('announces pick-up, each move, and the drop', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await pickUp(user, 'Alpha');
    expect(liveRegion()).toHaveTextContent('Alpha picked up, position 1 of 3.');
    await user.keyboard('{ArrowDown}');
    expect(liveRegion()).toHaveTextContent('Alpha moved to position 2 of 3.');
    await user.keyboard('{ArrowDown}');
    expect(liveRegion()).toHaveTextContent('Alpha moved to position 3 of 3.');
    await user.keyboard(' ');
    expect(liveRegion()).toHaveTextContent('Alpha dropped, position 3 of 3.');
  });

  it('announces a cancel and where the row went back to', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await pickUp(user, 'Alpha');
    await user.keyboard('{ArrowDown}{Escape}');
    expect(liveRegion()).toHaveTextContent('Move cancelled. Alpha returned to position 1 of 3.');
  });
});

describe('ReorderableList pointer drag', () => {
  it('reports one reorder, to the dropped position, via the library drag events', () => {
    const onMove = vi.fn();
    render(<Harness onMove={onMove} />);
    const handle = handleFor('Alpha');
    const target = screen.getByTestId('row-c').parentElement as HTMLElement;
    fireEvent.dragStart(handle);
    fireEvent.dragEnter(target);
    fireEvent.dragEnd(handle);
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalledWith({ id: 'a', from: 0, to: 2 });
    expect(order()).toEqual(['b', 'c', 'a']);
  });
});
