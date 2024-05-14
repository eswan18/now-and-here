import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from 'react-toastify';
import TaskCardList from "@/components/task/task_card_list"
import CreateTaskCard from "@/components/task/create_task_card";
import TaskFilterPanel, { TaskFilter } from "@/components/task/task_filter_panel";
import { useTitle } from "@/contexts/TitleContext";
import { Task } from "@/types/task";
import { getTasks } from "@/apiServices/task";
import { getProject } from "@/apiServices/project";

const defaultFilter: TaskFilter = {
  sortBy: "due",
  desc: false,
  includeDone: false,
};

function isDefined<T>(arg: T | undefined): arg is T {
  return arg !== undefined;
}

function useFilter(): [TaskFilter, (newFilters: TaskFilter) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const filter = {
    sortBy: searchParams.get('sortBy') || defaultFilter.sortBy,
    desc: searchParams.get('desc') === 'true' ? true : defaultFilter.desc,
    includeDone: searchParams.get('includeDone') === 'true' ? true : defaultFilter.includeDone,
  };

  // Function to update the filter and URL
  const setFilter = (newFilter: TaskFilter) => {
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
  const { projectId } = useParams<{ projectId: string }>();
  const { setPageTitle, setHeaderTitle } = useTitle();
  const [tasks, setTasks] = useState<Task[]>([]);
  const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout }>({}); // Map of task IDs to timeout IDs

  const base_url = new URL(window.location.origin);
  // Remove the final slash if there is one.
  if (base_url.pathname.endsWith('/')) {
    base_url.pathname = base_url.pathname.slice(0, -1);
  }

  if (!isDefined(projectId)) {
    return <div>No project ID provided</div>;
  }

  // Fetch the tasks for this project.
  useEffect(() => {
    getTasks({ projectId, sortBy: filter.sortBy, desc: filter.desc, includeDone: filter.includeDone }).then((data) => {
      setTasks(data);
    }).catch((err) => {
      console.error(err);
      toast.error('Failed to fetch tasks');
    })
    // Stringifying the filter prevents us from hitting a re-render loop.
  }, [JSON.stringify(filter), projectId]);

  // Fetch the project name.
  useEffect(() => {
    getProject(projectId).then((data) => {
      const projectName = data.name;
      setPageTitle(`Project: ${projectName}`);
      setHeaderTitle(projectName);
    }).catch((err) => {
      console.error(err);
      toast.error('Failed to fetch project name');
    })
  }, [])

  // Checkoff or un-checkoff a task.
  const handleCompletionToggle = async (taskId: string, completed: boolean) => {
    const url = completed ? `/api/checkoff_task/${taskId}` : `/api/uncheckoff_task/${taskId}`;

    const promise = fetch(url, {
      method: 'POST',
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to update task status: ${res.statusText}`);
      }
      // Update tasks state
      setTasks(currentTasks =>
        currentTasks.map(task =>
          task.id === taskId ? { ...task, done: completed } : task
        )
      );

      // Clear any existing timeout for this task ID. This prevents a task that's rapidly
      // completed and then uncompleted from disappearing anyway.
      if (timeoutRefs.current[taskId]) {
        clearTimeout(timeoutRefs.current[taskId]);
        delete timeoutRefs.current[taskId];
      }

      // If the task is now completed but we're supposed to show incomplete only tasks,
      // wait a few seconds and then remove it from the list.
      if (!filter.includeDone && completed) {
        timeoutRefs.current[taskId] = setTimeout(() => {
          setTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
          delete timeoutRefs.current[taskId];
        }, 3000);
      }
    })

    toast.promise(
      promise,
      {
        pending: 'Updating task status...',
        success: completed ? 'Task completed!' : 'Task marked incomplete!',
        error: 'Failed to update task.'
      }
    );
  };

  // Handle changes to any filter
  const handleFilterChange = (filterName: keyof TaskFilter, value: boolean | string) => {
    const updatedFilters = {
      ...filter,
      [filterName]: value,
    };
    setFilter(updatedFilters as TaskFilter);
  };

  const handleAddTask = async (task: Task) => {
    setTasks([...tasks, task]);
  }

  return (
    <>
      <div className="w-full mt-4 -translate-y-6 lg:-translate-y-8 bg-white rounded-md py-1 px-4 lg:px-8 shadow-sm shadow-orange-800 ">
        <TaskFilterPanel filter={filter} onFilterChange={handleFilterChange} />
      </div>
      <div className="-translate-y-6">
        <TaskCardList tasks={tasks} onCompletionToggle={handleCompletionToggle} />
        <CreateTaskCard taskDefaults={{ projectId }} onAddTask={handleAddTask} />
      </div>
    </>
  )
}