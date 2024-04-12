import { useState, useEffect } from "react";
import TaskCardList from "../components/task/task_card_list"
import TaskFilterPanel, { TaskFilter } from "../components/task/task_filter_panel";
import { useSearchParams } from "react-router-dom";

export default function Project() {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState<TaskFilter>({
    // @ts-ignore
    sortBy: searchParams.sort_by || "due",
    // @ts-ignore
    desc: searchParams.due == "true",
    // @ts-ignore
    includeDone: searchParams.includeDone == "true",
  });
  useEffect(() => {
    console.log("updating")
    console.log(filter)
    const url = new URL('http://localhost:8888/api/tasks');
    url.searchParams.set('project_id', 'nvlrhe');
    url.searchParams.set('sort_by', filter.sortBy);
    url.searchParams.set('desc', filter.desc ? "true" : "false");
    url.searchParams.set('include_done', filter.includeDone ? "true": "false");
    fetch(url)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setTasks(data);
      });
  }, [filter]);
  return (
    <>
      <div className="w-full mt-4 -translate-y-6 lg:-translate-y-8 bg-white rounded-md py-1 px-4 lg:px-8 shadow-sm shadow-orange-800 ">
        <TaskFilterPanel filter={filter} setFilter={setFilter}/>
      </div>
      <div className="-translate-y-6">
        <TaskCardList tasks={ tasks } />
      </div>
    </>
  )
}