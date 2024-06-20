import { useState } from "react";
import { Clock, FolderOpen, Pencil, Repeat } from "lucide-react";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Task, NewTask, Priority, taskAsNewTask } from "@/types/task";
import { RepeatInterval } from "@/types/repeatInterval";
import { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import PriorityBadge from "./priority_badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { repeatAsString } from "@/lib/repeat";
import { relativeTimeString } from "@/lib/time";
import {
  PriorityPicker,
  ProjectPicker,
  DuePicker,
  RepeatIntervalPicker,
} from "@/components/common/pickers";
import { Button } from "@/components/ui/button";
import { deepEqual } from "@/lib/utils";
import EditableField from "@/components/common/EditableField";

export interface TaskDialogProps {
  task: Task;
  onUpdateTask: (updatedTask: NewTask) => Promise<void>;
}

export default function EditTaskDialog({
  task,
  onUpdateTask,
}: TaskDialogProps) {
  const [taskValues, setTaskValues] = useState(task);
  const isEdited = !deepEqual(taskValues, task);

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
        <EditableField
          value={taskValues.name}
          setValue={(name: string) => setTaskValues({ ...taskValues, name })}
          size="lg"
          className="border-b"
        />
        <EditableField
          value={taskValues.description || undefined}
          setValue={(desc: string | undefined) =>
            setTaskValues({ ...taskValues, description: desc || null })
          }
          defaultText="No description"
          size="sm"
          className="text-gray-400"
        />
        <div className="flex flex-row flex-wrap items-center justify-start gap-2 mt-4 text-xs text-gray-400 font-semibold px-2">
          <EditableProjectLabel
            project={taskValues.project}
            onChange={(project) => setTaskValues({ ...taskValues, project })}
          />
          <EditableDueDateLabel
            due={taskValues.due}
            onChange={(due) =>
              setTaskValues({ ...taskValues, due: due || null })
            }
          />
          <EditableRepeatLabel
            repeat={taskValues.repeat}
            onChange={(repeat) => setTaskValues({ ...taskValues, repeat })}
          />
          <EditablePriorityLabel
            priority={taskValues.priority}
            onChange={(priority) => setTaskValues({ ...taskValues, priority })}
          />
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

interface EditableProjectLabelProps {
  project?: Project | null;
  onChange: (project: Project | null) => void;
}

function EditableProjectLabel({
  project,
  onChange,
}: EditableProjectLabelProps) {
  const [open, setOpen] = useState(false);
  const handleProjectPickerPopoverChange = (project: Project) => {
    onChange(project);
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        {project ? (
          <div className="flex flex-row justify-end items-center mr-4 text-gray-800">
            <FolderOpen size={16} className="inline mr-2" />
            {project.name}
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
          defaultProjectId={project?.id}
        />
      </PopoverContent>
    </Popover>
  );
}

interface EditableDueDateLabelProps {
  due: Date | null;
  onChange: (due: Date | undefined) => void;
}

function EditableDueDateLabel({ due, onChange }: EditableDueDateLabelProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        {due ? (
          <HoverCard>
            <HoverCardTrigger>
              <Badge
                variant="outline"
                className="flex flex-row items-center text-orange-800 gap-1.5"
              >
                <Clock size={16} className="inline-block" />
                <p>{relativeTimeString(due)}</p>
              </Badge>
            </HoverCardTrigger>
            <HoverCardContent className="w-48">
              <div className="flex flex-col items-center">
                <p className="text-xs text-gray-400">Due:</p>
                <p className="text-sm text-gray-800">
                  {new Date(due).toLocaleString()}
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        ) : (
          <Badge
            variant="outline"
            className="flex flex-row items-center text-gray-400 gap-1.5"
          >
            <Clock size={16} className="inline-block" />
            <p className="text-xs">No due date</p>
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent>
        <DuePicker
          selected={due || undefined}
          onSelect={onChange}
          onCompleted={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

interface EditablePriorityLabelProps {
  priority: Priority;
  onChange: (priority: Priority) => void;
}

function EditablePriorityLabel({
  priority,
  onChange,
}: EditablePriorityLabelProps) {
  const [open, setOpen] = useState(false);
  const handlePriorityPickerPopoverChange = (priority: Priority) => {
    onChange(priority);
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <PriorityBadge priority={priority} />
      </PopoverTrigger>
      <PopoverContent className="w-28 p-0">
        <PriorityPicker
          defaultPriority={priority}
          onChange={handlePriorityPickerPopoverChange}
        />
      </PopoverContent>
    </Popover>
  );
}

interface EditableRepeatLabelProps {
  repeat: RepeatInterval | null;
  onChange: (repeat: RepeatInterval | null) => void;
}

function EditableRepeatLabel({ repeat, onChange }: EditableRepeatLabelProps) {
  const [open, setOpen] = useState(false);
  const textColor = repeat ? "text-orange-800" : "text-gray-400";
  const handleRepeatChange = (repeat: RepeatInterval | null) => {
    onChange(repeat);
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Badge
          variant="outline"
          className={`flex flex-row items-center gap-1.5 ${textColor}`}
        >
          <Repeat size={16} className="inline-block" />
          {repeat ? (
            <p>{repeatAsString(repeat)}</p>
          ) : (
            <p className="text-xs">No repeat</p>
          )}
        </Badge>
      </PopoverTrigger>
      <PopoverContent>
        <RepeatIntervalPicker
          value={repeat || undefined}
          onChange={handleRepeatChange}
        />
      </PopoverContent>
    </Popover>
  );
}
