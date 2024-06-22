import { useState } from "react";
import { CirclePlus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { TaskWithoutId } from "@/types/task";
import { Button } from "../ui/button";
import EditTaskDialog from "./EditTaskDialog";

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
      <DialogTrigger>
        <Button
          variant="outline"
          size="lg"
          className="flex flex-row items-center gap-3 px-3"
        >
          <CirclePlus size={24} />
          <span>New task</span>
        </Button>
      </DialogTrigger>
      <EditTaskDialog task={task} onSaveTask={handleCreateTask} />
    </Dialog>
  );
}
