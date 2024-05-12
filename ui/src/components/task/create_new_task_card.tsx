import { Pencil } from 'lucide-react';

interface TaskCardProps {
  projectName: string;
}

export default function CreateNewTaskCard({ projectName }: TaskCardProps) {
    projectName;
    return (
        <>
            <div className="rounded my-2 p-4 flex flex-col items-center">
                <div className="flex flex-row flex-wrap w-full justify-between pl-14 pr-2">
                </div>
                <div className="flex flex-row justify-between items-end w-full border-b border-b-gray-200 pb-1">
                    <div className="flex flex-row items-center justify-start gap-4 pl-4">
                      <div className="w-6"><Pencil size={24} className='text-gray-500 mb-1' /></div>
                      <div>
                          <h3 className="font-semibold text-lg inline-block text-gray-500">New task</h3>
                      </div>
                    </div>
                </div>
            </div>
        </>
    )
}