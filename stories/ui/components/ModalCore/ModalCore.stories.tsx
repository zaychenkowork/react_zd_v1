import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '~/ui/components/Button/Button';
import type { ModalCoreProps } from '~/ui/components/ModalCore/ModalCore';
import { ModalCore } from '~/ui/components/ModalCore/ModalCore';

// ModalCore is parent-owned (isOpen/setOpen), so every story renders a
// trigger button + local state instead of controlling `isOpen` via args.
function ModalCoreWithTrigger(
  args: Omit<ModalCoreProps, 'isOpen' | 'setOpen'>,
) {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Button label="Open modal" onClick={() => setOpen(true)} />
      <ModalCore {...args} isOpen={isOpen} setOpen={setOpen} />
    </>
  );
}

const meta = {
  title: 'ui/components/ModalCore',
  component: ModalCoreWithTrigger,
  parameters: { layout: 'centered' },
  args: {
    title: 'Delete account',
    description: 'This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
  },
} satisfies Meta<typeof ModalCoreWithTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    confirmAction: () => {},
    cancelAction: () => {},
  },
};

export const Loading: Story = {
  args: {
    confirmAction: () => {},
    cancelAction: () => {},
    loading: true,
  },
};

export const WithoutActions: Story = {
  args: {
    title: 'Heads up',
    description: 'Informational modal with only a close button.',
  },
};

export const NoCloseButton: Story = {
  args: {
    confirmAction: () => {},
    hasCloseButton: false,
  },
};
