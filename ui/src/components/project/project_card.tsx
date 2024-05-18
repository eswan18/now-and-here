import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Project } from "@/types/project";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="my-1 lg:my-2">
      <CardHeader className="flex flex-row gap-4">
        <CardTitle>
          <a href={`/projects/${project.id}`}>{project.name}</a>
        </CardTitle>
        <CardDescription className="text-base leading-none tracking-tight">
          {project.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
