import { useState } from "react";
import { CirclePlus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import CreateTaskDialog from "./create_task_dialog/create_task_dialog";
import { TaskDefaults } from "@/components/task/create_task_dialog/create_task_form";
import { NewTask } from "@/types/task";
import { Button } from "../ui/button";

interface CreateTaskButtonProps {
  onAddTask: (newTask: NewTask) => void;
  taskDefaults: TaskDefaults;
}

export default function CreateTaskButton({
  taskDefaults,
  onAddTask,
}: CreateTaskButtonProps) {
  const [open, setOpen] = useState(false);
  const handleCreateTask = (newTask: NewTask) => {
    onAddTask(newTask);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant={"outline"} size="sm" className="flex flex-row items-center gap-3 ">
          <CirclePlus size={18} />
          <span>New task</span>
        </Button>
      </DialogTrigger>
      <CreateTaskDialog
        onCreateTask={handleCreateTask}
        defaults={taskDefaults}
      />
    </Dialog>
  );
}
