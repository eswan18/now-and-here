import { Project } from "../../types/project";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <>
      <div className="rounded my-2 p-4 flex flex-col items-center bg-white shadow-sm">
        <div className="flex flex-row justify-start items-end w-full px-4 gap-4">
          <h3 className="font-semibold text-lg leading-none"><a href={`/projects/${project.id}`}>{project.name}</a></h3>
          <div className="text-base text-gray-400 leading-none">
            {project.description}
          </div>
        </div>
      </div>
    </>
  )
}