import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SpinnerLoader } from '~/components/ui/Loaders/SpinnerLoader/SpinnerLoader';

describe('SpinnerLoader', () => {
  it('renders with the progressbar role', () => {
    render(<SpinnerLoader />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('applies the requested size as its width', () => {
    render(<SpinnerLoader size={32} />);

    expect(screen.getByRole('progressbar')).toHaveStyle({ width: '32px' });
  });
});
