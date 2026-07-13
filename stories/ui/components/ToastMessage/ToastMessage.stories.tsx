import type { Meta, StoryObj } from '@storybook/react-vite';

import { ToastMessage } from '~/ui/components/ToastMessage/ToastMessage';

const meta = {
  title: 'ui/components/ToastMessage',
  component: ToastMessage,
  parameters: { layout: 'centered' },
  args: {
    message: 'Profile updated successfully',
  },
} satisfies Meta<typeof ToastMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};

export const Success: Story = {
  args: { type: 'success' },
};

export const ErrorVariant: Story = {
  args: { type: 'error', message: 'Something went wrong' },
};

export const Warning: Story = {
  args: { type: 'warning', message: 'Your session is about to expire' },
};
