import { Project } from './project';

export type Task = {
    id: string;
    name: string;
    description: string | null;
    due: Date | null;
    relative_due_date: string | null;
    done: boolean;
    priority: number;
    project: Project;
}