export interface Project {
  id: string;
  name: string;
  description: string | null;
  parent: Project | null;
}

export interface ProjectWithChildren extends Project {
  children: ProjectWithChildren[];
}

export interface ProjectTree {
  project: Project;
  children: ProjectTree[];
}
