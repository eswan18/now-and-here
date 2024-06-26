import { Task, TaskFromBackend } from "@/types/task";
import { extractErrorDetail, baseUrl } from "./common";
import { TaskView } from "@/types/view";
import { prepareTaskFromBackend } from "./task";

export async function getTaskViews(): Promise<TaskView[]> {
  const url = new URL("/api/task_views", baseUrl());
  return await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
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
}

export async function getTaskView(viewName: string): Promise<TaskView> {
  const url = new URL(`/api/task_views/${viewName}`, baseUrl());
  return await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
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
}

export async function buildTaskView(viewName: string): Promise<Task[]> {
  const userContext = {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  const url = new URL(`/api/task_views/build`, baseUrl());
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ view_name: viewName, context: userContext }),
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
    const tasks = (await res.json()) as TaskFromBackend[];
    return tasks.map(prepareTaskFromBackend);
  });
}
