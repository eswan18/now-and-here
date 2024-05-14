import { toast } from 'react-toastify';
import { Pencil } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import CreateTaskDialog from './create_task_dialog/create_task_dialog';
import { TaskDefaults } from '@/components/task/create_task_dialog/create_task_form';
import { Task, NewTask } from '@/types/task';
import { createTask } from '@/apiServices/task';

interface TaskCardProps {
  onAddTask: (task: Task) => void;
  taskDefaults: TaskDefaults;
}

export default function CreateTaskCard({ taskDefaults, onAddTask }: TaskCardProps) {
  const handleCreateTask = (task: NewTask) => {
    console.log('here creating task')
    toast.promise(
      createTask(task).then((task) => { onAddTask(task) }),
      {
        pending: 'Creating task...',
        success: 'Task created!',
        error: {
          render({data}: {data: {message?: string}}){
            return `Failed to create tasks: ${data.message}`
          }
        },
      }
    )
  };
  return (
    <>
      <div className="rounded my-2 p-4 flex flex-col items-center">
        <div className="flex flex-row flex-wrap w-full justify-between pl-14 pr-2">
        </div>
        <div className="flex flex-row justify-between items-end w-full border-b border-b-gray-200 pb-1">
          <Dialog>
            <DialogTrigger>
              <div className="flex flex-row items-center justify-start gap-4 pl-4">
                <div className="w-6"><Pencil size={24} className='text-gray-500 mb-1' /></div>
                <div>
                  <h3 className="font-semibold text-lg inline-block text-gray-500">New task</h3>
                </div>
              </div>
            </DialogTrigger>
            <CreateTaskDialog onCreateTask={handleCreateTask} defaults={taskDefaults} />
          </Dialog>
        </div>
      </div>
    </>
  )
}