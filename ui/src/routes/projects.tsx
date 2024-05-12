import { useState, useEffect } from 'react';
import { useTitle } from "../contexts/TitleContext";

import { Project, ProjectWithChildren } from '../types/project';
import ProjectCardList from '../components/project/project_card_list';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const { setPageTitle, setHeaderTitle } = useTitle();
  const base_url = new URL(window.location.origin);
  // Remove the final slash if there is one.
  if (base_url.pathname.endsWith('/')) {
    base_url.pathname = base_url.pathname.slice(0, -1);
  }

  useEffect(() => {
    setPageTitle('All projects');
    setHeaderTitle('All projects');
    const suffix = `api/projects`;
    const url = new URL(suffix, base_url);
    fetch(url)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setProjects(data);
      });
  }, []);

  const projectTree = projectsAsTreeOfChildren(projects);
  return <ProjectCardList projects={projectTree} />
}

function projectsAsTreeOfChildren(projects: Project[]): ProjectWithChildren[] {
  // Build a hash table of projects by ID.
  const projectsById: Map<string, ProjectWithChildren> = new Map();
  projects.forEach((project) => {
    projectsById.set(project.id, { ...project, children: [] });
  })
  // Get a list of IDs in the map.
  const projectIds = Array.from(projectsById.keys());
  projectIds.forEach((projectId) => {
    const project = projectsById.get(projectId)!;
    const parentId = project.parent?.id;
    // Check if parent ID is defined. If so, add the project to the parent's children.
    if (parentId) {
      projectsById.get(parentId)!.children.push(project);
      projectsById.delete(project.id);
    }
  })

  // Return the projects that have no parent - all the other projects are now children of those.
  return Array.from(projectsById.values());
}