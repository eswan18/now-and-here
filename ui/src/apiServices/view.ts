import { extractErrorDetail } from "./common";
import { TaskView } from "@/types/view";

export async function getTaskViews(): Promise<TaskView[]> {
  const url = new URL('/api/task_views', window.location.origin);
  return await fetch(url, {
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