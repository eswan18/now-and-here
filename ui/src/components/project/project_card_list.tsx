import { Project, ProjectWithChildren } from "../../types/project";
import ProjectCard from "./project_card";

export default function ProjectCardList({ projects }: { projects: (Project | ProjectWithChildren)[] }) {
  return (
    <>
      {projects.map((project) => (
        // Check if there's a children property. If so, render a ProjectCardWithChildCards component, otherwise render a ProjectCard component.
        'children' in project
          ? <ProjectCardWithChildCards key={project.id} project={project} />
          : <ProjectCard key={project.id} project={project} />
      ))}
    </>
  )
}

function ProjectCardWithChildCards({ project }: { project: ProjectWithChildren }) {
  return (
    <>
      <ProjectCard project={project} />
      <div className="ml-2 lg:ml-6 pl-2 border-l-2">
        <ProjectCardList projects={project.children} />
      </div>
    </>
  )
}