import type { Meta, StoryObj } from '@storybook/react-vite';

import { SpinnerLoader } from '~/components/ui/Loaders/SpinnerLoader/SpinnerLoader';

const meta = {
  title: 'ui/components/Loaders/SpinnerLoader',
  component: SpinnerLoader,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof SpinnerLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 20, strokeWidth: 3 },
};

export const CustomColor: Story = {
  args: { color: 'var(--color-blue-500)' },
};
