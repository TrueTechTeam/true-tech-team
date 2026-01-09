# Testing Guide

This guide covers testing patterns and best practices for the True Tech Team component library.

## Testing Stack

- **Jest**: Test runner and assertion library
- **Testing Library**: React component testing utilities
- **jsdom**: Browser environment simulation
- **jest-dom**: Custom matchers for DOM testing

## Test File Organization

Tests are co-located with components:

```
Button/
├── Button.tsx
├── Button.module.scss
├── Button.test.tsx       ← Test file
├── Button.stories.tsx
└── index.ts
```

## Running Tests

```bash
# Run all tests
nx test ui-components

# Run tests in watch mode
nx test ui-components --watch

# Run tests with coverage
nx test ui-components --coverage

# Run specific test file
nx test ui-components --testFile=Button.test.tsx

# Update snapshots
nx test ui-components --updateSnapshot
```

## Test Structure

### Basic Template

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  describe('rendering', () => {
    it('should render with children', () => {
      render(<Component>Test Content</Component>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    // Variant tests
  });

  describe('interactions', () => {
    // Click, hover, keyboard tests
  });

  describe('accessibility', () => {
    // A11y tests
  });
});
```

### Organize by Concern

Group tests by what they're testing:

- **rendering**: Basic rendering, props, conditional rendering
- **variants**: Different visual variants
- **sizes**: Size variations
- **states**: Disabled, loading, error, etc.
- **interactions**: Clicks, hovers, keyboard navigation
- **accessibility**: ARIA attributes, roles, keyboard support
- **error handling**: Invalid inputs, edge cases

## Testing Patterns

### 1. Rendering Tests

Test that components render correctly:

```typescript
describe('rendering', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(<Button className="custom">Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom');
  });

  it('should render with data-testid', () => {
    render(<Button data-testid="my-button">Button</Button>);
    expect(screen.getByTestId('my-button')).toBeInTheDocument();
  });

  it('should not render when condition is false', () => {
    const { container } = render(<div>{false && <Button>Hidden</Button>}</div>);
    expect(container.querySelector('button')).not.toBeInTheDocument();
  });
});
```

### 2. Variant Tests

Use parameterized tests for variants:

```typescript
describe('variants', () => {
  it.each(['primary', 'secondary', 'outline', 'ghost'] as const)(
    'should render %s variant',
    (variant) => {
      render(<Button variant={variant}>Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(`button--${variant}`);
    }
  );
});

describe('sizes', () => {
  it.each(['sm', 'md', 'lg'] as const)('should render %s size', (size) => {
    render(<Button size={size}>Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass(`button--${size}`);
  });
});
```

### 3. Interaction Tests

Test user interactions:

```typescript
describe('interactions', () => {
  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not trigger click when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click
      </Button>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should handle keyboard events', () => {
    const handleKeyDown = jest.fn();
    render(<Input onKeyDown={handleKeyDown} />);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: 'Enter' }));
  });

  it('should handle hover states', () => {
    render(<Button>Hover me</Button>);
    const button = screen.getByRole('button');

    fireEvent.mouseEnter(button);
    // Assert hover state if applicable

    fireEvent.mouseLeave(button);
    // Assert non-hover state
  });
});
```

### 4. Accessibility Tests

Test ARIA attributes and keyboard support:

```typescript
describe('accessibility', () => {
  it('should have correct role', () => {
    render(<Button>Button</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should have correct aria-label', () => {
    render(<Button aria-label="Close dialog">X</Button>);
    expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should have aria-disabled attribute', () => {
    render(<Button disabled>Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('should be keyboard accessible', () => {
    render(<Button>Button</Button>);
    const button = screen.getByRole('button');

    button.focus();
    expect(button).toHaveFocus();
  });

  it('should have aria-describedby when error exists', () => {
    render(
      <div>
        <Input aria-describedby="error-msg" />
        <span id="error-msg">Error message</span>
      </div>
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'error-msg');
  });
});
```

### 5. State Tests

Test different component states:

```typescript
describe('states', () => {
  it('should render disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('button--disabled');
    expect(button).toBeDisabled();
  });

  it('should render loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toHaveClass('button--loading');
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner
  });

  it('should render error state', () => {
    render(<Input error="Invalid input" />);
    expect(screen.getByRole('textbox')).toHaveClass('input--error');
    expect(screen.getByText('Invalid input')).toBeInTheDocument();
  });

  it('should render active state', () => {
    render(<Button active>Active</Button>);
    expect(screen.getByRole('button')).toHaveClass('button--active');
  });
});
```

### 6. Props Tests

Test prop combinations:

```typescript
describe('props', () => {
  it('should apply custom style', () => {
    render(<Button style={{ width: '200px' }}>Button</Button>);
    expect(screen.getByRole('button')).toHaveStyle({ width: '200px' });
  });

  it('should forward additional props', () => {
    render(
      <Button type="submit" name="submitBtn">
        Submit
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('name', 'submitBtn');
  });

  it('should merge className prop', () => {
    render(<Button className="custom">Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('button'); // Base class
    expect(button).toHaveClass('custom'); // Custom class
  });
});
```

### 7. Icon Tests

Test components with icons:

```typescript
import { Icon } from '../Icon';

describe('icons', () => {
  it('should render with start icon', () => {
    render(<Button startIcon={<Icon name="check" />}>Save</Button>);
    expect(screen.getByTestId('icon-check')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should render with end icon', () => {
    render(<Button endIcon={<Icon name="chevron-right" />}>Next</Button>);
    expect(screen.getByTestId('icon-chevron-right')).toBeInTheDocument();
  });
});
```

### 8. Error Handling Tests

Test error scenarios:

```typescript
describe('error handling', () => {
  it('should warn for invalid icon name', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { container } = render(<Icon name={'invalid' as any} />);

    expect(consoleWarnSpy).toHaveBeenCalledWith('Icon "invalid" not found in registry');
    expect(container.firstChild).toBeNull();

    consoleWarnSpy.mockRestore();
  });

  it('should throw error when used outside provider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleErrorSpy.mockRestore();
  });
});
```

### 9. Ref Forwarding Tests

Test ref forwarding:

```typescript
describe('ref forwarding', () => {
  it('should forward ref to button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Button</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.tagName).toBe('BUTTON');
  });

  it('should allow ref methods', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);

    ref.current?.focus();
    expect(ref.current).toHaveFocus();
  });
});
```

### 10. Theme Integration Tests

Test components in different themes:

```typescript
import { ThemeProvider } from '../../contexts/ThemeContext';

describe('theme integration', () => {
  it('should apply light theme', () => {
    render(
      <ThemeProvider defaultMode="light">
        <Button>Button</Button>
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should apply dark theme', () => {
    render(
      <ThemeProvider defaultMode="dark">
        <Button>Button</Button>
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should toggle theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    });

    expect(result.current.mode).toBe('light');

    act(() => {
      result.current.toggleMode();
    });

    expect(result.current.mode).toBe('dark');
  });
});
```

## Testing Hooks

Use `renderHook` from Testing Library:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';
import { ThemeProvider } from './ThemeProvider';

describe('useTheme', () => {
  it('should return theme context', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    });

    expect(result.current.mode).toBe('light');
    expect(typeof result.current.setMode).toBe('function');
    expect(typeof result.current.toggleMode).toBe('function');
  });

  it('should update mode', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    });

    act(() => {
      result.current.setMode('dark');
    });

    expect(result.current.mode).toBe('dark');
  });

  it('should throw when used outside provider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleErrorSpy.mockRestore();
  });
});
```

## Testing Context

```typescript
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

describe('ThemeContext', () => {
  it('should provide default theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    });

    expect(result.current.mode).toBe('light');
  });

  it('should apply theme to document', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    act(() => {
      result.current.setMode('dark');
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
```

## Custom Matchers

Jest-dom provides useful matchers:

```typescript
// Element presence
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).not.toBeInTheDocument();

// Element state
expect(element).toBeDisabled();
expect(element).toBeEnabled();
expect(element).toHaveFocus();
expect(element).toBeChecked();

// Attributes
expect(element).toHaveAttribute('type', 'submit');
expect(element).toHaveClass('button', 'button--primary');
expect(element).toHaveStyle({ color: 'red' });

// Text content
expect(element).toHaveTextContent('Hello');
expect(element).toContainHTML('<span>Hello</span>');

// Form elements
expect(input).toHaveValue('text');
expect(input).toHaveDisplayValue('Text');

// Accessibility
expect(element).toHaveAccessibleName('Close');
expect(element).toHaveAccessibleDescription('Closes the modal');
```

## Query Priority

Use queries in this order (most to least preferred):

1. **Accessible queries** (best for users and assistive tech):

   - `getByRole`
   - `getByLabelText`
   - `getByPlaceholderText`
   - `getByText`

2. **Semantic queries**:

   - `getByAltText`
   - `getByTitle`

3. **Test IDs** (last resort):
   - `getByTestId`

```typescript
// ✅ Good: Use role
const button = screen.getByRole('button', { name: /submit/i });

// ✅ Good: Use label
const input = screen.getByLabelText('Username');

// ✅ Good: Use text
const heading = screen.getByText('Welcome');

// ⚠️ OK: Use test ID when necessary
const custom = screen.getByTestId('custom-component');

// ❌ Bad: Query by class or tag
const button = container.querySelector('.button');
```

## Async Testing

Test asynchronous behavior:

```typescript
import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';

describe('async behavior', () => {
  it('should show loading state then content', async () => {
    render(<AsyncComponent />);

    // Initially shows loading
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Wait for content to appear
    await waitFor(() => {
      expect(screen.getByText('Loaded content')).toBeInTheDocument();
    });

    // Loading should be gone
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should remove element after delay', async () => {
    render(<ToastNotification />);

    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();

    // Wait for toast to disappear
    await waitForElementToBeRemoved(toast, { timeout: 3000 });
  });

  it('should handle API calls', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      json: async () => ({ data: 'test' }),
    });
    global.fetch = mockFetch;

    render(<DataComponent />);

    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
```

## Mocking

### Mock Modules

```typescript
// Mock SCSS modules
jest.mock('./Component.module.scss', () => ({
  component: 'component',
  'component--primary': 'component--primary',
}));

// Mock SVG imports
jest.mock('../assets/icon.svg?react', () => ({
  __esModule: true,
  default: () => <svg data-testid="mock-svg" />,
}));
```

### Mock Functions

```typescript
const mockCallback = jest.fn();

render(<Component onClick={mockCallback} />);

fireEvent.click(screen.getByRole('button'));

expect(mockCallback).toHaveBeenCalledTimes(1);
expect(mockCallback).toHaveBeenCalledWith(expect.any(Object));

// Reset mock
mockCallback.mockClear();

// Mock return value
mockCallback.mockReturnValue('value');

// Mock implementation
mockCallback.mockImplementation((arg) => arg * 2);
```

### Mock timers

```typescript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

it('should debounce input', () => {
  const onChange = jest.fn();
  render(<DebouncedInput onChange={onChange} delay={500} />);

  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'test' } });

  // Shouldn't call immediately
  expect(onChange).not.toHaveBeenCalled();

  // Fast-forward time
  jest.advanceTimersByTime(500);

  expect(onChange).toHaveBeenCalledWith('test');
});
```

## Coverage Requirements

Minimum coverage thresholds (configured in [jest.config.ts](../libs/ui-components/jest.config.ts)):

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### View Coverage Report

```bash
nx test ui-components --coverage
```

Coverage report is generated in `coverage/` directory.

Open `coverage/lcov-report/index.html` in a browser to see detailed report.

## Common Testing Mistakes

### ❌ Testing Implementation Details

```typescript
// Bad: Testing internal state
expect(component.state.count).toBe(5);

// Good: Testing user-visible behavior
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

### ❌ Using Container Query

```typescript
// Bad: Querying by class
const button = container.querySelector('.button');

// Good: Querying by role
const button = screen.getByRole('button');
```

### ❌ Not Cleaning Up

```typescript
// Bad: Spy not cleaned up
const spy = jest.spyOn(console, 'warn').mockImplementation();
// ... test code

// Good: Clean up in afterEach or inline
const spy = jest.spyOn(console, 'warn').mockImplementation();
// ... test code
spy.mockRestore();
```

### ❌ Testing Too Much in One Test

```typescript
// Bad: Testing multiple things
it('should do everything', () => {
  // 50 lines of test code
});

// Good: Focused tests
it('should render correctly', () => {
  // ...
});

it('should handle click', () => {
  // ...
});
```

## Best Practices

### ✅ DO: Write Tests First (TDD)

1. Write failing test
2. Implement feature
3. Test passes
4. Refactor

### ✅ DO: Test User Behavior

Test what users see and do, not implementation details.

### ✅ DO: Use Descriptive Test Names

```typescript
// Good
it('should display error message when email is invalid', () => {});

// Bad
it('works', () => {});
```

### ✅ DO: Arrange-Act-Assert

```typescript
it('should increment counter on button click', () => {
  // Arrange: Set up test
  render(<Counter />);
  const button = screen.getByRole('button', { name: /increment/i });

  // Act: Perform action
  fireEvent.click(button);

  // Assert: Verify result
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### ✅ DO: Test Edge Cases

```typescript
it('should handle empty children', () => {
  render(<Component />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('should handle very long text', () => {
  const longText = 'a'.repeat(1000);
  render(<Component>{longText}</Component>);
  expect(screen.getByText(longText)).toBeInTheDocument();
});
```

### ✅ DO: Use Test Setup and Teardown

```typescript
describe('Component', () => {
  let mockFn: jest.Mock;

  beforeEach(() => {
    mockFn = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('test 1', () => {
    // Use mockFn
  });

  it('test 2', () => {
    // Use mockFn (fresh mock)
  });
});
```

## Debugging Tests

### Debug Output

```typescript
import { screen, render } from '@testing-library/react';

render(<Component />);

// Print current DOM
screen.debug();

// Print specific element
screen.debug(screen.getByRole('button'));

// Print with options
screen.debug(undefined, 300000); // Increase max length
```

### Check What Queries Are Available

```typescript
render(<Component />);

// Shows all available roles and accessible names
screen.logTestingPlaygroundURL();

// Or manually check
console.log(screen.getByRole('button').outerHTML);
```

### VSCode Jest Extension

Install "Jest" extension for VSCode:

- Run tests from editor
- See coverage inline
- Debug with breakpoints

## Additional Resources

- [project-overview.md](./project-overview.md) - Project architecture
- [component-guide.md](./component-guide.md) - Creating components
- [theme-guide.md](./theme-guide.md) - Theme system
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Common Testing Library Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

