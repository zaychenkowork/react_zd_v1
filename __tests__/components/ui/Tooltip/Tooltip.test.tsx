import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Tooltip } from '~/components/ui/Tooltip/Tooltip';

describe('Tooltip', () => {
  it('renders the trigger children', () => {
    render(
      <Tooltip content="Hint">
        <button>Trigger</button>
      </Tooltip>,
    );

    expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
  });

  it('shows the tooltip content when the trigger is hovered', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Helpful hint">
        <button>Trigger</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole('button', { name: 'Trigger' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Helpful hint',
    );
  });

  it('renders only the children and skips tooltip wiring when disabled', () => {
    render(
      <Tooltip content="Hint" disabled>
        <button>Trigger</button>
      </Tooltip>,
    );

    expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
    expect(screen.queryByText('Hint')).not.toBeInTheDocument();
  });
});
