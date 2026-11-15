import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { iconRegistry } from '@true-tech-team/react-components';
import { IconField } from './IconField';

// NOTE on query choices — verified against the real rendered markup (see task-5-report.md):
// - `Select`'s closed trigger is a `<div role="button" id={id} aria-label={label}>`, not a
//   native <select> and not `role="combobox"`. Its dropdown is a portal-rendered
//   `<div data-component="popover">` (no `role` attribute) containing `<ul role="menu">
//   <li role="menuitem">`, not `role="listbox"`/`role="option"`.
// - The popover starts `visibility: hidden` and only becomes visible after two nested
//   `requestAnimationFrame` callbacks resolve (real positioning logic), so the menu must be
//   awaited with `findByRole` rather than queried synchronously after the click.
// - Because each option's label renders an `<Icon>` (role="img", aria-label=<name>) followed by
//   the same name as visible text, the ARIA *accessible name* of a menuitem is the name
//   duplicated (e.g. "star star") — so `getByRole('menuitem', { name: /^star$/ })` never matches.
//   That duplication only affects the ARIA-computed name, not `.textContent` (which stays just
//   "star"), so picking a specific item uses the public `role="menuitem"` contract plus a
//   `.textContent` filter instead of an internal, undocumented `data-testid` convention.
describe('IconField', () => {
  it("offers every icon name from the library's iconRegistry as an option", async () => {
    render(<IconField value="" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Icon' }));
    const menu = await screen.findByRole('menu');
    const optionNames = within(menu)
      .getAllByRole('menuitem')
      .map((option) => option.textContent);
    for (const name of Object.keys(iconRegistry)) {
      expect(optionNames.some((text) => text?.includes(name))).toBe(true);
    }
  });

  it('calls onChange with the selected icon name', async () => {
    const onChange = vi.fn();
    render(<IconField value="" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Icon' }));
    const menu = await screen.findByRole('menu');
    const items = within(menu).getAllByRole('menuitem');
    const starItem = items.find((item) => item.textContent === 'star');
    fireEvent.click(starItem!);
    expect(onChange).toHaveBeenCalledWith('star');
  });

  it('seeds the selected value from the value prop', () => {
    render(<IconField value="heart" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Icon' })).toHaveTextContent('heart');
  });
});
