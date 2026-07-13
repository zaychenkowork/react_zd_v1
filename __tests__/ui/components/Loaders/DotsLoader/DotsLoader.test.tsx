import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DotsLoader } from '~/ui/components/Loaders/DotsLoader/DotsLoader';

describe('DotsLoader', () => {
  it('renders with the progressbar role', () => {
    render(<DotsLoader />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('applies the requested width', () => {
    render(<DotsLoader width={80} />);

    expect(screen.getByRole('progressbar')).toHaveStyle({ width: '80px' });
  });
});
