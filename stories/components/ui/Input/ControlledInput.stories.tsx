import { useForm } from 'react-hook-form';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ControlledInput } from '~/components/ui/Input/ControlledInput';

import type { LoginFormValues } from '~/schemas/loginSchema';
import { loginSchema } from '~/schemas/loginSchema';

import { zod4Resolver } from '~/utils/zod4Resolver';

/**
 * ControlledInput needs a react-hook-form `control`, so the story wraps it in
 * a minimal form using the same schema + zod4Resolver as
 * __tests__/ui/components/Input/ControlledInput.test.tsx — see docs/forms.md.
 */
function LoginForm() {
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zod4Resolver<LoginFormValues>(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form
      onSubmit={handleSubmit(() => {})}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 280 }}
    >
      <ControlledInput
        name="email"
        control={control}
        title="Email"
        placeholder="you@example.com"
      />
      <ControlledInput
        name="password"
        control={control}
        title="Password"
        variant="secure"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

const meta = {
  title: 'ui/components/Input/ControlledInput',
  component: LoginForm,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
