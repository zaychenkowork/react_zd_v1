import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Skeleton } from '~/ui/components/Skeleton/Skeleton';

describe('Skeleton', () => {
  it('hides the children and renders a placeholder when loading is true', () => {
    render(
      <Skeleton loading>
        <span>Content</span>
      </Skeleton>,
    );

    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders the children when loading is false', () => {
    render(
      <Skeleton loading={false}>
        <span>Content</span>
      </Skeleton>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
