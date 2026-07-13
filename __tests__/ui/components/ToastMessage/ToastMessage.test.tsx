import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ToastMessage } from '~/ui/components/ToastMessage/ToastMessage';

describe('ToastMessage', () => {
  it('renders the provided message text', () => {
    render(<ToastMessage message="Profile updated" type="success" />);

    expect(screen.getByText('Profile updated')).toBeInTheDocument();
  });

  it('renders the message when no type is provided', () => {
    render(<ToastMessage message="Something happened" />);

    expect(screen.getByText('Something happened')).toBeInTheDocument();
  });
});
