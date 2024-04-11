import { Project } from './project';

export type Task = {
    id: string;
    name: string;
    description: string | null;
    due: string | null;
    relative_due_date: string | null;
    done: boolean;
    priority: string;
    project: Project;
}