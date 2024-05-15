import { Project, ProjectTree } from '@/types/project';
import { extractErrorDetail } from '@/apiServices/common';

export function getProject(projectId: string): Promise<Project> {
  const url = new URL(`/api/projects/${projectId}`, window.location.origin);
  return fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(async (res) => {
      if (!res.ok) {
        let errorMsg = res.statusText;
        const data = await res.json();
        const errorDetail = extractErrorDetail(data);
        if (errorDetail) {
          errorMsg += `\n\n"${errorDetail}"`;
        }
        throw new Error(errorMsg);
      }
      return res.json();
    });
}

export function getProjects(): Promise<Project[]> {
  const url = new URL('/api/projects', window.location.origin);
  return fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(async (res) => {
      if (!res.ok) {
        let errorMsg = res.statusText;
        const data = await res.json();
        const errorDetail = extractErrorDetail(data);
        if (errorDetail) {
          errorMsg += `\n\n"${errorDetail}"`;
        }
        throw new Error(errorMsg);
      }
      return res.json();
    });
}

export function getProjectsAsTrees(): Promise<ProjectTree[]> {
  return getProjects().then((projects) => {
    // Build a hash table of projects by ID.
    const projectsById: Map<string, ProjectTree> = new Map();
    projects.forEach((project) => {
      projectsById.set(project.id, {project, children: []});
    })

    // Get a list of IDs in the map.
    const projectIds = Array.from(projectsById.keys());
    projectIds.forEach((projectId) => {
      const node = projectsById.get(projectId)!;
      const parentId = node.project.parent?.id;
      // Check if parent ID is defined. If so, add the project to the parent's children.
      if (parentId) {
        projectsById.get(parentId)!.children.push(node);
      }
    })

    const roots = Array.from(projectsById.values()).filter((node) => !node.project.parent);
    return roots;
  })
}