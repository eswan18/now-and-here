import { NewTask, Task } from '@/types/task';
import { extractErrorDetail } from '@/apiServices/common';

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
      const data = await res.json();
      const errorDetail = extractErrorDetail(data);
      if (errorDetail) {
        errorMsg += `\n\n"${errorDetail}"`;
      }
      throw new Error(errorMsg);
    }
    return res.json();
  });
  return promise;
}

export function getTasks({ projectId, sortBy, desc, includeDone }: { projectId: string, sortBy: string, desc: boolean, includeDone: boolean }): Promise<Task[]> {
  const url = new URL('/api/tasks', window.location.origin);
  url.searchParams.set('project_id', projectId);
  url.searchParams.set('sort_by', sortBy);
  url.searchParams.set('desc', desc ? "true" : "false");
  url.searchParams.set('include_done', includeDone ? "true" : "false");
  return fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(async (res) => {
      if (!res.ok) {
        let errorMsg = res.statusText;
        const data = await res.json();
        const errorDetail = extractErrorDetail(data);
        if (errorDetail) {
          errorMsg += `\n\n"${errorDetail}"`;
        }
        throw new Error(errorMsg);
      }
      return res.json();
    });
}