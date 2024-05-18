import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import TaskCardList from "@/components/task/task_card_list"
import { useTitle } from "@/contexts/TitleContext";
import { completeTask, uncompleteTask } from "@/apiServices/task";
import { getTaskView, buildTaskView } from "@/apiServices/view";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function TaskView() {
  const { viewName } = useParams<{ viewName: string }>() as { viewName: string };
  const { setPageTitle, setHeaderTitle } = useTitle();
  const queryClient = useQueryClient();
  const tasksQuery = useQuery({
    queryKey: ['build', 'taskViews', viewName],
    queryFn: () => buildTaskView(viewName),
  })

  if (tasksQuery.isError) {
    toast.error(tasksQuery.error.message);
  }
  useEffect(() => {
    setPageTitle(`Now and Here: ${viewName}`);
    setHeaderTitle(viewName);
  }, []);

  const viewQuery = useQuery({
    queryKey: ['taskViews', viewName],
    queryFn: () => getTaskView(viewName),
  });

  if (viewQuery.isSuccess) {
    const viewName = viewQuery.data.name;
    const viewDescription = viewQuery.data.description;
    setPageTitle(`Now and Here: ${viewName}`);
    setHeaderTitle(`${viewName}: ${viewDescription}`);
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
      return await queryClient.invalidateQueries({ queryKey: ['build', 'taskViews', viewName] })
    }
  })
  const handleCompletion = async (taskId: string, completed: boolean) => {
    completeTaskMutation.mutate({ taskId, completed });
  }

  return (
    <div className="mt-4">
      <TaskCardList tasks={tasksQuery.data || []} onCompletionToggle={handleCompletion} />
    </div>
  )
}