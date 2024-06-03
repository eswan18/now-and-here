import { NewTask, Task } from "@/types/task";
import { extractErrorDetail, baseUrl } from "@/apiServices/common";

export async function createTask(task: NewTask): Promise<Task> {
  const url = new URL(`/api/tasks`, baseUrl());
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
}

export async function getTasks({
  projectId,
  sortBy,
  desc,
  includeDone,
  includeChildProjects,
}: {
  projectId: string;
  sortBy: string;
  desc: boolean;
  includeDone: boolean;
  includeChildProjects: boolean;
}): Promise<Task[]> {
  const url = new URL("/api/tasks", baseUrl());
  url.searchParams.set("project_id", projectId);
  url.searchParams.set("sort_by", sortBy);
  url.searchParams.set("desc", desc ? "true" : "false");
  url.searchParams.set("include_done", includeDone ? "true" : "false");
  url.searchParams.set(
    "include_child_projects",
    includeChildProjects ? "true" : "false",
  );
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

export async function completeTask(taskId: string): Promise<Task> {
  const url = new URL(`/api/checkoff_task/${taskId}`, baseUrl());
  return await fetch(url, {
    method: "POST",
  }).then((res) => {
    if (!res.ok) {
      let errorMsg = res.statusText;
      const data = res.json();
      const errorDetail = extractErrorDetail(data);
      if (errorDetail) {
        errorMsg += `\n\n"${errorDetail}"`;
      }
      throw new Error(errorMsg);
    }
    return res.json();
  });
}

export async function uncompleteTask(taskId: string): Promise<Task> {
  const url = new URL(`/api/uncheckoff_task/${taskId}`, baseUrl());
  return await fetch(url, {
    method: "POST",
  }).then((res) => {
    if (!res.ok) {
      let errorMsg = res.statusText;
      const data = res.json();
      const errorDetail = extractErrorDetail(data);
      if (errorDetail) {
        errorMsg += `\n\n"${errorDetail}"`;
      }
      throw new Error(errorMsg);
    }
    return res.json();
  });
}

export async function searchTasks(query: string): Promise<Task[]> {
  const url = new URL(`/api/tasks/search`, baseUrl());
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
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
