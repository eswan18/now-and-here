import type { Meta, StoryObj } from "@storybook/react";
import EditTaskView from "@/components/task/EditTaskView";
import { TaskWithoutId } from "@/types/task";

const meta = {
  title: "Components/Task/EditTaskView",
  component: EditTaskView,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EditTaskView>;
export default meta;
type Story = StoryObj<typeof meta>;

const emptyTask: TaskWithoutId = {
  name: "",
  description: "",
  priority: 0,
  due: null,
  done: false,
  parent: null,
  project: null,
  labels: [],
  repeat: null,
};

export const NewTask: Story = {
  args: {
    task: emptyTask,
    onSaveTask: () => {},
    title: "New Task",
  },
};

export const EditExistingTask: Story = {
  args: {
    task: {
      name: "Get groceries",
      description: "Remember the milk!",
      priority: 1,
      // yesterday
      due: new Date(Date.now() - 86400000),
      done: false,
      parent: null,
      project: { id: "1", name: "Chores", description: "", parent: null },
      labels: [],
      repeat: { kind: "daily", days: 1, at: "9:00:00" },
    },
    onSaveTask: () => {},
    title: "Edit Task",
  },
};

const longText =
  "This is a very long string name that will overflow the container.";

export const LongNameTask: Story = {
  args: {
    task: {
      ...emptyTask,
      name: [longText, longText, longText, longText, longText].join(" "),
    },
    onSaveTask: () => {},
  },
};

export const LongDescriptionTask: Story = {
  args: {
    task: {
      ...emptyTask,
      name: "Read the text below",
      description: [longText, longText, longText, longText, longText].join(" "),
    },
    onSaveTask: () => {},
  },
};
