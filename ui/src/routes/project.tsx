import { useState, useEffect } from "react";
import TaskCardList from "../components/task/task_card_list"

export default function Project() {
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    const url = new URL('http://localhost:8888/api/tasks');
    url.searchParams.set('project_id', 'nvlrhe');
    fetch(url)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setTasks(data);
      });
  }, []);
  return (
    <>
      <div className="w-full mt-4 -translate-y-6 lg:-translate-y-8 bg-white rounded-md py-1 px-4 lg:px-8 shadow-sm shadow-orange-800 ">
      </div>
      <div className="-translate-y-6">
        <TaskCardList tasks={ tasks } />
      </div>
    </>
  )
}