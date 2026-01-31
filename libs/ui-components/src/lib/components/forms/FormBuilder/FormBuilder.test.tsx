import { render, screen, fireEvent } from '@testing-library/react';
import { FormBuilder, useFormContext } from './FormBuilder';
import type { FormFieldConfig } from './types';

// Mock inputs used by FormBuilder's renderField to simple components
jest.mock('../../inputs/Input', () => ({
  Input: ({ value, onChange, onBlur, ...rest }: any) => (
    <input
      data-testid={rest['data-testid'] || 'input'}
      value={value ?? ''}
      onChange={(e) => onChange?.(e)}
      onBlur={onBlur}
      {...rest}
    />
  ),
}));

jest.mock('../../inputs/Textarea', () => ({
  Textarea: ({ value, onChange, onBlur, ...rest }: any) => (
    <textarea
      data-testid={rest['data-testid'] || 'textarea'}
      value={value ?? ''}
      onChange={(e) => onChange?.(e)}
      onBlur={onBlur}
      {...rest}
    />
  ),
}));

describe('FormBuilder', () => {
  it('throws when useFormContext used outside provider', () => {
    const Comp = () => {
      useFormContext();
      return null;
    };

    let error: any;
    try {
      render(<Comp />);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(String(error)).toContain('useFormContext must be used within FormBuilder');
  });

  it('child input updates form values and submit returns values', () => {
    const onSubmit = jest.fn();

    render(
      <FormBuilder onSubmit={onSubmit}>
        <input name="email" data-testid="email" />
        <input name="password" type="password" data-testid="password" />
      </FormBuilder>
    );

    const email = screen.getByTestId('email') as HTMLInputElement;
    const password = screen.getByTestId('password') as HTMLInputElement;

    fireEvent.change(email, { target: { value: 'a@b.com' } });
    fireEvent.change(password, { target: { value: 'secret' } });

    fireEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret' });
  });

  it('config mode renders field and submit works', () => {
    const onSubmit = jest.fn();

    const fields: FormFieldConfig[] = [
      { name: 'first', type: 'input', label: 'First' },
      { name: 'bio', type: 'textarea', label: 'Bio' },
    ];

    render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

    // Inputs are rendered by the mocked Input/Textarea components
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(1);

    // Set values
    const first = screen.getAllByRole('textbox')[0];
    fireEvent.change(first, { target: { value: 'Jane' } });

    fireEvent.click(screen.getByText('Submit'));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ first: 'Jane' }));
  });

  it('shows reset button and it resets form', () => {
    const onSubmit = jest.fn();
    render(
      <FormBuilder
        showResetButton
        resetButtonText="Clear"
        defaultValues={{ a: '' }}
        onSubmit={onSubmit}
      >
        <input name="a" data-testid="a" />
      </FormBuilder>
    );

    const a = screen.getByTestId('a') as HTMLInputElement;
    fireEvent.change(a, { target: { value: 'x' } });

    // Reset button should be present
    const reset = screen.getByText('Clear');
    expect(reset).toBeInTheDocument();

    fireEvent.click(reset);

    // After reset, value should be empty
    expect((screen.getByTestId('a') as HTMLInputElement).value).toBe('');
  });
});
