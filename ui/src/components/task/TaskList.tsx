import { Task, NewTask } from "../../types/task";
import TaskListItem from "./TaskListItem";

interface TaskListProps {
  tasks: Task[];
  onCompletionToggle: (taskId: string, completed: boolean) => void;
  onUpdateTask: (taskId: string, task: NewTask) => Promise<void>;
}

export default function TaskList({
  tasks,
  onCompletionToggle,
  onUpdateTask,
}: TaskListProps) {
  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskListItem
          key={task.id}
          task={task}
          onToggleCompletion={onCompletionToggle}
          onUpdateTask={async (updatedTask) =>
            onUpdateTask(task.id, updatedTask)
          }
        />
      ))}
    </div>
  );
}
