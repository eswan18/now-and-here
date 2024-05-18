import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskView } from "@/types/view";

export default function TaskViewCardList({ views }: { views: TaskView[] }) {
  return (
    <div className="flex flex-col">
      {views.map((view) => (
        <TaskViewCard key={view.name} view={view} />
      ))}
    </div>
  );
}
export function TaskViewCard({ view }: { view: TaskView }) {
  return (
    <Card className="my-1 lg:my-2">
      <CardHeader className="flex flex-row gap-4">
        <CardTitle>
          <a href={`/task_views/${view.name}`}>{view.name}</a>
        </CardTitle>
        <CardDescription className="text-base leading-none tracking-tight">
          {view.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
