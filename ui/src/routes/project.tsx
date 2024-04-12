import { useEffect, useState } from "react";
import TaskCardList from "../components/task/task_card_list"
import TaskFilterPanel, { TaskFilter } from "../components/task/task_filter_panel";
import { useSearchParams } from "react-router-dom";

export default function Project() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const filter: TaskFilter = {
    sortBy: searchParams.get("sort_by") || "due",
    // Convert the desc param to a bool if it exists, otherwise fall back to false.
    desc: searchParams.get("desc") === "true",
    // Convert the desc param to a bool if it exists, otherwise fall back to false.
    includeDone: searchParams.get("include_done") === "true"
  }
  // When a field changes, add it to the search params.
  const onFilterPanelChange = (key: string, value: any) => {
    searchParams.set(key, value.toString());
    setSearchParams(searchParams);
  };
  const updateTasks = () => {
    // First, update the URL.
    const url = new URL('http://localhost:8888/api/tasks');
    url.searchParams.set('project_id', 'nvlrhe');
    filter.sortBy && url.searchParams.set('sort_by', filter.sortBy);
    filter.desc && url.searchParams.set('desc', filter.desc ? "true" : "false");
    filter.includeDone && url.searchParams.set('include_done', filter.includeDone ? "true" : "false");
    fetch(url)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setTasks(data);
      });
  };
  useEffect(() => {
    updateTasks();
  }, [searchParams])
  return (
    <>
      <div className="w-full mt-4 -translate-y-6 lg:-translate-y-8 bg-white rounded-md py-1 px-4 lg:px-8 shadow-sm shadow-orange-800 ">
        <TaskFilterPanel filter={filter} onValueChange={onFilterPanelChange} />
      </div>
      <div className="-translate-y-6">
        <TaskCardList tasks={tasks} />
      </div>
    </>
  )
}