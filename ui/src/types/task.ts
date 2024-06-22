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

export type TaskWithoutId = Omit<Task, "id">;

// A TaskFromBackend represents the format task comes in as from the backend, where
// `due` hasn't been converted yet.
export type TaskFromBackend = Omit<Task, "due"> & {
  due: string | null;
};

// A task as it is stored in the database, with parent and project stored as IDs instead
// of nested fields, and optionally no ID (for creating new tasks).
export type ShallowTask = {
  id: string;
  name: string;
  description: string | null;
  done: boolean;
  parent_id: string | null;
  project_id: string | null;
  labels: string[];
  priority: Priority;
  due: Date | null;
  repeat: RepeatInterval | null;
};

// A shallow task without an ID is what is sent to the backend when creating a new task.
export type ShallowTaskWithoutId = Omit<ShallowTask, "id">;

export function taskAsShallowTask(t: Task): ShallowTask {
  return {
    id: t.id,
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

export function taskWithoutIdAsShallowTask(
  t: TaskWithoutId,
): ShallowTaskWithoutId {
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
