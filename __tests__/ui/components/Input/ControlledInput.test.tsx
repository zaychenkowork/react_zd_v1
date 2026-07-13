import { useForm } from 'react-hook-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ControlledInput } from '~/ui/components/Input/ControlledInput';

import type { LoginFormValues } from '~/schemas/loginSchema';
import { loginSchema } from '~/schemas/loginSchema';

import { zod4Resolver } from '~/utils/zod4Resolver';

function LoginForm() {
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zod4Resolver<LoginFormValues>(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <ControlledInput name="email" control={control} placeholder="Email" />
      <ControlledInput
        name="password"
        control={control}
        placeholder="Password"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

describe('ControlledInput', () => {
  it('updates the field value when the user types', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText('Email'), 'a');

    expect(screen.getByPlaceholderText('Email')).toHaveValue('a');
  });

  it('shows the translated validation error under each field when submitting an empty form', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    const errors = await screen.findAllByText('This field is required');
    expect(errors).toHaveLength(2);
  });

  it('clears the error once the field becomes valid and is resubmitted', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findAllByText('This field is required');

    await user.type(screen.getByPlaceholderText('Email'), 'test@mail.com');
    await user.type(screen.getByPlaceholderText('Password'), '12345678');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(
      screen.queryByText('This field is required'),
    ).not.toBeInTheDocument();
  });
});
