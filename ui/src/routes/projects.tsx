import { useState, useEffect } from 'react';
import { useTitle } from "../contexts/TitleContext";

import { Project } from '../types/project';
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
  return <ProjectList projects={ projects }/>
}

function ProjectList({ projects }: { projects: Project[] }) {
  console.log(projects);
  return <ProjectCardList projects={ projects }/>
}