import type { Meta, StoryObj } from "@storybook/react";
import PriorityBadge from "@/components/task/PriorityBadge";

const meta = {
  title: "Components/Task/PriorityBadge",
  component: PriorityBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PriorityBadge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Priority0Small: Story = {
  args: {
    priority: 0,
    size: "sm",
  },
};

export const Priority3Large: Story = {
  args: {
    priority: 3,
    size: "lg",
  },
};
