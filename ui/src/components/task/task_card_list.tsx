import { Task } from "../../types/task";
import TaskCard from "./task_card";

interface TaskCardListProps {
  tasks: Task[];
  onCompletionToggle: (taskId: string, completed: boolean) => void;
}

export default function TaskCardList({ tasks, onCompletionToggle }: TaskCardListProps) {
  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onToggleCompletion={onCompletionToggle} />
      ))}
    </div>
  )
}