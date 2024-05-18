import { useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify';
import TaskCardList from "@/components/task/task_card_list"
import CreateTaskCard from "@/components/task/create_task_card";
import TaskFilterPanel, { TaskFilterSchema } from "@/components/task/task_filter_panel";
import { useTitle } from "@/contexts/TitleContext";
import { NewTask } from "@/types/task";
import { completeTask, getTasks, createTask, uncompleteTask } from "@/apiServices/task";
import { getProject } from "@/apiServices/project";
import { z } from "zod";

const defaultFilter: z.infer<typeof TaskFilterSchema> = {
  sortBy: "due",
  desc: false,
  includeDone: false,
};

function useFilter(): [z.infer<typeof TaskFilterSchema>, (newFilters: z.infer<typeof TaskFilterSchema>) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  let sortBy = searchParams.get('sortBy') as "due" | "priority" | null;
  if (sortBy && !['due', 'priority'].includes(sortBy)) {
    toast.error('Invalid sortBy parameter in URL');
    sortBy = null;
  }
  const filter = {
    sortBy: sortBy || defaultFilter.sortBy,
    desc: searchParams.get('desc') === 'true' ? true : defaultFilter.desc,
    includeDone: searchParams.get('includeDone') === 'true' ? true : defaultFilter.includeDone,
  };
  // Function to update the filter and URL
  const setFilter = (newFilter: z.infer<typeof TaskFilterSchema>) => {
    setSearchParams({
      ...newFilter,
      desc: newFilter.desc.toString(), // ensure boolean is converted to string
      includeDone: newFilter.includeDone.toString(),
    });
  };

  return [filter, setFilter];
}

export default function Project() {
  const [filter, setFilter] = useFilter();
  const { projectId } = useParams<{ projectId: string }>() as { projectId: string };
  const { setPageTitle, setHeaderTitle } = useTitle();
  const queryClient = useQueryClient();
  const tasksQuery = useQuery({
    queryKey: ['tasks', projectId, filter],
    queryFn: () => getTasks({
      projectId: projectId as string,
      sortBy: filter.sortBy,
      desc: filter.desc,
      includeDone: filter.includeDone,
    }),
  })
  const projectQuery = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProject(projectId),
  })
  const addTaskMutation = useMutation({
    mutationFn: createTask,
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['tasks', projectId, filter] })
    }
  });

  if (projectQuery.isSuccess) {
    const projectName = projectQuery.data.name;
    setPageTitle(`Project: ${projectName}`);
    setHeaderTitle(projectName);
  }

  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string, completed: boolean }) => {
      if (completed) {
        return completeTask(taskId);
      } else {
        return uncompleteTask(taskId);
      }
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['tasks', projectId, filter] })
    }
  })
  const handleCompletion = async (taskId: string, completed: boolean) => {
    completeTaskMutation.mutate({taskId, completed});
  }

  // Handle changes to any filter
  const handleFilterChange = (filter: z.infer<typeof TaskFilterSchema>) => {
    setFilter(filter)
  }

  const handleAddTask = async (newTask: NewTask) => {
    addTaskMutation.mutate(newTask)
  }

  return (
    <>
      <div className="w-full mt-4 -translate-y-6 lg:-translate-y-8 bg-white rounded-md py-1 px-4 lg:px-8 shadow-sm shadow-orange-800 ">
        <TaskFilterPanel filter={filter} onFilterChange={handleFilterChange} />
      </div>
      <div className="-translate-y-6">
        <TaskCardList tasks={tasksQuery.data || []} onCompletionToggle={handleCompletion} />
        <CreateTaskCard taskDefaults={{ projectId }} onAddTask={handleAddTask} />
      </div>
    </>
  )
}