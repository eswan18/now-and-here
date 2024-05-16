import { useRef } from "react";
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
  const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout }>({}); // Map of task IDs to timeout IDs
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

  // Checkoff or un-checkoff a task.
  const handleCompletionToggle = async (taskId: string, completed: boolean) => {
    // Clear any existing timeout for this task ID. This prevents a task that's rapidly
    // completed and then uncompleted from disappearing anyway.
    if (timeoutRefs.current[taskId]) {
      clearTimeout(timeoutRefs.current[taskId]);
      delete timeoutRefs.current[taskId];
    }

    // Save the task status change.
    const callApi = completed ? completeTask : uncompleteTask;
    const promise = callApi(taskId).then(() => {
      // Update the impacted task.
      /*setTasks(currentTasks =>
        currentTasks.map(task =>
          task.id === taskId ? { ...task, done: completed } : task
        )
      );*/
      // If the task is now completed and we're showing only incomplete only tasks,
      // wait a few seconds and then remove it from the list.
      /*if (!filter.includeDone && completed) {
        timeoutRefs.current[taskId] = setTimeout(() => {
          setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
          delete timeoutRefs.current[taskId];
        }, 3000);
      }*/
    }).catch((err) => {
      console.error(err);
      toast.error('Failed to update task status');
    })

    toast.promise(
      promise,
      {
        pending: 'Updating task status...',
        success: completed ? 'Task completed!' : 'Task marked incomplete!',
        error: 'Failed to update task.',
      },
      {autoClose: 3000},
    );
  };

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
        <TaskCardList tasks={tasksQuery.data || []} onCompletionToggle={handleCompletionToggle} />
        <CreateTaskCard taskDefaults={{ projectId }} onAddTask={handleAddTask} />
      </div>
    </>
  )
}