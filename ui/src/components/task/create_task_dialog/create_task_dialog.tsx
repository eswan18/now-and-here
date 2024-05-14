import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateTaskForm, { TaskDefaults } from "./create_task_form";
import { NewTask } from '@/types/task';


interface CreateTaskModalProps {
  onCreateTask: (task: NewTask) => void; // Function to call when a new task is created
  defaults?: TaskDefaults;
}

export default function CreateTaskModal({ onCreateTask, defaults }: CreateTaskModalProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          <h2>Create Task</h2>
        </DialogTitle>
        <DialogDescription>
          Set up your new task
        </DialogDescription>
      </DialogHeader>
      <CreateTaskForm onCreateTask={onCreateTask} defaults={defaults} />
    </DialogContent>
  )
}