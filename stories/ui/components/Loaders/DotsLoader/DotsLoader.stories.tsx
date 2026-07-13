import type { Meta, StoryObj } from '@storybook/react-vite';

import { DotsLoader } from '~/ui/components/Loaders/DotsLoader/DotsLoader';

const meta = {
  title: 'ui/components/Loaders/DotsLoader',
  component: DotsLoader,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DotsLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Wide: Story = {
  args: { width: 100 },
};

export const CustomColor: Story = {
  args: { color: 'var(--color-green-500)' },
};
