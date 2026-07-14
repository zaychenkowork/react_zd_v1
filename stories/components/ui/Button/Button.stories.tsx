import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '~/components/ui/Button/Button';
import { Icons } from '~/components/ui/Icon/types';

const meta = {
  title: 'ui/components/Button',
  component: Button,
  parameters: { layout: 'centered' },
  args: {
    label: 'Continue',
    variant: 'primary',
    size: 'm',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Tertiary: Story = {
  args: { variant: 'tertiary' },
};

export const Danger: Story = {
  args: { variant: 'danger', label: 'Delete account' },
};

export const WithIcon: Story = {
  args: { icon: Icons.Search, iconPosition: 'left' },
};

export const IconOnly: Story = {
  args: { label: undefined, icon: Icons.Chevron },
};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
