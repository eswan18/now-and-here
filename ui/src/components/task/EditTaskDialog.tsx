import { useState } from "react";
import { Clock, FolderOpen, Pencil, Repeat } from "lucide-react";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Task, NewTask, Priority, taskAsNewTask } from "@/types/task";
import { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import PriorityBadge from "./priority_badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { repeatAsString } from "@/lib/repeat";
import { relativeTimeString } from "@/lib/time";
import PriorityPicker from "@/components/pickers/PriorityPicker";
import ProjectPicker from "@/components/pickers/ProjectPicker";
import { Button } from "../ui/button";
import { deepEqual } from "@/lib/utils";
import {
  DuePickerPopover,
  DuePickerPopoverContent,
  DuePickerPopoverTrigger,
} from "../pickers/DuePickerPopover";
import { PopoverContent } from "@radix-ui/react-popover";

export interface TaskDialogProps {
  task: Task;
  onUpdateTask: (updatedTask: NewTask) => Promise<void>;
}

export default function EditTaskDialog({
  task,
  onUpdateTask,
}: TaskDialogProps) {
  const [priorityPopoverOpen, setPriorityPopoverOpen] = useState(false);
  const [projectPopoverOpen, setProjectPopoverOpen] = useState(false);
  const [duePopoverOpen, setDuePopoverOpen] = useState(false);
  const [taskValues, setTaskValues] = useState(task);
  const isEdited = !deepEqual(taskValues, task);

  const handlePriorityPickerPopoverChange = (priority: Priority) => {
    setTaskValues({ ...taskValues, priority });
    setPriorityPopoverOpen(false);
  };

  const handleProjectPickerPopoverChange = (project: Project) => {
    setTaskValues({ ...taskValues, project });
    setProjectPopoverOpen(false);
  };

  const handleDuePickerChange = (due: Date | undefined) => {
    setTaskValues({ ...taskValues, due: due || null });
  };

  const saveTaskUpdates = () => {
    const newTask = taskAsNewTask(taskValues);
    onUpdateTask(newTask);
  };

  return (
    <DialogContent className="px-4 md:px-12 py-2 md:py-6 lg:max-w-2xl">
      <DialogHeader className="mb-4">
        <div className="flex flex-row justify-between items-center gap-3 mr-5">
          <div className="flex flex-row justify-start items-center text-gray-900 gap-3">
            <Pencil size={20} className="inline-block" />
            <h2 className="text-xl font-semibold inline">Edit Task</h2>
          </div>
        </div>
      </DialogHeader>
      <div className="flex flex-col justify-between items-start w-full gap-1">
        <h3 className="text-lg w-full border-b">{taskValues.name}</h3>
        {taskValues.description && (
          <div className="text-gray-400 text-sm">{taskValues.description}</div>
        )}
        <div className="flex flex-row flex-wrap items-center justify-start gap-2 mt-4 text-xs text-gray-400 font-semibold">
          <Popover
            open={projectPopoverOpen}
            onOpenChange={setProjectPopoverOpen}
          >
            <PopoverTrigger>
              {taskValues.project ? (
                <div className="flex flex-row justify-end items-center mr-4 text-gray-800">
                  <FolderOpen size={16} className="inline mr-2" />
                  {taskValues.project.name}
                </div>
              ) : (
                <div className="flex flex-row justify-end items-center mr-4 text-gray-400">
                  <FolderOpen size={16} className="inline mr-2" />
                  No project
                </div>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0">
              <ProjectPicker
                onChange={handleProjectPickerPopoverChange}
                defaultProjectId={taskValues.project?.id}
              />
            </PopoverContent>
          </Popover>
          <div className="flex flex-row justify-start items-center text-gray-400">
            <DuePickerPopover
              open={duePopoverOpen}
              onOpenChange={setDuePopoverOpen}
            >
              <DuePickerPopoverTrigger>
                {taskValues.due ? (
                  <HoverCard>
                    <HoverCardTrigger>
                      <Badge
                        variant="outline"
                        className="flex flex-row items-center text-orange-800"
                      >
                        <Clock size={16} className="inline-block mr-1" />
                        <p>{relativeTimeString(taskValues.due)}</p>
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-48">
                      <div className="flex flex-col items-center">
                        <p className="text-xs text-gray-400">Due:</p>
                        <p className="text-sm text-gray-800">
                          {new Date(taskValues.due).toLocaleString()}
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
              </DuePickerPopoverTrigger>
              <DuePickerPopoverContent
                selected={taskValues.due || undefined}
                onSelect={handleDuePickerChange}
              />
            </DuePickerPopover>
            {taskValues.repeat ? (
              <Badge
                variant="outline"
                className="flex flex-row items-center text-orange-800"
              >
                <Repeat size={16} className="inline-block mr-1" />
                <p>{repeatAsString(taskValues.repeat)}</p>
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
          <Popover
            open={priorityPopoverOpen}
            onOpenChange={setPriorityPopoverOpen}
          >
            <PopoverTrigger>
              <PriorityBadge priority={taskValues.priority} />
            </PopoverTrigger>
            <PopoverContent className="w-28 p-0">
              <PriorityPicker
                defaultPriority={taskValues.priority}
                onChange={handlePriorityPickerPopoverChange}
              />
            </PopoverContent>
          </Popover>
        </div>
        <DialogFooter className="mt-6 h-8 justify-end w-full">
          {isEdited && (
            <>
              <Button variant="destructive" size="sm" className="w-20">
                Discard
              </Button>
              <Button size="sm" className="w-20" onClick={saveTaskUpdates}>
                Save
              </Button>
            </>
          )}
        </DialogFooter>
      </div>
    </DialogContent>
  );
}
