import { Clock, FolderOpen, Pencil, Repeat } from "lucide-react";
import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import PriorityBadge from "./priority_badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { repeatAsString } from "@/lib/repeat";
import { relativeTimeString } from "@/lib/time";

export interface TaskDialogProps {
  task: Task;
}

export default function EditTaskDialog({ task }: TaskDialogProps) {
  return (
    <DialogContent className="px-4 md:px-12 py-2 md:py-6 lg:max-w-2xl">
      <DialogHeader className="mb-4">
        <div className="flex flex-row justify-start items-center gap-3 text-gray-400">
          <Pencil size={20} className="inline-block" />
          <h2 className="text-xl font-semibold inline">Edit Task</h2>
        </div>
      </DialogHeader>
      <div className="flex flex-col justify-between items-start w-full gap-1">
        <h3 className="text-lg w-full border-b">{task.name}</h3>
        {task.description && (
          <div className="text-gray-400 text-sm">{task.description}</div>
        )}
        <div className="flex flex-row flex-wrap items-center justify-start gap-2 mt-4 text-xs text-gray-400 font-semibold">
          {task.project ? (
            <div className="flex flex-row justify-end items-center mr-4 text-gray-800">
              <FolderOpen size={16} className="inline mr-2" />
              {task.project.name}
            </div>
          ) : (
            <div className="flex flex-row justify-end items-center mr-4 text-gray-400">
              <FolderOpen size={16} className="inline mr-2" />
              No project
            </div>
          )}
          <div className="flex flex-row justify-start items-center text-gray-400">
            {task.due ? (
              <HoverCard>
                <HoverCardTrigger>
                  <Badge
                    variant="outline"
                    className="flex flex-row items-center text-orange-800"
                  >
                    <Clock size={16} className="inline-block mr-1" />
                    <p>{relativeTimeString(task.due)}</p>
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
              <Badge
                variant="outline"
                className="flex flex-row items-center text-gray-400"
              >
                <Clock size={16} className="inline-block mr-1" />
                <p className="text-xs">No due date</p>
              </Badge>
            )}
            {task.repeat ? (
              <Badge
                variant="outline"
                className="flex flex-row items-center text-orange-800"
              >
                <Repeat size={16} className="inline-block mr-1" />
                <p>{repeatAsString(task.repeat)}</p>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="flex flex-row items-center text-gray-400"
              >
                <Repeat size={16} className="inline-block mr-1" />
                <p className="text-xs">No repeat</p>
              </Badge>
            )}
          </div>
          <PriorityBadge priority={task.priority} />
        </div>
      </div>
    </DialogContent>
  );
}
