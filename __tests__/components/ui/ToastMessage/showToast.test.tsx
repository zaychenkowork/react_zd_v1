import type { ReactElement } from 'react';
import { toast } from 'react-toastify';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { showToast } from '~/components/ui/ToastMessage/showToast';

vi.mock('react-toastify', () => ({
  toast: vi.fn(),
}));

const mockedToast = vi.mocked(toast);

describe('showToast', () => {
  beforeEach(() => {
    mockedToast.mockClear();
  });

  it('passes the variant through to react-toastify options', () => {
    showToast('Saved', 'success');

    expect(mockedToast).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ type: 'success' }),
    );
  });

  it('defaults to the info variant and merges extra options', () => {
    showToast('Heads up', undefined, { autoClose: 1000 });

    expect(mockedToast).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ type: 'info', autoClose: 1000 }),
    );
  });

  it('renders a ToastMessage with the given message', () => {
    showToast('Profile updated', 'success');

    const renderContent = mockedToast.mock.calls[0][0] as () => ReactElement;
    render(renderContent());

    expect(screen.getByText('Profile updated')).toBeInTheDocument();
  });
});
