import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Mail, Lock, Search, Eye } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    fullWidth: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    required: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
  },
};

export const Required: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    error: 'Please enter a valid email address',
    type: 'email',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    helperText: 'Must be at least 8 characters long',
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    leftIcon: <Mail className="w-5 h-5" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    rightIcon: <Eye className="w-5 h-5" />,
  },
};

export const Search: Story = {
  args: {
    placeholder: 'Search...',
    leftIcon: <Search className="w-5 h-5" />,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This is disabled',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width',
    placeholder: 'This input takes full width',
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export const LoginForm: Story = {
  render: () => (
    <div className="flex flex-col gap-4" style={{ width: '400px' }}>
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        leftIcon={<Mail className="w-5 h-5" />}
        fullWidth
      />
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        leftIcon={<Lock className="w-5 h-5" />}
        rightIcon={<Eye className="w-5 h-5" />}
        fullWidth
      />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4" style={{ width: '400px' }}>
      <Input label="Default" placeholder="Default state" />
      <Input label="With Value" value="Some text" />
      <Input label="Required" placeholder="Required field" required />
      <Input
        label="With Error"
        placeholder="Error state"
        error="This field is required"
      />
      <Input
        label="With Helper"
        placeholder="Helper text"
        helperText="This is some helpful text"
      />
      <Input label="Disabled" placeholder="Disabled state" disabled />
    </div>
  ),
};
