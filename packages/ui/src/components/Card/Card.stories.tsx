import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';
import { Button } from '../Button';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'elevated', 'flat'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader bordered>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>This is a card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            This is the card content. You can put any content here including text,
            images, forms, or other components.
          </p>
        </CardContent>
        <CardFooter bordered>
          <Button variant="primary">Action</Button>
          <Button variant="ghost">Cancel</Button>
        </CardFooter>
      </>
    ),
  },
};

export const Bordered: Story = {
  args: {
    variant: 'bordered',
    children: (
      <>
        <CardHeader>
          <CardTitle>Bordered Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This card has a thick border instead of a shadow.</p>
        </CardContent>
      </>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <>
        <CardHeader>
          <CardTitle>Elevated Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This card has a larger shadow for more prominence.</p>
        </CardContent>
      </>
    ),
  },
};

export const Flat: Story = {
  args: {
    variant: 'flat',
    children: (
      <>
        <CardHeader>
          <CardTitle>Flat Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This card has a flat background with no border or shadow.</p>
        </CardContent>
      </>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <div className="p-6">
        <CardTitle>No Padding Card</CardTitle>
        <p className="mt-2">
          This card has no default padding, so we add it manually where needed.
        </p>
      </div>
    ),
  },
};

export const WithForm: Story = {
  args: {
    children: (
      <>
        <CardHeader bordered>
          <CardTitle>Login Form</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter bordered>
          <Button variant="primary" fullWidth>
            Login
          </Button>
        </CardFooter>
      </>
    ),
  },
};

export const Dashboard: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4" style={{ width: '800px' }}>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle as="h4">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">1,234</div>
          <p className="text-sm text-success-600">+12% from last month</p>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle as="h4">Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">$45,678</div>
          <p className="text-sm text-success-600">+8% from last month</p>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle as="h4">Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">567</div>
          <p className="text-sm text-error-600">-3% from last month</p>
        </CardContent>
      </Card>
    </div>
  ),
};
