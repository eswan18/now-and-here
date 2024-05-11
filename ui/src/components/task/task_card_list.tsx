import { Task } from "../../types/task";
import TaskCard from "./task_card";

interface TaskCardListProps {
  tasks: Task[];
  onCompletionToggle: (taskId: string, completed: boolean) => void;
}

export default function TaskCardList({ tasks, onCompletionToggle }: TaskCardListProps) {
  return (
    <>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onToggleCompletion={onCompletionToggle} />
      ))}
    </>
  )
}