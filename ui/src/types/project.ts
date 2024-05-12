export type Project = {
    id: string;
    name: string;
    description: string | null;
    parent: Project | null;
}