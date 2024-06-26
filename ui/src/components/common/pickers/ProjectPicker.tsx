import { useState } from "react";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";

import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import { getProjects } from "@/apiServices/project";

export interface ProjectPickerProps {
  defaultProjectId?: string;
  onChange: (project: Project) => void;
}

export default function ProjectPicker({
  defaultProjectId,
  onChange,
}: ProjectPickerProps) {
  const [projectId, setProjectId] = useState<string | undefined>(
    defaultProjectId,
  );
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  return (
    <Command className="font-normal">
      <CommandInput placeholder="Search projects..." />
      <CommandList>
        <CommandEmpty>No projects found.</CommandEmpty>
        <CommandGroup>
          {projectsQuery.isSuccess &&
            projectsQuery.data.map((p) => (
              <CommandItem
                key={p.id}
                value={p.id}
                onSelect={(currentValue) => {
                  setProjectId(currentValue);
                  const projects = projectsQuery.data as Project[];
                  const selectedProject = projects.find(
                    (project) => project.id === currentValue,
                  )!;
                  onChange(selectedProject);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    p.id === projectId ? "opacity-100" : "opacity-0",
                  )}
                />
                <span>{p.name}</span>
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
