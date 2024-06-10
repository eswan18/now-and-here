import { useEffect, useState } from "react";
import { z } from "zod";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import TaskCardList from "@/components/task/task_card_list";
import CreateTaskCard from "@/components/task/create_task_card";
import TaskFilterPanel, {
  TaskFilterSchema,
} from "@/components/task/task_filter_panel";
import { useTitle } from "@/contexts/TitleContext";
import { NewTask } from "@/types/task";
import {
  completeTask,
  getTasks,
  createTask,
  uncompleteTask,
} from "@/apiServices/task";
import { getProject } from "@/apiServices/project";
import PageHeading from "@/components/common/pageHeading";

const defaultFilter: z.infer<typeof TaskFilterSchema> = {
  sortBy: "due",
  desc: false,
  includeDone: false,
  includeChildProjects: false,
};

function useFilter(): [
  z.infer<typeof TaskFilterSchema>,
  (newFilters: z.infer<typeof TaskFilterSchema>) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams();

  let sortBy = searchParams.get("sort_by") as "due" | "priority" | null;
  if (sortBy && !["due", "priority"].includes(sortBy)) {
    toast.error("Invalid sortBy parameter in URL");
    sortBy = null;
  }
  const filter = {
    sortBy: sortBy || defaultFilter.sortBy,
    desc: searchParams.get("desc") === "true" ? true : defaultFilter.desc,
    includeDone:
      searchParams.get("include_done") === "true"
        ? true
        : defaultFilter.includeDone,
    includeChildProjects:
      searchParams.get("include_child_projects") === "true"
        ? true
        : defaultFilter.includeChildProjects,
  };
  // Function to update the filter and URL
  const setFilter = (newFilter: z.infer<typeof TaskFilterSchema>) => {
    setSearchParams({
      sort_by: newFilter.sortBy,
      desc: newFilter.desc.toString(),
      include_done: newFilter.includeDone.toString(),
      include_child_projects: newFilter.includeChildProjects.toString(),
    });
  };

  return [filter, setFilter];
}

export default function Project() {
  const [filter, setFilter] = useFilter();
  const { projectId } = useParams<{ projectId: string }>() as {
    projectId: string;
  };
  const [projectName, setProjectName] = useState("");
  const { setPageTitle } = useTitle();
  const queryClient = useQueryClient();
  const tasksQuery = useQuery({
    queryKey: ["tasks", projectId, filter],
    queryFn: () =>
      getTasks({
        projectId: projectId as string,
        sortBy: filter.sortBy,
        desc: filter.desc,
        includeDone: filter.includeDone,
        includeChildProjects: filter.includeChildProjects,
      }),
  });
  const projectQuery = useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => getProject(projectId),
  });
  const addTaskMutation = useMutation({
    mutationFn: createTask,
    onSettled: async () => {
      return await queryClient.invalidateQueries({
        queryKey: ["tasks", projectId, filter],
      });
    },
  });
  useEffect(() => {
    setPageTitle(projectName);
  }, [setPageTitle, projectName]);
  useEffect(() => {
    if (projectQuery.isSuccess) {
      setProjectName(projectQuery.data.name);
    }
  }, [projectQuery, setProjectName]);

  const completeTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      completed,
    }: {
      taskId: string;
      completed: boolean;
    }) => {
      if (completed) {
        return completeTask(taskId);
      } else {
        return uncompleteTask(taskId);
      }
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({
        queryKey: ["tasks", projectId, filter],
      });
    },
  });
  const handleCompletion = async (taskId: string, completed: boolean) => {
    completeTaskMutation.mutate({ taskId, completed });
  };

  // Handle changes to any filter
  const handleFilterChange = (filter: z.infer<typeof TaskFilterSchema>) => {
    setFilter(filter);
  };

  const handleAddTask = async (newTask: NewTask) => {
    addTaskMutation.mutate(newTask);
  };

  return (
    <>
      <div className="mb-8">
        <PageHeading title={projectName} className="mb-4 lg:mb-4" />
        <TaskFilterPanel filter={filter} onFilterChange={handleFilterChange} />
      </div>
      <TaskCardList
        tasks={tasksQuery.data || []}
        onCompletionToggle={handleCompletion}
      />
      <CreateTaskCard taskDefaults={{ projectId }} onAddTask={handleAddTask} />
    </>
  );
}
