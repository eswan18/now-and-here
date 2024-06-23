import { useState } from "react";
import { Clock, FolderOpen, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { relativeTimeString } from "@/lib/time";
import { Task } from "@/types/task";
import PriorityBadge from "./PriorityBadge";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import EditTaskView from "./EditTaskView";
import { repeatAsString } from "@/lib/repeat";

interface TaskCardProps {
  task: Task;
  onToggleCompletion: (taskId: string, completed: boolean) => void;
  onUpdateTask: (updatedTask: Task) => Promise<void>;
}

export default function TaskListItem({
  task,
  onToggleCompletion,
  onUpdateTask,
}: TaskCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleUpdateTask = async (updatedTask: Task) => {
    onUpdateTask(updatedTask).then(() => setEditDialogOpen(false));
  };

  return (
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <div className="grid grid-cols-[2rem_1fr] gap-3 mb-4">
        <div className="flex flex-row items-center justify-center">
          <Checkbox
            checked={task.done}
            onCheckedChange={() => onToggleCompletion(task.id, !task.done)}
            className="h-6 w-6 border-[1.5px] border-gray-400"
          />
        </div>
        <div className="flex flex-row justify-between items-center w-full gap-2">
          <DialogTrigger>
            <h3 className="text-lg">{task.name}</h3>
          </DialogTrigger>
          <DialogTrigger>
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
              {task.repeat && (
                <Badge
                  variant="outline"
                  className="flex flex-row items-center text-orange-800"
                >
                  <Repeat size={16} className="inline-block mr-1" />
                  <p>{repeatAsString(task.repeat)}</p>
                </Badge>
              )}
              <PriorityBadge priority={task.priority} />
            </div>
          </DialogTrigger>
        </div>
        <div></div>
        <div className="flex flex-row flex-wrap justify-between">
          <div className="text-gray-400 text-sm">{task.description}</div>
          <div className="text-sm text-gray-400 mr-1">
            {task.project && (
              <div className="flex flex-row justify-end items-center">
                <FolderOpen size={16} className="inline mr-2" />
                <Link to={`/projects/${task.project.id}`}>
                  {task.project.name}
                </Link>
              </div>
            )}
          </div>
        </div>
        <DialogContent className="max-w-2xl">
          <EditTaskView task={task} onSaveTask={handleUpdateTask} />
        </DialogContent>
      </div>
    </Dialog>
  );
}
