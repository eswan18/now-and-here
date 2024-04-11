import { Task } from "../../types/task";
import TaskCard from "./task_card";

export default function TaskCardList({ tasks }: { tasks: Task[] }) {
  return (
    <>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </>
  )
}