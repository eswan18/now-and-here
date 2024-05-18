import { Project } from "./project";

export type Task = {
  id: string;
  name: string;
  description: string | null;
  done: boolean;
  parent: Task | null;
  project: Project | null;
  labels: string[];
  priority: number;
  due: Date | null;
  repeat: string | null;
};

// A task as it is stored in the database, with parent and project stored as IDs instead
// of nested fields.
export type NewTask = {
  name: string;
  description: string | null;
  done: boolean;
  parent_id: string | null;
  project_id: string | null;
  labels: string[];
  priority: number;
  due: Date | null;
  repeat: string | null;
};
