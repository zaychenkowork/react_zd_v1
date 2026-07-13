import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ModalCore } from '~/ui/components/ModalCore/ModalCore';

describe('ModalCore', () => {
  it('renders title and description when isOpen is true', () => {
    render(
      <ModalCore
        isOpen
        setOpen={vi.fn()}
        title="Confirm action"
        description="Are you sure?"
      />,
    );

    expect(screen.getByText('Confirm action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('does not render the title text when isOpen is false', () => {
    render(
      <ModalCore isOpen={false} setOpen={vi.fn()} title="Confirm action" />,
    );

    expect(screen.queryByText('Confirm action')).not.toBeInTheDocument();
  });

  it('calls confirmAction when the confirm button is clicked', () => {
    const confirmAction = vi.fn();
    render(
      <ModalCore
        isOpen
        setOpen={vi.fn()}
        confirmAction={confirmAction}
        confirmText="Save"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(confirmAction).toHaveBeenCalledTimes(1);
  });

  it('calls cancelAction when the cancel button is clicked', () => {
    const cancelAction = vi.fn();
    render(
      <ModalCore
        isOpen
        setOpen={vi.fn()}
        cancelAction={cancelAction}
        cancelText="Dismiss"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(cancelAction).toHaveBeenCalledTimes(1);
  });

  it('calls setOpen(false) when the close button is clicked', () => {
    const setOpen = vi.fn();
    render(
      <ModalCore
        isOpen
        setOpen={setOpen}
        title="Confirm action"
        hasCloseButton
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('does not render a close button when hasCloseButton is false', () => {
    render(
      <ModalCore
        isOpen
        setOpen={vi.fn()}
        title="Confirm action"
        hasCloseButton={false}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument();
  });

  it('calls setOpen(false) when Escape is pressed', () => {
    const setOpen = vi.fn();
    render(<ModalCore isOpen setOpen={setOpen} title="Confirm action" />);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(setOpen).toHaveBeenCalledWith(false);
  });
});
