import { Project, ProjectTree } from "@/types/project";
import { extractErrorDetail, baseUrl } from "@/apiServices/common";

export async function getProject(projectId: string): Promise<Project> {
  const url = new URL(`/api/projects/${projectId}`, baseUrl());
  return await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then(async (res) => {
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

export async function getProjects(): Promise<Project[]> {
  const url = new URL("/api/projects", baseUrl());
  return await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then(async (res) => {
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

export function projectsAsTrees(projects: Project[]): ProjectTree[] {
  // Build a hash table of projects by ID.
  const projectsById: Map<string, ProjectTree> = new Map();
  projects.forEach((project) => {
    projectsById.set(project.id, { project, children: [] });
  });

  // Get a list of IDs in the map.
  const projectIds = Array.from(projectsById.keys());
  projectIds.forEach((projectId) => {
    const node = projectsById.get(projectId)!;
    const parentId = node.project.parent?.id;
    // Check if parent ID is defined. If so, add the project to the parent's children.
    if (parentId) {
      projectsById.get(parentId)!.children.push(node);
    }
  });

  const roots = Array.from(projectsById.values()).filter(
    (node) => !node.project.parent,
  );
  return roots;
}
