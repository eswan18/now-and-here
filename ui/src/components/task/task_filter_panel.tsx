export type TaskFilter = {
  sortBy: string,
  desc: boolean,
  includeDone: boolean,
};

export type TaskFilterPanelParams = {
  filter: TaskFilter;
  onValueChange: (key: string, value: any) => void;
};

export default function TaskFilterPanel({ filter, onValueChange }: TaskFilterPanelParams) {
  const SortBySelect = () => <select
    name="sort_by"
    // @ts-ignore
    onChange={(e) => onValueChange('sort_by', e.target.value )}
    className="block w-auto px-0 text-sm bg-transparent appearance-none text-orange-800 font-semibold focus:outline-none focus:ring-0 focus:border-gray-200 text-right">
    <option selected={filter.sortBy == "due"} value="due">Due date</option>
    <option selected={filter.sortBy == "priority"} value="priority">Priority</option>
  </select>
  const DescSelect = () => <select
    name="desc"
    onChange={(e) => onValueChange('desc', e.target.value )}
    className="block px-0 text-sm bg-transparent appearance-none text-orange-800 font-semibold focus:outline-none focus:ring-0 focus:border-gray-200 peer">
    <option selected={!filter.desc} value="false">↑</option>
    <option selected={filter.desc} value="true">↓</option>
  </select>
  const IncludeDoneSelect = () => <select
    name="include_done"
    onChange={(e) => onValueChange('include_done', e.target.value )}
    className="block w-auto px-0 text-sm bg-transparent appearance-none text-orange-800 font-semibold focus:outline-none focus:ring-0 focus:border-gray-200 peer">
    <option selected={filter.includeDone} value="true">All</option>
    <option selected={!filter.includeDone} value="false">Incomplete</option>
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
        <IncludeDoneSelect />
      </div>
    </div >
  )
}