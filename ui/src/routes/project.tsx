import { useEffect, useState } from "react";
import TaskCardList from "../components/task/task_card_list"
import TaskFilterPanel, { TaskFilter } from "../components/task/task_filter_panel";
import { useSearchParams } from "react-router-dom";
import { useTitle } from "../contexts/TitleContext";

const defaultFilter: TaskFilter = {
  sortBy: "due",
  desc: false,
  includeDone: false,
};

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
  const { setPageTitle, setHeaderTitle } = useTitle();
  // Handle changes to any filter
  const handleFilterChange = (filterName: keyof TaskFilter, value: boolean | string) => {
    const updatedFilters = {
      ...filter,
      [filterName]: value,
    };
    setFilter(updatedFilters as TaskFilter);
  };

  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    // First, update the URL.
    const url = new URL('http://localhost:8888/api/tasks');
    url.searchParams.set('project_id', 'nvlrhe');
    url.searchParams.set('sort_by', filter.sortBy);
    url.searchParams.set('desc', filter.desc ? "true" : "false");
    url.searchParams.set('include_done', filter.includeDone ? "true" : "false");
    fetch(url)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setTasks(data);
      });
  // Stringifying the filter prevents us from hitting a re-render loop.
  }, [JSON.stringify(filter)]);
  useEffect(() => {
    setPageTitle(`Project: nvlrhe`);
    setHeaderTitle(`nvlrhe`);
  })
  return (
    <>
      <div className="w-full mt-4 -translate-y-6 lg:-translate-y-8 bg-white rounded-md py-1 px-4 lg:px-8 shadow-sm shadow-orange-800 ">
        <TaskFilterPanel filter={filter} onFilterChange={handleFilterChange} />
      </div>
      <div className="-translate-y-6">
        <TaskCardList tasks={tasks} />
      </div>
    </>
  )
}