import { NewTask, Task } from '@/types/task';


export function createTask(task: NewTask): Promise<Task> {
  console.debug('Creating task:', task)
  const promise = fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  }).then(async (res) => {
    if (!res.ok) {
      let errorMsg = res.statusText;
      try {
        const data = await res.json();
        // Try to dig out the error message.
        if ('detail' in data) {
          const detail = data.detail[0];
          const loc = detail.loc.join('.');
          const msg = detail.msg;
          errorMsg += `\n\n"${msg} at ${loc}"`
        }
      } catch (e) {
        // Do nothing
      }
      throw new Error(errorMsg);
    }
    return res.json();
  }); 
  return promise;
}