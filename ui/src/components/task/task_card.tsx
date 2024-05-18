import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { relativeTimeString } from "@/lib/time";
import { Task } from "@/types/task";
import PriorityBadge from "./priority_badge";

interface TaskCardProps {
  task: Task;
  onToggleCompletion: (taskId: string, completed: boolean) => void;
}

export default function TaskCard({ task, onToggleCompletion }: TaskCardProps) {
  return (
    <Card>
      <CardContent className="px-4 py-3">
        <div className="flex flex-row flex-wrap w-full justify-between pl-12 mb-1">
          <div className="text-sm font-semibold text-orange-700">
            {task.project && <a href={`/projects/${task.project.id}`}>{task.project.name}</a>}
          </div>
          <div className="">
            { /* fill this in later -- maybe labels go here? */}
          </div>
        </div>
        <div className="flex flex-row justify-between items-center w-full border-b border-b-gray-200">
          <div className="flex flex-row items-center justify-start gap-2 pl-4">
            <Checkbox checked={task.done} onCheckedChange={() => onToggleCompletion(task.id, !task.done)} className="h-5 w-5 mr-1.5 border border-gray-400" />
            <div className="flex flex-row items-center justify-start gap-4">
              <h3 className="font-semibold text-lg inline-block"><a href={`/tasks/${task.id}`}>{task.name}</a></h3>
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
          {task.due
            ? <HoverCard>
              <HoverCardTrigger>
                <Badge variant="outline" className="flex flex-row items-center text-orange-800">

                  <Clock size={16} className="inline-block mr-1" />
                  <p>{relativeTimeString(new Date(task.due))}</p>
                </Badge>
              </HoverCardTrigger>
              <HoverCardContent className="w-48">
                <div className="flex flex-col items-center">
                  <p className="text-xs text-gray-400">Due:</p>
                  <p className="text-sm text-gray-800">{new Date(task.due).toLocaleString()}</p>
                </div>
              </HoverCardContent>
            </HoverCard>
            : <p className="text-gray-400 text-sm mr-2">No due date</p>
          }
        </div>
        <div className="flex flex-row flex-wrap w-full justify-between pl-14 pt-1">
          <div className="text-gray-400 text-sm">
            {task.description}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}