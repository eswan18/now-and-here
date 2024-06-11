import { Task } from "../../types/task";
import TaskListItem from "./TaskListItem";

interface TaskCardListProps {
  tasks: Task[];
  onCompletionToggle: (taskId: string, completed: boolean) => void;
}

export default function TaskCardList({
  tasks,
  onCompletionToggle,
}: TaskCardListProps) {
  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskListItem
          key={task.id}
          task={task}
          onToggleCompletion={onCompletionToggle}
        />
      ))}
    </div>
  );
}
