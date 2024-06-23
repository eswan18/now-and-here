import { useState } from "react";
import { CirclePlus } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { TaskWithoutId } from "@/types/task";
import EditTaskView from "./EditTaskView";

type PartialTask = {
  [K in keyof TaskWithoutId]?: TaskWithoutId[K];
};

const defaults: TaskWithoutId = {
  name: "",
  description: null,
  priority: 0,
  due: null,
  project: null,
  done: false,
  labels: [],
  repeat: null,
  parent: null,
};

interface CreateTaskButtonProps {
  taskValues: PartialTask;
  onAddTask: (newTask: TaskWithoutId) => void;
}

export default function CreateTaskButton({
  taskValues,
  onAddTask,
}: CreateTaskButtonProps) {
  const [open, setOpen] = useState(false);
  const handleCreateTask = (newTask: TaskWithoutId) => {
    onAddTask(newTask);
    setOpen(false);
  };
  const task = { ...defaults, ...taskValues };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex flex-row items-center gap-3.5 px-0.5 w-36 text-gray-400">
        <CirclePlus size={28} strokeWidth={1.5} className="text-gray-400" />
        <span>New task</span>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <EditTaskView
          task={task}
          onSaveTask={handleCreateTask}
          title="New Task"
        />
      </DialogContent>
    </Dialog>
  );
}
