import { ProjectTree, Project } from "../../types/project";
import ProjectCard from "./project_card";

export default function ProjectCardList({
  projects,
}: {
  projects: (ProjectTree | Project)[];
}) {
  return (
    <div className="flex flex-col">
      {projects.map((project) =>
        "id" in project ? (
          <ProjectCard key={project.id} project={project} />
        ) : (
          <ProjectCardTree key={project.project.id} projectTree={project} />
        ),
      )}
    </div>
  );
}

function ProjectCardTree({ projectTree }: { projectTree: ProjectTree }) {
  return (
    <>
      <ProjectCard project={projectTree.project} />
      <div className="ml-2 lg:ml-6 pl-4 border-l-2">
        <ProjectCardList projects={projectTree.children} />
      </div>
    </>
  );
}
