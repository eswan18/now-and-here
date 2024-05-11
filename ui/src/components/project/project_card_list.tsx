import { Project } from "../../types/project";
import ProjectCard from "./project_card";

export default function ProjectCardList({ projects }: { projects: Project[] }) {
  return (
    <>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </>
  )
}