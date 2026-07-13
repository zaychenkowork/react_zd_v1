import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import type { InputProps } from '~/ui/components/Input/Input';
import { Input } from '~/ui/components/Input/Input';
import { Icons } from '~/ui/icons/types';

// Input is a controlled component (value/setValue), so stories render this
// stateful wrapper instead of passing args straight through.
function InputWithState(args: InputProps) {
  const [value, setValue] = useState(args.value);
  return <Input {...args} value={value} setValue={setValue} />;
}

const meta = {
  title: 'ui/components/Input',
  component: Input,
  parameters: { layout: 'centered' },
  args: {
    title: 'Email',
    placeholder: 'you@example.com',
    value: '',
  },
  render: (args) => <InputWithState {...args} />,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLeftIcon: Story = {
  args: {
    decorationLeftIcon: Icons.Search,
    title: 'Search',
    placeholder: 'Search…',
  },
};

export const Secure: Story = {
  args: { variant: 'secure', title: 'Password', value: 'sup3rsecret' },
};

export const Search: Story = {
  args: { variant: 'search', title: undefined, placeholder: 'Search…' },
};

export const Fetching: Story = {
  args: { fetching: true, value: 'loading…' },
};

export const WithError: Story = {
  args: {
    value: 'not-an-email',
    errorText: 'Please enter a valid email address',
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'disabled value' },
};

export const ReadOnly: Story = {
  args: { editable: false, value: 'read-only value' },
};
