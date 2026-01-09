# Component Creation Guide

This guide explains how to create new components following the established patterns in the True Tech Team component library.

## Quick Start Checklist

When creating a new component, you'll need to create these files:

- [ ] `ComponentName.tsx` - Component implementation
- [ ] `ComponentName.module.scss` - Component styles
- [ ] `ComponentName.test.tsx` - Unit tests
- [ ] `ComponentName.stories.tsx` - Storybook documentation
- [ ] `index.ts` - Re-exports
- [ ] Update `libs/ui-components/src/lib/components/index.ts` to export the new component

## Step-by-Step: Creating a Component

### Step 1: Create Component Directory

```bash
mkdir libs/ui-components/src/lib/components/ComponentName
cd libs/ui-components/src/lib/components/ComponentName
```

### Step 2: Create Component Implementation

**File**: `ComponentName.tsx`

````typescript
import React, { forwardRef } from 'react';
import styles from './ComponentName.module.scss';

export interface ComponentNameProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the component
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline';

  /**
   * Size of the component
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the component is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Content to render inside the component
   */
  children?: React.ReactNode;

  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * ComponentName - Brief description of what this component does
 *
 * @example
 * ```tsx
 * <ComponentName variant="primary" size="md">
 *   Content
 * </ComponentName>
 * ```
 */
export const ComponentName = forwardRef<HTMLDivElement, ComponentNameProps>(
  (
    { variant = 'primary', size = 'md', disabled = false, children, className, ...restProps },
    ref
  ) => {
    // Build class names
    const componentClasses = [
      styles.componentName,
      styles[`componentName--${variant}`],
      styles[`componentName--${size}`],
      disabled && styles['componentName--disabled'],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={componentClasses} aria-disabled={disabled} {...restProps}>
        {children}
      </div>
    );
  }
);

ComponentName.displayName = 'ComponentName';
````

### Step 3: Create SCSS Module

**File**: `ComponentName.module.scss`

```scss
@import '../../styles/theme/variables';
@import '../../styles/mixins/spacing';

.componentName {
  // Base styles
  display: inline-flex;
  align-items: center;
  justify-content: center;

  // Use CSS variables for customization
  background-color: var(--componentName-bg, var(--theme-background-primary));
  color: var(--componentName-text, var(--theme-text-primary));
  border: var(--componentName-border-width, 1px) solid var(
      --componentName-border-color,
      var(--theme-border-primary)
    );
  border-radius: var(--componentName-radius, var(--radius-md));

  // Use spacing mixins
  @include px(4); // padding-left and padding-right
  @include py(2); // padding-top and padding-bottom

  // Transitions
  transition: all 150ms ease-in-out;

  // Hover state
  &:hover:not(.componentName--disabled) {
    --componentName-bg: var(--theme-background-secondary);
  }

  // Focus state
  &:focus-visible {
    outline: 2px solid var(--theme-primary);
    outline-offset: 2px;
  }
}

// Variant: primary
.componentName--primary {
  --componentName-bg: var(--theme-primary);
  --componentName-text: var(--theme-text-on-primary);
  --componentName-border-color: var(--theme-primary);
}

// Variant: secondary
.componentName--secondary {
  --componentName-bg: var(--theme-secondary);
  --componentName-text: var(--theme-text-on-secondary);
  --componentName-border-color: var(--theme-secondary);
}

// Variant: outline
.componentName--outline {
  --componentName-bg: transparent;
  --componentName-text: var(--theme-primary);
  --componentName-border-color: var(--theme-primary);
}

// Size: small
.componentName--sm {
  @include px(3);
  @include py(1.5);
  font-size: var(--font-size-sm);
  min-height: 32px;
}

// Size: medium (default)
.componentName--md {
  @include px(4);
  @include py(2);
  font-size: var(--font-size-base);
  min-height: 40px;
}

// Size: large
.componentName--lg {
  @include px(6);
  @include py(3);
  font-size: var(--font-size-lg);
  min-height: 48px;
}

// Disabled state
.componentName--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

### Step 4: Create Unit Tests

**File**: `ComponentName.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  describe('rendering', () => {
    it('should render with children', () => {
      render(<ComponentName>Test Content</ComponentName>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      render(<ComponentName className="custom-class">Content</ComponentName>);
      const component = screen.getByText('Content');
      expect(component).toHaveClass('custom-class');
    });

    it('should render with data-testid', () => {
      render(<ComponentName data-testid="custom-component">Content</ComponentName>);
      expect(screen.getByTestId('custom-component')).toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it.each(['primary', 'secondary', 'outline'] as const)('should render %s variant', (variant) => {
      render(<ComponentName variant={variant}>Content</ComponentName>);
      const component = screen.getByText('Content');
      expect(component).toHaveClass(`componentName--${variant}`);
    });
  });

  describe('sizes', () => {
    it.each(['sm', 'md', 'lg'] as const)('should render %s size', (size) => {
      render(<ComponentName size={size}>Content</ComponentName>);
      const component = screen.getByText('Content');
      expect(component).toHaveClass(`componentName--${size}`);
    });
  });

  describe('states', () => {
    it('should render disabled state', () => {
      render(<ComponentName disabled>Content</ComponentName>);
      const component = screen.getByText('Content');
      expect(component).toHaveClass('componentName--disabled');
      expect(component).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('interactions', () => {
    it('should handle click events', () => {
      const handleClick = jest.fn();
      render(<ComponentName onClick={handleClick}>Click me</ComponentName>);
      fireEvent.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger click when disabled', () => {
      const handleClick = jest.fn();
      render(
        <ComponentName onClick={handleClick} disabled>
          Click me
        </ComponentName>
      );
      fireEvent.click(screen.getByText('Click me'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have correct aria-label', () => {
      render(<ComponentName aria-label="Test label">Content</ComponentName>);
      expect(screen.getByLabelText('Test label')).toBeInTheDocument();
    });
  });

  describe('forwarded ref', () => {
    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<ComponentName ref={ref}>Content</ComponentName>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});
```

### Step 5: Create Storybook Stories

**File**: `ComponentName.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Brief description of the component and its primary use case.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
      description: 'Visual variant of the component',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the component',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: {
    children: 'Component Content',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <ComponentName variant="primary">Primary</ComponentName>
      <ComponentName variant="secondary">Secondary</ComponentName>
      <ComponentName variant="outline">Outline</ComponentName>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <ComponentName size="sm">Small</ComponentName>
      <ComponentName size="md">Medium</ComponentName>
      <ComponentName size="lg">Large</ComponentName>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Component',
  },
};

export const CustomStyling: Story = {
  render: () => (
    <ComponentName
      style={
        {
          '--componentName-bg': 'var(--color-purple-500)',
          '--componentName-text': 'var(--color-white)',
          '--componentName-radius': '20px',
        } as React.CSSProperties
      }
    >
      Custom Styled
    </ComponentName>
  ),
  parameters: {
    docs: {
      description: {
        story: 'You can customize the component using CSS variables.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    children: 'Click me!',
    onClick: () => alert('Clicked!'),
  },
};
```

### Step 6: Create Index File

**File**: `index.ts`

```typescript
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

### Step 7: Update Main Exports

**File**: `libs/ui-components/src/lib/components/index.ts`

Add your component to the exports:

```typescript
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

## Component Library Usage Best Practices

### Prefer Library Components Over Raw HTML Elements

**CRITICAL RULE**: Before using any raw HTML element (`<button>`, `<input>`, `<select>`, etc.), always check if a library component exists first.

#### ✅ DO: Use Library Components

```tsx
// ✅ GOOD: Use Button component
import { Button } from '../Button';

export const MyFeature = () => (
  <Button variant="primary" size="md" onClick={handleClick}>
    Click me
  </Button>
);

// ✅ GOOD: Use Input component
import { Input } from '../Input';

export const MyForm = () => (
  <Input
    label="Email"
    type="email"
    placeholder="enter@email.com"
    error={errors.email}
    errorMessage={errors.email?.message}
  />
);
```

#### ❌ DON'T: Use Raw HTML Elements

```tsx
// ❌ BAD: Using raw button when Button component exists
export const MyFeature = () => (
  <button className="my-button" onClick={handleClick}>
    Click me
  </button>
);

// ❌ BAD: Using raw input when Input component exists
export const MyForm = () => (
  <div>
    <label>Email</label>
    <input type="email" placeholder="enter@email.com" className="my-input" />
  </div>
);

// ❌ BAD: Creating custom button styles
export const IconButton = () => (
  <button className={styles.iconButton}>
    <span>×</span>
  </button>
);
```

### Why Use Library Components?

1. **Visual Consistency**: All buttons, inputs, and form elements maintain consistent styling across the application
2. **Theme Integration**: Library components automatically support light/dark themes and all CSS custom properties
3. **Accessibility Built-in**: Components include ARIA attributes, keyboard navigation, focus management, and screen reader support
4. **Type Safety**: TypeScript props provide autocomplete, validation, and inline documentation
5. **Centralized Maintenance**: Bug fixes and feature additions automatically benefit all component uses
6. **Rich Features**: Get validation, formatting, loading states, icons, and error handling for free
7. **Tested**: All library components have comprehensive unit and integration tests

### Available Library Components

Before creating custom elements, check this list:

**Form Components**:

- **Button** - Clickable actions (primary, secondary, ghost, outline variants)
- **Input** - Text input with validation, formatting, character counter, clear button
- **Select** - Dropdown selection with grouping and search
- **Textarea** - Multi-line text input with auto-resize
- **Checkbox** - Single checkbox or checkbox groups
- **Radio** / **RadioGroup** - Radio button groups
- **Toggle** - Switch/toggle component
- **NumberInput** - Number input with increment/decrement buttons
- **PhoneInput** - Phone number with country selector
- **DatePicker** - Date selection with calendar
- **DateRangePicker** - Date range selection
- **Slider** - Range slider
- **Rating** - Star rating component
- **TagInput** - Multi-tag input
- **FilePicker** - File upload
- **ColorPicker** - Color selection

**UI Components**:

- **Icon** - SVG icons from icon library
- **Dropdown** - Dropdown menus
- **Autocomplete** - Autocomplete inputs
- **Menu** - Navigation and context menus
- **Tooltip** - Hover tooltips
- **Popover** - Popover overlays
- **Portal** - Portal rendering

**Check the components directory for the complete and up-to-date list:**
`libs/ui-components/src/lib/components/`

### When Raw HTML is Acceptable

Only use raw HTML elements when:

1. **Creating a New Primitive Component**

   - You're building a new base component that will itself become part of the library
   - Example: Creating a new `Tabs` component requires raw `<button>` elements for tab triggers

2. **No Library Component Exists**

   - The element type doesn't have a library equivalent yet
   - Example: `<canvas>`, `<video>`, `<table>` elements

3. **Library Component Doesn't Fit**

   - Using the library component would add unnecessary complexity or break functionality
   - Example: A bare inline input within a complex custom component where Input's wrapper structure would break layout
   - **IMPORTANT**: This should be rare. Consult with team before choosing this path.

4. **Specialized Use Cases**
   - Highly specialized interactions where the library component's behavior conflicts
   - Example: Calendar day cells with complex hover states and range selection
   - **NOTE**: Even in these cases, consider extending the library component first

### Before Using Raw HTML - Ask These Questions

1. Does a library component exist for this element type? (Check the list above)
2. Have I reviewed the component's props to see if it supports my use case?
3. Can I use variant/size props to achieve the styling I need?
4. Can I extend the component with className for custom styling?
5. If the library component doesn't fit, should I enhance it instead of bypassing it?

### Common Patterns

#### Buttons with Icons

```tsx
// Use startIcon/endIcon props
<Button variant="primary" startIcon="check">
  Save Changes
</Button>
```

#### Form Inputs with Validation

```tsx
// Input component handles validation, errors, helper text
<Input
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  error={!!errors.username}
  errorMessage={errors.username?.message}
  helperText="Must be 3-20 characters"
  maxLength={20}
  showCounter
/>
```

#### Custom Styling

```tsx
// Extend with className, don't replace
<Button variant="primary" className={styles.customButton}>
  Custom Styled Button
</Button>
```

### Enforcement

When reviewing code:

- **Require justification** for any raw `<button>`, `<input>`, `<select>`, or `<textarea>` elements
- **Suggest library components** when raw HTML is used unnecessarily
- **Update components** to use library components when found during refactoring

### Migration Path

If you find existing code with raw HTML elements:

1. Identify the library component equivalent
2. Replace the raw element with the library component
3. Map props appropriately (variant, size, disabled, etc.)
4. Preserve all functionality and styling
5. Update tests to match new component structure
6. Verify accessibility is maintained or improved

## Component Patterns

### Using the Icon Component

```typescript
import { Icon } from '../Icon';

export const ComponentWithIcon = () => (
  <button>
    <Icon name="check" size={20} />
    <span>With Icon</span>
  </button>
);
```

### Using the Theme Hook

```typescript
import { useTheme } from '../../contexts/ThemeContext';

export const ThemedComponent = () => {
  const { mode, toggleMode } = useTheme();

  return (
    <div>
      Current theme: {mode}
      <button onClick={toggleMode}>Toggle</button>
    </div>
  );
};
```

### Compound Components Pattern

For complex components with multiple parts:

```typescript
// Card.tsx
export const Card = ({ children }) => <div className={styles.card}>{children}</div>;

export const CardHeader = ({ children }) => <div className={styles.cardHeader}>{children}</div>;

export const CardBody = ({ children }) => <div className={styles.cardBody}>{children}</div>;

export const CardFooter = ({ children }) => <div className={styles.cardFooter}>{children}</div>;

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Actions</CardFooter>
</Card>;
```

## SCSS Best Practices

### Use Spacing Mixins

```scss
@import '../../styles/mixins/spacing';

.component {
  @include px(4); // padding-left: 16px; padding-right: 16px;
  @include py(2); // padding-top: 8px; padding-bottom: 8px;
  @include m(3); // margin: 12px;
  @include mt(2); // margin-top: 8px;
}
```

### Use CSS Variables for Customization

```scss
.component {
  // Define CSS variables with defaults
  background: var(--component-bg, var(--theme-background-primary));
  color: var(--component-text, var(--theme-text-primary));
  padding: var(--component-padding, 16px);
}
```

This allows users to customize:

```tsx
<Component style={{ '--component-bg': '#ff0000' }} />
```

### Use Theme Variables

```scss
.component {
  // Good: Use theme variables
  color: var(--theme-text-primary);
  background: var(--theme-background-primary);

  // Bad: Hardcoded colors
  color: #333;
  background: #fff;
}
```

### BEM Naming Convention

```scss
.component {
  // Base styles

  &__element {
    // Element styles
  }

  &--modifier {
    // Modifier styles
  }
}
```

Example:

```scss
.button {
  // Base button

  &--primary {
    // Primary variant
  }

  &--disabled {
    // Disabled state
  }
}
```

## TypeScript Best Practices

### Extend HTML Element Props

```typescript
export interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  // Your custom props
  variant?: 'primary' | 'secondary';
}
```

This automatically includes: `className`, `style`, `onClick`, `aria-*`, `data-*`, etc.

### Use JSDoc Comments

```typescript
export interface ComponentProps {
  /**
   * Visual variant of the component
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary';

  /**
   * Custom class name to apply
   */
  className?: string;
}
```

### Export Props Type

Always export the props interface:

```typescript
export interface ComponentProps {
  // ...
}

export const Component: React.FC<ComponentProps> = (props) => {
  // ...
};
```

## Testing Best Practices

### Test Structure

Organize tests by concern:

```typescript
describe('ComponentName', () => {
  describe('rendering', () => {
    // Basic rendering tests
  });

  describe('variants', () => {
    // Variant tests
  });

  describe('interactions', () => {
    // Click, hover, etc.
  });

  describe('accessibility', () => {
    // A11y tests
  });
});
```

### Use Parameterized Tests

```typescript
it.each(['primary', 'secondary', 'outline'])('should render %s variant', (variant) => {
  render(<Component variant={variant} />);
  // assertions
});
```

### Test Accessibility

```typescript
it('should have correct aria-label', () => {
  render(<Component aria-label="Test" />);
  expect(screen.getByLabelText('Test')).toBeInTheDocument();
});

it('should be keyboard accessible', () => {
  render(<Component />);
  const element = screen.getByRole('button');
  element.focus();
  expect(element).toHaveFocus();
});
```

## Common Pitfalls to Avoid

### ❌ Don't Hardcode Colors

```scss
// Bad
.component {
  background: #ffffff;
  color: #000000;
}

// Good
.component {
  background: var(--theme-background-primary);
  color: var(--theme-text-primary);
}
```

### ❌ Don't Use Inline Styles for Layout

```tsx
// Bad
<div style={{ display: 'flex', gap: '16px' }}>

// Good
<div className="flex gap-4">
```

### ❌ Don't Forget forwardRef for DOM Components

```tsx
// Bad
export const Component = (props) => <div {...props} />;

// Good
export const Component = forwardRef<HTMLDivElement, Props>((props, ref) => (
  <div ref={ref} {...props} />
));
```

### ❌ Don't Skip Tests

Every component needs:

- Rendering tests
- Variant tests
- Interaction tests
- Accessibility tests

### ❌ Don't Skip Storybook Stories

Stories are essential for:

- Visual documentation
- Design review
- Manual testing
- Component catalog

## Next Steps

After creating your component:

1. Run tests: `nx test ui-components`
2. Check Storybook: `nx storybook ui-components`
3. Verify in dark mode using the theme switcher
4. Run build: `nx build ui-components`
5. Check bundle size impact

## Additional Resources

- [project-overview.md](./project-overview.md) - Project architecture
- [theme-guide.md](./theme-guide.md) - Theme system details
- [testing-guide.md](./testing-guide.md) - Testing patterns
- [Button component](../libs/ui-components/src/lib/components/Button) - Reference implementation
- [Icon component](../libs/ui-components/src/lib/components/Icon) - Another example

