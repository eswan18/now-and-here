import { Clock, Ellipsis, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Checkbox } from "@/components/ui/checkbox";
import { relativeTimeString } from "@/lib/time";
import { Task } from "@/types/task";
import PriorityBadge from "./priority_badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import TaskDialog from "./task_dialog";

interface TaskCardProps {
  task: Task;
  onToggleCompletion: (taskId: string, completed: boolean) => void;
}

export default function TaskListItem({
  task,
  onToggleCompletion,
}: TaskCardProps) {
  return (
    <Dialog>
      <div className="grid grid-cols-[2rem_1fr] gap-2 mb-4">
        <div className="flex flex-row items-center justify-center">
          <Checkbox
            checked={task.done}
            onCheckedChange={() => onToggleCompletion(task.id, !task.done)}
            className="h-6 w-6 mr-1.5 border-[1.5px] border-gray-400"
          />
        </div>
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex flex-row items-start justify-between gap-2">
            <DialogTrigger>
              <h3 className="text-lg">
                {task.name}
                <Ellipsis className="ml-2 inline text-gray-400" />
              </h3>
            </DialogTrigger>
          </div>
          <div className="flex flex-row items-center justify-end gap-2">
            {task.due ? (
              <HoverCard>
                <HoverCardTrigger>
                  <Badge
                    variant="outline"
                    className="flex flex-row items-center text-orange-800"
                  >
                    <Clock size={16} className="inline-block mr-1" />
                    <p>{relativeTimeString(new Date(task.due))}</p>
                  </Badge>
                </HoverCardTrigger>
                <HoverCardContent className="w-48">
                  <div className="flex flex-col items-center">
                    <p className="text-xs text-gray-400">Due:</p>
                    <p className="text-sm text-gray-800">
                      {new Date(task.due).toLocaleString()}
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <p className="text-gray-400 text-sm mr-2">No due date</p>
            )}
            <PriorityBadge priority={task.priority} />
          </div>
        </div>
        <div></div>
        <div className="flex flex-row flex-wrap justify-between">
          <div className="text-gray-400 text-sm">{task.description}</div>
          <div className="text-sm text-gray-400 mr-1">
            {task.project && (
              <div className="flex flex-row justify-end items-center">
                <FolderOpen size={16} className="inline mr-2" />
                <a href={`/projects/${task.project.id}`}>{task.project.name}</a>
              </div>
            )}
          </div>
        </div>
        <TaskDialog task={task} onToggleCompletion={onToggleCompletion} />
      </div>
    </Dialog>
  );
}
