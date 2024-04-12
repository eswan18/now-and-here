import { Dispatch, SetStateAction } from "react";

export type TaskFilter = {
  sortBy: string,
  desc: boolean,
  includeDone: boolean,
};

export default function TaskFilterPanel({ filter, setFilter }: { filter: TaskFilter, setFilter: Dispatch<SetStateAction<TaskFilter>> }) {
  const SortBySelect = () => <select
    name="sort_by" id="sort-by-select"
    // @ts-ignore
    onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
    className="block w-auto px-0 text-sm bg-transparent appearance-none text-orange-800 font-semibold focus:outline-none focus:ring-0 focus:border-gray-200 text-right">
    <option selected={filter.sortBy == "due"} value="due">Due date</option>
    <option selected={filter.sortBy == "priority"} value="priority">Priority</option>
  </select>
  const DescSelect = () => <select
    name="desc" id="sort-by-desc"
    onChange={(e) => setFilter({ ...filter, desc: e.target.value == "true" })}
    className="block px-0 text-sm bg-transparent appearance-none text-orange-800 font-semibold focus:outline-none focus:ring-0 focus:border-gray-200 peer">
    <option selected={!filter.desc} value="false">↑</option>
    <option selected={filter.desc} value="true">↓</option>
  </select>
  return (
    <div className="flex flex-row justify-start items-end gap-8 lg:gap-12 py-1">
      <div className="flex flex-row justify-start items-end gap-2">
        <label htmlFor="sort-by-select" className="block text-sm text-gray-500">Sorted by</label>
        <SortBySelect />
        <DescSelect />
      </div>
      <div className="flex flex-row justify-end items-center gap-2">
        <label htmlFor="showing" className="block text-sm text-gray-500">Showing</label>
        <select name="include_done" id="showing" className="block w-auto px-0 text-sm bg-transparent appearance-none text-orange-800 font-semibold focus:outline-none focus:ring-0 focus:border-gray-200 peer">
          <option selected={filter.includeDone} value="true">All</option>
          <option selected={!filter.includeDone} value="false">Incomplete</option>
        </select>
      </div>
    </div >
  )
}