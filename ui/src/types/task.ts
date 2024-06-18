import { Project } from "./project";
import { RepeatInterval } from "./repeatInterval";

export type Priority = 0 | 1 | 2 | 3;

export type Task = {
  id: string;
  name: string;
  description: string | null;
  done: boolean;
  parent: Task | null;
  project: Project | null;
  labels: string[];
  priority: Priority;
  due: Date | null;
  repeat: RepeatInterval | null;
};

// A TaskFromBackend is a task from the backend, where `due` hasn't been converted yet.
export type TaskFromBackend = Omit<Task, "due"> & {
  due: string | null;
};

// A task as it is stored in the database, with parent and project stored as IDs instead
// of nested fields (and no attached ID).
export interface NewTask {
  name: string;
  description: string | null;
  done: boolean;
  parent_id: string | null;
  project_id: string | null;
  labels: string[];
  priority: Priority;
  due: Date | null;
  repeat: RepeatInterval | null;
}

export function taskAsNewTask(t: Task): NewTask {
  return {
    name: t.name,
    description: t.description,
    done: t.done,
    parent_id: t.parent?.id ?? null,
    project_id: t.project?.id ?? null,
    labels: t.labels,
    priority: t.priority,
    due: t.due,
    repeat: t.repeat,
  };
}
