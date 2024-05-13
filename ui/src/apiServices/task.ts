import { NewTask, Task } from '@/types/task';

export function createTask(task: NewTask): Promise<Task> {
  const promise = fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  }).then((res) => {
    if (!res.ok) {
      throw new Error('Failed to create task');
    }
    return res.json();
  }); 
  return promise;
}