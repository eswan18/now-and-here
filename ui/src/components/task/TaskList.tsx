import { Task } from "../../types/task";
import TaskListItem from "./TaskListItem";

interface TaskListProps {
  tasks: Task[];
  onCompletionToggle: (taskId: string, completed: boolean) => void;
  onUpdateTask: (task: Task) => Promise<void>;
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
          onUpdateTask={(updatedTask) => onUpdateTask(updatedTask)}
        />
      ))}
    </div>
  );
}
