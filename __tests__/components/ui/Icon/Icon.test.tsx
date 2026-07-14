import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Icon } from '~/components/ui/Icon/Icon';
import { Icons } from '~/components/ui/Icon/types';

describe('Icon', () => {
  it('renders the svg for the given icon type', () => {
    render(<Icon type={Icons.Search} />);

    expect(screen.getByTestId('icon-svg')).toBeInTheDocument();
  });

  it('calls onClick when the icon is clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Icon type={Icons.Chevron} onClick={handleClick} />);

    await user.click(screen.getByTestId('icon-svg'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
