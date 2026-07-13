import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '~/ui/components/Button/Button';

describe('Button', () => {
  it('renders the label when label is provided', () => {
    render(<Button label="Click me" />);

    expect(
      screen.getByRole('button', { name: 'Click me' }),
    ).toBeInTheDocument();
  });

  it('is disabled when disabled is true', () => {
    render(<Button label="Disabled" disabled />);

    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });

  it('shows a spinner and hides the label when loading is true', () => {
    render(<Button label="Loading" loading />);

    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('is disabled when loading is true', () => {
    render(<Button label="Loading" loading />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick once when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button label="Click me" onClick={handleClick} />);

    await user.click(screen.getByRole('button', { name: 'Click me' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button label="Click me" onClick={handleClick} disabled />);

    await user.click(screen.getByRole('button', { name: 'Click me' }));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
