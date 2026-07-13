import type { Meta, StoryObj } from '@storybook/react-vite';

import { Skeleton } from '~/ui/components/Skeleton/Skeleton';

const meta = {
  title: 'ui/components/Skeleton',
  component: Skeleton,
  parameters: { layout: 'centered' },
  args: {
    loading: true,
    width: '240px',
    height: '20px',
    radius: '4px',
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {};

export const Loaded: Story = {
  args: {
    loading: false,
    children: <p style={{ margin: 0 }}>Content is ready</p>,
  },
};

export const Circle: Story = {
  args: { width: '48px', height: '48px', radius: '50%' },
};
