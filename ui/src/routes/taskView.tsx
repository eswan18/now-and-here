import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import TaskList from "@/components/task/TaskList";
import CreateTaskButton from "@/components/task/CreateTaskButton";
import { useTitle } from "@/contexts/TitleContext";
import { completeTask, uncompleteTask, updateTask } from "@/apiServices/task";
import { getTaskView, buildTaskView } from "@/apiServices/view";
import { NewTask } from "@/types/task";
import { createTask } from "@/apiServices/task";
import PageHeading from "@/components/common/pageHeading";
import { useEffect } from "react";

export default function TaskView() {
  const { viewName } = useParams<{ viewName: string }>() as {
    viewName: string;
  };
  const { setPageTitle } = useTitle();
  const queryClient = useQueryClient();
  const tasksQuery = useQuery({
    queryKey: ["tasks", { view: viewName }],
    queryFn: () => buildTaskView(viewName),
  });
  const addTaskMutation = useMutation({
    mutationFn: createTask,
    onSettled: async () => {
      return await queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });
  const viewQuery = useQuery({
    queryKey: ["taskViews", viewName],
    queryFn: () => getTaskView(viewName),
  });

  useEffect(() => {
    if (viewQuery.isSuccess) {
      const niceViewName = viewQuery.data.name;
      setPageTitle(niceViewName);
    }
  }, [viewQuery, setPageTitle]);

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
        queryKey: ["tasks"],
      });
    },
  });
  const handleCompletion = async (taskId: string, completed: boolean) => {
    completeTaskMutation.mutate({ taskId, completed });
  };

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, task }: { taskId: string; task: NewTask }) => {
      updateTask(taskId, task);
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });
  const handleUpdateTask = async (taskId: string, task: NewTask) => {
    updateTaskMutation.mutate({ taskId, task });
  };

  const handleAddTask = async (newTask: NewTask) => {
    addTaskMutation.mutate(newTask);
  };

  const headingTitle = viewQuery.isSuccess ? viewQuery.data.name : viewName;
  const headingDescription = viewQuery.isSuccess
    ? viewQuery.data.description
    : null;
  return (
    <>
      <PageHeading
        title={headingTitle}
        className="justify-start items-end gap-4"
      >
        {headingDescription && (
          <p className="text-gray-500">{headingDescription}</p>
        )}
      </PageHeading>
      <TaskList
        tasks={tasksQuery.data || []}
        onCompletionToggle={handleCompletion}
        onUpdateTask={handleUpdateTask}
      />
      <CreateTaskButton taskDefaults={{}} onAddTask={handleAddTask} />
    </>
  );
}
