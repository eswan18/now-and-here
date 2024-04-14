import {FC} from 'react';

export interface TaskFilter {
  sortBy: string;
  desc: boolean;
  includeDone: boolean;
};

export interface TaskFilterPanelParams {
  filter: TaskFilter;
  onFilterChange: (filterName: keyof TaskFilter, value: boolean | string) => void;
};

const SortBySelect: FC<{ currentSortBy: string; onSortChange: (value: string) => void }> = ({ currentSortBy, onSortChange }) => (
  <select
    name="sort_by"
    value={currentSortBy}
    onChange={(e) => onSortChange(e.target.value)}
    className="block w-auto px-0 text-sm bg-transparent appearance-none text-orange-800 font-semibold focus:outline-none focus:ring-0 focus:border-gray-200 text-right">
    <option value="due">Due date</option>
    <option value="priority">Priority</option>
  </select>
);

const DescSelect: FC<{ currentDesc: boolean; onDescChange: (value: boolean) => void }> = ({ currentDesc, onDescChange }) => (
  <select
    name="desc"
    value={currentDesc.toString()}
    onChange={(e) => onDescChange(e.target.value === 'true')}
    className="block px-0 text-sm bg-transparent appearance-none text-orange-800 font-semibold focus:outline-none focus:ring-0 focus:border-gray-200 peer">
    <option value="false">↑</option>
    <option value="true">↓</option>
  </select>
);

const IncludeDoneSelect: FC<{ includeDone: boolean; onIncludeChange: (value: boolean) => void }> = ({ includeDone, onIncludeChange }) => (
  <select
    name="include_done"
    value={includeDone.toString()}
    onChange={(e) => onIncludeChange(e.target.value === 'true')}
    className="block w-auto px-0 text-sm bg-transparent appearance-none text-orange-800 font-semibold focus:outline-none focus:ring-0 focus:border-gray-200 peer">
    <option value="true">All</option>
    <option value="false">Incomplete</option>
  </select>
);

export default function TaskFilterPanel({ filter, onFilterChange }: TaskFilterPanelParams) {
  return (
    <div className="flex flex-row justify-start items-end gap-8 lg:gap-12 py-1">
      <div className="flex flex-row justify-start items-end gap-2">
        <label htmlFor="sort-by-select" className="block text-sm text-gray-500">Sorted by</label>
        <SortBySelect currentSortBy={filter.sortBy} onSortChange={(value) => onFilterChange('sortBy', value)} />
        <DescSelect currentDesc={filter.desc} onDescChange={(value) => onFilterChange('desc', value)} />
      </div>
      <div className="flex flex-row justify-end items-center gap-2">
        <label htmlFor="showing" className="block text-sm text-gray-500">Showing</label>
        <IncludeDoneSelect includeDone={filter.includeDone} onIncludeChange={(value) => onFilterChange('includeDone', value)} />
      </div>
    </div>
  );
}
