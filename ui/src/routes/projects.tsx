import { useState } from 'react';
import { Project } from '../types/project';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  return <ProjectList projects={ projects }/>
}

function ProjectList({ projects }: { projects: Project[] }) {
  return <div>Project List</div>
}