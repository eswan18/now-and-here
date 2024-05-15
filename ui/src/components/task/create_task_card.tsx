import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import CreateTaskDialog from './create_task_dialog/create_task_dialog';
import { TaskDefaults } from '@/components/task/create_task_dialog/create_task_form';
import { NewTask } from '@/types/task';

interface TaskCardProps {
  onAddTask: (newTask: NewTask) => void;
  taskDefaults: TaskDefaults;
}

export default function CreateTaskCard({ taskDefaults, onAddTask }: TaskCardProps) {
  const [open, setOpen] = useState(false);
  const handleCreateTask = (newTask: NewTask) => {
    onAddTask(newTask);
    setOpen(false);
  }
  return (
    <>
      <div className="rounded my-2 p-4 flex flex-col items-center">
        <div className="flex flex-row flex-wrap w-full justify-between pl-14 pr-2">
        </div>
        <div className="flex flex-row justify-between items-end w-full border-b border-b-gray-200 pb-1">
          <Dialog open={open} onOpenChange={setOpen}>
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