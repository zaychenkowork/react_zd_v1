import type { Meta, StoryObj } from '@storybook/react-vite';

import { Icon } from '~/components/ui/Icon/Icon';
import { Icons } from '~/components/ui/Icon/types';

const meta = {
  title: 'ui/icons/Icon',
  component: Icon,
  parameters: { layout: 'centered' },
  argTypes: {
    // `options` are the real Icons enum values already — `mapping` would
    // translate them again and break the `IconsMap[type]` lookup, so the
    // control uses `labels` (display-only) instead.
    type: {
      options: [Icons.Chevron, Icons.Search],
      control: {
        type: 'select',
        labels: { [Icons.Chevron]: 'Chevron', [Icons.Search]: 'Search' },
      },
    },
  },
  args: {
    type: Icons.Chevron,
    size: 24,
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Chevron: Story = {
  args: { type: Icons.Chevron },
};

export const Search: Story = {
  args: { type: Icons.Search },
};

export const Large: Story = {
  args: { type: Icons.Search, size: 48 },
};

export const CustomColor: Story = {
  args: { type: Icons.Chevron, strokeColor: 'var(--color-blue-500)' },
};
