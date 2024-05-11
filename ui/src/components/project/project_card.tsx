import { nice_date } from "../../functions/time";
import { Project } from "../../types/project";
import PriorityBadge from "./priority_badge";

export default function ProjectCard({ project }: { project: Project }) {
    return (
        <>
            <div className="rounded my-2 p-4 flex flex-col items-center bg-white shadow-sm">
                <div className="flex flex-row flex-wrap w-full justify-between pl-14 pr-2">
                    <div className="text-sm font-semibold text-orange-700">
                        <a href={`/projects/${task.project.id}`}>{task.project.name}</a>
                    </div>
                    <div className="text-sm mx-4">
                        {task.due ? <span className="text-orange-800">{task.relative_due_date}</span> : null}
                    </div>
                </div>
                <div className="flex flex-row justify-between items-end w-full border-b border-b-gray-200 pb-1">
                    <div className="flex flex-row items-center justify-start gap-4 pl-4">
                        <label className="relative flex items-center py-2 rounded-full cursor-pointer" htmlFor="green">
                            <input type="checkbox" id="task-{{ task.id }}" checked={ task.done }
                                className="before:content[''] peer relative h-6 w-6 cursor-pointer appearance-none rounded-md border border-green-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-green-gray-500 before:opacity-0 before:transition-opacity checked:border-green-500 checked:bg-green-500 checked:before:bg-green-500 hover:before:opacity-10"
                            />
                            <span
                                className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"
                                    stroke="currentColor" stroke-width="1">
                                    <path fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"></path>
                                </svg>
                            </span>
                        </label>
                        <div>
                            <h3 className="font-semibold text-lg inline-block"><a href="/tasks/{{ task.id }}">{task.name}</a></h3>
                        </div>
                        <div className="text-xs">
                            <PriorityBadge priority={ task.priority } />
                        </div>
                    </div>
                    <div className="flex flex-col justify-center items-end text-sm text-gray-400 mr-4 text-right">
                        <div>{ task.due ? nice_date(task.due) : "No due date" }</div>
                    </div>
                </div>
                <div className="flex flex-row flex-wrap w-full justify-between pl-14 pt-1">
                    <div className="text-gray-400 text-sm">
                        {task.description}
                    </div>
                </div>
            </div>
        </>
    )
}