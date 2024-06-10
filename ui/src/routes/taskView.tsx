import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import TaskList from "@/components/task/TaskList";
import CreateTaskCard from "@/components/task/create_task_card";
import { useTitle } from "@/contexts/TitleContext";
import { completeTask, uncompleteTask } from "@/apiServices/task";
import { getTaskView, buildTaskView } from "@/apiServices/view";
import { NewTask } from "@/types/task";
import { createTask } from "@/apiServices/task";
import PageHeading from "@/components/common/pageHeading";

export default function TaskView() {
  let { viewName } = useParams<{ viewName: string }>() as {
    viewName: string;
  };
  const { setPageTitle } = useTitle();
  const queryClient = useQueryClient();
  const tasksQuery = useQuery({
    queryKey: ["build", "taskViews", viewName],
    queryFn: () => buildTaskView(viewName),
  });
  const addTaskMutation = useMutation({
    mutationFn: createTask,
    onSettled: async () => {
      return await queryClient.invalidateQueries({
        queryKey: ["build", "taskViews", viewName],
      });
    },
  });
  useEffect(() => {
    setPageTitle(viewName);
  }, [setPageTitle, viewName]);
  const viewQuery = useQuery({
    queryKey: ["taskViews", viewName],
    queryFn: () => getTaskView(viewName),
  });

  if (viewQuery.isSuccess) {
    viewName = viewQuery.data.name;
    setPageTitle(viewName);
  }

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
        queryKey: ["build", "taskViews", viewName],
      });
    },
  });
  const handleCompletion = async (taskId: string, completed: boolean) => {
    completeTaskMutation.mutate({ taskId, completed });
  };

  const handleAddTask = async (newTask: NewTask) => {
    addTaskMutation.mutate(newTask);
  };

  return (
    <>
      <PageHeading title={`Task view: ${viewName}`} />
      <TaskList
        tasks={tasksQuery.data || []}
        onCompletionToggle={handleCompletion}
      />
      <CreateTaskCard taskDefaults={{}} onAddTask={handleAddTask} />
    </>
  );
}
