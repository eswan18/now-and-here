import { useState, useEffect } from 'react';
import { useTitle } from "../contexts/TitleContext";

import { ProjectTree } from '../types/project';
import ProjectCardList from '../components/project/project_card_list';
import { getProjectsAsTrees } from '@/apiServices/project';

export default function Projects() {
  const [projectTrees, setProjectTrees] = useState<ProjectTree[]>([]);
  const { setPageTitle, setHeaderTitle } = useTitle();
  const base_url = new URL(window.location.origin);
  // Remove the final slash if there is one.
  if (base_url.pathname.endsWith('/')) {
    base_url.pathname = base_url.pathname.slice(0, -1);
  }

  useEffect(() => {
    setPageTitle('All projects');
    setHeaderTitle('All projects');
    getProjectsAsTrees().then((trees) => { setProjectTrees(trees); });
  }, []);

  return (
    <div className='mt-4 lg:mt-8'>
      <ProjectCardList projects={projectTrees} />
    </div>
  );
}