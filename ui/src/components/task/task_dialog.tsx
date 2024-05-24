import { Clock, FolderOpen } from "lucide-react";
import { DialogContent } from "@/components/ui/dialog";
import { Task } from "@/types/task";
import { relativeTimeString } from "@/lib/time";
import { Badge } from "@/components/ui/badge";
import { BigPriorityBadge } from "./priority_badge";
import { Checkbox } from "@/components/ui/checkbox";

export interface TaskDialogProps {
  task: Task;
  onToggleCompletion: (taskId: string, completed: boolean) => void;
}

export default function TaskDialog({
  task,
  onToggleCompletion,
}: TaskDialogProps) {
  return (
    <DialogContent className="px-4 md:px-12 py-2 md:py-6 lg:max-w-2xl">
      <div className="flex flex-col w-full justify-start items-start gap-8">
        <div className="flex flex-row flex-wrap justify-between items-start px-8 w-full gap-2">
          {/* Details section */}
          <BigPriorityBadge priority={task.priority} />
          {task.due ? (
            <div className="flex flex-col justify-start items-end gap-2">
              <Badge
                variant="outline"
                className="flex flex-row items-center text-orange-800 w-fit text-base"
              >
                <Clock size={16} className="inline-block mr-2" />
                <p>{relativeTimeString(new Date(task.due))}</p>
              </Badge>
              <p className="text-gray-400 text-xs">
                {new Date(task.due).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No due date</p>
          )}
        </div>
        <div className="flex flex-col justify-start items-start w-full gap-3">
          <div className="pl-12 flex flex-row justify-start items-center w-full gap-2 text-orange-700 text-sm font-semibold">
            <FolderOpen size={20} />
            {task.project && task.project.name}
          </div>
          <div className="flex flex-row justify-start items-center w-full pb-1 border-b border-b-gray-200 px-4 gap-2">
            <Checkbox
              checked={task.done}
              onCheckedChange={() => {
                onToggleCompletion(task.id, !task.done);
              }}
              className="h-6 w-6 mr-1.5 border-2 border-gray-300"
            />
            <h2 className="font-semibold text-xl">{task.name}</h2>
          </div>
          <div className="text-gray-400 text-base pl-14">
            {task.description}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
