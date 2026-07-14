import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tooltip } from '~/components/ui/Tooltip/Tooltip';

const meta = {
  title: 'ui/components/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  args: {
    content: 'This is a tooltip',
    children: 'Hover over me',
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Right: Story = {
  args: { side: 'right' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Tooltip is disabled' },
};
